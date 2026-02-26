import React, { useState, useEffect, useRef } from "react";
import type { Quiz, Player, Question, MultipleChoiceQuestion, ShortAnswerQuestion, NumericQuestion } from "../types";
import { C, FONT_DISPLAY, FONT_BODY } from "../constants";
import { generateBots, checkAnswer } from "../utils";
import { Btn, Card, Logo, Timer, LiveDot } from "../components/ui";

// ─── LOBBY SCREEN ─────────────────────────────────────────────────────────────

interface LobbyProps {
  roomCode: string;
  isHost: boolean;
  playerName: string;
  quiz?: Quiz;
  onStart: (players: Player[]) => void;
  onBack: () => void;
}

export const LobbyScreen: React.FC<LobbyProps> = ({ roomCode, isHost, playerName, quiz, onStart, onBack }) => {
  const [players, setPlayers] = useState<Player[]>(() => {
    const bots = generateBots(3);
    return isHost
      ? [{ id: "host", name: playerName, isHost: true }, ...bots]
      : [{ id: "host", name: "Host", isHost: true }, ...bots, { id: "me", name: playerName }];
  });
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.55 && players.length < 14) {
        const names = ["GamerPro", "Trivia99", "QuickDraw", "Blitz", "Phantom", "Nova", "Zephyr", "Pixel", "Comet", "Surge"];
        const unused = names.filter(n => !players.some(p => p.name === n));
        if (unused.length) {
          setPlayers(p => [...p, { id: `join-${Date.now()}`, name: unused[Math.floor(Math.random() * unused.length)] }]);
        }
      }
    }, 2200);
    return () => clearInterval(interval);
  }, [players]);

  function handleStart() {
    let c = 3;
    setCountdown(c);
    const t = setInterval(() => {
      c--;
      setCountdown(c);
      if (c <= 0) { clearInterval(t); onStart(players); }
    }, 1000);
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, padding: 24 }} className="grid-bg">
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 32 }}>
          <Logo size={28} />
          <Btn variant="ghost" size="sm" onClick={onBack}>Leave</Btn>
        </div>

        {countdown !== null ? (
          <div style={{ textAlign: "center", paddingTop: 100 }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 14, color: C.muted, letterSpacing: "0.2em", marginBottom: 20 }}>GAME STARTS IN</div>
            <div className="neon-red" style={{ fontFamily: FONT_DISPLAY, fontSize: 120, fontWeight: 900, color: C.accent, lineHeight: 1, animation: "countdown 0.7s ease" }}>
              {countdown || "GO!"}
            </div>
          </div>
        ) : (
          <>
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 13, color: C.muted, letterSpacing: "0.2em", marginBottom: 8 }}>ROOM CODE</div>
              <div className="neon-red" style={{ fontFamily: FONT_DISPLAY, fontSize: 60, fontWeight: 900, color: C.accent, letterSpacing: "0.3em", lineHeight: 1 }}>
                {roomCode}
              </div>
              {quiz && <div style={{ color: C.muted, marginTop: 10, fontSize: 15 }}>Quiz: <span style={{ color: C.text }}>{quiz.title}</span></div>}
            </div>

            <Card style={{ marginBottom: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 14 }}>Players in Lobby</h3>
                <LiveDot count={players.length} />
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {players.map(p => (
                  <div key={p.id} className="fade-up" style={{
                    padding: "8px 14px", background: C.surface,
                    border: `1px solid ${p.isHost ? C.accent : p.id === "me" ? C.cyan : C.border}`,
                    borderRadius: 20, fontSize: 14, fontWeight: 600,
                    color: p.isHost ? C.accent : p.id === "me" ? C.cyan : C.text,
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    {p.isBot ? "🤖" : p.isHost ? "👑" : "👤"} {p.name}
                  </div>
                ))}
              </div>
            </Card>

            {isHost ? (
              <div style={{ textAlign: "center" }}>
                <Btn size="lg" onClick={handleStart} style={{ minWidth: 240 }}>
                  ▶ Start Game ({players.length} players)
                </Btn>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: 32 }}>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 13, color: C.muted, marginBottom: 16 }}>WAITING FOR HOST</div>
                <div style={{ display: "inline-flex", gap: 7 }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: C.accent, animation: `ping 1.5s ease-in-out ${i * 0.3}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ─── GAME SCREEN ──────────────────────────────────────────────────────────────

interface GameProps {
  quiz: Quiz;
  players: Player[];
  roomCode: string;
  isHost: boolean;
  playerName: string;
  onEnd: (scores: Record<string, number>) => void;
}

export const GameScreen: React.FC<GameProps> = ({ quiz, players, roomCode, isHost, playerName, onEnd }) => {
  const [qIndex, setQIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(quiz.questions[0]?.timeLimit ?? 15);
  const [inputVal, setInputVal] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [revealed, setRevealed]   = useState(false);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
  const [firstCorrect, setFirstCorrect] = useState<string | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [scores, setScores] = useState<Record<string, number>>(() => {
    const s: Record<string, number> = {};
    players.forEach(p => { s[p.id || p.name] = 0; });
    return s;
  });
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const inputRef = useRef<HTMLInputElement>(null);

  const question = quiz.questions[qIndex];
  const myId = players.find(p => !p.isBot && !p.isHost)?.id ?? "me";

  useEffect(() => {
    setTimeLeft(question.timeLimit);
    setInputVal("");
    setSubmitted(false);
    setRevealed(false);
    setWasCorrect(null);
    setFirstCorrect(null);
    setShowLeaderboard(false);
    inputRef.current?.focus();

    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); revealAnswer(); return 0; }
        return t - 1;
      });
    }, 1000);

    // Bot answers
    const botTimeouts = players.filter(p => p.isBot).map(bot => {
      const delay = 1800 + Math.random() * (question.timeLimit * 900 - 1800);
      return setTimeout(() => {
        const correct = Math.random() > 0.4;
        if (correct) setFirstCorrect(fc => fc ?? bot.name);
        setScores(s => ({ ...s, [bot.id]: (s[bot.id] ?? 0) + (correct ? question.points : 0) }));
      }, delay);
    });

    return () => { clearInterval(timerRef.current); botTimeouts.forEach(clearTimeout); };
  }, [qIndex]);

  function revealAnswer() {
    clearInterval(timerRef.current);
    setRevealed(true);
    setTimeout(() => setShowLeaderboard(true), 1600);
  }

  function submitAnswer(answer: string | number) {
    if (submitted || revealed) return;
    clearInterval(timerRef.current);
    setSubmitted(true);
    const correct = checkAnswer(question, answer);
    setWasCorrect(correct);
    if (correct) {
      const bonus = Math.round(timeLeft * 4);
      setFirstCorrect(fc => fc ?? playerName);
      setScores(s => ({ ...s, [myId]: (s[myId] ?? 0) + question.points + bonus }));
    }
    setTimeout(revealAnswer, 900);
  }

  function handleMCSelect(idx: number) { submitAnswer(idx); }
  function handleTextSubmit() { if (inputVal.trim()) submitAnswer(inputVal.trim()); }
  function handleNumSubmit()  { if (inputVal.trim()) submitAnswer(Number(inputVal)); }

  function nextQuestion() {
    if (qIndex + 1 >= quiz.questions.length) onEnd(scores);
    else setQIndex(q => q + 1);
  }

  const leaderboard = Object.entries(scores)
    .map(([id, score]) => {
      const p = players.find(p => (p.id ?? p.name) === id);
      return { name: p?.name ?? id, score, isBot: p?.isBot ?? false };
    })
    .sort((a, b) => b.score - a.score);

  // ── Leaderboard between questions ──
  if (showLeaderboard) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, padding: 24 }} className="grid-bg">
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 28 }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 12, color: C.muted }}>Q{qIndex + 1}/{quiz.questions.length}</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 12, color: C.accent }}>{roomCode}</div>
          </div>

          <AnswerReveal question={question} inputVal={inputVal} wasCorrect={wasCorrect} />

          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div className="neon-gold" style={{ fontFamily: FONT_DISPLAY, fontSize: 18, color: C.gold }}>🏆 LEADERBOARD</div>
            {firstCorrect && <div style={{ fontSize: 13, color: C.success, marginTop: 6 }}>First correct: <strong>{firstCorrect}</strong> ⚡</div>}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 28 }}>
            {leaderboard.map((p, i) => (
              <div key={p.name} className="fade-up" style={{
                display: "flex", alignItems: "center", gap: 14, padding: "13px 18px",
                background: i === 0 ? C.goldDim : C.card,
                border: `1px solid ${i === 0 ? C.gold : C.border}`, borderRadius: 8,
                animationDelay: `${i * 0.07}s`,
              }}>
                <span style={{ width: 36, fontFamily: FONT_DISPLAY, fontSize: 18 }}>
                  {["🥇","🥈","🥉"][i] ?? `#${i + 1}`}
                </span>
                <span style={{ flex: 1, fontWeight: 700, fontSize: 16 }}>{p.isBot ? "🤖 " : ""}{p.name}</span>
                <span className="neon-cyan" style={{ fontFamily: FONT_DISPLAY, fontSize: 17, color: C.cyan }}>
                  {p.score.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {isHost
            ? <div style={{ textAlign: "center" }}><Btn size="lg" onClick={nextQuestion}>{qIndex + 1 >= quiz.questions.length ? "🏁 End Game" : "Next Question →"}</Btn></div>
            : <p style={{ textAlign: "center", color: C.muted, fontSize: 14 }}>Waiting for host…</p>
          }
        </div>
      </div>
    );
  }

  // ── Active question ──
  return (
    <div style={{ minHeight: "100vh", background: C.bg, padding: 24 }} className="grid-bg">
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 12, color: C.muted }}>Q {qIndex + 1}/{quiz.questions.length}</div>
          <Timer seconds={timeLeft} max={question.timeLimit} />
          <div style={{ textAlign: "right", fontFamily: FONT_DISPLAY, fontSize: 12 }}>
            <div style={{ color: C.cyan }}>{question.points} pts</div>
            <div style={{ color: C.muted }}>{quiz.title}</div>
          </div>
        </div>

        {/* Progress */}
        <div style={{ height: 3, background: C.border, borderRadius: 2, marginBottom: 28, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${((qIndex + 1) / quiz.questions.length) * 100}%`, background: `linear-gradient(90deg, ${C.accent}, ${C.cyan})`, transition: "width 0.5s", borderRadius: 2 }} />
        </div>

        {/* Question card */}
        <Card style={{ marginBottom: 22, textAlign: "center", padding: "28px 24px" }}>
          <div style={{ fontSize: "clamp(17px, 2.8vw, 24px)", fontWeight: 700, lineHeight: 1.45 }}>
            {question.text}
          </div>
          {question.type === "numeric" && (question as NumericQuestion).unit && (
            <div style={{ fontSize: 13, color: C.muted, marginTop: 8 }}>Answer in: {(question as NumericQuestion).unit}</div>
          )}
        </Card>

        {/* Answer area */}
        <AnswerInput
          question={question}
          inputVal={inputVal}
          setInputVal={setInputVal}
          submitted={submitted}
          revealed={revealed}
          wasCorrect={wasCorrect}
          inputRef={inputRef}
          onMCSelect={handleMCSelect}
          onTextSubmit={handleTextSubmit}
          onNumSubmit={handleNumSubmit}
        />

        <div style={{ textAlign: "center", marginTop: 18, fontSize: 14, color: C.muted }}>
          Score: <span className="neon-cyan" style={{ color: C.cyan, fontFamily: FONT_DISPLAY }}>{(scores[myId] ?? 0).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

// ─── ANSWER INPUT ─────────────────────────────────────────────────────────────

interface AnswerInputProps {
  question: Question;
  inputVal: string;
  setInputVal: (v: string) => void;
  submitted: boolean;
  revealed: boolean;
  wasCorrect: boolean | null;
  inputRef: React.RefObject<HTMLInputElement>;
  onMCSelect: (i: number) => void;
  onTextSubmit: () => void;
  onNumSubmit: () => void;
}

const AnswerInput: React.FC<AnswerInputProps> = ({
  question, inputVal, setInputVal, submitted, revealed, wasCorrect, inputRef, onMCSelect, onTextSubmit, onNumSubmit,
}) => {
  if (question.type === "multiple_choice") {
    const mc = question as MultipleChoiceQuestion;
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {mc.options.map((opt, i) => {
          const isCorrect = i === mc.correctIndex;
          let bg = C.card, border = C.border, animation = "";
          if (revealed) {
            if (isCorrect)            { bg = "rgba(0,230,118,0.12)"; border = C.success; animation = "flashGreen 0.5s ease"; }
            else if (submitted && wasCorrect === false && inputVal === String(i)) { bg = "rgba(255,60,110,0.08)"; border = C.error; animation = "flashRed 0.5s ease"; }
          }
          return (
            <button key={i} onClick={() => onMCSelect(i)} disabled={submitted || revealed} style={{
              background: bg, border: `2px solid ${border}`, borderRadius: 8,
              padding: "17px 18px", textAlign: "left", cursor: submitted || revealed ? "default" : "pointer",
              transition: "all 0.18s", color: C.text,
              fontFamily: FONT_BODY, fontSize: 16, fontWeight: 600,
              display: "flex", alignItems: "center", gap: 12, animation,
            }}>
              <span style={{ width: 27, height: 27, borderRadius: "50%", background: C.surface, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: C.muted, flexShrink: 0, fontFamily: FONT_DISPLAY }}>
                {["A","B","C","D"][i]}
              </span>
              {opt}
              {revealed && isCorrect && <span style={{ marginLeft: "auto", color: C.success }}>✓</span>}
            </button>
          );
        })}
      </div>
    );
  }

  if (question.type === "short_answer") {
    const sa = question as ShortAnswerQuestion;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            ref={inputRef}
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") onTextSubmit(); }}
            disabled={submitted || revealed}
            placeholder="Type your answer…"
            style={{
              flex: 1, padding: "14px 16px", borderRadius: 7, fontSize: 16,
              background: C.surface, border: `1px solid ${submitted ? (wasCorrect ? C.success : C.error) : C.border}`,
              color: C.text, fontFamily: FONT_BODY,
            }}
          />
          <Btn onClick={onTextSubmit} disabled={!inputVal.trim() || submitted || revealed}>Submit</Btn>
        </div>
        {revealed && (
          <div style={{ padding: "10px 14px", borderRadius: 7, background: `${C.success}15`, border: `1px solid ${C.success}`, fontSize: 14 }}>
            ✓ Correct answer: <strong>{sa.correctAnswer}</strong>
            {sa.acceptedAnswers.length > 0 && <span style={{ color: C.muted }}> (also: {sa.acceptedAnswers.join(", ")})</span>}
          </div>
        )}
        {submitted && wasCorrect !== null && !revealed && (
          <div style={{ textAlign: "center", fontSize: 15, fontWeight: 700, color: wasCorrect ? C.success : C.error }}>
            {wasCorrect ? "✓ Correct!" : "✗ Incorrect"}
          </div>
        )}
      </div>
    );
  }

  if (question.type === "numeric") {
    const nq = question as NumericQuestion;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            ref={inputRef}
            type="number"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") onNumSubmit(); }}
            disabled={submitted || revealed}
            placeholder={`Enter number${nq.unit ? ` (${nq.unit})` : ""}…`}
            style={{
              flex: 1, padding: "14px 16px", borderRadius: 7, fontSize: 18,
              background: C.surface, border: `1px solid ${submitted ? (wasCorrect ? C.success : C.error) : C.border}`,
              color: C.text, fontFamily: FONT_DISPLAY, textAlign: "center",
            }}
          />
          {nq.unit && <span style={{ fontFamily: FONT_DISPLAY, color: C.muted, fontSize: 16 }}>{nq.unit}</span>}
          <Btn onClick={onNumSubmit} disabled={!inputVal.trim() || submitted || revealed}>Submit</Btn>
        </div>
        {revealed && (
          <div style={{ padding: "10px 14px", borderRadius: 7, background: `${C.success}15`, border: `1px solid ${C.success}`, fontSize: 14 }}>
            ✓ Correct answer: <strong>{nq.correctAnswer}{nq.unit ? ` ${nq.unit}` : ""}</strong>
            {nq.tolerance > 0 && <span style={{ color: C.muted }}> (±{nq.tolerance} accepted)</span>}
          </div>
        )}
        {submitted && wasCorrect !== null && !revealed && (
          <div style={{ textAlign: "center", fontSize: 15, fontWeight: 700, color: wasCorrect ? C.success : C.error }}>
            {wasCorrect ? "✓ Correct!" : "✗ Incorrect"}
          </div>
        )}
      </div>
    );
  }

  return null;
};

// ─── ANSWER REVEAL (between questions) ───────────────────────────────────────

const AnswerReveal: React.FC<{ question: Question; inputVal: string; wasCorrect: boolean | null }> = ({ question, inputVal, wasCorrect }) => {
  if (wasCorrect === null) return null;
  return (
    <div style={{
      marginBottom: 20, padding: "14px 18px", borderRadius: 8, textAlign: "center",
      background: wasCorrect ? `${C.success}15` : `${C.error}10`,
      border: `1px solid ${wasCorrect ? C.success : C.error}`,
    }}>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 15, color: wasCorrect ? C.success : C.error, marginBottom: 4 }}>
        {wasCorrect ? "✓ CORRECT" : "✗ INCORRECT"}
      </div>
      {!wasCorrect && question.type === "multiple_choice" && (
        <div style={{ fontSize: 14, color: C.muted }}>
          Correct: <strong style={{ color: C.text }}>{(question as MultipleChoiceQuestion).options[(question as MultipleChoiceQuestion).correctIndex]}</strong>
        </div>
      )}
      {!wasCorrect && question.type === "short_answer" && (
        <div style={{ fontSize: 14, color: C.muted }}>Correct: <strong style={{ color: C.text }}>{(question as ShortAnswerQuestion).correctAnswer}</strong></div>
      )}
      {!wasCorrect && question.type === "numeric" && (
        <div style={{ fontSize: 14, color: C.muted }}>Correct: <strong style={{ color: C.text }}>{(question as NumericQuestion).correctAnswer}{(question as NumericQuestion).unit ? ` ${(question as NumericQuestion).unit}` : ""}</strong></div>
      )}
    </div>
  );
};

// ─── RESULTS SCREEN ───────────────────────────────────────────────────────────

interface ResultsProps {
  scores: Record<string, number>;
  players: Player[];
  quiz: Quiz;
  onReplay: () => void;
  onHome: () => void;
}

export const ResultsScreen: React.FC<ResultsProps> = ({ scores, players, quiz, onReplay, onHome }) => {
  const leaderboard = Object.entries(scores)
    .map(([id, score]) => {
      const p = players.find(p => (p.id ?? p.name) === id);
      return { name: p?.name ?? id, score, isBot: p?.isBot ?? false };
    })
    .sort((a, b) => b.score - a.score);

  const winner = leaderboard[0];
  const maxScore = winner?.score ?? 1;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, padding: 24 }} className="grid-bg">
      <div style={{ maxWidth: 660, margin: "0 auto" }}>
        <div style={{ textAlign: "center", paddingTop: 36, marginBottom: 44 }}>
          <Logo size={36} />
          <div className="neon-gold" style={{ fontFamily: FONT_DISPLAY, fontSize: 34, fontWeight: 900, color: C.gold, marginTop: 28, marginBottom: 8 }}>
            GAME OVER
          </div>
          <div style={{ fontSize: 15, color: C.muted }}>{quiz.title} · {quiz.questions.length} questions</div>
        </div>

        <Card glow="gold" style={{ textAlign: "center", marginBottom: 26, padding: 30 }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🏆</div>
          <div style={{ fontSize: 12, color: C.muted, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>Winner</div>
          <div className="neon-gold" style={{ fontFamily: FONT_DISPLAY, fontSize: 26, fontWeight: 900, color: C.gold }}>{winner?.name}</div>
          <div className="neon-cyan" style={{ fontFamily: FONT_DISPLAY, fontSize: 20, color: C.cyan, marginTop: 8 }}>{winner?.score?.toLocaleString()} pts</div>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 40 }}>
          {leaderboard.map((p, i) => (
            <div key={p.name} className="fade-up" style={{
              display: "flex", alignItems: "center", gap: 14, padding: "14px 18px",
              background: C.card, border: `1px solid ${C.border}`, borderRadius: 8,
              animationDelay: `${i * 0.06}s`,
            }}>
              <div style={{ width: 36, fontFamily: FONT_DISPLAY, fontSize: 18, color: [C.gold,"#C0C0C0","#CD7F32"][i] ?? C.muted }}>
                {["🥇","🥈","🥉"][i] ?? `#${i + 1}`}
              </div>
              <div style={{ flex: 1, fontWeight: 700, fontSize: 16 }}>{p.isBot ? "🤖 " : ""}{p.name}</div>
              <div style={{ width: 120, marginRight: 10 }}>
                <div style={{ height: 5, background: C.border, borderRadius: 3, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${maxScore > 0 ? (p.score / maxScore) * 100 : 0}%`,
                    background: i === 0 ? C.gold : C.cyan, borderRadius: 3, transition: "width 1.2s ease",
                  }} />
                </div>
              </div>
              <div className="neon-cyan" style={{ fontFamily: FONT_DISPLAY, fontSize: 15, color: C.cyan, minWidth: 70, textAlign: "right" }}>
                {p.score.toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
          <Btn onClick={onReplay} variant="cyan">🔁 Play Again</Btn>
          <Btn onClick={onHome} variant="ghost">🏠 Home</Btn>
        </div>
      </div>
    </div>
  );
};
