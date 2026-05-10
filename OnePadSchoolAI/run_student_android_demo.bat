@echo off
setlocal EnableExtensions EnableDelayedExpansion

set "PROJECT_ROOT=C:\Users\Admin\Desktop\schoolfuture\OnePadSchoolAI"
set "ANDROID_DIR=%PROJECT_ROOT%\android"
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
set "ANDROID_HOME=C:\Users\Admin\AppData\Local\Android\Sdk"
set "ANDROID_SDK_ROOT=%ANDROID_HOME%"
set "ADB_EXE=%ANDROID_HOME%\platform-tools\adb.exe"
set "APP_PACKAGE=com.anonymous.onepadschoolsai"

echo [INFO] Project root: %PROJECT_ROOT%
cd /d "%PROJECT_ROOT%" || (
  echo [ERROR] Cannot cd to project root.
  exit /b 1
)

if not exist "%JAVA_HOME%\bin\java.exe" (
  echo [ERROR] JAVA_HOME invalid: %JAVA_HOME%
  exit /b 1
)

if not exist "%ADB_EXE%" (
  echo [ERROR] adb not found at: %ADB_EXE%
  exit /b 1
)

set "PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\cmdline-tools\latest\bin;%PATH%"

echo.
echo [STEP] Check device connection
"%ADB_EXE%" start-server >nul 2>&1
"%ADB_EXE%" devices

set "ADB_STATE="
for /f %%s in ('"%ADB_EXE%" get-state 2^>nul') do set "ADB_STATE=%%s"

:got_device_state
if not defined ADB_STATE (
  echo [ERROR] No Android device detected. Plug in phone and enable USB debugging.
  exit /b 1
)

for /f %%u in ('"%ADB_EXE%" devices ^| findstr /C:"unauthorized"') do set "ADB_UNAUTHORIZED=1"
if defined ADB_UNAUTHORIZED (
  echo [ERROR] Device is unauthorized. Please tap "Allow USB debugging" on phone, then run again.
  exit /b 1
)

if /I not "%ADB_STATE%"=="device" (
  echo [ERROR] Device state is "%ADB_STATE%". Resolve it and run again.
  exit /b 1
)

echo.
echo [STEP] Install debug build (arm64-v8a only)
cd /d "%ANDROID_DIR%" || (
  echo [ERROR] Cannot cd to android dir.
  exit /b 1
)
call gradlew.bat app:installDebug -PreactNativeArchitectures=arm64-v8a -PreactNativeDevServerPort=8081
if errorlevel 1 (
  echo [ERROR] Gradle installDebug failed.
  exit /b 1
)

echo.
echo [STEP] Start Metro dev-client in separate terminal
cd /d "%PROJECT_ROOT%"
start "Metro Dev Client" cmd /k "cd /d %PROJECT_ROOT% && npx.cmd expo start --dev-client"

echo.
echo [STEP] Reverse port and launch app
"%ADB_EXE%" reverse tcp:8081 tcp:8081
if errorlevel 1 (
  echo [ERROR] adb reverse failed.
  exit /b 1
)

"%ADB_EXE%" shell monkey -p %APP_PACKAGE% -c android.intent.category.LAUNCHER 1
if errorlevel 1 (
  echo [ERROR] Failed to launch app package %APP_PACKAGE%.
  exit /b 1
)

echo.
echo [DONE] Student app launched: %APP_PACKAGE%
echo [DONE] Metro window should be running: expo start --dev-client
endlocal
