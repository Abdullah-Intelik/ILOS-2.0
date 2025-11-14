# ✅ Document Server Migrated to Backend V2.0

## Summary
The FileZilla document server has been successfully moved from the old backend to Backend V2.0!

---

## Changes Made

### 1. **Moved Document Server**
**From:** `backend/backend_Filezilla_for_testing/uploadtoftp.js`  
**To:** `backend-v2/document-server/server.js`

**Key Changes:**
- Updated storage path to point to the old backend's document directory (keeps existing files accessible)
- Added mapping for `personal_loan` → `cashplus` for consistency
- Updated UI branding to "V2.0"
- Added better API documentation in home page

**Storage Location:**
```
D:\ILOS 2.0\backend\ilos_loan_application_documents\
  ├── cashplus/
  │   ├── los-61/
  │   │   ├── 61-eCIB.pdf
  │   │   ├── 61-CNIC.png
  │   │   ├── 61-Salary Slip.png
  │   │   └── ...
  ├── autoloan/
  ├── creditcard/
  └── ...
```

---

### 2. **Updated Frontend (Decision Engine)**
**File:** `frontend/components/decision-engine-calculator.tsx`

**Auto-Load Flow:**
```javascript
// 1. Check if eCIB file exists via list-files API
const listFilesUrl = `http://localhost:8081/list-files?loan_type=${productType}&los_id=${losId}`
const filesData = await fetch(listFilesUrl).json()
const ecibFile = filesData.files?.find(f => f.name.includes('ecib'))

// 2. If found, fetch the actual PDF via /files/ endpoint
const fileUrl = `http://localhost:8081/files/${productType}/los-${losId}/${ecibFile.name}`
const pdfBlob = await fetch(fileUrl).blob()

// 3. Send to OCR
// 4. Auto-calculate decision
```

---

## Document Server API Endpoints

### Port: `8081`

#### 📤 **Upload File**
```bash
POST http://localhost:8081/upload
Content-Type: multipart/form-data

Fields:
  - file: <file>
  - loan_type: "cashplus" | "autoloan" | "creditcard" | etc
  - los_id: "61"
  - custom_name: "61-eCIB.pdf" (optional)
```

#### 📂 **List Files in LOS Directory**
```bash
GET http://localhost:8081/list-files?loan_type=cashplus&los_id=61

Response:
{
  "files": [
    { "name": "61-eCIB.pdf", "url": "http://localhost:8081/files/cashplus/los-61/61-eCIB.pdf" },
    { "name": "61-CNIC.png", "url": "http://localhost:8081/files/cashplus/los-61/61-CNIC.png" }
  ]
}
```

#### 📥 **Serve/Download File**
```bash
GET http://localhost:8081/files/cashplus/los-61/61-eCIB.pdf

# Returns the actual file with proper MIME type
# Can be viewed in browser or downloaded
```

#### 🌐 **Web UI**
- **Upload Form:** `http://localhost:8081/pb-upload`
- **File Explorer:** `http://localhost:8081/explorer`
- **Home:** `http://localhost:8081/`

---

## Product Type Mapping

The server automatically maps various product type names to folder names:

| Database Value | Frontend Value | Folder Name |
|----------------|----------------|-------------|
| `personal_loan` | `personal_loan` | `cashplus` |
| `cashplus` | `cashplus` | `cashplus` |
| `auto_loan` | `autoloan` | `autoloan` |
| `credit_card` | `creditcard` | `creditcard` |
| `platinum_card` | `creditcard` | `creditcard` |
| `smeasaan` | `smeasaan` | `smeasaan` |

---

## How to Start

### Start Document Server
```bash
cd "D:\ILOS 2.0\backend-v2\document-server"
node server.js
```

Or use the batch file:
```bash
cd "D:\ILOS 2.0\backend-v2\document-server"
start.cmd
```

---

## Complete Startup Sequence

### 1. **Backend V2.0** (Port 5000)
```bash
cd "D:\ILOS 2.0\backend-v2"
npm start
```

### 2. **Document Server** (Port 8081)
```bash
cd "D:\ILOS 2.0\backend-v2\document-server"
node server.js
```

### 3. **Frontend** (Port 3000)
```bash
cd "D:\ILOS 2.0\frontend"
npm run dev
```

### 4. **OCR Services** (Ports 8001, 8002, 8003)
```bash
# CNIC OCR (Port 8001)
# Salary OCR (Port 8002)
# eCIB OCR (Port 8003)
```

---

## eCIB Auto-Load Flow (Complete)

```
User Opens CIU Dashboard → Selects LOS-61
    ↓
DecisionEngineCalculator loads
    ↓
Fetch application data (Backend V2.0)
    ↓
Get product_type: "personal_loan" → Map to: "cashplus"
    ↓
Check files: GET http://localhost:8081/list-files?loan_type=cashplus&los_id=61
    ↓
Response: [{ name: "61-eCIB.pdf", url: "..." }, ...]
    ↓
Find eCIB file: files.find(f => f.name.includes('ecib'))
    ↓
Fetch PDF: GET http://localhost:8081/files/cashplus/los-61/61-eCIB.pdf
    ↓
Convert to File object
    ↓
Upload to OCR: POST http://localhost:5000/api/decision/upload-ecib
    ↓
Receive parsed eCIB data
    ↓
Auto-calculate decision: POST http://localhost:5000/api/decision/calculate
    ↓
Display results! ✅
```

---

## Testing

### Test 1: Check if Document Server is Running
```bash
curl http://localhost:8081/
```
Expected: HTML page with "ILOS Document Server (V2.0)"

### Test 2: List Files for LOS-61
```bash
curl "http://localhost:8081/list-files?loan_type=cashplus&los_id=61"
```
Expected: JSON with list of files

### Test 3: Download eCIB
```bash
curl "http://localhost:8081/files/cashplus/los-61/61-eCIB.pdf" --output test-ecib.pdf
```
Expected: PDF file downloaded

### Test 4: Frontend Auto-Load
1. Open browser: `http://localhost:3000`
2. Login and go to CIU Dashboard
3. Select LOS-61
4. **Console should show:**
   ```
   🔍 Checking for eCIB in FileZilla
   ✅ Found eCIB file: 61-eCIB.pdf
   Fetching file from: http://localhost:8081/files/cashplus/los-61/61-eCIB.pdf
   ✅ eCIB Auto-Uploaded and Processed
   ```

---

## Benefits

✅ **Single Repository:** Everything in Backend V2.0  
✅ **Consistent Paths:** Uses same storage location as old backend  
✅ **Product Type Mapping:** Handles all variations automatically  
✅ **CORS Enabled:** Frontend can access directly  
✅ **Web UI:** Built-in upload form and file explorer  
✅ **Static Serving:** Fast file delivery via Express static middleware  

---

## Next Steps

### Optional: Move Storage Directory to Backend V2.0
If you want to fully separate from old backend:

1. **Copy documents:**
   ```bash
   xcopy "D:\ILOS 2.0\backend\ilos_loan_application_documents" "D:\ILOS 2.0\backend-v2\ilos_loan_application_documents" /E /I /Y
   ```

2. **Update server.js path:**
   ```javascript
   const LOCAL_ROOT = path.join(__dirname, '..', 'ilos_loan_application_documents');
   ```

3. **Update all upload integrations to use new location**

---

## Migration Complete! 🎉

The document server is now fully part of Backend V2.0 and ready to serve files for the Decision Engine auto-load feature!

