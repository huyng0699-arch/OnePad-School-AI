# App Capabilities Guide

This document summarizes what each OnePad School AI app does in the hackathon flow.

## System Overview

OnePad School AI is a local-first school ecosystem with:
- Student-facing mobile learning app
- Parent-facing web insight app
- Teacher-facing web workflow app
- School admin governance app
- Backend pipeline for trend analysis, summaries, reports, and audit-safe outputs

## 1) Student App (`OnePadSchoolAI`)

Primary goals:
- Daily learning support
- Event logging for trend analysis
- Wellbeing and health-aware study support

Key capabilities:
- AI-assisted learning support during study flows
- Quiz and lesson support flows
- Learning behavior and progress signal capture
- Wellbeing check-in and support signal recording
- Health-related event inputs (lightweight metrics)
- Voice-related interaction and command support modules
- Local-first oriented AI routing and fallback behavior
- Sync queue/event pipeline integration with backend

Why it matters:
- Creates structured student events used by backend nightly analysis.

## 2) Parent App (`parent-app`)

Primary goals:
- Parent visibility into safe, role-appropriate student trends
- Actionable family support insights

Key capabilities:
- Wellbeing and learning trend views
- Health & wellbeing vault style charts
- Parent support recommendations/actions
- Progress and alert-oriented dashboard cards
- Role-safe data display with privacy-aware summaries

Why it matters:
- Converts backend trend outputs into understandable parent actions.

## 3) Teacher App (`teacher-app`)

Primary goals:
- Classroom support and intervention workflow
- Teaching operations and student support queue

Key capabilities:
- Teacher support queue and student follow-up views
- Assignment and classroom workflow pages
- Authoring-related pages for lesson support flows
- Guardian-related support context pages
- AI-assisted teacher tooling endpoints (configurable)

Why it matters:
- Turns trend/signal outputs into concrete educator actions.

## 4) School Admin App (`school-admin-app`)

Primary goals:
- School-level governance, oversight, and aggregate monitoring

Key capabilities:
- Aggregate health/wellbeing overviews
- Audit-log and accountability views
- Permission/policy related admin screens
- Cross-role operational snapshots (students/teachers/parents)
- AI usage and governance visibility sections

Why it matters:
- Supports leadership-level review and compliance tracking.

## 5) Backend (`backend`) - Source of Truth

Primary goals:
- Ingest events
- Process nightly trend and support pipelines
- Produce role-safe reports and chart points

Key capabilities:
- Student event ingestion and processing
- Nightly summary job orchestration
- Trend packet/report/chart generation
- Health/wellbeing test and trend test scripts
- Prisma schema/seed setup for demo reproducibility

Important artifacts in pipeline:
- NegativePointSummary
- StudentTrendPacket
- StudentTrendReport
- StudentTrendChartPoint

## 6) Privacy, Security, and Submission Scope

- No real student personal data is included.
- Demo records are synthetic.
- API keys/secrets are excluded.
- Model weights are excluded.
- Third-party components remain under their own licenses.
