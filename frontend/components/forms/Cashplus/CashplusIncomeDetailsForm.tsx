"use client";
import React from "react";
import { useCustomer } from "@/contexts/CustomerContext";

export const CashplusIncomeDetailsForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  
  // Defensive defaults (ensure incomeDetails is always an object)
  const incomeDetails = customerData?.incomeDetails || {};
  
  // Helper to update income details in global context
  const handleChange = (field: string, value: any) => {
    updateCustomerData({
      incomeDetails: {
        ...incomeDetails,
        [field]: value,
      },
    });
  };

  // Helper for highlighting prefilled fields
  const prefilledFields = new Set(
    Object.entries(incomeDetails)
      .filter(([k, v]) => !!v)
      .map(([k]) => k)
  );

  const getFieldClasses = (fieldName: string) => {
    const base = "w-full border border-gray-300 rounded-xl px-4 py-2";
    const prefilled = "bg-yellow-50 border-yellow-300";
    const normal = "bg-white";
    return `${base} ${prefilledFields.has(fieldName) ? prefilled : normal}`;
  };

  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-primary text-primary-foreground">5. Income Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
        <div>
          <label className="block mb-2 font-medium">Gross Monthly Salary *</label>
          <input 
            type="number" 
            className={getFieldClasses("grossMonthlySalary")}
            placeholder="Gross Monthly Salary" 
            value={incomeDetails.grossMonthlySalary || ""}
            onChange={(e) => handleChange("grossMonthlySalary", e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Other Monthly Income</label>
          <input 
            type="number" 
            className={getFieldClasses("otherMonthlyIncome")}
            placeholder="Other Monthly Income" 
            value={incomeDetails.otherMonthlyIncome || ""}
            onChange={(e) => handleChange("otherMonthlyIncome", e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Net Monthly Income *</label>
          <input 
            type="number" 
            className={getFieldClasses("netMonthlyIncome")}
            placeholder="Net Monthly Income" 
            value={incomeDetails.netMonthlyIncome || ""}
            onChange={(e) => handleChange("netMonthlyIncome", e.target.value)}
          />
        </div>
        <div className="md:col-span-3">
          <label className="block mb-2 font-medium">Other Income Sources *</label>
          <div className="flex flex-wrap gap-3">
            {["Rent", "Commission", "Business", "Bonus", "Other"].map((source) => (
              <label key={source} className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="otherIncomeSource" 
                  value={source}
                  checked={incomeDetails.otherIncomeSource === source}
                  onChange={(e) => handleChange("otherIncomeSource", e.target.value)}
                />
                {source}
              </label>
            ))}
            {incomeDetails.otherIncomeSource === "Other" && (
              <input 
                type="text" 
                className="rounded-xl border border-gray-300 bg-white px-4 py-2"
                placeholder="If Other, specify" 
                value={incomeDetails.otherIncomeSourceSpecify || ""}
                onChange={(e) => handleChange("otherIncomeSourceSpecify", e.target.value)}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
