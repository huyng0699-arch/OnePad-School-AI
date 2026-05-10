type ParsedBatchResult = {
  questionId: string;
  isCorrect: boolean;
  score: 0 | 0.5 | 1;
  feedback: string;
  correctedAnswer: string;
  masterySignal: 'understood' | 'partially_understood' | 'needs_review';
};

type ParsedBatchPayload = {
  results: ParsedBatchResult[];
  overallFeedback: string;
  recommendedReview: string[];
};

export function parseAiBatchGrading(rawText: string):
  | { ok: true; payload: ParsedBatchPayload }
  | { ok: false; error: string } {
  const jsonText = unwrapJson(rawText);
  try {
    const parsed = JSON.parse(jsonText) as {
      results?: Array<Partial<ParsedBatchResult>>;
      overallFeedback?: string;
      recommendedReview?: string[];
    };
    if (!Array.isArray(parsed.results)) {
      return { ok: false, error: 'AI grading response is missing results.' };
    }

    const results = parsed.results
      .map((item, index): ParsedBatchResult | null => {
        if (!item.questionId) {
          return null;
        }
        const score = normalizeScore(item.score);
        return {
          questionId: item.questionId,
          isCorrect: Boolean(item.isCorrect ?? score >= 0.7),
          score,
          feedback: typeof item.feedback === 'string' && item.feedback.trim().length > 0
            ? item.feedback.trim()
            : 'Your answer needs a bit more detail.',
          correctedAnswer: typeof item.correctedAnswer === 'string' && item.correctedAnswer.trim().length > 0
            ? item.correctedAnswer.trim()
            : 'Please review the key idea from the lesson and try again.',
          masterySignal: normalizeSignal(item.masterySignal)
        };
      })
      .filter((item): item is ParsedBatchResult => item !== null);

    if (results.length === 0) {
      return { ok: false, error: 'AI grading response does not contain valid question results.' };
    }

    return {
      ok: true,
      payload: {
        results,
        overallFeedback: typeof parsed.overallFeedback === 'string' ? parsed.overallFeedback : '',
        recommendedReview: Array.isArray(parsed.recommendedReview) ? parsed.recommendedReview : []
      }
    };
  } catch {
    return { ok: false, error: 'AI grading response is not valid JSON.' };
  }
}

function unwrapJson(rawText: string): string {
  const trimmed = rawText.trim();
  if (trimmed.startsWith('```')) {
    const cleaned = trimmed
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '');
    return cleaned.trim();
  }
  return trimmed;
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

function normalizeSignal(value: unknown): 'understood' | 'partially_understood' | 'needs_review' {
  if (value === 'understood' || value === 'needs_review' || value === 'partially_understood') {
    return value;
  }
  if (value === 'partial') {
    return 'partially_understood';
  }
  return 'needs_review';
}

