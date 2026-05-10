export type ParsedQuizQuestion = {
  id: string;
  type: 'multiple_choice' | 'short_answer' | 'spoken_answer';
  question: string;
  options?: string[];
  correctAnswer?: string;
  expectedAnswer?: string;
  rubric?: string;
  explanation: string;
  difficulty: 'basic' | 'standard' | 'advanced';
  sourcePage?: number;
};

type QuizParseSuccess = {
  ok: true;
  questions: ParsedQuizQuestion[];
};

type QuizParseFailure = {
  ok: false;
  error: string;
};

type RawQuizPayload = {
  questions?: Array<{
    id?: string;
    type?: string;
    question?: string;
    options?: unknown;
    correctAnswer?: string;
    expectedAnswer?: string;
    rubric?: string;
    explanation?: string;
    difficulty?: string;
    sourcePage?: number;
  }>;
};

type RawQuizQuestion = NonNullable<RawQuizPayload['questions']>[number];

export function parseAiQuizResponse(rawText: string): QuizParseSuccess | QuizParseFailure {
  const cleaned = extractJsonObject(stripMarkdownCodeFence(rawText).trim());
  if (!cleaned) {
    return { ok: false, error: 'AI quiz response is empty.' };
  }

  try {
    const payload = JSON.parse(cleaned) as RawQuizPayload;
    if (!Array.isArray(payload.questions)) {
      return { ok: false, error: 'AI quiz JSON is invalid: missing questions array.' };
    }

    const normalized = payload.questions
      .map((item, index) => normalizeQuestion(item, index))
      .filter((item): item is ParsedQuizQuestion => item !== null);

    return { ok: true, questions: normalized };
  } catch {
    return { ok: false, error: 'AI quiz JSON parsing failed.' };
  }
}

function stripMarkdownCodeFence(text: string): string {
  const trimmed = text.trim();
  if (!trimmed.startsWith('```')) {
    return trimmed;
  }

  return trimmed
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

function extractJsonObject(text: string): string {
  const trimmed = text.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    return trimmed;
  }

  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start >= 0 && end > start) {
    return trimmed.slice(start, end + 1).trim();
  }
  return trimmed;
}

function normalizeQuestion(item: RawQuizQuestion, index: number): ParsedQuizQuestion | null {
  const question = item.question?.trim();
  if (!question) {
    return null;
  }

  const difficulty = normalizeDifficulty(item.difficulty);
  const id = item.id?.trim() ? item.id : `q${index + 1}`;
  const sourcePage = typeof item.sourcePage === 'number' ? item.sourcePage : undefined;

  const rawType = item.type?.trim();
  if (rawType === 'short_answer' || rawType === 'spoken_answer') {
    const expectedAnswer = item.expectedAnswer?.trim();
    const rubric = item.rubric?.trim();
    if (!expectedAnswer && !rubric) {
      return null;
    }

    return {
      id,
      type: rawType,
      question,
      expectedAnswer,
      rubric,
      explanation: item.explanation?.trim() ? item.explanation : 'Review the key idea and try again with clearer terms.',
      difficulty,
      sourcePage
    };
  }

  const options = Array.isArray(item.options)
    ? item.options.filter((option: unknown): option is string => typeof option === 'string')
    : [];
  if (options.length < 2) {
    return null;
  }

  const correctAnswer = item.correctAnswer?.trim() ?? '';
  if (!options.includes(correctAnswer)) {
    return null;
  }

  return {
    id,
    type: 'multiple_choice',
    question,
    options,
    correctAnswer,
    explanation: item.explanation?.trim() ? item.explanation : 'Review the question and compare each option with the lesson context.',
    difficulty,
    sourcePage
  };
}

function normalizeDifficulty(input?: string): 'basic' | 'standard' | 'advanced' {
  if (input === 'standard' || input === 'advanced') {
    return input;
  }
  return 'basic';
}
