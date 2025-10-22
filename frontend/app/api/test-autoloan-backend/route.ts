import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing Auto Loan backend connection');
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    // Test with minimal payload
    const testPayload = {
      customer_id: '110001',
      applicant_cnic: '3520111112221',
      auto_application_id: 'AUTO-TEST-001',
      application_source: '["Branch"]',
      references: [
        {
          reference_no: 1,
          name: 'Test Reference',
          cnic: '1234567890123',
          relationship: 'Friend',
          house_no: '123',
          street: 'Test Street',
          area: 'Test Area',
          city: 'Test City',
          country: 'Pakistan',
          postal_code: '12345',
          tel_residence: '1234567890',
          tel_office: '1234567890',
          mobile_no: '1234567890',
          email: 'test@example.com'
        }
      ],
      // Add minimal required fields
      title: 'Mr',
      first_name: 'Test',
      last_name: 'User',
      gender: 'Male',
      marital_status: 'Single',
      date_of_birth: '1990-01-01',
      educational_qualification: 'Graduate',
      mothers_maiden_name: 'Test Mother',
      father_or_husband_name: 'Test Father',
      num_children: 0,
      num_other_dependents: 0,
      next_of_kin: 'Test Kin',
      next_of_kin_relation: 'Spouse',
      next_of_kin_cnic: '1234567890123',
      next_of_kin_contact: '1234567890',
      curr_house_no: '123',
      curr_street: 'Test Street',
      curr_area: 'Test Area',
      curr_city: 'Test City',
      curr_country: 'Pakistan',
      curr_postal_code: '12345',
      curr_tel_residence: '1234567890',
      curr_mobile: '1234567890',
      curr_email: 'test@example.com',
      curr_years_address: 5,
      curr_years_city: 10,
      residential_status: 'Owned',
      employment_type: 'Salaried',
      company_name: 'Test Company',
      employment_status: 'Permanent',
      designation: 'Manager',
      department: 'IT',
      business_address: 'Test Business Address',
      business_city: 'Test City',
      business_tel: '1234567890',
      gross_monthly_salary: 50000,
      other_monthly_income: 0,
      total_gross_monthly_income: 50000,
      net_monthly_income: 45000,
      spouse_employed: 'No',
      spousal_income: 0,
      statement_to_be_sent: 'Home',
      repayment_bank_name: 'UBL',
      repayment_branch: 'Test Branch',
      repayment_account_no: '1234567890',
      repayment_account_type: 'Current',
      repayment_currency_type: 'PKR',
      channel_code: 'BRANCH',
      program_code: 'AUTO',
      branch_code: '001',
      so_employee_no: 'EMP001',
      so_employee_name: 'Test Employee',
      pb_bm_employee_no: 'BM001',
      pb_bm_employee_name: 'Test BM',
      sm_employee_no: 'SM001',
      sm_employee_name: 'Test SM',
      dealership_name: 'Test Dealership',
      branch_name_code: '001',
      financing_option: 'Auto Financing',
      applicant_signature_date: '2025-01-27',
      co_borrower_signature_date: null
    };
    
    console.log('🧪 Sending test payload:', testPayload);
    
    const response = await fetch(`${baseUrl}/api/autoloan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload)
    });
    
    console.log('🧪 Backend response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Backend error:', errorText);
      return NextResponse.json({ 
        success: false, 
        error: `Backend responded with status: ${response.status}`, 
        errorDetails: errorText 
      });
    }
    
    const data = await response.json();
    console.log('✅ Backend success:', data);
    return NextResponse.json({ 
      success: true, 
      message: 'Test submission successful', 
      applicationId: data.application_id, 
      backendResponse: data 
    });
  } catch (error) {
    console.error('❌ Test error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
} 