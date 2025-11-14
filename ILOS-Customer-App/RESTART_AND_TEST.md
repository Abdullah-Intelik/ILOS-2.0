# Customer App - Restart and Test Guide

**Issue:** Login error after Backend V2.0 migration  
**Status:** Code updated, needs rebuild

---

## 🔧 Step-by-Step Fix

### Step 1: Stop Everything
```cmd
# Stop Metro bundler (Ctrl+C in Metro terminal)
# Close customer app on device
# Stop backend if running
```

### Step 2: Clear Cache & Reinstall
```cmd
cd "D:\ILOS 2.0\ILOS-Customer-App"

# Clear React Native cache
npx react-native start --reset-cache

# In another terminal, uninstall old app
adb uninstall com.iloscustomerapp

# Or clear app data
adb shell pm clear com.iloscustomerapp
```

### Step 3: Set Up Port Forwarding
```cmd
# Clear old forwards
adb reverse --remove-all

# Set up new forwards (Backend V2.0)
adb reverse tcp:5000 tcp:5000   # Backend API
adb reverse tcp:8086 tcp:8086   # Document Server (changed from 8081)
adb reverse tcp:8082 tcp:8082   # Metro Bundler

# Verify
adb reverse --list
```

Expected output:
```
tcp:5000 tcp:5000
tcp:8086 tcp:8086
tcp:8082 tcp:8082
```

### Step 4: Verify Backend is Running
```cmd
# Check backend health
curl http://localhost:5000/health

# Should return: {"status":"ok"}
```

If not running:
```cmd
cd "D:\ILOS 2.0"
stop-all.cmd
start-all.cmd
```

### Step 5: Rebuild App
```cmd
cd "D:\ILOS 2.0\ILOS-Customer-App"

# Start Metro (if not already running)
npm start

# In another terminal, build and install
npx react-native run-android
```

### Step 6: Test Login

**Test CNIC:** `3840393463961` (or any CNIC from your database)

**What to look for in Metro logs:**
```
✅ GOOD:
🔐 Logging in with CNIC (Backend V2.0): 3840393463961
✅ Party lookup response: { success: true, party: {...} }
📊 Customer Type: ETB, Status: ETB
✅ Login successful

❌ BAD:
❌ Login error: Network Error
❌ Error details: { message: 'Network Error', ... }
```

---

## 🔍 Troubleshooting

### Error: "Network Error" or "Network request failed"

**Cause:** Backend not reachable

**Fix:**
1. Check backend is running: `curl http://localhost:5000/health`
2. Check port forwarding: `adb reverse --list`
3. Restart backend: `stop-all.cmd` then `start-all.cmd`

### Error: "404 Not Found"

**Cause:** App using old cached code

**Fix:**
1. Clear cache: `npx react-native start --reset-cache`
2. Rebuild: `npx react-native run-android`

### Error: "Login failed" (no other details)

**Cause:** Backend V2.0 endpoint not working

**Fix:**
1. Test endpoint directly:
   ```cmd
   curl http://localhost:5000/api/v1/parties/cnic/3840393463961
   ```
2. Should return party data, not 404

### App not installing

**Cause:** Old version conflict

**Fix:**
```cmd
adb uninstall com.iloscustomerapp
npx react-native run-android
```

---

## 📊 Expected Console Logs

### Successful Login (Backend V2.0):
```javascript
// From api.js
🔐 Logging in with CNIC (Backend V2.0): 3840393463961
✅ Party lookup response: {
  success: true,
  party: {
    party_id: 7,
    cnic: "3840393463961",
    first_name: "Ahmed",
    last_name: "Khan",
    customer_type: "ETB"
  }
}
📊 Customer Type: ETB, Status: ETB

// From LoginScreen.jsx
👤 Customer Status: ETB
📋 Is NTB (needs CBS account): false
✅ ETB/RETURNING - navigating to home
```

### Failed Login (Network Error):
```javascript
❌ Login error: Error: Network Error
❌ Error details: {
  message: "Network Error",
  response: undefined,
  status: undefined,
  config: "http://10.0.2.2:5000/api/v1/parties/cnic/3840393463961"
}
```

---

## 🧪 Quick Test Commands

```cmd
# 1. Check backend
curl http://localhost:5000/health

# 2. Check party endpoint
curl http://localhost:5000/api/v1/parties/cnic/3840393463961

# 3. Check document server
curl http://localhost:8086/

# 4. Check port forwarding
adb reverse --list

# 5. Check device connection
adb devices

# 6. View app logs
adb logcat *:S ReactNative:V ReactNativeJS:V
```

---

## ✅ Success Checklist

Before testing login:
- [ ] Backend V2.0 running on port 5000
- [ ] Document Server running on port 8086
- [ ] Port forwarding set up (5000, 8086, 8082)
- [ ] Customer app cache cleared
- [ ] Customer app rebuilt and installed
- [ ] Device/emulator connected (`adb devices`)

After testing login:
- [ ] No "Login error: Error: Login failed" message
- [ ] See Backend V2.0 console logs
- [ ] Successfully navigate to Home or Document Upload
- [ ] Customer data saved locally

---

## 🚀 Quick Restart Script

Save this as `restart-customer-app.cmd`:

```cmd
@echo off
echo ========================================
echo  ILOS Customer App - Full Restart
echo ========================================
echo.

echo [1/6] Stopping services...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/6] Starting Backend V2.0...
cd /d "D:\ILOS 2.0"
start "ILOS Backend" cmd /k "cd backend && npm run dev"
timeout /t 5 /nobreak >nul

echo [3/6] Starting Document Server...
start "Document Server" cmd /k "cd backend-v2\document-server && node server.js"
timeout /t 2 /nobreak >nul

echo [4/6] Setting up port forwarding...
adb reverse --remove-all
adb reverse tcp:5000 tcp:5000
adb reverse tcp:8086 tcp:8086
adb reverse tcp:8082 tcp:8082
echo Port forwarding configured!

echo [5/6] Starting Metro bundler...
cd /d "D:\ILOS 2.0\ILOS-Customer-App"
start "Metro Bundler" cmd /k "npm start -- --reset-cache"
timeout /t 5 /nobreak >nul

echo [6/6] Building and installing app...
echo Please wait, this may take a few minutes...
start "App Build" cmd /k "cd /d D:\ILOS 2.0\ILOS-Customer-App && npx react-native run-android"

echo.
echo ========================================
echo  All services started!
echo ========================================
echo.
echo  Next: Test login with CNIC 3840393463961
echo.
pause
```

---

## 📝 What Changed in Backend V2.0

| Component | Before | After |
|-----------|--------|-------|
| Login endpoint | `/api/customer/login` | `/api/v1/parties/cnic/:cnic` |
| Customer ID | CNIC only | party_id + CNIC |
| Document upload | Port 8081 | Port 8086 |
| Submit app | 8 endpoints | 1 unified endpoint |

---

**Next Step:** Run the commands above and test the login again! 🚀

