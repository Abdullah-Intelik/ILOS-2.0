"use client";
import React from 'react';
import { useCustomer } from '@/contexts/CustomerContext';

export const AmeenDriveNonTaxPayersForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  
  // Defensive defaults
  const ameenDrive = customerData?.ameenDrive || {};
  const nonTaxPayer = ameenDrive.nonTaxPayer || {};
  
  // Helper to update non-tax payer details
  const handleChange = (field: string, value: any) => {
    updateCustomerData({
      ameenDrive: {
        ...ameenDrive,
        nonTaxPayer: {
          ...nonTaxPayer,
          [field]: value,
        },
      },
    });
  };

  // Helper for file inputs
  const handleFileChange = (field: string, event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        // Store as base64 string
        const base64String = reader.result as string;
        handleChange(field, base64String);
      };
      
      reader.readAsDataURL(file);
    }
  };

  // Helper for prefilled highlighting
  const prefilledFields = new Set(
    Object.entries(nonTaxPayer).filter(([k, v]) => !!v).map(([k]) => k)
  );

  const getFieldClasses = (fieldName: string) => {
    const base = 'w-full border border-gray-300 rounded-xl px-4 py-2';
    const prefilled = 'bg-yellow-50 border-yellow-300';
    const normal = 'bg-white';
    return `${base} ${prefilledFields.has(fieldName) ? prefilled : normal}`;
  };

  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg font-semibold mb-4 p-4 bg-primary text-primary-foreground">12. For Non-Tax Payers Only</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
        <div>
          <label className="block mb-2 font-medium">Full Name (Mr./Mrs./Ms.)</label>
          <input 
            type="text" 
            className={getFieldClasses('fullName')}
            value={nonTaxPayer.fullName || ''}
            onChange={(e) => handleChange('fullName', e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Resident of</label>
          <input 
            type="text" 
            className={getFieldClasses('residentOf')}
            value={nonTaxPayer.residentOf || ''}
            onChange={(e) => handleChange('residentOf', e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={nonTaxPayer.appliedFinancing === true}
                onChange={(e) => handleChange('appliedFinancing', e.target.checked)}
              /> I have applied for financing from UBL Ameen
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={nonTaxPayer.noNTN === true}
                onChange={(e) => handleChange('noNTN', e.target.checked)}
              /> I hereby declare that I do not have a National Income Tax Number
            </label>
          </div>
        </div>
        <div>
          <label className="block mb-2 font-medium">Signature of the Applicant</label>
          <input 
            type="file" 
            className={getFieldClasses('signature')}
            onChange={(e) => handleFileChange('signature', e)}
          />
          {nonTaxPayer.signature && (
            <div className="mt-2">
              <p className="text-sm text-green-600">Signature uploaded ✓</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
