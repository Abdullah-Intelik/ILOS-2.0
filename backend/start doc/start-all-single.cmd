@echo off
setlocal

REM Launch all services in the same window (backgrounded) 

REM 1) Backend API (port 5000)
start "" /B cmd /c "cd /d ILOS-backend && set DATABASE_URL=postgres://ilos_user:faez@localhost:5432/cbs_db && set DATABASE_URL1=postgres://ilos_user:faez@localhost:5432/ilos_db && set PG_SSL=false && npm run dev"

REM 2) DataEng server (port 3002)
start "" /B cmd /c "cd /d ILOS-backend\DataEng && npm install --no-audit --no-fund && node data-engine-server.js"

REM 3) FTP/Test server (port 8081)
start "" /B cmd /c "cd /d ILOS-backend\backend_Filezilla_for_testing && npm install --no-audit --no-fund && node uploadtoftp.js"

REM 4) Frontend Next.js (port 3000)
start "" /B cmd /c "cd /d ILOS-frontend && npm install --no-audit --no-fund && npm run dev"

REM Keep this window open so you can see interleaved logs
echo.
echo All services started in this window. Press Ctrl+C to stop.
:loop
ping -n 6 127.0.0.1 >nul
goto loop

endlocal
