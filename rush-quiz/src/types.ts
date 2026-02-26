// ─── QUESTION TYPES ──────────────────────────────────────────────────────────

export type QuestionType = "multiple_choice" | "short_answer" | "numeric";

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  text: string;
  points: number;
  timeLimit: number; // seconds
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: "multiple_choice";
  options: string[];       // exactly 4 options
  correctIndex: number;    // 0-3
}

export interface ShortAnswerQuestion extends BaseQuestion {
  type: "short_answer";
  correctAnswer: string;   // case-insensitive match
  acceptedAnswers: string[]; // additional accepted variants
}

export interface NumericQuestion extends BaseQuestion {
  type: "numeric";
  correctAnswer: number;
  tolerance: number; // ±tolerance accepted
  unit?: string;     // e.g. "km", "°C"
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
  id: string;
  name: string;
  isHost?: boolean;
  isBot?: boolean;
}

// ─── GAME ─────────────────────────────────────────────────────────────────────

export interface GameState {
  quiz: Quiz;
  roomCode: string;
  isHost: boolean;
  playerName: string;
  players: Player[];
  finalScores?: Record<string, number>;
}

export type Screen =
  | "home"
  | "auth"
  | "dashboard"
  | "quiz-editor"
  | "question-editor"
  | "lobby"
  | "game"
  | "results"
  | "join";

// ─── CSV ─────────────────────────────────────────────────────────────────────

/** Each row of the exported CSV */
export interface CsvRow {
  id: string;
  type: QuestionType;
  text: string;
  points: number;
  timeLimit: number;
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  correctIndex?: number;
  correctAnswer?: string;
  acceptedAnswers?: string;  // pipe-separated
  tolerance?: number;
  unit?: string;
}
