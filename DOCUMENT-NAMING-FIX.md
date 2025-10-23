# Document Naming Fix - Custom Filenames

## ✅ What Was Fixed

Updated mobile app to name uploaded documents as: **`LOSID_EAVMUOFFICER_OFFICERNAME_TIMESTAMP.ext`**

### Example Filename:
```
LOS-26_EAVMUOFFICER_Ahmad_Hassan_1729688445123.jpg
```

---

## 📝 Changes Made

### 1. Mobile App - ApplicationDetailScreen.jsx (Lines 426-453)

**Added custom filename generation:**
```javascript
const uploadToBackend = async (asset) => {
  // Generate custom filename: LOSID_EAVMUOFFICER_OFFICERNAME_TIMESTAMP
  const agentName = (global.currentAgent?.name || 'Officer')
    .replace(/\s+/g, '_'); // Replace spaces with underscores
  
  const timestamp = Date.now();
  const fileExtension = asset.fileName?.split('.').pop() || 'jpg';
  
  const customFileName = `${application.losId}_EAVMUOFFICER_${agentName}_${timestamp}.${fileExtension}`;
  
  console.log('📝 Custom filename:', customFileName);
  
  // Pass customFileName to uploadDocument
  const result = await apiService.uploadDocument(
    application.losId,
    applicationDetails.applicationType || 'cashplus',
    asset.uri,
    'investigation_photo',
    customFileName  // ✅ NEW PARAMETER
  );
};
```

**Filename Format:**
- `LOS-26` - Application LOS ID
- `EAVMUOFFICER` - Department identifier
- `Ahmad_Hassan` - Officer name (spaces replaced with underscores)
- `1729688445123` - Timestamp (milliseconds)
- `.jpg` - Original file extension

### 2. API Service - api.js (Lines 249-304)

**Updated uploadDocument to accept customFileName:**
```javascript
async uploadDocument(
  losId, 
  applicationType, 
  documentUri, 
  documentType = 'investigation_photo', 
  customFileName = null  // ✅ NEW PARAMETER
) {
  const formData = new FormData();
  
  // Use custom filename if provided
  const filename = customFileName || originalFilename;
  
  formData.append('file', {
    uri: documentUri,
    name: filename,
    type: type,
  });
  
  // Send custom_name to backend
  if (customFileName) {
    formData.append('custom_name', customFileName);
  }
  
  // Upload to document server
  const response = await axios.post(`${docServerUrl}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Accept': 'application/json',
    },
    timeout: 60000,
  });
}
```

### 3. Document Server Already Supports This!

The document server (`uploadtoftp.js`) already has built-in support for `custom_name`:
```javascript
// From uploadtoftp.js (lines 12-60)
app.post("/upload", upload.single("file"), (req, res) => {
  const { custom_name } = req.body;
  
  // Use custom name if provided, otherwise use original filename
  const finalFilename = custom_name || req.file.originalname;
  const finalPath = path.join(finalDir, finalFilename);
  
  fs.renameSync(req.file.path, finalPath);
});
```

**No backend changes needed!** ✅

---

## 🎯 How It Works

### Complete Flow:

```
1. Officer takes photo from mobile app
   ↓
2. Mobile generates custom filename:
   LOS-26_EAVMUOFFICER_Ahmad_Hassan_1729688445123.jpg
   ↓
3. api.js sends FormData with:
   - file: (binary data)
   - losId: 26
   - loanType: cashplus
   - custom_name: LOS-26_EAVMUOFFICER_Ahmad_Hassan_1729688445123.jpg
   ↓
4. Document server (port 8081) receives upload
   ↓
5. Server renames file to custom_name
   ↓
6. File saved as:
   D:\ILOS\backend\ilos_loan_application_documents\
   cashplus\los-26\LOS-26_EAVMUOFFICER_Ahmad_Hassan_1729688445123.jpg
```

---

## 🚀 Testing

### Step 1: Rebuild Mobile App
```bash
cd D:\ILOS\ILOS-Mobile-App

# Make sure document server is running
# Terminal 1:
cd D:\ILOS\backend\backend_Filezilla_for_testing
node uploadtoftp.js

# Terminal 2: Port forwarding
adb reverse tcp:5000 tcp:5000
adb reverse tcp:8081 tcp:8081
adb reverse tcp:8082 tcp:8082

# Terminal 3: Rebuild app
npx react-native run-android --port 8082
```

### Step 2: Upload Photo
1. Open mobile app
2. Login as Ahmad Hassan (or any officer)
3. Open any application (e.g., LOS-26)
4. Tap **"Upload Document"**
5. Choose **Camera** or **Gallery**
6. Take/select photo

### Step 3: Verify Filename

**Check mobile console:**
```javascript
📝 Custom filename: LOS-26_EAVMUOFFICER_Ahmad_Hassan_1729688445123.jpg
📤 Uploading document: originalPhoto.jpg
✅ Upload successful: {...}
```

**Check document server console:**
```
🔄 Upload server: Received upload request
✅ Upload server: File uploaded successfully: {
  originalname: 'originalPhoto.jpg',
  customName: 'LOS-26_EAVMUOFFICER_Ahmad_Hassan_1729688445123.jpg',
  finalFilename: 'LOS-26_EAVMUOFFICER_Ahmad_Hassan_1729688445123.jpg',
  path: 'D:\\ILOS\\backend\\ilos_loan_application_documents\\cashplus\\los-26\\LOS-26_EAVMUOFFICER_Ahmad_Hassan_1729688445123.jpg'
}
```

**Check file system:**
```bash
# Navigate to:
D:\ILOS\backend\ilos_loan_application_documents\cashplus\los-26\

# You should see:
LOS-26_EAVMUOFFICER_Ahmad_Hassan_1729688445123.jpg
```

**Check web Document Explorer:**
1. Open: http://localhost:3000
2. Go to Document Explorer
3. Search for LOS-26
4. You should see: `LOS-26_EAVMUOFFICER_Ahmad_Hassan_1729688445123.jpg`

---

## 📸 Expected Results

### Before (Old Naming):
```
los-26/
  ├── photo_1729688445000.jpg
  ├── IMG_20231023.jpg
  ├── document.jpg
```
❌ **Problem:** Can't tell which officer uploaded which photo

### After (New Naming):
```
los-26/
  ├── LOS-26_EAVMUOFFICER_Ahmad_Hassan_1729688445123.jpg
  ├── LOS-26_EAVMUOFFICER_Ahmad_Hassan_1729688567890.jpg
  ├── LOS-26_EAVMUOFFICER_Bilal_Ahmed_1729688734567.jpg
```
✅ **Success:** Clearly shows:
- Application ID (LOS-26)
- Department (EAVMUOFFICER)
- Officer who uploaded (Ahmad_Hassan)
- Upload timestamp (1729688445123)

---

## 🔍 Debugging

### If filename is NOT custom:

1. **Check mobile console logs:**
   ```javascript
   // Should show:
   📝 Custom filename: LOS-26_EAVMUOFFICER_Ahmad_Hassan_...
   
   // If you see original filename, rebuild app
   ```

2. **Check global.currentAgent:**
   ```javascript
   console.log('Current agent:', global.currentAgent);
   // Should show: { id: 101, name: 'Ahmad Hassan', ... }
   ```

3. **Check if app was rebuilt:**
   ```bash
   # Must rebuild after code changes!
   npx react-native run-android --port 8082
   ```

4. **Check document server logs:**
   ```
   // Should show:
   🔄 Upload server: Custom name: LOS-26_EAVMUOFFICER_Ahmad_Hassan_...
   ```

### If upload fails:

1. **Check port forwarding:**
   ```bash
   adb reverse tcp:8081 tcp:8081
   ```

2. **Check document server is running:**
   ```bash
   # Should see:
   🚀 Upload server running on port 8081
   ```

3. **Check .env path is correct:**
   ```
   DOCUMENTS_ROOT=D:/ILOS/backend/ilos_loan_application_documents
   ```

---

## 📋 Files Modified

| File | Lines | Changes |
|------|-------|---------|
| `ILOS-Mobile-App/src/screens/ApplicationDetailScreen.jsx` | 426-453 | Generate custom filename, pass to API |
| `ILOS-Mobile-App/src/utils/api.js` | 249-304 | Accept customFileName parameter, send to backend |
| *(No backend changes needed!)* | - | Document server already supports custom_name |

---

## 🎉 Benefits

1. **🔍 Traceability:** Know exactly which officer uploaded each document
2. **📊 Accountability:** Clear audit trail for investigations
3. **🗂️ Organization:** Easy to filter/search documents by officer
4. **⏰ Timestamping:** Precise upload time in milliseconds
5. **🎯 Clarity:** No more generic "photo.jpg" or "IMG_001.jpg"

---

## ✅ Verification Checklist

- [ ] Mobile app rebuilt after changes
- [ ] Document server running on port 8081
- [ ] Port forwarding active (`adb reverse tcp:8081 tcp:8081`)
- [ ] Uploaded photo from mobile app
- [ ] Console shows custom filename
- [ ] File saved with custom name in file system
- [ ] Document Explorer shows custom filename
- [ ] Filename format: `LOSID_EAVMUOFFICER_OFFICERNAME_TIMESTAMP.ext`

---

## 🚀 Quick Test Commands

```bash
# 1. Start document server
cd D:\ILOS\backend\backend_Filezilla_for_testing
node uploadtoftp.js

# 2. Port forwarding + rebuild
cd D:\ILOS\ILOS-Mobile-App
adb reverse tcp:8081 tcp:8081
npx react-native run-android --port 8082

# 3. After upload, check file:
cd D:\ILOS\backend\ilos_loan_application_documents\cashplus\los-26
dir

# Should see:
# LOS-26_EAVMUOFFICER_Ahmad_Hassan_1729688445123.jpg
```

---

**DONE! Documents now have meaningful, traceable names! 🎊**

