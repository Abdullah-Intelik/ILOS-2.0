# 🔄 Port Change Summary: Document Server 8081 → 8086

**Status:** ✅ **COMPLETE**  
**Date:** November 13, 2025

---

## 📋 Quick Summary

**What Changed:**
- Document Server (FileZilla) moved from **Port 8081** to **Port 8086**
- **22 files** updated across the entire codebase

**Why:**
- Port 8081 needed for another service

---

## ✅ All Changes Complete

### Backend Servers (2 files)
✅ `backend-v2/document-server/server.js`  
✅ `backend/backend_Filezilla_for_testing/uploadtoftp.js`

### Frontend Components (9 files)
✅ Decision Engine Calculator  
✅ Document Explorer  
✅ Documents Dashboard  
✅ Cashplus Page  
✅ SPU Pages (2 files)  
✅ Mobile Submissions Page  
✅ API Routes (2 files)

### Startup Scripts (3 files)
✅ `start-all.cmd`  
✅ `start-all.ps1`  
✅ `stop-all.cmd`

### Mobile App (5 files)
✅ Config files  
✅ API files  
✅ Startup scripts

### Customer App (3 files)
✅ Document upload screen  
✅ Upload utilities  
✅ Documentation

---

## 🚀 How to Apply Changes

### 1. Stop All Services
```cmd
cd "D:\ILOS 2.0"
stop-all.cmd
```

### 2. Restart All Services
```cmd
start-all.cmd
```

### 3. Update Mobile Port Forwarding
```cmd
adb reverse tcp:8086 tcp:8086
```

### 4. Verify Everything Works
- ✅ Document Server starts on port 8086
- ✅ Documents upload successfully
- ✅ Documents viewable in Explorer
- ✅ eCIB auto-loads in Decision Engine
- ✅ Mobile apps can connect

---

## 📊 Port Reference

| Service | Port | Status |
|---------|------|--------|
| Backend API | 5000 | ✅ No change |
| Frontend | 3000 | ✅ No change |
| **Document Server** | **8086** | ✅ **CHANGED (was 8081)** |
| Metro Bundler | 8082 | ✅ No change |
| CNIC OCR | 8001 | ✅ No change |
| Salary OCR | 8002 | ✅ No change |
| eCIB OCR | 8003 | ✅ No change |

---

## ⚠️ Important

**After restarting services, you should see:**
```
Starting Document Server (Port 8086)...
Document server listening on port 8086
```

**NOT:**
```
Starting Document Server (Port 8081)...  ❌ OLD
```

---

## 🧪 Quick Test

**Test document upload:**
1. Go to `http://localhost:3000/dashboard/documents`
2. Upload a document
3. Check console for: `http://localhost:8086/upload` ✅
4. Should NOT see: `http://localhost:8081/upload` ❌

**Test document viewing:**
1. Click eye icon on any document
2. Check URL: `http://localhost:8086/files/...` ✅
3. Document should open successfully

---

## ✅ Migration Complete!

**Port 8081 is now FREE for your other service!**  
**Document Server successfully moved to Port 8086!**

All systems updated and ready to use. 🎉

