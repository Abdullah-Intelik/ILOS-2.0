# 📁 Universal Document System - Implementation Guide

## 🎯 Overview

This document describes the **unified document management system** implemented across the entire ILOS platform. All document uploads and retrievals now use **consistent folder mapping** regardless of whether they come from the web app, mobile app, or any API.

---

## 🗂️ Folder Structure

```
backend/ilos_loan_application_documents/
├── cashplus/
│   └── los-{ID}/
│       └── [documents]
├── autoloan/
│   └── los-{ID}/
├── smeasaan/
│   └── los-{ID}/
├── commercialvehicle/
│   └── los-{ID}/
├── ameendrive/
│   └── los-{ID}/
├── personalloan/
│   └── los-{ID}/
├── homeloan/
│   └── los-{ID}/
├── creditcard/          ← UNIFIED: All credit card types here
│   ├── los-{ID}/
│   └── los-{ID}/
└── temp/                ← Unknown/temporary uploads
```

---

## 🔄 Universal Mapping Rules

### **Application Type → Folder Mapping**

| Application Type Input | Normalized | Folder Output |
|------------------------|------------|---------------|
| `CashPlus`, `cashplus`, `cash-plus` | `cashplus` | `cashplus/` |
| `AutoLoan`, `autoloan`, `auto_loan` | `autoloan` | `autoloan/` |
| `PlatinumCreditCard`, `platinumcreditcard` | `creditcard` | `creditcard/` ✅ |
| `ClassicCreditCard`, `classiccreditcard` | `creditcard` | `creditcard/` ✅ |
| `CreditCard`, `credit-card` | `creditcard` | `creditcard/` ✅ |
| `PersonalLoan`, `personalloan` | `personalloan` | `personalloan/` |
| `HomeLoan`, `homeloan` | `homeloan` | `homeloan/` |
| `SMEAsaan`, `smeasaan` | `smeasaan` | `smeasaan/` |
| `CommercialVehicle`, `commercial_vehicle` | `commercialvehicle` | `commercialvehicle/` |
| `AmeenDrive`, `ameendrive` | `ameendrive` | `ameendrive/` |
| Unknown | `temp` | `temp/` |

### **Key Features:**
- ✅ **Case-insensitive**: `CashPlus` = `cashplus` = `CASHPLUS`
- ✅ **Format-agnostic**: Handles spaces, dashes, underscores
- ✅ **Unified credit cards**: All credit card types → single `creditcard/` folder
- ✅ **Fallback**: Unknown types → `temp/` folder

---

## 🛠️ Implementation Files

### **1. Core Utility** (`backend/utils/documentMapping.js`)
```javascript
const { mapApplicationTypeToFolder, getDocumentPath } = require('../utils/documentMapping');

// Example usage:
const folder = mapApplicationTypeToFolder('PlatinumCreditCard'); 
// Returns: 'creditcard'

const path = getDocumentPath('LOS-76', 'PlatinumCreditCard');
// Returns: 'creditcard/los-76'
```

### **2. Document Server** (`backend/backend_Filezilla_for_testing/uploadtoftp.js`)
- **Upload endpoint** (`/upload`): Lines 77-98
- **Document listing** (`/api/documents/:losId`): Lines 301-328
- **HTML explorer** (`/explorer/*`): Lines 558-583

### **3. Web Frontend** (`frontend/`)
- **Upload API**: `frontend/app/api/upload-document/route.ts`
- **Document Explorer**: `frontend/components/document-explorer.tsx`
- **EAMVU Officer Dashboard**: `frontend/app/dashboard/eamvu_officer/page.tsx`

### **4. Mobile App** (`ILOS-Mobile-App/`)
- **API Service**: `ILOS-Mobile-App/src/utils/api.js` (lines 250-303)
- **Application Detail Screen**: `ILOS-Mobile-App/src/screens/ApplicationDetailScreen.jsx` (lines 427-449)

---

## 📤 Upload Flow

### **Web App Upload:**
```javascript
// 1. User selects file in document management
// 2. Frontend sends to: http://localhost:8081/upload
// 3. Request body:
{
  file: [File],
  loanType: 'PlatinumCreditCard',  // Any format
  losId: '76',
  subfolder: 'eavmu_docs'  // Optional
}

// 4. Document server applies mapping:
'PlatinumCreditCard' → 'creditcard'

// 5. File saved to:
backend/ilos_loan_application_documents/creditcard/los-76/filename.jpg
```

### **Mobile App Upload:**
```javascript
// 1. EAMVU officer takes photo
// 2. Mobile app calls: uploadDocument(losId, appType, uri, type, customName)
// 3. Request to: http://localhost:8081/upload
// 4. Same mapping applied
// 5. File saved to same unified location
```

---

## 📥 Retrieval Flow

### **Web App Retrieval:**
```javascript
// 1. Frontend requests documents for LOS-76 (PlatinumCreditCard)
// 2. API call: GET /api/documents/76?applicationType=PlatinumCreditCard
// 3. Server applies mapping: PlatinumCreditCard → creditcard
// 4. Looks in: backend/ilos_loan_application_documents/creditcard/los-76/
// 5. Returns all documents found
```

### **Mobile App Retrieval:**
```javascript
// 1. Mobile calls: getApplicationDocuments('LOS-76', 'platinumcreditcard')
// 2. Same API endpoint
// 3. Same mapping applied
// 4. Returns documents from unified location
```

---

## 🔧 Configuration

### **Document Server** (Port 8081)
```env
# backend/backend_Filezilla_for_testing/.env
DOCUMENTS_ROOT=D:/ILOS/backend/ilos_loan_application_documents
```

### **Web Frontend**
```typescript
// Uses: http://localhost:8081/upload
// Mapping handled by document server
```

### **Mobile App**
```javascript
// ILOS-Mobile-App/src/utils/config.js
export const API_CONFIG = {
  API_BASE_URL: 'http://localhost:5000',
  DOCUMENT_SERVER_URL: 'http://localhost:8081',
  // With adb reverse, uses localhost on emulator
};
```

---

## 🧪 Testing

### **Test Upload from Web:**
```bash
# 1. Login to web dashboard
# 2. Go to Document Management
# 3. Select application type: "Platinum Credit Card"
# 4. Enter LOS ID: 76
# 5. Upload a file
# 6. Verify in folder: backend/ilos_loan_application_documents/creditcard/los-76/
```

### **Test Upload from Mobile:**
```bash
# 1. Login to mobile app
# 2. Open application details (LOS-76)
# 3. Take photo or select from gallery
# 4. Upload
# 5. Check same folder: creditcard/los-76/
# 6. Verify filename format: LOS-76_EAVMUOFFICER_OfficerName_timestamp.jpg
```

### **Test Retrieval:**
```bash
# Web: Open document explorer for LOS-76
# Mobile: Open application details and check "Uploaded Documents"
# Both should show the same documents!
```

---

## 🔍 Debugging

### **Check Document Location:**
```powershell
# List all documents for LOS-76
Get-ChildItem "D:\ILOS\backend\ilos_loan_application_documents\creditcard\los-76\" -File
```

### **Check Server Logs:**
```bash
# Document server logs will show:
📂 Loan type mapping: "PlatinumCreditCard" → "creditcard"
✅ Upload server: File uploaded successfully
```

### **Check API Response:**
```bash
# Test API directly:
curl http://localhost:8081/api/documents/76?applicationType=PlatinumCreditCard

# Should return all documents in creditcard/los-76/
```

---

## 🚨 Common Issues & Solutions

### **Issue:** Documents not showing up
**Cause:** Application type mapping mismatch
**Solution:** Check that both upload and retrieval use consistent application type

### **Issue:** Duplicate folders (creditcard vs platinumcreditcard)
**Cause:** Old code still using separate folders
**Solution:** Run migration to move documents to unified folders

### **Issue:** Mobile app can't connect to document server
**Cause:** Port 8081 not forwarded
**Solution:**
```bash
adb reverse tcp:8081 tcp:8081
adb reverse --list  # Verify
```

---

## 📋 Migration Script

If you have documents in old separate folders, use this:

```powershell
# Move PlatinumCreditCard documents to unified creditcard folder
xcopy "D:\ILOS\backend\ilos_loan_application_documents\platinumcreditcard\*" ^
      "D:\ILOS\backend\ilos_loan_application_documents\creditcard\" /E /I /Y

# Move ClassicCreditCard documents
xcopy "D:\ILOS\backend\ilos_loan_application_documents\classiccreditcard\*" ^
      "D:\ILOS\backend\ilos_loan_application_documents\creditcard\" /E /I /Y

# Verify
dir "D:\ILOS\backend\ilos_loan_application_documents\creditcard\" /S
```

---

## ✅ Benefits of Universal System

1. **Consistency**: Same folders regardless of source (web/mobile)
2. **Simplicity**: One mapping logic for entire system
3. **Maintainability**: Single source of truth (`documentMapping.js`)
4. **Scalability**: Easy to add new application types
5. **Reliability**: No more missing documents due to folder mismatches

---

## 📝 Future Enhancements

- [ ] Add database tracking of document locations
- [ ] Implement document versioning
- [ ] Add automatic folder cleanup for temp/
- [ ] Create admin panel for document migration
- [ ] Add document search across all application types

---

## 🎉 Summary

**Before:**
- Web: `creditcard/los-76/`
- Mobile: `platinumcreditcard/los-76/`
- Result: Documents split across folders ❌

**After:**
- Web: `creditcard/los-76/`
- Mobile: `creditcard/los-76/`
- Result: All documents in one place ✅

---

**Last Updated:** October 23, 2025
**Version:** 2.0
**Status:** ✅ Production Ready

