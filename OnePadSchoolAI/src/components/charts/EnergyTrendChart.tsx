import React from 'react';
import type { DailyBodyLog } from '../../types/healthTypes';
import MiniBarChart from './MiniBarChart';
import { mapLogsToPoints } from './chartUtils';

type Props = { logs: DailyBodyLog[] };

export default function EnergyTrendChart({ logs }: Props) {
  return (
    <MiniBarChart
      title="Energy trend"
      points={mapLogsToPoints(logs, (log) => log.energyLevel)}
      color="#f59e0b"
      maxValue={5}
      suffix="/5"
    />
  );
}
