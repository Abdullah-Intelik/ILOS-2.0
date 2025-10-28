@echo off
echo Setting up ADB reverse ports and sending key event...

adb -s emulator-5554 reverse tcp:8081 tcp:8082
adb -s emulator-5554 reverse tcp:8082 tcp:8082
adb -s emulator-5554 shell input keyevent KEYCODE_MENU
adb reverse tcp:8081 tcp:8081
adb reverse tcp:5000 tcp:5000

echo Done!
pause
