@echo off
echo ========================================
echo  ILOS Mobile App Startup Script
echo  Port: 8082 (avoiding FileZilla conflict)
echo ========================================
echo.

echo IMPORTANT: This script only starts Metro bundler.
echo.
echo To launch the app, you need to:
echo   1. Keep this terminal open (Metro running)
echo   2. Open a NEW terminal
echo   3. Run: npm run android
echo.
echo OR manually launch Android Studio emulator first,
echo then run: npm run android
echo.
echo ========================================
echo.

echo Step 1: Checking for connected devices...
adb devices
echo.

echo Step 2: Setting up ADB reverse port forwarding...
echo (This will only work if emulator/device is connected)
adb reverse tcp:8082 tcp:8082
adb reverse tcp:5000 tcp:5000
echo.

echo Step 3: Starting Metro bundler on port 8082...
npm start

echo.
echo ========================================
echo  If the app doesn't load:
echo  1. Shake device or press Ctrl+M
echo  2. Tap "Settings"
echo  3. Set Debug server host to: localhost:8082
echo ========================================


