# BlitzTrivia v2 — Real Multiplayer

A real-time quiz platform with a Node.js + Socket.io backend and React + TypeScript frontend.

## Project Structure

```
blitz-trivia-v2/
├── server/          ← Node.js + Socket.io game server (deploy to Railway)
│   ├── src/
│   │   ├── index.ts    — Express + Socket.io entry point
│   │   ├── game.ts     — Room management, scoring, answer checking
│   │   └── types.ts    — Shared TypeScript types
│   ├── package.json
│   └── tsconfig.json
│
├── client/          ← React + TypeScript frontend (deploy to Vercel)
│   ├── src/
│   │   ├── App.tsx                    — Main router, socket state machine
│   │   ├── types.ts                   — Shared types (mirrors server)
│   │   ├── constants.ts               — Theme, sample quizzes
│   │   ├── utils.ts                   — CSV export/import
│   │   ├── hooks/
│   │   │   └── useGameSocket.ts       — Socket.io connection + all game events
│   │   ├── components/
│   │   │   └── ui.tsx                 — Shared UI components
│   │   └── screens/
│   │       ├── HomeScreens.tsx        — Home, Auth, Join, Dashboard
│   │       ├── QuizEditor.tsx         — Quiz + question creator
│   │       └── GameScreens.tsx        — Lobby, Game, Leaderboard, Results
│   ├── .env.example
│   └── package.json
│
└── package.json     ← Root monorepo scripts
```

---

## Local Development

### 1. Install dependencies

```bash
npm run install:all
```

### 2. Set up environment variables

```bash
# Server
cp server/.env.example server/.env

# Client
cp client/.env.example client/.env
```

### 3. Run both together

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend:  http://localhost:3001
- Health check: http://localhost:3001/health

---

## How It Works

```
Players/Host  ←──WebSocket (Socket.io)──→  Railway Server
                                                  │
                                           Game state lives here:
                                           - Room codes
                                           - Current question
                                           - All player scores
                                           - Timers
```

### Socket Event Flow

```
HOST                          SERVER                        PLAYERS
 │                              │                              │
 ├─ create_room ───────────────>│                              │
 │<─ room_joined ───────────────┤                              │
 │                              │<─── join_room ───────────────┤
 │                              ├──── room_updated ───────────>│
 ├─ start_game ────────────────>│                              │
 │<─ question_start ────────────┼──── question_start ─────────>│
 │                              │<─── submit_answer ───────────┤
 │                              ├──── answer_result ──────────>│  (per player)
 │<─ leaderboard ───────────────┼──── leaderboard ────────────>│
 ├─ next_question ─────────────>│                              │
 │<─ question_start ────────────┼──── question_start ─────────>│
 │      ...                     │           ...                │
 ├─ next_question (last) ──────>│                              │
 │<─ game_over ─────────────────┼──── game_over ──────────────>│
```

---

## Deploying to Production

### Step 1 — Deploy server to Railway

1. Go to railway.app and create a new project
2. Connect your GitHub repo
3. Select the `server` folder as the root directory
4. Railway auto-detects Node.js and runs `npm start`
5. Add environment variables in Railway dashboard:
   ```
   CLIENT_URL=https://blitztrivia.tech
   PORT=3001   ← Railway sets this automatically
   ```
6. Copy your Railway server URL (e.g. `https://blitz-trivia-server.up.railway.app`)

### Step 2 — Deploy client to Vercel

1. Go to vercel.com, import your GitHub repo
2. Set **Root Directory** to `client`
3. Add environment variable:
   ```
   VITE_SERVER_URL=https://blitz-trivia-server.up.railway.app
   ```
4. Deploy — Vercel auto-detects Vite

### Step 3 — Connect blitztrivia.tech

In Vercel → Settings → Domains → add `blitztrivia.tech`

Add these DNS records at get.tech (your registrar):
| Type  | Host | Value                    |
|-------|------|--------------------------|
| A     | @    | `76.76.21.21`            |
| CNAME | www  | `cname.vercel-dns.com`   |

SSL is provisioned automatically by Vercel.

---

## Scoring

- **Base points** — set per question (default 100)
- **Speed bonus** — up to +100 pts, proportional to time remaining
- **First correct** — displayed on leaderboard, no extra points (just glory)

Formula: `total = basePoints + Math.round((timeRemaining / timeLimit) * 100)`

---

## CSV Quiz Format

Quizzes can be created in the editor and exported as CSV, or imported from CSV.
See the Quiz Editor for full column reference.
