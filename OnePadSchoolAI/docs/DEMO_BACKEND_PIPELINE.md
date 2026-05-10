# Demo Backend Pipeline

1. `backend/src/modules/student-events/student-events.controller.ts` receives Student App events.
2. `backend/src/modules/student-events/student-events.service.ts` validates, deduplicates, stores, then triggers engines.
3. `backend/src/modules/baseline/baseline.service.ts` updates personal baseline only per student.
4. `backend/src/modules/alerts/student-protection-alert.engine.ts` orchestrates risk engines.
5. `backend/src/modules/alerts/academic-risk.engine.ts` handles learning decline.
6. `backend/src/modules/alerts/wellbeing-risk.engine.ts` handles support/frustration trends.
7. `backend/src/modules/alerts/physical-health-risk.engine.ts` handles health urgency.
8. `backend/src/modules/alerts/social-integration-risk.engine.ts` handles group/social risk.
9. `backend/src/modules/privacy/privacy-access.engine.ts` governs role visibility/sanitization.
10. `backend/src/modules/reports/teacher-report.builder.ts` builds teacher-safe report.
11. `backend/src/modules/reports/parent-report.builder.ts` builds parent report.
12. `backend/src/modules/reports/school-aggregate.builder.ts` builds aggregate-only admin report.
13. `backend/src/modules/consent/consent.service.ts` handles share/revoke teacher consent.
14. `backend/src/modules/ar-assignments` stores and serves AR assignments/progress.
15. `src/services/sync/studentEventCollector.ts` defines Student App event creation.
16. `src/services/sync/studentEventQueue.ts` keeps offline queue.
17. `src/services/sync/studentSyncService.ts` handles retry/batch sync.
18. `src/components/OnePadBackendSyncPanel.tsx` shows live pipeline demo controls.
