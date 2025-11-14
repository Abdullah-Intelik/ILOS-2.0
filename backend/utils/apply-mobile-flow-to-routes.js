/**
 * Bulk update script to apply mobile→PB flow to all product routes
 * This updates all product routes (except InstantLoan) to handle mobile submissions
 */

const fs = require('fs');
const path = require('path');

const routesToUpdate = [
  {
    file: 'autoloan.js',
    productType: 'AutoLoan',
    productTable: 'autoloan_applications'
  },
  {
    file: 'smeasaan.js',
    productType: 'SMEASAAN',
    productTable: 'smeasaan_applications'
  },
  {
    file: 'ameendrive.js',
    productType: 'AmeenDrive',
    productTable: 'ameendrive_applications'
  },
  {
    file: 'commercialVehicle.js',
    productType: 'CommercialVehicle',
    productTable: 'commercial_vehicle_applications'
  },
  {
    file: 'platinum_creditcard.js',
    productType: 'CreditCard',
    productTable: 'platinum_card_applications'
  },
  {
    file: 'classic_creditcard.js',
    productType: 'CreditCard',
    productTable: 'creditcard_applications'
  }
];

const routesDir = path.join(__dirname, '..', 'routes');

console.log('🔧 Starting bulk update of product routes...\n');

routesToUpdate.forEach(route => {
  const filePath = path.join(routesDir, route.file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skipping ${route.file} - file not found`);
    return;
  }
  
  console.log(`📝 Processing ${route.file}...`);
  
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Check if already updated
  if (content.includes('isMobileAppSubmission')) {
    console.log(`   ✅ Already updated - skipping\n`);
    return;
  }
  
  // 1. Add import for mobile submission handler at the top (after other imports)
  const importPattern = /const db = require\('\.\.\/db1'\);/;
  if (!content.includes('mobileSubmissionHandler')) {
    content = content.replace(
      importPattern,
      `const db = require('../db1');\n\n// Import mobile submission handler\nconst { handleMobileSubmission, isMobileAppSubmission } = require('../utils/mobileSubmissionHandler');`
    );
  }
  
  // 2. Find the POST route and add mobile submission check
  // Look for the pattern where client.query('BEGIN') is called
  const beginPattern = /(const client = await db\.connect\(\);[\s\S]*?try \{[\s\S]*?)(await client\.query\('BEGIN'\);)/;
  if (!content.includes('isMobileAppSubmission(req.body)')) {
    content = content.replace(
      beginPattern,
      (match, p1, p2) => {
        return p1 + 
          `\n  // 📱 CHECK IF THIS IS A MOBILE APP SUBMISSION (Non-Instant Loan)\n` +
          `  const isMobileSubmission = isMobileAppSubmission(req.body);\n` +
          `  \n` +
          `  if (isMobileSubmission) {\n` +
          `    console.log('📱 Detected mobile app submission for ${route.productType} - will create pending_pb_completion status');\n` +
          `  }\n\n  ` +
          p2;
      }
    );
  }
  
  // 3. Find where status is set to PB_SUBMITTED and wrap in if/else
  // This is more complex as each file has slightly different structure
  // We'll look for the automation trigger section
  const automationPattern = /\/\/ 🤖 AUTOMATION: Trigger automated workflow[\s\S]*?setImmediate\(async \(\) => \{[\s\S]*?\}\);/;
  
  if (content.match(automationPattern) && !content.includes('if (isMobileSubmission)')) {
    // Find the section before automation trigger
    const statusUpdatePattern = /(await client\.query.*PB_SUBMITTED.*\n[\s\S]*?}[\s\S]*?catch.*\n[\s\S]*?}[\s\S]*?)(\/\/ 🤖 AUTOMATION: Trigger automated workflow)/;
    
    content = content.replace(
      statusUpdatePattern,
      (match, p1, p2) => {
        return `  // 📱 HANDLE MOBILE SUBMISSION vs WEB SUBMISSION\n` +
          `  if (isMobileSubmission) {\n` +
          `    // For mobile submissions, set status to pending_pb_completion\n` +
          `    console.log(\`📱 Mobile submission detected - setting status to pending_pb_completion\`);\n` +
          `    \n` +
          `    try {\n` +
          `      await client.query(\`SELECT update_status_by_los_id($1, 'pending_pb_completion')\`, [applicationId]);\n` +
          `      console.log(\`✅ Status updated to pending_pb_completion for mobile submission \${applicationId}\`);\n` +
          `    } catch (statusError) {\n` +
          `      console.error(\`❌ Error updating status for application \${applicationId}:\`, statusError.message);\n` +
          `    }\n\n` +
          `    // Save mobile submission data and documents\n` +
          `    try {\n` +
          `      await client.query(\`\n` +
          `        INSERT INTO ilos_applications \n` +
          `        (los_id, loan_type, cnic, customer_id, status, submitted_from_mobile, mobile_submission_data, mobile_documents)\n` +
          `        VALUES ($1, '${route.productTable}', $2, $3, 'pending_pb_completion', true, $4, $5)\n` +
          `        ON CONFLICT (los_id) DO UPDATE SET\n` +
          `          status = 'pending_pb_completion',\n` +
          `          submitted_from_mobile = true,\n` +
          `          mobile_submission_data = $4,\n` +
          `          mobile_documents = $5,\n` +
          `          updated_at = NOW()\n` +
          `      \`, [\n` +
          `        applicationId, \n` +
          `        application.cnic || req.body.cnic || null, \n` +
          `        application.customer_id || req.body.customer_id || null,\n` +
          `        JSON.stringify(req.body),\n` +
          `        JSON.stringify(req.body.documents || {})\n` +
          `      ]);\n` +
          `      console.log(\`✅ Mobile submission data saved for LOS-\${applicationId}\`);\n` +
          `    } catch (e) {\n` +
          `      console.error('⚠️ Failed to save mobile submission data:', e.message);\n` +
          `    }\n\n` +
          `    // ❌ DO NOT trigger automation for mobile submissions\n` +
          `    console.log(\`📱 Automation SKIPPED for mobile submission LOS-\${applicationId} - awaiting PB completion\`);\n` +
          `    \n` +
          `  } else {\n` +
          `    // For web/PB submissions, use normal flow\n` +
          p1 +
          `    ` + p2;
      }
    );
    
    // Close the else block after automation
    content = content.replace(
      /(setImmediate\(async \(\) => \{[\s\S]*?\}\);)/,
      (match) => {
        return match + `\n  }\n`;
      }
    );
  }
  
  // 4. Update response to include status
  const responsePattern = /(res\.status\(201\)\.json\(\{[\s\S]*?success: true,[\s\S]*?losId: applicationId,)/;
  if (!content.includes('requiresPbCompletion')) {
    content = content.replace(
      responsePattern,
      (match, p1) => {
        return p1 + `\n      status: isMobileSubmission ? 'pending_pb_completion' : 'PB_SUBMITTED',\n      requiresPbCompletion: isMobileSubmission,\n      message: isMobileSubmission ? 'Application submitted successfully. Our team will review and complete your application shortly.' : 'Application submitted successfully.',`;
      }
    );
  }
  
  // Write the updated content back
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`   ✅ Updated successfully\n`);
});

console.log('✅ All product routes updated successfully!');
console.log('\n📋 Summary:');
console.log('   - ✅ Mobile submission detection added');
console.log('   - ✅ Status set to pending_pb_completion for mobile');
console.log('   - ✅ Automation skipped for mobile submissions');
console.log('   - ✅ Response includes requiresPbCompletion flag');
console.log('\n💡 InstantLoan route unchanged - remains fully automated');

