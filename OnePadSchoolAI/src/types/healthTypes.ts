export type ActivityPreference =
  | 'walking'
  | 'stretching'
  | 'sports'
  | 'dance'
  | 'cycling'
  | 'other';

export type ReadinessLevel = 'fresh' | 'okay' | 'low_energy' | 'needs_rest';
export type SleepTrend = 'stable' | 'lower_than_usual' | 'improving';
export type MovementTrend = 'low' | 'balanced' | 'high';
export type EnergyTrend = 'low' | 'stable' | 'high';

export type LearningRecommendation =
  | 'normal_study'
  | 'short_sessions'
  | 'review_only'
  | 'take_break_first';

export type PhysicalHealthProfile = {
  studentId: string;
  age: number;
  grade: string;
  heightCm?: number;
  weightKg?: number;
  restingHeartRateBaseline?: number;
  activityPreference: ActivityPreference[];
  healthLimitationsSafeSummary?: string;
  dataConsent: {
    studentAssent: boolean;
    guardianConsent: boolean;
    schoolHealthAccess: boolean;
    wearableAccess: boolean;
  };
  updatedAt: string;
};

export type DailyBodyLog = {
  id: string;
  studentId: string;
  date: string;
  sleepHours?: number;
  sleepQuality?: 'low' | 'okay' | 'good';
  energyLevel: 1 | 2 | 3 | 4 | 5;
  fatigueLevel: 1 | 2 | 3 | 4 | 5;
  steps?: number;
  activeMinutes?: number;
  movementBreaks?: number;
  restingHeartRate?: number;
  studyMinutes?: number;
  note?: string;
};

export type BodyReadinessSnapshot = {
  studentId: string;
  date: string;
  readinessLevel: ReadinessLevel;
  sleepTrend: SleepTrend;
  movementTrend: MovementTrend;
  energyTrend: EnergyTrend;
  learningRecommendation: LearningRecommendation;
  physicalRecommendation: string;
  safeSummary: string;
  dataQuality?: 'low' | 'medium' | 'high';
  confidence?: number;
  source?: 'live_backend' | 'local_cache' | 'demo_seed';
  contributingFactors?: {
    sleep?: number;
    energy?: number;
    fatigue?: number;
    movement?: number;
    studyLoad?: number;
  };
};

export type MovementPlanItem = {
  id: string;
  day: string;
  title: string;
  durationMinutes: number;
  intensity: 'light' | 'moderate';
  description: string;
  completed: boolean;
};

export type WeeklyMovementPlan = {
  studentId: string;
  weekStartDate: string;
  items: MovementPlanItem[];
  safetyNote: string;
};

export type QuantSeriesPoint = {
  date: string;
  sleepHours: number;
  activeMinutes: number;
  fatigueLevel: number;
  energyLevel: number;
  studyMinutes: number;
  restingHeartRate: number;
};

export type TrendSlope = 'strong_up' | 'up' | 'flat' | 'down' | 'strong_down';

export type MentalPhysicalIndex = {
  readinessIndex: number;
  recoveryIndex: number;
  overloadRiskIndex: number;
  stressIndex: number;
  resilienceIndex: number;
};

export type StatisticalProfile = {
  mean: number;
  median: number;
  stdDev: number;
  min: number;
  max: number;
  latest: number;
  zScoreLatest: number;
  slope: TrendSlope;
};

export type ForecastPoint = {
  dayOffset: number;
  predictedReadinessIndex: number;
  lowerBand: number;
  upperBand: number;
};

export type HealthAnalyticsBundle = {
  points: QuantSeriesPoint[];
  indexes: MentalPhysicalIndex;
  sleepProfile: StatisticalProfile;
  activityProfile: StatisticalProfile;
  fatigueProfile: StatisticalProfile;
  studyLoadProfile: StatisticalProfile;
  hrProfile: StatisticalProfile;
  anomalySignals: string[];
  recommendations: string[];
  forecast7d: ForecastPoint[];
  correlationStudyVsFatigue: number;
  correlationSleepVsReadiness: number;
  analyticsMode?: 'basic' | 'limited_trend' | 'full';
  analyticsConfidence?: number;
  sampleSize?: number;
  generatedAt?: string;
};
