# 🔧 Quick Fix Steps - CIU Dashboard Not Working

## ✅ Status Check

- ✅ Backend V2.0 is running on port 5000
- ✅ Code changes are saved correctly
- ❌ Frontend is still calling :3000 instead of :5000

---

## 🚀 **Solution: Restart Next.js**

### **Option 1: Hard Refresh (Quickest)**

1. Go to your browser
2. Press **`Ctrl+Shift+R`** (or `Cmd+Shift+R` on Mac)
3. Wait for page to reload
4. Press **`Ctrl+Shift+R`** again
5. Check console for: `🔍 CIU: Fetching from: http://localhost:5000/api/v1/...`

---

### **Option 2: Full Restart (If Option 1 doesn't work)**

1. **Stop Frontend:**
   - Go to terminal running `npm run dev`
   - Press `Ctrl+C`
   - Wait for "Gracefully stopping" message

2. **Clear Cache (Optional):**
   ```bash
   cd "d:\ILOS 2.0\frontend"
   Remove-Item -Recurse -Force .next
   ```

3. **Restart Frontend:**
   ```bash
   npm run dev
   ```

4. **Wait for:**
   ```
   ✓ Ready in X.Xs
   ```

5. **Open Browser:**
   - Go to `localhost:3000/dashboard/ciu`
   - Hard refresh (`Ctrl+Shift+R`)

---

## 🧪 **How to Verify It's Working**

### **1. Check Browser Console (F12):**

✅ **Should See:**
```
🔍 CIU: Fetching from: http://localhost:5000/api/v1/applications/department/CIU/paginated
✅ CIU Applications fetched: Object
```

❌ **Should NOT See:**
```
Failed to load resource: .../:3000/api/v1/... 404
```

### **2. Check Network Tab:**

✅ **Should See:**
- Requests to `localhost:5000/api/v1/...`
- Status: **200 OK**

❌ **Should NOT See:**
- Requests to `localhost:3000/api/v1/...`
- Status: **404 Not Found**

### **3. Check Dashboard:**

✅ **Should See:**
- Applications list with 2 items (LOS-51, LOS-36)
- "Investigation Queue (2)" at the top
- No "Failed to connect" error

---

## 🐛 **If Still Not Working**

### **Check Backend:**
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/v1/applications/department/CIU/paginated?page=1&pageSize=10"
```

✅ **Should return:**
```json
{
  "success": true,
  "data": [ ... ],
  "total": 2
}
```

### **Check Frontend Environment:**
```powershell
cd "d:\ILOS 2.0\frontend"
Get-Content .env.local
```

✅ **Should have:**
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**If file doesn't exist, create it:**
```powershell
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" | Out-File -FilePath ".env.local" -Encoding utf8
```

Then restart Next.js!

---

## 📊 **Expected Result**

After following these steps, you should see:

✅ CIU Dashboard loads with applications  
✅ Clicking "View" opens application details  
✅ All data displays correctly  
✅ No 404 errors in console  

---

## 🆘 **Still Having Issues?**

1. **Kill all Node processes:**
   ```powershell
   taskkill /F /IM node.exe
   ```

2. **Start Backend:**
   ```bash
   cd "d:\ILOS 2.0\backend-v2"
   node src/app.js
   ```

3. **Start Frontend (new terminal):**
   ```bash
   cd "d:\ILOS 2.0\frontend"
   npm run dev
   ```

4. **Hard refresh browser 3 times**

---

**This should fix the CIU dashboard!** 🎉

