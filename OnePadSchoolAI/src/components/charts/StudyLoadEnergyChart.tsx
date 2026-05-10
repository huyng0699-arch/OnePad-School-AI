import React from 'react';
import type { DailyBodyLog } from '../../types/healthTypes';
import MiniBarChart from './MiniBarChart';
import { mapLogsToPoints } from './chartUtils';

type Props = { logs: DailyBodyLog[] };

export default function StudyLoadEnergyChart({ logs }: Props) {
  return (
    <MiniBarChart
      title="Study load minutes"
      points={mapLogsToPoints(logs, (log) => log.studyMinutes)}
      color="#7c3aed"
      maxValue={90}
      suffix="m"
    />
  );
}
