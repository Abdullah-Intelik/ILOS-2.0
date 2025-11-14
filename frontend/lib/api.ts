export function getBackendBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
}

/**
 * API utility functions
 */

/**
 * Returns the base URL for API requests, handling different environments
 */
export const getBaseUrl = (): string => {
  // Use environment variable in production
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Default to Backend V2.0 (localhost:5000) - no /api/v1 prefix
  return 'http://localhost:5000';
};

/**
 * Makes an API request with proper error handling
 * @param endpoint - The API endpoint to request
 * @param options - Request options (method, headers, body, etc.)
 * @returns Response data from the API
 */
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    // Set default headers if not provided
    if (!options.headers) {
      options.headers = {
        'Content-Type': 'application/json',
      };
    }
    
    console.log(`Making API request to ${url}...`);
    const response = await fetch(url, options);
    
    // Try to parse response as JSON
    let data;
    const text = await response.text();
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = { message: text };
    }
    
    // Handle API errors
    if (!response.ok) {
      console.error(`API error (${response.status}):`, data);
      
      // Create an error object with enhanced details
      const error = new Error(data.error || data.message || 'API request failed');
      (error as any).status = response.status;
      (error as any).data = data;
      (error as any).url = url;
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

/**
 * Fetch a paginated department applications feed
 */
export const fetchDepartmentPaginated = async (department: string, page = 1, pageSize = 10) => {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/applications/department/${encodeURIComponent(department)}/paginated?page=${page}&pageSize=${pageSize}`;
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, cache: 'no-store' });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch ${department} page: ${res.status} ${text}`);
  }
  return res.json();
};

/**
 * Submit a new SME ASAAN application to the backend
 * @param applicationData - Complete SME ASAAN application data
 * @returns Response from the backend with created application details
 */
export const submitSmeAsaanApplication = async (applicationData: any) => {
  return apiRequest('api/smeasaan', {
    method: 'POST',
    body: JSON.stringify(applicationData)
  });
};

/**
 * Fetch all SME ASAAN applications for a specific customer
 * @param customerId - Customer ID to fetch applications for
 * @returns Array of SME ASAAN applications for the customer
 */
export const getSmeAsaanApplicationsByCustomer = async (customerId: string) => {
  return apiRequest(`api/smeasaan/by-customer/${customerId}`);
};

/**
 * Fetch a specific SME ASAAN application by ID
 * @param applicationId - Application ID to fetch
 * @returns Details of the specific SME ASAAN application
 */
export const getSmeAsaanApplicationById = async (applicationId: string) => {
  return apiRequest(`api/smeasaan/${applicationId}`);
};

/**
 * Submit a new Commercial Vehicle application to the backend
 * @param applicationData - Complete Commercial Vehicle application data
 * @returns Response from the backend with created application details
 */
export const submitCommercialVehicleApplication = async (applicationData: any) => {
  return apiRequest('api/commercialVehicle', {
    method: 'POST',
    body: JSON.stringify(applicationData)
  });
};

/**
 * Fetch all Commercial Vehicle applications for a specific customer
 * @param customerId - Customer ID to fetch applications for
 * @returns Array of Commercial Vehicle applications for the customer
 */
export const getCommercialVehicleApplicationsByCustomer = async (customerId: string) => {
  return apiRequest(`api/commercialVehicle/by-customer/${customerId}`);
};

/**
 * Fetch a specific Commercial Vehicle application by ID
 * @param applicationId - Application ID to fetch
 * @returns Details of the specific Commercial Vehicle application
 */
export const getCommercialVehicleApplicationById = async (applicationId: string) => {
  return apiRequest(`api/commercialVehicle/${applicationId}`);
}; 

