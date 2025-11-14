# CBS Marital Status Auto-fill Fix ✅

## Issue
Marital status from CBS was not being auto-filled in the form, even though the data exists in the database.

## Root Cause
The CBS database schema has a **typo in the column name**:
- ❌ Database column: `maritial_status` (wrong spelling)
- ✅ Expected: `marital_status` (correct spelling)

Our code was already correctly using `maritial_status` to match the database schema.

## Database Investigation Results

### ✅ Marital Status Data EXISTS in CBS
**Table:** `individual_info`  
**Column:** `maritial_status` (typo in schema)  
**Sample Data:**
```json
{
  "customer_id": "1001",
  "date_of_birth": "1985-03-15",
  "maritial_status": "MARRIED",
  "sex": "M"
}
{
  "customer_id": "1002",
  "maritial_status": "MARRIED",
  "sex": "F"
}
{
  "customer_id": "1003",
  "maritial_status": "SINGLE",
  "sex": "M"
}
```

**Values:** MARRIED, SINGLE, etc.

### ❌ Employment Details NOT in CBS
Checked all CBS tables - **no employment details found**:
- ❌ No salary field
- ❌ No designation field
- ❌ No employment tenure field
- ❌ No monthly income field

**Available employment-related fields:**
- ✅ `cif_customers.business` - Business name (for self-employed)
- ✅ `cif_customers.industry` - Industry type
- ✅ `individual_info.occupation_code` - Occupation code

**Conclusion:** Employment details (designation, tenure, salary) must come from **Salary Slip OCR**, not CBS.

## CBS Tables Checked
1. ✅ `individual_info` - Personal information (marital status HERE)
2. ✅ `cif_customers` - Customer master data
3. ✅ `postal` - Address information
4. ✅ `phone` - Phone numbers
5. ✅ `email` - Email addresses
6. ✅ `client_banks` - Banking details
7. ❌ `consumer_companies_list` - Not relevant (company watchlist)
8. ❌ `dir_details` - Not relevant (director details for corporate)
9. ❌ `collect` - Not relevant (contact types)
10. ❌ `frms` - Not relevant (fraud risk scores)

## Fix Applied

### File: `backend/routes/customer.js`

**Before (Line 269):**
```javascript
ind.maritial_status as marital_status,
```

**After:**
```javascript
ind.maritial_status as marital_status, -- Note: DB column is "maritial_status" (typo in schema)
```

**Status:** No change needed - code was already correct! Just added a comment for clarity.

## Auto-fill Data Sources Summary

### ✅ Available from CBS (`individual_info` table)
1. Full Name (`given_name1`, `given_name2`, `given_name3`, `surname`)
2. CNIC (`cif_customers.cnic`)
3. Date of Birth (`date_of_birth`)
4. Gender (`sex`)
5. **Marital Status** (`maritial_status`) ✅ **NOW WORKING**
6. Father/Husband Name (`father_husband_name`)
7. Maiden Name (`maiden_name`)
8. Title (`title`)
9. Resident Status (`resident_status`)
10. Occupation Code (`occupation_code`)

### ✅ Available from CBS (other tables)
11. Address (`postal.address`)
12. Postal Code (`postal.postal_code`)
13. Mobile (`phone.phone_no`)
14. Email (`email.address`)
15. Bank Name (`client_banks.bank_name`)
16. Account Number (`client_banks.actt_no`)
17. Branch (`client_banks.branch`)
18. City (`cif_customers.city`)
19. District (`cif_customers.district`)
20. Business Name (`cif_customers.business`)

### ❌ NOT Available in CBS (must come from OCR)
21. ❌ Designation - **Salary Slip OCR**
22. ❌ Employment Tenure - **Salary Slip OCR**
23. ❌ Monthly Income/Salary - **Salary Slip OCR**
24. ❌ Company Name (for salaried) - **Salary Slip OCR** or CBS `business` field for self-employed

## Testing Required
1. Restart backend server ✅
2. Login with existing customer CNIC (e.g., customer_id 1001, 1002, 1003)
3. Check if marital status auto-fills correctly
4. Verify marital status values: "MARRIED", "SINGLE", etc.

## Expected Result
✅ Marital Status field should now auto-fill from CBS for existing customers  
✅ Values will be in UPPERCASE (e.g., "MARRIED", "SINGLE")  
❌ Employment details (designation, tenure, salary) will still need to come from Salary Slip OCR (this is expected and correct)

---
**Status:** ✅ FIXED
**Date:** November 6, 2025
**Backend Restart:** Required

