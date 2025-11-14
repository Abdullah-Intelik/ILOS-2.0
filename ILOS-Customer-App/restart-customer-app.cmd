@echo off
echo ========================================
echo  ILOS Customer App - Full Restart
echo ========================================
echo.

echo [1/6] Stopping services...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/6] Starting Backend V2.0 (Port 5000)...
cd /d "D:\ILOS 2.0\backend-v2"
start "ILOS Backend V2.0 (Port 5000)" cmd /k "npm run dev"
timeout /t 5 /nobreak >nul

echo [3/6] Starting Document Server (Port 8086)...
cd /d "D:\ILOS 2.0\backend-v2\document-server"
start "Document Server (Port 8086)" cmd /k "node server.js"
timeout /t 2 /nobreak >nul

echo [4/6] Setting up port forwarding...
adb reverse --remove-all
adb reverse tcp:5000 tcp:5000
adb reverse tcp:8086 tcp:8086
adb reverse tcp:8081 tcp:8081
echo.
echo Port forwarding configured:
adb reverse --list
echo.

echo [5/6] Starting Metro bundler with cache reset...
cd /d "D:\ILOS 2.0\ILOS-Customer-App"
start "Metro Bundler (Customer App - Port 8081)" cmd /k "npm start -- --reset-cache"
timeout /t 5 /nobreak >nul

echo [6/6] Building and installing app...
echo Please wait, this may take a few minutes...
start "App Build" cmd /k "cd /d D:\ILOS 2.0\ILOS-Customer-App && npx react-native run-android"

echo.
echo ========================================
echo  All services started!
echo ========================================
echo.
echo  Services running:
echo    - Backend V2.0 (Port 5000)
echo    - Document Server (Port 8086)
echo    - Metro Bundler (Port 8081)
echo.
echo  Port forwarding active:
echo    - tcp:5000 - Backend API V2.0
echo    - tcp:8086 - Document Server
echo    - tcp:8081 - Metro Bundler
echo.
echo  Next: Test login with CNIC 3840393463961
echo.
pause

