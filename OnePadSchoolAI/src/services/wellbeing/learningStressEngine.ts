import type { DailyBodyLog } from '../../types/healthTypes';
import type { SupportSignal } from '../../types/wellbeingTypes';

export type LearningStressInput = {
  studentId: string;
  recentQuizScores: number[];
  repeatedMistakeCount: number;
  lateSubmissionCount: number;
  bodyLogs: DailyBodyLog[];
};

const average = (values: number[]): number =>
  values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;

export const analyzeLearningStress = (input: LearningStressInput): SupportSignal | undefined => {
  const scoreAverage = average(input.recentQuizScores);
  const recentEnergy = average(input.bodyLogs.slice(-3).map((log) => log.energyLevel));
  const learningDrop = scoreAverage < 65 || input.repeatedMistakeCount >= 3;
  const lowEnergy = recentEnergy <= 2.6;
  const workloadIssue = input.lateSubmissionCount >= 2;
  if (!learningDrop && !lowEnergy && !workloadIssue) return undefined;

  return {
    id: `sig_learning_${Date.now()}`,
    studentId: input.studentId,
    createdAt: new Date().toISOString(),
    signalType: 'learning_stress',
    severity: learningDrop && lowEnergy ? 'medium' : 'low',
    source: 'learning_data',
    safeSummary:
      'The student shows signs of learning overload in recent tasks. A shorter remedial activity may be more appropriate than an advanced task.',
    recommendedAction:
      'Assign one focused practice task, reduce optional workload, and check understanding before moving forward.',
    visibleToRoles: ['subject_teacher', 'homeroom_teacher', 'education_guardian'],
    rawDataLocked: true,
    auditLogId: `audit_learning_${Date.now()}`
  };
};
