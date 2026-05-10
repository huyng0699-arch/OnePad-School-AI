@echo off
start "Parent App" cmd /k "cd /d %~dp0..\parent-app && npm run dev"
