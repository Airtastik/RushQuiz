// ─── QUESTION TYPES ──────────────────────────────────────────────────────────

export type QuestionType = "multiple_choice" | "short_answer" | "numeric";

export interface MultipleChoiceQuestion {
  id: string;
  type: "multiple_choice";
  text: string;
  options: string[];
  correctIndex: number;
  points: number;
  timeLimit: number;
}

export interface ShortAnswerQuestion {
  id: string;
  type: "short_answer";
  text: string;
  correctAnswer: string;
  acceptedAnswers: string[];
  points: number;
  timeLimit: number;
}

export interface NumericQuestion {
  id: string;
  type: "numeric";
  text: string;
  correctAnswer: number;
  tolerance: number;
  unit?: string;
  points: number;
  timeLimit: number;
}

export type Question = MultipleChoiceQuestion | ShortAnswerQuestion | NumericQuestion;

// ─── QUIZ ─────────────────────────────────────────────────────────────────────

export interface Quiz {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  questions: Question[];
}

// ─── PLAYER ───────────────────────────────────────────────────────────────────

export interface Player {
  id: string;        // socket id
  name: string;
  score: number;
  isHost: boolean;
  answeredAt?: number; // timestamp — used for speed bonus
  lastCorrect?: boolean;
}

// ─── GAME ROOM ────────────────────────────────────────────────────────────────

export type RoomStatus = "waiting" | "question" | "leaderboard" | "finished";

export interface GameRoom {
  code: string;
  hostId: string;
  quiz: Quiz;
  players: Record<string, Player>;
  status: RoomStatus;
  questionIndex: number;
  questionStartedAt: number;  // epoch ms
  firstCorrectId: string | null;
}

// ─── SOCKET EVENTS ────────────────────────────────────────────────────────────
// Naming: C2S = client to server, S2C = server to client

export interface C2S_CreateRoom { quizId: string; hostName: string; quiz: Quiz; }
export interface C2S_JoinRoom   { code: string; playerName: string; }
export interface C2S_SubmitAnswer { answer: string | number; }
export interface C2S_NextQuestion { }
export interface C2S_StartGame { }

export interface S2C_RoomJoined   { room: RoomPublic; playerId: string; }
export interface S2C_RoomUpdated  { players: Player[]; }
export interface S2C_Error        { message: string; }
export interface S2C_QuestionStart {
  question: QuestionPublic;   // strips correct answer
  questionIndex: number;
  totalQuestions: number;
  timeLimit: number;
}
export interface S2C_AnswerResult {
  correct: boolean;
  points: number;
  bonusPoints: number;
  correctAnswer: string | number;   // revealed after submit
  firstCorrectName: string | null;
}
export interface S2C_Leaderboard {
  players: Player[];
  questionIndex: number;
  totalQuestions: number;
  firstCorrectName: string | null;
}
export interface S2C_GameOver {
  players: Player[];
  quiz: Quiz;
}

// Question sent to clients — correct answer stripped
export type QuestionPublic =
  | Omit<MultipleChoiceQuestion, "correctIndex">
  | Omit<ShortAnswerQuestion, "correctAnswer" | "acceptedAnswers">
  | Omit<NumericQuestion, "correctAnswer" | "tolerance">;

// Room info safe to send to clients
export interface RoomPublic {
  code: string;
  quiz: { title: string; description: string; totalQuestions: number };
  players: Player[];
  status: RoomStatus;
  questionIndex: number;
}
