/**
 * Application Repository
 * Data access layer for applications
 */

const { BaseRepository } = require('./base.repository');

class ApplicationRepository extends BaseRepository {
  constructor(db) {
    super(db, 'applications');
  }

  /**
   * Find application by LOS ID
   */
  async findByLosId(losId) {
    return await this.findOne({ los_id: losId });
  }

  /**
   * Find applications by party (customer)
   */
  async findByParty(partyId, options = {}) {
    return await this.find({ party_id: partyId }, options);
  }

  /**
   * Find applications by status
   */
  async findByStatus(status, options = {}) {
    return await this.find({ status }, options);
  }

  /**
   * Find applications assigned to a user
   */
  async findByAssignedUser(userId, options = {}) {
    return await this.find({ assigned_to: userId }, options);
  }

  /**
   * Find applications by product type
   */
  async findByProductType(productType, options = {}) {
    return await this.find({ product_type: productType }, options);
  }

  /**
   * Get application summary (with joins)
   */
  async getApplicationSummary(losId) {
    try {
      console.log(`\n🔍 Fetching application summary for LOS-${losId}`);
      
      // Query with COMPLETE schema: applications + parties + party_details + spu_checks + eavmu_verifications
      let result;
      try {
        // Try with EAVMU join first
        result = await this.db.query(
          `SELECT 
            a.*,
            -- From parties table
            p.cnic as applicant_cnic,
            p.first_name,
            p.last_name,
            p.date_of_birth,
            p.gender,
            p.marital_status,
            p.email,
            p.mobile as customer_mobile,
            p.residential_address as permanent_address,
            p.city as permanent_city,
            p.customer_type,
            -- From party_details table
            pd.employment_type,
            pd.employer_name,
            pd.designation,
            pd.employment_tenure_months,
            pd.office_address as employer_address,
            pd.monthly_income,
            pd.bank_name,
            pd.account_number,
            -- Exposure flags (from applications table - explicitly selected for clarity)
            a.has_existing_cards,
            a.has_existing_loans,
            a.total_monthly_obligations,
            -- From spu_checks table (latest check)
            spu.overall_result as spu_overall_result,
            spu.pep_check_result as spu_pep_check,
            spu.sbp_blacklist_result as spu_blacklist_check,
            spu.nadra_verisys_result as spu_nadra_check,
            spu.internal_watchlist_result as spu_watchlist_check,
            spu.ccl_check_result as spu_ccl_check,
            spu.checked_at as spu_checked_at,
            -- From eavmu_verifications table (latest verification)
            eav.overall_result as eavmu_overall_result,
            eav.residence_verified as eavmu_residence_verified,
            eav.workplace_verified as eavmu_workplace_verified,
            eav.completed_at as eavmu_completed_at
          FROM applications a
          LEFT JOIN parties p ON a.party_id = p.party_id
          LEFT JOIN party_details pd ON p.party_id = pd.party_id
          LEFT JOIN LATERAL (
            SELECT * FROM spu_checks 
            WHERE spu_checks.application_id = a.application_id 
            ORDER BY checked_at DESC 
            LIMIT 1
          ) spu ON true
          LEFT JOIN LATERAL (
            SELECT * FROM eavmu_verifications 
            WHERE eavmu_verifications.application_id = a.application_id 
            ORDER BY assigned_at DESC 
            LIMIT 1
          ) eav ON true
          WHERE a.los_id = $1`,
          [losId]
        );
      } catch (eavmuError) {
        // If eavmu_verifications table doesn't exist, query without it
        console.log('⚠️  EAVMU table not found, querying without it');
        result = await this.db.query(
          `SELECT 
            a.*,
            p.cnic as applicant_cnic,
            p.first_name,
            p.last_name,
            p.date_of_birth,
            p.gender,
            p.marital_status,
            p.email,
            p.mobile as customer_mobile,
            p.residential_address as permanent_address,
            p.city as permanent_city,
            p.customer_type,
            pd.employment_type,
            pd.employer_name,
            pd.designation,
            pd.employment_tenure_months,
            pd.office_address as employer_address,
            pd.monthly_income,
            pd.bank_name,
            pd.account_number,
            spu.overall_result as spu_overall_result,
            spu.pep_check_result as spu_pep_check,
            spu.sbp_blacklist_result as spu_blacklist_check,
            spu.nadra_verisys_result as spu_nadra_check,
            spu.internal_watchlist_result as spu_watchlist_check,
            spu.ccl_check_result as spu_ccl_check,
            spu.checked_at as spu_checked_at
          FROM applications a
          LEFT JOIN parties p ON a.party_id = p.party_id
          LEFT JOIN party_details pd ON p.party_id = pd.party_id
          LEFT JOIN LATERAL (
            SELECT * FROM spu_checks 
            WHERE spu_checks.application_id = a.application_id 
            ORDER BY checked_at DESC 
            LIMIT 1
          ) spu ON true
          WHERE a.los_id = $1`,
          [losId]
        );
      }
      
      if (result.rows.length > 0) {
        const appData = result.rows[0];
        console.log(`✅ Found complete application data`);
        
        // Log key fields for decision engine
        console.log(`📋 Key Fields:
  - CNIC: ${appData.applicant_cnic}
  - Name: ${appData.first_name} ${appData.last_name}
  - Email: ${appData.email}
  - Income: PKR ${appData.monthly_income}
  - Amount Requested: PKR ${appData.requested_amount}
  - City: ${appData.permanent_city}
  - Customer Type: ${appData.customer_type} (NTB/ETB)
  - SPU Result: ${appData.spu_overall_result}
        `);
        
        return appData;
      }
      
      console.log(`⚠️  No application found for LOS-${losId}`);
      return null;
    } catch (error) {
      console.error('❌ Error getting application summary:', error.message);
      throw error;
    }
  }

  /**
   * Get dashboard metrics
   */
  async getDashboardMetrics() {
    try {
      const result = await this.db.query('SELECT * FROM v_dashboard_metrics');
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting dashboard metrics:', error);
      throw error;
    }
  }

  /**
   * Get workflow funnel
   */
  async getWorkflowFunnel(productType = null) {
    try {
      let query = 'SELECT * FROM v_workflow_funnel';
      const params = [];
      
      if (productType) {
        query += ' WHERE product_type = $1';
        params.push(productType);
      }
      
      const result = await this.db.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error getting workflow funnel:', error);
      throw error;
    }
  }

  /**
   * Create application with product details
   */
  async createWithProductDetails(applicationData, productDetails, productType) {
    const client = await this.db.getClient();
    
    try {
      await client.query('BEGIN');

      // 1. Create main application
      const appResult = await client.query(
        `INSERT INTO applications (
          party_id, product_id, product_type, application_type, purpose,
          requested_amount, tenure_months, status, source, submitted_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *`,
        [
          applicationData.party_id,
          applicationData.product_id,
          applicationData.product_type,
          applicationData.application_type,
          applicationData.purpose,
          applicationData.requested_amount,
          applicationData.tenure_months,
          applicationData.status || 'draft',
          applicationData.source || 'web',
          applicationData.submitted_by
        ]
      );

      const application = appResult.rows[0];

      // 2. Create product-specific details
      if (productDetails && Object.keys(productDetails).length > 0) {
        const productTableMap = {
          'personal_loan': 'product_personal_loan',
          'auto_loan': 'product_auto_loan',
          'credit_card': 'product_credit_card',
          'islamic_finance': 'product_islamic_finance'
        };

        const productTable = productTableMap[productType];
        if (productTable) {
          const columns = ['application_id', 'los_id', ...Object.keys(productDetails)];
          const values = [application.application_id, application.los_id, ...Object.values(productDetails)];
          const placeholders = columns.map((_, i) => `$${i + 1}`);

          await client.query(
            `INSERT INTO ${productTable} (${columns.join(', ')})
             VALUES (${placeholders.join(', ')})`,
            values
          );
        }
      }

      await client.query('COMMIT');
      return application;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating application with product details:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Update application status with workflow tracking
   */
  async updateStatus(losId, newStatus, userId, comments = null) {
    const client = await this.db.getClient();
    
    try {
      await client.query('BEGIN');

      // 1. Get current application
      const currentApp = await this.findByLosId(losId);
      if (!currentApp) {
        throw new Error(`Application ${losId} not found`);
      }

      // 2. Update application status and current_stage based on status
      // Map statuses to stages for workflow progression
      const statusToStageMap = {
        'submitted': 'PB',
        'spu_approved': 'EAVMU_OFFICER',
        'spu_rejected': 'RRU',
        'eavmu_assigned': 'EAVMU_OFFICER',
        'eavmu_approved': 'CIU',
        'eavmu_rejected': 'RRU',
        'ciu_approved': 'COPS',
        'ciu_rejected': 'RRU',
        'approved': 'COPS',
        'disbursed': 'DISBURSED',
        'rejected': 'RRU'
      };
      
      const newStage = statusToStageMap[newStatus] || currentApp.current_stage;
      
      // If disbursing, also update disbursed_at timestamp
      let updateQuery, updateParams;
      if (newStatus === 'disbursed') {
        updateQuery = `UPDATE applications
         SET status = $1, current_stage = $2, disbursed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE los_id = $3
         RETURNING *`;
        updateParams = [newStatus, newStage, losId];
      } else {
        updateQuery = `UPDATE applications
         SET status = $1, current_stage = $2, updated_at = CURRENT_TIMESTAMP
         WHERE los_id = $3
         RETURNING *`;
        updateParams = [newStatus, newStage, losId];
      }
      
      const updatedApp = await client.query(updateQuery, updateParams);

      // 3. Log workflow change
      await client.query(
        `INSERT INTO application_workflow (
          application_id, los_id, stage, action, performed_by,
          status_from, status_to, comments
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          currentApp.application_id,
          losId,
          newStatus,
          'status_change',
          userId,
          currentApp.status,
          newStatus,
          comments
        ]
      );

      await client.query('COMMIT');
      return updatedApp.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error updating application status:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get applications for automation queue
   */
  async getAutomationEligible(productType = null) {
    try {
      let query = `
        SELECT a.*, p.is_instant_eligible
        FROM applications a
        JOIN products p ON a.product_id = p.product_id
        WHERE a.automation_eligible = true
          AND a.status = 'submitted'
          AND a.is_automated = false
      `;
      
      const params = [];
      if (productType) {
        query += ' AND a.product_type = $1';
        params.push(productType);
      }
      
      query += ' ORDER BY a.submitted_at ASC LIMIT 100';
      
      const result = await this.db.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error getting automation eligible applications:', error);
      throw error;
    }
  }
}

module.exports = { ApplicationRepository };

