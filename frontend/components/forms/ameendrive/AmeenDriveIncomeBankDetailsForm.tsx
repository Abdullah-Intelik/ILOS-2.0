"use client";
import React, { useState } from 'react';
import { useCustomer } from '@/contexts/CustomerContext';

export const AmeenDriveIncomeBankDetailsForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  
  // Defensive defaults
  const ameenDrive = customerData?.ameenDrive || {};
  const incomeBank = ameenDrive.incomeBank || {};
  
  // Bank accounts state
  const [bankAccounts, setBankAccounts] = useState([
    { 
      bank_name: '', 
      branch: '', 
      account_no: '', 
      account_type: '',
      currency_type: ''
    },
    { 
      bank_name: '', 
      branch: '', 
      account_no: '', 
      account_type: '',
      currency_type: ''
    }
  ]);

  // Bank facilities state
  const [bankFacilities, setBankFacilities] = useState([
    {
      financing_payable_to: '',
      purpose_of_financing: '',
      date_financing_taken: '',
      outstanding_balance: '',
      monthly_installment: ''
    },
    {
      financing_payable_to: '',
      purpose_of_financing: '',
      date_financing_taken: '',
      outstanding_balance: '',
      monthly_installment: ''
    }
  ]);
  
  // Helper to update income and bank details
  const handleChange = (field: string, value: any) => {
    updateCustomerData({
      ameenDrive: {
        ...ameenDrive,
        incomeBank: {
          ...incomeBank,
          [field]: value,
        },
      },
    });
  };

  // Helper to update bank accounts
  const handleBankAccountChange = (index: number, field: string, value: any) => {
    const updatedAccounts = [...bankAccounts];
    updatedAccounts[index] = { ...updatedAccounts[index], [field]: value };
    setBankAccounts(updatedAccounts);
    
    // Update the context with all bank accounts
    updateCustomerData({
      ameenDrive: {
        ...ameenDrive,
        bank_accounts: updatedAccounts
      },
    });
  };

  // Helper to update bank facilities
  const handleBankFacilityChange = (index: number, field: string, value: any) => {
    const updatedFacilities = [...bankFacilities];
    updatedFacilities[index] = { ...updatedFacilities[index], [field]: value };
    setBankFacilities(updatedFacilities);
    
    // Update the context with all bank facilities
    updateCustomerData({
      ameenDrive: {
        ...ameenDrive,
        bank_facilities: updatedFacilities
      },
    });
  };

  // Helper for prefilled highlighting
  const prefilledFields = new Set(
    Object.entries(incomeBank).filter(([k, v]) => !!v).map(([k]) => k)
  );

  const getFieldClasses = (fieldName: string) => {
    const base = 'w-full border border-gray-300 rounded-xl px-4 py-2';
    const prefilled = 'bg-yellow-50 border-yellow-300';
    const normal = 'bg-white';
    return `${base} ${prefilledFields.has(fieldName) ? prefilled : normal}`;
  };

  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg font-semibold mb-4 p-4 bg-primary text-primary-foreground">8. Income Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
        <div>
          <label className="block mb-2 font-medium">Regular Monthly</label>
          <input 
            type="number" 
            className={getFieldClasses('regularMonthly')}
            placeholder="Regular Monthly" 
            value={incomeBank.regularMonthly || ''}
            onChange={(e) => handleChange('regularMonthly', e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Gross Income</label>
          <input 
            type="number" 
            className={getFieldClasses('grossIncome')}
            placeholder="Gross Income" 
            value={incomeBank.grossIncome || ''}
            onChange={(e) => handleChange('grossIncome', e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Net Take Home</label>
          <input 
            type="number" 
            className={getFieldClasses('netTakeHome')}
            placeholder="Net Take Home" 
            value={incomeBank.netTakeHome || ''}
            onChange={(e) => handleChange('netTakeHome', e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Other Monthly Income (if any)</label>
          <input 
            type="number" 
            className={getFieldClasses('otherIncome')}
            placeholder="Other Monthly Income" 
            value={incomeBank.otherIncome || ''}
            onChange={(e) => handleChange('otherIncome', e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Source of Other Income</label>
          <div className="flex flex-wrap gap-2">
            {['Business', 'Rent', 'Commission', 'Bonus', 'Other'].map((source) => (
              <label key={source} className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="otherIncome"
                  checked={incomeBank.otherIncomeSource === source}
                  onChange={() => handleChange('otherIncomeSource', source)} 
                /> {source}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block mb-2 font-medium">Monthly Income</label>
          <input 
            type="number" 
            className={getFieldClasses('monthlyIncome')}
            placeholder="Monthly Income" 
            value={incomeBank.monthlyIncome || ''}
            onChange={(e) => handleChange('monthlyIncome', e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Average Monthly Savings</label>
          <input 
            type="number" 
            className={getFieldClasses('monthlyAvgSavings')}
            placeholder="Average Monthly Savings" 
            value={incomeBank.monthlyAvgSavings || ''}
            onChange={(e) => handleChange('monthlyAvgSavings', e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Is your Spouse Employed?</label>
          <div className="flex gap-4">
            {['Yes', 'No', 'Not Applicable'].map((option) => (
              <label key={option} className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="spouseEmployed"
                  checked={incomeBank.spouseEmployed === option}
                  onChange={() => handleChange('spouseEmployed', option)}
                /> {option}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block mb-2 font-medium">Source of Spouse's Income</label>
          <input 
            type="text" 
            className={getFieldClasses('spouseIncomeSource')}
            placeholder="Source of Spouse's Income" 
            value={incomeBank.spouseIncomeSource || ''}
            onChange={(e) => handleChange('spouseIncomeSource', e.target.value)}
          />
        </div>
      </div>
      <div className="mt-8">
        <h4 className="text-lg font-semibold mb-4 text-primary">Bank Details (Bank 1 & 2)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
          {[0, 1].map((i) => (
            <div key={i} className="border p-4 rounded-xl">
              <label className="block mb-2 font-medium">Bank {i+1} Name</label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-xl px-4 py-2 mb-2" 
                placeholder={`Bank ${i+1} Name`}
                value={bankAccounts[i].bank_name}
                onChange={(e) => handleBankAccountChange(i, 'bank_name', e.target.value)}
              />
              <label className="block mb-2 font-medium">Branch</label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-xl px-4 py-2 mb-2" 
                placeholder="Branch"
                value={bankAccounts[i].branch}
                onChange={(e) => handleBankAccountChange(i, 'branch', e.target.value)}
              />
              <label className="block mb-2 font-medium">Account No.</label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-xl px-4 py-2 mb-2" 
                placeholder="Account No."
                value={bankAccounts[i].account_no}
                onChange={(e) => handleBankAccountChange(i, 'account_no', e.target.value)}
              />
              <label className="block mb-2 font-medium">Type of Account</label>
              <div className="flex gap-3 mb-2">
                {['Current', 'Saving', 'Certificate'].map((type) => (
                  <label key={type} className="flex items-center gap-2">
                    <input 
                      type="radio" 
                      name={`accountType${i}`}
                      checked={bankAccounts[i].account_type === type}
                      onChange={() => handleBankAccountChange(i, 'account_type', type)}
                    /> {type}
                  </label>
                ))}
              </div>
              <label className="block mb-2 font-medium">Currency Type</label>
              <div className="flex gap-3">
                {['Local', 'Foreign'].map((type) => (
                  <label key={type} className="flex items-center gap-2">
                    <input 
                      type="radio" 
                      name={`currencyType${i}`}
                      checked={bankAccounts[i].currency_type === type}
                      onChange={() => handleBankAccountChange(i, 'currency_type', type)}
                    /> {type}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <h4 className="text-lg font-semibold mt-8 mb-4">Additional Bank Details (Multiple)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
          {[0, 1].map((i) => (
            <div key={i} className="border p-4 rounded-xl">
              <label className="block mb-2 font-medium">Financing Payable to</label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-xl px-4 py-2 mb-2" 
                placeholder="Financing Payable to"
                value={bankFacilities[i].financing_payable_to}
                onChange={(e) => handleBankFacilityChange(i, 'financing_payable_to', e.target.value)}
              />
              <label className="block mb-2 font-medium">Purpose of Financing</label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-xl px-4 py-2 mb-2" 
                placeholder="Purpose of Financing"
                value={bankFacilities[i].purpose_of_financing}
                onChange={(e) => handleBankFacilityChange(i, 'purpose_of_financing', e.target.value)}
              />
              <label className="block mb-2 font-medium">Date Financing Taken</label>
              <input 
                type="date" 
                className="w-full border border-gray-300 rounded-xl px-4 py-2 mb-2"
                value={bankFacilities[i].date_financing_taken}
                onChange={(e) => handleBankFacilityChange(i, 'date_financing_taken', e.target.value)}
              />
              <label className="block mb-2 font-medium">Outstanding Balance (Rs.)</label>
              <input 
                type="number" 
                className="w-full border border-gray-300 rounded-xl px-4 py-2 mb-2" 
                placeholder="Outstanding Balance (Rs.)"
                value={bankFacilities[i].outstanding_balance}
                onChange={(e) => handleBankFacilityChange(i, 'outstanding_balance', e.target.value)}
              />
              <label className="block mb-2 font-medium">Monthly Installment (Rs.)</label>
              <input 
                type="number" 
                className="w-full border border-gray-300 rounded-xl px-4 py-2 mb-2" 
                placeholder="Monthly Installment (Rs.)"
                value={bankFacilities[i].monthly_installment}
                onChange={(e) => handleBankFacilityChange(i, 'monthly_installment', e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
