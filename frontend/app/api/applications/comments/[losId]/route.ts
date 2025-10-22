import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ losId: string }> }
) {
  try {
    const { losId } = await params

    console.log(`🔄 Frontend: Fetching comments for LOS ID: ${losId}`)

    const response = await fetch(`http://localhost:5000/api/applications/comments/${losId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('❌ Backend error:', errorData)
      return NextResponse.json(
        { error: 'Failed to fetch comments', details: errorData.error },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log(`✅ Comments fetched successfully for LOS ID: ${losId}`)

    return NextResponse.json(data)

  } catch (error) {
    console.error('❌ Frontend error fetching comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 