/**
 * Manual Automation Trigger Script
 * Use this to manually trigger automation for an existing application
 */

const db = require('./db1');
const { processNewApplication } = require('./services/automatedWorkflow');

async function triggerAutomationForApplication(losId) {
  try {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔧 MANUALLY TRIGGERING AUTOMATION FOR LOS-${losId}`);
    console.log(`${'='.repeat(60)}\n`);

    // Get application data
    const appResult = await db.query(`
      SELECT los_id, status, product_type, application_type, cnic
      FROM ilos_applications
      WHERE los_id = $1
    `, [losId]);

    if (appResult.rows.length === 0) {
      console.error(`❌ Application LOS-${losId} not found!`);
      process.exit(1);
    }

    const app = appResult.rows[0];
    console.log(`📋 Application found:`);
    console.log(`   LOS ID: ${app.los_id}`);
    console.log(`   Status: ${app.status}`);
    console.log(`   Type: ${app.product_type || app.application_type}`);

    // Get CNIC from ilos_applications table
    const cnic = app.cnic;
    
    if (!cnic) {
      console.error(`❌ Could not find CNIC for LOS-${losId}`);
      console.log(`💡 Please update the application with CNIC first`);
      process.exit(1);
    }

    console.log(`   CNIC: ${cnic}`);
    console.log(`\n🚀 Starting automated workflow...\n`);

    // Trigger automation
    const result = await processNewApplication(losId, {
      cnic: cnic,
      applicationType: app.product_type || app.application_type
    });

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ AUTOMATION COMPLETED!`);
    console.log(`${'='.repeat(60)}`);
    console.log(JSON.stringify(result, null, 2));

    process.exit(0);
  } catch (error) {
    console.error(`\n❌ ERROR:`, error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Get LOS ID from command line argument
const losId = process.argv[2];

if (!losId) {
  console.error('❌ Please provide LOS ID as argument');
  console.log('Usage: node trigger-automation.js <LOS_ID>');
  console.log('Example: node trigger-automation.js 88');
  process.exit(1);
}

triggerAutomationForApplication(parseInt(losId));

