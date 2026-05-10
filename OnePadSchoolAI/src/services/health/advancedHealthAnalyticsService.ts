import type {
  DailyBodyLog,
  HealthAnalyticsBundle,
  ForecastPoint,
  QuantSeriesPoint,
  StatisticalProfile,
  TrendSlope
} from '../../types/healthTypes';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function round(value: number, digits = 2): number {
  const p = Math.pow(10, digits);
  return Math.round(value * p) / p;
}

function toNum(value: number | undefined, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((acc, item) => acc + item, 0) / values.length;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = average(values);
  const variance = values.reduce((acc, item) => acc + Math.pow(item - mean, 2), 0) / (values.length - 1);
  return Math.sqrt(variance);
}

function ema(values: number[], alpha = 0.35): number[] {
  if (values.length === 0) return [];
  const out: number[] = [values[0]];
  for (let i = 1; i < values.length; i += 1) {
    out.push(alpha * values[i] + (1 - alpha) * out[i - 1]);
  }
  return out;
}

function slopeFromLinearRegression(values: number[]): number {
  if (values.length < 2) return 0;
  const n = values.length;
  const xs = values.map((_, i) => i + 1);
  const meanX = average(xs);
  const meanY = average(values);
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i += 1) {
    num += (xs[i] - meanX) * (values[i] - meanY);
    den += Math.pow(xs[i] - meanX, 2);
  }
  return den === 0 ? 0 : num / den;
}

function classifySlope(value: number): TrendSlope {
  if (value >= 0.35) return 'strong_up';
  if (value >= 0.1) return 'up';
  if (value <= -0.35) return 'strong_down';
  if (value <= -0.1) return 'down';
  return 'flat';
}

function pearsonCorrelation(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length < 2) return 0;
  const ma = average(a);
  const mb = average(b);
  let num = 0;
  let da = 0;
  let db = 0;
  for (let i = 0; i < a.length; i += 1) {
    const xa = a[i] - ma;
    const xb = b[i] - mb;
    num += xa * xb;
    da += xa * xa;
    db += xb * xb;
  }
  if (da === 0 || db === 0) return 0;
  return clamp(num / Math.sqrt(da * db), -1, 1);
}

function normalizeSleep(hours: number): number {
  return clamp((hours - 5) / 4 * 100, 0, 100);
}

function normalizeActivity(minutes: number): number {
  return clamp(minutes / 60 * 100, 0, 100);
}

function normalizeFatigue(fatigue: number): number {
  return clamp((6 - fatigue) / 5 * 100, 0, 100);
}

function normalizeEnergy(energy: number): number {
  return clamp((energy - 1) / 4 * 100, 0, 100);
}

function normalizeStudyLoad(studyMinutes: number): number {
  const ideal = 50;
  const diff = Math.abs(studyMinutes - ideal);
  return clamp(100 - diff * 1.6, 0, 100);
}

function buildPoints(logs: DailyBodyLog[]): QuantSeriesPoint[] {
  return logs
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((log) => ({
      date: log.date,
      sleepHours: toNum(log.sleepHours, 6.5),
      activeMinutes: toNum(log.activeMinutes, 25),
      fatigueLevel: toNum(log.fatigueLevel, 3),
      energyLevel: toNum(log.energyLevel, 3),
      studyMinutes: toNum(log.studyMinutes, 45),
      restingHeartRate: toNum(log.restingHeartRate, 80)
    }));
}

function buildStatProfile(series: number[]): StatisticalProfile {
  if (series.length === 0) {
    return {
      mean: 0,
      median: 0,
      stdDev: 0,
      min: 0,
      max: 0,
      latest: 0,
      zScoreLatest: 0,
      slope: 'flat'
    };
  }
  const meanVal = average(series);
  const std = stdDev(series);
  const latest = series[series.length - 1];
  return {
    mean: round(meanVal),
    median: round(median(series)),
    stdDev: round(std),
    min: round(Math.min(...series)),
    max: round(Math.max(...series)),
    latest: round(latest),
    zScoreLatest: round(std > 0 ? (latest - meanVal) / std : 0),
    slope: classifySlope(slopeFromLinearRegression(series))
  };
}

function buildForecast(readinessSeries: number[], volatility: number): ForecastPoint[] {
  if (readinessSeries.length === 0) return [];
  const smoothed = ema(readinessSeries, 0.4);
  const slope = slopeFromLinearRegression(smoothed);
  const last = smoothed[smoothed.length - 1];
  const out: ForecastPoint[] = [];
  for (let i = 1; i <= 7; i += 1) {
    const predicted = clamp(last + slope * i, 0, 100);
    const band = clamp(volatility * (0.7 + i * 0.08), 3, 18);
    out.push({
      dayOffset: i,
      predictedReadinessIndex: round(predicted),
      lowerBand: round(clamp(predicted - band, 0, 100)),
      upperBand: round(clamp(predicted + band, 0, 100))
    });
  }
  return out;
}

function buildAnomalySignals(points: QuantSeriesPoint[], readinessSeries: number[]): string[] {
  const out: string[] = [];
  if (points.length < 4) return out;
  const latest = points[points.length - 1];
  const sleepArr = points.map((item) => item.sleepHours);
  const fatigueArr = points.map((item) => item.fatigueLevel);
  const hrArr = points.map((item) => item.restingHeartRate);
  const readinessStd = stdDev(readinessSeries);
  const readinessMean = average(readinessSeries);
  const readinessLatest = readinessSeries[readinessSeries.length - 1];

  if (latest.sleepHours < 6) {
    out.push('Sleep debt signal: latest sleep is below 6 hours.');
  }
  if (latest.fatigueLevel >= 4) {
    out.push('High fatigue signal: student reports fatigue level 4 or above.');
  }
  if (latest.restingHeartRate - average(hrArr) > 4) {
    out.push('Elevated resting heart-rate signal vs personal baseline.');
  }
  if (stdDev(sleepArr) > 0.9) {
    out.push('Irregular sleep pattern signal: high day-to-day sleep variance.');
  }
  if (average(fatigueArr.slice(-3)) >= 3.5) {
    out.push('Sustained fatigue trend over the last 3 days.');
  }
  if (readinessStd > 0 && readinessLatest < readinessMean - 1.1 * readinessStd) {
    out.push('Readiness anomaly: latest readiness is significantly below personal average.');
  }
  return out;
}

function buildRecommendations(
  correlationStudyVsFatigue: number,
  correlationSleepVsReadiness: number,
  indexes: {
    readiness: number;
    recovery: number;
    overloadRisk: number;
    stress: number;
    resilience: number;
  },
  anomalies: string[]
): string[] {
  const out: string[] = [];
  if (indexes.overloadRisk >= 60) {
    out.push('Reduce heavy study blocks into shorter cycles (25-30 minutes) with movement breaks.');
  }
  if (indexes.recovery < 50) {
    out.push('Prioritize recovery tonight: consistent bedtime and low-stimulation study ending.');
  }
  if (correlationStudyVsFatigue > 0.35) {
    out.push('Study load appears strongly linked to fatigue; cap late-evening deep work.');
  }
  if (correlationSleepVsReadiness > 0.35) {
    out.push('Sleep quality strongly predicts readiness; protect minimum sleep window first.');
  }
  if (indexes.stress >= 58) {
    out.push('Use low-pressure formative tasks before graded tasks to lower acute stress.');
  }
  if (indexes.resilience < 48) {
    out.push('Add one confidence-restoring micro task each day (easy win before hard topic).');
  }
  if (anomalies.length === 0) {
    out.push('Maintain current routine; keep monitoring for consistency and gradual improvement.');
  }
  return out.slice(0, 6);
}

export function createAdvancedHealthAnalytics(logs: DailyBodyLog[]): HealthAnalyticsBundle {
  const points = buildPoints(logs);
  const sampleSize = points.length;
  const analyticsMode: HealthAnalyticsBundle['analyticsMode'] =
    sampleSize < 3 ? 'basic' : sampleSize < 7 ? 'limited_trend' : 'full';
  const sleepSeries = points.map((item) => item.sleepHours);
  const activitySeries = points.map((item) => item.activeMinutes);
  const fatigueSeries = points.map((item) => item.fatigueLevel);
  const studySeries = points.map((item) => item.studyMinutes);
  const hrSeries = points.map((item) => item.restingHeartRate);
  const energySeries = points.map((item) => item.energyLevel);

  const readinessSeries = points.map((item) => {
    const score =
      normalizeSleep(item.sleepHours) * 0.32 +
      normalizeActivity(item.activeMinutes) * 0.21 +
      normalizeFatigue(item.fatigueLevel) * 0.18 +
      normalizeEnergy(item.energyLevel) * 0.16 +
      normalizeStudyLoad(item.studyMinutes) * 0.13;
    return round(score);
  });

  const recoverySeries = points.map((item) =>
    round(normalizeSleep(item.sleepHours) * 0.62 + normalizeFatigue(item.fatigueLevel) * 0.38)
  );

  const overloadRiskSeries = points.map((item) => {
    const stressFromStudy = clamp((item.studyMinutes - 55) * 1.35, 0, 45);
    const stressFromSleepDebt = clamp((6.8 - item.sleepHours) * 16, 0, 40);
    const stressFromFatigue = clamp((item.fatigueLevel - 2.5) * 12, 0, 30);
    return round(clamp(stressFromStudy + stressFromSleepDebt + stressFromFatigue, 0, 100));
  });

  const stressSeries = points.map((item) => {
    const value =
      clamp((item.fatigueLevel - 1) / 4 * 45, 0, 45) +
      clamp((item.studyMinutes - 40) / 40 * 25, 0, 25) +
      clamp((80 - normalizeSleep(item.sleepHours)) * 0.3, 0, 30);
    return round(clamp(value, 0, 100));
  });

  const resilienceSeries = points.map((_, idx) => {
    const readiness = readinessSeries[idx];
    const recovery = recoverySeries[idx];
    const overload = overloadRiskSeries[idx];
    return round(clamp(readiness * 0.42 + recovery * 0.38 - overload * 0.2 + 12, 0, 100));
  });

  const readinessIndex = round(average(readinessSeries));
  const recoveryIndex = round(average(recoverySeries));
  const overloadRiskIndex = round(average(overloadRiskSeries));
  const stressIndex = round(average(stressSeries));
  const resilienceIndex = round(average(resilienceSeries));

  const sleepProfile = buildStatProfile(sleepSeries);
  const activityProfile = buildStatProfile(activitySeries);
  const fatigueProfile = buildStatProfile(fatigueSeries);
  const studyLoadProfile = buildStatProfile(studySeries);
  const hrProfile = buildStatProfile(hrSeries);

  const anomalies = analyticsMode === 'basic' ? [] : buildAnomalySignals(points, readinessSeries);
  const corrStudyFatigue = round(pearsonCorrelation(studySeries, fatigueSeries));
  const corrSleepReadiness = round(pearsonCorrelation(sleepSeries, readinessSeries));
  const volatility = stdDev(readinessSeries);

  const forecast7d = analyticsMode === 'basic' ? [] : buildForecast(readinessSeries, volatility);
  const recommendations = buildRecommendations(
    corrStudyFatigue,
    corrSleepReadiness,
    {
      readiness: readinessIndex,
      recovery: recoveryIndex,
      overloadRisk: overloadRiskIndex,
      stress: stressIndex,
      resilience: resilienceIndex
    },
    anomalies
  );

  return {
    points,
    indexes: {
      readinessIndex,
      recoveryIndex,
      overloadRiskIndex,
      stressIndex,
      resilienceIndex
    },
    sleepProfile,
    activityProfile,
    fatigueProfile,
    studyLoadProfile,
    hrProfile,
    anomalySignals: anomalies,
    recommendations,
    forecast7d,
    correlationStudyVsFatigue: corrStudyFatigue,
    correlationSleepVsReadiness: corrSleepReadiness,
    analyticsMode,
    sampleSize,
    analyticsConfidence: round(clamp(0.2 + Math.min(sampleSize, 14) / 14 * 0.75, 0.2, 0.95)),
    generatedAt: new Date().toISOString()
  };
}
