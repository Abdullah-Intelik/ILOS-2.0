import React, { createContext, useContext, useState, useEffect } from 'react';
import { saveDraft, getDrafts, deleteDraft as removeDraft, getCustomerData } from '../utils/storage';
import { debugLog } from '../utils/config';

const ApplicationContext = createContext();

export const ApplicationProvider = ({ children }) => {
  // Current application being filled
  const [currentApplication, setCurrentApplication] = useState(null);
  
  // All drafts (filtered by current user's CNIC)
  const [drafts, setDrafts] = useState([]);
  
  // Submitted applications
  const [applications, setApplications] = useState([]);
  
  // Auto-save state
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);

  // Load drafts on mount
  useEffect(() => {
    loadDrafts();
  }, []);

  // Auto-save current application every 30 seconds
  useEffect(() => {
    if (!autoSaveEnabled || !currentApplication) return;

    const interval = setInterval(() => {
      saveCurrentApplicationAsDraft();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [currentApplication, autoSaveEnabled]);

  const loadDrafts = async () => {
    try {
      // Get current user's CNIC
      const customer = await getCustomerData();
      const currentCNIC = customer?.cnic;
      
      const allDrafts = await getDrafts();
      
      // Filter drafts by current user's CNIC
      const userDrafts = currentCNIC 
        ? allDrafts.filter(draft => draft.cnic === currentCNIC)
        : allDrafts; // Show all if no CNIC (shouldn't happen)
      
      setDrafts(userDrafts);
      debugLog('Loaded drafts for current user:', userDrafts.length);
      debugLog('Total drafts in storage:', allDrafts.length);
    } catch (error) {
      debugLog('Error loading drafts:', error);
    }
  };

  const startNewApplication = (productType) => {
    setCurrentApplication({
      id: Date.now().toString(),
      productType,
      step: 0,
      data: {},
      createdAt: new Date().toISOString(),
      status: 'draft',
    });
  };

  const updateCurrentApplication = (data) => {
    setCurrentApplication(prev => ({
      ...prev,
      data: {
        ...prev?.data,
        ...data,
      },
      updatedAt: new Date().toISOString(),
    }));
  };

  const updateApplicationStep = (step) => {
    setCurrentApplication(prev => ({
      ...prev,
      step,
    }));
  };

  const saveCurrentApplicationAsDraft = async () => {
    if (!currentApplication) return false;

    try {
      // Get current user's CNIC to tag the draft
      const customer = await getCustomerData();
      
      const draftToSave = {
        ...currentApplication,
        cnic: customer?.cnic || null, // Tag draft with CNIC
        savedAt: new Date().toISOString(),
      };

      const success = await saveDraft(draftToSave);
      if (success) {
        setLastSaved(new Date());
        await loadDrafts();
        debugLog('Auto-saved draft');
      }
      return success;
    } catch (error) {
      debugLog('Error saving draft:', error);
      return false;
    }
  };

  const loadDraft = async (draftId) => {
    try {
      const draft = drafts.find(d => d.id === draftId);
      if (draft) {
        setCurrentApplication(draft);
        return true;
      }
      return false;
    } catch (error) {
      debugLog('Error loading draft:', error);
      return false;
    }
  };

  const deleteDraft = async (draftId) => {
    try {
      const success = await removeDraft(draftId);
      if (success) {
        await loadDrafts();
        if (currentApplication?.id === draftId) {
          setCurrentApplication(null);
        }
      }
      return success;
    } catch (error) {
      debugLog('Error deleting draft:', error);
      return false;
    }
  };

  const clearCurrentApplication = () => {
    setCurrentApplication(null);
  };

  const addSubmittedApplication = (application) => {
    setApplications(prev => [application, ...prev]);
  };

  const value = {
    // Current application
    currentApplication,
    startNewApplication,
    updateCurrentApplication,
    updateApplicationStep,
    clearCurrentApplication,
    
    // Drafts
    drafts,
    loadDrafts,
    loadDraft,
    deleteDraft,
    saveCurrentApplicationAsDraft,
    
    // Submitted applications
    applications,
    addSubmittedApplication,
    setApplications,
    
    // Auto-save
    autoSaveEnabled,
    setAutoSaveEnabled,
    lastSaved,
  };

  return (
    <ApplicationContext.Provider value={value}>
      {children}
    </ApplicationContext.Provider>
  );
};

export const useApplication = () => {
  const context = useContext(ApplicationContext);
  if (!context) {
    throw new Error('useApplication must be used within an ApplicationProvider');
  }
  return context;
};

export default ApplicationContext;

