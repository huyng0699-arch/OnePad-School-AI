import type { SupportSignal, WellbeingCheckIn } from '../../types/wellbeingTypes';

export type WellbeingCheckInInput = {
  studentId: string;
  moodLabel?: WellbeingCheckIn['moodLabel'];
  schoolStressLevel: 1 | 2 | 3 | 4 | 5;
  socialComfortLevel?: 1 | 2 | 3 | 4 | 5;
  wantsAdultSupport: boolean;
  preferredSupportRole?: WellbeingCheckIn['preferredSupportRole'];
  privateReflection?: string;
};

const createSafeSummary = (input: WellbeingCheckInInput): string | undefined => {
  if (!input.wantsAdultSupport && input.schoolStressLevel < 4) return undefined;
  if (input.privateReflection?.trim()) {
    return 'The student requested support and shared that school feels difficult today. A short adult check-in may help.';
  }
  return 'The student reported higher school stress today and may benefit from a supportive check-in.';
};

export const createWellbeingCheckIn = (input: WellbeingCheckInInput): WellbeingCheckIn => {
  const safeSummary = createSafeSummary(input);
  const createdAt = new Date().toISOString();
  const visibility = safeSummary ? 'school_safe_summary' : 'private';
  const visibleToRoles = safeSummary
    ? (['student', 'parent', 'homeroom_teacher', 'education_guardian'] as const)
    : (['student'] as const);
  return {
    id: `well_${Date.now()}`,
    studentId: input.studentId,
    date: createdAt.slice(0, 10),
    moodLabel: input.moodLabel,
    schoolStressLevel: input.schoolStressLevel,
    socialComfortLevel: input.socialComfortLevel,
    wantsAdultSupport: input.wantsAdultSupport,
    preferredSupportRole: input.preferredSupportRole,
    privateReflection: input.privateReflection,
    safeSummary,
    visibility,
    rawDataLocked: true,
    visibleToRoles: [...visibleToRoles],
    source: 'demo_seed'
  };
};

export const createSupportSignalFromCheckIn = (
  checkIn: WellbeingCheckIn
): SupportSignal | undefined => {
  if (!checkIn.safeSummary) return undefined;
  const severity =
    checkIn.schoolStressLevel >= 5 ? 'high' : checkIn.schoolStressLevel >= 4 ? 'medium' : 'low';

  const roleFromRequest = checkIn.preferredSupportRole;
  const visibleToRoles: SupportSignal['visibleToRoles'] = ['homeroom_teacher', 'education_guardian', 'parent'];
  if (roleFromRequest === 'subject_teacher') visibleToRoles.push('subject_teacher');
  return {
    id: `sig_${Date.now()}`,
    studentId: checkIn.studentId,
    createdAt: new Date().toISOString(),
    signalType: checkIn.wantsAdultSupport ? 'support_request' : 'learning_stress',
    severity,
    source: 'student_checkin',
    safeSummary: checkIn.safeSummary,
    recommendedAction:
      'Use a supportive check-in and offer a smaller learning task before adding new workload.',
    visibleToRoles,
    rawDataLocked: true,
    auditLogId: `audit_${Date.now()}`
  };
};
