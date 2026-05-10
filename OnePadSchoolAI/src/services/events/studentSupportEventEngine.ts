import { mockStudentSupportEvents } from '../../data/mockStudentSupportEvents';
import type { StudentSupportEvent } from '../../types/studentSupportEventTypes';

export const listStudentSupportEvents = (): StudentSupportEvent[] => {
  return [...mockStudentSupportEvents].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
};

export const getStudentSupportEventById = (
  eventId: string,
): StudentSupportEvent | undefined => {
  return mockStudentSupportEvents.find((event) => event.id === eventId);
};

export const markSupportEventSyncState = (
  event: StudentSupportEvent,
  ok: boolean,
  error?: string,
): StudentSupportEvent => {
  const now = new Date().toISOString();
  return {
    ...event,
    status: ok ? 'synced' : 'sync_failed',
    updatedAt: now,
    sync: {
      lastSyncAttemptAt: now,
      syncedAt: ok ? now : undefined,
      retryCount: ok ? event.sync.retryCount : event.sync.retryCount + 1,
      error,
    },
  };
};
