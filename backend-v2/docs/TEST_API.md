# ILOS V2.0 - API Testing Guide

## Quick Test Commands

### Using PowerShell

```powershell
# 1. Health Check
Invoke-RestMethod -Uri "http://localhost:6000/api/v1/health" -Method GET

# 2. Create a Party (Customer)
$party = @{
    cnic = "1234512345671"
    first_name = "Ahmed"
    last_name = "Khan"
    date_of_birth = "1990-01-15"
    gender = "M"
    marital_status = "Married"
    mobile = "03001234567"
    email = "ahmed@example.com"
    residential_address = "House 123, Street 1, Gulshan-e-Iqbal, Karachi"
    city = "Karachi"
    customer_type = "ETB"
    employment_type = "Salaried"
    employer_name = "ABC Company Ltd"
    designation = "Senior Manager"
    employment_tenure_months = 60
    office_address = "Office Tower, I.I. Chundrigar Road, Karachi"
    monthly_income = 150000
    bank_name = "United Bank Limited"
    account_number = "ACC1001001"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:6000/api/v1/parties" -Method POST -Body $party -ContentType "application/json"

# 3. Get Party by CNIC
Invoke-RestMethod -Uri "http://localhost:6000/api/v1/parties/cnic/1234512345671" -Method GET

# 4. Create an Application
$application = @{
    party_id = 1
    product_id = 1
    product_code = "CASHPLUS"
    purpose = "Home Renovation"
    requested_amount = 500000
    tenure_months = 36
    monthly_income = 150000
    customer_type = "ETB"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:6000/api/v1/applications" -Method POST -Body $application -ContentType "application/json"

# 5. Get Application by LOS ID
Invoke-RestMethod -Uri "http://localhost:6000/api/v1/applications/1" -Method GET

# 6. Get Application Summary
Invoke-RestMethod -Uri "http://localhost:6000/api/v1/applications/1/summary" -Method GET

# 7. Submit Application
Invoke-RestMethod -Uri "http://localhost:6000/api/v1/applications/1/submit" -Method POST

# 8. Get Dashboard Metrics
Invoke-RestMethod -Uri "http://localhost:6000/api/v1/dashboard/metrics" -Method GET

# 9. Get Applications by Party
Invoke-RestMethod -Uri "http://localhost:6000/api/v1/applications/party/1" -Method GET

# 10. Get Applications by Status
Invoke-RestMethod -Uri "http://localhost:6000/api/v1/applications/status/submitted" -Method GET
```

### Using curl (if installed)

```bash
# 1. Health Check
curl http://localhost:6000/api/v1/health

# 2. Create a Party
curl -X POST http://localhost:6000/api/v1/parties \
  -H "Content-Type: application/json" \
  -d "{\"cnic\":\"1234512345671\",\"first_name\":\"Ahmed\",\"last_name\":\"Khan\",\"date_of_birth\":\"1990-01-15\",\"gender\":\"M\",\"mobile\":\"03001234567\",\"email\":\"ahmed@example.com\",\"customer_type\":\"ETB\",\"monthly_income\":150000}"

# 3. Create an Application
curl -X POST http://localhost:6000/api/v1/applications \
  -H "Content-Type: application/json" \
  -d "{\"party_id\":1,\"product_id\":1,\"product_code\":\"CASHPLUS\",\"purpose\":\"Home Renovation\",\"requested_amount\":500000,\"tenure_months\":36,\"customer_type\":\"ETB\"}"

# 4. Get Dashboard Metrics
curl http://localhost:6000/api/v1/dashboard/metrics
```

## Complete Test Scenario

### Step 1: Start the Server
```powershell
cd "d:\ILOS 2.0\backend-v2"
npm run dev
```

### Step 2: Test Health
```powershell
Invoke-RestMethod -Uri "http://localhost:6000/api/v1/health"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "ILOS V2.0 API is running",
  "version": "2.0.0",
  "timestamp": "2024-...",
  "bank": "demo"
}
```

### Step 3: Create First Customer (ETB)
```powershell
$customer1 = @{
    cnic = "3520212345671"
    first_name = "Hassan"
    last_name = "Ahmed"
    date_of_birth = "1985-05-20"
    gender = "M"
    marital_status = "Married"
    mobile = "03211234567"
    email = "hassan.ahmed@email.com"
    residential_address = "Flat 5B, Block 13, Gulistan-e-Johar, Karachi"
    city = "Karachi"
    customer_type = "ETB"
    employment_type = "Salaried"
    employer_name = "Tech Solutions Pvt Ltd"
    designation = "Software Engineer"
    employment_tenure_months = 48
    monthly_income = 125000
    bank_name = "Demo Bank"
    account_number = "ACC2001001"
} | ConvertTo-Json

$party1 = Invoke-RestMethod -Uri "http://localhost:6000/api/v1/parties" -Method POST -Body $customer1 -ContentType "application/json"
Write-Host "✅ Customer created: Party ID = $($party1.data.party_id)" -ForegroundColor Green
```

### Step 4: Create Instant Loan Application
```powershell
$instantLoan = @{
    party_id = $party1.data.party_id
    product_id = 1
    product_code = "CASHPLUS"
    purpose = "Medical Emergency"
    requested_amount = 500000
    tenure_months = 24
    monthly_income = 125000
    customer_type = "ETB"
    loan_type = "Normal"
} | ConvertTo-Json

$app1 = Invoke-RestMethod -Uri "http://localhost:6000/api/v1/applications" -Method POST -Body $instantLoan -ContentType "application/json"
Write-Host "✅ Application created: LOS-$($app1.data.los_id)" -ForegroundColor Green
```

### Step 5: Submit Application
```powershell
$submitted = Invoke-RestMethod -Uri "http://localhost:6000/api/v1/applications/$($app1.data.los_id)/submit" -Method POST
Write-Host "✅ Application LOS-$($app1.data.los_id) submitted" -ForegroundColor Green
Write-Host "   Status: $($submitted.data.status)" -ForegroundColor Yellow
Write-Host "   Automation Eligible: $($submitted.data.automation_eligible)" -ForegroundColor Yellow
```

### Step 6: Check Dashboard
```powershell
$metrics = Invoke-RestMethod -Uri "http://localhost:6000/api/v1/dashboard/metrics"
Write-Host "`n📊 Dashboard Metrics:" -ForegroundColor Cyan
Write-Host "   Total Applications: $($metrics.data.total_applications)" -ForegroundColor White
Write-Host "   Submitted: $($metrics.data.pending_applications)" -ForegroundColor White
Write-Host "   Approved: $($metrics.data.approved_applications)" -ForegroundColor White
Write-Host "   Total Amount: PKR $($metrics.data.total_requested_amount)" -ForegroundColor White
```

### Step 7: Create NTB Customer
```powershell
$customer2 = @{
    cnic = "4210112345672"
    first_name = "Ayesha"
    last_name = "Khan"
    date_of_birth = "1992-08-15"
    gender = "F"
    marital_status = "Single"
    mobile = "03331234568"
    email = "ayesha.khan@email.com"
    residential_address = "House 45, Phase 2, DHA, Lahore"
    city = "Lahore"
    customer_type = "NTB"
    employment_type = "Self-Employed"
    employer_name = "Own Business"
    designation = "Business Owner"
    employment_tenure_months = 36
    monthly_income = 200000
} | ConvertTo-Json

$party2 = Invoke-RestMethod -Uri "http://localhost:6000/api/v1/parties" -Method POST -Body $customer2 -ContentType "application/json"
Write-Host "✅ NTB Customer created: Party ID = $($party2.data.party_id)" -ForegroundColor Green
```

### Step 8: Get All Applications
```powershell
$allApps = Invoke-RestMethod -Uri "http://localhost:6000/api/v1/applications/status/submitted"
Write-Host "`n📋 All Submitted Applications:" -ForegroundColor Cyan
foreach ($app in $allApps.data) {
    Write-Host "   LOS-$($app.los_id): $($app.purpose) - PKR $($app.requested_amount)" -ForegroundColor White
}
```

## Expected Outcomes

✅ Health check returns 200 OK  
✅ Party creation returns party_id  
✅ Application creation returns los_id  
✅ Application submission changes status to "submitted"  
✅ ETB applications are marked as automation_eligible  
✅ Dashboard shows correct counts  
✅ All endpoints return success: true  

## Troubleshooting

### Server Not Running
```powershell
# Check if server is running
Test-NetConnection -ComputerName localhost -Port 6000

# If not, start it
cd "d:\ILOS 2.0\backend-v2"
npm run dev
```

### Database Connection Error
```powershell
# Test database connection
psql -U postgres -d ilos_v2_demo -c "SELECT NOW();"

# If fails, check .env file
Get-Content .env | Select-String "DB_"
```

### Port Already in Use
```powershell
# Find process using port 6000
Get-NetTCPConnection -LocalPort 6000 -ErrorAction SilentlyContinue | Select-Object -Property OwningProcess
```

## API Response Format

All responses follow this structure:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": { ... } // Only in development mode
}
```

## Next Steps

1. ✅ Test all endpoints
2. ✅ Verify data in database
3. ✅ Check logs for errors
4. 🔄 Integrate with frontend
5. 🔄 Add authentication
6. 🔄 Deploy to production

