# ILOS Frontend Deployment Instructions

## Features
✅ **Dual Backend Support**: Automatically works with both local and deployed backends  
✅ **Smart Fallback**: If local backend fails, automatically switches to deployed backend  
✅ **Environment Detection**: Uses appropriate backend based on deployment environment  
✅ **Comprehensive CIF Integration**: Auto-fills forms from both backend response formats  

## Quick Deploy to Vercel

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy from Project Root
```bash
cd ILOS-frontend
vercel --prod
```

### 4. Set Environment Variables (Optional)
In your Vercel dashboard:
- Go to Project Settings → Environment Variables
- Add: `NEXT_PUBLIC_API_URL` = `https://ilos-backend.vercel.app`

## Backend Compatibility

### Local Development
- **Primary**: `http://localhost:5000` (your local backend)
- **Fallback**: `https://ilos-backend.vercel.app` (deployed backend)

### Production Deployment
- **Primary**: `https://ilos-backend.vercel.app` (deployed backend)
- **Fallback**: None (production environment)

## API Endpoints Support

### Customer Status Check
- **Local**: `/customer-status/{cnic}` 
- **Deployed**: `/api/getNTB_ETB/{cnic}`

### CIF Details
- **Local**: `/cif/{customerId}`
- **Deployed**: `/api/cif/details/{customerId}`

## Auto-fill Data Mapping

### Local Backend (Full CIF Structure)
- Personal Details: From `individualInfo`, `fullname`, `phone`, `email` 
- Address: From `postal`, `city`, `district`, `domicileState`
- Employment: From `business`, `industry`, `occupation_code`
- Banking: From `clientBanks` (bank_name, branch, actt_no)
- References: From `relationship` (relate_customer_name, relationship_type)

### Deployed Backend (Legacy Structure)  
- Personal Details: From `customer` object direct fields
- Address: From `customer.residentialAddress`
- Employment: From `customer.profession`, `customer.income`
- Banking: From `customer.bankName`, `customer.branchName`
- References: From `customer.referenceContact1/2`, `customer.nextOfKin*`

## Test CNICs

### ETB (Existing) Customers
- `15402-8687203-9` → ABID ALI (Customer ID: 31027686)
- `42101-8532129-8` → MUHAMMAD AHMED KHAN (Customer ID: 31027687)
- `42202-9876543-2` → FATIMA BIBI (Customer ID: 31027688)

### NTB (New) Customers  
- Any other 13-digit CNIC will be treated as new customer

## Deployment Commands

```bash
# Install dependencies
npm install

# Local development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Deploy to Vercel
vercel --prod
```

## Troubleshooting

### Backend Connection Issues
1. Check browser console for API call logs
2. Verify backend is running on correct port
3. Check CORS settings if cross-origin issues

### Auto-fill Not Working
1. Ensure CNIC format is correct (13 digits)
2. Check if customer exists in CIF database
3. Verify console logs for API responses

### Deployment Issues
1. Ensure all environment variables are set
2. Check build logs for any compilation errors
3. Verify API endpoints are accessible from deployed environment

## Environment Variables

```bash
# Optional - will auto-detect if not provided
NEXT_PUBLIC_API_URL=https://ilos-backend.vercel.app

# For local development (optional)
NEXT_PUBLIC_API_URL=http://localhost:5000
``` 