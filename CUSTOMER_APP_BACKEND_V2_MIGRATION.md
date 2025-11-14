# Customer App Backend V2.0 Migration Plan

**Date:** November 13, 2025  
**Status:** 🔴 **REQUIRED - NOT YET INTEGRATED**

---

## 🚨 Critical Issue

The **ILOS-Customer-App** is currently using **OLD backend endpoints** that don't exist in **Backend V2.0**!

This is why you're seeing `Login error: Error: Login failed` in the mobile app.

---

## 📊 Current vs New API Endpoints

### ❌ OLD Endpoints (Customer App Currently Uses)
```javascript
// Authentication
POST /api/customer/login                      ❌ Doesn't exist in V2.0
POST /api/customer/verify-cnic                ❌ Doesn't exist in V2.0

// Applications
GET  /api/customer/applications               ❌ Doesn't exist in V2.0
GET  /api/customer/applications/:losId        ❌ Doesn't exist in V2.0
POST /api/customer/applications/submit        ❌ Doesn't exist in V2.0

// Product Submissions
POST /api/cashplus                            ❌ Doesn't exist in V2.0
POST /api/autoloan                            ❌ Doesn't exist in V2.0
POST /api/platinum_creditcard                 ❌ Doesn't exist in V2.0

// Documents
POST /api/customer/documents/upload           ❌ Doesn't exist in V2.0
GET  /api/customer/documents/:losId           ❌ Doesn't exist in V2.0
```

### ✅ NEW Endpoints (Backend V2.0 Provides)
```javascript
// Parties (Customers)
GET  /api/v1/parties/cnic/:cnic               ✅ Get customer by CNIC
GET  /api/v1/parties/:cnic/latest-application ✅ Get latest application for smart pre-fill
POST /api/v1/parties                          ✅ Create new party

// Applications
POST /api/v1/applications                     ✅ Create application
GET  /api/v1/applications/:losId              ✅ Get application details
GET  /api/v1/applications/form/:losId         ✅ Get application form
GET  /api/v1/applications/party/:partyId      ✅ Get applications by party
PATCH /api/v1/applications/:losId/status      ✅ Update status

// Comments & History
GET  /api/v1/applications/:losId/comments     ✅ Get comments
POST /api/v1/applications/:losId/comments     ✅ Add comment

// Documents (Document Server on Port 8086)
POST http://localhost:8086/upload             ✅ Upload documents
GET  http://localhost:8086/list-files         ✅ List documents
GET  http://localhost:8086/files/:path        ✅ Get document file
```

---

## 🔧 Required Changes

### 1. Update API Configuration
**File:** `ILOS-Customer-App/src/utils/config.js`

**Current (OLD):**
```javascript
export const API_ENDPOINTS = {
  LOGIN: '/api/customer/login',                    ❌
  VERIFY_CNIC: '/api/customer/verify-cnic',        ❌
  SUBMIT_CASHPLUS: '/api/cashplus',                ❌
  GET_MY_APPLICATIONS: '/api/customer/applications', ❌
};
```

**New (V2.0):**
```javascript
export const API_CONFIG = {
  API_BASE_URL: 'http://10.0.2.2:5000',           // Backend V2.0
  DOCUMENT_SERVER_URL: 'http://10.0.2.2:8086',    // Document Server (changed from 8081)
};

export const API_ENDPOINTS = {
  // Parties (Customer Management)
  GET_PARTY_BY_CNIC: (cnic) => `/api/v1/parties/cnic/${cnic}`,
  GET_LATEST_APPLICATION: (cnic) => `/api/v1/parties/${cnic}/latest-application`,
  CREATE_PARTY: '/api/v1/parties',
  
  // Applications
  CREATE_APPLICATION: '/api/v1/applications',
  GET_APPLICATION: (losId) => `/api/v1/applications/${losId}`,
  GET_APPLICATION_FORM: (losId) => `/api/v1/applications/form/${losId}`,
  GET_MY_APPLICATIONS: (partyId) => `/api/v1/applications/party/${partyId}`,
  UPDATE_APPLICATION_STATUS: (losId) => `/api/v1/applications/${losId}/status`,
  
  // Comments
  GET_COMMENTS: (losId) => `/api/v1/applications/${losId}/comments`,
  ADD_COMMENT: (losId) => `/api/v1/applications/${losId}/comments`,
  
  // Documents (Document Server - Port 8086)
  UPLOAD_DOCUMENT: 'http://10.0.2.2:8086/upload',
  LIST_DOCUMENTS: 'http://10.0.2.2:8086/list-files',
  GET_DOCUMENT: 'http://10.0.2.2:8086/files',
};
```

---

### 2. Update API Service Methods
**File:** `ILOS-Customer-App/src/utils/api.js`

#### 2.1 Login Method

**Current (OLD):**
```javascript
async loginWithCNIC(cnic) {
  const response = await apiClient.post(API_ENDPOINTS.LOGIN, { cnic });
  return response.data;
}
```

**New (V2.0):**
```javascript
async loginWithCNIC(cnic) {
  try {
    // Check if party exists by CNIC
    const response = await apiClient.get(
      API_ENDPOINTS.GET_PARTY_BY_CNIC(cnic)
    );
    
    if (response.data.success && response.data.party) {
      const party = response.data.party;
      
      // Determine customer status
      let status = 'NTB'; // Default: New to Bank
      if (party.customer_type === 'ETB') {
        status = 'ETB'; // Existing to Bank (has CBS account)
      }
      
      // Get latest application for auto-fill
      let latestApplication = null;
      try {
        const appResponse = await apiClient.get(
          API_ENDPOINTS.GET_LATEST_APPLICATION(cnic)
        );
        if (appResponse.data.success) {
          latestApplication = appResponse.data.application;
        }
      } catch (err) {
        // No previous applications - that's okay
      }
      
      return {
        success: true,
        customer: {
          party_id: party.party_id,
          cnic: party.cnic,
          name: `${party.first_name} ${party.last_name}`,
          first_name: party.first_name,
          last_name: party.last_name,
          mobile: party.mobile,
          email: party.email,
          status: status,
          customer_type: party.customer_type,
          latestApplication: latestApplication
        }
      };
    } else {
      // Party doesn't exist - NEW customer (NTB)
      return {
        success: true,
        customer: {
          cnic: cnic,
          name: 'New Customer',
          status: 'NTB',
          customer_type: 'NTB',
          isNew: true
        }
      };
    }
  } catch (error) {
    throw handleApiError(error, 'Login failed');
  }
}
```

#### 2.2 Get My Applications

**Current (OLD):**
```javascript
async getMyApplications() {
  const response = await apiClient.get(`/api/applications/by-cnic/${cnic}`);
  return response.data;
}
```

**New (V2.0):**
```javascript
async getMyApplications() {
  try {
    const customerData = await AsyncStorage.getItem('customer_data');
    const customer = JSON.parse(customerData);
    
    if (!customer || !customer.party_id) {
      throw new Error('Customer data not found');
    }

    // Fetch applications by party_id (not CNIC)
    const response = await apiClient.get(
      API_ENDPOINTS.GET_MY_APPLICATIONS(customer.party_id)
    );
    
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Failed to fetch applications');
  }
}
```

#### 2.3 Submit Application

**Current (OLD):**
```javascript
async submitApplication(productType, formData) {
  // Uses different endpoints for each product
  const endpoint = PRODUCT_TYPES[productType].endpoint; // /api/cashplus, etc.
  const response = await apiClient.post(endpoint, formData);
  return response.data;
}
```

**New (V2.0) - UNIFIED:**
```javascript
async submitApplication(applicationData) {
  try {
    // Backend V2.0 uses a SINGLE endpoint for all products
    const response = await apiClient.post(
      API_ENDPOINTS.CREATE_APPLICATION,
      applicationData
    );
    
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Failed to submit application');
  }
}
```

#### 2.4 Upload Document

**Current (OLD):**
```javascript
async uploadDocument(formData) {
  const response = await apiClient.post(
    API_ENDPOINTS.UPLOAD_DOCUMENT,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data;
}
```

**New (V2.0) - Uses Document Server:**
```javascript
async uploadDocument(formData) {
  try {
    // Upload directly to Document Server (Port 8086)
    const response = await axios.post(
      API_ENDPOINTS.UPLOAD_DOCUMENT, // http://10.0.2.2:8086/upload
      formData,
      {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        },
        timeout: 60000 // 60 seconds for large files
      }
    );
    
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Failed to upload document');
  }
}
```

---

## 🗄️ Database Schema Changes

### New Schema (Backend V2.0)

The customer app needs to understand the new database structure:

**parties table:**
```sql
- party_id (PRIMARY KEY)
- cnic
- first_name
- last_name
- date_of_birth
- mobile
- email
- residential_address
- city
- customer_type ('NTB', 'ETB', 'RETURNING')
```

**applications table:**
```sql
- application_id (PRIMARY KEY)
- los_id (LOS-66, LOS-67, etc.)
- party_id (FOREIGN KEY → parties)
- product_type ('cashplus', 'autoloan', etc.)
- requested_amount
- tenure_months
- status ('submitted', 'eavmu_assigned', 'eavmu_approved', 'disbursed', 'rejected')
- current_stage ('PB', 'EAVMU_OFFICER', 'CIU', 'RRU', 'DISBURSED')
- created_at
- updated_at
- disbursed_at
```

**party_details table:**
```sql
- party_id (FOREIGN KEY → parties)
- monthly_income
- employment_type
- employer_name
- designation
- employment_tenure_months
- office_address
- bank_name
- account_number
```

---

## 📋 Migration Checklist

- [ ] 1. Update `config.js` with new API endpoints
- [ ] 2. Update `api.js` - loginWithCNIC method
- [ ] 3. Update `api.js` - getMyApplications method
- [ ] 4. Update `api.js` - submitApplication method (unified)
- [ ] 5. Update `api.js` - uploadDocument method (Document Server)
- [ ] 6. Update `api.js` - getApplicationDetails method
- [ ] 7. Update `LoginScreen.jsx` - handle new response format
- [ ] 8. Update `HomeScreen.jsx` - use party_id instead of CNIC
- [ ] 9. Update `ApplicationFormScreen.jsx` - new submission format
- [ ] 10. Update `DocumentUploadScreen.jsx` - use Document Server
- [ ] 11. Update `ApplicationStatusScreen.jsx` - new status values
- [ ] 12. Update `storage.js` - save party_id
- [ ] 13. Test login flow with new endpoints
- [ ] 14. Test application submission
- [ ] 15. Test document upload to port 8086
- [ ] 16. Test application status tracking

---

## 🧪 Testing After Migration

### Test 1: Login
```
1. Enter CNIC in customer app
2. Backend V2.0 checks /api/v1/parties/cnic/:cnic
3. Returns party data if exists
4. App determines NTB/ETB status
5. Navigates to appropriate screen
```

### Test 2: Application Submission
```
1. Fill CashPlus application form
2. Submit via POST /api/v1/applications
3. Backend creates party_details and application
4. Returns los_id (e.g., LOS-74)
5. App shows success message
```

### Test 3: Document Upload
```
1. Upload CNIC, Salary, Bank Statement
2. Upload to http://10.0.2.2:8086/upload
3. Documents stored in ilos_loan_application_documents/
4. Visible in PB dashboard
```

### Test 4: Application Tracking
```
1. View "My Applications" screen
2. Fetch via GET /api/v1/applications/party/:partyId
3. Show all applications for this customer
4. Display current status and stage
```

---

## ⚠️ Breaking Changes

### 1. Customer Identification
- **OLD:** Identified by CNIC only
- **NEW:** Identified by `party_id` (database primary key)
- **Impact:** Must save `party_id` after login

### 2. Application Endpoints
- **OLD:** Different endpoint for each product type
- **NEW:** Single unified endpoint for all products
- **Impact:** Simplifies submission logic

### 3. Document Storage
- **OLD:** Backend API handled uploads
- **NEW:** Dedicated Document Server on port 8086
- **Impact:** Update upload URLs and port forwarding

### 4. Status Values
- **OLD:** `SUBMITTED_BY_SPU`, `SUBMITTED_TO_COPS`, etc.
- **NEW:** `submitted`, `eavmu_assigned`, `eavmu_approved`, `disbursed`, `rejected`
- **Impact:** Update status badge logic

### 5. Customer Types
- **OLD:** Various custom statuses
- **NEW:** `NTB` (New), `ETB` (Existing), `RETURNING`
- **Impact:** Update customer type checks

---

## 🚀 Priority Actions

**IMMEDIATE (Critical):**
1. ✅ Update API_ENDPOINTS in config.js
2. ✅ Update loginWithCNIC in api.js
3. ✅ Update port forwarding: `adb reverse tcp:8086 tcp:8086`

**HIGH (Required for functionality):**
4. ✅ Update submitApplication method
5. ✅ Update uploadDocument method
6. ✅ Update getMyApplications method

**MEDIUM (User experience):**
7. ✅ Update status display logic
8. ✅ Update error messages
9. ✅ Test all user flows

---

## 📝 Example: Complete Login Flow

**OLD Flow:**
```
1. User enters CNIC
2. POST /api/customer/login { cnic: "1234567890123" }
3. Backend checks custom customer table
4. Returns { success, customer, token }
5. App saves customer data
```

**NEW Flow (Backend V2.0):**
```
1. User enters CNIC
2. GET /api/v1/parties/cnic/1234567890123
3. Backend queries parties table
4. If found:
   - Returns party data
   - Check customer_type (ETB/NTB)
   - GET /api/v1/parties/1234567890123/latest-application
   - Returns latest application for auto-fill
5. If not found:
   - Return isNew: true, status: 'NTB'
   - User must create profile
6. App saves party_id, customer_type, latest application data
7. Navigate based on customer_type:
   - NTB → Document Upload (profile setup)
   - ETB/RETURNING → Home Screen
```

---

**Status:** 🔴 **URGENT - CUSTOMER APP NOT COMPATIBLE WITH BACKEND V2.0**

**The login error you're seeing is because the customer app is trying to call endpoints that don't exist!**

