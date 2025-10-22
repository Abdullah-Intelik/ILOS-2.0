"use client";
import React from 'react';
import { useCustomer } from '@/contexts/CustomerContext';

export const AmeenDriveStampsForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  
  // Defensive defaults
  const ameenDrive = customerData?.ameenDrive || {};
  const stamps = ameenDrive.stamps || {};
  
  // Helper to handle file uploads
  const handleFileChange = (field: string, event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        // Store as base64 string
        const base64String = reader.result as string;
        updateCustomerData({
          ameenDrive: {
            ...ameenDrive,
            stamps: {
              ...stamps,
              [field]: base64String,
            },
          },
        });
      };
      
      reader.readAsDataURL(file);
    }
  };

  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg font-semibold mb-4 p-4 bg-primary text-primary-foreground">Dealer and Branch Stamps</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
        <div>
          <label className="block mb-2 font-medium">Dealer Stamp</label>
          <input 
            type="file" 
            className="w-full border border-gray-300 rounded-xl px-4 py-2" 
            onChange={(e) => handleFileChange('dealerStamp', e)}
          />
          {stamps.dealerStamp && (
            <div className="mt-2">
              <p className="text-sm text-green-600">Dealer stamp uploaded ✓</p>
            </div>
          )}
        </div>
        <div>
          <label className="block mb-2 font-medium">Branch Stamp</label>
          <input 
            type="file" 
            className="w-full border border-gray-300 rounded-xl px-4 py-2" 
            onChange={(e) => handleFileChange('branchStamp', e)}
          />
          {stamps.branchStamp && (
            <div className="mt-2">
              <p className="text-sm text-green-600">Branch stamp uploaded ✓</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AmeenDriveStampsForm;