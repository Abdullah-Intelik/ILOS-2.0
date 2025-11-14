@echo off
REM ========================================
REM Port Forwarding Setup (Quick Script)
REM ========================================
REM Backend V2.0: Forwards Backend API (5000), Document Server (8086), and Metro (8082)

echo.
echo Setting up port forwarding for ILOS Mobile App (EAVMU Officer)...
echo.

REM Forward ports for all connected devices
for /f "skip=1 tokens=1" %%D in ('adb devices ^| findstr "device"') do (
    echo Setting up device: %%D
    
    REM Backend V2 API
    adb -s %%D reverse tcp:5000 tcp:5000
    echo   - Port 5000 (Backend API) ✓
    
    REM Document Server
    adb -s %%D reverse tcp:8086 tcp:8086
    echo   - Port 8086 (Document Server) ✓
    
    REM Metro Bundler
    adb -s %%D reverse tcp:8082 tcp:8082
    echo   - Port 8082 (Metro Bundler) ✓
    
    echo.
)

echo Port forwarding complete!
echo You can now reload the app (double-tap R in emulator/phone)
echo.
pause

