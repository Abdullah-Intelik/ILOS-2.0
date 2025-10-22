import { NextRequest, NextResponse } from 'next/server';
import CarLoanDecisionEngine from '../../../../lib/modules/CarLoanDecisionEngine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { applicationData } = body;
    
    if (!applicationData) {
      return NextResponse.json(
        { error: 'Application data is required' },
        { status: 400 }
      );
    }

    const decisionEngine = new CarLoanDecisionEngine();
    const result = decisionEngine.calculateDecision(applicationData);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error calculating car loan decision:', error);
    return NextResponse.json(
      { error: 'Failed to calculate car loan decision' },
      { status: 500 }
    );
  }
}

