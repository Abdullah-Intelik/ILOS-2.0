# CNIC Length Validation Fix ✅

## Issue
Form submission was failing with a 500 error:
```
Error creating cashplus application and children: value too long for type character varying(13)
```

## Root Cause
The database column `cnic` has a limit of **VARCHAR(13)** (13 digits), but the form was submitting CNICs **with dashes** like `12345-1234567-1` (15 characters).

**Frontend was sending:**
- `12345-1234567-1` (15 characters) ❌

**Database expects:**
- `1234512345671` (13 characters) ✅

## Database Schema
```sql
cnic VARCHAR(13)  -- Only field with 13-character limit
```

## Fix Applied

### File: `frontend/app/dashboard/applicant/cashplus/page.tsx`

Added CNIC sanitization to remove dashes and spaces before submission:

**1. Main Applicant CNIC:**
```typescript
// Before
first_name: customerData.personalDetails?.firstName || '',
middle_name: customerData.personalDetails?.middleName || '',
last_name: customerData.personalDetails?.lastName || '',
date_of_birth: customerData.personalDetails?.dateOfBirth || '',

// After
first_name: customerData.personalDetails?.firstName || '',
middle_name: customerData.personalDetails?.middleName || '',
last_name: customerData.personalDetails?.lastName || '',
cnic: (customerData.personalDetails?.cnic || '').replace(/[-\s]/g, ''), // ✅ Remove dashes/spaces
date_of_birth: customerData.personalDetails?.dateOfBirth || '',
```

**2. Reference CNICs:**
```typescript
// Before
name: ref.name || '',
cnic: ref.cnic || '',
relationship: ref.relationship || '',

// After
name: ref.name || '',
cnic: (ref.cnic || '').replace(/[-\s]/g, ''), // ✅ Remove dashes/spaces from reference CNICs
relationship: ref.relationship || '',
```

## What This Does
The regex `/[-\s]/g` removes:
- `-` (dashes)
- ` ` (spaces)

Examples:
- `12345-1234567-1` → `1234512345671` ✅
- `12345 1234567 1` → `1234512345671` ✅
- `1234512345671` → `1234512345671` ✅ (no change)

## Why This Wasn't a Problem Before
The backend customer login and details endpoints already sanitize CNICs:
```javascript
const cleanCNIC = cnic.replace(/[-\s]/g, '');
```

But the **form submission** was directly sending the CNIC as-is from the form fields.

## Impact
- ✅ Main applicant CNIC sanitized before DB insert
- ✅ Reference CNICs sanitized before DB insert
- ✅ Supports user-friendly input with dashes (e.g., `12345-1234567-1`)
- ✅ Stores clean 13-digit format in database

## Testing
1. Enter CNIC with dashes: `12345-1234567-1`
2. Fill out form
3. Submit
4. ✅ Should save successfully with clean CNIC: `1234512345671`

## Other Fields to Check
If similar errors occur, check these fields for length limits:
- ✅ `cnic` - VARCHAR(13) - **FIXED**
- `mobile` - VARCHAR(20) - Should be fine
- `email` - VARCHAR(255) - Should be fine
- All other text fields - TEXT or VARCHAR(255+) - Should be fine

---
**Status:** ✅ FIXED
**Date:** November 6, 2025
**Files Modified:** `frontend/app/dashboard/applicant/cashplus/page.tsx`

