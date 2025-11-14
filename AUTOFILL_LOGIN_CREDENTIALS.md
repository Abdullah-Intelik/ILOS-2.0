# Login Credentials Autofilled for Mobile Apps

**Date:** November 14, 2025  
**Purpose:** Faster testing and development

---

## 📱 **EAVMU Officer Mobile App**

### **Auto-filled Credentials:**
```
Username: Ahmad Hassan
Password: 001
```

### **Files Modified:**
- ✅ `ILOS-Mobile-App/src/screens/LoginScreenEnhanced.jsx`
- ✅ `ILOS-Mobile-App/src/screens/LoginScreen.jsx`

### **Agent Details:**
- **ID:** 101
- **Name:** Ahmad Hassan
- **Role:** EAVMU Officer
- **Assigned Cases:** 17 applications

---

## 📱 **Customer Mobile App**

### **Auto-filled Credentials:**
```
CNIC: 3840393463961
```

### **Files Modified:**
- ✅ `ILOS-Customer-App/src/screens/LoginScreen.jsx`

### **Customer Details:**
- **Name:** Ahmed Khan
- **CNIC:** 3840393463961
- **Type:** ETB (Existing to Bank)
- **Party ID:** 7
- **Applications:** Multiple (LOS-87, LOS-86, etc.)

---

## 🔄 **How to Use:**

### **EAVMU Officer App:**
1. Open the app
2. Credentials are pre-filled automatically
3. Just tap **"Sign In"** button
4. You'll see 17 assigned applications

### **Customer App:**
1. Open the app
2. CNIC is pre-filled automatically
3. Just tap **"Login"** or **"Continue"** button
4. You'll see your profile and can apply for loans

---

## ⚠️ **Important Notes:**

1. **Development Only:** These autofills are for testing/development purposes
2. **Production:** Remove or disable autofills before production deployment
3. **Security:** Don't commit these changes to production branches
4. **Easy Toggle:** Can be easily disabled by changing `useState('value')` back to `useState('')`

---

## 🔐 **All Available Agent Credentials:**

For testing different agents, you can manually change to:

| ID  | Username       | Password | Role          |
|-----|----------------|----------|---------------|
| 101 | Ahmad Hassan   | 001      | EAVMU Officer |
| 102 | Fatima Ali     | 002      | EAVMU Officer |
| 103 | Muhammad Khan  | 003      | EAVMU Officer |
| 104 | Aisha Sheikh   | 004      | EAVMU Officer |
| 105 | Sara Ahmed     | 005      | EAVMU Officer |

---

## 🧪 **Testing Workflow:**

### **Customer App → EAVMU App Flow:**
1. **Customer App:** Login with autofilled CNIC (3840393463961)
2. **Customer App:** Submit a loan application
3. **EAVMU App:** Login with autofilled credentials (Ahmad Hassan / 001)
4. **EAVMU App:** See the new application appear
5. **EAVMU App:** Review and approve/reject

---

## 🔧 **To Disable Autofill:**

If you want to disable autofill later, simply change:

**EAVMU Officer App:**
```javascript
// From:
const [username, setUsername] = useState('Ahmad Hassan');
const [password, setPassword] = useState('001');

// To:
const [username, setUsername] = useState('');
const [password, setPassword] = useState('');
```

**Customer App:**
```javascript
// From:
const [cnic, setCnic] = useState('3840393463961');

// To:
const [cnic, setCnic] = useState('');
```

---

## ✅ **Benefits:**

1. **Faster Testing:** No need to type credentials every time
2. **Consistent Data:** Always testing with same user (Ahmed Khan / Ahmad Hassan)
3. **Easy Switching:** Both apps now work seamlessly together
4. **Development Speed:** Reload app and test immediately

---

**Status:** ✅ **Active**  
**Environment:** Development Only  

