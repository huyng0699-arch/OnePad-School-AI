# AI Authoring Pipeline

- `backend/src/modules/ai-authoring/ai-authoring.controller.ts`
  - Handles authoring key/project/standardize/publish/published-lesson endpoints.

- `backend/src/modules/ai-authoring/ai-authoring.service.ts`
  - Orchestrates key storage, project lifecycle, standardization, and publish flow.

- `backend/src/modules/ai-authoring/ai-authoring-provider.service.ts`
  - Calls Gemini endpoint with selected key scope (school/personal/disabled fallback).

- `backend/src/modules/ai-authoring/lesson-standardizer.service.ts`
  - Builds structured authoring prompt and provides fallback structured lesson draft.

- `backend/src/modules/ai-authoring/structured-lesson.validator.ts`
  - Parses and validates StructuredLesson JSON contract.

- `teacher-app/app/authoring/page.tsx`
  - Teacher UI for key setup, raw lesson input, structured preview, and publish.

- `school-admin-app/app/ai-policy/page.tsx`
  - School admin UI for school key setup and authoring usage/policy governance.
