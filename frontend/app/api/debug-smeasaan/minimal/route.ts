// Debug API route to test SME ASAAN backend connection with minimal required data
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get base URL based on environment
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5000' 
      : '';

    // Create an extremely minimal test payload with just the absolutely required fields
    // This is the bare minimum data that should be required by the backend
    const minimalTestPayload = {
      customer_id: `TEST-${Date.now()}`,
      application_no: `DEBUG-${Date.now()}`,
      date_of_request: new Date().toISOString().split('T')[0],
      applicant_name: "Test Applicant",
      applicant_cnic: "1234567890123",
      father_husband_name: "Test Father",
      gender: "Male",
      marital_status: "Single",
      cell_no: "03001234567",
    };

    console.log("Sending minimal test payload to backend:", minimalTestPayload);
    
    // Make a request to backend API
    const response = await fetch(`${baseUrl}/api/smeasaan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(minimalTestPayload)
    });
    
    // Get response as text first to handle potential non-JSON responses
    const responseText = await response.text();
    console.log("Raw response from backend:", responseText);
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { rawText: responseText };
    }
    
    // Return detailed debug info
    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      response: responseData,
      testPayload: minimalTestPayload
    });
  } catch (error: any) {
    console.error("Error in minimal debug endpoint:", error);
    return NextResponse.json({
      success: false,
      message: 'Failed to debug minimal SME ASAAN API',
      error: error.message || 'Unknown error',
      stack: error.stack
    }, { status: 500 });
  }
} 