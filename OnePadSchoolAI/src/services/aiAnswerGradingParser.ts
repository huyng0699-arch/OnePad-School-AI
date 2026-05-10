export type ParsedAnswerGrading = {
  isCorrect: boolean;
  score: 0 | 0.5 | 1;
  feedback: string;
  correctedAnswer: string;
  masterySignal: 'understood' | 'partial' | 'needs_review';
};

type ParseSuccess = { ok: true; result: ParsedAnswerGrading };
type ParseFailure = { ok: false; error: string };

type RawGrading = {
  isCorrect?: unknown;
  score?: unknown;
  feedback?: unknown;
  correctedAnswer?: unknown;
  masterySignal?: unknown;
};

export function parseAiAnswerGrading(rawText: string): ParseSuccess | ParseFailure {
  const cleaned = stripMarkdownCodeFence(rawText).trim();
  if (!cleaned) {
    return { ok: false, error: 'AI grading response is empty.' };
  }

  try {
    const parsed = JSON.parse(cleaned) as RawGrading;
    if (typeof parsed.isCorrect !== 'boolean') {
      return { ok: false, error: 'AI grading JSON is missing isCorrect.' };
    }

    const score = normalizeScore(parsed.score);
    const feedback = typeof parsed.feedback === 'string' && parsed.feedback.trim()
      ? parsed.feedback
      : 'The answer was graded, but feedback was limited.';
    const correctedAnswer = typeof parsed.correctedAnswer === 'string' && parsed.correctedAnswer.trim()
      ? parsed.correctedAnswer
      : 'Review the lesson context and improve key terms.';
    const masterySignal = normalizeMasterySignal(parsed.masterySignal);

    return {
      ok: true,
      result: {
        isCorrect: parsed.isCorrect,
        score,
        feedback,
        correctedAnswer,
        masterySignal
      }
    };
  } catch {
    return { ok: false, error: 'AI grading JSON parsing failed.' };
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

function normalizeScore(value: unknown): 0 | 0.5 | 1 {
  if (value === 1 || value === '1') {
    return 1;
  }
  if (value === 0.5 || value === '0.5') {
    return 0.5;
  }
  return 0;
}

function normalizeMasterySignal(value: unknown): 'understood' | 'partial' | 'needs_review' {
  if (value === 'understood' || value === 'partial') {
    return value;
  }
  return 'needs_review';
}
