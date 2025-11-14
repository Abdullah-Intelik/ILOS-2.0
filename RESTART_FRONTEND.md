# 🔄 Restart Frontend - Step by Step

## Current Issue

Frontend is still trying to connect to **OLD backend (port 5000)** instead of **NEW Backend V2.0 (port 6000)**.

---

## ✅ Solution: Restart Frontend

### Step 1: Find Your Frontend Terminal

Look for the terminal window running:
```
npm run dev
```

Or showing output like:
```
- Local:   http://localhost:3000
- Network: http://...
```

### Step 2: Stop the Frontend

In that terminal:
- Press **`Ctrl + C`**
- Wait for "Terminated" or prompt to return

### Step 3: Start Frontend Again

```bash
cd "d:\ILOS 2.0\frontend"
npm run dev
```

### Step 4: Wait for Success

You should see:
```
✓ Ready in Xs
- Local:   http://localhost:3000
```

### Step 5: Refresh Browser

- Go to: http://localhost:3000/dashboard/pb/applications
- Press **`Ctrl + Shift + R`** (hard refresh)

---

## ✅ What This Does

1. **Stops old frontend** → Old config cleared
2. **Reads `.env.local`** → New Backend V2.0 URL loaded
3. **Starts with new config** → Connects to port 6000
4. **Browser refresh** → Loads new frontend code

---

## 🎯 After Restart

Frontend will connect to:
```
http://localhost:6000/api/v1/applications
```

Instead of:
```
http://localhost:5000/api/applications  ❌ (old)
```

---

## 🔧 If Frontend Won't Stop

Kill the process:
```bash
# Find PID
netstat -ano | findstr :3000

# Kill it
taskkill /PID <PID> /F

# Start again
npm run dev
```

---

## ✅ Verification

After restart, check browser console (F12):

**Before restart:**
```
❌ GET http://localhost:5000/... ERR_CONNECTION_REFUSED
```

**After restart:**
```
✅ GET http://localhost:6000/api/v1/... 200 OK
```

---

**Just restart the frontend terminal!** 🚀

