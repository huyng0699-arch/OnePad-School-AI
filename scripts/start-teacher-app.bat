@echo off
start "Teacher App" cmd /k "cd /d %~dp0..\teacher-app && npm run dev"
