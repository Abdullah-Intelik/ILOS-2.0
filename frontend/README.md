# ILOS Frontend

## Deployment Instructions

### Local Development

1. Install dependencies:
```bash
npm install
# or
pnpm install
```

2. Create `.env.local` file with:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=ILOS
NEXT_PUBLIC_ENVIRONMENT=development
```

3. Run the development server:
```bash
npm run dev
# or
pnpm dev
```

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables:
   - `NEXT_PUBLIC_API_URL` = your backend URL
   - `NEXT_PUBLIC_APP_NAME` = ILOS
   - `NEXT_PUBLIC_ENVIRONMENT` = production

See `DEPLOYMENT-GUIDE.md` for detailed instructions.

## Features

- Customer lookup by CNIC
- ETB/NTB customer detection
- Multiple loan application types
- Form validation and submission
- Dashboard with multiple modules

## Integration with Backend

The frontend connects to the ILOS backend API for:
- Customer lookup
- Form submissions
- Data retrieval

For full deployment instructions of both frontend and backend, see `COMPLETE-DEPLOYMENT-GUIDE.md` in the root directory.
