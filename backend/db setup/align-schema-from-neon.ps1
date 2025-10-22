param(
  [string]$NeonIlosUrl,
  [string]$NeonCbsUrl
)

$ErrorActionPreference = 'Stop'

# Load from env if params not provided
if (-not $NeonIlosUrl) { $NeonIlosUrl = $env:NEON_ILOS_URL }
if (-not $NeonIlosUrl) { $NeonIlosUrl = $env:NEON_DATABASE_URL1 }
if (-not $NeonCbsUrl)  { $NeonCbsUrl  = $env:NEON_CBS_URL }
if (-not $NeonCbsUrl)  { $NeonCbsUrl  = $env:NEON_DATABASE_URL }

if (-not $NeonIlosUrl) {
  Write-Host "Usage: .\\align-schema-from-neon.ps1 '<NEON_ILOS_URL>' '<NEON_CBS_URL>'" -ForegroundColor Yellow
  Write-Host "Or set env vars NEON_ILOS_URL / NEON_CBS_URL" -ForegroundColor Yellow
  exit 1
}

$env:PGPASSWORD = 'faez'
$LocalUser = 'ilos_user'
$LocalHost = 'localhost'
$LocalPort = '5432'

function Ensure-Tool($name) {
  $exists = Get-Command $name -ErrorAction SilentlyContinue
  if (-not $exists) { throw "Required tool '$name' not found in PATH." }
}
Ensure-Tool pg_dump
Ensure-Tool psql

# ILOS: Dump schema from Neon (schema-only)
$ilosSchema = "neon_ilos_schema.sql"
Write-Host "Dumping Neon ILOS schema..." -ForegroundColor Cyan
& pg_dump "$NeonIlosUrl" --schema-only --no-owner --no-privileges -f $ilosSchema
if ($LASTEXITCODE -ne 0) { throw "Failed to dump Neon ILOS schema" }

# Reset local ilos_db schema
Write-Host "Resetting local ilos_db schema..." -ForegroundColor Cyan
$dropNonSystem = @'
DO $do$
DECLARE rec RECORD;
BEGIN
  FOR rec IN SELECT nspname FROM pg_namespace WHERE nspname NOT IN ('pg_catalog','information_schema','pg_toast','public') LOOP
    EXECUTE format('DROP SCHEMA IF EXISTS %I CASCADE', rec.nspname);
  END LOOP;
END
$do$;
'@
& psql -h $LocalHost -p $LocalPort -U $LocalUser -d ilos_db -v ON_ERROR_STOP=1 -c $dropNonSystem
& psql -h $LocalHost -p $LocalPort -U $LocalUser -d ilos_db -v ON_ERROR_STOP=1 -c "DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO $LocalUser;"

# Apply schema to local ilos_db
Write-Host "Applying Neon ILOS schema to local..." -ForegroundColor Cyan
& psql -h $LocalHost -p $LocalPort -U $LocalUser -d ilos_db -v ON_ERROR_STOP=0 -f $ilosSchema
if ($LASTEXITCODE -ne 0) { throw "Failed to apply Neon ILOS schema" }

# Skip importing ILOS data per local-only schema requirement
Write-Host "Skipping ILOS data import (schema-only alignment requested)." -ForegroundColor Yellow

# CBS: If provided, align too
if ($NeonCbsUrl) {
  $cbsSchema = "neon_cbs_schema.sql"
  Write-Host "Dumping Neon CBS schema..." -ForegroundColor Cyan
  & pg_dump "$NeonCbsUrl" --schema-only --no-owner --no-privileges -f $cbsSchema
  if ($LASTEXITCODE -eq 0) {
    Write-Host "Resetting local cbs_db schema..." -ForegroundColor Cyan
    $dropNonSystemCbs = @'
DO $do$
DECLARE rec RECORD;
BEGIN
  FOR rec IN SELECT nspname FROM pg_namespace WHERE nspname NOT IN ('pg_catalog','information_schema','pg_toast','public') LOOP
    EXECUTE format('DROP SCHEMA IF EXISTS %I CASCADE', rec.nspname);
  END LOOP;
END
$do$;
'@
    & psql -h $LocalHost -p $LocalPort -U $LocalUser -d cbs_db -v ON_ERROR_STOP=1 -c $dropNonSystemCbs
    & psql -h $LocalHost -p $LocalPort -U $LocalUser -d cbs_db -v ON_ERROR_STOP=1 -c "DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO $LocalUser;"
    Write-Host "Applying Neon CBS schema to local..." -ForegroundColor Cyan
    & psql -h $LocalHost -p $LocalPort -U $LocalUser -d cbs_db -v ON_ERROR_STOP=0 -f $cbsSchema

    # Skip importing CBS data per local-only schema requirement
    Write-Host "Skipping CBS data import (schema-only alignment requested)." -ForegroundColor Yellow
  } else {
    Write-Warning "CBS schema dump failed; skipping CBS alignment."
  }
}

Write-Host "Schema alignment completed (best-effort)." -ForegroundColor Green
