# OnePad Parent App

English Parent App for OnePad School AI.

This app is a parent-safe home-support and privacy-control app. It is not a technical dashboard and it does not create fake student data in the frontend.

## Run

```bat
npm install
npm run dev
```

Open:

```text
http://localhost:3002
```

## Backend configuration

Create `.env.local`:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_PARENT_USER_ID=parent_001
NEXT_PUBLIC_PARENT_STUDENT_ID=stu_001
```

## Login flow

Open `/login`. The app calls:

```text
GET /v1/parent/login-options
```

The backend should return parent-student records. Selecting one stores the selected parent and student IDs in cookies. All screens then read that selected student from backend.

## Backend data

See `BACKEND_DATA_CONTRACT.md`.
