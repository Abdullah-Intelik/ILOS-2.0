"use client";
import { useCustomer } from "@/contexts/CustomerContext";
import { useEffect, useRef, useState } from "react";

// Define interface for general info data
interface GeneralInfoData {
  application_no: string;
  date_of_request: string;
  lcv: boolean;
  pmkj_yes: boolean;
}

export const SMEGeneralInfoForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  
  // Use refs to prevent infinite update loops
  const isInitialized = useRef(false);
  const skipNextUpdate = useRef(false);
  const isFirstRender = useRef(true);
  
  // Controlled state
  const [formData, setFormData] = useState<GeneralInfoData>({
    application_no: "",
    date_of_request: new Date().toISOString().slice(0, 10), // Default to today's date
    lcv: false,
    pmkj_yes: false
  });
  
  // Initialize form with data from context (runs once)
  useEffect(() => {
    if (isInitialized.current) return;
    
    // Get existing data from context if available
    const smeApp = customerData?.smeApplication || {};
    
    // Update form data with existing values
    setFormData({
      application_no: smeApp.application_no || "",
      date_of_request: smeApp.date_of_request ? new Date(smeApp.date_of_request).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      lcv: Boolean(smeApp.lcv),
      pmkj_yes: Boolean(smeApp.pmkj_yes)
    });
    
    isInitialized.current = true;
  }, [customerData]);
  
  // Save to context when form data changes
  const saveToContext = () => {
    if (skipNextUpdate.current || !isInitialized.current) return;
    
    skipNextUpdate.current = true;
    
    // Map form data to the expected API format
    updateCustomerData({
      smeApplication: {
        ...(customerData?.smeApplication || {}),
        application_no: formData.application_no,
        date_of_request: formData.date_of_request,
        lcv: formData.lcv,
        pmkj_yes: formData.pmkj_yes
      }
    } as any);
    
    // Reset the flag after a short delay
    setTimeout(() => {
      skipNextUpdate.current = false;
    }, 50);
  };
  
  // Update context when form data changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    saveToContext();
  }, [formData]);
  
  // Handle input changes
  const handleChange = (field: keyof GeneralInfoData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-primary text-primary-foreground">General Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
        <div>
          <label className="block text-sm font-medium mb-1">Application No.</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2" 
            placeholder="Application No." 
            value={formData.application_no}
            onChange={(e) => handleChange("application_no", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Date of Request</label>
          <input 
            type="date" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2"
            value={formData.date_of_request}
            onChange={(e) => handleChange("date_of_request", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">LCV</label>
          <input 
            type="checkbox" 
            className="mr-2"
            checked={formData.lcv}
            onChange={(e) => handleChange("lcv", e.target.checked)}
          /> 
          <span className="text-sm">Check if applicable</span>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">PMKJ – YES</label>
          <input 
            type="checkbox" 
            className="mr-2"
            checked={formData.pmkj_yes}
            onChange={(e) => handleChange("pmkj_yes", e.target.checked)}
          /> 
          <span className="text-sm">Check if applicable</span>
        </div>
      </div>
    </section>
  );
};
