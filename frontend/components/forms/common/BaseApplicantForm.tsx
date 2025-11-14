"use client";
import React from 'react';
import { useCustomer } from '@/contexts/CustomerContext';

/**
 * BaseApplicantForm - Universal form component for ALL loan products
 * Contains 45 common fields used across all product types
 * 
 * Sections:
 * 1. Identity (8 fields)
 * 2. Family (3 fields)
 * 3. Contact (4 fields)
 * 4. Current Address (7 fields)
 * 5. Permanent Address (4 fields - optional)
 * 6. Employment (7 fields - optional for SME)
 * 7. Income (3 fields - optional for SME)
 * 8. Banking (2 fields)
 */

interface BaseApplicantFormProps {
  /** Show employment section (hide for pure business/SME applications) */
  showEmployment?: boolean;
  /** Show income section (hide for business applications with revenue instead) */
  showIncome?: boolean;
  /** Optional section title prefix (e.g., "Personal Information" or "Applicant Details") */
  sectionTitle?: string;
  /** Section number for sequential forms */
  sectionNumber?: number;
}

export const BaseApplicantForm: React.FC<BaseApplicantFormProps> = ({
  showEmployment = true,
  showIncome = true,
  sectionTitle = "Personal Information",
  sectionNumber
}) => {
  const { customerData, updateCustomerData } = useCustomer();

  // Defensive defaults
  const personalDetails = customerData?.personalDetails || {};
  const addressDetails = customerData?.addressDetails || {};
  const currentAddress = addressDetails.currentAddress || {};
  const permanentAddress = addressDetails.permanentAddress || {};
  const contactDetails = customerData?.contactDetails || {};
  const employmentDetails = customerData?.employmentDetails || {};
  const incomeDetails = customerData?.incomeDetails || {};
  const bankingDetails = customerData?.bankingDetails || customerData?.clientBanks || {};

  // Helper to update personal details
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

  // Helper to update employment details
  const handleEmploymentChange = (field: string, value: any) => {
    updateCustomerData({
      employmentDetails: {
        ...employmentDetails,
        [field]: value,
      },
    });
  };

  // Helper to update income details
  const handleIncomeChange = (field: string, value: any) => {
    updateCustomerData({
      incomeDetails: {
        ...incomeDetails,
        [field]: value,
      },
    });
  };

  // Helper to update banking details
  const handleBankingChange = (field: string, value: any) => {
    updateCustomerData({
      clientBanks: {
        ...bankingDetails,
        [field]: value,
      },
    });
  };

  // Helper for prefilled highlighting
  const prefilledFields = new Set([
    ...Object.entries(personalDetails).filter(([k, v]) => !!v).map(([k]) => k),
    ...Object.entries(currentAddress).filter(([k, v]) => !!v).map(([k]) => k),
    ...Object.entries(permanentAddress).filter(([k, v]) => !!v).map(([k]) => k),
    ...Object.entries(contactDetails).filter(([k, v]) => !!v).map(([k]) => k),
    ...Object.entries(employmentDetails).filter(([k, v]) => !!v).map(([k]) => k),
    ...Object.entries(incomeDetails).filter(([k, v]) => !!v).map(([k]) => k)
  ]);

  const getFieldClasses = (fieldName: string) => {
    const baseClasses = "w-full border border-gray-300 rounded-xl px-4 py-2";
    const prefilledClasses = "bg-yellow-50 border-yellow-300";
    const normalClasses = "bg-white";
    
    return `${baseClasses} ${prefilledFields.has(fieldName) ? prefilledClasses : normalClasses}`;
  };

  const sectionHeaderNumber = sectionNumber ? `${sectionNumber}. ` : '';

  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-primary text-primary-foreground">
        {sectionHeaderNumber}{sectionTitle}
      </h3>
      
      {customerData?.isETB && prefilledFields.size > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-sm text-yellow-800">
            <strong>✨ Auto-filled Data:</strong> Fields highlighted in yellow are pre-filled from your existing customer profile. You can edit them if needed.
          </div>
        </div>
      )}
      
      {/* ==================== SECTION 1: IDENTITY ==================== */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-4 text-gray-700">Identity Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border border-gray-200 rounded-xl p-6 bg-gray-50">
          
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
              placeholder="Middle Name (Optional)" 
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
              placeholder="XXXXX-XXXXXXX-X" 
              value={personalDetails.cnic || ""}
              onChange={(e) => handlePersonalChange('cnic', e.target.value)}
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
        </div>
      </div>

      {/* ==================== SECTION 2: FAMILY ==================== */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-4 text-gray-700">Family Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border border-gray-200 rounded-xl p-6 bg-gray-50">
          
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
            <label className="block mb-2 font-medium">Mother's Maiden Name</label>
            <input 
              type="text" 
              className={getFieldClasses('motherName')}
              placeholder="Mother's Maiden Name (Optional)" 
              value={personalDetails.motherName || ""}
              onChange={(e) => handlePersonalChange('motherName', e.target.value)}
            />
          </div>
          
          {/* Marital Status */}
          <div>
            <label className="block mb-2 font-medium">Marital Status *</label>
            <div className="flex flex-wrap gap-2">
              {['Single', 'Married', 'Widowed', 'Divorced'].map((status) => (
                <label key={status} className="flex items-center gap-2">
                  <input 
                    type="radio" 
                    name="maritalStatus" 
                    value={status}
                    checked={personalDetails.maritalStatus === status}
                    onChange={(e) => handlePersonalChange('maritalStatus', e.target.value)}
                  /> 
                  {status}
                </label>
              ))}
            </div>
          </div>
          
          {/* Dependants */}
          <div>
            <label className="block mb-2 font-medium">Number of Dependents</label>
            <input 
              type="number" 
              min="0"
              className={getFieldClasses('numberOfDependents')}
              placeholder="Number of Dependents (Optional)" 
              value={personalDetails.numberOfDependents || ""}
              onChange={(e) => handlePersonalChange('numberOfDependents', e.target.value)}
            />
          </div>
          
          {/* Education */}
          <div className="md:col-span-2">
            <label className="block mb-2 font-medium">Educational Qualification</label>
            <div className="flex flex-wrap gap-3">
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
          </div>
        </div>
      </div>

      {/* ==================== SECTION 3: CONTACT ==================== */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-4 text-gray-700">Contact Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border border-gray-200 rounded-xl p-6 bg-gray-50">
          
          {/* Mobile */}
          <div>
            <label className="block mb-2 font-medium">Mobile Number *</label>
            <input 
              type="text" 
              className={getFieldClasses('mobileNumber')}
              placeholder="03XX-XXXXXXX" 
              value={personalDetails.mobileNumber || ""}
              onChange={(e) => handlePersonalChange('mobileNumber', e.target.value)}
            />
          </div>
          
          {/* Mobile Type */}
          <div>
            <label className="block mb-2 font-medium">Mobile Type</label>
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
          
          {/* Email */}
          <div>
            <label className="block mb-2 font-medium">Email</label>
            <input 
              type="email" 
              className={getFieldClasses('emailAddress')}
              placeholder="example@email.com (Optional)" 
              value={contactDetails.emailAddress || ""}
              onChange={(e) => handleContactChange('emailAddress', e.target.value)}
            />
          </div>
          
          {/* Current Telephone */}
          <div>
            <label className="block mb-2 font-medium">Home Phone *</label>
            <input 
              type="text" 
              className={getFieldClasses('telephone')}
              placeholder="Landline Number" 
              value={currentAddress.telephone || ""}
              onChange={(e) => handleCurrentAddressChange('telephone', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ==================== SECTION 4: CURRENT ADDRESS ==================== */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-4 text-gray-700">Current Address</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border border-gray-200 rounded-xl p-6 bg-gray-50">
          
          {/* Full Address */}
          <div className="md:col-span-3">
            <label className="block mb-2 font-medium">Address *</label>
            <textarea 
              rows={2} 
              className={getFieldClasses('fullAddress')}
              placeholder="House/Apt, Street, Area, etc." 
              value={currentAddress.fullAddress || ""}
              onChange={(e) => handleCurrentAddressChange('fullAddress', e.target.value)}
            />
          </div>
          
          {/* City */}
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
          
          {/* District */}
          <div>
            <label className="block mb-2 font-medium">District</label>
            <input 
              type="text" 
              className={getFieldClasses('district')}
              placeholder="District (Optional)" 
              value={currentAddress.district || ""}
              onChange={(e) => handleCurrentAddressChange('district', e.target.value)}
            />
          </div>
          
          {/* Province */}
          <div>
            <label className="block mb-2 font-medium">Province</label>
            <select 
              className={getFieldClasses('province')}
              value={currentAddress.province || ""}
              onChange={(e) => handleCurrentAddressChange('province', e.target.value)}
            >
              <option value="">Select Province (Optional)</option>
              <option value="Sindh">Sindh</option>
              <option value="Punjab">Punjab</option>
              <option value="KPK">Khyber Pakhtunkhwa</option>
              <option value="Balochistan">Balochistan</option>
              <option value="Gilgit-Baltistan">Gilgit-Baltistan</option>
              <option value="AJK">Azad Jammu & Kashmir</option>
            </select>
          </div>
          
          {/* Postal Code */}
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
          
          {/* Residing Since */}
          <div>
            <label className="block mb-2 font-medium">Residing Since *</label>
            <input 
              type="text" 
              className={getFieldClasses('yearsAtAddress')}
              placeholder="Years/Months at Address" 
              value={currentAddress.yearsAtAddress || ""}
              onChange={(e) => handleCurrentAddressChange('yearsAtAddress', e.target.value)}
            />
          </div>
          
          {/* Type of Accommodation */}
          <div className="md:col-span-3">
            <label className="block mb-2 font-medium">Type of Accommodation *</label>
            <div className="flex flex-wrap gap-3">
              {[
                'Own House', 
                'Spouse House', 
                'Parents House', 
                'Company Provided', 
                'Rented', 
                'Mortgaged'
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
          </div>
        </div>
      </div>

      {/* ==================== SECTION 5: PERMANENT ADDRESS (Optional) ==================== */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-4 text-gray-700">Permanent Address (If Different)</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border border-gray-200 rounded-xl p-6 bg-gray-50">
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

      {/* ==================== SECTION 6: EMPLOYMENT (Conditional) ==================== */}
      {showEmployment && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-4 text-gray-700">Employment Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border border-gray-200 rounded-xl p-6 bg-gray-50">
            
            {/* Employment Status */}
            <div className="md:col-span-3">
              <label className="block mb-2 font-medium">Employment Status *</label>
              <div className="flex flex-wrap gap-3">
                {['Salaried', 'Government Servant', 'Armed Forces', 'Self-Employed'].map((status) => (
                  <label key={status} className="flex items-center gap-2">
                    <input 
                      type="radio" 
                      name="employmentStatus" 
                      value={status}
                      checked={employmentDetails.employmentStatus === status}
                      onChange={(e) => handleEmploymentChange('employmentStatus', e.target.value)}
                    /> 
                    {status}
                  </label>
                ))}
              </div>
            </div>
            
            {/* Company Name */}
            <div>
              <label className="block mb-2 font-medium">Company Name *</label>
              <input 
                type="text" 
                className={getFieldClasses('companyName')}
                placeholder="Company Name" 
                value={employmentDetails.companyName || ""}
                onChange={(e) => handleEmploymentChange('companyName', e.target.value)}
              />
            </div>
            
            {/* Designation */}
            <div>
              <label className="block mb-2 font-medium">Designation *</label>
              <input 
                type="text" 
                className={getFieldClasses('designation')}
                placeholder="Designation" 
                value={employmentDetails.designation || ""}
                onChange={(e) => handleEmploymentChange('designation', e.target.value)}
              />
            </div>
            
            {/* Department */}
            <div>
              <label className="block mb-2 font-medium">Department</label>
              <input 
                type="text" 
                className={getFieldClasses('department')}
                placeholder="Department (Optional)" 
                value={employmentDetails.department || ""}
                onChange={(e) => handleEmploymentChange('department', e.target.value)}
              />
            </div>
            
            {/* Years of Service */}
            <div>
              <label className="block mb-2 font-medium">Years of Service *</label>
              <input 
                type="number" 
                min="0"
                className={getFieldClasses('currentExperience')}
                placeholder="Years at Current Company" 
                value={employmentDetails.currentExperience || ""}
                onChange={(e) => handleEmploymentChange('currentExperience', e.target.value)}
              />
            </div>
            
            {/* Grade/Level */}
            <div>
              <label className="block mb-2 font-medium">Grade / Level</label>
              <input 
                type="text" 
                className={getFieldClasses('grade')}
                placeholder="Grade/Level (Optional)" 
                value={employmentDetails.grade || ""}
                onChange={(e) => handleEmploymentChange('grade', e.target.value)}
              />
            </div>
            
            {/* Office Phone */}
            <div>
              <label className="block mb-2 font-medium">Office Phone</label>
              <input 
                type="text" 
                className={getFieldClasses('officePhone')}
                placeholder="Office Landline (Optional)" 
                value={employmentDetails.officeAddress?.telephone || ""}
                onChange={(e) => handleEmploymentChange('officeAddress', {
                  ...(employmentDetails.officeAddress || {}),
                  telephone: e.target.value
                })}
              />
            </div>
          </div>
        </div>
      )}

      {/* ==================== SECTION 7: INCOME (Conditional) ==================== */}
      {showIncome && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-4 text-gray-700">Income Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border border-gray-200 rounded-xl p-6 bg-gray-50">
            
            {/* Gross Monthly Salary */}
            <div>
              <label className="block mb-2 font-medium">Gross Monthly Salary *</label>
              <input 
                type="number" 
                min="0"
                className={getFieldClasses('grossMonthlySalary')}
                placeholder="Gross Salary (PKR)" 
                value={incomeDetails.grossMonthlySalary || ""}
                onChange={(e) => handleIncomeChange('grossMonthlySalary', e.target.value)}
              />
            </div>
            
            {/* Other Monthly Income */}
            <div>
              <label className="block mb-2 font-medium">Other Monthly Income</label>
              <input 
                type="number" 
                min="0"
                className={getFieldClasses('otherMonthlyIncome')}
                placeholder="Other Income (PKR, Optional)" 
                value={incomeDetails.otherMonthlyIncome || ""}
                onChange={(e) => handleIncomeChange('otherMonthlyIncome', e.target.value)}
              />
            </div>
            
            {/* Net Monthly Income */}
            <div>
              <label className="block mb-2 font-medium">Net Monthly Income *</label>
              <input 
                type="number" 
                min="0"
                className={getFieldClasses('netMonthlyIncome')}
                placeholder="Net Take-Home (PKR)" 
                value={incomeDetails.netMonthlyIncome || ""}
                onChange={(e) => handleIncomeChange('netMonthlyIncome', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* ==================== SECTION 8: BANKING ==================== */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-4 text-gray-700">Banking Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 bg-gray-50">
          
          {/* Existing Customer (generic - no bank name) */}
          <div>
            <label className="block mb-2 font-medium">Are you an existing customer? *</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="isExistingCustomer" 
                  value="Yes"
                  checked={
                    bankingDetails.isExistingCustomer === 'Yes' || 
                    bankingDetails.isExistingCustomer === true || 
                    bankingDetails.isExistingCustomer === 'true' ||
                    bankingDetails.isUblCustomer === 'Yes' || 
                    bankingDetails.isUblCustomer === true || 
                    bankingDetails.isUblCustomer === 'true'
                  }
                  onChange={(e) => {
                    handleBankingChange('isExistingCustomer', 'Yes');
                    handleBankingChange('isUblCustomer', 'Yes'); // Backwards compatibility
                  }}
                /> 
                Yes
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="isExistingCustomer" 
                  value="No"
                  checked={
                    bankingDetails.isExistingCustomer === 'No' || 
                    bankingDetails.isExistingCustomer === false || 
                    bankingDetails.isExistingCustomer === 'false' ||
                    bankingDetails.isUblCustomer === 'No' || 
                    bankingDetails.isUblCustomer === false || 
                    bankingDetails.isUblCustomer === 'false'
                  }
                  onChange={(e) => {
                    handleBankingChange('isExistingCustomer', 'No');
                    handleBankingChange('isUblCustomer', 'No'); // Backwards compatibility
                  }}
                /> 
                No
              </label>
            </div>
          </div>
          
          {/* Account Number (conditional) */}
          {((bankingDetails.isExistingCustomer === 'Yes' || bankingDetails.isUblCustomer === 'Yes') || 
            (bankingDetails.isExistingCustomer === true || bankingDetails.isUblCustomer === true) ||
            (bankingDetails.isExistingCustomer === 'true' || bankingDetails.isUblCustomer === 'true')) && (
            <div>
              <label className="block mb-2 font-medium">Account Number *</label>
              <input 
                type="text" 
                className={getFieldClasses('actt_no')}
                placeholder="Account Number" 
                value={bankingDetails.accountNumber || bankingDetails.actt_no || bankingDetails.ublAccountNumber || ""}
                onChange={(e) => {
                  handleBankingChange('accountNumber', e.target.value);
                  handleBankingChange('actt_no', e.target.value); // Backwards compatibility
                  handleBankingChange('ublAccountNumber', e.target.value); // Backwards compatibility
                }}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

