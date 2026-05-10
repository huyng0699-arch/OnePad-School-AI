# Mobile Backend Sync Contract

## Endpoint list

1. `POST /api/mobile-sync`
2. `GET /api/students/:studentId/support-events`
3. `GET /api/students/:studentId/teacher-summary`
4. `GET /api/students/:studentId/parent-summary`
5. `GET /api/admin/audit-events`

## POST `/api/mobile-sync`

Request body:

```ts
type MobileSyncRequest = {
  id: string;
  entityType:
    | 'student_support_event'
    | 'agent_tool_call'
    | 'evidence_item'
    | 'intervention_plan'
    | 'guardian_report'
    | 'teacher_insight'
    | 'audit_log';
  entityId: string;
  payload: unknown;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  retryCount: number;
  createdAt: string;
  updatedAt: string;
};
```

Response:

```ts
type MobileSyncResponse = {
  ok: boolean;
  serverId?: string;
  syncedAt: string;
  error?: string;
};
```

## Backend storage tables

Required normalized tables:

1. `student_support_events`
2. `agent_tool_calls`
3. `evidence_items`
4. `intervention_plans`
5. `guardian_reports`
6. `teacher_insights`
7. `audit_logs`
8. `sync_events`

## Privacy requirements

1. `parent` and authorized `education_guardian` can receive safe personal summaries.
2. `subject_teacher` and `homeroom_teacher` receive role-safe summaries only.
3. Never include raw `privateReflection` or raw AI chat in parent/teacher summaries.
4. Keep `rawPrivateDataLocked` and role restrictions in sync payload metadata.
