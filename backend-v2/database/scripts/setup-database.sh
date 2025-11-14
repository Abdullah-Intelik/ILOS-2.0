#!/bin/bash
# ============================================================================
# ILOS V2.0 - Database Setup Script
# Usage: ./setup-database.sh [bank_code]
# Example: ./setup-database.sh demo
# ============================================================================

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
BANK_CODE=${1:-demo}
DB_NAME="ilos_${BANK_CODE}"
MIGRATIONS_DIR="$(dirname "$0")/../migrations"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   ILOS V2.0 - Database Setup${NC}"
echo -e "${BLUE}   Bank: ${BANK_CODE}${NC}"
echo -e "${BLUE}   Database: ${DB_NAME}${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if PostgreSQL is running
if ! pg_isready -q; then
    echo -e "${RED}❌ PostgreSQL is not running${NC}"
    exit 1
fi

# Check if database exists
if psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo -e "${YELLOW}⚠️  Database '$DB_NAME' already exists${NC}"
    read -p "Do you want to drop and recreate it? (yes/no): " confirm
    if [ "$confirm" == "yes" ]; then
        echo -e "${YELLOW}Dropping database...${NC}"
        dropdb "$DB_NAME"
    else
        echo -e "${RED}Aborted${NC}"
        exit 1
    fi
fi

# Create database
echo -e "${GREEN}📦 Creating database '$DB_NAME'...${NC}"
createdb "$DB_NAME"

# Run migrations in order
echo -e "${GREEN}🚀 Running migrations...${NC}"
echo ""

for migration in "$MIGRATIONS_DIR"/*.sql; do
    filename=$(basename "$migration")
    echo -e "${BLUE}▶ Running $filename...${NC}"
    psql -d "$DB_NAME" -f "$migration" -q
    echo ""
done

# Get table count
TABLE_COUNT=$(psql -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE';")
VIEW_COUNT=$(psql -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.views WHERE table_schema='public';")

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}   ✅ DATABASE SETUP COMPLETED${NC}"
echo -e "${GREEN}   Database: ${DB_NAME}${NC}"
echo -e "${GREEN}   Tables: ${TABLE_COUNT}${NC}"
echo -e "${GREEN}   Views: ${VIEW_COUNT}${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo -e "  1. Update your .env file with: DB_NAME=${DB_NAME}"
echo -e "  2. Run seed data (optional): psql -d ${DB_NAME} -f seeds/demo-data.sql"
echo -e "  3. Start the backend: npm run dev"
echo ""

