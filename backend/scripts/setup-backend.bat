@echo off
cd /d "%~dp0.."
if not exist .env copy .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
echo.
echo Setup complete.
echo Start backend with: scripts\start-backend.bat
pause
