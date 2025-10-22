"use client";
import React, { useState, useEffect } from 'react';
import { useCustomer } from '@/contexts/CustomerContext';

interface Props {
  formData: any;
  handleInputChange: (e: React.ChangeEvent<any>) => void;
}

export const IncomeDetailsForm = ({ formData, handleInputChange }: Props) => {
  const { customerData } = useCustomer();

  const [selectedOtherIncomes, setSelectedOtherIncomes] = useState<string[]>([]);
  const [selectedStatements, setSelectedStatements] = useState<string[]>([]);

  useEffect(() => {
    if (!customerData) return;

    const updates: Record<string, any> = {};

    if (customerData.employmentDetails) {
      if (customerData.employmentDetails.monthlySalary)
        updates.gross_monthly_salary = customerData.employmentDetails.monthlySalary;
      if (customerData.employmentDetails.otherIncome)
        updates.other_monthly_income = customerData.employmentDetails.otherIncome;
      if (customerData.employmentDetails.netSalary)
        updates.net_monthly_income = customerData.employmentDetails.netSalary;
      if (customerData.employmentDetails.spouseIncome)
        updates.spousal_income = customerData.employmentDetails.spouseIncome;
      if (customerData.employmentDetails.spouseIncomeSource)
        updates.spouse_income_source = customerData.employmentDetails.spouseIncomeSource;
      if (customerData.employmentDetails.spouseEmployed)
        updates.spouse_employed = customerData.employmentDetails.spouseEmployed;
    }

    // total_gross_monthly_income
    const gross = parseFloat(updates.gross_monthly_salary || 0);
    const other = parseFloat(updates.other_monthly_income || 0);
    updates.total_gross_monthly_income = gross + other;

    Object.entries(updates).forEach(([key, value]) => {
      handleInputChange({ target: { name: key, value } } as React.ChangeEvent<any>);
    });
  }, [customerData]);

  const toggleValue = (field: string, value: string, selected: string[], setSelected: (val: string[]) => void) => {
    const updated = selected.includes(value)
      ? selected.filter(v => v !== value)
      : [...selected, value];

    setSelected(updated);
    handleInputChange({ target: { name: field, value: updated.join(',') } } as React.ChangeEvent<any>);
  };

  const getClass = () =>
    "w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2 text-base shadow-sm transition placeholder:text-gray-400";

  return (
    <section className="bg-white rounded-2xl shadow p-8 mb-10">
      <h2 className="text-2xl text-white font-semibold mb-4 rounded-lg p-4 bg-primary text-primary-foreground">7. Income Details</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <input
          type="number"
          name="gross_monthly_salary"
          placeholder="Gross Monthly Salary"
          value={formData.gross_monthly_salary || ""}
          onChange={handleInputChange}
          className={getClass()}
        />
        <input
          type="number"
          name="other_monthly_income"
          placeholder="Other Monthly Income"
          value={formData.other_monthly_income || ""}
          onChange={handleInputChange}
          className={getClass()}
        />
        <input
          type="number"
          name="total_gross_monthly_income"
          placeholder="Total Gross Monthly Income"
          value={formData.total_gross_monthly_income || ""}
          onChange={handleInputChange}
          className={getClass()}
        />
        <input
          type="number"
          name="net_monthly_income"
          placeholder="Net Monthly Income"
          value={formData.net_monthly_income || ""}
          onChange={handleInputChange}
          className={getClass()}
        />

        {/* Other Income */}
        <div className="md:col-span-2">
          <label className="block mb-2 text-sm font-semibold">Other Income Sources</label>
          {["Rent", "Commission", "Business", "Bonus"].map((source) => (
            <label key={source} className="mr-4 inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedOtherIncomes.includes(source)}
                onChange={() => toggleValue("other_income_type", source, selectedOtherIncomes, setSelectedOtherIncomes)}
              />
              {source}
            </label>
          ))}
          <input
            type="text"
            name="other_income_specify"
            placeholder="Other (Specify)"
            value={formData.other_income_specify || ""}
            onChange={handleInputChange}
            className="mt-2 w-full md:w-64"
          />
        </div>

        {/* Spouse */}
        <div className="md:col-span-2">
          <label className="block mb-2 text-sm font-semibold">Is Spouse Employed?</label>
          {["Yes", "No", "N/A"].map((val) => (
            <label key={val} className="mr-4 inline-flex items-center gap-2">
              <input
                type="radio"
                name="spouse_employed"
                value={val}
                checked={formData.spouse_employed === val}
                onChange={handleInputChange}
              />
              {val}
            </label>
          ))}
        </div>
        <input
          type="number"
          name="spousal_income"
          placeholder="Spousal Income"
          value={formData.spousal_income || ""}
          onChange={handleInputChange}
          className={getClass()}
        />
        <input
          type="text"
          name="spouse_income_source"
          placeholder="Spouse's Income Source"
          value={formData.spouse_income_source || ""}
          onChange={handleInputChange}
          className={getClass()}
        />

        {/* Statement to be Sent */}
        <div className="md:col-span-2">
          <label className="block mb-2 text-sm font-semibold">Statement to be Sent</label>
          {["Home", "Office", "Mail"].map((val) => (
            <label key={val} className="mr-4 inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedStatements.includes(val)}
                onChange={() => toggleValue("statement_to_be_sent", val, selectedStatements, setSelectedStatements)}
              />
              {val}
            </label>
          ))}
        </div>
      </div>
    </section>
  );
};
