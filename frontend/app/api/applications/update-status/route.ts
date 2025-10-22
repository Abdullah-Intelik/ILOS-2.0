import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { losId, status, applicationType } = await request.json()

    if (!losId || !status || !applicationType) {
      return NextResponse.json(
        { error: 'losId, status, and applicationType are required' },
        { status: 400 }
      )
    }

    // Call the backend API to update status
    const backendResponse = await fetch('http://localhost:5000/api/applications/update-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        losId: losId,
        status: status,
        applicationType: applicationType
      })
    })

    if (!backendResponse.ok) {
      const errorData = await backendResponse.text()
      console.error('Backend error:', errorData)
      return NextResponse.json(
        { error: 'Failed to update status in backend' },
        { status: backendResponse.status }
      )
    }

    const result = await backendResponse.json()

    return NextResponse.json({
      success: true,
      message: 'Status updated successfully',
      data: result
    })

  } catch (error) {
    console.error('Error updating application status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 