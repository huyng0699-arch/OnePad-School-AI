import type { BodyReadinessSnapshot } from '../../types/healthTypes';
import type { TeacherInsightReport } from '../../types/reportTypes';
import type { SupportSignal, VisibleRole } from '../../types/wellbeingTypes';

export type TeacherInsightInput = {
  studentId: string;
  teacherRole: VisibleRole;
  subjectSummary: string;
  readiness?: BodyReadinessSnapshot;
  supportSignals: SupportSignal[];
};

export const createTeacherInsightReport = (
  input: TeacherInsightInput
): TeacherInsightReport => {
  const canSeeWellbeing =
    input.teacherRole === 'homeroom_teacher' || input.teacherRole === 'education_guardian';
  const readinessLine = input.readiness
    ? ` Readiness context: ${input.readiness.learningRecommendation}.`
    : '';

  return {
    id: `teacher_report_${Date.now()}`,
    studentId: input.studentId,
    teacherRole: input.teacherRole,
    learningInsight: `${input.subjectSummary}${readinessLine}`,
    wellbeingSafeSummary: canSeeWellbeing
      ? input.supportSignals.map((signal) => signal.safeSummary).join(' ')
      : undefined,
    suggestedIntervention: [
      'Assign one simpler practice task for the weakest skill.',
      'Use a short check-in before the next advanced task.',
      'Avoid adding optional workload if readiness is low.'
    ],
    hiddenFields: canSeeWellbeing
      ? ['privateReflection', 'rawChat']
      : ['wellbeingSafeSummary', 'privateReflection', 'rawChat'],
    generatedAt: new Date().toISOString()
  };
};
