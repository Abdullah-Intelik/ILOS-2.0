const express = require('express');
const router = express.Router();
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');
const DecisionEngineWrapper = require('../../lib/DecisionEngineWrapper');

// Configure multer for ECIB PDF uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed for ECIB reports'));
    }
  }
});

/**
 * POST /api/decision/upload-ecib
 * Upload ECIB PDF and extract data using OCR AI
 */
router.post('/upload-ecib', upload.single('ecib_pdf'), async (req, res) => {
  try {
    const { losId } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    if (!losId) {
      return res.status(400).json({ error: 'LOS ID is required' });
    }

    console.log('═'.repeat(100));
    console.log(`📤 UPLOADING ECIB PDF FOR LOS-${losId}`);
    console.log('═'.repeat(100));
    console.log(`📄 File: ${req.file.originalname}`);
    console.log(`📏 Size: ${(req.file.size / 1024).toFixed(2)} KB`);
    console.log(`🔄 Processing with OCR AI (this may take a few seconds)...`);
    console.log('');

    // Create form data for OCR API
    const formData = new FormData();
    formData.append('files', req.file.buffer, {
      filename: req.file.originalname,
      contentType: 'application/pdf'
    });

    console.log('📤 Sending eCIB to OCR service (port 8003)...');

    // Call ECIB OCR service (port 8003/extract)
    const startTime = Date.now();
    const ocrResponse = await axios.post('http://localhost:8003/extract', formData, {
      headers: formData.getHeaders(),
      timeout: 90000, // 90 seconds
      maxBodyLength: Infinity,
      maxContentLength: Infinity
    });
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    // Extract eCIB data from response
    const responseData = ocrResponse.data;
    const ecibData = responseData.results?.[0]?.result || responseData;

    console.log('═'.repeat(100));
    console.log(`✅ ECIB OCR COMPLETED FOR LOS-${losId}`);
    console.log('═'.repeat(100));
    console.log(`⏱️  Processing Time: ${duration} seconds`);
    console.log(`📊 ECIB DATA EXTRACTED (array format with ${Array.isArray(ecibData) ? ecibData.length : 0} sections)`);
    console.log('═'.repeat(100));
    console.log('');

    // Return parsed data
    res.json({
      success: true,
      los_id: losId,
      file_name: req.file.originalname,
      file_size: req.file.size,
      ecib_data: ecibData,
      uploaded_at: new Date().toISOString(),
      processing_time: `${duration}s`
    });

  } catch (error) {
    console.error('❌ Error uploading ECIB:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        error: 'ECIB OCR service is not available. Please ensure it is running on port 8003.' 
      });
    }
    
    res.status(500).json({ 
      error: error.message,
      details: error.response?.data || 'OCR service error'
    });
  }
});

/**
 * POST /api/decision/calculate
 * Calculate decision score based on application and ECIB data
 */
router.post('/calculate', async (req, res) => {
  try {
    const { losId, applicationData, ecibData, calculatedBy, notes } = req.body;

    if (!losId || !applicationData) {
      return res.status(400).json({ error: 'LOS ID and application data are required' });
    }

    console.log('═'.repeat(100));
    console.log(`🎯 CALCULATING DECISION FOR LOS-${losId} (Backend V2.0)`);
    console.log('═'.repeat(100));
    
    console.log('\n📥 RAW APPLICATION DATA RECEIVED FROM FRONTEND:');
    console.log(JSON.stringify(applicationData, null, 2));
    
    console.log('\n📥 ECIB DATA (if available):');
    console.log(ecibData ? JSON.stringify(ecibData, null, 2) : 'No ECIB data provided');

    // ========================================
    // COMPREHENSIVE DATA MAPPING (from old backend)
    // ========================================
    
    // Basic fields
    const cnic = applicationData.cnic || applicationData.applicant_cnic || applicationData.nic || applicationData.nic_or_passport;
    const firstName = applicationData.first_name || '';
    const lastName = applicationData.last_name || '';
    const fullName = applicationData.applicant_name || applicationData.full_name || applicationData.applicant_full_name || `${firstName} ${lastName}`.trim();
    
    // Address fields for City module
    const curr_house_apt = applicationData.curr_house_apt || applicationData.permanent_address || applicationData.house_number || '';
    const curr_street = applicationData.curr_street || applicationData.street || '';
    const curr_tehsil_district = applicationData.curr_tehsil_district || applicationData.district || '';
    const curr_landmark = applicationData.curr_landmark || applicationData.landmark || '';
    const curr_city = applicationData.curr_city || applicationData.city || applicationData.permanent_city || '';
    const curr_postal_code = applicationData.curr_postal_code || applicationData.postal_code || '';
    
    // Office address fields
    const office_address = applicationData.office_address || applicationData.employer_address || '';
    const office_street = applicationData.office_street || '';
    const office_district = applicationData.office_district || '';
    const office_landmark = applicationData.office_landmark || '';
    const office_city = applicationData.office_city || applicationData.employer_city || curr_city;
    const office_postal_code = applicationData.office_postal_code || '';
    const cluster = applicationData.cluster || ecibData?.cluster || '';
    
    // Age module fields
    const date_of_birth = applicationData.date_of_birth || applicationData.dob || ecibData?.date_of_birth;
    const occupation = applicationData.occupation || applicationData.employment_type || '';
    const employment_status = applicationData.employment_status || applicationData.employment_type || 'Salaried';
    
    // Income module fields
    const gross_monthly_income = parseFloat(applicationData.gross_monthly_income || applicationData.grossMonthlySalary || applicationData.gross_monthly_salary || 0);
    const total_income = parseFloat(applicationData.total_income || applicationData.net_monthly_income || applicationData.monthly_income || 0);
    const net_monthly_income = total_income;
    const length_of_employment = parseFloat(applicationData.length_of_employment || applicationData.years_of_employment || applicationData.experience_years || 0);
    const is_existing_customer = applicationData.is_existing_customer === true || applicationData.is_existing_customer === 'true';
    const salary_transfer_flag = applicationData.salary_transfer_flag === true || applicationData.salary_transfer_flag === 'true';
    const employment_type = (employment_status || 'permanent').toLowerCase();
    
    // Loan amount fields (for DBR)
    const proposed_loan_amount = parseFloat(applicationData.proposed_loan_amount || applicationData.amount_requested || applicationData.loan_amount || applicationData.price_value || applicationData.desired_loan_amount || 0);
    const amount_requested = proposed_loan_amount;
    
    // SPU flags - IMPORTANT: TRUE means CLEARED, FALSE means NOT CLEARED
    console.log('\n🔍 RAW SPU FLAGS FROM DATABASE:');
    console.log('   spu_blacklist_flag:', applicationData.spu_blacklist_flag);
    console.log('   spu_cc30k_flag:', applicationData.spu_cc30k_flag);
    console.log('   spu_negative_flag:', applicationData.spu_negative_flag);
    console.log('   spu_black_list_check:', applicationData.spu_black_list_check);
    console.log('   spu_credit_card_30k_check:', applicationData.spu_credit_card_30k_check);
    console.log('   spu_negative_list_check:', applicationData.spu_negative_list_check);
    
    const spu_black_list_check = applicationData.spu_blacklist_flag === true || applicationData.spu_black_list_check === true;
    const spu_credit_card_30k_check = applicationData.spu_cc30k_flag === true || applicationData.spu_credit_card_30k_check === true;
    const spu_negative_list_check = applicationData.spu_negative_flag === true || applicationData.spu_negative_list_check === true;
    
    console.log('\n✅ MAPPED SPU FLAGS (after conversion):');
    console.log('   spu_black_list_check:', spu_black_list_check);
    console.log('   spu_credit_card_30k_check:', spu_credit_card_30k_check);
    console.log('   spu_negative_list_check:', spu_negative_list_check);
    
    // EAMVU flag
    const eavmu_submitted = applicationData.eavmu_submitted === true || applicationData.eavmu_submitted === 'true';

    // Prepare comprehensive input for decision engine
    const engineInput = {
      // Identity
      cnic,
      applicant_name: fullName,
      first_name: firstName,
      last_name: lastName,
      date_of_birth,
      
      // Address fields (for City module)
      curr_house_apt,
      curr_street,
      curr_tehsil_district,
      curr_landmark,
      curr_city,
      curr_postal_code,
      
      // Office address
      office_address,
      office_street,
      office_district,
      office_landmark,
      office_city,
      office_postal_code,
      cluster,
      
      // City fallback
      city: curr_city,
      
      // Employment (for Age module)
      occupation,
      employment_status,
      employment_type,
      
      // Income fields (for Income module)
      gross_monthly_income,
      total_income,
      net_monthly_income,
      length_of_employment,
      is_existing_customer,
      salary_transfer_flag,
      
      // Loan fields (for DBR)
      proposed_loan_amount,
      amount_requested,
      loan_amount: proposed_loan_amount,
      tenure: applicationData.tenure || applicationData.requested_tenure_months || 12,
      requested_tenure_months: applicationData.tenure || applicationData.requested_tenure_months || 12,
      annual_rate: applicationData.annual_rate || 14.6,
      
      // SPU flags
      spu_black_list_check,
      spu_credit_card_30k_check,
      spu_negative_list_check,
      
      // EAMVU flag
      eavmu_submitted,
      
      // ECIB data
      ecib: ecibData || null
    };

    console.log('\n🔄 MAPPED FIELDS FOR DECISION ENGINE:');
    console.log(JSON.stringify(engineInput, null, 2));

    // Initialize decision engine
    const engine = new DecisionEngineWrapper();
    
    console.log('\n⚙️  RUNNING DECISION ENGINE (Backend V2.0)...\n');
    
    // Run calculation
    const result = await engine.calculateDecision(engineInput);
    
    console.log('\n📊 DECISION RESULT:');
    console.log('  Final Score:', result.final_score.toFixed(2));
    console.log('  Decision:', result.decision);
    console.log('  Risk Level:', result.risk_level);
    console.log('═'.repeat(100) + '\n');

    // Prepare database record
    const dbRecord = {
      los_id: parseInt(losId),
      application_type: applicationData.application_type || 'Unknown',
      
      // Module scores
      dbr_score: result.modules.dbr.score,
      age_score: result.modules.age.score,
      city_score: result.modules.city.score,
      income_score: result.modules.income.score,
      spu_score: result.modules.spu.score,
      eamvu_score: result.modules.eamvu.score,
      application_score: result.modules.application_score?.score || null,
      behavioral_score: result.modules.behavioral_score?.score || null,
      
      // Weighted scores
      weighted_dbr: result.weighted.dbr,
      weighted_age: result.weighted.age,
      weighted_city: result.weighted.city,
      weighted_income: result.weighted.income,
      weighted_spu: result.weighted.spu,
      weighted_eamvu: result.weighted.eamvu,
      weighted_application: result.weighted.application_score || 0,
      weighted_behavioral: result.weighted.behavioral_score || 0,
      
      // Final results
      final_score: result.final_score,
      decision: result.decision,
      risk_level: result.risk_level,
      recommendation: result.recommendation,
      
      // ECIB data
      ecib_data: ecibData ? JSON.stringify(ecibData) : null,
      
      // Audit
      calculated_by: calculatedBy || null,  // Will be NULL if no user ID provided
      notes: notes || null
    };

    console.log(`✅ Decision calculated for LOS-${losId}: ${result.decision} (Score: ${result.final_score})`);

    // Save decision to ciu_decisions table
    try {
      const { Pool } = require('pg');
      const pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'ilos_v2_demo',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'faez'
      });

      // Get application_id and party_id
      const appResult = await pool.query(
        `SELECT application_id, party_id FROM applications WHERE los_id = $1`,
        [parseInt(losId)]
      );

      if (appResult.rows.length > 0) {
        const { application_id, party_id } = appResult.rows[0];

        // Insert into ciu_decisions table
        await pool.query(`
          INSERT INTO ciu_decisions (
            application_id, los_id, party_id,
            decision, decision_date, decided_by,
            approved_amount, approved_tenure_months, approved_interest_rate,
            credit_score, dti_ratio, ecib_analysis,
            recommendation, comments
          ) VALUES (
            $1, $2, $3, $4, NOW(), $5, $6, $7, $8, $9, $10, $11, $12, $13
          )
        `, [
          application_id,
          parseInt(losId),
          party_id,
          result.decision,
          calculatedBy || null,  // Use NULL if no user ID provided (PostgreSQL accepts NULL for integer columns)
          result.decision === 'APPROVE' ? applicationData.proposed_loan_amount : 0,
          result.decision === 'APPROVE' ? (applicationData.requested_tenure_months || 12) : 0,
          result.decision === 'APPROVE' ? 15.0 : 0, // Default interest rate
          result.final_score,
          result.modules.dbr?.score || 0,
          ecibData ? JSON.stringify(ecibData) : null,
          result.recommendation,
          notes || ''
        ]);

        console.log(`✅ Decision saved to ciu_decisions table for LOS-${losId}`);
      } else {
        console.warn(`⚠️ Could not save decision - Application not found for LOS-${losId}`);
      }

      await pool.end();
    } catch (dbError) {
      console.error('❌ Error saving decision to database:', dbError.message);
      // Don't fail the request if saving fails
    }

    res.json({
      success: true,
      los_id: losId,
      result: result,
      db_record: dbRecord,
      source: 'Backend V2.0'
    });

  } catch (error) {
    console.error('❌ Error calculating decision:', error);
    
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

function createDecisionEngineRoutes() {
  return router;
}

module.exports = { createDecisionEngineRoutes };

