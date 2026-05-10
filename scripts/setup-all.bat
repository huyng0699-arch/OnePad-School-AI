@echo off
where node >nul 2>nul || (echo Please install Node.js LTS first. && exit /b 1)
where npm >nul 2>nul || (echo Please install Node.js LTS first. && exit /b 1)
node -v
npm -v

cd /d %~dp0..\backend && call npm install && call npx prisma generate && call npx prisma migrate dev --name commercial_upgrade && call npx prisma db seed
cd /d %~dp0..\teacher-app && call npm install
cd /d %~dp0..\parent-app && call npm install
cd /d %~dp0..\school-admin-app && call npm install
cd /d %~dp0..\OnePadSchoolAI && call npm install

echo Setup complete.
