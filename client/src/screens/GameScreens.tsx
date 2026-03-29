import React, { useState, useEffect, useRef } from "react";
import type { Player, Quiz, QuestionPublic } from "../types";
import type { AnswerResultState } from "../hooks/useGameSocket";
import { C, FONT_DISPLAY, FONT_BODY } from "../constants";
import { Btn, Card, Logo, Timer, LiveDot } from "../components/ui";

// ─── LOBBY ────────────────────────────────────────────────────────────────────

interface LobbyProps {
  roomCode: string;
  isHost: boolean;
  players: Player[];
  quizTitle: string;
  onStart: () => void;
  onBack: () => void;
}

export const LobbyScreen: React.FC<LobbyProps> = ({ roomCode, isHost, players, quizTitle, onStart, onBack }) => (
  <div style={{ minHeight: "100vh", background: C.bg, padding: 24 }} className="grid-bg">
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 32 }}>
        <Logo size={28} />
        <Btn variant="ghost" size="sm" onClick={onBack}>Leave</Btn>
      </div>

      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 13, color: C.muted, letterSpacing: "0.2em", marginBottom: 8 }}>ROOM CODE</div>
        <div className="neon-red pulse-glow" style={{ fontFamily: FONT_DISPLAY, fontSize: 64, fontWeight: 900, color: C.accent, letterSpacing: "0.3em", lineHeight: 1 }}>{roomCode}</div>
        <div style={{ color: C.muted, marginTop: 10, fontSize: 15 }}>Quiz: <span style={{ color: C.text }}>{quizTitle}</span></div>
        <div style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>Share this code with players to join</div>
      </div>

      <Card style={{ marginBottom: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 14 }}>Players in Lobby</h3>
          <LiveDot count={players.length} />
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, minHeight: 48 }}>
          {players.map(p => (
            <div key={p.id} className="fade-up" style={{
              padding: "8px 14px", background: C.surface,
              border: `1px solid ${p.isHost ? C.accent : C.border}`,
              borderRadius: 20, fontSize: 14, fontWeight: 600,
              color: p.isHost ? C.accent : C.text,
              display: "flex", alignItems: "center", gap: 6,
            }}>
              {p.isHost ? "👑" : "👤"} {p.name}
            </div>
          ))}
          {players.length === 0 && <span style={{ color: C.muted, fontSize: 14 }}>Waiting for players…</span>}
        </div>
      </Card>

      {isHost ? (
        <div style={{ textAlign: "center" }}>
          <Btn size="lg" onClick={onStart} disabled={players.length < 1} style={{ minWidth: 240 }}>
            ▶ Start Game ({players.length} player{players.length !== 1 ? "s" : ""})
          </Btn>
          <p style={{ color: C.muted, fontSize: 13, marginTop: 10 }}>Need at least 1 player to start</p>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: 32 }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 13, color: C.muted, marginBottom: 16 }}>WAITING FOR HOST TO START</div>
          <div style={{ display: "inline-flex", gap: 7 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: C.accent, animation: `ping 1.5s ease-in-out ${i * 0.3}s infinite` }} />
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);

// ─── GAME SCREEN ──────────────────────────────────────────────────────────────

interface GameScreenProps {
  question: QuestionPublic;
  questionIndex: number;
  totalQuestions: number;
  timeLimit: number;
  myScore: number;
  quizTitle: string;
  answerResult: AnswerResultState | null;
  onSubmit: (answer: string | number) => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  question, questionIndex, totalQuestions, timeLimit,
  myScore, quizTitle, answerResult, onSubmit,
}) => {
  const [timeLeft, setTimeLeft]   = useState(timeLimit);
  const [inputVal, setInputVal]   = useState("");
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  // Reset when question changes
  useEffect(() => {
    setTimeLeft(timeLimit);
    setInputVal("");
    setSubmitted(false);
    inputRef.current?.focus();

    timerRef.current = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { clearInterval(timerRef.current); return 0; } return t - 1; });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [question.id, timeLimit]);

  // Stop timer when answered
  useEffect(() => {
    if (answerResult) clearInterval(timerRef.current);
  }, [answerResult]);

  function handleSubmit(answer: string | number) {
    if (submitted) return;
    setSubmitted(true);
    clearInterval(timerRef.current);
    onSubmit(answer);
  }

  const isAnswered = submitted || !!answerResult;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, padding: 24 }} className="grid-bg">
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 12, color: C.muted }}>Q {questionIndex + 1}/{totalQuestions}</div>
          <Timer seconds={timeLeft} max={timeLimit} />
          <div style={{ textAlign: "right", fontFamily: FONT_DISPLAY, fontSize: 12 }}>
            <div style={{ color: C.cyan }}>{question.points} pts</div>
            <div style={{ color: C.muted }}>{quizTitle}</div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, background: C.border, borderRadius: 2, marginBottom: 28, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${((questionIndex + 1) / totalQuestions) * 100}%`, background: `linear-gradient(90deg, ${C.accent}, ${C.cyan})`, transition: "width 0.5s", borderRadius: 2 }} />
        </div>

        {/* Question */}
        <Card style={{ marginBottom: 22, textAlign: "center", padding: "28px 24px" }}>
          <div style={{ fontSize: "clamp(17px, 2.8vw, 24px)", fontWeight: 700, lineHeight: 1.45 }}>
            {question.text}
          </div>
          {question.type === "numeric" && (question as { unit?: string }).unit && (
            <div style={{ fontSize: 13, color: C.muted, marginTop: 8 }}>Answer in: {(question as { unit?: string }).unit}</div>
          )}
        </Card>

        {/* Answer result banner (shown after submitting) */}
        {answerResult && (
          <div style={{
            marginBottom: 18, padding: "14px 18px", borderRadius: 8, textAlign: "center",
            background: answerResult.correct ? `${C.success}15` : `${C.error}10`,
            border: `1px solid ${answerResult.correct ? C.success : C.error}`,
          }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 15, color: answerResult.correct ? C.success : C.error, marginBottom: 4 }}>
              {answerResult.correct ? `✓ CORRECT  +${answerResult.points + answerResult.bonusPoints} pts` : "✗ INCORRECT"}
            </div>
            {answerResult.bonusPoints > 0 && (
              <div style={{ fontSize: 12, color: C.muted }}>Base: {answerResult.points}  Speed bonus: +{answerResult.bonusPoints}</div>
            )}
            {!answerResult.correct && (
              <div style={{ fontSize: 14, color: C.muted, marginTop: 4 }}>
                Correct answer: <strong style={{ color: C.text }}>{String(answerResult.correctAnswer)}</strong>
              </div>
            )}
            <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Waiting for other players…</div>
          </div>
        )}

        {/* Answer inputs */}
        {!answerResult && (
          <AnswerInput
            question={question}
            inputVal={inputVal}
            setInputVal={setInputVal}
            isAnswered={isAnswered}
            inputRef={inputRef}
            onSubmit={handleSubmit}
          />
        )}

        <div style={{ textAlign: "center", marginTop: 18, fontSize: 14, color: C.muted }}>
          Your score: <span className="neon-cyan" style={{ color: C.cyan, fontFamily: FONT_DISPLAY }}>{myScore.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

// ─── ANSWER INPUT ─────────────────────────────────────────────────────────────

interface AnswerInputProps {
  question: QuestionPublic;
  inputVal: string;
  setInputVal: (v: string) => void;
  isAnswered: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
  onSubmit: (answer: string | number) => void;
}

const AnswerInput: React.FC<AnswerInputProps> = ({ question, inputVal, setInputVal, isAnswered, inputRef, onSubmit }) => {
  const inputBase: React.CSSProperties = {
    flex: 1, padding: "14px 16px", borderRadius: 7, fontSize: 16,
    background: C.surface, color: C.text, fontFamily: FONT_BODY,
    border: `1px solid ${C.border}`,
  };

  if (question.type === "multiple_choice") {
    const mc = question as { options: string[] };
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {mc.options.map((opt, i) => (
          <button key={i} onClick={() => onSubmit(i)} disabled={isAnswered} style={{
            background: C.card, border: `2px solid ${C.border}`, borderRadius: 8,
            padding: "17px 18px", textAlign: "left",
            cursor: isAnswered ? "default" : "pointer",
            transition: "all 0.18s", color: C.text,
            fontFamily: FONT_BODY, fontSize: 16, fontWeight: 600,
            display: "flex", alignItems: "center", gap: 12,
            opacity: isAnswered ? 0.5 : 1,
          }}>
            <span style={{ width: 27, height: 27, borderRadius: "50%", background: C.surface, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: C.muted, flexShrink: 0, fontFamily: FONT_DISPLAY }}>
              {["A", "B", "C", "D"][i]}
            </span>
            {opt}
          </button>
        ))}
      </div>
    );
  }

  if (question.type === "short_answer") {
    return (
      <div style={{ display: "flex", gap: 10 }}>
        <input ref={inputRef} value={inputVal} onChange={e => setInputVal(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && inputVal.trim()) onSubmit(inputVal.trim()); }}
          disabled={isAnswered} placeholder="Type your answer…" style={inputBase} />
        <Btn onClick={() => onSubmit(inputVal.trim())} disabled={!inputVal.trim() || isAnswered}>Submit</Btn>
      </div>
    );
  }

  if (question.type === "numeric") {
    const nq = question as { unit?: string };
    return (
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <input ref={inputRef} type="number" value={inputVal} onChange={e => setInputVal(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && inputVal.trim()) onSubmit(Number(inputVal)); }}
          disabled={isAnswered} placeholder="Enter number…"
          style={{ ...inputBase, fontFamily: FONT_DISPLAY, fontSize: 20, textAlign: "center" }} />
        {nq.unit && <span style={{ fontFamily: FONT_DISPLAY, color: C.muted, fontSize: 16 }}>{nq.unit}</span>}
        <Btn onClick={() => onSubmit(Number(inputVal))} disabled={!inputVal.trim() || isAnswered}>Submit</Btn>
      </div>
    );
  }

  return null;
};

// ─── LEADERBOARD SCREEN ───────────────────────────────────────────────────────

interface LeaderboardProps {
  players: Player[];
  questionIndex: number;
  totalQuestions: number;
  firstCorrectName: string | null;
  isHost: boolean;
  myId: string | null;
  onNext: () => void;
}

export const LeaderboardScreen: React.FC<LeaderboardProps> = ({
  players, questionIndex, totalQuestions, firstCorrectName, isHost, myId, onNext,
}) => (
  <div style={{ minHeight: "100vh", background: C.bg, padding: 24 }} className="grid-bg">
    <div style={{ maxWidth: 620, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 12, color: C.muted }}>Q{questionIndex + 1}/{totalQuestions}</div>
        <Logo size={24} />
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 12, color: C.muted }}>LEADERBOARD</div>
      </div>

      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div className="neon-gold" style={{ fontFamily: FONT_DISPLAY, fontSize: 22, color: C.gold, marginBottom: 8 }}>
          🏆 AFTER QUESTION {questionIndex + 1}
        </div>
        {firstCorrectName && (
          <div style={{ fontSize: 14, color: C.success }}>
            ⚡ First correct: <strong>{firstCorrectName}</strong>
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
        {players.map((p, i) => {
          const isMe = p.id === myId;
          return (
            <div key={p.id} className="fade-up" style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "14px 18px",
              background: i === 0 ? C.goldDim : isMe ? C.accentDim : C.card,
              border: `1px solid ${i === 0 ? C.gold : isMe ? C.accent : C.border}`,
              borderRadius: 8,
              animationDelay: `${i * 0.07}s`,
            }}>
              <div style={{ width: 36, fontFamily: FONT_DISPLAY, fontSize: 20 }}>
                {["🥇", "🥈", "🥉"][i] ?? `#${i + 1}`}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  {p.name}
                  {isMe && <span style={{ fontSize: 11, color: C.accent, fontFamily: FONT_DISPLAY, letterSpacing: "0.08em" }}>YOU</span>}
                  {p.isHost && <span style={{ fontSize: 11, color: C.muted }}>👑</span>}
                </div>
                {p.lastCorrect !== undefined && (
                  <div style={{ fontSize: 12, color: p.lastCorrect ? C.success : C.error, marginTop: 2 }}>
                    {p.lastCorrect ? "✓ Got it" : "✗ Missed"}
                  </div>
                )}
              </div>
              {/* Score bar */}
              <div style={{ width: 100 }}>
                <div style={{ height: 5, background: C.border, borderRadius: 3, overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: `${players[0]?.score > 0 ? (p.score / players[0].score) * 100 : 0}%`,
                    background: i === 0 ? C.gold : isMe ? C.accent : C.cyan,
                    borderRadius: 3, transition: "width 1s ease",
                  }} />
                </div>
              </div>
              <div className="neon-cyan" style={{ fontFamily: FONT_DISPLAY, fontSize: 16, color: C.cyan, minWidth: 72, textAlign: "right" }}>
                {p.score.toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>

      {isHost ? (
        <div style={{ textAlign: "center" }}>
          <Btn size="lg" onClick={onNext}>
            {questionIndex + 1 >= totalQuestions ? "🏁 End Game" : "Next Question →"}
          </Btn>
        </div>
      ) : (
        <p style={{ textAlign: "center", color: C.muted, fontSize: 14 }}>Waiting for host to continue…</p>
      )}
    </div>
  </div>
);

// ─── RESULTS SCREEN ───────────────────────────────────────────────────────────

interface ResultsProps {
  players: Player[];
  quiz: Quiz;
  myId: string | null;
  onHome: () => void;
}

export const ResultsScreen: React.FC<ResultsProps> = ({ players, quiz, myId, onHome }) => {
  const winner   = players[0];
  const maxScore = winner?.score ?? 1;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, padding: 24 }} className="grid-bg">
      <div style={{ maxWidth: 660, margin: "0 auto" }}>
        <div style={{ textAlign: "center", paddingTop: 36, marginBottom: 44 }}>
          <Logo size={36} />
          <div className="neon-gold" style={{ fontFamily: FONT_DISPLAY, fontSize: 34, fontWeight: 900, color: C.gold, marginTop: 28, marginBottom: 8 }}>GAME OVER</div>
          <div style={{ fontSize: 15, color: C.muted }}>{quiz.title} · {quiz.questions.length} questions</div>
        </div>

        <Card glow="gold" style={{ textAlign: "center", marginBottom: 26, padding: 30 }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🏆</div>
          <div style={{ fontSize: 12, color: C.muted, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>Winner</div>
          <div className="neon-gold" style={{ fontFamily: FONT_DISPLAY, fontSize: 26, fontWeight: 900, color: C.gold }}>{winner?.name}</div>
          <div className="neon-cyan" style={{ fontFamily: FONT_DISPLAY, fontSize: 20, color: C.cyan, marginTop: 8 }}>{winner?.score?.toLocaleString()} pts</div>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 40 }}>
          {players.map((p, i) => {
            const isMe = p.id === myId;
            return (
              <div key={p.id} className="fade-up" style={{
                display: "flex", alignItems: "center", gap: 14, padding: "14px 18px",
                background: isMe ? C.accentDim : C.card,
                border: `1px solid ${isMe ? C.accent : C.border}`, borderRadius: 8,
                animationDelay: `${i * 0.06}s`,
              }}>
                <div style={{ width: 36, fontFamily: FONT_DISPLAY, fontSize: 18, color: [C.gold, "#C0C0C0", "#CD7F32"][i] ?? C.muted }}>
                  {["🥇", "🥈", "🥉"][i] ?? `#${i + 1}`}
                </div>
                <div style={{ flex: 1, fontWeight: 700, fontSize: 16 }}>
                  {p.name}
                  {isMe && <span style={{ marginLeft: 8, fontSize: 11, color: C.accent, fontFamily: FONT_DISPLAY }}>YOU</span>}
                </div>
                <div style={{ width: 120, marginRight: 10 }}>
                  <div style={{ height: 5, background: C.border, borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${maxScore > 0 ? (p.score / maxScore) * 100 : 0}%`, background: i === 0 ? C.gold : C.cyan, borderRadius: 3, transition: "width 1.2s ease" }} />
                  </div>
                </div>
                <div className="neon-cyan" style={{ fontFamily: FONT_DISPLAY, fontSize: 15, color: C.cyan, minWidth: 70, textAlign: "right" }}>
                  {p.score.toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: "center" }}>
          <Btn onClick={onHome} variant="ghost" size="lg">🏠 Home</Btn>
        </div>
      </div>
    </div>
  );
};

// ─── CONNECTION SCREEN ────────────────────────────────────────────────────────

export const ConnectingScreen: React.FC = () => (
  <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }} className="grid-bg">
    <div style={{ textAlign: "center" }}>
      <Logo size={48} />
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 14, color: C.muted, marginTop: 24, letterSpacing: "0.2em" }}>CONNECTING…</div>
      <div style={{ display: "inline-flex", gap: 7, marginTop: 16 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: C.cyan, animation: `ping 1.5s ease-in-out ${i * 0.25}s infinite` }} />
        ))}
      </div>
    </div>
  </div>
);

// ─── ERROR SCREEN ─────────────────────────────────────────────────────────────

export const ErrorScreen: React.FC<{ message: string; onBack: () => void }> = ({ message, onBack }) => (
  <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} className="grid-bg">
    <div style={{ textAlign: "center", maxWidth: 400 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, color: C.error, marginBottom: 12 }}>Connection Error</div>
      <div style={{ color: C.muted, fontSize: 15, marginBottom: 28 }}>{message}</div>
      <Btn onClick={onBack}>← Back to Home</Btn>
    </div>
  </div>
);
