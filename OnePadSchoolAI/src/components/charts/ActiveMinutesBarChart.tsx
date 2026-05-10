import React from 'react';
import type { DailyBodyLog } from '../../types/healthTypes';
import MiniBarChart from './MiniBarChart';
import { mapLogsToPoints } from './chartUtils';

type Props = { logs: DailyBodyLog[] };

export default function ActiveMinutesBarChart({ logs }: Props) {
  return (
    <MiniBarChart
      title="Active minutes"
      points={mapLogsToPoints(logs, (log) => log.activeMinutes)}
      color="#16a34a"
      maxValue={80}
      suffix="m"
    />
  );
}
