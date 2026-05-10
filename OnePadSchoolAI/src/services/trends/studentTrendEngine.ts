import type {
  DataSourceLabel,
  NegativePointItem,
  NegativePointSummary,
  ParentTrendChartPoint,
  StudentTrendPacket,
  TrendConfidence,
  TrendDirection,
  TrendLevel,
  TrendSignal,
  TrendSource,
  TrendWindowDays
} from '../../types/studentTrendTypes';

const severityBase: Record<TrendSignal['severity'], number> = { 1: -1, 2: -2, 3: -4, 4: -7, 5: -10 };

export function computeRecencyMultiplier(createdAt: string, now: Date): number {
  const days = Math.max(0, (now.getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 1) return 1.4;
  if (days <= 3) return 1.2;
  if (days <= 7) return 1.0;
  if (days <= 14) return 0.7;
  return 0.4;
}

export function computeDeduction(signal: TrendSignal, now: Date): number {
  return Math.round(severityBase[signal.severity] * computeRecencyMultiplier(signal.createdAt, now));
}

export function buildNegativePointItems(signals: TrendSignal[], now: Date): NegativePointItem[] {
  return signals.map((signal) => ({
    category: signal.category,
    points: computeDeduction(signal, now),
    reason: signal.safeLabel,
    evidence: [signal.safeLabel, signal.safeSummary].filter(Boolean) as string[],
    source: signal.source,
    severity: signal.severity,
    createdAt: signal.createdAt
  }));
}

export function computeFrequencyPenalty(items: NegativePointItem[]): number {
  const grouped = new Map<string, number>();
  items.forEach((item) => grouped.set(item.category, (grouped.get(item.category) || 0) + 1));
  let penalty = 0;
  grouped.forEach((count) => {
    if (count >= 2 && count <= 3) penalty -= 2;
    else if (count >= 4 && count <= 6) penalty -= 4;
    else if (count > 6) penalty -= 6;
  });
  return penalty;
}

export function computeMultiSourcePenalty(items: NegativePointItem[]): number {
  const sources = new Set(items.map((item) => item.source));
  if (sources.size <= 1) return 0;
  if (sources.size === 2) return -3;
  return -6;
}

export function computeDirection(items: NegativePointItem[]): TrendDirection {
  if (items.length < 2) return "unknown";
  const sorted = [...items].sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
  const mid = Math.floor(sorted.length / 2);
  const first = sorted.slice(0, mid).reduce((sum, item) => sum + item.points, 0);
  const second = sorted.slice(mid).reduce((sum, item) => sum + item.points, 0);
  if (second < first - 3) return "worsening";
  if (second > first + 3) return "improving";
  return "stable";
}

export function computeConfidence(signals: TrendSignal[]): TrendConfidence {
  if (signals.length < 4) return "low";
  if (signals.length < 10) return "medium";
  return "high";
}

export function mapDeductionToLevel(totalDeduction: number): TrendLevel {
  if (totalDeduction >= -3) return "normal";
  if (totalDeduction >= -8) return "watch";
  if (totalDeduction >= -15) return "elevated";
  if (totalDeduction >= -24) return "high";
  return "red";
}

export function shouldRedAlert(summary: NegativePointSummary): { redAlert: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (summary.level === "red") reasons.push("overall_red_level");
  if (summary.items.some((item) => item.category === "conversation_signal" && item.severity === 5)) reasons.push("conversation_severity_5");
  if (summary.items.some((item) => item.category === "support_request" && item.severity === 5)) reasons.push("support_request_severity_5");
  const categoryHeavy = new Map<string, number>();
  summary.items.forEach((item) => categoryHeavy.set(item.category, (categoryHeavy.get(item.category) || 0) + Math.abs(item.points)));
  const heavyCount = [...categoryHeavy.values()].filter((value) => value >= 10).length;
  if (heavyCount >= 2) reasons.push("multi_heavy_categories");
  const hasBackendHealth = summary.items.some((item) => item.category === "backend_health_alert" && item.severity >= 4);
  const hasWellbeingOrLearning = summary.items.some(
    (item) => (item.category === "wellbeing" || item.category === "learning_behavior") && item.severity >= 3
  );
  if (hasBackendHealth && hasWellbeingOrLearning) reasons.push("backend_health_plus_wellbeing_learning");
  return { redAlert: reasons.length > 0, reasons };
}

export function buildChartPointsFromHistory(history: NegativePointSummary[]): ParentTrendChartPoint[] {
  return history.map((summary) => {
    const byCategory = (category: NegativePointItem['category']) =>
      summary.items.filter((item) => item.category === category).reduce((sum, item) => sum + item.points, 0);
    return {
      date: summary.date,
      totalDeduction: summary.totalDeduction,
      level: summary.level,
      sleepDeduction: byCategory("sleep"),
      fatigueDeduction: byCategory("fatigue"),
      studyLoadDeduction: byCategory("study_load"),
      learningBehaviorDeduction: byCategory("learning_behavior"),
      wellbeingDeduction: byCategory("wellbeing"),
      conversationDeduction: byCategory("conversation_signal"),
      supportSignalDeduction: byCategory("support_request")
    };
  });
}

export function buildStudentTrendPacket(input: {
  studentId: string;
  date?: string;
  learningSignals: TrendSignal[];
  conversationSignals: TrendSignal[];
  wellbeingSignals: TrendSignal[];
  physicalSignals: TrendSignal[];
  backendHealthAlertSignals?: TrendSignal[];
  windows?: TrendWindowDays[];
  source?: DataSourceLabel;
}): StudentTrendPacket {
  const now = new Date(input.date || new Date().toISOString());
  const allSignals = [
    ...input.learningSignals,
    ...input.conversationSignals,
    ...input.wellbeingSignals,
    ...input.physicalSignals,
    ...(input.backendHealthAlertSignals || [])
  ];
  const items = buildNegativePointItems(allSignals, now);
  const frequencyPenalty = computeFrequencyPenalty(items);
  const multiSourcePenalty = computeMultiSourcePenalty(items);
  const direction = computeDirection(items);
  const directionBonus = direction === "improving" ? 3 : direction === "worsening" ? -4 : 0;
  const rawTotal = items.reduce((sum, item) => sum + item.points, 0) + frequencyPenalty + multiSourcePenalty + directionBonus;
  const totalDeduction = Math.round(rawTotal);
  const confidence = computeConfidence(allSignals);
  const level = mapDeductionToLevel(totalDeduction);
  const sourceCounts: Partial<Record<TrendSource, number>> = {};
  items.forEach((item) => { sourceCounts[item.source] = (sourceCounts[item.source] || 0) + 1; });

  const topContributingFactors = [...items]
    .sort((a, b) => a.points - b.points)
    .slice(0, 3)
    .map((item) => item.reason);

  const summary: NegativePointSummary = {
    id: `nps_${input.studentId}_${now.getTime()}`,
    studentId: input.studentId,
    date: now.toISOString().slice(0, 10),
    windowDays: input.windows || [1, 3, 7, 14],
    totalDeduction,
    level,
    direction,
    confidence,
    items,
    topReasons: topContributingFactors,
    sourceCounts,
    generatedAt: now.toISOString(),
    source: input.source || "demo_seed"
  };
  const red = shouldRedAlert(summary);

  return {
    id: `pkt_${input.studentId}_${now.getTime()}`,
    studentId: input.studentId,
    generatedAt: now.toISOString(),
    windowDays: input.windows || [1, 3, 7, 14],
    level,
    totalDeduction,
    direction,
    confidence,
    negativeSummary: summary,
    trendSignals: allSignals,
    topContributingFactors,
    allowedAudiences: ["parent", "homeroom_teacher", "guardian_teacher", "admin", "school_support"],
    redAlert: red.redAlert,
    redAlertReasons: red.reasons,
    rawPrivateTextIncluded: false,
    source: input.source || "demo_seed"
  };
}
