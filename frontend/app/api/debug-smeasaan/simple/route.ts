// Simple debug endpoint without any child tables
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get base URL based on environment
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5000' 
      : '';

    // Simple test without any child tables, using null for all optional fields
    // This is directly based on the backend SQL field names
    const simplePayload = {
      customer_id: `TEST-${Date.now()}`,
      application_no: `DEBUG-${Date.now()}`,
      date_of_request: new Date().toISOString().substring(0, 10),
      lcv: false,
      pmkj_yes: false,
      branch_code: "",
      city: "",
      sales_officer_emp_no: "",
      sales_manager_emp_no: "",
      fr_br_emp_no: "",
      channel: "",
      applicant_name: "Test Applicant",
      applicant_cnic: "1234567890123",
      cnic_issuance_date: null,
      cnic_expiry_date: null,
      applicant_dob: null,
      father_husband_name: "Test Father",
      gender: "Male",
      mother_maiden_name: "",
      residence_landline_no: "",
      marital_status: "Single",
      cell_no: "03001234567",
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
      tracker_company_name: ""
      // Intentionally omit all child tables
    };
    
    console.log("Sending simple payload:", simplePayload);
    
    try {
      const response = await fetch(`${baseUrl}/api/smeasaan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(simplePayload)
      });
      
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
        response: responseData,
        payload: simplePayload
      });
    } catch (error: any) {
      return NextResponse.json({
        success: false,
        message: 'Error making request to backend',
        error: error.message || 'Unknown error'
      }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Failed to run simple test',
      error: error.message || 'Unknown error'
    }, { status: 500 });
  }
} 