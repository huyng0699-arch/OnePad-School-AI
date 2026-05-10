import type { BodyReadinessSnapshot } from '../../types/healthTypes';
import type { GuardianReport } from '../../types/reportTypes';
import type { SupportSignal } from '../../types/wellbeingTypes';

export type GuardianReportInput = {
  studentId: string;
  learningSummary: string;
  readiness?: BodyReadinessSnapshot;
  supportSignals: SupportSignal[];
};

export const createGuardianReport = (input: GuardianReportInput): GuardianReport => {
  const wellbeingSignals = input.supportSignals.filter(
    (signal) => signal.signalType === 'support_request' || signal.signalType === 'learning_stress'
  );
  return {
    id: `guardian_report_${Date.now()}`,
    studentId: input.studentId,
    period: 'weekly',
    learningSummary: input.learningSummary,
    physicalReadinessSummary: input.readiness?.safeSummary,
    wellbeingSafeSummary:
      wellbeingSignals.length > 0
        ? wellbeingSignals.map((signal) => signal.safeSummary).join(' ')
        : 'No support request was detected this week.',
    homeRecommendations: [
      'Use short supportive conversations about difficult lessons.',
      'Keep evening study sessions focused and not too long.',
      'Encourage consistent sleep and light movement breaks.'
    ],
    schoolRecommendations: [
      'Use one focused remedial task before advanced exercises.',
      'Check repeated mistake patterns in the next lesson.'
    ],
    redactedFields: ['privateReflection', 'rawChat', 'rawHealthLogs'],
    generatedAt: new Date().toISOString()
  };
};
