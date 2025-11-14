# Mobile App Document Upload & OCR Feature

## ✅ IMPLEMENTED

### Overview
The ILOS Customer Mobile App now includes document upload functionality with OCR (Optical Character Recognition) processing, matching the web version's capabilities. Customers can upload CNIC and salary slip documents directly from their mobile device before filling the application form.

---

## New Flow

### Updated Navigation Flow

**Before:**
```
Product Selection → Application Form → Submit
```

**After (NEW):**
```
Product Selection → Document Upload (OCR) → Application Form (Auto-filled) → Submit
```

---

## Features

### 1. Document Upload Screen
**Location:** `src/screens/DocumentUploadScreen.jsx`

**Capabilities:**
- 📸 Take photo with camera
- 🖼️ Choose from gallery
- 🔄 Real-time OCR processing
- ✅ Document verification
- 📋 Auto-fill form data extraction

### 2. Supported Documents

#### CNIC (Required)
- **Purpose:** Identity verification
- **OCR Extraction:**
  - CNIC Number
  - Full Name
  - Father's Name
  - Date of Birth
  - Address
  
- **OCR Endpoint:** `http://10.0.2.2:8001/upload-cnic/`
- **Auto-fills:** Personal Information section

#### Salary Slip (Optional)
- **Purpose:** Income verification
- **OCR Extraction:**
  - Employee Name
  - Company Name
  - Designation
  - Net Salary
  - Month/Period

- **OCR Endpoint:** `http://10.0.2.2:8003/process-payslip`
- **Auto-fills:** Employment and Income sections

---

## Technical Implementation

### Components Created/Modified

#### 1. DocumentUploadScreen.jsx (NEW)
```javascript
// Main document upload interface
- Upload via camera or gallery
- OCR processing with loading states
- Error handling and retry
- Success confirmation with data preview
- Navigation to form with OCR data
```

**Key Functions:**
- `selectImageSource(docType)` - Shows camera/gallery options
- `handleCameraLaunch(docType)` - Launches device camera
- `handleGalleryLaunch(docType)` - Opens photo gallery
- `uploadAndProcessDocument(docType, asset)` - Uploads and runs OCR
- `handleContinue()` - Navigates to form with OCR data

#### 2. ApplicationFormScreen.jsx (MODIFIED)
```javascript
// Enhanced to receive and use OCR data
- Accepts ocrData param from route
- Auto-fills form fields from OCR results
- Shows success toast when auto-filled
- Falls back to CBS/ETB check if no OCR data
```

**Auto-fill Logic:**
```javascript
// Priority order:
1. OCR Data (if documents uploaded)
2. CBS Database (for existing customers)
3. Manual entry (new customers, no documents)
```

#### 3. AppNavigator.jsx (MODIFIED)
```javascript
// Added DocumentUpload screen to stack
<Stack.Screen name="DocumentUpload" component={DocumentUploadScreen} />
```

#### 4. ProductSelectionScreen.jsx (MODIFIED)
```javascript
// Changed navigation target
navigation.navigate('DocumentUpload', { productType: product.name });
// Was: navigation.navigate('ApplicationForm', { productType: product.name });
```

---

## OCR Integration

### Backend OCR Services

The mobile app connects to the same OCR microservices as the web version:

| Document | Port | Endpoint | Response Format |
|----------|------|----------|-----------------|
| **CNIC** | 8001 | `/upload-cnic/` | `{ cnic_number, name, father_name, dob, address }` |
| **Salary Slip** | 8003 | `/process-payslip` | `{ net_salary, company_name, designation, month }` |

### Network Configuration

**Android Emulator:**
```javascript
const ocrBaseUrl = 'http://10.0.2.2'; // Localhost on host machine
```

**Physical Device:**
```javascript
const ocrBaseUrl = 'http://192.168.x.x'; // Your computer's IP on local network
```

---

## User Experience

### Step-by-Step Flow

1. **Product Selection**
   - User selects product (e.g., CashPlus)
   - Navigates to Document Upload

2. **Document Upload Screen**
   ```
   ┌────────────────────────────────────┐
   │  Upload Documents                   │
   │  CashPlus                          │
   ├────────────────────────────────────┤
   │  ℹ️ Quick Document Verification    │
   │  Upload your documents now to      │
   │  auto-fill your application form.  │
   ├────────────────────────────────────┤
   │  📄 CNIC (Front & Back) *REQUIRED  │
   │  [ Tap to upload CNIC ]            │
   ├────────────────────────────────────┤
   │  💰 Salary Slip (Latest) OPTIONAL  │
   │  [ Tap to upload Salary Slip ]     │
   ├────────────────────────────────────┤
   │  [ Skip Salary Slip ]              │
   │  [ Continue to Application → ]     │
   └────────────────────────────────────┘
   ```

3. **Upload Options**
   ```
   Alert: "Select Image Source"
   - Take Photo
   - Choose from Gallery
   - Cancel
   ```

4. **Processing States**
   - **Uploading:** Shows progress indicator
   - **Processing:** "Processing with OCR..." with spinner
   - **Completed:** ✓ Verified badge + extracted data preview
   - **Error:** ❌ Failed badge + retry option

5. **Extracted Data Preview**
   ```
   ✓ Verified
   
   Extracted Data:
   CNIC: 1234512345671
   Name: Ahmed Khan
   ```

6. **Continue to Form**
   - Form opens with fields pre-filled
   - Toast: "Form Auto-filled - Your details have been filled from uploaded documents"
   - User reviews/completes remaining fields
   - Submit application

---

## Validation & Error Handling

### Document Status States

```javascript
const statuses = {
  pending: 'Awaiting upload',
  uploading: 'File uploading...',
  processing: 'Running OCR...',
  completed: 'Successfully processed',
  error: 'Processing failed'
};
```

### Error Scenarios

| Error | Cause | User Action |
|-------|-------|-------------|
| **Camera Permission Denied** | User blocked camera access | Show settings prompt |
| **OCR Service Down** | Backend not running | Retry / Skip document |
| **Invalid Image** | Blurry or wrong document | Retake photo |
| **Network Error** | No internet connection | Check connection & retry |
| **Low Confidence** | Poor quality scan | Warning + allow proceed |

### Required vs Optional

- **CNIC:** REQUIRED - Cannot proceed without uploading
- **Salary Slip:** OPTIONAL - Can skip and continue

---

## Backend Requirements

### Services That Must Be Running

1. **Main Backend** (Port 5000)
   ```bash
   cd "D:\ILOS 2.0\backend"
   node server.js
   ```

2. **CNIC OCR Service** (Port 8001)
   ```bash
   # Must be running on host machine
   python cnic_ocr_service.py
   ```

3. **Salary Slip OCR Service** (Port 8003)
   ```bash
   # Must be running on host machine
   python salary_ocr_service.py
   ```

4. **Document Upload Server** (Port 8081) - OPTIONAL
   ```bash
   cd "D:\ILOS 2.0\backend\backend_Filezilla_for_testing"
   node uploadtoftp.js
   ```
   *Note: Currently only used for saving OCR results, not required for mobile app flow*

---

## Testing

### Test Scenarios

#### ✅ Happy Path
1. Select CashPlus product
2. Upload clear CNIC photo
3. Wait for OCR processing
4. See extracted data
5. Upload salary slip
6. Continue to form
7. Verify fields are pre-filled
8. Complete and submit

#### ✅ Skip Salary Slip
1. Select product
2. Upload CNIC only
3. Click "Skip Salary Slip"
4. Continue to form
5. Manually enter salary info

#### ✅ Retry on Error
1. Upload blurry CNIC
2. OCR fails
3. Click "Try Again"
4. Take clearer photo
5. Success

#### ✅ Camera vs Gallery
1. Test with "Take Photo"
2. Test with "Choose from Gallery"
3. Both should work identically

---

## Configuration

### Environment Variables

**Mobile App Config:** `src/utils/config.js`
```javascript
export const API_CONFIG = {
  BASE_URL: 'http://10.0.2.2:5000',
  OCR_BASE_URL: 'http://10.0.2.2',
  DOC_SERVER_URL: 'http://10.0.2.2:8081',
};
```

### Permissions Required

**Android:** `android/app/src/main/AndroidManifest.xml`
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

**iOS:** `ios/ILOSCustomer/Info.plist`
```xml
<key>NSCameraUsageDescription</key>
<string>We need camera access to scan your documents</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>We need photo library access to upload documents</string>
```

---

## Code Structure

```
ILOS-Customer-App/
├── src/
│   ├── screens/
│   │   ├── DocumentUploadScreen.jsx       ⭐ NEW
│   │   ├── ApplicationFormScreen.jsx      🔄 MODIFIED (OCR auto-fill)
│   │   └── ProductSelectionScreen.jsx     🔄 MODIFIED (navigation)
│   │
│   └── navigation/
│       └── AppNavigator.jsx               🔄 MODIFIED (new route)
│
└── package.json                           ✅ (react-native-image-picker already installed)
```

---

## Advantages Over Web Version

| Feature | Web Version | Mobile App Version |
|---------|-------------|-------------------|
| **Camera Access** | ❌ Requires external device | ✅ Built-in camera |
| **Convenience** | Desktop + scanner/phone | ✅ One device only |
| **Portability** | Static location | ✅ Anywhere, anytime |
| **Photo Quality** | Depends on scanner | ✅ High-res phone cameras |
| **User Experience** | Multi-device setup | ✅ Seamless single flow |

---

## Limitations & Future Enhancements

### Current Limitations
1. Only CNIC and Salary Slip OCR (as requested)
2. No document storage to backend yet
3. OCR confidence threshold not enforced
4. Single image per document type

### Future Enhancements
- [ ] Add bank statement OCR
- [ ] Add business documents OCR
- [ ] Multi-page document support
- [ ] Real-time OCR preview
- [ ] Offline OCR capabilities
- [ ] Document quality checker
- [ ] Auto-crop and enhance images
- [ ] Save documents to backend storage

---

## Troubleshooting

### Common Issues

#### 1. "OCR failed with status 500"
**Cause:** OCR service not running
**Solution:**
```bash
# Start OCR services
python cnic_ocr_service.py  # Port 8001
python salary_ocr_service.py  # Port 8003
```

#### 2. "Network request failed"
**Cause:** Incorrect OCR base URL
**Solution:** 
- Android Emulator: Use `10.0.2.2`
- Physical Device: Use your computer's IP (e.g., `192.168.1.100`)

#### 3. Camera not opening
**Cause:** Missing permissions
**Solution:**
```bash
# Reinstall app to trigger permission prompts
npx react-native run-android
```

#### 4. Image not uploading
**Cause:** File format or size issue
**Solution:** Check file size < 10MB and format is jpg/png

#### 5. Form not auto-filling
**Cause:** OCR data structure mismatch
**Solution:** Check console logs for OCR response format

---

## Summary

✅ **Document upload screen created** with camera/gallery support
✅ **OCR integration** for CNIC and Salary Slip
✅ **Auto-fill functionality** from OCR data to form fields
✅ **Navigation flow updated** to include document upload step
✅ **Error handling** with retry capabilities
✅ **User-friendly UI** with progress indicators and previews

**Status:** COMPLETE ✓
**Ready for:** Testing with real OCR services running

---

## Next Steps for Testing

1. **Start all backend services:**
   ```bash
   # Terminal 1: Main backend
   cd "D:\ILOS 2.0\backend"
   node server.js

   # Terminal 2: CNIC OCR
   python cnic_ocr_service.py

   # Terminal 3: Salary OCR
   python salary_ocr_service.py
   ```

2. **Start mobile app:**
   ```bash
   cd "D:\ILOS 2.0\ILOS-Customer-App"
   npm run android
   ```

3. **Test flow:**
   - Login with test CNIC
   - Select CashPlus product
   - Upload CNIC document
   - Upload salary slip
   - Verify auto-fill in form
   - Complete and submit application

4. **Verify in dashboard:**
   - Check web dashboard (http://localhost:3000)
   - Verify application shows correct data
   - Confirm applicant name is visible (fixed in earlier update)

---

**Implementation Date:** November 4, 2025
**Version:** 1.1.0
**Developer Notes:** Feature matches web OCR capabilities, uses same backend services

