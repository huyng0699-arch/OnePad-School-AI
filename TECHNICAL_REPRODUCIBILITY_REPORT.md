# OnePad School AI
## Technical Reproducibility Report for Gemma 4 Good Hackathon

## 1) Target Track
- Primary: **Future of Education**
- Local runtime path: **Cactus/Gemma provider path is represented in code and can be enabled when the required runtime endpoint is configured.**

Evidence:
- Student app includes Cactus dependency: `OnePadSchoolAI/package.json` (`cactus-react-native`)
- Backend provider modes include local cactus path: `backend/src/modules/student-trends/student-trends.service.ts` (`ProviderType = "gemma_local_cactus" | "backend_cloud" | "template_fallback"`)

## 2) Where Gemma 4 is used in this codebase
### 2.1 AI Tutor (Student App)
- Student AI tutoring and prompt builders:
  - `OnePadSchoolAI/src/screens/LessonReaderScreen.tsx`
  - `OnePadSchoolAI/src/screens/AiTutorScreen.tsx`
  - `OnePadSchoolAI/src/services/ai/aiPromptBuilder.ts`

### 2.2 Teacher Authoring
- Teacher authoring studio + publish flow UI:
  - `teacher-app/app/authoring/page.tsx`
- Backend AI authoring provider/service:
  - `backend/src/modules/ai-authoring/ai-authoring-provider.service.ts`
  - `backend/src/modules/ai-authoring/ai-authoring.service.ts`

### 2.3 Structured Report/Recommendation
- Backend builds trend packet and report:
  - `backend/src/modules/student-trends/student-trends.service.ts`
- Parent report/chart endpoints:
  - `backend/src/modules/student-trends/student-trends.controller.ts`

### 2.4 Local/Cactus path (if available)
- Local/Cactus path is represented in provider modes and can be used when the required runtime endpoint is configured.
- Backend checks `GEMMA_LOCAL_CACTUS_URL` and attempts local generation:
  - `backend/src/modules/student-trends/student-trends.service.ts` (`generateRecommendation`)

### 2.5 Current backend nightly default reality
- Backend nightly recommendation can fall back to `template_fallback` when local/cloud generation is unavailable:
  - `backend/src/modules/student-trends/student-trends.service.ts`
- Seed also contains fallback provider sample:
  - `backend/prisma/seed.ts`

## 3) Five student data groups used by trend pipeline
The implemented category breakdown in backend includes exactly these groups:
- `physical`
- `wellbeing`
- `learning`
- `conversation` (AI conversation signals)
- `teacherParent` (teacher/parent notes and school flags)

Evidence:
- Category breakdown construction: `backend/src/modules/student-trends/student-trends.service.ts`
- Parent vault UI renders these categories directly:
  - `parent-app/app/health-wellbeing-vault/page.tsx`

## 4) Trend algorithm evidence
### 4.1 NegativePointSummary
- Backend constructs `latestSummary` containing total deduction, level, direction, confidence, items, source counts.
- Evidence: `backend/src/modules/student-trends/student-trends.service.ts`

### 4.2 StudentTrendPacket
- Backend builds packet with fields like level, redAlert, direction, confidence, totalDeduction, categoryBreakdown, provider, source.
- Evidence: `backend/src/modules/student-trends/student-trends.service.ts`

### 4.3 StudentTrendReport
- Backend persists parent report entries in Prisma model `StudentTrendReport`.
- Evidence:
  - Model: `backend/prisma/schema.prisma`
  - Creation logic: `backend/src/modules/student-trends/student-trends.service.ts`

### 4.4 StudentTrendChartPoint
- Backend persists chart points in Prisma model `StudentTrendChartPoint`.
- Evidence:
  - Model: `backend/prisma/schema.prisma`
  - Creation logic: `backend/src/modules/student-trends/student-trends.service.ts`

### 4.5 Levels
- Implemented levels: `normal`, `watch`, `elevated`, `high`, `red`.
- Evidence: `backend/src/modules/student-trends/student-trends.service.ts` (`TrendLevel`, `mapScoreToLevel`)

### 4.6 Scoring factors reflected in code behavior
The scoring logic is deterministic and includes practical proxies for:
- Severity (`high/medium/low` mapped to points)
- Recency (14-day window and timestamped items)
- Frequency (repeated events/counters)
- Multi-source signals (events + alerts + support + teacher/parent flags)
- Trend direction (`worsening` vs `stable` assigned in summary)

Evidence:
- `evaluateAndSave` pipeline in `backend/src/modules/student-trends/student-trends.service.ts`

## 5) Parent UI demonstration coverage
### 5.1 Wellbeing & Learning Trend
- Parent home trend summary page:
  - `parent-app/app/page.tsx`

### 5.2 Health & Wellbeing Vault 14-day chart
- 14-day chart and category metrics:
  - `parent-app/app/health-wellbeing-vault/page.tsx`

### 5.3 Parent Support item
- Priority support card and action list:
  - `parent-app/app/support/page.tsx`

### 5.4 Recommendation panel
- "Gemma 4 Recommendation" panel is rendered in parent vault page:
  - `parent-app/app/health-wellbeing-vault/page.tsx`
- Provider badge explicitly shows runtime source (`GEMMA LOCAL` / `BACKEND CLOUD` / `TEMPLATE FALLBACK`).

## 6) Training section (truthful status)
Current repository status:
- **No custom training performed**
- **No fine-tuning performed**
- **No training loss function used**
- **No training hyperparameters used**

This submission uses runtime inference + deterministic backend scoring + structured report generation.

## 7) Reproducible Demo Workflow
### 7.1 Backend setup
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

### 7.2 Trigger nightly pipeline
- API route (admin): `POST /v1/admin/jobs/nightly-student-summary/run`
- Evidence: `backend/src/modules/student-trends/student-trends.controller.ts`

### 7.3 Verify parent report/chart
- Parent report endpoint: `GET /v1/parent/children/:studentId/trend-report`
- Parent chart endpoint: `GET /v1/parent/children/:studentId/trend-chart?days=14`
- UI pages:
  - `parent-app/app/page.tsx`
  - `parent-app/app/health-wellbeing-vault/page.tsx`
  - `parent-app/app/support/page.tsx`

### 7.4 Verify teacher queue
- Endpoint: `GET /v1/teacher/support-queue`
- UI: `teacher-app/app/support/page.tsx`

### 7.5 Verify admin overview + audit
- Trend overview endpoint: `GET /v1/admin/schools/:schoolId/trend-overview`
- Audit endpoint: `GET /v1/admin/audit-logs`
- UI:
  - `school-admin-app/app/health-wellbeing/page.tsx`
  - `school-admin-app/app/audit-log/page.tsx`

## 8) What This Repository Demonstrates
This repository demonstrates an end-to-end school AI workflow:

- Teacher App creates or publishes learning content.
- Student App supports lesson reading, AI tutoring, quiz flow, wellbeing check-in, health/readiness views, and lightweight event logging.
- Backend stores synthetic demo data, runs the nightly trend pipeline, and creates NegativePointSummary, StudentTrendPacket, StudentTrendReport, and StudentTrendChartPoint records.
- Parent App renders Wellbeing & Learning Trend, Health & Wellbeing Vault charts, Parent Support items, and the recommendation panel.
- Teacher App renders support queue data from the backend.
- Admin App renders aggregate trend overview and audit logs.
- The public repo excludes real student data, secrets, model weights, APK/AAB artifacts, node_modules, build output, and local databases.

## 9) Reproducibility Checklist
After setup and seeding, a reviewer/developer can verify:

- Backend builds successfully.
- Prisma schema can be generated and pushed.
- Synthetic demo data can be seeded.
- The nightly trend pipeline can be triggered through `POST /v1/admin/jobs/nightly-student-summary/run`.
- Parent trend report endpoint returns a structured DTO.
- Parent 14-day chart endpoint returns trend chart points.
- Parent Home renders Wellbeing & Learning Trend.
- Parent Health & Wellbeing Vault renders the 14-day chart and five-category breakdown.
- Parent Support renders priority support items when available.
- Teacher Support Queue reads backend data.
- Admin Health & Wellbeing page reads aggregate trend data.
- Admin Audit Log reads audit entries.
- Provider badges show `GEMMA LOCAL`, `BACKEND CLOUD`, or `TEMPLATE FALLBACK` according to runtime state.
- Source badges distinguish live/backend/demo data where implemented.

## 10) Limitations (explicit, no overclaim)
- Demo data in this public repo is **synthetic only**; no real student data is included.
- Backend nightly recommendation path may run with `template_fallback` unless local/cloud provider is connected.
- Local Gemma/Cactus in backend nightly is **not guaranteed fully connected** in every runtime environment without provider setup.

## 11) Compliance Summary
- No real student personal data committed.
- No API keys/credentials committed.
- No model weights committed.
- Third-party licenses remain under their respective terms.

See:
- `README.md`
- `LICENSE`
- `THIRD_PARTY_NOTICES.md`
- `docs/license-and-ip-compliance.md`

