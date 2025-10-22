param(
  [string]$AdminConn   = "postgresql://postgres:faez@localhost:5432/postgres",
  [string]$NeonIlosUrl = "",
  [string]$NeonCbsUrl  = ""
)

$ErrorActionPreference = 'Stop'

function Ensure-Tool($name) {
  $exists = Get-Command $name -ErrorAction SilentlyContinue
  if (-not $exists) { throw "Required tool '$name' not found in PATH." }
}

function Ensure-PostgresTools() {
  $psqlCmd   = Get-Command psql -ErrorAction SilentlyContinue
  $pgDumpCmd = Get-Command pg_dump -ErrorAction SilentlyContinue
  if ($psqlCmd -and $pgDumpCmd) { return }

  $dockerCmd = Get-Command docker -ErrorAction SilentlyContinue
  if (-not $dockerCmd) {
    throw "Required tool 'psql' not found and Docker not available. Install PostgreSQL client or Docker Desktop."
  }

  $containerStatus = docker ps -a --filter "name=^ilos-postgres$" --format "{{.Status}}"
  if (-not $containerStatus) {
    Write-Host "Starting local Postgres in Docker..." -ForegroundColor Cyan
    docker run -d --name ilos-postgres -e POSTGRES_PASSWORD=faez -p 5432:5432 postgres:16 | Out-Null
    Start-Sleep -Seconds 5
  }
  else {
    if ($containerStatus -notmatch '^Up') { docker start ilos-postgres | Out-Null; Start-Sleep -Seconds 3 }
  }

  if (-not $psqlCmd) {
    Set-Item -Path Function:psql -Value { param([Parameter(ValueFromRemainingArguments=$true)]$Args) docker exec -i ilos-postgres psql @Args }
  }
  if (-not $pgDumpCmd) {
    Set-Item -Path Function:pg_dump -Value { param([Parameter(ValueFromRemainingArguments=$true)]$Args) docker exec -i ilos-postgres pg_dump @Args }
  }
}

Write-Host "Checking required tools..." -ForegroundColor Cyan
Ensure-PostgresTools
Ensure-Tool psql
Ensure-Tool pg_dump

# Resolve Neon URLs from files if not passed
if (-not $NeonIlosUrl) {
  $ilosPath = Join-Path $PSScriptRoot 'ilos-backend-2.0\db setup\neon_ilos_url.txt'
  if (Test-Path $ilosPath) { $NeonIlosUrl = (Get-Content $ilosPath -Raw).Trim() }
}
if (-not $NeonCbsUrl) {
  $cbsPath = Join-Path $PSScriptRoot 'ilos-backend-2.0\db setup\neon_cbs_url.txt'
  if (Test-Path $cbsPath) { $NeonCbsUrl = (Get-Content $cbsPath -Raw).Trim() }
}

Write-Host "Creating role and databases (ilos_user, ilos_db, cbs_db)..." -ForegroundColor Cyan

# Create role & DBs (idempotent-ish)
& psql $AdminConn -v ON_ERROR_STOP=0 -c "CREATE ROLE ilos_user LOGIN PASSWORD 'faez'" | Out-Null
& psql $AdminConn -v ON_ERROR_STOP=0 -c "CREATE DATABASE ilos_db OWNER ilos_user" | Out-Null
& psql $AdminConn -v ON_ERROR_STOP=0 -c "CREATE DATABASE cbs_db  OWNER ilos_user" | Out-Null

# Grants and defaults
& psql ($AdminConn -replace '/postgres$','/ilos_db') -v ON_ERROR_STOP=0 -c "GRANT ALL ON SCHEMA public TO ilos_user; ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ilos_user; ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ilos_user;" | Out-Null
& psql ($AdminConn -replace '/postgres$','/cbs_db')  -v ON_ERROR_STOP=0 -c "GRANT ALL ON SCHEMA public TO ilos_user; ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ilos_user; ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ilos_user;" | Out-Null

Write-Host "Role/DBs ensured" -ForegroundColor Green

# Align from Neon if URL provided/found
if ($NeonIlosUrl) {
  Write-Host "Aligning schema/data from Neon..." -ForegroundColor Cyan
  & (Join-Path $PSScriptRoot 'ilos-backend-2.0\db setup\align-schema-from-neon.ps1') -NeonIlosUrl $NeonIlosUrl -NeonCbsUrl $NeonCbsUrl
  Write-Host "Neon alignment done (best-effort)." -ForegroundColor Yellow
}
else {
  Write-Host "Neon URLs not provided. Skipping alignment and creating minimal schema locally." -ForegroundColor Yellow
}

# Always run app schema initializers to ensure functions/triggers/columns
Write-Host "Ensuring core/external schemas..." -ForegroundColor Cyan
$env:DATABASE_URL  = 'postgres://ilos_user:faez@localhost:5432/cbs_db'
$env:DATABASE_URL1 = 'postgres://ilos_user:faez@localhost:5432/ilos_db'
$env:PG_SSL        = 'false'

Push-Location (Join-Path $PSScriptRoot 'ilos-backend-2.0')
try {
  node .\setup-core-schema-db1.js   | Write-Host
  node .\setup-external-tables.js   | Write-Host
}
finally { Pop-Location }

# If Neon ILOS URL was available, optionally re-import ordered child tables
if ($NeonIlosUrl) {
  Write-Host "Re-importing ordered ILOS tables to fill any child rows..." -ForegroundColor Cyan
  & (Join-Path $PSScriptRoot 'ilos-backend-2.0\db setup\import-ordered-ilos.ps1') -NeonIlosUrl $NeonIlosUrl
}

# Start all services
Write-Host "Starting stack windows..." -ForegroundColor Cyan
Start-Process cmd -ArgumentList '/c', 'cd /d ' + $PSScriptRoot + ' && start-all.cmd'

Write-Host "Bootstrap complete. Backend health: http://localhost:5000/health" -ForegroundColor Green


