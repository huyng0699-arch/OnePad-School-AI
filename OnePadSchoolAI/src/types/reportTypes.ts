import type { VisibleRole } from './wellbeingTypes';

export type GuardianReport = {
  id: string;
  studentId: string;
  period: 'daily' | 'weekly' | 'monthly';
  learningSummary: string;
  physicalReadinessSummary?: string;
  wellbeingSafeSummary?: string;
  homeRecommendations: string[];
  schoolRecommendations: string[];
  redactedFields: string[];
  generatedAt: string;
};

export type TeacherInsightReport = {
  id: string;
  studentId: string;
  teacherRole: VisibleRole;
  learningInsight: string;
  wellbeingSafeSummary?: string;
  suggestedIntervention: string[];
  hiddenFields: string[];
  generatedAt: string;
};

export type AuditLog = {
  id: string;
  actorRole: VisibleRole;
  action: string;
  studentId: string;
  visibleFields: string[];
  hiddenFields: string[];
  createdAt: string;
};
