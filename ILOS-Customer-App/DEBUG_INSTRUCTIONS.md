# Debug Instructions - CNIC Extraction Issue

## Problem Summary

From your screenshot:
- **Salary Slip OCR:** ✅ WORKING - Shows CNIC and Salary
- **CNIC OCR:** ❌ NOT WORKING - Shows "CNIC: Not detected"
- **Validation:** ❌ NOT WORKING - Shows green checkmarks instead of red errors

## What I Added

I added detailed console logging to help us find the exact issue. The logs will show:
1. **Raw OCR API response** (what the server sends)
2. **Extracted data** (after `.data` extraction)
3. **All field names** in the OCR response
4. **Validation logic** (what fields it's checking)
5. **Validation results** (pass/fail and why)

---

## Steps to Debug

### 1. Open React Native Debugger

**In your terminal where the app is running, press:**
```
j
```
This opens Chrome DevTools.

**OR manually:**
1. Open Chrome
2. Go to: `chrome://inspect`
3. Click "inspect" under your app

### 2. Reload the App
```
r
```
(Press 'r' in the terminal)

### 3. Upload Documents Again

Upload both:
1. Saif Ullah's CNIC (`38403-9346396-1`)
2. Muhammad Umair's Salary Slip (`36102-8201831-9`)

### 4. Check Console Logs

Look for these log entries and **copy the ENTIRE output**:

#### A. CNIC OCR Response
```
🔍 RAW CNIC OCR Response: { ... }
✅ CNIC OCR extracted data: { ... }
```

#### B. Salary Slip OCR Response
```
🔍 RAW Salary Slip OCR Response: { ... }
✅ Salary Slip OCR extracted data: { ... }
```

#### C. Validation Logs
```
🔄 Running validation after cnic upload...
🔍 Validating documents...
📋 Customer CNIC: 3520111112221
📋 Documents state: { ... }
🔍 CNIC OCR Data Fields: [ ... ]
🔍 Full CNIC OCR Data: { ... }
🔍 CNIC Validation: { ... }
📊 Total validation errors: ...
📊 Errors array: [ ... ]
```

---

## Expected vs Actual

### ✅ What SHOULD Happen (Salary Slip is working):

**Salary Slip Response:**
```json
{
  "data": {
    "cnic": "36102-8201831-9",
    "net_salary": "37000",
    "company_name": "..."
  }
}
```

**After extraction:** `ocrData.cnic = "36102-8201831-9"` ✅

### ❌ What's WRONG (CNIC not working):

**CNIC Response (UNKNOWN):**
```json
{
  "data": {
    "???": "38403-9346396-1",  ← WHAT IS THIS FIELD NAME?
    "name": "Saif Ullah"
  }
}
```

**After extraction:** `ocrData.identity_number = undefined` ❌

---

## What I Need From You

**Please copy-paste the ENTIRE console output, specifically:**

1. The `🔍 RAW CNIC OCR Response:` log
2. The `🔍 CNIC OCR Data Fields:` log  
3. The `🔍 Full CNIC OCR Data:` log
4. The `🔍 CNIC Validation:` log

This will tell me:
- What field name the CNIC OCR API actually returns
- Whether validation is even running
- Why validation is passing when it should fail

---

## Quick Reference: What the Logs Mean

| Log Prefix | Meaning |
|-----------|---------|
| `🔍 RAW ... Response:` | Exact response from OCR API server |
| `✅ ... extracted data:` | Data after extracting `.data` property |
| `🔄 Running validation...` | Validation starting |
| `📋 Customer CNIC:` | Your logged-in CNIC number |
| `📋 Documents state:` | Whether documents have OCR data |
| `🔍 CNIC OCR Data Fields:` | **IMPORTANT!** All field names available |
| `🔍 Full CNIC OCR Data:` | **IMPORTANT!** Complete OCR result |
| `🔍 CNIC Validation:` | **IMPORTANT!** What values it's comparing |
| `📊 Total validation errors:` | How many mismatches found |
| `❌ Validation failed:` | Details of failures |

---

## Alternative: If Console is Hard to Access

**Enable Metro Bundler Logs:**

In your terminal where you ran `npm run android`, you should see logs automatically.

Look for the same log prefixes (🔍, ✅, 🔄, 📋, 📊, ❌) and copy-paste them here.

---

## Once I See the Logs...

I'll be able to:
1. Identify the exact field name for CNIC number (e.g., `id_number`, `cnic_no`, `national_id`, etc.)
2. Update the extraction logic to match
3. Fix the validation to work correctly
4. Add red error display when documents don't match

---

**After you provide the logs, I can fix this in under 2 minutes!** 🚀

