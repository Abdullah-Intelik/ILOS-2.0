# Document Server Setup for Mobile App

## ✅ Configuration Complete!

The mobile app is now configured to use the **same document server as the web app** (port 8081).

## Architecture:

```
Mobile App uses:
  - Port 5000: Main API (authentication, status updates, etc.)
  - Port 8081: Document Server (upload, fetch, view documents)
  - Port 8082: Metro bundler (React Native development)

Web App uses:
  - Port 3000: Next.js frontend
  - Port 5000: Main API
  - Port 8081: Document Server (FileZilla)
```

## 📋 Setup Steps:

### Step 1: Port Forwarding (IMPORTANT!)

For mobile app to work, you need to forward port 8081:

```powershell
# For emulator:
adb reverse tcp:8081 tcp:8081

# For physical device (already done):
# Device connects to 192.168.1.155:8081 (your computer's IP)
```

### Step 2: Ensure Document Server is Running

```powershell
cd backend/backend_Filezilla_for_testing
node uploadtoftp.js
```

You should see:
```
🟢 Upload Server listening on port 8081
📂 Files will be saved to: D:\ILOS\backend\backend_Filezilla_for_testing\...
```

### Step 3: Reload Mobile App

Since you've already rebuilt the app, just reload it:

```
Press 'r' in Metro terminal
or
Shake device → Reload
```

## 🧪 Testing:

### Test 1: View Existing Documents
1. Open LOS-54 (AutoLoan) in mobile app
2. Scroll to "Documents" section
3. Should now see: `54-CNIC..png` (same as web app!)

### Test 2: Upload New Document
1. Click "Upload Document"
2. Take photo or select from gallery
3. Should see success message
4. Document should appear in both:
   - Mobile app list
   - Web app Document Explorer

## 🔧 Configuration Changes Made:

### 1. `src/utils/config.js`
- Added `getDocumentServerUrl()` function
- Returns `http://10.0.2.2:8081` for emulator
- Returns `http://192.168.1.155:8081` for physical device
- Exported as `API_CONFIG.DOCUMENT_SERVER_URL`

### 2. `src/utils/api.js`
Updated three functions to use document server:

**getApplicationDocuments:**
- Uses `API_CONFIG.DOCUMENT_SERVER_URL`
- Calls `http://localhost:8081/api/documents/:losId`

**uploadDocument:**
- Uses `API_CONFIG.DOCUMENT_SERVER_URL`
- Calls `http://localhost:8081/upload`
- Changed field names to match document server:
  - `file` instead of `document`
  - `loanType` instead of `applicationType`
  - Added `Accept: application/json` header

**getDocumentUrl:**
- Uses `API_CONFIG.DOCUMENT_SERVER_URL`
- Returns `http://localhost:8081/explorer/...`

## 📁 Document Storage Location:

All documents (web + mobile) now stored in:
```
backend/backend_Filezilla_for_testing/
  └── Ilos_loan_application_documents/
      ├── cashplus/
      │   └── los-123/
      │       └── documents...
      ├── autoloan/
      │   └── los-54/
      │       └── 54-CNIC..png  ← Existing doc
      └── ...
```

## ✅ Benefits:

1. **Consistency**: Mobile and web use same documents
2. **Simplicity**: Only one document server to manage
3. **Compatibility**: Works with existing web app setup
4. **No Migration**: Existing documents work immediately

## 🐛 Troubleshooting:

### Documents not loading in mobile app:

**Check 1:** Is document server running?
```powershell
netstat -an | findstr :8081
# Should show: TCP 0.0.0.0:8081 LISTENING
```

**Check 2:** Port forwarding done?
```powershell
adb reverse tcp:8081 tcp:8081
```

**Check 3:** Check mobile app logs:
```
📄 Fetching from document server: http://10.0.2.2:8081/api/documents/54?applicationType=autoloan
```

### Upload failing:

**Check:** Document server logs should show:
```
🔄 Upload server: Received upload request
✅ Upload server: File uploaded successfully
```

**Fix:** Ensure `Accept: application/json` header is sent (already configured)

## 🎯 Quick Start Commands:

```powershell
# Terminal 1: Document Server
cd backend/backend_Filezilla_for_testing
node uploadtoftp.js

# Terminal 2: Main Backend
cd backend
node server.js

# Terminal 3: Metro (already running)
cd ILOS-Mobile-App
npx react-native start --port 8082

# Terminal 4: Setup device
adb reverse tcp:5000 tcp:5000
adb reverse tcp:8081 tcp:8081
adb reverse tcp:8082 tcp:8082

# Reload app
Press 'r' in Metro terminal
```

## ✨ Expected Result:

Mobile app "Documents" section should now show the same documents as Web app's "Document Explorer"!

---

**Status**: ✅ Configured  
**Next Step**: Do port forwarding (`adb reverse tcp:8081 tcp:8081`) and reload app

