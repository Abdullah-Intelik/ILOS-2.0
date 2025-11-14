/**
 * API V2.0 Helper Functions
 * Unified functions for interacting with Backend V2.0
 */

import { getBaseUrl } from './api';

export interface ProductV2 {
  product_id: number;
  product_code: string;
  product_name: string;
  product_type: string;
  is_active: boolean;
  is_instant_eligible: boolean;
  requires_collateral: boolean;
  min_amount: number;
  max_amount: number;
  min_tenure_months: number;
  max_tenure_months: number;
  interest_rate_min: number;
  interest_rate_max: number;
  min_age: number;
  max_age: number;
  min_income: number;
  allowed_customer_types: string[];
  product_config: any;
  workflow_config: any;
}

export interface ApplicationV2Request {
  party_id?: number;
  product_code: string;
  product_type: string;
  purpose?: string;
  requested_amount: number;
  tenure_months: number;
  product_details?: any;
  party_data?: {
    cnic: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    gender: string;
    marital_status: string;
    mobile: string;
    email?: string;
    residential_address: string;
    city?: string;
    country?: string;
    customer_type: string;
  };
  party_details?: {
    employment_type?: string;
    employer_name?: string;
    designation?: string;
    employment_tenure_months?: number;
    office_address?: string;
    monthly_income?: number;
    bank_name?: string;
    account_number?: string;
  };
  references?: Array<{
    name: string;
    relationship: string;
    mobile: string;
    address: string;
    cnic?: string;
  }>;
  exposure?: {
    has_existing_cards: boolean;
    has_existing_loans: boolean;
  };
  documents?: any;
}

export interface ApplicationV2Response {
  success: boolean;
  message: string;
  data: {
    application_id: number;
    los_id: number;
    party_id: number;
    product_id: number;
    product_code: string;
    product_type: string;
    requested_amount: number;
    tenure_months: number;
    current_status: string;
    current_department: string;
    created_at: string;
  };
}

/**
 * Fetch all products from Backend V2.0
 */
export async function fetchProducts(filters?: {
  is_active?: boolean;
  product_type?: string;
  customer_type?: string;
}): Promise<ProductV2[]> {
  const params = new URLSearchParams();
  if (filters?.is_active !== undefined) params.append('is_active', String(filters.is_active));
  if (filters?.product_type) params.append('product_type', filters.product_type);
  if (filters?.customer_type) params.append('customer_type', filters.customer_type);

  const url = `${getBaseUrl()}/api/v1/products${params.toString() ? '?' + params.toString() : ''}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Fetch single product by code
 */
export async function fetchProductByCode(productCode: string): Promise<ProductV2> {
  const response = await fetch(`${getBaseUrl()}/api/v1/products/${productCode}`);
  
  if (!response.ok) {
    throw new Error(`Product ${productCode} not found`);
  }

  const result = await response.json();
  return result.data;
}

/**
 * Validate product eligibility
 */
export async function validateProductEligibility(
  productCode: string,
  amount: number,
  customerType: string
) {
  const response = await fetch(`${getBaseUrl()}/api/v1/products/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      product_code: productCode,
      amount,
      customer_type: customerType
    })
  });

  if (!response.ok) {
    throw new Error('Failed to validate product eligibility');
  }

  return await response.json();
}

/**
 * Create new application in Backend V2.0
 */
export async function createApplicationV2(
  data: ApplicationV2Request
): Promise<ApplicationV2Response> {
  console.log('📤 Submitting to Backend V2.0:', data);

  const response = await fetch(`${getBaseUrl()}/api/v1/applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create application');
  }

  const result: ApplicationV2Response = await response.json();
  console.log('✅ Application created:', result);
  
  return result;
}

/**
 * Submit application (mark as submitted, trigger workflow)
 */
export async function submitApplicationV2(losId: number): Promise<any> {
  const response = await fetch(`${getBaseUrl()}/api/v1/applications/${losId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to submit application');
  }

  return await response.json();
}

/**
 * Transform old form data to V2.0 application format
 */
export function transformCashPlusFormToV2(
  formData: any,
  customerData: any
): ApplicationV2Request {
  console.log('🔍 TRANSFORMER INPUT:', {
    hasCustomerData: !!customerData,
    hasReferences: !!(customerData?.references),
    hasExposures: !!(customerData?.exposures),
    hasBankingDetails: !!(customerData?.bankingDetails || customerData?.clientBanks),
    // ✅ Debug: Check employment & income data sources
    hasEmploymentDetails: !!(customerData?.employmentDetails),
    hasIncomeDetails: !!(customerData?.incomeDetails),
    hasApplicationDetails: !!(customerData?.applicationDetails),
    loanPurpose: customerData?.applicationDetails?.loanPurpose,
    employmentType: customerData?.employmentDetails?.employmentType,
    employerName: customerData?.employmentDetails?.employerName,
    // ✅ DEBUG: Check ALL possible income sources
    'customerData.incomeDetails.grossMonthlySalary': customerData?.incomeDetails?.grossMonthlySalary,
    'customerData.incomeDetails.monthlyIncome': customerData?.incomeDetails?.monthlyIncome,
    'customerData.personalDetails.monthlyIncome': customerData?.personalDetails?.monthlyIncome,
    'formData.gross_monthly_salary': formData.gross_monthly_salary,
    'formData.monthlyIncome': formData.monthlyIncome,
    'formData.monthly_income': formData.monthly_income,
    officeAddress: customerData?.employmentDetails?.officeAddress
  });

  // Handle different field name formats (camelCase, snake_case)
  const requestedAmount = parseFloat(
    customerData?.applicationDetails?.requestedAmount ||
    formData.amountRequested || 
    formData.amount_requested || 
    formData.requestedAmount || 
    0
  );
  
  // ✅ Tenure is already in MONTHS from form, don't multiply!
  const tenureMonths = (() => {
    const value = customerData?.applicationDetails?.tenure ||
                  formData.tenure || 
                  formData.tenure_months;
    
    if (value) {
      const parsed = parseInt(value);
      return isNaN(parsed) ? 12 : parsed; // Default to 12 months if invalid
    }
    
    // Check if tenure_years exists
    if (formData.tenure_years) {
      const years = parseInt(formData.tenure_years);
      return isNaN(years) ? 12 : years * 12;
    }
    
    return 12; // Default to 12 months if nothing provided
  })();

  return {
    product_code: 'CASHPLUS',
    product_type: 'personal_loan',
    requested_amount: requestedAmount,
    tenure_months: tenureMonths,
    
    // Application purpose (required for form display)
    // ✅ FIX: Check formData.purpose_of_loan first (actual field name from form)
    purpose: formData.purpose_of_loan || customerData?.applicationDetails?.loanPurpose || formData.purposeOfLoan || formData.purpose || formData.loan_purpose || '',
    
    // Product-specific details
    product_details: {
      loan_type: formData.loanType || formData.loan_type || 'Normal',
      purpose_of_loan: customerData?.applicationDetails?.loanPurpose || 
                       formData.purposeOfLoan || formData.purpose || formData.loan_purpose || '',
      min_acceptable_amount: parseFloat(
        formData.minAcceptableAmount || 
        formData.min_acceptable_amount || 
        0
      ),
      max_affordable_installment: parseFloat(
        formData.maxAffordableInstallment || 
        formData.max_affordable_installment || 
        0
      )
    },

        // Party (customer) data
        party_data: {
          // ✅ Sanitize main CNIC: Remove dashes and spaces (DB limit: VARCHAR(13))
          cnic: (customerData?.cnic || customerData?.personalDetails?.cnic || formData.cnic || formData.id_no || '').toString().replace(/[-\s]/g, ''),
      first_name: formData.firstName || formData.first_name || customerData?.personalDetails?.firstName || '',
      last_name: formData.lastName || formData.last_name || customerData?.personalDetails?.lastName || '',
      date_of_birth: formData.dateOfBirth || formData.date_of_birth || customerData?.personalDetails?.dateOfBirth || '',
      // ✅ Convert gender to single character (M/F/O) for database
      gender: (() => {
        const g = (formData.gender || customerData?.personalDetails?.gender || '').toUpperCase();
        if (g === 'MALE' || g === 'M') return 'M';
        if (g === 'FEMALE' || g === 'F') return 'F';
        if (g === 'OTHER' || g === 'O') return 'O';
        return '';
      })(),
      marital_status: formData.maritalStatus || formData.marital_status || customerData?.personalDetails?.maritalStatus || '',
      mobile: formData.mobileNumber || formData.mobile_number || formData.mobile || customerData?.personalDetails?.mobileNumber || '',
      email: formData.email || customerData?.personalDetails?.email || '',
      residential_address: formData.residentialAddress || formData.residential_address || customerData?.addressDetails?.currentAddress?.fullAddress || '',
      city: formData.city || customerData?.addressDetails?.currentAddress?.city || '',
      country: 'Pakistan',
      customer_type: customerData?.customerType || formData.customer_type || 'NTB'
    },

    // Employment & banking details
    party_details: {
      // ✅ FIX: Prioritize formData field names (actual form fields)
      employment_type: formData.employment_status || // ✅ Actual field name from form
                       customerData?.employmentDetails?.employmentType || 
                       customerData?.personalDetails?.employmentType || 
                       formData.employmentType || formData.employment_type || '',
      employer_name: formData.company_name || // ✅ Actual field name from form
                     customerData?.employmentDetails?.employerName || 
                     customerData?.personalDetails?.employerName || 
                     formData.employerName || formData.employer_name || '',
      designation: formData.designation || // ✅ Already correct
                   customerData?.employmentDetails?.designation || 
                   customerData?.personalDetails?.designation || '',
      employment_tenure_months: (() => {
        // ✅ FIX: exp_current_years is in YEARS, need to convert to months
        const years = formData.exp_current_years || 
                      customerData?.employmentDetails?.employmentTenure ||
                      customerData?.personalDetails?.employmentTenure ||
                      formData.employmentTenure || 
                      formData.employment_tenure || 
                      formData.employment_tenure_months;
        
        if (!years) return 0;
        
        // If it's already a large number (>100), assume it's already in months
        const parsed = parseInt(years);
        if (isNaN(parsed)) return 0;
        if (parsed > 100) return parsed; // Already in months
        return parsed; // exp_current_years is in months (e.g., 24)
      })(),
      // ✅ FIX: office_house_no is the actual field name
      office_address: formData.office_house_no || // ✅ Actual field name from form
                      formData.officeAddress ||
                      customerData?.employmentDetails?.officeAddress || 
                      customerData?.personalDetails?.officeAddress || 
                      formData.office_address || '',
      // ✅ FIX: Prioritize monthlyIncome (updated value) over grossMonthlySalary (pre-filled)
      monthly_income: parseFloat(
        customerData?.incomeDetails?.monthlyIncome || // ✅ User's updated value (HIGHEST PRIORITY - has 3500000)
        customerData?.incomeDetails?.grossMonthlySalary || // Pre-filled value (has 35000)
        customerData?.personalDetails?.monthlyIncome ||
        formData.gross_monthly_salary || // ✅ Fallback to form field
        formData.monthlyIncome || 
        formData.monthly_income || 
        formData.monthly_salary || 
        0
      ),
      // Prioritize form data over CBS data for bank details (user may want different bank)
      bank_name: formData.bankName || formData.bank_name ||
                 customerData?.bankingDetails?.bankName || 
                 customerData?.clientBanks?.bank_name || '',
      account_number: formData.accountNumber || formData.account_number ||
                      customerData?.bankingDetails?.accountNumber || 
                      customerData?.clientBanks?.actt_no || 
                      formData.accountNumber || formData.account_number || ''
    },

        // References - Read from customerData.references array
        references: (() => {
          const refs = customerData?.references || [];
          const mappedRefs = refs
            .filter((ref: any) => ref && (ref.name || ref.fullName || ref.full_name))
            .map((ref: any) => ({
              name: ref.fullName || ref.full_name || ref.name || '',
              relationship: ref.relationship || '',
              mobile: ref.mobile || ref.mobileNumber || '',
              address: ref.address || '',
              // ✅ Sanitize CNIC: Remove dashes and spaces (DB limit: VARCHAR(13))
              cnic: ref.cnic ? ref.cnic.toString().replace(/[-\s]/g, '') : undefined
            }))
            .slice(0, 2); // Max 2 references
          
          console.log('🔍 References mapping:', { input: refs, output: mappedRefs });
          return mappedRefs;
        })(),

    // Exposure (simplified)
    exposure: {
      has_existing_cards: (customerData?.exposures?.hasExistingCards === 'Yes') || 
                          (formData.hasExistingCards === 'Yes') || 
                          (formData.hasExistingCards === true),
      has_existing_loans: (customerData?.exposures?.hasExistingLoans === 'Yes') || 
                         (formData.hasExistingLoans === 'Yes') || 
                         (formData.hasExistingLoans === true)
    },

    // Documents (if any)
    documents: {
      ...(formData.documents || {}),
      ...(formData.mobile_documents || {}),
      ...(customerData?.documents || {})
    }
  };
}

