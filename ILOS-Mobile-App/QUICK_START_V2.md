# EAVMU Officer Mobile App - Quick Start Guide (Backend V2.0)

## 🚀 Quick Start (3 Steps)

### **Step 1: Start Backend Services**
```bash
# In ILOS 2.0 root directory
cd "D:\ILOS 2.0"
call start-all.cmd
```

**Verify services are running:**
- Backend V2 API: http://localhost:5000/api/v1/health
- Document Server: http://localhost:8086/health

---

### **Step 2: Setup Port Forwarding**
```bash
# In ILOS-Mobile-App directory
cd "D:\ILOS 2.0\ILOS-Mobile-App"
call setup-ports.cmd
```

**This will forward:**
- Port 5000 (Backend API)
- Port 8086 (Document Server)
- Port 8082 (Metro Bundler)

---

### **Step 3: Start the App**
```bash
# Option A: All-in-one start (recommended)
call start-android.cmd

# Option B: Manual start
npx react-native start --port 8082
# In new terminal:
npx react-native run-android --port 8082
```

---

## 🔐 Login Credentials

Use these agent credentials to login:

| Agent ID | Name           | Password |
|----------|----------------|----------|
| 101      | Ahmad Hassan   | 001      |
| 102      | Fatima Ali     | 002      |
| 103      | Muhammad Khan  | 003      |

---

## ✅ Quick Test Flow

1. **Login** with agent 101 (Ahmad Hassan / 001)
2. **View** assigned applications list
3. **Open** an application from EAVMUOFFICER stage
4. **Add** investigation notes
5. **Approve** or **Reject** the application
6. **Verify** in web dashboard: http://localhost:3000/dashboard/eamvu_officer

---

## 🔍 Troubleshooting

### App won't connect to backend?
```bash
# Re-run port forwarding
call setup-ports.cmd

# Reload app (double-tap R in device)
```

### No applications showing?
- Check that applications exist in EAVMUOFFICER stage
- Verify agent 101 has assignments in database
- Check backend logs for API response

### Metro bundler issues?
```bash
# Clean everything
call clean-and-rebuild.bat

# Then restart
call start-android.cmd
```

---

## 📱 Features Available

✅ **Application List** - View all assigned EAVMU cases  
✅ **Application Details** - Full applicant and loan info  
✅ **Investigation Notes** - Add detailed comments  
✅ **Photo Upload** - Capture investigation photos  
✅ **GPS Tracking** - Auto-capture location with timestamp  
✅ **Approve Flow** - Send to CIU with verification data  
✅ **Reject Flow** - Send back with rejection notes  
✅ **Document Viewer** - View uploaded documents (CNIC, Salary, etc.)  

---

## 🌐 Backend V2.0 Endpoints Used

| Endpoint | Purpose |
|----------|---------|
| `GET /api/v1/health` | Health check |
| `GET /api/v1/applications/department/EAVMUOFFICER/paginated` | Get applications |
| `GET /api/v1/applications/:losId` | Get application details |
| `PATCH /api/v1/applications/:losId/status` | Approve/Reject |
| `GET /api/documents/:losId` | Get documents (port 8086) |
| `POST /upload` | Upload photo (port 8086) |

---

## 📖 Full Documentation

For detailed information, see:
- `BACKEND_V2_MIGRATION_COMPLETE.md` - Complete migration details
- `TESTING-GUIDE.md` - Comprehensive testing guide
- `BACKEND_INTEGRATION_COMPLETE.md` - Original integration docs

---

**Ready to test!** 🎉

