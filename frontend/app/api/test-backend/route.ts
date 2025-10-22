import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    console.log('Testing backend connection to:', baseUrl);
    
    // Test basic connectivity
    const healthResponse = await fetch(`${baseUrl}/health`);
    const healthData = healthResponse.ok ? await healthResponse.json() : null;
    
    // Test the applications endpoint
    const appsResponse = await fetch(`${baseUrl}/api/applications/recent/pb`);
    const appsData = appsResponse.ok ? await appsResponse.json() : null;
    
    return NextResponse.json({
      backendUrl: baseUrl,
      healthCheck: healthData,
      applicationsEndpoint: {
        status: appsResponse.status,
        ok: appsResponse.ok,
        data: appsData
      }
    });
  } catch (error) {
    console.error('Backend test failed:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      backendUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    });
  }
} 