@echo off
echo ========================================
echo  Customer App - Restart (App Only)
echo  Use this when backend is already running
echo ========================================
echo.

echo [1/3] Setting up port forwarding...
adb reverse --remove-all
adb reverse tcp:5000 tcp:5000
adb reverse tcp:8086 tcp:8086
adb reverse tcp:8081 tcp:8081
echo.
echo Port forwarding configured:
adb reverse --list
echo.

echo [2/3] Starting Metro bundler on port 8081...
cd /d "D:\ILOS 2.0\ILOS-Customer-App"
start "Metro Bundler (Customer App - Port 8081)" cmd /k "npm start -- --reset-cache"
timeout /t 5 /nobreak >nul

echo [3/3] Building and installing app...
echo Please wait, this may take a few minutes...
start "App Build" cmd /k "cd /d D:\ILOS 2.0\ILOS-Customer-App && npx react-native run-android"

echo.
echo ========================================
echo  App restart initiated!
echo ========================================
echo.
echo  Make sure backend is already running:
echo    - Backend V2.0 (Port 5000)
echo    - Document Server (Port 8086)
echo.
echo  Metro running on port 8081
echo.
pause

