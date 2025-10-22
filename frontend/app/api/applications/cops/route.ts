import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Frontend API: Fetching COPS applications...');
    
    // Fetch COPS applications from the backend
    const response = await fetch('http://localhost:5000/api/applications/department/cops', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('🔄 Frontend API: Backend response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Frontend API: Successfully fetched COPS applications:', data.length);
      
      return NextResponse.json(data);
    } else {
      const errorText = await response.text();
      console.error('❌ Frontend API: Backend error response:', errorText);
      console.error('❌ Frontend API: Response status:', response.status);
      
      return NextResponse.json(
        { 
          error: 'Failed to fetch COPS applications', 
          details: errorText,
          status: response.status 
        },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('❌ Frontend API: Exception caught:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 