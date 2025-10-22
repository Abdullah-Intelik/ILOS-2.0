// components/forms/Platinum/PlatinumNextOfKinForm.tsx
"use client";
import { useCustomer } from "@/contexts/CustomerContext";
import { PlatinumCustomerData } from "@/types/platinum-types";
import { useEffect, useRef, useState } from "react";

export const PlatinumNextOfKinForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  const typedCustomerData = customerData as unknown as PlatinumCustomerData;
  const [formData, setFormData] = useState({
    name: "",
    relationship: "",
    contactNumber: "",
    alternateNumber: "",
    address: ""
  });

  // Use refs to prevent infinite update loops
  const isInitialized = useRef(false);
  const skipNextUpdate = useRef(false);
  const isFirstRender = useRef(true);

  // Initialize form with data from context (runs once)
  useEffect(() => {
    if (isInitialized.current) return;
    
    const nextOfKin = typedCustomerData?.nextOfKin || {};
    
    setFormData(prev => ({
      ...prev,
      name: nextOfKin.name || nextOfKin.fullName || prev.name,
      relationship: nextOfKin.relationship || prev.relationship,
      contactNumber: nextOfKin.contactNumber || nextOfKin.telephone || prev.contactNumber,
      alternateNumber: nextOfKin.alternateNumber || prev.alternateNumber,
      address: nextOfKin.address || prev.address
    }));
    
    isInitialized.current = true;
  }, []);

  // Save form data to context when user makes changes
  const saveToContext = () => {
    if (skipNextUpdate.current || !isInitialized.current) return;
    
    skipNextUpdate.current = true;
    
    updateCustomerData({
      nextOfKin: {
        ...(typedCustomerData?.nextOfKin || {}),
        name: formData.name,
        fullName: formData.name,
        relationship: formData.relationship,
        contactNumber: formData.contactNumber,
        telephone: formData.contactNumber,
        alternateNumber: formData.alternateNumber,
        address: formData.address
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

  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-primary text-primary-foreground">2. Next of Kin Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white"
            placeholder="Next of Kin Name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Relationship</label>
          <select
            className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white"
            value={formData.relationship}
            onChange={(e) => handleInputChange("relationship", e.target.value)}
          >
            <option value="">Select Relationship</option>
            <option value="Father">Father</option>
            <option value="Mother">Mother</option>
            <option value="Spouse">Spouse</option>
            <option value="Brother">Brother</option>
            <option value="Sister">Sister</option>
            <option value="Son">Son</option>
            <option value="Daughter">Daughter</option>
            <option value="Friend">Friend</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Contact Number</label>
          <input
            type="text"
            className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white"
            placeholder="03XX-XXXXXXX"
            value={formData.contactNumber}
            onChange={(e) => handleInputChange("contactNumber", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Alternate Number (Optional)</label>
          <input
            type="text"
            className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white"
            placeholder="Alternate Number"
            value={formData.alternateNumber}
            onChange={(e) => handleInputChange("alternateNumber", e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Address</label>
          <textarea
            className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white"
            rows={3}
            placeholder="Full Address"
            value={formData.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
          ></textarea>
        </div>
      </div>
    </section>
  );
};
