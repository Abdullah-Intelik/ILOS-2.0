/**
 * Party Controller
 * Handles party (customer) related operations
 */

const { PartyService } = require('../../../core/services/party.service');

class PartyController {
  constructor(db) {
    this.db = db;
    this.service = new PartyService(db);
  }

  /**
   * GET /api/v1/parties/cnic/:cnic
   * Get party by CNIC
   */
  async getByCnic(req, res, next) {
    try {
      const { cnic } = req.params;
      const party = await this.service.getByCnic(cnic);
      
      res.json({
        success: true,
        data: party
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/parties
   * Create new party
   */
  async createParty(req, res, next) {
    try {
      const party = await this.service.createParty(req.body);
      
      res.status(201).json({
        success: true,
        data: party
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/parties/:partyId
   * Update party
   */
  async updateParty(req, res, next) {
    try {
      const { partyId } = req.params;
      const party = await this.service.updateParty(parseInt(partyId), req.body);
      
      res.json({
        success: true,
        data: party
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/parties/customer-status/:cnic
   * Legacy endpoint for customer status - matches CustomerContext expected format
   */
  async getCustomerStatus(req, res, next) {
    try {
      const { cnic } = req.params;
      const party = await this.service.getByCnic(cnic);
      
      // Match the CustomerContext expected format (line 751-869 of CustomerContext.tsx)
      if (party) {
        res.json({
          cnic: party.cnic,
          customerId: party.party_id.toString(),
          status: party.customer_type || 'ETB',
          isExisting: true,
          party: party
        });
      } else {
        // NTB customer
        res.json({
          cnic: cnic,
          customerId: `NTB-${cnic}`,
          status: 'NTB',
          isExisting: false,
          party: null
        });
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/getNTB_ETB/:cnic
   * Legacy endpoint
   */
  async getNTB_ETB(req, res, next) {
    try {
      const { cnic } = req.params;
      const party = await this.service.getByCnic(cnic);
      
      res.json({
        customerType: party?.customer_type || 'NTB',
        exists: !!party
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/parties/cif/:customerId
   * Get CIF details with smart priority:
   * 1. If customer has loan applications → Use party_details (latest loan data)
   * 2. If customer only in CBS (no loans) → Use CBS data (bank account data)
   * 3. If nowhere → Return null (true NTB)
   */
  async getCifDetails(req, res, next) {
    try {
      const { customerId } = req.params;
      
      console.log(`\n🔍 Fetching CIF details for customerId: ${customerId}`);
      
      // Step 1: Check if customer has any loan applications
      const appCountResult = await this.db.query(`
        SELECT COUNT(*) as count FROM applications WHERE party_id = $1
      `, [parseInt(customerId)]);
      
      const hasApplications = parseInt(appCountResult.rows[0].count) > 0;
      
      console.log(`   Has loan applications: ${hasApplications ? 'Yes' : 'No'}`);
      
      // Step 2a: If has applications, use party_details (most recent loan data)
      if (hasApplications) {
        console.log(`   📊 Using party_details (customer has ${appCountResult.rows[0].count} loan application(s))`);
        
        const result = await this.db.query(`
          SELECT 
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
          WHERE p.party_id = $1
          LIMIT 1
        `, [parseInt(customerId)]);
        
        if (result.rows.length === 0) {
          return res.json({ success: true, data: null });
        }
        
        const party = result.rows[0];
        
        console.log(`   ✅ Found party: ${party.first_name} ${party.last_name}`);
        console.log(`   💰 Monthly Income: PKR ${party.monthly_income ? party.monthly_income.toLocaleString() : 'Not set'}`);
        console.log(`   🏢 Employer: ${party.employer_name || 'Not set'}`);
        
        // Format to match CBS structure
        const cifData = {
          fullname: `${party.first_name} ${party.last_name}`,
          individualInfo: {
            given_name1: party.first_name,
            given_name2: '',
            surname: party.last_name,
            father_husband_name: '',
            date_of_birth: party.date_of_birth,
            sex: party.gender,
            maritial_status: party.marital_status,
            country_citizenship: 'PK',
            occupation_code: '',
            title: ''
          },
          phone: {
            phone_no: party.mobile
          },
          email: {
            address: party.email
          },
          postal: {
            address: party.residential_address,
            postal_code: '',
            address_country_code: 'PK'
          },
          city: party.city,
          district: '',
          domicileCountry: party.country || 'PK',
          clientBanks: party.bank_name ? {
            customer_id: customerId,
            actt_no: party.account_number,
            bank_name: party.bank_name,
            branch: ''
          } : null,
          employment: {
            employment_type: party.employment_type,
            employer_name: party.employer_name,
            designation: party.designation,
            employment_tenure_months: party.employment_tenure_months,
            office_address: party.office_address,
            monthly_income: party.monthly_income
          }
        };
        
        return res.json({
          success: true,
          data: cifData,
          source: 'party_details' // For debugging
        });
      }
      
      // Step 2b: No applications, try CBS database
      console.log(`   🏦 Checking CBS database (customer has bank account but no loans yet)`);
      
      try {
        // Get CBS pool from database instance
        const cbsPool = this.db.cbsPool;
        
        if (!cbsPool) {
          console.warn(`   ⚠️  CBS database not connected, falling back to ILOS data`);
          return res.json({ success: true, data: null });
        }
        
        // Query CBS cif_customers table
        const cbsResult = await cbsPool.query(`
          SELECT * FROM cif_customers WHERE customer_id = $1 LIMIT 1
        `, [customerId]);
        
        if (cbsResult.rows.length === 0) {
          console.log(`   ℹ️  Customer not found in CBS - true NTB`);
          return res.json({ success: true, data: null });
        }
        
        const cbsCustomer = cbsResult.rows[0];
        
        console.log(`   ✅ Found in CBS: ${cbsCustomer.fullname || cbsCustomer.customer_name || 'Unknown'}`);
        console.log(`   🏦 Source: CBS (bank account holder, no loan history)`);
        
        // Return CBS data as-is (already in correct format)
        return res.json({
          success: true,
          data: cbsCustomer,
          source: 'cbs' // For debugging
        });
        
      } catch (cbsError) {
        console.error(`   ❌ CBS query error: ${cbsError.message}`);
        // Fallback to null if CBS fails
        return res.json({
          success: true,
          data: null,
          error: 'CBS unavailable'
        });
      }
      
    } catch (error) {
      console.error('❌ Error fetching CIF details:', error);
      next(error);
    }
  }

  /**
   * GET /api/v1/parties/:cnic/latest-application
   * Get the most recent application data for a party to enable smart pre-fill
   */
  async getLatestApplication(req, res, next) {
    try {
      const { cnic } = req.params;
      
      console.log(`\n🔍 Fetching latest application data for CNIC: ${cnic}`);
      
      // Get party info
      const partyResult = await this.db.query(`
        SELECT 
          p.*,
          pd.employment_type,
          pd.employer_name,
          pd.designation,
          pd.employment_tenure_months,
          pd.office_address,
          pd.monthly_income,
          pd.bank_name,
          pd.account_number,
          pd.updated_at as details_updated_at
        FROM parties p
        LEFT JOIN party_details pd ON p.party_id = pd.party_id
        WHERE p.cnic = $1
        LIMIT 1
      `, [cnic]);
      
      if (partyResult.rows.length === 0) {
        return res.json({
          success: true,
          isExisting: false,
          message: 'No existing customer found'
        });
      }
      
      const party = partyResult.rows[0];
      
      // Get latest application for this party
      const latestAppResult = await this.db.query(`
        SELECT 
          a.los_id,
          a.product_type,
          a.requested_amount,
          a.tenure_months,
          a.status,
          a.created_at,
          pr.product_name,
          pr.product_code
        FROM applications a
        LEFT JOIN products pr ON a.product_id = pr.product_id
        WHERE a.party_id = $1
        ORDER BY a.created_at DESC
        LIMIT 1
      `, [party.party_id]);
      
      const latestApp = latestAppResult.rows[0] || null;
      
      // Get application count
      const countResult = await this.db.query(`
        SELECT COUNT(*) as total_applications
        FROM applications
        WHERE party_id = $1
      `, [party.party_id]);
      
      const totalApplications = parseInt(countResult.rows[0].total_applications);
      
      console.log(`✅ Found existing customer: ${party.first_name} ${party.last_name}`);
      console.log(`   Total Applications: ${totalApplications}`);
      console.log(`   Latest Application: ${latestApp ? `LOS-${latestApp.los_id}` : 'None'}`);
      console.log(`   Monthly Income: PKR ${party.monthly_income ? party.monthly_income.toLocaleString() : 'Not set'}`);
      
      res.json({
        success: true,
        isExisting: true,
        data: {
          party: {
            party_id: party.party_id,
            cnic: party.cnic,
            first_name: party.first_name,
            last_name: party.last_name,
            full_name: `${party.first_name} ${party.last_name}`,
            date_of_birth: party.date_of_birth,
            gender: party.gender,
            marital_status: party.marital_status,
            mobile: party.mobile,
            email: party.email,
            residential_address: party.residential_address,
            city: party.city,
            country: party.country,
            customer_type: party.customer_type
          },
          employment: {
            employment_type: party.employment_type,
            employer_name: party.employer_name,
            designation: party.designation,
            employment_tenure_months: party.employment_tenure_months,
            employment_tenure_years: party.employment_tenure_months ? Math.floor(party.employment_tenure_months / 12) : 0,
            office_address: party.office_address,
            monthly_income: party.monthly_income,
            bank_name: party.bank_name,
            account_number: party.account_number,
            last_updated: party.details_updated_at
          },
          latest_application: latestApp ? {
            los_id: latestApp.los_id,
            product_type: latestApp.product_type,
            product_name: latestApp.product_name,
            product_code: latestApp.product_code,
            requested_amount: latestApp.requested_amount,
            tenure_months: latestApp.tenure_months,
            status: latestApp.status,
            created_at: latestApp.created_at
          } : null,
          statistics: {
            total_applications: totalApplications,
            last_application_date: latestApp ? latestApp.created_at : null
          }
        }
      });
      
    } catch (error) {
      console.error('❌ Error fetching latest application:', error);
      next(error);
    }
  }
}

module.exports = { PartyController };
