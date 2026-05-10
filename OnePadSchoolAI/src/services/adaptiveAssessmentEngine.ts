import type { QuizMode } from '../types';

export type HiddenSkillLevel = 'foundation' | 'developing' | 'proficient' | 'advanced';
export type AdaptiveDifficulty = 'basic' | 'standard' | 'advanced' | 'challenge';

export type HiddenAssessmentState = {
  hiddenScore: number;
  skillLevel: HiddenSkillLevel;
  nextDifficulty: AdaptiveDifficulty;
  recommendedMode: QuizMode;
  recommendedQuestionMix: {
    multipleChoice: number;
    shortAnswer: number;
    spokenAnswer: number;
  };
  lastAccuracy: number;
  streakCorrect: number;
  streakNeedsReview: number;
};

export type AdaptiveUpdateInput = {
  totalQuestions: number;
  totalScore: number;
  percentage: number;
  shortAnswerAverageScore: number;
  numberOfNeedsReview: number;
  numberOfCorrect: number;
  quizMode: QuizMode;
  currentDifficulty: AdaptiveDifficulty;
};

export type AdaptiveQuizPlan = {
  mode: QuizMode;
  difficulty: AdaptiveDifficulty;
  questionCount: number;
  questionMix: HiddenAssessmentState['recommendedQuestionMix'];
  studentFacingLabel: string;
  studentFacingMessage: string;
  promptInstruction: string;
};

let hiddenState: HiddenAssessmentState = {
  hiddenScore: 58,
  skillLevel: 'developing',
  nextDifficulty: 'standard',
  recommendedMode: 'quick',
  recommendedQuestionMix: { multipleChoice: 8, shortAnswer: 2, spokenAnswer: 0 },
  lastAccuracy: 0,
  streakCorrect: 0,
  streakNeedsReview: 0
};

export function getHiddenAssessmentState(): HiddenAssessmentState {
  return { ...hiddenState, recommendedQuestionMix: { ...hiddenState.recommendedQuestionMix } };
}

export function updateHiddenAssessmentState(input: AdaptiveUpdateInput): HiddenAssessmentState {
  const percentage = clamp(input.percentage, 0, 1);
  let delta = 0;
  let streakCorrect = hiddenState.streakCorrect;
  let streakNeedsReview = hiddenState.streakNeedsReview;

  if (percentage >= 0.9) {
    delta = 8;
    streakCorrect += 1;
    streakNeedsReview = 0;
  } else if (percentage >= 0.75) {
    delta = 5;
    streakCorrect += 1;
    streakNeedsReview = 0;
  } else if (percentage >= 0.55) {
    delta = 1;
    streakCorrect = 0;
    streakNeedsReview = 0;
  } else {
    delta = -5;
    streakCorrect = 0;
    streakNeedsReview += 1;
  }

  const nextScore = clamp(hiddenState.hiddenScore + delta, 0, 100);
  const mapped = mapHiddenScore(nextScore);
  const nextPlan = getAdaptiveQuizPlanFromLevel(mapped.skillLevel, mapped.nextDifficulty, hiddenState.recommendedMode);

  hiddenState = {
    hiddenScore: nextScore,
    skillLevel: mapped.skillLevel,
    nextDifficulty: mapped.nextDifficulty,
    recommendedMode: nextPlan.mode,
    recommendedQuestionMix: nextPlan.questionMix,
    lastAccuracy: percentage,
    streakCorrect,
    streakNeedsReview
  };

  return getHiddenAssessmentState();
}

export function getAdaptiveQuizPlan(requestedMode: QuizMode): AdaptiveQuizPlan {
  return getAdaptiveQuizPlanFromLevel(hiddenState.skillLevel, hiddenState.nextDifficulty, requestedMode);
}

export function getStudentPathLabel(): string {
  if (hiddenState.skillLevel === 'advanced') {
    return 'Advanced Challenge';
  }
  if (hiddenState.skillLevel === 'proficient' || hiddenState.skillLevel === 'developing') {
    return 'Standard Practice';
  }
  return 'Foundation Review';
}

function getAdaptiveQuizPlanFromLevel(
  skillLevel: HiddenSkillLevel,
  difficulty: AdaptiveDifficulty,
  requestedMode: QuizMode
): AdaptiveQuizPlan {
  if (skillLevel === 'foundation') {
    return {
      mode: requestedMode,
      difficulty: 'basic',
      questionCount: requestedMode === 'quick' ? 3 : 8,
      questionMix: { multipleChoice: requestedMode === 'quick' ? 3 : 7, shortAnswer: requestedMode === 'quick' ? 0 : 1, spokenAnswer: 0 },
      studentFacingLabel: 'Recommended: Quick Test',
      studentFacingMessage: "Let's review the foundation first.",
      promptInstruction: 'Focus on direct concept checks and short, clear questions.'
    };
  }
  if (skillLevel === 'developing') {
    return {
      mode: requestedMode,
      difficulty: requestedMode === 'quick' ? 'basic' : 'standard',
      questionCount: requestedMode === 'quick' ? 3 : 10,
      questionMix: { multipleChoice: requestedMode === 'quick' ? 3 : 8, shortAnswer: requestedMode === 'quick' ? 0 : 2, spokenAnswer: 0 },
      studentFacingLabel: 'Recommended: 10-Question Test',
      studentFacingMessage: 'Keep practicing step by step.',
      promptInstruction: 'Mix concept recall with understanding checks.'
    };
  }
  if (skillLevel === 'proficient') {
    return {
      mode: requestedMode,
      difficulty: requestedMode === 'quick' ? 'standard' : 'advanced',
      questionCount: requestedMode === 'quick' ? 4 : 10,
      questionMix: { multipleChoice: requestedMode === 'quick' ? 3 : 7, shortAnswer: requestedMode === 'quick' ? 1 : 3, spokenAnswer: 0 },
      studentFacingLabel: 'Recommended: 10-Question Test',
      studentFacingMessage: 'You are ready for stronger practice.',
      promptInstruction: 'Include comparison and reasoning questions.'
    };
  }
  return {
    mode: requestedMode,
    difficulty: requestedMode === 'quick' ? 'advanced' : difficulty,
    questionCount: requestedMode === 'quick' ? 5 : 10,
    questionMix: { multipleChoice: requestedMode === 'quick' ? 3 : 5, shortAnswer: requestedMode === 'quick' ? 2 : 5, spokenAnswer: 0 },
    studentFacingLabel: 'Recommended: 10-Question Test',
    studentFacingMessage: 'Challenge mode is ready.',
    promptInstruction: 'Prioritize application, reasoning, and explanation tasks.'
  };
}

function mapHiddenScore(score: number): { skillLevel: HiddenSkillLevel; nextDifficulty: AdaptiveDifficulty } {
  if (score <= 39) {
    return { skillLevel: 'foundation', nextDifficulty: 'basic' };
  }
  if (score <= 59) {
    return { skillLevel: 'developing', nextDifficulty: 'standard' };
  }
  if (score <= 79) {
    return { skillLevel: 'proficient', nextDifficulty: 'advanced' };
  }
  return { skillLevel: 'advanced', nextDifficulty: 'challenge' };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

