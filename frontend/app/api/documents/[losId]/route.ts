import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { losId: string } }
) {
  try {
    const { losId } = params
    const { searchParams } = new URL(request.url)
    let applicationType = searchParams.get('applicationType')
    const search = searchParams.get('search') // 'true' for search across all types

    const mappedLoanType = {
      'CashPlus Loan': 'cashplus',
      'Auto Loan': 'autoloan',
      'SME Loan': 'smeasaan',
      'SME Asaan': 'smeasaan',
      'Commercial Vehicle Loan': 'commercialvehicle',
      'SME Commercial': 'commercialvehicle',
      'AmeenDrive Loan': 'ameendrive',
      'Platinum Credit Card': 'creditcard',
      'Classic Credit Card': 'creditcard'
    } as Record<string, string>
    applicationType = mappedLoanType[applicationType as keyof typeof mappedLoanType] || applicationType
    console.log(applicationType)

    
    console.log(`🔄 Frontend: Fetching documents for LOS-${losId}`)
    console.log(`🔄 Frontend: Application Type: ${applicationType}`)
    console.log(`🔄 Frontend: Search Mode: ${search}`)
    
    // Determine which endpoint to call
    let endpoint = ''
    if (search === 'true') {
      // Search across all application types
      endpoint = `http://localhost:8081/api/documents/search/${losId}`
    } else {
      // Get documents for specific application type
      endpoint = `http://localhost:8081/api/documents/${losId}`
      if (applicationType) {
        endpoint += `?applicationType=${applicationType}`
      }
    }
    
    console.log(`🔄 Frontend: Calling backend endpoint: ${endpoint}`)
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Frontend: Backend error:', errorText)
      return NextResponse.json(
        { error: 'Failed to fetch documents' },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ Frontend: Successfully fetched documents:', data)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Frontend: Error fetching documents:', error)
    return NextResponse.json(
      { error: 'Failed to connect to document server' },
      { status: 500 }
    )
  }
} 