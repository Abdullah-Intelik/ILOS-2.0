/**
 * API Client for Backend V2.0
 * Modern API client with TypeScript support
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6000/api/v1';

export class ApiClientV2 {
  private baseURL: string;

  constructor(baseURL = API_BASE) {
    this.baseURL = baseURL;
  }

  /**
   * Generic request method
   */
  async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log(`[API V2] ${options.method || 'GET'} ${url}`);
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('[API V2] Request failed:', error);
      throw error;
    }
  }

  // ===== Parties (Customers) =====
  
  async getPartyByCnic(cnic: string) {
    return this.request(`/parties/cnic/${cnic}`);
  }

  async createParty(data: any) {
    return this.request('/parties', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ===== Applications =====
  
  async createApplication(data: any) {
    return this.request('/applications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getApplication(losId: number) {
    return this.request(`/applications/${losId}`);
  }

  async getApplicationSummary(losId: number) {
    return this.request(`/applications/${losId}/summary`);
  }

  async submitApplication(losId: number) {
    return this.request(`/applications/${losId}/submit`, {
      method: 'POST',
    });
  }

  // ===== Dashboard =====
  
  async getDashboardMetrics() {
    return this.request('/dashboard/metrics');
  }

  // ===== Health Check =====
  
  async healthCheck() {
    return this.request('/health');
  }
}

// Export singleton instance
export const apiV2 = new ApiClientV2();

// Export for custom instances
export default ApiClientV2;

