# RUSH Quiz 🎮

A real-time, multi-type quiz platform built with **React + TypeScript + Vite**.

## Features

- **3 Question Types**
  - **Multiple Choice** — 4 options, mark the correct one
  - **Short Answer** — text input with accepted variants (case-insensitive)
  - **Numeric** — number input with optional tolerance range and unit
- **Quiz Editor** — full CRUD for quizzes and questions, reorder via arrows
- **CSV Export/Import** — every quiz exports to a structured `.csv` file and can be re-imported
- **Live Game Flow** — lobby with simulated bot players, per-question timers, first-correct detection, leaderboard reveals
- **Results Screen** — ranked leaderboard with animated score bars

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Type-check only
npm run typecheck
```

Open http://localhost:5173 in your browser.

## CSV Format

Quizzes export as CSV with comment metadata headers:

```
# RUSH Quiz Export
# Title: My Quiz
# Description: ...
# ID: abc123
# Questions: 5

id,type,text,points,timeLimit,option_a,option_b,option_c,option_d,correctIndex,correctAnswer,acceptedAnswers,tolerance,unit
q1,multiple_choice,What is 2+2?,100,15,3,4,5,6,1,,,,
q2,short_answer,Capital of France?,150,20,,,,,,paris,"paris france|the city of paris",,
q3,numeric,Speed of light in km/s?,200,20,,,,,,300000,,10000,km/s
```

### Column Reference

| Column | Used by | Description |
|---|---|---|
| `id` | all | Unique question ID |
| `type` | all | `multiple_choice` \| `short_answer` \| `numeric` |
| `text` | all | Question text |
| `points` | all | Points awarded |
| `timeLimit` | all | Seconds to answer |
| `option_a–d` | MC | The four answer choices |
| `correctIndex` | MC | 0-indexed correct option (0=A, 1=B…) |
| `correctAnswer` | SA, Num | The primary correct answer |
| `acceptedAnswers` | SA | Pipe-separated alternate accepted answers |
| `tolerance` | Num | ±tolerance for numeric answers |
| `unit` | Num | Display unit (e.g. `km/s`, `°C`) |

## Project Structure

```
rush-quiz/
├── src/
│   ├── types.ts               # All TypeScript interfaces
│   ├── constants.ts           # Theme colors, fonts, sample data
│   ├── utils.ts               # CSV export/import, game helpers
│   ├── App.tsx                # Main router
│   ├── main.tsx               # React entry point
│   ├── components/
│   │   └── ui.tsx             # Shared UI components (Btn, Card, Timer, etc.)
│   └── screens/
│       ├── HomeScreens.tsx    # Home, Auth, Join, Dashboard
│       ├── QuizEditor.tsx     # Quiz + question creation/editing
│       └── GameScreens.tsx    # Lobby, Game, Results
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Tech Stack

- React 18
- TypeScript 5
- Vite 5
- No external UI libraries — fully custom design system
