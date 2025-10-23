# Quick Fix Steps for Document Loading Error

## ✅ Status: App Built Successfully!
The geolocation package is now linked and the app is running.

## 🔧 Current Issue: Document Loading Returns 500 Error

The error: `{"status":500,"message":"Request failed with status code 500","url":"/api/documents/54?applicationType=AutoLoan"}`

### Fix Steps:

#### Step 1: Restart Backend Server
```powershell
# Stop the current backend (Ctrl+C in backend terminal)
# Then restart:
cd backend
node server.js
```

**Why?** I just updated the backend code with better error handling and logging.

#### Step 2: Test Document Loading Again
1. Open the app on your phone/emulator
2. Navigate to an application
3. Check the backend terminal for these new logs:
   ```
   📄 Fetching documents for LOS-54 (AutoLoan)
   📁 DOCUMENTS_ROOT: D:\ILOS\backend\ilos_loan_application_documents
   📂 Looking for documents in: D:\ILOS\backend\ilos_loan_application_documents\autoloan\los-54
   📂 Directory exists: true/false
   ```

#### Step 3: Create Document Directory if Needed
If the logs show "Directory exists: false", create it:

```powershell
# In backend directory
mkdir -p ilos_loan_application_documents\autoloan\los-54
# Or for CashPlus:
mkdir -p ilos_loan_application_documents\cashplus\los-54
```

#### Step 4: Test Document Upload
1. Click "Upload Document" in the app
2. Take a photo
3. Check backend logs - should see:
   ```
   📤 Mobile document upload: { losId: '54', applicationType: 'autoloan', ... }
   ✅ Document uploaded successfully: photo_xxx.jpg for LOS-54
   ```

## What I Fixed:

### ✅ Backend - Fixed Database Query Issue
- **Old**: Tried to query `ilos_applications` table (doesn't exist in CBS db)
- **New**: Scans filesystem directly - no database needed

### ✅ Backend - Added Better Logging
- Shows exact path being checked
- Shows if directory exists
- Shows all files found
- Better error messages

### ✅ App - Rebuilt with Geolocation
- Native module now linked
- Location will work (after granting permission)

## Test Checklist:

```
□ Backend restarted with new code
□ Open application in mobile app
□ Check backend logs for directory path
□ Upload a document (camera/gallery)
□ Verify upload success in logs
□ Check if document appears in list
□ Grant location permission when asked
□ Complete investigation with location
```

## Expected Backend Logs (Success):

```
📄 Fetching documents for LOS-54 (autoloan)
📁 DOCUMENTS_ROOT: D:\ILOS\backend\ilos_loan_application_documents
📂 Looking for documents in: D:\ILOS\backend\ilos_loan_application_documents\autoloan\los-54
📂 Directory exists: true
📄 Found files: [ 'photo_1729684xxx.jpg' ]
✅ Found 1 documents for LOS-54
```

## If Still Not Working:

### Check DOCUMENTS_ROOT Environment Variable
```powershell
# In backend\.env file, add if not present:
DOCUMENTS_ROOT=D:\ILOS\backend\ilos_loan_application_documents
```

### Verify Directory Structure
```
backend\
  └── ilos_loan_application_documents\
      ├── cashplus\
      │   └── los-54\
      │       └── photo_xxx.jpg
      └── autoloan\
          └── los-54\
              └── photo_xxx.jpg
```

---

**Next Step**: Restart backend and try again! The detailed logs will show exactly what's happening.

