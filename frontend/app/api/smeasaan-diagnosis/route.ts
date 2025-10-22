// Diagnostic endpoint for SME ASAAN API
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Base URL based on environment
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5000' 
      : '';

    // Create multiple test payloads with different structures to isolate the issue
    const testPayloads = [
      {
        name: "no-child-tables",
        payload: {
          customer_id: `TEST-${Date.now()}`,
          application_no: `DEBUG-${Date.now()}`,
          date_of_request: new Date().toISOString().split('T')[0],
          applicant_name: "Test Applicant",
          applicant_cnic: "1234567890123",
          father_husband_name: "Test Father",
          gender: "Male",
          marital_status: "Single", 
          cell_no: "03001234567",
          // Omit child tables completely
        }
      },
      {
        name: "empty-string-arrays",
        payload: {
          customer_id: `TEST-${Date.now()}`,
          application_no: `DEBUG-${Date.now()}`,
          date_of_request: new Date().toISOString().split('T')[0],
          applicant_name: "Test Applicant",
          applicant_cnic: "1234567890123",
          father_husband_name: "Test Father",
          gender: "Male",
          marital_status: "Single", 
          cell_no: "03001234567",
          // Use empty string instead of arrays
          references: "",
          existing_loans: "",
          business_descriptions: "",
          market_info: "",
          financial_indicators: "",
          financial_indicators_medium: ""
        }
      },
      {
        name: "empty-arrays",
        payload: {
          customer_id: `TEST-${Date.now()}`,
          application_no: `DEBUG-${Date.now()}`,
          date_of_request: new Date().toISOString().split('T')[0],
          applicant_name: "Test Applicant",
          applicant_cnic: "1234567890123",
          father_husband_name: "Test Father",
          gender: "Male",
          marital_status: "Single", 
          cell_no: "03001234567",
          // Use empty arrays
          references: [],
          existing_loans: [],
          business_descriptions: [],
          market_info: [],
          financial_indicators: [],
          financial_indicators_medium: []
        }
      },
      {
        name: "date-format-fix",
        payload: {
          customer_id: `TEST-${Date.now()}`,
          application_no: `DEBUG-${Date.now()}`,
          // Use YYYY-MM-DD format explicitly
          date_of_request: new Date().toISOString().substring(0, 10),
          applicant_name: "Test Applicant",
          applicant_cnic: "1234567890123",
          father_husband_name: "Test Father",
          gender: "Male",
          marital_status: "Single", 
          cell_no: "03001234567",
          // Set all date fields to null 
          cnic_issuance_date: null,
          cnic_expiry_date: null,
          applicant_dob: null,
          // Use empty arrays
          references: [],
          existing_loans: [],
          business_descriptions: [],
          market_info: [],
          financial_indicators: [],
          financial_indicators_medium: []
        }
      }
    ];
    
    // Test each payload and collect results
    const results = [];
    
    for (const test of testPayloads) {
      console.log(`Testing payload: ${test.name}`);
      
      try {
        const response = await fetch(`${baseUrl}/api/smeasaan`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(test.payload)
        });
        
        const responseText = await response.text();
        let responseData;
        
        try {
          responseData = JSON.parse(responseText);
        } catch (e) {
          responseData = { rawText: responseText };
        }
        
        results.push({
          name: test.name,
          success: response.ok,
          status: response.status,
          response: responseData
        });
      } catch (error) {
        results.push({
          name: test.name,
          success: false,
          error: error.message
        });
      }
    }
    
    return NextResponse.json({
      diagnosticResults: results
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Failed to run diagnosis',
      error: error.message
    }, { status: 500 });
  }
} 