"use client";
import React from 'react';
import { useCustomer } from '@/contexts/CustomerContext';

export const AmeenDriveProfessionDetailsForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  
  // Defensive defaults
  const ameenDrive = customerData?.ameenDrive || {};
  const professionDetails = ameenDrive.professionDetails || {};
  
  // Helper to update profession details
  const handleChange = (field: string, value: any) => {
    updateCustomerData({
      ameenDrive: {
        ...ameenDrive,
        professionDetails: {
          ...professionDetails,
          [field]: value,
        },
      },
    });
  };

  // Helper for prefilled highlighting
  const prefilledFields = new Set(
    Object.entries(professionDetails).filter(([k, v]) => !!v).map(([k]) => k)
  );

  const getFieldClasses = (fieldName: string) => {
    const base = 'w-full border border-gray-300 rounded-xl px-4 py-2';
    const prefilled = 'bg-yellow-50 border-yellow-300';
    const normal = 'bg-white';
    return `${base} ${prefilledFields.has(fieldName) ? prefilled : normal}`;
  };

  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg font-semibold mb-4 p-4 bg-primary text-primary-foreground">7. Profession Details (Self-Employed Professionals)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
        <div>
          <label className="block mb-2 font-medium">Name of Company</label>
          <input 
            type="text" 
            className={getFieldClasses('companyName')} 
            placeholder="Name of Company" 
            value={professionDetails.companyName || ''}
            onChange={(e) => handleChange('companyName', e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Address</label>
          <input 
            type="text" 
            className={getFieldClasses('address')} 
            placeholder="Address" 
            value={professionDetails.address || ''}
            onChange={(e) => handleChange('address', e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Profession</label>
          <div className="flex flex-wrap gap-2">
            {['Architect', 'Chartered Accountant', 'Engineer', 'Doctor', 'Other'].map(profession => (
              <label key={profession} className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="selfEmpProfession"
                  checked={professionDetails.profession === profession}
                  onChange={() => handleChange('profession', profession)}
                /> {profession}
              </label>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block mb-2 font-medium">Type of Business</label>
          <input 
            type="text" 
            className={getFieldClasses('businessType')} 
            placeholder="Type of Business" 
            value={professionDetails.businessType || ''}
            onChange={(e) => handleChange('businessType', e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Years in Business</label>
          <input 
            type="number" 
            className={getFieldClasses('businessYears')} 
            placeholder="Years" 
            value={professionDetails.businessYears || ''}
            onChange={(e) => handleChange('businessYears', e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Nature of Business</label>
          <input 
            type="text" 
            className={getFieldClasses('natureOfBusiness')} 
            placeholder="Nature of Business" 
            value={professionDetails.natureOfBusiness || ''}
            onChange={(e) => handleChange('natureOfBusiness', e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Percentage Shareholding</label>
          <input 
            type="number" 
            className={getFieldClasses('percentShareholding')} 
            placeholder="Percentage" 
            value={professionDetails.percentShareholding || ''}
            onChange={(e) => handleChange('percentShareholding', e.target.value)}
          />
        </div>
      </div>
    </section>
  );
};
