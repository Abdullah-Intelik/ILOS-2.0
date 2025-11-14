/**
 * Universal API Helpers for Backend V2.0
 * Provides consistent interface for all API calls
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: any;
}

export interface NormalizedApplication {
  id: string;
  losId: number;
  applicantName: string;
  cnic: string;
  productType: string;
  product: string;
  productCode: string;
  amount: string;
  tenure: number;
  status: string;
  currentStage: string;
  submittedAt: string;
  updatedAt: string;
}

/**
 * Get applications by department (paginated)
 */
export async function getApplicationsByDepartment(
  department: string,
  page: number = 1,
  pageSize: number = 50
): Promise<PaginatedResponse<any>> {
  const response = await fetch(
    `${API_BASE}/api/v1/applications/department/${department}/paginated?page=${page}&pageSize=${pageSize}`,
    { cache: 'no-store' }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch applications for ${department}`);
  }
  
  const result = await response.json();
  return result;
}

/**
 * Get application form data
 */
export async function getApplicationForm(losId: number | string): Promise<any> {
  const response = await fetch(
    `${API_BASE}/api/v1/applications/form/${losId}`,
    { cache: 'no-store' }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch application form for LOS-${losId}`);
  }
  
  return await response.json();
}

/**
 * Get application summary
 */
export async function getApplicationSummary(losId: number | string): Promise<ApiResponse<any>> {
  const response = await fetch(
    `${API_BASE}/api/v1/applications/${losId}/summary`,
    { cache: 'no-store' }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch application summary for LOS-${losId}`);
  }
  
  return await response.json();
}

/**
 * Update application status
 */
export async function updateApplicationStatus(
  losId: number | string,
  status: string,
  comments?: string
): Promise<ApiResponse<any>> {
  const response = await fetch(
    `${API_BASE}/api/v1/applications/${losId}/status`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, comments })
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to update status for LOS-${losId}`);
  }
  
  return await response.json();
}

/**
 * Normalize application data (handles both V1 and V2 formats)
 */
export function normalizeApplicationData(app: any): NormalizedApplication {
  return {
    id: app.id || `LOS-${app.los_id}`,
    losId: typeof app.los_id === 'number' ? app.los_id : parseInt(app.los_id),
    applicantName: app.applicantName || app.applicant_name || '',
    cnic: app.cnic || app.applicant_cnic || '',
    productType: app.productType || app.product_type || app.application_type || '',
    product: app.product || '',
    productCode: app.productCode || app.product_code || '',
    amount: app.amount || app.requested_amount || '',
    tenure: typeof app.tenure === 'number' ? app.tenure : parseInt(app.tenure || app.tenure_months || '0'),
    status: app.status || '',
    currentStage: app.current_stage || app.currentStage || '',
    submittedAt: app.submittedAt || app.submitted_at || '',
    updatedAt: app.updatedAt || app.updated_at || ''
  };
}

/**
 * Normalize array of applications
 */
export function normalizeApplications(apps: any[]): NormalizedApplication[] {
  return apps.map(normalizeApplicationData);
}

/**
 * Extract data from paginated response (handles both V1 and V2)
 */
export function extractPaginatedData<T>(response: any): T[] {
  // Backend V2.0: { success, data: [...], total, page, pageSize }
  if (response.data && Array.isArray(response.data)) {
    return response.data;
  }
  
  // Old Backend V1: direct array or { applications: [...] }
  if (Array.isArray(response)) {
    return response;
  }
  
  if (response.applications && Array.isArray(response.applications)) {
    return response.applications;
  }
  
  // Fallback
  return [];
}

/**
 * Safe field accessor - handles both camelCase and snake_case
 */
export function safeGet(obj: any, camelField: string, snakeField: string, defaultValue: any = '') {
  return obj?.[camelField] || obj?.[snakeField] || defaultValue;
}

