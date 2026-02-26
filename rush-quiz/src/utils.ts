import type { Question, Quiz, CsvRow, MultipleChoiceQuestion, ShortAnswerQuestion, NumericQuestion } from "./types";

// ─── ID GENERATION ────────────────────────────────────────────────────────────

export function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// ─── BOT PLAYERS ─────────────────────────────────────────────────────────────

const BOT_NAMES = [
  "QuizWizard", "TriviaMaster", "BrainiacX", "NightOwl",
  "FastFingers", "TheQuizzer", "MindBender", "Speedster",
  "AcePlayer", "NovaMind",
];

export function generateBots(count = 4) {
  return BOT_NAMES.slice(0, count).map((name, i) => ({
    id: `bot-${i}`,
    name,
    score: 0,
    isBot: true as const,
  }));
}

// ─── ANSWER CHECKING ─────────────────────────────────────────────────────────

export function checkAnswer(question: Question, userAnswer: string | number): boolean {
  if (question.type === "multiple_choice") {
    return Number(userAnswer) === question.correctIndex;
  }
  if (question.type === "short_answer") {
    const norm = String(userAnswer).trim().toLowerCase();
    const correct = question.correctAnswer.trim().toLowerCase();
    if (norm === correct) return true;
    return question.acceptedAnswers.some(a => norm === a.trim().toLowerCase());
  }
  if (question.type === "numeric") {
    const val = Number(userAnswer);
    return !isNaN(val) && Math.abs(val - question.correctAnswer) <= question.tolerance;
  }
  return false;
}

// ─── CSV EXPORT ───────────────────────────────────────────────────────────────

const CSV_HEADERS: (keyof CsvRow)[] = [
  "id", "type", "text", "points", "timeLimit",
  "option_a", "option_b", "option_c", "option_d", "correctIndex",
  "correctAnswer", "acceptedAnswers", "tolerance", "unit",
];

function escapeCsv(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return "";
  const s = String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function questionToCsvRow(q: Question): CsvRow {
  const base: CsvRow = {
    id: q.id,
    type: q.type,
    text: q.text,
    points: q.points,
    timeLimit: q.timeLimit,
  };

  if (q.type === "multiple_choice") {
    const mc = q as MultipleChoiceQuestion;
    return {
      ...base,
      option_a: mc.options[0],
      option_b: mc.options[1],
      option_c: mc.options[2],
      option_d: mc.options[3],
      correctIndex: mc.correctIndex,
    };
  }
  if (q.type === "short_answer") {
    const sa = q as ShortAnswerQuestion;
    return {
      ...base,
      correctAnswer: sa.correctAnswer,
      acceptedAnswers: sa.acceptedAnswers.join("|"),
    };
  }
  if (q.type === "numeric") {
    const nq = q as NumericQuestion;
    return {
      ...base,
      correctAnswer: String(nq.correctAnswer),
      tolerance: nq.tolerance,
      unit: nq.unit ?? "",
    };
  }
  return base;
}

export function quizToCsv(quiz: Quiz): string {
  const meta = [
    `# RUSH Quiz Export`,
    `# Title: ${quiz.title}`,
    `# Description: ${quiz.description}`,
    `# ID: ${quiz.id}`,
    `# Created: ${quiz.createdAt}`,
    `# Questions: ${quiz.questions.length}`,
    ``,
  ].join("\n");

  const header = CSV_HEADERS.join(",");

  const rows = quiz.questions.map(q => {
    const row = questionToCsvRow(q);
    return CSV_HEADERS.map(h => escapeCsv(row[h] as string | number | undefined)).join(",");
  });

  return meta + header + "\n" + rows.join("\n");
}

export function downloadCsv(quiz: Quiz): void {
  const csv = quizToCsv(quiz);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${quiz.title.replace(/\s+/g, "_")}_rush_quiz.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── CSV IMPORT ───────────────────────────────────────────────────────────────

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === "," && !inQuotes) {
      result.push(current); current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

export function csvToQuiz(csvText: string): Quiz | null {
  try {
    const lines = csvText.split("\n").map(l => l.trim());
    const metaLines = lines.filter(l => l.startsWith("#"));
    const dataLines = lines.filter(l => l && !l.startsWith("#"));

    const titleLine = metaLines.find(l => l.includes("Title:"));
    const descLine  = metaLines.find(l => l.includes("Description:"));
    const idLine    = metaLines.find(l => l.includes("ID:"));

    const title       = titleLine  ? titleLine.replace(/^#\s*Title:\s*/,       "").trim() : "Imported Quiz";
    const description = descLine   ? descLine.replace(/^#\s*Description:\s*/,  "").trim() : "";
    const id          = idLine     ? idLine.replace(/^#\s*ID:\s*/,             "").trim() : uid();

    if (dataLines.length < 2) return null;

    const headers = parseCsvLine(dataLines[0]) as (keyof CsvRow)[];
    const questions: Question[] = [];

    for (let i = 1; i < dataLines.length; i++) {
      const vals = parseCsvLine(dataLines[i]);
      const row: Partial<CsvRow> = {};
      headers.forEach((h, idx) => { (row as Record<string, string | number>)[h] = vals[idx] ?? ""; });

      const type = row.type as string;
      const base = {
        id: row.id as string || uid(),
        text: row.text as string || "",
        points: Number(row.points) || 100,
        timeLimit: Number(row.timeLimit) || 15,
      };

      if (type === "multiple_choice") {
        questions.push({
          ...base,
          type: "multiple_choice",
          options: [
            row.option_a as string || "",
            row.option_b as string || "",
            row.option_c as string || "",
            row.option_d as string || "",
          ],
          correctIndex: Number(row.correctIndex) || 0,
        });
      } else if (type === "short_answer") {
        questions.push({
          ...base,
          type: "short_answer",
          correctAnswer: row.correctAnswer as string || "",
          acceptedAnswers: row.acceptedAnswers
            ? String(row.acceptedAnswers).split("|").filter(Boolean)
            : [],
        });
      } else if (type === "numeric") {
        questions.push({
          ...base,
          type: "numeric",
          correctAnswer: Number(row.correctAnswer) || 0,
          tolerance: Number(row.tolerance) || 0,
          unit: row.unit as string || undefined,
        });
      }
    }

    return { id, title, description, createdAt: new Date().toISOString().split("T")[0], questions };
  } catch {
    return null;
  }
}

// ─── TIME FORMAT ─────────────────────────────────────────────────────────────

export function fmtTime(s: number): string {
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m${s % 60 ? `${s % 60}s` : ""}`;
}
