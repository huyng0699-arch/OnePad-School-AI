@echo off
setlocal EnableExtensions

set "PROJECT_ROOT=%~dp0"
set "ANDROID_DIR=%PROJECT_ROOT%android"
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
set "ANDROID_HOME=C:\Users\Admin\AppData\Local\Android\Sdk"
set "ADB_EXE=%ANDROID_HOME%\platform-tools\adb.exe"
set "APK=%ANDROID_DIR%\app\build\outputs\apk\debug\app-debug.apk"

set "PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%PATH%"

echo [1/4] Checking device
"%ADB_EXE%" start-server >nul 2>&1
"%ADB_EXE%" devices
for /f %%s in ('"%ADB_EXE%" get-state 2^>nul') do set "ADB_STATE=%%s"
if /I not "%ADB_STATE%"=="device" (
  echo [ERROR] No authorized Android device. Enable USB debugging and accept the prompt.
  exit /b 1
)

echo [2/4] Building APK with Whisper voice support
cd /d "%ANDROID_DIR%" || exit /b 1
call gradlew.bat :app:assembleDebug -PreactNativeArchitectures=arm64-v8a
if errorlevel 1 exit /b 1

echo [3/4] Installing fresh APK
"%ADB_EXE%" install -r -d "%APK%"
if errorlevel 1 exit /b 1

echo [4/4] Launching app
"%ADB_EXE%" shell monkey -p com.anonymous.onepadschoolsai -c android.intent.category.LAUNCHER 1

echo.
echo [DONE] Installed Whisper build. In Student Hub > Voice Command, look for:
echo        Voice build: Whisper multilingual model + language list
endlocal
