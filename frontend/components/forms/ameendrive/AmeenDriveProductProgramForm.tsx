"use client";
import React from 'react';
import { useCustomer } from '@/contexts/CustomerContext';

export const AmeenDriveProductProgramForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  
  // Defensive defaults
  const ameenDrive = customerData?.ameenDrive || {};
  const productProgram = ameenDrive.productProgram || {};
  const addressDetails = customerData?.addressDetails || {};
  const currentAddress = addressDetails.currentAddress || {};
  
  // Helper to update product program details
  const handleChange = (field: string, value: any) => {
    updateCustomerData({
      ameenDrive: {
        ...ameenDrive,
        productProgram: {
          ...productProgram,
          [field]: value,
        },
      },
    });
  };

  // Helper for prefilled highlighting
  const prefilledFields = new Set(
    Object.entries(productProgram).filter(([k, v]) => !!v).map(([k]) => k)
  );

  const getFieldClasses = (fieldName: string) => {
    const base = 'w-full border border-gray-300 rounded-xl px-4 py-2';
    const prefilled = 'bg-yellow-50 border-yellow-300';
    const normal = 'bg-white';
    return `${base} ${prefilledFields.has(fieldName) ? prefilled : normal}`;
  };

  return (
    <section className="mb-10">
      <h3 className="text-2xl text-white font-semibold mb-4 p-4 rounded-lg bg-primary text-primary-foreground">1. Product Program</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
        <div>
          <label className="block mb-2 font-medium">City</label>
          <input 
            type="text" 
            className={getFieldClasses('city')} 
            placeholder="City" 
            value={currentAddress.city || ""} 
            onChange={(e) => updateCustomerData({
              addressDetails: {
                ...addressDetails,
                currentAddress: {
                  ...currentAddress,
                  city: e.target.value
                }
              }
            })}
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Auto Application ID</label>
          <input 
            type="text" 
            className={getFieldClasses('autoApplicationId')} 
            placeholder="Auto Application ID" 
            value={ameenDrive.autoApplicationId || ""} 
            onChange={(e) => updateCustomerData({
              ameenDrive: {
                ...ameenDrive,
                autoApplicationId: e.target.value
              }
            })}
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Product Type</label>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="productType" 
                checked={productProgram.productType === 'New Car'} 
                onChange={() => handleChange('productType', 'New Car')} 
              /> New Car
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="productType" 
                checked={productProgram.productType === 'Used Car (Local)'} 
                onChange={() => handleChange('productType', 'Used Car (Local)')} 
              /> Used Car (Local)
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="productType" 
                checked={productProgram.productType === 'Used Car (Imported)'} 
                onChange={() => handleChange('productType', 'Used Car (Imported)')} 
              /> Used Car (Imported)
            </label>
          </div>
        </div>
        <div>
          <label className="block mb-2 font-medium">Pricing Plan</label>
          <label className="flex items-center gap-2">
            <input 
              type="radio" 
              name="pricingPlan" 
              checked={productProgram.programType === 'Floating Rate'} 
              onChange={() => handleChange('programType', 'Floating Rate')} 
            /> Floating Rate
          </label>
        </div>
        <div>
          <label className="block mb-2 font-medium">Payment Mode</label>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="paymentMode" 
                checked={productProgram.paymentMode === 'POA (Manufacturer)'} 
                onChange={() => handleChange('paymentMode', 'POA (Manufacturer)')} 
              /> POA (Manufacturer)
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="paymentMode" 
                checked={productProgram.paymentMode === 'POD (Dealer)'} 
                onChange={() => handleChange('paymentMode', 'POD (Dealer)')} 
              /> POD (Dealer)
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="paymentMode" 
                checked={productProgram.paymentMode === 'POD (Used)'} 
                onChange={() => handleChange('paymentMode', 'POD (Used)')} 
              /> POD (Used)
            </label>
          </div>
        </div>
        <div>
          <label className="block mb-2 font-medium">Current Rate</label>
          <div className="flex gap-2">
            <input 
              type="number" 
              className={getFieldClasses('currentRateKibor')} 
              placeholder="KIBOR" 
              value={productProgram.currentRateKibor || ""} 
              onChange={(e) => handleChange('currentRateKibor', e.target.value)} 
            />
            <span className="self-center">+</span>
            <input 
              type="number" 
              className={getFieldClasses('currentRateSpread')} 
              placeholder="Spread (%)" 
              value={productProgram.currentRateSpread || ""} 
              onChange={(e) => handleChange('currentRateSpread', e.target.value)} 
            />
          </div>
        </div>
        <div>
          <label className="block mb-2 font-medium">Co-Applicant Case</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="coApplicant" 
                checked={productProgram.coApplicantCase === "Yes"} 
                onChange={() => handleChange('coApplicantCase', 'Yes')} 
              /> Yes
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="coApplicant" 
                checked={productProgram.coApplicantCase === "No"} 
                onChange={() => handleChange('coApplicantCase', 'No')} 
              /> No
            </label>
          </div>
        </div>
        {/* Only show if Yes is selected */}
        {productProgram.coApplicantCase === "Yes" && (
          <>
            <div>
              <label className="block mb-2 font-medium">Co-Applicant Name</label>
              <input 
                type="text" 
                className={getFieldClasses('coApplicantName')} 
                placeholder="Name" 
                value={productProgram.coApplicantName || ""} 
                onChange={(e) => handleChange('coApplicantName', e.target.value)} 
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">Relationship (Spouse Only)</label>
              <input 
                type="text" 
                className={getFieldClasses('coApplicantRelationship')} 
                placeholder="Relationship" 
                value={productProgram.coApplicantRelationship || ""} 
                onChange={(e) => handleChange('coApplicantRelationship', e.target.value)} 
              />
            </div>
          </>
        )}
      </div>
    </section>
  );
};
