# Document Integration Plan

## Problem
Documents uploaded during form filling (via Document Upload Gateway with OCR) are not visible on the post-submission Documents Upload page.

## Current State

### Form Submission
When a user fills out the form after Document Upload Gateway, the following data is stored:

```javascript
documents: {
  cnic: {
    ocrData: {...},
    verified: true,
    uploadedAt: "2024-11-06T..."
  },
  salarySlip: {
    ocrData: {...},
    verified: true,
    uploadedAt: "2024-11-06T..."
  },
  ecib: {
    data: {...},
    uploadedAt: "2024-11-06T..."
  },
  reference1Cnic: {
    ocrData: {...},
    verified: true,
    uploadedAt: "2024-11-06T..."
  },
  reference2Cnic: {
    ocrData: {...},
    verified: true,
    uploadedAt: "2024-11-06T..."
  }
}
```

###Documents Upload Page
- Only shows interface for NEW uploads
- Doesn't fetch or display existing OCR documents
- Doesn't show the documents that were already submitted with the form

## Solution

### 1. Backend: Store Documents Properly
The `documents` object needs to be stored in the database. Check:
- ✅ Is it being sent to backend? YES (line 736-761 in cashplus/page.tsx)
- ❓ Is backend saving it? Need to check cashplus.js route

### 2. Backend: Add Endpoint to Fetch Documents
Create a new endpoint: `GET /api/applications/:id/documents`

Returns:
```javascript
{
  formDocuments: {
    cnic: { ocrData, verified, uploadedAt },
    salarySlip: { ocrData, verified, uploadedAt },
    // ... more
  },
  uploadedFiles: [
    // Files uploaded via FileZilla (physical forms, etc.)
  ]
}
```

### 3. Frontend: Display Existing Documents
Update Documents Upload page to:
1. Fetch existing documents when LOS ID is selected
2. Show OCR'd documents in a "Previously Uploaded" section
3. Allow viewing OCR data
4. Show upload interface for additional documents (physical forms)

## Implementation Steps

1. ✅ Check if backend is saving `documents` field
2. ✅ Add database column if missing (JSONB type)
3. ✅ Create API endpoint to fetch documents
4. ✅ Update Documents Upload page to show existing documents
5. ✅ Add UI to view OCR data for each document
6. ✅ Keep existing upload functionality for additional documents

## Files to Modify

1. `backend/routes/cashplus.js` - Ensure documents are saved
2. `backend/routes/applications.js` - Add endpoint to fetch documents
3. `frontend/app/dashboard/documents/page.tsx` - Show existing documents

---
**Status:** 🔧 IN PROGRESS
**Priority:** HIGH (User requested feature)

