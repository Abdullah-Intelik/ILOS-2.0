# Auto-fill Priority Fix - CBS First! ✅

## Problem
After uploading documents, the form was auto-filling from **OCR data** instead of **CBS database**.

## Solution
Changed auto-fill priority to:
1. **CBS Database** (Primary source)
2. **OCR Data** (Fill missing fields only)
3. **Fallback to OCR** (If no CBS data exists)

---

## New Auto-fill Logic

### Priority 1: CBS Database First
```javascript
// Fetch from CBS
const detailsResponse = await apiService.getCustomerDetails(customer.cnic);

if (detailsResponse.success && detailsResponse.customerDetails) {
  // Start with CBS data
  const finalData = {
    cnic: customer.cnic,
    firstName: details.first_name,
    lastName: details.last_name,
    fatherName: details.father_or_husband_name,
    motherName: details.mother_maiden_name,
    dateOfBirth: details.date_of_birth,
    gender: details.gender,
    maritalStatus: details.marital_status,
    mobileNumber: details.mobile,
    email: details.email,
    address: details.address,
    city: details.city,
    employmentType: details.employment_status,
    companyName: details.company_name,
    designation: details.designation,
    monthlySalary: details.gross_monthly_salary,
    // ... all CBS fields
  };
  
  // ... then supplement with OCR for missing fields
}
```

### Priority 2: Supplement with OCR
```javascript
// ONLY fill missing fields from OCR
if (ocrData) {
  if (ocrData.cnic) {
    if (!finalData.firstName && !finalData.lastName && cnicData.name) {
      // Split name only if CBS didn't provide
      const nameParts = cnicData.name.trim().split(' ');
      finalData.firstName = nameParts[0] || '';
      finalData.lastName = nameParts.slice(1).join(' ') || '';
    }
    if (!finalData.fatherName && cnicData.father_name) {
      finalData.fatherName = cnicData.father_name;
    }
    if (!finalData.dateOfBirth && cnicData.dob) {
      finalData.dateOfBirth = cnicData.dob;
    }
    if (!finalData.address && cnicData.address) {
      finalData.address = cnicData.address;
    }
  }
  
  if (ocrData.salarySlip) {
    if (!finalData.monthlySalary && salaryData.net_salary) {
      finalData.monthlySalary = salaryData.net_salary.toString();
    }
    if (!finalData.companyName && salaryData.company_name) {
      finalData.companyName = salaryData.company_name;
    }
    if (!finalData.designation && salaryData.designation) {
      finalData.designation = salaryData.designation;
    }
  }
}
```

### Priority 3: Fallback (No CBS Data)
```javascript
} else if (ocrData) {
  // No CBS data found, use OCR as fallback
  console.log('ℹ️ No CBS data, using OCR as fallback...');
  // ... fill from OCR only
}
```

---

## What You'll See Now

### Scenario 1: Existing Customer with CBS Data
```
🔄 Fetching customer details from CBS database...
📄 Supplementing CBS data with OCR for missing fields...
✅ Auto-filled from CBS (supplemented with OCR)

Toast: "Welcome Back! Your details loaded from CBS profile"
```

**Form will show:**
- ✅ All CBS data (name, CNIC, address, etc. from bank records)
- ✅ Missing fields filled from OCR (e.g., if CBS has no salary, use OCR salary)

### Scenario 2: New Customer (No CBS Data)
```
🔄 Fetching customer details from CBS database...
ℹ️ No CBS data, using OCR as fallback...

Toast: "Form Auto-filled - Details filled from uploaded documents"
```

**Form will show:**
- ✅ All data from OCR (from uploaded CNIC & Salary Slip)

### Scenario 3: No Documents Uploaded
```
🔄 Fetching customer details from CBS database...

Toast: "Welcome Back! Your details loaded from CBS profile"
```

**Form will show:**
- ✅ All CBS data (like before, as in web version)

---

## Example: ETB Customer Flow

### CBS Data Available:
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "father_or_husband_name": "Richard Doe",
  "date_of_birth": "1990-05-15",
  "mobile": "0300-1234567",
  "address": "123 Main St, Karachi",
  "gross_monthly_salary": "50000",
  "company_name": "",  ← Empty in CBS
  "designation": ""     ← Empty in CBS
}
```

### OCR Data Available:
```json
{
  "cnic": {
    "name": "John Doe",
    "father_name": "Richard Doe",
    "date_of_birth": "15.05.1990"
  },
  "salarySlip": {
    "net_salary": "45000",
    "company_name": "ABC Corp",  ← Has value!
    "designation": "Manager"      ← Has value!
  }
}
```

### Final Form Data:
```javascript
{
  firstName: "John",           // ← From CBS
  lastName: "Doe",             // ← From CBS
  fatherName: "Richard Doe",   // ← From CBS
  dateOfBirth: "1990-05-15",   // ← From CBS
  mobile: "0300-1234567",      // ← From CBS
  address: "123 Main St",      // ← From CBS
  monthlySalary: "50000",      // ← From CBS
  companyName: "ABC Corp",     // ← From OCR (CBS was empty!)
  designation: "Manager"       // ← From OCR (CBS was empty!)
}
```

**Best of both worlds!** ✅

---

## Console Logs to Expect

### With CBS Data:
```
🔄 Fetching customer details from CBS database...
📄 Supplementing CBS data with OCR for missing fields...
✅ Auto-filled from CBS (supplemented with OCR)
```

### Without CBS Data:
```
🔄 Fetching customer details from CBS database...
ℹ️ No CBS data, using OCR as fallback...
```

### No Data at All:
```
🔄 Fetching customer details from CBS database...
ℹ️ New customer - no auto-fill
```

---

## Comparison: Before vs After

| Source | Before | After |
|--------|--------|-------|
| **Priority 1** | OCR Documents | ✅ **CBS Database** |
| **Priority 2** | CBS Database | ✅ **OCR (for missing fields)** |
| **Priority 3** | None | ✅ **Fallback to OCR** |

### Before (Wrong):
```
if (ocrData) {
  // Use OCR first ❌
} else if (customer?.cnic) {
  // Then check CBS ❌
}
```

### After (Correct):
```
if (customer?.cnic) {
  // Fetch CBS first ✅
  if (CBS has data) {
    // Use CBS ✅
    if (ocrData) {
      // Fill missing fields from OCR ✅
    }
  } else if (ocrData) {
    // Fallback to OCR ✅
  }
} else if (ocrData) {
  // Edge case: OCR but no customer ✅
}
```

---

## Benefits

1. ✅ **ETB customers** get their real CBS data (accurate)
2. ✅ **Missing CBS fields** are filled from OCR (convenient)
3. ✅ **New customers** still get OCR auto-fill (useful)
4. ✅ **Matches web behavior** (consistent UX)

---

**Status:** COMPLETE ✅  
**Files Modified:** 1 (`ApplicationFormScreen.jsx`)  
**Lines Changed:** ~150

**Test it:** Go through document upload → form now fills from CBS! 🎉

