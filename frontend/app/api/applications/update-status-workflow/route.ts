import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json()
    const { losId, status, applicationType, department, action } = requestData

    if (!losId || !status || !applicationType || !department || !action) {
      return NextResponse.json(
        { error: 'losId, status, applicationType, department, and action are required' },
        { status: 400 }
      )
    }

    console.log(`🔄 Frontend API: Workflow update request for ${department} - ${action}`)
    console.log(`📋 Request data:`, requestData)

    // Call the backend API to update status using workflow - pass all data
    const backendResponse = await fetch('http://localhost:5000/api/applications/update-status-workflow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
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
    console.log(`✅ Frontend API: Workflow update successful`, result)

    return NextResponse.json({
      success: true,
      message: result.message || 'Status updated successfully',
      data: result
    })

  } catch (error) {
    console.error('Error updating application status workflow:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}