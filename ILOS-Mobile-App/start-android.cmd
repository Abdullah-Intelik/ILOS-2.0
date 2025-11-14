@echo off
REM ========================================
REM ILOS Mobile App - Android Startup Script
REM ========================================
REM This script sets up port forwarding and runs the app

echo.
echo ========================================
echo   ILOS Mobile App - Android Launcher
echo ========================================
echo.

REM Check if adb is available
where adb >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] ADB not found! Please install Android SDK Platform Tools.
    pause
    exit /b 1
)

echo [1/4] Detecting connected devices...
adb devices
echo.

echo [2/4] Setting up port forwarding for all devices...
echo   - Port 5000 (Backend API)
echo   - Port 8086 (Document Server)
echo   - Port 8082 (Metro Bundler)
echo.

REM Forward ports for all connected devices
for /f "skip=1 tokens=1" %%D in ('adb devices ^| findstr "device"') do (
    echo   Setting up ports for device: %%D
    adb -s %%D reverse tcp:5000 tcp:5000 2>nul
    adb -s %%D reverse tcp:8086 tcp:8086 2>nul
    adb -s %%D reverse tcp:8082 tcp:8082 2>nul
)

echo.
echo [3/4] Port forwarding complete!
echo.

echo [4/4] Building and installing app on Android...
echo   This may take a minute...
echo.

REM Run the Android app
npx react-native run-android --port 8082

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   SUCCESS! App is running!
    echo ========================================
    echo.
    echo   Metro bundler: http://localhost:8082
    echo   Press Ctrl+C to stop Metro bundler
    echo.
) else (
    echo.
    echo ========================================
    echo   ERROR! Build failed!
    echo ========================================
    echo.
    pause
)

