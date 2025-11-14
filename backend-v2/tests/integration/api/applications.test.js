/**
 * Integration Tests - Applications API
 * Tests complete API endpoints with real database
 */

const request = require('supertest');
const { createApp } = require('../../../src/app');
const { getDatabase } = require('../../../src/infrastructure/database/db');

describe('Applications API Integration Tests', () => {
  let app;
  let db;
  let testPartyId;

  beforeAll(async () => {
    // Connect to test database
    db = getDatabase();
    await db.connect();
    app = createApp(db);

    // Create test party (CNIC must be exactly 13 chars)
    const partyResult = await db.query(
      `INSERT INTO parties (cnic, first_name, last_name, date_of_birth, mobile, customer_type)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING party_id`,
      ['9999999999999', 'Test', 'User', '1990-01-01', '03009999999', 'ETB']
    );
    testPartyId = partyResult.rows[0].party_id;
  });

  afterAll(async () => {
    // Cleanup
    await db.query('DELETE FROM applications WHERE party_id = $1', [testPartyId]);
    await db.query('DELETE FROM parties WHERE party_id = $1', [testPartyId]);
    await db.disconnect();
  });

  describe('POST /api/v1/applications', () => {
    it('should create new application', async () => {
      const applicationData = {
        party_id: testPartyId,
        product_id: 1,
        product_code: 'CASHPLUS',
        purpose: 'Test Purpose',
        requested_amount: 100000,
        tenure_months: 24,
        customer_type: 'ETB'
      };

      const response = await request(app)
        .post('/api/v1/applications')
        .send(applicationData)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('los_id');
      expect(response.body.data).toHaveProperty('application_id');
      expect(response.body.data.requested_amount).toBe('100000.00');
      expect(response.body.data.status).toBe('draft');
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .post('/api/v1/applications')
        .send({ invalid: 'data' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/applications/:losId', () => {
    let createdLosId;

    beforeAll(async () => {
      // Create application for testing
      const result = await db.query(
        `INSERT INTO applications (party_id, product_id, product_type, purpose, requested_amount, tenure_months, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING los_id`,
        [testPartyId, 1, 'personal_loan', 'Test', 100000, 24, 'draft']
      );
      createdLosId = result.rows[0].los_id;
    });

    it('should get application by LOS ID', async () => {
      const response = await request(app)
        .get(`/api/v1/applications/${createdLosId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.los_id).toBe(createdLosId);
      expect(response.body.data.purpose).toBe('Test');
    });

    it('should return 500 for non-existent LOS ID', async () => {
      const response = await request(app)
        .get('/api/v1/applications/99999')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/applications/:losId/submit', () => {
    let draftLosId;

    beforeEach(async () => {
      // Create draft application
      const result = await db.query(
        `INSERT INTO applications (party_id, product_id, product_type, purpose, requested_amount, tenure_months, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING los_id`,
        [testPartyId, 1, 'personal_loan', 'Test Submit', 100000, 24, 'draft']
      );
      draftLosId = result.rows[0].los_id;
    });

    it('should submit application successfully', async () => {
      const response = await request(app)
        .post(`/api/v1/applications/${draftLosId}/submit`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('submitted');
    });

    it('should not submit already submitted application', async () => {
      // Submit once
      await request(app).post(`/api/v1/applications/${draftLosId}/submit`);

      // Try to submit again
      const response = await request(app)
        .post(`/api/v1/applications/${draftLosId}/submit`)
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });
});

