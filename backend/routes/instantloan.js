const express = require('express');
const router = express.Router();
const db = require('../db1');

// Import blockchain hash functions
const { createFormHashAfterSubmission } = require('./blockchain-hash');

// Import field mapper for mobile app compatibility
const { mapMobileAppFields } = require('../utils/fieldMapper');

// Import automation workflow
const { processNewApplication } = require('../services/automatedWorkflow');

// --- Sanitizer functions ---
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

function sanitizeBooleanFields(obj, booleanKeys = []) {
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeBooleanFields(item, booleanKeys));
  } else if (obj !== null && typeof obj === "object") {
    let newObj = {};
    for (let key in obj) {
      if (booleanKeys.includes(key)) {
        if (obj[key] === true || obj[key] === 'true' || obj[key] === 'Yes' || obj[key] === 'yes' || obj[key] === 1 || obj[key] === '1') {
          newObj[key] = true;
        } else if (obj[key] === false || obj[key] === 'false' || obj[key] === 'No' || obj[key] === 'no' || obj[key] === 0 || obj[key] === '0') {
          newObj[key] = false;
        } else {
          newObj[key] = null;
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

// Define numeric keys
const numericKeys = [
  "amount_requested", "min_amount_acceptable", "max_affordable_installment", "tenure",
  "monthly_rent", "gross_monthly_salary", "other_monthly_income", "net_monthly_income",
  "dependants", "exp_current_years", "exp_prev_years",
  "approved_limit", "outstanding_amount", "current_outstanding",
];

const smallintKeys = [
  "tenure", "dependants", "exp_current_years", "exp_prev_years"
];

const dateFields = [
  "date_of_birth", "applicant_signature_date", "as_of"
];

const booleanKeys = [
  "is_ubl_existing_customer", 
  "is_ubl_customer"
];

// GET all instant loan applications
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM instantloan_applications ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching instant loan applications:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET single application by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM instantloan_applications WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching instant loan application:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST new instant loan application
router.post('/', async (req, res) => {
  try {
    console.log('📝 Received Instant Loan Application');
    
    // --- MAP MOBILE APP FIELDS (camelCase) TO BACKEND FIELDS (snake_case) ---
    req.body = mapMobileAppFields(req.body);
    
    // ✋ INSTANT LOAN IS ONLY FOR ETB (EXISTING TO BANK) CUSTOMERS
    const cnic = req.body.cnic;
    if (!cnic) {
      return res.status(400).json({
        success: false,
        error: 'CNIC is required for Instant Loan application'
      });
    }
    
    // Check if customer exists in CBS database
    const cbsDb = require('../db'); // CBS database
    const cleanCNIC = cnic.replace(/[-\s]/g, '');
    
    console.log('🔍 Checking if customer is ETB (Existing to Bank)...');
    const customerCheck = await cbsDb.query(
      'SELECT customer_id, fullname FROM cif_customers WHERE cnic = $1',
      [cleanCNIC]
    );
    
    if (customerCheck.rows.length === 0) {
      console.log('❌ NTB customer attempted Instant Loan application');
      return res.status(403).json({
        success: false,
        error: 'Instant Loan is only available for existing bank customers (ETB)',
        message: 'Please apply for other loan products as a new customer'
      });
    }
    
    console.log('✅ ETB customer verified:', customerCheck.rows[0].fullname);
    
    // DEBUG: Log incoming data
    console.log('📋 Incoming request body:', JSON.stringify(req.body, null, 2));
    
    // Sanitize the incoming data
    let sanitized = sanitizeNumericFields(req.body, numericKeys);
    sanitized = sanitizeBooleanFields(sanitized, booleanKeys);
    
    // DEBUG: Log sanitized data
    console.log('🧹 Sanitized data:', JSON.stringify(sanitized, null, 2));

    // Handle date fields
    dateFields.forEach(field => {
      if (sanitized[field] === "" || sanitized[field] === undefined) {
        sanitized[field] = null;
      }
    });

    // Smallint fields - ensure they're either null or valid integers
    smallintKeys.forEach(field => {
      if (sanitized[field] === "" || sanitized[field] === null || sanitized[field] === undefined) {
        sanitized[field] = null;
      } else {
        sanitized[field] = parseInt(sanitized[field], 10);
        if (isNaN(sanitized[field])) {
          sanitized[field] = null;
        }
      }
    });

    // Create the main instant loan application
    const insertQuery = `
      INSERT INTO instantloan_applications (
        title, first_name, middle_name, last_name, father_or_husband_name, mother_maiden_name,
        cnic, date_of_birth, gender, marital_status, mobile, email, address, postal_code, city, district,
        province, employment_status, company_name, designation, exp_current_years, exp_prev_years,
        gross_monthly_salary, other_monthly_income, net_monthly_income, is_ubl_existing_customer,
        is_ubl_customer, amount_requested, min_amount_acceptable, tenure, purpose_of_loan,
        max_affordable_installment, monthly_rent, dependants, branch, account, account_type,
        applicant_signature, applicant_signature_date, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38,
        $39, NOW(), NOW()
      ) RETURNING id
    `;

    const values = [
      sanitized.title || null,
      sanitized.first_name || null,
      sanitized.middle_name || null,
      sanitized.last_name || null,
      sanitized.father_or_husband_name || null,
      sanitized.mother_maiden_name || null,
      sanitized.cnic || null,
      sanitized.date_of_birth || null,
      sanitized.gender || null,
      sanitized.marital_status || null,
      sanitized.mobile || null,
      sanitized.email || null,
      sanitized.address || null,
      sanitized.postal_code || null,
      sanitized.city || null,
      sanitized.district || null,
      sanitized.province || null,
      sanitized.employment_status || null,
      sanitized.company_name || null,
      sanitized.designation || null,
      sanitized.exp_current_years || null,
      sanitized.exp_prev_years || null,
      sanitized.gross_monthly_salary || null,
      sanitized.other_monthly_income || null,
      sanitized.net_monthly_income || null,
      sanitized.is_ubl_existing_customer || null,
      sanitized.is_ubl_customer || null,
      sanitized.amount_requested || null,
      sanitized.min_amount_acceptable || null,
      sanitized.tenure || null,
      sanitized.purpose_of_loan || null,
      sanitized.max_affordable_installment || null,
      sanitized.monthly_rent || null,
      sanitized.dependants || null,
      sanitized.branch || null,
      sanitized.account || null,
      sanitized.account_type || null,
      sanitized.applicant_signature || null,
      sanitized.applicant_signature_date || null,
    ];

    const result = await db.query(insertQuery, values);
    const applicationId = result.rows[0].id;

    console.log(`✅ Instant Loan application created with ID: ${applicationId}`);

    // Insert into main ilos_applications table for tracking
    try {
      await db.query(
        `INSERT INTO ilos_applications (los_id, loan_type, cnic, customer_id, status)
         VALUES ($1, 'instantloan_applications', $2, $3, 'PB_SUBMITTED')
         ON CONFLICT (los_id) DO NOTHING`,
        [applicationId, sanitized.cnic || null, null]
      );
      console.log('✅ Entry created in ilos_applications table');
    } catch (e) {
      console.error('⚠️ Fallback insert to ilos_applications failed:', e.message);
    }

    // Create blockchain hash for the form
    const hashResult = await createFormHashAfterSubmission(
      applicationId,
      'instant_loan',
      'Product Booking (PB)',
      sanitized
    );

    // Get the complete application data
    const application = await db.query(
      'SELECT * FROM instantloan_applications WHERE id = $1',
      [applicationId]
    );

    // Trigger automated workflow for Instant Loan
    console.log('🚀 Triggering automated workflow for Instant Loan...');
    setImmediate(() => {
      processNewApplication(applicationId, {
        applicationType: 'instant_loan',
        cnic: sanitized.cnic
      })
        .catch(err => console.error('❌ Automation workflow error:', err));
    });

    res.status(201).json({ 
      success: true, 
      application: application.rows[0], 
      application_id: applicationId,
      losId: applicationId, // For mobile app compatibility
      status: 'application_completed', // ✅ Instant Loan is fully automated
      requiresPbCompletion: false, // ❌ Does NOT need PB completion
      message: 'Instant Loan approved and processing for disbursement!', // Mobile app message
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
    console.error('❌ Error creating instant loan application:', err);
    console.error('❌ Error details:', err.message);
    console.error('❌ Stack:', err.stack);
    res.status(500).json({ 
      error: 'Internal server error',
      details: err.message,
      hint: 'Check backend logs for full error details'
    });
  }
});

// PUT update instant loan application
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Sanitize the incoming data
    let sanitized = sanitizeNumericFields(req.body, numericKeys);
    sanitized = sanitizeBooleanFields(sanitized, booleanKeys);

    // Handle date fields
    dateFields.forEach(field => {
      if (sanitized[field] === "" || sanitized[field] === undefined) {
        sanitized[field] = null;
      }
    });

    // Smallint fields
    smallintKeys.forEach(field => {
      if (sanitized[field] === "" || sanitized[field] === null || sanitized[field] === undefined) {
        sanitized[field] = null;
      } else {
        sanitized[field] = parseInt(sanitized[field], 10);
        if (isNaN(sanitized[field])) {
          sanitized[field] = null;
        }
      }
    });

    const updateQuery = `
      UPDATE instantloan_applications SET
        title = $1, first_name = $2, middle_name = $3, last_name = $4,
        father_or_husband_name = $5, mother_maiden_name = $6, cnic = $7,
        date_of_birth = $8, gender = $9, marital_status = $10, mobile = $11,
        email = $12, address = $13, postal_code = $14, city = $15, district = $16,
        province = $17, employment_status = $18, company_name = $19, designation = $20,
        exp_current_years = $21, exp_prev_years = $22, gross_monthly_salary = $23,
        other_monthly_income = $24, net_monthly_income = $25, is_ubl_existing_customer = $26,
        is_ubl_customer = $27, amount_requested = $28, min_amount_acceptable = $29,
        tenure = $30, purpose_of_loan = $31, max_affordable_installment = $32,
        monthly_rent = $33, dependants = $34, branch = $35, account = $36,
        account_type = $37, applicant_signature = $38, applicant_signature_date = $39,
        updated_at = NOW()
      WHERE id = $40
      RETURNING *
    `;

    const values = [
      sanitized.title || null,
      sanitized.first_name || null,
      sanitized.middle_name || null,
      sanitized.last_name || null,
      sanitized.father_or_husband_name || null,
      sanitized.mother_maiden_name || null,
      sanitized.cnic || null,
      sanitized.date_of_birth || null,
      sanitized.gender || null,
      sanitized.marital_status || null,
      sanitized.mobile || null,
      sanitized.email || null,
      sanitized.address || null,
      sanitized.postal_code || null,
      sanitized.city || null,
      sanitized.district || null,
      sanitized.province || null,
      sanitized.employment_status || null,
      sanitized.company_name || null,
      sanitized.designation || null,
      sanitized.exp_current_years || null,
      sanitized.exp_prev_years || null,
      sanitized.gross_monthly_salary || null,
      sanitized.other_monthly_income || null,
      sanitized.net_monthly_income || null,
      sanitized.is_ubl_existing_customer || null,
      sanitized.is_ubl_customer || null,
      sanitized.amount_requested || null,
      sanitized.min_amount_acceptable || null,
      sanitized.tenure || null,
      sanitized.purpose_of_loan || null,
      sanitized.max_affordable_installment || null,
      sanitized.monthly_rent || null,
      sanitized.dependants || null,
      sanitized.branch || null,
      sanitized.account || null,
      sanitized.account_type || null,
      sanitized.applicant_signature || null,
      sanitized.applicant_signature_date || null,
      id
    ];

    const result = await db.query(updateQuery, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating instant loan application:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE instant loan application
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM instantloan_applications WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    res.json({ message: 'Application deleted successfully' });
  } catch (err) {
    console.error('Error deleting instant loan application:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

