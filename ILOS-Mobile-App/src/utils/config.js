// Configuration for ILOS Mobile App
import { Platform } from 'react-native';

// Auto-detect if running on emulator or physical device
const isEmulator = () => {
  // Check if running on Android emulator
  // Emulators typically have 'sdk' or 'generic' in their device info
  const { OS } = Platform;
  if (OS === 'android') {
    // We'll use the emulator IP (10.0.2.2) by default and fallback to local IP
    // This is a simple heuristic - you can also check Platform.constants
    return false; // Set to true if you want to force emulator mode
  }
  return false;
};

const getApiBaseUrl = () => {
  if (isEmulator()) {
    return 'http://10.0.2.2:5000'; // For Android emulator
  }
  // With adb reverse, we can use localhost which works for both emulator and physical device
  return 'http://localhost:5000'; // Works with adb reverse tcp:5000 tcp:5000
};

// Document server (FileZilla) - same as web app uses
const getDocumentServerUrl = () => {
  if (isEmulator()) {
    return 'http://10.0.2.2:8081'; // For Android emulator
  }
  // With adb reverse, we can use localhost which works for both emulator and physical device
  return 'http://localhost:8081'; // Works with adb reverse tcp:8081 tcp:8081
};

const ENV = {
  development: {
    // Dynamically select API URL based on device type
    API_BASE_URL: getApiBaseUrl(),
    API_TIMEOUT: 30000,
    DEBUG: true,
  },
  staging: {
    API_BASE_URL: 'https://your-staging-backend.vercel.app',
    API_TIMEOUT: 30000,
    DEBUG: true,
  },
  production: {
    API_BASE_URL: 'https://your-production-backend.vercel.app',
    API_TIMEOUT: 30000,
    DEBUG: false,
  },
};

// Get current environment (default to development)
const getCurrentEnv = () => {
  // You can set this via environment variable or build configuration
  return process.env.NODE_ENV || 'development';
};

const currentEnv = getCurrentEnv();
const config = ENV[currentEnv];

// API Configuration
export const API_CONFIG = {
  // Base URL for API calls - Dynamically selected based on device type
  // For Android emulator: uses 10.0.2.2
  // For physical device: uses computer's local IP (192.168.1.155)
  API_BASE_URL: getApiBaseUrl(),
  
  // Document server URL (FileZilla/Port 8081) - same as web app
  DOCUMENT_SERVER_URL: getDocumentServerUrl(),
  
  // Timeout settings
  TIMEOUT: 30000, // 30 seconds
  
  // Debug mode
  DEBUG: true,
};

// API Endpoints
export const API_ENDPOINTS = {
  // Health & Status
  HEALTH: '/health',
  
  // Applications - Updated to match new backend structure
  EAMVU_APPLICATIONS: '/api/applications/department/eamvu',
  APPLICATION_DETAILS: (losId) => `/api/applications/form/${losId}`,
  UPDATE_STATUS: '/api/applications/update-status',
  UPDATE_COMMENT: '/api/applications/update-comment',
  APPLICATION_COMMENTS: (losId) => `/api/applications/comments/${losId}`,
  
  // Agent Assignments - New endpoint
  AGENT_ASSIGNMENTS: '/api/applications/test/assignments',
  
  // Customer & CIF
  CUSTOMER_STATUS: '/getNTB_ETB',
  CIF_DETAILS: (consumerId) => `/cif/${consumerId}`,
  
  // Documents
  APPLICATION_DOCUMENTS: (losId) => `/api/documents/${losId}`,
  UPLOAD_DOCUMENT: '/api/upload-document',
  
  // Test Endpoints
  TEST_BACKEND: '/health',
  TEST_APPLICATIONS: '/api/test-applications',
};

// Agent credentials for login
// Using numeric IDs to match backend agent_assignments table
export const AGENT_CREDENTIALS = [
  { id: 101, name: 'Ahmad Hassan', password: '001', stringId: 'agent-001' },
  { id: 102, name: 'Fatima Ali', password: '002', stringId: 'agent-002' },
  { id: 103, name: 'Muhammad Khan', password: '003', stringId: 'agent-003' },
  { id: 104, name: 'Aisha Sheikh', password: '004', stringId: 'agent-004' },
  { id: 105, name: 'Sara Ahmed', password: '005', stringId: 'agent-005' },
];

// Status mappings for EAMVU - Updated to match new backend status values
export const EAMVU_STATUS_OPTIONS = [
  { value: 'SUBMITTED_TO_COPS', label: 'Submit to COPS', color: '#F59E0B' },
  { value: 'SUBMITTED_TO_CIU', label: 'Submit to CIU', color: '#EF4444' },
  { value: 'SUBMITTED_TO_RRU', label: 'Submit to RRU', color: '#EC4899' },
  { value: 'Application_Returned', label: 'Return Application', color: '#F97316' },
];

// Document status options
export const DOCUMENT_STATUS_OPTIONS = [
  { value: 'Collected', label: '📄 Collected', color: '#10B981' },
  { value: 'Verified', label: '✅ Verified', color: '#059669' },
  { value: 'Rejected', label: '❌ Rejected', color: '#DC2626' },
  { value: 'Pending', label: '⏳ Pending', color: '#F59E0B' },
];

// Application types
export const APPLICATION_TYPES = {
  CASHPLUS: 'CashPlus',
  AUTOLOAN: 'AutoLoan',
  SMEASAAN: 'SMEASAAN',
  COMMERCIAL_VEHICLE: 'CommercialVehicle',
  AMEENDRIVE: 'AmeenDrive',
  PLATINUM_CREDIT_CARD: 'PlatinumCreditCard',
  CLASSIC_CREDIT_CARD: 'ClassicCreditCard',
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection error. Please check your internet connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  TIMEOUT_ERROR: 'Request timeout. Please try again.',
  UNAUTHORIZED: 'Unauthorized access. Please login again.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Invalid data provided.',
  UNKNOWN_ERROR: 'An unknown error occurred. Please try again.',
};

// Success messages
export const SUCCESS_MESSAGES = {
  STATUS_UPDATED: 'Application status updated successfully.',
  COMMENT_UPDATED: 'Comment updated successfully.',
  DOCUMENT_UPDATED: 'Document status updated successfully.',
  DATA_FETCHED: 'Data loaded successfully.',
};

// App constants
export const APP_CONSTANTS = {
  APP_NAME: 'ILOS EAMVU',
  VERSION: '1.0.0',
  BUILD_NUMBER: '1',
  
  // Colors - Updated to match frontend green theme
  PRIMARY_COLOR: '#0F766E', // Teal/Forest Green
  SECONDARY_COLOR: '#14B8A6', // Teal
  SUCCESS_COLOR: '#10B981', // Emerald Green
  WARNING_COLOR: '#F59E0B',
  ERROR_COLOR: '#EF4444',
  
  // Status colors - Updated to match green theme
  STATUS_COLORS: {
    'SUBMITTED_BY_SPU': '#14B8A6',
    'submitted_by_spu': '#14B8A6',
    'SUBMITTED_TO_COPS': '#F59E0B',
    'submitted_to_cops': '#F59E0B',
    'SUBMITTED_TO_CIU': '#EF4444',
    'submitted_to_ciu': '#EF4444',
    'SUBMITTED_TO_RRU': '#EC4899',
    'submitted_to_rru': '#EC4899',
    'APPROVED': '#059669',
    'approved': '#059669',
    'REJECTED': '#DC2626',
    'rejected': '#DC2626',
    'RETURNED': '#F97316',
    'returned': '#F97316',
    'assigned_to_eavmu_officer': '#14B8A6',
    'returned_by_eavmu_officer': '#059669',
  },
  
  // Priority colors
  PRIORITY_COLORS: {
    'high': '#DC2626',
    'medium': '#F59E0B',
    'low': '#10B981',
  },
};

// Debug utilities
export const debugLog = (message, data = null) => {
  if (config.DEBUG) {
    console.log(`🔍 [DEBUG] ${message}`, data);
  }
};

export const debugError = (message, error = null) => {
  if (config.DEBUG) {
    console.error(`❌ [DEBUG ERROR] ${message}`, error);
  }
};

export default {
  API_CONFIG,
  API_ENDPOINTS,
  EAMVU_STATUS_OPTIONS,
  DOCUMENT_STATUS_OPTIONS,
  APPLICATION_TYPES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  APP_CONSTANTS,
  debugLog,
  debugError,
}; 