# ================================================================
# ILOS Complete System Startup Script (PowerShell)
# Starts: Backend, Document Server, Frontend, and Mobile App
# ================================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " ILOS - Starting All Services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get the script directory (D:\ILOS)
$ILOS_ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ILOS_ROOT

Write-Host "[1/5] Starting Backend API Server (Port 5000)..." -ForegroundColor Yellow
Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "cd /d $ILOS_ROOT\backend && npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 2

Write-Host "[2/5] Starting Document Server (Port 8081)..." -ForegroundColor Yellow
Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "cd /d $ILOS_ROOT\backend\backend_Filezilla_for_testing && node uploadtoftp.js" -WindowStyle Normal
Start-Sleep -Seconds 2

Write-Host "[3/5] Starting Frontend Dashboard (Port 3000)..." -ForegroundColor Yellow
Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "cd /d $ILOS_ROOT\frontend && npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 2

Write-Host "[4/5] Starting Metro Bundler (Port 8082)..." -ForegroundColor Yellow
Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "cd /d $ILOS_ROOT\ILOS-Mobile-App && npx react-native start --port 8082" -WindowStyle Normal
Start-Sleep -Seconds 5

Write-Host "[5/5] Setting up Android Port Forwarding and Building App..." -ForegroundColor Yellow
Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "cd /d $ILOS_ROOT\ILOS-Mobile-App && adb reverse tcp:5000 tcp:5000 && adb reverse tcp:8081 tcp:8081 && adb reverse tcp:8082 tcp:8082 && npx react-native run-android --port 8082" -WindowStyle Normal

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " All Services Started!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host " Terminal Windows Opened:" -ForegroundColor White
Write-Host "   1. Backend API       (Port 5000)" -ForegroundColor Gray
Write-Host "   2. Document Server   (Port 8081)" -ForegroundColor Gray
Write-Host "   3. Frontend          (Port 3000)" -ForegroundColor Gray
Write-Host "   4. Metro Bundler     (Port 8082)" -ForegroundColor Gray
Write-Host "   5. Mobile Build      (Android)" -ForegroundColor Gray
Write-Host ""
Write-Host " Access Points:" -ForegroundColor White
Write-Host "   - Frontend:  http://localhost:3000" -ForegroundColor Cyan
Write-Host "   - Backend:   http://localhost:5000" -ForegroundColor Cyan
Write-Host "   - Documents: http://localhost:8081" -ForegroundColor Cyan
Write-Host "   - Metro:     http://localhost:8082" -ForegroundColor Cyan
Write-Host ""
Write-Host " Press any key to close this window..." -ForegroundColor Yellow
Write-Host " (Other windows will continue running)" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Wait for user input
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

