export type StructuredLesson = {
  id: string;
  title: string;
  subject: string;
  grade: string;
  language: "en" | "vi" | "bilingual";
  estimatedMinutes: number;
  learningObjectives: string[];
  pages: LessonPage[];
  quizSeeds: QuizSeed[];
  teacherGuide: TeacherGuide;
  adaptiveVersions: {
    foundation: string;
    standard: string;
    advanced: string;
  };
};

type LessonPage = {
  pageNumber: number;
  title: string;
  blocks: LessonBlock[];
  aiText: string;
};

type LessonBlock = {
  id: string;
  type: "heading" | "paragraph" | "key_concept" | "example" | "check_your_understanding" | "image_prompt" | "ar_model" | "quiz_seed" | "summary";
  text: string;
  aiText?: string;
};

type QuizSeed = {
  id: string;
  type: "multiple_choice" | "short_answer" | "spoken_answer";
  question: string;
  options?: string[];
  correctAnswer?: string;
  expectedAnswer?: string;
  explanation: string;
  difficulty: "foundation" | "standard" | "advanced";
  skillTag: string;
};

type TeacherGuide = {
  lessonOverview: string;
  keyMisconceptions: string[];
  teachingSteps: string[];
  discussionPrompts: string[];
  differentiationTips: {
    foundation: string;
    standard: string;
    advanced: string;
  };
  assessmentRubric: {
    criterion: string;
    excellent: string;
    developing: string;
    needsSupport: string;
  }[];
};

const BLOCK_TYPES = new Set(["heading", "paragraph", "key_concept", "example", "check_your_understanding", "image_prompt", "ar_model", "quiz_seed", "summary"]);
const QUIZ_TYPES = new Set(["multiple_choice", "short_answer", "spoken_answer"]);
const DIFFICULTIES = new Set(["foundation", "standard", "advanced"]);

export function tryParseStructuredLesson(input: string): { ok: true; lesson: StructuredLesson } | { ok: false; error: string } {
  const parsed = parseJsonFromAnyText(input);
  if (!parsed) return { ok: false, error: "AI did not return valid StructuredLesson JSON." };

  const err = validateStructuredLesson(parsed);
  if (err) return { ok: false, error: err };

  return { ok: true, lesson: parsed as StructuredLesson };
}

function parseJsonFromAnyText(input: string): unknown | null {
  const trimmed = input.trim();
  const raw = trimmed.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();

  try {
    return JSON.parse(raw);
  } catch {
    const first = raw.indexOf("{");
    const last = raw.lastIndexOf("}");
    if (first >= 0 && last > first) {
      const candidate = raw.slice(first, last + 1);
      try {
        return JSON.parse(candidate);
      } catch {
        return null;
      }
    }
    return null;
  }
}

function validateStructuredLesson(lesson: any): string | null {
  if (!lesson || typeof lesson !== "object") return "StructuredLesson must be an object.";
  if (!lesson.title || typeof lesson.title !== "string") return "StructuredLesson title is required.";
  if (!Array.isArray(lesson.pages) || lesson.pages.length === 0) return "StructuredLesson pages are required.";

  for (const page of lesson.pages) {
    if (!page || typeof page !== "object") return "Invalid page object.";
    if (typeof page.aiText !== "string" || !page.aiText.trim()) return "Each page must include aiText.";
    if (!Array.isArray(page.blocks) || page.blocks.length === 0) return "Each page must include blocks.";
    for (const block of page.blocks) {
      if (!BLOCK_TYPES.has(block?.type)) return "Invalid lesson block type.";
      if (typeof block?.text !== "string" || !block.text.trim()) return "Each block must include text.";
    }
  }

  if (!Array.isArray(lesson.quizSeeds)) return "quizSeeds must be an array.";
  for (const seed of lesson.quizSeeds) {
    if (!QUIZ_TYPES.has(seed?.type)) return "Invalid quiz seed type.";
    if (!DIFFICULTIES.has(seed?.difficulty)) return "Invalid quiz seed difficulty.";
    if (typeof seed?.question !== "string" || typeof seed?.explanation !== "string") return "Quiz seed question and explanation are required.";
  }

  return null;
}
