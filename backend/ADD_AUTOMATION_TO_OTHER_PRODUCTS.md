# Adding Automation to Other Product Routes

## ✅ Already Fixed:
- `cashplus.js` - Automation added ✅

## 🔧 Need to Fix:
- `autoloan.js`
- `smeasaan.js`  
- `ameendrive.js`
- `commercialVehicle.js`
- `platinum_creditcard.js`
- `classic_creditcard.js`

## 📝 What to Add:

Find the section where status is updated to `PB_SUBMITTED`:

```javascript
// Update application status to PB_SUBMITTED after successful submission
try {
  await client.query(`SELECT update_status_by_los_id($1, 'PB_SUBMITTED')`, [applicationId]);
  console.log(`✅ Status updated to PB_SUBMITTED for application ${applicationId}`);
} catch (statusError) {
  console.error(`❌ Error updating status for application ${applicationId}:`, statusError.message);
}
```

**Add this code RIGHT AFTER the status update (before COMMIT):**

```javascript
// 🤖 AUTOMATION: Trigger automated workflow after PB submission
const { processNewApplication } = require('../services/automatedWorkflow');
console.log(`🤖 AUTOMATION ENABLED: Triggering automated workflow for LOS-${applicationId}`);

// Trigger automation asynchronously (don't block the response)
setImmediate(async () => {
  try {
    const workflowResult = await processNewApplication(applicationId, {
      cnic: application.cnic,
      applicationType: 'PRODUCT_TYPE_HERE' // Change this for each product
    });
    console.log(`✅ Automated workflow completed for LOS-${applicationId}:`, workflowResult);
  } catch (error) {
    console.error(`❌ Automated workflow failed for LOS-${applicationId}:`, error.message);
  }
});
```

## 📋 Product Type Names:

- `autoloan.js` → `applicationType: 'AutoLoan'`
- `smeasaan.js` → `applicationType: 'SMEASAAN'`
- `ameendrive.js` → `applicationType: 'AmeenDrive'`
- `commercialVehicle.js` → `applicationType: 'CommercialVehicle'`
- `platinum_creditcard.js` → `applicationType: 'PlatinumCreditCard'`
- `classic_creditcard.js` → `applicationType: 'ClassicCreditCard'`

## ✅ Quick Test:

After adding to each file:
1. Restart backend server
2. Submit application of that product type
3. Check console - should see "🤖 AUTOMATION ENABLED"
4. Application should NOT appear in SPU
5. Application should appear in EAVMU Officer dashboard

