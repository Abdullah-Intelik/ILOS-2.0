# ✅ Decision Engine Migration to Backend V2.0

## Overview
All decision engine endpoints have been successfully migrated from the old backend (port 4000) to Backend V2.0 (port 5000).

---

## Changes Made

### 1. **Created New Decision Engine Routes** 
**File:** `backend-v2/src/api/legacy/decision-engine.routes.js`

#### Endpoints:
- **`POST /api/decision/upload-ecib`**
  - Handles eCIB PDF uploads
  - Proxies to OCR service (port 8003)
  - Returns parsed eCIB data in new array format

- **`POST /api/decision/calculate`**
  - Calculates credit decision based on application + eCIB data
  - **Currently proxies to old backend** (port 4000) for actual calculation
  - **TODO:** Port `DecisionEngineWrapper` and all decision modules to V2.0

---

### 2. **Registered Routes**
**File:** `backend-v2/src/api/v1/routes/index.js`

Added:
```javascript
const { createDecisionEngineRoutes } = require('../../legacy/decision-engine.routes');
app.use('/api/decision', createDecisionEngineRoutes());
```

**Available at:** `http://localhost:5000/api/decision/*`

---

### 3. **Updated Frontend**
**File:** `frontend/components/decision-engine-calculator.tsx`

**Before:**
```typescript
const oldBackendUrl = 'http://localhost:4000'
const response = await fetch(`${oldBackendUrl}/api/decision/calculate`, {...})
```

**After:**
```typescript
const apiUrl = getApiUrl() // Returns http://localhost:5000
const response = await fetch(`${apiUrl}/api/decision/calculate`, {...})
```

---

## Current Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│                    (Next.js, Port 3000)                      │
└────────────┬────────────────────────────────────────────────┘
             │
             │ All API calls now go to Backend V2.0
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND V2.0 (Port 5000)                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │   /api/decision/upload-ecib                         │    │
│  │   → OCR Service (Port 8003)                         │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │   /api/decision/calculate                           │    │
│  │   → TEMPORARILY proxies to Old Backend (Port 4000)  │    │
│  │   → TODO: Migrate DecisionEngineWrapper              │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
             │
             │ (Temporary)
             ▼
┌─────────────────────────────────────────────────────────────┐
│             OLD BACKEND (Port 4000)                          │
│  - DecisionEngineWrapper                                     │
│  - All decision modules (DBR, Age, City, Income, etc.)      │
│  - Database operations for decision_engine_results table     │
└─────────────────────────────────────────────────────────────┘
```

---

## Benefits

### ✅ Single Source of Truth
- Frontend now exclusively calls Backend V2.0 (port 5000)
- No more confusion about which backend to use

### ✅ Better Organization
- Decision engine routes properly organized in `legacy/` folder
- Follows Backend V2.0 architecture patterns

### ✅ Future-Ready
- Easy to migrate actual decision calculation logic later
- Temporary proxy makes transition seamless

---

## Next Steps (TODO)

### Phase 1: Port Decision Engine Core ✅ DONE
- [x] Create `/api/decision/upload-ecib` endpoint in V2.0
- [x] Create `/api/decision/calculate` endpoint in V2.0 (with proxy)
- [x] Update frontend to use Backend V2.0

### Phase 2: Full Migration (Future)
- [ ] Copy `backend/lib/DecisionEngineWrapper.js` to Backend V2.0
- [ ] Copy all decision modules:
  - `DBR.js` (Debt-to-Income Ratio)
  - `Age.js` (Age-based scoring)
  - `City.js` (Location-based risk)
  - `Income.js` (Income verification)
  - `SPU.js` (Special Purpose Unit checks)
  - `EAMVU.js` (Employment verification)
  - `ApplicationScorecard.js`
  - `BehavioralScorecard.js`
- [ ] Update database queries to use V2.0 connection pool
- [ ] Remove proxy to old backend
- [ ] Test all decision calculations

### Phase 3: Cleanup (After Full Migration)
- [ ] Deprecate old backend decision endpoints
- [ ] Eventually shut down old backend (port 4000)

---

## Testing

### 1. **Test eCIB Upload**
```bash
POST http://localhost:5000/api/decision/upload-ecib
Content-Type: multipart/form-data

ecib_pdf: [PDF FILE]
losId: 61
```

**Expected:** eCIB data extracted and returned

### 2. **Test Decision Calculation**
```bash
POST http://localhost:5000/api/decision/calculate
Content-Type: application/json

{
  "losId": 61,
  "applicationData": { ... },
  "ecibData": { ... },
  "calculatedBy": "CIU_OFFICER"
}
```

**Expected:** Decision result with score, recommendation, and modules breakdown

### 3. **Test CIU Dashboard Auto-Load**
1. Open CIU dashboard
2. Select an application with uploaded eCIB (e.g., LOS-61)
3. **Expected:**
   - eCIB auto-loads from PB documents
   - OCR processes automatically
   - Decision auto-calculates
   - Shows "eCIB Already Uploaded" badge

---

## Important Notes

⚠️ **OLD BACKEND STILL REQUIRED:** The old backend (port 4000) must remain running until Phase 2 is complete, as the actual decision calculation logic still resides there.

✅ **FRONTEND DOESN'T KNOW:** From the frontend's perspective, everything now goes through Backend V2.0. The temporary proxy is transparent.

🔄 **SEAMLESS MIGRATION:** When Phase 2 is complete, we simply remove the proxy and the frontend won't need any changes.

---

## Files Modified

### Backend
- ✅ Created: `backend-v2/src/api/legacy/decision-engine.routes.js`
- ✅ Modified: `backend-v2/src/api/v1/routes/index.js`

### Frontend
- ✅ Modified: `frontend/components/decision-engine-calculator.tsx`

---

## Summary

**Before:** Frontend → Old Backend (port 4000)  
**Now:** Frontend → Backend V2.0 (port 5000) → Old Backend (temporary proxy)  
**Future:** Frontend → Backend V2.0 (port 5000) [complete migration]

All decision engine functionality is now accessible through Backend V2.0! 🎉

