import { syncItemToBackend } from './mobileSyncClient';
import {
  getMobileSyncQueue,
  updateMobileSyncItemStatus,
} from './mobileSyncQueue';
import type { MobileSyncItem } from './mobileSyncTypes';

export const syncPendingItems = async (): Promise<MobileSyncItem[]> => {
  const queue = getMobileSyncQueue();
  const pending = queue.filter((item) => item.status === 'pending' || item.status === 'failed');

  for (const item of pending) {
    updateMobileSyncItemStatus(item.id, 'syncing');
    const result = await syncItemToBackend({ ...item, status: 'syncing' });
    if (result.ok) {
      updateMobileSyncItemStatus(item.id, 'synced');
    } else {
      updateMobileSyncItemStatus(item.id, 'failed', result.error);
    }
  }

  return getMobileSyncQueue();
};
