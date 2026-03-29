import type { Quiz } from "./types";

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

export const FONT_DISPLAY = "'Orbitron', sans-serif";
export const FONT_BODY    = "'Rajdhani', sans-serif";

export const APP_NAME     = "BlitzTrivia";
export const APP_TAGLINE  = "Real-Time Quiz Platform";

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

export const SAMPLE_QUIZZES: Quiz[] = [
  {
    id: "minicon-vol2",
    title: "Minicon Video Game Song Quiz Vol. 2",
    description: "Play the track — name the game! 4 categories, 20 questions.",
    createdAt: "2026-03-28",
    questions: [
      // ── Category 1: Choose Your Fighter ──
      { id: "cat1q1", type: "short_answer", text: "🎮 Cat. 1 — Choose Your Fighter  |  Q1: Name the game", points: 100, timeLimit: 60, correctAnswer: "super smash bros brawl",       acceptedAnswers: ["smash bros brawl","brawl","ssbb","super smash bros","smash brawl"] },
      { id: "cat1q2", type: "short_answer", text: "🎮 Cat. 1 — Choose Your Fighter  |  Q2: Name the game", points: 100, timeLimit: 60, correctAnswer: "valorant",                      acceptedAnswers: ["valorant game","riot valorant"] },
      { id: "cat1q3", type: "short_answer", text: "🎮 Cat. 1 — Choose Your Fighter  |  Q3: Name the game", points: 100, timeLimit: 60, correctAnswer: "mario kart wii",                acceptedAnswers: ["mkwii","mariokart wii","mario kart"] },
      { id: "cat1q4", type: "short_answer", text: "🎮 Cat. 1 — Choose Your Fighter  |  Q4: Name the game", points: 100, timeLimit: 60, correctAnswer: "sonic riders zero gravity",     acceptedAnswers: ["sonic riders","sonic riders 2","zero gravity","sonic riders: zero gravity"] },
      { id: "cat1q5", type: "short_answer", text: "🎮 Cat. 1 — Choose Your Fighter  |  Q5: Name the game", points: 100, timeLimit: 60, correctAnswer: "blazblue central fiction",      acceptedAnswers: ["blazblue","blaz blue","blazblue: central fiction","central fiction"] },
      // ── Category 2: 2016 Was 10 Years Ago ──
      { id: "cat2q1", type: "short_answer", text: "🕹️ Cat. 2 — 2016 Was 10 Years Ago  |  Q1: Name the game", points: 100, timeLimit: 60, correctAnswer: "overwatch",               acceptedAnswers: ["overwatch 1","ow","blizzard overwatch"] },
      { id: "cat2q2", type: "short_answer", text: "🕹️ Cat. 2 — 2016 Was 10 Years Ago  |  Q2: Name the game", points: 100, timeLimit: 60, correctAnswer: "doom 2016",               acceptedAnswers: ["doom","doom game","doom reboot","doom (2016)"] },
      { id: "cat2q3", type: "short_answer", text: "🕹️ Cat. 2 — 2016 Was 10 Years Ago  |  Q3: Name the game", points: 100, timeLimit: 60, correctAnswer: "dark souls 3",            acceptedAnswers: ["dark souls iii","ds3"] },
      { id: "cat2q4", type: "short_answer", text: "🕹️ Cat. 2 — 2016 Was 10 Years Ago  |  Q4: Name the game", points: 100, timeLimit: 60, correctAnswer: "final fantasy 15",        acceptedAnswers: ["final fantasy xv","ff15","ffxv"] },
      { id: "cat2q5", type: "short_answer", text: "🕹️ Cat. 2 — 2016 Was 10 Years Ago  |  Q5: Name the game", points: 100, timeLimit: 60, correctAnswer: "street fighter 5",        acceptedAnswers: ["street fighter v","sf5","sfv"] },
      // ── Category 3: Horses ──
      { id: "cat3q1", type: "short_answer", text: "🐴 Cat. 3 — Horses  |  Q1: Name the game", points: 100, timeLimit: 60, correctAnswer: "red dead redemption 2",          acceptedAnswers: ["rdr2","red dead 2","red dead redemption","rdr"] },
      { id: "cat3q2", type: "short_answer", text: "🐴 Cat. 3 — Horses  |  Q2: Name the game", points: 100, timeLimit: 60, correctAnswer: "fire emblem three houses",        acceptedAnswers: ["fire emblem 3 houses","fe3h","three houses","fire emblem: three houses"] },
      { id: "cat3q3", type: "short_answer", text: "🐴 Cat. 3 — Horses  |  Q3: Name the game", points: 100, timeLimit: 60, correctAnswer: "uma musume pretty derby",         acceptedAnswers: ["uma musume","umamusume","pretty derby","uma musume: pretty derby"] },
      { id: "cat3q4", type: "short_answer", text: "🐴 Cat. 3 — Horses  |  Q4: Name the game", points: 100, timeLimit: 60, correctAnswer: "the witcher 3",                   acceptedAnswers: ["witcher 3","witcher 3 wild hunt","the witcher 3: wild hunt","witcher"] },
      { id: "cat3q5", type: "short_answer", text: "🐴 Cat. 3 — Horses  |  Q5: Name the game", points: 100, timeLimit: 60, correctAnswer: "minecraft",                       acceptedAnswers: ["mine craft","mc"] },
      // ── Category 4: Final Boss ──
      { id: "cat4q1", type: "short_answer", text: "💀 Cat. 4 — Final Boss  |  Q1: Name the game", points: 100, timeLimit: 60, correctAnswer: "pokemon diamond pearl platinum", acceptedAnswers: ["pokemon diamond","pokemon pearl","pokemon platinum","pokémon diamond","pokémon pearl","pokémon platinum","gen 4 pokemon","gen 4"] },
      { id: "cat4q2", type: "short_answer", text: "💀 Cat. 4 — Final Boss  |  Q2: Name the game", points: 100, timeLimit: 60, correctAnswer: "persona 5",                     acceptedAnswers: ["persona 5 royal","p5","p5r","persona five"] },
      { id: "cat4q3", type: "short_answer", text: "💀 Cat. 4 — Final Boss  |  Q3: Name the game", points: 100, timeLimit: 60, correctAnswer: "elden ring",                    acceptedAnswers: ["eldenring","elden ring game"] },
      { id: "cat4q4", type: "short_answer", text: "💀 Cat. 4 — Final Boss  |  Q4: Name the game", points: 100, timeLimit: 60, correctAnswer: "god of war",                    acceptedAnswers: ["gow","god of war 2018","god of war ps4"] },
      { id: "cat4q5", type: "short_answer", text: "💀 Cat. 4 — Final Boss  |  Q5: Name the game", points: 100, timeLimit: 60, correctAnswer: "ace combat zero",               acceptedAnswers: ["ace combat zero the belkan war","ace combat 0","ace combat: zero"] },
    ],
  },
];
