export type AiAction =
  | 'summarize'
  | 'explain'
  | 'quiz'
  | 'chat'
  | 'voice_command'
  | 'grade_answer'
  | 'grade_answer_batch'
  | 'transcript_summary'
  | 'ar_explain'
  | 'physical_summary'
  | 'body_readiness'
  | 'movement_plan'
  | 'sleep_recovery'
  | 'wellbeing_checkin'
  | 'learning_stress_analysis'
  | 'support_signal_summary'
  | 'guardian_report'
  | 'teacher_wellbeing_insight'
  | 'redact_sensitive_report';

export type AiProviderType = 'gemini' | 'local_server' | 'cactus' | 'local_ai';
export type AiContextMode =
  | 'general'
  | 'intent'
  | 'lesson'
  | 'quiz'
  | 'assessment'
  | 'ar'
  | 'transcript'
  | 'schedule'
  | 'grades'
  | 'support'
  | 'report'
  | 'group_work';

export type AiRequest = {
  action: AiAction;
  contextMode?: AiContextMode;
  lessonId?: string;
  pageNumber?: number;
  prompt: string;
  contextText: string;
  userText?: string;
  metadata?: Record<string, unknown>;
  onToken?: (token: string) => void;
  signal?: AbortSignal;
};

export type AiResult = {
  ok: true;
  text: string;
  raw?: unknown;
} | {
  ok: false;
  error: string;
  raw?: unknown;
};

export interface AiProvider {
  generate(request: AiRequest): Promise<AiResult>;
}
