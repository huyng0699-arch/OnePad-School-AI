import { mastery } from '../data/mockData';

type ProgressState = {
  quizAttempts: number;
  quizCorrect: number;
  masteryLevel: number;
};

export type LearningPathState = 'review' | 'continue' | 'challenge';

export type ProgressInsight = {
  masteryLevel: number;
  strengths: string[];
  weakAreas: string[];
  nextRecommendation: string;
  learningPathState: LearningPathState;
};

const progressState: ProgressState = {
  quizAttempts: 0,
  quizCorrect: 0,
  masteryLevel: mastery.level
};

function recalculateMastery(): void {
  if (progressState.quizAttempts === 0) {
    progressState.masteryLevel = mastery.level;
    return;
  }

  const accuracy = progressState.quizCorrect / progressState.quizAttempts;
  const boost = Math.round(accuracy * 20);
  progressState.masteryLevel = Math.min(100, mastery.level + boost);
}

export function recordQuizResult(isCorrect: boolean): void {
  progressState.quizAttempts += 1;
  if (isCorrect) {
    progressState.quizCorrect += 1;
  }
  recalculateMastery();
}

export function getProgressState(): ProgressState {
  return { ...progressState };
}

export function getProgressInsight(): ProgressInsight {
  const masteryLevel = progressState.masteryLevel;
  const strengths =
    masteryLevel >= 80
      ? ['Strong recall of lesson concepts', 'Accurate quiz performance']
      : ['Good lesson engagement', 'Consistent practice attempts'];
  const weakAreas =
    masteryLevel >= 80
      ? ['Advanced application questions']
      : ['Concept detail retention', 'Answer confidence under quiz timing'];
  const learningPathState: LearningPathState =
    masteryLevel >= 85 ? 'challenge' : masteryLevel >= 60 ? 'continue' : 'review';
  const nextRecommendation =
    learningPathState === 'challenge'
      ? 'Move to Advanced Challenge and then re-check mastery.'
      : learningPathState === 'continue'
        ? 'Continue lesson pages and run one quick quiz.'
        : 'Review key points and examples before the next quiz.';

  return {
    masteryLevel,
    strengths,
    weakAreas,
    nextRecommendation,
    learningPathState
  };
}
