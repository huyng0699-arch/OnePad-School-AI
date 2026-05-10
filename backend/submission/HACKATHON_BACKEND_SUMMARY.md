# OnePad School AI Backend Summary

OnePad School AI backend is a central ecosystem demo service built with NestJS + Prisma + SQLite.

Why a central backend is needed:
- Student App generates real learning events.
- Backend validates, stores, and materializes those events.
- Backend creates safe role-based visibility for Teacher, Parent, and Admin APIs.

Student App event flow:
- Student app sends event batches to `/v1/student/events/batch`.
- Backend stores events and related materialized records (quiz, support, group work, local AI usage).
- Backend rebuilds Teacher/Parent/Admin reports after ingestion.

Local AI relationship:
- Cactus + Gemma 4 E2B on-device usage is recorded through `local_ai_used`.
- Backend does not replace local AI inference.
- Backend is the ecosystem reporting and accountability layer.
