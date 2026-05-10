@echo off
call %~dp0start-backend.bat
call %~dp0start-teacher-app.bat
call %~dp0start-parent-app.bat
call %~dp0start-admin-app.bat
call %~dp0start-student-dev.bat
call %~dp0open-all-web.bat
