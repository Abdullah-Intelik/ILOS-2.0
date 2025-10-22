@echo off
echo ========================================
echo  ILOS Mobile App - Fix Connection
echo ========================================
echo.

echo Step 1: Checking ADB connection...
adb devices
echo.

echo Step 2: Setting up port forwarding...
echo Port 8082 (Metro bundler)...
adb reverse tcp:8082 tcp:8082
echo Port 5000 (Backend API)...
adb reverse tcp:5000 tcp:5000
echo Port 8001 (CNIC API)...
adb reverse tcp:8001 tcp:8001
echo Port 8003 (Payslip API)...
adb reverse tcp:8003 tcp:8003
echo.

echo Step 3: Testing backend connection...
curl -s http://localhost:5000/health
echo.
echo.

echo Step 4: Verifying port forwarding...
adb reverse --list
echo.

echo ========================================
echo  Port forwarding complete!
echo  Now reload the app:
echo  - Press R, R in Metro terminal
echo  - Or press Ctrl+M and tap Reload
echo ========================================
echo.

pause

