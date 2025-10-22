#!/bin/bash

# Fix Global LOS ID System
# =========================
# This script fixes the global LOS ID sequence system for all application forms

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Fixing Global LOS ID System${NC}"
echo "================================="

# Change to the backend directory
cd /home/faez/projects/ILOS-FullStack/ilos-backend-2.0

# Load environment variables
if [ -f .env ]; then
    source .env
elif [ -f ../ilos-backend-2.0/.env ]; then
    source ../ilos-backend-2.0/.env
else
    echo -e "${RED}❌ .env file not found${NC}"
    exit 1
fi

# Extract database connection details from DATABASE_URL1
if [ -z "$DATABASE_URL1" ]; then
    echo -e "${RED}❌ DATABASE_URL1 not found in .env${NC}"
    exit 1
fi

DB_HOST=$(echo $DATABASE_URL1 | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL1 | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_USER=$(echo $DATABASE_URL1 | sed -n 's/.*\/\/\([^:]*\):.*/\1/p')
DB_NAME=$(echo $DATABASE_URL1 | sed -n 's/.*\/\([^?]*\).*/\1/p')

echo -e "${BLUE}📊 Database Connection:${NC}"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  User: $DB_USER"
echo "  Database: $DB_NAME"
echo

# Test database connection
echo -e "${BLUE}🔌 Testing database connection...${NC}"
if ! PGPASSWORD=$(echo $DATABASE_URL1 | sed -n 's/.*\/\/[^:]*:\([^@]*\)@.*/\1/p') psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1;" >/dev/null 2>&1; then
    echo -e "${RED}❌ Database connection failed${NC}"
    echo "Please check your DATABASE_URL1 in .env file"
    exit 1
fi
echo -e "${GREEN}✅ Database connection successful${NC}"

# Check current status
echo
echo -e "${BLUE}🔍 Checking current global sequence status...${NC}"
PGPASSWORD=$(echo $DATABASE_URL1 | sed -n 's/.*\/\/[^:]*:\([^@]*\)@.*/\1/p') psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'global_los_id_seq') 
        THEN 'EXISTS' 
        ELSE 'MISSING' 
    END as sequence_status;" 2>/dev/null || echo "Could not check sequence status"

echo
echo -e "${BLUE}🔍 Checking current application table ID defaults...${NC}"
PGPASSWORD=$(echo $DATABASE_URL1 | sed -n 's/.*\/\/[^:]*:\([^@]*\)@.*/\1/p') psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
SELECT 
    table_name,
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name LIKE '%_applications' 
    AND column_name = 'id'
ORDER BY table_name;" 2>/dev/null || echo "Could not check table defaults"

# Apply the fix
echo
echo -e "${BLUE}🔧 Applying global LOS ID system fix...${NC}"
echo -e "${YELLOW}⚠️  This operation will:"
echo "   - Create/configure global_los_id_seq sequence"
echo "   - Set proper ID defaults for all application tables"
echo "   - Create/update triggers for LOS registration"
echo "   - Synchronize sequence with existing data"
echo -e "${NC}"

read -p "Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}❌ Operation cancelled${NC}"
    exit 0
fi

# Execute the SQL script
echo -e "${BLUE}📜 Executing fix script...${NC}"
if PGPASSWORD=$(echo $DATABASE_URL1 | sed -n 's/.*\/\/[^:]*:\([^@]*\)@.*/\1/p') psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f database/fix-global-los-id-system.sql; then
    echo -e "${GREEN}✅ Global LOS ID system fixed successfully${NC}"
else
    echo -e "${RED}❌ Failed to fix global LOS ID system${NC}"
    exit 1
fi

# Test the fix by checking trigger functions
echo
echo -e "${BLUE}🧪 Testing trigger functions...${NC}"
PGPASSWORD=$(echo $DATABASE_URL1 | sed -n 's/.*\/\/[^:]*:\([^@]*\)@.*/\1/p') psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
SELECT 
    trigger_name,
    event_object_table,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE trigger_name LIKE '%_after_insert'
ORDER BY event_object_table;" 2>/dev/null || echo "Could not check triggers"

# Verify the fix
echo
echo -e "${BLUE}🔍 Verifying the fix...${NC}"
PGPASSWORD=$(echo $DATABASE_URL1 | sed -n 's/.*\/\/[^:]*:\([^@]*\)@.*/\1/p') psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
-- Check sequence
SELECT 
    sequencename,
    last_value,
    start_value,
    increment_by
FROM pg_sequences 
WHERE sequencename = 'global_los_id_seq';

-- Check table defaults
SELECT 
    table_name,
    column_name,
    column_default
FROM information_schema.columns 
WHERE table_name LIKE '%_applications' 
    AND column_name = 'id'
    AND column_default IS NOT NULL
ORDER BY table_name;"

echo
echo -e "${GREEN}✅ Global LOS ID system fix completed!${NC}"
echo
echo -e "${BLUE}📋 What was fixed:${NC}"
echo "  ✅ Created/configured global_los_id_seq sequence"
echo "  ✅ Set ID defaults to use nextval('global_los_id_seq')"
echo "  ✅ Created register_los_in_ilos function"
echo "  ✅ Setup triggers for all application tables"
echo "  ✅ Synchronized sequence with existing data"
echo
echo -e "${BLUE}🧪 Next steps:${NC}"
echo "  • Test AmeenDrive application submission"
echo "  • Test other application forms"
echo "  • Verify all forms generate unique LOS IDs"
echo
echo -e "${GREEN}🎯 The 'record new has no field id' error should now be fixed!${NC}"





