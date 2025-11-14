# 🔄 Frontend Restart Instructions

## ⚠️ Issue: Webpack Cache

The frontend is still using **old cached code** even after browser refresh. This is because:
- Webpack dev server is caching the compiled JavaScript
- Browser refresh only reloads HTML, not recompiled JS
- Need to restart the dev server to force recompilation

---

## ✅ Solution: Restart Frontend Dev Server

### **Step 1: Stop Frontend**
In the terminal where frontend is running:
```bash
# Press Ctrl+C to stop
```

### **Step 2: Start Frontend Again**
```bash
cd "d:\ILOS 2.0\frontend"
npm run dev
```

### **Step 3: Wait for Compilation**
Wait until you see:
```
✓ Compiled successfully
○ Local: http://localhost:3000
```

### **Step 4: Refresh Browser**
```
Press F5 (not Ctrl+Shift+R this time)
```

---

## 🧪 What Should Happen After Restart

1. **Browser Console Should Show:**
   ```
   🔍 RAW formDataWithTypes: { amount_requested: 500000, tenure: 2, ... }
   📤 Submitting to Backend V2.0: { requested_amount: 500000, ... }
   ```

2. **Backend Console Should Show:**
   ```
   📤 Creating application for product: CASHPLUS
   ✅ Application created: LOS-1
   ✅ Product_personal_loan record created
   ```

3. **Frontend Should Show:**
   ```
   ✅ Success! Your Cashplus application has been submitted successfully.
   ```

---

## 🔍 Debug Checklist

If it still shows "Amount 0" after restart:

1. **Check Browser Console** - Look for the debug log:
   ```
   🔍 RAW formDataWithTypes: { ... }
   ```
   - If `amount_requested: 0` → Form didn't capture the value
   - If `amount_requested: 500000` → Transformer is working, check backend

2. **Check Network Tab** - Look at the request payload:
   ```
   POST /api/v1/applications
   Payload: { requested_amount: 500000, ... }
   ```

3. **Check Backend Logs** - Should show the amount received

---

## 💡 Alternative: Close Browser & Reopen

If webpack restart doesn't work:
1. **Close all browser tabs** for localhost:3000
2. **Close browser completely**
3. **Restart frontend dev server**
4. **Open fresh browser window**
5. **Navigate to** http://localhost:3000

This ensures no browser cache interference.

---

## 📞 If Still Not Working

The frontend transformer in `apiV2Helpers.ts` has been updated to handle:
- `amount_requested` (snake_case) ← Your form uses this
- `amountRequested` (camelCase)
- `requestedAmount` (alternative)

But webpack needs to recompile this file and serve it to the browser.

**Last Resort:**
```bash
# Delete node_modules/.cache
cd "d:\ILOS 2.0\frontend"
rm -r node_modules/.cache
npm run dev
```

This forces webpack to rebuild from scratch.

