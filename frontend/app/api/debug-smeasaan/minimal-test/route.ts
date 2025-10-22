// Debug API route with an absolute minimal test submission
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get base URL based on environment
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5000' 
      : '';
    
    // Create an absolute minimal test payload with just the required fields
    // This matches exactly what the backend SQL query expects
    const absoluteMinimalPayload = {
      customer_id: `TEST-${Date.now()}`,
      application_no: `DEBUG-${Date.now()}`,
      date_of_request: new Date().toISOString().split('T')[0],
      applicant_name: "Test Applicant",
      applicant_cnic: "1234567890123",
      father_husband_name: "Test Father",
      gender: "Male",
      marital_status: "Single", 
      cell_no: "03001234567",
      // Fill all remaining fields with empty strings or nulls
      lcv: false,
      pmkj_yes: false,
      branch_code: "",
      city: "",
      sales_officer_emp_no: "",
      sales_manager_emp_no: "",
      fr_br_emp_no: "",
      channel: "",
      cnic_issuance_date: null,
      cnic_expiry_date: null,
      applicant_dob: null,
      mother_maiden_name: "",
      residence_landline_no: "",
      residence_tenure_months: null,
      residence_type: "",
      num_dependents: null,
      education_level: "",
      curr_residence_address: "",
      perm_residence_address: "",
      company_name: "",
      company_legal_status: "",
      group_name: "",
      experience_years: null,
      business_landline_no: "",
      business_cell_no: "",
      sector_se: false,
      sector_me: false,
      sector_manufacturing: false,
      sector_traders_distributors: false,
      sector_wholesaler_retailer: false,
      sector_services: false,
      sector_individuals: false,
      national_tax_no: "",
      tax_payer: false,
      email: "",
      nearest_landmark: "",
      num_employees: null,
      annual_sales_pkr: null,
      business_address: "",
      political_affiliation: false,
      ubl_bank_account_no: "",
      ubl_bank_title: "",
      fax_no: "",
      business_est_date: null,
      business_premises: "",
      registration_no: "",
      main_business_account_bank: "",
      main_business_account_no: "",
      main_business_account_open_date: null,
      vehicle_manufacturer: "",
      vehicle_model: "",
      vehicle_year: "",
      vehicle_local_assembled: false,
      vehicle_imported: false,
      vehicle_new: false,
      vehicle_used: false,
      engine_no: "",
      engine_size_cc: "",
      chassis_no: "",
      purchase_poa: null,
      purchase_pod: null,
      vehicle_price: null,
      seller_name: "",
      seller_cnic: "",
      seller_address: "",
      seller_contact_no: "",
      dealer_name: "",
      dealer_address: "",
      dealer_email: "",
      dealer_contact_no: "",
      vehicle_name: "",
      desired_loan_amount: null,
      tenure_years: null,
      pricing: "",
      down_payment_percent: null,
      down_payment_amount: null,
      insurance_company_name: "",
      tracker_company_name: "",
      // Empty arrays for child tables
      references: [],
      existing_loans: [],
      business_descriptions: [],
      market_info: [],
      financial_indicators: [],
      financial_indicators_medium: []
    };

    console.log("Sending absolute minimal test payload:", absoluteMinimalPayload);
    
    // Make a request to backend API
    const response = await fetch(`${baseUrl}/api/smeasaan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(absoluteMinimalPayload)
    });
    
    // Get response as text first
    const responseText = await response.text();
    console.log("Raw response from backend:", responseText);
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { rawText: responseText };
    }
    
    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      response: responseData,
      testPayload: absoluteMinimalPayload
    });
  } catch (error: any) {
    console.error("Error in minimal test endpoint:", error);
    return NextResponse.json({
      success: false,
      message: 'Failed to test minimal SME ASAAN API',
      error: error.message || 'Unknown error',
      stack: error.stack
    }, { status: 500 });
  }
} 