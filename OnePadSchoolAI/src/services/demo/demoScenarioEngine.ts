import { mockDemoScenarioSteps } from '../../data/mockDemoScenario';
import { listStudentSupportEvents } from '../events/studentSupportEventEngine';
import { queueSupportEventForSync } from '../events/studentSupportEventSyncEngine';
import { listAgentToolCallsByEvent } from '../agents/agentToolLogEngine';
import { listEvidenceByEvent } from '../evidence/evidenceEngine';
import { createInterventionPlan } from '../interventions/interventionPlanEngine';
import {
  getPermissionDecision,
  type AppRole,
} from '../permissions/permissionEngine';
import { getMobileSyncQueue, resetMobileSyncQueue } from '../sync/mobileSyncQueue';
import type { StudentSupportEvent } from '../../types/studentSupportEventTypes';

export const runDemoScenario = () => {
  const event = listStudentSupportEvents()[0];
  if (!event) {
    return null;
  }

  queueSupportEventForSync(event);
  const toolCalls = listAgentToolCallsByEvent(event.id);
  const evidence = listEvidenceByEvent(event.id);
  const intervention = createInterventionPlan({
    eventId: event.id,
    studentId: event.studentId,
    learningIssue: event.learningIssue,
    masteryScore: event.masteryScore,
    readinessLevel: event.readinessLevel,
    supportRequested: event.supportRequested,
    evidenceLabels: evidence.map((item) => item.label),
  });

  const permission = getPermissionDecision('homeroom_teacher', [
    'learning_mastery',
    'quiz_score',
    'body_readiness',
    'wellbeing_safe_summary',
    'private_reflection',
    'raw_ai_chat',
    'raw_body_logs',
    'support_signal',
    'audit_log',
  ]);

  return {
    steps: mockDemoScenarioSteps,
    event,
    toolCalls,
    evidence,
    intervention,
    permission,
    syncItems: getMobileSyncQueue(),
  };
};

export const resetDemoScenario = () => {
  resetMobileSyncQueue();
};

export const listScenarioStudents = (): StudentSupportEvent[] => {
  return listStudentSupportEvents();
};

export const getPermissionPreviewForRole = (role: AppRole) =>
  getPermissionDecision(role, [
    'learning_mastery',
    'quiz_score',
    'body_readiness',
    'wellbeing_safe_summary',
    'private_reflection',
    'raw_ai_chat',
    'raw_body_logs',
    'support_signal',
    'audit_log',
  ]);
