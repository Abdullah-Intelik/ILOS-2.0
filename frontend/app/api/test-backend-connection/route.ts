// Debug API route to test backend connection
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Try to connect to the backend health endpoint
    const backendUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5000' 
      : '';
      
    const response = await fetch(`${backendUrl}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      return NextResponse.json({
        success: false,
        status: response.status,
        message: `Backend server responded with error status: ${response.status}`,
        error: await response.text()
      }, { status: 500 });
    }
    
    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      backendStatus: data,
      message: 'Successfully connected to backend server'
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Failed to connect to backend server',
      error: error.message || 'Unknown error'
    }, { status: 500 });
  }
} 