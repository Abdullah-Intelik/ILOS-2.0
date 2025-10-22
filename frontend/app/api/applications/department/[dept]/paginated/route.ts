import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ dept: string }> }) {
  try {
    const { dept } = await params
    const { searchParams } = new URL(req.url)
    const page = searchParams.get('page') || '1'
    const pageSize = searchParams.get('pageSize') || '10'
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    const url = `${baseUrl}/api/applications/department/${encodeURIComponent(dept)}/paginated?page=${encodeURIComponent(page)}&pageSize=${encodeURIComponent(pageSize)}`
    const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, cache: 'no-store' })
    const text = await res.text()
    let data: any
    try { data = JSON.parse(text) } catch { data = { message: text } }
    if (!res.ok) {
      return NextResponse.json({ error: data?.error || data?.message || 'Failed to fetch' }, { status: res.status })
    }
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal Error' }, { status: 500 })
  }
}


