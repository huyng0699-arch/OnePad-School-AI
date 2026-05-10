# Installation and Usage Guide

This guide is for hackathon judges and technical reviewers.

## 1) Prerequisites

- Node.js 18+ (recommended LTS)
- npm 9+
- Git
- For Student App mobile run: Expo CLI environment

## 2) Clone and Prepare

```bash
git clone <your-repo-url>
cd schoolfuture_github_clean
```

Copy environment templates:

- `backend/.env.example` -> `backend/.env`
- `OnePadSchoolAI/.env.example` -> `OnePadSchoolAI/.env`
- `parent-app/.env.example` -> `parent-app/.env`
- `teacher-app/.env.example` -> `teacher-app/.env`
- `school-admin-app/.env.example` -> `school-admin-app/.env`

Real API keys are not committed.

## 3) Backend Setup (Source of Truth)

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

Important:
- Main backend is `backend/`.
- `OnePadSchoolAI/backend/` is legacy/deprecated and intentionally excluded.

## 4) Student App (Expo)

```bash
cd OnePadSchoolAI
npm install
npx tsc --noEmit
npx expo start
```

## 5) Parent App

```bash
cd parent-app
npm install
npm run build
npm run dev
```

## 6) Teacher App

```bash
cd teacher-app
npm install
npm run build
npm run dev
```

## 7) School Admin App

```bash
cd school-admin-app
npm install
npm run build
npm run dev
```

## 8) Demo Flow for Review

1. Start backend and seed demo data.
2. Trigger/verify nightly student summary pipeline.
3. Open Parent App to review trend and wellbeing outputs.
4. Open Teacher App to review support queue and teaching actions.
5. Open Admin App to review aggregate and audit views.

## 9) Model and AI Runtime Notes

- Local model weights (Gemma/Cactus or similar) are not committed.
- If local runtime is enabled, model files must be downloaded separately under their own terms.
- Backend nightly may use `template_fallback` when local runtime is not connected.

## 10) What is intentionally excluded from this public repo

- API keys and secrets
- Local databases and logs
- Build outputs and caches
- Model weights and heavy artifacts
- APK/AAB artifacts
