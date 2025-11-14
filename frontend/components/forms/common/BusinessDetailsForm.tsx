"use client";
import React from 'react';
import { useCustomer } from '@/contexts/CustomerContext';

/**
 * BusinessDetailsForm - Business/SME information for SMEASAAN and CommercialVehicle
 * Used by business/commercial financing products
 * 
 * Sections:
 * 1. Business Information (company name, legal status, type, establishment date)
 * 2. Business Operations (sector, employees, annual sales)
 * 3. Tax & Registration (NTN, registration number)
 * 4. Banking Relationship (main account details)
 */

interface BusinessDetailsFormProps {
  /** Section number for sequential forms */
  sectionNumber?: number;
  /** Product type for context */
  productType?: 'SMEASAAN' | 'COMMERCIALVEHICLE';
}

export const BusinessDetailsForm: React.FC<BusinessDetailsFormProps> = ({
  sectionNumber,
  productType = 'SMEASAAN'
}) => {
  const { customerData, updateCustomerData } = useCustomer();

  const businessDetails = customerData?.businessDetails || {};

  const handleChange = (field: string, value: any) => {
    updateCustomerData({
      businessDetails: {
        ...businessDetails,
        [field]: value,
      },
    });
  };

  const sectionHeaderNumber = sectionNumber ? `${sectionNumber}. ` : '';

  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-primary text-primary-foreground">
        {sectionHeaderNumber}Business Details
      </h3>

      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="text-sm text-blue-800">
          <strong>🏢 Business Information:</strong> Please provide accurate business details. This information will be verified against official records.
        </div>
      </div>

      {/* ==================== SECTION 1: BUSINESS INFORMATION ==================== */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-4 text-gray-700">Company Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border border-gray-200 rounded-xl p-6 bg-gray-50">
          
          {/* Company Name */}
          <div className="md:col-span-2">
            <label className="block mb-2 font-medium">Company Name *</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
              placeholder="Registered Company Name" 
              value={businessDetails.companyName || ""}
              onChange={(e) => handleChange('companyName', e.target.value)}
            />
          </div>
          
          {/* Group Name */}
          <div>
            <label className="block mb-2 font-medium">Group Name</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
              placeholder="Group/Holding Company (Optional)" 
              value={businessDetails.groupName || ""}
              onChange={(e) => handleChange('groupName', e.target.value)}
            />
          </div>
          
          {/* Company Legal Status */}
          <div>
            <label className="block mb-2 font-medium">Legal Status *</label>
            <select 
              className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
              value={businessDetails.legalStatus || ""}
              onChange={(e) => handleChange('legalStatus', e.target.value)}
            >
              <option value="">Select Legal Status</option>
              <option value="Sole Proprietorship">Sole Proprietorship</option>
              <option value="Partnership">Partnership</option>
              <option value="Private Limited">Private Limited</option>
              <option value="Public Limited">Public Limited</option>
              <option value="AOP">Association of Persons (AOP)</option>
              <option value="NGO">NGO/Trust</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          {/* Type of Business */}
          <div>
            <label className="block mb-2 font-medium">Type of Business *</label>
            <select 
              className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
              value={businessDetails.businessType || ""}
              onChange={(e) => handleChange('businessType', e.target.value)}
            >
              <option value="">Select Type</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Trading">Trading</option>
              <option value="Services">Services</option>
              <option value="Retail">Retail</option>
              <option value="Wholesale">Wholesale</option>
              <option value="Construction">Construction</option>
              <option value="Transportation">Transportation</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          {/* Nature of Business */}
          <div>
            <label className="block mb-2 font-medium">Nature of Business *</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
              placeholder="e.g., Textile Trading, Logistics" 
              value={businessDetails.natureOfBusiness || ""}
              onChange={(e) => handleChange('natureOfBusiness', e.target.value)}
            />
          </div>
          
          {/* Business Establishment Date */}
          <div>
            <label className="block mb-2 font-medium">Establishment Date *</label>
            <input 
              type="date" 
              className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
              value={businessDetails.establishmentDate || ""}
              onChange={(e) => handleChange('establishmentDate', e.target.value)}
            />
          </div>
          
          {/* Years in Business */}
          <div>
            <label className="block mb-2 font-medium">Years in Business *</label>
            <input 
              type="number" 
              min="0"
              className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
              placeholder="Years of Operation" 
              value={businessDetails.yearsInBusiness || ""}
              onChange={(e) => handleChange('yearsInBusiness', e.target.value)}
            />
          </div>
          
          {/* Business Premises */}
          <div>
            <label className="block mb-2 font-medium">Business Premises *</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="businessPremises" 
                  value="Owned"
                  checked={businessDetails.businessPremises === 'Owned'}
                  onChange={(e) => handleChange('businessPremises', e.target.value)}
                /> 
                Owned
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="businessPremises" 
                  value="Rented"
                  checked={businessDetails.businessPremises === 'Rented'}
                  onChange={(e) => handleChange('businessPremises', e.target.value)}
                /> 
                Rented
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="businessPremises" 
                  value="Leased"
                  checked={businessDetails.businessPremises === 'Leased'}
                  onChange={(e) => handleChange('businessPremises', e.target.value)}
                /> 
                Leased
              </label>
            </div>
          </div>
          
          {/* Business Address */}
          <div className="md:col-span-3">
            <label className="block mb-2 font-medium">Business Address *</label>
            <textarea 
              rows={2}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
              placeholder="Complete Business Address" 
              value={businessDetails.businessAddress || ""}
              onChange={(e) => handleChange('businessAddress', e.target.value)}
            />
          </div>
          
          {/* Business Phone */}
          <div>
            <label className="block mb-2 font-medium">Business Landline *</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
              placeholder="Landline Number" 
              value={businessDetails.businessPhone || ""}
              onChange={(e) => handleChange('businessPhone', e.target.value)}
            />
          </div>
          
          {/* Business Mobile */}
          <div>
            <label className="block mb-2 font-medium">Business Mobile *</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
              placeholder="Mobile Number" 
              value={businessDetails.businessMobile || ""}
              onChange={(e) => handleChange('businessMobile', e.target.value)}
            />
          </div>
          
          {/* Business Fax */}
          <div>
            <label className="block mb-2 font-medium">Fax Number</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
              placeholder="Fax (Optional)" 
              value={businessDetails.faxNumber || ""}
              onChange={(e) => handleChange('faxNumber', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ==================== SECTION 2: BUSINESS OPERATIONS ==================== */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-4 text-gray-700">📊 Business Operations</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border border-gray-200 rounded-xl p-6 bg-gray-50">
          
          {/* Business Sector - Checkboxes for multiple selection */}
          <div className="md:col-span-3">
            <label className="block mb-2 font-medium">Business Sector(s) *</label>
            <div className="flex flex-wrap gap-3">
              {[
                { label: 'Small Enterprise (SE)', value: 'SE' },
                { label: 'Medium Enterprise (ME)', value: 'ME' },
                { label: 'Manufacturing', value: 'Manufacturing' },
                { label: 'Trading/Distribution', value: 'Trading' },
                { label: 'Wholesale/Retail', value: 'Retail' },
                { label: 'Services', value: 'Services' },
                { label: 'Individual', value: 'Individual' }
              ].map((sector) => (
                <label key={sector.value} className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={businessDetails[`sector_${sector.value}`] || false}
                    onChange={(e) => handleChange(`sector_${sector.value}`, e.target.checked)}
                  /> 
                  {sector.label}
                </label>
              ))}
            </div>
          </div>
          
          {/* Number of Employees */}
          <div>
            <label className="block mb-2 font-medium">Number of Employees *</label>
            <input 
              type="number" 
              min="1"
              className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
              placeholder="Total Employees" 
              value={businessDetails.numberOfEmployees || ""}
              onChange={(e) => handleChange('numberOfEmployees', e.target.value)}
            />
          </div>
          
          {/* Annual Sales */}
          <div className="md:col-span-2">
            <label className="block mb-2 font-medium">Annual Sales (PKR) *</label>
            <input 
              type="number" 
              min="0"
              className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
              placeholder="Annual Revenue/Turnover" 
              value={businessDetails.annualSales || ""}
              onChange={(e) => handleChange('annualSales', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ==================== SECTION 3: TAX & REGISTRATION ==================== */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-4 text-gray-700">📄 Tax & Registration</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border border-gray-200 rounded-xl p-6 bg-gray-50">
          
          {/* National Tax Number */}
          <div>
            <label className="block mb-2 font-medium">National Tax Number (NTN)</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
              placeholder="NTN (Optional)" 
              value={businessDetails.nationalTaxNumber || ""}
              onChange={(e) => handleChange('nationalTaxNumber', e.target.value)}
            />
          </div>
          
          {/* Tax Payer Status */}
          <div>
            <label className="block mb-2 font-medium">Tax Payer Status *</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="taxPayer" 
                  value="Yes"
                  checked={businessDetails.taxPayer === 'Yes'}
                  onChange={(e) => handleChange('taxPayer', e.target.value)}
                /> 
                Yes
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="taxPayer" 
                  value="No"
                  checked={businessDetails.taxPayer === 'No'}
                  onChange={(e) => handleChange('taxPayer', e.target.value)}
                /> 
                No
              </label>
            </div>
          </div>
          
          {/* Registration Number */}
          <div>
            <label className="block mb-2 font-medium">Registration Number</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
              placeholder="SECP/Chamber Registration No." 
              value={businessDetails.registrationNumber || ""}
              onChange={(e) => handleChange('registrationNumber', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ==================== SECTION 4: BANKING RELATIONSHIP ==================== */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-4 text-gray-700">🏦 Main Banking Relationship</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border border-gray-200 rounded-xl p-6 bg-gray-50">
          
          {/* Main Business Account Bank */}
          <div>
            <label className="block mb-2 font-medium">Main Bank *</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
              placeholder="Primary Bank Name" 
              value={businessDetails.mainBankName || ""}
              onChange={(e) => handleChange('mainBankName', e.target.value)}
            />
          </div>
          
          {/* Main Business Account Number */}
          <div>
            <label className="block mb-2 font-medium">Account Number *</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
              placeholder="Business Account Number" 
              value={businessDetails.mainAccountNumber || ""}
              onChange={(e) => handleChange('mainAccountNumber', e.target.value)}
            />
          </div>
          
          {/* Account Opening Date */}
          <div>
            <label className="block mb-2 font-medium">Account Open Date</label>
            <input 
              type="date" 
              className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
              value={businessDetails.accountOpenDate || ""}
              onChange={(e) => handleChange('accountOpenDate', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="text-sm text-blue-800">
          <strong>💡 Verification:</strong> Business details will be verified through SECP, FBR, and other regulatory bodies. 
          Please ensure all information is accurate and up-to-date.
        </div>
      </div>
    </section>
  );
};

