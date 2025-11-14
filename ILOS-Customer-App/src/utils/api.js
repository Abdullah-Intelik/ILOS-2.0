import axios from 'axios';
import { API_CONFIG, API_ENDPOINTS, ERROR_MESSAGES, debugLog, debugError } from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_CONFIG.API_BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    debugLog(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    
    // Add auth token if available
    const token = await AsyncStorage.getItem('customer_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    debugError('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
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

// Error handler
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
      message = error.response?.data?.error || ERROR_MESSAGES.UNKNOWN_ERROR;
    }
  }

  return new Error(message);
};

// API Service Class
class CustomerApiService {
  // Health Check
  async checkHealth() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.HEALTH);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Health check failed');
    }
  }

  // Authentication - UPDATED FOR BACKEND V2.0
  async loginWithCNIC(cnic) {
    try {
      debugLog('🔐 Logging in with CNIC (Backend V2.0):', cnic);
      debugLog('📡 API Base URL:', API_CONFIG.API_BASE_URL);
      debugLog('🎯 Full URL:', `${API_CONFIG.API_BASE_URL}${API_ENDPOINTS.GET_PARTY_BY_CNIC(cnic)}`);
      
      
      // Check if party exists by CNIC in Backend V2.0
      const response = await apiClient.get(API_ENDPOINTS.GET_PARTY_BY_CNIC(cnic));
      
      debugLog('✅ Party lookup response:', response.data);
      
      // Backend V2.0 returns {success, data} instead of {success, party}
      if (response.data.success && response.data.data) {
        const party = response.data.data;
        
        // Determine customer status
        let status = 'NTB'; // Default: New to Bank
        if (party.customer_type === 'ETB' || party.customer_type === 'RETURNING') {
          status = party.customer_type; // Existing to Bank or Returning
        }
        
        debugLog(`📊 Customer Type: ${party.customer_type}, Status: ${status}`);
        
        // Get latest application for auto-fill (optional)
        let latestApplication = null;
        try {
          const appResponse = await apiClient.get(API_ENDPOINTS.GET_LATEST_APPLICATION(cnic));
          if (appResponse.data.success && appResponse.data.application) {
            latestApplication = appResponse.data.application;
            debugLog('📋 Found latest application for auto-fill:', latestApplication.los_id);
          }
        } catch (err) {
          debugLog('ℹ️ No previous applications found (this is okay for first-time customers)');
        }
        
        const customerData = {
          party_id: party.party_id,
          cnic: party.cnic,
          name: `${party.first_name || ''} ${party.last_name || ''}`.trim(),
          first_name: party.first_name,
          last_name: party.last_name,
          mobile: party.mobile,
          email: party.email,
          date_of_birth: party.date_of_birth,
          residential_address: party.residential_address,
          city: party.city,
          status: status,
          customer_type: party.customer_type,
          latestApplication: latestApplication
        };
        
        // Store customer data locally
        await AsyncStorage.setItem('customer_data', JSON.stringify(customerData));
        
        return {
          success: true,
          customer: customerData,
          message: 'Login successful'
        };
      } else {
        // Party doesn't exist - NEW customer (NTB)
        debugLog('🆕 New customer detected - CNIC not found in database');
        
        const newCustomerData = {
          cnic: cnic,
          name: 'New Customer',
          status: 'NTB',
          customer_type: 'NTB',
          isNew: true
        };
        
        // Store as new customer
        await AsyncStorage.setItem('customer_data', JSON.stringify(newCustomerData));
        
        return {
          success: true,
          customer: newCustomerData,
          message: 'Welcome! Please complete your profile.'
        };
      }
    } catch (error) {
      debugError('❌ Login error:', error);
      
      // If 404, treat as new customer
      if (error.response?.status === 404) {
        debugLog('🆕 404 response - treating as new customer');
        const newCustomerData = {
          cnic: cnic,
          name: 'New Customer',
          status: 'NTB',
          customer_type: 'NTB',
          isNew: true
        };
        
        await AsyncStorage.setItem('customer_data', JSON.stringify(newCustomerData));
        
        return {
          success: true,
          customer: newCustomerData,
          message: 'Welcome! Please complete your profile.'
        };
      }
      
      throw handleApiError(error, 'Login failed');
    }
  }

  /**
   * Get customer details for autofill (Backend V2.0)
   * @param {string} cnic - Customer CNIC
   * @returns {Promise<{success: boolean, customerDetails: object}>}
   */
  async getCustomerDetails(cnic) {
    try {
      debugLog(`🔄 Fetching customer details (Backend V2.0): ${cnic}`);
      debugLog('📡 API Base URL:', API_CONFIG.API_BASE_URL);
      
      // Use the same endpoint as login (Backend V2.0)
      const url = API_ENDPOINTS.GET_PARTY_BY_CNIC(cnic);
      debugLog(`🎯 Full URL: ${API_CONFIG.API_BASE_URL}${url}`);
      
      const response = await apiClient.get(url); // Use apiClient instead of this.client
      debugLog(`✅ Customer details response:`, response.data);
      
      if (response.data.success && response.data.data) {
        const party = response.data.data;
        
        // Map Backend V2.0 party data to CustomerDetails format (matches CBS structure for compatibility)
        return {
          success: true,
          customerDetails: {
            cnic: party.cnic,
            first_name: party.first_name,
            last_name: party.last_name,
            father_or_husband_name: party.father_name,
            mother_maiden_name: party.mother_name,
            date_of_birth: party.date_of_birth,
            gender: party.gender,
            marital_status: party.marital_status,
            mobile: party.mobile_number || party.mobile,
            email: party.email,
            address: party.residential_address || party.address,
            city: party.city,
            // Party details (if exists)
            employment_status: party.employment_type,
            company_name: party.employer_name,
            designation: party.designation,
            gross_monthly_salary: party.monthly_income,
            // Banking details (if exists)
            bank_name: party.bank_name,
            account_number: party.account_number,
            branch: party.branch
          }
        };
      }
      
      // No party found (NTB customer)
      debugLog('ℹ️ No party details found (NTB customer)');
      return {
        success: false,
        customerDetails: null
      };
      
    } catch (error) {
      console.error('❌ Error fetching customer details:', error);
      debugLog(`❌ Error details: ${error.message}`);
      return {
        success: false,
        customerDetails: null,
        error: error.message
      };
    }
  }

  async verifyCNIC(cnic) {
    try {
      debugLog('Verifying CNIC:', cnic);
      const response = await apiClient.post(API_ENDPOINTS.VERIFY_CNIC, { cnic });
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'CNIC verification failed');
    }
  }

  async logout() {
    try {
      await AsyncStorage.removeItem('customer_token');
      await AsyncStorage.removeItem('customer_data');
      debugLog('Logged out successfully');
    } catch (error) {
      debugError('Logout error:', error);
    }
  }

  // Application Management - UPDATED FOR BACKEND V2.0
  async getMyApplications() {
    try {
      debugLog('📋 Fetching customer applications (Backend V2.0)...');
      const customerData = await AsyncStorage.getItem('customer_data');
      const customer = JSON.parse(customerData);
      
      if (!customer || !customer.party_id) {
        throw new Error('Customer data not found. Please login again.');
      }

      // Fetch applications by party_id (Backend V2.0)
      const response = await apiClient.get(API_ENDPOINTS.GET_MY_APPLICATIONS(customer.party_id));
      
      // Backend V2.0 returns {success, count, data: applications[]}
      const applications = response.data.data || [];
      debugLog(`✅ Fetched ${applications.length} applications`);
      
      return {
        success: true,
        applications: applications
      };
    } catch (error) {
      debugError('❌ Failed to fetch applications:', error);
      throw handleApiError(error, 'Failed to fetch applications');
    }
  }

  async getApplicationDetails(losId) {
    try {
      debugLog(`📄 Fetching application details for LOS ID: ${losId} (Backend V2.0)`);
      // Handle both number and string formats (66 or "LOS-66")
      const numericId = typeof losId === 'string' ? losId.replace('LOS-', '').replace('los-', '') : losId;
      debugLog(`   Calling API: ${API_ENDPOINTS.GET_APPLICATION(numericId)}`);
      const response = await apiClient.get(API_ENDPOINTS.GET_APPLICATION(numericId));
      debugLog(`✅ Application details fetched successfully`);
      return response.data;
    } catch (error) {
      debugError(`❌ Failed to fetch application ${losId}:`, error);
      throw handleApiError(error, 'Failed to fetch application details');
    }
  }

  // UPDATED FOR BACKEND V2.0 - Unified submission endpoint
  async submitApplication(productType, applicationData) {
    try {
      debugLog(`📤 Submitting ${productType} application (Backend V2.0)...`);
      
      // Transform mobile app data structure to Backend V2.0 format
      const normalizedProductType = this.normalizeProductType(productType);
      
      const submissionData = {
        product_code: normalizedProductType,
        requested_amount: parseFloat(applicationData.requestedAmount || applicationData.loanAmount || applicationData.amount || 0),
        tenure_months: parseInt(applicationData.tenureMonths || applicationData.tenure || applicationData.loanTenure || 12),
        purpose: applicationData.loanPurpose || applicationData.purpose || null,
        
        // Party data (customer information)
        party_data: {
          cnic: applicationData.cnic,
          first_name: applicationData.firstName,
          last_name: applicationData.lastName,
          father_name: applicationData.fatherName,
          mother_name: applicationData.motherName,
          date_of_birth: applicationData.dateOfBirth,
          gender: this.normalizeGender(applicationData.gender), // Convert "Male"/"Female" to "M"/"F"
          marital_status: this.normalizeMaritalStatus(applicationData.maritalStatus), // Convert to abbreviation
          mobile_number: applicationData.mobileNumber || applicationData.mobile,
          email: applicationData.email,
          residential_address: applicationData.address,
          city: applicationData.city,
          customer_type: applicationData.isExistingCustomer ? 'ETB' : 'NTB'
        },
        
        // Employment and income data
        party_details: {
          employment_type: applicationData.employmentType,
          employer_name: applicationData.companyName,
          designation: applicationData.designation,
          office_address: applicationData.officeAddress,
          monthly_income: parseFloat(applicationData.monthlySalary || applicationData.monthlyIncome || 0),
          employment_tenure_years: parseInt(applicationData.employmentTenure || 0)
        },
        
        // Banking details
        banking_details: {
          bank_name: applicationData.bankName,
          account_number: applicationData.accountNumber,
          branch: applicationData.branch
        },
        
        // References
        references: applicationData.references || [],
        
        // Documents (from DocumentUploadScreen)
        documents: applicationData.documents || {},
        
        // Mobile app metadata
        source: 'mobile_app',
        submitted_from: 'mobile',
        is_mobile_submission: true
      };
      
      debugLog(`   Product Code: ${submissionData.product_code}`);
      debugLog(`   Requested Amount: ${submissionData.requested_amount}`);
      debugLog(`   Tenure: ${submissionData.tenure_months} months`);
      debugLog(`   Endpoint: ${API_ENDPOINTS.CREATE_APPLICATION}`);
      
      const response = await apiClient.post(API_ENDPOINTS.CREATE_APPLICATION, submissionData);
      
      debugLog(`✅ Application submitted successfully! LOS ID: ${response.data.data?.los_id || response.data.los_id}`);
      
      // Return normalized response
      return {
        success: true,
        losId: response.data.data?.los_id || response.data.los_id,
        status: response.data.data?.status || response.data.status,
        ...response.data
      };
    } catch (error) {
      debugError('❌ Failed to submit application:', error);
      throw handleApiError(error, 'Failed to submit application');
    }
  }

  // Helper to normalize gender (database expects single character)
  normalizeGender(gender) {
    if (!gender) return null;
    const normalized = gender.toString().toUpperCase();
    if (normalized === 'MALE' || normalized === 'M') return 'M';
    if (normalized === 'FEMALE' || normalized === 'F') return 'F';
    return gender.charAt(0).toUpperCase(); // Take first character as fallback
  }

  // Helper to normalize marital status (database expects full words like "Married", "Single")
  normalizeMaritalStatus(status) {
    if (!status) return null;
    const normalized = status.toString().toUpperCase();
    // Convert abbreviations to full words
    if (normalized === 'M' || normalized === 'MARRIED') return 'Married';
    if (normalized === 'S' || normalized === 'SINGLE') return 'Single';
    if (normalized === 'D' || normalized === 'DIVORCED') return 'Divorced';
    if (normalized === 'W' || normalized === 'WIDOWED') return 'Widowed';
    // Return original value with proper capitalization
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }

  // Helper to normalize product type names (matching database product_code format)
  normalizeProductType(productType) {
    const mapping = {
      // Map from mobile app product types to database product_code (UPPERCASE)
      'cashplus': 'CASHPLUS',
      'CashPlus': 'CASHPLUS',
      'autoloan': 'AUTOLOAN',
      'AutoLoan': 'AUTOLOAN',
      'platinum_creditcard': 'CREDITCARD_PLATINUM',
      'PlatinumCreditCard': 'CREDITCARD_PLATINUM',
      'classic_creditcard': 'CLASSIC_CC',
      'ClassicCreditCard': 'CLASSIC_CC',
      'smeasaan': 'SMEASAAN',
      'SMEASAAN': 'SMEASAAN',
      'ameendrive': 'AMEEN_DRIVE',
      'AmeenDrive': 'AMEEN_DRIVE',
      'commercial_vehicle': 'COMMERCIAL_VEHICLE',
      'CommercialVehicle': 'COMMERCIAL_VEHICLE',
      'instantloan': 'INSTANT_LOAN',
      'InstantLoan': 'INSTANT_LOAN',
    };
    
    // Try exact match first, then try uppercase
    return mapping[productType] || mapping[productType.toLowerCase()] || productType.toUpperCase();
  }

  // DEPRECATED - Old method for backward compatibility
  getProductEndpoint(productType) {
    debugLog('⚠️ WARNING: getProductEndpoint() is deprecated. Use CREATE_APPLICATION endpoint instead.');
    return API_ENDPOINTS.CREATE_APPLICATION;
  }

  // Draft Management (using AsyncStorage for now)
  async saveDraft(draftData) {
    try {
      debugLog('Saving draft...');
      const drafts = await this.getDrafts();
      const draftId = Date.now().toString();
      
      const newDraft = {
        id: draftId,
        ...draftData,
        savedAt: new Date().toISOString(),
      };
      
      drafts.push(newDraft);
      await AsyncStorage.setItem('application_drafts', JSON.stringify(drafts));
      
      return newDraft;
    } catch (error) {
      debugError('Failed to save draft:', error);
      throw new Error('Failed to save draft');
    }
  }

  async updateDraft(draftId, draftData) {
    try {
      debugLog('Updating draft:', draftId);
      const drafts = await this.getDrafts();
      const index = drafts.findIndex(d => d.id === draftId);
      
      if (index === -1) {
        throw new Error('Draft not found');
      }
      
      drafts[index] = {
        ...drafts[index],
        ...draftData,
        updatedAt: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem('application_drafts', JSON.stringify(drafts));
      return drafts[index];
    } catch (error) {
      debugError('Failed to update draft:', error);
      throw new Error('Failed to update draft');
    }
  }

  async getDrafts() {
    try {
      const draftsJson = await AsyncStorage.getItem('application_drafts');
      return draftsJson ? JSON.parse(draftsJson) : [];
    } catch (error) {
      debugError('Failed to get drafts:', error);
      return [];
    }
  }

  async getDraftById(draftId) {
    try {
      const drafts = await this.getDrafts();
      return drafts.find(d => d.id === draftId);
    } catch (error) {
      debugError('Failed to get draft:', error);
      return null;
    }
  }

  async deleteDraft(draftId) {
    try {
      debugLog('Deleting draft:', draftId);
      const drafts = await this.getDrafts();
      const filtered = drafts.filter(d => d.id !== draftId);
      await AsyncStorage.setItem('application_drafts', JSON.stringify(filtered));
      return true;
    } catch (error) {
      debugError('Failed to delete draft:', error);
      throw new Error('Failed to delete draft');
    }
  }

  // Document Management
  async uploadDocument(losId, documentData) {
    try {
      debugLog(`Uploading document for LOS ID: ${losId}`);
      
      const formData = new FormData();
      formData.append('losId', losId);
      formData.append('documentType', documentData.type);
      formData.append('file', {
        uri: documentData.uri,
        type: documentData.mimeType || 'image/jpeg',
        name: documentData.name || 'document.jpg',
      });

      const response = await apiClient.post(API_ENDPOINTS.UPLOAD_DOCUMENT, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to upload document');
    }
  }

  async getDocuments(losId) {
    try {
      debugLog(`Fetching documents for LOS ID: ${losId}`);
      const response = await apiClient.get(API_ENDPOINTS.GET_DOCUMENTS(losId));
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch documents');
    }
  }

  // Application Tracking
  async getApplicationStatus(losId) {
    try {
      debugLog(`Fetching status for LOS ID: ${losId}`);
      const response = await apiClient.get(API_ENDPOINTS.GET_APPLICATION_STATUS(losId));
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch application status');
    }
  }

  async getApplicationHistory(losId) {
    try {
      debugLog(`Fetching history for LOS ID: ${losId}`);
      const response = await apiClient.get(API_ENDPOINTS.GET_APPLICATION_HISTORY(losId));
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch application history');
    }
  }

  // Get full application details (Backend V2.0)
  async getApplicationDetails(losId) {
    try {
      debugLog(`📋 Fetching application details for LOS-${losId} (Backend V2.0)...`);
      const response = await apiClient.get(`/api/v1/applications/${losId}`);
      debugLog(`✅ Raw API response:`, response.data);
      
      // Backend V2.0 wraps response in { success: true, data: {...} }
      const app = response.data.data || response.data;
      debugLog(`✅ Unwrapped application data:`, app);
      
      // Map Backend V2.0 response to mobile app format
      return {
        los_id: app.los_id,
        loan_type: app.product_name || app.product_code || app.product_type || 'N/A',
        product_code: app.product_code || app.product_type,
        status: app.status,
        current_stage: app.current_stage,
        amount: parseFloat(app.requested_amount) || 0,
        tenure: app.tenure_months,
        created_at: app.created_at,
        updated_at: app.updated_at,
        disbursed_at: app.disbursed_at,
        approved_at: app.approved_at,
        // Additional fields
        party_id: app.party_id,
        cnic: app.cnic,
        applicant_name: app.applicant_name,
        monthly_income: parseFloat(app.monthly_income) || 0,
      };
    } catch (error) {
      debugError('Failed to fetch application details:', error);
      throw handleApiError(error, 'Failed to fetch application details');
    }
  }

  // ❌ REMOVED: Old getCustomerDetails method (duplicate)
  // New method exists at line 197 - uses Backend V2.0 endpoint

  // Create CBS customer account from OCR data (NTB → ETB conversion)
  async createCbsCustomerFromOcr(cnic, ocrData) {
    try {
      debugLog(`Creating CBS customer account for CNIC: ${cnic}`);
      const response = await apiClient.post('/api/cbs-customer/create-from-ocr', {
        cnic,
        ocrData
      });
      return response.data;
    } catch (error) {
      debugError('Failed to create CBS customer:', error);
      throw handleApiError(error, 'Failed to create customer account');
    }
  }

  // Update CBS customer with form data
  async updateCbsCustomerFromForm(cnic, formData) {
    try {
      debugLog(`Updating CBS customer for CNIC: ${cnic}`);
      const response = await apiClient.post('/api/cbs-customer/update-from-form', {
        cnic,
        formData
      });
      return response.data;
    } catch (error) {
      debugError('Failed to update CBS customer:', error);
      throw handleApiError(error, 'Failed to update customer details');
    }
  }
}

export default new CustomerApiService();

