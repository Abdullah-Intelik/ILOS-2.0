// components/forms/Platinum/PlatinumAddressDetailsForm.tsx
"use client";
import { useCustomer } from "@/contexts/CustomerContext";
import { PlatinumCustomerData } from "@/types/platinum-types";
import { useEffect, useRef, useState } from "react";

export const PlatinumAddressDetailsForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  const typedCustomerData = customerData as unknown as PlatinumCustomerData;
  const [formData, setFormData] = useState({
    // Current address
    currHouse: "",
    currStreet: "",
    currTehsil: "",
    currLandmark: "",
    currCity: "",
    currPostalCode: "",
    residentialPhone: "",
    residenceType: "",
    residingSince: "",
    // Permanent address
    sameAsCurrent: true,
    permAddress: "",
    permStreet: "",
    permDistrict: "",
    permLandmark: "",
    permCity: "",
    permPostalCode: ""
  });

  // Use refs to prevent infinite update loops
  const isInitialized = useRef(false);
  const skipNextUpdate = useRef(false);
  const isFirstRender = useRef(true);

  // Initialize form with data from context (runs once)
  useEffect(() => {
    if (isInitialized.current) return;
    
    const addressDetails = typedCustomerData?.addressDetails || {};
    const currentAddress = addressDetails?.currentAddress || {};
    const permanentAddress = addressDetails?.permanentAddress || {};
    
    setFormData(prev => ({
      ...prev,
      currHouse: currentAddress.houseNo || prev.currHouse,
      currStreet: currentAddress.street || prev.currStreet,
      currTehsil: currentAddress.tehsil || prev.currTehsil,
      currLandmark: currentAddress.nearestLandmark || prev.currLandmark,
      currCity: currentAddress.city || prev.currCity,
      currPostalCode: currentAddress.postalCode || prev.currPostalCode,
      residentialPhone: currentAddress.telephone || prev.residentialPhone,
      residenceType: currentAddress.residentialStatus || prev.residenceType,
      residingSince: currentAddress.yearsAtAddress || prev.residingSince,
      permAddress: permanentAddress.fullAddress || prev.permAddress,
      permStreet: permanentAddress.street || prev.permStreet,
      permDistrict: permanentAddress.tehsil || prev.permDistrict,
      permLandmark: permanentAddress.nearestLandmark || prev.permLandmark,
      permCity: permanentAddress.city || prev.permCity,
      permPostalCode: permanentAddress.postalCode || prev.permPostalCode,
      // If permanent address is not set, assume it's the same as current
      sameAsCurrent: !permanentAddress.fullAddress && !permanentAddress.city
    }));
    
    isInitialized.current = true;
  }, []);

  // Save form data to context when user makes changes
  const saveToContext = () => {
    if (skipNextUpdate.current || !isInitialized.current) return;
    
    skipNextUpdate.current = true;
    
    // Create the current address full string
    const currentFullAddress = `${formData.currHouse} ${formData.currStreet}, ${formData.currTehsil}, ${formData.currCity}`.replace(/\s+/g, ' ').trim();
    
    // For permanent address, use current if sameAsCurrent is true
    const permanentFullAddress = formData.sameAsCurrent
      ? currentFullAddress
      : formData.permAddress || `${formData.permStreet}, ${formData.permDistrict}, ${formData.permCity}`.replace(/\s+/g, ' ').trim();
    
    updateCustomerData({
      addressDetails: {
        ...(typedCustomerData?.addressDetails || {}),
        currentAddress: {
          ...(typedCustomerData?.addressDetails?.currentAddress || {}),
          houseNo: formData.currHouse,
          street: formData.currStreet,
          tehsil: formData.currTehsil,
          nearestLandmark: formData.currLandmark,
          city: formData.currCity,
          postalCode: formData.currPostalCode,
          telephone: formData.residentialPhone,
          residentialStatus: formData.residenceType,
          yearsAtAddress: formData.residingSince,
          fullAddress: currentFullAddress
        },
        permanentAddress: {
          ...(typedCustomerData?.addressDetails?.permanentAddress || {}),
          fullAddress: permanentFullAddress,
          street: formData.sameAsCurrent ? formData.currStreet : formData.permStreet,
          tehsil: formData.sameAsCurrent ? formData.currTehsil : formData.permDistrict,
          nearestLandmark: formData.sameAsCurrent ? formData.currLandmark : formData.permLandmark,
          city: formData.sameAsCurrent ? formData.currCity : formData.permCity,
          postalCode: formData.sameAsCurrent ? formData.currPostalCode : formData.permPostalCode
        }
      }
    } as unknown as Partial<any>);
    
    // Reset the flag after a short delay
    setTimeout(() => {
      skipNextUpdate.current = false;
    }, 50);
  };

  // Handle initial render - don't update context on first render
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    saveToContext();
  }, [formData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-blue-500">3. Address Details</h3>
      
      {/* Current Address */}
      <div className="mb-6">
        <h4 className="text-xl font-semibold mb-2">Current Address</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border border-gray-200 rounded-xl p-6 bg-gray-50">
          <div>
            <label className="block text-sm font-medium mb-1">House/Flat No.</label>
            <input
              type="text"
              className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white"
              placeholder="House/Flat No."
              value={formData.currHouse}
              onChange={(e) => handleInputChange("currHouse", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Street</label>
            <input
              type="text"
              className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white"
              placeholder="Street"
              value={formData.currStreet}
              onChange={(e) => handleInputChange("currStreet", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tehsil/Area</label>
            <input
              type="text"
              className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white"
              placeholder="Tehsil/Area"
              value={formData.currTehsil}
              onChange={(e) => handleInputChange("currTehsil", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nearest Landmark</label>
            <input
              type="text"
              className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white"
              placeholder="Landmark"
              value={formData.currLandmark}
              onChange={(e) => handleInputChange("currLandmark", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">City</label>
            <input
              type="text"
              className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white"
              placeholder="City"
              value={formData.currCity}
              onChange={(e) => handleInputChange("currCity", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Postal Code</label>
            <input
              type="text"
              className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white"
              placeholder="Postal Code"
              value={formData.currPostalCode}
              onChange={(e) => handleInputChange("currPostalCode", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Residential Phone</label>
            <input
              type="text"
              className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white"
              placeholder="Residential Phone"
              value={formData.residentialPhone}
              onChange={(e) => handleInputChange("residentialPhone", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Residence Type</label>
            <select
              className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white"
              value={formData.residenceType}
              onChange={(e) => handleInputChange("residenceType", e.target.value)}
            >
              <option value="">Select Type</option>
              <option value="Owned">Owned</option>
              <option value="Rented">Rented</option>
              <option value="Company Provided">Company Provided</option>
              <option value="Parents">Parents</option>
              <option value="Mortgaged">Mortgaged</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Residing Since</label>
            <input
              type="text"
              className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white"
              placeholder="Year/Month"
              value={formData.residingSince}
              onChange={(e) => handleInputChange("residingSince", e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {/* Permanent Address */}
      <div>
        <h4 className="text-xl font-semibold mb-2">Permanent Address</h4>
        <div className="mb-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.sameAsCurrent}
              onChange={(e) => handleInputChange("sameAsCurrent", e.target.checked)}
            />
            Same as Current Address
          </label>
        </div>
        
        {!formData.sameAsCurrent && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border border-gray-200 rounded-xl p-6 bg-gray-50">
            <div className="md:col-span-3">
              <label className="block text-sm font-medium mb-1">Full Address</label>
              <textarea
                className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white"
                rows={2}
                placeholder="Full Address"
                value={formData.permAddress}
                onChange={(e) => handleInputChange("permAddress", e.target.value)}
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Street</label>
              <input
                type="text"
                className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white"
                placeholder="Street"
                value={formData.permStreet}
                onChange={(e) => handleInputChange("permStreet", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">District/Tehsil</label>
              <input
                type="text"
                className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white"
                placeholder="District"
                value={formData.permDistrict}
                onChange={(e) => handleInputChange("permDistrict", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nearest Landmark</label>
              <input
                type="text"
                className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white"
                placeholder="Landmark"
                value={formData.permLandmark}
                onChange={(e) => handleInputChange("permLandmark", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <input
                type="text"
                className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white"
                placeholder="City"
                value={formData.permCity}
                onChange={(e) => handleInputChange("permCity", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Postal Code</label>
              <input
                type="text"
                className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white"
                placeholder="Postal Code"
                value={formData.permPostalCode}
                onChange={(e) => handleInputChange("permPostalCode", e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}; 