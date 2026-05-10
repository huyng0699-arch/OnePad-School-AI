import type { AiAction, AiProviderType } from './aiTypes';

const sensitiveActions = new Set<AiAction>([
  'wellbeing_checkin',
  'support_signal_summary',
  'redact_sensitive_report',
  'body_readiness',
  'movement_plan'
]);

const longReasoningActions = new Set<AiAction>([
  'guardian_report',
  'teacher_wellbeing_insight',
  'transcript_summary'
]);

export type StudentAiRoute = {
  route: 'local_first' | 'cloud_fallback' | 'default_provider';
  preferredProvider?: AiProviderType;
  note: string;
};

export const resolveStudentAiRoute = (
  action: AiAction,
  activeProvider: AiProviderType,
  localModelAvailable: boolean
): StudentAiRoute => {
  if (sensitiveActions.has(action) && localModelAvailable) {
    return {
      route: 'local_first',
      preferredProvider: activeProvider === 'gemini' ? 'cactus' : activeProvider,
      note: 'Sensitive school support action uses local-first routing when a local model is available.'
    };
  }

  if (longReasoningActions.has(action)) {
    return {
      route: 'cloud_fallback',
      preferredProvider: 'gemini',
      note: 'Long report or transcript action can use cloud fallback when configured.'
    };
  }

  return {
    route: 'default_provider',
    preferredProvider: activeProvider,
    note: 'Use the configured default provider.'
  };
};
