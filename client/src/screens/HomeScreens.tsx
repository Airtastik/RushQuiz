import React, { useState, useRef } from "react";
import type { Quiz } from "../types";
import { C, FONT_DISPLAY, FONT_BODY, APP_NAME, APP_TAGLINE } from "../constants";
import { generateRoomCode, downloadCsv, csvToQuiz } from "../utils";
import { Btn, Card, Logo, BackBtn, Field, Badge, QTypeIcon, Empty } from "../components/ui";

export const HomeScreen: React.FC<{ onHost: () => void; onJoin: () => void }> = ({ onHost, onJoin }) => (
  <div className="grid-bg" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", top: "8%",  left: "4%",  width: 340, height: 340, borderRadius: "50%", background: `radial-gradient(circle, ${C.accentGlow} 0%, transparent 65%)`, pointerEvents: "none" }} />
    <div style={{ position: "absolute", bottom: "12%", right: "4%", width: 420, height: 420, borderRadius: "50%", background: `radial-gradient(circle, ${C.cyanGlow} 0%, transparent 65%)`, pointerEvents: "none" }} />
    <div className="fade-up" style={{ textAlign: "center", maxWidth: 580, zIndex: 1 }}>
      <div className="float" style={{ marginBottom: 24 }}><Logo size={68} /></div>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 13, letterSpacing: "0.3em", color: C.muted, marginBottom: 10, textTransform: "uppercase" }}>{APP_TAGLINE}</div>
      <h1 style={{ fontSize: "clamp(30px, 6vw, 54px)", fontWeight: 700, lineHeight: 1.1, marginBottom: 16, fontFamily: FONT_BODY }}>
        Where trivia gets{" "}
        <span className="neon-red" style={{ fontFamily: FONT_DISPLAY, color: C.accent }}>intense</span>
      </h1>
      <p style={{ color: C.muted, fontSize: 17, lineHeight: 1.65, marginBottom: 48 }}>
        Host a live quiz for 50+ players or jump into a game with just a room code. Create multi-type quizzes and export them as CSV.
      </p>
      <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
        <Btn size="lg" onClick={onHost} style={{ minWidth: 200 }}>🎮 Host a Game</Btn>
        <Btn size="lg" variant="ghost" onClick={onJoin} style={{ minWidth: 200, borderColor: C.cyan, color: C.cyan }}>🚀 Join Game</Btn>
      </div>
      <div style={{ display: "flex", gap: 40, justifyContent: "center", marginTop: 56, flexWrap: "wrap" }}>
        {[{ num: "50+", label: "Players / Room" }, { num: "3", label: "Question Types" }, { num: "CSV", label: "Export Format" }].map(({ num, label }) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div className="neon-cyan" style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 700, color: C.cyan }}>{num}</div>
            <div style={{ fontSize: 12, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 5 }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const AuthScreen: React.FC<{ onBack: () => void; onAuth: (user: { name: string; email: string }) => void }> = ({ onBack, onAuth }) => {
  const [tab, setTab]       = useState<"login" | "register">("login");
  const [email, setEmail]   = useState("");
  const [password, setPassword] = useState("");
  const [name, setName]     = useState("");
  const inputStyle: React.CSSProperties = { width: "100%", padding: "11px 14px", borderRadius: 6, background: C.surface, border: `1px solid ${C.border}`, color: C.text, fontFamily: FONT_BODY, fontSize: 15 };
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: C.bg }} className="grid-bg">
      <div className="fade-up" style={{ width: "100%", maxWidth: 420 }}>
        <BackBtn onClick={onBack} />
        <Card>
          <Logo size={28} />
          <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 20, marginTop: 18, marginBottom: 5 }}>Host Portal</h2>
          <p style={{ color: C.muted, fontSize: 14, marginBottom: 24 }}>Sign in to manage quizzes and host games</p>
          <div style={{ display: "flex", marginBottom: 22, border: `1px solid ${C.border}`, borderRadius: 6, overflow: "hidden" }}>
            {(["login", "register"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: "10px", background: tab === t ? C.accent : "transparent", border: "none", color: tab === t ? "#fff" : C.muted, fontFamily: FONT_BODY, fontWeight: 700, fontSize: 14, textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer", transition: "all 0.2s" }}>{t}</button>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {tab === "register" && <Field label="Display Name" required><input style={inputStyle} placeholder="Your host name" value={name} onChange={e => setName(e.target.value)} /></Field>}
            <Field label="Email" required><input style={inputStyle} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} /></Field>
            <Field label="Password" required><input style={inputStyle} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} /></Field>
            <Btn onClick={() => onAuth({ email, name: name || email.split("@")[0] || "Host" })} style={{ width: "100%", marginTop: 6 }}>
              {tab === "login" ? "Sign In" : "Create Account"}
            </Btn>
          </div>
        </Card>
      </div>
    </div>
  );
};

export const JoinScreen: React.FC<{ onBack: () => void; onJoin: (info: { code: string; playerName: string }) => void }> = ({ onBack, onJoin }) => {
  const [code, setCode]             = useState("");
  const [playerName, setPlayerName] = useState("");
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: C.bg }} className="grid-bg">
      <div className="fade-up" style={{ width: "100%", maxWidth: 420 }}>
        <BackBtn onClick={onBack} />
        <Card>
          <Logo size={28} />
          <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 22, marginTop: 18, marginBottom: 6 }}>Join a Room</h2>
          <p style={{ color: C.muted, fontSize: 14, marginBottom: 28 }}>Enter the code from your host</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Field label="Your Name" required>
              <input style={{ width: "100%", padding: "11px 14px", borderRadius: 6, background: C.surface, border: `1px solid ${C.border}`, color: C.text, fontFamily: FONT_BODY, fontSize: 15 }} placeholder="Enter your name" value={playerName} onChange={e => setPlayerName(e.target.value)} />
            </Field>
            <Field label="Room Code" required>
              <input style={{ width: "100%", padding: "12px 14px", borderRadius: 6, background: C.surface, border: `1px solid ${C.accent}`, color: C.accent, fontFamily: FONT_DISPLAY, fontSize: 24, textAlign: "center", letterSpacing: "0.22em", textTransform: "uppercase" as const }} placeholder="ABC123" value={code} onChange={e => setCode(e.target.value.toUpperCase().slice(0, 6))} maxLength={6} />
            </Field>
            <Btn onClick={() => onJoin({ code, playerName: playerName || "Player" })} disabled={code.length < 4 || !playerName.trim()} style={{ width: "100%" }}>🚀 Join Room</Btn>
          </div>
        </Card>
      </div>
    </div>
  );
};

interface DashboardProps {
  user: { name: string; email: string };
  quizzes: Quiz[];
  onCreateQuiz: () => void;
  onEditQuiz: (q: Quiz) => void;
  onDeleteQuiz: (id: string) => void;
  onStartGame: (quiz: Quiz, roomCode: string) => void;
  onImportQuiz: (q: Quiz) => void;
  onBack: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, quizzes, onCreateQuiz, onEditQuiz, onDeleteQuiz, onStartGame, onImportQuiz, onBack }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [roomCode]                   = useState(generateRoomCode);
  const fileRef                      = useRef<HTMLInputElement>(null);
  const selectedQuiz                 = quizzes.find(q => q.id === selectedId);

  function handleImportCsv(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const imported = csvToQuiz(ev.target?.result as string);
      if (!imported) { alert("Could not parse CSV."); return; }
      onImportQuiz(imported);
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, padding: 24 }} className="grid-bg">
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 36, flexWrap: "wrap", gap: 16 }}>
          <Logo size={32} />
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13, color: C.muted }}>Signed in as</div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{user.name}</div>
            </div>
            <Btn variant="ghost" size="sm" onClick={onBack}>Sign Out</Btn>
          </div>
        </div>

        <Card glow="accent" style={{ marginBottom: 30, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 5 }}>Your Room Code</div>
            <div className="neon-red" style={{ fontFamily: FONT_DISPLAY, fontSize: 42, fontWeight: 900, color: C.accent, letterSpacing: "0.22em", lineHeight: 1 }}>{roomCode}</div>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 6 }}>Share this with players · Real-time sync</div>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Btn variant="ghost" size="sm" onClick={() => navigator.clipboard?.writeText(roomCode)}>📋 Copy</Btn>
            {selectedQuiz && <Btn size="md" onClick={() => onStartGame(selectedQuiz, roomCode)}>▶ Launch Game</Btn>}
          </div>
        </Card>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 17 }}>Quiz Library</h2>
          <div style={{ display: "flex", gap: 10 }}>
            <input ref={fileRef} type="file" accept=".csv" style={{ display: "none" }} onChange={handleImportCsv} />
            <Btn variant="ghost" size="sm" onClick={() => fileRef.current?.click()}>📂 Import CSV</Btn>
            <Btn size="sm" onClick={onCreateQuiz}>+ Create Quiz</Btn>
          </div>
        </div>

        {quizzes.length === 0
          ? <Empty icon="📋" title="No quizzes yet" sub='Click "Create Quiz" to build your first quiz, or import a CSV.' />
          : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
              {quizzes.map(quiz => (
                <QuizCard key={quiz.id} quiz={quiz} selected={quiz.id === selectedId}
                  onSelect={() => setSelectedId(id => id === quiz.id ? null : quiz.id)}
                  onEdit={() => onEditQuiz(quiz)}
                  onDelete={() => { onDeleteQuiz(quiz.id); if (selectedId === quiz.id) setSelectedId(null); }}
                  onExport={() => downloadCsv(quiz)}
                />
              ))}
            </div>
          )
        }
        {!selectedQuiz && quizzes.length > 0 && (
          <p style={{ textAlign: "center", color: C.muted, marginTop: 22, fontSize: 14 }}>Select a quiz above, then click Launch Game</p>
        )}
      </div>
    </div>
  );
};

const QuizCard: React.FC<{ quiz: Quiz; selected: boolean; onSelect: () => void; onEdit: () => void; onDelete: () => void; onExport: () => void }> = ({ quiz, selected, onSelect, onEdit, onDelete, onExport }) => {
  const tc = { mc: quiz.questions.filter(q => q.type === "multiple_choice").length, sa: quiz.questions.filter(q => q.type === "short_answer").length, nu: quiz.questions.filter(q => q.type === "numeric").length };
  return (
    <div className="fade-up" style={{ background: selected ? `${C.accent}10` : C.card, border: `2px solid ${selected ? C.accent : C.border}`, borderRadius: 9, overflow: "hidden", cursor: "pointer", transition: "all 0.18s", boxShadow: selected ? `0 0 24px ${C.accentGlow}` : "none" }}>
      <div onClick={onSelect} style={{ padding: "18px 18px 14px" }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 13, marginBottom: 6, lineHeight: 1.3 }}>{quiz.title}</div>
        {quiz.description && <div style={{ fontSize: 13, color: C.muted, marginBottom: 10 }}>{quiz.description}</div>}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          {tc.mc > 0 && <Badge color={C.cyan}>{tc.mc} MC</Badge>}
          {tc.sa > 0 && <Badge color={C.warning}>{tc.sa} SA</Badge>}
          {tc.nu > 0 && <Badge color={C.success}>{tc.nu} Num</Badge>}
        </div>
        <div style={{ fontSize: 12, color: C.muted }}>{quiz.questions.length} questions · {quiz.questions.reduce((s, q) => s + q.points, 0)} pts</div>
        {selected && <div style={{ marginTop: 12, padding: "7px 12px", background: C.accent, borderRadius: 5, fontSize: 12, fontWeight: 700, textAlign: "center", letterSpacing: "0.1em" }}>SELECTED ✓</div>}
      </div>
      <div style={{ borderTop: `1px solid ${C.border}`, display: "flex" }}>
        {[{ label: "Edit", fn: onEdit, col: C.cyan }, { label: "CSV", fn: onExport, col: C.success }, { label: "Delete", fn: onDelete, col: C.error }].map(({ label, fn, col }) => (
          <button key={label} onClick={e => { e.stopPropagation(); fn(); }} style={{ flex: 1, padding: "8px", background: "none", border: "none", borderRight: label !== "Delete" ? `1px solid ${C.border}` : "none", color: col, fontSize: 12, fontFamily: FONT_BODY, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", cursor: "pointer" }}>{label}</button>
        ))}
      </div>
    </div>
  );
};
