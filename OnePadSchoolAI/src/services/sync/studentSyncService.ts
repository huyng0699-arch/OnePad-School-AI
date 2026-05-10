import { getPendingEvents, getQueueStats, markEventFailed, markEventsSynced } from './studentEventQueue';
import { studentSyncClient } from './studentSyncClient';

type SyncState = { state: 'idle' | 'syncing' | 'error'; pending: number; lastSyncedAt?: string; error?: string };
let syncState: SyncState = { state: 'idle', pending: 0 };
let listeners: Array<(next: SyncState) => void> = [];
let timer: ReturnType<typeof setTimeout> | null = null;
let isSyncing = false;

const emit = async (patch?: Partial<SyncState>) => {
  const stats = await getQueueStats();
  syncState = { ...syncState, ...patch, pending: stats.pending };
  listeners.forEach((fn) => fn(syncState));
};

export async function syncNow() {
  if (isSyncing) return;
  isSyncing = true;
  await emit({ state: 'syncing', error: undefined });
  try {
    const pending = await getPendingEvents(20);
    if (pending.length === 0) {
      await emit({ state: 'idle' });
      return;
    }
    const result = await studentSyncClient.postStudentEventsBatch(pending);
    if (!result.ok) {
      for (const item of pending) {
        await markEventFailed(item.id, String(result.data?.message ?? 'sync_failed'));
      }
      await emit({ state: 'error', error: String(result.data?.message ?? 'sync_failed') });
      return;
    }
    const accepted = (result.data?.accepted as string[] | undefined) ?? pending.map((p) => p.id);
    await markEventsSynced(accepted);
    await emit({ state: 'idle', lastSyncedAt: new Date().toISOString() });
  } finally {
    isSyncing = false;
  }
}

export function scheduleSyncSoon(ms = 1500) {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => { void syncNow(); }, ms);
}

export async function initializeSyncService() {
  await emit({ state: 'idle' });
  scheduleSyncSoon(1000);
}

export function getSyncStatus() {
  return syncState;
}

export function subscribeSyncStatus(listener: (next: SyncState) => void) {
  listeners.push(listener);
  listener(syncState);
  return () => {
    listeners = listeners.filter((item) => item !== listener);
  };
}
