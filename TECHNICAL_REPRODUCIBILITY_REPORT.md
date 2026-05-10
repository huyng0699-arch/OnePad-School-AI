# OnePad School AI
## Technical Reproducibility Report for Gemma 4 Good Hackathon

## 1) Submission Goal
OnePad School AI is a local-first school ecosystem with Student, Parent, Teacher, Admin apps and one backend source-of-truth. The system focuses on structured school workflows, role-safe reporting, and trend analysis around each student.

Evidence:
- Backend source-of-truth and scripts: `backend/package.json`
- Student app runtime: `OnePadSchoolAI/package.json`
- Parent/Teacher/Admin web apps: `parent-app/package.json`, `teacher-app/package.json`, `school-admin-app/package.json`

## 2) System Architecture
Main components:
- `backend/` (official backend for this submission)
- `OnePadSchoolAI/` (student mobile app)
- `parent-app/` (parent web app)
- `teacher-app/` (teacher web app)
- `school-admin-app/` (admin web app)

Backend source-of-truth note:
- This clean repo excludes `OnePadSchoolAI/backend` (legacy path).

## 3) Student App (What is implemented)
Implemented capabilities in code include:
- Lesson reading and AI tutoring flows: `OnePadSchoolAI/src/screens/LessonReaderScreen.tsx`, `OnePadSchoolAI/src/screens/AiTutorScreen.tsx`
- Quiz generation/grading flows: `OnePadSchoolAI/src/screens/QuizScreen.tsx`, `OnePadSchoolAI/src/services/ai/aiPromptBuilder.ts`
- Wellbeing check-in and support signals: `OnePadSchoolAI/src/screens/WellbeingCheckInScreen.tsx`, `OnePadSchoolAI/src/services/wellbeing/wellbeingCheckInEngine.ts`
- Health and readiness views/services: `OnePadSchoolAI/src/screens/HealthDashboardScreen.tsx`, `OnePadSchoolAI/src/services/health/advancedHealthAnalyticsService.ts`, `OnePadSchoolAI/src/services/health/bodyReadinessEngine.ts`
- Event collection + sync queue: `OnePadSchoolAI/src/services/sync/studentEventCollector.ts`, `OnePadSchoolAI/src/services/sync/studentEventQueue.ts`, `OnePadSchoolAI/src/services/sync/studentSyncService.ts`

## 4) Teacher App (What is implemented)
Implemented capabilities in code include:
- Teacher support queue page: `teacher-app/app/support/page.tsx`
- Lesson authoring/studio and publish pipeline UI: `teacher-app/app/authoring/page.tsx`
- Teacher AI endpoint integration path: `teacher-app/app/api/teacher-ai/route.ts`
- Guardian case workspace: `teacher-app/app/guardian-cases/page.tsx`

## 5) Parent App (What is implemented)
Implemented capabilities in code include:
- Wellbeing & Learning Trend home summary: `parent-app/app/page.tsx`
- Health & Wellbeing Vault details and 14-day chart rendering: `parent-app/app/health-wellbeing-vault/page.tsx`
- Parent Support view and action list: `parent-app/app/support/page.tsx`
- Backend trend API client calls: `parent-app/lib/api.ts`

## 6) Admin App (What is implemented)
Implemented capabilities in code include:
- Trend overview page: `school-admin-app/app/health-wellbeing/page.tsx`
- Audit log page: `school-admin-app/app/audit-log/page.tsx`
- Trend overview API integration: `school-admin-app/lib/api.ts`

## 7) Backend Pipeline and Endpoints
Implemented backend evidence:
- Nightly job registration: `backend/src/app.module.ts` (imports `NightlyStudentSummaryJob`)
- Nightly job implementation: `backend/src/jobs/nightly-student-summary.job.ts`
- Trend endpoints:
  - Teacher support queue: `backend/src/modules/student-trends/student-trends.controller.ts` (`GET teacher/support-queue`)
  - Admin trend overview: `backend/src/modules/student-trends/student-trends.controller.ts` (`GET admin/schools/:schoolId/trend-overview`)
  - Manual nightly trigger: `backend/src/modules/student-trends/student-trends.controller.ts` (`POST admin/jobs/nightly-student-summary/run`)
- Audit endpoint: `backend/src/modules/health/health.controller.ts` (`GET v1/admin/audit-logs`)
- Trend persistence models: `backend/prisma/schema.prisma` (`StudentTrendReport`, `StudentTrendChartPoint`)

## 8) AI Provider Position (No overclaim)
The code currently supports provider modes including `template_fallback`.

Evidence:
- Provider union includes `template_fallback`: `backend/src/modules/student-trends/student-trends.service.ts`
- Fallback usage in backend trend service: `backend/src/modules/student-trends/student-trends.service.ts`
- Seed includes fallback provider sample: `backend/prisma/seed.ts`

Therefore this submission documents that backend nightly may run with `template_fallback` unless local runtime is connected.

## 9) Reproducible Run Commands
Backend:
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run prisma:seed
npm run build
npm run test:health
npm run test:trends
npm run start:dev
```

Student:
```bash
cd OnePadSchoolAI
npm install
npx tsc --noEmit
npx expo start
```

Parent:
```bash
cd parent-app
npm install
npm run build
npm run dev
```

Teacher:
```bash
cd teacher-app
npm install
npm run build
npm run dev
```

Admin:
```bash
cd school-admin-app
npm install
npm run build
npm run dev
```

## 10) Data and Compliance Scope
- Demo records are synthetic.
- No real student personal data is included.
- API keys and secrets are excluded.
- Local model weights are excluded.
- Build/cache outputs are excluded from this clean repo.

See also:
- `README.md`
- `LICENSE`
- `THIRD_PARTY_NOTICES.md`
- `docs/license-and-ip-compliance.md`
