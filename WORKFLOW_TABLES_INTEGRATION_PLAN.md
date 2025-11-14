# 🔧 Workflow Tables Integration Plan

## Tables Created ✅

1. **`application_workflow`** - Complete workflow history
2. **`spu_checks`** - SPU compliance checks
3. **`eavmu_verifications`** - Field verification by EAVMU officers
4. **`ciu_decisions`** - CIU credit decisions  
5. **`disbursements`** - Disbursement tracking

---

## Current Integration Status

### ✅ Already Integrated

1. **CIU Dashboard (`/dashboard/ciu`)**
   - ✅ Reads from `spu_checks` table
   - ✅ Reads from `eavmu_verifications` table
   - ✅ Decision Engine uses these for scoring

2. **Backend API (`application.repository.js`)**
   - ✅ Joins `spu_checks` table
   - ✅ Joins `eavmu_verifications` table
   - ✅ Returns SPU and EAVMU status to frontend

---

## ❌ Missing Integrations (Need to Implement)

### 1. SPU Dashboard - Save to `spu_checks` Table

**Files to Update:**
- `frontend/app/dashboard/spu/page.tsx`
- `frontend/app/dashboard/spu_officer/page.tsx`

**Current Behavior:** SPU officers check applications but data might not be saved to `spu_checks` table

**Required Changes:**

#### Backend API Endpoint Needed:
```javascript
// backend-v2/src/api/v1/routes/spu.routes.js (CREATE THIS FILE)

POST /api/v1/spu/checks
Body: {
  application_id: 123,
  los_id: 61,
  party_id: 456,
  pep_check_result: 'Pass',
  sbp_blacklist_result: 'Pass',
  nadra_verisys_result: 'Pass',
  internal_watchlist_result: 'Pass',
  ccl_check_result: 'Pass',
  overall_result: 'Pass',
  checked_by: user_id
}
```

#### Frontend Integration:
```typescript
// In SPU dashboard, when officer completes checks:
const saveSPUChecks = async () => {
  const response = await fetch('/api/v1/spu/checks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      application_id: appData.application_id,
      los_id: appData.los_id,
      party_id: appData.party_id,
      pep_check_result: pepCheckPassed ? 'Pass' : 'Fail',
      sbp_blacklist_result: blacklistPassed ? 'Pass' : 'Fail',
      nadra_verisys_result: nadraPassed ? 'Pass' : 'Fail',
      internal_watchlist_result: watchlistPassed ? 'Pass' : 'Fail',
      ccl_check_result: cclPassed ? 'Pass' : 'Fail',
      overall_result: allPassed ? 'Pass' : 'Fail',
      checked_by: currentUser.user_id
    })
  });
};
```

---

### 2. EAVMU Dashboard - Save to `eavmu_verifications` Table

**Files to Update:**
- `frontend/app/dashboard/eamvu_officer/page.tsx`
- `frontend/app/dashboard/eamvu/page.tsx`

**Current Behavior:** EAVMU officers verify applications but data might not be saved to `eavmu_verifications` table

**Required Changes:**

#### Backend API Endpoint Needed:
```javascript
// backend-v2/src/api/v1/routes/eavmu.routes.js (CREATE THIS FILE)

POST /api/v1/eavmu/verifications
Body: {
  application_id: 123,
  los_id: 61,
  party_id: 456,
  assigned_to: user_id,
  residence_verified: true,
  residence_verification_notes: "Visited residence, confirmed address",
  residence_coordinates: "24.8607,67.0011",
  workplace_verified: true,
  workplace_verification_notes: "Confirmed employment at HBL",
  workplace_coordinates: "24.8608,67.0012",
  document_verification: true,
  reference_verification: true,
  overall_result: 'Approved',
  recommendation: "All verifications passed"
}
```

#### Frontend Integration:
```typescript
// In EAVMU officer dashboard, when verification is complete:
const saveEAVMUVerification = async () => {
  const response = await fetch('/api/v1/eavmu/verifications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      application_id: appData.application_id,
      los_id: appData.los_id,
      party_id: appData.party_id,
      assigned_to: currentUser.user_id,
      residence_verified: residenceVerified,
      residence_verification_notes: residenceNotes,
      residence_coordinates: gpsCoordinates,
      workplace_verified: workplaceVerified,
      workplace_verification_notes: workplaceNotes,
      document_verification: documentsVerified,
      reference_verification: referencesVerified,
      overall_result: allVerified ? 'Approved' : 'Rejected',
      recommendation: verificationNotes
    })
  });
};
```

---

### 3. CIU Dashboard - Save to `ciu_decisions` Table

**Files to Update:**
- `frontend/app/dashboard/ciu/page.tsx`
- `frontend/components/decision-engine-calculator.tsx`

**Current Behavior:** Decision Engine calculates but doesn't save to `ciu_decisions` table

**Required Changes:**

#### Backend API Endpoint:
```javascript
// backend-v2/src/api/legacy/decision-engine.routes.js (UPDATE EXISTING)

// After calculating decision, also save to ciu_decisions table:
await db.query(`
  INSERT INTO ciu_decisions (
    application_id, los_id, party_id,
    decision, decision_date, decided_by,
    approved_amount, approved_tenure_months, approved_interest_rate,
    credit_score, dti_ratio, ecib_analysis,
    recommendation, comments
  ) VALUES ($1, $2, $3, $4, NOW(), $5, $6, $7, $8, $9, $10, $11, $12, $13)
`, [
  application_id, losId, party_id,
  decision, decided_by,
  approved_amount, approved_tenure, approved_rate,
  credit_score, dti_ratio, JSON.stringify(ecib_analysis),
  recommendation, comments
]);
```

---

### 4. COPS Dashboard - Save to `disbursements` Table

**Files to Update:**
- `frontend/app/dashboard/cops/page.tsx`

**Required Changes:**

#### Backend API Endpoint:
```javascript
// backend-v2/src/api/v1/routes/disbursement.routes.js (CREATE THIS FILE)

POST /api/v1/disbursements
Body: {
  application_id: 123,
  los_id: 61,
  party_id: 456,
  disbursement_amount: 200000,
  disbursement_method: 'Bank Transfer',
  beneficiary_bank: 'ABC Bank',
  beneficiary_account: 'ACC1001001',
  initiated_by: user_id,
  notes: 'Disbursement processed'
}
```

---

### 5. Application Workflow History - Track All Stage Changes

**Required Changes:**

#### Backend Middleware:
```javascript
// backend-v2/src/middleware/workflow-logger.js (CREATE THIS FILE)

// Automatically log to application_workflow table whenever:
// - Application status changes
// - Application is assigned to a user
// - Application moves to a new stage

async function logWorkflowChange(req, res, next) {
  if (req.body.status || req.body.assigned_to || req.body.current_stage) {
    await db.query(`
      INSERT INTO application_workflow (
        application_id, los_id, stage, action,
        performed_by, assigned_to,
        status_from, status_to,
        comments, is_automated
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [
      application_id, los_id, current_stage, 'update',
      req.user.user_id, new_assigned_to,
      old_status, new_status,
      req.body.comments, false
    ]);
  }
  next();
}
```

---

## Implementation Priority

### Phase 1: Critical (Implement First) 🔴

1. **SPU Checks Integration**
   - Create backend API: `POST /api/v1/spu/checks`
   - Update SPU officer dashboard to save checks
   - **Impact:** Decision Engine currently shows "SPU: Pass" but needs real data

2. **EAVMU Verifications Integration**
   - Create backend API: `POST /api/v1/eavmu/verifications`
   - Update EAVMU officer dashboard to save verifications
   - **Impact:** Decision Engine shows "EAVMU not approved" - needs real data

### Phase 2: Important (Implement Next) 🟡

3. **CIU Decisions Integration**
   - Update Decision Engine API to save to `ciu_decisions` table
   - Add decision history view in CIU dashboard
   - **Impact:** Track decision history and audit trail

4. **Workflow Logging Middleware**
   - Create automatic workflow logging
   - Track all application status changes
   - **Impact:** Complete audit trail

### Phase 3: Enhancement (Later) 🟢

5. **COPS Disbursements Integration**
   - Create disbursement API
   - Update COPS dashboard
   - **Impact:** Track disbursements

---

## Files to Create

### Backend API Routes:
1. `backend-v2/src/api/v1/routes/spu.routes.js`
2. `backend-v2/src/api/v1/controllers/spu.controller.js`
3. `backend-v2/src/api/v1/routes/eavmu.routes.js`
4. `backend-v2/src/api/v1/controllers/eavmu.controller.js`
5. `backend-v2/src/api/v1/routes/disbursement.routes.js`
6. `backend-v2/src/api/v1/controllers/disbursement.controller.js`
7. `backend-v2/src/middleware/workflow-logger.js`

### Frontend Updates:
1. `frontend/app/dashboard/spu/page.tsx` - Add save functionality
2. `frontend/app/dashboard/spu_officer/page.tsx` - Add save functionality
3. `frontend/app/dashboard/eamvu_officer/page.tsx` - Add save functionality
4. `frontend/app/dashboard/ciu/page.tsx` - Add decision history view
5. `frontend/app/dashboard/cops/page.tsx` - Add disbursement tracking

---

## Testing Checklist

After implementation:
- [ ] SPU officer completes checks → Data saved to `spu_checks` table
- [ ] CIU dashboard shows correct SPU status from database
- [ ] EAVMU officer completes verification → Data saved to `eavmu_verifications` table
- [ ] CIU dashboard shows correct EAVMU status from database
- [ ] Decision Engine calculation → Saved to `ciu_decisions` table
- [ ] Application status change → Logged to `application_workflow` table
- [ ] COPS disbursement → Saved to `disbursements` table

---

## Summary

**Current Status:**
- ✅ Tables created in database
- ✅ CIU dashboard reads from tables
- ✅ Decision Engine uses table data for scoring
- ❌ SPU dashboard doesn't save to table
- ❌ EAVMU dashboard doesn't save to table
- ❌ Decision Engine doesn't save decisions to table
- ❌ Workflow changes not logged automatically

**Next Steps:**
1. Create SPU backend API and integrate with SPU dashboard
2. Create EAVMU backend API and integrate with EAVMU officer dashboard
3. Update Decision Engine to save to `ciu_decisions` table
4. Add workflow logging middleware

---

**Want me to start implementing? Say which phase to begin with!**

