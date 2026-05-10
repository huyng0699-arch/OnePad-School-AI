@echo off
cd /d "%~dp0.."
npx prisma migrate reset --force
npx prisma db seed
pause
