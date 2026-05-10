@echo off
cd /d %~dp0..\backend
call npx prisma db seed
echo Demo school reseeded.
