import AsyncStorage from '@react-native-async-storage/async-storage';
import { StudentEvent } from './studentEventTypes';

type QueueRecord = StudentEvent & { syncedAt?: string; failedAt?: string; failedError?: string };
const QUEUE_KEY = 'onepad_student_event_queue_v1';

async function readQueue(): Promise<QueueRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) as QueueRecord[] : [];
  } catch {
    return [];
  }
}
async function writeQueue(items: QueueRecord[]) {
  try {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(items));
  } catch {}
}

export async function enqueueEvent(event: StudentEvent) {
  const queue = await readQueue();
  queue.push(event);
  await writeQueue(queue);
}
export async function getPendingEvents(limit: number) {
  const queue = await readQueue();
  return queue.filter((item) => !item.syncedAt).slice(0, limit);
}
export async function markEventsSynced(eventIds: string[]) {
  const queue = await readQueue();
  const next = queue.map((item) => eventIds.includes(item.id) ? { ...item, syncedAt: new Date().toISOString() } : item);
  await writeQueue(next);
}
export async function markEventFailed(eventId: string, error: string) {
  const queue = await readQueue();
  const next = queue.map((item) => item.id === eventId ? { ...item, failedAt: new Date().toISOString(), failedError: error } : item);
  await writeQueue(next);
}
export async function getQueueStats() {
  const queue = await readQueue();
  const pending = queue.filter((item) => !item.syncedAt).length;
  const failed = queue.filter((item) => !item.syncedAt && item.failedAt).length;
  return { total: queue.length, pending, failed };
}
export async function clearSyncedEvents() {
  const queue = await readQueue();
  await writeQueue(queue.filter((item) => !item.syncedAt));
}
export async function getLastEvent() {
  const queue = await readQueue();
  return queue[queue.length - 1] ?? null;
}
