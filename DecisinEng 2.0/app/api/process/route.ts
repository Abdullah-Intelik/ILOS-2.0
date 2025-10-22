import { NextRequest, NextResponse } from 'next/server';
import DataService from '../../../lib/modules/DataService';
import DecisionEngine from '../../../lib/modules/DecisionEngine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { applicationId } = body;
    
    if (!applicationId) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      );
    }

    const dataService = new DataService();
    const decisionEngine = new DecisionEngine();
    
    // Fetch and process application data
    const applicationData = await dataService.processApplication(parseInt(applicationId));
    
    // Calculate decision
    const result = await decisionEngine.calculateDecision(applicationData);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error processing application:', error);
    return NextResponse.json(
      { error: 'Failed to process application' },
      { status: 500 }
    );
  }
}




