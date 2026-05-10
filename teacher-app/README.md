# OnePad Teacher App

Separate deployable app. Not merged with backend or other role apps.

Runtime:
- Node.js LTS
- npm

Development:
```env
NEXT_PUBLIC_ONEPAD_API_BASE_URL=http://localhost:3000
```

Production:
```env
NEXT_PUBLIC_ONEPAD_API_BASE_URL=https://api.onepad.school
```

Domain:
- https://teacher.onepad.school

Run:
```cmd
npm install
npm run dev
```

