export type AgentToolName =
  | 'lesson_context'
  | 'quiz'
  | 'mastery'
  | 'chat'
  | 'summarize'
  | 'explain'
  | 'body_readiness'
  | 'sleep_recovery'
  | 'movement_plan'
  | 'adaptive_path'
  | 'wellbeing_checkin'
  | 'support_signal_summary'
  | 'permission_redaction'
  | 'guardian_report'
  | 'teacher_wellbeing_insight'
  | 'teacher_summary'
  | 'parent_summary'
  | 'intervention_plan'
  | 'backend_sync'
  | 'audit_log';

export type AgentToolCallStatus = 'success' | 'skipped' | 'blocked' | 'failed';

export type AgentToolCall = {
  id: string;
  eventId: string;
  studentId: string;
  toolName: AgentToolName;
  status: AgentToolCallStatus;
  inputSummary: string;
  outputSummary: string;
  privacyNote?: string;
  createdAt: string;
};
