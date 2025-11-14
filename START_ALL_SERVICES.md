# 🚀 Start All ILOS Services

## Required Services (In Order)

### 1. **Backend V2.0** (Port 5000) ⭐ REQUIRED
```bash
cd "D:\ILOS 2.0\backend-v2"
npm start
```
**Purpose:**
- Main API (applications, parties, dashboard)
- OCR proxy (CNIC, Salary, eCIB)
- Decision engine routes

---

### 2. **Document Server** (Port 8081) ⭐ REQUIRED
```bash
cd "D:\ILOS 2.0\backend-v2\document-server"
node server.js
```
**Purpose:**
- File uploads
- File listing
- File serving (download/view)
- Document Explorer UI

---

### 3. **Old Backend** (Port 4000) ⚠️ TEMPORARILY REQUIRED
```bash
cd "D:\ILOS 2.0\backend"
npm start
```
**Purpose:**
- **Decision calculation logic** (DecisionEngineWrapper)
- Will be deprecated after full migration

**Why needed:**
- Backend V2.0 currently proxies decision calculations to this service
- Contains DecisionEngineWrapper and all decision modules (DBR, Age, City, Income, SPU, EAMVU)

---

### 4. **Frontend** (Port 3000) ⭐ REQUIRED
```bash
cd "D:\ILOS 2.0\frontend"
npm run dev
```
**Purpose:**
- User interface
- All dashboards

---

### 5. **OCR Services** (Ports 8001, 8002, 8003) ⭐ REQUIRED
```bash
# CNIC OCR (Port 8001)
cd "path-to-cnic-ocr"
python app.py

# Salary Slip OCR (Port 8002)
cd "path-to-salary-ocr"
python app.py

# eCIB OCR (Port 8003)
cd "path-to-ecib-ocr"
python app.py
```
**Purpose:**
- Document processing with AI/ML
- Extract data from PDFs and images

---

## Quick Start All Services

### Windows CMD Script
Create `start-all.cmd`:
```cmd
@echo off
echo Starting ILOS V2.0 Services...

start "Backend V2.0" cmd /k "cd /d D:\ILOS 2.0\backend-v2 && npm start"
timeout /t 3 /nobreak

start "Document Server" cmd /k "cd /d D:\ILOS 2.0\backend-v2\document-server && node server.js"
timeout /t 2 /nobreak

start "Old Backend (Temp)" cmd /k "cd /d D:\ILOS 2.0\backend && npm start"
timeout /t 3 /nobreak

start "Frontend" cmd /k "cd /d D:\ILOS 2.0\frontend && npm run dev"

echo All services started!
echo.
echo Backend V2.0:      http://localhost:5000
echo Document Server:  http://localhost:8081
echo Old Backend:      http://localhost:4000
echo Frontend:         http://localhost:3000
echo.
pause
```

---

## Service Status Check

### Check if services are running:
```bash
netstat -ano | findstr "3000 4000 5000 8001 8002 8003 8081"
```

**Expected output:**
```
TCP    0.0.0.0:3000    ... LISTENING    [PID]  ← Frontend
TCP    0.0.0.0:4000    ... LISTENING    [PID]  ← Old Backend
TCP    0.0.0.0:5000    ... LISTENING    [PID]  ← Backend V2.0
TCP    0.0.0.0:8001    ... LISTENING    [PID]  ← CNIC OCR
TCP    0.0.0.0:8002    ... LISTENING    [PID]  ← Salary OCR
TCP    0.0.0.0:8003    ... LISTENING    [PID]  ← eCIB OCR
TCP    0.0.0.0:8081    ... LISTENING    [PID]  ← Document Server
```

---

## Troubleshooting

### Port Already in Use
```bash
# Find process using port
netstat -ano | findstr :[PORT]

# Kill process
taskkill /F /PID [PID]
```

### Service Not Starting
1. Check if `node_modules` are installed: `npm install`
2. Check `.env` file exists
3. Check database connection
4. Check logs for errors

### Decision Calculation Fails (503 Error)
**Cause:** Old backend (port 4000) not running

**Solution:**
```bash
cd "D:\ILOS 2.0\backend"
npm start
```

---

## Current Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Frontend (Port 3000)                        │
│  - Next.js UI                                                │
│  - All Dashboards                                            │
└─────────────────┬───────────────────────────────────────────┘
                  │
    ┌─────────────┼─────────────┬─────────────────┐
    │             │             │                 │
    ▼             ▼             ▼                 ▼
┌────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐
│Backend │  │Document  │  │Old       │  │OCR Services  │
│V2.0    │  │Server    │  │Backend   │  │8001,8002,8003│
│Port    │  │Port 8081 │  │Port 4000 │  │              │
│5000    │  │          │  │          │  │              │
│        │  │          │  │          │  │              │
│- API   │  │- Upload  │  │- Decision│  │- CNIC OCR    │
│- OCR   │  │- List    │  │  Calc    │  │- Salary OCR  │
│  Proxy │  │- Serve   │  │  (Temp)  │  │- eCIB OCR    │
└────────┘  └──────────┘  └──────────┘  └──────────────┘
```

---

## Migration Status

### ✅ Fully Migrated to Backend V2.0:
- Document storage
- File uploads
- File serving
- OCR proxy
- Main API

### ⚠️ Temporarily Using Old Backend:
- Decision calculation (DecisionEngineWrapper)
- Decision modules (DBR, Age, City, Income, SPU, EAMVU)

### 🎯 Next Phase:
Migrate decision engine to Backend V2.0 to eliminate old backend dependency

---

## Service Dependencies

```
Frontend → Backend V2.0 (Always required)
Frontend → Document Server (Always required)
Backend V2.0 → Old Backend (Temporarily for decision calc)
Backend V2.0 → OCR Services (When processing documents)
Document Server → File System (Always required)
```

---

## Minimum Required Services

**For basic functionality:**
1. Backend V2.0 (5000)
2. Document Server (8081)
3. Frontend (3000)

**For document processing:**
4. OCR Services (8001, 8002, 8003)

**For decision engine:**
5. Old Backend (4000) - temporary

---

## Startup Checklist

- [ ] Backend V2.0 running on port 5000
- [ ] Document Server running on port 8081
- [ ] Old Backend running on port 4000
- [ ] Frontend running on port 3000
- [ ] CNIC OCR running on port 8001
- [ ] Salary OCR running on port 8002
- [ ] eCIB OCR running on port 8003
- [ ] Database accessible
- [ ] All npm dependencies installed

---

## URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | Main UI |
| Backend V2.0 API | http://localhost:5000 | API endpoints |
| Backend V2.0 Health | http://localhost:5000/api/v1/health | Health check |
| Document Server | http://localhost:8081 | File operations |
| Document Upload Form | http://localhost:8081/pb-upload | Upload UI |
| Document Explorer | http://localhost:8081/explorer | Browse files |
| Old Backend | http://localhost:4000 | Decision engine |

---

## Summary

**For full ILOS V2.0 functionality, run all 7 services:**
1. ✅ Backend V2.0 (5000)
2. ✅ Document Server (8081)
3. ⚠️ Old Backend (4000) - temporary
4. ✅ Frontend (3000)
5. ✅ CNIC OCR (8001)
6. ✅ Salary OCR (8002)
7. ✅ eCIB OCR (8003)

**That's why you got 503 error - Old backend wasn't running!**

