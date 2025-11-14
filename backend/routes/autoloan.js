

const express = require('express');
const router = express.Router();
const db = require('../db1');

// Import mobile submission handler
const { handleMobileSubmission, isMobileAppSubmission } = require('../utils/mobileSubmissionHandler');

// ------- Helpers to sanitize incoming request data -------
function toNumber(value) {
  if (value === '' || value === undefined || value === null) return null;
  const n = Number(String(value).toString().replace(/[^0-9.\-]/g, ''));
  return Number.isFinite(n) ? n : null;
}

function toInt(value) {
  if (value === '' || value === undefined || value === null) return null;
  const n = parseInt(String(value).toString().replace(/[^0-9\-]/g, ''), 10);
  return Number.isFinite(n) ? n : null;
}

function toBoolean(value) {
  if (value === '' || value === undefined || value === null) return null;
  if (value === true || value === 'true' || value === 'Yes' || value === 'yes' || value === 1 || value === '1') return true;
  if (value === false || value === 'false' || value === 'No' || value === 'no' || value === 0 || value === '0') return false;
  return null;
}

function toDateOrNull(value) {
  if (!value || value === '') return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
}

function sanitizeBodyForAutoLoan(input) {
  const body = { ...input };

  // Smallint or integer-like fields
  const smallInts = [
    'year_of_manufacture',
    'installment_period',
    'prev_experience_years',
    'num_children',
    'num_other_dependents',
    'grade_level'
  ];
  for (const key of smallInts) {
    if (key in body) body[key] = toInt(body[key]);
  }

  // Numeric (float/decimal) fields
  const numericFields = [
    'price_value', 'down_payment_percent', 'down_payment_amount', 'desired_loan_amount',
    'kibor_rate', 'fixed_rate', 'margin', 'insurance_rate',
    'gross_monthly_salary', 'other_monthly_income', 'total_gross_monthly_income',
    'net_monthly_income', 'shareholding_percent', 'monthly_rent',
  ];
  for (const key of numericFields) {
    if (key in body) body[key] = toNumber(body[key]);
  }

  // Boolean-like fields
  const booleanFields = [
    'co_borrower_case', 'spouse_employed'
  ];
  for (const key of booleanFields) {
    if (key in body) body[key] = toBoolean(body[key]);
  }

  // Dates
  const dateFields = ['date_of_birth', 'applicant_signature_date', 'co_borrower_signature_date'];
  for (const key of dateFields) {
    if (key in body) body[key] = toDateOrNull(body[key]);
  }

  // Child arrays – coerce numeric members
  if (Array.isArray(body.credit_cards_clean)) {
    body.credit_cards_clean = body.credit_cards_clean.map((cc) => ({
      bank_name: cc?.bank_name ?? cc?.name ?? null,
      approved_limit: toNumber(cc?.approved_limit ?? cc?.limit)
    }));
  }
  if (Array.isArray(body.credit_cards_secured)) {
    body.credit_cards_secured = body.credit_cards_secured.map((cc) => ({
      bank_name: cc?.bank_name ?? cc?.name ?? null,
      approved_limit: toNumber(cc?.approved_limit ?? cc?.limit)
    }));
  }
  if (Array.isArray(body.personal_loans_clean)) {
    body.personal_loans_clean = body.personal_loans_clean.map((pl) => ({
      bank_name: pl?.bank_name ?? pl?.name ?? null,
      approved_limit: toNumber(pl?.approved_limit ?? pl?.limit),
      outstanding_amount: toNumber(pl?.outstanding_amount ?? pl?.outstanding)
    }));
  }
  if (Array.isArray(body.personal_loans_secured)) {
    body.personal_loans_secured = body.personal_loans_secured.map((pl) => ({
      bank_name: pl?.bank_name ?? pl?.name ?? null,
      approved_limit: toNumber(pl?.approved_limit ?? pl?.limit),
      outstanding_amount: toNumber(pl?.outstanding_amount ?? pl?.outstanding)
    }));
  }
  if (Array.isArray(body.other_facilities)) {
    body.other_facilities = body.other_facilities.map((f) => ({
      bank_name: f?.bank_name ?? f?.name ?? null,
      approved_limit: toNumber(f?.approved_limit ?? f?.limit),
      nature: f?.nature ?? null,
      current_outstanding: toNumber(f?.current_outstanding ?? f?.outstanding)
    }));
  }
  if (Array.isArray(body.applied_limits)) {
    body.applied_limits = body.applied_limits.map((al) => ({
      bank_name: al?.bank_name ?? al?.name ?? null,
      facility_under_process: al?.facility_under_process ?? al?.facility ?? null,
      nature_of_facility: al?.nature_of_facility ?? al?.nature ?? null
    }));
  }
  if (Array.isArray(body.other_bank_accounts)) {
    body.other_bank_accounts = body.other_bank_accounts.map((acc) => ({
      bank_name: acc?.bank_name ?? null,
      branch: acc?.branch ?? null,
      account_no: acc?.account_no ?? null,
      account_type: acc?.account_type ?? null,
      currency_type: acc?.currency_type ?? null
    }));
  }

  return body;
}

// POST: Create new auto loan application with child tables
router.post('/', async (req, res) => {
  const client = await db.connect();
  try {
    // Sanitize incoming body to avoid numeric parsing errors in Postgres
    req.body = sanitizeBodyForAutoLoan(req.body);

    // Map camelCase frontend fields to snake_case database fields
    const fieldMappings = {
      firstName: 'first_name',
      middleName: 'middle_name', 
      lastName: 'last_name',
      fatherOrHusbandName: 'father_or_husband_name',
      mothersMailenName: 'mothers_maiden_name',
      coBorrowerName: 'co_borrower_name',
      companyName: 'company_name',
      prevEmployerName: 'prev_employer_name',
      // Add more mappings as needed
    };
    
    // Apply field mappings to request body
    Object.keys(fieldMappings).forEach(camelKey => {
      const snakeKey = fieldMappings[camelKey];
      if (req.body[camelKey] !== undefined) {
        req.body[snakeKey] = req.body[camelKey];
        // Optionally delete the camelCase version to avoid conflicts
        delete req.body[camelKey];
      }
    });
    
    console.log('🔄 AutoLoan: Applied field mappings to request body');
    
    // 📱 CHECK IF THIS IS A MOBILE APP SUBMISSION (Non-Instant Loan)
    const isMobileSubmission = isMobileAppSubmission(req.body);
    
    if (isMobileSubmission) {
      console.log('📱 Detected mobile app submission for AutoLoan - will create pending_pb_completion status');
    }
    
    await client.query('BEGIN');
    // --- Insert main table ---
    const fields = [ // All columns except serial id and created_at
      "customer_id", "city", "auto_application_id", "product_type", "payment_mode", "pricing_plan", "fixed_rate",
      "kibor_rate", "margin", "vehicle_manufacturer", "vehicle_model", "year_of_manufacture", "vehicle_class_engine_size",
      "price_value", "down_payment_percent", "down_payment_amount", "desired_loan_amount", "installment_period",
      "used_seller_name", "used_seller_cnic", "used_house_no", "used_street", "used_area", "used_landmark",
      "used_city", "used_country", "used_postal_code", "used_contact_no", "used_bank", "used_branch", "used_account_no",
      "insurance_company_name", "insurance_rate", "dealer_name", "gender", "title", "first_name", "middle_name",
      "last_name", "applicant_cnic", "ntn", "date_of_birth", "passport_no", "educational_qualification",
      "mothers_maiden_name", "father_or_husband_name", "marital_status", "num_children", "num_other_dependents",
      "dependents_specify", "next_of_kin", "next_of_kin_relation", "next_of_kin_cnic", "next_of_kin_contact",
      "curr_house_no", "curr_street", "curr_area", "curr_landmark", "curr_city", "curr_country", "curr_postal_code",
      "curr_tel_residence", "curr_mobile", "curr_email", "curr_years_address", "curr_years_city", "residential_status",
      "monthly_rent", "perm_house_no", "perm_street", "perm_area", "perm_city", "perm_country", "perm_postal_code",
      "perm_tel_residence", "co_borrower_case", "co_borrower_name", "co_borrower_relationship", "co_borrower_cnic",
      "employment_type", "company_name", "business_type", "business_type_other", "profession", "nature_of_business",
      "years_in_business", "shareholding_percent", "employment_status", "designation", "department", "grade_level",
      "business_address", "business_street", "business_area", "business_city", "business_country", "business_postal_code",
      "business_tel", "business_landmark", "prev_employer_name", "prev_designation", "prev_experience_years",
      "prev_employer_tel", "gross_monthly_salary", "other_monthly_income", "total_gross_monthly_income",
      "net_monthly_income", "other_income_type", "other_income_specify", "spouse_employed", "spousal_income",
      "spouse_income_source", "statement_to_be_sent", "repayment_bank_name", "repayment_branch", "repayment_account_no",
      "repayment_account_type", "repayment_currency_type", "application_source", "channel_code", "program_code",
      "branch_code", "so_employee_no", "so_employee_name", "pb_bm_employee_no", "pb_bm_employee_name", "sm_employee_no",
      "sm_employee_name", "dealership_name", "branch_name_code", "financing_option", "applicant_signature_date",
      "co_borrower_signature_date"
      // Add signature BYTEA fields if required, handling file uploads
    ];
    const values = fields.map(f => req.body[f]);
    const placeholders = fields.map((_, idx) => `$${idx + 1}`).join(', ');
    const insertQuery = `INSERT INTO autoloan_applications (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *;`;
    const result = await client.query(insertQuery, values);
    const application = result.rows[0];
    const applicationId = application.id;

    // --- Insert child tables ---
    // Other bank accounts
    if (Array.isArray(req.body.other_bank_accounts)) {
      for (const acc of req.body.other_bank_accounts) {
        await client.query(
          `INSERT INTO autoloan_other_bank_accounts (application_id, bank_name, branch, account_no, account_type, currency_type)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [applicationId, acc.bank_name, acc.branch, acc.account_no, acc.account_type, acc.currency_type]
        );
      }
    }
    // Clean credit cards
    if (Array.isArray(req.body.credit_cards_clean)) {
      for (const cc of req.body.credit_cards_clean) {
        await client.query(
          `INSERT INTO autoloan_credit_cards_clean (application_id, bank_name, approved_limit)
           VALUES ($1, $2, $3)`,
          [applicationId, cc.bank_name, cc.approved_limit]
        );
      }
    }
    // Secured credit cards
    if (Array.isArray(req.body.credit_cards_secured)) {
      for (const cc of req.body.credit_cards_secured) {
        await client.query(
          `INSERT INTO autoloan_credit_cards_secured (application_id, bank_name, approved_limit)
           VALUES ($1, $2, $3)`,
          [applicationId, cc.bank_name, cc.approved_limit]
        );
      }
    }
    // Personal loans clean
    if (Array.isArray(req.body.personal_loans_clean)) {
      for (const pl of req.body.personal_loans_clean) {
        await client.query(
          `INSERT INTO autoloan_personal_loans_clean (application_id, bank_name, approved_limit, outstanding_amount)
           VALUES ($1, $2, $3, $4)`,
          [applicationId, pl.bank_name, pl.approved_limit, pl.outstanding_amount]
        );
      }
    }
    // Personal loans secured
    if (Array.isArray(req.body.personal_loans_secured)) {
      for (const pl of req.body.personal_loans_secured) {
        await client.query(
          `INSERT INTO autoloan_personal_loans_secured (application_id, bank_name, approved_limit, outstanding_amount)
           VALUES ($1, $2, $3, $4)`,
          [applicationId, pl.bank_name, pl.approved_limit, pl.outstanding_amount]
        );
      }
    }
    // Other facilities
    if (Array.isArray(req.body.other_facilities)) {
      for (const fac of req.body.other_facilities) {
        await client.query(
          `INSERT INTO autoloan_other_facilities (application_id, bank_name, approved_limit, nature, current_outstanding)
           VALUES ($1, $2, $3, $4, $5)`,
          [applicationId, fac.bank_name, fac.approved_limit, fac.nature, fac.current_outstanding]
        );
      }
    }
    // Applied limits
    if (Array.isArray(req.body.applied_limits)) {
      for (const lim of req.body.applied_limits) {
        await client.query(
          `INSERT INTO autoloan_applied_limits (application_id, bank_name, facility_under_process, nature_of_facility)
           VALUES ($1, $2, $3, $4)`,
          [applicationId, lim.bank_name, lim.facility_under_process, lim.nature_of_facility]
        );
      }
    }
    // References
    if (Array.isArray(req.body.references)) {
      for (const ref of req.body.references) {
        await client.query(
          `INSERT INTO autoloan_references (
            application_id, reference_no, name, cnic, relationship, relationship_other, house_no, street, area,
            city, country, postal_code, tel_residence, tel_office, mobile_no, email)
           VALUES
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
          [
            applicationId, ref.reference_no, ref.name, ref.cnic, ref.relationship, ref.relationship_other,
            ref.house_no, ref.street, ref.area, ref.city, ref.country, ref.postal_code, ref.tel_residence,
            ref.tel_office, ref.mobile_no, ref.email
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
          VALUES ($1, 'autoloan_applications', $2, $3, 'pending_pb_completion', true, $4, $5)
          ON CONFLICT (los_id) DO UPDATE SET
            status = 'pending_pb_completion',
            submitted_from_mobile = true,
            mobile_submission_data = $4,
            mobile_documents = $5,
            updated_at = NOW()
        `, [
          applicationId, 
          application.applicant_cnic || req.body.applicant_cnic || null, 
          application.customer_id || req.body.customer_id || null,
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
      try {
        await client.query(`SELECT update_status_by_los_id($1, 'PB_SUBMITTED')`, [applicationId]);
        console.log(`✅ Status updated to PB_SUBMITTED for AutoLoan application ${applicationId}`);
      } catch (statusError) {
        console.error(`❌ Error updating status for AutoLoan application ${applicationId}:`, statusError.message);
      }

      // 🤖 AUTOMATION: Trigger automated workflow after PB submission
      const { processNewApplication } = require('../services/automatedWorkflow');
      console.log(`🤖 AUTOMATION ENABLED: Triggering automated workflow for LOS-${applicationId}`);
      
      // Trigger automation asynchronously (don't block the response)
      setImmediate(async () => {
        try {
          const workflowResult = await processNewApplication(applicationId, {
            cnic: application.applicant_cnic || req.body.applicant_cnic,
            applicationType: 'AutoLoan'
          });
          console.log(`✅ Automated workflow completed for LOS-${applicationId}:`, workflowResult);
        } catch (error) {
          console.error(`❌ Automated workflow failed for LOS-${applicationId}:`, error.message);
        }
      });
    }

    await client.query('COMMIT');
    res.status(201).json({ 
      success: true, 
      application, 
      application_id: applicationId,
      losId: applicationId, // For mobile app compatibility (camelCase)
      status: isMobileSubmission ? 'pending_pb_completion' : 'PB_SUBMITTED',
      requiresPbCompletion: isMobileSubmission,
      message: isMobileSubmission 
        ? 'Application submitted successfully. Our team will review and complete your application shortly.' 
        : 'Application submitted successfully.'
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating autoloan application and children:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  } finally {
    client.release();
  }
});





// GET: Fetch an application and all children by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const mainResult = await db.query('SELECT * FROM autoloan_applications WHERE id = $1', [id]);
    if (mainResult.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }
    const application = mainResult.rows[0];
    const [
      otherBankAccounts,
      creditCardsClean,
      creditCardsSecured,
      personalLoansClean,
      personalLoansSecured,
      otherFacilities,
      appliedLimits,
      references,
      A_documents
    ] = await Promise.all([
      db.query('SELECT * FROM autoloan_other_bank_accounts WHERE application_id = $1', [id]),
      db.query('SELECT * FROM autoloan_credit_cards_clean WHERE application_id = $1', [id]),
      db.query('SELECT * FROM autoloan_credit_cards_secured WHERE application_id = $1', [id]),
      db.query('SELECT * FROM autoloan_personal_loans_clean WHERE application_id = $1', [id]),
      db.query('SELECT * FROM autoloan_personal_loans_secured WHERE application_id = $1', [id]),
      db.query('SELECT * FROM autoloan_other_facilities WHERE application_id = $1', [id]),
      db.query('SELECT * FROM autoloan_applied_limits WHERE application_id = $1', [id]),
      db.query('SELECT * FROM autoloan_references WHERE application_id = $1', [id]),
      db.query('SELECT * FROM autoloan_documents WHERE application_id = $1', [id]),
    ]);
    const response = {
      ...application,
      other_bank_accounts: otherBankAccounts.rows,
      credit_cards_clean: creditCardsClean.rows,
      credit_cards_secured: creditCardsSecured.rows,
      personal_loans_clean: personalLoansClean.rows,
      personal_loans_secured: personalLoansSecured.rows,
      other_facilities: otherFacilities.rows,
      applied_limits: appliedLimits.rows,
      references: references.rows,
      documents: A_documents.rows
    };
    res.json(response);
  } catch (err) {
    console.error('Error fetching autoloan application with children:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});





// GET all autoloan applications for a given customer_id (WITH all children)
router.get('/by-customer/:customer_id', async (req, res) => {
  try {
    const { customer_id } = req.params;
    if (!customer_id) {
      return res.status(400).json({ error: "customer_id is required" });
    }
    // Get all main applications for this customer
    const apps = await db.query(
      'SELECT * FROM autoloan_applications WHERE customer_id = $1 ORDER BY created_at DESC',
      [customer_id]
    );
    const out = [];
    for (const app of apps.rows) {
      const id = app.id;
      const [
        otherBankAccounts,
        creditCardsClean,
        creditCardsSecured,
        personalLoansClean,
        personalLoansSecured,
        otherFacilities,
        appliedLimits,
        references
      ] = await Promise.all([
        db.query('SELECT * FROM autoloan_other_bank_accounts WHERE application_id = $1', [id]),
        db.query('SELECT * FROM autoloan_credit_cards_clean WHERE application_id = $1', [id]),
        db.query('SELECT * FROM autoloan_credit_cards_secured WHERE application_id = $1', [id]),
        db.query('SELECT * FROM autoloan_personal_loans_clean WHERE application_id = $1', [id]),
        db.query('SELECT * FROM autoloan_personal_loans_secured WHERE application_id = $1', [id]),
        db.query('SELECT * FROM autoloan_other_facilities WHERE application_id = $1', [id]),
        db.query('SELECT * FROM autoloan_applied_limits WHERE application_id = $1', [id]),
        db.query('SELECT * FROM autoloan_references WHERE application_id = $1', [id])
      ]);
      out.push({
        ...app,
        other_bank_accounts: otherBankAccounts.rows,
        credit_cards_clean: creditCardsClean.rows,
        credit_cards_secured: creditCardsSecured.rows,
        personal_loans_clean: personalLoansClean.rows,
        personal_loans_secured: personalLoansSecured.rows,
        other_facilities: otherFacilities.rows,
        applied_limits: appliedLimits.rows,
        references: references.rows
      });
    }
    res.json(out);
  } catch (err) {
    console.error('Error fetching autoloan applications by customer_id:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});




module.exports = router;

