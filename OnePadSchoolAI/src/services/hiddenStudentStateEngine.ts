type HiddenSignalType =
  | 'academic_drop'
  | 'repeated_mistake'
  | 'low_confidence'
  | 'frustration_signal'
  | 'support_request'
  | 'social_concern'
  | 'needs_attention'
  | 'group_participation'
  | 'collaboration_activity'
  | 'assignment_submitted';

type HiddenSignalSeverity = 'low' | 'medium' | 'high';

type HiddenSignal = {
  id: string;
  type: HiddenSignalType;
  severity: HiddenSignalSeverity;
  source: 'quiz' | 'ai_tutor' | 'support' | 'progress' | 'lecture' | 'manual_demo' | 'group_work';
  safeSummary: string;
  createdAt: string;
};

type HiddenStudentState = {
  studentId: string;
  academicScore: number;
  wellbeingScore: number;
  socialSupportScore: number;
  academicSignals: HiddenSignal[];
  wellbeingSignals: HiddenSignal[];
  socialSignals: HiddenSignal[];
  studentFacingSummary: string;
  teacherFacingSummary: string;
  guardianFacingSummary: string;
  recommendedStudentAction: string;
  recommendedTeacherAction: string;
  updatedAt: string;
};

let state: HiddenStudentState = {
  studentId: 'student_001',
  academicScore: 65,
  wellbeingScore: 72,
  socialSupportScore: 70,
  academicSignals: [],
  wellbeingSignals: [],
  socialSignals: [],
  studentFacingSummary: 'You are making progress. Keep learning step by step.',
  teacherFacingSummary: 'No high-priority concerns in the current demo session.',
  guardianFacingSummary: 'Student is progressing and may benefit from regular check-ins.',
  recommendedStudentAction: 'Continue lesson practice and take a short quiz.',
  recommendedTeacherAction: 'Offer targeted review when the student requests help.',
  updatedAt: new Date().toISOString()
};

export function getHiddenStudentState(): HiddenStudentState {
  return JSON.parse(JSON.stringify(state)) as HiddenStudentState;
}

export function recordQuizSignal(input: { percentage: number; repeatedMistake?: boolean; studentAnswerText?: string }): void {
  if (input.percentage < 0.55) {
    addSignal('academic', {
      type: 'academic_drop',
      severity: 'medium',
      source: 'quiz',
      safeSummary: 'Recent quiz performance suggests the student may need foundation review.'
    });
  }
  if (input.repeatedMistake) {
    addSignal('academic', {
      type: 'repeated_mistake',
      severity: 'medium',
      source: 'quiz',
      safeSummary: 'Repeated mistake pattern detected in recent quiz attempts.'
    });
  }
  if (containsLowConfidence(input.studentAnswerText ?? '')) {
    addSignal('wellbeing', {
      type: 'low_confidence',
      severity: 'low',
      source: 'quiz',
      safeSummary: 'Student expressed uncertainty while answering quiz questions.'
    });
  }
  refreshSummaries();
}

export function recordAiTutorSignal(userText: string): void {
  if (!containsLowConfidence(userText)) {
    return;
  }
  addSignal('wellbeing', {
    type: 'frustration_signal',
    severity: 'low',
    source: 'ai_tutor',
    safeSummary: 'Student expressed confusion during AI tutor chat.'
  });
  refreshSummaries();
}

export function recordSupportSignal(reason: string): void {
  const normalized = reason.toLowerCase();
  if (normalized.includes('privately') || normalized.includes('problem at school')) {
    addSignal('social', {
      type: 'social_concern',
      severity: 'medium',
      source: 'support',
      safeSummary: 'Student requested private or social support.'
    });
  } else {
    addSignal('social', {
      type: 'support_request',
      severity: 'low',
      source: 'support',
      safeSummary: 'Student asked for additional learning support.'
    });
  }
  refreshSummaries();
}

export function recordGroupWorkSignal(type: 'group_participation' | 'collaboration_activity' | 'assignment_submitted'): void {
  addSignal('social', {
    type,
    severity: 'low',
    source: 'group_work',
    safeSummary: 'Group work participation activity recorded.'
  });
  refreshSummaries();
}

export function getStudentFacingHiddenSummary(): string {
  return state.studentFacingSummary;
}

export function getTeacherFacingSafeSummary(): string {
  return state.teacherFacingSummary;
}

export function getGuardianFacingSafeSummary(): string {
  return state.guardianFacingSummary;
}

function addSignal(
  scope: 'academic' | 'wellbeing' | 'social',
  input: Omit<HiddenSignal, 'id' | 'createdAt'>
): void {
  const signal: HiddenSignal = {
    ...input,
    id: `sig-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString()
  };
  if (scope === 'academic') {
    state.academicSignals = [signal, ...state.academicSignals].slice(0, 20);
    state.academicScore = Math.max(0, state.academicScore - (signal.severity === 'medium' ? 3 : 1));
  } else if (scope === 'wellbeing') {
    state.wellbeingSignals = [signal, ...state.wellbeingSignals].slice(0, 20);
    state.wellbeingScore = Math.max(0, state.wellbeingScore - 1);
  } else {
    state.socialSignals = [signal, ...state.socialSignals].slice(0, 20);
    state.socialSupportScore = Math.max(0, state.socialSupportScore - 1);
  }
  state.updatedAt = new Date().toISOString();
}

function refreshSummaries(): void {
  const hasConcern = state.socialSignals.some((item) => item.type === 'social_concern');
  const hasAcademicDrop = state.academicSignals.some((item) => item.type === 'academic_drop');

  state.studentFacingSummary = hasAcademicDrop
    ? "Let's review the foundation before moving forward."
    : 'You are making progress. Keep practicing with short learning steps.';

  state.teacherFacingSummary = hasConcern
    ? 'Student requested private/social support. Please follow up appropriately.'
    : hasAcademicDrop
      ? 'Student may need support with current concepts. Repeated learning difficulty detected.'
      : 'Student is developing steadily in current lessons.';

  state.guardianFacingSummary = hasConcern
    ? 'Student requested additional support at school. A trusted adult follow-up is recommended.'
    : 'Student is engaging with lessons and may benefit from regular encouragement.';

  state.recommendedStudentAction = hasAcademicDrop
    ? 'Try a foundation review, then complete a short quiz.'
    : 'Continue lesson practice and ask for help when needed.';

  state.recommendedTeacherAction = hasConcern
    ? 'Plan a private check-in and provide safe support.'
    : 'Offer short concept review and encouragement.';
}

function containsLowConfidence(text: string): boolean {
  const normalized = text.toLowerCase();
  const patterns = [
    "i don't understand",
    'toi khong hieu',
    'em khong biet',
    'khó quá',
    'chan hoc',
    'em chịu'
  ];
  return patterns.some((item) => normalized.includes(item));
}

