import type { GuardianReport } from '../types/reportTypes';

export const mockGuardianReports: GuardianReport[] = [
  {
    id: 'guardian_report_seed_001',
    studentId: 'student_minh_001',
    period: 'weekly',
    learningSummary:
      'Minh completed most assigned lessons. Math word problems remain the weakest skill area.',
    physicalReadinessSummary:
      'Low energy readiness. Use shorter study sessions today and choose light movement only.',
    wellbeingSafeSummary:
      'Minh may benefit from a supportive adult check-in about school workload.',
    homeRecommendations: [
      'Keep evening study sessions focused and not too long.',
      'Use a calm conversation about the most difficult lesson.',
      'Encourage consistent sleep and light movement breaks.'
    ],
    schoolRecommendations: [
      'Assign one focused remedial task before advanced exercises.',
      'Check repeated mistake patterns in the next lesson.'
    ],
    redactedFields: ['privateReflection', 'rawChat', 'rawHealthLogs'],
    generatedAt: '2026-05-08T08:30:00.000Z'
  }
];
