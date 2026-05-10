@echo off
echo Upgrading to Expo SDK 54...
echo.

echo Step 1: Removing old node_modules and package-lock.json...
rmdir /s /q node_modules
del package-lock.json

echo.
echo Step 2: Installing dependencies...
call npm install

echo.
echo Step 3: Running expo install --fix to fix dependency mismatches...
call npx expo install --fix

echo.
echo Step 4: Checking TypeScript...
call npx tsc --noEmit

echo.
echo Upgrade complete!
echo.
pause
