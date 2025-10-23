# ILOS Startup Scripts

Complete automation scripts to start and stop the entire ILOS system with a single command!

## 🚀 Quick Start

### Option 1: Batch Script (Recommended for Windows)
```cmd
start-all.cmd
```
Double-click `start-all.cmd` or run from command prompt.

### Option 2: PowerShell Script
```powershell
powershell -ExecutionPolicy Bypass -File start-all.ps1
```
Or right-click → "Run with PowerShell"

---

## 📦 What Gets Started

The script launches **5 terminal windows** in sequence:

| # | Service | Port | Purpose |
|---|---------|------|---------|
| 1 | Backend API | 5000 | Main application server |
| 2 | Document Server | 8081 | File upload/download server |
| 3 | Frontend | 3000 | Next.js web dashboard |
| 4 | Metro Bundler | 8082 | React Native bundler |
| 5 | Mobile Build | - | Android app build & install |

---

## 🎯 Access Points

After all services start (takes ~30 seconds):

- **Web Dashboard:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Document Server:** http://localhost:8081
- **Metro Bundler:** http://localhost:8082

---

## 🛑 Stopping All Services

### Quick Stop
```cmd
stop-all.cmd
```
Double-click or run from command prompt.

**What it does:**
- Kills all Node.js processes
- Stops Metro bundler
- Removes Android port forwards
- Releases all ports (3000, 5000, 8081, 8082)

### Manual Stop
Press **Ctrl+C** in each terminal window, then close.

---

## 📋 Prerequisites

Before running the startup scripts, ensure:

### 1. Required Software Installed
- ✅ Node.js (v16 or higher)
- ✅ npm (comes with Node.js)
- ✅ Android SDK & ADB
- ✅ React Native development environment

### 2. Dependencies Installed
```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install

# Mobile App
cd ILOS-Mobile-App
npm install
```

### 3. Environment Files Configured
- ✅ `backend/.env` exists with database config
- ✅ `backend/backend_Filezilla_for_testing/.env` has correct document path
- ✅ `frontend/.env.local` exists (if needed)

### 4. Android Device/Emulator
- ✅ Physical device connected via USB (with USB debugging)
- ✅ OR Android emulator running
- ✅ Verify with: `adb devices`

---

## 🔧 Troubleshooting

### Script won't run (PowerShell)

**Error:** "Execution Policy Restricted"

**Fix:**
```powershell
# Option 1: Run with bypass
powershell -ExecutionPolicy Bypass -File start-all.ps1

# Option 2: Change policy permanently (Admin PowerShell)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Port already in use

**Error:** "Port 3000/5000/8081/8082 already in use"

**Fix:**
```bash
# Run stop script first
stop-all.cmd

# Or manually kill processes
netstat -ano | findstr :3000
taskkill /F /PID <PID>
```

### ADB not found

**Error:** "'adb' is not recognized as an internal or external command"

**Fix:**
```bash
# Add Android SDK platform-tools to PATH
# Example: C:\Users\YourName\AppData\Local\Android\Sdk\platform-tools

# Or run from full path:
C:\Users\faezs\AppData\Local\Android\Sdk\platform-tools\adb.exe devices
```

### Metro bundler fails to start

**Error:** "Port 8082 is already in use"

**Fix:**
```bash
# Kill existing Metro
taskkill /F /IM node.exe

# Or use a different port
cd ILOS-Mobile-App
npx react-native start --port 8083
```

### Backend fails to connect to database

**Error:** "Connection timeout" or "Database not found"

**Fix:**
```bash
# Check PostgreSQL is running
# Windows Services → PostgreSQL

# Check .env file
cd backend
type .env

# Should show:
# DATABASE_URL=postgres://ilos_user:password@localhost:5432/cbs_db
```

### Mobile app won't install

**Error:** "No devices/emulators found"

**Fix:**
```bash
# Check device connection
adb devices

# If no devices shown:
# - Enable USB debugging on phone
# - Or start Android emulator
# - Or run: adb reconnect
```

---

## 🎨 Customization

### Change Startup Order

Edit `start-all.cmd` and adjust the sequence:

```batch
REM Start services in different order
echo [1/5] Starting Frontend first...
start "ILOS Frontend" cmd /k "cd /d %ILOS_ROOT%frontend && npm run dev"

echo [2/5] Then backend...
start "ILOS Backend" cmd /k "cd /d %ILOS_ROOT%backend && npm run dev"
```

### Add Delays Between Services

Increase `timeout` values if services need more startup time:

```batch
timeout /t 5 /nobreak >nul  REM Wait 5 seconds instead of 2
```

### Skip Mobile App Build

Comment out the last step if you only need web services:

```batch
REM echo [5/5] Setting up Android...
REM start "ILOS Mobile Build" cmd /k "..."
```

### Add PostgreSQL Auto-Start

Add before backend starts:

```batch
echo [0/5] Starting PostgreSQL...
net start postgresql-x64-15
timeout /t 3 /nobreak >nul
```

---

## 📊 Startup Sequence Details

### Phase 1: Backend Services (0-10 seconds)
```
Backend API starts → Connects to database → Ready on port 5000
Document Server starts → Ready on port 8081
```

### Phase 2: Frontend (10-20 seconds)
```
Next.js compiles → Ready on port 3000
```

### Phase 3: Mobile (20-60 seconds)
```
Metro starts → Bundler ready on port 8082
Port forwarding configured → 5000, 8081, 8082
Android build → Gradle build → APK install → App launch
```

**Total Time:** ~60-90 seconds for complete startup

---

## 🔍 Monitoring Services

### Check Running Services

**Windows Task Manager:**
- Press `Ctrl+Shift+Esc`
- Look for multiple `node.exe` processes

**Command Line:**
```bash
# Check what's using ports
netstat -ano | findstr :3000
netstat -ano | findstr :5000
netstat -ano | findstr :8081
netstat -ano | findstr :8082

# Check Node.js processes
tasklist | findstr node.exe
```

### View Logs

Each terminal window shows live logs:
- **Backend:** SQL queries, API requests
- **Document Server:** File uploads/downloads
- **Frontend:** Next.js compilation, page requests
- **Metro:** Bundle updates, warnings
- **Mobile Build:** Gradle output, installation status

---

## 💡 Tips & Best Practices

### 1. First-Time Setup
```bash
# Run this once before first start:
cd D:\ILOS

# Install all dependencies
cd backend && npm install
cd ../frontend && npm install
cd ../ILOS-Mobile-App && npm install

# Then start services
start-all.cmd
```

### 2. Daily Development Workflow
```bash
# Morning: Start everything
start-all.cmd

# Work on code...

# Evening: Stop everything
stop-all.cmd
```

### 3. Only Need Web Services?
```bash
# Skip mobile, start manually:
cd backend
start cmd /k "npm run dev"

cd frontend
start cmd /k "npm run dev"

cd backend\backend_Filezilla_for_testing
start cmd /k "node uploadtoftp.js"
```

### 4. Only Need Mobile?
```bash
# Start Metro + Build
cd ILOS-Mobile-App
adb reverse tcp:5000 tcp:5000
adb reverse tcp:8081 tcp:8081
adb reverse tcp:8082 tcp:8082
npx react-native run-android --port 8082
```

### 5. Clean Restart
```bash
# If things are acting weird:
stop-all.cmd

# Wait 5 seconds

start-all.cmd
```

---

## 🐛 Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "Port already in use" | Service already running | Run `stop-all.cmd` first |
| "Module not found" | Dependencies not installed | Run `npm install` in each folder |
| "Database connection failed" | PostgreSQL not running | Start PostgreSQL service |
| "ADB not found" | Android SDK not in PATH | Add platform-tools to PATH |
| "Device not found" | Phone not connected | Connect phone + enable USB debugging |
| "Metro bundler error" | Cache issue | Run `npx react-native start --reset-cache` |
| "Cannot find package.json" | Wrong directory | Ensure script is in D:\ILOS root |

---

## 📁 File Structure

```
D:\ILOS\
├── start-all.cmd           ← Batch startup script
├── start-all.ps1           ← PowerShell startup script
├── stop-all.cmd            ← Shutdown script
├── STARTUP-SCRIPTS-README.md ← This file
│
├── backend\                ← Backend API
├── frontend\               ← Next.js web app
└── ILOS-Mobile-App\        ← React Native mobile app
```

---

## 🎯 Quick Reference

### Start Everything
```cmd
start-all.cmd
```

### Stop Everything
```cmd
stop-all.cmd
```

### Restart Everything
```cmd
stop-all.cmd && timeout /t 5 /nobreak >nul && start-all.cmd
```

### Check Status
```cmd
netstat -ano | findstr ":3000 :5000 :8081 :8082"
```

---

## ✨ Features

- ✅ **One-Click Startup** - No manual terminal management
- ✅ **Proper Sequencing** - Services start in correct order
- ✅ **Port Forwarding** - Automatic ADB configuration
- ✅ **Color-Coded Output** - Easy to track progress
- ✅ **Error Handling** - Graceful failures
- ✅ **Clean Shutdown** - Stop everything properly
- ✅ **Cross-Platform** - Both CMD and PowerShell versions

---

## 🚀 Advanced Usage

### Run Specific Services Only

**Backend + Document Server Only:**
```cmd
start "Backend" cmd /k "cd backend && npm run dev"
start "Documents" cmd /k "cd backend\backend_Filezilla_for_testing && node uploadtoftp.js"
```

**Frontend Only:**
```cmd
start "Frontend" cmd /k "cd frontend && npm run dev"
```

**Mobile Only (requires backend running):**
```cmd
cd ILOS-Mobile-App
adb reverse tcp:5000 tcp:5000
adb reverse tcp:8082 tcp:8082
npx react-native run-android --port 8082
```

---

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review terminal window logs for errors
3. Ensure all prerequisites are met
4. Try a clean restart: `stop-all.cmd` then `start-all.cmd`
5. Check individual service documentation

---

**Happy Coding! 🎉**

