"use client";
import React from 'react';
import { useCustomer } from '@/contexts/CustomerContext';

export const AmeenDrivePersonalDetailsForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  
  // Defensive defaults (ensure objects exist)
  const personalDetails = customerData?.personalDetails || {};
  const addressDetails = customerData?.addressDetails || {};
  const currentAddress = addressDetails.currentAddress || {};
  const permanentAddress = addressDetails.permanentAddress || {};
  const vehicleDetails = customerData?.ameenDrive?.vehicleDetails || {};
  
  // Helper to update personal details
  const handlePersonalChange = (field: string, value: any) => {
    updateCustomerData({
      personalDetails: {
        ...personalDetails,
        [field]: value,
      },
    });
  };
  
  // Helper to update current address
  const handleCurrentAddressChange = (field: string, value: any) => {
    updateCustomerData({
      addressDetails: {
        ...addressDetails,
        currentAddress: {
          ...currentAddress,
          [field]: value,
        },
      },
    });
  };
  
  // Helper to update permanent address
  const handlePermanentAddressChange = (field: string, value: any) => {
    updateCustomerData({
      addressDetails: {
        ...addressDetails,
        permanentAddress: {
          ...permanentAddress,
          [field]: value,
        },
      },
    });
  };
  
  // Helper to update vehicle details
  const handleVehicleChange = (field: string, value: any) => {
    updateCustomerData({
      ameenDrive: {
        ...(customerData?.ameenDrive || {}),
        vehicleDetails: {
          ...vehicleDetails,
          [field]: value,
        },
      },
    });
  };

  // Helper for prefilled highlighting
  const prefilledFields = new Set([
    ...Object.entries(personalDetails).filter(([k, v]) => !!v).map(([k]) => k),
    ...Object.entries(currentAddress).filter(([k, v]) => !!v).map(([k]) => k),
    ...Object.entries(permanentAddress).filter(([k, v]) => !!v).map(([k]) => k),
    ...Object.entries(vehicleDetails).filter(([k, v]) => !!v).map(([k]) => k)
  ]);

  const getFieldClasses = (fieldName: string) => {
    const base = 'w-full border border-gray-300 rounded-xl px-4 py-2';
    const prefilled = 'bg-yellow-50 border-yellow-300';
    const normal = 'bg-white';
    return `${base} ${prefilledFields.has(fieldName) ? prefilled : normal}`;
  };

  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg font-semibold mb-4 p-4 bg-primary text-primary-foreground">5. Personal Details (CBS)</h3>
      {customerData?.isETB && prefilledFields.size > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-sm text-yellow-800">
            <strong>Note:</strong> Fields highlighted in yellow are pre-filled from your existing customer data. You can edit them if needed.
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
        <div>
          <label className="block mb-2 font-medium">Full Name (Mr/Mrs./Ms.)</label>
          <input 
            type="text" 
            className={getFieldClasses('fullName')} 
            placeholder="Full Name" 
            value={personalDetails.fullName || ""} 
            onChange={e => handlePersonalChange('fullName', e.target.value)} 
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Father's/Husband's Name</label>
          <input 
            type="text" 
            className={getFieldClasses('fatherName')} 
            placeholder="Father's/Husband's Name" 
            value={personalDetails.fatherName || ""} 
            onChange={e => handlePersonalChange('fatherName', e.target.value)} 
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Mother's Maiden Name</label>
          <input 
            type="text" 
            className={getFieldClasses('motherName')} 
            placeholder="Mother's Maiden Name" 
            value={personalDetails.motherName || ""} 
            onChange={e => handlePersonalChange('motherName', e.target.value)} 
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Date of Birth</label>
          <input 
            type="date" 
            className={getFieldClasses('dateOfBirth')} 
            value={personalDetails.dateOfBirth || ""} 
            onChange={e => handlePersonalChange('dateOfBirth', e.target.value)} 
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Gender</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="gender" 
                checked={personalDetails.gender === 'Male'} 
                onChange={() => handlePersonalChange('gender', 'Male')} 
              /> Male
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="gender" 
                checked={personalDetails.gender === 'Female'} 
                onChange={() => handlePersonalChange('gender', 'Female')} 
              /> Female
            </label>
          </div>
        </div>
        <div>
          <label className="block mb-2 font-medium">Marital Status</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="maritalStatus" 
                checked={personalDetails.maritalStatus === 'Single'} 
                onChange={() => handlePersonalChange('maritalStatus', 'Single')} 
              /> Single
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="maritalStatus" 
                checked={personalDetails.maritalStatus === 'Married'} 
                onChange={() => handlePersonalChange('maritalStatus', 'Married')} 
              /> Married
            </label>
          </div>
        </div>
        <div>
          <label className="block mb-2 font-medium">CNIC</label>
          <input 
            type="text" 
            className={getFieldClasses('cnic')} 
            placeholder="CNIC" 
            value={personalDetails.cnic || ""} 
            onChange={e => handlePersonalChange('cnic', e.target.value)} 
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">National Tax No.</label>
          <input 
            type="text" 
            className={getFieldClasses('ntn')} 
            placeholder="NTN" 
            value={personalDetails.ntn || ""} 
            onChange={e => handlePersonalChange('ntn', e.target.value)} 
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Passport No. (For foreigners)</label>
          <input 
            type="text" 
            className={getFieldClasses('passportNumber')} 
            placeholder="Passport No." 
            value={personalDetails.passportNumber || ""} 
            onChange={e => handlePersonalChange('passportNumber', e.target.value)} 
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">No. of Dependent Children</label>
          <input 
            type="number" 
            className={getFieldClasses('numberOfChildren')} 
            placeholder="Children" 
            value={personalDetails.numberOfChildren || ""} 
            onChange={e => handlePersonalChange('numberOfChildren', e.target.value)} 
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Other Dependents</label>
          <input 
            type="number" 
            className={getFieldClasses('numberOfDependents')} 
            placeholder="Other Dependents" 
            value={personalDetails.numberOfDependents || ""} 
            onChange={e => handlePersonalChange('numberOfDependents', e.target.value)} 
          />
        </div>
        <div className="md:col-span-3">
          <label className="block mb-2 font-medium">Educational Qualification</label>
          <div className="flex flex-wrap gap-3">
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="eduQualification" 
                checked={personalDetails.education === 'Intermediate'} 
                onChange={() => handlePersonalChange('education', 'Intermediate')} 
              /> Intermediate
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="eduQualification" 
                checked={personalDetails.education === 'Graduate'} 
                onChange={() => handlePersonalChange('education', 'Graduate')} 
              /> Graduate
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="eduQualification" 
                checked={personalDetails.education === 'Postgraduate'} 
                onChange={() => handlePersonalChange('education', 'Postgraduate')} 
              /> Postgraduate
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="eduQualification" 
                checked={personalDetails.education === 'Other'} 
                onChange={() => handlePersonalChange('education', 'Other')} 
              /> Other
            </label>
          </div>
        </div>
      </div>
      <div className="mt-8">
        <h4 className="text-lg font-semibold mb-4 text-primary">Current Residential Address (CBS)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50" >
          <div>
            <label className="block mb-2 font-medium">House No. / Flat No.</label>
            <input 
              type="text" 
              className={getFieldClasses('houseNo')} 
              placeholder="House No. / Flat No." 
              value={currentAddress.houseNo || ""} 
              onChange={e => handleCurrentAddressChange('houseNo', e.target.value)} 
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Street</label>
            <input 
              type="text" 
              className={getFieldClasses('street')} 
              placeholder="Street" 
              value={currentAddress.street || ""} 
              onChange={e => handleCurrentAddressChange('street', e.target.value)} 
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Tehsil / District / Area</label>
            <input 
              type="text" 
              className={getFieldClasses('area')} 
              placeholder="Tehsil / District / Area" 
              value={currentAddress.area || ""} 
              onChange={e => handleCurrentAddressChange('area', e.target.value)} 
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Nearest Landmark</label>
            <input 
              type="text" 
              className={getFieldClasses('nearestLandmark')} 
              placeholder="Nearest Landmark" 
              value={currentAddress.nearestLandmark || ""} 
              onChange={e => handleCurrentAddressChange('nearestLandmark', e.target.value)} 
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">City</label>
            <input 
              type="text" 
              className={getFieldClasses('city')} 
              placeholder="City" 
              value={currentAddress.city || ""} 
              onChange={e => handleCurrentAddressChange('city', e.target.value)} 
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Country</label>
            <input 
              type="text" 
              className={getFieldClasses('country')} 
              placeholder="Country" 
              value={currentAddress.country || ""} 
              onChange={e => handleCurrentAddressChange('country', e.target.value)} 
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Postal Code</label>
            <input 
              type="text" 
              className={getFieldClasses('postalCode')} 
              placeholder="Postal Code" 
              value={currentAddress.postalCode || ""} 
              onChange={e => handleCurrentAddressChange('postalCode', e.target.value)} 
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Residence Status</label>
            <div className="flex flex-wrap gap-2">
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="residenceStatus" 
                  checked={currentAddress.residentialStatus === 'Owned'} 
                  onChange={() => handleCurrentAddressChange('residentialStatus', 'Owned')} 
                /> Owned
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="residenceStatus" 
                  checked={currentAddress.residentialStatus === 'Rented'} 
                  onChange={() => handleCurrentAddressChange('residentialStatus', 'Rented')} 
                /> Rented
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="residenceStatus" 
                  checked={currentAddress.residentialStatus === 'Spouse'} 
                  onChange={() => handleCurrentAddressChange('residentialStatus', 'Spouse')} 
                /> Spouse
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="residenceStatus" 
                  checked={currentAddress.residentialStatus === 'Company'} 
                  onChange={() => handleCurrentAddressChange('residentialStatus', 'Company')} 
                /> Company
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="residenceStatus" 
                  checked={currentAddress.residentialStatus === 'Parents'} 
                  onChange={() => handleCurrentAddressChange('residentialStatus', 'Parents')} 
                /> Parents
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="residenceStatus" 
                  checked={currentAddress.residentialStatus === 'Others'} 
                  onChange={() => handleCurrentAddressChange('residentialStatus', 'Others')} 
                /> Others
              </label>
            </div>
          </div>
          <div>
            <label className="block mb-2 font-medium">Monthly Rent (if applicable)</label>
            <input 
              type="number" 
              className={getFieldClasses('monthlyRent')} 
              placeholder="Monthly Rent" 
              value={currentAddress.monthlyRent || ""} 
              onChange={e => handleCurrentAddressChange('monthlyRent', e.target.value)} 
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Type of Accommodation</label>
            <div className="flex flex-wrap gap-2">
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="accommodationType" 
                  checked={currentAddress.accommodationType === 'House'} 
                  onChange={() => handleCurrentAddressChange('accommodationType', 'House')} 
                /> House
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="accommodationType" 
                  checked={currentAddress.accommodationType === 'Portion'} 
                  onChange={() => handleCurrentAddressChange('accommodationType', 'Portion')} 
                /> Portion
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="accommodationType" 
                  checked={currentAddress.accommodationType === 'Apartment'} 
                  onChange={() => handleCurrentAddressChange('accommodationType', 'Apartment')} 
                /> Apartment
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="accommodationType" 
                  checked={currentAddress.accommodationType === 'Room'} 
                  onChange={() => handleCurrentAddressChange('accommodationType', 'Room')} 
                /> Room
              </label>
            </div>
          </div>
          <div>
            <label className="block mb-2 font-medium">Residence No.</label>
            <input 
              type="text" 
              className={getFieldClasses('residenceNo')} 
              placeholder="Residence No." 
              value={currentAddress.residenceNo || ""} 
              onChange={e => handleCurrentAddressChange('residenceNo', e.target.value)} 
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Rented Years (No. of years)</label>
            <input 
              type="number" 
              className={getFieldClasses('rentedYears')} 
              placeholder="Rented Years" 
              value={currentAddress.rentedYears || ""} 
              onChange={e => handleCurrentAddressChange('rentedYears', e.target.value)} 
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Mobile No.</label>
            <input 
              type="text" 
              className={getFieldClasses('mobile')} 
              placeholder="Mobile No." 
              value={currentAddress.mobile || ""} 
              onChange={e => handleCurrentAddressChange('mobile', e.target.value)} 
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Fax No.</label>
            <input 
              type="text" 
              className={getFieldClasses('fax')} 
              placeholder="Fax No." 
              value={currentAddress.fax || ""} 
              onChange={e => handleCurrentAddressChange('fax', e.target.value)} 
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Email</label>
            <input 
              type="email" 
              className={getFieldClasses('email')} 
              placeholder="Email" 
              value={currentAddress.email || ""} 
              onChange={e => handleCurrentAddressChange('email', e.target.value)} 
            />
          </div>
        </div>
        <h4 className="text-lg font-semibold mt-8 mb-4 text-primary">Permanent Residential Address (Verysis)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50" >
          <div>
            <label className="block mb-2 font-medium">House No. / Flat No.</label>
            <input 
              type="text" 
              className={getFieldClasses('houseNo')} 
              placeholder="House No. / Flat No." 
              value={permanentAddress.houseNo || ""} 
              onChange={e => handlePermanentAddressChange('houseNo', e.target.value)} 
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Street</label>
            <input 
              type="text" 
              className={getFieldClasses('street')} 
              placeholder="Street" 
              value={permanentAddress.street || ""} 
              onChange={e => handlePermanentAddressChange('street', e.target.value)} 
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Tehsil / District / Area</label>
            <input 
              type="text" 
              className={getFieldClasses('area')} 
              placeholder="Tehsil / District / Area" 
              value={permanentAddress.area || ""} 
              onChange={e => handlePermanentAddressChange('area', e.target.value)} 
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Nearest Landmark</label>
            <input 
              type="text" 
              className={getFieldClasses('nearestLandmark')} 
              placeholder="Nearest Landmark" 
              value={permanentAddress.nearestLandmark || ""} 
              onChange={e => handlePermanentAddressChange('nearestLandmark', e.target.value)} 
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">City</label>
            <input 
              type="text" 
              className={getFieldClasses('city')} 
              placeholder="City" 
              value={permanentAddress.city || ""} 
              onChange={e => handlePermanentAddressChange('city', e.target.value)} 
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Country</label>
            <input 
              type="text" 
              className={getFieldClasses('country')} 
              placeholder="Country" 
              value={permanentAddress.country || ""} 
              onChange={e => handlePermanentAddressChange('country', e.target.value)} 
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Postal Code</label>
            <input 
              type="text" 
              className={getFieldClasses('postalCode')} 
              placeholder="Postal Code" 
              value={permanentAddress.postalCode || ""} 
              onChange={e => handlePermanentAddressChange('postalCode', e.target.value)} 
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Existing Car (if any)</label>
            <input 
              type="text" 
              className={getFieldClasses('existingCar')} 
              placeholder="Existing Car" 
              value={vehicleDetails.existingCar || ""} 
              onChange={e => handleVehicleChange('existingCar', e.target.value)} 
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Car Manufacturer</label>
            <input 
              type="text" 
              className={getFieldClasses('carManufacturer')} 
              placeholder="Car Manufacturer" 
              value={vehicleDetails.carManufacturer || ""} 
              onChange={e => handleVehicleChange('carManufacturer', e.target.value)} 
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Car Model</label>
            <input 
              type="text" 
              className={getFieldClasses('carModel')} 
              placeholder="Car Model" 
              value={vehicleDetails.carModel || ""} 
              onChange={e => handleVehicleChange('carModel', e.target.value)} 
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Car Year</label>
            <input 
              type="number" 
              className={getFieldClasses('carYear')} 
              placeholder="Car Year" 
              value={vehicleDetails.carYear || ""} 
              onChange={e => handleVehicleChange('carYear', e.target.value)} 
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Car Status</label>
            <div className="flex flex-wrap gap-2">
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="carStatus" 
                  checked={vehicleDetails.carStatus === 'Owned'} 
                  onChange={() => handleVehicleChange('carStatus', 'Owned')} 
                /> Owned
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="carStatus" 
                  checked={vehicleDetails.carStatus === 'Leased'} 
                  onChange={() => handleVehicleChange('carStatus', 'Leased')} 
                /> Leased
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="carStatus" 
                  checked={vehicleDetails.carStatus === 'Company'} 
                  onChange={() => handleVehicleChange('carStatus', 'Company')} 
                /> Company
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="carStatus" 
                  checked={vehicleDetails.carStatus === 'Parents'} 
                  onChange={() => handleVehicleChange('carStatus', 'Parents')} 
                /> Parents
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="carStatus" 
                  checked={vehicleDetails.carStatus === 'Other'} 
                  onChange={() => handleVehicleChange('carStatus', 'Other')} 
                /> Other
              </label>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
