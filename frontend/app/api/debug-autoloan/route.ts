import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Debug Auto Loan submission endpoint called');
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    // Get the request body
    const body = await request.json();
    console.log('🧪 Received payload:', body);
    
    // Send to backend
    const response = await fetch(`${baseUrl}/api/autoloan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
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