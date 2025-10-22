"use client";
import React from 'react';
import { useCustomer } from '@/contexts/CustomerContext';

export const AmeenDriveOccupationForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  
  // Defensive defaults
  const ameenDrive = customerData?.ameenDrive || {};
  const occupation = ameenDrive.occupation || {};
  
  // Helper to update occupation details
  const handleChange = (field: string, value: any) => {
    updateCustomerData({
      ameenDrive: {
        ...ameenDrive,
        occupation: {
          ...occupation,
          [field]: value,
        },
      },
    });
  };

  // Helper for prefilled highlighting
  const prefilledFields = new Set([
    ...Object.entries(occupation).filter(([k, v]) => !!v).map(([k]) => k)
  ]);

  const getFieldClasses = (fieldName: string) => {
    const base = 'w-full border border-gray-300 rounded-xl px-4 py-2';
    const prefilled = 'bg-yellow-50 border-yellow-300';
    const normal = 'bg-white';
    return `${base} ${prefilledFields.has(fieldName) ? prefilled : normal}`;
  };

  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg font-semibold mb-4 p-4 bg-primary text-primary-foreground">6. Occupation</h3>
      {customerData?.isETB && prefilledFields.size > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-sm text-yellow-800">
            <strong>Note:</strong> Fields highlighted in yellow are pre-filled from your existing customer data. You can edit them if needed.
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
        <div className="md:col-span-3">
          <label className="block mb-2 font-medium">Employment Type</label>
          <input 
            type="text" 
            className={getFieldClasses('type')} 
            placeholder="Employment Type" 
            value={occupation.type || ''} 
            onChange={e => handleChange('type', e.target.value)} 
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Company's Name</label>
          <input 
            type="text" 
            className={getFieldClasses('employerName')} 
            placeholder="Company's Name" 
            value={occupation.employerName || ''} 
            onChange={e => handleChange('employerName', e.target.value)} 
          />
        </div>
        <div className="md:col-span-3">
          <label className="block mb-2 font-medium">Business Type</label>
          <input 
            type="text" 
            className={getFieldClasses('businessType')} 
            placeholder="Business Type" 
            value={occupation.businessType || ''} 
            onChange={e => handleChange('businessType', e.target.value)} 
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Business Type (Other)</label>
          <input 
            type="text" 
            className={getFieldClasses('businessTypeOther')} 
            placeholder="Business Type (Other)" 
            value={occupation.businessTypeOther || ''} 
            onChange={e => handleChange('businessTypeOther', e.target.value)} 
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Employment Status</label>
          <input 
            type="text" 
            className={getFieldClasses('status')} 
            placeholder="Employment Status" 
            value={occupation.status || ''} 
            onChange={e => handleChange('status', e.target.value)} 
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Designation</label>
          <input 
            type="text" 
            className={getFieldClasses('designation')} 
            placeholder="Designation" 
            value={occupation.designation || ''} 
            onChange={e => handleChange('designation', e.target.value)} 
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Department</label>
          <input 
            type="text" 
            className={getFieldClasses('department')} 
            placeholder="Department" 
            value={occupation.department || ''} 
            onChange={e => handleChange('department', e.target.value)} 
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Years in Service</label>
          <input 
            type="number" 
            className={getFieldClasses('serviceYears')} 
            placeholder="Years" 
            value={occupation.serviceYears || ''} 
            onChange={e => handleChange('serviceYears', e.target.value)} 
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Grade</label>
          <input 
            type="text" 
            className={getFieldClasses('grade')} 
            placeholder="Grade" 
            value={occupation.grade || ''} 
            onChange={e => handleChange('grade', e.target.value)} 
          />
        </div>
      </div>
      <div className="mt-8">
        <h4 className="text-lg font-semibold mb-4 text-primary">Business / Employer's Address</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
          <div className="md:col-span-2">
            <label className="block mb-2 font-medium">Employer Address</label>
            <input 
              type="text" 
              className={getFieldClasses('employerAddress')} 
              placeholder="Employer Address" 
              value={occupation.employerAddress || ''} 
              onChange={e => handleChange('employerAddress', e.target.value)} 
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Employer Phone</label>
            <input 
              type="text" 
              className={getFieldClasses('employerPhone')} 
              placeholder="Employer Phone" 
              value={occupation.employerPhone || ''} 
              onChange={e => handleChange('employerPhone', e.target.value)} 
            />
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <h4 className="text-lg font-semibold mb-4 text-primary">Previous Employment</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
          <div>
            <label className="block mb-2 font-medium">Previous Employer</label>
            <input 
              type="text" 
              className={getFieldClasses('previousEmployer')} 
              placeholder="Previous Employer" 
              value={occupation.previousEmployer || ''} 
              onChange={e => handleChange('previousEmployer', e.target.value)} 
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Previous Designation</label>
            <input 
              type="text" 
              className={getFieldClasses('previousDesignation')} 
              placeholder="Previous Designation" 
              value={occupation.previousDesignation || ''} 
              onChange={e => handleChange('previousDesignation', e.target.value)} 
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Previous Experience (Years)</label>
            <input 
              type="number" 
              className={getFieldClasses('previousYears')} 
              placeholder="Years" 
              value={occupation.previousYears || ''} 
              onChange={e => handleChange('previousYears', e.target.value)} 
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Previous Employer Phone</label>
            <input 
              type="text" 
              className={getFieldClasses('previousEmployerPhone')} 
              placeholder="Phone Number" 
              value={occupation.previousEmployerPhone || ''} 
              onChange={e => handleChange('previousEmployerPhone', e.target.value)} 
            />
          </div>
        </div>
      </div>
    </section>
  );
};
