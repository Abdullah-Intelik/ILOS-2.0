import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { losId, fieldName, commentText } = body

    console.log(`🔄 Frontend: Updating comment for LOS ID: ${losId}, Field: ${fieldName}`)

    const response = await fetch('http://localhost:5000/api/applications/update-comment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        losId,
        fieldName,
        commentText
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('❌ Backend error:', errorData)
      return NextResponse.json(
        { error: 'Failed to update comment', details: errorData.error },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log(`✅ Comment updated successfully for LOS ID: ${losId}`)

    return NextResponse.json(data)

  } catch (error) {
    console.error('❌ Frontend error updating comment:', error)
    return NextResponse.json(
      { error: 'Failed to update comment', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 