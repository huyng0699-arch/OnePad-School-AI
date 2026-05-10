import type { InterventionPlan } from '../../types/interventionTypes';

export const createInterventionPlan = (input: {
  eventId: string;
  studentId: string;
  learningIssue?: string;
  masteryScore?: number;
  readinessLevel?: string;
  supportRequested: boolean;
  evidenceLabels: string[];
}): InterventionPlan => {
  const needsShortTask = typeof input.masteryScore === 'number' && input.masteryScore < 60;
  const lowEnergy =
    input.readinessLevel === 'low_energy' || input.readinessLevel === 'needs_rest';

  return {
    id: `plan_${input.eventId}`,
    eventId: input.eventId,
    studentId: input.studentId,
    createdAt: new Date().toISOString(),
    studentActions: [
      needsShortTask
        ? 'Do one easier word-problem task.'
        : 'Complete one focused practice task.',
      'Ask AI for a step-by-step example.',
      lowEnergy
        ? 'Use a 5-minute break before the next quiz.'
        : 'Use short breaks between study blocks.',
    ],
    teacherActions: [
      `Review ${input.learningIssue ?? 'the weakest skill'} with one scaffolded example.`,
      'Assign 3 simpler practice questions before advanced work.',
      'Check understanding before adding optional workload.',
    ],
    parentActions: [
      'Keep evening study blocks short and supportive.',
      'Ask which lesson step felt hardest today.',
      'Support a consistent sleep routine this week.',
    ],
    adminActions: [
      'Confirm permission route for safe summary delivery.',
      'Verify audit log creation for this intervention.',
      'Monitor sync status for this support event.',
    ],
    safetyNote:
      'This is a school support plan. It does not diagnose health or mental conditions.',
  };
};
