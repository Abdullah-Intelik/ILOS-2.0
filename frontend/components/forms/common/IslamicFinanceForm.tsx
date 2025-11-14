"use client";
import React from 'react';
import { useCustomer } from '@/contexts/CustomerContext';

/**
 * IslamicFinanceForm - Islamic/Shariah-compliant financing details
 * Used by AmeenDrive and Islamic SMEASAAN products
 * 
 * Sections:
 * 1. Pricing Plan (KIBOR-based, fixed, etc.)
 * 2. Musharakah Details (partnership financing)
 * 3. Rental Details (monthly rental, tenure)
 * 4. Agreement Understanding
 */

interface IslamicFinanceFormProps {
  /** Section number for sequential forms */
  sectionNumber?: number;
  /** Product type for context */
  productType?: 'AMEENDRIVE' | 'SMEASAAN';
}

export const IslamicFinanceForm: React.FC<IslamicFinanceFormProps> = ({
  sectionNumber,
  productType = 'AMEENDRIVE'
}) => {
  const { customerData, updateCustomerData } = useCustomer();

  const islamicDetails = customerData?.islamicFinanceDetails || {};

  const handleChange = (field: string, value: any) => {
    updateCustomerData({
      islamicFinanceDetails: {
        ...islamicDetails,
        [field]: value,
      },
    });
  };

  const sectionHeaderNumber = sectionNumber ? `${sectionNumber}. ` : '';

  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-primary text-primary-foreground">
        {sectionHeaderNumber}Islamic Finance Details
      </h3>

      <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="text-sm text-green-800">
          <strong>☪️ Shariah-Compliant Financing:</strong> This facility is structured according to Islamic banking principles, ensuring compliance with Shariah guidelines.
        </div>
      </div>

      {/* ==================== SECTION 1: PRICING PLAN ==================== */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-4 text-gray-700">📊 Pricing Structure</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border border-gray-200 rounded-xl p-6 bg-gray-50">
          
          {/* Pricing Plan */}
          <div>
            <label className="block mb-2 font-medium">Pricing Plan *</label>
            <select 
              className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
              value={islamicDetails.pricingPlan || ""}
              onChange={(e) => handleChange('pricingPlan', e.target.value)}
            >
              <option value="">Select Plan</option>
              <option value="KIBOR-based">KIBOR-based</option>
              <option value="Fixed">Fixed Rate</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>
          
          {/* Current KIBOR Rate */}
          <div>
            <label className="block mb-2 font-medium">Current KIBOR Rate (%)</label>
            <input 
              type="number" 
              step="0.01"
              min="0"
              className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
              placeholder="e.g., 12.50" 
              value={islamicDetails.currentKiborRate || ""}
              onChange={(e) => handleChange('currentKiborRate', e.target.value)}
            />
          </div>
          
          {/* Spread Rate */}
          <div>
            <label className="block mb-2 font-medium">Spread Rate (%)</label>
            <input 
              type="number" 
              step="0.01"
              min="0"
              className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
              placeholder="e.g., 3.00" 
              value={islamicDetails.spreadRate || ""}
              onChange={(e) => handleChange('spreadRate', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ==================== SECTION 2: MUSHARAKAH DETAILS ==================== */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-4 text-gray-700">🤝 Musharakah (Partnership) Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 bg-gray-50">
          
          {/* Musharakah Share Percentage */}
          <div>
            <label className="block mb-2 font-medium">Bank's Share (%)</label>
            <input 
              type="number" 
              step="0.01"
              min="0"
              max="100"
              className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
              placeholder="Bank's Ownership Share %" 
              value={islamicDetails.musharakahSharePercent || ""}
              onChange={(e) => handleChange('musharakahSharePercent', e.target.value)}
            />
          </div>
          
          {/* Musharakah Share Amount */}
          <div>
            <label className="block mb-2 font-medium">Bank's Share (PKR)</label>
            <input 
              type="number" 
              min="0"
              className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
              placeholder="Bank's Share Amount" 
              value={islamicDetails.musharakahShareAmount || ""}
              onChange={(e) => handleChange('musharakahShareAmount', e.target.value)}
            />
          </div>
          
          {/* Auto Financing Percentage */}
          <div>
            <label className="block mb-2 font-medium">Customer's Share (%)</label>
            <input 
              type="number" 
              step="0.01"
              min="0"
              max="100"
              className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
              placeholder="Customer's Ownership Share %" 
              value={islamicDetails.autoFinancingPercent || ""}
              onChange={(e) => handleChange('autoFinancingPercent', e.target.value)}
            />
          </div>
          
          {/* Auto Financing Amount */}
          <div>
            <label className="block mb-2 font-medium">Customer's Share (PKR)</label>
            <input 
              type="number" 
              min="0"
              className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
              placeholder="Customer's Share Amount" 
              value={islamicDetails.autoFinancingAmount || ""}
              onChange={(e) => handleChange('autoFinancingAmount', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ==================== SECTION 3: RENTAL DETAILS ==================== */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-4 text-gray-700">💵 Monthly Rental & Tenure</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border border-gray-200 rounded-xl p-6 bg-gray-50">
          
          {/* Monthly Rental */}
          <div>
            <label className="block mb-2 font-medium">Monthly Rental (PKR) *</label>
            <input 
              type="number" 
              min="0"
              className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
              placeholder="Monthly Rental Amount" 
              value={islamicDetails.monthlyRental || ""}
              onChange={(e) => handleChange('monthlyRental', e.target.value)}
            />
          </div>
          
          {/* Monthly Rental in Words */}
          <div className="md:col-span-2">
            <label className="block mb-2 font-medium">Monthly Rental (In Words)</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
              placeholder="e.g., Fifty Thousand Only" 
              value={islamicDetails.monthlyRentalInWords || ""}
              onChange={(e) => handleChange('monthlyRentalInWords', e.target.value)}
            />
          </div>
          
          {/* Loan Period */}
          <div>
            <label className="block mb-2 font-medium">Financing Period (Months) *</label>
            <input 
              type="number" 
              min="12"
              max="84"
              className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
              placeholder="e.g., 36, 48, 60" 
              value={islamicDetails.loanPeriod || ""}
              onChange={(e) => handleChange('loanPeriod', e.target.value)}
            />
          </div>
          
          {/* Delivery Option */}
          <div className="md:col-span-2">
            <label className="block mb-2 font-medium">Vehicle Delivery Option</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="deliveryOption" 
                  value="Immediate"
                  checked={islamicDetails.deliveryOption === 'Immediate'}
                  onChange={(e) => handleChange('deliveryOption', e.target.value)}
                /> 
                Immediate
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="deliveryOption" 
                  value="Scheduled"
                  checked={islamicDetails.deliveryOption === 'Scheduled'}
                  onChange={(e) => handleChange('deliveryOption', e.target.value)}
                /> 
                Scheduled
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== SECTION 4: AGREEMENT UNDERSTANDING ==================== */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-4 text-gray-700">✓ Agreement & Understanding</h4>
        <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
          <label className="flex items-start gap-3">
            <input 
              type="checkbox" 
              className="mt-1"
              checked={islamicDetails.agreementUnderstanding || false}
              onChange={(e) => handleChange('agreementUnderstanding', e.target.checked)}
            />
            <span className="text-sm">
              I understand and agree that this is a Shariah-compliant financing facility structured as <strong>Musharakah Mutanaqisah</strong> (diminishing partnership). 
              I acknowledge that the monthly payment represents rental for the use of the asset and gradual purchase of the bank's share. 
              I confirm that I have read and understood all terms and conditions of the Islamic financing agreement.
            </span>
          </label>
        </div>
      </div>

      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="text-sm text-green-800">
          <strong>📖 Note:</strong> All calculations and charges are in accordance with Shariah Advisory Board guidelines. 
          No interest (Riba) is charged; the profit is derived from asset rental and ownership transfer.
        </div>
      </div>
    </section>
  );
};

