// components/forms/Platinum/PlatinumReferenceForm.tsx
"use client";
import { useCustomer } from "@/contexts/CustomerContext";
import { PlatinumCustomerData } from "@/types/platinum-types";
import { useEffect, useRef, useState } from "react";

export const PlatinumReferenceForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  const typedCustomerData = customerData as unknown as PlatinumCustomerData;
  const [formData, setFormData] = useState({
    name: "",
    relationship: "",
    nic: "",
    address: "",
    phones: "",
    ntn: ""
  });

  // Use refs to prevent infinite update loops
  const isInitialized = useRef(false);
  const skipNextUpdate = useRef(false);
  const isFirstRender = useRef(true);

  // Initialize form with data from context (runs once)
  useEffect(() => {
    if (isInitialized.current) return;
    
    // Try to load first reference from array, if it exists
    // TypeScript is complaining that references doesn't exist on PlatinumCustomerData
    // but we know it does via the 'as any' cast
    const references = ((typedCustomerData as any)?.references) || [];
    const reference = references[0] || {};
    
    setFormData(prev => ({
      ...prev,
      name: reference.name || prev.name,
      relationship: reference.relationship || prev.relationship,
      nic: reference.nic || prev.nic,
      address: reference.address || prev.address,
      phones: reference.phones || prev.phones,
      ntn: reference.ntn || prev.ntn
    }));
    
    isInitialized.current = true;
  }, [typedCustomerData]);

  // Save form data to context when user makes changes
  const saveToContext = () => {
    if (skipNextUpdate.current || !isInitialized.current) return;
    
    skipNextUpdate.current = true;
    
    // Create a reference object that matches the backend schema
    const referenceData = {
      name: formData.name,
      relationship: formData.relationship,
      nic: formData.nic,
      address: formData.address,
      phones: formData.phones,
      ntn: formData.ntn
    };
    
    // Update the references array in the context
    // If we have data, add it as the first reference, otherwise use empty array
    const hasReferenceData = Object.values(formData).some(val => val !== "");
    
    // Make sure we're updating with the correct structure - this is what the handleSubmit 
    // in platinum-credit-card/page.tsx expects to find
    const references = hasReferenceData ? [referenceData] : [];
    
    updateCustomerData({
      references: references
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

  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-primary text-primary-foreground">7. Reference Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
        <div>
          <label className="block text-sm font-medium mb-1">Reference Name</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2" 
            placeholder="Reference Name" 
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Relationship</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2" 
            placeholder="Relationship" 
            value={formData.relationship}
            onChange={(e) => handleInputChange("relationship", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">NIC</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2" 
            placeholder="NIC" 
            value={formData.nic}
            onChange={(e) => handleInputChange("nic", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Address (Street, Area, City)</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2" 
            placeholder="Street, Area, City" 
            value={formData.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phones</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2" 
            placeholder="Phones" 
            value={formData.phones}
            onChange={(e) => handleInputChange("phones", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">NTN</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2" 
            placeholder="NTN" 
            value={formData.ntn}
            onChange={(e) => handleInputChange("ntn", e.target.value)}
          />
        </div>
      </div>
    </section>
  );
};
