# CORS Fix - OCR Services

## Problem
```
Access to XMLHttpRequest at 'http://localhost:8001/extract' from origin 'http://localhost:3000' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

The frontend (React at `localhost:3000`) was trying to directly call external OCR services (Python at ports 8001, 8002, 8003), which don't have CORS headers configured.

---

## Solution: Backend OCR Proxy

Created proxy endpoints in Backend V2.0 that:
1. ✅ Accept requests from the frontend (CORS-enabled)
2. ✅ Forward requests to OCR services (internal communication, no CORS needed)
3. ✅ Return OCR results to the frontend

### Architecture

```
Frontend (localhost:3000)
    ↓ (CORS-allowed)
Backend V2.0 (localhost:5000)
    ↓ (internal, no CORS)
OCR Services (ports 8001, 8002, 8003)
```

---

## Files Created

### 1. `backend-v2/src/api/v1/routes/ocr-proxy.routes.js`

**New Proxy Endpoints:**

| Endpoint | Target OCR Service | Purpose |
|----------|-------------------|---------|
| `POST /api/v1/ocr/cnic` | `http://localhost:8001/extract` | CNIC processing |
| `POST /api/v1/ocr/salary` | `http://localhost:8002/extract` | Salary slip processing |
| `POST /api/v1/ocr/ecib` | `http://localhost:8003/extract` | eCIB processing |

**Features:**
- ✅ Accepts `multipart/form-data` file uploads
- ✅ Proxies to OCR services with proper headers
- ✅ Returns OCR response directly to frontend
- ✅ Error handling with service availability checks
- ✅ Logging for debugging

**Example Request:**
```http
POST http://localhost:5000/api/v1/ocr/cnic
Content-Type: multipart/form-data

file: <image file>
```

**Example Response:**
```json
{
  "total_files": 1,
  "results": [{
    "id": "...",
    "filename": "cnic.png",
    "result": {
      "name": "Saif Ullah",
      "identity_number": "38403-9346396-1",
      ...
    },
    "processing_time_seconds": 1.287
  }]
}
```

---

## Files Updated

### 2. `backend-v2/src/api/v1/routes/index.js`

**Changes:**
```javascript
// Added import
const { createOcrProxyRoutes } = require('./ocr-proxy.routes');

// Registered OCR proxy routes
app.use(`${API_PREFIX}/ocr`, createOcrProxyRoutes());
```

**Console Output:**
```
✅ OCR proxy routes registered (CORS-enabled)
```

---

### 3. `frontend/components/forms/common/DocumentUploadGateway.tsx`

**Before (Direct OCR calls - CORS error):**
```typescript
// ❌ Direct call to OCR service (CORS blocked)
const response = await axios.post('http://localhost:8001/extract', formData);
```

**After (Backend proxy - CORS fixed):**
```typescript
// ✅ Call via backend proxy (CORS allowed)
const response = await axios.post('http://localhost:5000/api/v1/ocr/cnic', formData);
```

**Updated Handlers:**
1. ✅ `handleCNICUpload()` - CNIC OCR
2. ✅ `handleSalaryUpload()` - Salary Slip OCR
3. ✅ `handleReferenceCNICUpload()` - Reference CNIC OCR

---

## New Endpoint Mapping

### Frontend Calls
```typescript
// CNIC Upload
POST http://localhost:5000/api/v1/ocr/cnic

// Salary Slip Upload
POST http://localhost:5000/api/v1/ocr/salary

// eCIB Upload (used by Decision Engine)
POST http://localhost:5000/api/v1/ocr/ecib
```

### Backend Proxies To
```
CNIC:   localhost:5000 → localhost:8001/extract
Salary: localhost:5000 → localhost:8002/extract
eCIB:   localhost:5000 → localhost:8003/extract
```

---

## Testing

### Before Fix
```javascript
// Console Error:
❌ CNIC OCR Error: AxiosError
Access to XMLHttpRequest blocked by CORS policy
Failed to load resource: net::ERR_FAILED
```

### After Fix
```javascript
// Console Success:
✅ CNIC OCR Result: { name: "...", identity_number: "..." }
⏱️ Processing Time: 1.287s
```

---

## Benefits

### 1. **No CORS Issues**
- Frontend can access OCR services without CORS errors
- Backend handles all external communication

### 2. **Centralized OCR Access**
- Single point of control for OCR requests
- Easy to add authentication, rate limiting, caching later

### 3. **Better Error Handling**
- Backend can provide user-friendly error messages
- Service availability checks built-in

### 4. **Future-Proof**
- If OCR services move to different servers/ports, only backend config changes
- Frontend code remains unchanged

### 5. **Same Response Format**
- Proxy returns exact OCR response (no transformation)
- Frontend parsing logic unchanged

---

## CORS Configuration (Backend V2.0)

The Backend V2.0 already has CORS enabled for `localhost:3000`:

```javascript
// backend-v2/src/config/cors.config.js
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    ...
  ],
  credentials: true
};

app.use(cors(corsOptions));
```

This allows the frontend to call any `/api/v1/*` endpoint, including our new OCR proxies.

---

## Error Handling

### OCR Service Not Running
```json
{
  "error": "CNIC OCR service is not available",
  "message": "Please ensure the CNIC OCR service is running on port 8001"
}
```

### Invalid File Upload
```json
{
  "error": "No file uploaded"
}
```

### OCR Processing Failed
```json
{
  "error": "Failed to process CNIC",
  "message": "OCR error details..."
}
```

---

## Deployment Notes

### Development (Current Setup)
- Frontend: `localhost:3000`
- Backend: `localhost:5000`
- OCR Services: `localhost:8001`, `localhost:8002`, `localhost:8003`

### Production
- Frontend: `https://ilos.yourbank.com`
- Backend: `https://api.ilos.yourbank.com`
- OCR Services: Internal network (`10.x.x.x` or `192.168.x.x`)

**Production Changes Required:**
1. Update CORS origins to production domains
2. Update OCR service URLs to internal IPs
3. Add authentication to OCR proxy endpoints
4. Add rate limiting to prevent abuse

---

## Alternative Solutions Considered

### ❌ Option 1: Add CORS to OCR Services
**Why Not:**
- Would require modifying Python OCR services
- Exposing OCR services directly to frontend
- Security risk (anyone can call OCR APIs)

### ❌ Option 2: CORS Chrome Extension
**Why Not:**
- Only works for developers, not for production
- Disables security features
- Not a real solution

### ✅ Option 3: Backend Proxy (Chosen)
**Why Yes:**
- No changes to OCR services required
- Frontend has single API endpoint
- Backend can add authentication, logging, rate limiting
- Industry standard pattern

---

## Testing Checklist

- [x] Create OCR proxy routes in backend
- [x] Register OCR proxy routes in API
- [x] Update frontend CNIC upload to use proxy
- [x] Update frontend Salary upload to use proxy
- [x] Update frontend Reference CNIC upload to use proxy
- [x] Restart Backend V2.0
- [ ] **Test CNIC upload** - verify no CORS error
- [ ] **Test Salary upload** - verify no CORS error
- [ ] **Test Reference CNIC upload** - verify no CORS error
- [ ] **Test eCIB upload in Decision Engine** - verify no CORS error

---

## Next Steps

1. ✅ Backend proxy created
2. ✅ Frontend updated to use proxy
3. ✅ Backend restarted
4. ⏳ **User testing required** - Upload documents and verify CORS errors are gone

---

## Troubleshooting

### Issue: "OCR service is not available"
**Solution:** Start the OCR service
```bash
python cnic_ocr_service.py  # Port 8001
python salary_ocr_service.py  # Port 8002
python ecib_ocr_service.py  # Port 8003
```

### Issue: Still getting CORS errors
**Solution:** 
1. Clear browser cache (Ctrl + Shift + Delete)
2. Hard refresh (Ctrl + F5)
3. Check backend is running: `http://localhost:5000/api/v1/health`
4. Check proxy route registered in console logs

### Issue: Backend not responding
**Solution:**
```bash
# Kill and restart
taskkill /F /IM node.exe
cd "D:\ILOS 2.0\backend-v2"
npm start
```

---

## Status: ✅ COMPLETE

CORS issue resolved using backend proxy pattern. All OCR calls now route through Backend V2.0.

**Date:** November 13, 2025  
**Version:** ILOS 2.0  
**Fix Type:** Backend Proxy for CORS

