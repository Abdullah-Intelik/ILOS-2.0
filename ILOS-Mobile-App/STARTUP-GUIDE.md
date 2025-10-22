# 🚀 ILOS Mobile App - Startup Guide

## Quick Start Scripts

I've created automated scripts to make your life easier!

### Option 1: Full Build & Run (Recommended for first time)
```bash
# Windows CMD
start-android.cmd

# Windows PowerShell (Recommended)
.\start-android.ps1
```

**What it does:**
- ✅ Detects all connected devices (emulators + phones)
- ✅ Sets up port forwarding automatically
- ✅ Builds and installs the app
- ✅ Connects to Metro on port 8082

---

### Option 2: Quick Port Setup (When app is already installed)
```bash
setup-ports.cmd
```

**What it does:**
- ✅ Just sets up port forwarding
- ✅ No rebuild needed
- ✅ Use this after you've already installed the app

Then just **reload** the app:
- **Emulator**: Double-tap `R` or press `r` in Metro terminal
- **Physical Phone**: Shake phone → "Reload"

---

## 📋 What Port Forwarding Does

### The Commands Explained:

```bash
adb -s emulator-5554 reverse tcp:8081 tcp:8082
```
- **`adb`**: Android Debug Bridge (tool to communicate with devices)
- **`-s emulator-5554`**: Target specific device by serial number
- **`reverse`**: Set up reverse port forwarding (device → computer)
- **`tcp:8081 tcp:8082`**: Redirect port 8081 requests to port 8082

**Why is this needed?**
- React Native defaults to Metro on port **8081**
- Your Metro is on port **8082** (to avoid FileZilla conflict)
- Port forwarding bridges this gap!

---

## 🔧 Manual Commands (if scripts don't work)

### 1. Check Connected Devices
```bash
adb devices
```

### 2. Setup Port Forwarding
```bash
# For emulator
adb -s emulator-5554 reverse tcp:8081 tcp:8082
adb -s emulator-5554 reverse tcp:8082 tcp:8082

# For physical phone (replace with your device ID)
adb -s dd605ff3 reverse tcp:8082 tcp:8082
```

### 3. Run the App
```bash
npx react-native run-android --port 8082
```

---

## 🎯 Different Scenarios

### Scenario 1: Fresh Start (No app installed)
```bash
start-android.cmd
```

### Scenario 2: App already installed, just need to reload
```bash
setup-ports.cmd
# Then reload app (double-tap R)
```

### Scenario 3: Changed JavaScript code only
```bash
# No need to do anything!
# Metro hot-reloads automatically
# Or press 'r' in Metro terminal
```

### Scenario 4: Changed native Android code
```bash
# Need full rebuild
start-android.cmd
```

---

## 📱 Device-Specific Notes

### Emulator:
- Uses: `http://10.0.2.2:5000` for backend
- Port forwarding: Required for Metro connection
- Can be slow/buggy with gestures

### Physical Phone:
- Uses: `http://192.168.1.155:5000` for backend  
- Port forwarding: Required for Metro connection
- Much faster and more reliable!
- **Recommended for development**

---

## 🐛 Troubleshooting

### "Could not connect to development server"
**Solution:**
```bash
setup-ports.cmd
```

### "Metro is running on port 8081"
**Solution:** Port forwarding not set up
```bash
setup-ports.cmd
```

### Black screen on emulator
**Solutions:**
1. Use your physical phone instead (recommended)
2. Try restarting the emulator
3. The emulator has rendering issues - this is normal

### Can't type on emulator
**Solution:** Use your physical phone - emulator has gesture handler issues

---

## ✨ Pro Tips

1. **Always use your physical phone** - it's faster and more reliable!
2. **Run `setup-ports.cmd` once** at the start of each dev session
3. **Keep Metro running** in a separate terminal
4. **Hot reload** works automatically for code changes

---

## 📂 File Locations

- **Start Scripts**: `ILOS-Mobile-App/start-android.cmd` and `.ps1`
- **Port Setup**: `ILOS-Mobile-App/setup-ports.cmd`
- **API Config**: `ILOS-Mobile-App/src/utils/config.js`
- **APK Output**: `ILOS-Mobile-App/android/app/build/outputs/apk/debug/app-debug.apk`

---

Happy coding! 🚀

