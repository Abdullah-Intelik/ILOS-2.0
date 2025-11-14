/**
 * Party Repository
 * Data access layer for parties (customers)
 */

const { BaseRepository } = require('./base.repository');

class PartyRepository extends BaseRepository {
  constructor(db) {
    super(db, 'parties');
    this.idColumn = 'party_id';
  }

  /**
   * Find party by CNIC
   */
  async findByCnic(cnic) {
    return await this.findOne({ cnic });
  }

  /**
   * Find party by CBS Customer ID
   */
  async findByCbsCustomerId(cbsCustomerId) {
    return await this.findOne({ cbs_customer_id: cbsCustomerId });
  }

  /**
   * Find party by mobile number
   */
  async findByMobile(mobile) {
    return await this.findOne({ mobile });
  }

  /**
   * Create party with details
   */
  async createWithDetails(partyData, detailsData = {}) {
    const client = await this.db.getClient();
    
    try {
      await client.query('BEGIN');

      // 1. Create party
      const partyResult = await client.query(
        `INSERT INTO parties (
          cnic, first_name, last_name, date_of_birth, gender, marital_status,
          mobile, email, residential_address, city, customer_type, cbs_customer_id, cbs_account_number
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *`,
        [
          partyData.cnic,
          partyData.first_name,
          partyData.last_name,
          partyData.date_of_birth,
          partyData.gender || null,
          partyData.marital_status || null,
          partyData.mobile,
          partyData.email || null,
          partyData.residential_address || null,
          partyData.city || null,
          partyData.customer_type || 'NTB',
          partyData.cbs_customer_id || null,
          partyData.cbs_account_number || null
        ]
      );

      const party = partyResult.rows[0];

      // 2. Create party details if provided
      if (detailsData && Object.keys(detailsData).length > 0) {
        await client.query(
          `INSERT INTO party_details (
            party_id, employment_type, employer_name, designation,
            employment_tenure_months, office_address, monthly_income,
            bank_name, account_number
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            party.party_id,
            detailsData.employment_type || null,
            detailsData.employer_name || null,
            detailsData.designation || null,
            detailsData.employment_tenure_months || null,
            detailsData.office_address || null,
            detailsData.monthly_income || null,
            detailsData.bank_name || null,
            detailsData.account_number || null
          ]
        );
      }

      await client.query('COMMIT');
      return party;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating party with details:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get party with details
   */
  async getWithDetails(partyId) {
    try {
      const result = await this.db.query(
        `SELECT 
          p.*,
          pd.employment_type,
          pd.employer_name,
          pd.designation,
          pd.employment_tenure_months,
          pd.office_address,
          pd.monthly_income,
          pd.bank_name,
          pd.account_number
        FROM parties p
        LEFT JOIN party_details pd ON p.party_id = pd.party_id
        WHERE p.party_id = $1`,
        [partyId]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting party with details:', error);
      throw error;
    }
  }

  /**
   * Update party details
   */
  async updateDetails(partyId, detailsData) {
    try {
      const columns = Object.keys(detailsData);
      const values = Object.values(detailsData);
      const setClause = columns.map((col, i) => `${col} = $${i + 1}`).join(', ');

      const query = `
        UPDATE party_details
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE party_id = $${columns.length + 1}
        RETURNING *
      `;

      values.push(partyId);
      const result = await this.db.query(query, values);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error updating party details:', error);
      throw error;
    }
  }

  /**
   * Sync with CBS
   */
  async syncWithCBS(partyId, cbsData) {
    try {
      const result = await this.db.query(
        `UPDATE parties
         SET 
           cbs_customer_id = $2,
           cbs_account_number = $3,
           cbs_sync_date = CURRENT_TIMESTAMP,
           customer_type = 'ETB',
           updated_at = CURRENT_TIMESTAMP
         WHERE party_id = $1
         RETURNING *`,
        [partyId, cbsData.customer_id, cbsData.account_number]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error syncing party with CBS:', error);
      throw error;
    }
  }
}

module.exports = { PartyRepository };

