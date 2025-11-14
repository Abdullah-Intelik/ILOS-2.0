const express = require('express');
const router = express.Router();
const db = require('../db1');

// Import blockchain hash functions
const { createFormHashAfterSubmission } = require('./blockchain-hash');

// Import field mapper for mobile app compatibility
const { mapMobileAppFields } = require('../utils/fieldMapper');

// Import mobile submission handler
const { handleMobileSubmission, isMobileAppSubmission } = require('../utils/mobileSubmissionHandler');

// --- Add this sanitizer at the top ---
function sanitizeNumericFields(obj, numericKeys = []) {
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeNumericFields(item, numericKeys));
  } else if (obj !== null && typeof obj === "object") {
    let newObj = {};
    for (let key in obj) {
      if (numericKeys.includes(key) && obj[key] === "") {
        newObj[key] = null;
      } else {
        newObj[key] = sanitizeNumericFields(obj[key], numericKeys);
      }
    }
    return newObj;
  }
  return obj;
}

// Helper function to ensure boolean fields are valid
function sanitizeBooleanFields(obj, booleanKeys = []) {
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeBooleanFields(item, booleanKeys));
  } else if (obj !== null && typeof obj === "object") {
    let newObj = {};
    for (let key in obj) {
      if (booleanKeys.includes(key)) {
        // Convert to proper boolean or null
        if (obj[key] === true || obj[key] === 'true' || obj[key] === 'Yes' || obj[key] === 'yes' || obj[key] === 1 || obj[key] === '1') {
          newObj[key] = true;
        } else if (obj[key] === false || obj[key] === 'false' || obj[key] === 'No' || obj[key] === 'no' || obj[key] === 0 || obj[key] === '0') {
          newObj[key] = false;
        } else {
          newObj[key] = null; // Use NULL for database
        }
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        newObj[key] = sanitizeBooleanFields(obj[key], booleanKeys);
      } else {
        newObj[key] = obj[key];
      }
    }
    return newObj;
  }
  return obj;
}

// --- Define all numeric keys used in your schema ---
const numericKeys = [
  // Main application table
  "amount_requested", "min_amount_acceptable", "max_affordable_installment", "tenure",
  "monthly_rent", "gross_monthly_salary", "other_monthly_income", "net_monthly_income",
  "dependants", "exp_current_years", "exp_prev_years", 
  // Child tables
  "approved_limit", "outstanding_amount", "current_outstanding",
  // Add more fields as needed per your schema
];

// Define smallint fields specifically to handle empty strings
const smallintKeys = [
  "tenure", "dependants", "exp_current_years", "exp_prev_years"
];

// Define date fields that need special handling
const dateFields = [
  "date_of_birth", "applicant_signature_date", "as_of"
];

// Define boolean keys used in your schema
const booleanKeys = [
  "is_ubl_existing_customer", 
  "is_ubl_customer"
  // Add other boolean fields as needed
];

// GET all cashplus applications
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM cashplus_applications ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching cashplus applications:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// GET single application with children by ID

// GET single application with children by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get main application
    const appResult = await db.query('SELECT * FROM cashplus_applications WHERE id = $1', [id]);
    if (appResult.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }
    const application = appResult.rows[0];

    // Get all child tables in parallel
    const [
      creditCardsClean,
      creditCardsSecured,
      personalLoansExisting,
      otherFacilities,
      personalLoansUnderProcess,
      references,
      documentsHash
    ] = await Promise.all([
      db.query('SELECT * FROM cashplus_credit_cards_clean WHERE application_id = $1', [id]),
      db.query('SELECT * FROM cashplus_credit_cards_secured WHERE application_id = $1', [id]),
      db.query('SELECT * FROM cashplus_personal_loans_existing WHERE application_id = $1', [id]),
      db.query('SELECT * FROM cashplus_other_facilities WHERE application_id = $1', [id]),
      db.query('SELECT * FROM cashplus_personal_loans_under_process WHERE application_id = $1', [id]),
      db.query('SELECT * FROM cashplus_references WHERE application_id = $1', [id]),
      db.query('SELECT * FROM cashplus_documents WHERE application_id = $1', [id])
    ]);

    // Build response
    const response = {
      ...application,
      credit_cards_clean: creditCardsClean.rows,
      credit_cards_secured: creditCardsSecured.rows,
      personal_loans_existing: personalLoansExisting.rows,
      other_facilities: otherFacilities.rows,
      personal_loans_under_process: personalLoansUnderProcess.rows,
      references: references.rows,
      documents: documentsHash.rows
    };

    res.json(response);

  } catch (err) {
    console.error('Error fetching application with children:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// GET all cashplus applications for a given customer_id
router.get('/by-customer/:customer_id', async (req, res) => {
  try {
    const { customer_id } = req.params;
    if (!customer_id) {
      return res.status(400).json({ error: "customer_id is required" });
    }
    const result = await db.query(
      'SELECT * FROM cashplus_applications WHERE customer_id = $1 ORDER BY created_at DESC',
      [customer_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching applications by customer_id:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});















// POST a new cashplus application (main + child tables)
router.post('/', async (req, res) => {
  console.log('🔵 POST /api/cashplus RECEIVED');
  console.log('🔍 BEFORE mapping - mobileSubmissionLosId:', req.body.mobileSubmissionLosId);
  
  // --- MAP MOBILE APP FIELDS (camelCase) TO BACKEND FIELDS (snake_case) ---
  req.body = mapMobileAppFields(req.body);
  
  console.log('🔍 AFTER mapping - mobileSubmissionLosId:', req.body.mobileSubmissionLosId);
  
  // --- LOG DOCUMENTS OBJECT FOR DEBUGGING ---
  if (req.body.documents) {
    console.log('📄 Documents object received:', Object.keys(req.body.documents).filter(k => req.body.documents[k]));
  } else {
    console.log('⚠️ No documents object in request body');
  }
  
  // --- SANITIZE NUMERIC AND BOOLEAN FIELDS ---
  req.body = sanitizeNumericFields(req.body, numericKeys);
  req.body = sanitizeBooleanFields(req.body, booleanKeys);
  
  console.log('🔍 AFTER sanitize - mobileSubmissionLosId:', req.body.mobileSubmissionLosId);
  
  // Special handling for smallint fields
  for (const key of smallintKeys) {
    if (req.body[key] === "") {
      req.body[key] = null;
    } else if (req.body[key] !== undefined && req.body[key] !== null) {
      // Convert to integer if possible
      const intValue = parseInt(req.body[key], 10);
      if (!isNaN(intValue)) {
        req.body[key] = intValue;
      } else {
        req.body[key] = null;
      }
    }
  }
  
  // Special handling for date fields
  for (const key of dateFields) {
    if (req.body[key] === "" || req.body[key] === undefined) {
      req.body[key] = null;
    } else {
      // Check if it's a valid date
      const date = new Date(req.body[key]);
      if (isNaN(date.getTime())) {
        req.body[key] = null; // Set to null if invalid date
      }
      // Otherwise keep as is (PostgreSQL can parse valid date strings)
    }
  }

  // Also handle date fields in array items like exposure tables
  if (req.body.personal_loans_existing && Array.isArray(req.body.personal_loans_existing)) {
    req.body.personal_loans_existing = req.body.personal_loans_existing.map(loan => {
      if (loan.as_of === "" || loan.as_of === undefined) {
        loan.as_of = null;
      }
      return loan;
    });
  }

  // 📱 CHECK IF THIS IS A MOBILE APP SUBMISSION (Non-Instant Loan)
  const isMobileSubmission = isMobileAppSubmission(req.body);
  
  if (isMobileSubmission) {
    console.log('📱 Detected mobile app submission for CashPlus - will create pending_pb_completion status');
  }

  // 📱 CHECK IF THIS IS PB COMPLETING A MOBILE SUBMISSION
  console.log('🔍 Backend: Checking for mobileSubmissionLosId in request body...');
  console.log('📋 req.body.mobileSubmissionLosId:', req.body.mobileSubmissionLosId);
  console.log('📋 req.body keys:', Object.keys(req.body).filter(k => k.includes('mobile') || k.includes('Mobile')));
  
  const mobileSubmissionLosId = req.body.mobileSubmissionLosId;
  const isCompletingMobileSubmission = !!mobileSubmissionLosId;
  
  if (isCompletingMobileSubmission) {
    console.log(`📝 PB is completing mobile submission LOS-${mobileSubmissionLosId} - will UPDATE existing application`);
  } else {
    console.log('ℹ️ No mobileSubmissionLosId found - will INSERT new application');
  }

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    let application;
    let applicationId;

    // 1. Insert OR Update main application
    const fields = [
      "customer_id", "loan_type", "amount_requested", "min_amount_acceptable", "max_affordable_installment", "tenure",
      "is_ubl_existing_customer", "branch", "account", "purpose_of_loan", "purpose_of_loan_other",
      "title", "first_name", "middle_name", "last_name", "cnic", "ntn", "date_of_birth", "gender", "marital_status", "dependants",
      "education_qualification", "education_qualification_other", "father_or_husband_name", "mother_maiden_name", "employment_status", "address", "nearest_landmark", "city", "postal_code", "residing_since", "accommodation_type", "accommodation_type_other", "monthly_rent", "preferred_mailing_address",
      "permanent_house_no", "permanent_street", "permanent_city", "permanent_postal_code",
      "tel_current", "tel_permanent", "mobile", "email", "mobile_type", "other_contact",
      "company_name", "company_type", "company_type_other", "department", "designation", "grade_level", "exp_current_years", "prev_employer_name", "exp_prev_years",
      "office_house_no", "office_street", "office_area", "office_landmark", "office_city", "office_postal_code", "office_fax", "office_tel1", "office_tel2", "office_ext",
      "gross_monthly_salary", "other_monthly_income", "net_monthly_income", "other_income_sources",
      "is_ubl_customer", "ubl_account_number",
      "applicant_signature", "applicant_signature_date",
      "application_source", "channel_code", "so_employee_no", "program_code", "pb_bm_employee_no", "branch_code", "sm_employee_no", "bm_signature_stamp",
      "documents" // ✅ Added documents field to store OCR data
    ];
    const values = fields.map(field => {
      // Handle JSONB field (documents)
      if (field === 'documents' && req.body[field]) {
        return JSON.stringify(req.body[field]);
      }
      return req.body[field];
    });

    if (isCompletingMobileSubmission) {
      // UPDATE existing application
      const setClause = fields.map((field, idx) => `${field} = $${idx + 2}`).join(', ');
      const updateQuery = `
        UPDATE cashplus_applications
        SET ${setClause}
        WHERE id = $1
        RETURNING *;
      `;
      const result = await client.query(updateQuery, [mobileSubmissionLosId, ...values]);
      application = result.rows[0];
      applicationId = mobileSubmissionLosId; // Use the existing ID
      console.log(`✅ Updated existing application LOS-${applicationId} with PB-completed data`);
    } else {
      // INSERT new application
      const placeholders = fields.map((_, idx) => `$${idx + 1}`).join(', ');
      const insertQuery = `
        INSERT INTO cashplus_applications (${fields.join(', ')})
        VALUES (${placeholders})
        RETURNING *;
      `;
      const result = await client.query(insertQuery, values);
      application = result.rows[0];
      applicationId = application.id;
      console.log(`✅ Inserted new application LOS-${applicationId}`);
    }

    // 2. Insert into child tables (or replace if updating)
    
    // If updating, delete old child records first
    if (isCompletingMobileSubmission) {
      console.log(`🗑️ Deleting old child records for LOS-${applicationId}...`);
      
      // Delete from each child table, gracefully handling missing tables using SAVEPOINTS
      const childTables = [
        'cashplus_credit_cards_clean',
        'cashplus_credit_cards_secured',
        'cashplus_personal_loans_existing',
        'cashplus_other_facilities',
        'cashplus_personal_loans_under_process',
        'cashplus_references',
        'cashplus_documents_hash'
      ];
      
      for (const table of childTables) {
        try {
          // Use SAVEPOINT to prevent transaction abort
          await client.query(`SAVEPOINT delete_${table}`);
          await client.query(`DELETE FROM ${table} WHERE application_id = $1`, [applicationId]);
          await client.query(`RELEASE SAVEPOINT delete_${table}`);
        } catch (deleteError) {
          // Table might not exist, rollback to savepoint and continue
          await client.query(`ROLLBACK TO SAVEPOINT delete_${table}`);
          console.log(`⚠️ Could not delete from ${table}: ${deleteError.message}`);
        }
      }
      
      console.log(`✅ Old child records deleted`);
    }

    // Clean credit cards
    if (Array.isArray(req.body.credit_cards_clean)) {
      for (const cc of req.body.credit_cards_clean) {
        await client.query(
          `INSERT INTO cashplus_credit_cards_clean (application_id, bank_name, approved_limit) VALUES ($1, $2, $3)`,
          [applicationId, cc.bank_name, cc.approved_limit]
        );
      }
    }

    // Secured credit cards
    if (Array.isArray(req.body.credit_cards_secured)) {
      for (const cc of req.body.credit_cards_secured) {
        await client.query(
          `INSERT INTO cashplus_credit_cards_secured (application_id, bank_name, approved_limit) VALUES ($1, $2, $3)`,
          [applicationId, cc.bank_name, cc.approved_limit]
        );
      }
    }

    // Existing personal loans
    if (Array.isArray(req.body.personal_loans_existing)) {
      for (const pl of req.body.personal_loans_existing) {
        await client.query(
          `INSERT INTO cashplus_personal_loans_existing (application_id, bank_name, approved_limit, outstanding_amount, as_of)
          VALUES ($1, $2, $3, $4, $5)`,
          [applicationId, pl.bank_name, pl.approved_limit, pl.outstanding_amount, pl.as_of]
        );
      }
    }

    // Other facilities
    if (Array.isArray(req.body.other_facilities)) {
      for (const fac of req.body.other_facilities) {
        await client.query(
          `INSERT INTO cashplus_other_facilities (application_id, bank_name, approved_limit, nature, current_outstanding)
          VALUES ($1, $2, $3, $4, $5)`,
          [applicationId, fac.bank_name, fac.approved_limit, fac.nature, fac.current_outstanding]
        );
      }
    }

    // Personal loans under process
    if (Array.isArray(req.body.personal_loans_under_process)) {
      for (const pl of req.body.personal_loans_under_process) {
        await client.query(
          `INSERT INTO cashplus_personal_loans_under_process (application_id, bank_name, facility_under_process, nature_of_facility)
          VALUES ($1, $2, $3, $4)`,
          [applicationId, pl.bank_name, pl.facility_under_process, pl.nature_of_facility]
        );
      }
    }

    // References
    if (Array.isArray(req.body.references)) {
      for (const ref of req.body.references) {
        await client.query(
          `INSERT INTO cashplus_references
            (application_id, reference_no, name, cnic, relationship, house_no, street, area, city, postal_code,
              tel_residence, tel_office, mobile, fax, email)
           VALUES
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
          [
            applicationId, ref.reference_no, ref.name, ref.cnic, ref.relationship, ref.house_no,
            ref.street, ref.area, ref.city, ref.postal_code, ref.tel_residence, ref.tel_office,
            ref.mobile, ref.fax, ref.email
          ]
        );
      }
    }
   
    // Note: ilos_applications record is automatically created by database trigger
    
    // 📱 HANDLE MOBILE SUBMISSION vs WEB SUBMISSION
    if (isMobileSubmission) {
      // For mobile submissions, set status to pending_pb_completion
      console.log(`📱 Mobile submission detected - setting status to pending_pb_completion`);
      
      try {
        await client.query(`SELECT update_status_by_los_id($1, 'pending_pb_completion')`, [applicationId]);
        console.log(`✅ Status updated to pending_pb_completion for mobile submission ${applicationId}`);
      } catch (statusError) {
        console.error(`❌ Error updating status for application ${applicationId}:`, statusError.message);
      }

      // Save mobile submission data and documents
      try {
        await client.query(`
          INSERT INTO ilos_applications 
          (los_id, loan_type, cnic, customer_id, status, submitted_from_mobile, mobile_submission_data, mobile_documents)
          VALUES ($1, 'cashplus_applications', $2, $3, 'pending_pb_completion', true, $4, $5)
          ON CONFLICT (los_id) DO UPDATE SET
            status = 'pending_pb_completion',
            submitted_from_mobile = true,
            mobile_submission_data = $4,
            mobile_documents = $5,
            updated_at = NOW()
        `, [
          applicationId, 
          application.cnic || null, 
          application.customer_id || null,
          JSON.stringify(req.body),
          JSON.stringify(req.body.documents || {})
        ]);
        console.log(`✅ Mobile submission data saved for LOS-${applicationId}`);
      } catch (e) {
        console.error('⚠️ Failed to save mobile submission data:', e.message);
      }

      // ❌ DO NOT trigger automation for mobile submissions
      console.log(`📱 Automation SKIPPED for mobile submission LOS-${applicationId} - awaiting PB completion`);
      
    } else {
      // For web/PB submissions, use normal flow
      if (isCompletingMobileSubmission) {
        console.log(`📝 PB completed mobile submission LOS-${applicationId} - triggering automation`);
      }
      
      try {
        await client.query(`SELECT update_status_by_los_id($1, 'PB_SUBMITTED')`, [applicationId]);
        console.log(`✅ Status updated to PB_SUBMITTED for application ${applicationId}`);
      } catch (statusError) {
        console.error(`❌ Error updating status for application ${applicationId}:`, statusError.message);
      }

      // Ensure a registry row exists (in case trigger didn't fire for any reason)
      try {
        await client.query(
          `INSERT INTO ilos_applications (los_id, loan_type, cnic, customer_id, status)
           VALUES ($1, 'cashplus_applications', $2, $3, 'PB_SUBMITTED')
           ON CONFLICT (los_id) DO NOTHING`,
          [applicationId, application.cnic || null, application.customer_id || null]
        );
      } catch (e) {
        console.error('⚠️ Fallback insert to ilos_applications failed:', e.message);
      }

      // 🤖 AUTOMATION: Trigger automated workflow after PB submission
      const { processNewApplication } = require('../services/automatedWorkflow');
      console.log(`🤖 AUTOMATION ENABLED: Triggering automated workflow for LOS-${applicationId}`);
      
      // Trigger automation asynchronously (don't block the response)
      setImmediate(async () => {
        try {
          const workflowResult = await processNewApplication(applicationId, {
            cnic: application.cnic,
            applicationType: 'CashPlus'
          });
          console.log(`✅ Automated workflow completed for LOS-${applicationId}:`, workflowResult);
        } catch (error) {
          console.error(`❌ Automated workflow failed for LOS-${applicationId}:`, error.message);
        }
      });
    }

    await client.query('COMMIT');
    
    // Create blockchain hash for the application
    const department = req.headers['x-department'] || 'PB'; // Default to PB if not specified
    const signer = req.headers['x-signer'] || 'system_user';
    
    let hashResult = null;
    try {
      hashResult = await createFormHashAfterSubmission(
        applicationId.toString(),
        department,
        'cashplus_application',
        { ...application, application_id: applicationId, status: 'PB_SUBMITTED' },
        signer
      );
      console.log(`✅ Blockchain hash created for application ${applicationId}`);
    } catch (hashErr) {
      console.error(`❌ Blockchain hash creation failed for application ${applicationId}:`, hashErr.message);
      hashResult = { success: false, error: hashErr.message };
    }

    // Return response with blockchain hash information
    let responseMessage;
    if (isMobileSubmission) {
      responseMessage = 'Application submitted successfully. Our team will review and complete your application shortly.';
    } else if (isCompletingMobileSubmission) {
      responseMessage = `Application LOS-${applicationId} completed successfully and forwarded to automation.`;
    } else {
      responseMessage = 'Application submitted successfully.';
    }
    
    res.status(201).json({ 
      success: true, 
      application, 
      application_id: applicationId,
      losId: applicationId, // For mobile app compatibility (camelCase)
      status: isMobileSubmission ? 'pending_pb_completion' : 'PB_SUBMITTED', // Important for mobile app
      requiresPbCompletion: isMobileSubmission,
      wasUpdated: isCompletingMobileSubmission, // Indicate if this was an update
      message: responseMessage,
      blockchain: {
        hashCreated: hashResult?.success || false,
        hashId: hashResult?.hashId,
        department: hashResult?.department,
        formType: hashResult?.formType,
        formHash: hashResult?.formHash,
        formDataHash: hashResult?.formDataHash,
        timestamp: hashResult?.timestamp,
        blockchain: hashResult?.blockchain,
        error: hashResult?.error
      }
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating cashplus application and children:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

module.exports = router;
