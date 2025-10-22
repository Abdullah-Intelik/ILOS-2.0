// Debug API route to test database connection
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get base URL based on environment
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5000' 
      : '';

    // Make a request to test database connection
    const response = await fetch(`${baseUrl}/api/test-db-connection`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
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
      response: responseData
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Failed to check database connection',
      error: error.message || 'Unknown error'
    }, { status: 500 });
  }
} 