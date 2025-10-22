import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Credit Card test endpoint called');
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const response = await fetch(`${baseUrl}/api/applications/test/creditcard`);
    
    if (!response.ok) {
      console.error('❌ Credit Card test failed:', response.status);
      return NextResponse.json({ success: false, error: `Backend responded with status: ${response.status}` });
    }
    
    const data = await response.json();
    console.log('✅ Credit Card test success:', data);
    return NextResponse.json({
      success: true,
      message: 'Credit Card applications test successful',
      applicationsCount: data.totalRecords,
      applications: data.testQueryResult.slice(0, 2) // Show first 2 for debugging
    });
  } catch (error) {
    console.error('❌ Credit Card test error:', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
} 