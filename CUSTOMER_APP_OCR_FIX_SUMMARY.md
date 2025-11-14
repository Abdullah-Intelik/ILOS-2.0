# Customer App OCR Integration Fix

## Changes Made

### 1. Updated OCR Endpoints (DocumentUploadScreen.jsx)
- **Old:** Direct connection to OCR services on `10.0.2.2:8001`, `10.0.2.2:8003`
- **New:** Use Backend V2.0 as proxy via `http://localhost:5000/api/v1/ocr/cnic` and `/api/v1/ocr/salary`

### 2. Updated OCR Response Parsing
**New OCR Structure:**
```json
{
  "total_files": 1,
  "results": [{
    "result": {
      "name": "Saif Ullah",
      "father_name": "Ghulam Hussain",
      "identity_number": "38403-9346396-1",
      "date_of_birth": "10.11.1987",
      "cnic": "13503-1132321-6",
      "salary": "35,000PKR"
    }
  }]
}
```

**Parsing Logic:**
```javascript
if (ocrJson.results && ocrJson.results[0]?.result) {
  ocrData = ocrJson.results[0].result;
} else {
  ocrData = ocrJson?.data ?? ocrJson; // Fallback
}
```

### 3. Updated Document Server URL
- **Old:** `http://10.0.2.2:8086`
- **New:** `http://localhost:8086` (uses adb reverse)

## Testing
1. Start Backend V2.0 on port 5000
2. Start OCR services (ports 8001, 8002, 8003)
3. Start Document Server on port 8086
4. Set up port forwarding: `adb reverse tcp:5000 tcp:5000` and `adb reverse tcp:8086 tcp:8086`
5. Reload app and test document upload

## Files Changed
- `src/screens/DocumentUploadScreen.jsx`
- `src/utils/documentUpload.js`

