# OnePad School AI Architecture (Phase 1)

- Student App collects events through `src/services/sync/studentEventCollector.ts`.
- Offline-first queue is in `src/services/sync/studentEventQueue.ts`.
- Sync service batches to backend via `src/services/sync/studentSyncService.ts`.
- Backend app is isolated at `backend/` (NestJS + Prisma + SQLite).
- Event pipeline: `POST /v1/student/events/batch` -> Prisma -> baseline -> risk engines -> report builders.
