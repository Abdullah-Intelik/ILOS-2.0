"use client";
import React from "react";
import { useCustomer } from "@/contexts/CustomerContext";

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
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-primary text-primary-foreground">1. Loan Preference Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
        <div>
          <label className="block mb-2">Loan Type *</label>
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
          <label className="block mb-2">Amount Requested *</label>
          <input 
            type="number" 
            name="amount_requested"
            className="w-full border rounded-xl bg-white px-4 py-2" 
            placeholder="Amount Requested" 
            value={loanPreference.amountRequested || ""}
            onChange={(e) => handleChange("amountRequested", e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2">Minimum Amount Acceptable *</label>
          <input 
            type="number" 
            name="min_amount_acceptable"
            className="w-full border rounded-xl bg-white px-4 py-2" 
            placeholder="Minimum Acceptable" 
            value={loanPreference.minAmountAcceptable || ""}
            onChange={(e) => handleChange("minAmountAcceptable", e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2">Max Affordable Installment *</label>
          <input 
            type="number" 
            name="max_affordable_installment"
            className="w-full border rounded-xl bg-white px-4 py-2" 
            placeholder="Max Affordable Installment" 
            value={loanPreference.maxAffordableInstallment || ""}
            onChange={(e) => handleChange("maxAffordableInstallment", e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2">Tenure *</label>
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
    </section>
  );
};
