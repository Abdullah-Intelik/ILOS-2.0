import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Debug SME ASAAN submission endpoint called');
    
    // Get the base URL for the backend
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    // Create a minimal test payload with the same structure as the failing data
    const testPayload = {
      customer_id: "110001",
      application_no: `SME-${Date.now()}`,
      date_of_request: "2025-07-30",
      applicant_name: "azhar sahba",
      applicant_cnic: "3520111112221",
      father_husband_name: "SALEEM KHAN",
      gender: "Male",
      marital_status: "Married",
      cell_no: "03451234567",
      company_name: "",
      business_address: "",
      // Add the problematic fields that might be causing issues
      purchase_pod: null, // This was "1970-01-01" in the failing data
      vehicle_year: 2025,
      engine_size_cc: 65464,
      desired_loan_amount: 4534534,
      tenure_years: 4,
      down_payment_amount: 454,
      down_payment_percent: 4,
      vehicle_price: 67567,
      num_dependents: 4,
      residence_tenure_months: 4,
      num_employees: null,
      annual_sales_pkr: null,
      experience_years: null,
      // Add minimal child tables
      references: [
        {
          reference_no: 1,
          name: "Test Reference",
          cnic: "1234567890124",
          relationship: "Friend",
          contact_no: "03001234568",
          address: "Test Address"
        }
      ],
      existing_loans: [],
      business_descriptions: [],
      market_info: [],
      financial_indicators: [],
      financial_indicators_medium: []
    };
    
    console.log('🧪 Sending test payload:', testPayload);
    
    // Make request to backend
    const response = await fetch(`${baseUrl}/api/smeasaan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
    console.error('❌ Test endpoint error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
} 