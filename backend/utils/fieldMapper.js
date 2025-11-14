/**
 * Field Mapper Utility
 * Maps mobile app field names (camelCase) to backend field names (snake_case)
 * This ensures compatibility between React Native mobile app and backend API
 */

/**
 * Maps mobile app field names (camelCase) to backend field names (snake_case)
 * @param {Object} data - Request body from mobile app
 * @returns {Object} - Mapped data with snake_case fields added
 */
function mapMobileAppFields(data) {
  if (!data || typeof data !== 'object') {
    return data;
  }

  // Field mapping: mobile app (camelCase) -> backend (snake_case)
  const fieldMap = {
    // Personal Info
    firstName: 'first_name',
    lastName: 'last_name',
    middleName: 'middle_name',
    fatherName: 'father_or_husband_name',
    motherName: 'mother_maiden_name',
    dateOfBirth: 'date_of_birth',
    maritalStatus: 'marital_status',
    mobileNumber: 'mobile',
    
    // Employment
    employmentType: 'employment_status',
    companyName: 'company_name',
    monthlySalary: 'gross_monthly_salary',
    experienceYears: 'exp_current_years',
    
    // Loan/Income
    requestedAmount: 'amount_requested',
    loanPurpose: 'purpose_of_loan',
    monthlyIncome: 'net_monthly_income',
    
    // Banking
    bankName: 'branch',
    accountNumber: 'account',
    accountType: 'account_type',
    
    // Vehicle (for AutoLoan, AmeenDrive, CommercialVehicle)
    vehicleMake: 'make',
    vehicleModel: 'model',
    vehicleYear: 'year',
    vehiclePrice: 'price_value',
    
    // Common across all products
    productType: 'product_type',
  };

  // Create a copy of the original data
  const mapped = { ...data };
  
  // Add snake_case versions of camelCase fields
  for (const [camelKey, snakeKey] of Object.entries(fieldMap)) {
    if (data[camelKey] !== undefined && data[camelKey] !== null) {
      mapped[snakeKey] = data[camelKey];
    }
  }
  
  return mapped;
}

/**
 * Check if request is from mobile app
 * @param {Object} data - Request body
 * @returns {boolean}
 */
function isMobileAppRequest(data) {
  // Mobile app uses camelCase, web uses snake_case
  // Check for presence of camelCase fields
  return !!(data.firstName || data.lastName || data.requestedAmount || data.mobileNumber);
}

module.exports = {
  mapMobileAppFields,
  isMobileAppRequest,
};

