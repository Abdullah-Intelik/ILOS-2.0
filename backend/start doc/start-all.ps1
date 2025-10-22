# Start ILOS Backend API (port 5000)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'ILOS-backend'; $env:DATABASE_URL='postgres://ilos_user:faez@localhost:5432/cbs_db'; $env:DATABASE_URL1='postgres://ilos_user:faez@localhost:5432/ilos_db'; $env:PG_SSL='false'; npm run dev"

# Start Data Engine server (port 3002)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'ILOS-backend/DataEng'; npm install --no-audit --no-fund; node .\data-engine-server.js"

# Start FTP/file testing server (port 8081)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'ILOS-backend/backend_Filezilla_for_testing'; npm install --no-audit --no-fund; node .\uploadtoftp.js"

# Start Frontend (Next.js) (port 3000)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'ILOS-frontend'; npm install --no-audit --no-fund; npm run dev"
