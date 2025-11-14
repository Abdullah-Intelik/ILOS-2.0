# 🚀 Start Both Servers - Quick Guide

## ✅ Backend V2.0 (Already Running!)

Backend is running on **port 6000** ✅

Check status:
```bash
netstat -ano | findstr :6000
```

Or restart if needed:
```bash
cd "d:\ILOS 2.0\backend-v2"
npm run dev
```

---

## 🎨 Frontend (Start Now)

### Option 1: PowerShell/CMD
```bash
cd "d:\ILOS 2.0\frontend"
npm run dev
```

### Option 2: New Terminal Window
1. Open new terminal
2. Run: `cd "d:\ILOS 2.0\frontend" && npm run dev`
3. Wait for "Local: http://localhost:3000"

---

## ✅ Verify Connection

### 1. Open Frontend
```
http://localhost:3000
```

### 2. Test in Browser Console (F12)
```javascript
// Quick test
fetch('http://localhost:6000/api/v1/health')
  .then(r => r.json())
  .then(d => console.log('✅ Connected:', d))
  .catch(e => console.error('❌ Error:', e));
```

**Expected Response:**
```json
{
  "success": true,
  "status": "healthy",
  "database": "connected"
}
```

### 3. Use New API Client (In React Components)
```typescript
import { apiV2 } from '@/lib/apiV2';

// Health check
const health = await apiV2.healthCheck();
console.log(health);

// Get customer
const customer = await apiV2.getPartyByCnic('1234567890123');

// Dashboard metrics
const metrics = await apiV2.getDashboardMetrics();
```

---

## 📊 Both Servers Running

✅ **Backend V2.0:** http://localhost:6000  
✅ **Frontend:** http://localhost:3000  

---

## 🎯 What's Configured

1. ✅ `.env.local` created with Backend V2.0 URL
2. ✅ New API client (`lib/apiV2.ts`)
3. ✅ CORS configured for frontend
4. ✅ Backend tested and ready

---

## 🔧 Troubleshooting

### Frontend Won't Start
```bash
# Check if port 3000 is free
netstat -ano | findstr :3000

# Kill process if needed
taskkill /PID <PID> /F
```

### Backend Not Responding
```bash
# Check if running
netstat -ano | findstr :6000

# Restart if needed
cd "d:\ILOS 2.0\backend-v2"
npm run dev
```

### Connection Test Fails
1. Ensure backend running: `netstat -ano | findstr :6000`
2. Verify `.env.local` exists in frontend
3. Restart frontend: `npm run dev`
4. Clear browser cache (Ctrl+Shift+R)

---

**Ready to go!** 🚀

