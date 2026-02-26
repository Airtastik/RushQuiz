import React, { useState, useRef } from "react";
import type { Quiz, Question, QuestionType, MultipleChoiceQuestion, ShortAnswerQuestion, NumericQuestion } from "../types";
import { C, FONT_DISPLAY, FONT_BODY } from "../constants";
import { uid, downloadCsv, csvToQuiz } from "../utils";
import { Btn, Card, BackBtn, SectionHead, Field, Badge, QTypeIcon, Empty, Divider } from "../components/ui";

// ─── NEW/EDIT QUESTION MODAL ──────────────────────────────────────────────────

interface QuestionModalProps {
  initial?: Question;
  onSave: (q: Question) => void;
  onClose: () => void;
}

const QuestionModal: React.FC<QuestionModalProps> = ({ initial, onSave, onClose }) => {
  const [type, setType]     = useState<QuestionType>(initial?.type ?? "multiple_choice");
  const [text, setText]     = useState(initial?.text ?? "");
  const [points, setPoints] = useState(String(initial?.points ?? 100));
  const [time, setTime]     = useState(String(initial?.timeLimit ?? 15));

  // MC
  const [options, setOptions] = useState<string[]>(
    initial?.type === "multiple_choice" ? initial.options : ["", "", "", ""]
  );
  const [correctIdx, setCorrectIdx] = useState<number>(
    initial?.type === "multiple_choice" ? initial.correctIndex : 0
  );

  // SA
  const [correctAnswer, setCorrectAnswer] = useState(
    initial?.type === "short_answer" ? initial.correctAnswer : ""
  );
  const [accepted, setAccepted] = useState(
    initial?.type === "short_answer" ? initial.acceptedAnswers.join(", ") : ""
  );

  // Numeric
  const [numAnswer, setNumAnswer] = useState(
    initial?.type === "numeric" ? String(initial.correctAnswer) : ""
  );
  const [tolerance, setTolerance] = useState(
    initial?.type === "numeric" ? String(initial.tolerance) : "0"
  );
  const [unit, setUnit] = useState(
    initial?.type === "numeric" ? (initial.unit ?? "") : ""
  );

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: 6,
    background: C.surface, border: `1px solid ${C.border}`, color: C.text,
    fontFamily: FONT_BODY, fontSize: 15,
  };

  function handleSave() {
    if (!text.trim()) return;
    const base = { id: initial?.id ?? uid(), text: text.trim(), points: Number(points) || 100, timeLimit: Number(time) || 15 };
    let q: Question;

    if (type === "multiple_choice") {
      q = { ...base, type, options, correctIndex: correctIdx };
    } else if (type === "short_answer") {
      q = {
        ...base, type,
        correctAnswer: correctAnswer.trim().toLowerCase(),
        acceptedAnswers: accepted.split(",").map(s => s.trim().toLowerCase()).filter(Boolean),
      };
    } else {
      q = {
        ...base, type,
        correctAnswer: Number(numAnswer) || 0,
        tolerance: Number(tolerance) || 0,
        unit: unit.trim() || undefined,
      };
    }
    onSave(q);
  }

  const TYPE_OPTIONS: { value: QuestionType; label: string; icon: string; desc: string }[] = [
    { value: "multiple_choice", label: "Multiple Choice", icon: "⊞", desc: "4 options, one correct" },
    { value: "short_answer",    label: "Short Answer",    icon: "✎", desc: "Type the answer" },
    { value: "numeric",         label: "Numeric",         icon: "#", desc: "Enter a number" },
  ];

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(7,7,16,0.85)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      backdropFilter: "blur(6px)",
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
        width: "100%", maxWidth: 580, maxHeight: "90vh", overflow: "auto",
        padding: 28,
      }}
        className="fade-up"
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 18 }}>
            {initial ? "Edit Question" : "Add Question"}
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.muted, fontSize: 22, lineHeight: 1 }}>×</button>
        </div>

        {/* Type selector */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 22 }}>
          {TYPE_OPTIONS.map(opt => (
            <div key={opt.value} onClick={() => setType(opt.value)} style={{
              padding: "12px 10px", borderRadius: 7, textAlign: "center",
              background: type === opt.value ? `${C.accent}18` : C.surface,
              border: `2px solid ${type === opt.value ? C.accent : C.border}`,
              cursor: "pointer", transition: "all 0.18s",
            }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{opt.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: type === opt.value ? C.accent : C.text }}>{opt.label}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{opt.desc}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Question text */}
          <Field label="Question Text" required>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
              placeholder="Enter your question here…"
            />
          </Field>

          {/* MC options */}
          {type === "multiple_choice" && (
            <Field label="Answer Options">
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {options.map((opt, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      onClick={() => setCorrectIdx(i)}
                      title="Mark as correct"
                      style={{
                        width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                        background: correctIdx === i ? C.success : "transparent",
                        border: `2px solid ${correctIdx === i ? C.success : C.border}`,
                        cursor: "pointer", transition: "all 0.15s",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: C.bg, fontSize: 12, fontWeight: 900,
                      }}
                    >{correctIdx === i ? "✓" : ""}</div>
                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontFamily: FONT_DISPLAY, fontSize: 11, color: C.muted, width: 16 }}>
                        {["A","B","C","D"][i]}
                      </span>
                      <input
                        style={{ ...inputStyle, flex: 1 }}
                        placeholder={`Option ${["A","B","C","D"][i]}`}
                        value={opt}
                        onChange={e => setOptions(ops => ops.map((o, j) => j === i ? e.target.value : o))}
                      />
                    </div>
                  </div>
                ))}
                <p style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Click the circle to mark the correct answer</p>
              </div>
            </Field>
          )}

          {/* Short answer */}
          {type === "short_answer" && (
            <>
              <Field label="Correct Answer" required hint="Case-insensitive match">
                <input style={inputStyle} value={correctAnswer} onChange={e => setCorrectAnswer(e.target.value)} placeholder="e.g. paris" />
              </Field>
              <Field label="Also Accept" hint="Comma-separated variants (optional)">
                <input style={inputStyle} value={accepted} onChange={e => setAccepted(e.target.value)} placeholder="e.g. paris france, the city of light" />
              </Field>
            </>
          )}

          {/* Numeric */}
          {type === "numeric" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <Field label="Correct Answer" required>
                  <input type="number" style={inputStyle} value={numAnswer} onChange={e => setNumAnswer(e.target.value)} placeholder="42" />
                </Field>
                <Field label="Tolerance ±" hint="0 = exact">
                  <input type="number" style={inputStyle} value={tolerance} onChange={e => setTolerance(e.target.value)} placeholder="0" min="0" />
                </Field>
                <Field label="Unit (optional)">
                  <input style={inputStyle} value={unit} onChange={e => setUnit(e.target.value)} placeholder="km, °C…" />
                </Field>
              </div>
            </>
          )}

          <Divider />

          {/* Points & time */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Points" required>
              <input type="number" style={inputStyle} value={points} onChange={e => setPoints(e.target.value)} min="10" step="10" />
            </Field>
            <Field label="Time Limit (seconds)" required>
              <input type="number" style={inputStyle} value={time} onChange={e => setTime(e.target.value)} min="5" max="120" />
            </Field>
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
            <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
            <Btn onClick={handleSave} disabled={!text.trim()}>
              {initial ? "Update Question" : "Add Question"}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── QUIZ EDITOR SCREEN ───────────────────────────────────────────────────────

interface QuizEditorProps {
  initial?: Quiz;
  onBack: () => void;
  onSave: (quiz: Quiz) => void;
}

export const QuizEditor: React.FC<QuizEditorProps> = ({ initial, onBack, onSave }) => {
  const [title, setTitle]       = useState(initial?.title ?? "");
  const [desc, setDesc]         = useState(initial?.description ?? "");
  const [questions, setQuestions] = useState<Question[]>(initial?.questions ?? []);
  const [showModal, setShowModal] = useState(false);
  const [editingQ, setEditingQ]   = useState<Question | undefined>();
  const [reordering, setReordering] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function addOrUpdateQuestion(q: Question) {
    setQuestions(qs => {
      const idx = qs.findIndex(x => x.id === q.id);
      if (idx >= 0) return qs.map((x, i) => i === idx ? q : x);
      return [...qs, q];
    });
    setShowModal(false);
    setEditingQ(undefined);
  }

  function deleteQuestion(id: string) {
    setQuestions(qs => qs.filter(q => q.id !== id));
  }

  function moveQuestion(idx: number, dir: -1 | 1) {
    setQuestions(qs => {
      const arr = [...qs];
      const swap = idx + dir;
      if (swap < 0 || swap >= arr.length) return arr;
      [arr[idx], arr[swap]] = [arr[swap], arr[idx]];
      return arr;
    });
  }

  function handleSave() {
    if (!title.trim()) return;
    const quiz: Quiz = {
      id: initial?.id ?? uid(),
      title: title.trim(),
      description: desc.trim(),
      createdAt: initial?.createdAt ?? new Date().toISOString().split("T")[0],
      questions,
    };
    onSave(quiz);
  }

  function handleExportCsv() {
    const quiz: Quiz = {
      id: initial?.id ?? uid(),
      title: title || "Untitled Quiz",
      description: desc,
      createdAt: initial?.createdAt ?? new Date().toISOString().split("T")[0],
      questions,
    };
    downloadCsv(quiz);
  }

  function handleImportCsv(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      const imported = csvToQuiz(text);
      if (!imported) { alert("Could not parse CSV. Please use a RUSH Quiz CSV file."); return; }
      if (!title) setTitle(imported.title);
      if (!desc)  setDesc(imported.description);
      setQuestions(qs => [...qs, ...imported.questions]);
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  const totalPts = questions.reduce((s, q) => s + q.points, 0);

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "11px 14px", borderRadius: 6,
    background: C.surface, border: `1px solid ${C.border}`, color: C.text,
    fontFamily: FONT_BODY, fontSize: 15,
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, padding: 24 }} className="grid-bg">
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <BackBtn onClick={onBack} />

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <SectionHead
            title={initial ? "Edit Quiz" : "Create Quiz"}
            sub="Build your question set then export as CSV or save to library."
          />
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input ref={fileRef} type="file" accept=".csv" style={{ display: "none" }} onChange={handleImportCsv} />
            <Btn variant="ghost" size="sm" onClick={() => fileRef.current?.click()}>📂 Import CSV</Btn>
            <Btn variant="ghost" size="sm" onClick={handleExportCsv} disabled={questions.length === 0}>⬇ Export CSV</Btn>
            <Btn size="sm" onClick={handleSave} disabled={!title.trim() || questions.length === 0}>💾 Save Quiz</Btn>
          </div>
        </div>

        {/* Quiz meta */}
        <Card style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="Quiz Title" required>
              <input style={inputStyle} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Ultimate Tech Trivia" />
            </Field>
            <Field label="Description">
              <input style={inputStyle} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Short description for players…" />
            </Field>
          </div>

          {questions.length > 0 && (
            <div style={{ display: "flex", gap: 16, marginTop: 18, flexWrap: "wrap" }}>
              {[
                { label: "Questions",       val: questions.length },
                { label: "Total Points",    val: totalPts },
                { label: "MC",              val: questions.filter(q => q.type === "multiple_choice").length },
                { label: "Short Answer",    val: questions.filter(q => q.type === "short_answer").length },
                { label: "Numeric",         val: questions.filter(q => q.type === "numeric").length },
              ].map(({ label, val }) => (
                <div key={label} style={{ textAlign: "center", padding: "10px 16px", background: C.surface, borderRadius: 7, flex: "0 0 auto" }}>
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 700, color: C.cyan }}>{val}</div>
                  <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Question list header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 15, color: C.muted }}>
            Questions ({questions.length})
          </h3>
          <div style={{ display: "flex", gap: 10 }}>
            {questions.length > 1 && (
              <Btn variant="ghost" size="xs" onClick={() => setReordering(r => !r)}>
                {reordering ? "Done" : "↕ Reorder"}
              </Btn>
            )}
            <Btn size="sm" onClick={() => { setEditingQ(undefined); setShowModal(true); }}>
              + Add Question
            </Btn>
          </div>
        </div>

        {/* Question list */}
        {questions.length === 0 ? (
          <Empty icon="❓" title="No questions yet" sub='Click "Add Question" to get started.' />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {questions.map((q, idx) => (
              <QuestionRow
                key={q.id}
                question={q}
                index={idx}
                total={questions.length}
                reordering={reordering}
                onEdit={() => { setEditingQ(q); setShowModal(true); }}
                onDelete={() => deleteQuestion(q.id)}
                onMove={dir => moveQuestion(idx, dir)}
              />
            ))}
          </div>
        )}

        {questions.length > 0 && (
          <div style={{ marginTop: 28, display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <Btn variant="ghost" onClick={handleExportCsv}>⬇ Export CSV</Btn>
            <Btn onClick={handleSave} disabled={!title.trim()}>💾 Save to Library</Btn>
          </div>
        )}
      </div>

      {showModal && (
        <QuestionModal
          initial={editingQ}
          onSave={addOrUpdateQuestion}
          onClose={() => { setShowModal(false); setEditingQ(undefined); }}
        />
      )}
    </div>
  );
};

// ─── QUESTION ROW ─────────────────────────────────────────────────────────────

interface QuestionRowProps {
  question: Question;
  index: number;
  total: number;
  reordering: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onMove: (dir: -1 | 1) => void;
}

const QuestionRow: React.FC<QuestionRowProps> = ({ question, index, total, reordering, onEdit, onDelete, onMove }) => {
  const [expanded, setExpanded] = useState(false);

  function getPreview(): string {
    if (question.type === "multiple_choice") {
      const mc = question as MultipleChoiceQuestion;
      return `✓ ${mc.options[mc.correctIndex]}`;
    }
    if (question.type === "short_answer") {
      const sa = question as ShortAnswerQuestion;
      return `Answer: "${sa.correctAnswer}"`;
    }
    if (question.type === "numeric") {
      const nq = question as NumericQuestion;
      return `Answer: ${nq.correctAnswer}${nq.unit ? ` ${nq.unit}` : ""}${nq.tolerance ? ` ±${nq.tolerance}` : ""}`;
    }
    return "";
  }

  return (
    <div className="fade-up" style={{
      background: C.card, border: `1px solid ${C.border}`, borderRadius: 8,
      overflow: "hidden", transition: "border-color 0.2s",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
        cursor: "pointer",
      }} onClick={() => !reordering && setExpanded(e => !e)}>
        {reordering ? (
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={e => { e.stopPropagation(); onMove(-1); }} disabled={index === 0}
              style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 4, color: C.muted, padding: "2px 7px", fontSize: 14, opacity: index === 0 ? 0.3 : 1 }}>↑</button>
            <button onClick={e => { e.stopPropagation(); onMove(1); }} disabled={index === total - 1}
              style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 4, color: C.muted, padding: "2px 7px", fontSize: 14, opacity: index === total - 1 ? 0.3 : 1 }}>↓</button>
          </div>
        ) : (
          <span style={{ fontFamily: FONT_DISPLAY, fontSize: 12, color: C.muted, width: 22, textAlign: "center" }}>
            {index + 1}
          </span>
        )}

        <QTypeIcon type={question.type} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {question.text}
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{getPreview()}</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <Badge color={C.cyan}>{question.points}pt</Badge>
          <Badge color={C.muted}>{question.timeLimit}s</Badge>

          {!reordering && (
            <>
              <button onClick={e => { e.stopPropagation(); onEdit(); }} title="Edit"
                style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 5, color: C.muted, padding: "5px 9px", fontSize: 13, transition: "all 0.15s" }}>✏</button>
              <button onClick={e => { e.stopPropagation(); onDelete(); }} title="Delete"
                style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 5, color: C.error, padding: "5px 9px", fontSize: 13, transition: "all 0.15s" }}>✕</button>
            </>
          )}
          {!reordering && <span style={{ color: C.muted, fontSize: 12 }}>{expanded ? "▲" : "▼"}</span>}
        </div>
      </div>

      {expanded && !reordering && (
        <div style={{ borderTop: `1px solid ${C.border}`, padding: "14px 16px", background: C.surface }}>
          <QuestionDetail question={question} />
        </div>
      )}
    </div>
  );
};

// ─── QUESTION DETAIL ──────────────────────────────────────────────────────────

const QuestionDetail: React.FC<{ question: Question }> = ({ question }) => {
  if (question.type === "multiple_choice") {
    const mc = question as MultipleChoiceQuestion;
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {mc.options.map((opt, i) => (
          <div key={i} style={{
            padding: "8px 12px", borderRadius: 6, fontSize: 14,
            background: i === mc.correctIndex ? `${C.success}15` : C.card,
            border: `1px solid ${i === mc.correctIndex ? C.success : C.border}`,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ fontFamily: FONT_DISPLAY, fontSize: 11, color: C.muted }}>
              {["A","B","C","D"][i]}
            </span>
            {opt || <span style={{ color: C.muted, fontStyle: "italic" }}>empty</span>}
            {i === mc.correctIndex && <span style={{ marginLeft: "auto", color: C.success, fontSize: 12 }}>✓ Correct</span>}
          </div>
        ))}
      </div>
    );
  }
  if (question.type === "short_answer") {
    const sa = question as ShortAnswerQuestion;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14 }}>
        <div style={{ color: C.success }}>✓ Correct: <strong>{sa.correctAnswer}</strong></div>
        {sa.acceptedAnswers.length > 0 && (
          <div style={{ color: C.muted }}>Also accepted: {sa.acceptedAnswers.join(", ")}</div>
        )}
      </div>
    );
  }
  if (question.type === "numeric") {
    const nq = question as NumericQuestion;
    return (
      <div style={{ fontSize: 14, color: C.success }}>
        ✓ Answer: <strong>{nq.correctAnswer}{nq.unit ? ` ${nq.unit}` : ""}</strong>
        {nq.tolerance > 0 && <span style={{ color: C.muted }}> (±{nq.tolerance})</span>}
      </div>
    );
  }
  return null;
};
