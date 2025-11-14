# ILOS Customer App - Quick Setup Guide

## 🚀 Quick Start (Windows)

### Step 1: Install Dependencies
```bash
cd "D:\ILOS 2.0\ILOS-Customer-App"
npm install
```

### Step 2: Configure Backend URL

Open `src/utils/config.js` and update the API URL:

**For Android Emulator:**
```javascript
API_BASE_URL: 'http://10.0.2.2:5000'
```

**For Physical Device:**
1. Find your computer's IP address:
   ```bash
   ipconfig
   ```
2. Look for "IPv4 Address" (e.g., 192.168.1.100)
3. Update config:
   ```javascript
   API_BASE_URL: 'http://192.168.1.100:5000'
   ```

### Step 3: Ensure Backend is Running
```bash
cd "D:\ILOS 2.0\backend"
node server.js
```

Backend should be running on `http://localhost:5000`

### Step 4: Start Metro Bundler
**Option A: Using the batch script**
```bash
start-customer-app.bat
```

**Option B: Manually**
```bash
npm start
# OR
npx react-native start --port 8083
```

### Step 5: Run on Android

**Using Emulator:**
1. Open Android Studio
2. Start an Android Virtual Device (AVD)
3. In a NEW terminal:
   ```bash
   cd "D:\ILOS 2.0\ILOS-Customer-App"
   npm run android
   ```

**Using Physical Device:**
1. Enable Developer Options on your Android device:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
2. Enable USB Debugging:
   - Go to Settings → Developer Options
   - Turn on "USB Debugging"
3. Connect device via USB
4. Verify connection:
   ```bash
   adb devices
   ```
5. Run the app:
   ```bash
   npm run android
   ```

## ✅ Verification

After successful build, you should see:
- ILOS Customer app installed on your device/emulator
- App opens with splash screen
- Login screen appears with CNIC input field

## 🧪 Testing the App

### Test Login
1. Enter any valid 13-digit CNIC (e.g., `3520212345678`)
2. OR tap "Continue as Guest"

### Test Application Flow
1. Tap "New Application"
2. Select a product (e.g., CashPlus)
3. Fill out the form (5 steps)
4. Save as draft OR submit

### Test Draft Functionality
1. Fill partial form
2. Tap 💾 save icon
3. Go back to home
4. Resume from "Saved Drafts" section

## 🔧 Troubleshooting

### Problem: "Cannot connect to development server"
**Solution:**
```bash
# Restart Metro bundler
npx react-native start --reset-cache --port 8083
```

### Problem: "EADDRINUSE: Port 8083 already in use"
**Solution:**
```bash
# Kill the process using port 8083
netstat -ano | findstr :8083
taskkill /PID [PID_NUMBER] /F

# Then restart
npm start
```

### Problem: "Unable to load script from assets"
**Solution:**
```bash
# Clear cache and rebuild
cd android
gradlew clean
cd ..
npm run android
```

### Problem: Backend connection fails on physical device
**Solution:**
1. Ensure phone and computer are on the same WiFi
2. Check Windows Firewall:
   ```bash
   # Allow Node.js through firewall
   netsh advfirewall firewall add rule name="Node.js" dir=in action=allow program="C:\Program Files\nodejs\node.exe" enable=yes
   ```
3. Update API_BASE_URL with your computer's local IP
4. Test backend accessibility from browser on phone:
   - Open: `http://YOUR_IP:5000/health`

### Problem: Build fails with "SDK location not found"
**Solution:**
1. Create `android/local.properties` file
2. Add:
   ```
   sdk.dir=C:\\Users\\YOUR_USERNAME\\AppData\\Local\\Android\\Sdk
   ```

### Problem: Metro bundler crashes
**Solution:**
```bash
# Clean npm cache
npm cache clean --force
rm -rf node_modules
npm install
```

## 📱 App Structure

```
Screens:
┌─────────────────────────────────────┐
│ 1. Splash Screen (2s)               │
│    └→ Check auth status             │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ 2. Login Screen                     │
│    - Enter CNIC (13 digits)         │
│    - OR Continue as Guest           │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ 3. Home Dashboard                   │
│    - Application Stats              │
│    - Quick Actions                  │
│    - Saved Drafts                   │
│    - Recent Applications            │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ 4. Product Selection                │
│    - 6 Products Available           │
│    - Filter by Category             │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ 5. Application Form (5 Steps)       │
│    Step 1: Personal Info            │
│    Step 2: Employment               │
│    Step 3: Loan & Income            │
│    Step 4: Banking                  │
│    Step 5: Review & Submit          │
│    - Auto-save every 30s            │
│    - Manual save anytime            │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ 6. Application Status               │
│    - Real-time tracking             │
│    - Progress indicator             │
│    - Timeline view                  │
└─────────────────────────────────────┘
```

## 🎯 Key Features Implemented

✅ CNIC-based authentication
✅ Guest mode support
✅ 7 product types available
✅ Multi-step application form (5 steps)
✅ Auto-save drafts (every 30 seconds)
✅ Manual save option
✅ Draft management (view, edit, delete)
✅ Application tracking with progress
✅ Application history
✅ Status filtering
✅ Pull-to-refresh
✅ Beautiful gradient UI
✅ Form validation
✅ Error handling

## 📝 Next Steps

After the app is running, you can:

1. **Customize the UI**: Modify colors, fonts, and layouts in screen components
2. **Add More Form Fields**: Extend `ApplicationFormScreen.jsx`
3. **Integrate Document Upload**: Add camera/gallery picker functionality
4. **Add Push Notifications**: Notify users of status changes
5. **Implement Biometric Auth**: Add fingerprint/face recognition
6. **Add More Products**: Extend the product catalog

## 📞 Need Help?

- Check backend logs: `D:\ILOS 2.0\backend\logs\`
- Check Metro bundler console for JavaScript errors
- Check Android logcat: `adb logcat *:E`
- Review this guide's troubleshooting section

---

**Happy Coding! 🚀**

