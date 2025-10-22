import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { losId, fieldName, isVerified } = body

    console.log('🔄 Frontend: Updating checklist:', { losId, fieldName, isVerified })

    const response = await fetch('http://localhost:5000/api/applications/update-checklist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        losId,
        fieldName,
        isVerified
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ Backend error:', data)
      return NextResponse.json(
        { error: data.error || 'Failed to update checklist' },
        { status: response.status }
      )
    }

    console.log('✅ Frontend: Checklist updated successfully:', data)
    return NextResponse.json(data)

  } catch (error) {
    console.error('❌ Frontend: Error updating checklist:', error)
    return NextResponse.json(
      { error: 'Failed to update checklist' },
      { status: 500 }
    )
  }
} 