"use client";
import React from "react";
import { useCustomer } from "@/contexts/CustomerContext";

export const CreditCardLoansForm: React.FC = () => {
  const { customerData, updateCustomerData } = useCustomer();
  const rows: Array<any> = Array.isArray(customerData?.creditCardLoans) ? customerData!.creditCardLoans! : [];

  const updateRow = (index: number, field: string, value: string) => {
    const updated = [...rows];
    updated[index] = { ...(updated[index] || {}), [field]: value };
    updateCustomerData({ creditCardLoans: updated });
  };

  const addRow = () => updateCustomerData({ creditCardLoans: [...rows, {}] });
  const removeRow = (idx: number) => updateCustomerData({ creditCardLoans: rows.filter((_, i) => i !== idx) });

  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-primary text-primary-foreground">15. Loans</h3>
      <div className="overflow-auto border border-gray-200 rounded-xl bg-gray-50">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 py-2 border text-left w-16">Sr #</th>
              <th className="px-2 py-2 border text-left">Issuing Bank</th>
              <th className="px-2 py-2 border text-left">Loan Type</th>
              <th className="px-2 py-2 border text-left">Loan Amount</th>
              <th className="px-2 py-2 border text-left">Monthly Installment</th>
              <th className="px-2 py-2 border w-16"></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td className="px-2 py-2 border text-gray-500" colSpan={6}>No rows added yet.</td>
              </tr>
            )}
            {rows.map((row, idx) => (
              <tr key={idx}>
                <td className="px-2 py-1 border">{idx + 1}</td>
                <td className="px-2 py-1 border"><input className={inputClass} value={row.issuing_bank || ""} onChange={e => updateRow(idx, 'issuing_bank', e.target.value)} placeholder="Issuing Bank" /></td>
                <td className="px-2 py-1 border"><input className={inputClass} value={row.loan_type || ""} onChange={e => updateRow(idx, 'loan_type', e.target.value)} placeholder="Loan Type" /></td>
                <td className="px-2 py-1 border"><input className={inputClass} value={row.loan_amount || ""} onChange={e => updateRow(idx, 'loan_amount', e.target.value)} placeholder="Amount" /></td>
                <td className="px-2 py-1 border"><input className={inputClass} value={row.monthly_installment || ""} onChange={e => updateRow(idx, 'monthly_installment', e.target.value)} placeholder="Monthly Installment" /></td>
                <td className="px-2 py-1 border text-center"><button type="button" className="text-red-600 text-sm" onClick={() => removeRow(idx)}>✕</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3">
        <button type="button" className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-sm" onClick={addRow}>Add row</button>
      </div>
    </section>
  );
};

const inputClass = "w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm";


