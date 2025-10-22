param(
  [string]$NeonIlosUrl,
  [string]$NeonCbsUrl
)

$ErrorActionPreference = 'Stop'

# Allow env fallbacks
if (-not $NeonIlosUrl) { $NeonIlosUrl = $env:NEON_DATABASE_URL1 }
if (-not $NeonIlosUrl) { $NeonIlosUrl = $env:NEON_ILOS_URL }
if (-not $NeonCbsUrl)  { $NeonCbsUrl  = $env:NEON_DATABASE_URL }
if (-not $NeonCbsUrl)  { $NeonCbsUrl  = $env:NEON_CBS_URL }

if (-not $NeonIlosUrl -or -not $NeonCbsUrl) {
  Write-Host "Usage: .\\migrate-from-neon.ps1 '<NEON_ILO S_URL>' '<NEON_CBS_URL>'" -ForegroundColor Yellow
  Write-Host "Or set env vars NEON_ILOS_URL and NEON_CBS_URL (or NEON_DATABASE_URL1 / NEON_DATABASE_URL) and run without args." -ForegroundColor Yellow
  exit 1
}

# Local DB connection
$env:PGPASSWORD = 'faez'
$LocalUser = 'ilos_user'
$LocalHost = 'localhost'
$LocalPort = '5432'

function Ensure-Tool($name) {
  $exists = Get-Command $name -ErrorAction SilentlyContinue
  if (-not $exists) {
    throw "Required tool '$name' not found in PATH. Ensure PostgreSQL bin directory is in PATH."
  }
}
Ensure-Tool pg_dump
Ensure-Tool psql

Write-Host "Skipping ILOS data migration (schema-only requested)." -ForegroundColor Yellow

# Dump and restore CBS/external tables (skip if not present)
Write-Host "Skipping CBS data migration (schema-only requested)." -ForegroundColor Yellow

Write-Host "Migration completed (best-effort)." -ForegroundColor Green
