import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import type {
  C2S_CreateRoom, C2S_JoinRoom, C2S_SubmitAnswer, C2S_StartGame,
} from "./types";
import {
  createRoom, joinRoom, removePlayer, getRoom,
  startGame, advanceQuestion, processAnswer,
  toPublicQuestion, toPublicRoom, getPlayersSorted,
  getCorrectAnswerDisplay,
} from "./game";

// ─── SERVER SETUP ─────────────────────────────────────────────────────────────

const app  = express();
const http = createServer(app);

const CLIENT_URL = process.env.CLIENT_URL ?? "http://localhost:5173";

const io = new Server(http, {
  cors: {
    origin: [CLIENT_URL, "https://blitztrivia.tech", "https://www.blitztrivia.tech"],
    methods: ["GET", "POST"],
  },
});

app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────

app.get("/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// ─── QUESTION TIMER MAP ───────────────────────────────────────────────────────
// Tracks auto-advance timers so we can cancel them if host manually advances

const questionTimers = new Map<string, ReturnType<typeof setTimeout>>();

function clearQuestionTimer(code: string) {
  const t = questionTimers.get(code);
  if (t) { clearTimeout(t); questionTimers.delete(code); }
}

// ─── EMIT HELPERS ─────────────────────────────────────────────────────────────

function emitQuestionToRoom(code: string) {
  const room = getRoom(code);
  if (!room || room.status !== "question") return;

  const question = room.quiz.questions[room.questionIndex];
  const publicQ  = toPublicQuestion(question);

  io.to(code).emit("question_start", {
    question: publicQ,
    questionIndex: room.questionIndex,
    totalQuestions: room.quiz.questions.length,
    timeLimit: question.timeLimit,
  });

  // Auto-advance to leaderboard after time runs out
  clearQuestionTimer(code);
  const timer = setTimeout(() => {
    emitLeaderboardToRoom(code);
  }, (question.timeLimit + 1) * 1000); // +1s grace period
  questionTimers.set(code, timer);
}

function emitLeaderboardToRoom(code: string) {
  clearQuestionTimer(code);
  const room = getRoom(code);
  if (!room) return;

  room.status = "leaderboard";

  const firstCorrectName = room.firstCorrectId
    ? room.players[room.firstCorrectId]?.name ?? null
    : null;

  io.to(code).emit("leaderboard", {
    players: getPlayersSorted(room),
    questionIndex: room.questionIndex,
    totalQuestions: room.quiz.questions.length,
    firstCorrectName,
  });
}

// ─── SOCKET HANDLERS ──────────────────────────────────────────────────────────

io.on("connection", (socket) => {
  console.log(`[+] connected: ${socket.id}`);

  // ── Create room (host) ──────────────────────────────────────────────────────
  socket.on("create_room", (data: C2S_CreateRoom) => {
    try {
      const room = createRoom(socket.id, data.hostName, data.quiz);
      socket.join(room.code);
      socket.emit("room_joined", {
        room: toPublicRoom(room),
        playerId: socket.id,
      });
      console.log(`[room] created ${room.code} by ${data.hostName}`);
    } catch (err) {
      socket.emit("error", { message: "Failed to create room" });
    }
  });

  // ── Join room (player) ──────────────────────────────────────────────────────
  socket.on("join_room", (data: C2S_JoinRoom) => {
    const room = joinRoom(data.code, socket.id, data.playerName);
    if (!room) {
      socket.emit("error", { message: "Room not found or game already started" });
      return;
    }
    socket.join(room.code);
    socket.emit("room_joined", {
      room: toPublicRoom(room),
      playerId: socket.id,
    });
    // Notify everyone else in the room
    socket.to(room.code).emit("room_updated", {
      players: Object.values(room.players),
    });
    console.log(`[room] ${data.playerName} joined ${room.code}`);
  });

  // ── Start game (host only) ──────────────────────────────────────────────────
  socket.on("start_game", (_data: C2S_StartGame) => {
    // Find the room this socket is host of
    const room = [...io.sockets.adapter.rooms.entries()]
      .map(([code]) => getRoom(code))
      .find(r => r?.hostId === socket.id);

    if (!room) { socket.emit("error", { message: "Room not found" }); return; }
    if (room.hostId !== socket.id) { socket.emit("error", { message: "Only the host can start the game" }); return; }

    startGame(room);
    emitQuestionToRoom(room.code);
    console.log(`[game] started in ${room.code}`);
  });

  // ── Submit answer ────────────────────────────────────────────────────────────
  socket.on("submit_answer", (data: C2S_SubmitAnswer) => {
    // Find which room this player is in
    const roomCode = [...socket.rooms].find(r => r !== socket.id);
    if (!roomCode) return;

    const room = getRoom(roomCode);
    if (!room || room.status !== "question") return;

    const question = room.quiz.questions[room.questionIndex];
    const result   = processAnswer(room, socket.id, data.answer);

    // Send personal result back to this player only
    socket.emit("answer_result", {
      correct: result.correct,
      points: result.points,
      bonusPoints: result.bonusPoints,
      correctAnswer: getCorrectAnswerDisplay(question),
      firstCorrectName: result.correct && result.points > 0
        ? room.players[socket.id]?.name ?? null
        : null,
    });

    // Check if everyone has answered — if so, show leaderboard early
    const players = Object.values(room.players).filter(p => !p.isHost);
    const allAnswered = players.every(p => p.answeredAt !== undefined);
    if (allAnswered) {
      emitLeaderboardToRoom(roomCode);
    }
  });

  // ── Next question (host only) ────────────────────────────────────────────────
  socket.on("next_question", () => {
    const roomCode = [...socket.rooms].find(r => r !== socket.id);
    if (!roomCode) return;

    const room = getRoom(roomCode);
    if (!room || room.hostId !== socket.id) return;
    if (room.status !== "leaderboard") return;

    const next = advanceQuestion(room);
    if (next === "finished") {
      io.to(roomCode).emit("game_over", {
        players: getPlayersSorted(room),
        quiz: room.quiz,
      });
      console.log(`[game] finished in ${roomCode}`);
    } else {
      emitQuestionToRoom(roomCode);
    }
  });

  // ── Disconnect ───────────────────────────────────────────────────────────────
  socket.on("disconnect", () => {
    const code = removePlayer(socket.id);
    if (code) {
      const room = getRoom(code);
      if (room) {
        io.to(code).emit("room_updated", { players: Object.values(room.players) });
      }
    }
    console.log(`[-] disconnected: ${socket.id}`);
  });
});

// ─── START ────────────────────────────────────────────────────────────────────

const PORT = Number(process.env.PORT ?? 3001);
http.listen(PORT, () => {
  console.log(`✅ BlitzTrivia server running on port ${PORT}`);
  console.log(`   Allowing connections from: ${CLIENT_URL}`);
});
