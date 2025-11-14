# Dashboard Update Implementation Guide
## Systematic Frontend → Backend V2.0 Migration

---

## ✅ **COMPLETED:**
1. ✅ `frontend/app/dashboard/documents/page.tsx` - Updated
2. ✅ `frontend/app/dashboard/pb/applications/page.tsx` - Updated
3. ✅ `frontend/app/dashboard/applicant/cashplus/page.tsx` - Updated
4. ✅ `frontend/lib/apiHelpers.ts` - Created (universal helper)
5. ✅ `frontend/lib/apiV2Helpers.ts` - Created (form submission)
6. ✅ `frontend/app/dashboard/spu/page.tsx` - Partially Updated

---

## 🔄 **REMAINING DASHBOARDS TO UPDATE:**

### **Pattern to Follow for Each Dashboard:**

```typescript
// 1. ADD IMPORT at top of file
import { getApplicationsByDepartment, getApplicationForm, extractPaginatedData } from "@/lib/apiHelpers"

// 2. UPDATE FETCH APPLICATIONS
// OLD:
const response = await fetch(`/api/applications/department/XXX`)
const data = await response.json()
setApplications(data || data.applications)

// NEW:
const result = await getApplicationsByDepartment('XXX', page, pageSize)
const apps = extractPaginatedData(result)
setApplications(apps)
setTotalApplications(result.total || apps.length)

// 3. UPDATE FORM FETCH
// OLD:
const response = await fetch(`/api/applications/form/${losId}`)
const data = await response.json()

// NEW:
const data = await getApplicationForm(losId)

// 4. UPDATE FIELD ACCESS
// OLD:
app.applicant_name
app.los_id

// NEW (handles both formats):
(app.applicantName || app.applicant_name || '')
(app.id || `LOS-${app.los_id}` || '')
```

---

## 📋 **SPECIFIC FILES TO UPDATE:**

### 1. **EAVMU Officer Dashboard**
**File:** `frontend/app/dashboard/eamvu_officer/page.tsx`

**Changes Needed:**
```typescript
// Line ~50-80: Add import
import { getApplicationsByDepartment, getApplicationForm, extractPaginatedData } from "@/lib/apiHelpers"

// Find: fetch('/api/applications/department/EAMVU_OFFICER')
// Replace with:
const result = await getApplicationsByDepartment('EAMVU_OFFICER', page, pageSize)
const apps = extractPaginatedData(result)
setApplications(apps)

// Find all: fetch('/api/applications/form/...')
// Replace with: getApplicationForm(losId)
```

---

### 2. **CIU Dashboard**
**File:** `frontend/app/dashboard/ciu/page.tsx`

**Changes Needed:**
```typescript
// Add import
import { getApplicationsByDepartment, getApplicationForm, extractPaginatedData } from "@/lib/apiHelpers"

// Find: fetch('/api/applications/department/CIU')
// Replace with:
const result = await getApplicationsByDepartment('CIU', page, pageSize)
const apps = extractPaginatedData(result)
setApplications(apps)
```

---

### 3. **COPS Dashboard**
**File:** `frontend/app/dashboard/cops/page.tsx`

**Changes Needed:**
```typescript
// Add import
import { getApplicationsByDepartment, getApplicationForm, extractPaginatedData } from "@/lib/apiHelpers"

// Find: fetch('/api/applications/department/COPS')
// Replace with:
const result = await getApplicationsByDepartment('COPS', page, pageSize)
const apps = extractPaginatedData(result)
setApplications(apps)
```

---

### 4. **EAMVU Dashboard**
**File:** `frontend/app/dashboard/eamvu/page.tsx`

**Changes Needed:**
```typescript
// Add import
import { getApplicationsByDepartment, getApplicationForm, extractPaginatedData } from "@/lib/apiHelpers"

// Find: fetch('/api/applications/department/EAMVU')
// Replace with:
const result = await getApplicationsByDepartment('EAMVU', page, pageSize)
const apps = extractPaginatedData(result)
setApplications(apps)
```

---

### 5. **Risk Dashboard**
**File:** `frontend/app/dashboard/risk/page.tsx`

**Changes Needed:**
```typescript
// Add import
import { getApplicationsByDepartment, getApplicationForm, extractPaginatedData } from "@/lib/apiHelpers"

// Find: fetch('/api/applications/department/RISK')
// Replace with:
const result = await getApplicationsByDepartment('RISK', page, pageSize)
const apps = extractPaginatedData(result)
setApplications(apps)
```

---

### 6. **Compliance Dashboard**
**File:** `frontend/app/dashboard/compliance/page.tsx`

**Changes Needed:**
```typescript
// Add import
import { getApplicationsByDepartment, getApplicationForm, extractPaginatedData } from "@/lib/apiHelpers"

// Find: fetch('/api/applications/department/COMPLIANCE')
// Replace with:
const result = await getApplicationsByDepartment('COMPLIANCE', page, pageSize)
const apps = extractPaginatedData(result)
setApplications(apps)
```

---

## 🔍 **FIELD NAME FIXES:**

In ALL dashboard files, replace field access patterns:

### **Search & Replace Patterns:**

1. **Application Name:**
   - Find: `app.applicant_name`
   - Replace: `(app.applicantName || app.applicant_name || '')`

2. **LOS ID:**
   - Find: `app.los_id.replace('LOS-', '')`
   - Replace: `(app.id || `LOS-${app.los_id}`).replace('LOS-', '')`

3. **Product Type:**
   - Find: `app.application_type`
   - Replace: `(app.productType || app.product_type || app.application_type || '')`

4. **CNIC:**
   - Find: `app.applicant_cnic`
   - Replace: `(app.cnic || app.applicant_cnic || '')`

5. **Dates:**
   - Find: `app.submitted_at`
   - Replace: `(app.submittedAt || app.submitted_at || '')`
   - Find: `app.updated_at`
   - Replace: `(app.updatedAt || app.updated_at || '')`

---

## 🎯 **AUTOMATED UPDATE SCRIPT:**

You can use VS Code's "Search & Replace in Files" to batch update:

1. **Search in files:** `/api/applications/department/([A-Z_]+)`
2. **Replace with:** 
   ```
   getApplicationsByDepartment('$1', page, pageSize)
   ```

3. **Then add import at top of each changed file.**

---

## ✅ **TESTING CHECKLIST:**

After updating each dashboard:

- [ ] Dashboard loads without errors
- [ ] Applications list displays correctly
- [ ] Search/filter works
- [ ] Clicking on application opens details
- [ ] Status updates work
- [ ] Workflow actions work
- [ ] Document viewing works

---

## 📊 **PROGRESS TRACKER:**

| Dashboard | Status | Last Updated |
|-----------|--------|--------------|
| Documents | ✅ Complete | Nov 10 |
| PB Applications | ✅ Complete | Nov 10 |
| CashPlus Form | ✅ Complete | Nov 10 |
| SPU | 🔄 In Progress | Nov 10 |
| EAVMU Officer | ⏳ Pending | - |
| CIU | ⏳ Pending | - |
| COPS | ⏳ Pending | - |
| EAMVU | ⏳ Pending | - |
| Risk | ⏳ Pending | - |
| Compliance | ⏳ Pending | - |

---

## 🚨 **COMMON ERRORS & FIXES:**

### Error: `Cannot read properties of undefined (reading 'toLowerCase')`
**Fix:** Add null checks:
```typescript
(app.applicantName || '').toLowerCase()
```

### Error: `data.filter is not a function`
**Fix:** Extract data properly:
```typescript
const apps = extractPaginatedData(result)
```

### Error: `404 Not Found` for `/api/applications/department/xxx`
**Fix:** Add `/v1/` to path:
```typescript
'/api/v1/applications/department/XXX/paginated'
```

---

**Last Updated:** November 10, 2025  
**Next Step:** Update remaining dashboards one by one and test each

