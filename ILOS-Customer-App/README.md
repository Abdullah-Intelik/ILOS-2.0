# ILOS Customer Mobile App

A React Native mobile application for customers to apply for loans and credit cards directly from their mobile devices.

## 📱 Features

### 🔐 Authentication
- **CNIC-based Login**: Secure authentication using 13-digit CNIC
- **Guest Mode**: Explore the app and create drafts without logging in

### 📋 Application Management
- **All Products Available**:
  - CashPlus Personal Loan
  - Auto Loan
  - Platinum Credit Card
  - Classic Credit Card
  - SMEASAAN Business Loan
  - AmeenDrive Financing
  - Commercial Vehicle Financing

### ✨ Core Features
- ✅ **Multi-Step Application Form**: User-friendly 5-step wizard for application submission
- ✅ **Auto-Save Drafts**: Automatic saving every 30 seconds
- ✅ **Manual Draft Save**: Save progress anytime
- ✅ **Draft Management**: View, edit, and delete saved drafts
- ✅ **Application Tracking**: Real-time status updates with progress indicator
- ✅ **Application History**: View all submitted applications
- ✅ **Status Filtering**: Filter applications by status (All, Pending, Completed, Rejected)
- ✅ **Refresh to Update**: Pull-to-refresh on all screens

### 📊 Dashboard
- Application statistics (Total, Pending, Approved, Rejected)
- Quick actions (New Application, My Applications)
- Recent applications and drafts
- Beautiful gradient UI

## 🏗️ App Structure

```
ILOS-Customer-App/
├── src/
│   ├── screens/
│   │   ├── SplashScreen.jsx           # App launch screen
│   │   ├── LoginScreen.jsx            # CNIC-based authentication
│   │   ├── HomeScreen.jsx             # Dashboard with stats
│   │   ├── ProductSelectionScreen.jsx # Choose product to apply
│   │   ├── ApplicationFormScreen.jsx  # Multi-step form wizard
│   │   ├── MyApplicationsScreen.jsx   # List of applications
│   │   ├── ApplicationStatusScreen.jsx # Detailed tracking view
│   │   └── DraftsScreen.jsx           # Saved drafts list
│   ├── contexts/
│   │   └── ApplicationContext.jsx     # Application state management
│   ├── navigation/
│   │   └── AppNavigator.jsx           # Screen navigation setup
│   ├── utils/
│   │   ├── api.js                     # API service layer
│   │   ├── config.js                  # App configuration
│   │   ├── validation.js              # Form validation utilities
│   │   └── storage.js                 # AsyncStorage wrapper
│   ├── components/                    # Reusable UI components
│   └── assets/                        # Images and icons
├── android/                           # Android native files
├── ios/                               # iOS native files
├── App.js                             # Root component
├── index.js                           # Entry point
└── package.json                       # Dependencies
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- React Native CLI
- Android Studio (for Android) OR Xcode (for iOS/Mac only)
- Physical Android device or emulator

### 1. Install Dependencies

```bash
cd "D:\ILOS 2.0\ILOS-Customer-App"
npm install
```

### 2. Configure API Endpoint

Edit `src/utils/config.js` and update the API_BASE_URL:

```javascript
export const API_CONFIG = {
  API_BASE_URL: 'http://10.0.2.2:5000',  // Android emulator (localhost)
  // API_BASE_URL: 'http://localhost:5000',  // iOS simulator
  // API_BASE_URL: 'http://192.168.1.XXX:5000',  // Physical device (use your computer's IP)
};
```

**For physical devices**: Replace with your computer's local IP address:
1. Open Command Prompt
2. Run `ipconfig`
3. Find your IPv4 Address (e.g., 192.168.1.100)
4. Use `http://YOUR_IP:5000` as the API_BASE_URL

### 3. Link Native Dependencies (if needed)

```bash
npx react-native link
```

### 4. Start Metro Bundler

```bash
npm start
# OR
npx react-native start --port 8083
```

### 5. Run on Android

**Using Emulator:**
1. Start Android Studio
2. Launch an Android emulator (API 30+ recommended)
3. Run:
```bash
npm run android
# OR
npx react-native run-android
```

**Using Physical Device:**
1. Enable USB Debugging on your Android device
2. Connect device via USB
3. Run:
```bash
adb devices  # Verify device is connected
npm run android
```

### 6. Run on iOS (Mac only)

```bash
cd ios
pod install
cd ..
npm run ios
```

## 📝 Usage Guide

### For Customers

#### 1. **Login**
- Enter your 13-digit CNIC (without dashes)
- Example: `3520212345678`
- OR tap "Continue as Guest" to explore the app

#### 2. **Create New Application**
- Tap "New Application" on home screen
- Select product type (Loan or Credit Card)
- Fill out the 5-step form:
  1. **Personal Info**: Name, CNIC, contact details
  2. **Employment**: Job details and salary
  3. **Loan Details**: Amount, purpose, tenure
  4. **Banking**: Bank account information
  5. **Review**: Review and submit

#### 3. **Save Drafts**
- Application auto-saves every 30 seconds
- Tap 💾 icon to manually save
- Access drafts from home screen or Drafts screen

#### 4. **Track Applications**
- View all applications in "My Applications"
- Tap any application to see detailed status
- Pull to refresh for latest updates
- Filter by: All, Pending, Completed, Rejected

## 🔌 Backend Integration

### Required Backend Endpoints

The app expects these endpoints to be available:

```javascript
// Authentication
POST /api/customer/login              // Login with CNIC
POST /api/customer/verify-cnic        // Verify CNIC

// Applications
GET  /api/customer/applications       // Get user's applications
GET  /api/applications/:id            // Get application details
GET  /api/applications/by-cnic/:cnic  // Get applications by CNIC
POST /api/cashplus                    // Submit CashPlus application
POST /api/autoloan                    // Submit AutoLoan application
POST /api/platinum_creditcard         // Submit Platinum Card application
POST /api/classic_creditcard          // Submit Classic Card application
POST /api/smeasaan                    // Submit SMEASAAN application
POST /api/ameendrive                  // Submit AmeenDrive application
POST /api/commercialVehicle           // Submit Commercial Vehicle application

// Health check
GET  /health                          // Backend health status
```

### Backend API Expected Request/Response Formats

#### Login Request:
```json
{
  "cnic": "3520212345678"
}
```

#### Login Response:
```json
{
  "success": true,
  "customer": {
    "name": "John Doe",
    "cnic": "3520212345678",
    "email": "john@example.com"
  },
  "token": "jwt_token_here"
}
```

#### Application Submission:
```json
{
  "cnic": "3520212345678",
  "firstName": "John",
  "lastName": "Doe",
  "mobileNumber": "03001234567",
  "requestedAmount": "500000",
  "loanPurpose": "Personal",
  "employmentType": "Salaried",
  "monthlySalary": "100000",
  // ... other fields
}
```

## 🎨 Customization

### Modify Product List
Edit `src/utils/config.js` > `PRODUCT_TYPES` object to add/remove products.

### Change Theme Colors
Update gradient colors in screen components:
```javascript
<LinearGradient colors={['#667eea', '#764ba2']}>
```

### Modify Form Fields
Edit `src/screens/ApplicationFormScreen.jsx` to add/remove form fields.

## 🐛 Troubleshooting

### Common Issues

**1. Metro Bundler Port Conflict**
```bash
# Kill existing Metro process
npx react-native start --reset-cache --port 8083
```

**2. Cannot Connect to Backend (Physical Device)**
- Ensure phone and computer are on same WiFi network
- Update `API_BASE_URL` with your computer's local IP
- Check firewall settings

**3. Build Errors**
```bash
# Clean and rebuild
cd android
./gradlew clean
cd ..
npm run android
```

**4. AsyncStorage Issues**
```bash
# Re-install AsyncStorage
npm install @react-native-async-storage/async-storage
npx react-native link @react-native-async-storage/async-storage
```

## 📦 Dependencies

### Core
- `react`: 19.1.0
- `react-native`: 0.80.2
- `@react-navigation/native`: ^7.1.17
- `@react-navigation/stack`: ^7.4.5

### UI Components
- `react-native-linear-gradient`: ^2.8.3
- `react-native-vector-icons`: ^10.0.0
- `@react-native-picker/picker`: ^2.11.1
- `react-native-paper`: ^5.11.0
- `react-native-toast-message`: ^2.1.7

### Storage & State
- `@react-native-async-storage/async-storage`: ^1.23.1
- Context API (built-in)

### Networking
- `axios`: ^1.6.0

### Utils
- `react-native-permissions`: ^5.4.2
- `react-native-image-picker`: ^8.2.1
- `react-native-document-picker`: ^9.1.1

## 🔐 Security Notes

- CNIC is validated on both client and server
- All API calls use secure HTTPS (in production)
- Sensitive data is stored securely using AsyncStorage
- Form validation prevents invalid submissions

## 📱 Testing

### Test Accounts

For testing, you can use any valid 13-digit CNIC format:
- `3520212345678`
- `4210198765432`

The backend should handle CNIC verification.

### Test Scenarios

1. **New User Flow**:
   - Login → Create Application → Save Draft → Resume Draft → Submit

2. **Existing User Flow**:
   - Login → View Applications → Track Status

3. **Guest Flow**:
   - Guest Login → Create Draft → Login to Submit

## 🚀 Deployment

### Android APK Generation

```bash
cd android
./gradlew assembleRelease
```

APK will be located at:
`android/app/build/outputs/apk/release/app-release.apk`

### iOS App Store (Mac only)

```bash
cd ios
xcodebuild -workspace ILOSCustomer.xcworkspace -scheme ILOSCustomer archive
```

## 📞 Support

For issues or questions:
- Check troubleshooting section above
- Review backend logs for API errors
- Check Metro bundler console for JavaScript errors

## 📄 License

This application is part of the ILOS (Integrated Loan Origination System) project.

---

**Built with ❤️ using React Native**

