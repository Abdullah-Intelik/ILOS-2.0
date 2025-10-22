param(
  [string]$NeonIlosUrl
)

$ErrorActionPreference = 'Stop'
if (-not $NeonIlosUrl) { $NeonIlosUrl = $env:NEON_ILOS_URL }
if (-not $NeonIlosUrl) { $NeonIlosUrl = $env:NEON_DATABASE_URL1 }
if (-not $NeonIlosUrl) {
  Write-Host "Usage: .\\import-ordered-ilos.ps1 '<NEON_ILOS_URL>'" -ForegroundColor Yellow
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

# Parents then children
$parents = @(
  'cashplus_applications',
  'autoloan_applications',
  'ameendrive_applications',
  'smeasaan_applications',
  'commercial_vehicle_applications',
  'creditcard_applications',
  'platinum_card_applications'
)

$children = @(
  # cashplus
  'cashplus_credit_cards_clean','cashplus_credit_cards_secured','cashplus_personal_loans_existing','cashplus_other_facilities','cashplus_personal_loans_under_process','cashplus_references','cashplus_documents',
  # autoloan
  'autoloan_other_bank_accounts','autoloan_credit_cards_clean','autoloan_credit_cards_secured','autoloan_personal_loans_clean','autoloan_personal_loans_secured','autoloan_other_facilities','autoloan_applied_limits','autoloan_references','autoloan_documents',
  # ameendrive
  'ameendrive_bank_accounts','ameendrive_bank_facilities','ameendrive_references','ameendrive_documents',
  # smeasaan
  'smeasaan_existing_loans','smeasaan_business_descriptions','smeasaan_market_info','smeasaan_financial_indicators','smeasaan_financial_indicators_medium','smeasaan_references','smeasaan_documents',
  # commercial vehicle
  'commercial_vehicle_references','commercial_vehicle_existing_loans','commercial_vehicle_business_descriptions','commercial_vehicle_market_info','commercial_vehicle_financial_indicators','commercial_vehicle_financial_indicators_medium','commercial_vehicle_documents',
  # credit card
  'creditcard_other_banks','creditcard_other_credit_cards','creditcard_loans','creditcard_supplementary_cards',
  # platinum
  'platinum_card_other_banks','platinum_card_other_credit_cards','platinum_card_loan_facilities','platinum_card_references','platinum_card_supplementary','platinum_card_lien_marked'
)

function Dump-And-Import([string]$table) {
  $dump = "dump_${table}.sql"
  Write-Host ("Exporting " + $table + "...") -ForegroundColor Cyan
  & pg_dump "$NeonIlosUrl" --data-only --column-inserts --rows-per-insert=1 --no-owner --no-privileges -t "$table" -f $dump
  if ($LASTEXITCODE -ne 0) { Write-Warning ("Skip: no data for " + $table); return }
  # Add ON CONFLICT DO NOTHING to INSERTs
  $lines = Get-Content $dump
  $lines = $lines | ForEach-Object { if ($_ -match '^\s*INSERT INTO ') { $_ -replace ';\s*$', ' ON CONFLICT DO NOTHING;' } else { $_ } }
  Set-Content -Path $dump -Value $lines
  Write-Host ("Importing " + $table + " (constraints/triggers disabled) ...") -ForegroundColor Green
  & psql -h $LocalHost -p $LocalPort -U $LocalUser -d ilos_db -v ON_ERROR_STOP=1 -c "SET session_replication_role = replica;"
  & psql -h $LocalHost -p $LocalPort -U $LocalUser -d ilos_db -f $dump
  & psql -h $LocalHost -p $LocalPort -U $LocalUser -d ilos_db -v ON_ERROR_STOP=1 -c "SET session_replication_role = origin;"
}

Write-Host "Importing parent tables..." -ForegroundColor White
foreach ($t in $parents) { Dump-And-Import $t }

Write-Host "Importing child tables..." -ForegroundColor White
foreach ($t in $children) { Dump-And-Import $t }

Write-Host "Ordered import complete." -ForegroundColor Green
