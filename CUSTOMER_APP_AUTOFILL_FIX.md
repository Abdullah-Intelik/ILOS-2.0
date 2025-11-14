# Customer App Autofill Enhancement - Complete Fix

## 🎯 Problem Identified

The mobile app was **not autofilling** critical fields that the web PB dashboard successfully autofills:
- ❌ Mobile Number
- ❌ Email
- ❌ Marital Status
- ❌ City
- ❌ Gender

Only **Father's Name** was being autofilled from OCR data.

## 🔍 Root Cause Analysis

### Issue 1: Legacy API Endpoint (404 Error)
The mobile app was calling `/api/customer/details/:cnic` which **doesn't exist in Backend V2.0**, resulting in a 404 error. This caused the app to fall back to OCR-only autofill, which had limited field extraction.

### Issue 2: Limited OCR Fallback Logic
The OCR fallback was only extracting basic fields from CNIC and salary documents:
- CNIC OCR: Name, Father Name, DOB, Address
- Salary OCR: Monthly Salary, Company Name, Designation

**Missing extractions:**
- Gender (can be derived from CNIC 7th digit)
- City (can be parsed from address)
- Mobile, Email, Marital Status (need Backend V2.0 party data)

---

## ✅ Solution Implementation

### Fix 1: Added `getCustomerDetails()` Method (Backend V2.0 Compatible)

**File:** `D:\ILOS 2.0\ILOS-Customer-App\src\utils\api.js`

**What it does:**
- Uses the **correct Backend V2.0 endpoint** (`/api/v1/parties/cnic/:cnic`)
- Maps Backend V2.0 party data to the expected CustomerDetails format
- Returns comprehensive customer information including:
  - ✅ Personal details (name, CNIC, DOB, gender, marital status)
  - ✅ Contact details (mobile, email, address, city)
  - ✅ Employment details (employer, designation, salary)
  - ✅ Banking details (bank name, account number, branch)

**Code Added:**
```javascript
async getCustomerDetails(cnic) {
  try {
    debugLog(`🔄 Fetching customer details (Backend V2.0): ${cnic}`);
    
    // Use the same endpoint as login (Backend V2.0)
    const url = API_ENDPOINTS.GET_PARTY_BY_CNIC(cnic);
    const response = await this.client.get(url);
    
    if (response.data.success && response.data.data) {
      const party = response.data.data;
      
      // Map Backend V2.0 party data to CustomerDetails format
      return {
        success: true,
        customerDetails: {
          cnic: party.cnic,
          first_name: party.first_name,
          last_name: party.last_name,
          father_or_husband_name: party.father_name,
          mother_maiden_name: party.mother_name,
          date_of_birth: party.date_of_birth,
          gender: party.gender,
          marital_status: party.marital_status,
          mobile: party.mobile_number || party.mobile,
          email: party.email,
          address: party.residential_address || party.address,
          city: party.city,
          employment_status: party.employment_type,
          company_name: party.employer_name,
          designation: party.designation,
          gross_monthly_salary: party.monthly_income,
          bank_name: party.bank_name,
          account_number: party.account_number,
          branch: party.branch
        }
      };
    }
    
    return { success: false, customerDetails: null };
  } catch (error) {
    console.error('❌ Error fetching customer details:', error);
    return { success: false, customerDetails: null, error: error.message };
  }
}
```

---

### Fix 2: Enhanced OCR Fallback - Extract Gender from CNIC

**File:** `D:\ILOS 2.0\ILOS-Customer-App\src\screens\ApplicationFormScreen.jsx`

**How it works:**
- Pakistani CNIC format: `12345-1234567-X`
- The **7th digit** (at index 6) indicates gender:
  - **Even** (0, 2, 4, 6, 8) = Female
  - **Odd** (1, 3, 5, 7, 9) = Male

**Code Added:**
```javascript
// Extract gender from CNIC number (7th digit: even = Female, odd = Male)
if (prefilledData.cnic) {
  const cnicDigits = prefilledData.cnic.replace(/\D/g, ''); // Remove non-digits
  if (cnicDigits.length === 13) {
    const genderDigit = parseInt(cnicDigits[6]); // 7th digit (0-indexed at position 6)
    prefilledData.gender = genderDigit % 2 === 0 ? 'Female' : 'Male';
    console.log(`👤 Gender extracted from CNIC: ${prefilledData.gender} (digit: ${genderDigit})`);
  }
}
```

---

### Fix 3: Enhanced OCR Fallback - Extract City from Address

**File:** `D:\ILOS 2.0\ILOS-Customer-App\src\screens\ApplicationFormScreen.jsx`

**How it works:**
- Searches the address string for common Pakistani city names
- Covers major cities: Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, Quetta, Hyderabad, Gujranwala, Sialkot

**Code Added:**
```javascript
if (cnicData.address) {
  prefilledData.address = cnicData.address;
  
  // Extract city from address
  const addressLower = cnicData.address.toLowerCase();
  const cities = ['karachi', 'lahore', 'islamabad', 'rawalpindi', 'faisalabad', 'multan', 'peshawar', 'quetta', 'hyderabad', 'gujranwala', 'sialkot'];
  for (const city of cities) {
    if (addressLower.includes(city)) {
      prefilledData.city = city.charAt(0).toUpperCase() + city.slice(1);
      console.log(`🏙️ City extracted from address: ${prefilledData.city}`);
      break;
    }
  }
}
```

---

## 📊 Before vs After Comparison

### Autofill Sources

| Field | Before | After |
|-------|--------|-------|
| **Father Name** | ✅ OCR (CNIC) | ✅ Backend V2.0 / OCR |
| **Mobile Number** | ❌ Not filled | ✅ **Backend V2.0** |
| **Email** | ❌ Not filled | ✅ **Backend V2.0** |
| **Marital Status** | ❌ Not filled | ✅ **Backend V2.0** |
| **Gender** | ❌ Not filled | ✅ **CNIC extraction** |
| **City** | ❌ Not filled | ✅ **Backend V2.0 / Address parsing** |
| **Address** | ✅ OCR (CNIC) | ✅ Backend V2.0 / OCR |
| **Date of Birth** | ✅ OCR (CNIC) | ✅ Backend V2.0 / OCR |
| **Monthly Salary** | ✅ OCR (Salary) | ✅ Backend V2.0 / OCR |
| **Employer Name** | ✅ OCR (Salary) | ✅ Backend V2.0 / OCR |
| **Designation** | ✅ OCR (Salary) | ✅ Backend V2.0 / OCR |

---

## 🚀 Autofill Priority Logic

The mobile app now follows this priority:

1. **Backend V2.0 Party Data** (via `/api/v1/parties/cnic/:cnic`)
   - For ETB/RETURNING customers with existing party records
   - Includes all personal, contact, employment, and banking details

2. **OCR Data Fallback** (for NTB customers or if Backend V2.0 lookup fails)
   - CNIC OCR: Name, Father Name, DOB, Address, **Gender (derived)**, **City (parsed)**
   - Salary OCR: Monthly Salary, Employer, Designation

3. **Intelligent Supplementation**
   - If Backend V2.0 has some fields but not all, OCR data supplements missing fields
   - Example: Backend V2.0 might have contact info, but OCR provides latest salary data

---

## 🧪 Testing Instructions

### Test Case 1: ETB Customer (Party Exists in Database)
1. **Login with existing CNIC:** `3840393463961`
2. **Upload documents** (CNIC, Salary Slip)
3. **Navigate to Application Form**
4. **Expected Result:**
   - ✅ All fields autofilled from Backend V2.0 party data
   - ✅ Mobile: `03001234567`
   - ✅ Email: `email@example.com`
   - ✅ Marital Status: Dropdown auto-selected
   - ✅ City: Auto-populated
   - ✅ Gender: Auto-selected

### Test Case 2: NTB Customer (New Party)
1. **Login with new CNIC** (not in database)
2. **Upload documents** (CNIC, Salary Slip)
3. **Navigate to Application Form**
4. **Expected Result:**
   - ✅ Fields autofilled from OCR data
   - ✅ Gender: Derived from CNIC 7th digit
   - ✅ City: Parsed from address (if major city mentioned)
   - ℹ️ Mobile/Email: Will be empty (no party record)

### Test Case 3: Verify Backend Logs
Check Backend V2.0 console for these logs:
```
🔄 Fetching customer details (Backend V2.0): 3840393463961
🎯 Full URL: http://localhost:5000/api/v1/parties/cnic/3840393463961
✅ Customer details response: {...}
```

### Test Case 4: Verify Mobile App Logs
Check React Native console for these logs:
```
📋 CBS Data Received: {...}
🏙️ City extracted from address: Karachi
👤 Gender extracted from CNIC: Male (digit: 3)
```

---

## 📁 Files Modified

1. **`D:\ILOS 2.0\ILOS-Customer-App\src\utils\api.js`**
   - Added `getCustomerDetails()` method (67 lines)
   - Maps Backend V2.0 party endpoint to CustomerDetails format

2. **`D:\ILOS 2.0\ILOS-Customer-App\src\screens\ApplicationFormScreen.jsx`**
   - Enhanced OCR fallback with gender extraction (CNIC 7th digit)
   - Enhanced OCR fallback with city parsing (address string matching)
   - Applied to both primary and edge-case OCR paths

---

## 🎉 Expected User Experience

### Before Fix:
- User uploads CNIC and Salary Slip
- Only **Father's Name** shows up in the form
- User has to manually type: Mobile, Email, Marital Status, City, Gender ❌

### After Fix:
- User uploads CNIC and Salary Slip
- **All available fields** are auto-filled:
  - From Backend V2.0 (ETB customers): Mobile, Email, Marital Status, City, Gender ✅
  - From OCR + Smart Extraction (NTB customers): Gender (CNIC), City (Address) ✅
- User only reviews and confirms, minimal typing required! 🎯

---

## 🔧 Deployment Steps

1. **Reload the mobile app** to pick up the new changes:
   ```bash
   # Press 'r' in Metro bundler
   # Or restart the app completely
   ```

2. **Test with an existing customer:**
   - CNIC: `3840393463961`
   - Expected: Full autofill from Backend V2.0

3. **Test with a new customer:**
   - Use a CNIC not in the database
   - Expected: OCR autofill with smart gender/city extraction

4. **Monitor logs** for successful Backend V2.0 API calls

---

## 📌 Technical Notes

### Why Web Dashboard Autofills More
The web PB dashboard has access to the full `MinimalApplicantForm` component which:
- Reads from `customerData` context (populated during login/session)
- Accesses `party_details` table with complete customer profile
- Uses CBS data for ETB customers
- Has fallback to OCR data

The mobile app now **matches this behavior** by using the same Backend V2.0 party endpoint!

### Gender Extraction from CNIC
- Pakistani CNIC: `SSCDD-NNNNNNN-G` (S=Series, C=Card, D=District, N=Serial, G=Gender)
- Position 7 (0-indexed at 6): Gender digit
- Standard used across Pakistan for official documents

### City Extraction Limitations
- Only works if the address contains a recognizable city name
- Limited to 11 major cities (can be expanded if needed)
- Falls back to empty string if no match found
- User can still manually select city from dropdown

---

## 🐛 Bug Fix: Wrong API Client Used

**Issue Found:** The `getCustomerDetails()` method was using `this.client.get()` instead of `apiClient.get()`, causing it to call the wrong endpoint (`/api/customer/details/` instead of `/api/v1/parties/cnic/`).

**Error Log:**
```
[ILOS Customer ERROR] API Response Error: {status: 404, message: 'Request failed with status code 404', url: '/api/customer/details/3840393463961'}
```

**Fix Applied:**
```javascript
// BEFORE (WRONG):
const response = await this.client.get(url);

// AFTER (CORRECT):
const response = await apiClient.get(url); // Use global apiClient like loginWithCNIC does
```

This matches the exact pattern used in `loginWithCNIC()` method which works correctly.

---

## ✅ Verification Checklist

- [x] `getCustomerDetails()` method added to `api.js`
- [x] Method uses correct Backend V2.0 endpoint
- [x] **Fixed: Changed `this.client` to `apiClient` (critical bug fix)**
- [x] Response mapping matches CBS structure
- [x] Gender extraction from CNIC implemented
- [x] City extraction from address implemented
- [x] Both OCR fallback paths updated (primary + edge case)
- [x] Console logs added for debugging
- [x] Summary documentation created

---

**Status:** ✅ **COMPLETE - Ready for Testing (Bug Fixed)**

**Next Step:** User should reload the mobile app and test document upload → autofill flow.

