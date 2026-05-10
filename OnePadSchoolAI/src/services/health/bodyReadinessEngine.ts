import type {
  BodyReadinessSnapshot,
  DailyBodyLog,
  EnergyTrend,
  LearningRecommendation,
  MovementTrend,
  ReadinessLevel,
  SleepTrend
} from '../../types/healthTypes';

const average = (values: number[]): number =>
  values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

const getSleepTrend = (logs: DailyBodyLog[]): SleepTrend => {
  const sleepValues = logs
    .map((log) => log.sleepHours)
    .filter((value): value is number => typeof value === 'number');

  if (sleepValues.length < 3) return 'stable';
  const recent = average(sleepValues.slice(-3));
  const previous = average(sleepValues.slice(0, Math.max(1, sleepValues.length - 3)));
  if (recent < previous - 0.6) return 'lower_than_usual';
  if (recent > previous + 0.4) return 'improving';
  return 'stable';
};

const getEnergyTrend = (logs: DailyBodyLog[]): EnergyTrend => {
  const values = logs.map((log) => log.energyLevel);
  if (values.length < 3) return 'stable';
  const recent = average(values.slice(-3));
  const previous = average(values.slice(0, Math.max(1, values.length - 3)));
  if (recent <= 2.4 || recent < previous - 0.8) return 'low';
  if (recent >= 4) return 'high';
  return 'stable';
};

const getMovementTrend = (logs: DailyBodyLog[]): MovementTrend => {
  const values = logs
    .map((log) => log.activeMinutes)
    .filter((value): value is number => typeof value === 'number');
  const recentAverage = average(values.slice(-7));
  if (recentAverage < 25) return 'low';
  if (recentAverage > 75) return 'high';
  return 'balanced';
};

const getReadinessLevel = (
  sleepTrend: SleepTrend,
  energyTrend: EnergyTrend,
  movementTrend: MovementTrend,
  latestLog?: DailyBodyLog
): ReadinessLevel => {
  if (!latestLog) return 'okay';
  if (sleepTrend === 'lower_than_usual' && energyTrend === 'low') return 'needs_rest';
  if (latestLog.energyLevel <= 2 || latestLog.fatigueLevel >= 4) return 'low_energy';
  if (latestLog.energyLevel >= 4 && sleepTrend !== 'lower_than_usual') return 'fresh';
  if (movementTrend === 'high' && latestLog.fatigueLevel >= 3) return 'low_energy';
  return 'okay';
};

const getLearningRecommendation = (readiness: ReadinessLevel): LearningRecommendation => {
  switch (readiness) {
    case 'fresh':
    case 'okay':
      return 'normal_study';
    case 'low_energy':
      return 'short_sessions';
    case 'needs_rest':
      return 'take_break_first';
    default:
      return 'normal_study';
  }
};

const getPhysicalRecommendation = (readiness: ReadinessLevel): string => {
  switch (readiness) {
    case 'fresh':
      return 'Use normal study blocks and keep one short movement break after learning.';
    case 'okay':
      return 'Keep a balanced routine: study, short break, light movement, and consistent sleep time.';
    case 'low_energy':
      return 'Use shorter study sessions today and choose light movement only.';
    case 'needs_rest':
      return 'Take a short recovery break before studying and avoid heavy workload today.';
    default:
      return 'Keep a balanced routine today.';
  }
};

export const createBodyReadinessSnapshot = (
  studentId: string,
  logs: DailyBodyLog[],
  source: BodyReadinessSnapshot['source'] = 'demo_seed'
): BodyReadinessSnapshot => {
  const sortedLogs = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  const latestLog = sortedLogs[sortedLogs.length - 1];
  const sleepTrend = getSleepTrend(sortedLogs);
  const energyTrend = getEnergyTrend(sortedLogs);
  const movementTrend = getMovementTrend(sortedLogs);
  const readinessLevel = getReadinessLevel(sleepTrend, energyTrend, movementTrend, latestLog);
  const physicalRecommendation = getPhysicalRecommendation(readinessLevel);
  const sleepSamples = sortedLogs.filter((log) => typeof log.sleepHours === 'number').length;
  const movementSamples = sortedLogs.filter((log) => typeof log.activeMinutes === 'number').length;
  const totalSamples = sortedLogs.length;

  // Data quality is explicit so parent/teacher/admin can distinguish real confidence from sparse logs.
  const dataQuality: BodyReadinessSnapshot['dataQuality'] =
    totalSamples >= 7 && sleepSamples >= 5 && movementSamples >= 5
      ? 'high'
      : totalSamples >= 3
        ? 'medium'
        : 'low';
  const confidence = clamp(
    0.25 +
      Math.min(totalSamples, 14) / 14 * 0.35 +
      Math.min(sleepSamples, 7) / 7 * 0.2 +
      Math.min(movementSamples, 7) / 7 * 0.2,
    0.2,
    0.95
  );

  const contributingFactors = {
    sleep: latestLog?.sleepHours,
    energy: latestLog?.energyLevel,
    fatigue: latestLog?.fatigueLevel,
    movement: latestLog?.activeMinutes,
    studyLoad: latestLog?.studyMinutes
  };

  return {
    studentId,
    date: latestLog?.date ?? new Date().toISOString().slice(0, 10),
    readinessLevel,
    sleepTrend,
    movementTrend,
    energyTrend,
    learningRecommendation: getLearningRecommendation(readinessLevel),
    physicalRecommendation,
    safeSummary: `${readinessLevel.replace('_', ' ')} readiness. ${physicalRecommendation}`,
    dataQuality,
    confidence: Number(confidence.toFixed(2)),
    source,
    contributingFactors
  };
};
