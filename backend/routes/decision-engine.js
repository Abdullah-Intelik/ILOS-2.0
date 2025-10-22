const express = require('express');
const router = express.Router();
const db = require('../db1');
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');
const DecisionEngineWrapper = require('../lib/DecisionEngineWrapper');

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
 * GET /api/decision/application-data/:losId
 * Fetch all application data needed for decision engine
 */
router.get('/application-data/:losId', async (req, res) => {
  try {
    const { losId } = req.params;
    console.log(`📥 Fetching application data for LOS-${losId}`);

    // Get application type from ilos_applications
    const appTypeResult = await db.query(`
      SELECT los_id, loan_type, status, 
             spu_black_list_check as spu_blacklist_flag, 
             spu_credit_card_30k_check as spu_cc30k_flag, 
             spu_negative_list_check as spu_negative_flag, 
             eavmu_submitted, cops_submitted
      FROM ilos_applications 
      WHERE los_id = $1
    `, [losId]);

    if (appTypeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const appInfo = appTypeResult.rows[0];
    const loanType = appInfo.loan_type;
    
    // Map loan_type (table name) to application type (display name)
    const typeDisplayMap = {
      'cashplus_applications': 'CashPlus',
      'autoloan_applications': 'AutoLoan',
      'smeasaan_applications': 'SMEASAAN',
      'commercial_vehicle_applications': 'CommercialVehicle',
      'ameendrive_applications': 'AmeenDrive',
      'platinum_card_applications': 'PlatinumCreditCard',
      'creditcard_applications': 'ClassicCreditCard'
    };
    
    const appType = typeDisplayMap[loanType] || loanType;
    
    // loan_type is already the table name
    const tableName = loanType;
    if (!tableName) {
      return res.status(400).json({ error: 'Invalid application type' });
    }

    // Fetch detailed application data
    const appDataResult = await db.query(`
      SELECT * FROM ${tableName} WHERE id = $1
    `, [losId]);

    if (appDataResult.rows.length === 0) {
      return res.status(404).json({ error: 'Application details not found' });
    }

    const appData = appDataResult.rows[0];

    // Check if decision already exists
    const existingDecision = await db.query(`
      SELECT * FROM decision_engine_results WHERE los_id = $1
    `, [losId]);

    // Prepare response
    const response = {
      los_id: parseInt(losId),
      application_type: appType,
      table_name: tableName,
      ilos_flags: {
        spu_blacklist_flag: appInfo.spu_blacklist_flag,
        spu_cc30k_flag: appInfo.spu_cc30k_flag,
        spu_negative_flag: appInfo.spu_negative_flag,
        eavmu_submitted: appInfo.eavmu_submitted,
        cops_submitted: appInfo.cops_submitted,
        status: appInfo.status
      },
      application_data: appData,
      has_existing_decision: existingDecision.rows.length > 0,
      existing_decision: existingDecision.rows.length > 0 ? existingDecision.rows[0] : null
    };

    console.log(`✅ Application data fetched for LOS-${losId}`);
    res.json(response);

  } catch (error) {
    console.error('❌ Error fetching application data:', error);
    res.status(500).json({ error: error.message });
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
    console.log(`🔄 Processing with OCR AI (this may take 30-60 seconds)...`);
    console.log('');

    // Create form data for OCR API
    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: 'application/pdf'
    });

    // Call ECIB OCR API
    const startTime = Date.now();
    const ocrResponse = await axios.post('http://localhost:8004/ocr/pdf', formData, {
      headers: {
        ...formData.getHeaders()
      },
      timeout: 90000 // 90 seconds timeout (increased for large PDFs)
    });
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    const ecibData = ocrResponse.data;

    console.log('═'.repeat(100));
    console.log(`✅ ECIB OCR COMPLETED FOR LOS-${losId}`);
    console.log('═'.repeat(100));
    console.log(`⏱️  Processing Time: ${duration} seconds`);
    console.log(`📊 ECIB DATA EXTRACTED:`);
    console.log(JSON.stringify(ecibData, null, 2));
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
        error: 'ECIB OCR service is not available. Please ensure it is running on port 8004.' 
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
    const { losId, applicationData, ecibData, calculatedBy } = req.body;

    if (!losId || !applicationData) {
      return res.status(400).json({ error: 'LOS ID and application data are required' });
    }

    console.log('═'.repeat(100));
    console.log(`🎯 CALCULATING DECISION FOR LOS-${losId}`);
    console.log('═'.repeat(100));
    
    console.log('\n📥 RAW APPLICATION DATA RECEIVED FROM FRONTEND:');
    console.log(JSON.stringify(applicationData, null, 2));
    
    console.log('\n📥 ECIB DATA (if available):');
    console.log(ecibData ? JSON.stringify(ecibData, null, 2) : 'No ECIB data provided');

    // ========================================
    // COMPREHENSIVE DATA MAPPING
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
    const office_city = applicationData.office_city || applicationData.employer_city || curr_city; // Fallback to current city
    const office_postal_code = applicationData.office_postal_code || '';
    const cluster = applicationData.cluster || ecibData?.cluster || ''; // Can come from ECIB
    
    // Age module fields
    const date_of_birth = applicationData.date_of_birth || applicationData.dob || ecibData?.date_of_birth;
    const occupation = applicationData.occupation || applicationData.employment_type || '';
    const employment_status = applicationData.employment_status || applicationData.employment_type || 'Salaried';
    
    // Income module fields
    const gross_monthly_income = parseFloat(applicationData.gross_monthly_income || applicationData.grossMonthlySalary || applicationData.gross_monthly_salary || 0);
    const total_income = parseFloat(applicationData.total_income || applicationData.net_monthly_income || applicationData.monthly_income || 0);
    const net_monthly_income = total_income; // Alias for consistency
    const length_of_employment = parseFloat(applicationData.length_of_employment || applicationData.years_of_employment || applicationData.experience_years || 0);
    const is_ubl_customer = applicationData.is_ubl_customer === true || applicationData.is_ubl_customer === 'true';
    const salary_transfer_flag = applicationData.salary_transfer_flag === true || applicationData.salary_transfer_flag === 'true';
    const employment_type = (employment_status || 'permanent').toLowerCase();
    
    // Loan amount fields (for DBR)
    const proposed_loan_amount = parseFloat(applicationData.proposed_loan_amount || applicationData.amount_requested || applicationData.loan_amount || applicationData.price_value || applicationData.desired_loan_amount || 0);
    const amount_requested = proposed_loan_amount; // Alias
    
    // SPU flags
    // IMPORTANT: Boolean semantics - TRUE means CLEARED/VERIFIED, FALSE means NOT CLEARED
    // The SPU module will invert these to detect hits (see SPU.js for details)
    const spu_black_list_check = applicationData.spu_blacklist_flag === true || applicationData.spu_black_list_check === true;
    const spu_credit_card_30k_check = applicationData.spu_cc30k_flag === true || applicationData.spu_credit_card_30k_check === true;
    const spu_negative_list_check = applicationData.spu_negative_flag === true || applicationData.spu_negative_list_check === true;
    
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
      
      // City fallback (if no specific address fields)
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
      is_ubl_customer,
      salary_transfer_flag,
      
      // Loan fields (for DBR)
      proposed_loan_amount,
      amount_requested,
      loan_amount: proposed_loan_amount,
      
      // SPU flags
      spu_black_list_check,
      spu_credit_card_30k_check,
      spu_negative_list_check,
      
      // EAMVU flag
      eavmu_submitted,
      
      // ECIB data (if provided)
      ecib: ecibData || null
    };

    console.log('\n🔄 MAPPED FIELDS FOR DECISION ENGINE:');
    console.log('═'.repeat(100));
    
    console.log('\n👤 IDENTITY:');
    console.log('  • Applicant Name:', engineInput.applicant_name || 'N/A');
    console.log('  • CNIC:', engineInput.cnic || 'N/A');
    console.log('  • Date of Birth:', engineInput.date_of_birth || 'N/A');
    
    console.log('\n🏠 ADDRESS FIELDS (for City Module):');
    console.log('  • Current House/Apt:', engineInput.curr_house_apt || 'N/A');
    console.log('  • Current Street:', engineInput.curr_street || 'N/A');
    console.log('  • Current District:', engineInput.curr_tehsil_district || 'N/A');
    console.log('  • Current Landmark:', engineInput.curr_landmark || 'N/A');
    console.log('  • Current City:', engineInput.curr_city || 'N/A');
    console.log('  • Current Postal Code:', engineInput.curr_postal_code || 'N/A');
    console.log('  • Office Address:', engineInput.office_address || 'N/A');
    console.log('  • Office City:', engineInput.office_city || 'N/A');
    console.log('  • Cluster:', engineInput.cluster || 'N/A');
    
    console.log('\n👔 EMPLOYMENT (for Age Module):');
    console.log('  • Occupation:', engineInput.occupation || 'N/A');
    console.log('  • Employment Status:', engineInput.employment_status || 'N/A');
    console.log('  • Employment Type:', engineInput.employment_type || 'N/A');
    console.log('  • Length of Employment:', engineInput.length_of_employment || 0, 'years');
    
    console.log('\n💰 INCOME FIELDS (for Income Module):');
    console.log('  • Gross Monthly Income: PKR', engineInput.gross_monthly_income?.toLocaleString() || '0');
    console.log('  • Total Income (Net): PKR', engineInput.total_income?.toLocaleString() || '0');
    console.log('  • Net Monthly Income: PKR', engineInput.net_monthly_income?.toLocaleString() || '0');
    console.log('  • UBL Customer (ETB):', engineInput.is_ubl_customer ? 'YES' : 'NO');
    console.log('  • Salary Transfer Flag:', engineInput.salary_transfer_flag ? 'YES' : 'NO');
    
    console.log('\n💵 LOAN FIELDS (for DBR Module):');
    console.log('  • Proposed Loan Amount: PKR', engineInput.proposed_loan_amount?.toLocaleString() || '0');
    console.log('  • Amount Requested: PKR', engineInput.amount_requested?.toLocaleString() || '0');
    
    console.log('\n🚨 SPU FLAGS (for SPU Module):');
    console.log('  • Black List Check:', engineInput.spu_black_list_check ? '❌ TRUE (CRITICAL)' : '✅ FALSE');
    console.log('  • Credit Card 30k Check:', engineInput.spu_credit_card_30k_check ? '⚠️ TRUE' : '✅ FALSE');
    console.log('  • Negative List Check:', engineInput.spu_negative_list_check ? '⚠️ TRUE' : '✅ FALSE');
    
    console.log('\n✅ EAMVU (for EAMVU Module):');
    console.log('  • EAMVU Verified:', engineInput.eavmu_submitted ? '✅ YES' : '❌ NO');
    
    console.log('\n📄 ECIB DATA (for Application & Behavioral Scorecards):');
    console.log('  • ECIB Available:', ecibData ? '✅ YES' : '❌ NO');
    if (ecibData) {
      console.log('  • ECIB Fields:', Object.keys(ecibData).join(', '));
    }
    
    console.log('\n' + '═'.repeat(100));
    console.log('⚠️ IMPORTANT: Please verify the above fields are correct!');
    console.log('═'.repeat(100));

    // Initialize decision engine
    const engine = new DecisionEngineWrapper();
    
    console.log('\n⚙️  RUNNING DECISION ENGINE...\n');
    
    // Run calculation (now async)
    const result = await engine.calculateDecision(engineInput);
    
    console.log('\n📊 MODULE-WISE RESULTS:');
    console.log('═'.repeat(100));
    
    // Display each module result
    Object.entries(result.modules).forEach(([moduleName, moduleData]) => {
      const weightKey = moduleName === 'application_score' || moduleName === 'behavioral_score' ? moduleName : moduleName;
      const weight = result.weighted[weightKey] || 0;
      const percentage = moduleName === 'dbr' ? '55%' : 
                        moduleName === 'income' ? '10%' :
                        moduleName === 'application_score' ? '15%' : '5%';
      
      console.log(`\n🔹 ${moduleName.toUpperCase()} MODULE (${percentage}):`);
      console.log('   Raw Score:', moduleData.raw);
      console.log('   Module Score:', moduleData.score, '/ 50');
      console.log('   Weighted Score:', weight.toFixed(2));
      console.log('   Notes:', moduleData.notes?.join(', ') || 'None');
      if (moduleData.flags && moduleData.flags.length > 0) {
        console.log('   ⚠️  Flags:', moduleData.flags.join(', '));
      }
    });
    
    console.log('\n' + '═'.repeat(100));
    console.log('🎯 FINAL CALCULATION:');
    console.log('─'.repeat(80));
    console.log('  📊 Total Weighted Score:', result.final_score.toFixed(2), '/ 100');
    console.log('  🏆 Decision:', result.decision);
    console.log('  ⚠️  Risk Level:', result.risk_level);
    console.log('  💡 Recommendation:', result.recommendation);
    console.log('  ✔️  Critical Checks Passed:', result.critical_checks_passed);
    console.log('═'.repeat(100) + '\n');

    // Prepare database record
    const dbRecord = {
      los_id: parseInt(losId),
      application_type: applicationData.application_type || 'Unknown',
      
      // Module scores
      dbr_score: result.modules.dbr.score,
      dbr_raw: result.modules.dbr.raw,
      dbr_notes: JSON.stringify(result.modules.dbr.notes),
      
      age_score: result.modules.age.score,
      age_raw: result.modules.age.raw,
      age_notes: JSON.stringify(result.modules.age.notes),
      
      city_score: result.modules.city.score,
      city_name: engineInput.city,
      city_notes: JSON.stringify(result.modules.city.notes),
      
      income_score: result.modules.income.score,
      income_raw: engineInput.net_monthly_income,
      income_notes: JSON.stringify(result.modules.income.notes),
      
      spu_score: result.modules.spu.score,
      spu_notes: JSON.stringify(result.modules.spu.notes),
      spu_flags: JSON.stringify(result.modules.spu.flags),
      
      eamvu_score: result.modules.eamvu.score,
      eamvu_notes: JSON.stringify(result.modules.eamvu.notes),
      
      application_score: result.modules.application_score?.score || null,
      application_score_notes: result.modules.application_score ? JSON.stringify(result.modules.application_score.notes) : null,
      
      behavioral_score: result.modules.behavioral_score?.score || null,
      behavioral_score_notes: result.modules.behavioral_score ? JSON.stringify(result.modules.behavioral_score.notes) : null,
      
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
      ecib_file_name: req.body.ecibFileName || null,
      ecib_uploaded_at: ecibData ? new Date() : null,
      ecib_cnic: ecibData?.individual_profile?.['Individual Profile']?.['CNIC #'] || null,
      
      // Application snapshot
      application_data: JSON.stringify(engineInput),
      
      // Critical checks
      critical_checks: JSON.stringify(result.critical_checks || {}),
      critical_checks_passed: result.critical_checks_passed !== false,
      
      // Audit
      calculated_by: calculatedBy || 'CIU_OFFICER',
      notes: req.body.notes || null
    };

    console.log(`✅ Decision calculated for LOS-${losId}: ${result.decision} (Score: ${result.final_score})`);

    res.json({
      success: true,
      los_id: losId,
      result: result,
      db_record: dbRecord
    });

  } catch (error) {
    console.error('❌ Error calculating decision:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * POST /api/decision/save
 * Save decision result to database
 */
router.post('/save', async (req, res) => {
  try {
    const dbRecord = req.body;

    if (!dbRecord.los_id || !dbRecord.final_score || !dbRecord.decision) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log(`💾 Saving decision for LOS-${dbRecord.los_id}...`);

    // Check if decision already exists
    const existing = await db.query(`
      SELECT id FROM decision_engine_results WHERE los_id = $1
    `, [dbRecord.los_id]);

    let result;
    if (existing.rows.length > 0) {
      // Update existing
      result = await db.query(`
        UPDATE decision_engine_results SET
          application_type = $2,
          dbr_score = $3, dbr_raw = $4, dbr_notes = $5,
          age_score = $6, age_raw = $7, age_notes = $8,
          city_score = $9, city_name = $10, city_notes = $11,
          income_score = $12, income_raw = $13, income_notes = $14,
          spu_score = $15, spu_notes = $16, spu_flags = $17,
          eamvu_score = $18, eamvu_notes = $19,
          application_score = $20, application_score_notes = $21,
          behavioral_score = $22, behavioral_score_notes = $23,
          weighted_dbr = $24, weighted_age = $25, weighted_city = $26,
          weighted_income = $27, weighted_spu = $28, weighted_eamvu = $29,
          weighted_application = $30, weighted_behavioral = $31,
          final_score = $32, decision = $33, risk_level = $34,
          recommendation = $35, ecib_data = $36, ecib_file_name = $37,
          ecib_uploaded_at = $38, ecib_cnic = $39, application_data = $40,
          critical_checks = $41, critical_checks_passed = $42,
          calculated_by = $43, notes = $44
        WHERE los_id = $1
        RETURNING *
      `, [
        dbRecord.los_id, dbRecord.application_type,
        dbRecord.dbr_score, dbRecord.dbr_raw, dbRecord.dbr_notes,
        dbRecord.age_score, dbRecord.age_raw, dbRecord.age_notes,
        dbRecord.city_score, dbRecord.city_name, dbRecord.city_notes,
        dbRecord.income_score, dbRecord.income_raw, dbRecord.income_notes,
        dbRecord.spu_score, dbRecord.spu_notes, dbRecord.spu_flags,
        dbRecord.eamvu_score, dbRecord.eamvu_notes,
        dbRecord.application_score, dbRecord.application_score_notes,
        dbRecord.behavioral_score, dbRecord.behavioral_score_notes,
        dbRecord.weighted_dbr, dbRecord.weighted_age, dbRecord.weighted_city,
        dbRecord.weighted_income, dbRecord.weighted_spu, dbRecord.weighted_eamvu,
        dbRecord.weighted_application, dbRecord.weighted_behavioral,
        dbRecord.final_score, dbRecord.decision, dbRecord.risk_level,
        dbRecord.recommendation, dbRecord.ecib_data, dbRecord.ecib_file_name,
        dbRecord.ecib_uploaded_at, dbRecord.ecib_cnic, dbRecord.application_data,
        dbRecord.critical_checks, dbRecord.critical_checks_passed,
        dbRecord.calculated_by, dbRecord.notes
      ]);
      console.log(`✅ Decision updated for LOS-${dbRecord.los_id}`);
    } else {
      // Insert new
      result = await db.query(`
        INSERT INTO decision_engine_results (
          los_id, application_type,
          dbr_score, dbr_raw, dbr_notes,
          age_score, age_raw, age_notes,
          city_score, city_name, city_notes,
          income_score, income_raw, income_notes,
          spu_score, spu_notes, spu_flags,
          eamvu_score, eamvu_notes,
          application_score, application_score_notes,
          behavioral_score, behavioral_score_notes,
          weighted_dbr, weighted_age, weighted_city,
          weighted_income, weighted_spu, weighted_eamvu,
          weighted_application, weighted_behavioral,
          final_score, decision, risk_level,
          recommendation, ecib_data, ecib_file_name,
          ecib_uploaded_at, ecib_cnic, application_data,
          critical_checks, critical_checks_passed,
          calculated_by, notes
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
          $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
          $31, $32, $33, $34, $35, $36, $37, $38, $39, $40,
          $41, $42, $43, $44
        )
        RETURNING *
      `, [
        dbRecord.los_id, dbRecord.application_type,
        dbRecord.dbr_score, dbRecord.dbr_raw, dbRecord.dbr_notes,
        dbRecord.age_score, dbRecord.age_raw, dbRecord.age_notes,
        dbRecord.city_score, dbRecord.city_name, dbRecord.city_notes,
        dbRecord.income_score, dbRecord.income_raw, dbRecord.income_notes,
        dbRecord.spu_score, dbRecord.spu_notes, dbRecord.spu_flags,
        dbRecord.eamvu_score, dbRecord.eamvu_notes,
        dbRecord.application_score, dbRecord.application_score_notes,
        dbRecord.behavioral_score, dbRecord.behavioral_score_notes,
        dbRecord.weighted_dbr, dbRecord.weighted_age, dbRecord.weighted_city,
        dbRecord.weighted_income, dbRecord.weighted_spu, dbRecord.weighted_eamvu,
        dbRecord.weighted_application, dbRecord.weighted_behavioral,
        dbRecord.final_score, dbRecord.decision, dbRecord.risk_level,
        dbRecord.recommendation, dbRecord.ecib_data, dbRecord.ecib_file_name,
        dbRecord.ecib_uploaded_at, dbRecord.ecib_cnic, dbRecord.application_data,
        dbRecord.critical_checks, dbRecord.critical_checks_passed,
        dbRecord.calculated_by, dbRecord.notes
      ]);
      console.log(`✅ Decision saved for LOS-${dbRecord.los_id}`);
    }

  res.json({
    success: true,
      message: existing.rows.length > 0 ? 'Decision updated' : 'Decision saved',
      result: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error saving decision:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/decision/result/:losId
 * Get saved decision result
 */
router.get('/result/:losId', async (req, res) => {
  try {
    const { losId } = req.params;

    const result = await db.query(`
      SELECT * FROM decision_engine_results WHERE los_id = $1
    `, [losId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No decision found for this application' });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error('❌ Error fetching decision result:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
