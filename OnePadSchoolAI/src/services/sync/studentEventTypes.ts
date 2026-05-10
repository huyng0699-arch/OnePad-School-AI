export type PrivacyLevel = 'normal' | 'sensitive' | 'private' | 'parent_controlled' | 'emergency_only';
export type Severity = 'low' | 'medium' | 'high' | 'urgent';
export type StudentEventType =
  | 'lesson_started' | 'lesson_completed' | 'ai_tutor_used' | 'local_ai_used' | 'cloud_ai_used'
  | 'quiz_started' | 'quiz_completed' | 'short_answer_submitted' | 'adaptive_level_changed'
  | 'support_requested' | 'teacher_help_requested' | 'low_confidence_signal' | 'frustration_signal'
  | 'group_work_activity' | 'collaboration_activity' | 'assignment_submitted' | 'learning_decline_signal'
  | 'health_signal_received' | 'wellbeing_signal_received' | 'social_integration_signal' | 'urgent_safety_signal'
  | 'ar_assignment_received' | 'ar_assignment_opened' | 'ar_assignment_completed' | 'ar_model_explained'
  | 'ar_quiz_completed' | 'transcript_summarized' | 'transcript_quiz_created';
export type StudentEventSource =
  | 'lesson' | 'ai_tutor' | 'quiz' | 'progress' | 'support' | 'group_work' | 'local_ai' | 'cloud_ai'
  | 'lecture_recorder' | 'ar_lab' | 'smartwatch' | 'health_app' | 'backend_rule' | 'local_ai_signal_engine'
  | 'parent_app' | 'teacher_app';

export type StudentEvent = {
  id: string;
  studentId: string;
  deviceId: string;
  sessionId: string;
  type: StudentEventType;
  source: StudentEventSource;
  severity: Severity;
  lessonId?: string;
  assignmentId?: string;
  quizId?: string;
  arAssignmentId?: string;
  safeSummary: string;
  metadataJson?: Record<string, unknown>;
  rawPrivateText?: string;
  privacyLevel: PrivacyLevel;
  visibleToTeacher: boolean;
  visibleToParent: boolean;
  visibleToSchoolAggregate: boolean;
  requiresParentConsent: boolean;
  requiresTeacherGuardianReview: boolean;
  createdAt: string;
};
