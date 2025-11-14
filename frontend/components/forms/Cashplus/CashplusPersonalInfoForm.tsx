"use client"
import React from 'react';
import { useCustomer } from '@/contexts/CustomerContext';

export const CashplusPersonalInfoForm = () => {
  const { customerData, updateCustomerData } = useCustomer();

  // Defensive defaults (ensure personalDetails is always an object)
  const personalDetails = customerData?.personalDetails || {};
  const addressDetails = customerData?.addressDetails || {};
  const currentAddress = addressDetails.currentAddress || {};
  const permanentAddress = addressDetails.permanentAddress || {};
  const contactDetails = customerData?.contactDetails || {};

  // Helper to update personal details in global context
  const handlePersonalChange = (field: string, value: any) => {
    updateCustomerData({
      personalDetails: {
        ...personalDetails,
        [field]: value,
      },
    });
  };

  // Helper to update current address fields
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

  // Helper to update permanent address fields
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

  // Helper to update contact details
  const handleContactChange = (field: string, value: any) => {
    updateCustomerData({
      contactDetails: {
        ...contactDetails,
        [field]: value,
      },
    });
  };

  // Helper for prefilled highlighting
  const prefilledFields = new Set(
    [
      ...Object.entries(personalDetails).filter(([k, v]) => !!v).map(([k]) => k),
      ...Object.entries(currentAddress).filter(([k, v]) => !!v).map(([k]) => k),
      ...Object.entries(permanentAddress).filter(([k, v]) => !!v).map(([k]) => k),
      ...Object.entries(contactDetails).filter(([k, v]) => !!v).map(([k]) => k)
    ]
  );

  // 🔍 DEBUG: Log prefilled fields detection
  console.log('🔍 Personal Info Form - Prefilled Fields:', {
    personalDetailsKeys: Object.keys(personalDetails),
    personalDetailsWithValues: Object.entries(personalDetails).filter(([k, v]) => !!v).map(([k]) => k),
    currentAddressKeys: Object.keys(currentAddress),
    prefilledFieldsCount: prefilledFields.size,
    prefilledFieldsList: Array.from(prefilledFields),
    isETB: customerData?.isETB,
    showBanner: customerData?.isETB && prefilledFields.size > 0
  });

  const getFieldClasses = (fieldName: string) => {
    const baseClasses = "w-full border border-gray-300 rounded-xl px-4 py-2";
    const prefilledClasses = "bg-blue-50 border-blue-300";
    const normalClasses = "bg-white";
    
    return `${baseClasses} ${prefilledFields.has(fieldName) ? prefilledClasses : normalClasses}`;
  };

  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-primary text-primary-foreground">3. Personal Information</h3>
      {customerData?.isETB && prefilledFields.size > 0 && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm text-blue-800">
            <strong>✨ Auto-Filled:</strong> Fields highlighted in blue are pre-filled from your previous loan application or CBS records. You can edit them if needed.
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
        {/* Title */}
        <div>
          <label className="block mb-2 font-medium">Title *</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="title" 
                value="Mr" 
                checked={personalDetails.title === 'Mr'}
                onChange={(e) => handlePersonalChange('title', e.target.value)}
              /> 
              Mr.
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="title" 
                value="Mrs" 
                checked={personalDetails.title === 'Mrs'}
                onChange={(e) => handlePersonalChange('title', e.target.value)}
              /> 
              Mrs.
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="title" 
                value="Ms" 
                checked={personalDetails.title === 'Ms'}
                onChange={(e) => handlePersonalChange('title', e.target.value)}
              /> 
              Ms.
            </label>
          </div>
        </div>
        
        {/* First, Middle, Last Name */}
        <div>
          <label className="block mb-2 font-medium">First Name *</label>
          <input 
            type="text" 
            className={getFieldClasses('firstName')}
            placeholder="First Name" 
            value={personalDetails.firstName || ""}
            onChange={(e) => handlePersonalChange('firstName', e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Middle Name</label>
          <input 
            type="text" 
            className={getFieldClasses('middleName')}
            placeholder="Middle Name" 
            value={personalDetails.middleName || ""}
            onChange={(e) => handlePersonalChange('middleName', e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Last Name *</label>
          <input 
            type="text" 
            className={getFieldClasses('lastName')}
            placeholder="Last Name" 
            value={personalDetails.lastName || ""}
            onChange={(e) => handlePersonalChange('lastName', e.target.value)}
          />
        </div>
        
        {/* CNIC */}
        <div>
          <label className="block mb-2 font-medium">CNIC *</label>
          <input 
            type="text" 
            maxLength={15} 
            className={getFieldClasses('cnic')}
            placeholder="CNIC (13 digits)" 
            value={personalDetails.cnic || ""}
            onChange={(e) => handlePersonalChange('cnic', e.target.value)}
          />
        </div>
        
        {/* NTN */}
        <div>
          <label className="block mb-2 font-medium">NTN (if available)</label>
          <input 
            type="text" 
            className={getFieldClasses('ntn')}
            placeholder="NTN" 
            value={personalDetails.ntn || ""}
            onChange={(e) => handlePersonalChange('ntn', e.target.value)}
          />
        </div>
        
        {/* Date of Birth */}
        <div>
          <label className="block mb-2 font-medium">Date of Birth *</label>
          <input 
            type="date" 
            className={getFieldClasses('dateOfBirth')}
            value={personalDetails.dateOfBirth || ""}
            onChange={(e) => handlePersonalChange('dateOfBirth', e.target.value)}
          />
        </div>
        
        {/* Gender */}
        <div>
          <label className="block mb-2 font-medium">Gender *</label>
          <div className="flex gap-3">
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="gender" 
                value="Male"
                checked={personalDetails.gender === 'Male'}
                onChange={(e) => handlePersonalChange('gender', e.target.value)}
              /> 
              Male
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="gender" 
                value="Female"
                checked={personalDetails.gender === 'Female'}
                onChange={(e) => handlePersonalChange('gender', e.target.value)}
              /> 
              Female
            </label>
          </div>
        </div>
        
        {/* Marital Status */}
        <div>
          <label className="block mb-2 font-medium">Marital Status *</label>
          <div className="flex flex-wrap gap-2">
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="maritalStatus" 
                value="Single"
                checked={personalDetails.maritalStatus === 'Single'}
                onChange={(e) => handlePersonalChange('maritalStatus', e.target.value)}
              /> 
              Single
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="maritalStatus" 
                value="Married"
                checked={personalDetails.maritalStatus === 'Married'}
                onChange={(e) => handlePersonalChange('maritalStatus', e.target.value)}
              /> 
              Married
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="maritalStatus" 
                value="Widowed"
                checked={personalDetails.maritalStatus === 'Widowed'}
                onChange={(e) => handlePersonalChange('maritalStatus', e.target.value)}
              /> 
              Widowed
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="maritalStatus" 
                value="Divorced"
                checked={personalDetails.maritalStatus === 'Divorced'}
                onChange={(e) => handlePersonalChange('maritalStatus', e.target.value)}
              /> 
              Divorced
            </label>
          </div>
        </div>
        
        {/* Dependants */}
        <div>
          <label className="block mb-2 font-medium">Dependants *</label>
          <input 
            type="number" 
            className={getFieldClasses('numberOfDependents')}
            placeholder="Number of Dependants" 
            value={personalDetails.numberOfDependents || ""}
            onChange={(e) => handlePersonalChange('numberOfDependents', e.target.value)}
          />
        </div>
        
        {/* Education */}
        <div className="md:col-span-3">
          <label className="block mb-2 font-medium">Educational Qualification *</label>
          <div className="flex flex-wrap gap-3 mb-2">
            {['Below Matric', 'Matric/O\'Levels', 'Inter/A\'Levels', 'Graduate', 'Post Graduate', 'Other'].map((edu) => (
              <label key={edu} className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="education" 
                  value={edu}
                  checked={personalDetails.education === edu}
                  onChange={(e) => handlePersonalChange('education', e.target.value)}
                /> 
                {edu}
              </label>
            ))}
          </div>
          {personalDetails.education === 'Other' && (
            <input 
              type="text" 
              className="rounded-xl border border-gray-300 bg-white px-4 py-2" 
              placeholder="If Other, specify" 
              value={personalDetails.educationOther || ""}
              onChange={(e) => handlePersonalChange('educationOther', e.target.value)}
            />
          )}
        </div>
        
        {/* Father's/Husband's Name */}
        <div>
          <label className="block mb-2 font-medium">Father's / Husband's Name *</label>
          <input 
            type="text" 
            className={getFieldClasses('fatherName')}
            placeholder="Father/Husband Name" 
            value={personalDetails.fatherName || ""}
            onChange={(e) => handlePersonalChange('fatherName', e.target.value)}
          />
        </div>
        
        {/* Mother's Maiden Name */}
        <div>
          <label className="block mb-2 font-medium">Mother's Maiden Name *</label>
          <input 
            type="text" 
            className={getFieldClasses('motherName')}
            placeholder="Mother's Maiden Name" 
            value={personalDetails.motherName || ""}
            onChange={(e) => handlePersonalChange('motherName', e.target.value)}
          />
        </div>
        
        {/* Employment Status */}
        <div className="md:col-span-3">
          <label className="block mb-2 font-medium">Employment Status *</label>
          <div className="flex flex-wrap gap-3">
            {['Salaried', 'Govt. servant', 'Armed forces', 'Staff'].map((status) => (
              <label key={status} className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="employmentStatus" 
                  value={status}
                  checked={customerData?.employmentDetails?.employmentStatus === status}
                  onChange={(e) => updateCustomerData({
                    employmentDetails: {
                      ...(customerData?.employmentDetails || {}),
                      employmentStatus: e.target.value
                    }
                  })}
                /> 
                {status}
              </label>
            ))}
          </div>
        </div>
        
        {/* Address Group */}
        <div className="md:col-span-3">
          <label className="block mb-2 font-medium">Address *</label>
          <textarea 
            rows={2} 
            className={getFieldClasses('fullAddress')}
            placeholder="House/Apt, Street, etc." 
            value={currentAddress.fullAddress || ""}
            onChange={(e) => handleCurrentAddressChange('fullAddress', e.target.value)}
          />
        </div>
        
        <div>
          <label className="block mb-2 font-medium">Nearest Landmark</label>
          <input 
            type="text" 
            className={getFieldClasses('nearestLandmark')}
            placeholder="Nearest Landmark" 
            value={currentAddress.nearestLandmark || ""}
            onChange={(e) => handleCurrentAddressChange('nearestLandmark', e.target.value)}
          />
        </div>
        
        <div>
          <label className="block mb-2 font-medium">City *</label>
          <input 
            type="text" 
            className={getFieldClasses('city')}
            placeholder="City" 
            value={currentAddress.city || ""}
            onChange={(e) => handleCurrentAddressChange('city', e.target.value)}
          />
        </div>
        
        <div>
          <label className="block mb-2 font-medium">Postal Code *</label>
          <input 
            type="text" 
            className={getFieldClasses('postalCode')}
            placeholder="Postal Code" 
            value={currentAddress.postalCode || ""}
            onChange={(e) => handleCurrentAddressChange('postalCode', e.target.value)}
          />
        </div>
        
        <div>
          <label className="block mb-2 font-medium">Residing Since *</label>
          <input 
            type="text" 
            className={getFieldClasses('yearsAtAddress')}
            placeholder="Duration at Address" 
            value={currentAddress.yearsAtAddress || ""}
            onChange={(e) => handleCurrentAddressChange('yearsAtAddress', e.target.value)}
          />
        </div>
        
        {/* Type of Accommodation */}
        <div className="md:col-span-3">
          <label className="block mb-2 font-medium">Type of Accommodation *</label>
          <div className="flex flex-wrap gap-3 mb-2">
            {[
              'Your own house', 
              'Wife\'s/Husband\'s house', 
              'Parent\'s house', 
              'Company provided house', 
              'Rented house', 
              'Mortgaged house', 
              'Other'
            ].map((type) => (
              <label key={type} className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="accommodationType" 
                  value={type}
                  checked={currentAddress.residentialStatus === type}
                  onChange={(e) => handleCurrentAddressChange('residentialStatus', e.target.value)}
                /> 
                {type}
              </label>
            ))}
          </div>
          {currentAddress.residentialStatus === 'Other' && (
            <input 
              type="text" 
              className="rounded-xl border border-gray-300 bg-white px-4 py-2" 
              placeholder="If Other, specify" 
              value={currentAddress.residentialStatusOther || ""}
              onChange={(e) => handleCurrentAddressChange('residentialStatusOther', e.target.value)}
            />
          )}
        </div>
        
        <div>
          <label className="block mb-2 font-medium">Monthly Rent</label>
          <input 
            type="number" 
            className={getFieldClasses('monthlyRent')}
            placeholder="Monthly Rent (if rented)" 
            value={currentAddress.monthlyRent || ""}
            onChange={(e) => handleCurrentAddressChange('monthlyRent', e.target.value)}
          />
        </div>
        
        {/* Preferred Mailing Address */}
        <div>
          <label className="block mb-2 font-medium">Preferred Mailing Address *</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="mailingAddress" 
                value="Residence"
                checked={contactDetails.preferredMailingAddress === 'Residence'}
                onChange={(e) => handleContactChange('preferredMailingAddress', e.target.value)}
              /> 
              Residence
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="mailingAddress" 
                value="Office"
                checked={contactDetails.preferredMailingAddress === 'Office'}
                onChange={(e) => handleContactChange('preferredMailingAddress', e.target.value)}
              /> 
              Office
            </label>
          </div>
        </div>
        
        {/* Permanent Address */}
        <div className="md:col-span-3">
          <label className="block mb-2 font-medium">Permanent Address (If Different from Current)</label>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <input 
              type="text" 
              className={getFieldClasses('houseNo')}
              placeholder="House / Apt. No." 
              value={permanentAddress.houseNo || ""}
              onChange={(e) => handlePermanentAddressChange('houseNo', e.target.value)}
            />
            <input 
              type="text" 
              className={getFieldClasses('street')}
              placeholder="Street" 
              value={permanentAddress.street || ""}
              onChange={(e) => handlePermanentAddressChange('street', e.target.value)}
            />
            <input 
              type="text" 
              className={getFieldClasses('city')}
              placeholder="City" 
              value={permanentAddress.city || ""}
              onChange={(e) => handlePermanentAddressChange('city', e.target.value)}
            />
            <input 
              type="text" 
              className={getFieldClasses('postalCode')}
              placeholder="Postal Code" 
              value={permanentAddress.postalCode || ""}
              onChange={(e) => handlePermanentAddressChange('postalCode', e.target.value)}
            />
          </div>
        </div>
        
        {/* Residence Contact Details */}
        <div>
          <label className="block mb-2 font-medium">Telephone (Current) *</label>
          <input 
            type="text" 
            className={getFieldClasses('telephone')}
            placeholder="Telephone (Current)" 
            value={currentAddress.telephone || ""}
            onChange={(e) => handleCurrentAddressChange('telephone', e.target.value)}
          />
        </div>
        
        <div>
          <label className="block mb-2 font-medium">Telephone (Permanent)</label>
          <input 
            type="text" 
            className={getFieldClasses('permanentTelephone')}
            placeholder="Telephone (Permanent)" 
            value={permanentAddress.telephone || ""}
            onChange={(e) => handlePermanentAddressChange('telephone', e.target.value)}
          />
        </div>
        
        <div>
          <label className="block mb-2 font-medium">Mobile *</label>
          <input 
            type="text" 
            className={getFieldClasses('mobileNumber')}
            placeholder="Mobile" 
            value={personalDetails.mobileNumber || ""}
            onChange={(e) => handlePersonalChange('mobileNumber', e.target.value)}
          />
        </div>
        
        {/* Mobile Type */}
        <div>
          <label className="block mb-2 font-medium">Mobile Type *</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="mobileType" 
                value="Prepaid"
                checked={contactDetails.mobileType === 'Prepaid'}
                onChange={(e) => handleContactChange('mobileType', e.target.value)}
              /> 
              Prepaid
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="mobileType" 
                value="Postpaid"
                checked={contactDetails.mobileType === 'Postpaid'}
                onChange={(e) => handleContactChange('mobileType', e.target.value)}
              /> 
              Postpaid
            </label>
          </div>
        </div>
        
        <div>
          <label className="block mb-2 font-medium">Other Contact</label>
          <input 
            type="text" 
            className={getFieldClasses('otherContact')}
            placeholder="Other Contact" 
            value={contactDetails.otherContact || ""}
            onChange={(e) => handleContactChange('otherContact', e.target.value)}
          />
        </div>
      </div>
    </section>
  );
};
