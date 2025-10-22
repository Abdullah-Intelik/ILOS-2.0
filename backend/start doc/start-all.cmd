@echo off
setlocal

REM Start ILOS Backend API (port 5000)
start "ILOS Backend API" cmd /k "cd /d ilos-backend-2.0 && set DATABASE_URL=postgres://ilos_user:faez@localhost:5432/cbs_db && set DATABASE_URL1=postgres://ilos_user:faez@localhost:5432/ilos_db && set PG_SSL=false && npm run dev"

REM Start Data Engine server (port 3002)
start "DataEng Server" cmd /k "cd /d ilos-backend-2.0\DataEng && npm install --no-audit --no-fund && node data-engine-server.js"

REM Start FTP/file testing server (port 8081)
start "FTP/Test Server" cmd /k "cd /d ilos-backend-2.0\backend_Filezilla_for_testing && npm install --no-audit --no-fund && node uploadtoftp.js"

REM Start Frontend (Next.js) (port 3000)
start "Frontend (Next.js)" cmd /k "cd /d ilos-frontend-2.0 && npm install --no-audit --no-fund && npm run dev"

endlocal
