/**
 * Application Controller
 * Handles HTTP requests for applications
 */

const { ApplicationService } = require('../../../core/services');
const { ApplicationServiceV2 } = require('../../../core/services/application.service.v2');

class ApplicationController {
  constructor(db) {
    this.db = db;  // Store db for direct queries
    // Use V2 service for enhanced functionality
    this.service = new ApplicationServiceV2(db);
    this.legacyService = new ApplicationService(db);
  }

  /**
   * GET /api/v1/applications/form/:losId
   * Get application form data (legacy endpoint for frontend compatibility)
   */
  async getApplicationForm(req, res, next) {
    try {
      const losId = parseInt(req.params.losId);
      console.log(`📋 Fetching form data for LOS-${losId}`);
      
      // Get full application summary with all details
      const appData = await this.service.getApplicationSummary(losId);
      
      if (!appData) {
        return res.status(404).json({
          success: false,
          error: 'Application not found'
        });
      }

      // Try to fetch documents from BOTH application_documents table AND applications.documents JSONB
      try {
        // First, check if documents exist in the applications table (JSONB column from mobile app)
        const jsonbDocsResult = await this.db.query(
          `SELECT documents FROM applications WHERE los_id = $1`,
          [losId]
        );
        
        if (jsonbDocsResult.rows[0]?.documents) {
          appData.documents = jsonbDocsResult.rows[0].documents;
          console.log(`📄 Found documents in JSONB column for LOS-${losId}:`, Object.keys(appData.documents));
        } else {
          // Fallback to application_documents table
          const documentsResult = await this.db.query(
            `SELECT document_type, file_path 
             FROM application_documents 
             WHERE application_id = (SELECT application_id FROM applications WHERE los_id = $1)
             ORDER BY uploaded_at ASC`,
            [losId]
          );
          
          if (documentsResult.rows.length > 0) {
            appData.documents = documentsResult.rows;
            console.log(`📄 Found ${documentsResult.rows.length} document(s) in application_documents table for LOS-${losId}`);
          } else {
            console.log(`ℹ️  No documents found for LOS-${losId}`);
          }
        }
      } catch (docError) {
        // Documents query failed - silently fail
        console.log(`⚠️  Could not fetch documents for LOS-${losId}:`, docError.message);
      }

      // Add mapped field names for Decision Engine (keep ALL original fields)
      const mappedData = {
        ...appData,  // Keep ALL original database fields
        
        // Identity & Contact
        cnic: appData.applicant_cnic,
        applicant_name: `${appData.first_name || ''} ${appData.last_name || ''}`.trim(),
        email: appData.email,
        customer_email: appData.email,  // Frontend expects customer_email
        mobile: appData.customer_mobile,
        
        // Income
        gross_monthly_income: appData.monthly_income || 0,
        net_monthly_income: appData.monthly_income || 0,
        total_income: appData.monthly_income || 0,
        
        // Loan Amount
        proposed_loan_amount: appData.requested_amount || 0,
        amount_requested: appData.requested_amount || 0,
        loan_amount: appData.requested_amount || 0,
        
        // Address
        curr_house_apt: appData.permanent_address || '',
        curr_city: appData.permanent_city || '',
        residential_address: appData.permanent_address || '',
        
        // Office
        office_address: appData.employer_address || '',
        office_city: appData.permanent_city || '',  // Fallback to residential city
        
        // Employment
        length_of_employment: Math.floor((appData.employment_tenure_months || 0) / 12),
        years_of_employment: Math.floor((appData.employment_tenure_months || 0) / 12),
        occupation: appData.designation || '',
        
        // Customer Type
        is_existing_customer: appData.customer_type === 'ETB',
        salary_transfer_flag: false,  // Default
        
        // SPU Flags (Pass = true/cleared, Fail = false/not cleared)
        spu_blacklist_flag: appData.spu_blacklist_check === 'Pass',
        spu_cc30k_flag: appData.spu_ccl_check === 'Pass',
        spu_negative_flag: appData.spu_pep_check === 'Pass',
        spu_overall_cleared: appData.spu_overall_result === 'Pass',
        
        // EAVMU Flag
        eavmu_submitted: appData.eavmu_overall_result === 'Approved',
        eavmu_approved: appData.eavmu_overall_result === 'Approved',
      };
      
      console.log(`✅ Form data retrieved and mapped for LOS-${losId}:`, {
        name: mappedData.applicant_name,
        cnic: mappedData.cnic,
        email: mappedData.email,
        mobile: mappedData.mobile,
        gross_monthly_income: mappedData.gross_monthly_income,
        proposed_loan_amount: mappedData.proposed_loan_amount,
        curr_city: mappedData.curr_city,
        residential_address: mappedData.residential_address,
        is_existing_customer: mappedData.is_existing_customer,
        spu_result: appData.spu_overall_result,
        spu_flags: `Blacklist:${mappedData.spu_blacklist_flag}/CC30k:${mappedData.spu_cc30k_flag}/PEP:${mappedData.spu_negative_flag}`
      });
      
      // Return mapped data
      res.json({
        success: true,
        data: mappedData
      });
    } catch (error) {
      const losId = req.params.losId;
      console.error(`❌ Error fetching form for LOS-${losId}:`, error.message);
      console.error('Stack:', error.stack);
      res.status(404).json({
        success: false,
        error: 'Application not found',
        message: error.message
      });
    }
  }

  /**
   * GET /api/v1/applications/:losId
   * Get application by LOS ID with complete party details
   */
  async getApplication(req, res, next) {
    try {
      const { losId } = req.params;
      console.log(`📋 Fetching complete application data for LOS-${losId}...`);
      
      // Use getApplicationSummary to get all JOIN'd data (parties + party_details)
      const summary = await this.service.getApplicationSummary(parseInt(losId));
      
      console.log(`✅ Application data fetched for LOS-${losId}:`, {
        name: `${summary.first_name} ${summary.last_name}`,
        cnic: summary.applicant_cnic,
        email: summary.email,
        mobile: summary.customer_mobile,
        address: summary.permanent_address,
        city: summary.permanent_city,
        monthly_income: summary.monthly_income,
        employer: summary.employer_name,
        office_address: summary.employer_address,
        employment_tenure: summary.employment_tenure_months,
        bank: summary.bank_name,
        account: summary.account_number
      });
      
      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error(`❌ Error fetching application LOS-${req.params.losId}:`, error.message);
      next(error);
    }
  }

  /**
   * GET /api/v1/applications/:losId/summary
   * Get complete application summary
   */
  async getApplicationSummary(req, res, next) {
    try {
      const { losId } = req.params;
      const summary = await this.service.getApplicationSummary(parseInt(losId));
      
      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/applications/:losId/references
   * Get application references
   */
  async getReferences(req, res, next) {
    try {
      const losId = parseInt(req.params.losId);
      console.log(`📋 Fetching references for LOS-${losId}`);
      
      const result = await this.db.query(
        `SELECT * FROM application_references WHERE los_id = $1 ORDER BY reference_number`,
        [losId]
      );
      
      console.log(`✅ Found ${result.rows.length} reference(s) for LOS-${losId}`);
      
      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error(`❌ Error fetching references for LOS-${losId}:`, error);
      next(error);
    }
  }

  /**
   * GET /api/v1/applications/mobile-submissions
   * Get mobile app submissions that need PB review
   */
  async getMobileSubmissions(req, res, next) {
    try {
      console.log('📱 Fetching mobile app submissions for PB review...');
      
      // Get applications from mobile app that are in PB stage and not yet submitted by PB
      const result = await this.db.query(`
        SELECT 
          a.*,
          p.first_name,
          p.last_name,
          p.cnic,
          prod.product_name,
          prod.product_code
        FROM applications a
        LEFT JOIN parties p ON a.party_id = p.party_id
        LEFT JOIN products prod ON a.product_id = prod.product_id
        WHERE 
          a.source IN ('mobile', 'mobile_app')
          AND a.current_stage = 'PB'
          AND (a.status = 'submitted' OR a.status = 'PB')
          AND a.submitted_by IS NULL
        ORDER BY a.created_at DESC
      `);
      
      console.log(`✅ Found ${result.rows.length} mobile submissions`);
      
      // Map to frontend format
      const submissions = result.rows.map(row => ({
        losId: row.los_id,
        productType: row.product_code || row.product_type, // Use product_code first for routing
        customerName: `${row.first_name || ''} ${row.last_name || ''}`.trim(),
        cnic: row.cnic,
        amount: parseFloat(row.requested_amount),
        tenure: row.tenure_months,
        submittedAt: row.created_at,
        status: row.status,
        source: row.source,
        hasDocuments: true // Mobile submissions always have documents (CNIC, Salary Slip uploaded during OCR)
      }));
      
      res.json({
        success: true,
        count: submissions.length,
        applications: submissions
      });
    } catch (error) {
      console.error('❌ Error fetching mobile submissions:', error);
      next(error);
    }
  }

  /**
   * POST /api/v1/applications
   * Create new application
   */
  async createApplication(req, res, next) {
    try {
      const userId = req.user?.user_id || null;
      const application = await this.service.createApplication(req.body, userId);
      
      res.status(201).json({
        success: true,
        message: `Application LOS-${application.los_id} created successfully`,
        data: application
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/applications/:losId/submit
   * Submit application
   */
  async submitApplication(req, res, next) {
    try {
      const { losId } = req.params;
      const userId = req.user?.user_id || null;
      
      const application = await this.service.submitApplication(parseInt(losId), userId);
      
      res.json({
        success: true,
        message: `Application LOS-${losId} submitted successfully`,
        data: application
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/applications/:losId/status
   * Update application status
   */
  async updateStatus(req, res, next) {
    try {
      const { losId } = req.params;
      const { status, comments, department, action, spuChecks, eavmuVerification, userId: bodyUserId } = req.body;
      const userId = req.user?.user_id || bodyUserId || null;
      
      console.log(`\n🔄 Updating status for LOS-${losId}`);
      console.log(`   Department: ${department}, Action: ${action}`);
      
      const application = await this.service.updateStatus(
        parseInt(losId),
        status,
        userId,
        comments
      );
      
      // If SPU department verified application, save SPU checks
      if (department === 'SPU' && action === 'verify' && spuChecks) {
        await this.saveSPUChecks(parseInt(losId), userId, spuChecks);
      }
      
      // If EAVMU department verified application, save EAVMU verification
      if (department === 'EAVMU' && action === 'verify' && eavmuVerification) {
        await this.saveEAVMUVerification(parseInt(losId), userId, eavmuVerification);
      }
      
      // Log workflow change
      await this.logWorkflowChange(parseInt(losId), department, action, userId, status, comments);
      
      res.json({
        success: true,
        message: `Application status updated to ${status}`,
        data: application
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Save SPU checks to spu_checks table
   */
  async saveSPUChecks(losId, userId, checks) {
    try {
      console.log(`📝 Saving SPU checks for LOS-${losId}`);
      
      // Get application_id and party_id
      const appResult = await this.db.query(
        `SELECT application_id, party_id FROM applications WHERE los_id = $1`,
        [losId]
      );
      
      if (appResult.rows.length === 0) {
        console.warn(`⚠️ Application not found for LOS-${losId}`);
        return;
      }
      
      const { application_id, party_id } = appResult.rows[0];
      
      // Insert SPU check results
      await this.db.query(`
        INSERT INTO spu_checks (
          application_id, los_id, party_id,
          pep_check_result, pep_check_notes,
          sbp_blacklist_result, sbp_blacklist_notes,
          nadra_verisys_result, nadra_verisys_notes,
          internal_watchlist_result, internal_watchlist_notes,
          ccl_check_result, ccl_check_notes,
          overall_result, recommendation, checked_by, checked_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW()
        )
      `, [
        application_id, losId, party_id,
        checks.pep_check || 'Pass', checks.pep_notes || '',
        checks.blacklist_check || 'Pass', checks.blacklist_notes || '',
        checks.nadra_check || 'Pass', checks.nadra_notes || '',
        checks.watchlist_check || 'Pass', checks.watchlist_notes || '',
        checks.ccl_check || 'Pass', checks.ccl_notes || '',
        checks.overall_result || 'Pass', checks.recommendation || '', userId
      ]);
      
      console.log(`✅ SPU checks saved for LOS-${losId}`);
    } catch (error) {
      console.error(`❌ Error saving SPU checks:`, error.message);
    }
  }
  
  /**
   * Save EAVMU verification to eavmu_verifications table
   */
  async saveEAVMUVerification(losId, userId, verification) {
    try {
      console.log(`📝 Saving EAVMU verification for LOS-${losId}`);
      
      // Get application_id and party_id
      const appResult = await this.db.query(
        `SELECT application_id, party_id FROM applications WHERE los_id = $1`,
        [losId]
      );
      
      if (appResult.rows.length === 0) {
        console.warn(`⚠️ Application not found for LOS-${losId}`);
        return;
      }
      
      const { application_id, party_id } = appResult.rows[0];
      
      // Insert EAVMU verification results
      await this.db.query(`
        INSERT INTO eavmu_verifications (
          application_id, los_id, party_id, assigned_to,
          residence_verified, residence_verification_notes,
          workplace_verified, workplace_verification_notes,
          document_verification, reference_verification,
          overall_result, recommendation, completed_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW()
        )
      `, [
        application_id, 
        losId, 
        party_id, 
        userId,
        verification.residence_verified || false, 
        verification.verification_notes || verification.residence_notes || '',
        verification.workplace_verified || false, 
        verification.verification_notes || verification.workplace_notes || '',
        verification.documents_uploaded || verification.document_verified || false, 
        verification.reference_verified || false,
        verification.overall_result || 'Approved', 
        verification.verification_notes || verification.recommendation || ''
      ]);
      
      console.log(`✅ EAVMU verification saved for LOS-${losId}`);
    } catch (error) {
      console.error(`❌ Error saving EAVMU verification:`, error.message);
    }
  }
  
  /**
   * Log workflow change to application_workflow table
   */
  async logWorkflowChange(losId, stage, action, userId, newStatus, comments) {
    try {
      // Get application_id
      const appResult = await this.db.query(
        `SELECT application_id FROM applications WHERE los_id = $1`,
        [losId]
      );
      
      if (appResult.rows.length === 0) {
        return;
      }
      
      const application_id = appResult.rows[0].application_id;
      
      // Insert workflow log
      await this.db.query(`
        INSERT INTO application_workflow (
          application_id, los_id, stage, action,
          performed_by, status_to, comments
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        application_id, losId, stage || 'Unknown', action || 'update',
        userId, newStatus, comments || ''
      ]);
      
      console.log(`✅ Workflow logged: ${stage} - ${action}`);
    } catch (error) {
      console.error(`❌ Error logging workflow:`, error.message);
    }
  }

  /**
   * GET /api/v1/applications/party/:partyId
   * Get applications by party
   */
  async getByParty(req, res, next) {
    try {
      const { partyId } = req.params;
      const { limit, offset } = req.query;
      
      const applications = await this.service.getByParty(parseInt(partyId), {
        limit: limit ? parseInt(limit) : 100,
        offset: offset ? parseInt(offset) : 0
      });
      
      res.json({
        success: true,
        count: applications.length,
        data: applications
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/applications/status/:status
   * Get applications by status
   */
  async getByStatus(req, res, next) {
    try {
      const { status } = req.params;
      const { limit, offset } = req.query;
      
      const applications = await this.service.getByStatus(status, {
        limit: limit ? parseInt(limit) : 100,
        offset: offset ? parseInt(offset) : 0
      });
      
      res.json({
        success: true,
        count: applications.length,
        data: applications
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/applications/assigned
   * Get assigned applications
   */
  async getAssignedApplications(req, res, next) {
    try {
      const userId = req.user?.user_id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }
      
      const applications = await this.service.getAssignedApplications(userId);
      
      res.json({
        success: true,
        count: applications.length,
        data: applications
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/dashboard/metrics
   * Get dashboard metrics
   */
  async getDashboardMetrics(req, res, next) {
    try {
      const metrics = await this.service.getDashboardMetrics();
      
      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get applications by department (legacy endpoint for frontend compatibility)
   */
  async getByDepartment(req, res, next) {
    try {
      const { department } = req.params;
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 10;
      const offset = (page - 1) * pageSize;

      console.log(`📊 Fetching applications for department: ${department}, page: ${page}, pageSize: ${pageSize}`);

      // Map department to current_stage
      const stageMap = {
        'PB': 'PB',
        'SPU': 'SPU',
        'EAVMU': 'EAVMU_OFFICER', // EAVMU department = EAVMU_OFFICER stage
        'EAMVU': 'EAVMU_OFFICER', // Handle both spellings
        'EAVMUOFFICER': 'EAVMU_OFFICER', // Mobile app uses this
        'CIU': 'CIU',
        'COPS': 'COPS',
        'RISK': 'RISK',
        'COMPLIANCE': 'COMPLIANCE'
      };
      
      const stage = stageMap[department] || department;
      console.log(`   Filtering by stage: ${stage}`);

      // Get paginated applications with basic joins for display
      // PB shows ALL applications, other departments filter by stage
      const isPB = department === 'PB';
      
      let query, countQuery, params;
      
      if (isPB) {
        // PB Dashboard: Show ALL applications (including disbursed for tracking)
        query = `SELECT 
          a.los_id,
          a.party_id,
          a.product_type,
          a.requested_amount,
          a.tenure_months,
          a.status,
          a.current_stage,
          a.assigned_to,
          a.created_at,
          a.updated_at,
          a.disbursed_at,
          p.first_name,
          p.last_name,
          p.cnic,
          prod.product_name,
          prod.product_code
         FROM applications a
         LEFT JOIN parties p ON a.party_id = p.party_id
         LEFT JOIN products prod ON a.product_id = prod.product_id
         WHERE a.status NOT IN ('rejected')
         ORDER BY a.created_at DESC 
         LIMIT $1 OFFSET $2`;
        
        countQuery = `SELECT COUNT(*) as count FROM applications WHERE status NOT IN ('rejected')`;
        params = [pageSize, offset];
      } else {
        // Other departments: Filter by current_stage OR special conditions
        const isCIU = department === 'CIU';
        const isRRU = department === 'RRU';
        
        if (isCIU) {
          // CIU: Show current CIU applications AND disbursed ones
          query = `SELECT 
            a.los_id,
            a.party_id,
            a.product_type,
            a.requested_amount,
            a.tenure_months,
            a.status,
            a.current_stage,
            a.assigned_to,
            a.created_at,
            a.updated_at,
            a.disbursed_at,
            p.first_name,
            p.last_name,
            p.cnic,
            prod.product_name,
            prod.product_code
           FROM applications a
           LEFT JOIN parties p ON a.party_id = p.party_id
           LEFT JOIN products prod ON a.product_id = prod.product_id
           WHERE (a.current_stage = $1 OR a.status = 'disbursed')
           ORDER BY a.created_at DESC 
           LIMIT $2 OFFSET $3`;
          
          countQuery = `SELECT COUNT(*) as count FROM applications WHERE (current_stage = $1 OR status = 'disbursed')`;
          params = [stage, pageSize, offset];
        } else if (isRRU) {
          // RRU: Show ALL rejected applications (from any department)
          console.log('🔍 RRU: Fetching ALL rejected applications from any stage');
          query = `SELECT 
            a.los_id,
            a.party_id,
            a.product_type,
            a.requested_amount,
            a.tenure_months,
            a.status,
            a.current_stage,
            a.assigned_to,
            a.created_at,
            a.updated_at,
            p.first_name,
            p.last_name,
            p.cnic,
            prod.product_name,
            prod.product_code
           FROM applications a
           LEFT JOIN parties p ON a.party_id = p.party_id
           LEFT JOIN products prod ON a.product_id = prod.product_id
           WHERE a.status IN ('rejected', 'eavmu_rejected', 'ciu_rejected', 'spu_rejected')
           ORDER BY a.updated_at DESC 
           LIMIT $1 OFFSET $2`;
          
          countQuery = `SELECT COUNT(*) as count FROM applications WHERE status IN ('rejected', 'eavmu_rejected', 'ciu_rejected', 'spu_rejected')`;
          params = [pageSize, offset];
        } else {
          // Other departments: Standard filtering
          query = `SELECT 
            a.los_id,
            a.party_id,
            a.product_type,
            a.requested_amount,
            a.tenure_months,
            a.status,
            a.current_stage,
            a.assigned_to,
            a.created_at,
            a.updated_at,
            p.first_name,
            p.last_name,
            p.cnic,
            prod.product_name,
            prod.product_code
           FROM applications a
           LEFT JOIN parties p ON a.party_id = p.party_id
           LEFT JOIN products prod ON a.product_id = prod.product_id
           WHERE a.current_stage = $1
           ORDER BY a.created_at DESC 
           LIMIT $2 OFFSET $3`;
          
          countQuery = 'SELECT COUNT(*) as count FROM applications WHERE current_stage = $1';
          params = [stage, pageSize, offset];
        }
      }
      
      const result = await this.db.query(query, params);

      // Get total count
      const isRRU = department === 'RRU';
      const countResult = await this.db.query(
        countQuery,
        isPB ? [] : (isRRU ? [] : [stage])
      );
      const total = parseInt(countResult.rows[0].count);

      console.log(`✅ Found ${result.rows.length} applications (total: ${total})`);

      // Format data for frontend compatibility
      const formattedData = result.rows.map(row => ({
        id: `LOS-${row.los_id}`,
        los_id: row.los_id,
        applicant_name: `${row.first_name || ''} ${row.last_name || ''}`.trim() || 'N/A',
        applicantName: `${row.first_name || ''} ${row.last_name || ''}`.trim() || 'N/A',
        cnic: row.cnic || 'N/A',
        loan_type: row.product_name || row.product_code || row.product_type || 'N/A',
        product: row.product_name || row.product_code || row.product_type || 'N/A',
        productType: row.product_type,
        productCode: row.product_code,
        loan_amount: row.requested_amount,
        amount: row.requested_amount,
        assigned_to: row.assigned_to,
        tenure: row.tenure_months,
        status: row.status,
        current_stage: row.current_stage,
        priority: 'Medium', // Default priority
        created_at: row.created_at,
        updated_at: row.updated_at,
        submittedAt: row.created_at,
        updatedAt: row.updated_at,
        disbursed_at: row.disbursed_at
      }));

      res.json({
        success: true,
        data: formattedData,
        total: total,
        page: page,
        pageSize: pageSize
      });
    } catch (error) {
      console.error('❌ Error getting applications by department:', error.message);
      console.error('Stack:', error.stack);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch applications',
        message: error.message
      });
    }
  }

  /**
   * Get SPU checklist for application
   * @route GET /api/v1/applications/spu-checklist/:losId
   */
  async getSPUChecklist(req, res, next) {
    try {
      const losId = parseInt(req.params.losId);
      
      console.log(`\n🔍 Fetching SPU checklist for LOS-${losId}`);
      
      const result = await this.db.query(
        'SELECT * FROM spu_checks WHERE los_id = $1 ORDER BY checked_at DESC LIMIT 1',
        [losId]
      );
      
      if (result.rows.length === 0) {
        console.log(`⚠️ No SPU checks found for LOS-${losId}`);
        return res.status(404).json({ 
          success: false, 
          error: 'No SPU checks found for this application' 
        });
      }
      
      console.log(`✅ SPU checklist fetched for LOS-${losId}`);
      
      res.json({ 
        success: true, 
        checklist: result.rows[0] 
      });
      
    } catch (error) {
      console.error('❌ Error fetching SPU checklist:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  /**
   * Get all comments for application
   * @route GET /api/v1/applications/:losId/comments
   */
  async getComments(req, res, next) {
    try {
      const losId = parseInt(req.params.losId);
      
      console.log(`\n💬 Fetching comments for LOS-${losId}`);
      
      let allComments = [];
      
      // Fetch regular comments
      try {
        const commentsResult = await this.db.query(`
          SELECT 
            c.*,
            u.full_name as created_by_name
          FROM application_comments c
          LEFT JOIN users u ON c.created_by = u.user_id
          WHERE c.los_id = $1
          ORDER BY c.created_at DESC
        `, [losId]);
        
        allComments = [...commentsResult.rows];
        console.log(`✅ Fetched ${commentsResult.rows.length} regular comments for LOS-${losId}`);
      } catch (commentError) {
        console.warn('⚠️ Could not fetch regular comments:', commentError.message);
      }
      
      // Fetch EAVMU verification notes and format as comments
      try {
        const eavmuResult = await this.db.query(`
          SELECT 
            ev.verification_id,
            ev.los_id,
            ev.assigned_to,
            COALESCE(
              ev.recommendation,
              ev.residence_verification_notes,
              ev.workplace_verification_notes,
              ev.document_verification_notes,
              'No verification notes'
            ) as comment_text,
            ev.completed_at as created_at,
            'EAVMU' as department,
            u.full_name as created_by_name
          FROM eavmu_verifications ev
          LEFT JOIN users u ON ev.assigned_to = u.user_id
          WHERE ev.los_id = $1
          ORDER BY ev.completed_at DESC
        `, [losId]);
        
        const eavmuComments = eavmuResult.rows.map(row => ({
          comment_id: `eavmu_${row.verification_id}`,
          los_id: row.los_id,
          department: 'EAVMU',
          comment_text: row.comment_text,
          created_by: row.assigned_to,
          created_by_name: row.created_by_name,
          created_at: row.created_at
        }));
        
        allComments = [...allComments, ...eavmuComments];
        console.log(`✅ Fetched ${eavmuResult.rows.length} EAVMU notes for LOS-${losId}`);
      } catch (eavmuError) {
        console.warn('⚠️ Could not fetch EAVMU comments (table may not exist):', eavmuError.message);
      }
      
      // Sort all comments by date
      allComments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      console.log(`✅ Total comments for LOS-${losId}: ${allComments.length}`);
      
      res.json({ 
        success: true, 
        comments: allComments 
      });
      
    } catch (error) {
      console.error('❌ Error fetching comments:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  /**
   * Add comment to application
   * @route POST /api/v1/applications/:losId/comments
   */
  async addComment(req, res, next) {
    try {
      const losId = parseInt(req.params.losId);
      const { department, comment_text, comment_type, created_by, severity, is_internal } = req.body;
      
      console.log(`\n💬 Adding comment to LOS-${losId} from ${department}`);
      
      const result = await this.db.query(`
        INSERT INTO application_comments 
        (application_id, los_id, department, comment_text, comment_type, created_by, severity, is_internal, is_system_generated)
        SELECT application_id, $1, $2, $3, $4, $5, $6, $7, false
        FROM applications WHERE los_id = $1
        RETURNING *
      `, [losId, department, comment_text, comment_type || 'Note', created_by, severity || 'Low', is_internal || false]);
      
      console.log(`✅ Comment added to LOS-${losId}`);
      
      res.json({ 
        success: true, 
        comment: result.rows[0] 
      });
      
    } catch (error) {
      console.error('❌ Error adding comment:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  /**
   * Get EAVMU verification details
   * @route GET /api/v1/applications/:losId/eavmu-verification
   */
  async getEAVMUVerification(req, res, next) {
    try {
      const losId = parseInt(req.params.losId);
      
      console.log(`\n🔍 Fetching EAVMU verification for LOS-${losId}`);
      
      const result = await this.db.query(
        'SELECT * FROM eavmu_verifications WHERE los_id = $1',
        [losId]
      );
      
      console.log(`✅ EAVMU verification fetched for LOS-${losId}`);
      
      res.json({ 
        success: true, 
        verification: result.rows[0] || null 
      });
      
    } catch (error) {
      console.error('❌ Error fetching EAVMU verification:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  /**
   * Update EAVMU verification
   * @route POST /api/v1/applications/:losId/eavmu-verification
   */
  async updateEAVMUVerification(req, res, next) {
    try {
      const losId = parseInt(req.params.losId);
      const { 
        residence_verified, residence_verification_notes,
        workplace_verified, workplace_verification_notes,
        overall_result, recommendation, assigned_to 
      } = req.body;
      
      console.log(`\n🔍 Updating EAVMU verification for LOS-${losId}`);
      
      const result = await this.db.query(`
        INSERT INTO eavmu_verifications (
          application_id, los_id, party_id, assigned_to,
          residence_verified, residence_verification_notes,
          workplace_verified, workplace_verification_notes,
          overall_result, recommendation
        )
        SELECT application_id, $1, party_id, $2, $3, $4, $5, $6, $7, $8
        FROM applications WHERE los_id = $1
        ON CONFLICT (application_id) DO UPDATE SET
          residence_verified = EXCLUDED.residence_verified,
          residence_verification_notes = EXCLUDED.residence_verification_notes,
          workplace_verified = EXCLUDED.workplace_verified,
          workplace_verification_notes = EXCLUDED.workplace_verification_notes,
          overall_result = EXCLUDED.overall_result,
          recommendation = EXCLUDED.recommendation,
          completed_at = CASE WHEN EXCLUDED.overall_result IN ('Approved', 'Rejected') THEN CURRENT_TIMESTAMP ELSE NULL END
        RETURNING *
      `, [losId, assigned_to, residence_verified, residence_verification_notes, 
          workplace_verified, workplace_verification_notes, overall_result, recommendation]);
      
      console.log(`✅ EAVMU verification updated for LOS-${losId}`);
      
      res.json({ 
        success: true, 
        verification: result.rows[0] 
      });
      
    } catch (error) {
      console.error('❌ Error updating EAVMU verification:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
}

module.exports = { ApplicationController };

