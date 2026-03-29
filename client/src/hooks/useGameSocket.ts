import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import type {
  Player, Quiz,
  S2C_RoomJoined, S2C_RoomUpdated, S2C_Error,
  S2C_QuestionStart, S2C_AnswerResult, S2C_Leaderboard, S2C_GameOver,
  QuestionPublic, RoomPublic,
} from "../types";

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? "http://localhost:3001";

// ─── GAME STATE ───────────────────────────────────────────────────────────────

export type GamePhase =
  | "idle"
  | "connecting"
  | "lobby"
  | "question"
  | "answer_result"
  | "leaderboard"
  | "game_over"
  | "error";

export interface AnswerResultState {
  correct: boolean;
  points: number;
  bonusPoints: number;
  correctAnswer: string | number;
  firstCorrectName: string | null;
}

export interface GameSocketState {
  phase: GamePhase;
  error: string | null;
  myId: string | null;
  myScore: number;
  room: RoomPublic | null;
  players: Player[];
  question: QuestionPublic | null;
  questionIndex: number;
  totalQuestions: number;
  timeLimit: number;
  answerResult: AnswerResultState | null;
  leaderboard: Player[];
  firstCorrectName: string | null;
  finalPlayers: Player[] | null;
  finalQuiz: Quiz | null;
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────

export function useGameSocket() {
  const socketRef = useRef<Socket | null>(null);

  const [state, setState] = useState<GameSocketState>({
    phase: "idle",
    error: null,
    myId: null,
    myScore: 0,
    room: null,
    players: [],
    question: null,
    questionIndex: 0,
    totalQuestions: 0,
    timeLimit: 15,
    answerResult: null,
    leaderboard: [],
    firstCorrectName: null,
    finalPlayers: null,
    finalQuiz: null,
  });

  function patch(partial: Partial<GameSocketState>) {
    setState(s => ({ ...s, ...partial }));
  }

  // ── Connect & register listeners ─────────────────────────────────────────────
  useEffect(() => {
    const socket = io(SERVER_URL, { autoConnect: false, transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      patch({ myId: socket.id ?? null, error: null });
    });

    socket.on("disconnect", () => {
      patch({ phase: "error", error: "Disconnected from server" });
    });

    socket.on("error", (data: S2C_Error) => {
      patch({ phase: "error", error: data.message });
    });

    socket.on("room_joined", (data: S2C_RoomJoined) => {
      patch({
        phase: "lobby",
        room: data.room,
        players: data.room.players,
        myId: data.playerId,
        error: null,
      });
    });

    socket.on("room_updated", (data: S2C_RoomUpdated) => {
      patch({ players: data.players });
    });

    socket.on("question_start", (data: S2C_QuestionStart) => {
      patch({
        phase: "question",
        question: data.question,
        questionIndex: data.questionIndex,
        totalQuestions: data.totalQuestions,
        timeLimit: data.timeLimit,
        answerResult: null,
        firstCorrectName: null,
      });
    });

    socket.on("answer_result", (data: S2C_AnswerResult) => {
      patch({
        phase: "answer_result",
        answerResult: data,
        myScore: s => {
          // We'll update via leaderboard instead
          return 0;
        },
      });
      // Stay on answer_result until leaderboard arrives
    });

    socket.on("leaderboard", (data: S2C_Leaderboard) => {
      // Update my score from the authoritative leaderboard
      const myId = socketRef.current?.id;
      const me = data.players.find(p => p.id === myId);
      patch({
        phase: "leaderboard",
        leaderboard: data.players,
        questionIndex: data.questionIndex,
        totalQuestions: data.totalQuestions,
        firstCorrectName: data.firstCorrectName,
        myScore: me?.score ?? 0,
      });
    });

    socket.on("game_over", (data: S2C_GameOver) => {
      patch({
        phase: "game_over",
        finalPlayers: data.players,
        finalQuiz: data.quiz,
      });
    });

    return () => {
      socket.disconnect();
      socket.removeAllListeners();
    };
  }, []);

  // ── Actions ───────────────────────────────────────────────────────────────────

  const connect = useCallback(() => {
    patch({ phase: "connecting" });
    socketRef.current?.connect();
  }, []);

  const createRoom = useCallback((hostName: string, quiz: Quiz) => {
    connect();
    setTimeout(() => {
      socketRef.current?.emit("create_room", { hostName, quiz, quizId: quiz.id });
    }, 300);
  }, [connect]);

  const joinRoom = useCallback((code: string, playerName: string) => {
    connect();
    setTimeout(() => {
      socketRef.current?.emit("join_room", { code: code.toUpperCase(), playerName });
    }, 300);
  }, [connect]);

  const startGame = useCallback(() => {
    socketRef.current?.emit("start_game", {});
  }, []);

  const submitAnswer = useCallback((answer: string | number) => {
    socketRef.current?.emit("submit_answer", { answer });
  }, []);

  const nextQuestion = useCallback(() => {
    socketRef.current?.emit("next_question");
  }, []);

  const reset = useCallback(() => {
    socketRef.current?.disconnect();
    setState({
      phase: "idle", error: null, myId: null, myScore: 0,
      room: null, players: [], question: null,
      questionIndex: 0, totalQuestions: 0, timeLimit: 15,
      answerResult: null, leaderboard: [], firstCorrectName: null,
      finalPlayers: null, finalQuiz: null,
    });
  }, []);

  const isHost = useCallback((): boolean => {
    const myId = socketRef.current?.id;
    return state.players.find(p => p.id === myId)?.isHost ?? false;
  }, [state.players]);

  return { state, createRoom, joinRoom, startGame, submitAnswer, nextQuestion, reset, isHost };
}
