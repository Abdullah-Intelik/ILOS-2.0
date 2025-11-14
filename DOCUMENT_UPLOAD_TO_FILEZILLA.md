# Document Upload to FileZilla Integration

## Overview
**Problem:** Documents uploaded during form filling (CNIC, Salary Slip, etc.) are only stored as OCR data in the database. The actual image files are NOT saved to FileZilla for archival/audit purposes.

**Solution:** Upload the actual document files to FileZilla after form submission when LOS ID is created.

---

## How PostgreSQL Auto-Generates LOS IDs

**Question:** "How does the system know the next ID should be 140?"

**Answer:** PostgreSQL uses a **SEQUENCE** for auto-increment:

```sql
-- ID column configuration
column_default: "nextval('global_los_id_seq'::regclass)"
```

**Flow:**
1. You INSERT a new application without specifying an ID
2. PostgreSQL automatically calls `nextval('global_los_id_seq')`
3. Sequence increments: 139 → 140 → 141...
4. New row gets ID = 140

**Code (backend/routes/cashplus.js line 321-324):**
```javascript
const result = await client.query(insertQuery, values);
application = result.rows[0];
applicationId = application.id; // ← PostgreSQL assigned this!
```

---

## Current Implementation Status

### ✅ Completed
1. **Database**: `documents` JSONB column added to store OCR data
2. **Backend**: Saves OCR data to database on form submission
3. **Function Added**: `uploadDocumentsToFileZilla()` in cashplus/page.tsx (line 84-126)
4. **Form Submission Updated**: Now calls upload function after application is created (line 891)

### ✅ All Complete!
1. ✅ **Document Upload Gateway**: Store actual File objects (lines 71-74, 429-432)
2. ✅ **Customer Context**: Pass File objects through context (documents/page.tsx lines 97-102)
3. ✅ **Form Page**: Access File objects and upload to FileZilla (cashplus/page.tsx lines 84-126, 944)
4. 🧪 **Testing**: Ready to test - submit a form and verify files appear in FileZilla

---

## Implementation Details

### 1. Form Submission Flow (cashplus/page.tsx)

**After form submission succeeds:**
```typescript
if (response.ok) {
  const losId = data.application_id; // Get new LOS ID
  
  // ✅ Upload actual files to FileZilla
  const uploadResults = await uploadDocumentsToFileZilla(losId);
  
  if (uploadResults.failed > 0) {
    toast({ 
      title: "Partial Upload Success", 
      description: `${uploadResults.success} documents uploaded, ${uploadResults.failed} failed.`
    });
  }
  
  // Redirect to documents page
  router.push('/dashboard/documents');
}
```

### 2. Upload Function (cashplus/page.tsx line 84-126)

```typescript
const uploadDocumentsToFileZilla = async (losId: number) => {
  // Uploads:
  // - documentFiles.cnicFile → "CNIC"
  // - documentFiles.salaryFile → "Salary Slip"  
  // - documentFiles.reference1File → "Reference 1 CNIC"
  // - documentFiles.reference2File → "Reference 2 CNIC"
  
  // To: http://localhost:8081/upload
  // With: loan_type=cashplus, los_id=140, document_type=CNIC
};
```

---

## What Still Needs to Be Done

### Step 1: Update Document Upload Gateway
**File:** `frontend/app/dashboard/applicant/cashplus/documents/page.tsx`

**Change `handleDocumentComplete` to store File objects:**
```typescript
updateCustomerData({
  // ... existing OCR data ...
  
  // ✅ ADD: Store actual File objects
  documentFiles: {
    cnicFile: cnicFile, // The actual File object
    salaryFile: salaryFile,
    reference1File: reference1File,
    reference2File: reference2File,
  },
});
```

### Step 2: Update Customer Context Type
**File:** `frontend/contexts/CustomerContext.tsx`

**Add to interface:**
```typescript
export interface CustomerData {
  // ... existing fields ...
  
  documentFiles?: {
    cnicFile?: File;
    salaryFile?: File;
    reference1File?: File;
    reference2File?: File;
  };
}
```

### Step 3: Test the Complete Flow
1. Go to Document Upload Gateway
2. Upload CNIC + Salary Slip
3. Fill and submit form
4. Check FileZilla: `cashplus/los-140/` should have:
   - `140-CNIC.jpg`
   - `140-Salary Slip.pdf`

---

## Expected Result

**Before:**
- Database: Has OCR data ✅
- FileZilla: Empty ❌

**After:**
- Database: Has OCR data ✅
- FileZilla: Has actual files ✅
  ```
  cashplus/
    los-140/
      140-CNIC.jpg
      140-Salary Slip.pdf
      140-Reference 1 CNIC.jpg
      140-Reference 2 CNIC.jpg
      140-Application Form Physical Copy.pdf (uploaded manually)
  ```

---

## Benefits

1. **Audit Trail**: Physical files stored for compliance
2. **Manual Review**: Staff can view original documents
3. **Backup**: Files stored alongside database records
4. **Document Explorer**: All documents visible in one place

---

**Status:** ✅ COMPLETE & TESTED (100%)
**Tested with:** LOS-140
**Date:** November 7, 2025

---

## ✅ Test Results (LOS-140)

### Physical Files in FileZilla ✅
```
cashplus/los-140/
  ✅ 140-CNIC.png
  ✅ 140-Salary Slip.png
  ✅ 140-Reference 1 CNIC.jpg
  ✅ 140-Reference 2 CNIC.jpg
```

### OCR Data in Database ✅
```json
{
  "cnic": { "ocrData": {...}, "verified": true },
  "salarySlip": { "ocrData": {...}, "verified": true },
  "ecib": { "data": {...} },
  "reference1Cnic": { "ocrData": {...}, "verified": true },
  "reference2Cnic": { "ocrData": {...}, "verified": true }
}
```

### Documents Page UI ✅
Now displays two sections:
1. **Physical Documents (FileZilla)** - Blue box with View/Download buttons
2. **OCR Data (Database)** - Teal box showing extraction status

---

## 🎉 Features Completed

1. **Document Upload Flow**: ✅
   - User uploads documents → OCR processing → Store files & data

2. **FileZilla Integration**: ✅
   - Physical files uploaded to organized directories
   - Files accessible via `/files` static route
   - `/list-files` API endpoint to fetch file list

3. **Database Storage**: ✅
   - OCR data stored in `documents` JSONB column
   - All 5 document types supported

4. **Documents Page UI**: ✅
   - Shows physical files with View/Download buttons
   - Shows OCR extraction status
   - Clear visual separation between file types

