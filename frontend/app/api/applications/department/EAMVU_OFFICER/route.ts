import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Frontend API: Fetching EAMVU_OFFICER applications from backend...');
    
    // Fetch from backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const response = await fetch(`${backendUrl}/api/applications/department/EAMVU_OFFICER`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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
    console.log(`✅ Frontend API: Successfully fetched ${data.length} EAMVU_OFFICER applications`);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Frontend API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch EAMVU_OFFICER applications' },
      { status: 500 }
    );
  }
} 