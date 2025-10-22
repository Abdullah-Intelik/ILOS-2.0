const db = require('../db1');

async function setupCoreSchema() {
  try {
    console.log('🔧 Setting up core ILOS schema (db1)...');

    // Core registry
    await db.query(`
      CREATE TABLE IF NOT EXISTS ilos_applications (
        los_id                INTEGER PRIMARY KEY,
        loan_type             TEXT NOT NULL,
        customer_id           TEXT,
        cnic                  VARCHAR(13),
        status                TEXT,
        cops_submitted        BOOLEAN DEFAULT FALSE,
        eavmu_submitted       BOOLEAN DEFAULT FALSE,
        -- Dual-forward approval flags
        risk_approved         BOOLEAN DEFAULT FALSE,
        compliance_approved   BOOLEAN DEFAULT FALSE,
        -- SPU checklist fields (used by code paths)
        -- IMPORTANT: Boolean semantics - TRUE = CLEARED/VERIFIED, FALSE = NOT CLEARED/HIT FOUND
        -- SPU Dashboard UI: Checkbox checked (TRUE) means "verified clear/no hit found"
        -- Decision Engine: Inverts these values to detect failures (see backend/lib/modules/SPU.js)
        spu_ecib_check        BOOLEAN,  -- TRUE = cleared, FALSE = not checked/hit
        spu_ecib_comment      TEXT,
        spu_frmu_check        BOOLEAN,  -- TRUE = cleared, FALSE = not checked/hit
        spu_frmu_comment      TEXT,
        spu_negative_list_check BOOLEAN,  -- TRUE = cleared, FALSE = not checked/hit
        spu_negative_list_comment TEXT,
        spu_pep_list_check    BOOLEAN,  -- TRUE = cleared, FALSE = not checked/hit
        spu_pep_list_comment  TEXT,
        spu_credit_card_30k_check BOOLEAN,  -- TRUE = cleared, FALSE = not checked/hit
        spu_credit_card_30k_comment TEXT,
        spu_black_list_check  BOOLEAN,  -- TRUE = cleared, FALSE = not checked/hit
        spu_black_list_comment TEXT,
        spu_ctl_check         BOOLEAN,  -- TRUE = cleared, FALSE = not checked/hit
        spu_ctl_comment       TEXT,
        spu_checklist_completed_at TIMESTAMP,
        risk_resolve_comment        TEXT,
        compliance_resolve_comment  TEXT,
        created_at            TIMESTAMP DEFAULT NOW(),
        updated_at            TIMESTAMP DEFAULT NOW()
      );
    `);

    // Ensure flags exist for existing deployments
    await db.query(`
      ALTER TABLE ilos_applications ADD COLUMN IF NOT EXISTS risk_approved BOOLEAN DEFAULT FALSE;
    `);
    await db.query(`
      ALTER TABLE ilos_applications ADD COLUMN IF NOT EXISTS compliance_approved BOOLEAN DEFAULT FALSE;
    `);

    await db.query(`CREATE INDEX IF NOT EXISTS idx_ilos_applications_loan_type ON ilos_applications(loan_type);`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_ilos_applications_status ON ilos_applications(status);`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_ilos_applications_cnic ON ilos_applications(cnic);`);

    // Enforce allowed loan_type values via CHECK if not present
    await db.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'ilos_applications_loan_type_check'
        ) THEN
          ALTER TABLE ilos_applications
          ADD CONSTRAINT ilos_applications_loan_type_check
          CHECK (loan_type IN (
            'cashplus_applications',
            'autoloan_applications',
            'ameendrive_applications',
            'smeasaan_applications',
            'commercial_vehicle_applications',
            'platinum_card_applications',
            'creditcard_applications'
          ));
        END IF;
      END$$;
    `);

    // Minimal product tables (create if not exists, non-destructive)
    await db.query(`
      CREATE TABLE IF NOT EXISTS cashplus_applications (
        id INTEGER PRIMARY KEY,
        customer_id TEXT,
        -- keep minimal definitions; columns added below idempotently
        amount_requested NUMERIC,
        status TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Ensure all required columns exist for cashplus route
    const addCols = async (defs) => {
      for (const def of defs) {
        await db.query(`ALTER TABLE cashplus_applications ADD COLUMN IF NOT EXISTS ${def}`);
      }
    };
    await addCols([
      `loan_type TEXT`,
      `min_amount_acceptable NUMERIC`,
      `max_affordable_installment NUMERIC`,
      `tenure SMALLINT`,
      `is_ubl_existing_customer BOOLEAN`,
      `branch TEXT`,
      `account TEXT`,
      `purpose_of_loan TEXT`,
      `purpose_of_loan_other TEXT`,
      `title TEXT`,
      `first_name TEXT`,
      `middle_name TEXT`,
      `last_name TEXT`,
      `cnic VARCHAR(13)`,
      `ntn TEXT`,
      `date_of_birth DATE`,
      `gender TEXT`,
      `marital_status TEXT`,
      `dependants SMALLINT`,
      `education_qualification TEXT`,
      `education_qualification_other TEXT`,
      `father_or_husband_name TEXT`,
      `mother_maiden_name TEXT`,
      `employment_status TEXT`,
      `address TEXT`,
      `nearest_landmark TEXT`,
      `city TEXT`,
      `postal_code TEXT`,
      `residing_since TEXT`,
      `accommodation_type TEXT`,
      `accommodation_type_other TEXT`,
      `monthly_rent NUMERIC`,
      `preferred_mailing_address TEXT`,
      `permanent_house_no TEXT`,
      `permanent_street TEXT`,
      `permanent_city TEXT`,
      `permanent_postal_code TEXT`,
      `tel_current TEXT`,
      `tel_permanent TEXT`,
      `mobile TEXT`,
      `mobile_type TEXT`,
      `other_contact TEXT`,
      `company_name TEXT`,
      `company_type TEXT`,
      `company_type_other TEXT`,
      `department TEXT`,
      `designation TEXT`,
      `grade_level TEXT`,
      `exp_current_years SMALLINT`,
      `prev_employer_name TEXT`,
      `exp_prev_years SMALLINT`,
      `office_house_no TEXT`,
      `office_street TEXT`,
      `office_area TEXT`,
      `office_landmark TEXT`,
      `office_city TEXT`,
      `office_postal_code TEXT`,
      `office_fax TEXT`,
      `office_tel1 TEXT`,
      `office_tel2 TEXT`,
      `office_ext TEXT`,
      `gross_monthly_salary NUMERIC`,
      `other_monthly_income NUMERIC`,
      `net_monthly_income NUMERIC`,
      `other_income_sources TEXT`,
      `is_ubl_customer BOOLEAN`,
      `ubl_account_number TEXT`,
      `applicant_signature TEXT`,
      `applicant_signature_date DATE`,
      `application_source TEXT`,
      `channel_code TEXT`,
      `so_employee_no TEXT`,
      `program_code TEXT`,
      `pb_bm_employee_no TEXT`,
      `branch_code TEXT`,
      `sm_employee_no TEXT`,
      `bm_signature_stamp TEXT`
    ]);

    // CashPlus child tables used in routes
    await db.query(`
      CREATE TABLE IF NOT EXISTS cashplus_credit_cards_clean (
        id SERIAL PRIMARY KEY,
        application_id INTEGER NOT NULL REFERENCES cashplus_applications(id) ON DELETE CASCADE,
        bank_name TEXT,
        approved_limit NUMERIC
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS cashplus_credit_cards_secured (
        id SERIAL PRIMARY KEY,
        application_id INTEGER NOT NULL REFERENCES cashplus_applications(id) ON DELETE CASCADE,
        bank_name TEXT,
        approved_limit NUMERIC
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS cashplus_personal_loans_existing (
        id SERIAL PRIMARY KEY,
        application_id INTEGER NOT NULL REFERENCES cashplus_applications(id) ON DELETE CASCADE,
        bank_name TEXT,
        approved_limit NUMERIC,
        outstanding_amount NUMERIC,
        as_of DATE
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS cashplus_other_facilities (
        id SERIAL PRIMARY KEY,
        application_id INTEGER NOT NULL REFERENCES cashplus_applications(id) ON DELETE CASCADE,
        bank_name TEXT,
        approved_limit NUMERIC,
        nature TEXT,
        current_outstanding NUMERIC
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS cashplus_personal_loans_under_process (
        id SERIAL PRIMARY KEY,
        application_id INTEGER NOT NULL REFERENCES cashplus_applications(id) ON DELETE CASCADE,
        bank_name TEXT,
        facility_under_process TEXT,
        nature_of_facility TEXT
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS cashplus_references (
        id SERIAL PRIMARY KEY,
        application_id INTEGER NOT NULL REFERENCES cashplus_applications(id) ON DELETE CASCADE,
        reference_no TEXT,
        name TEXT,
        cnic VARCHAR(13),
        relationship TEXT,
        house_no TEXT,
        street TEXT,
        area TEXT,
        city TEXT,
        postal_code TEXT,
        tel_residence TEXT,
        tel_office TEXT,
        mobile TEXT,
        fax TEXT,
        email TEXT
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS cashplus_documents (
        id SERIAL PRIMARY KEY,
        application_id INTEGER NOT NULL REFERENCES cashplus_applications(id) ON DELETE CASCADE,
        document_type TEXT,
        file_name TEXT,
        file_path TEXT,
        uploaded_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS autoloan_applications (
        id INTEGER PRIMARY KEY,
        customer_id TEXT,
        first_name TEXT,
        last_name TEXT,
        applicant_cnic VARCHAR(13),
        price_value NUMERIC,
        status TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS ameendrive_applications (
        id INTEGER PRIMARY KEY,
        customer_id TEXT,
        applicant_full_name TEXT,
        applicant_cnic VARCHAR(13),
        price_value NUMERIC,
        status TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Ensure all required columns exist for AmeenDrive route
    const addAmeenCols = async (defs) => {
      for (const def of defs) {
        await db.query(`ALTER TABLE ameendrive_applications ADD COLUMN IF NOT EXISTS ${def}`);
      }
    };
    await addAmeenCols([
      // top-level meta
      `city TEXT`,
      `auto_application_id TEXT`,
      `product_type TEXT`,
      `pricing_plan TEXT`,
      `payment_mode TEXT`,
      `current_rate_kibor NUMERIC`,
      `current_rate_spread NUMERIC`,
      `co_applicant_case BOOLEAN`,
      `co_applicant_name TEXT`,
      `co_applicant_relationship TEXT`,
      // vehicle
      `vehicle_manufacturer TEXT`,
      `vehicle_model TEXT`,
      `year_of_manufacture SMALLINT`,
      `vehicle_class_engine_size TEXT`,
      // used car seller info
      `used_seller_name TEXT`,
      `used_seller_cnic TEXT`,
      `used_house_no TEXT`,
      `used_street TEXT`,
      `used_area TEXT`,
      `used_landmark TEXT`,
      `used_city TEXT`,
      `used_country TEXT`,
      `used_postal_code TEXT`,
      `used_contact_no TEXT`,
      `used_bank TEXT`,
      `used_branch TEXT`,
      `used_account_no TEXT`,
      // takaful/tracker/financing
      `takaful_company_name TEXT`,
      `takaful_rate NUMERIC`,
      `tracker_company_arranged BOOLEAN`,
      `facility_type TEXT`,
      `musharakah_share_percent NUMERIC`,
      `musharakah_share_amount NUMERIC`,
      `auto_financing_percent NUMERIC`,
      `auto_financing_amount NUMERIC`,
      `monthly_rental NUMERIC`,
      `monthly_rental_in_words TEXT`,
      `loan_period SMALLINT`,
      `delivery_option TEXT`,
      `agreement_understanding BOOLEAN`,
      // applicant info
      `father_husband_name TEXT`,
      `mother_maiden_name TEXT`,
      `date_of_birth DATE`,
      `gender TEXT`,
      `marital_status TEXT`,
      `national_tax_no TEXT`,
      `passport_no TEXT`,
      `dependents_children SMALLINT`,
      `other_dependents SMALLINT`,
      `educational_qualification TEXT`,
      // current address
      `curr_house_no TEXT`,
      `curr_street TEXT`,
      `curr_area TEXT`,
      `curr_landmark TEXT`,
      `curr_city TEXT`,
      `curr_country TEXT`,
      `curr_postal_code TEXT`,
      `residence_status TEXT`,
      `curr_monthly_rent NUMERIC`,
      `curr_accommodation_type TEXT`,
      `curr_residence_no TEXT`,
      `curr_rented_years SMALLINT`,
      `curr_mobile_no TEXT`,
      `curr_fax_no TEXT`,
      `curr_email TEXT`,
      // permanent address + existing car
      `perm_house_no TEXT`,
      `perm_street TEXT`,
      `perm_area TEXT`,
      `perm_landmark TEXT`,
      `perm_city TEXT`,
      `perm_country TEXT`,
      `perm_postal_code TEXT`,
      `existing_car_info TEXT`,
      `perm_car_manufacturer TEXT`,
      `perm_car_model TEXT`,
      `perm_car_year SMALLINT`,
      `perm_car_status TEXT`,
      // employment/business
      `employment_type TEXT`,
      `company_name TEXT`,
      `business_type TEXT`,
      `business_type_other TEXT`,
      `profession TEXT`,
      `nature_of_business TEXT`,
      `years_in_business SMALLINT`,
      `percent_shareholding NUMERIC`,
      `employment_status TEXT`,
      `designation TEXT`,
      `department TEXT`,
      `grade TEXT`,
      `business_address TEXT`,
      `business_street TEXT`,
      `business_tehsil_district_area TEXT`,
      `business_city TEXT`,
      `business_country TEXT`,
      `business_postal_code TEXT`,
      `business_telephone_no TEXT`,
      `business_fax_no TEXT`,
      `business_nearest_landmark TEXT`,
      `prev_employer_name TEXT`,
      `prev_designation TEXT`,
      `prev_experience_years SMALLINT`,
      `prev_employer_tel TEXT`,
      `prof_company_name TEXT`,
      `prof_address TEXT`,
      `prof_profession TEXT`,
      // income
      `regular_monthly NUMERIC`,
      `gross_income NUMERIC`,
      `net_take_home NUMERIC`,
      `other_monthly_income NUMERIC`,
      `source_of_other_income TEXT`,
      `monthly_income NUMERIC`,
      `avg_monthly_savings NUMERIC`,
      `spouse_employed BOOLEAN`,
      `spouse_income_source TEXT`,
      // misc
      `channel_code TEXT`,
      `pb_so_employee_no TEXT`,
      `program_code TEXT`,
      `referral_id TEXT`,
      `branch_code TEXT`,
      `sm_employee_no TEXT`,
      `application_source TEXT`,
      `branch_name_code TEXT`,
      `dealership_name TEXT`,
      `nontax_full_name TEXT`,
      `nontax_resident_of TEXT`,
      `nontax_applied_financing BOOLEAN`,
      `nontax_no_ntn BOOLEAN`,
      // BYTEA signature/stamps
      `applicant_signature BYTEA`,
      `co_applicant_signature BYTEA`,
      `applicant_signature_cnic BYTEA`,
      `co_applicant_signature_cnic BYTEA`,
      `nontax_applicant_signature BYTEA`,
      `dealer_stamp BYTEA`,
      `branch_stamp BYTEA`
    ]);

    // AmeenDrive child tables used in routes
    await db.query(`
      CREATE TABLE IF NOT EXISTS ameendrive_bank_accounts (
        id SERIAL PRIMARY KEY,
        application_id INTEGER NOT NULL REFERENCES ameendrive_applications(id) ON DELETE CASCADE,
        bank_name TEXT,
        branch TEXT,
        account_no TEXT,
        account_type TEXT,
        currency_type TEXT
      );
    `);
    await db.query(`
      CREATE TABLE IF NOT EXISTS ameendrive_bank_facilities (
        id SERIAL PRIMARY KEY,
        application_id INTEGER NOT NULL REFERENCES ameendrive_applications(id) ON DELETE CASCADE,
        financing_payable_to TEXT,
        purpose_of_financing TEXT,
        date_financing_taken DATE,
        outstanding_balance NUMERIC,
        monthly_installment NUMERIC
      );
    `);
    await db.query(`
      CREATE TABLE IF NOT EXISTS ameendrive_references (
        id SERIAL PRIMARY KEY,
        application_id INTEGER NOT NULL REFERENCES ameendrive_applications(id) ON DELETE CASCADE,
        reference_no TEXT,
        name TEXT,
        cnic VARCHAR(13),
        relationship TEXT,
        relationship_other TEXT,
        address TEXT,
        residence_no TEXT,
        mobile_no TEXT,
        email TEXT,
        business_address TEXT,
        office_telephone_no TEXT
      );
    `);
    await db.query(`
      CREATE TABLE IF NOT EXISTS ameendrive_documents (
        id SERIAL PRIMARY KEY,
        application_id INTEGER NOT NULL REFERENCES ameendrive_applications(id) ON DELETE CASCADE,
        document_type TEXT,
        file_name TEXT,
        file_path TEXT,
        uploaded_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS smeasaan_applications (
        id INTEGER PRIMARY KEY,
        applicant_name TEXT,
        applicant_cnic VARCHAR(13),
        desired_loan_amount NUMERIC,
        status TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS commercial_vehicle_applications (
        id INTEGER PRIMARY KEY,
        applicant_name TEXT,
        applicant_cnic VARCHAR(13),
        desired_loan_amount NUMERIC,
        status TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS creditcard_applications (
        id INTEGER PRIMARY KEY,
        customer_id TEXT,
        full_name TEXT,
        nic_or_passport TEXT,
        card_type TEXT,
        card_category TEXT,
        application_status TEXT,
        status TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS platinum_card_applications (
        id INTEGER PRIMARY KEY,
        customer_id TEXT,
        first_name TEXT,
        last_name TEXT,
        nic TEXT,
        application_status TEXT,
        status TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // ========== EXPAND AUTOLOAN SCHEMA AND CHILD TABLES ==========
    const addAutoloanCols = async (defs) => {
      for (const def of defs) {
        await db.query(`ALTER TABLE autoloan_applications ADD COLUMN IF NOT EXISTS ${def}`);
      }
    };
    await addAutoloanCols([
      `city TEXT`,
      `auto_application_id TEXT`,
      `product_type TEXT`,
      `payment_mode TEXT`,
      `pricing_plan TEXT`,
      `fixed_rate NUMERIC`,
      `kibor_rate NUMERIC`,
      `margin NUMERIC`,
      `vehicle_manufacturer TEXT`,
      `vehicle_model TEXT`,
      `year_of_manufacture SMALLINT`,
      `vehicle_class_engine_size TEXT`,
      `down_payment_percent NUMERIC`,
      `down_payment_amount NUMERIC`,
      `desired_loan_amount NUMERIC`,
      `installment_period TEXT`,
      `used_seller_name TEXT`,
      `used_seller_cnic VARCHAR(13)`,
      `used_house_no TEXT`,
      `used_street TEXT`,
      `used_area TEXT`,
      `used_landmark TEXT`,
      `used_city TEXT`,
      `used_country TEXT`,
      `used_postal_code TEXT`,
      `used_contact_no TEXT`,
      `used_bank TEXT`,
      `used_branch TEXT`,
      `used_account_no TEXT`,
      `insurance_company_name TEXT`,
      `insurance_rate NUMERIC`,
      `dealer_name TEXT`,
      `title TEXT`,
      `middle_name TEXT`,
      `ntn TEXT`,
      `passport_no TEXT`,
      `educational_qualification TEXT`,
      `mothers_maiden_name TEXT`,
      `num_children SMALLINT`,
      `num_other_dependents SMALLINT`,
      `dependents_specify TEXT`,
      `next_of_kin TEXT`,
      `next_of_kin_relation TEXT`,
      `next_of_kin_cnic TEXT`,
      `next_of_kin_contact TEXT`,
      `curr_house_no TEXT`,
      `curr_street TEXT`,
      `curr_area TEXT`,
      `curr_landmark TEXT`,
      `curr_city TEXT`,
      `curr_country TEXT`,
      `curr_postal_code TEXT`,
      `curr_tel_residence TEXT`,
      `curr_mobile TEXT`,
      `curr_email TEXT`,
      `curr_years_address TEXT`,
      `curr_years_city TEXT`,
      `residential_status TEXT`,
      `monthly_rent NUMERIC`,
      `perm_house_no TEXT`,
      `perm_street TEXT`,
      `perm_area TEXT`,
      `perm_city TEXT`,
      `perm_country TEXT`,
      `perm_postal_code TEXT`,
      `perm_tel_residence TEXT`,
      `co_borrower_case BOOLEAN`,
      `co_borrower_name TEXT`,
      `co_borrower_relationship TEXT`,
      `co_borrower_cnic TEXT`,
      `business_type TEXT`,
      `business_type_other TEXT`,
      `profession TEXT`,
      `nature_of_business TEXT`,
      `years_in_business SMALLINT`,
      `shareholding_percent NUMERIC`,
      `grade_level TEXT`,
      `business_address TEXT`,
      `business_street TEXT`,
      `business_area TEXT`,
      `business_city TEXT`,
      `business_country TEXT`,
      `business_postal_code TEXT`,
      `business_tel TEXT`,
      `business_landmark TEXT`,
      `prev_designation TEXT`,
      `prev_experience_years SMALLINT`,
      `prev_employer_tel TEXT`,
      `other_income_type TEXT`,
      `other_income_specify TEXT`,
      `spouse_employed BOOLEAN`,
      `spousal_income NUMERIC`,
      `spouse_income_source TEXT`,
      `statement_to_be_sent TEXT`,
      `repayment_bank_name TEXT`,
      `repayment_branch TEXT`,
      `repayment_account_no TEXT`,
      `repayment_account_type TEXT`,
      `repayment_currency_type TEXT`,
      `application_source TEXT`,
      `so_employee_name TEXT`,
      `pb_bm_employee_name TEXT`,
      `sm_employee_name TEXT`,
      `dealership_name TEXT`,
      `branch_name_code TEXT`,
      `financing_option TEXT`,
      `applicant_signature_date DATE`,
      `co_borrower_signature_date DATE`
    ]);

    // Autoloan child tables
    await db.query(`CREATE TABLE IF NOT EXISTS autoloan_other_bank_accounts (id SERIAL PRIMARY KEY, application_id INTEGER NOT NULL REFERENCES autoloan_applications(id) ON DELETE CASCADE, bank_name TEXT, branch TEXT, account_no TEXT, account_type TEXT, currency_type TEXT);`);
    await db.query(`CREATE TABLE IF NOT EXISTS autoloan_credit_cards_clean (id SERIAL PRIMARY KEY, application_id INTEGER NOT NULL REFERENCES autoloan_applications(id) ON DELETE CASCADE, bank_name TEXT, approved_limit NUMERIC);`);
    await db.query(`CREATE TABLE IF NOT EXISTS autoloan_credit_cards_secured (id SERIAL PRIMARY KEY, application_id INTEGER NOT NULL REFERENCES autoloan_applications(id) ON DELETE CASCADE, bank_name TEXT, approved_limit NUMERIC);`);
    await db.query(`CREATE TABLE IF NOT EXISTS autoloan_personal_loans_clean (id SERIAL PRIMARY KEY, application_id INTEGER NOT NULL REFERENCES autoloan_applications(id) ON DELETE CASCADE, bank_name TEXT, approved_limit NUMERIC, outstanding_amount NUMERIC);`);
    await db.query(`CREATE TABLE IF NOT EXISTS autoloan_personal_loans_secured (id SERIAL PRIMARY KEY, application_id INTEGER NOT NULL REFERENCES autoloan_applications(id) ON DELETE CASCADE, bank_name TEXT, approved_limit NUMERIC, outstanding_amount NUMERIC);`);
    await db.query(`CREATE TABLE IF NOT EXISTS autoloan_other_facilities (id SERIAL PRIMARY KEY, application_id INTEGER NOT NULL REFERENCES autoloan_applications(id) ON DELETE CASCADE, bank_name TEXT, approved_limit NUMERIC, nature TEXT, current_outstanding NUMERIC);`);
    await db.query(`CREATE TABLE IF NOT EXISTS autoloan_applied_limits (id SERIAL PRIMARY KEY, application_id INTEGER NOT NULL REFERENCES autoloan_applications(id) ON DELETE CASCADE, bank_name TEXT, facility_under_process TEXT, nature_of_facility TEXT);`);
    await db.query(`CREATE TABLE IF NOT EXISTS autoloan_references (id SERIAL PRIMARY KEY, application_id INTEGER NOT NULL REFERENCES autoloan_applications(id) ON DELETE CASCADE, reference_no TEXT, name TEXT, cnic TEXT, relationship TEXT, relationship_other TEXT, house_no TEXT, street TEXT, area TEXT, city TEXT, country TEXT, postal_code TEXT, tel_residence TEXT, tel_office TEXT, mobile_no TEXT, email TEXT);`);
    await db.query(`CREATE TABLE IF NOT EXISTS autoloan_documents (id SERIAL PRIMARY KEY, application_id INTEGER NOT NULL REFERENCES autoloan_applications(id) ON DELETE CASCADE, document_type TEXT, file_name TEXT, file_path TEXT, uploaded_at TIMESTAMP DEFAULT NOW());`);

    // ========== EXPAND SMEASAAN SCHEMA AND CHILD TABLES ==========
    const addSmeCols = async (defs) => {
      for (const def of defs) {
        await db.query(`ALTER TABLE smeasaan_applications ADD COLUMN IF NOT EXISTS ${def}`);
      }
    };
    await addSmeCols([
      `customer_id TEXT`,
      `application_no TEXT`,
      `date_of_request DATE`,
      `lcv TEXT`,
      `pmkj_yes TEXT`,
      `branch_code TEXT`,
      `city TEXT`,
      `sales_officer_emp_no TEXT`,
      `sales_manager_emp_no TEXT`,
      `fr_br_emp_no TEXT`,
      `channel TEXT`,
      `cnic_issuance_date DATE`,
      `cnic_expiry_date DATE`,
      `applicant_dob DATE`,
      `father_husband_name TEXT`,
      `gender TEXT`,
      `mother_maiden_name TEXT`,
      `residence_landline_no TEXT`,
      `marital_status TEXT`,
      `cell_no TEXT`,
      `residence_tenure_months TEXT`,
      `residence_type TEXT`,
      `num_dependents SMALLINT`,
      `education_level TEXT`,
      `curr_residence_address TEXT`,
      `perm_residence_address TEXT`,
      `company_name TEXT`,
      `company_legal_status TEXT`,
      `group_name TEXT`,
      `experience_years TEXT`,
      `business_landline_no TEXT`,
      `business_cell_no TEXT`,
      `sector_se TEXT`,
      `sector_me TEXT`,
      `sector_manufacturing TEXT`,
      `sector_traders_distributors TEXT`,
      `sector_wholesaler_retailer TEXT`,
      `sector_services TEXT`,
      `sector_individuals TEXT`,
      `national_tax_no TEXT`,
      `tax_payer TEXT`,
      `email TEXT`,
      `nearest_landmark TEXT`,
      `num_employees TEXT`,
      `annual_sales_pkr NUMERIC`,
      `business_address TEXT`,
      `political_affiliation TEXT`,
      `ubl_bank_account_no TEXT`,
      `ubl_bank_title TEXT`,
      `fax_no TEXT`,
      `business_est_date DATE`,
      `business_premises TEXT`,
      `registration_no TEXT`,
      `main_business_account_bank TEXT`,
      `main_business_account_no TEXT`,
      `main_business_account_open_date DATE`,
      `vehicle_local_assembled TEXT`,
      `vehicle_imported TEXT`,
      `vehicle_new TEXT`,
      `vehicle_used TEXT`,
      `engine_no TEXT`,
      `engine_size_cc TEXT`,
      `chassis_no TEXT`,
      `purchase_poa TEXT`,
      `purchase_pod TEXT`,
      `seller_name TEXT`,
      `seller_cnic TEXT`,
      `seller_address TEXT`,
      `seller_contact_no TEXT`,
      `dealer_name TEXT`,
      `dealer_address TEXT`,
      `dealer_email TEXT`,
      `dealer_contact_no TEXT`,
      `vehicle_name TEXT`,
      `tenure_years TEXT`,
      `pricing TEXT`,
      `down_payment_percent NUMERIC`,
      `down_payment_amount NUMERIC`,
      `insurance_company_name TEXT`,
      `tracker_company_name TEXT`
    ]);
    await db.query(`CREATE TABLE IF NOT EXISTS smeasaan_references (id SERIAL PRIMARY KEY, application_id INTEGER NOT NULL REFERENCES smeasaan_applications(id) ON DELETE CASCADE, reference_no TEXT, name TEXT, cnic TEXT, relationship TEXT, address TEXT, contact_no TEXT);`);
    await db.query(`CREATE TABLE IF NOT EXISTS smeasaan_existing_loans (id SERIAL PRIMARY KEY, application_id INTEGER NOT NULL REFERENCES smeasaan_applications(id) ON DELETE CASCADE, facility_type TEXT, amount NUMERIC, tenor TEXT, purpose TEXT, security_nature_particular TEXT, security_value NUMERIC, repayment_frequency TEXT);`);
    await db.query(`CREATE TABLE IF NOT EXISTS smeasaan_business_descriptions (id SERIAL PRIMARY KEY, application_id INTEGER NOT NULL REFERENCES smeasaan_applications(id) ON DELETE CASCADE, business_type TEXT, products_services_offered TEXT);`);
    await db.query(`CREATE TABLE IF NOT EXISTS smeasaan_market_info (id SERIAL PRIMARY KEY, application_id INTEGER NOT NULL REFERENCES smeasaan_applications(id) ON DELETE CASCADE, type TEXT, name TEXT, terms_of_trade TEXT, cash_percent TEXT, credit_percent TEXT, tenor TEXT, relationship_since_years TEXT);`);
    await db.query(`CREATE TABLE IF NOT EXISTS smeasaan_financial_indicators (id SERIAL PRIMARY KEY, application_id INTEGER NOT NULL REFERENCES smeasaan_applications(id) ON DELETE CASCADE, assets NUMERIC, liabilities NUMERIC, borrowings NUMERIC, revenue NUMERIC, expenses NUMERIC);`);
    await db.query(`CREATE TABLE IF NOT EXISTS smeasaan_financial_indicators_medium (id SERIAL PRIMARY KEY, application_id INTEGER NOT NULL REFERENCES smeasaan_applications(id) ON DELETE CASCADE, cash_in_hand NUMERIC, cash_at_bank NUMERIC, inventory_value NUMERIC, investments NUMERIC, fixed_investments NUMERIC, current_assets NUMERIC, total_assets NUMERIC, current_liabilities NUMERIC, borrowings NUMERIC, total_liabilities NUMERIC, total_equity NUMERIC, gross_revenue NUMERIC, total_expenses NUMERIC, profit_after_tax NUMERIC);`);
    await db.query(`CREATE TABLE IF NOT EXISTS smeasaan_documents (id SERIAL PRIMARY KEY, application_id INTEGER NOT NULL REFERENCES smeasaan_applications(id) ON DELETE CASCADE, document_type TEXT, file_name TEXT, file_path TEXT, uploaded_at TIMESTAMP DEFAULT NOW());`);

    // ========== EXPAND COMMERCIAL VEHICLE SCHEMA AND CHILD TABLES ==========
    const addCVCols = async (defs) => {
      for (const def of defs) {
        await db.query(`ALTER TABLE commercial_vehicle_applications ADD COLUMN IF NOT EXISTS ${def}`);
      }
    };
    await addCVCols([
      `customer_id TEXT`,
      `application_no TEXT`,
      `date_of_request DATE`,
      `branch_code TEXT`,
      `city TEXT`,
      `sales_officer_emp_no TEXT`,
      `sales_manager_emp_no TEXT`,
      `pb_bm_employee_no TEXT`,
      `channel TEXT`,
      `cnic_issuance_date DATE`,
      `cnic_expiry_date DATE`,
      `date_of_birth DATE`,
      `father_husband_name TEXT`,
      `mother_maiden_name TEXT`,
      `gender TEXT`,
      `marital_status TEXT`,
      `residence_landline_no TEXT`,
      `cell_no TEXT`,
      `residence_tenure_months TEXT`,
      `residence_type TEXT`,
      `num_dependents SMALLINT`,
      `education_level TEXT`,
      `current_address TEXT`,
      `permanent_address TEXT`,
      `company_name TEXT`,
      `group_name TEXT`,
      `company_legal_status TEXT`,
      `type_of_business TEXT`,
      `experience_years TEXT`,
      `nature_of_business TEXT`,
      `business_landline_no TEXT`,
      `business_cell_no TEXT`,
      `national_tax_no TEXT`,
      `tax_payer TEXT`,
      `email TEXT`,
      `nearest_landmark TEXT`,
      `num_employees TEXT`,
      `annual_sales_pkr NUMERIC`,
      `business_address TEXT`,
      `political_affiliation TEXT`,
      `ubl_bank_account_no TEXT`,
      `ubl_bank_title TEXT`,
      `fax_no TEXT`,
      `company_est_date DATE`,
      `business_premises TEXT`,
      `main_business_account_bank TEXT`,
      `main_business_account_no TEXT`,
      `main_business_account_open_date DATE`,
      `registration_no TEXT`,
      `vehicle_manufacturer TEXT`,
      `vehicle_model TEXT`,
      `vehicle_year TEXT`,
      `vehicle_local_assembled TEXT`,
      `vehicle_new_used TEXT`,
      `engine_no TEXT`,
      `engine_size_cc TEXT`,
      `chassis_no TEXT`,
      `purchase_type TEXT`,
      `vehicle_price NUMERIC`,
      `seller_name TEXT`,
      `seller_cnic TEXT`,
      `seller_address TEXT`,
      `seller_contact_no TEXT`,
      `dealer_name TEXT`,
      `dealer_email TEXT`,
      `dealer_address TEXT`,
      `dealer_contact_no TEXT`,
      `vehicle_name TEXT`,
      `desired_loan_amount NUMERIC`,
      `tenure_years TEXT`,
      `pricing TEXT`,
      `down_payment_percent NUMERIC`,
      `down_payment_amount NUMERIC`,
      `insurance_company_name TEXT`,
      `tracker_company_name TEXT`
    ]);
    await db.query(`CREATE TABLE IF NOT EXISTS commercial_vehicle_references (id SERIAL PRIMARY KEY, application_id INTEGER NOT NULL REFERENCES commercial_vehicle_applications(id) ON DELETE CASCADE, reference_no TEXT, name TEXT, cnic TEXT, relationship TEXT, address TEXT, contact_no TEXT);`);
    await db.query(`CREATE TABLE IF NOT EXISTS commercial_vehicle_existing_loans (id SERIAL PRIMARY KEY, application_id INTEGER NOT NULL REFERENCES commercial_vehicle_applications(id) ON DELETE CASCADE, facility_type TEXT, amount NUMERIC, tenor TEXT, purpose TEXT, security_collateral_nature TEXT, security_collateral_value NUMERIC, repayment_frequency TEXT);`);
    await db.query(`CREATE TABLE IF NOT EXISTS commercial_vehicle_business_descriptions (id SERIAL PRIMARY KEY, application_id INTEGER NOT NULL REFERENCES commercial_vehicle_applications(id) ON DELETE CASCADE, business_type TEXT, products_services_offered TEXT);`);
    await db.query(`CREATE TABLE IF NOT EXISTS commercial_vehicle_market_info (id SERIAL PRIMARY KEY, application_id INTEGER NOT NULL REFERENCES commercial_vehicle_applications(id) ON DELETE CASCADE, type TEXT, name TEXT, terms_of_trade TEXT, cash_percent TEXT, credit_percent TEXT, tenor TEXT, relationship_since_years TEXT);`);
    await db.query(`CREATE TABLE IF NOT EXISTS commercial_vehicle_financial_indicators (id SERIAL PRIMARY KEY, application_id INTEGER NOT NULL REFERENCES commercial_vehicle_applications(id) ON DELETE CASCADE, assets NUMERIC, liabilities NUMERIC, borrowings NUMERIC, revenue NUMERIC, expenses NUMERIC);`);
    await db.query(`CREATE TABLE IF NOT EXISTS commercial_vehicle_financial_indicators_medium (id SERIAL PRIMARY KEY, application_id INTEGER NOT NULL REFERENCES commercial_vehicle_applications(id) ON DELETE CASCADE, cash_in_hand NUMERIC, cash_at_bank NUMERIC, inventory_value NUMERIC, investments NUMERIC, fixed_investments NUMERIC, current_assets NUMERIC, total_assets NUMERIC, current_liabilities NUMERIC, borrowings NUMERIC, total_liabilities NUMERIC, total_equity NUMERIC, gross_revenue NUMERIC, total_expenses NUMERIC, profit_after_tax NUMERIC);`);
    await db.query(`CREATE TABLE IF NOT EXISTS commercial_vehicle_documents (id SERIAL PRIMARY KEY, application_id INTEGER NOT NULL REFERENCES commercial_vehicle_applications(id) ON DELETE CASCADE, document_type TEXT, file_name TEXT, file_path TEXT, uploaded_at TIMESTAMP DEFAULT NOW());`);

    // ========== EXPAND CREDITCARD SCHEMA AND CHILD TABLES ==========
    const addCCCols = async (defs) => {
      for (const def of defs) {
        await db.query(`ALTER TABLE creditcard_applications ADD COLUMN IF NOT EXISTS ${def}`);
      }
    };
    await addCCCols([
      `card_type TEXT`,
      `card_category TEXT`,
      `special_card_option TEXT`,
      `photo_submission_method TEXT`,
      `reward_program TEXT`,
      `title TEXT`,
      `name_on_card TEXT`,
      `cnic_issuance_date DATE`,
      `cnic_expiry_date DATE`,
      `old_nic TEXT`,
      `father_husband_name TEXT`,
      `date_of_birth DATE`,
      `gender TEXT`,
      `mother_maiden_name TEXT`,
      `marital_status TEXT`,
      `num_dependents SMALLINT`,
      `education_qualification TEXT`,
      `curr_house_apt TEXT`,
      `curr_street TEXT`,
      `curr_tehsil_district TEXT`,
      `curr_landmark TEXT`,
      `curr_city TEXT`,
      `curr_postal_code TEXT`,
      `curr_tel_residence TEXT`,
      `curr_mobile TEXT`,
      `ntn TEXT`,
      `type_of_residence TEXT`,
      `nature_of_residence TEXT`,
      `residing_since TEXT`,
      `curr_email TEXT`,
      `perm_street TEXT`,
      `perm_tehsil_district TEXT`,
      `perm_landmark TEXT`,
      `perm_city TEXT`,
      `perm_postal_code TEXT`,
      `car_year TEXT`,
      `car_model TEXT`,
      `car_registration_no TEXT`,
      `car_ownership TEXT`,
      `next_of_kin_name TEXT`,
      `next_of_kin_relationship TEXT`,
      `next_of_kin_tel1 TEXT`,
      `next_of_kin_tel2 TEXT`,
      `occupation TEXT`,
      `sector TEXT`,
      `grade_or_rank TEXT`,
      `designation TEXT`,
      `department TEXT`,
      `company_employer_name TEXT`,
      `employment_status TEXT`,
      `length_of_employment TEXT`,
      `employee_number TEXT`,
      `business_type TEXT`,
      `business_nature TEXT`,
      `office_address TEXT`,
      `office_street TEXT`,
      `office_district TEXT`,
      `office_landmark TEXT`,
      `office_city TEXT`,
      `office_postal_code TEXT`,
      `office_phone1 TEXT`,
      `office_phone2 TEXT`,
      `office_fax TEXT`,
      `prev_employer TEXT`,
      `prev_designation TEXT`,
      `prev_experience_years TEXT`,
      `prev_employer_tel TEXT`,
      `gross_monthly_income NUMERIC`,
      `other_income_source TEXT`,
      `total_income NUMERIC`,
      `spouse_employed TEXT`,
      `spouse_income NUMERIC`,
      `spouse_income_source TEXT`,
      `card_destination TEXT`,
      `statement_delivery TEXT`,
      `email_for_statement TEXT`,
      `is_ubl_customer TEXT`,
      `ubl_account_number TEXT`,
      `ubl_branch TEXT`,
      `payment_option TEXT`,
      `reference_name TEXT`,
      `reference_relationship TEXT`,
      `reference_nic_or_passport TEXT`,
      `reference_address_street TEXT`,
      `reference_address_tehsil TEXT`,
      `reference_address_landmark TEXT`,
      `reference_address_city TEXT`,
      `reference_address_postal_code TEXT`,
      `reference_tel_res TEXT`,
      `reference_tel_office TEXT`,
      `reference_mobile TEXT`,
      `reference_ntn TEXT`,
      `application_id_form TEXT`,
      `application_reference_number TEXT`,
      `channel_code TEXT`,
      `program_code TEXT`,
      `branch_code TEXT`,
      `sales_officer_name TEXT`,
      `branch_name TEXT`,
      `region_name TEXT`,
      `customer_contact_confirmation TEXT`,
      `branch_manager_remarks TEXT`,
      `reason_code TEXT`,
      `analyst_name TEXT`,
      `avail_sms_alert TEXT`,
      `avail_credit_guardian TEXT`
    ]);
    await db.query(`CREATE TABLE IF NOT EXISTS creditcard_other_banks (id SERIAL PRIMARY KEY, application_id INTEGER NOT NULL REFERENCES creditcard_applications(id) ON DELETE CASCADE, bank_name TEXT, branch TEXT, account_no TEXT);`);
    await db.query(`CREATE TABLE IF NOT EXISTS creditcard_other_credit_cards (id SERIAL PRIMARY KEY, application_id INTEGER NOT NULL REFERENCES creditcard_applications(id) ON DELETE CASCADE, bank_name TEXT, card_number TEXT, credit_limit NUMERIC);`);
    await db.query(`CREATE TABLE IF NOT EXISTS creditcard_loans (id SERIAL PRIMARY KEY, application_id INTEGER NOT NULL REFERENCES creditcard_applications(id) ON DELETE CASCADE, issuing_bank TEXT, loan_type TEXT, loan_amount NUMERIC, monthly_installment NUMERIC);`);
    await db.query(`CREATE TABLE IF NOT EXISTS creditcard_supplementary_cards (id SERIAL PRIMARY KEY, application_id INTEGER NOT NULL REFERENCES creditcard_applications(id) ON DELETE CASCADE, basic_card_member_name TEXT, basic_card_cnic_passport TEXT, basic_card_old_nic TEXT, supplementary_card_member_name TEXT, supplementary_cnic_passport TEXT, supplementary_old_nic TEXT);`);

    // ========== EXPAND PLATINUM CARD SCHEMA AND CHILD TABLES ==========
    const addPlatCols = async (defs) => {
      for (const def of defs) {
        await db.query(`ALTER TABLE platinum_card_applications ADD COLUMN IF NOT EXISTS ${def}`);
      }
    };
    await addPlatCols([
      `title TEXT`,
      `middle_name TEXT`,
      `name_on_card TEXT`,
      `passport_number TEXT`,
      `cnic_issuance_date DATE`,
      `cnic_expiry_date DATE`,
      `old_nic_number TEXT`,
      `father_husband_name TEXT`,
      `date_of_birth DATE`,
      `gender TEXT`,
      `mother_maiden_name TEXT`,
      `marital_status TEXT`,
      `dependents SMALLINT`,
      `education TEXT`,
      `curr_house TEXT`,
      `curr_street TEXT`,
      `curr_tehsil TEXT`,
      `curr_landmark TEXT`,
      `curr_city TEXT`,
      `curr_postal_code TEXT`,
      `residential_phone TEXT`,
      `mobile TEXT`,
      `ntn TEXT`,
      `type_of_accommodation TEXT`,
      `nature_of_residence TEXT`,
      `residing_since TEXT`,
      `email TEXT`,
      `perm_address TEXT`,
      `street TEXT`,
      `district TEXT`,
      `nearest_landmark TEXT`,
      `city TEXT`,
      `postal_code TEXT`,
      `vehicle_make TEXT`,
      `vehicle_model TEXT`,
      `vehicle_year TEXT`,
      `vehicle_registration_no TEXT`,
      `ownership TEXT`,
      `Leased TEXT`,
      `next_of_kin_name TEXT`,
      `next_of_kin_relationship TEXT`,
      `next_of_kin_tel1 TEXT`,
      `next_of_kin_tel2 TEXT`,
      `occupation TEXT`,
      `if_salaried TEXT`,
      `grade_rank TEXT`,
      `designation TEXT`,
      `department TEXT`,
      `company_name TEXT`,
      `employment_status TEXT`,
      `length_of_service TEXT`,
      `ubl_employee_id TEXT`,
      `business_type TEXT`,
      `business_nature TEXT`,
      `office_address TEXT`,
      `office_phones TEXT`,
      `office_fax TEXT`,
      `prev_company_name TEXT`,
      `prev_designation TEXT`,
      `prev_experience TEXT`,
      `prev_company_phone TEXT`,
      `gross_monthly_income NUMERIC`,
      `other_income NUMERIC`,
      `source_of_other_income TEXT`,
      `total_income NUMERIC`,
      `spouse_employed TEXT`,
      `spouse_income NUMERIC`,
      `spouse_income_source TEXT`,
      `card_destination TEXT`,
      `statement_delivery TEXT`,
      `estatement_email TEXT`,
      `is_ubl_customer TEXT`,
      `ubl_account_number TEXT`,
      `ubl_branch TEXT`,
      `applicant_signature BYTEA`,
      `applicant_signature_date DATE`,
      `payment_option TEXT`,
      `application_reference_number TEXT`,
      `so_employee_no TEXT`,
      `pb_bm_employee_no TEXT`,
      `sm_employee_no TEXT`,
      `sales_officer_name TEXT`,
      `branch_name TEXT`,
      `region_name TEXT`,
      `customer_contact_confirmation TEXT`,
      `branch_manager_recommendation TEXT`,
      `branch_manager_signature BYTEA`,
      `reason_code TEXT`,
      `analyst_name TEXT`,
      `analyst_signature BYTEA`,
      `avail_sms_alert TEXT`,
      `avail_credit_guardian TEXT`,
      `card_applicant_signature BYTEA`,
      `card_applicant_signature_date DATE`
    ]);
    await db.query(`CREATE TABLE IF NOT EXISTS platinum_card_other_banks (id SERIAL PRIMARY KEY, application_id INTEGER NOT NULL REFERENCES platinum_card_applications(id) ON DELETE CASCADE, bank_name TEXT, branch TEXT, account_no TEXT);`);
    await db.query(`CREATE TABLE IF NOT EXISTS platinum_card_other_credit_cards (id SERIAL PRIMARY KEY, application_id INTEGER NOT NULL REFERENCES platinum_card_applications(id) ON DELETE CASCADE, bank_name TEXT, card_type TEXT, card_number TEXT, credit_limit NUMERIC);`);
    await db.query(`CREATE TABLE IF NOT EXISTS platinum_card_loan_facilities (id SERIAL PRIMARY KEY, application_id INTEGER NOT NULL REFERENCES platinum_card_applications(id) ON DELETE CASCADE, loan_details TEXT);`);
    await db.query(`CREATE TABLE IF NOT EXISTS platinum_card_references (id SERIAL PRIMARY KEY, application_id INTEGER NOT NULL REFERENCES platinum_card_applications(id) ON DELETE CASCADE, name TEXT, relationship TEXT, nic TEXT, address TEXT, phones TEXT, ntn TEXT);`);
    await db.query(`CREATE TABLE IF NOT EXISTS platinum_card_supplementary (id SERIAL PRIMARY KEY, application_id INTEGER NOT NULL REFERENCES platinum_card_applications(id) ON DELETE CASCADE, title TEXT, first_name TEXT, middle_name TEXT, last_name TEXT, name_on_card TEXT, father_husband_name TEXT, credit_limit_percent NUMERIC, availability TEXT, relationship_to_principal TEXT, dob DATE, gender TEXT, nic_passport TEXT, old_nic_number TEXT, mother_maiden_name TEXT, supplementary_signature BYTEA, basic_cardholder_signature BYTEA, date_signed DATE);`);
    await db.query(`CREATE TABLE IF NOT EXISTS platinum_card_lien_marked (id SERIAL PRIMARY KEY, application_id INTEGER NOT NULL REFERENCES platinum_card_applications(id) ON DELETE CASCADE, collateral_type TEXT, bank TEXT, branch TEXT, account_no TEXT, account_type TEXT, lien_amount NUMERIC, currency TEXT, account_title TEXT, maturity_date DATE);`);

    // Create a global sequence for LOS IDs and set defaults for all product tables
    await db.query(`CREATE SEQUENCE IF NOT EXISTS global_los_id_seq;`);
    const setDefaultId = async (table) => {
      await db.query(`
        DO $$
        BEGIN
          EXECUTE format('ALTER TABLE %I ALTER COLUMN id SET DEFAULT nextval(''global_los_id_seq'')', '${table}');
        EXCEPTION WHEN others THEN
          -- Ignore if column does not exist
          NULL;
        END$$;`);
    };
    await setDefaultId('cashplus_applications');
    await setDefaultId('autoloan_applications');
    await setDefaultId('ameendrive_applications');
    await setDefaultId('smeasaan_applications');
    await setDefaultId('commercial_vehicle_applications');
    await setDefaultId('creditcard_applications');
    await setDefaultId('platinum_card_applications');

    // EAMVU agents and assignments tables (required for /api/agents)
    await db.query(`
      CREATE TABLE IF NOT EXISTS eamvu_agents (
        agent_id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        status TEXT DEFAULT 'active',
        location TEXT,
        expertise TEXT[],
        max_concurrent_assignments INTEGER DEFAULT 10,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_eamvu_agents_status ON eamvu_agents(status);`).catch(()=>{});

    await db.query(`
      CREATE TABLE IF NOT EXISTS agent_assignments (
        id SERIAL PRIMARY KEY,
        los_id INTEGER NOT NULL,
        agent_id INTEGER NOT NULL REFERENCES eamvu_agents(agent_id) ON DELETE CASCADE,
        assigned_by TEXT,
        assignment_notes TEXT,
        status TEXT DEFAULT 'active',
        assigned_at TIMESTAMP DEFAULT NOW(),
        completed_at TIMESTAMP
      );
    `);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_assignments_agent ON agent_assignments(agent_id);`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_assignments_los ON agent_assignments(los_id);`);

    // Seed sample agents if none exist
    const agentsCount = await db.query(`SELECT COUNT(*)::int AS count FROM eamvu_agents`);
    if (agentsCount.rows[0].count === 0) {
      console.log('🧪 Seeding sample EAMVU agents...');
      await db.query(`
        INSERT INTO eamvu_agents (name, email, phone, status, location, expertise, max_concurrent_assignments)
        VALUES 
          ('EAMVU Officer 1', 'officer1@example.com', '0300-1111111', 'active', 'Karachi', ARRAY['CashPlus','AutoLoan'], 10),
          ('EAMVU Officer 2', 'officer2@example.com', '0300-2222222', 'active', 'Lahore', ARRAY['CommercialVehicle','CashPlus'], 8),
          ('EAMVU Officer 3', 'officer3@example.com', '0300-3333333', 'active', 'Islamabad', ARRAY['SMEASAAN'], 6);
      `);
      console.log('✅ Seeded 3 EAMVU agents');
    }

    // register function and triggers
    await db.query(`
      CREATE OR REPLACE FUNCTION register_los_in_ilos(p_los_id INT, p_loan_type TEXT, p_cnic TEXT DEFAULT NULL, p_customer_id TEXT DEFAULT NULL)
      RETURNS VOID AS $$
      BEGIN
        INSERT INTO ilos_applications (los_id, loan_type, cnic, customer_id, status)
        VALUES (p_los_id, p_loan_type, p_cnic, p_customer_id, 'PB_SUBMITTED')
        ON CONFLICT (los_id) DO NOTHING;
      END; $$ LANGUAGE plpgsql;
    `);

    await db.query(`
      CREATE OR REPLACE FUNCTION update_status_by_los_id(p_los_id INT, p_status TEXT)
      RETURNS BOOLEAN AS $$
      BEGIN
        UPDATE ilos_applications SET status = p_status, updated_at = NOW() WHERE los_id = p_los_id;
        RETURN TRUE;
      END; $$ LANGUAGE plpgsql;
    `);

    const triggers = [
      {
        table: 'cashplus_applications',
        name: 'cashplus_after_insert',
        funcName: 'trg_cashplus_after_insert',
        cnicExpr: 'NEW.cnic',
        customerIdExpr: 'NEW.customer_id',
        loanType: 'cashplus_applications',
      },
      {
        table: 'autoloan_applications',
        name: 'autoloan_after_insert',
        funcName: 'trg_autoloan_after_insert',
        cnicExpr: 'NEW.applicant_cnic',
        customerIdExpr: 'NEW.customer_id',
        loanType: 'autoloan_applications',
      },
      {
        table: 'ameendrive_applications',
        name: 'ameendrive_after_insert',
        funcName: 'trg_ameendrive_after_insert',
        cnicExpr: 'NEW.applicant_cnic',
        customerIdExpr: 'NEW.customer_id',
        loanType: 'ameendrive_applications',
      },
      {
        table: 'smeasaan_applications',
        name: 'smeasaan_after_insert',
        funcName: 'trg_smeasaan_after_insert',
        cnicExpr: 'NEW.applicant_cnic',
        customerIdExpr: 'NULL',
        loanType: 'smeasaan_applications',
      },
      {
        table: 'commercial_vehicle_applications',
        name: 'commercialvehicle_after_insert',
        funcName: 'trg_commercialvehicle_after_insert',
        cnicExpr: 'NEW.applicant_cnic',
        customerIdExpr: 'NULL',
        loanType: 'commercial_vehicle_applications',
      },
      {
        table: 'creditcard_applications',
        name: 'creditcard_after_insert',
        funcName: 'trg_creditcard_after_insert',
        cnicExpr: 'NEW.nic_or_passport',
        customerIdExpr: 'NEW.customer_id',
        loanType: 'creditcard_applications',
      },
      {
        table: 'platinum_card_applications',
        name: 'platinum_after_insert',
        funcName: 'trg_platinum_after_insert',
        cnicExpr: 'NEW.nic',
        customerIdExpr: 'NEW.customer_id',
        loanType: 'platinum_card_applications',
      },
    ];

    for (const t of triggers) {
      await db.query(`
        CREATE OR REPLACE FUNCTION ${t.funcName}() RETURNS TRIGGER AS $$
        BEGIN
          PERFORM register_los_in_ilos(NEW.id, '${t.loanType}', ${t.cnicExpr}, ${t.customerIdExpr});
          RETURN NEW;
        END; $$ LANGUAGE plpgsql;
      `);
      await db.query(`DROP TRIGGER IF EXISTS ${t.name} ON ${t.table};`);
      await db.query(`CREATE TRIGGER ${t.name} AFTER INSERT ON ${t.table} FOR EACH ROW EXECUTE FUNCTION ${t.funcName}();`);
    }

    console.log('✅ Core schema setup completed');
  } catch (error) {
    console.error('❌ Core schema setup failed:', error.message);
    process.exit(1);
  } finally {
    await db.end();
  }
}

if (require.main === module) {
  setupCoreSchema().then(() => process.exit(0));
}

module.exports = { setupCoreSchema };


