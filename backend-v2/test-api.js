/**
 * Test API Endpoints
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:6000/api/v1';

async function test() {
  console.log('\n🧪 TESTING ILOS V2.0 API\n');
  
  try {
    // 1. Health Check
    console.log('1. Health Check...');
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Server running:', health.data.message);
    console.log('   Version:', health.data.version);
    console.log('   Bank:', health.data.bank);
    
    // 2. Get Customer (should already exist from previous test)
    console.log('\n2. Getting Customer by CNIC...');
    const party = await axios.get(`${BASE_URL}/parties/cnic/1234512345671`);
    console.log('✅ Customer found:', party.data.data.first_name, party.data.data.last_name);
    console.log('   Party ID:', party.data.data.party_id);
    console.log('   Customer Type:', party.data.data.customer_type);
    
    // 3. Create Application
    console.log('\n3. Creating Application...');
    const appData = {
      party_id: party.data.data.party_id,
      product_id: 1,
      product_code: "CASHPLUS",
      purpose: "Home Renovation",
      requested_amount: 500000,
      tenure_months: 36,
      monthly_income: 150000,
      customer_type: "ETB"
    };
    
    const app = await axios.post(`${BASE_URL}/applications`, appData);
    console.log('✅ Application created: LOS-' + app.data.data.los_id);
    console.log('   Purpose:', app.data.data.purpose);
    console.log('   Amount: PKR', app.data.data.requested_amount);
    console.log('   Tenure:', app.data.data.tenure_months, 'months');
    console.log('   Status:', app.data.data.status);
    console.log('   Automation Eligible:', app.data.data.automation_eligible);
    
    // 4. Get Application Summary
    console.log('\n4. Getting Application Summary...');
    const summary = await axios.get(`${BASE_URL}/applications/${app.data.data.los_id}/summary`);
    console.log('✅ Summary retrieved');
    console.log('   Customer:', summary.data.data.customer_name);
    console.log('   Mobile:', summary.data.data.customer_mobile);
    
    // 5. Submit Application
    console.log('\n5. Submitting Application...');
    const submitted = await axios.post(`${BASE_URL}/applications/${app.data.data.los_id}/submit`);
    console.log('✅ Application submitted');
    console.log('   New Status:', submitted.data.data.status);
    
    // 6. Dashboard Metrics
    console.log('\n6. Getting Dashboard Metrics...');
    const metrics = await axios.get(`${BASE_URL}/dashboard/metrics`);
    console.log('✅ Metrics retrieved');
    console.log('   Total Applications:', metrics.data.data.total_applications);
    console.log('   Submitted:', metrics.data.data.pending_applications);
    console.log('   Total Amount: PKR', metrics.data.data.total_requested_amount);
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 ALL TESTS PASSED!');
    console.log('='.repeat(60) + '\n');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
    process.exit(1);
  }
}

test();

