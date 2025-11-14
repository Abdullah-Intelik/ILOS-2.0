@echo off
echo.
echo ============================================
echo   ILOS Customer Mobile App Startup
echo ============================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/4] Checking Node.js version...
node --version
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo [2/4] Installing dependencies - this may take a few minutes...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install dependencies!
        pause
        exit /b 1
    )
) else (
    echo [2/4] Dependencies already installed
)
echo.

echo [3/4] Starting Metro bundler...
echo.
echo NOTE: Keep this window open while using the app
echo.
echo To run the app on your device:
echo   1. Open a NEW terminal window
echo   2. Navigate to this directory
echo   3. Run: npm run android
echo.
echo Or press Ctrl+C to stop Metro bundler
echo.

REM Start Metro bundler on port 8083
echo [4/4] Metro bundler starting on port 8083...
echo.
call npx react-native start --port 8083

pause

