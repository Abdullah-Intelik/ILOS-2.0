/**
 * LOS ID Helper Utilities
 * 
 * Backend V2.0 returns los_id as a NUMBER (e.g., 51)
 * Old backend returned los_id as a STRING (e.g., "LOS-51")
 * 
 * These utilities handle both formats seamlessly.
 */

/**
 * Extracts numeric LOS ID from either number or string format
 * @param losId - Can be number (51) or string ("LOS-51" or "51")
 * @returns Numeric LOS ID
 */
export function extractLosId(losId: number | string | undefined | null): number {
  if (losId === undefined || losId === null) {
    throw new Error('LOS ID is required');
  }
  
  if (typeof losId === 'number') {
    return losId;
  }
  
  if (typeof losId === 'string') {
    // Remove 'LOS-' prefix if present
    const cleaned = losId.replace('LOS-', '').trim();
    const parsed = parseInt(cleaned, 10);
    
    if (isNaN(parsed)) {
      throw new Error(`Invalid LOS ID format: ${losId}`);
    }
    
    return parsed;
  }
  
  throw new Error(`Unsupported LOS ID type: ${typeof losId}`);
}

/**
 * Formats LOS ID for display
 * @param losId - Can be number (51) or string ("LOS-51")
 * @returns Formatted string "LOS-51"
 */
export function formatLosId(losId: number | string | undefined | null): string {
  if (losId === undefined || losId === null) {
    return 'N/A';
  }
  
  const numericId = extractLosId(losId);
  return `LOS-${numericId}`;
}

/**
 * Gets API URL for Backend V2.0
 * @returns Base API URL (e.g., "http://localhost:5000")
 */
export function getApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
}

/**
 * Creates a fetch URL for Backend V2.0 API
 * @param endpoint - API endpoint (e.g., "/api/v1/applications/51")
 * @returns Full URL (e.g., "http://localhost:5000/api/v1/applications/51")
 */
export function createApiUrl(endpoint: string): string {
  const baseUrl = getApiUrl();
  // Remove leading slash from endpoint if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${baseUrl}/${cleanEndpoint}`;
}

