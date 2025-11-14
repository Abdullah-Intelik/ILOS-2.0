import AsyncStorage from '@react-native-async-storage/async-storage';
import { debugLog, debugError } from './config';

// Storage Keys
const STORAGE_KEYS = {
  CUSTOMER_TOKEN: 'customer_token',
  CUSTOMER_DATA: 'customer_data',
  APPLICATION_DRAFTS: 'application_drafts',
  APP_SETTINGS: 'app_settings',
  LAST_SYNC: 'last_sync',
};

// Generic Storage Operations
export const setItem = async (key, value) => {
  try {
    // If value is already a string, store as-is (for tokens)
    // Otherwise, stringify it (for objects)
    const valueToStore = typeof value === 'string' ? value : JSON.stringify(value);
    await AsyncStorage.setItem(key, valueToStore);
    debugLog(`Stored item: ${key}`);
    return true;
  } catch (error) {
    debugError(`Failed to store item ${key}:`, error);
    return false;
  }
};

export const getItem = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value == null) return null;
    
    // Try to parse as JSON, if it fails, return as plain string
    // This handles both JSON objects and plain string tokens
    try {
      return JSON.parse(value);
    } catch (parseError) {
      // Not JSON, return as plain string (for tokens, etc.)
      return value;
    }
  } catch (error) {
    debugError(`Failed to get item ${key}:`, error);
    return null;
  }
};

export const removeItem = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    debugLog(`Removed item: ${key}`);
    return true;
  } catch (error) {
    debugError(`Failed to remove item ${key}:`, error);
    return false;
  }
};

export const clearAll = async () => {
  try {
    await AsyncStorage.clear();
    debugLog('Cleared all storage');
    return true;
  } catch (error) {
    debugError('Failed to clear storage:', error);
    return false;
  }
};

// Customer Data
export const saveCustomerData = async (customerData) => {
  return await setItem(STORAGE_KEYS.CUSTOMER_DATA, customerData);
};

export const getCustomerData = async () => {
  return await getItem(STORAGE_KEYS.CUSTOMER_DATA);
};

export const removeCustomerData = async () => {
  await removeItem(STORAGE_KEYS.CUSTOMER_TOKEN);
  await removeItem(STORAGE_KEYS.CUSTOMER_DATA);
};

// Authentication Token
export const saveAuthToken = async (token) => {
  return await setItem(STORAGE_KEYS.CUSTOMER_TOKEN, token);
};

export const getAuthToken = async () => {
  return await getItem(STORAGE_KEYS.CUSTOMER_TOKEN);
};

export const removeAuthToken = async () => {
  return await removeItem(STORAGE_KEYS.CUSTOMER_TOKEN);
};

// Check if user is logged in
export const isLoggedIn = async () => {
  const token = await getAuthToken();
  const customerData = await getCustomerData();
  return !!(token || customerData);
};

// Application Drafts
export const saveDraft = async (draft) => {
  try {
    const drafts = await getDrafts();
    const existingIndex = drafts.findIndex(d => d.id === draft.id);
    
    if (existingIndex >= 0) {
      drafts[existingIndex] = {
        ...draft,
        updatedAt: new Date().toISOString(),
      };
    } else {
      drafts.push({
        ...draft,
        id: draft.id || Date.now().toString(),
        createdAt: new Date().toISOString(),
      });
    }
    
    return await setItem(STORAGE_KEYS.APPLICATION_DRAFTS, drafts);
  } catch (error) {
    debugError('Failed to save draft:', error);
    return false;
  }
};

export const getDrafts = async () => {
  const drafts = await getItem(STORAGE_KEYS.APPLICATION_DRAFTS);
  return drafts || [];
};

export const getDraftById = async (draftId) => {
  const drafts = await getDrafts();
  return drafts.find(d => d.id === draftId);
};

export const deleteDraft = async (draftId) => {
  try {
    const drafts = await getDrafts();
    const filtered = drafts.filter(d => d.id !== draftId);
    return await setItem(STORAGE_KEYS.APPLICATION_DRAFTS, filtered);
  } catch (error) {
    debugError('Failed to delete draft:', error);
    return false;
  }
};

export const clearDrafts = async () => {
  return await setItem(STORAGE_KEYS.APPLICATION_DRAFTS, []);
};

// App Settings
export const saveAppSettings = async (settings) => {
  return await setItem(STORAGE_KEYS.APP_SETTINGS, settings);
};

export const getAppSettings = async () => {
  const settings = await getItem(STORAGE_KEYS.APP_SETTINGS);
  return settings || {
    notifications: true,
    autoSave: true,
    biometricAuth: false,
  };
};

// Last Sync Time
export const saveLastSyncTime = async () => {
  return await setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
};

export const getLastSyncTime = async () => {
  return await getItem(STORAGE_KEYS.LAST_SYNC);
};

export default {
  setItem,
  getItem,
  removeItem,
  clearAll,
  saveCustomerData,
  getCustomerData,
  removeCustomerData,
  saveAuthToken,
  getAuthToken,
  removeAuthToken,
  isLoggedIn,
  saveDraft,
  getDrafts,
  getDraftById,
  deleteDraft,
  clearDrafts,
  saveAppSettings,
  getAppSettings,
  saveLastSyncTime,
  getLastSyncTime,
};

