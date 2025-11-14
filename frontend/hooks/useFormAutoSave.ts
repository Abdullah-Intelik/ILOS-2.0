/**
 * useFormAutoSave Hook
 * Automatically saves form data to localStorage and restores on page load
 */

import { useEffect, useCallback, useRef } from 'react';

interface UseFormAutoSaveOptions {
  formId: string;
  formData: any;
  enabled?: boolean;
  saveInterval?: number; // milliseconds
  onRestore?: (data: any) => void;
}

export function useFormAutoSave({
  formId,
  formData,
  enabled = true,
  saveInterval = 5000, // Save every 5 seconds
  onRestore
}: UseFormAutoSaveOptions) {
  const lastSaveTime = useRef<number>(0);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Generate storage key
  const storageKey = `form-autosave-${formId}`;

  /**
   * Save form data to localStorage
   */
  const saveToStorage = useCallback(() => {
    if (!enabled) return;

    try {
      const dataToSave = {
        formData,
        timestamp: Date.now(),
        version: '1.0'
      };

      localStorage.setItem(storageKey, JSON.stringify(dataToSave));
      lastSaveTime.current = Date.now();
      
      console.log(`💾 Auto-saved form: ${formId} at ${new Date().toLocaleTimeString()}`);
    } catch (error) {
      console.error('❌ Error saving form data:', error);
    }
  }, [formId, formData, enabled, storageKey]);

  /**
   * Restore form data from localStorage
   */
  const restoreFromStorage = useCallback(() => {
    if (!enabled) return null;

    try {
      const saved = localStorage.getItem(storageKey);
      
      if (!saved) {
        console.log(`ℹ️ No saved data found for form: ${formId}`);
        return null;
      }

      const parsed = JSON.parse(saved);
      const savedData = parsed.formData;
      const savedTime = new Date(parsed.timestamp);

      console.log(`📥 Restored form data from: ${savedTime.toLocaleString()}`);
      
      if (onRestore) {
        onRestore(savedData);
      }

      return savedData;
    } catch (error) {
      console.error('❌ Error restoring form data:', error);
      return null;
    }
  }, [formId, enabled, storageKey, onRestore]);

  /**
   * Clear saved data
   */
  const clearSavedData = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      console.log(`🗑️ Cleared saved data for form: ${formId}`);
    } catch (error) {
      console.error('❌ Error clearing saved data:', error);
    }
  }, [formId, storageKey]);

  /**
   * Get save info
   */
  const getSaveInfo = useCallback(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return null;

      const parsed = JSON.parse(saved);
      return {
        timestamp: parsed.timestamp,
        formattedTime: new Date(parsed.timestamp).toLocaleString(),
        age: Date.now() - parsed.timestamp
      };
    } catch {
      return null;
    }
  }, [storageKey]);

  /**
   * Auto-save effect - saves data periodically
   */
  useEffect(() => {
    if (!enabled) return;

    // Debounced save - wait for user to stop typing
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      const timeSinceLastSave = Date.now() - lastSaveTime.current;
      
      // Only save if enough time has passed
      if (timeSinceLastSave >= saveInterval) {
        saveToStorage();
      }
    }, 2000); // Wait 2 seconds after last change

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [formData, enabled, saveInterval, saveToStorage]);

  /**
   * Save on page unload
   */
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = () => {
      saveToStorage();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enabled, saveToStorage]);

  return {
    saveToStorage,
    restoreFromStorage,
    clearSavedData,
    getSaveInfo
  };
}

/**
 * Hook to show restore prompt
 */
export function useFormRestorePrompt(formId: string) {
  const storageKey = `form-autosave-${formId}`;

  const checkForSavedData = useCallback(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return null;

      const parsed = JSON.parse(saved);
      const age = Date.now() - parsed.timestamp;

      // Only show restore prompt if data is less than 24 hours old
      if (age > 24 * 60 * 60 * 1000) {
        localStorage.removeItem(storageKey);
        return null;
      }

      return {
        data: parsed.formData,
        timestamp: parsed.timestamp,
        formattedTime: new Date(parsed.timestamp).toLocaleString(),
        ageMinutes: Math.floor(age / 60000)
      };
    } catch {
      return null;
    }
  }, [storageKey]);

  return { checkForSavedData };
}

