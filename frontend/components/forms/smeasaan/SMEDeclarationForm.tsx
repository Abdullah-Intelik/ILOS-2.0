"use client";
import { useCustomer } from "@/contexts/CustomerContext";
import { useEffect, useRef, useState } from "react";

// Define interface for declaration data that matches CustomerContext
interface DeclarationData {
  termsAgreed: boolean;
  date: string;
  signature_file?: File | null;
  signature?: string;
  contactConfirmation?: boolean;
}

export const SMEDeclarationForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  
  // Use refs to prevent infinite update loops
  const isInitialized = useRef(false);
  const skipNextUpdate = useRef(false);
  const isFirstRender = useRef(true);
  
  // Controlled state
  const [formData, setFormData] = useState<DeclarationData>({
    termsAgreed: false,
    date: new Date().toISOString().slice(0, 10), // Default to today's date
    signature_file: null,
    signature: "",
    contactConfirmation: false
  });
  
  // Initialize form with data from context when customerData becomes available
  useEffect(() => {
    if (!customerData || isInitialized.current) return;
    
    // Get existing data from context if available
    const declaration = customerData?.declaration || {};
    
    // Update form data with existing values, mapping to CustomerContext structure
    setFormData({
      termsAgreed: Boolean(declaration.termsAgreed),
      date: declaration.date ? new Date(declaration.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      signature_file: null,
      signature: declaration.signature || "",
      contactConfirmation: Boolean(declaration.contactConfirmation)
    });
    
    isInitialized.current = true;
  }, [customerData]);
  
  // Save to context when form data changes
  const saveToContext = () => {
    if (skipNextUpdate.current || !isInitialized.current) return;
    
    skipNextUpdate.current = true;
    
    // Map form data to the CustomerContext format
    updateCustomerData({
      declaration: {
        termsAgreed: formData.termsAgreed,
        date: formData.date,
        signature: formData.signature,
        contactConfirmation: formData.contactConfirmation
      }
    });
    
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
  
  // Handle checkbox change for terms agreement
  const handleTermsAgreeChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      termsAgreed: checked
    }));
  };
  
  // Handle checkbox change for contact confirmation
  const handleContactConfirmationChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      contactConfirmation: checked
    }));
  };
  
  // Handle date change
  const handleDateChange = (date: string) => {
    setFormData(prev => ({
      ...prev,
      date: date
    }));
  };
  
  // Handle file input change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      // For this example, we just store the file and could handle upload later
      const objectUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        signature_file: file,
        // In a real app, you would upload the file and get a URL back
        // For now, we'll create a local object URL for preview
        signature: objectUrl
      }));
    }
  };
  
  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-primary text-primary-foreground">Declaration</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">
            I hereby declare that the information provided is true and complete to the best of my knowledge.
          </label>
          <div className="flex gap-6 mt-4">
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={formData.termsAgreed}
                onChange={(e) => handleTermsAgreeChange(e.target.checked)}
              /> I Agree to Terms and Conditions
            </label>
          </div>
          <div className="flex gap-6 mt-4">
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={formData.contactConfirmation || false}
                onChange={(e) => handleContactConfirmationChange(e.target.checked)}
              /> I confirm my contact details are correct
            </label>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 md:col-span-2">
          <div>
            <label className="block text-sm font-medium mb-1">Applicant Signature</label>
            <input
              type="file"
              className="w-full rounded-xl border border-gray-300 px-4 py-2"
              onChange={handleFileChange}
              accept="image/*"
            />
            {formData.signature && (
              <div className="mt-2">
                <img 
                  src={formData.signature} 
                  alt="Signature Preview" 
                  className="max-h-20 border border-gray-300 rounded" 
                />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              className="w-full rounded-xl border border-gray-300 px-4 py-2"
              value={formData.date}
              onChange={(e) => handleDateChange(e.target.value)}
            />
          </div>
        </div>
      </div>
    </section>
  );
};