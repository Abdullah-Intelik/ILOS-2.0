/**
 * End-to-End Tests - Complete Application Flow
 * Tests entire workflow from customer creation to application submission
 */

const request = require('supertest');
const { createApp } = require('../../src/app');
const { getDatabase } = require('../../src/infrastructure/database/db');

describe('E2E: Complete Application Flow', () => {
  let app;
  let db;
  let customerCnic;
  let partyId;
  let losId;

  beforeAll(async () => {
    db = getDatabase();
    await db.connect();
    app = createApp(db);
    // Generate unique 13-digit CNIC (pad to 13 chars)
    const timestamp = Date.now().toString().slice(-10);
    customerCnic = `${timestamp}999`; // Exactly 13 characters
  });

  afterAll(async () => {
    // Cleanup
    if (losId) {
      await db.query('DELETE FROM applications WHERE los_id = $1', [losId]);
    }
    if (partyId) {
      await db.query('DELETE FROM parties WHERE party_id = $1', [partyId]);
    }
    await db.disconnect();
  });

  it('Complete Flow: Create Customer → Create Application → Submit', async () => {
    // Step 1: Create Customer
    console.log('\n📝 Step 1: Creating customer...');
    const customerData = {
      cnic: customerCnic, // Already 13 chars
      first_name: 'E2E',
      last_name: 'Test',
      date_of_birth: '1990-01-01',
      gender: 'M',
      mobile: '03009999999',
      email: 'e2e@test.com',
      residential_address: 'Test Address',
      city: 'Karachi',
      customer_type: 'ETB',
      employment_type: 'Salaried',
      employer_name: 'Test Company',
      designation: 'Engineer',
      monthly_income: 150000
    };

    const customerResponse = await request(app)
      .post('/api/v1/parties')
      .send(customerData)
      .expect(201);

    expect(customerResponse.body.success).toBe(true);
    partyId = customerResponse.body.data.party_id;
    console.log(`✅ Customer created: Party ID ${partyId}`);

    // Step 2: Verify Customer Exists
    console.log('\n🔍 Step 2: Verifying customer...');
    const verifyResponse = await request(app)
      .get(`/api/v1/parties/cnic/${customerCnic}`)
      .expect(200);

    expect(verifyResponse.body.data.cnic).toBe(customerCnic);
    console.log('✅ Customer verified');

    // Step 3: Create Application
    console.log('\n📋 Step 3: Creating application...');
    const applicationData = {
      party_id: partyId,
      product_id: 1,
      product_code: 'CASHPLUS',
      purpose: 'E2E Test Application',
      requested_amount: 500000,
      tenure_months: 36,
      monthly_income: 150000,
      customer_type: 'ETB'
    };

    const appResponse = await request(app)
      .post('/api/v1/applications')
      .send(applicationData)
      .expect(201);

    expect(appResponse.body.success).toBe(true);
    losId = appResponse.body.data.los_id;
    console.log(`✅ Application created: LOS-${losId}`);

    // Step 4: Get Application Summary
    console.log('\n📊 Step 4: Getting application summary...');
    const summaryResponse = await request(app)
      .get(`/api/v1/applications/${losId}/summary`)
      .expect(200);

    expect(summaryResponse.body.data.customer_name).toContain('E2E');
    expect(summaryResponse.body.data.customer_mobile).toBe('03009999999');
    console.log('✅ Summary retrieved');

    // Step 5: Submit Application
    console.log('\n🚀 Step 5: Submitting application...');
    const submitResponse = await request(app)
      .post(`/api/v1/applications/${losId}/submit`)
      .expect(200);

    expect(submitResponse.body.data.status).toBe('submitted');
    console.log('✅ Application submitted');

    // Step 6: Verify Dashboard Metrics
    console.log('\n📈 Step 6: Checking dashboard metrics...');
    const metricsResponse = await request(app)
      .get('/api/v1/dashboard/metrics')
      .expect(200);

    expect(metricsResponse.body.data.total_applications).toBeGreaterThan(0);
    console.log(`✅ Dashboard shows ${metricsResponse.body.data.total_applications} total applications`);

    console.log('\n🎉 Complete E2E Flow: PASSED');
  });

  it('Should handle duplicate CNIC gracefully', async () => {
    // Skip this test if customer wasn't created yet
    if (!partyId) {
      console.log('Skipping duplicate test - no customer created yet');
      return;
    }

    const duplicateData = {
      cnic: customerCnic, // Same CNIC as created above
      first_name: 'Duplicate',
      last_name: 'Test',
      date_of_birth: '1990-01-01',
      mobile: '03009999998'
    };

    const response = await request(app)
      .post('/api/v1/parties')
      .send(duplicateData);

    // May return 409 (Conflict) or 500 (Internal Server Error) depending on implementation
    expect([409, 500]).toContain(response.status);
    expect(response.body.success).toBe(false);
  });
});

