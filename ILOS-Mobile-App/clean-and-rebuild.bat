@echo off
echo ========================================
echo  ILOS Mobile App - Clean Rebuild
echo  This will fix the port configuration
echo ========================================
echo.

echo Step 1: Stopping Metro bundler...
taskkill /F /IM node.exe 2>nul
echo.

echo Step 2: Uninstalling old app from emulator...
adb uninstall com.ilos 2>nul
echo.

echo Step 3: Cleaning Metro cache...
npx react-native start --reset-cache --port 8082 &
timeout /t 3
taskkill /F /IM node.exe 2>nul
echo.

echo Step 4: Cleaning build folders...
if exist android\app\build rmdir /s /q android\app\build
echo Android build cleaned!
echo.

echo Step 5: Setting up ADB for port 8082...
adb reverse tcp:8082 tcp:8082
adb reverse tcp:5000 tcp:5000
echo.

echo Step 6: Rebuilding and installing app with new port...
echo This may take a few minutes...
echo.
call npm run android

echo.
echo ========================================
echo  Rebuild complete!
echo  App should now connect to port 8082
echo ========================================
pause

