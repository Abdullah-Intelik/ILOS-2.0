import axios from 'axios';
import { API_CONFIG, API_ENDPOINTS, ERROR_MESSAGES, debugLog, debugError } from './config';

// Create axios instance with configuration
const apiClient = axios.create({
  baseURL: API_CONFIG.API_BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    debugLog(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    debugError('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging and error handling
apiClient.interceptors.response.use(
  (response) => {
    debugLog(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    debugError('API Response Error:', {
      status: error.response?.status,
      message: error.message,
      url: error.config?.url,
    });
    return Promise.reject(error);
  }
);

// Error handler utility
const handleApiError = (error, customMessage = null) => {
  let message = customMessage;

  if (!message) {
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      message = ERROR_MESSAGES.TIMEOUT_ERROR;
    } else if (error.response?.status === 401) {
      message = ERROR_MESSAGES.UNAUTHORIZED;
    } else if (error.response?.status === 404) {
      message = ERROR_MESSAGES.NOT_FOUND;
    } else if (error.response?.status >= 500) {
      message = ERROR_MESSAGES.SERVER_ERROR;
    } else if (error.message.includes('Network Error')) {
      message = ERROR_MESSAGES.NETWORK_ERROR;
    } else {
      message = ERROR_MESSAGES.UNKNOWN_ERROR;
    }
  }

  return new Error(message);
};

// API Service Class
class ILOSApiService {
  // Health Check
  async checkHealth() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.HEALTH);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Health check failed');
    }
  }

  // EAMVU Applications - Backend V2.0
  async getEAMVUApplications(agentId = null, page = 1, pageSize = 100) {
    try {
      debugLog('Fetching EAMVU applications...');
      console.log('🔍 API Base URL:', API_CONFIG.API_BASE_URL);
      console.log('🔍 Agent ID:', agentId);
      
      // Backend V2.0: Uses department-based endpoint with pagination
      const response = await apiClient.get(API_ENDPOINTS.EAMVU_APPLICATIONS, {
        params: { page, pageSize }
      });
      
      console.log('✅ API Response received:', response.status);
      
      // Backend V2.0 returns: { success: true, data: [...], total, page, pageSize }
      const applications = response.data.data || response.data.applications || [];
      
      console.log('✅ Total applications fetched:', applications.length);
      console.log('📋 Sample application:', applications[0]);
      
      // ✅ NO FILTERING by assigned_to - Backend already filters by current_stage = 'EAVMU_OFFICER'
      // All EAVMU stage applications are returned, matching web dashboard behavior
      // (In web, agent login determines which apps they see, same here)
      
      debugLog(`Successfully fetched ${applications.length} EAVMU applications`);
      return applications;
    } catch (error) {
      console.error('❌ Error fetching EAMVU applications:', {
        message: error.message,
        code: error.code,
        response: error.response?.status,
        responseData: error.response?.data,
      });
      throw handleApiError(error, 'Failed to fetch EAMVU applications');
    }
  }

  // Application Details - Backend V2.0
  async getApplicationDetails(losId) {
    try {
      debugLog(`Fetching application details for LOS ID: ${losId}`);
      
      // Backend V2.0 expects numeric LOS ID
      const numericId = losId.toString().replace('LOS-', '');
      
      const response = await apiClient.get(API_ENDPOINTS.APPLICATION_DETAILS(numericId));
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch application details');
    }
  }

  // Update Application Status - Backend V2.0 (Unified approach matching web dashboard)
  async updateApplicationStatus(losId, action, verificationData, agentId) {
    try {
      debugLog(`Updating application LOS-${losId}: ${action}`);
      
      const numericId = losId.toString().replace('LOS-', '');
      
      // Determine status based on action
      let status;
      let eavmuVerification;
      
      if (action === 'approve' || action === 'verify') {
        status = 'eavmu_approved'; // Moves to CIU
        eavmuVerification = {
          overall_result: 'Approved',
          residence_verified: verificationData.residence_verified !== false,
          workplace_verified: verificationData.workplace_verified !== false,
          verification_notes: verificationData.notes || 'Investigation completed',
          documents_uploaded: verificationData.documents_uploaded !== false,
          verification_method: verificationData.method || 'field_visit'
        };
      } else if (action === 'reject') {
        status = 'eavmu_rejected'; // Rejected
        eavmuVerification = {
          overall_result: 'Rejected',
          residence_verified: false,
          workplace_verified: false,
          verification_notes: verificationData.notes || 'Application rejected',
          documents_uploaded: false,
          verification_method: 'field_visit'
        };
      } else {
        throw new Error(`Invalid action: ${action}`);
      }
      
      const response = await apiClient.patch(
        API_ENDPOINTS.UPDATE_STATUS(numericId),
        {
          status,
          comments: verificationData.notes || '',
          userId: parseInt(agentId),
          department: 'EAVMU',
          action: action === 'approve' ? 'verify' : action,
          eavmuVerification
        }
      );
      
      return response.data;
    } catch (error) {
      throw handleApiError(error, `Failed to ${action} application`);
    }
  }

  // Convenience method: Approve Application
  async approveApplication(losId, notes, agentId, verificationData = {}) {
    return this.updateApplicationStatus(losId, 'approve', {
      notes,
      residence_verified: verificationData.residence_verified,
      workplace_verified: verificationData.workplace_verified,
      documents_uploaded: verificationData.documents_uploaded,
      method: verificationData.method
    }, agentId);
  }

  // Convenience method: Reject Application
  async rejectApplication(losId, notes, agentId) {
    return this.updateApplicationStatus(losId, 'reject', { notes }, agentId);
  }

  // Add Comment - Backend V2.0
  async addComment(losId, commentData) {
    try {
      debugLog(`Adding comment for LOS-${losId}`);
      
      const numericId = losId.toString().replace('LOS-', '');
      
      const response = await apiClient.post(
        API_ENDPOINTS.ADD_COMMENT(numericId),
        commentData
      );
      
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to add comment');
    }
  }

  // Get Comments - Backend V2.0
  async getComments(losId) {
    try {
      debugLog(`Fetching comments for LOS-${losId}`);
      
      const numericId = losId.toString().replace('LOS-', '');
      
      const response = await apiClient.get(
        API_ENDPOINTS.GET_COMMENTS(numericId)
      );
      
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch comments');
    }
  }

  // ❌ DEPRECATED: CBS/CIF methods removed in Backend V2.0
  // Customer status is now determined by party data in the main database

  // Document Management
  async getApplicationDocuments(losId, applicationType = null) {
    try {
      debugLog(`Fetching documents for LOS ID: ${losId}` + (applicationType ? ` (${applicationType})` : ''));
      // Extract numeric ID
      const numericId = losId.toString().replace('LOS-', '');
      
      // Use document server (port 8086) for document operations
      const docServerUrl = API_CONFIG.DOCUMENT_SERVER_URL || API_CONFIG.API_BASE_URL;
      
      // Add applicationType as query parameter if provided
      const queryParam = applicationType ? `?applicationType=${applicationType}` : '';
      const url = `${docServerUrl}/api/documents/${numericId}${queryParam}`;
      
      debugLog(`Fetching from document server: ${url}`);
      const response = await axios.get(url, { timeout: API_CONFIG.TIMEOUT });
      
      return response.data.documents || [];
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch application documents');
    }
  }

  // Upload Document (Enhanced for React Native)
  async uploadDocument(losId, applicationType, documentUri, documentType = 'investigation_photo', customFileName = null) {
    try {
      debugLog(`Uploading document for LOS ID: ${losId}`);
      
      const formData = new FormData();
      
      // Extract numeric LOS ID
      const numericLosId = losId.toString().replace('LOS-', '');
      
      // Document server (port 8086) uses different field names
      formData.append('losId', numericLosId);
      formData.append('loanType', applicationType); // Document server uses 'loanType'
      formData.append('document_type', documentType);
      
      // Handle file from React Native
      const originalFilename = documentUri.split('/').pop() || `photo_${Date.now()}.jpg`;
      const match = /\.(\w+)$/.exec(originalFilename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      // Use custom filename if provided, otherwise use original
      const filename = customFileName || originalFilename;
      
      // Document server expects field name 'file' not 'document'
      formData.append('file', {
        uri: documentUri,
        name: filename, // This will be used by multer
        type: type,
      });
      
      // Add custom_name field for document server to use
      if (customFileName) {
        formData.append('custom_name', customFileName);
      }

      debugLog('Upload request:', { losId: numericLosId, loanType: applicationType, documentType, filename, customName: customFileName });

      // Use document server (port 8086) for upload
      const docServerUrl = API_CONFIG.DOCUMENT_SERVER_URL || API_CONFIG.API_BASE_URL;
      const url = `${docServerUrl}/upload`; // Document server uses /upload not /api/upload-document
      
      debugLog(`Uploading to document server: ${url}`);
      const response = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json', // Ensure JSON response
        },
        timeout: 60000, // 60 seconds for upload
      });
      
      return response.data;
    } catch (error) {
      debugError('Upload error:', error.response?.data || error.message);
      throw handleApiError(error, 'Failed to upload document');
    }
  }

  // Get Document URL for viewing
  async getDocumentUrl(documentPath) {
    try {
      // documentPath is like: /explorer/cashplus/los-123/photo.jpg
      // Use document server (port 8086) for viewing documents
      const docServerUrl = API_CONFIG.DOCUMENT_SERVER_URL || API_CONFIG.API_BASE_URL;
      const fullUrl = `${docServerUrl}${documentPath}`;
      debugLog(`Document URL: ${fullUrl}`);
      return fullUrl;
    } catch (error) {
      throw handleApiError(error, 'Failed to get document URL');
    }
  }

  // Test Backend Connection
  async testBackendConnection() {
    try {
      debugLog('Testing backend connection...');
      const response = await apiClient.get(API_ENDPOINTS.TEST_BACKEND);
      return {
        success: true,
        status: response.status,
        data: response.data,
        message: 'Backend connection successful',
      };
    } catch (error) {
      debugError('Backend connection test failed:', error);
      return {
        success: false,
        error: error.message,
        status: error.response?.status,
        message: 'Backend connection failed',
      };
    }
  }

  // Test Applications Endpoint
  async testApplicationsEndpoint() {
    try {
      debugLog('Testing applications endpoint...');
      const response = await apiClient.get(API_ENDPOINTS.TEST_APPLICATIONS);
      return {
        success: true,
        status: response.status,
        data: response.data,
        message: 'Applications endpoint working',
      };
    } catch (error) {
      debugError('Applications endpoint test failed:', error);
      return {
        success: false,
        error: error.message,
        status: error.response?.status,
        message: 'Applications endpoint failed',
      };
    }
  }

  // ❌ DEPRECATED: Agent assignment methods removed
  // Backend V2.0 uses assigned_to field directly in applications table
  // Use getEAMVUApplications(agentId) instead
}

// Create and export the API service instance
const apiService = new ILOSApiService();

export default apiService; 