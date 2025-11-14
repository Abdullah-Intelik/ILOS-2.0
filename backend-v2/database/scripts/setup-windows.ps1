# ============================================================================
# ILOS V2.0 - Database Setup Script for Windows
# Usage: .\setup-windows.ps1
# ============================================================================

$ErrorActionPreference = "Stop"

$BANK_CODE = "demo"
$DB_NAME = "ilos_v2_$BANK_CODE"
$DB_USER = "postgres"
$DB_PASSWORD = "faez"
$MIGRATIONS_DIR = "$PSScriptRoot\..\migrations"

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host "   ILOS V2.0 - Database Setup" -ForegroundColor Blue
Write-Host "   Bank: $BANK_CODE" -ForegroundColor Blue
Write-Host "   Database: $DB_NAME" -ForegroundColor Blue
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host ""

# Set password environment variable
$env:PGPASSWORD = $DB_PASSWORD

# Check if database exists
Write-Host "📦 Checking if database exists..." -ForegroundColor Yellow
$dbExists = psql -U $DB_USER -lqt | Select-String -Pattern $DB_NAME

if ($dbExists) {
    Write-Host "⚠️  Database '$DB_NAME' already exists" -ForegroundColor Yellow
    $confirm = Read-Host "Do you want to drop and recreate it? (yes/no)"
    if ($confirm -eq "yes") {
        Write-Host "Dropping database..." -ForegroundColor Yellow
        psql -U $DB_USER -c "DROP DATABASE $DB_NAME;"
    } else {
        Write-Host "Aborted" -ForegroundColor Red
        exit 1
    }
}

# Create database
Write-Host "📦 Creating database '$DB_NAME'..." -ForegroundColor Green
psql -U $DB_USER -c "CREATE DATABASE $DB_NAME;"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to create database" -ForegroundColor Red
    exit 1
}

# Run migrations
Write-Host ""
Write-Host "🚀 Running migrations..." -ForegroundColor Green
Write-Host ""

$migrations = Get-ChildItem -Path $MIGRATIONS_DIR -Filter "*.sql" | Sort-Object Name

foreach ($migration in $migrations) {
    Write-Host "▶ Running $($migration.Name)..." -ForegroundColor Blue
    psql -U $DB_USER -d $DB_NAME -f $migration.FullName
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Migration failed: $($migration.Name)" -ForegroundColor Red
        exit 1
    }
    Write-Host ""
}

# Get table and view counts
$tableCount = psql -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE';"
$viewCount = psql -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM information_schema.views WHERE table_schema='public';"

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "   ✅ DATABASE SETUP COMPLETED" -ForegroundColor Green
Write-Host "   Database: $DB_NAME" -ForegroundColor Green
Write-Host "   Tables: $($tableCount.Trim())" -ForegroundColor Green
Write-Host "   Views: $($viewCount.Trim())" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Blue
Write-Host "  1. Update your .env file with: DB_NAME=$DB_NAME" -ForegroundColor White
Write-Host "  2. Start the backend: npm run dev" -ForegroundColor White
Write-Host ""

# Clean up environment variable
Remove-Item Env:\PGPASSWORD

