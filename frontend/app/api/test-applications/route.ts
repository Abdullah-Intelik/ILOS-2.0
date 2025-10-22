import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Test endpoint called');
    
    // Test backend connectivity
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const response = await fetch(`${baseUrl}/api/applications/recent/pb`);
    
    if (!response.ok) {
      return NextResponse.json({ 
        success: false, 
        error: `Backend responded with status: ${response.status}` 
      });
    }
    
    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      message: 'Backend connection successful',
      applicationsCount: data.length,
      applications: data.slice(0, 2) // Show first 2 for debugging
    });
    
  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
} 