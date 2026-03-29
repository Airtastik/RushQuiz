import type {
  GameRoom, Quiz, Player, Question,
  MultipleChoiceQuestion, ShortAnswerQuestion, NumericQuestion,
  QuestionPublic, RoomPublic,
} from "./types";

// ─── ROOM STORE ───────────────────────────────────────────────────────────────

const rooms = new Map<string, GameRoom>();

export function getRooms() { return rooms; }

export function getRoom(code: string): GameRoom | undefined {
  return rooms.get(code.toUpperCase());
}

// ─── ROOM CREATION ────────────────────────────────────────────────────────────

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export function createRoom(hostId: string, hostName: string, quiz: Quiz): GameRoom {
  let code = generateCode();
  while (rooms.has(code)) code = generateCode(); // ensure unique

  const host: Player = { id: hostId, name: hostName, score: 0, isHost: true };
  const room: GameRoom = {
    code,
    hostId,
    quiz,
    players: { [hostId]: host },
    status: "waiting",
    questionIndex: 0,
    questionStartedAt: 0,
    firstCorrectId: null,
  };
  rooms.set(code, room);
  return room;
}

// ─── PLAYER JOIN/LEAVE ────────────────────────────────────────────────────────

export function joinRoom(code: string, playerId: string, playerName: string): GameRoom | null {
  const room = rooms.get(code.toUpperCase());
  if (!room) return null;
  if (room.status !== "waiting") return null; // can't join mid-game

  const player: Player = { id: playerId, name: playerName, score: 0, isHost: false };
  room.players[playerId] = player;
  return room;
}

export function removePlayer(playerId: string): string | null {
  for (const [code, room] of rooms.entries()) {
    if (room.players[playerId]) {
      delete room.players[playerId];
      // If host left and room is empty, clean up
      if (Object.keys(room.players).length === 0) {
        rooms.delete(code);
        return null;
      }
      // If host left during game, pick a new host
      if (room.hostId === playerId && room.status !== "finished") {
        const newHostId = Object.keys(room.players)[0];
        room.hostId = newHostId;
        room.players[newHostId].isHost = true;
      }
      return code;
    }
  }
  return null;
}

// ─── GAME FLOW ────────────────────────────────────────────────────────────────

export function startGame(room: GameRoom): void {
  room.status = "question";
  room.questionIndex = 0;
  room.questionStartedAt = Date.now();
  room.firstCorrectId = null;
  // Reset all scores
  for (const p of Object.values(room.players)) {
    p.score = 0;
    p.answeredAt = undefined;
    p.lastCorrect = undefined;
  }
}

export function advanceQuestion(room: GameRoom): "question" | "finished" {
  room.questionIndex++;
  if (room.questionIndex >= room.quiz.questions.length) {
    room.status = "finished";
    return "finished";
  }
  room.status = "question";
  room.questionStartedAt = Date.now();
  room.firstCorrectId = null;
  // Clear per-question answer state
  for (const p of Object.values(room.players)) {
    p.answeredAt = undefined;
    p.lastCorrect = undefined;
  }
  return "question";
}

// ─── ANSWER CHECKING ─────────────────────────────────────────────────────────

export function checkAnswer(question: Question, userAnswer: string | number): boolean {
  if (question.type === "multiple_choice") {
    return Number(userAnswer) === question.correctIndex;
  }
  if (question.type === "short_answer") {
    const norm = String(userAnswer).trim().toLowerCase();
    if (norm === question.correctAnswer.trim().toLowerCase()) return true;
    return question.acceptedAnswers.some(a => norm === a.trim().toLowerCase());
  }
  if (question.type === "numeric") {
    const val = Number(userAnswer);
    return !isNaN(val) && Math.abs(val - question.correctAnswer) <= question.tolerance;
  }
  return false;
}

export function getCorrectAnswerDisplay(question: Question): string | number {
  if (question.type === "multiple_choice") return question.options[question.correctIndex];
  if (question.type === "short_answer")    return question.correctAnswer;
  if (question.type === "numeric")         return question.correctAnswer;
  return "";
}

// ─── SCORING ─────────────────────────────────────────────────────────────────

export function calculateBonus(room: GameRoom, question: Question): number {
  const elapsed = (Date.now() - room.questionStartedAt) / 1000; // seconds
  const remaining = Math.max(0, question.timeLimit - elapsed);
  // Up to 100 bonus points based on speed, proportional to time remaining
  return Math.round((remaining / question.timeLimit) * 100);
}

export function processAnswer(
  room: GameRoom,
  playerId: string,
  answer: string | number
): { correct: boolean; points: number; bonusPoints: number } {
  const question = room.quiz.questions[room.questionIndex];
  const player = room.players[playerId];
  if (!player || player.answeredAt !== undefined) {
    return { correct: false, points: 0, bonusPoints: 0 };
  }

  const correct = checkAnswer(question, answer);
  const bonusPoints = correct ? calculateBonus(room, question) : 0;
  const points = correct ? question.points : 0;

  player.answeredAt = Date.now();
  player.lastCorrect = correct;
  player.score += points + bonusPoints;

  if (correct && !room.firstCorrectId) {
    room.firstCorrectId = playerId;
  }

  return { correct, points, bonusPoints };
}

// ─── SAFE PUBLIC VIEWS ───────────────────────────────────────────────────────

export function toPublicQuestion(question: Question): QuestionPublic {
  if (question.type === "multiple_choice") {
    const { correctIndex, ...pub } = question;
    return pub;
  }
  if (question.type === "short_answer") {
    const { correctAnswer, acceptedAnswers, ...pub } = question;
    return pub;
  }
  if (question.type === "numeric") {
    const { correctAnswer, tolerance, ...pub } = question;
    return pub;
  }
  return question;
}

export function toPublicRoom(room: GameRoom): RoomPublic {
  return {
    code: room.code,
    quiz: { title: room.quiz.title, description: room.quiz.description, totalQuestions: room.quiz.questions.length },
    players: Object.values(room.players),
    status: room.status,
    questionIndex: room.questionIndex,
  };
}

export function getPlayersSorted(room: GameRoom): Player[] {
  return Object.values(room.players).sort((a, b) => b.score - a.score);
}
