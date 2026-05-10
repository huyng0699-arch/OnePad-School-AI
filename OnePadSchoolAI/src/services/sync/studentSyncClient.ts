import { getBackendBaseUrl } from './syncConfig';
import { StudentEvent } from './studentEventTypes';

async function safeFetch(path: string, init?: RequestInit) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    const response = await fetch(`${getBackendBaseUrl()}${path}`, { ...init, signal: controller.signal });
    clearTimeout(timeout);
    const json = await response.json().catch(() => null);
    return { ok: response.ok, status: response.status, data: json };
  } catch (error) {
    return { ok: false, status: 0, data: { message: error instanceof Error ? error.message : 'network_error' } };
  }
}

export const studentSyncClient = {
  postStudentEventsBatch(events: StudentEvent[]) {
    return safeFetch('/v1/student/events/batch', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ events }) });
  },
  getStudentBootstrap: () => safeFetch('/v1/student/bootstrap'),
  getStudentArAssignments: () => safeFetch('/v1/student/ar-assignments'),
  markArAssignmentOpened: (id: string) => safeFetch(`/v1/student/ar-assignments/${id}/opened`, { method: 'POST' }),
  markArAssignmentCompleted: (id: string) => safeFetch(`/v1/student/ar-assignments/${id}/completed`, { method: 'POST' }),
  getSyncStatus: () => safeFetch('/v1/student/sync-status'),
  getTeacherDemoReport: () => safeFetch('/v1/teacher/students/stu_001/report'),
  getParentDemoReport: () => safeFetch('/v1/parent/children/stu_001/report'),
  getAdminDemoOverview: () => safeFetch('/v1/admin/schools/school_001/overview')
};
