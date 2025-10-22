"use client";
import { useCustomer } from "@/contexts/CustomerContext";
import { useEffect, useRef, useState } from "react";

// Define interface for general info data
interface GeneralInfoData {
  application_no: string;
  date_of_request: string;
}

export const GeneralInfoForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  
  // Use refs to prevent infinite update loops
  const isInitialized = useRef(false);
  const skipNextUpdate = useRef(false);
  const isFirstRender = useRef(true);
  
  // Controlled state
  const [formData, setFormData] = useState<GeneralInfoData>({
    application_no: "",
    date_of_request: new Date().toISOString().slice(0, 10), // Default to today's date
  });
  
  // Initialize form with data from context (runs once)
  useEffect(() => {
    if (isInitialized.current) return;
    
    // Get existing data from context if available
    const commercialVehicle = customerData?.commercialVehicle || {};
    
    // Update form data with existing values
    setFormData({
      application_no: commercialVehicle.application_no || "",
      date_of_request: commercialVehicle.date_of_request ? new Date(commercialVehicle.date_of_request).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
    });
    
    isInitialized.current = true;
  }, [customerData]);
  
  // Save to context when form data changes
  const saveToContext = () => {
    if (skipNextUpdate.current || !isInitialized.current) return;
    
    skipNextUpdate.current = true;
    
    // Map form data to the expected API format
    updateCustomerData({
      commercialVehicle: {
        ...(customerData?.commercialVehicle || {}),
        application_no: formData.application_no,
        date_of_request: formData.date_of_request,
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
  const handleChange = (field: keyof GeneralInfoData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg font-semibold mb-4 p-4 bg-primary text-primary-foreground">General Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50" >
        <div>
          <label className="block text-sm font-medium mb-1">Application No.</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm" 
            placeholder="Application No." 
            value={formData.application_no}
            onChange={(e) => handleChange("application_no", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Date of Request</label>
          <input 
            type="date" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm" 
            value={formData.date_of_request}
            onChange={(e) => handleChange("date_of_request", e.target.value)}
          />
        </div>
      </div>
    </section>
  );
};
