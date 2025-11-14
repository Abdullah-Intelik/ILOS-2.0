# Customer Name "Unknown" - Final Debug Instructions

## ✅ Changes Applied:

### 1. **Enhanced Frontend Logging** (`documents/page.tsx`)
Added comprehensive debugging that will show:
- All backend field names
- Which name field is being used
- Why it's falling back to "Unknown"

### 2. **Improved PDF Design** (`pdf.service.js`)
- Professional form-style layout
- Colored section headers
- Alternating row shading
- Better typography

---

## 🔍 **How to Debug the Name Issue:**

### **Step 1: Refresh the Documents Page**
1. Go to: `http://localhost:3000/dashboard/documents`
2. Open Browser Console (F12)
3. It should auto-select LOS-59

### **Step 2: Check Console Logs**
Look for this log:
```
📋 Raw appData from backend: {
  customer_name: ???,
  first_name: ???,
  last_name: ???,
  name: ???,
  cnic: "3840393463961",
  ALL_KEYS: [...]
}
```

**If ALL are `null` or empty:**
- ❌ The `parties` table doesn't have name data for this customer
- ✅ **FIX:** The form submission isn't saving first_name/last_name to the parties table

**If `customer_name` exists:**
- ❌ Frontend isn't using it correctly
- ✅ Check the next log: "✅ Name from customer_name: XYZ"

---

## 🎯 **Most Likely Issue:**

The `parties` table for LOS-59 has **NULL** first_name and last_name.

### **Why?**
During form submission, the transformer might not be passing `first_name` and `last_name` to the party creation/update.

### **Quick Fix:**
Check the form submission transformer:
- File: `frontend/lib/apiV2Helpers.ts`
- Function: `transformCashPlusFormToV2`
- Ensure it includes:
  ```typescript
  party_data: {
    first_name: formData.firstName,
    last_name: formData.lastName,
    // ...
  }
  ```

---

## 📋 **Test New Application:**

**Option A: Submit LOS-60 with name**
1. Go to New Application
2. Fill form (ensure name fields are filled)
3. Submit
4. Go to Documents page
5. Check if name appears

**Option B: Manually fix LOS-59**
Run this SQL (if you have access):
```sql
UPDATE parties 
SET first_name = 'Ahmed', last_name = 'Khan'
WHERE party_id = (SELECT party_id FROM applications WHERE los_id = 59);
```

---

## 🎨 **PDF Improvements:**

The new PDF has:
- ✅ Professional bank-style header with logo area
- ✅ Colored section headers (teal)
- ✅ Form-style table layout
- ✅ Alternating row shading for readability
- ✅ Better spacing and typography

To see the improved PDF:
1. Submit a **new** application (LOS-60)
2. Go to Documents page
3. Click "View" on `60-Application_Form_Physical_Copy.pdf`

---

## 🔧 **Next Steps:**

1. **Check browser console** for the detailed logs
2. **Copy the log output** and share it
3. I'll tell you exactly what's wrong and how to fix it

**Backend:** ✅ Restarted with enhanced debugging  
**Frontend:** ✅ Updated with comprehensive logging  
**Action:** Open browser console and refresh Documents page

