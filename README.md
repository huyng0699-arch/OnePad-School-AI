# OnePad School AI

OnePad School AI is a local-first school AI ecosystem connecting Student, Parent, Teacher, Admin apps with a backend trend analysis pipeline, role-safe reports, and support workflows around each student.

## License and IP Compliance

This public hackathon submission of OnePad School AI is licensed under CC BY 4.0 unless otherwise noted.

You are free to share and adapt the project, including for commercial purposes, as long as appropriate credit is given.

Third-party libraries, frameworks, SDKs, pretrained models, model weights, datasets, generated media, external assets, and trademarks remain under their respective licenses or terms.

Gemma/Cactus/local model weights, API keys, private credentials, local databases, APK/AAB files, node_modules, cache files, and build outputs are not committed to this repository.

All demo student records are synthetic. No real student health, wellbeing, learning, or personal data is included.

Generated media or demo assets used in the hackathon submission are original, properly licensed, or AI-generated demo assets unless otherwise noted.

Also see:
- LICENSE
- THIRD_PARTY_NOTICES.md
- docs/license-and-ip-compliance.md

## Project Overview

Apps:
- OnePadSchoolAI: Student App
- parent-app: Parent App
- teacher-app: Teacher App
- school-admin-app: Admin App
- backend: source-of-truth backend

Backend source of truth:
- `backend/` is the only backend used for the hackathon demo/product flow.
- `OnePadSchoolAI/backend/` is legacy/deprecated and intentionally excluded from the clean GitHub export.

## Core Demo Flow

- Teacher creates/publishes learning content.
- Student learns with AI support and event logging.
- Student App records lightweight learning/wellbeing/health events during the day.
- Backend nightly job processes events.
- Backend creates NegativePointSummary, StudentTrendPacket, StudentTrendReport, and StudentTrendChartPoint.
- Parent App shows Wellbeing & Learning Trend, Health & Wellbeing Vault charts, and Parent Support items.
- Teacher App shows support queue.
- Admin App shows aggregate health/wellbeing overview and audit logs.

## Setup Commands

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

Student App:
```bash
cd OnePadSchoolAI
npm install
npx tsc --noEmit
npx expo start
```

Parent App:
```bash
cd parent-app
npm install
npm run build
npm run dev
```

Teacher App:
```bash
cd teacher-app
npm install
npm run build
npm run dev
```

Admin App:
```bash
cd school-admin-app
npm install
npm run build
npm run dev
```

## Environment Variables

- Real API keys are not committed.
- Copy `.env.example` to `.env` locally.
- Fill provider/backend URLs locally.

## Android APK

APK/AAB files are build artifacts and are not committed to this repository.

If an Android build is needed for review, it should be produced from source or attached separately through GitHub Releases.

Generated APK/AAB files must not be committed.

## Models / Weights

Local model files are not committed.
Heavy model files should be downloaded at runtime or through setup instructions.
Do not push model weights to GitHub.

Gemma/Cactus/local model weights are not committed to this repository.
If Gemma or local models are enabled, users must download or initialize the relevant model files separately according to the official model/runtime instructions and the applicable model license/terms.
This project does not claim endorsement by Google or any model provider.
Google/Gemma/Cactus names, trademarks, and model files remain subject to their respective terms.

## Known Limitations

Backend nightly reports may use `template_fallback` unless local Gemma/Cactus runtime is connected in the backend process.
Do not overclaim local Gemma in backend nightly unless it is actually connected.
