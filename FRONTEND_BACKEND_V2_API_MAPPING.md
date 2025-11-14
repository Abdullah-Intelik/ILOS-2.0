# Frontend ↔ Backend V2.0 API Mapping & Fixes

## 📋 Backend V2.0 Available Endpoints

### ✅ **Applications API** (`/api/v1/applications`)
| Method | Endpoint | Description | Response Format |
|--------|----------|-------------|-----------------|
| GET | `/department/:department/paginated?page=1&pageSize=10` | Get applications by department (paginated) | `{ success, data: [...], total, page, pageSize }` |
| GET | `/form/:losId` | Get application form (legacy format) | `{ ...formData }` |
| GET | `/:losId` | Get application by LOS ID | `{ success, data: {...} }` |
| GET | `/:losId/summary` | Get application summary | `{ success, data: {...} }` |
| POST | `/` | Create new application | `{ success, data: { los_id, application_id, party_id } }` |
| POST | `/:losId/submit` | Submit application | `{ success, message, data }` |
| PATCH | `/:losId/status` | Update application status | `{ success, message, data }` |
| GET | `/party/:partyId` | Get applications by party | `{ success, count, applications: [...] }` |
| GET | `/status/:status` | Get applications by status | `{ success, count, applications: [...] }` |
| GET | `/assigned` | Get assigned applications | `{ success, applications: [...] }` |

### ✅ **Parties API** (`/api/v1/parties`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/:partyId` | Get party by ID |
| GET | `/cnic/:cnic` | Get party by CNIC |
| POST | `/` | Create new party |
| PUT | `/:partyId` | Update party |

### ✅ **Products API** (`/api/v1/products`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all products |
| GET | `/:productCode` | Get product by code |
| POST | `/validate` | Validate product eligibility |

### ✅ **Dashboard API** (`/api/v1/dashboard`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/metrics` | Get dashboard metrics |
| GET | `/workflow-funnel` | Get workflow funnel data |

### ✅ **Legacy Routes** (No `/api/v1` prefix)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/customer-status/:cnic` | Check customer status (CBS) |
| GET | `/api/getNTB_ETB/:cnic` | Get NTB/ETB status |
| GET | `/cif/:customerId` | Get CIF details |
| POST | `/api/decision/upload-ecib` | Upload eCIB PDF for OCR |
| POST | `/api/decision/upload-cnic` | Upload CNIC for OCR |
| POST | `/api/decision/upload-salary-slip` | Upload salary slip for OCR |

---

## 🔧 **Field Name Mappings (Backend V2.0 vs Old Backend)**

### Response Field Differences:

| Old Backend (snake_case) | Backend V2.0 (camelCase) | Type |
|--------------------------|--------------------------|------|
| `applicant_name` | `applicantName` | String |
| `applicant_cnic` | `cnic` | String |
| `los_id` | `los_id` (number) + `id` (string "LOS-XX") | Number/String |
| `application_type` | `productType` | String |
| `product_type` | `productType` | String |
| `application_id` | `application_id` | Number |
| `current_stage` | `current_stage` | String |
| `submitted_at` | `submittedAt` | Timestamp |
| `updated_at` | `updatedAt` | Timestamp |

### Paginated Response Structure:

**Old Backend:**
```json
[
  { "los_id": "LOS-40", "applicant_name": "Ahmed", ... },
  { "los_id": "LOS-39", "applicant_name": "Sara", ... }
]
```

**Backend V2.0:**
```json
{
  "success": true,
  "data": [
    { "id": "LOS-40", "los_id": 40, "applicantName": "Ahmed", ... },
    { "id": "LOS-39", "los_id": 39, "applicantName": "Sara", ... }
  ],
  "total": 10,
  "page": 1,
  "pageSize": 10
}
```

---

## 🛠️ **Required Frontend Changes**

### 1. **Update All Paginated Calls**

**Before:**
```typescript
const response = await fetch('/api/applications/department/pb');
const data = await response.json(); // Array directly
```

**After:**
```typescript
const response = await fetch('/api/v1/applications/department/PB/paginated?page=1&limit=100');
const result = await response.json();
const data = result.data || []; // Extract from result.data
```

### 2. **Update Field Access**

**Before:**
```typescript
app.applicant_name.toLowerCase()
app.los_id.toLowerCase()
```

**After:**
```typescript
(app.applicantName || app.applicant_name || '').toLowerCase()
(app.id || `LOS-${app.los_id}` || '').toLowerCase()
```

### 3. **Update Form Submission**

**Before:**
```typescript
const response = await fetch('/api/cashplus', {
  method: 'POST',
  body: JSON.stringify(formData)
});
```

**After:**
```typescript
import { transformCashPlusFormToV2, createApplicationV2 } from '@/lib/apiV2Helpers';

const v2Data = transformCashPlusFormToV2(formData, customerData);
const result = await createApplicationV2(v2Data);
// result = { success: true, data: { los_id, application_id, party_id } }
```

---

## 📁 **Files That Need Updates**

### ✅ **Already Fixed:**
- ✅ `frontend/app/dashboard/documents/page.tsx` - Updated to use `/api/v1/applications/department/PB/paginated`
- ✅ `frontend/app/dashboard/applicant/cashplus/page.tsx` - Updated to use `apiV2Helpers`
- ✅ `frontend/app/dashboard/pb/applications/page.tsx` - Updated to use `/api/v1/...`

### ⚠️ **Need to Update:**
- ❌ `frontend/app/dashboard/spu/page.tsx`
- ❌ `frontend/app/dashboard/eamvu_officer/page.tsx`
- ❌ `frontend/app/dashboard/ciu/page.tsx`
- ❌ `frontend/app/dashboard/cops/page.tsx`
- ❌ `frontend/app/dashboard/eamvu/page.tsx`
- ❌ `frontend/app/dashboard/risk/page.tsx`
- ❌ `frontend/app/dashboard/compliance/page.tsx`
- ❌ `frontend/contexts/CustomerContext.tsx` (might need updates for CIF data)
- ❌ All other product pages (AutoLoan, CreditCard, etc.)

---

## 🎯 **Universal Frontend Helper (apiHelpers.ts)**

Create a universal helper to handle all API calls consistently:

```typescript
// frontend/lib/apiHelpers.ts

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: any;
}

/**
 * Get applications by department (paginated)
 */
export async function getApplicationsByDepartment(
  department: string,
  page: number = 1,
  pageSize: number = 50
): Promise<PaginatedResponse<any>> {
  const response = await fetch(
    `${API_BASE}/api/v1/applications/department/${department}/paginated?page=${page}&pageSize=${pageSize}`
  );
  const result = await response.json();
  return result;
}

/**
 * Get application form data
 */
export async function getApplicationForm(losId: number | string): Promise<any> {
  const response = await fetch(`${API_BASE}/api/v1/applications/form/${losId}`);
  return await response.json();
}

/**
 * Normalize application data (handles both V1 and V2 formats)
 */
export function normalizeApplicationData(app: any) {
  return {
    id: app.id || `LOS-${app.los_id}`,
    losId: app.los_id,
    applicantName: app.applicantName || app.applicant_name || '',
    cnic: app.cnic || app.applicant_cnic || '',
    productType: app.productType || app.product_type || app.application_type || '',
    product: app.product || '',
    productCode: app.productCode || app.product_code || '',
    amount: app.amount || app.requested_amount || '',
    tenure: app.tenure || app.tenure_months || '',
    status: app.status || '',
    currentStage: app.current_stage || app.currentStage || '',
    submittedAt: app.submittedAt || app.submitted_at || '',
    updatedAt: app.updatedAt || app.updated_at || ''
  };
}
```

---

## 🚀 **Implementation Plan**

### Phase 1: Core Fixes (DONE ✅)
- ✅ Fix Documents page pagination
- ✅ Fix PB Applications page
- ✅ Fix CashPlus form submission
- ✅ Fix field name mappings

### Phase 2: Dashboard Pages (TO DO)
1. Create universal `apiHelpers.ts`
2. Update all department dashboards (SPU, EAVMU, CIU, COPS, etc.)
3. Test each dashboard

### Phase 3: Other Product Forms (TO DO)
1. Update AutoLoan form
2. Update Credit Card forms
3. Update SME Asaan form
4. Update Ameen Drive form

### Phase 4: Context & Utilities (TO DO)
1. Update CustomerContext
2. Update any remaining API utilities

---

## 📌 **Testing Checklist**

- [ ] Documents page loads and filters work
- [ ] PB Applications page loads
- [ ] CashPlus form submits successfully
- [ ] All department dashboards load applications
- [ ] Application details display correctly
- [ ] Status updates work
- [ ] Workflow progression works
- [ ] All product forms submit correctly

---

**Last Updated:** November 10, 2025  
**Status:** Phase 1 Complete ✅ | Phase 2 In Progress 🔄

