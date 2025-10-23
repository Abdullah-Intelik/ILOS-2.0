# Testing Guide for Document Upload & Geo-Tagging

## Quick Start - Rebuild and Test

### Step 1: Rebuild the Android App
```powershell
cd ILOS-Mobile-App
npx react-native run-android --port 8082
```

### Step 2: Start Backend (if not already running)
```powershell
cd backend
node server.js
```

### Step 3: Port Forwarding (For Emulator)
```powershell
adb reverse tcp:5000 tcp:5000
adb reverse tcp:8082 tcp:8082
```

## Testing Checklist

### ✅ Document Upload Testing

#### Test 1: Camera Upload
1. Open ILOS Mobile App
2. Login as EAMVU Officer
3. Click on any application
4. Scroll to "Documents" section
5. Click "Upload Document"
6. Choose "Camera"
7. Take a photo
8. Wait for upload confirmation
9. **Expected**: Success message + document appears in list

#### Test 2: Gallery Upload
1. Click "Upload Document"
2. Choose "Gallery"
3. Select 1-5 photos
4. Wait for upload
5. **Expected**: All photos uploaded successfully

#### Test 3: Document List
1. Close and reopen application detail
2. **Expected**: Previously uploaded documents still visible
3. Check document names, sizes displayed correctly

### ✅ Geo-Tagging Testing

#### Test 4: Location Permission
1. First time using location feature
2. Click "Complete Investigation"
3. **Expected**: Permission dialog appears
4. Grant permission
5. **Expected**: Location captured dialog appears

#### Test 5: Complete Investigation with Location
1. Open an application
2. Add comments in all fields
3. Click "Complete Investigation"
4. Confirm action
5. **Expected**: 
   - Location confirmation dialog shows
   - Shows Lat/Long, Accuracy, Timestamp
   - Success message includes "✓ Location recorded"

#### Test 6: Reject with Location
1. Open an application
2. Add comments
3. Click "Reject Application"
4. Confirm rejection
5. **Expected**:
   - Location captured
   - Shows confirmation
   - Success message includes "✓ Location recorded"

## Verification Steps

### Verify Document Upload in Backend:
```powershell
# Check if documents folder exists
ls backend/ilos_loan_application_documents/cashplus/los-*/

# Should show uploaded files with timestamps
```

### Verify Location in Backend Logs:
```
Look for console output:
📍 Location captured for investigation: { latitude: X, longitude: Y }
```

### Verify in Database:
Check `investigation_notes` field in database should include:
```
📍 Location: Lat: XX.XXXXXX, Long: YY.YYYYYY
Timestamp: 10/23/2025, 2:30:45 PM
Accuracy: 15m
```

## Common Issues & Solutions

### Issue: Location Permission Denied
**Solution**: Go to Android Settings → Apps → ILOS → Permissions → Enable Location

### Issue: "Upload Failed"
**Solution**: 
- Check backend is running
- Verify network connectivity
- Try smaller file size

### Issue: Location Not Accurate
**Solution**:
- Go outdoors for better GPS signal
- Wait 30 seconds for GPS to stabilize
- Enable "High Accuracy" mode in Android location settings

### Issue: Documents Not Loading
**Solution**:
- Check backend logs for errors
- Verify `DOCUMENTS_ROOT` folder exists
- Check application type matches folder name

## Manual Testing Script

Copy and execute this test plan:

```
📋 DOCUMENT UPLOAD TEST
□ Upload 1 photo from camera - SUCCESS/FAIL
□ Upload 3 photos from gallery - SUCCESS/FAIL
□ Verify photos appear in list - SUCCESS/FAIL
□ Reload app and check photos persist - SUCCESS/FAIL

📍 GEOLOCATION TEST
□ Grant location permission - SUCCESS/FAIL
□ Location shows in confirmation dialog - SUCCESS/FAIL
□ Complete investigation with location - SUCCESS/FAIL
□ Reject application with location - SUCCESS/FAIL
□ Verify location in backend notes - SUCCESS/FAIL

🔄 INTEGRATION TEST
□ Upload photo + Complete with location - SUCCESS/FAIL
□ Multiple uploads + Reject with location - SUCCESS/FAIL
□ Check all data saved in backend - SUCCESS/FAIL
```

## Performance Benchmarks

- Document upload (1MB photo): < 3 seconds
- Location capture: < 5 seconds
- Document list load: < 1 second
- Location accuracy: 5-50 meters (outdoor)

## Success Criteria

✅ All uploads succeed
✅ All documents visible in list
✅ Location captured with <50m accuracy
✅ Location data saved in investigation notes
✅ No app crashes
✅ User receives clear feedback for all actions

---

**Ready to Test!** 🚀

If all tests pass, the implementation is complete and ready for production deployment.

