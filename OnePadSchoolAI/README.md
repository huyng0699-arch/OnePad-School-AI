# OnePad School AI

## Hackathon

**The Gemma 4 Good Hackathon**

## Target

**Future of Education**

## Special Technology Target

**Cactus / local-first mobile AI**

## Local AI Target

**Gemma 4 E2B Local via Cactus**

## Cloud Fallback

**Gemini API**

## Core Idea

A student-centered learning app where AI helps each student learn, practice, receive feedback, and generate safe summaries for future teacher/guardian workflows.

## Core Demo Flow

- Student opens the app
- Opens lesson
- AI summarizes/explains lesson
- AI creates quiz
- Student answers quiz
- App grades and explains
- Adaptive hidden scoring adjusts difficulty
- Student state summary supports future teacher/guardian review
- Local AI path targets Gemma 4 E2B through Cactus

## Tech Stack

- Expo React Native + TypeScript
- Gemini API for cloud fallback/demo
- Cactus React Native for local AI target
- Gemma 4 E2B as local model target

## Run with Expo Go

Expo Go is suitable for day-to-day UI work and cloud-only features (Gemini provider).

1) Install dependencies:
- `npm ci` (or `npm install`)

2) Start the dev server:
- `npx.cmd expo start`

3) Open in Expo Go on your phone, or use an emulator.

Notes:
- Native local AI (Cactus + on-device model download) is **not** supported in Expo Go.

## Run Local AI on Android Device

Local AI requires an Android device and a native/dev build (USB debug).

1) Enable USB debugging on your Android phone.
2) Connect phone via USB.
3) Verify the device is detected:
- `adb devices`

4) Generate native projects:
- `npx.cmd expo prebuild`

5) Build and install directly to the phone:
- `npx.cmd expo run:android --device`

6) In the app:
- Open **Student Hub**
- Go to **AI & App Settings**
- Choose **Local AI**
- Tap **Initialize Cactus**
- Tap **Download / Load Gemma 4 E2B**
- Tap **Run Local Test Prompt**

## Environment Variables

See `.env.example` (do not commit real keys).

Example keys used by this repo:

- `EXPO_PUBLIC_AI_PROVIDER`
- `EXPO_PUBLIC_DEV_GEMINI_API_KEY`
- `EXPO_PUBLIC_DEV_GEMINI_MODEL`
- `EXPO_PUBLIC_LOCAL_AI_ENDPOINT`

## What is implemented

- Expo React Native student demo app (Student Hub + learning tools screens)
- AI prompt building for summarize/explain/quiz/grade/voice routing
- Gemini cloud provider integration (demo/cloud)
- Local AI provider integration via Cactus (`cactus-react-native`)
- Local AI Settings flow:
  - Initialize runtime
  - Download / load Gemma 4 E2B (Cactus registry id: `gemma-4-e2b-it`)
  - Run local test prompt
  - Optional cloud fallback (explicit message shown)

## What requires native/local setup

- Cactus + Gemma 4 E2B local AI requires Android native run (dev build), not Expo Go.

## Notes for Judges

- `node_modules/`, `.env`, and model weights are intentionally **not committed**.
- Dependencies are reproducible via `package.json` + lockfile.
- Model weights are downloaded onto the Android device at runtime via Cactus when running the Local AI flow.

## More

See `HACKATHON.md` for competition framing and judge-focused demo steps.

