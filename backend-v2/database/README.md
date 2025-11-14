# ILOS V2.0 - Database Schema

## Overview
Industry-standard database schema for multi-bank loan origination system.

**Pattern:** Party-Account-Product (Banking Standard)  
**Total Tables:** 27  
**Total Views:** 4  
**Approach:** Normalized, scalable, configuration-driven

## Schema Files

### Migrations (Run in order)
1. `01-global-sequence.sql` - Global LOS ID sequence
2. `02-core-tables.sql` - Core tables (parties, applications, products)
3. `03-product-tables.sql` - Product-specific tables
4. `04-workflow-tables.sql` - Workflow and process tracking
5. `05-supporting-tables.sql` - References, documents, exposure
6. `06-system-tables.sql` - System configuration and monitoring
7. `07-indexes.sql` - Performance indexes
8. `08-views.sql` - Analytics and reporting views

### Seeds
- `demo-data.sql` - Demo data for presentations

## Installation

### Option 1: Run All at Once
```bash
./scripts/setup-database.sh demo
```

### Option 2: Manual Step-by-Step
```bash
# Create database
createdb ilos_v2_demo

# Run migrations in order
cd migrations
for file in *.sql; do
    echo "Running $file..."
    psql -d ilos_v2_demo -f "$file"
done

# Load demo data (optional)
cd ../seeds
psql -d ilos_v2_demo -f demo-data.sql
```

## Key Tables

### Core (6 tables)
- `parties` - Customer master
- `party_details` - Extended customer info
- `applications` - Central application registry
- `products` - Product catalog (config-driven)
- `users` - System users
- `audit_log` - Complete audit trail

### Product-Specific (4 tables)
- `product_personal_loan`
- `product_auto_loan`
- `product_credit_card`
- `product_islamic_finance`

### Workflow (5 tables)
- `application_workflow`
- `spu_checks`
- `eavmu_verifications`
- `ciu_decisions`
- `disbursements`

### Supporting (8 tables)
- `application_references`
- `application_exposure`
- `application_documents`
- `eamvu_agents`
- `agent_assignments`
- `notifications`
- `system_alerts`
- `system_config`

### System (4 tables)
- `automation_queue`
- `automation_log`
- `decision_engine_results`
- `application_hash`

## Per-Bank Deployment

Each bank gets:
```bash
# Bank A (HBL)
createdb ilos_hbl
./scripts/setup-database.sh hbl

# Bank B (MCB)
createdb ilos_mcb
./scripts/setup-database.sh mcb
```

**Same schema, different data, different configuration.**

## Schema Diagram

See `SCHEMA_DIAGRAM.md` for visual representation of relationships.

## Field Counts

| Product | Fields in Application | Fields in Product Table | Total |
|---------|----------------------|-------------------------|-------|
| Personal Loan | 8 | 3 | 11 |
| Auto Loan | 8 | 10 | 18 |
| Credit Card | 8 | 4 | 12 |
| Islamic Finance | 8 | 4 | 12 |

**Core fields:** 8 (in `applications` table)  
**Product-specific:** Varies by product type

## Benefits

✅ **Scalable** - Add products by creating one table  
✅ **Fast** - Proper indexes, normalized structure  
✅ **Clean** - No redundancy  
✅ **Flexible** - Easy to modify per bank  
✅ **Standard** - Industry best practices

## Documentation

- `TABLE_REFERENCE.md` - Detailed field documentation
- `RELATIONSHIPS.md` - Foreign key relationships
- `INDEXES.md` - Index strategy
- `VIEWS.md` - View documentation

