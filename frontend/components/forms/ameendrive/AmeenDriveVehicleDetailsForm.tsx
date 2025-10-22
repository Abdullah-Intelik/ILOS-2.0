"use client";
import React from 'react';
import { useCustomer } from '@/contexts/CustomerContext';

export const AmeenDriveVehicleDetailsForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  
  // Defensive defaults
  const ameenDrive = customerData?.ameenDrive || {};
  const vehicleDetails = ameenDrive.vehicleDetails || {};
  
  // Helper to update vehicle details
  const handleChange = (field: string, value: any) => {
    updateCustomerData({
      ameenDrive: {
        ...ameenDrive,
        vehicleDetails: {
          ...vehicleDetails,
          [field]: value,
        },
      },
    });
  };

  // Helper for prefilled highlighting
  const prefilledFields = new Set(
    Object.entries(vehicleDetails).filter(([k, v]) => !!v).map(([k]) => k)
  );

  const getFieldClasses = (fieldName: string) => {
    const base = 'w-full border border-gray-300 rounded-xl px-4 py-2';
    const prefilled = 'bg-yellow-50 border-yellow-300';
    const normal = 'bg-white';
    return `${base} ${prefilledFields.has(fieldName) ? prefilled : normal}`;
  };

  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg  font-semibold mb-4 p-4 bg-primary text-primary-foreground">2. Vehicle Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
        <div>
          <label className="block mb-2 font-medium">Manufacturer</label>
          <input 
            type="text" 
            className={getFieldClasses('manufacturer')} 
            placeholder="Manufacturer" 
            value={vehicleDetails.manufacturer || ""}
            onChange={(e) => handleChange('manufacturer', e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Model</label>
          <input 
            type="text" 
            className={getFieldClasses('model')} 
            placeholder="Model" 
            value={vehicleDetails.model || ""}
            onChange={(e) => handleChange('model', e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Year of Manufacture</label>
          <input 
            type="number" 
            className={getFieldClasses('year')} 
            placeholder="Year" 
            value={vehicleDetails.year || ""}
            onChange={(e) => handleChange('year', e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Vehicle Class / Engine Size</label>
          <input 
            type="text" 
            className={getFieldClasses('engineSize')} 
            placeholder="Class / Engine Size" 
            value={vehicleDetails.engineSize || ""}
            onChange={(e) => handleChange('engineSize', e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Price / Value (Rs.)</label>
          <input 
            type="number" 
            className={getFieldClasses('price')} 
            placeholder="Price / Value" 
            value={vehicleDetails.price || ""}
            onChange={(e) => handleChange('price', e.target.value)}
          />
        </div>
      </div>
      <div className="border-t mt-8 pt-6">
        <h4 className="text-lg font-semibold mb-4">Used Car Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
          <div>
            <label className="block mb-2 font-medium">Seller Name</label>
            <input 
              type="text" 
              className={getFieldClasses('usedSellerName')} 
              placeholder="Seller Name" 
              value={vehicleDetails.usedSellerName || ""}
              onChange={(e) => handleChange('usedSellerName', e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Seller CNIC No.</label>
            <input 
              type="text" 
              className={getFieldClasses('usedSellerCnic')} 
              placeholder="CNIC" 
              value={vehicleDetails.usedSellerCnic || ""}
              onChange={(e) => handleChange('usedSellerCnic', e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">House / Flat No.</label>
            <input 
              type="text" 
              className={getFieldClasses('usedHouseNo')} 
              placeholder="House / Flat No." 
              value={vehicleDetails.usedHouseNo || ""}
              onChange={(e) => handleChange('usedHouseNo', e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Street</label>
            <input 
              type="text" 
              className={getFieldClasses('usedStreet')} 
              placeholder="Street" 
              value={vehicleDetails.usedStreet || ""}
              onChange={(e) => handleChange('usedStreet', e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Tehsil / District / Area</label>
            <input 
              type="text" 
              className={getFieldClasses('usedArea')} 
              placeholder="Tehsil / District / Area" 
              value={vehicleDetails.usedArea || ""}
              onChange={(e) => handleChange('usedArea', e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Nearest Landmark</label>
            <input 
              type="text" 
              className={getFieldClasses('usedLandmark')} 
              placeholder="Nearest Landmark" 
              value={vehicleDetails.usedLandmark || ""}
              onChange={(e) => handleChange('usedLandmark', e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">City</label>
            <input 
              type="text" 
              className={getFieldClasses('usedCity')} 
              placeholder="City" 
              value={vehicleDetails.usedCity || ""}
              onChange={(e) => handleChange('usedCity', e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Country</label>
            <input 
              type="text" 
              className={getFieldClasses('usedCountry')} 
              placeholder="Country" 
              value={vehicleDetails.usedCountry || ""}
              onChange={(e) => handleChange('usedCountry', e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Postal Code</label>
            <input 
              type="text" 
              className={getFieldClasses('usedPostalCode')} 
              placeholder="Postal Code" 
              value={vehicleDetails.usedPostalCode || ""}
              onChange={(e) => handleChange('usedPostalCode', e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Contact No.</label>
            <input 
              type="text" 
              className={getFieldClasses('usedContactNo')} 
              placeholder="Contact No." 
              value={vehicleDetails.usedContactNo || ""}
              onChange={(e) => handleChange('usedContactNo', e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Bank</label>
            <input 
              type="text" 
              className={getFieldClasses('usedBank')} 
              placeholder="Bank" 
              value={vehicleDetails.usedBank || ""}
              onChange={(e) => handleChange('usedBank', e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Branch</label>
            <input 
              type="text" 
              className={getFieldClasses('usedBranch')} 
              placeholder="Branch" 
              value={vehicleDetails.usedBranch || ""}
              onChange={(e) => handleChange('usedBranch', e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Account No.</label>
            <input 
              type="text" 
              className={getFieldClasses('usedAccountNo')} 
              placeholder="Account No." 
              value={vehicleDetails.usedAccountNo || ""}
              onChange={(e) => handleChange('usedAccountNo', e.target.value)}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
