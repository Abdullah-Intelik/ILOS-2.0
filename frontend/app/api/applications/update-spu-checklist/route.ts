import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Frontend API: Updating SPU checklist...');
    
    // Get the request body
    const body = await request.json();
    console.log('📋 SPU Checklist Update Request:', body);
    
    // Fetch from backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const response = await fetch(`${backendUrl}/api/applications/update-spu-checklist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error(`❌ Backend responded with status: ${response.status}`);
      const errorText = await response.text();
      console.error(`❌ Backend error: ${errorText}`);
      return NextResponse.json(
        { error: `Backend error: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`✅ Frontend API: Successfully updated SPU checklist for LOS ID: ${body.losId}`);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Frontend API Error:', error);
    return NextResponse.json(
      { error: 'Failed to update SPU checklist' },
      { status: 500 }
    );
  }
}