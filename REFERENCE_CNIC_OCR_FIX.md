# Reference CNIC OCR Fix

## Issue
Reference CNIC uploads were failing with "Invalid OCR response structure" error, even when uploading the same CNIC images that worked successfully in the main applicant CNIC upload.

## Root Cause
**Inconsistent data extraction logic** between main and reference CNIC handlers:

### Main CNIC Handler (Working)
```typescript
const ocrData = response.data?.data ?? response.data;
```
✅ Has fallback to handle different response structures

### Reference CNIC Handler (Broken)
```typescript
const ocrData = response.data.data;
```
❌ No fallback - fails if OCR service returns data directly in `response.data`

## Why It Happened
The OCR service (`http://localhost:8001/upload-cnic/`) sometimes returns data in different structures:
- **Structure 1:** `{ data: { name: "...", identity_number: "..." } }`
- **Structure 2:** `{ name: "...", identity_number: "..." }`

The main handler gracefully handles both structures with the `??` fallback operator, but the reference handler expected only Structure 1.

## Fix Applied

### Updated Reference CNIC Handler
**File:** `frontend/components/forms/common/DocumentUploadGateway.tsx`

```typescript
// Before (Line 274)
if (!response.data || !response.data.data) {
  throw new Error('Invalid OCR response structure');
}
const ocrData = response.data.data;

// After (Line 270)
const ocrData = response.data?.data ?? response.data;
```

### Additional Improvements
- Added comprehensive debug logging
- Added timeout handling (30 seconds)
- Added more specific error messages (timeout, server error, unclear image)
- Enhanced validation for extracted data

## Testing
1. ✅ Upload same CNIC in main section - works
2. ✅ Upload same CNIC in reference section - now works
3. ✅ Try Again button for failed uploads - works
4. ✅ Detailed error logging in console (F12)

## Impact
- Reference CNIC uploads now work consistently
- Better error handling and user feedback
- Consistent behavior across all CNIC upload handlers

## Files Modified
1. `frontend/components/forms/common/DocumentUploadGateway.tsx`
   - Fixed data extraction logic
   - Added comprehensive error handling
   - Added debug logging
   - Added timeout handling

---
**Status:** ✅ COMPLETE
**Date:** November 6, 2025

