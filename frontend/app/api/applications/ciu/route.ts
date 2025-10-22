import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 CIU: Fetching applications from backend...')
    
    const response = await fetch('http://localhost:5000/api/applications/department/ciu', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ CIU: Backend error:', errorText)
      return NextResponse.json(
        { error: 'Failed to fetch CIU applications' },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ CIU: Successfully fetched', data.length, 'applications')
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ CIU: Error fetching applications:', error)
    return NextResponse.json(
      { error: 'Failed to connect to backend server' },
      { status: 500 }
    )
  }
} 