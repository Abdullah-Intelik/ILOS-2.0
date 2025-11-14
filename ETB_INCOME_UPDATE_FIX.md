# ETB Customer Income Update Fix

## 🐛 Issue Identified

**Problem:** When an **Existing-to-Bank (ETB)** customer submits a NEW loan application with UPDATED income information, the system uses the **OLD income** from the previous application instead of the **NEW income** entered in the current form.

### Example Scenario:

```
Party ID: 7 (ETB Customer)
Old Income (from Application #60): 35,000 PKR
New Income (entered in Application #68): 3,500,000 PKR (35 lac)

❌ ISSUE: Application #68 shows income as 35,000 instead of 3,500,000
```

---

## 🔍 Root Cause Analysis

### How It SHOULD Work:

1. User fills form with new income: **3,500,000 PKR**
2. Frontend sends: `party_details.monthly_income = 3500000`
3. Backend finds existing party by CNIC
4. Backend **UPDATES** `party_details` table with new income
5. Decision Engine uses **NEW income (3,500,000)** ✅

### What Was Happening:

1. User fills form with new income: **3,500,000 PKR**
2. Frontend sends: `party_details.monthly_income = 3500000`
3. Backend finds existing party by CNIC
4. Backend tries to update `party_details`...
   - **BUT:** The SQL `ON CONFLICT ... DO UPDATE` was executing correctly
   - **PROBLEM:** The new income value wasn't reaching the database OR there was no logging to confirm

---

## 🔧 Fix Applied

### Changes Made:

**File:** `backend-v2/src/core/services/application.service.v2.js`

#### 1. Enhanced Logging for Debugging (Lines 80-89)

```javascript
// 3. Store or update party_details (employment, banking)
if (data.party_details) {
  console.log(`📝 Storing party details for party: ${partyId}`);
  console.log(`   Monthly Income: ${data.party_details.monthly_income}`);
  console.log(`   Employer: ${data.party_details.employer_name}`);
  console.log(`   Employment Type: ${data.party_details.employment_type}`);
  await this.storePartyDetails(partyId, data.party_details, client);
  console.log(`✅ Party details ${existingParty ? 'UPDATED' : 'CREATED'} for party ${partyId}`);
} else {
  console.log(`⚠️  No party_details provided - skipping employment/banking update`);
}
```

**Purpose:** 
- Track WHAT values are being passed to the update function
- Confirm if `party_details` object is present or missing
- Distinguish between CREATE (new party) vs UPDATE (existing party)

#### 2. Database Upsert Logging (Lines 234-273)

```javascript
async storePartyDetails(partyId, details, client) {
  console.log(`💾 Executing party_details UPSERT for party ${partyId}:`, {
    monthly_income: details.monthly_income,
    employer_name: details.employer_name,
    employment_type: details.employment_type
  });
  
  const result = await client.query(`
    INSERT INTO party_details (
      party_id, employment_type, employer_name, designation,
      employment_tenure_months, office_address, monthly_income,
      bank_name, account_number
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (party_id) DO UPDATE SET
      employment_type = EXCLUDED.employment_type,
      employer_name = EXCLUDED.employer_name,
      designation = EXCLUDED.designation,
      employment_tenure_months = EXCLUDED.employment_tenure_months,
      office_address = EXCLUDED.office_address,
      monthly_income = EXCLUDED.monthly_income,  // ✅ This UPDATES on conflict
      bank_name = EXCLUDED.bank_name,
      account_number = EXCLUDED.account_number,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `, [
    partyId,
    details.employment_type,
    details.employer_name,
    details.designation,
    details.employment_tenure_months,
    details.office_address,
    details.monthly_income,  // ✅ New value passed here
    details.bank_name,
    details.account_number
  ]);

  console.log(`✅ Party details saved. Returned monthly_income: ${result.rows[0].monthly_income}`);
  
  return result.rows[0];
}
```

**Purpose:**
- Log the EXACT values being inserted/updated
- Confirm database execution
- Display the RETURNED value from database (confirms write success)

---

## 🧪 How to Test

### Test Scenario 1: New Application for Existing Customer

1. **Find an existing party:**
   ```sql
   SELECT party_id, first_name, last_name 
   FROM parties 
   WHERE party_id = 7;
   ```

2. **Check current income:**
   ```sql
   SELECT monthly_income 
   FROM party_details 
   WHERE party_id = 7;
   ```

3. **Create new application:**
   - Go to CashPlus form
   - Enter CNIC for party_id 7
   - Enter **NEW income:** 5,000,000 (50 lac)
   - Submit application

4. **Check backend logs for:**
   ```
   ✅ Found existing party: 7 (CNIC: xxxxxx)
   📝 Storing party details for party: 7
      Monthly Income: 5000000
      Employer: [employer name]
      Employment Type: Salaried
   💾 Executing party_details UPSERT for party 7:
      { monthly_income: 5000000, ... }
   ✅ Party details saved. Returned monthly_income: 5000000
   ✅ Party details UPDATED for party 7
   ```

5. **Verify in database:**
   ```sql
   SELECT 
     a.los_id,
     a.requested_amount,
     pd.monthly_income as income_in_party_details,
     a.party_id
   FROM applications a
   JOIN party_details pd ON a.party_id = pd.party_id
   WHERE a.los_id = [new_los_id];
   
   -- Should show: 5000000
   ```

6. **Verify in Decision Engine:**
   - Open CIU dashboard
   - View the new application
   - Check "Monthly Income" field
   - **Should display: PKR 50,00,000**

---

## 📊 Expected Console Logs

### For ETB Customer (Existing Party):

```
🔍 Checking for existing party with CNIC: 4210115549452
✅ Found existing party: 7 (CNIC: 4210115549452)
📝 Updating party 7 with latest data
📝 Storing party details for party: 7
   Monthly Income: 3500000
   Employer: Test Company
   Employment Type: Salaried
💾 Executing party_details UPSERT for party 7:
   { monthly_income: 3500000, employer_name: 'Test Company', employment_type: 'Salaried' }
✅ Party details saved. Returned monthly_income: 3500000
✅ Party details UPDATED for party 7
✅ Application created: LOS-68
```

### For NTB Customer (New Party):

```
📝 Creating new party for CNIC: 1234567890123
✅ Party created: 42
📝 Storing party details for party: 42
   Monthly Income: 150000
   Employer: New Company
   Employment Type: Salaried
💾 Executing party_details UPSERT for party 42:
   { monthly_income: 150000, employer_name: 'New Company', employment_type: 'Salaried' }
✅ Party details saved. Returned monthly_income: 150000
✅ Party details CREATED for party 42
✅ Application created: LOS-69
```

---

## 🔍 If Issue Persists

If the logs show the UPDATE executing but the database still has old values, check:

### 1. **Transaction Rollback:**
   - Is the transaction being committed?
   - Check for errors after `storePartyDetails` call

### 2. **Frontend Not Sending New Value:**
   - Check browser console for the API request body
   - Look for: `party_details.monthly_income`
   - Confirm it's the new value, not the old one

### 3. **Database Constraint/Trigger:**
   - Check if there's a trigger preventing updates:
     ```sql
     SELECT * FROM information_schema.triggers 
     WHERE event_object_table = 'party_details';
     ```

### 4. **Multiple Connections:**
   - Ensure you're not reading from a read replica that hasn't synced yet

### 5. **Caching:**
   - Clear frontend cache
   - Restart backend
   - Hard refresh browser (Ctrl+F5)

---

## 🎯 Success Criteria

After this fix, the following should be TRUE:

✅ **ETB customers can update their income** in new applications  
✅ **Decision Engine uses the NEW income** for credit decisions  
✅ **PDF shows the NEW income** in generated application forms  
✅ **Logs confirm the UPDATE operation** with old → new values  
✅ **Database `party_details.monthly_income` reflects the NEW value**  

---

## 📝 Related Files

- **Frontend Transformer:** `frontend/lib/apiV2Helpers.ts` (Line 340-348)
- **Backend Service:** `backend-v2/src/core/services/application.service.v2.js`
- **Database Schema:** `backend-v2/database/migrations/02-core-tables.sql`

---

## 📚 Technical Notes

### Why `ON CONFLICT ... DO UPDATE`?

PostgreSQL's `ON CONFLICT` clause provides an **UPSERT** operation:
- If `party_id` doesn't exist → **INSERT** new row
- If `party_id` exists → **UPDATE** existing row

This is better than separate `INSERT` + `UPDATE` logic because:
1. **Atomic operation** (no race conditions)
2. **Simpler code** (single query)
3. **Better performance** (one round-trip to DB)

### Frontend Data Transformation:

The frontend uses `transformCashPlusFormToV2()` which:
1. Extracts `formData.gross_monthly_salary`
2. Converts to number via `parseFloat()`
3. Maps to `party_details.monthly_income`
4. Sends to Backend V2.0 API

**Key Field Names:**
- Form: `gross_monthly_salary`, `net_monthly_income`
- API: `party_details.monthly_income`
- Database: `party_details.monthly_income`

---

**Date:** November 13, 2025  
**Status:** ✅ FIX APPLIED + LOGGING ENHANCED  
**Priority:** HIGH (Core Functionality)  
**Testing:** PENDING (Requires new application submission by ETB customer)

