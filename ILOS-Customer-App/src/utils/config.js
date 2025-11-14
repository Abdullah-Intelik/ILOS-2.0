// API Configuration - UPDATED FOR BACKEND V2.0
export const API_CONFIG = {
  API_BASE_URL: 'http://localhost:5000', // Backend V2.0 API - Use localhost with adb reverse!
  DOCUMENT_SERVER_URL: 'http://localhost:8086', // Document Server - Use localhost with adb reverse!
  // API_BASE_URL: 'http://localhost:5000', // iOS simulator
  // DOCUMENT_SERVER_URL: 'http://localhost:8086', // iOS simulator
  // API_BASE_URL: 'http://192.168.1.100:5000', // Physical device (update with your IP)
  // DOCUMENT_SERVER_URL: 'http://192.168.1.100:8086', // Physical device
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// API Endpoints - UPDATED FOR BACKEND V2.0
export const API_ENDPOINTS = {
  // Health check
  HEALTH: '/api/v1/health',
  
  // ===== BACKEND V2.0 ENDPOINTS =====
  
  // Parties (Customer Management) - NEW
  GET_PARTY_BY_CNIC: (cnic) => `/api/v1/parties/cnic/${cnic}`,
  GET_LATEST_APPLICATION: (cnic) => `/api/v1/parties/${cnic}/latest-application`,
  CREATE_PARTY: '/api/v1/parties',
  UPDATE_PARTY: (partyId) => `/api/v1/parties/${partyId}`,
  
  // Applications - UPDATED
  CREATE_APPLICATION: '/api/v1/applications', // Unified endpoint for all products
  GET_APPLICATION: (losId) => `/api/v1/applications/${losId}`,
  GET_APPLICATION_FORM: (losId) => `/api/v1/applications/form/${losId}`,
  GET_MY_APPLICATIONS: (partyId) => `/api/v1/applications/party/${partyId}`,
  UPDATE_APPLICATION_STATUS: (losId) => `/api/v1/applications/${losId}/status`,
  SUBMIT_APPLICATION: (losId) => `/api/v1/applications/${losId}/submit`,
  
  // Comments - NEW
  GET_COMMENTS: (losId) => `/api/v1/applications/${losId}/comments`,
  ADD_COMMENT: (losId) => `/api/v1/applications/${losId}/comments`,
  
  // References - NEW
  GET_REFERENCES: (losId) => `/api/v1/applications/${losId}/references`,
  
  // ===== DOCUMENT SERVER (Port 8086) =====
  DOCUMENT_SERVER: {
    UPLOAD: `${API_CONFIG.DOCUMENT_SERVER_URL || 'http://localhost:8086'}/upload`,
    LIST_FILES: `${API_CONFIG.DOCUMENT_SERVER_URL || 'http://localhost:8086'}/list-files`,
    GET_FILE: `${API_CONFIG.DOCUMENT_SERVER_URL || 'http://localhost:8086'}/files`,
    SAVE_OCR: `${API_CONFIG.DOCUMENT_SERVER_URL || 'http://localhost:8086'}/save-ocr`,
  },
  
  // ===== LEGACY ENDPOINTS (Deprecated, kept for backward compatibility) =====
  // These are no longer used but kept to avoid breaking old code
  LOGIN: '/api/customer/login', // ❌ DEPRECATED - Use GET_PARTY_BY_CNIC instead
  VERIFY_CNIC: '/api/customer/verify-cnic', // ❌ DEPRECATED
  SUBMIT_CASHPLUS: '/api/cashplus', // ❌ DEPRECATED - Use CREATE_APPLICATION
  SUBMIT_AUTOLOAN: '/api/autoloan', // ❌ DEPRECATED
  SUBMIT_CREDIT_CARD: '/api/platinum_creditcard', // ❌ DEPRECATED
  SUBMIT_CLASSIC_CARD: '/api/classic_creditcard', // ❌ DEPRECATED
  SUBMIT_SMEASAAN: '/api/smeasaan', // ❌ DEPRECATED
  SUBMIT_AMEENDRIVE: '/api/ameendrive', // ❌ DEPRECATED
  SUBMIT_COMMERCIAL_VEHICLE: '/api/commercialVehicle', // ❌ DEPRECATED
  SUBMIT_INSTANTLOAN: '/api/instantloan', // ❌ DEPRECATED
};

// Product Types (Matching ILOS Theme - Teal/Green Palette)
export const PRODUCT_TYPES = {
  CASHPLUS: {
    id: 'cashplus',
    name: 'CashPlus',
    displayName: 'CashPlus Personal Loan',
    description: 'Quick personal loan with flexible terms',
    icon: '💰',
    color: '#0F766E', // Teal - Primary
    minAmount: 50000,
    maxAmount: 5000000,
    endpoint: API_ENDPOINTS.SUBMIT_CASHPLUS,
  },
  AUTOLOAN: {
    id: 'autoloan',
    name: 'AutoLoan',
    displayName: 'Auto Loan',
    description: 'Finance your dream car',
    icon: '🚗',
    color: '#14B8A6', // Lighter Teal
    minAmount: 500000,
    maxAmount: 10000000,
    endpoint: API_ENDPOINTS.SUBMIT_AUTOLOAN,
  },
  PLATINUM_CARD: {
    id: 'platinum_card',
    name: 'PlatinumCreditCard',
    displayName: 'Platinum Credit Card',
    description: 'Premium credit card with exclusive benefits',
    icon: '💎',
    color: '#059669', // Emerald Green
    creditLimit: '50,000 - 5,00,000',
    endpoint: API_ENDPOINTS.SUBMIT_CREDIT_CARD,
  },
  CLASSIC_CARD: {
    id: 'classic_card',
    name: 'ClassicCreditCard',
    displayName: 'Classic Credit Card',
    description: 'Standard credit card for everyday use',
    icon: '💳',
    color: '#10B981', // Green
    creditLimit: '25,000 - 2,00,000',
    endpoint: API_ENDPOINTS.SUBMIT_CLASSIC_CARD,
  },
  SMEASAAN: {
    id: 'smeasaan',
    name: 'SMEASAAN',
    displayName: 'SMEASAAN Business Loan',
    description: 'Business loan for SMEs',
    icon: '🏢',
    color: '#06B6D4', // Cyan
    minAmount: 100000,
    maxAmount: 15000000,
    endpoint: API_ENDPOINTS.SUBMIT_SMEASAAN,
  },
  AMEENDRIVE: {
    id: 'ameendrive',
    name: 'AmeenDrive',
    displayName: 'AmeenDrive Ride-Hailing Financing',
    description: 'Special financing for ride-hailing drivers',
    icon: '🚕',
    color: '#0891B2', // Dark Cyan
    minAmount: 500000,
    maxAmount: 3000000,
    endpoint: API_ENDPOINTS.SUBMIT_AMEENDRIVE,
  },
  COMMERCIAL_VEHICLE: {
    id: 'commercial_vehicle',
    name: 'CommercialVehicle',
    displayName: 'Commercial Vehicle Financing',
    description: 'Finance commercial vehicles',
    icon: '🚚',
    color: '#0E7490', // Darker Teal
    minAmount: 1000000,
    maxAmount: 20000000,
    endpoint: API_ENDPOINTS.SUBMIT_COMMERCIAL_VEHICLE,
  },
  INSTANTLOAN: {
    id: 'instantloan',
    name: 'InstantLoan',
    displayName: 'Instant Loan ⚡',
    description: 'Instant approval for existing customers up to 7.5 lac',
    icon: '⚡',
    color: '#0D9488', // Vibrant Teal (for speed/instant)
    minAmount: 10000,
    maxAmount: 750000, // 7.5 lac max
    endpoint: API_ENDPOINTS.SUBMIT_INSTANTLOAN,
    badge: 'ETB Only',
    features: ['Instant Approval', 'Auto-Disbursement', 'No Manual Review'],
  },
};

// Application Status Configuration
export const APPLICATION_STATUS = {
  // Backend V2.0 Statuses
  PB: { label: 'Under Review (PB)', color: '#2196F3', icon: '🔍' },
  SPU: { label: 'Security Check', color: '#FF9800', icon: '🔒' },
  EAVMU_OFFICER: { label: 'Field Investigation', color: '#FF9800', icon: '📍' },
  CIU: { label: 'Final Review', color: '#9C27B0', icon: '⚖️' },
  COPS: { label: 'Processing Disbursement', color: '#4CAF50', icon: '💰' },
  disbursed: { label: 'Loan Disbursed', color: '#4CAF50', icon: '🎉' },
  rejected: { label: 'Rejected', color: '#F44336', icon: '❌' },
  
  // Old statuses (backward compatibility)
  DRAFT: { label: 'Draft', color: '#9E9E9E', icon: '📝' },
  PB_SUBMITTED: { label: 'Submitted', color: '#2196F3', icon: '✅' },
  submitted_by_pb: { label: 'Under Review', color: '#2196F3', icon: '🔍' },
  submitted_by_spu: { label: 'Security Check Complete', color: '#4CAF50', icon: '🔒' },
  assigned_to_eavmu_officer: { label: 'Field Investigation', color: '#FF9800', icon: '📍' },
  eamvu_visit_complete: { label: 'Investigation Complete', color: '#4CAF50', icon: '✓' },
  submitted_to_ciu: { label: 'Final Review', color: '#9C27B0', icon: '⚖️' },
  application_completed: { label: 'Approved', color: '#4CAF50', icon: '🎉' },
  loan_disbursed: { label: 'Loan Disbursed', color: '#4CAF50', icon: '💰' },
  card_issued: { label: 'Card Issued', color: '#4CAF50', icon: '💳' },
  offer_letter_issued: { label: 'Offer Letter Issued', color: '#4CAF50', icon: '📄' },
  rejected_by_spu: { label: 'Rejected (Security)', color: '#F44336', icon: '❌' },
  rejected_by_ciu: { label: 'Rejected (Review)', color: '#F44336', icon: '❌' },
  pending: { label: 'Pending', color: '#FF9800', icon: '⏳' },
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  TIMEOUT_ERROR: 'Request timeout. Please try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'Unauthorized. Please login again.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Please fill all required fields correctly.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
  CNIC_INVALID: 'Invalid CNIC format. Please enter 13 digits without dashes.',
  CNIC_NOT_FOUND: 'CNIC not found. Please contact customer support.',
};

// App Constants
export const APP_CONSTANTS = {
  APP_NAME: 'ILOS Customer',
  APP_VERSION: '1.0.0',
  DRAFT_AUTO_SAVE_INTERVAL: 30000, // 30 seconds
  MAX_DOCUMENT_SIZE: 10 * 1024 * 1024, // 10 MB
  ALLOWED_DOCUMENT_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
  CNIC_LENGTH: 13,
  PHONE_LENGTH: 11,
};

// Debug logging
export const debugLog = (...args) => {
  if (__DEV__) {
    console.log('[ILOS Customer]', ...args);
  }
};

export const debugError = (...args) => {
  if (__DEV__) {
    console.error('[ILOS Customer ERROR]', ...args);
  }
};

