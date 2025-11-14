# Frontend Connection Guide

How to connect the existing Next.js frontend to Backend V2.0

---

## 🎯 Quick Connection

### Backend V2.0 (New)
- **URL:** `http://localhost:6000`
- **API Base:** `/api/v1`
- **CORS:** Already configured for `localhost:3000`

### Frontend (Existing)
- **Location:** `d:\ILOS 2.0\frontend`
- **Framework:** Next.js
- **Port:** `3000` (default)

---

## 🔧 Configuration Steps

### 1. Update Frontend API Base URL

**Option A: Environment Variable (Recommended)**

Create/Update `d:\ILOS 2.0\frontend\.env.local`:

```env
# Backend V2.0 API
NEXT_PUBLIC_API_URL=http://localhost:6000/api/v1

# Old backend (for comparison)
# NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

**Option B: Config File**

If frontend uses `lib/config.js` or similar:

```javascript
// frontend/lib/config.js
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6000/api/v1';
```

---

## 📡 API Endpoint Mapping

### Old Backend → New Backend V2.0

| Old Endpoint | New Endpoint V2.0 | Status |
|--------------|-------------------|--------|
| `/api/cashplus` | `/api/v1/applications` | ✅ Ready |
| `/api/applications` | `/api/v1/applications` | ✅ Ready |
| `/api/customer/:cnic` | `/api/v1/parties/cnic/:cnic` | ✅ Ready |
| `/api/dashboard/pb` | `/api/v1/dashboard/metrics` | ✅ Ready |
| `/health` | `/api/v1/health` | ✅ Ready |

---

## 🧪 Testing Connection

### 1. Start Backend V2.0

```bash
cd "d:\ILOS 2.0\backend-v2"
npm run dev
```

**Verify:** Backend runs on `http://localhost:6000`

### 2. Test API Endpoints

```bash
# Health check
curl http://localhost:6000/api/v1/health

# Expected: {"success": true, "status": "healthy"}
```

### 3. Start Frontend

```bash
cd "d:\ILOS 2.0\frontend"
npm run dev
```

**Verify:** Frontend runs on `http://localhost:3000`

### 4. Test from Browser Console

Open `http://localhost:3000` and run in browser console:

```javascript
// Test API connection
fetch('http://localhost:6000/api/v1/health')
  .then(r => r.json())
  .then(d => console.log('✅ Backend connected:', d))
  .catch(e => console.error('❌ Connection failed:', e));
```

---

## 🔄 API Client Implementation

### Create Unified API Client

**File:** `frontend/lib/api/client.js`

```javascript
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6000/api/v1';

class ApiClient {
  constructor(baseURL = API_BASE) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Parties (Customers)
  async getPartyByCnic(cnic) {
    return this.request(`/parties/cnic/${cnic}`);
  }

  async createParty(data) {
    return this.request('/parties', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Applications
  async createApplication(data) {
    return this.request('/applications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getApplication(losId) {
    return this.request(`/applications/${losId}`);
  }

  async submitApplication(losId) {
    return this.request(`/applications/${losId}/submit`, {
      method: 'POST',
    });
  }

  async getApplicationSummary(losId) {
    return this.request(`/applications/${losId}/summary`);
  }

  // Dashboard
  async getDashboardMetrics() {
    return this.request('/dashboard/metrics');
  }
}

export const apiClient = new ApiClient();
export default apiClient;
```

---

## 📝 Usage Examples

### In React Components

```javascript
import { apiClient } from '@/lib/api/client';

// Get customer by CNIC
const customer = await apiClient.getPartyByCnic('1234567890123');

// Create application
const application = await apiClient.createApplication({
  party_id: customer.data.party_id,
  product_id: 1,
  product_code: 'CASHPLUS',
  requested_amount: 500000,
  tenure_months: 36,
});

// Submit application
const result = await apiClient.submitApplication(application.data.los_id);
```

### In Server-Side (getServerSideProps)

```javascript
export async function getServerSideProps(context) {
  const metrics = await apiClient.getDashboardMetrics();
  
  return {
    props: { metrics: metrics.data }
  };
}
```

---

## 🔐 Authentication Integration

### Add JWT Token Support

```javascript
class ApiClient {
  setToken(token) {
    this.token = token;
  }

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    // ... rest of implementation
  }
}
```

### Usage with Auth

```javascript
// After login
const { token } = await login(credentials);
apiClient.setToken(token);

// All subsequent requests will include token
```

---

## 🐛 Troubleshooting

### Issue: CORS Error

**Symptoms:**
```
Access to fetch at 'http://localhost:6000' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

**Solution:**
Backend V2.0 already has CORS configured. If issue persists:

```javascript
// backend-v2/src/app.js - verify this exists:
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));
```

### Issue: Connection Refused

**Symptoms:**
```
Failed to fetch
net::ERR_CONNECTION_REFUSED
```

**Solutions:**
1. Ensure backend is running: `cd backend-v2 && npm run dev`
2. Check port 6000 is free: `netstat -ano | findstr :6000`
3. Verify firewall allows connections

### Issue: 404 Not Found

**Symptoms:**
```
GET http://localhost:6000/api/applications 404 (Not Found)
```

**Solution:**
Update endpoint to V2 format: `/api/v1/applications`

---

## 🔄 Migration Checklist

- [ ] Backend V2.0 running on port 6000
- [ ] Frontend `.env.local` updated with new API URL
- [ ] API client created (`frontend/lib/api/client.js`)
- [ ] Test connection with health endpoint
- [ ] Update all API calls to use new client
- [ ] Test key workflows (create customer, create app, submit)
- [ ] Verify CORS working
- [ ] Test error handling

---

## 📊 Monitoring Connection

### Check Backend Logs

Backend V2.0 logs all requests:

```
[GET] /api/v1/health - 200 (1ms)
[POST] /api/v1/applications - 201 (15ms)
```

### Network Tab Inspection

In browser DevTools → Network:
- Verify requests go to `localhost:6000`
- Check response status codes
- Inspect request/response payloads

---

## 🚀 Next Steps

1. **Start both servers:**
   ```bash
   # Terminal 1 - Backend V2.0
   cd "d:\ILOS 2.0\backend-v2"
   npm run dev
   
   # Terminal 2 - Frontend
   cd "d:\ILOS 2.0\frontend"
   npm run dev
   ```

2. **Open browser:** `http://localhost:3000`

3. **Test key features:**
   - Customer lookup (CNIC search)
   - Application creation
   - Form submission
   - Dashboard metrics

4. **Monitor logs** in both terminals

---

## 📞 Support

- **Backend logs:** Check Terminal 1
- **Frontend logs:** Check Terminal 2 + Browser Console
- **API docs:** `http://localhost:6000/api/v1` (root endpoint)
- **Health check:** `http://localhost:6000/api/v1/health`

---

**Both servers must run simultaneously for full functionality** 🚀

