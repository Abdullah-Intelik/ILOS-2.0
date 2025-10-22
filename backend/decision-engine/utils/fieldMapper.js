/**
 * Field Mapper Utility
 * Maps different field names across loan types to a unified structure
 */

/**
 * Field mapping configuration for each loan type
 * Maps database column names to standardized field names
 */
const FIELD_MAPPINGS = {
  'CashPlus Loan': {
    // Financial fields
    gross_monthly_income: ['gross_monthly_salary'],
    net_monthly_income: ['net_monthly_income'],
    other_monthly_income: ['other_monthly_income'],
    other_income_source: ['other_income_sources'],
    monthly_rent: ['monthly_rent'],
    
    // Loan fields
    amount_requested: ['amount_requested'],
    tenure: ['tenure'],
    purpose_of_loan: ['purpose_of_loan'],
    
    // Personal fields
    full_name: ['first_name', 'middle_name', 'last_name'], // Combine fields
    cnic: ['cnic'],
    date_of_birth: ['date_of_birth'],
    
    // Employment fields
    company_name: ['company_name'],
    employment_status: ['employment_status'],
    designation: ['designation']
  },
  
  'Auto Loan': {
    // Financial fields
    gross_monthly_income: ['gross_monthly_salary', 'total_gross_monthly_income'],
    net_monthly_income: ['net_monthly_income'],
    other_monthly_income: ['other_monthly_income'],
    spouse_income: ['spousal_income'],
    spouse_income_source: ['spouse_income_source'],
    monthly_rent: ['monthly_rent'],
    
    // Loan fields
    amount_requested: ['desired_loan_amount'],
    down_payment: ['down_payment_amount'],
    tenure: ['installment_period'],
    
    // Personal fields
    full_name: ['first_name', 'middle_name', 'last_name'],
    cnic: ['applicant_cnic'],
    date_of_birth: ['date_of_birth'],
    
    // Employment fields
    company_name: ['company_name'],
    employment_status: ['employment_status'],
    designation: ['designation']
  },
  
  'AmeenDrive Loan': {
    // Financial fields
    gross_monthly_income: ['gross_income', 'monthly_income'],
    other_monthly_income: ['other_monthly_income'],
    other_income_source: ['source_of_other_income'],
    spouse_income_source: ['spouse_income_source'],
    monthly_rent: ['curr_monthly_rent', 'monthly_rental'],
    
    // Loan fields
    amount_requested: ['auto_financing_amount', 'musharakah_share_amount'],
    tenure: ['loan_period'],
    
    // Personal fields
    full_name: ['applicant_full_name'],
    cnic: ['applicant_cnic'],
    date_of_birth: ['date_of_birth'],
    
    // Employment fields
    company_name: ['company_name', 'prof_company_name'],
    employment_status: ['employment_status'],
    designation: ['designation']
  },
  
  'Classic Credit Card': {
    // Financial fields
    gross_monthly_income: ['gross_monthly_income'],
    total_income: ['total_income'],
    spouse_income: ['spouse_income'],
    other_income_source: ['other_income_source'],
    spouse_income_source: ['spouse_income_source'],
    
    // Personal fields
    full_name: ['full_name', 'name_on_card'],
    cnic: ['nic_or_passport'],
    date_of_birth: ['date_of_birth'],
    
    // Contact fields
    mobile: ['curr_mobile', 'mobile'],
    email: ['curr_email', 'email', 'email_for_statement'],
    tel_permanent: ['curr_tel_residence', 'perm_tel_residence'],
    tel_current: ['curr_tel_residence'],
    
    // Address fields
    address: ['curr_street'],
    city: ['curr_city'],
    postal_code: ['curr_postal_code'],
    permanent_street: ['perm_street'],
    permanent_city: ['perm_city'],
    permanent_postal_code: ['perm_postal_code'],
    
    // Employment fields
    company_name: ['company_employer_name'],
    employment_status: ['employment_status'],
    designation: ['designation'],
    office_tel1: ['office_phone1'],
    office_tel2: ['office_phone2'],
    office_address: ['office_address'],
    office_street: ['office_street'],
    office_city: ['office_city'],
    office_landmark: ['office_landmark'],
    prev_employer_name: ['prev_employer'],
    prev_designation: ['prev_designation']
  },
  
  'Platinum Credit Card': {
    // Same as Classic Credit Card
    gross_monthly_income: ['gross_monthly_income'],
    total_income: ['total_income'],
    spouse_income: ['spouse_income'],
    other_income_source: ['other_income_source'],
    spouse_income_source: ['spouse_income_source'],
    
    // Personal fields
    full_name: ['full_name', 'name_on_card'],
    cnic: ['nic_or_passport'],
    date_of_birth: ['date_of_birth'],
    
    // Contact fields
    mobile: ['curr_mobile', 'mobile'],
    email: ['curr_email', 'email', 'email_for_statement'],
    tel_permanent: ['curr_tel_residence', 'perm_tel_residence'],
    tel_current: ['curr_tel_residence'],
    
    // Address fields
    address: ['curr_street'],
    city: ['curr_city'],
    postal_code: ['curr_postal_code'],
    permanent_street: ['perm_street'],
    permanent_city: ['perm_city'],
    permanent_postal_code: ['perm_postal_code'],
    
    // Employment fields
    company_name: ['company_employer_name'],
    employment_status: ['employment_status'],
    designation: ['designation'],
    office_tel1: ['office_phone1'],
    office_tel2: ['office_phone2'],
    office_address: ['office_address'],
    office_street: ['office_street'],
    office_city: ['office_city'],
    office_landmark: ['office_landmark'],
    prev_employer_name: ['prev_employer'],
    prev_designation: ['prev_designation']
  }
};

/**
 * Get the first non-null/non-empty value from multiple field candidates
 */
function getFirstValue(data, fieldCandidates) {
  for (const field of fieldCandidates) {
    if (data[field] !== null && data[field] !== undefined && data[field] !== '') {
      return data[field];
    }
  }
  return null;
}

/**
 * Combine multiple fields (e.g., first_name + middle_name + last_name)
 */
function combineFields(data, fieldCandidates) {
  const values = fieldCandidates
    .map(field => data[field])
    .filter(val => val !== null && val !== undefined && val !== '');
  
  return values.length > 0 ? values.join(' ') : null;
}

/**
 * Normalize application data based on loan type
 * Converts different field names to a standardized structure
 */
function normalizeApplicationData(rawData, loanType) {
  console.log(`📋 Normalizing data for loan type: ${loanType}`);
  
  const mapping = FIELD_MAPPINGS[loanType];
  
  if (!mapping) {
    console.log(`⚠️  No specific mapping found for ${loanType}, returning raw data`);
    return rawData;
  }
  
  const normalized = { ...rawData }; // Keep all original fields
  
  // Apply mappings
  Object.keys(mapping).forEach(standardField => {
    const fieldCandidates = mapping[standardField];
    
    // Check if this is a combined field (multiple source fields)
    if (standardField === 'full_name' && fieldCandidates.length > 1 && 
        (fieldCandidates.includes('first_name') || fieldCandidates.includes('last_name'))) {
      normalized[standardField] = normalized[standardField] || combineFields(rawData, fieldCandidates);
    } else {
      // Get first available value from candidates
      normalized[standardField] = normalized[standardField] || getFirstValue(rawData, fieldCandidates);
    }
  });
  
  console.log(`✅ Data normalized. Standard fields added:`, Object.keys(mapping).filter(k => normalized[k]));
  
  return normalized;
}

/**
 * Get unified financial data for DBR calculation
 * Returns standardized financial fields regardless of loan type
 */
function getFinancialData(rawData, loanType) {
  const normalized = normalizeApplicationData(rawData, loanType);
  
  return {
    gross_monthly_income: normalized.gross_monthly_income,
    net_monthly_income: normalized.net_monthly_income || normalized.total_income,
    other_monthly_income: normalized.other_monthly_income,
    spouse_income: normalized.spouse_income,
    monthly_rent: normalized.monthly_rent,
    amount_requested: normalized.amount_requested,
    tenure: normalized.tenure
  };
}

module.exports = {
  normalizeApplicationData,
  getFinancialData,
  FIELD_MAPPINGS
};

