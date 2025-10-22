@echo off
echo ========================================
echo  ILOS Mobile App - Complete Launcher
echo  This will build and run the app
echo ========================================
echo.

echo Step 1: Checking for connected devices...
adb devices
echo.

echo Step 2: Setting up ADB reverse port forwarding...
adb reverse tcp:8082 tcp:8082
adb reverse tcp:5000 tcp:5000
echo.

echo Step 3: Building and launching app...
echo (This will start Metro bundler automatically)
echo.
npm run android

pause

