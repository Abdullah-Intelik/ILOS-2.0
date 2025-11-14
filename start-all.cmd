@echo off
REM ================================================================
REM ILOS Complete System Startup Script
REM Starts: Backend, Document Server, Frontend, and Mobile App
REM ================================================================

echo.
echo ========================================
echo  ILOS - Starting All Services
echo ========================================
echo.

REM Get the script directory (D:\ILOS)
set ILOS_ROOT=%~dp0
cd /d "%ILOS_ROOT%"

echo [1/5] Starting Backend API Server (Port 5000)...
start "ILOS Backend API" cmd /k "cd /d %ILOS_ROOT%backend && echo Starting Backend... && npm run dev"
timeout /t 2 /nobreak >nul

echo [2/5] Starting Document Server (Port 8086)...
start "ILOS Document Server" cmd /k "cd /d %ILOS_ROOT%backend\backend_Filezilla_for_testing && echo Starting Document Server... && node uploadtoftp.js"
timeout /t 2 /nobreak >nul

echo [3/5] Starting Frontend Dashboard (Port 3000)...
start "ILOS Frontend" cmd /k "cd /d %ILOS_ROOT%frontend && echo Starting Frontend... && npm run dev"
timeout /t 2 /nobreak >nul

echo [4/5] Starting Metro Bundler (Port 8082)...
start "ILOS Metro Bundler" cmd /k "cd /d %ILOS_ROOT%ILOS-Mobile-App && echo Starting Metro... && npx react-native start --port 8082"
timeout /t 5 /nobreak >nul

echo [5/5] Setting up Android Port Forwarding and Building App...
start "ILOS Mobile Build" cmd /k "cd /d %ILOS_ROOT%ILOS-Mobile-App && echo Setting up port forwarding... && adb reverse tcp:5000 tcp:5000 && adb reverse tcp:8086 tcp:8086 && adb reverse tcp:8082 tcp:8082 && echo Building and installing app... && npx react-native run-android --port 8082"

echo.
echo ========================================
echo  All Services Started!
echo ========================================
echo.
echo  Terminal Windows Opened:
echo    1. Backend API       (Port 5000)
echo    2. Document Server   (Port 8086)
echo    3. Frontend          (Port 3000)
echo    4. Metro Bundler     (Port 8082)
echo    5. Mobile Build      (Android)
echo.
echo  Access Points:
echo    - Frontend:  http://localhost:3000
echo    - Backend:   http://localhost:5000
echo    - Documents: http://localhost:8086
echo    - Metro:     http://localhost:8082
echo.
echo  Press any key to close this window...
echo  (Other windows will continue running)
echo ========================================
echo.
pause >nul

