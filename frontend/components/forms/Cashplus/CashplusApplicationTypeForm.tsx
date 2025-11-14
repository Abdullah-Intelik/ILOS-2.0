"use client";
import React from "react";
import { useCustomer } from "@/contexts/CustomerContext";
import { FormSection } from "@/components/forms/common/FormSection";
import { FileText } from "lucide-react";

// ✅ Helper: Convert number to words (Pakistani format: Lac, Crore)
const numberToWords = (num: number | string) => {
  const amount = typeof num === 'string' ? parseFloat(num.replace(/,/g, '')) : num;
  if (isNaN(amount) || amount === 0) return '';
  
  if (amount >= 10000000) { // 1 Crore = 10 Million
    return `(${(amount / 10000000).toFixed(2)} Crore)`;
  } else if (amount >= 100000) { // 1 Lac = 100 Thousand
    return `(${(amount / 100000).toFixed(2)} Lac)`;
  } else if (amount >= 1000) {
    return `(${(amount / 1000).toFixed(0)} Thousand)`;
  }
  return '';
};

export const CashplusApplicationTypeForm = () => {
  const { customerData, updateCustomerData } = useCustomer();

  // Get application details
  const applicationDetails = customerData?.applicationDetails || {};

  // Helper to update application details
  const handleChange = (field: string, value: any) => {
    updateCustomerData({
      applicationDetails: {
        ...applicationDetails,
        [field]: value,
        ...(field === "loanPurpose" && value !== "Other" ? { loanPurposeOther: "" } : {}),
      },
    });
  };

  return (
    <FormSection
      sectionNumber={1}
      title="Application Details"
      subtitle="Specify your loan requirements"
      required
    >
      {/* Purpose of Loan */}
      <div>
        <label className="block mb-3 text-sm font-medium text-slate-700">
          Purpose of Loan <span className="text-red-600">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {["Education", "Travel", "Wedding", "Medical", "Business", "Home Improvement", "Debt Consolidation", "Other"].map((purpose) => (
            <label 
              key={purpose} 
              className={`flex items-center gap-2 px-4 py-3 border rounded-lg cursor-pointer transition-all ${
                applicationDetails.loanPurpose === purpose 
                  ? 'border-teal-500 bg-teal-50 shadow-sm' 
                  : 'border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400'
              }`}
            >
              <input
                type="radio"
                name="loanPurpose"
                value={purpose}
                checked={applicationDetails.loanPurpose === purpose}
                onChange={(e) => handleChange("loanPurpose", e.target.value)}
                className="w-4 h-4 text-teal-500 focus:ring-teal-500"
              />
              <span className="text-sm text-slate-900 font-medium">{purpose}</span>
            </label>
          ))}
        </div>
        {applicationDetails.loanPurpose === "Other" && (
          <input
            type="text"
            className="mt-3 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 font-medium focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all placeholder:text-slate-400"
            placeholder="Please specify the purpose of your loan"
            value={applicationDetails.loanPurposeOther || ""}
            onChange={(e) => handleChange("loanPurposeOther", e.target.value)}
          />
        )}
      </div>

      {/* Amount and Tenure */}
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        {/* Amount Requested */}
        <div>
          <label className="block mb-2 text-sm font-medium text-slate-700">
            Amount Requested <span className="text-red-600">*</span>
          </label>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600 font-semibold whitespace-nowrap">
              PKR
            </span>
            <div className="flex-1">
              <input
                type="text"
                inputMode="numeric"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 font-medium focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
                placeholder="100,000"
                value={applicationDetails.requestedAmount || ""}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d]/g, '');
                  handleChange("requestedAmount", value);
                }}
              />
              {applicationDetails.requestedAmount && (
                <p className="text-xs text-teal-600 font-medium mt-1">
                  {numberToWords(applicationDetails.requestedAmount)}
                </p>
              )}
            </div>
          </div>
          <p className="mt-1.5 text-xs text-slate-500">
            Minimum: PKR 10,000 | Maximum: PKR 5,000,000
          </p>
        </div>

        {/* Tenure */}
        <div>
          <label className="block mb-2 text-sm font-medium text-slate-700">
            Tenure <span className="text-red-600">*</span>
          </label>
          <select
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 font-medium focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
            value={applicationDetails.tenure || ""}
            onChange={(e) => handleChange("tenure", e.target.value)}
          >
            <option value="">Select tenure</option>
            <option value="12">1 Year (12 months)</option>
            <option value="24">2 Years (24 months)</option>
            <option value="36">3 Years (36 months)</option>
            <option value="48">4 Years (48 months)</option>
            <option value="60">5 Years (60 months)</option>
          </select>
          <p className="mt-1.5 text-xs text-slate-500">
            Longer tenure = Lower monthly installments
          </p>
        </div>
      </div>

      {/* Monthly Installment (Auto-calculated) */}
      {applicationDetails.requestedAmount && applicationDetails.tenure && (
        <div className="mt-6 p-5 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-1">Estimated Monthly Installment</p>
              <p className="text-xs text-slate-600">Based on flat interest rate (approximate)</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-teal-700">
                PKR {(() => {
                  const amount = parseInt(String(applicationDetails.requestedAmount)) || 0;
                  const months = parseInt(String(applicationDetails.tenure)) || 1;
                  const interestRate = 0.15; // 15% annual flat rate (adjust as needed)
                  const totalInterest = amount * interestRate * (months / 12);
                  const totalAmount = amount + totalInterest;
                  const monthlyPayment = Math.round(totalAmount / months);
                  return monthlyPayment.toLocaleString();
                })()}
              </p>
              <p className="text-xs text-slate-500 mt-1">per month</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-6 px-5 py-4 bg-gradient-to-r from-teal-50 to-emerald-50 border-l-4 border-teal-500 rounded-lg">
        <p className="text-sm text-slate-700 leading-relaxed">
          <span className="font-bold text-slate-900">📋 Note:</span> Banking details such as branch and account information will be collected in the Personal Information section.
        </p>
      </div>
    </FormSection>
  );
};
