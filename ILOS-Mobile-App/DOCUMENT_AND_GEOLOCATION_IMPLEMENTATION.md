# Document Management & Geo-Tagging Implementation

## Overview
This document describes the complete implementation of document upload/download and geo-tagging features for the ILOS Mobile App.

## Features Implemented

### 1. Document Management System

#### Backend Implementation (`backend/server.js`)
- **Upload Endpoint**: `POST /api/upload-document`
  - Accepts multipart/form-data with document file
  - Stores documents in organized folders: `{DOCUMENTS_ROOT}/{applicationType}/los-{losId}/`
  - Supports images (JPEG, PNG, GIF), PDFs, and Office documents
  - 10MB file size limit
  - Automatic timestamp naming to prevent overwrites

- **List Documents**: `GET /api/documents/:losId`
  - Fetches all documents for a specific application
  - Returns document metadata (name, size, upload time, path)
  - Automatically determines application type from database

- **Serve Documents**: `GET /explorer/:applicationType/:losId/:fileName`
  - Streams documents for viewing/downloading
  - Sets appropriate content-type headers for different file types
  - Supports inline viewing for images and PDFs
  - Implements security with path sanitization

#### Mobile App API Service (`src/utils/api.js`)
- **Enhanced `uploadDocument()`**: 
  - Accepts: `losId`, `applicationType`, `documentUri`, `documentType`
  - Handles React Native file URIs properly
  - Creates FormData with correct structure for multipart upload
  - 60-second timeout for large uploads
  - Detailed error logging

- **Updated `getApplicationDocuments()`**:
  - Fetches document list from backend
  - Returns empty array if no documents found
  - Handles both `LOS-123` and numeric ID formats

- **New `getDocumentUrl()`**:
  - Generates full URLs for document access
  - Works with both emulator and physical devices

#### Mobile App UI (`src/screens/ApplicationDetailScreen.jsx`)

**New Features:**
1. **Document Upload**:
   - Camera capture with 1920x1920 max resolution, 0.8 quality
   - Gallery picker with multi-select (up to 5 documents)
   - Real-time upload progress feedback
   - Automatic document list refresh after upload
   - Error handling with user-friendly messages

2. **Document Display**:
   - Auto-loads documents on screen open
   - Shows document list with metadata
   - Document count display
   - Empty state when no documents uploaded

3. **Upload Flow**:
   ```
   User clicks "Upload Document" 
   → Choose Camera/Gallery
   → Select/Capture photo(s)
   → Upload to backend (with progress alert)
   → Reload document list
   → Show success message
   ```

### 2. Geo-Tagging System

#### Location Utility (`src/utils/location.js`)
Complete location management module with:

**Functions:**
- `requestLocationPermission()`: Requests Android location permission
- `getCurrentLocation()`: Gets current GPS coordinates with high accuracy
- `watchLocation()`: Continuous location tracking
- `stopWatchingLocation()`: Stops tracking
- `formatLocation()`: Formats coordinates for display
- `calculateDistance()`: Haversine formula for distance calculation
- `getGoogleMapsUrl()`: Generates Google Maps links
- `showLocationConfirmation()`: Shows user-friendly location dialog

**Configuration:**
- High accuracy GPS mode enabled
- 15-second timeout
- 10-second maximum age for cached location
- Accuracy level reported in meters

#### Android Permissions (`android/app/src/main/AndroidManifest.xml`)
Added required permissions:
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

#### Integration in Application Detail Screen

**Complete Investigation Flow:**
```
1. User clicks "Complete Investigation"
2. Validates comments are present
3. Captures current GPS location (with user confirmation)
4. Appends location data to investigation notes:
   - Latitude & Longitude
   - Timestamp
   - Accuracy in meters
5. Submits to backend with location data
6. Shows success message with "✓ Location recorded"
```

**Reject Application Flow:**
```
1. User clicks "Reject Application"
2. Validates comments are present
3. Captures current GPS location (with user confirmation)
4. Appends location data to rejection notes
5. Submits rejection with location data
6. Shows confirmation with "✓ Location recorded"
```

**Location Display:**
- Shows location loading indicator
- Current location captured on screen load
- Location format: `Lat: XX.XXXXXX, Long: YY.YYYYYY`
- Accuracy and timestamp displayed in confirmation dialog

### 3. Investigation Notes with Location

**Format:**
```
Verification Comments: [User input]
Employment Verification: [User input]
Neighborhood Feedback: [User input]
General Observations: [User input]

📍 Location: Lat: 24.860966, Long: 67.001137
Timestamp: 10/23/2025, 2:30:45 PM
Accuracy: 15m
```

## Dependencies Installed

```json
{
  "@react-native-community/geolocation": "^3.x.x"
}
```

## Backend Requirements

### Environment Variables
```env
DOCUMENTS_ROOT=/path/to/ilos_loan_application_documents
```

### Folder Structure
```
ilos_loan_application_documents/
├── cashplus/
│   ├── los-123/
│   │   ├── photo_1729683045123.jpg
│   │   └── document_1729683145456.pdf
│   └── los-124/
├── autoloan/
└── homeloan/
```

## Testing the Features

### Testing Document Upload:
1. Open an application in the mobile app
2. Scroll to "Documents" section
3. Click "Upload Document"
4. Choose Camera or Gallery
5. Select/capture photo
6. Wait for upload confirmation
7. Verify document appears in list

### Testing Geo-Tagging:
1. Ensure location permissions are granted
2. Open an application
3. Add investigation comments
4. Click "Complete Investigation" or "Reject Application"
5. Allow location permission if prompted
6. View location confirmation dialog
7. Verify success message shows "✓ Location recorded"
8. Check backend investigation notes include location data

### Testing on Emulator vs Physical Device:
- **Emulator**: Set mock location in Android Studio's Extended Controls
- **Physical Device**: Ensure GPS is enabled and you're outdoors or near a window for better accuracy

## API Endpoints

### Document Management
- **POST** `/api/upload-document` - Upload new document
- **GET** `/api/documents/:losId` - List all documents for application
- **GET** `/explorer/:applicationType/:losId/:fileName` - View/download document

### Application Status (with Location)
- **POST** `/api/applications/update-status-workflow` - Complete/Reject with location

## Security Features

1. **Path Sanitization**: All file paths sanitized to prevent directory traversal
2. **File Type Validation**: Only allowed file types (images, PDFs, docs) can be uploaded
3. **Size Limits**: 10MB maximum file size
4. **Permission Management**: Proper Android permission handling
5. **CORS**: Configured for mobile app access

## Known Limitations & Future Enhancements

### Current Limitations:
1. No document deletion from UI (only backend storage)
2. No document preview/viewer in mobile app (only web URLs)
3. Location is optional - continues if GPS fails
4. Single document upload at a time from camera

### Future Enhancements:
1. In-app PDF viewer
2. Document deletion from mobile app
3. Batch upload progress indicator
4. Location validation against target address
5. Distance calculation between officer and customer location
6. Offline mode with sync when online
7. Document annotations/notes
8. Photo editing before upload

## Troubleshooting

### Location Not Working:
- Check location permissions in Android settings
- Ensure GPS is enabled
- Try outdoors for better signal
- Check Logcat for error messages: `📍`

### Upload Failing:
- Check backend is running on correct IP
- Verify port forwarding for emulator: `adb reverse tcp:5000 tcp:5000`
- Check file size < 10MB
- Verify `DOCUMENTS_ROOT` folder exists and has write permissions

### Documents Not Loading:
- Check network connectivity
- Verify backend `/api/documents/:losId` endpoint
- Check application type is correct in database
- Ensure documents folder exists

## Code Examples

### Uploading a Document:
```javascript
const result = await apiService.uploadDocument(
  application.losId,          // e.g., "LOS-123" or "123"
  'cashplus',                  // Application type
  asset.uri,                   // File URI from image picker
  'investigation_photo'        // Document type
);
```

### Getting Current Location:
```javascript
import { getCurrentLocation, formatLocation } from '../utils/location';

const location = await getCurrentLocation();
console.log(formatLocation(location));
// Output: "Lat: 24.860966, Long: 67.001137"
```

### Loading Documents:
```javascript
const documents = await apiService.getApplicationDocuments(losId);
// Returns: [{ name: "photo.jpg", size: 123456, uploadedAt: "...", path: "/explorer/..." }]
```

## Implementation Summary

✅ **Backend**: Document upload, list, and serving endpoints
✅ **Backend**: Location data stored in investigation notes  
✅ **Mobile App**: Document upload from camera/gallery
✅ **Mobile App**: Document list display
✅ **Mobile App**: Geo-location capture with permission handling
✅ **Mobile App**: Location appended to investigation/rejection notes
✅ **Android**: All required permissions added
✅ **Utilities**: Complete location management module
✅ **API Service**: Enhanced document and location methods
✅ **UI/UX**: User-friendly upload and location confirmation dialogs

## Next Steps for Deployment

1. **Test thoroughly** on both emulator and physical device
2. **Rebuild Android app**: `cd android && ./gradlew clean && cd .. && npx react-native run-android`
3. **Verify backend** has write permissions for documents folder
4. **Set proper DOCUMENTS_ROOT** in production environment
5. **Test location accuracy** in real field conditions
6. **Train EAMVU officers** on new features
7. **Monitor backend logs** for upload errors
8. **Set up document backup** strategy

---

**Implementation Date**: October 23, 2025
**Version**: 1.0.0
**Status**: ✅ Complete - Ready for Testing

