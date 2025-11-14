# EAVMU Officer Mobile App - Backend V2.0 Migration Complete ✅

**Date:** November 14, 2025  
**Migration Status:** Complete  
**Target:** Backend V2.0 Integration

---

## 📋 Overview

The EAVMU Officer mobile app has been successfully migrated to work with Backend V2.0, matching the web dashboard's API structure and endpoints.

---

## ✅ Changes Implemented

### **1. Configuration Updates (`src/utils/config.js`)**

#### API Endpoints Updated:
- ✅ `HEALTH`: Changed from `/health` to `/api/v1/health`
- ✅ `EAMVU_APPLICATIONS`: Changed to `/api/v1/applications/department/EAVMUOFFICER/paginated`
- ✅ `APPLICATION_DETAILS`: Changed to `/api/v1/applications/:losId`
- ✅ `UPDATE_STATUS`: Changed to `/api/v1/applications/:losId/status` (REST format)
- ✅ `GET_COMMENTS`: New endpoint `/api/v1/applications/:losId/comments`
- ✅ `ADD_COMMENT`: New endpoint `/api/v1/applications/:losId/comments`
- ✅ Document endpoints remain unchanged (port 8086)

#### Status Options Updated:
- ✅ Replaced 4 old status options with 2 new actions:
  - `approve` → Moves to CIU stage (`eavmu_approved`)
  - `reject` → Rejects application (`eavmu_rejected`)

#### Removed Deprecated Endpoints:
- ❌ `UPDATE_COMMENT` (merged into comments endpoint)
- ❌ `AGENT_ASSIGNMENTS` (replaced by `assigned_to` field)
- ❌ `CUSTOMER_STATUS` (CBS integration removed)
- ❌ `CIF_DETAILS` (CBS integration removed)

---

### **2. API Service Updates (`src/utils/api.js`)**

#### New/Updated Methods:

**`getEAMVUApplications(agentId, page, pageSize)`**
- Now accepts `agentId` parameter for filtering
- Uses paginated endpoint with Backend V2.0
- Filters applications by `assigned_to` field
- Returns applications array from `data.data` or `data.applications`

**`getApplicationDetails(losId)`**
- Updated to use Backend V2.0 endpoint structure
- Maintains numeric LOS ID extraction

**`updateApplicationStatus(losId, action, verificationData, agentId)`**
- **NEW UNIFIED METHOD** replacing all old status/comment methods
- Supports `approve` and `reject` actions
- Automatically constructs `eavmuVerification` object
- Sends to PATCH `/api/v1/applications/:losId/status`

**`approveApplication(losId, notes, agentId, verificationData)`**
- Convenience wrapper for `updateApplicationStatus` with `approve` action
- Accepts verification details: `residence_verified`, `workplace_verified`, etc.

**`rejectApplication(losId, notes, agentId)`**
- Convenience wrapper for `updateApplicationStatus` with `reject` action

**`addComment(losId, commentData)`**
- New method for Backend V2.0 comments endpoint

**`getComments(losId)`**
- New method for Backend V2.0 comments endpoint

#### Removed Deprecated Methods:
- ❌ `completeEamvuInvestigation()` → Replaced by `approveApplication()`
- ❌ `rejectEamvuInvestigation()` → Replaced by `rejectApplication()`
- ❌ `updateApplicationComment()` → Replaced by `addComment()`
- ❌ `getApplicationComments()` → Replaced by `getComments()`
- ❌ `checkCustomerStatus()` (CBS removed)
- ❌ `getCIFDetails()` (CBS removed)
- ❌ `getAgentAssignments()` (deprecated)
- ❌ `getAssignedApplicationsForAgent()` → Replaced by `getEAMVUApplications(agentId)`
- ❌ `batchUpdateApplications()` (not needed)
- ❌ `getApplicationStatistics()` (not needed)

---

### **3. Screen Updates**

#### **HomeScreen.jsx**
- ✅ Updated health check endpoint to `/api/v1/health`
- ✅ Changed from `getAssignedApplicationsForAgent()` to `getEAMVUApplications(agentId)`
- ✅ Now uses Backend V2.0's `assigned_to` field filtering

#### **ApplicationDetailScreen.jsx**
- ✅ Updated approval flow to use `approveApplication()` with verification data:
  - `residence_verified: true`
  - `workplace_verified: true`
  - `documents_uploaded: uploadedPhotos.length > 0`
  - `method: locationData ? 'field_visit' : 'remote'`
- ✅ Updated rejection flow to use `rejectApplication()`
- ✅ Maintains location tracking and photo upload functionality

---

### **4. Port Forwarding Scripts**

#### **setup-ports.cmd**
- ✅ Added port 5000 (Backend V2 API)
- ✅ Updated port 8086 description (Document Server)
- ✅ Maintained port 8082 (Metro Bundler)

#### **start-android.cmd**
- ✅ Added port 5000 forwarding
- ✅ Updated port 8086 forwarding
- ✅ Maintained port 8082 forwarding
- ✅ Updated echo messages for clarity

---

## 🔌 Port Configuration

| Port | Service | Purpose |
|------|---------|---------|
| `5000` | Backend V2 API | Main application API (EAVMU endpoints) |
| `8086` | Document Server | Document upload/download |
| `8082` | Metro Bundler | React Native dev server |

All ports are forwarded via `adb reverse tcp:PORT tcp:PORT`

---

## 🎯 Backend V2.0 Integration

### **Database Tables Used:**

1. **`applications`** - Main application table
   - Field: `stage` (values: `EAVMUOFFICER`, `CIU`, etc.)
   - Field: `assigned_to` (agent ID for filtering)
   - Field: `status` (e.g., `eavmu_approved`, `eavmu_rejected`)

2. **`eavmu_verifications`** - Verification results
   - Fields: `residence_verified`, `workplace_verified`, `overall_result`
   - Field: `verification_notes` (investigation comments)
   - Field: `verification_method` (`field_visit` or `remote`)

3. **`application_workflow`** - Workflow history tracking

4. **`comments`** - Application comments (not yet implemented in mobile UI)

---

## 🧪 Testing Checklist

### **Pre-Testing Setup:**
1. ✅ Ensure Backend V2.0 is running on port 5000
2. ✅ Ensure Document Server is running on port 8086
3. ✅ Run port forwarding: `setup-ports.cmd`
4. ✅ Verify adb connection: `adb devices`

### **Test Cases:**

#### 1. **Application Loading**
- [ ] Login with agent credentials (101-105)
- [ ] Verify applications load and filter by agent
- [ ] Check pagination works (if more than 100 apps)
- [ ] Pull-to-refresh updates the list

#### 2. **Application Details**
- [ ] Open an application
- [ ] Verify all details display correctly
- [ ] Check document viewing works (port 8086)
- [ ] Test photo upload functionality

#### 3. **Approval Flow**
- [ ] Add investigation notes
- [ ] Upload photos (optional)
- [ ] Capture location (optional)
- [ ] Click "Complete Investigation"
- [ ] **Expected:** Application moves to CIU stage with `eavmu_approved` status
- [ ] **Verify:** Entry created in `eavmu_verifications` table

#### 4. **Rejection Flow**
- [ ] Add rejection notes (mandatory)
- [ ] Capture location (optional)
- [ ] Click "Reject Application"
- [ ] **Expected:** Application status changes to `eavmu_rejected`
- [ ] **Verify:** Entry created in `eavmu_verifications` table with `Rejected` result

#### 5. **Web Dashboard Sync**
- [ ] Approve/reject application from mobile
- [ ] Open EAVMU Officer web dashboard
- [ ] **Verify:** Same application shows correct status
- [ ] **Verify:** Comments/notes are visible on web

---

## 🚀 Deployment Steps

### **For Development:**

```bash
# 1. Setup port forwarding
cd "D:\ILOS 2.0\ILOS-Mobile-App"
call setup-ports.cmd

# 2. Start the app
call start-android.cmd

# OR run Metro separately:
npx react-native start --port 8082
npx react-native run-android --port 8082
```

### **For Testing:**

```bash
# Test Backend V2.0 connectivity from device
adb shell "curl http://localhost:5000/api/v1/health"

# Should return: {"success":true}
```

---

## 📝 Agent Credentials

| ID  | Name           | Password | String ID  |
|-----|----------------|----------|------------|
| 101 | Ahmad Hassan   | 001      | agent-001  |
| 102 | Fatima Ali     | 002      | agent-002  |
| 103 | Muhammad Khan  | 003      | agent-003  |
| 104 | Aisha Sheikh   | 004      | agent-004  |
| 105 | Sara Ahmed     | 005      | agent-005  |

---

## 🔍 Troubleshooting

### **"Failed to fetch EAMVU applications"**
- Check if Backend V2.0 is running: `curl http://localhost:5000/api/v1/health`
- Verify port forwarding: `adb reverse --list`
- Re-run setup: `setup-ports.cmd`

### **"Network request failed"**
- Ensure `adb reverse tcp:5000 tcp:5000` is active
- Restart Metro bundler
- Reload app (double-tap R)

### **"Applications not showing for agent"**
- Verify agent ID exists in database
- Check `assigned_to` field in `applications` table
- Confirm applications have `stage = 'EAVMUOFFICER'`

### **"Documents not loading (404)"**
- Verify Document Server is running on port 8086
- Check `adb reverse tcp:8086 tcp:8086`
- Confirm document paths match `los-XX` folder structure

---

## 📚 Related Documentation

- `BACKEND_INTEGRATION_COMPLETE.md` - Original backend integration
- `DOCUMENT-SERVER-SETUP.md` - Document Server configuration
- `PORT_CHANGE_README.md` - Port configuration details
- `TESTING-GUIDE.md` - Comprehensive testing guide
- `LOGIN_INFO.md` - Agent credentials and login info

---

## ✅ Migration Verification

**Status:** ✅ **COMPLETE**

All files have been updated to use Backend V2.0 endpoints and data structures. The mobile app now matches the EAVMU Officer web dashboard's API calls and workflow.

### **Files Modified:**
1. ✅ `src/utils/config.js` - API endpoints and status options
2. ✅ `src/utils/api.js` - API service methods
3. ✅ `src/screens/HomeScreen.jsx` - Application fetching
4. ✅ `src/screens/ApplicationDetailScreen.jsx` - Approval/rejection flow
5. ✅ `setup-ports.cmd` - Port forwarding script
6. ✅ `start-android.cmd` - Startup script

### **Next Steps:**
1. Test on physical device or emulator
2. Verify web dashboard sync
3. Test all workflow stages
4. Document any issues or edge cases

---

**Migration completed by:** AI Assistant  
**Reviewed by:** [Pending]  
**Deployed to:** Development Environment  

