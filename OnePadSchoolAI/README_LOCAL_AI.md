# OnePad School AI — Local AI (Cactus + Gemma 4 E2B)

This repo is designed so you **do not commit** `node_modules/` or any model files.
The app downloads the model on the **Android device** via Cactus at runtime (debug build).

## What’s included in GitHub

- App source (`src/`, `App.tsx`, configs)
- Dependency manifests (`package.json`, `package-lock.json`)

Not included:

- `node_modules/` (ignored)
- Model weights (downloaded onto the device)

## Target model (required)

- Runtime: `cactus-react-native`
- Model: **Gemma 4 E2B**
- Cactus registry id (download id): `gemma-4-e2b-it`

Config file:

- `src/services/ai/localModelConfig.ts`

## Local Android test (USB debug)

Prereqs:

- Android SDK Platform Tools installed (`adb` available)
- A real Android phone with USB debugging enabled

Commands:

1) Confirm device is visible:
   - `adb devices`

2) Create native projects:
   - `npx.cmd expo prebuild`

3) Build & install to the connected phone:
   - `npx.cmd expo run:android --device`

## In-app verification flow

1) Open **Student Hub**
2) Go to **AI & App Settings**
3) Select **Local AI**
4) Tap:
   - **Initialize Cactus**
   - **Download / Load Gemma 4 E2B**
   - **Run Local Test Prompt**

Expected:

- Status becomes **Ready**
- Test prompt returns output text without crashing

## Fallback behavior

Setting:

- **Cloud fallback when Local AI fails**: On/Off

When On:

- Local AI failure triggers Gemini call and UI shows:
  - `Cloud fallback used because Local AI failed.`

