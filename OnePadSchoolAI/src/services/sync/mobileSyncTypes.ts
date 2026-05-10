export type SyncEntityType =
  | 'student_support_event'
  | 'agent_tool_call'
  | 'evidence_item'
  | 'intervention_plan'
  | 'guardian_report'
  | 'teacher_insight'
  | 'audit_log';

export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'failed';

export type MobileSyncItem = {
  id: string;
  entityType: SyncEntityType;
  entityId: string;
  payload: unknown;
  status: SyncStatus;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
  lastError?: string;
};

export type SyncResult = {
  ok: boolean;
  syncedAt?: string;
  error?: string;
};
