@echo off
REM ================================================================
REM ILOS Complete System Restart Script
REM Stops all services, waits, then starts them again
REM ================================================================

echo.
echo ========================================
echo  ILOS - Restarting All Services
echo ========================================
echo.

echo Step 1: Stopping all services...
call stop-all.cmd

echo.
echo Step 2: Waiting for cleanup...
timeout /t 5 /nobreak

echo.
echo Step 3: Starting all services...
call start-all.cmd

echo.
echo ========================================
echo  Restart Complete!
echo ========================================
echo.

