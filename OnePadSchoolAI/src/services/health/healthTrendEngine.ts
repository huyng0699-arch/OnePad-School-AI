import type { DailyBodyLog } from '../../types/healthTypes';

export type HealthTrendSummary = {
  averageEnergy: number;
  averageActiveMinutes: number;
  averageStudyMinutes: number;
  patternSummary: string;
};

const average = (values: number[]): number =>
  values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;

export const createHealthTrendSummary = (logs: DailyBodyLog[]): HealthTrendSummary => {
  const recent = logs.slice(-7);
  const averageEnergy = Number(average(recent.map((log) => log.energyLevel)).toFixed(1));
  const averageActiveMinutes = Number(
    average(recent.map((log) => log.activeMinutes ?? 0)).toFixed(1)
  );
  const averageStudyMinutes = Number(average(recent.map((log) => log.studyMinutes ?? 0)).toFixed(1));
  const patternSummary =
    averageStudyMinutes > 65 && averageEnergy <= 3
      ? 'Higher study load overlaps with lower energy this week. Shorter learning blocks are recommended.'
      : 'Study load and energy look balanced enough for normal learning blocks.';

  return { averageEnergy, averageActiveMinutes, averageStudyMinutes, patternSummary };
};
