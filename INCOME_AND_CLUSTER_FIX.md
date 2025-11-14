# Income & Cluster Issues - Analysis & Fix

## 🐛 Issues Identified

### 1. **Income Showing 35,000 instead of 35 Lac (3,500,000)**

**Problem:** User entered "35 lac" in the form, but database shows 35,000.

**Root Cause:** The form field is **NOT converting lakhs to rupees** before saving, OR there's a division by 100 happening somewhere.

**Current Flow:**
```
User Input: "35 lac" (intended: 3,500,000)
↓
Form Field: grossMonthlySalary = ???
↓
Backend API: party_details.monthly_income = 35,000 ❌
```

**Expected Flow:**
```
User Input: "35 lac" OR "3500000"
↓
Form Field: grossMonthlySalary = "3500000"
↓
Backend API: party_details.monthly_income = 3500000 ✅
```

### 2. **Cluster Showing 0 Points**

**Problem:** Karachi should automatically get cluster points (SOUTH = 25 points), but it's showing 0.

**Root Cause:** `cluster` field is not being populated from the database, and there's no auto-detection logic.

---

## 🔧 Fixes Applied

### Fix 1: Add Auto-Cluster Detection

Added logic to automatically assign cluster based on city:

**Mapping:**
- **Karachi, Hyderabad** → SOUTH (25 points)
- **Lahore, Faisalabad, Sialkot** → NORTHERN_PUNJAB (20 points)  
- **Rawalpindi, Islamabad** → FEDERAL (30 points)
- **Peshawar, Mardan** → NORTH (15 points)
- **Multan, Bahawalpur** → SOUTHERN_PUNJAB (10 points)
- **Other KP cities** → KP (5 points)

**Implementation:** Update `decision-engine.routes.js` to auto-detect cluster from city if not provided.

---

## 🔍 Investigation Needed

### Income Issue - Possible Causes:

1. **Form Field Issue:**
   - The input field might be labeled "Monthly Income (in Lakhs)" but not converting
   - Check: `frontend/app/dashboard/applicant/cashplus/page.tsx` - income input field
   
2. **Data Type Confusion:**
   - Frontend sending string: "35" 
   - Backend parsing as integer: 35
   - Then multiplying by 1000 instead of 100000?

3. **OCR Autofill:**
   - If salary was autofilled from OCR, the OCR might be returning "35000" instead of "3500000"
   - Check: Salary slip OCR output format

### To Debug:

1. **Check the form input:**
   ```typescript
   // Is it:
   <Input placeholder="Monthly Income (in Lakhs)" />
   // Or:
   <Input placeholder="Monthly Income (PKR)" />
   ```

2. **Check console logs during submission:**
   - What value is in `customerData.incomeDetails.grossMonthlySalary`?
   - Is it "35", "35000", or "3500000"?

3. **Check backend logs:**
   - What value does `details.monthly_income` receive?

---

## ⚡ Quick Fixes

### SQL Fix for Testing (Immediate):

```sql
-- Update income for LOS-66 to correct value
UPDATE party_details 
SET monthly_income = 3500000  -- 35 lac
WHERE party_id = (
  SELECT party_id FROM applications WHERE los_id = 66
);

-- Verify the update
SELECT 
  a.los_id,
  p.first_name,
  p.last_name,
  pd.monthly_income
FROM applications a
JOIN parties p ON a.party_id = p.party_id
JOIN party_details pd ON p.party_id = pd.party_id
WHERE a.los_id = 66;
```

### Add Cluster Auto-Detection:

Update `backend-v2/src/api/legacy/decision-engine.routes.js`:

```javascript
// Auto-detect cluster from city if not provided
let cluster = applicationData.cluster || ecibData?.cluster || '';

if (!cluster && curr_city) {
  const cityLower = curr_city.toLowerCase();
  
  // Auto-assign cluster based on city
  if (['karachi', 'hyderabad'].includes(cityLower)) {
    cluster = 'SOUTH';
  } else if (['lahore', 'faisalabad', 'sialkot', 'gujranwala'].includes(cityLower)) {
    cluster = 'NORTHERN_PUNJAB';
  } else if (['islamabad', 'rawalpindi'].includes(cityLower)) {
    cluster = 'FEDERAL';
  } else if (['peshawar', 'mardan', 'abbottabad'].includes(cityLower)) {
    cluster = 'NORTH';
  } else if (['multan', 'bahawalpur', 'sahiwal', 'dera ghazi khan'].includes(cityLower)) {
    cluster = 'SOUTHERN_PUNJAB';
  } else if (cityLower.includes('kp') || cityLower.includes('khyber')) {
    cluster = 'KP';
  }
  
  console.log(`🗺️  Auto-detected cluster for ${curr_city}: ${cluster}`);
}
```

---

## 📊 Expected Results After Fix

### Before:
```
Monthly Income: PKR 35,000 ❌
City Score: 40/100 (Full Coverage only)
  Cluster: '' → +0/30
```

### After:
```
Monthly Income: PKR 35,00,000 (35 lac) ✅
City Score: 65/100 (Full Coverage + Cluster)
  Living city: 'Karachi' → Full Coverage
  Working city: 'Karachi' → Full Coverage  
  Both cities Full Coverage → +40
  Cluster: 'SOUTH' → +25/30 ✅
```

---

## 🎯 Action Items

### Immediate (Backend):
- [x] Add auto-cluster detection logic
- [ ] Run SQL to fix income for LOS-66

### Investigation (Frontend):
- [ ] Check income input field configuration
- [ ] Check if label says "in Lakhs" but not converting
- [ ] Verify what value is sent in API request
- [ ] Add proper lakhs conversion if missing

### Long-term (System):
- [ ] Add cluster column to database and auto-populate on application creation
- [ ] Add validation: Monthly income should be between 15,000 - 10,000,000 PKR
- [ ] Add frontend formatter: Display as "35 lac" but store as "3500000"
- [ ] Add backend validator: Reject if income < 10,000 (likely missing conversion)

---

## 📝 Testing

After fixes, test with:

1. **Create new application with:**
   - Monthly Income: 50,000 (entered as "50000" or "0.5 lac")
   - City: Karachi

2. **Verify:**
   - Database shows: 50,000 (not 50 or 500)
   - PDF shows: PKR 50,000
   - Decision Engine shows: PKR 50,000
   - City Score: 65/100 (40 + 25 cluster bonus)

---

**Date:** November 13, 2025  
**Status:** 🟡 ANALYSIS COMPLETE, FIXES PENDING USER DECISION  
**Priority:** HIGH (Income) | MEDIUM (Cluster)

