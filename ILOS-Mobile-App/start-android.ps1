# ========================================
# ILOS Mobile App - Android Startup Script
# ========================================
# This script sets up port forwarding and runs the app

Write-Host ""
Write-Host "========================================"
Write-Host "  ILOS Mobile App - Android Launcher"
Write-Host "========================================"
Write-Host ""

# Check if adb is available
try {
    $adbVersion = adb version 2>$null
    if (-not $adbVersion) {
        throw "ADB not found"
    }
} catch {
    Write-Host "[ERROR] ADB not found! Please install Android SDK Platform Tools." -ForegroundColor Red
    pause
    exit 1
}

Write-Host "[1/4] Detecting connected devices..." -ForegroundColor Cyan
adb devices
Write-Host ""

Write-Host "[2/4] Setting up port forwarding for all devices..." -ForegroundColor Cyan
Write-Host "  - Forwarding port 8081 -> 8082 (for default Metro connections)" -ForegroundColor Gray
Write-Host "  - Forwarding port 8082 -> 8082 (for configured Metro connections)" -ForegroundColor Gray
Write-Host ""

# Get all connected devices
$devices = adb devices | Select-String "device$" | ForEach-Object {
    ($_ -split "\s+")[0]
}

# Forward ports for all connected devices
foreach ($device in $devices) {
    if ($device -ne "List") {
        Write-Host "  Setting up ports for device: $device" -ForegroundColor Yellow
        adb -s $device reverse tcp:8081 tcp:8082 2>$null
        adb -s $device reverse tcp:8082 tcp:8082 2>$null
    }
}

Write-Host ""
Write-Host "[3/4] Port forwarding complete!" -ForegroundColor Green
Write-Host ""

Write-Host "[4/4] Building and installing app on Android..." -ForegroundColor Cyan
Write-Host "  This may take a minute..." -ForegroundColor Gray
Write-Host ""

# Run the Android app
npx react-native run-android --port 8082

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================"
    Write-Host "  SUCCESS! App is running!" -ForegroundColor Green
    Write-Host "========================================"
    Write-Host ""
    Write-Host "  Metro bundler: http://localhost:8082" -ForegroundColor Cyan
    Write-Host "  Press Ctrl+C to stop Metro bundler" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "========================================"
    Write-Host "  ERROR! Build failed!" -ForegroundColor Red
    Write-Host "========================================"
    Write-Host ""
    pause
}

