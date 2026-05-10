# Technical Proof

- `src/modules/student-events/student-events.service.ts`
  - Accepts batch events, validates data, deduplicates event IDs, writes DB rows.

- `src/modules/reports/safe-summary.engine.ts`
  - Rule-based safe summary generation (no cloud AI calls).

- `src/modules/reports/role-report.builder.ts`
  - Role-separated report text composition for Teacher/Parent/Admin contexts.

- `prisma/schema.prisma`
  - Real SQLite schema for event pipeline and report materialization tables.

- `public/index.html`
  - Live backend demo console using real fetch calls.

- `scripts/test-pipeline.ps1`
  - End-to-end API pipeline verification script.
