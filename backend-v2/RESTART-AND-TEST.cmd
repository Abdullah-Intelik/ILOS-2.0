@echo off
echo ========================================
echo   ILOS V2.0 - Restart Backend and Test
echo ========================================
echo.

echo [1/3] Killing existing Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 >nul
echo     Done!
echo.

echo [2/3] Starting Backend V2.0...
cd /d "d:\ILOS 2.0\backend-v2\src"
start "ILOS Backend V2.0" cmd /k "node server.js"
timeout /t 5 >nul
echo     Backend starting...
echo.

echo [3/3] Testing new endpoints...
echo.

echo Testing SPU Checklist endpoint...
curl -s http://localhost:5000/api/v1/applications/spu-checklist/51 | findstr "success"
echo.

echo Testing Comments endpoint...
curl -s http://localhost:5000/api/v1/applications/51/comments | findstr "success"
echo.

echo Testing EAVMU Verification endpoint...
curl -s http://localhost:5000/api/v1/applications/51/eavmu-verification | findstr "success"
echo.

echo Testing RRU Department endpoint...
curl -s "http://localhost:5000/api/v1/applications/department/RRU/paginated" | findstr "success"
echo.

echo ========================================
echo   ALL TESTS COMPLETE!
echo ========================================
echo.
echo Backend running at: http://localhost:5000
echo Frontend at: http://localhost:3000
echo.
echo Next steps:
echo   1. Open CIU dashboard and check SPU results
echo   2. Open RRU dashboard and verify rejected apps
echo   3. Test comments system
echo.
pause

