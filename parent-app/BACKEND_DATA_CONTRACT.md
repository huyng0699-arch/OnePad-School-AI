# Parent App Backend Data Contract

The Parent App is backend-powered. It does not create fake student data in the frontend. During the current no-password demo phase, the backend should expose selectable parent-student login records.

## Environment

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_PARENT_USER_ID=parent_001
NEXT_PUBLIC_PARENT_STUDENT_ID=stu_001
```

## Request headers sent by the frontend

```http
x-parent-user-id: parent_001
x-parent-role: parent
x-student-id: stu_001
```

## 1. Login options

`GET /v1/parent/login-options`

Expected response:

```json
{
  "ok": true,
  "accounts": [
    {
      "parentId": "parent_001",
      "parentName": "Nguyen Family",
      "relationship": "Mother",
      "studentId": "stu_001",
      "studentName": "Minh Anh Nguyen",
      "className": "Grade 6A",
      "schoolName": "OnePad Demo School",
      "homeroomTeacher": "Ms. Lan Anh"
    }
  ]
}
```

The login page shows these records as buttons. Selecting one stores the parent/student IDs in cookies and all other screens read that selected student from backend.

## 2. Student profile

`GET /v1/parent/children/{studentId}/profile`

```json
{
  "ok": true,
  "profile": {
    "studentId": "stu_001",
    "childName": "Minh Anh Nguyen",
    "className": "Grade 6A",
    "schoolName": "OnePad Demo School",
    "homeroomTeacher": "Ms. Lan Anh",
    "subjectTeachers": [
      { "subject": "Biology", "teacher": "Mr. Huy", "contactHint": "Contact for cell model review" }
    ],
    "learningFocus": ["Short review sessions", "Reduce grade pressure"],
    "deviceSync": {
      "status": "Synced",
      "lastSyncedAt": "2026-05-10T09:20:00.000Z",
      "pendingEvents": 0,
      "localAiStatus": "Ready",
      "backendStatus": "Connected"
    }
  }
}
```

## 3. Home trend report

`GET /v1/parent/children/{studentId}/trend-report`

```json
{
  "ok": true,
  "studentId": "stu_001",
  "childName": "Minh Anh Nguyen",
  "className": "Grade 6A",
  "schoolName": "OnePad Demo School",
  "homeroomTeacher": "Ms. Lan Anh",
  "level": "monitor",
  "direction": "slightly_declining",
  "title": "Today needs light parent support",
  "summary": "Biology is improving, but Math review and one overdue writing task need gentle parent support.",
  "keyFactors": ["Math mastery dropped compared with the student's own baseline", "One Literature assignment is overdue"],
  "suggestedActions": ["Review three missed Math questions", "Ask where the writing task is blocked"],
  "categories": [
    {
      "key": "learning",
      "title": "Learning",
      "level": "monitor",
      "reasons": ["Math needs review", "Biology is improving"],
      "parentText": "The child needs light support in Math while Biology is improving."
    }
  ]
}
```

Allowed alert/report levels: `normal`, `monitor`, `attention`, `urgent`.

## 4. Trend chart

`GET /v1/parent/children/{studentId}/trend-chart?days=7`

```json
{
  "ok": true,
  "points": [
    { "date": "2026-05-04", "level": "monitor", "label": "Monitor" },
    { "date": "2026-05-05", "level": "normal", "label": "Stable" }
  ]
}
```

## 5. Alerts

`GET /v1/parent/children/{studentId}/alerts`

```json
{
  "ok": true,
  "alerts": [
    {
      "id": "al_001",
      "category": "assignment",
      "level": "monitor",
      "evidenceCount": 2,
      "confidence": 0.78,
      "title": "One writing assignment is overdue",
      "safeSummary": "The child may be blocked at the outlining step.",
      "recommendedAction": "Ask what step is difficult and message the teacher if needed.",
      "createdAt": "2026-05-10T07:40:00.000Z"
    }
  ]
}
```

## 6. Screen endpoints

The frontend also reads these backend endpoints:

```text
GET /v1/parent/children/{studentId}/subjects
GET /v1/parent/children/{studentId}/progress-timeline
GET /v1/parent/children/{studentId}/assignments
GET /v1/parent/children/{studentId}/lessons
GET /v1/parent/children/{studentId}/home-support-plan
GET /v1/parent/children/{studentId}/family-report
GET /v1/parent/children/{studentId}/health-wellbeing-vault
GET /v1/parent/children/{studentId}/privacy-center
GET /v1/parent/children/{studentId}/consent-log
GET /v1/parent/children/{studentId}/ar-lessons
GET /v1/parent/children/{studentId}/group-work
GET /v1/parent/children/{studentId}/messages
GET /v1/parent/notices
GET /v1/parent/children/{studentId}/timetable
GET /v1/parent/children/{studentId}/attendance
GET /v1/parent/children/{studentId}/notes
GET /v1/parent/children/{studentId}/reports
GET /v1/parent/children/{studentId}/device-sync
```

## Privacy rules

- Frontend must receive parent-safe reports, not raw student events.
- Parent never sees raw private chat, hidden internal scores, teacher-only operational notes, or school-admin aggregate logic.
- Health and wellbeing data must be parent-controlled.
- Teacher access requires consent and should be limited to safe summaries.
