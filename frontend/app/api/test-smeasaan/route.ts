import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    console.log('Testing SME ASAAN applications from:', `${baseUrl}/api/applications/test/smeasaan`);
    
    // Test SME ASAAN specifically
    const response = await fetch(`${baseUrl}/api/applications/test/smeasaan`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('SME ASAAN test result:', data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error testing SME ASAAN:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      backendUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    });
  }
} 