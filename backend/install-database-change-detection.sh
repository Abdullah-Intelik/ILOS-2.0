#!/bin/bash

# ============================================
# ILOS Database Change Detection Installation
# ============================================

echo "🔍 ILOS Database Change Detection Installation"
echo "=============================================="
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Load environment variables
if [ -f .env ]; then
    echo "📁 Loading environment variables from .env..."
    export $(cat .env | grep -v '#' | xargs)
else
    echo "${RED}❌ .env file not found!${NC}"
    exit 1
fi

# Extract database connection details
DB_HOST=$(echo $DATABASE_URL1 | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL1 | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DATABASE_URL1 | sed -n 's/.*\/\([^?]*\).*/\1/p')
DB_USER=$(echo $DATABASE_URL1 | sed -n 's/.*\/\/\([^:]*\):.*/\1/p')

echo "${BLUE}📊 Database Connection Details:${NC}"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo

# Check if database connection works
echo "${BLUE}🔌 Testing database connection...${NC}"
if PGPASSWORD=$(echo $DATABASE_URL1 | sed -n 's/.*\/\/[^:]*:\([^@]*\)@.*/\1/p') psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1;" > /dev/null 2>&1; then
    echo "${GREEN}✅ Database connection successful${NC}"
else
    echo "${RED}❌ Database connection failed${NC}"
    echo "Please check your DATABASE_URL1 in .env file"
    exit 1
fi

# Install database triggers
echo
echo "${BLUE}🔧 Installing database change detection triggers...${NC}"

# Execute the SQL script
if PGPASSWORD=$(echo $DATABASE_URL1 | sed -n 's/.*\/\/[^:]*:\([^@]*\)@.*/\1/p') psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f database/change-detection-triggers.sql; then
    echo "${GREEN}✅ Database triggers installed successfully${NC}"
else
    echo "${RED}❌ Failed to install database triggers${NC}"
    exit 1
fi

# Verify installation
echo
echo "${BLUE}🔍 Verifying installation...${NC}"

# Check if audit table exists
if PGPASSWORD=$(echo $DATABASE_URL1 | sed -n 's/.*\/\/[^:]*:\([^@]*\)@.*/\1/p') psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT COUNT(*) FROM database_change_audit;" > /dev/null 2>&1; then
    echo "${GREEN}✅ Audit table created successfully${NC}"
else
    echo "${RED}❌ Audit table not found${NC}"
    exit 1
fi

# Check if triggers are installed
TRIGGER_COUNT=$(PGPASSWORD=$(echo $DATABASE_URL1 | sed -n 's/.*\/\/[^:]*:\([^@]*\)@.*/\1/p') psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_name LIKE '%audit_trigger';" | xargs)

if [ "$TRIGGER_COUNT" -gt 0 ]; then
    echo "${GREEN}✅ $TRIGGER_COUNT audit triggers installed${NC}"
else
    echo "${RED}❌ No audit triggers found${NC}"
    exit 1
fi

# Test with a sample change
echo
echo "${BLUE}🧪 Testing change detection...${NC}"

# Create a test record if it doesn't exist
PGPASSWORD=$(echo $DATABASE_URL1 | sed -n 's/.*\/\/[^:]*:\([^@]*\)@.*/\1/p') psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
INSERT INTO cashplus_applications (los_id, first_name, last_name, amount_requested, status) 
VALUES (99999, 'Test', 'User', 100000, 'test_record')
ON CONFLICT (los_id) DO UPDATE SET 
    amount_requested = 100000,
    status = 'test_record';" > /dev/null 2>&1

# Make a test change
PGPASSWORD=$(echo $DATABASE_URL1 | sed -n 's/.*\/\/[^:]*:\([^@]*\)@.*/\1/p') psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
UPDATE cashplus_applications 
SET amount_requested = 150000 
WHERE los_id = 99999;" > /dev/null 2>&1

# Check if change was detected
CHANGE_COUNT=$(PGPASSWORD=$(echo $DATABASE_URL1 | sed -n 's/.*\/\/[^:]*:\([^@]*\)@.*/\1/p') psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM database_change_audit WHERE record_id = '99999';" | xargs)

if [ "$CHANGE_COUNT" -gt 0 ]; then
    echo "${GREEN}✅ Change detection working - $CHANGE_COUNT changes detected${NC}"
else
    echo "${RED}❌ Change detection not working${NC}"
    exit 1
fi

# Clean up test record
PGPASSWORD=$(echo $DATABASE_URL1 | sed -n 's/.*\/\/[^:]*:\([^@]*\)@.*/\1/p') psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "DELETE FROM cashplus_applications WHERE los_id = 99999;" > /dev/null 2>&1

echo
echo "${GREEN}🎉 INSTALLATION COMPLETE!${NC}"
echo
echo "${BLUE}📋 What was installed:${NC}"
echo "  ✅ database_change_audit table"
echo "  ✅ Field sensitivity classification function"
echo "  ✅ Risk scoring function"
echo "  ✅ Change detection triggers on all application tables"
echo "  ✅ Database monitoring views"
echo
echo "${BLUE}🔧 How to use:${NC}"
echo "  • View all changes: SELECT * FROM database_changes_summary;"
echo "  • View LOS-31 changes: SELECT * FROM get_database_changes_for_los('31');"
echo "  • Monitor via API: curl http://localhost:5000/api/database-changes/health"
echo
echo "${BLUE}🚀 Next steps:${NC}"
echo "  1. Restart your ILOS backend: npm restart or node server.js"
echo "  2. Test the API endpoints"
echo "  3. Make a direct database change to test detection"
echo
echo "${YELLOW}⚠️  Note: The system will now detect ALL direct database changes${NC}"
echo "${YELLOW}    and integrate them with the department change tracking system.${NC}"
echo
echo "Happy fraud detection! 🛡️"
