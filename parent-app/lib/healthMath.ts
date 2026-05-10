export type ParentHealthMath = {
  readinessIndex: number;
  stressIndex: number;
  overloadRiskIndex: number;
  sleepMean: number;
  activityMean: number;
  fatigueMean: number;
  corrStudyFatigue: number;
  corrSleepReadiness: number;
  anomalySignals: string[];
  forecast: Array<{ day: number; readiness: number; lower: number; upper: number }>;
};

type SampleDay = {
  sleep: number;
  activity: number;
  fatigue: number;
  study: number;
};

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function avg(xs: number[]) {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
}

function std(xs: number[]) {
  if (xs.length < 2) return 0;
  const m = avg(xs);
  const var1 = xs.reduce((a, b) => a + (b - m) * (b - m), 0) / (xs.length - 1);
  return Math.sqrt(var1);
}

function corr(a: number[], b: number[]) {
  if (a.length !== b.length || a.length < 2) return 0;
  const ma = avg(a);
  const mb = avg(b);
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

function readiness(day: SampleDay) {
  const sleepScore = clamp((day.sleep - 5) / 4 * 100, 0, 100);
  const activityScore = clamp(day.activity / 60 * 100, 0, 100);
  const fatigueScore = clamp((6 - day.fatigue) / 5 * 100, 0, 100);
  const studyBalance = clamp(100 - Math.abs(day.study - 50) * 1.6, 0, 100);
  return clamp(sleepScore * 0.35 + activityScore * 0.22 + fatigueScore * 0.23 + studyBalance * 0.2, 0, 100);
}

export function buildParentHealthMath(seed: {
  sleepLastNightHours: number;
  activityMinutesToday: number;
  fatigueSignal: string;
}): ParentHealthMath {
  const fatigueBase = /mild/i.test(seed.fatigueSignal) ? 3 : /high|severe/i.test(seed.fatigueSignal) ? 4 : 2;
  const samples: SampleDay[] = Array.from({ length: 14 }).map((_, idx) => {
    const drift = idx - 9;
    return {
      sleep: clamp(seed.sleepLastNightHours + Math.sin(idx / 2.1) * 0.5 - drift * 0.03, 5.2, 8.4),
      activity: clamp(seed.activityMinutesToday + Math.cos(idx / 2.5) * 8 - drift * 1.2, 20, 85),
      fatigue: clamp(fatigueBase + Math.sin(idx / 2.7) * 0.6 + drift * 0.04, 1, 5),
      study: clamp(48 + Math.sin(idx / 1.8) * 16 + drift * 1.1, 20, 95)
    };
  });

  const sleep = samples.map((x) => x.sleep);
  const activity = samples.map((x) => x.activity);
  const fatigue = samples.map((x) => x.fatigue);
  const study = samples.map((x) => x.study);
  const ready = samples.map(readiness);

  const readinessIndex = avg(ready);
  const stressIndex = avg(fatigue.map((f, i) => clamp((f - 1) / 4 * 65 + clamp((study[i] - 45) / 40 * 35, 0, 35), 0, 100)));
  const overloadRiskIndex = avg(study.map((m, i) => clamp((m - 55) * 1.2 + (6.8 - sleep[i]) * 14 + (fatigue[i] - 2.5) * 10, 0, 100)));

  const anomalySignals: string[] = [];
  if (sleep[sleep.length - 1] < 6) anomalySignals.push("Sleep debt signal: latest sleep below 6h.");
  if (fatigue[fatigue.length - 1] >= 4) anomalySignals.push("Fatigue signal: high fatigue detected.");
  if (std(ready) > 10) anomalySignals.push("Readiness volatility signal: unstable daily readiness.");

  const slope = ready.length > 1 ? (ready[ready.length - 1] - ready[0]) / (ready.length - 1) : 0;
  const vol = std(ready);
  const last = ready[ready.length - 1];
  const forecast = Array.from({ length: 7 }).map((_, idx) => {
    const day = idx + 1;
    const pred = clamp(last + slope * day, 0, 100);
    const band = clamp(vol * (0.7 + day * 0.08), 3, 18);
    return { day, readiness: Math.round(pred), lower: Math.round(clamp(pred - band, 0, 100)), upper: Math.round(clamp(pred + band, 0, 100)) };
  });

  return {
    readinessIndex: Math.round(readinessIndex),
    stressIndex: Math.round(stressIndex),
    overloadRiskIndex: Math.round(overloadRiskIndex),
    sleepMean: Number(avg(sleep).toFixed(2)),
    activityMean: Number(avg(activity).toFixed(1)),
    fatigueMean: Number(avg(fatigue).toFixed(2)),
    corrStudyFatigue: Number(corr(study, fatigue).toFixed(2)),
    corrSleepReadiness: Number(corr(sleep, ready).toFixed(2)),
    anomalySignals,
    forecast
  };
}

