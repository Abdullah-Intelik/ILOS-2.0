import { NextRequest, NextResponse } from 'next/server';
import PersonalLoanDecisionEngine from '../../../../lib/modules/PersonalLoanDecisionEngine';

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

    const decisionEngine = new PersonalLoanDecisionEngine();
    const result = decisionEngine.calculateDecision(applicationData);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error calculating personal loan decision:', error);
    return NextResponse.json(
      { error: 'Failed to calculate personal loan decision' },
      { status: 500 }
    );
  }
}
