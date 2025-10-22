"use client";
import { useCustomer } from "@/contexts/CustomerContext";
import { useEffect, useRef, useState } from "react";

// Define interface for undertaking data
interface UndertakingData {
  agreed: boolean;
  signature_date: string;
  signature_file: string;
}

export const UndertakingForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  
  // Use refs to prevent infinite update loops
  const isInitialized = useRef(false);
  const skipNextUpdate = useRef(false);
  const isFirstRender = useRef(true);
  
  // Controlled state
  const [formData, setFormData] = useState<UndertakingData>({
    agreed: false,
    signature_date: new Date().toISOString().slice(0, 10),
    signature_file: ""
  });
  
  // Initialize form with data from context (runs once)
  useEffect(() => {
    if (isInitialized.current) return;
    
    // Get existing data from context if available
    const commercialVehicle = customerData?.commercialVehicle || {};
    
    // Update form data with existing values
    setFormData({
      agreed: Boolean(commercialVehicle.undertaking_agreed),
      signature_date: commercialVehicle.undertaking_signature_date ? new Date(commercialVehicle.undertaking_signature_date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      signature_file: commercialVehicle.undertaking_signature_file || ""
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
        undertaking_agreed: formData.agreed,
        undertaking_signature_date: formData.signature_date,
        undertaking_signature_file: formData.signature_file
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
  const handleChange = (field: keyof UndertakingData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Convert file to base64 for storage
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        handleChange("signature_file", base64);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-primary text-primary-foreground">Undertaking</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">
            I hereby declare that the information provided is true and complete to the best of my knowledge.
          </label>
          <div className="flex gap-6 mt-4">
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={formData.agreed}
                onChange={(e) => handleChange("agreed", e.target.checked)}
              /> I Agree
            </label>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Applicant Signature</label>
            <input
              type="file"
              accept="image/*,.pdf"
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm"
              onChange={handleFileChange}
            />
            {formData.signature_file && (
              <div className="mt-2">
                <p className="text-sm text-green-600">✓ Signature file uploaded</p>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm"
              value={formData.signature_date}
              onChange={(e) => handleChange("signature_date", e.target.value)}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
