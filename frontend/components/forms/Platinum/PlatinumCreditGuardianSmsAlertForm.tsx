// components/forms/Platinum/PlatinumCreditGuardianSmsAlertForm.tsx
"use client";
import { useCustomer } from "@/contexts/CustomerContext";
import { PlatinumCustomerData } from "@/types/platinum-types";
import { useEffect, useRef, useState } from "react";

export const PlatinumCreditGuardianSmsAlertForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  const typedCustomerData = customerData as unknown as PlatinumCustomerData;
  const [formData, setFormData] = useState({
    smsAlert: false,
    creditGuardian: false,
    signature: "",
    date: ""
  });

  // Use refs to prevent infinite update loops
  const isInitialized = useRef(false);
  const skipNextUpdate = useRef(false);
  const isFirstRender = useRef(true);

  // Initialize form with data from context (runs once)
  useEffect(() => {
    if (isInitialized.current) return;
    
    const creditGuardian = typedCustomerData?.creditGuardian || {};
    
    setFormData(prev => ({
      ...prev,
      smsAlert: creditGuardian.smsAlert || prev.smsAlert,
      creditGuardian: creditGuardian.creditGuardian || prev.creditGuardian,
      signature: creditGuardian.signature || prev.signature,
      date: creditGuardian.date || prev.date
    }));
    
    isInitialized.current = true;
  }, []);

  // Save form data to context when user makes changes
  const saveToContext = () => {
    if (skipNextUpdate.current || !isInitialized.current) return;
    
    skipNextUpdate.current = true;
    
    updateCustomerData({
      creditGuardian: {
        ...(typedCustomerData?.creditGuardian || {}),
        smsAlert: formData.smsAlert,
        creditGuardian: formData.creditGuardian,
        signature: formData.signature,
        date: formData.date
      }
    } as unknown as Partial<any>);
    
    // Reset the flag after a short delay
    setTimeout(() => {
      skipNextUpdate.current = false;
    }, 50);
  };

  // Handle initial render - don't update context on first render
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    saveToContext();
  }, [formData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const fileName = e.target.files[0].name;
      handleInputChange(field, fileName);
    }
  };

  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-primary text-primary-foreground">7. Credit Guardian & SMS Alert</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
        <div>
          <label className="block text-sm font-medium mb-2">
            SMS Alert Service - Stay informed about all transactions, due dates, and account activities on your mobile phone.
          </label>
          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input 
                type="checkbox"
                checked={formData.smsAlert}
                onChange={(e) => handleInputChange("smsAlert", e.target.checked)}
              /> I want to avail SMS Alert Service
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            Credit Guardian - Protect your credit card from fraudulent use with our advanced security service.
          </label>
          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input 
                type="checkbox"
                checked={formData.creditGuardian}
                onChange={(e) => handleInputChange("creditGuardian", e.target.checked)}
              /> I want to avail Credit Guardian
            </label>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:col-span-2">
          <div>
            <label className="block text-sm font-medium mb-1">Signature</label>
            <input
              type="file"
              className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white"
              onChange={(e) => handleFileChange("signature", e)}
            />
            {formData.signature && (
              <p className="text-xs text-gray-500 mt-1">File: {formData.signature}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white"
              value={formData.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
