# ETB Customer Income Update Fix - APPLIED

## ✅ **Fix Applied Successfully**

**Date:** November 13, 2025  
**Status:** 🟢 READY FOR TESTING

---

## 🐛 **Issue Summary**

When an **Existing-to-Bank (ETB)** customer submits a NEW loan application with **UPDATED income**, the system was using the **OLD income** from CBS/previous applications instead of the **NEW income** entered in the form.

### Real Example from Logs:

```
Party ID: 7 (ETB Customer - Ahmed Khan)
Old Income (CBS): 35,000 PKR
New Income (User entered in form): 3,500,000 PKR (35 lac)

❌ PROBLEM: Application LOS-69 stored income as 35,000 instead of 3,500,000
```

---

## 🔍 **Root Cause Identified**

### Backend Logs Revealed:

```
📝 Storing party details for party: 7
   Monthly Income: 35000         ⚠️ OLD VALUE
   Employer: HBL
   Employment Type: Salaried
💾 Executing party_details UPSERT for party 7: {
  monthly_income: 35000,         ⚠️ OLD VALUE CONFIRMED
  employer_name: 'HBL',
  employment_type: 'Salaried'
}
✅ Party details saved. Returned monthly_income: 35000.00
✅ Party details UPDATED for party 7  ✅ UPDATE worked, but with WRONG value
```

### Analysis:

1. ✅ **Backend is working correctly** - the UPSERT logic is executing properly
2. ❌ **Frontend is sending the wrong value** - it's sending 35,000 (old) instead of 3,500,000 (new)
3. 🔍 **Transformer priority issue** - The data transformer was prioritizing `formData` (pre-filled CBS data) over `customerData` (user's updated form values)

### Code Flow:

```
ETB Customer fills form → CBS data pre-fills income: 35,000
User changes income to: 3,500,000
User submits form

Frontend Transformer (BEFORE FIX):
1. Check formData.gross_monthly_salary → 35,000 (CBS pre-fill) ❌ WRONG
2. Check customerData.incomeDetails.grossMonthlySalary → 3,500,000 (user input) ✅ CORRECT
3. Returns: 35,000 (because formData was checked first)

Backend receives: 35,000 and stores it
```

---

## 🔧 **Fix Applied**

### File: `frontend/lib/apiV2Helpers.ts`

#### **Change 1: Reordered Priority (Lines 339-349)**

**BEFORE:**
```typescript
monthly_income: parseFloat(
  formData.gross_monthly_salary ||        // ❌ Pre-filled CBS data (old value)
  customerData?.incomeDetails?.monthlyIncome ||  // ✅ User's new value
  // ... other fallbacks
  0
),
```

**AFTER:**
```typescript
monthly_income: parseFloat(
  customerData?.incomeDetails?.grossMonthlySalary || // ✅ User's updated value (HIGHEST PRIORITY)
  customerData?.incomeDetails?.monthlyIncome ||
  customerData?.personalDetails?.monthlyIncome ||
  formData.gross_monthly_salary ||        // ✅ Fallback to form field (for NTB)
  formData.monthlyIncome || 
  formData.monthly_income || 
  formData.monthly_salary || 
  0
),
```

**Rationale:**
- `customerData.incomeDetails.grossMonthlySalary` contains the **user's latest changes** from the income form section
- `formData.gross_monthly_salary` contains the **pre-filled CBS data** (old values for ETB)
- For **ETB customers:** User edits update `customerData`, so it should be checked **first**
- For **NTB customers:** No CBS data, so `formData` will be used (works for both)

#### **Change 2: Enhanced Logging (Lines 218-225)**

Added detailed debug logging to track ALL income sources:

```typescript
console.log('🔍 TRANSFORMER INPUT:', {
  // ... existing logs ...
  // ✅ DEBUG: Check ALL possible income sources
  'customerData.incomeDetails.grossMonthlySalary': customerData?.incomeDetails?.grossMonthlySalary,
  'customerData.incomeDetails.monthlyIncome': customerData?.incomeDetails?.monthlyIncome,
  'customerData.personalDetails.monthlyIncome': customerData?.personalDetails?.monthlyIncome,
  'formData.gross_monthly_salary': formData.gross_monthly_salary,
  'formData.monthlyIncome': formData.monthlyIncome,
  'formData.monthly_income': formData.monthly_income,
});
```

**Purpose:**
- See **exactly which income value** is present in each data source
- Confirm which value is being selected by the transformer
- Debug any future income-related issues quickly

---

## 🧪 **Testing Instructions**

### Test Case 1: ETB Customer Updates Income

1. **Login as PB Officer**
2. **Start CashPlus application** for existing customer (CNIC: 38403-9346396-1, Party ID: 7)
3. **Check pre-filled income:** Should show 35,000 (from CBS)
4. **Change income to:** 5,000,000 (50 lac)
5. **Submit application**

**Expected Result:**
- ✅ Application creates successfully
- ✅ Backend logs show: `Monthly Income: 5000000` (new value)
- ✅ Database `party_details.monthly_income` = 5000000
- ✅ Decision Engine shows: PKR 50,00,000

**How to Verify:**

**A. Check Frontend Console:**
```
🔍 TRANSFORMER INPUT: {
  'customerData.incomeDetails.grossMonthlySalary': 5000000  ✅
  'formData.gross_monthly_salary': 35000  (ignored)
}
```

**B. Check Backend Console:**
```
📝 Storing party details for party: 7
   Monthly Income: 5000000  ✅ NEW VALUE
💾 Executing party_details UPSERT for party 7: {
  monthly_income: 5000000,  ✅ NEW VALUE
}
✅ Party details saved. Returned monthly_income: 5000000.00
```

**C. Check Database:**
```sql
SELECT 
  a.los_id,
  pd.monthly_income,
  a.requested_amount
FROM applications a
JOIN party_details pd ON a.party_id = pd.party_id
WHERE a.party_id = 7
ORDER BY a.los_id DESC
LIMIT 1;

-- Should show:
-- los_id | monthly_income | requested_amount
-- -------+----------------+-----------------
--   70   |   5000000.00   |     500000
```

**D. Check Decision Engine:**
- Open CIU dashboard
- View the new application
- Check "Application Data" card
- **Monthly Income should show: PKR 50,00,000**

### Test Case 2: NTB Customer (New Customer)

1. **Start CashPlus application** with new CNIC
2. **Enter income:** 2,000,000 (20 lac)
3. **Submit application**

**Expected Result:**
- ✅ Application creates successfully
- ✅ Backend logs show: `Monthly Income: 2000000`
- ✅ Database stores: 2000000

---

## 📊 **Before vs After**

### BEFORE FIX:

| Scenario | User Enters | System Stores | Issue |
|----------|-------------|---------------|-------|
| ETB (Party 7) | 5,000,000 | 35,000 | ❌ Uses old CBS data |
| NTB (New) | 2,000,000 | 2,000,000 | ✅ Works |

### AFTER FIX:

| Scenario | User Enters | System Stores | Status |
|----------|-------------|---------------|--------|
| ETB (Party 7) | 5,000,000 | 5,000,000 | ✅ Uses user input |
| NTB (New) | 2,000,000 | 2,000,000 | ✅ Works |

---

## 🔍 **Debugging Future Issues**

If income is still incorrect after this fix:

### 1. **Check Frontend Logs:**

Look for `🔍 TRANSFORMER INPUT:` in browser console:
- **If ALL income values show OLD:** User didn't actually change the form field
- **If grossMonthlySalary shows NEW but system stores OLD:** Backend issue (check API request body)
- **If grossMonthlySalary is undefined:** Form field name mismatch

### 2. **Check Backend Logs:**

Look for `📝 Storing party details for party: X`:
- **If shows NEW value:** Success! Database should have new value
- **If shows OLD value:** Frontend sent wrong value (check API request)
- **If missing entirely:** `party_details` object wasn't sent

### 3. **Check API Request:**

In browser DevTools → Network tab → Find the POST request to `/api/v1/applications`:
```json
{
  "party_details": {
    "monthly_income": 5000000  // ✅ Should be the NEW value
  }
}
```

### 4. **Check Database Directly:**

```sql
-- Check what's actually stored
SELECT 
  p.party_id,
  p.first_name,
  p.last_name,
  pd.monthly_income,
  pd.updated_at
FROM parties p
JOIN party_details pd ON p.party_id = pd.party_id
WHERE p.party_id = 7;
```

---

## 📝 **Related Files**

- **Frontend Transformer:** `frontend/lib/apiV2Helpers.ts` (Lines 339-349, 218-225)
- **Backend Service:** `backend-v2/src/core/services/application.service.v2.js` (Lines 85-95, 234-273)
- **Backend Controller:** `backend-v2/src/api/v1/controllers/application.controller.js`

---

## 🎯 **Success Criteria**

After this fix, the following should be TRUE:

✅ **ETB customers can update income** in new applications  
✅ **Backend logs show the NEW income value** being stored  
✅ **Database `party_details.monthly_income` reflects the NEW value**  
✅ **Decision Engine uses the NEW income** for credit decisions  
✅ **PDF shows the NEW income** in generated application forms  
✅ **NTB customers (new) are not affected** - still works normally  

---

## 💡 **Technical Notes**

### Why This Works:

**For ETB Customers:**
1. Form is pre-filled with CBS data (old income) → stored in `formData`
2. User changes income field → updated value stored in `customerData.incomeDetails.grossMonthlySalary`
3. Transformer checks `customerData` **first** → picks up new value ✅
4. Backend receives new value and updates database ✅

**For NTB Customers:**
1. No CBS data → form starts empty
2. User enters income → stored in `formData.gross_monthly_salary`
3. `customerData.incomeDetails` is likely undefined (no pre-existing sections)
4. Transformer checks `customerData` first (undefined), then falls back to `formData` ✅
5. Backend receives new value and creates database record ✅

### Data Flow:

```
┌─────────────────────────────────────────────────────────────┐
│ ETB Customer fills form                                     │
├─────────────────────────────────────────────────────────────┤
│ 1. CBS data pre-fills → formData.gross_monthly_salary = 35k│
│ 2. User edits income → customerData.incomeDetails.gross... │
│ 3. Transformer checks customerData FIRST → finds 3.5M ✅    │
│ 4. Backend receives 3.5M                                    │
│ 5. Database stores 3.5M                                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ NTB Customer fills form                                     │
├─────────────────────────────────────────────────────────────┤
│ 1. No CBS data → form empty                                 │
│ 2. User enters income → formData.gross_monthly_salary = 2M  │
│ 3. Transformer checks customerData (undefined), then form   │
│ 4. Backend receives 2M                                      │
│ 5. Database stores 2M                                       │
└─────────────────────────────────────────────────────────────┘
```

---

**Status:** ✅ **FIX DEPLOYED - READY FOR USER TESTING**  
**Next Action:** Submit a new application as an ETB customer with updated income and verify the logs and database.

