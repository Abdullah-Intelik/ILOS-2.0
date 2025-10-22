# ILOS Form Hash Integration Guide

## 🎯 **Overview**

This guide explains how to integrate blockchain hashing into your existing ILOS form submission workflows. Every time a form is submitted to a department, it will automatically create a blockchain hash for data integrity and audit purposes.

## 🔧 **How It Works**

### **Automatic Hash Creation**
When a form is submitted, the system will:
1. **Save the form data** to the database (existing functionality)
2. **Create a blockchain hash** of the form data
3. **Store the hash** with department-specific metadata
4. **Return hash information** in the response

### **Hash Structure**
Each form submission creates a unique hash with:
- **LOS ID**: `{loan_application_id}_{form_type}`
- **Department**: The department processing the form
- **Form Type**: Type of form (e.g., 'personal_details', 'employment_details')
- **Form Data**: Complete form data as JSON
- **Timestamp**: When the hash was created
- **Signer**: Who submitted the form

## 📋 **Integration Steps**

### **1. Import Hash Functions**
Add this import to your route file:
```javascript
const { createFormHashAfterSubmission } = require('./blockchain-hash');
```

### **2. Modify Form Submission Route**
Update your POST route to include hash creation:

```javascript
// POST route to insert form data with blockchain hash
router.post('/', async (req, res) => {
  const parsed = formSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.errors });

  const data = parsed.data;

  try {
    // 1. Insert into database (existing code)
    const result = await db.query(
      `INSERT INTO your_table (...) VALUES (...) RETURNING *`,
      [/* your parameters */]
    );

    // 2. Create blockchain hash for the form submission
    const department = req.headers['x-department'] || 'PB'; // Get department from header
    const signer = req.headers['x-signer'] || 'system_user';
    
    const hashResult = await createFormHashAfterSubmission(
      data.loan_application_id.toString(),
      department,
      'your_form_type', // e.g., 'personal_details', 'employment_details'
      data,
      signer
    );

    // 3. Return response with hash information
    res.status(201).json({
      success: true,
      data: result.rows[0],
      blockchain: {
        hashCreated: hashResult.success,
        hashId: hashResult.hashId,
        department: hashResult.department,
        formType: hashResult.formType,
        timestamp: hashResult.timestamp,
        blockchain: hashResult.blockchain
      },
      message: 'Form saved successfully with blockchain hash'
    });

  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
```

### **3. Set Request Headers**
When submitting forms from the frontend, include these headers:

```javascript
// Frontend form submission
const response = await fetch('/api/personal-details', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-department': 'CIU', // The department processing the form
    'x-signer': 'user123'   // The user submitting the form
  },
  body: JSON.stringify(formData)
});
```

## 🏢 **Department Integration**

### **Supported Departments**
- **PB** (Personal Banking)
- **SPU** (Small & Personal Unit)
- **COPS** (Central Operations)
- **EAMVU** (EAMVU Unit)
- **CIU** (Credit Information Unit)
- **RRU** (Risk Review Unit)
- **Risk** (Risk Management)
- **Compliance** (Compliance Department)

### **Department-Specific Hashing**
Each department will have its own hash collection, ensuring:
- **Privacy**: Department data is isolated
- **Audit Trail**: Complete history of form submissions
- **Integrity**: Tamper-evident form data

## 📊 **Response Format**

### **Successful Form Submission**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "loan_application_id": 456,
    "first_name": "John",
    "last_name": "Doe",
    // ... other form fields
  },
  "blockchain": {
    "hashCreated": true,
    "hashId": "456_personal_details",
    "department": "CIU",
    "formType": "personal_details",
    "timestamp": "2025-09-01T13:30:00.000Z",
    "blockchain": {
      "network": "ilos-hash-test-mode",
      "chaincode": "iloshash",
      "function": "CreateHash",
      "mode": "test"
    }
  },
  "message": "Personal details saved successfully with blockchain hash"
}
```

### **Hash Creation Failed**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "loan_application_id": 456,
    // ... form data
  },
  "blockchain": {
    "hashCreated": false,
    "error": "Hash service unavailable"
  },
  "message": "Form saved but hash creation failed"
}
```

## 🔍 **Hash Verification**

### **Verify Form Integrity**
```javascript
// Verify that form data hasn't been tampered with
const verifyResponse = await fetch('/api/blockchain-hash/verify-form-hash', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    losId: '456_personal_details',
    department: 'CIU',
    formData: originalFormData,
    formType: 'personal_details'
  })
});

const verifyResult = await verifyResponse.json();
if (verifyResult.data.verification?.overallMatch) {
  console.log('✅ Form data integrity verified');
} else {
  console.log('❌ Form data has been modified');
}
```

### **Get Form Hash**
```javascript
// Retrieve hash information for a form
const hashResponse = await fetch('/api/blockchain-hash/application-hash/456_personal_details/CIU');
const hashResult = await hashResponse.json();
console.log('Form hash:', hashResult.data);
```

## 🧪 **Testing Integration**

### **Test Form Submission with Hash**
```bash
# Test personal details form submission
curl -X POST http://localhost:5000/api/personal-details \
  -H "Content-Type: application/json" \
  -H "x-department: CIU" \
  -H "x-signer: test_user" \
  -d '{
    "loan_application_id": 123,
    "title": "Mr",
    "first_name": "John",
    "last_name": "Doe",
    "new_nic": "1234567890123",
    "gender": "Male",
    "marital_status": "Single",
    "date_of_birth": "1990-01-01",
    "nationality": "Pakistani"
  }'
```

### **Expected Response**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "loan_application_id": 123,
    "title": "Mr",
    "first_name": "John",
    "last_name": "Doe"
  },
  "blockchain": {
    "hashCreated": true,
    "hashId": "123_personal_details",
    "department": "CIU",
    "formType": "personal_details",
    "timestamp": "2025-09-01T13:30:00.000Z"
  },
  "message": "Personal details saved successfully with blockchain hash"
}
```

## 🔄 **Integration Examples**

### **Personal Details Form**
✅ **Already Integrated** - See `/routes/personalDetails.js`

### **Employment Details Form**
✅ **Already Integrated** - See `/routes/employmentDetails.js`

### **Other Forms to Integrate**
- Contact Details (`/routes/contactDetails.js`)
- Current Address (`/routes/currentAddress.js`)
- Permanent Address (`/routes/permanentAddress.js`)
- Vehicle Details (`/routes/vehicleDetails.js`)
- Insurance Details (`/routes/insuranceDetails.js`)
- Reference Contacts (`/routes/referenceContacts.js`)

## 🚀 **Frontend Integration**

### **Form Submission with Headers**
```javascript
// React/Next.js form submission
const handleFormSubmit = async (formData) => {
  try {
    const response = await fetch('/api/personal-details', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-department': currentDepartment, // Get from context/state
        'x-signer': currentUser.id         // Get from auth context
      },
      body: JSON.stringify(formData)
    });

    const result = await response.json();
    
    if (result.success) {
      if (result.blockchain.hashCreated) {
        console.log('✅ Form saved with blockchain hash:', result.blockchain.hashId);
        // Show success message with hash info
        showSuccessMessage(`Form saved successfully! Hash: ${result.blockchain.hashId}`);
      } else {
        console.log('⚠️ Form saved but hash creation failed');
        // Show warning message
        showWarningMessage('Form saved but blockchain hash creation failed');
      }
    } else {
      console.error('❌ Form submission failed:', result.error);
      // Show error message
      showErrorMessage('Form submission failed');
    }
  } catch (error) {
    console.error('❌ Network error:', error);
    showErrorMessage('Network error occurred');
  }
};
```

### **Hash Verification in Frontend**
```javascript
// Verify form data before displaying
const verifyFormData = async (losId, department, formType, formData) => {
  try {
    const response = await fetch('/api/blockchain-hash/verify-form-hash', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        losId: `${losId}_${formType}`,
        department,
        formData,
        formType
      })
    });

    const result = await response.json();
    
    if (result.data.verification?.overallMatch) {
      console.log('✅ Form data integrity verified');
      return true;
    } else {
      console.log('❌ Form data integrity check failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Verification error:', error);
    return false;
  }
};
```

## 🔧 **Configuration**

### **Environment Variables**
```bash
# Hash service URL (default: http://localhost:5004)
ILOS_HASH_SERVICE_URL=http://localhost:5004
```

### **Default Values**
- **Department**: Defaults to 'PB' if not specified in headers
- **Signer**: Defaults to 'system_user' if not specified in headers
- **Version**: Defaults to '1.0' for all hashes

## 🛠 **Troubleshooting**

### **Common Issues**

1. **Hash Service Not Available**
   - Check if hash service is running: `curl http://localhost:5004/health`
   - Restart hash service if needed

2. **Missing Headers**
   - Ensure `x-department` and `x-signer` headers are set
   - Check frontend code for proper header inclusion

3. **Hash Creation Fails**
   - Check hash service logs
   - Verify network connectivity between services
   - Check if required fields are present

### **Debug Commands**
```bash
# Check hash service health
curl http://localhost:5004/health

# Check backend integration
curl http://localhost:5000/api/blockchain-hash/hash-service-health

# Test form submission
curl -X POST http://localhost:5000/api/personal-details \
  -H "Content-Type: application/json" \
  -H "x-department: CIU" \
  -H "x-signer: test_user" \
  -d '{"loan_application_id": 123, "first_name": "Test"}'

# View all hashes
curl http://localhost:5000/api/blockchain-hash/all-hashes
```

## 📈 **Benefits**

### **Data Integrity**
- **Tamper Evidence**: Any modification to form data will be detected
- **Audit Trail**: Complete history of all form submissions
- **Verification**: Ability to verify data integrity at any time

### **Department Privacy**
- **Isolated Storage**: Each department's data is stored separately
- **Access Control**: Only authorized departments can access their data
- **Compliance**: Meets regulatory requirements for data integrity

### **Operational Efficiency**
- **Automatic Hashing**: No manual intervention required
- **Real-time Verification**: Instant integrity checks
- **Scalable**: Works with all existing forms and departments

---

## 🎯 **Next Steps**

1. **Test the integration** with the provided examples
2. **Integrate remaining forms** following the same pattern
3. **Update frontend** to include required headers
4. **Add hash verification** to data retrieval workflows
5. **Monitor hash creation** in production environment

The form hash integration is now ready for use! 🚀

