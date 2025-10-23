# 🚀 ILOS Quick Start Guide

## One-Line Commands

### Start Everything
```cmd
start-all.cmd
```
Launches all 5 services in separate windows.

### Stop Everything
```cmd
stop-all.cmd
```
Cleanly shuts down all services.

### Restart Everything
```cmd
restart-all.cmd
```
Stops, waits, then starts all services.

### Check System
```cmd
check-system.cmd
```
Verifies all prerequisites are installed.

---

## 📦 Available Scripts

| Script | Purpose | When to Use |
|--------|---------|-------------|
| `start-all.cmd` | Start all services | Daily startup, first run |
| `start-all.ps1` | Start all (PowerShell) | If you prefer PowerShell |
| `stop-all.cmd` | Stop all services | End of day, before restart |
| `restart-all.cmd` | Restart everything | After code changes, troubleshooting |
| `check-system.cmd` | Verify setup | Before first run, after updates |

---

## 🎯 First Time Setup

```cmd
# 1. Check if everything is ready
check-system.cmd

# 2. If checks pass, start everything
start-all.cmd

# 3. Wait ~60 seconds for all services to start

# 4. Access the system:
#    - Web: http://localhost:3000
#    - Mobile: Opens automatically on device
```

---

## 📱 What Opens

When you run `start-all.cmd`, you'll see **5 terminal windows**:

```
┌─────────────────────────────────────────┐
│ Window 1: Backend API (Port 5000)      │
│ - Database connections                  │
│ - API endpoints                         │
│ - SQL queries                           │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Window 2: Document Server (Port 8081)  │
│ - File uploads/downloads                │
│ - Document management                   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Window 3: Frontend (Port 3000)         │
│ - Next.js compilation                   │
│ - Page requests                         │
│ - Hot reload                            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Window 4: Metro Bundler (Port 8082)    │
│ - React Native bundling                 │
│ - Fast refresh                          │
│ - Bundle updates                        │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Window 5: Mobile Build                 │
│ - Port forwarding setup                 │
│ - Gradle build                          │
│ - APK installation                      │
│ - App launch                            │
└─────────────────────────────────────────┘
```

---

## ⏱️ Startup Timeline

```
0s   → start-all.cmd executed
2s   → Backend API starting...
4s   → Document Server starting...
6s   → Frontend starting...
8s   → Metro Bundler starting...
15s  → Mobile build starting...
30s  → Frontend ready at http://localhost:3000
45s  → Gradle build complete
60s  → App installed and launched on device
```

**Total: ~60-90 seconds**

---

## 🔧 Daily Workflow

### Morning
```cmd
# Start your day
start-all.cmd
```

### During Development
- Code changes hot-reload automatically
- Check terminal windows for errors
- Logs show real-time activity

### Evening
```cmd
# End your day
stop-all.cmd
```

### After Major Changes
```cmd
# Clean restart
restart-all.cmd
```

---

## 🐛 Quick Fixes

### Services won't start
```cmd
# Stop everything first
stop-all.cmd

# Wait 5 seconds

# Start again
start-all.cmd
```

### Port conflicts
```cmd
# Kill all Node processes
taskkill /F /IM node.exe

# Then start
start-all.cmd
```

### Mobile app issues
```cmd
# Check device connection
adb devices

# Reconnect if needed
adb reconnect

# Rebuild
cd ILOS-Mobile-App
npx react-native run-android --port 8082
```

### Database issues
```cmd
# Check PostgreSQL service is running
# Windows Services → PostgreSQL

# Verify connection in backend/.env
type backend\.env
```

---

## 📊 System Requirements

- ✅ Windows 10/11
- ✅ Node.js v16+
- ✅ npm (comes with Node.js)
- ✅ Android SDK + ADB
- ✅ PostgreSQL database
- ✅ 8GB RAM minimum
- ✅ Android device or emulator

---

## 🌐 Access Points

After startup:

| Service | URL | Purpose |
|---------|-----|---------|
| **Web Dashboard** | http://localhost:3000 | Main interface |
| **Backend API** | http://localhost:5000 | REST API |
| **Document Server** | http://localhost:8081 | File operations |
| **Metro Bundler** | http://localhost:8082 | Mobile dev |
| **Mobile App** | (on device) | EAMVU Officer app |

---

## 💡 Pro Tips

### Tip 1: Keep Windows Open
Don't close the terminal windows - they show important logs!

### Tip 2: Check Logs Often
If something isn't working, check the relevant terminal window.

### Tip 3: Use restart-all.cmd
After installing npm packages or major changes, restart everything.

### Tip 4: Run check-system.cmd First
Before asking "why doesn't it work?", run the system check.

### Tip 5: Stop Before Pulling Code
```cmd
# Stop services
stop-all.cmd

# Pull latest code
git pull

# Restart services
start-all.cmd
```

---

## 🎓 Learn More

- **Full Documentation:** `STARTUP-SCRIPTS-README.md`
- **Location Fix:** `LOCATION-NOT-SHOWING-DEBUG.md`
- **Document Naming:** `DOCUMENT-NAMING-FIX.md`
- **Location Feature:** `LOCATION-AND-COMMENTS-FIX.md`

---

## ✨ Features

- ✅ **One Command Start** - No manual setup
- ✅ **Automatic Sequencing** - Services start in order
- ✅ **Port Forwarding** - Configured automatically
- ✅ **Error Handling** - Graceful failures
- ✅ **Clean Shutdown** - Stop everything properly
- ✅ **System Checks** - Verify before start
- ✅ **Quick Restart** - One command

---

## 🎯 Quick Reference Card

```
┌──────────────────────────────────────────┐
│  ILOS Quick Commands                     │
├──────────────────────────────────────────┤
│  start-all.cmd    → Start everything     │
│  stop-all.cmd     → Stop everything      │
│  restart-all.cmd  → Restart everything   │
│  check-system.cmd → Verify setup         │
├──────────────────────────────────────────┤
│  Access Points:                          │
│  • Web:  http://localhost:3000           │
│  • API:  http://localhost:5000           │
│  • Docs: http://localhost:8081           │
└──────────────────────────────────────────┘
```

---

**That's it! You're ready to go! 🎉**

Just run `start-all.cmd` and start coding!

