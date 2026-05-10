import React from 'react';
import type { DailyBodyLog } from '../../types/healthTypes';
import MiniBarChart from './MiniBarChart';
import { mapLogsToPoints } from './chartUtils';

type Props = { logs: DailyBodyLog[] };

export default function SleepLineChart({ logs }: Props) {
  return (
    <MiniBarChart
      title="Sleep trend"
      points={mapLogsToPoints(logs, (log) => log.sleepHours)}
      color="#2563eb"
      maxValue={9}
      suffix="h"
    />
  );
}
