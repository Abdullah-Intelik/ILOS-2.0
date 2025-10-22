"use client";
import React from 'react';
import { useCustomer } from '@/contexts/CustomerContext';

export const AmeenDriveTakafulDetailsForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  
  // Defensive defaults
  const ameenDrive = customerData?.ameenDrive || {};
  const takafulDetails = ameenDrive.takafulDetails || {};
  
  // Helper to update takaful details
  const handleChange = (field: string, value: any) => {
    updateCustomerData({
      ameenDrive: {
        ...ameenDrive,
        takafulDetails: {
          ...takafulDetails,
          [field]: value,
        },
      },
    });
  };

  // Helper for prefilled highlighting
  const prefilledFields = new Set(
    Object.entries(takafulDetails).filter(([k, v]) => !!v).map(([k]) => k)
  );

  const getFieldClasses = (fieldName: string) => {
    const base = 'w-full border border-gray-300 rounded-xl px-4 py-2';
    const prefilled = 'bg-yellow-50 border-yellow-300';
    const normal = 'bg-white';
    return `${base} ${prefilledFields.has(fieldName) ? prefilled : normal}`;
  };

  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg font-semibold mb-4 p-4 bg-primary text-primary-foreground">3. Takaful Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
        <div>
          <label className="block mb-2 font-medium">Takaful Company Name</label>
          <input 
            type="text" 
            className={getFieldClasses('company')} 
            placeholder="Takaful Company Name" 
            value={takafulDetails.company || ""}
            onChange={(e) => handleChange('company', e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Takaful Rate (%)</label>
          <input 
            type="number" 
            className={getFieldClasses('rate')} 
            placeholder="Takaful Rate (%)" 
            value={takafulDetails.rate || ""}
            onChange={(e) => handleChange('rate', e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Tracker Company to be arranged</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="trackerCompany" 
                checked={takafulDetails.trackerCompanyArranged === "Yes"}
                onChange={() => handleChange('trackerCompanyArranged', 'Yes')}
              /> Yes
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="trackerCompany" 
                checked={takafulDetails.trackerCompanyArranged === "No"}
                onChange={() => handleChange('trackerCompanyArranged', 'No')}
              /> No
            </label>
          </div>
        </div>
      </div>
    </section>
  );
};
