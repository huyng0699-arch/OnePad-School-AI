export type TrendWindowDays = 1 | 3 | 7 | 14;

export type TrendLevel = "normal" | "watch" | "elevated" | "high" | "red";
export type TrendDirection = "improving" | "stable" | "worsening" | "unknown";
export type TrendConfidence = "low" | "medium" | "high";

export type TrendAudience =
  | "student"
  | "parent"
  | "subject_teacher"
  | "homeroom_teacher"
  | "guardian_teacher"
  | "admin"
  | "school_support";

export type TrendSource =
  | "learning"
  | "conversation"
  | "wellbeing"
  | "physical"
  | "teacher_note"
  | "parent_note"
  | "backend_alert";

export type TrendCategory =
  | "sleep"
  | "energy"
  | "fatigue"
  | "movement"
  | "study_load"
  | "learning_behavior"
  | "wellbeing"
  | "social_comfort"
  | "support_request"
  | "conversation_signal"
  | "backend_health_alert"
  | "overall";

export type DataSourceLabel = "live_backend" | "local_cache" | "demo_seed";
export type ReportProvider = "gemma_local_cactus" | "backend_cloud" | "template_fallback";

export interface NegativePointItem {
  category: TrendCategory;
  points: number;
  reason: string;
  evidence: string[];
  source: TrendSource;
  severity: 1 | 2 | 3 | 4 | 5;
  createdAt?: string;
}

export interface NegativePointSummary {
  id: string;
  studentId: string;
  date: string;
  windowDays: TrendWindowDays[];
  totalDeduction: number;
  level: TrendLevel;
  direction: TrendDirection;
  confidence: TrendConfidence;
  items: NegativePointItem[];
  topReasons: string[];
  sourceCounts: Partial<Record<TrendSource, number>>;
  generatedAt: string;
  source: DataSourceLabel;
}

export interface TrendSignal {
  id: string;
  studentId: string;
  category: TrendCategory;
  source: TrendSource;
  type: string;
  severity: 1 | 2 | 3 | 4 | 5;
  confidence: TrendConfidence;
  createdAt: string;
  lessonId?: string;
  safeLabel: string;
  safeSummary?: string;
  rawTextLocked?: boolean;
  visibleToRoles?: TrendAudience[];
}

export interface StudentTrendPacket {
  id: string;
  studentId: string;
  generatedAt: string;
  windowDays: TrendWindowDays[];
  level: TrendLevel;
  totalDeduction: number;
  direction: TrendDirection;
  confidence: TrendConfidence;
  negativeSummary: NegativePointSummary;
  trendSignals: TrendSignal[];
  topContributingFactors: string[];
  allowedAudiences: TrendAudience[];
  redAlert: boolean;
  redAlertReasons: string[];
  rawPrivateTextIncluded: false;
  source: DataSourceLabel;
}

export interface ParentTrendChartPoint {
  date: string;
  totalDeduction: number;
  level: TrendLevel;
  sleepDeduction: number;
  fatigueDeduction: number;
  studyLoadDeduction: number;
  learningBehaviorDeduction: number;
  wellbeingDeduction: number;
  conversationDeduction: number;
  supportSignalDeduction: number;
}

export interface ParentTrendReportDto {
  studentId: string;
  childName: string;
  latestPacketId: string;
  level: TrendLevel;
  redAlert: boolean;
  title: string;
  summary: string;
  keyFactors: string[];
  suggestedActions: string[];
  chart: ParentTrendChartPoint[];
  generatedAt: string;
  provider: ReportProvider;
  source: DataSourceLabel;
}
