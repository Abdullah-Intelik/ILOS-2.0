param(
  [string]$NeonIlosUrl = "",
  [string]$NeonCbsUrl  = "",
  [switch]$SeedCbs = $true,
  [switch]$CheckCbs = $false
)

$ErrorActionPreference = 'Stop'

# Resolve Neon URLs from files if not passed
if (-not $NeonIlosUrl) {
  $ilosPath = Join-Path $PSScriptRoot 'neon_ilos_url.txt'
  if (Test-Path $ilosPath) { $NeonIlosUrl = (Get-Content $ilosPath -Raw).Trim() }
}
if (-not $NeonCbsUrl) {
  $cbsPath = Join-Path $PSScriptRoot 'neon_cbs_url.txt'
  if (Test-Path $cbsPath) { $NeonCbsUrl = (Get-Content $cbsPath -Raw).Trim() }
}

Write-Host "Setting env vars for local databases..." -ForegroundColor Cyan
$env:DATABASE_URL  = 'postgres://ilos_user:faez@localhost:5432/cbs_db'
$env:DATABASE_URL1 = 'postgres://ilos_user:faez@localhost:5432/ilos_db'
$env:PG_SSL        = 'false'

Write-Host "Aligning schema from Neon (schema-only; no data)..." -ForegroundColor Cyan
& (Join-Path $PSScriptRoot 'align-schema-from-neon.ps1') -NeonIlosUrl $NeonIlosUrl -NeonCbsUrl $NeonCbsUrl

Write-Host "Ensuring ILOS core functions/triggers and product schema..." -ForegroundColor Cyan
Push-Location $PSScriptRoot
try {
  node .\setup-core-schema-db1.js   | Write-Host
  node .\setup-external-tables.js   | Write-Host
  if ($SeedCbs) {
    Write-Host "Comprehensive CBS database seeding (all tables, all fields)..." -ForegroundColor Cyan
    node .\comprehensive-cbs-seed.js | Write-Host
  }
  if ($CheckCbs) {
    Write-Host "Checking CBS schema field presence..." -ForegroundColor Cyan
    node .\check-cbs-schema.js     | Write-Host
  }
}
finally { Pop-Location }

Write-Host "Setup-all complete." -ForegroundColor Green



