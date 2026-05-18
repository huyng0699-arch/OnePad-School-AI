import { getBackendBaseUrl } from './syncConfig';
import { getOrCreateDeviceId, getSessionId } from './deviceIdentityService';
import { buildStudentAuthHeaders, getStudentIdentity } from './studentIdentityService';
import { StudentEvent } from './studentEventTypes';

async function safeFetch(path: string, init?: RequestInit) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    const authHeaders = await buildStudentAuthHeaders();
    const response = await fetch(`${getBackendBaseUrl()}${path}`, {
      ...init,
      headers: { ...authHeaders, ...(init?.headers ?? {}) },
      signal: controller.signal
    });
    clearTimeout(timeout);
    const json = await response.json().catch(() => null);
    return { ok: response.ok, status: response.status, data: json };
  } catch (error) {
    return { ok: false, status: 0, data: { message: error instanceof Error ? error.message : 'network_error' } };
  }
}

function normalizeEventForSchoolBackend(event: StudentEvent) {
  return {
    id: event.id,
    studentId: event.studentId,
    deviceId: event.deviceId,
    sessionId: event.sessionId,
    type: event.type,
    source: event.source,
    severity: event.severity,
    lessonId: event.lessonId,
    pageNumber: typeof event.metadataJson?.pageNumber === 'number' ? event.metadataJson.pageNumber : undefined,
    assignmentId: event.assignmentId,
    quizId: event.quizId,
    groupWorkId: event.arAssignmentId,
    safeSummary: event.safeSummary,
    metadata: {
      ...(event.metadataJson ?? {}),
      arAssignmentId: event.arAssignmentId
    },
    rawPrivateText: event.rawPrivateText,
    privacyLevel: event.privacyLevel,
    createdAt: event.createdAt
  };
}

export const studentSyncClient = {
  async postStudentEventsBatch(events: StudentEvent[]) {
    const deviceId = await getOrCreateDeviceId();
    const sessionId = await getSessionId();
    return safeFetch('/v1/student/events/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId,
        sessionId,
        events: events.map(normalizeEventForSchoolBackend)
      })
    });
  },
  getStudentBootstrap: async () => {
    const identity = await getStudentIdentity();
    return safeFetch(`/v1/student/bootstrap?studentId=${encodeURIComponent(identity.studentId)}`);
  },
  getStudentArAssignments: () => safeFetch('/v1/student/ar-assignments'),
  markArAssignmentOpened: (id: string) => safeFetch(`/v1/student/ar-assignments/${id}/opened`, { method: 'POST' }),
  markArAssignmentCompleted: (id: string) => safeFetch(`/v1/student/ar-assignments/${id}/completed`, { method: 'POST' }),
  getSyncStatus: () => safeFetch('/v1/student/sync-status'),
  getTeacherDemoReport: () => safeFetch('/v1/teacher/students/stu_001/report'),
  getParentDemoReport: () => safeFetch('/v1/parent/children/stu_001/report'),
  getAdminDemoOverview: () => safeFetch('/v1/admin/schools/school_001/overview')
};
