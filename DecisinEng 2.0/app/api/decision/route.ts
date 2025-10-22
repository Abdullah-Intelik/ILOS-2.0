import { NextRequest, NextResponse } from 'next/server';
import DecisionEngine from '../../../lib/modules/DecisionEngine';

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

    const decisionEngine = new DecisionEngine();
    const result = decisionEngine.calculateDecision(applicationData);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error calculating decision:', error);
    return NextResponse.json(
      { error: 'Failed to calculate decision' },
      { status: 500 }
    );
  }
}











