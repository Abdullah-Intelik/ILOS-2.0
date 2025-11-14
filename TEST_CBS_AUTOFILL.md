# 🧪 CBS Auto-fill Test Instructions

## Issue
Marital Status and Date of Birth are still not auto-filling from CBS

## Debugging Steps

### 1. Check Browser Console
After entering CNIC and navigating to CashPlus form, check console for:

```
🔍 CBS Data Debug: {
  dateOfBirth: "...",
  formattedDOB: "...",
  maritalStatus: "...",
  bankName: "...",
  allPersonalDetails: {...},
  rawCustomerData: {...},
  hasData: true/false
}
```

### 2. Expected Values

**CBS Response Format:**
- `detailData.individualInfo?.date_of_birth` → Should be in DD.MM.YYYY format
- `detailData.individualInfo?.maritial_status` → Should be 'M' or 'S'

**After Conversion:**
- DOB: "01.01.1990" → "1990-01-01"
- Marital: "M" → "Married", "S" → "Single"

### 3. Check CBS API Response

In Network tab, look for `/cif/{customerId}` call:
```json
{
  "individualInfo": {
    "date_of_birth": "01.01.1990",
    "maritial_status": "M",
    "sex": "M"
  }
}
```

### 4. Common Issues

#### Issue A: CBS Returns Different Field Names
**Check:** Console shows `dateOfBirth: undefined`
**Fix:** CBS might be using different field names

#### Issue B: Date Format Not Converting
**Check:** Console shows `dateOfBirth: "01.01.1990"` but input is empty
**Fix:** Format conversion might be failing

#### Issue C: Data Not Persisting
**Check:** Console shows correct values but form shows placeholder
**Fix:** React state might not be updating

### 5. Manual Test

Open browser console and run:
```javascript
// Check if customerData exists
console.log('Customer Data:', window.__NEXT_DATA__);

// Force update (if using React DevTools)
// Select MinimalApplicantForm component
// Check props.customerData.personalDetails
```

### 6. Backend Verification

Check if CBS API is returning data:
```bash
curl http://localhost:5000/cif/CUSTOMER_ID
```

Look for:
- `individualInfo.date_of_birth`
- `individualInfo.maritial_status`

## Fixes Applied

### 1. ✅ Form Sections Header - FIXED
- Changed from basic gray to modern slate design
- Added rounded corners and shadow
- Better spacing and typography
- Hover effects on buttons

### 2. ✅ Amount Placeholder Overlapping - FIXED
- Removed built-in placeholder
- Added conditional custom placeholder after PKR
- Made PKR label have `z-10` to stay on top
- Added `pointer-events-none` to prevent interaction issues

### 3. ✅ Monthly Income Placeholder Overlapping - FIXED
- Same fix as Amount Requested
- Conditional placeholder display
- Better spacing with PKR prefix

### 4. 🔍 CBS Auto-fill - INVESTIGATING
- Added enhanced debug logging
- Added useEffect to track CBS data arrival
- Need to verify CBS API response format

## Next Steps

1. **Check Console Logs** - Look for the debug output
2. **Verify CBS API** - Ensure backend is returning correct data
3. **Test Network Tab** - Check actual API response
4. **Report Findings** - Share console output with developer

## Quick Test Script

Paste this in browser console when on CashPlus form:

```javascript
console.log('=== CBS DATA DIAGNOSIS ===');
console.log('1. Customer Data exists?', !!window.customerData);
console.log('2. Personal Details?', window.customerData?.personalDetails);
console.log('3. DOB?', window.customerData?.personalDetails?.dateOfBirth);
console.log('4. Marital?', window.customerData?.personalDetails?.maritalStatus);
console.log('========================');
```

