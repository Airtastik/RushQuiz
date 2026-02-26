import type { Quiz } from "./types";

// ─── THEME ────────────────────────────────────────────────────────────────────

export const C = {
  bg:         "#070710",
  surface:    "#0f0f1c",
  card:       "#161626",
  cardHover:  "#1e1e30",
  border:     "#252538",
  borderHi:   "#353550",
  accent:     "#ff3c6e",
  accentDim:  "rgba(255,60,110,0.18)",
  accentGlow: "rgba(255,60,110,0.35)",
  cyan:       "#00e5ff",
  cyanDim:    "rgba(0,229,255,0.15)",
  cyanGlow:   "rgba(0,229,255,0.3)",
  gold:       "#ffd700",
  goldDim:    "rgba(255,215,0,0.15)",
  text:       "#eeeeff",
  muted:      "#6868a0",
  success:    "#00e676",
  warning:    "#ffab00",
  error:      "#ff5252",
} as const;

// ─── FONTS ────────────────────────────────────────────────────────────────────

export const FONT_DISPLAY = "'Orbitron', sans-serif";
export const FONT_BODY    = "'Rajdhani', sans-serif";

// ─── GLOBAL CSS ───────────────────────────────────────────────────────────────

export const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html, body, #root {
  height: 100%;
  background: ${C.bg};
  color: ${C.text};
  font-family: ${FONT_BODY};
  overflow-x: hidden;
}

::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: ${C.surface}; }
::-webkit-scrollbar-thumb { background: ${C.accent}; border-radius: 3px; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes floatY {
  0%,100% { transform: translateY(0); }
  50%     { transform: translateY(-9px); }
}
@keyframes pulseGlow {
  0%,100% { box-shadow: 0 0 12px ${C.accentGlow}; }
  50%     { box-shadow: 0 0 28px ${C.accentGlow}, 0 0 50px rgba(255,60,110,0.12); }
}
@keyframes ping {
  0%       { transform: scale(1); opacity: 1; }
  75%,100% { transform: scale(2.2); opacity: 0; }
}
@keyframes countdown {
  from { transform: scale(1.6); opacity: 0; }
  to   { transform: scale(1);   opacity: 1; }
}
@keyframes flashGreen {
  0%   { background: ${C.card}; }
  40%  { background: rgba(0,230,118,0.28); }
  100% { background: rgba(0,230,118,0.12); }
}
@keyframes flashRed {
  0%   { background: ${C.card}; }
  40%  { background: rgba(255,60,110,0.28); }
  100% { background: rgba(255,60,110,0.08); }
}
@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
}

.fade-up    { animation: fadeUp 0.4s ease both; }
.float      { animation: floatY 3.2s ease-in-out infinite; }
.pulse-glow { animation: pulseGlow 2s ease-in-out infinite; }

.grid-bg {
  background-image:
    linear-gradient(rgba(0,229,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,229,255,0.03) 1px, transparent 1px);
  background-size: 44px 44px;
}

.neon-cyan  { text-shadow: 0 0 12px ${C.cyan},  0 0 28px rgba(0,229,255,0.4); }
.neon-red   { text-shadow: 0 0 12px ${C.accent}, 0 0 28px ${C.accentGlow}; }
.neon-gold  { text-shadow: 0 0 12px ${C.gold},   0 0 28px rgba(255,215,0,0.4); }

input, textarea, select {
  font-family: ${FONT_BODY};
  font-size: 15px;
  background: ${C.surface};
  border: 1px solid ${C.border};
  border-radius: 6px;
  color: ${C.text};
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
input:focus, textarea:focus, select:focus {
  border-color: ${C.accent};
  box-shadow: 0 0 0 2px ${C.accentDim};
}
input::placeholder, textarea::placeholder { color: ${C.muted}; }

button { cursor: pointer; }
button:active { transform: scale(0.97); }
`;

// ─── SAMPLE QUIZZES ───────────────────────────────────────────────────────────

export const SAMPLE_QUIZZES: Quiz[] = [
  {
    id: "sq1",
    title: "General Knowledge",
    description: "Classic trivia across history, science, and culture.",
    createdAt: "2025-09-01",
    questions: [
      { id: "sq1q1", type: "multiple_choice", text: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"], correctIndex: 2, points: 100, timeLimit: 15 },
      { id: "sq1q2", type: "multiple_choice", text: "How many planets are in our solar system?",
        options: ["7", "8", "9", "10"], correctIndex: 1, points: 100, timeLimit: 15 },
      { id: "sq1q3", type: "short_answer", text: "Who painted the Mona Lisa?",
        correctAnswer: "da vinci", acceptedAnswers: ["leonardo", "leonardo da vinci", "davinci"], points: 150, timeLimit: 20 },
      { id: "sq1q4", type: "numeric", text: "In what year did World War II end?",
        correctAnswer: 1945, tolerance: 0, points: 200, timeLimit: 15 },
      { id: "sq1q5", type: "numeric", text: "How many sides does a hexagon have?",
        correctAnswer: 6, tolerance: 0, points: 50, timeLimit: 10 },
    ],
  },
  {
    id: "sq2",
    title: "Tech & Science",
    description: "Computer science, physics, and engineering questions.",
    createdAt: "2025-10-12",
    questions: [
      { id: "sq2q1", type: "multiple_choice", text: "What does CPU stand for?",
        options: ["Central Processing Unit", "Computer Personal Unit", "Core Processing Utility", "Central Program Unit"],
        correctIndex: 0, points: 100, timeLimit: 15 },
      { id: "sq2q2", type: "short_answer", text: "What programming language is most commonly used for web browsers?",
        correctAnswer: "javascript", acceptedAnswers: ["js"], points: 100, timeLimit: 15 },
      { id: "sq2q3", type: "numeric", text: "How many bits are in a byte?",
        correctAnswer: 8, tolerance: 0, points: 50, timeLimit: 10 },
      { id: "sq2q4", type: "numeric", text: "What is the approximate speed of light in km/s? (round to nearest 100,000)",
        correctAnswer: 300000, tolerance: 10000, unit: "km/s", points: 200, timeLimit: 20 },
      { id: "sq2q5", type: "short_answer", text: "What does HTML stand for?",
        correctAnswer: "hypertext markup language", acceptedAnswers: [], points: 150, timeLimit: 20 },
    ],
  },
];
