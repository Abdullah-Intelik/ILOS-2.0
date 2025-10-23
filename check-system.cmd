@echo off
REM ================================================================
REM ILOS System Check Script
REM Verifies all prerequisites before starting services
REM ================================================================

echo.
echo ========================================
echo  ILOS - System Check
echo ========================================
echo.

set ERRORS=0

REM Check Node.js
echo [1/8] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
    echo   ✓ Node.js installed: !NODE_VER!
) else (
    echo   ✗ Node.js NOT found
    set /a ERRORS+=1
)

REM Check npm
echo [2/8] Checking npm...
npm --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VER=%%i
    echo   ✓ npm installed: !NPM_VER!
) else (
    echo   ✗ npm NOT found
    set /a ERRORS+=1
)

REM Check ADB
echo [3/8] Checking ADB (Android Debug Bridge)...
adb version >nul 2>&1
if %errorlevel% equ 0 (
    echo   ✓ ADB installed
) else (
    echo   ✗ ADB NOT found (required for mobile app)
    set /a ERRORS+=1
)

REM Check PostgreSQL
echo [4/8] Checking PostgreSQL...
psql --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('psql --version') do set PG_VER=%%i
    echo   ✓ PostgreSQL installed: !PG_VER!
) else (
    echo   ! PostgreSQL CLI not in PATH (may still work)
)

REM Check Backend dependencies
echo [5/8] Checking Backend dependencies...
if exist "backend\node_modules" (
    echo   ✓ Backend node_modules exists
) else (
    echo   ✗ Backend dependencies NOT installed
    echo     Run: cd backend ^&^& npm install
    set /a ERRORS+=1
)

REM Check Frontend dependencies
echo [6/8] Checking Frontend dependencies...
if exist "frontend\node_modules" (
    echo   ✓ Frontend node_modules exists
) else (
    echo   ✗ Frontend dependencies NOT installed
    echo     Run: cd frontend ^&^& npm install
    set /a ERRORS+=1
)

REM Check Mobile dependencies
echo [7/8] Checking Mobile App dependencies...
if exist "ILOS-Mobile-App\node_modules" (
    echo   ✓ Mobile App node_modules exists
) else (
    echo   ✗ Mobile App dependencies NOT installed
    echo     Run: cd ILOS-Mobile-App ^&^& npm install
    set /a ERRORS+=1
)

REM Check Android device
echo [8/8] Checking Android device/emulator...
adb devices 2>nul | find "device" | find /v "List" >nul
if %errorlevel% equ 0 (
    echo   ✓ Android device/emulator connected
    for /f "skip=1 tokens=1" %%i in ('adb devices 2^>nul') do (
        if not "%%i"=="" echo     Device: %%i
    )
) else (
    echo   ! No Android device/emulator detected
    echo     Connect device or start emulator before running mobile app
)

echo.
echo ========================================
if %ERRORS% equ 0 (
    echo  System Check: PASSED ✓
    echo ========================================
    echo.
    echo  All prerequisites met!
    echo  You can now run: start-all.cmd
) else (
    echo  System Check: FAILED ✗
    echo ========================================
    echo.
    echo  Found %ERRORS% error(s)
    echo  Please fix the issues above before starting.
)
echo.
pause

