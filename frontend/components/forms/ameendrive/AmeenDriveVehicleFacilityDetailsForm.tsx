"use client";
import React from 'react';
import { useCustomer } from '@/contexts/CustomerContext';

export const AmeenDriveVehicleFacilityDetailsForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  
  // Defensive defaults
  const ameenDrive = customerData?.ameenDrive || {};
  const vehicleFacilityDetails = ameenDrive.vehicleFacilityDetails || {};
  
  // Helper to update vehicle facility details
  const handleChange = (field: string, value: any) => {
    updateCustomerData({
      ameenDrive: {
        ...ameenDrive,
        vehicleFacilityDetails: {
          ...vehicleFacilityDetails,
          [field]: value,
        },
      },
    });
  };

  // Helper for prefilled highlighting
  const prefilledFields = new Set(
    Object.entries(vehicleFacilityDetails).filter(([k, v]) => !!v).map(([k]) => k)
  );

  const getFieldClasses = (fieldName: string) => {
    const base = 'w-full border border-gray-300 rounded-xl px-4 py-2';
    const prefilled = 'bg-yellow-50 border-yellow-300';
    const normal = 'bg-white';
    return `${base} ${prefilledFields.has(fieldName) ? prefilled : normal}`;
  };

  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg font-semibold mb-4 p-4 bg-primary text-primary-foreground">4. Vehicle Facility Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
        <div className="md:col-span-3">
          <label className="block mb-2 font-medium">Facility Type</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="facilityType" 
                checked={vehicleFacilityDetails.facilityType === 'Diminishing Musharakah'}
                onChange={() => handleChange('facilityType', 'Diminishing Musharakah')}
              /> Diminishing Musharakah
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="facilityType" 
                checked={vehicleFacilityDetails.facilityType === 'Ijarah'}
                onChange={() => handleChange('facilityType', 'Ijarah')}
              /> Ijarah
            </label>
          </div>
        </div>
        <div>
          <label className="block mb-2 font-medium">Musharakah Share/Security Deposit (%)</label>
          <input 
            type="number" 
            className={getFieldClasses('musharakahSharePercent')}
            placeholder="%" 
            value={vehicleFacilityDetails.musharakahSharePercent || ''}
            onChange={e => handleChange('musharakahSharePercent', e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Musharakah Share/Security Deposit (Rs)</label>
          <input 
            type="number" 
            className={getFieldClasses('musharakahShareAmount')}
            placeholder="Rs" 
            value={vehicleFacilityDetails.musharakahShareAmount || ''}
            onChange={e => handleChange('musharakahShareAmount', e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Auto Financing Required (%)</label>
          <input 
            type="number" 
            className={getFieldClasses('autoFinancingPercent')}
            placeholder="%" 
            value={vehicleFacilityDetails.autoFinancingPercent || ''}
            onChange={e => handleChange('autoFinancingPercent', e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Auto Financing Required (Rs)</label>
          <input 
            type="number" 
            className={getFieldClasses('autoFinancingAmount')}
            placeholder="Rs" 
            value={vehicleFacilityDetails.autoFinancingAmount || ''}
            onChange={e => handleChange('autoFinancingAmount', e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Monthly Rental (Rs.)</label>
          <input 
            type="number" 
            className={getFieldClasses('monthlyRental')}
            placeholder="Monthly Rental Rs." 
            value={vehicleFacilityDetails.monthlyRental || ''}
            onChange={e => handleChange('monthlyRental', e.target.value)}
          />
        </div>
        <div className="md:col-span-3">
          <label className="block mb-2 font-medium">Monthly Rental Rs. (in words)</label>
          <input 
            type="text" 
            className={getFieldClasses('monthlyRentalInWords')}
            placeholder="Monthly Rental in Words" 
            value={vehicleFacilityDetails.monthlyRentalInWords || ''}
            onChange={e => handleChange('monthlyRentalInWords', e.target.value)}
          />
        </div>
        {/* Period Options */}
        <div className="md:col-span-3">
          <label className="block mb-2 font-medium">Period (Loan Duration)</label>
          <div className="flex flex-wrap gap-3">
            {[1,2,3,4,5,6,7].map(year => (
              <label key={year} className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="loanDuration" 
                  checked={vehicleFacilityDetails.loanPeriod === year}
                  onChange={() => handleChange('loanPeriod', year)}
                /> {year} Year{year > 1 && "s"}
              </label>
            ))}
          </div>
        </div>
        {/* Delivery Options */}
        <div>
          <label className="block mb-2 font-medium">Delivery of Vehicle</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="delivery" 
                checked={vehicleFacilityDetails.deliveryOption === 'Immediate'}
                onChange={() => handleChange('deliveryOption', 'Immediate')}
              /> Immediate
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="delivery" 
                checked={vehicleFacilityDetails.deliveryOption === 'Booking'}
                onChange={() => handleChange('deliveryOption', 'Booking')}
              /> Booking
            </label>
          </div>
        </div>
        {/* Agreement Statement */}
        <div>
          <label className="block mb-2 font-medium">Agreement Understanding</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="agreementUnderstanding" 
                checked={vehicleFacilityDetails.agreementUnderstanding === 'Yes'}
                onChange={() => handleChange('agreementUnderstanding', 'Yes')}
              /> Yes
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="agreementUnderstanding" 
                checked={vehicleFacilityDetails.agreementUnderstanding === 'No'}
                onChange={() => handleChange('agreementUnderstanding', 'No')}
              /> No
            </label>
          </div>
        </div>
      </div>
    </section>
  );
};
