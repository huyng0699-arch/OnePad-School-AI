import type { DailyBodyLog } from '../../types/healthTypes';

export type ChartPoint = {
  label: string;
  value: number;
};

export const formatDateLabel = (date: string): string => date.slice(5).replace('-', '/');

export const mapLogsToPoints = (
  logs: DailyBodyLog[],
  picker: (log: DailyBodyLog) => number | undefined
): ChartPoint[] =>
  logs
    .map((log) => ({ label: formatDateLabel(log.date), value: picker(log) }))
    .filter((point): point is ChartPoint => typeof point.value === 'number');

export const clampPercent = (value: number): number => Math.max(4, Math.min(100, value));
