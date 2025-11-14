@echo off
REM ================================================================
REM ILOS Complete System Shutdown Script
REM Stops: All Node.js processes and clears ports
REM ================================================================

echo.
echo ========================================
echo  ILOS - Stopping All Services
echo ========================================
echo.

echo [1/3] Stopping Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo   ✓ Node.js processes stopped
) else (
    echo   ! No Node.js processes found
)

echo.
echo [2/3] Stopping React Native Metro...
taskkill /F /IM cmd.exe /FI "WINDOWTITLE eq ILOS*" >nul 2>&1
echo   ✓ Metro bundler stopped

echo.
echo [3/3] Clearing Android port forwards...
adb reverse --remove tcp:5000 >nul 2>&1
adb reverse --remove tcp:8086 >nul 2>&1
adb reverse --remove tcp:8082 >nul 2>&1
echo   ✓ Port forwards cleared

echo.
echo ========================================
echo  All Services Stopped!
echo ========================================
echo.
echo  Ports Released:
echo    - 3000 (Frontend)
echo    - 5000 (Backend)
echo    - 8086 (Document Server)
echo    - 8082 (Metro Bundler)
echo.
echo  You can now restart services using:
echo    start-all.cmd  or  start-all.ps1
echo ========================================
echo.
pause

