# Privacy Model

- Privacy levels: `normal | sensitive | private | parent_controlled | emergency_only`.
- Teacher sees learning-safe events; private and parent-controlled fields are sanitized.
- Parent controls health/wellbeing sharing through `ParentConsent`.
- Admin endpoints expose aggregate-only outputs and never raw private text.
- Engine entrypoint: `backend/src/modules/privacy/privacy-access.engine.ts`.
