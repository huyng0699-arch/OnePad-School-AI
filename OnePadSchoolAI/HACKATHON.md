# Hackathon Notes — OnePad School AI

## Competition target

- Event: **The Gemma 4 Good Hackathon**
- Track/theme: **Future of Education**
- Special technology target: **Cactus / local-first mobile AI**

## Prize targets

- A working student learning demo with a credible path to fully on-device tutoring.
- Local-first AI execution on Android (USB debug) using Cactus runtime.
- Explicit cloud fallback for reliability while preserving “local-first” intent.

## Why this fits “Future of Education”

- Student-centered UX: learning support is embedded where students already work (lesson reading, practice, quizzes).
- AI helps with:
  - concise summaries
  - simpler explanations
  - quiz generation
  - grading + feedback
  - lightweight intent routing (voice command router)
- Safety posture: prompts are designed to be concise, supportive, and avoid internal leakage.
- Future teacher/guardian workflows: structured summaries and progress signals can be used for review later (without forcing teacher to do live supervision).

## Why this fits Cactus / local-first AI

- Goal: run inference on the student’s phone for privacy, latency, and offline readiness.
- Local AI path targets **Gemma 4 E2B Local via Cactus**.
- Cloud fallback uses **Gemini API** with an explicit UI notice when fallback is used.

## Current implementation status (truthful)

Implemented:

- Cactus runtime dependency installed: `cactus-react-native` + `react-native-nitro-modules`
- Local model target config:
  - `src/services/ai/localModelConfig.ts` (Gemma 4 E2B id + Cactus registry id)
- Cactus provider (no screen calls Cactus directly):
  - `src/services/ai/providers/cactusLocalProvider.ts`
- Provider selection + explicit fallback behavior:
  - `src/services/ai/aiClient.ts`
- In-app controls (only run when buttons pressed):
  - Student Hub → AI & App Settings → Local AI actions

Not included / intentionally out of scope:

- No EAS build
- No production APK submission
- No redesign and no new student features

## Demo steps for judges (Android, USB debug)

Prereqs:

- Android device with USB debugging enabled
- Android Platform Tools installed (adb available)

Steps:

1) Confirm device:
- `adb devices`

2) Build a native dev build:
- `npx.cmd expo prebuild`
- `npx.cmd expo run:android --device`

3) On the phone:
- Open **Student Hub**
- Open **AI & App Settings**
- Select **Local AI**
- Tap **Initialize Cactus**
- Tap **Download / Load Gemma 4 E2B**
- Tap **Run Local Test Prompt**

4) Verify:

- Local AI returns text without crashing
- If Local AI fails and fallback is On, UI shows:
  - `Cloud fallback used because Local AI failed.`

## Notes for judges

- `node_modules/` is not committed; install via `npm ci`.
- `.env` is not committed; see `.env.example`.
- Model weights are not committed; they are downloaded onto the device by Cactus at runtime.

