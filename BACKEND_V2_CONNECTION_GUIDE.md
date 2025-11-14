# Backend V2.0 Connection Guide

Complete guide to connect frontend to the new Backend V2.0

---

## ✅ Setup Complete

### 1. Environment Configuration ✅

**File:** `frontend/.env.local` (Created)

```env
NEXT_PUBLIC_API_URL=http://localhost:6000/api/v1
NODE_ENV=development
```

### 2. New API Client ✅

**File:** `frontend/lib/apiV2.ts` (Created)

Modern TypeScript API client for Backend V2.0:
- Type-safe methods
- Error handling
- Console logging
- Easy to use

---

## 🚀 Quick Start

### Step 1: Start Backend V2.0

**Terminal 1:**
```bash
cd "d:\ILOS 2.0\backend-v2"
npm run dev
```

**Expected output:**
```
✅ Connected to database: ilos_v2_demo
🚀 Server running on http://localhost:6000
```

### Step 2: Start Frontend

**Terminal 2:**
```bash
cd "d:\ILOS 2.0\frontend"
npm run dev
```

**Expected output:**
```
- Local:   http://localhost:3000
```

### Step 3: Test Connection

Open http://localhost:3000 and press **F12** (Developer Console):

```javascript
// Test Backend V2.0 connection
fetch('http://localhost:6000/api/v1/health')
  .then(r => r.json())
  .then(d => console.log('✅ Backend V2.0 connected:', d))
  .catch(e => console.error('❌ Connection failed:', e));
```

**Expected response:**
```json
{
  "success": true,
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-11-07T..."
}
```

---

## 📝 Using the New API Client

### Option 1: Use New V2 Client (Recommended)

```typescript
// Import the new client
import { apiV2 } from '@/lib/apiV2';

// Get customer by CNIC
const customer = await apiV2.getPartyByCnic('1234567890123');

// Create application
const application = await apiV2.createApplication({
  party_id: customer.data.party_id,
  product_id: 1,
  product_code: 'CASHPLUS',
  requested_amount: 500000,
  tenure_months: 36,
});

// Submit application
const result = await apiV2.submitApplication(application.data.los_id);

// Get dashboard metrics
const metrics = await apiV2.getDashboardMetrics();
```

### Option 2: Update Existing Code

The frontend will automatically use Backend V2.0 if `NEXT_PUBLIC_API_URL` is set:

```typescript
// Existing code will work with the environment variable
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/health`);

// Now points to: http://localhost:6000/api/v1/health ✅
```

---

## 🔄 API Endpoint Mapping

### Old Backend (Port 5000) → New Backend V2.0 (Port 6000)

| Old Endpoint | New V2.0 Endpoint | Status |
|--------------|-------------------|--------|
| `/api/cashplus` | `/api/v1/applications` | ✅ Ready |
| `/api/applications` | `/api/v1/applications` | ✅ Ready |
| `/customer-status/:cnic` | `/api/v1/parties/cnic/:cnic` | ✅ Ready |
| `/api/applications/department/PB` | `/api/v1/dashboard/metrics` | ✅ Ready |
| `/health` | `/api/v1/health` | ✅ Ready |

---

## 🧪 Testing Examples

### Test 1: Health Check

```bash
curl http://localhost:6000/api/v1/health
```

**Expected:**
```json
{
  "success": true,
  "status": "healthy"
}
```

### Test 2: Get Customer

```bash
curl http://localhost:6000/api/v1/parties/cnic/1234567890123
```

### Test 3: Dashboard Metrics

```bash
curl http://localhost:6000/api/v1/dashboard/metrics
```

### Test 4: Browser Console

```javascript
// Health check
const health = await fetch('http://localhost:6000/api/v1/health').then(r => r.json());
console.log('Health:', health);

// Get metrics
const metrics = await fetch('http://localhost:6000/api/v1/dashboard/metrics').then(r => r.json());
console.log('Metrics:', metrics);
```

---

## 🔧 Troubleshooting

### Issue: Connection Refused

**Symptoms:**
```
Failed to fetch
net::ERR_CONNECTION_REFUSED
```

**Solutions:**
1. Ensure backend V2.0 is running: `cd backend-v2 && npm run dev`
2. Check port 6000 is free: `netstat -ano | findstr :6000`
3. Verify `.env.local` exists in frontend folder

### Issue: CORS Error

**Symptoms:**
```
Access to fetch blocked by CORS policy
```

**Solution:**
Backend V2.0 already has CORS configured for `localhost:3000`. If issue persists, restart backend:
```bash
cd "d:\ILOS 2.0\backend-v2"
npm run dev
```

### Issue: 404 Not Found

**Symptoms:**
```
GET http://localhost:6000/api/applications 404
```

**Solution:**
Update endpoint to V2 format: `/api/v1/applications`

### Issue: Wrong Port

**Check which backend is running:**
```powershell
# Check port 5000 (old backend)
netstat -ano | findstr :5000

# Check port 6000 (new backend V2.0)
netstat -ano | findstr :6000
```

---

## 📊 Verification Checklist

Run these checks to verify the connection:

- [ ] **Backend V2.0 running** - Terminal shows "Server running on http://localhost:6000"
- [ ] **Frontend running** - Browser opens on http://localhost:3000
- [ ] **`.env.local` created** - File exists in frontend folder
- [ ] **Health check works** - Browser console shows successful response
- [ ] **No CORS errors** - Browser console has no CORS messages
- [ ] **API v2 client works** - Can import and use `apiV2`

---

## 🎯 Next Steps

### 1. Test Key Features

- Create a customer
- Submit an application
- Check dashboard metrics

### 2. Update Components (Optional)

Gradually migrate components to use the new V2 client:

```typescript
// Old way
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cashplus`, {...});

// New way (cleaner)
import { apiV2 } from '@/lib/apiV2';
const response = await apiV2.createApplication({...});
```

### 3. Monitor Backend Logs

Backend V2.0 logs all requests:
```
[GET] /api/v1/health - 200 (1ms)
[POST] /api/v1/applications - 201 (15ms)
```

---

## 📚 Additional Resources

- **Backend V2.0 README:** `backend-v2/README.md`
- **API Reference:** `backend-v2/docs/TEST_API.md`
- **Testing Guide:** `backend-v2/docs/TESTING_GUIDE.md`
- **Test Results:** `backend-v2/TEST_RESULTS_SUMMARY.md`

---

## 🎉 Success Criteria

You'll know the connection is working when:

✅ Backend V2.0 starts without errors  
✅ Frontend starts without errors  
✅ Health check returns successful response  
✅ Browser console shows no CORS errors  
✅ Backend logs show incoming requests  

---

**Both servers must run simultaneously for full functionality!** 🚀

---

## 💡 Quick Commands

```bash
# Start both servers (run in 2 terminals)

# Terminal 1 - Backend V2.0
cd "d:\ILOS 2.0\backend-v2" && npm run dev

# Terminal 2 - Frontend
cd "d:\ILOS 2.0\frontend" && npm run dev
```

After both start, open: http://localhost:3000

Test connection in browser console:
```javascript
fetch('http://localhost:6000/api/v1/health').then(r=>r.json()).then(console.log)
```

**That's it! You're connected!** ✅

