# API Endpoints

## GET /health
- Purpose: backend liveness check.
- Main response: `ok`, service name, server time.

## GET /v1/student/bootstrap
- Purpose: student bootstrap profile and local AI policy.
- Main response: student profile, feature flags, local AI defaults.

## POST /v1/student/events/batch
- Purpose: ingest student event batches.
- Main response: `ok`, `accepted[]`, `rejected[]` with reason for invalid events.

## GET /v1/teacher/classes/class_8a/dashboard
- Purpose: teacher class dashboard summary.
- Main response: student list with safe learning/support summaries.

## GET /v1/teacher/students/stu_001/report
- Purpose: teacher view for a single student.
- Main response: role-safe report with recent event safe summaries.

## GET /v1/parent/children/stu_001/report
- Purpose: parent-facing child report.
- Main response: non-sensitive learning/progress summaries and parent action suggestion.

## GET /v1/admin/schools/school_001/overview
- Purpose: admin aggregate overview.
- Main response: total students, AI usage totals, support signal counts, assignment completion rate.

## GET /v1/admin/ai-usage
- Purpose: AI usage detail for admin demo.
- Main response: `localAiEvents`, `cloudAiEvents`, `models[]` with model/quantization counts.

## GET /v1/admin/db-stats
- Purpose: database object counters for demo verification.
- Main response: counts for students, events, quiz results, reports, and materialized tables.

## POST /v1/demo/seed-events
- Purpose: inject 3 demo events for quick end-to-end demo.
- Main response: same batch ingestion contract (`ok`, `accepted`, `rejected`).
