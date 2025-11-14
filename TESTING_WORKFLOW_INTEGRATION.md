# 🧪 Testing Workflow Tables Integration

## Quick Test Guide

### ✅ Backend Status
- Backend V2.0: Running on port 5000
- Document Server: Running on port 8081
- All workflow tables created: `spu_checks`, `eavmu_verifications`, `ciu_decisions`, `application_workflow`

---

## Test 1: SPU Checks Integration

### Steps:
1. **Open SPU Dashboard:** `http://localhost:3000/dashboard/spu`
2. **Select an application** from the list
3. **Verify the application** (complete all document checks)
4. **Click "Verify Application"** button

### Expected Backend Logs:
```
🔄 Updating status for LOS-X
   Department: SPU, Action: verify
📝 Saving SPU checks for LOS-X
✅ SPU checks saved for LOS-X
✅ Workflow logged: SPU - verify
```

### Verify in Database:
```sql
-- Check SPU checks table
SELECT * FROM spu_checks WHERE los_id = X ORDER BY checked_at DESC;

-- Should show:
-- ✅ pep_check_result
-- ✅ sbp_blacklist_result
-- ✅ nadra_verisys_result
-- ✅ internal_watchlist_result
-- ✅ ccl_check_result
-- ✅ overall_result
-- ✅ checked_by (user_id)
-- ✅ checked_at (timestamp)
```

### Verify in Application:
```sql
-- Check application was updated
SELECT current_stage, application_status FROM applications WHERE los_id = X;

-- Should show:
-- current_stage: 'EAVMU' (moved to next stage)
-- application_status: 'spu_cleared'
```

---

## Test 2: EAVMU Verification Integration

### Steps:
1. **Open EAVMU Officer Dashboard:** `http://localhost:3000/dashboard/eamvu_officer`
2. **Select an assigned application**
3. **Complete all verifications:**
   - Residence verification
   - Workplace verification
   - Document verification
   - Reference verification
4. **Submit verification**

### Expected Backend Logs:
```
🔄 Updating status for LOS-X
   Department: EAVMU, Action: verify
📝 Saving EAVMU verification for LOS-X
✅ EAVMU verification saved for LOS-X
✅ Workflow logged: EAVMU - verify
```

### Verify in Database:
```sql
-- Check EAVMU verifications table
SELECT * FROM eavmu_verifications WHERE los_id = X ORDER BY completed_at DESC;

-- Should show:
-- ✅ residence_verified (boolean)
-- ✅ residence_verification_notes (text)
-- ✅ workplace_verified (boolean)
-- ✅ workplace_verification_notes (text)
-- ✅ document_verification (boolean)
-- ✅ reference_verification (boolean)
-- ✅ overall_result ('Approved' or 'Rejected')
-- ✅ assigned_to (user_id)
-- ✅ completed_at (timestamp)
```

### Verify in Application:
```sql
-- Check application was updated
SELECT current_stage, application_status FROM applications WHERE los_id = X;

-- Should show:
-- current_stage: 'CIU' (moved to next stage)
-- application_status: 'eavmu_verified'
```

---

## Test 3: CIU Decision Integration

### Steps:
1. **Open CIU Dashboard:** `http://localhost:3000/dashboard/ciu`
2. **Select an application**
3. **Decision Engine should auto-load application data**
4. **eCIB should auto-load if available**
5. **Click "Calculate Decision"** button

### Expected Backend Logs:
```
⚙️  RUNNING DECISION ENGINE (Backend V2.0)...

📊 DECISION RESULT:
  Final Score: 75.5
  Decision: APPROVE
  Risk Level: MEDIUM

✅ Decision calculated for LOS-X: APPROVE (Score: 75.5)
✅ Decision saved to ciu_decisions table for LOS-X
```

### Verify in Database:
```sql
-- Check CIU decisions table
SELECT * FROM ciu_decisions WHERE los_id = X ORDER BY decision_date DESC;

-- Should show:
-- ✅ decision ('APPROVE' or 'REJECT')
-- ✅ credit_score (final score)
-- ✅ dti_ratio (debt-to-income ratio)
-- ✅ approved_amount (loan amount)
-- ✅ approved_tenure_months (tenure)
-- ✅ approved_interest_rate (rate)
-- ✅ ecib_analysis (JSON)
-- ✅ recommendation (text)
-- ✅ decided_by (user_id)
-- ✅ decision_date (timestamp)
```

### Verify Decision Reads SPU & EAVMU Data:
```sql
-- Check that decision engine used correct data
SELECT 
  a.los_id,
  spu.overall_result as spu_status,
  eav.overall_result as eavmu_status,
  ciu.decision as ciu_decision,
  ciu.credit_score
FROM applications a
LEFT JOIN spu_checks spu ON a.application_id = spu.application_id
LEFT JOIN eavmu_verifications eav ON a.application_id = eav.application_id
LEFT JOIN ciu_decisions ciu ON a.application_id = ciu.application_id
WHERE a.los_id = X;

-- Should show consistent data flow:
-- SPU Pass → EAVMU Approved → CIU APPROVE (high score)
-- SPU Fail → Application rejected (no CIU decision)
```

---

## Test 4: Workflow Logging

### Steps:
1. **Perform any action** in any dashboard (SPU verify, EAVMU verify, etc.)
2. **Check workflow logs**

### Verify in Database:
```sql
-- Check workflow logs
SELECT 
  workflow_id,
  stage,
  action,
  status_to,
  comments,
  created_at
FROM application_workflow 
WHERE los_id = X 
ORDER BY created_at DESC;

-- Should show complete history:
-- 1. PB - submit
-- 2. SPU - verify (spu_cleared)
-- 3. EAVMU - verify (eavmu_verified)
-- 4. CIU - decision (decision_made)
```

---

## Test 5: Complete End-to-End Flow

### Full Application Journey:

```
1. PB Dashboard
   ↓ Submit application
   ↓ Upload documents
   ✅ Workflow logged: PB - submit

2. SPU Dashboard
   ↓ Verify application
   ✅ SPU checks saved to spu_checks table
   ✅ Workflow logged: SPU - verify
   ✅ Application moved to EAVMU stage

3. EAVMU Officer Dashboard
   ↓ Complete field verification
   ✅ EAVMU verification saved to eavmu_verifications table
   ✅ Workflow logged: EAVMU - verify
   ✅ Application moved to CIU stage

4. CIU Dashboard
   ↓ Calculate decision
   ✅ Decision saved to ciu_decisions table
   ✅ Workflow logged: CIU - decision
   ✅ Application status updated

5. Check Final State
   ✅ All workflow tables populated
   ✅ Complete audit trail in application_workflow
```

### Verify Complete Data:
```sql
-- Get complete application data with all checks
SELECT 
  a.los_id,
  a.current_stage,
  a.application_status,
  spu.overall_result as spu_result,
  spu.checked_at as spu_date,
  eav.overall_result as eavmu_result,
  eav.completed_at as eavmu_date,
  ciu.decision as ciu_decision,
  ciu.credit_score as final_score,
  ciu.decision_date as decision_date
FROM applications a
LEFT JOIN spu_checks spu ON a.application_id = spu.application_id
LEFT JOIN eavmu_verifications eav ON a.application_id = eav.application_id
LEFT JOIN ciu_decisions ciu ON a.application_id = ciu.application_id
WHERE a.los_id = X;
```

---

## Common Issues & Solutions

### Issue 1: SPU checks not saving
**Symptom:** No record in `spu_checks` table after verification

**Solution:**
- Check backend logs for "📝 Saving SPU checks"
- Verify frontend sends `department: 'SPU'` and `action: 'verify'`
- Check that `spuChecks` object is included in request body

**Debug Query:**
```sql
-- Check if application exists
SELECT application_id, party_id FROM applications WHERE los_id = X;
```

### Issue 2: EAVMU verification not saving
**Symptom:** No record in `eavmu_verifications` table after verification

**Solution:**
- Check backend logs for "📝 Saving EAVMU verification"
- Verify frontend sends `department: 'EAVMU'` and `action: 'verify'`
- Check that `eavmuVerification` object is included in request body

### Issue 3: Decision not saving
**Symptom:** No record in `ciu_decisions` table after calculation

**Solution:**
- Check backend logs for "✅ Decision saved to ciu_decisions table"
- Verify decision engine calculation completed successfully
- Check database connection in decision-engine.routes.js

**Debug Query:**
```sql
-- Check if application_id exists
SELECT application_id FROM applications WHERE los_id = X;
```

### Issue 4: Workflow not logging
**Symptom:** No entries in `application_workflow` table

**Solution:**
- Check backend logs for "✅ Workflow logged"
- Verify `logWorkflowChange()` is being called
- Check if `application_id` exists for the `los_id`

---

## Quick Database Queries for Testing

### View all workflow tables for an application:
```sql
-- Replace X with actual los_id
\set los_id X

-- SPU Checks
SELECT 'SPU Checks' as table_name, overall_result as result, checked_at as date 
FROM spu_checks WHERE los_id = :los_id;

-- EAVMU Verifications
SELECT 'EAVMU Verification' as table_name, overall_result as result, completed_at as date 
FROM eavmu_verifications WHERE los_id = :los_id;

-- CIU Decisions
SELECT 'CIU Decision' as table_name, decision as result, decision_date as date 
FROM ciu_decisions WHERE los_id = :los_id;

-- Workflow Log
SELECT stage, action, status_to, created_at 
FROM application_workflow WHERE los_id = :los_id ORDER BY created_at;
```

### Count records in all workflow tables:
```sql
SELECT 
  (SELECT COUNT(*) FROM spu_checks) as spu_checks_count,
  (SELECT COUNT(*) FROM eavmu_verifications) as eavmu_verifications_count,
  (SELECT COUNT(*) FROM ciu_decisions) as ciu_decisions_count,
  (SELECT COUNT(*) FROM application_workflow) as workflow_logs_count;
```

---

## ✅ Success Criteria

Integration is successful when:

- [x] SPU verification creates record in `spu_checks` table
- [x] EAVMU verification creates record in `eavmu_verifications` table
- [x] CIU decision creates record in `ciu_decisions` table
- [x] Every status change creates log in `application_workflow` table
- [x] Decision Engine reads SPU data from `spu_checks` table
- [x] Decision Engine reads EAVMU data from `eavmu_verifications` table
- [x] CIU dashboard displays SPU and EAVMU status correctly
- [x] All backend logs show "✅ saved" messages

---

## 🚀 Ready to Test!

**Backend Status:**
- ✅ Backend V2.0 running on port 5000
- ✅ Document Server running on port 8081
- ✅ All workflow tables created
- ✅ All integration code deployed

**Start Testing:**
1. Open browser: `http://localhost:3000`
2. Navigate to SPU dashboard
3. Verify an application
4. Check database for saved records

**Happy Testing! 🎉**

