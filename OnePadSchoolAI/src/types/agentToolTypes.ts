export type StudentToolName =
  | 'lesson_context'
  | 'quiz'
  | 'mastery'
  | 'adaptive_path'
  | 'physical_profile'
  | 'body_readiness'
  | 'sleep_recovery'
  | 'movement_plan'
  | 'wellbeing_checkin'
  | 'learning_stress'
  | 'support_routing'
  | 'guardian_summary'
  | 'teacher_insight'
  | 'permission_redaction'
  | 'ar_learning'
  | 'lecture_scribe';

export type StudentToolResult<TData> = {
  ok: boolean;
  toolName: StudentToolName;
  data?: TData;
  error?: string;
};

export type StudentAgentContext = {
  studentId: string;
  lessonId?: string;
  subjectId?: string;
  pageNumber?: number;
  role?: string;
};
