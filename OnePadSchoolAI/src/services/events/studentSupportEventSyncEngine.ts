import { listAgentToolCallsByEvent } from '../agents/agentToolLogEngine';
import { listEvidenceByEvent } from '../evidence/evidenceEngine';
import { createInterventionPlan } from '../interventions/interventionPlanEngine';
import { enqueueMobileSyncItem } from '../sync/mobileSyncQueue';
import type { StudentSupportEvent } from '../../types/studentSupportEventTypes';

export const queueSupportEventForSync = (event: StudentSupportEvent): void => {
  enqueueMobileSyncItem({
    id: `sync_event_${event.id}`,
    entityType: 'student_support_event',
    entityId: event.id,
    payload: event,
  });

  const calls = listAgentToolCallsByEvent(event.id);
  calls.forEach((call) => {
    enqueueMobileSyncItem({
      id: `sync_tool_${call.id}`,
      entityType: 'agent_tool_call',
      entityId: call.id,
      payload: call,
    });
  });

  const evidenceItems = listEvidenceByEvent(event.id);
  evidenceItems.forEach((item) => {
    enqueueMobileSyncItem({
      id: `sync_evidence_${item.id}`,
      entityType: 'evidence_item',
      entityId: item.id,
      payload: item,
    });
  });

  const intervention = createInterventionPlan({
    eventId: event.id,
    studentId: event.studentId,
    learningIssue: event.learningIssue,
    masteryScore: event.masteryScore,
    readinessLevel: event.readinessLevel,
    supportRequested: event.supportRequested,
    evidenceLabels: evidenceItems.map((item) => item.label),
  });

  enqueueMobileSyncItem({
    id: `sync_plan_${intervention.id}`,
    entityType: 'intervention_plan',
    entityId: intervention.id,
    payload: intervention,
  });
};
