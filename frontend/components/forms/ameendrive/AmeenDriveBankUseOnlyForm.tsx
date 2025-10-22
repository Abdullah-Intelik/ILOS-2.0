"use client";
import React from 'react';
import { useCustomer } from '@/contexts/CustomerContext';

export const AmeenDriveBankUseOnlyForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  
  // Defensive defaults
  const ameenDrive = customerData?.ameenDrive || {};
  const bankUseOnly = ameenDrive.bankUseOnly || {};
  
  // Helper to update bank use only fields
  const handleChange = (field: string, value: any) => {
    updateCustomerData({
      ameenDrive: {
        ...ameenDrive,
        bankUseOnly: {
          ...bankUseOnly,
          [field]: value,
        },
      },
    });
  };

  // Helper for prefilled highlighting
  const prefilledFields = new Set(
    Object.entries(bankUseOnly).filter(([k, v]) => !!v).map(([k]) => k)
  );

  const getFieldClasses = (fieldName: string) => {
    const base = 'w-full border border-gray-300 rounded-xl px-4 py-2';
    const prefilled = 'bg-yellow-50 border-yellow-300';
    const normal = 'bg-white';
    return `${base} ${prefilledFields.has(fieldName) ? prefilled : normal}`;
  };

  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg font-semibold mb-4 p-4 bg-primary text-primary-foreground">11. For UBL Ameen Use Only</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
        <div>
          <label className="block mb-2 font-medium">Channel Code</label>
          <input 
            type="text" 
            className={getFieldClasses('channelCode')}
            value={bankUseOnly.channelCode || ''}
            onChange={(e) => handleChange('channelCode', e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">PB/SO employee No.</label>
          <input 
            type="text" 
            className={getFieldClasses('pbEmployeeNo')}
            value={bankUseOnly.pbEmployeeNo || ''}
            onChange={(e) => handleChange('pbEmployeeNo', e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Program Code</label>
          <input 
            type="text" 
            className={getFieldClasses('programCode')}
            value={bankUseOnly.programCode || ''}
            onChange={(e) => handleChange('programCode', e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Referral ID</label>
          <input 
            type="text" 
            className={getFieldClasses('referralId')}
            value={bankUseOnly.referralId || ''}
            onChange={(e) => handleChange('referralId', e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Branch Code</label>
          <input 
            type="text" 
            className={getFieldClasses('branchCode')}
            value={bankUseOnly.branchCode || ''}
            onChange={(e) => handleChange('branchCode', e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">SM employee No.</label>
          <input 
            type="text" 
            className={getFieldClasses('smEmployeeNo')}
            value={bankUseOnly.smEmployeeNo || ''}
            onChange={(e) => handleChange('smEmployeeNo', e.target.value)}
          />
        </div>
        <div className="md:col-span-3">
          <label className="block mb-2 font-medium">Application Source</label>
          <div className="flex gap-4">
            {['Branch', 'Dealer', 'TSF', 'DSF'].map(source => (
              <label key={source} className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="applicationSource"
                  checked={bankUseOnly.applicationSource === source}
                  onChange={() => handleChange('applicationSource', source)}
                /> {source}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block mb-2 font-medium">Branch Name & Code</label>
          <input 
            type="text" 
            className={getFieldClasses('branchNameCode')}
            value={bankUseOnly.branchNameCode || ''}
            onChange={(e) => handleChange('branchNameCode', e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Dealership Name</label>
          <input 
            type="text" 
            className={getFieldClasses('dealershipName')}
            value={bankUseOnly.dealershipName || ''}
            onChange={(e) => handleChange('dealershipName', e.target.value)}
          />
        </div>
      </div>
    </section>
  );
};
