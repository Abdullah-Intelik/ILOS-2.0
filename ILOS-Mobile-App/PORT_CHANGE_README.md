# ILOS Mobile App - Port Configuration

## ⚠️ Port Change: 8081 → 8082

The React Native Metro bundler has been changed from the default port **8081** to **8082** to avoid conflict with FileZilla Server.

---

## 🚀 How to Start the App

### Option 1: Use the Helper Batch File (Recommended)
```bash
cd D:\ILOS-Clean\ILOS-Mobile-App
start-mobile-app.bat
```

### Option 2: Manual Setup
```bash
# Terminal 1: Setup ADB port forwarding
adb reverse tcp:8082 tcp:8082
adb reverse tcp:5000 tcp:5000

# Terminal 2: Start Metro bundler
npm start
```

---

## 📱 Troubleshooting

### If the app shows "Unable to load script" error:

1. **Shake your device** or press **Ctrl+M** (Android emulator)
2. Tap **"Settings"**
3. Tap **"Debug server host & port for device"**
4. Enter: `localhost:8082`
5. Tap **OK**
6. Go back and tap **"Reload"**

### If using physical device on USB:

```bash
adb reverse tcp:8082 tcp:8082
adb reverse tcp:5000 tcp:5000
```

### If using physical device on Wi-Fi:

1. Find your computer's IP address (e.g., `192.168.1.100`)
2. Shake device → Settings
3. Enter: `192.168.1.100:8082`

---

## 🔧 Port Configuration Files

The following files have been updated:

1. **package.json** - Start script uses `--port 8082`
2. **metro.config.js** - Server port set to `8082`

---

## 📊 Port Mapping

| Service | Port | Purpose |
|---------|------|---------|
| Metro Bundler | 8082 | React Native dev server |
| Backend API | 5000 | ILOS backend |
| FileZilla Server | 8081 | FTP server (conflict avoided) |
| CNIC API | 8001 | CNIC OCR service |
| eCIB API | 8002/8004 | Credit bureau OCR |
| Payslip API | 8003 | Payslip OCR service |

---

## ✅ Verification

After starting the app, you should see:
```
Metro waiting on exp://192.168.x.x:8082
```

The port **8082** confirms the configuration is working correctly.

---

**Need help?** Make sure FileZilla Server is running on port 8081, and this app uses 8082.


