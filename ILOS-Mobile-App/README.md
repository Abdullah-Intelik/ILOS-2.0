# 📱 ILOS EAMVU Mobile App

A React Native mobile application for EAMVU (External Asset Management & Verification Unit) officers to manage loan applications in the field.

## 🏗️ **System Architecture**

```
Mobile App (React Native) → API Service → Backend (Node.js/Express) → Database (PostgreSQL)
```

## 🔗 **Integration with ILOS Backend**

This mobile app integrates with the existing ILOS backend system using the same APIs as the web application:

### **Backend APIs Used:**
- `GET /api/applications/department/eamvu` - Fetch EAMVU applications
- `GET /api/applications/form/:losId` - Get application details
- `POST /api/applications/update-status` - Update application status
- `POST /api/applications/update-comment` - Update comments
- `GET /api/applications/comments/:losId` - Get application comments
- `GET /api/documents/:losId` - Get application documents
- `POST /api/upload-document` - Upload documents

## 🎨 **UBL Styling Integration**

The mobile app matches the UBL branding and styling from the web application:

- **Primary Color**: `#1E40AF` (UBL Blue)
- **Secondary Color**: `#3B82F6`
- **Header Design**: Matches web app navbar styling
- **Status Colors**: Consistent with web app color scheme
- **Typography**: UBL brand fonts and styling

## 📋 **Features**

### **✅ Implemented Features**
- ✅ Real-time application fetching from backend
- ✅ Application details with full form data
- ✅ Status updates (Submit to COPS/CIU/RRU)
- ✅ Document management and status updates
- ✅ Comments system per department
- ✅ Pull-to-refresh functionality
- ✅ Error handling and retry mechanisms
- ✅ Offline-friendly with proper error states
- ✅ UBL branding and styling
- ✅ Phone call integration
- ✅ Maps integration for addresses

### **🔄 EAMVU Workflow**
1. **View Assigned Applications** - See all applications assigned to EAMVU
2. **Field Verification** - Visit applicants and verify documents
3. **Status Updates** - Submit to next department or return application
4. **Document Management** - Update document collection status
5. **Comments** - Add notes and observations

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+
- React Native CLI
- Android Studio / Xcode
- Backend server running on `localhost:5000`

### **Installation**

1. **Install Dependencies**
```bash
cd ILOS-Mobile-App
npm install
```

2. **Configure Backend URL**
Edit `src/utils/config.js`:
```javascript
development: {
  API_BASE_URL: 'http://localhost:5000', // Your backend URL
  API_TIMEOUT: 30000,
  DEBUG: true,
},
```

3. **Run the App**
```bash
# Android
npm run android

# iOS
npm run ios

# Start Metro bundler
npm start
```

## 📱 **App Screens**

### **1. Home Screen**
- Displays all EAMVU applications
- Pull-to-refresh functionality
- Application cards with key information
- UBL header with officer details

### **2. Application Detail Screen**
- Complete application information
- Document management
- Status update options
- Comments and notes
- Quick actions (call, maps)

## 🔧 **Configuration**

### **Environment Setup**
The app uses a configuration system for different environments:

```javascript
// src/utils/config.js
const ENV = {
  development: {
    API_BASE_URL: 'http://localhost:5000',
    DEBUG: true,
  },
  production: {
    API_BASE_URL: 'https://your-production-backend.vercel.app',
    DEBUG: false,
  },
};
```

### **API Configuration**
All API endpoints are centralized in the configuration:

```javascript
export const API_ENDPOINTS = {
  EAMVU_APPLICATIONS: '/api/applications/department/eamvu',
  APPLICATION_DETAILS: (losId) => `/api/applications/form/${losId}`,
  UPDATE_STATUS: '/api/applications/update-status',
  // ... more endpoints
};
```

## 📊 **Data Flow**

### **1. Application Fetching**
```
Mobile App → API Service → Backend → Database
```

### **2. Status Updates**
```
User Action → API Call → Backend Update → Database → UI Refresh
```

### **3. Error Handling**
```
API Error → Error Handler → User-Friendly Message → Retry Option
```

## 🛠️ **Development**

### **File Structure**
```
src/
├── utils/
│   ├── api.js          # API service layer
│   ├── config.js       # Configuration
│   ├── dataTransformer.js # Data transformation
│   └── mockData.js     # Mock data for testing
├── screens/
│   ├── HomeScreen.jsx      # Main applications list
│   ├── ApplicationDetailScreen.jsx # Application details
│   ├── LoginScreen.jsx     # Login screen
│   └── SplashScreen.jsx    # Splash screen
├── components/
│   └── StatusBadge.jsx     # Status badge component
└── navigation/
    └── AppNavigator.jsx    # Navigation setup
```

### **Key Components**

#### **API Service (`src/utils/api.js`)**
- Centralized API communication
- Error handling and logging
- Request/response interceptors
- Batch operations support

#### **Data Transformer (`src/utils/dataTransformer.js`)**
- Converts backend data to mobile format
- Handles different application types
- Status and priority mapping
- Currency and date formatting

#### **Configuration (`src/utils/config.js`)**
- Environment-specific settings
- API endpoints
- Error messages
- App constants

## 🔍 **Testing**

### **Backend Connection Test**
```javascript
import apiService from './src/utils/api';

// Test backend connection
const testConnection = async () => {
  const result = await apiService.testBackendConnection();
  console.log('Backend connection:', result);
};
```

### **API Endpoints Test**
```javascript
// Test EAMVU applications endpoint
const testApplications = async () => {
  try {
    const apps = await apiService.getEAMVUApplications();
    console.log('Applications:', apps);
  } catch (error) {
    console.error('Error:', error.message);
  }
};
```

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Backend Connection Failed**
   - Check if backend is running on `localhost:5000`
   - Verify network connectivity
   - Check firewall settings

2. **No Applications Showing**
   - Verify backend has EAMVU applications
   - Check API endpoint `/api/applications/department/eamvu`
   - Review backend logs for errors

3. **Status Update Failed**
   - Verify application exists in database
   - Check status values match backend expectations
   - Review backend update logic

### **Debug Mode**
Enable debug logging in `src/utils/config.js`:
```javascript
development: {
  DEBUG: true, // Set to true for detailed logs
}
```

## 📈 **Performance**

### **Optimizations**
- ✅ Lazy loading of application details
- ✅ Efficient data transformation
- ✅ Proper error handling
- ✅ Offline state management
- ✅ Pull-to-refresh for updates

### **Memory Management**
- ✅ Proper component cleanup
- ✅ Efficient list rendering
- ✅ Image optimization
- ✅ API response caching

## 🔐 **Security**

### **Implemented Security**
- ✅ Input validation
- ✅ Error message sanitization
- ✅ Secure API communication
- ✅ Environment-based configuration

## 📱 **Platform Support**

- ✅ Android (API 21+)
- ✅ iOS (iOS 12+)
- ✅ React Native 0.80.2
- ✅ Expo compatibility (if needed)

## 🚀 **Deployment**

### **Android Build**
```bash
cd android
./gradlew assembleRelease
```

### **iOS Build**
```bash
cd ios
xcodebuild -workspace ILOS.xcworkspace -scheme ILOS -configuration Release
```

## 📞 **Support**

For issues or questions:
1. Check the backend logs
2. Verify API endpoints
3. Test with Postman/curl
4. Review mobile app logs

## 🔄 **Integration Status**

### **✅ Fully Integrated**
- Application fetching
- Status updates
- Document management
- Comments system
- Error handling
- UBL styling

### **🔄 Ready for Production**
- All core features implemented
- Backend integration complete
- Error handling robust
- UI/UX polished

---

**Mobile App Status: ✅ READY FOR EAMVU OFFICERS**

The mobile app is fully integrated with the ILOS backend system and ready for EAMVU officers to use in the field for loan application verification and management.
