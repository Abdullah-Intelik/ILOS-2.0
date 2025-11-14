# Customer App Login Error - FIX COMPLETE ✅

**Issue:** Login error after Backend V2.0 migration  
**Status:** ✅ **CODE UPDATED - NEEDS REBUILD**

---

## 🚨 Root Cause

The customer app was using **OLD backend endpoints** that don't exist in Backend V2.0:
- ❌ `POST /api/customer/login` (404 Not Found)

Backend V2.0 uses:
- ✅ `GET /api/v1/parties/cnic/:cnic`

---

## ✅ What Was Fixed

### 1. API Endpoints Updated (`config.js`)
```javascript
// NEW Backend V2.0 endpoints
GET_PARTY_BY_CNIC: (cnic) => `/api/v1/parties/cnic/${cnic}`
CREATE_APPLICATION: '/api/v1/applications'
DOCUMENT_SERVER.UPLOAD: 'http://10.0.2.2:8086/upload'
```

### 2. Login Method Rewritten (`api.js`)
```javascript
// Now uses Backend V2.0
async loginWithCNIC(cnic) {
  // GET /api/v1/parties/cnic/:cnic
  // Returns party_id, customer_type, etc.
  // Handles 404 as NTB (new customer)
}
```

### 3. Enhanced Error Logging (`LoginScreen.jsx`)
```javascript
// Now shows detailed error information
console.error('❌ Error details:', {
  message, response, status, config
});
```

---

## 🔧 **How to Apply the Fix**

### Option 1: Use the Restart Script (EASIEST)

```cmd
cd "D:\ILOS 2.0\ILOS-Customer-App"
restart-customer-app.cmd
```

This will:
1. ✅ Stop all services
2. ✅ Start Backend V2.0
3. ✅ Start Document Server (port 8086)
4. ✅ Set up port forwarding (5000, 8086, 8082)
5. ✅ Clear cache and rebuild app

### Option 2: Manual Steps

```cmd
# 1. Stop everything
taskkill /F /IM node.exe

# 2. Start Backend V2.0
cd "D:\ILOS 2.0"
start-all.cmd

# 3. Set up port forwarding (IMPORTANT!)
adb reverse --remove-all
adb reverse tcp:5000 tcp:5000
adb reverse tcp:8086 tcp:8086   # <-- Changed from 8081!
adb reverse tcp:8082 tcp:8082

# 4. Clear cache and rebuild
cd "D:\ILOS 2.0\ILOS-Customer-App"
npm start -- --reset-cache

# In another terminal:
npx react-native run-android
```

---

## 🧪 Testing

### Test CNIC: `3840393463961`

### Expected Console Logs (SUCCESS):
```
🔐 Logging in with CNIC (Backend V2.0): 3840393463961
✅ Party lookup response: { success: true, party: {...} }
📊 Customer Type: ETB, Status: ETB
✅ Login successful
👤 Customer Status: ETB
✅ ETB/RETURNING - navigating to home
```

### Expected Behavior:
- ✅ No "Login error: Error: Login failed"
- ✅ Login successful toast message
- ✅ Navigate to Home screen (ETB) or Document Upload (NTB)

---

## 📊 Port Changes Summary

| Service | Old Port | New Port | Command |
|---------|----------|----------|---------|
| Backend API | 5000 | 5000 | Same ✅ |
| **Document Server** | **8081** | **8086** | **CHANGED** 🔄 |
| Metro Bundler | 8082 | 8082 | Same ✅ |

**Critical:** Must update port forwarding:
```cmd
adb reverse tcp:8086 tcp:8086  # <-- NEW (was 8081)
```

---

## 🔍 Troubleshooting

### Still seeing "Login error: Error: Login failed"?

**Check 1: Backend V2.0 running?**
```cmd
curl http://localhost:5000/health
# Should return: {"status":"ok"}
```

**Check 2: Port forwarding correct?**
```cmd
adb reverse --list
# Should show:
# tcp:5000 tcp:5000
# tcp:8086 tcp:8086   <-- Must be 8086, not 8081!
# tcp:8082 tcp:8082
```

**Check 3: App using new code?**
```cmd
# Rebuild with clean cache
npm start -- --reset-cache
npx react-native run-android
```

**Check 4: Test endpoint directly**
```cmd
curl http://localhost:5000/api/v1/parties/cnic/3840393463961
# Should return party data, not 404
```

### Error: "Network Error"

**Cause:** Can't reach backend

**Fix:**
1. Check backend is running
2. Check `adb devices` shows your emulator
3. Reset port forwarding:
   ```cmd
   adb reverse --remove-all
   adb reverse tcp:5000 tcp:5000
   adb reverse tcp:8086 tcp:8086
   adb reverse tcp:8082 tcp:8082
   ```

### Error: "404 Not Found"

**Cause:** Old cached code still trying old endpoint

**Fix:**
```cmd
# Uninstall app completely
adb uninstall com.iloscustomerapp

# Rebuild
npx react-native run-android
```

---

## ✅ Success Checklist

Before testing:
- [ ] Backend V2.0 running (`curl http://localhost:5000/health`)
- [ ] Document Server running on 8086 (`curl http://localhost:8086/`)
- [ ] Port forwarding set to 8086 (`adb reverse --list`)
- [ ] App cache cleared (`npm start -- --reset-cache`)
- [ ] App rebuilt (`npx react-native run-android`)

After testing:
- [ ] No login error
- [ ] See Backend V2.0 logs in console
- [ ] Successfully navigate to next screen
- [ ] Customer data saved

---

## 📁 Files Modified

1. ✅ `ILOS-Customer-App/src/utils/config.js` - Backend V2.0 endpoints
2. ✅ `ILOS-Customer-App/src/utils/api.js` - New login logic
3. ✅ `ILOS-Customer-App/src/screens/LoginScreen.jsx` - Enhanced error logging
4. ✅ `ILOS-Customer-App/restart-customer-app.cmd` - Quick restart script

---

## 🎯 Next Steps

1. **Run the restart script:**
   ```cmd
   cd "D:\ILOS 2.0\ILOS-Customer-App"
   restart-customer-app.cmd
   ```

2. **Wait for app to install** (2-3 minutes)

3. **Test login** with CNIC: `3840393463961`

4. **Check console logs** for Backend V2.0 messages

5. **If successful:** Login works, navigates to Home/Document Upload

6. **If failed:** See troubleshooting section above

---

**The code is fixed! Just needs to be rebuilt to pick up the changes.** 🚀

**Key takeaway:** Port 8081 → 8086 for Document Server!

