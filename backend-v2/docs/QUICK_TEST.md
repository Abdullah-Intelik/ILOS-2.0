# Quick Test & Connection Guide

Fast setup to test Backend V2.0 with Frontend

---

## ⚡ 5-Minute Setup

### Step 1: Start Backend V2.0 (Terminal 1)

```bash
cd "d:\ILOS 2.0\backend-v2"
npm run dev
```

**Expected output:**
```
✅ Connected to database: ilos_v2_demo
🚀 Server running on http://localhost:6000
```

### Step 2: Test Backend API

Open new terminal:

```bash
# Quick health check
curl http://localhost:6000/api/v1/health

# Or in PowerShell:
Invoke-WebRequest -Uri http://localhost:6000/api/v1/health | Select-Object -Expand Content
```

**Expected response:**
```json
{
  "success": true,
  "status": "healthy",
  "database": "connected"
}
```

### Step 3: Start Frontend (Terminal 2)

```bash
cd "d:\ILOS 2.0\frontend"
npm run dev
```

**Expected:** Frontend opens on `http://localhost:3000`

### Step 4: Connect Frontend to Backend V2.0

**Create file:** `d:\ILOS 2.0\frontend\.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:6000/api/v1
```

**Restart frontend** for changes to take effect.

---

## ✅ Verify Connection

### Test 1: Browser Console

Open `http://localhost:3000`, press F12, run:

```javascript
fetch('http://localhost:6000/api/v1/health')
  .then(r => r.json())
  .then(d => console.log('✅ Connected:', d));
```

### Test 2: Create Test Customer

```bash
curl -X POST http://localhost:6000/api/v1/parties \
  -H "Content-Type: application/json" \
  -d '{
    "cnic": "1111111111111",
    "first_name": "Test",
    "last_name": "User",
    "date_of_birth": "1990-01-01",
    "mobile": "03001234567"
  }'
```

### Test 3: Get Customer

```bash
curl http://localhost:6000/api/v1/parties/cnic/1111111111111
```

---

## 🧪 Run Professional Tests

### Quick Test

```bash
cd "d:\ILOS 2.0\backend-v2"
npm test
```

### Specific Test Suites

```bash
# Unit tests (fast)
npm run test:unit

# Integration tests (with database)
npm run test:integration

# End-to-end tests (full workflow)
npm run test:e2e

# All tests with coverage
npm run test:coverage
```

---

## 📊 View Test Coverage

After running tests with coverage:

```bash
# Open coverage report
start coverage/index.html
```

This shows:
- ✅ Lines covered
- ✅ Branches covered
- ✅ Functions covered
- ❌ Uncovered code (highlighted in red)

---

## 🔍 Common Issues

### Backend won't start

**Check database:**
```bash
psql -U postgres -l | findstr ilos_v2_demo
```

If not found:
```bash
createdb ilos_v2_demo
cd database/migrations
psql -U postgres -d ilos_v2_demo -f 01-global-sequence.sql
# ... run all migrations
```

### Frontend can't connect

**Check CORS:**
1. Verify backend logs show: `CORS enabled for: localhost:3000`
2. Check `.env.local` has correct URL
3. Restart frontend after `.env.local` changes

### Tests fail

**Setup test database:**
```bash
createdb ilos_v2_test
cd database/migrations
# Run all migration files
```

---

## 📁 Project Structure

```
ILOS 2.0/
├── backend-v2/          ← New V2.0 Backend (Port 6000)
│   ├── src/             ← Source code
│   ├── tests/           ← Professional tests
│   ├── docs/            ← Documentation
│   └── server.js        ← Entry point
│
└── frontend/            ← Existing Frontend (Port 3000)
    ├── app/             ← Next.js pages
    ├── components/      ← React components
    └── .env.local       ← API configuration
```

---

## 🎯 Next Steps

1. ✅ Both servers running
2. ✅ Connection verified
3. ✅ Tests passing

**Now you can:**
- Update frontend to use V2 API
- Add new features to backend
- Write more tests
- Deploy to production

---

## 📚 Full Documentation

- **Setup Guide:** `docs/SETUP_GUIDE.md`
- **Testing Guide:** `docs/TESTING_GUIDE.md`
- **Frontend Connection:** `docs/FRONTEND_CONNECTION.md`
- **API Reference:** `docs/TEST_API.md`

---

**Both servers + tests ready in 5 minutes!** 🚀

