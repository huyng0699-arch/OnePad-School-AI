# Teacher AI Key Storage (Local Only)

Do not commit real API keys.

Use local environment files instead:
- `teacher-app/.env.local` for frontend-side defaults if needed
- `backend/.env` for secure server-side key usage (`AUTHORING_SCHOOL_GEMINI_API_KEY`)

Example placeholders:
- `AUTHORING_SCHOOL_GEMINI_API_KEY=YOUR_KEY_HERE`
- `AUTHORING_DEFAULT_GEMINI_MODEL=gemini-2.5-flash`

After saving in UI, Teacher App masks key values and does not show raw key.
