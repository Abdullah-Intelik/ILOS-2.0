@echo off
REM Full clean and rebuild script for ILOS Customer App
REM This script performs a complete cache clean and rebuild

echo ========================================
echo  ILOS Customer App - FULL CLEAN REBUILD
echo ========================================
echo.
echo This will:
echo   1. Stop all node processes
echo   2. Clean all Metro caches
echo   3. Clean Gradle build
echo   4. Restart backend services
echo   5. Setup port forwarding
echo   6. Start Metro with fresh cache
echo   7. Rebuild and install app
echo.
echo Press Ctrl+C to cancel, or
pause

echo.
echo [1/9] Stopping all node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/9] Cleaning Metro cache...
cd /d "D:\ILOS 2.0\ILOS-Customer-App"
rmdir /s /q "%LOCALAPPDATA%\Temp\metro-*" 2>nul
rmdir /s /q "%LOCALAPPDATA%\Temp\haste-map-*" 2>nul
rmdir /s /q "%LOCALAPPDATA%\Temp\react-*" 2>nul
echo    Metro cache cleaned

echo [3/9] Cleaning Gradle build...
rmdir /s /q android\app\build 2>nul
echo    Gradle build cleaned

echo [4/9] Starting Backend V2.0 (Port 5000)...
cd /d "D:\ILOS 2.0\backend-v2"
start "ILOS Backend V2.0 (Port 5000)" cmd /k "set PORT=5000 && npm run dev"
timeout /t 5 /nobreak >nul

echo [5/9] Starting Document Server (Port 8086)...
cd /d "D:\ILOS 2.0\backend-v2\document-server"
start "Document Server (Port 8086)" cmd /k "node server.js"
timeout /t 2 /nobreak >nul

echo [6/9] Setting up port forwarding...
adb reverse --remove-all
adb reverse tcp:5000 tcp:5000
adb reverse tcp:8086 tcp:8086
adb reverse tcp:8081 tcp:8081
echo.
echo Port forwarding configured:
adb reverse --list
echo.

echo [7/9] Starting Metro bundler with cache reset...
cd /d "D:\ILOS 2.0\ILOS-Customer-App"
start "Metro Bundler (Customer App - Port 8081)" cmd /k "npx react-native start --reset-cache"
timeout /t 10 /nobreak >nul

echo [8/9] Cleaning Gradle cache (Android)...
cd android
call gradlew clean
cd ..

echo [9/9] Building and installing app (this may take 2-3 minutes)...
echo Please wait...
npx react-native run-android

echo.
echo ========================================
echo  Build complete!
echo ========================================
echo.
echo  All services running:
echo    - Backend V2.0 (Port 5000)
echo    - Document Server (Port 8086)
echo    - Metro Bundler (Port 8081)
echo.
echo  Port forwarding active:
echo    - tcp:5000 - Backend API V2.0
echo    - tcp:8086 - Document Server
echo    - tcp:8081 - Metro Bundler
echo.
echo  Next: Try uploading documents in the app
echo  Look for these logs:
echo    [ILOS Customer] Full URL: http://localhost:5000/api/v1/parties/cnic/...
echo.
pause

