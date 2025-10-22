import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    const response = await fetch(`${backendUrl}/api/agents`, { cache: 'no-store' })
    const text = await response.text()

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Backend error fetching agents', details: text },
        { status: response.status }
      )
    }

    const data = text ? JSON.parse(text) : []
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 })
  }
}