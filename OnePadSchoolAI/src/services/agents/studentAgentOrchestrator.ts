import { generateAiResponse } from '../ai/aiClient';
import type { AiContextMode, AiResult } from '../ai/aiTypes';
import { studentToolRegistry } from './studentToolRegistry';
import type { ExtendedAiAction } from './agentActionTypes';
import { recordAgentToolCall } from './agentToolLogEngine';
import type { AgentToolName } from '../../types/agentToolLogTypes';
import type { DailyBodyLog, PhysicalHealthProfile } from '../../types/healthTypes';
import type { SupportSignal } from '../../types/wellbeingTypes';

export type StudentAgentResult = {
  title: string;
  summary: string;
  payload?: unknown;
};

export type RunStudentAgentTurnInput = {
  action: ExtendedAiAction;
  prompt: string;
  contextText: string;
  contextMode?: AiContextMode;
  lessonId?: string;
  pageNumber?: number;
  userText?: string;
  studentId?: string;
  eventId?: string;
  metadata?: Record<string, unknown>;
  onToken?: (token: string) => void;
  bodyLogs?: DailyBodyLog[];
  physicalProfile?: PhysicalHealthProfile;
  supportSignals?: SupportSignal[];
};

export type RunStudentAgentTurnResult = {
  response: AiResult;
  toolCalls: AgentToolName[];
};

export const SENSITIVE_LOCAL_FIRST_ACTIONS: ExtendedAiAction[] = [
  'wellbeing_checkin',
  'support_signal_summary',
  'redact_sensitive_report',
  'body_readiness',
  'movement_plan'
];

const toToolName = (action: ExtendedAiAction): AgentToolName => {
  if (action === 'chat') return 'chat';
  if (action === 'summarize') return 'summarize';
  if (action === 'explain') return 'explain';
  if (action === 'guardian_report') return 'guardian_report';
  if (action === 'teacher_wellbeing_insight') return 'teacher_wellbeing_insight';
  if (action === 'support_signal_summary') return 'support_signal_summary';
  if (action === 'sleep_recovery') return 'sleep_recovery';
  return action as AgentToolName;
};

function getContextToolOutput(input: RunStudentAgentTurnInput): string | null {
  if (input.contextMode !== 'lesson' && input.contextMode !== 'quiz') {
    return null;
  }
  const source = input.contextText.trim();
  if (!source) {
    return null;
  }
  const summary = source.length > 420 ? `${source.slice(0, 420)}...` : source;
  recordAgentToolCall({
    eventId: input.eventId ?? `evt_${Date.now()}`,
    studentId: input.studentId ?? 'stu_001',
    toolName: 'lesson_context',
    status: 'success',
    inputSummary: `lesson=${input.lessonId ?? 'active'} page=${input.pageNumber ?? '-'}`,
    outputSummary: `Prepared lesson context for ${input.action}.`
  });
  return `Lesson context tool output:\n${summary}`;
}

function runLocalToolPreview(input: RunStudentAgentTurnInput): string | null {
  const studentId = input.studentId ?? 'student_minh_001';
  switch (input.action) {
    case 'body_readiness': {
      const item = studentToolRegistry.getBodyReadiness({ studentId, bodyLogs: input.bodyLogs });
      return item.safeSummary;
    }
    case 'movement_plan': {
      const item = studentToolRegistry.getMovementPlan({
        studentId,
        bodyLogs: input.bodyLogs,
        profile: input.physicalProfile
      });
      return item.safetyNote;
    }
    case 'sleep_recovery': {
      const item = studentToolRegistry.getSleepRecovery({ bodyLogs: input.bodyLogs });
      return item.recommendation;
    }
    case 'guardian_report': {
      const item = studentToolRegistry.getGuardianReport({ studentId, bodyLogs: input.bodyLogs, supportSignals: input.supportSignals });
      return item.learningSummary;
    }
    case 'teacher_wellbeing_insight': {
      const item = studentToolRegistry.getTeacherInsight({ studentId, bodyLogs: input.bodyLogs, supportSignals: input.supportSignals });
      return item.learningInsight;
    }
    default:
      return null;
  }
}

function recordTool(input: RunStudentAgentTurnInput, status: 'success' | 'failed', outputSummary: string) {
  recordAgentToolCall({
    eventId: input.eventId ?? `evt_${Date.now()}`,
    studentId: input.studentId ?? 'stu_001',
    toolName: toToolName(input.action),
    status,
    inputSummary: `mode=${input.contextMode ?? 'general'} prompt_length=${input.prompt.length}`,
    outputSummary
  });
}

export async function runStudentAgentTurn(input: RunStudentAgentTurnInput): Promise<RunStudentAgentTurnResult> {
  const contextToolOutput = getContextToolOutput(input);
  const localPreview = runLocalToolPreview(input);
  if (localPreview) {
    recordTool(input, 'success', `Local tool output prepared: ${localPreview.slice(0, 120)}`);
  }

  const toolContext = [contextToolOutput, localPreview ? `Local student tool output:\n${localPreview}` : null]
    .filter(Boolean)
    .join('\n\n');
  const prompt = toolContext
    ? `${input.prompt}\n\nUse these tool outputs as trusted app data:\n${toolContext}`
    : input.prompt;
  const contextText = toolContext
    ? `${input.contextText}\n\n${toolContext}`
    : input.contextText;

  const response = await generateAiResponse({
    action: input.action,
    contextMode: input.contextMode,
    lessonId: input.lessonId,
    pageNumber: input.pageNumber,
    prompt,
    contextText,
    userText: input.userText,
    onToken: input.onToken,
    metadata: {
      ...(input.metadata ?? {}),
      agentLocalToolPreview: localPreview ?? undefined
    }
  });

  if (!response.ok) {
    recordTool(input, 'failed', response.error);
    return { response, toolCalls: [toToolName(input.action)] };
  }

  recordTool(input, 'success', response.text.slice(0, 180));
  return { response, toolCalls: [toToolName(input.action)] };
}

export const runStudentAgentAction = (action: ExtendedAiAction): StudentAgentResult => {
  switch (action) {
    case 'body_readiness': {
      const readiness = studentToolRegistry.getBodyReadiness();
      return { title: 'Body Readiness', summary: readiness.safeSummary, payload: readiness };
    }
    case 'movement_plan': {
      const plan = studentToolRegistry.getMovementPlan();
      return { title: 'Movement Plan', summary: plan.safetyNote, payload: plan };
    }
    case 'sleep_recovery': {
      const sleep = studentToolRegistry.getSleepRecovery();
      return { title: 'Sleep Recovery', summary: sleep.recommendation, payload: sleep };
    }
    case 'guardian_report': {
      const report = studentToolRegistry.getGuardianReport();
      return { title: 'Guardian Report', summary: report.learningSummary, payload: report };
    }
    case 'teacher_wellbeing_insight': {
      const report = studentToolRegistry.getTeacherInsight();
      return { title: 'Teacher Insight', summary: report.learningInsight, payload: report };
    }
    default:
      return {
        title: 'Unsupported local tool action',
        summary: 'This action should be handled by the existing AI client or another tool.'
      };
  }
};
