@echo off
REM ========================================
REM Port Forwarding Setup (Quick Script)
REM ========================================
REM Use this to quickly setup ports without rebuilding

echo.
echo Setting up port forwarding for Metro on port 8082...
echo.

REM Forward ports for all connected devices
for /f "skip=1 tokens=1" %%D in ('adb devices ^| findstr "device"') do (
    echo Setting up device: %%D
    adb -s %%D reverse tcp:8081 tcp:8082
    adb -s %%D reverse tcp:8082 tcp:8082
    echo   - Port 8081 -^> 8082 ✓
    echo   - Port 8082 -^> 8082 ✓
    echo.
)

echo Port forwarding complete!
echo You can now reload the app (double-tap R in emulator/phone)
echo.
pause

