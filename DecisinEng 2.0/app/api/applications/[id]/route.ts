import { NextRequest, NextResponse } from 'next/server';
import DataService from '../../../../lib/modules/DataService';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const applicationId = parseInt(params.id);
    
    if (isNaN(applicationId)) {
      return NextResponse.json(
        { error: 'Invalid application ID' },
        { status: 400 }
      );
    }

    const dataService = new DataService();
    const applicationData = await dataService.fetchApplicationData(applicationId);
    
    return NextResponse.json(applicationData);
  } catch (error) {
    console.error('Error fetching application:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application data' },
      { status: 500 }
    );
  }
}











