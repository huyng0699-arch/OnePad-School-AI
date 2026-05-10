import type { DailyBodyLog } from '../../types/healthTypes';

export type SleepRecoverySummary = {
  averageSleepHours: number;
  latestSleepHours?: number;
  trend: 'stable' | 'lower_than_usual' | 'improving';
  recommendation: string;
};

const average = (values: number[]): number =>
  values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;

export const createSleepRecoverySummary = (logs: DailyBodyLog[]): SleepRecoverySummary => {
  const sleepValues = logs
    .map((log) => log.sleepHours)
    .filter((value): value is number => typeof value === 'number');

  const latestSleepHours = sleepValues[sleepValues.length - 1];
  const averageSleepHours = Number(average(sleepValues).toFixed(1));
  const recent = average(sleepValues.slice(-3));
  const previous = average(sleepValues.slice(0, Math.max(1, sleepValues.length - 3)));
  const trend =
    recent < previous - 0.6 ? 'lower_than_usual' : recent > previous + 0.4 ? 'improving' : 'stable';

  return {
    averageSleepHours,
    latestSleepHours,
    trend,
    recommendation:
      trend === 'lower_than_usual'
        ? 'Use shorter study sessions today and avoid adding heavy optional tasks.'
        : 'Keep a consistent routine and include short breaks between learning sessions.'
  };
};
