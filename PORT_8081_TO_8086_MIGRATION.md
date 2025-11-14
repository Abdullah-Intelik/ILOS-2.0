# Document Server Port Migration: 8081 → 8086

**Date:** November 13, 2025  
**Status:** ✅ **COMPLETE**

---

## 📋 Migration Plan

**Old Port:** 8081  
**New Port:** 8086  
**Reason:** Port 8081 needed for another service

---

## 📊 Files Analysis - Port 8081 Usage

### 🔴 Critical Backend Files (Must Change)
1. `backend-v2/document-server/server.js` - Server configuration
2. `backend/backend_Filezilla_for_testing/uploadtoftp.js` - Legacy document server

### 🟡 Frontend Files (Must Change)
3. `frontend/components/decision-engine-calculator.tsx` - eCIB loading
4. `frontend/components/document-explorer.tsx` - Document listing/viewing
5. `frontend/app/dashboard/documents/page.tsx` - Document upload
6. `frontend/app/dashboard/applicant/cashplus/page.tsx` - Cashplus documents
7. `frontend/app/dashboard/spu/page.tsx` - SPU document verification
8. `frontend/app/dashboard/spu/document-verification/page.tsx` - SPU verification
9. `frontend/app/dashboard/pb/mobile-submissions/page.tsx` - Mobile submissions
10. `frontend/app/api/documents/[losId]/route.ts` - Documents API
11. `frontend/app/api/upload-document/route.ts` - Upload API

### 🟢 Startup Scripts (Must Change)
12. `start-all.cmd` - Main startup script
13. `start-all.ps1` - PowerShell startup script
14. `stop-all.cmd` - Stop script

### 🔵 Mobile App Files (Must Change)
15. `ILOS-Mobile-App/src/utils/config.js` - Mobile app config
16. `ILOS-Mobile-App/src/utils/api.js` - Mobile API config
17. `ILOS-Mobile-App/setup-ports.cmd` - Port forwarding setup
18. `ILOS-Mobile-App/start-android.cmd` - Android startup
19. `ILOS-Mobile-App/start-android.ps1` - Android startup PS

### 📝 Documentation Files (Reference Only)
20. Various `.md` files (will be updated for reference)

---

## 🔄 Change Summary

### Total Files to Update: **19 files**

**Breakdown:**
- Backend servers: 2 files
- Frontend components: 9 files
- Startup scripts: 3 files
- Mobile app: 5 files

---

## ✅ Migration Checklist

- [x] 1. Update backend-v2 Document Server (port 8086)
- [x] 2. Update legacy Document Server
- [x] 3. Update Decision Engine Calculator
- [x] 4. Update Document Explorer
- [x] 5. Update Documents Dashboard
- [x] 6. Update Cashplus Page
- [x] 7. Update SPU Pages (2 files)
- [x] 8. Update Mobile Submissions Page
- [x] 9. Update API Routes (2 files)
- [x] 10. Update Startup Scripts (3 files)
- [x] 11. Update Mobile App Config (5 files)
- [x] 12. Update Customer App files (3 files)
- [ ] 13. Test all document operations
- [ ] 14. Test mobile app connectivity

---

## 🧪 Testing Plan After Migration

### Test 1: Document Upload
- [ ] Upload CNIC from Documents page
- [ ] Upload Salary from Cashplus page
- [ ] Upload eCIB from CIU dashboard

### Test 2: Document Viewing
- [ ] View documents in Document Explorer
- [ ] Preview documents in SPU dashboard
- [ ] Download documents from any dashboard

### Test 3: Mobile App
- [ ] Mobile app can connect to document server
- [ ] Mobile documents visible in PB dashboard
- [ ] Port forwarding working (adb reverse)

### Test 4: Decision Engine
- [ ] Auto-load eCIB from document server
- [ ] eCIB processing successful

### Test 5: Server Status
- [ ] Document server starts on port 8086
- [ ] No port conflicts
- [ ] All terminals show correct port

---

## 📝 Port Reference

| Service | Old Port | New Port | Status |
|---------|----------|----------|--------|
| Backend API | 5000 | 5000 | ✅ No change |
| Frontend | 3000 | 3000 | ✅ No change |
| **Document Server** | **8081** | **8086** | 🔄 Migrating |
| Metro Bundler | 8082 | 8082 | ✅ No change |
| CNIC OCR | 8001 | 8001 | ✅ No change |
| Salary OCR | 8002 | 8002 | ✅ No change |
| eCIB OCR | 8003 | 8003 | ✅ No change |

---

## 📊 Migration Summary

### ✅ Files Updated: **22 files**

**Backend (2 files):**
- ✅ `backend-v2/document-server/server.js` - Main document server
- ✅ `backend/backend_Filezilla_for_testing/uploadtoftp.js` - Legacy document server

**Frontend (9 files):**
- ✅ `frontend/components/decision-engine-calculator.tsx`
- ✅ `frontend/components/document-explorer.tsx`
- ✅ `frontend/app/dashboard/documents/page.tsx`
- ✅ `frontend/app/dashboard/applicant/cashplus/page.tsx`
- ✅ `frontend/app/dashboard/spu/page.tsx`
- ✅ `frontend/app/dashboard/spu/document-verification/page.tsx`
- ✅ `frontend/app/dashboard/pb/mobile-submissions/page.tsx`
- ✅ `frontend/app/api/documents/[losId]/route.ts`
- ✅ `frontend/app/api/upload-document/route.ts`

**Startup Scripts (3 files):**
- ✅ `start-all.cmd`
- ✅ `start-all.ps1`
- ✅ `stop-all.cmd`

**Mobile App - ILOS-Mobile-App (5 files):**
- ✅ `src/utils/config.js`
- ✅ `src/utils/api.js`
- ✅ `setup-ports.cmd`
- ✅ `start-android.cmd`
- ✅ `start-android.ps1`

**Customer App - ILOS-Customer-App (3 files):**
- ✅ `src/screens/DocumentUploadScreen.jsx`
- ✅ `src/utils/documentUpload.js`
- ✅ `DOCUMENT_UPLOAD_OCR_FEATURE.md`

---

## 🚀 Next Steps

**To apply the changes:**
1. ✅ All files updated with port 8086
2. 🔄 Restart all services:
   ```cmd
   cd "D:\ILOS 2.0"
   stop-all.cmd
   start-all.cmd
   ```
3. ⚠️ **Important:** Update `adb reverse` for mobile apps:
   ```cmd
   adb reverse tcp:8086 tcp:8086
   ```
4. 🧪 Test document operations:
   - Upload CNIC from Documents page
   - View documents in Document Explorer
   - Auto-load eCIB in Decision Engine
   - Mobile app document uploads

---

## ⚠️ Important Notes

1. **Port 8081 is now FREE** for your other service
2. **Document Server now runs on PORT 8086**
3. **All API calls updated** to use the new port
4. **Mobile apps require new port forwarding** (adb reverse)
5. **Must restart all services** for changes to take effect

---

**Status:** ✅ **MIGRATION COMPLETE - READY FOR TESTING**

