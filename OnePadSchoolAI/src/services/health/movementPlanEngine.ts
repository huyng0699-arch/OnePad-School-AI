import type {
  BodyReadinessSnapshot,
  MovementPlanItem,
  PhysicalHealthProfile,
  WeeklyMovementPlan
} from '../../types/healthTypes';

const createPlanItem = (
  id: string,
  day: string,
  title: string,
  durationMinutes: number,
  description: string
): MovementPlanItem => ({
  id,
  day,
  title,
  durationMinutes,
  intensity: durationMinutes <= 10 ? 'light' : 'moderate',
  description,
  completed: false
});

export const createWeeklyMovementPlan = (
  profile: PhysicalHealthProfile,
  readiness: BodyReadinessSnapshot
): WeeklyMovementPlan => {
  const prefersWalking = profile.activityPreference.includes('walking');
  const prefersStretching = profile.activityPreference.includes('stretching');
  const shouldKeepLight =
    readiness.readinessLevel === 'low_energy' || readiness.readinessLevel === 'needs_rest';
  const baseDuration = shouldKeepLight ? 5 : 12;

  return {
    studentId: profile.studentId,
    weekStartDate: readiness.date,
    safetyNote:
      'This routine is a school wellness suggestion, not a medical prescription. Keep movement light to moderate and stop if uncomfortable.',
    items: [
      createPlanItem(
        'plan_day_1',
        'Monday',
        prefersWalking ? 'Comfortable walk' : 'Light movement break',
        baseDuration,
        'Move comfortably after the main study session.'
      ),
      createPlanItem(
        'plan_day_2',
        'Tuesday',
        prefersStretching ? 'Gentle stretching' : 'Short active break',
        5,
        'Use a short break between two learning sessions.'
      ),
      createPlanItem(
        'plan_day_3',
        'Wednesday',
        'PE class reflection',
        shouldKeepLight ? 5 : 20,
        'Log PE activity and reflect on energy after class.'
      ),
      createPlanItem(
        'plan_day_4',
        'Thursday',
        'Recovery routine',
        5,
        'Use light stretching and keep the evening routine calm.'
      ),
      createPlanItem(
        'plan_day_5',
        'Friday',
        'Outdoor activity',
        shouldKeepLight ? 8 : 15,
        'Choose a safe outdoor activity or family walk.'
      )
    ]
  };
};
