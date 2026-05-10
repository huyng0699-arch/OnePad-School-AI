export type StudentSupportEventSource =
  | 'lesson_quiz'
  | 'mastery_update'
  | 'body_readiness'
  | 'wellbeing_checkin'
  | 'demo_scenario';

export type StudentSupportEventStatus =
  | 'draft'
  | 'ready_to_sync'
  | 'synced'
  | 'sync_failed';

export type StudentSupportEvent = {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  createdAt: string;
  updatedAt: string;
  source: StudentSupportEventSource;
  status: StudentSupportEventStatus;
  subjectId?: string;
  subjectName?: string;
  lessonId?: string;
  lessonTitle?: string;
  learningIssue?: string;
  masterySkillId?: string;
  masterySkillName?: string;
  masteryScore?: number;
  quizScore?: number;
  quizTotal?: number;
  repeatedMistake?: string;
  readinessLevel?: 'fresh' | 'okay' | 'low_energy' | 'needs_rest';
  sleepTrend?: 'stable' | 'lower_than_usual' | 'improving';
  energyTrend?: 'low' | 'stable' | 'high';
  movementTrend?: 'low' | 'balanced' | 'high';
  wellbeingSafeSummary?: string;
  supportRequested: boolean;
  supportSeverity: 'none' | 'low' | 'medium' | 'high';
  teacherSummary: string;
  parentSummary: string;
  adminAuditSummary: string;
  rawPrivateDataLocked: boolean;
  privateFieldsRedacted: string[];
  evidenceIds: string[];
  interventionPlanId?: string;
  toolCallIds: string[];
  sync: {
    lastSyncAttemptAt?: string;
    syncedAt?: string;
    retryCount: number;
    error?: string;
  };
};
