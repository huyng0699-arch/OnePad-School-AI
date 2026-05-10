import type { MobileSyncItem, SyncStatus } from './mobileSyncTypes';

let syncQueue: MobileSyncItem[] = [];

export const getMobileSyncQueue = (): MobileSyncItem[] => {
  return [...syncQueue];
};

export const resetMobileSyncQueue = (): void => {
  syncQueue = [];
};

export const enqueueMobileSyncItem = (
  item: Omit<MobileSyncItem, 'status' | 'retryCount' | 'createdAt' | 'updatedAt'>,
): MobileSyncItem => {
  const now = new Date().toISOString();
  const queued: MobileSyncItem = {
    ...item,
    status: 'pending',
    retryCount: 0,
    createdAt: now,
    updatedAt: now,
  };
  syncQueue = [...syncQueue, queued];
  return queued;
};

export const updateMobileSyncItemStatus = (
  id: string,
  status: SyncStatus,
  lastError?: string,
): MobileSyncItem | undefined => {
  let updatedItem: MobileSyncItem | undefined;
  syncQueue = syncQueue.map((item) => {
    if (item.id !== id) {
      return item;
    }
    updatedItem = {
      ...item,
      status,
      retryCount: status === 'failed' ? item.retryCount + 1 : item.retryCount,
      updatedAt: new Date().toISOString(),
      lastError,
    };
    return updatedItem;
  });
  return updatedItem;
};
