# ILOS V2.0 - Setup Guide

## Quick Start (5 Minutes)

### 1. Install Dependencies
```bash
cd "d:\ILOS 2.0\backend-v2"
npm install
```

### 2. Create Database
```bash
# Windows PowerShell
cd database\scripts
# Edit setup-database.sh if needed, or use psql directly:

psql -U postgres
CREATE DATABASE ilos_v2_demo;
\c ilos_v2_demo

# Run migrations
\i migrations/01-global-sequence.sql
\i migrations/02-core-tables.sql
\i migrations/03-product-tables.sql
\i migrations/04-workflow-tables.sql
\i migrations/05-supporting-tables.sql
\i migrations/06-system-tables.sql
\i migrations/07-indexes.sql
\i migrations/08-views.sql
```

### 3. Configure Environment
The `.env` file is already created with password "faez". Verify:
```bash
# Check .env file
cat .env

# Should show:
# BANK_CODE=demo
# DB_NAME=ilos_v2_demo
# DB_PASSWORD=faez
```

### 4. Start Server
```bash
npm run dev
```

Server will start at: **http://localhost:6000**

## Testing the API

### Health Check
```bash
curl http://localhost:6000/api/v1/health
```

### Create a Party (Customer)
```bash
curl -X POST http://localhost:6000/api/v1/parties \
  -H "Content-Type: application/json" \
  -d '{
    "cnic": "1234512345671",
    "first_name": "Ahmed",
    "last_name": "Khan",
    "date_of_birth": "1990-01-15",
    "gender": "M",
    "mobile": "03001234567",
    "email": "ahmed@example.com",
    "residential_address": "House 123, Street 1, Karachi",
    "city": "Karachi",
    "customer_type": "ETB",
    "monthly_income": 75000,
    "employment_type": "Salaried",
    "employer_name": "ABC Company"
  }'
```

### Create an Application
```bash
curl -X POST http://localhost:6000/api/v1/applications \
  -H "Content-Type: application/json" \
  -d '{
    "party_id": 1,
    "product_id": 1,
    "product_code": "CASHPLUS",
    "purpose": "Home Renovation",
    "requested_amount": 500000,
    "tenure_months": 36,
    "monthly_income": 75000,
    "customer_type": "ETB"
  }'
```

### Get Dashboard Metrics
```bash
curl http://localhost:6000/api/v1/dashboard/metrics
```

## Database Schema

### Tables Created (27 total)
- ✅ **Core (6):** parties, party_details, products, applications, users, audit_log
- ✅ **Products (4):** product_personal_loan, product_auto_loan, product_credit_card, product_islamic_finance
- ✅ **Workflow (5):** application_workflow, spu_checks, eavmu_verifications, ciu_decisions, disbursements
- ✅ **Supporting (8):** application_references, application_exposure, application_documents, eamvu_agents, agent_assignments, notifications, system_alerts, system_config
- ✅ **System (4):** automation_queue, automation_log, decision_engine_results, application_hash

### Views Created (4)
- `v_application_summary` - Complete application details
- `v_dashboard_metrics` - Real-time metrics
- `v_agent_performance` - EAVMU agent stats
- `v_workflow_funnel` - Conversion analysis

## Configuration

### Bank Configurations
Located in `config/`:
- `default.json` - Base configuration
- `demo.json` - Demo bank (currently active)
- `hbl.json` - HBL template
- `mcb.json` - MCB template

### Change Bank
```bash
# Edit .env file
BANK_CODE=hbl

# Create HBL database
CREATE DATABASE ilos_hbl;

# Restart server
npm run dev
```

## Features

### Enabled by Default
- ✅ Instant Loan (up to 750,000 for ETB)
- ✅ Mobile App
- ✅ Automation (SPU, EAVMU)

### Toggle Features
Edit `.env`:
```bash
FEATURE_INSTANT_LOAN=true
FEATURE_MOBILE_APP=true
FEATURE_AUTOMATION=true
```

## Architecture

```
Request
  ↓
Controller (API Layer)
  ↓
Service (Business Logic)
  ↓
Repository (Data Access)
  ↓
Database
```

### Key Files
- `server.js` - Entry point
- `src/app.js` - Express app setup
- `src/api/v1/routes/` - API endpoints
- `src/core/services/` - Business logic
- `src/infrastructure/repositories/` - Data access
- `src/config/` - Configuration management

## Troubleshooting

### Port Already in Use
```bash
# Change port in .env
PORT=6001
```

### Database Connection Error
```bash
# Verify PostgreSQL is running
pg_isready

# Check credentials in .env
DB_PASSWORD=faez
DB_USER=postgres
```

### Database Not Found
```bash
# Create database
psql -U postgres
CREATE DATABASE ilos_v2_demo;
```

## Next Steps

1. **Add Seed Data** - See `database/seeds/` (coming soon)
2. **Test Automation** - Submit applications and watch workflow
3. **Explore API** - Check all endpoints at http://localhost:6000
4. **Customize** - Modify `config/demo.json` for your needs

## Production Deployment

### Environment Variables
```bash
NODE_ENV=production
PORT=6000
BANK_CODE=hbl
DB_NAME=ilos_hbl
DB_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret
```

### Docker (Optional)
```bash
# Coming soon
docker-compose up -d
```

---

**Need Help?** Check `IMPLEMENTATION_PROGRESS.md` for current status.

