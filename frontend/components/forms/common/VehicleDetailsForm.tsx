"use client";
import React from 'react';
import { useCustomer } from '@/contexts/CustomerContext';

/**
 * VehicleDetailsForm - Vehicle information for Auto/AmeenDrive/SMEASAAN/CommercialVehicle
 * Used by all vehicle financing products
 * 
 * Sections:
 * 1. Vehicle Information (manufacturer, model, year, engine, chassis)
 * 2. Vehicle Pricing (price, down payment)
 * 3. Seller Details (for used vehicles)
 * 4. Dealer Details (for new vehicles)
 * 5. Insurance & Tracking (insurance company, tracker)
 */

interface VehicleDetailsFormProps {
  /** Section number for sequential forms */
  sectionNumber?: number;
  /** Show seller details section (for used vehicles) */
  showSellerDetails?: boolean;
  /** Show dealer details section (for new vehicles) */
  showDealerDetails?: boolean;
  /** Show insurance details */
  showInsurance?: boolean;
  /** Product type for context */
  productType?: 'AUTOLOAN' | 'AMEENDRIVE' | 'SMEASAAN' | 'COMMERCIALVEHICLE';
}

export const VehicleDetailsForm: React.FC<VehicleDetailsFormProps> = ({
  sectionNumber,
  showSellerDetails = true,
  showDealerDetails = true,
  showInsurance = true,
  productType = 'AUTOLOAN'
}) => {
  const { customerData, updateCustomerData } = useCustomer();

  const vehicleDetails = customerData?.vehicleDetails || {};
  const sellerDetails = customerData?.sellerDetails || {};
  const dealerDetails = customerData?.dealerDetails || {};
  const insuranceDetails = customerData?.insuranceDetails || {};

  const handleVehicleChange = (field: string, value: any) => {
    updateCustomerData({
      vehicleDetails: {
        ...vehicleDetails,
        [field]: value,
      },
    });
  };

  const handleSellerChange = (field: string, value: any) => {
    updateCustomerData({
      sellerDetails: {
        ...sellerDetails,
        [field]: value,
      },
    });
  };

  const handleDealerChange = (field: string, value: any) => {
    updateCustomerData({
      dealerDetails: {
        ...dealerDetails,
        [field]: value,
      },
    });
  };

  const handleInsuranceChange = (field: string, value: any) => {
    updateCustomerData({
      insuranceDetails: {
        ...insuranceDetails,
        [field]: value,
      },
    });
  };

  const sectionHeaderNumber = sectionNumber ? `${sectionNumber}. ` : '';

  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-primary text-primary-foreground">
        {sectionHeaderNumber}Vehicle Details
      </h3>

      {/* ==================== SECTION 1: VEHICLE INFORMATION ==================== */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-4 text-gray-700">🚗 Vehicle Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border border-gray-200 rounded-xl p-6 bg-gray-50">
          
          {/* Vehicle Manufacturer */}
          <div>
            <label className="block mb-2 font-medium">Manufacturer *</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
              placeholder="e.g., Toyota, Honda, Suzuki" 
              value={vehicleDetails.manufacturer || ""}
              onChange={(e) => handleVehicleChange('manufacturer', e.target.value)}
            />
          </div>
          
          {/* Vehicle Model */}
          <div>
            <label className="block mb-2 font-medium">Model *</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
              placeholder="e.g., Corolla, Civic, Alto" 
              value={vehicleDetails.model || ""}
              onChange={(e) => handleVehicleChange('model', e.target.value)}
            />
          </div>
          
          {/* Year of Manufacture */}
          <div>
            <label className="block mb-2 font-medium">Year of Manufacture *</label>
            <input 
              type="number" 
              min="1990"
              max={new Date().getFullYear() + 1}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
              placeholder={`e.g., ${new Date().getFullYear()}`}
              value={vehicleDetails.year || ""}
              onChange={(e) => handleVehicleChange('year', e.target.value)}
            />
          </div>
          
          {/* Engine Number */}
          <div>
            <label className="block mb-2 font-medium">Engine Number *</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
              placeholder="Engine Number" 
              value={vehicleDetails.engineNumber || ""}
              onChange={(e) => handleVehicleChange('engineNumber', e.target.value)}
            />
          </div>
          
          {/* Chassis Number */}
          <div>
            <label className="block mb-2 font-medium">Chassis Number *</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
              placeholder="Chassis Number (VIN)" 
              value={vehicleDetails.chassisNumber || ""}
              onChange={(e) => handleVehicleChange('chassisNumber', e.target.value)}
            />
          </div>
          
          {/* Engine Size/CC */}
          <div>
            <label className="block mb-2 font-medium">Engine Size (CC)</label>
            <input 
              type="number" 
              min="0"
              className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
              placeholder="e.g., 1000, 1300, 1800" 
              value={vehicleDetails.engineSize || ""}
              onChange={(e) => handleVehicleChange('engineSize', e.target.value)}
            />
          </div>
          
          {/* Registration Number (if used) */}
          <div>
            <label className="block mb-2 font-medium">Registration Number</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
              placeholder="ABC-123 (Optional)" 
              value={vehicleDetails.registrationNumber || ""}
              onChange={(e) => handleVehicleChange('registrationNumber', e.target.value)}
            />
          </div>
          
          {/* Vehicle Condition */}
          <div className="md:col-span-2">
            <label className="block mb-2 font-medium">Vehicle Condition *</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="vehicleCondition" 
                  value="New"
                  checked={vehicleDetails.condition === 'New'}
                  onChange={(e) => handleVehicleChange('condition', e.target.value)}
                /> 
                New
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="vehicleCondition" 
                  value="Used"
                  checked={vehicleDetails.condition === 'Used'}
                  onChange={(e) => handleVehicleChange('condition', e.target.value)}
                /> 
                Used
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== SECTION 2: VEHICLE PRICING ==================== */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-4 text-gray-700">💰 Pricing Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border border-gray-200 rounded-xl p-6 bg-gray-50">
          
          {/* Vehicle Price */}
          <div>
            <label className="block mb-2 font-medium">Vehicle Price (PKR) *</label>
            <input 
              type="number" 
              min="0"
              className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
              placeholder="Total Vehicle Price" 
              value={vehicleDetails.price || ""}
              onChange={(e) => handleVehicleChange('price', e.target.value)}
            />
          </div>
          
          {/* Down Payment Percentage */}
          <div>
            <label className="block mb-2 font-medium">Down Payment (%)</label>
            <input 
              type="number" 
              min="0"
              max="100"
              className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
              placeholder="e.g., 20" 
              value={vehicleDetails.downPaymentPercent || ""}
              onChange={(e) => handleVehicleChange('downPaymentPercent', e.target.value)}
            />
          </div>
          
          {/* Down Payment Amount */}
          <div>
            <label className="block mb-2 font-medium">Down Payment (PKR)</label>
            <input 
              type="number" 
              min="0"
              className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
              placeholder="Down Payment Amount" 
              value={vehicleDetails.downPaymentAmount || ""}
              onChange={(e) => handleVehicleChange('downPaymentAmount', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ==================== SECTION 3: SELLER DETAILS (Used Vehicles) ==================== */}
      {showSellerDetails && vehicleDetails.condition === 'Used' && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-4 text-gray-700">👤 Seller Details (Used Vehicle)</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border border-gray-200 rounded-xl p-6 bg-yellow-50">
            
            {/* Seller Name */}
            <div>
              <label className="block mb-2 font-medium">Seller Name *</label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
                placeholder="Full Name of Seller" 
                value={sellerDetails.name || ""}
                onChange={(e) => handleSellerChange('name', e.target.value)}
              />
            </div>
            
            {/* Seller CNIC */}
            <div>
              <label className="block mb-2 font-medium">Seller CNIC *</label>
              <input 
                type="text" 
                maxLength={15}
                className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
                placeholder="XXXXX-XXXXXXX-X" 
                value={sellerDetails.cnic || ""}
                onChange={(e) => handleSellerChange('cnic', e.target.value)}
              />
            </div>
            
            {/* Seller Contact */}
            <div>
              <label className="block mb-2 font-medium">Seller Contact *</label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
                placeholder="Mobile Number" 
                value={sellerDetails.contact || ""}
                onChange={(e) => handleSellerChange('contact', e.target.value)}
              />
            </div>
            
            {/* Seller Address */}
            <div className="md:col-span-3">
              <label className="block mb-2 font-medium">Seller Address *</label>
              <textarea 
                rows={2}
                className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
                placeholder="Complete Address" 
                value={sellerDetails.address || ""}
                onChange={(e) => handleSellerChange('address', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* ==================== SECTION 4: DEALER DETAILS (New Vehicles) ==================== */}
      {showDealerDetails && vehicleDetails.condition === 'New' && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-4 text-gray-700">🏢 Dealer Details (New Vehicle)</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border border-gray-200 rounded-xl p-6 bg-blue-50">
            
            {/* Dealer Name */}
            <div>
              <label className="block mb-2 font-medium">Dealer Name *</label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
                placeholder="Dealership Name" 
                value={dealerDetails.name || ""}
                onChange={(e) => handleDealerChange('name', e.target.value)}
              />
            </div>
            
            {/* Dealer Contact */}
            <div>
              <label className="block mb-2 font-medium">Dealer Contact *</label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
                placeholder="Contact Number" 
                value={dealerDetails.contact || ""}
                onChange={(e) => handleDealerChange('contact', e.target.value)}
              />
            </div>
            
            {/* Dealer Email */}
            <div>
              <label className="block mb-2 font-medium">Dealer Email</label>
              <input 
                type="email" 
                className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
                placeholder="Email (Optional)" 
                value={dealerDetails.email || ""}
                onChange={(e) => handleDealerChange('email', e.target.value)}
              />
            </div>
            
            {/* Dealer Address */}
            <div className="md:col-span-3">
              <label className="block mb-2 font-medium">Dealer Address *</label>
              <textarea 
                rows={2}
                className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
                placeholder="Complete Address" 
                value={dealerDetails.address || ""}
                onChange={(e) => handleDealerChange('address', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* ==================== SECTION 5: INSURANCE & TRACKING ==================== */}
      {showInsurance && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-4 text-gray-700">🛡️ Insurance & Tracking</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 bg-gray-50">
            
            {/* Insurance Company */}
            <div>
              <label className="block mb-2 font-medium">Insurance Company {productType === 'AMEENDRIVE' ? '(Takaful) *' : '*'}</label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
                placeholder={productType === 'AMEENDRIVE' ? 'Takaful Company Name' : 'Insurance Company Name'}
                value={insuranceDetails.companyName || ""}
                onChange={(e) => handleInsuranceChange('companyName', e.target.value)}
              />
            </div>
            
            {/* Tracker Company */}
            <div>
              <label className="block mb-2 font-medium">Tracker Company</label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
                placeholder="GPS Tracker Company (Optional)" 
                value={insuranceDetails.trackerCompany || ""}
                onChange={(e) => handleInsuranceChange('trackerCompany', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="text-sm text-blue-800">
          <strong>💡 Tip:</strong> Ensure all vehicle details match the original documents. Discrepancies may delay processing.
        </div>
      </div>
    </section>
  );
};

