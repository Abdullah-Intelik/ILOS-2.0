"use client";
import React from "react";
import { useCustomer } from "@/contexts/CustomerContext";
import { FormSection } from "@/components/forms/common/FormSection";
import { DollarSign } from "lucide-react";

export const CashplusLoanPreferenceForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  
  // Defensive defaults (ensure loanPreference is always an object)
  const loanPreference = customerData?.loanPreference || {};
  
  // Helper to update loan preference in global context
  const handleChange = (field: string, value: any) => {
    updateCustomerData({
      loanPreference: {
        ...loanPreference,
        [field]: value,
      },
    });
  };

  return (
    <FormSection
      sectionNumber={2}
      title="Loan Preference Details"
      subtitle="Specify your loan requirements"
      icon={<DollarSign className="h-5 w-5" />}
      required
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block mb-2 text-sm font-medium text-slate-700">Loan Type *</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="loan_type" 
                value="normal"
                checked={loanPreference.loanType === "normal"}
                onChange={() => handleChange("loanType", "normal")} 
              /> 
              Normal
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="loan_type" 
                value="top_up" 
                checked={loanPreference.loanType === "top_up"}
                onChange={() => handleChange("loanType", "top_up")} 
              /> 
              Top up
            </label>
          </div>
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-slate-700">Amount Requested *</label>
          <input 
            type="number" 
            name="amount_requested"
            className="w-full border border-slate-300 px-4 py-2.5 text-sm text-slate-700 bg-white focus:outline-none focus:border-slate-700 focus:ring-1 focus:ring-slate-700" 
            placeholder="Amount Requested" 
            value={loanPreference.amountRequested || ""}
            onChange={(e) => handleChange("amountRequested", e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-slate-700">Minimum Amount Acceptable *</label>
          <input 
            type="number" 
            name="min_amount_acceptable"
            className="w-full border border-slate-300 px-4 py-2.5 text-sm text-slate-700 bg-white focus:outline-none focus:border-slate-700 focus:ring-1 focus:ring-slate-700" 
            placeholder="Minimum Acceptable" 
            value={loanPreference.minAmountAcceptable || ""}
            onChange={(e) => handleChange("minAmountAcceptable", e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-slate-700">Max Affordable Installment *</label>
          <input 
            type="number" 
            name="max_affordable_installment"
            className="w-full border border-slate-300 px-4 py-2.5 text-sm text-slate-700 bg-white focus:outline-none focus:border-slate-700 focus:ring-1 focus:ring-slate-700" 
            placeholder="Max Affordable Installment" 
            value={loanPreference.maxAffordableInstallment || ""}
            onChange={(e) => handleChange("maxAffordableInstallment", e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-slate-700">Tenure *</label>
          <div className="flex flex-wrap gap-3">
            {[1,2,3,4,5].map(y => (
              <label key={y} className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="tenure" 
                  value={y}
                  checked={loanPreference.tenure === y || loanPreference.tenure === y.toString()}
                  onChange={() => handleChange("tenure", y)}
                /> 
                {y} Year{y>1?'s':''}
              </label>
            ))}
          </div>
        </div>
      </div>
    </FormSection>
  );
};
