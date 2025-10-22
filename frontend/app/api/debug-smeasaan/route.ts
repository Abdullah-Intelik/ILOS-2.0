// Debug API route to test SME ASAAN backend connection
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get base URL based on environment
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5000' 
      : '';

    // Create a minimal test payload with just required fields
    const testPayload = {
      customer_id: `TEST-${Date.now()}`,
      application_no: `DEBUG-${Date.now()}`,
      date_of_request: new Date().toISOString().split('T')[0],
      applicant_name: "Test Applicant",
      applicant_cnic: "1234567890123",
      father_husband_name: "Test Father",
      gender: "Male",
      marital_status: "Single",
      cell_no: "03001234567",
      // Empty arrays for child tables to avoid errors
      references: [],
      existing_loans: [],
      business_descriptions: [],
      market_info: [],
      financial_indicators: [],
      financial_indicators_medium: []
    };

    console.log("Sending test payload to backend:", testPayload);
    
    // Make a request to backend API
    const response = await fetch(`${baseUrl}/api/smeasaan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });
    
    // Get response as text first to handle potential non-JSON responses
    const responseText = await response.text();
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
      testPayload
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Failed to debug SME ASAAN API',
      error: error.message || 'Unknown error'
    }, { status: 500 });
  }
} 