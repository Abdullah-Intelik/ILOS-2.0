"use client";
import React from "react";
import { useCustomer } from "@/contexts/CustomerContext";

export const CreditCardOtherCreditCardsForm: React.FC = () => {
  const { customerData, updateCustomerData } = useCustomer();
  const rows: Array<any> = Array.isArray(customerData?.otherCreditCards) ? customerData!.otherCreditCards! : [];

  const updateRow = (index: number, field: string, value: string) => {
    const updated = [...rows];
    updated[index] = { ...(updated[index] || {}), [field]: value };
    updateCustomerData({ otherCreditCards: updated });
  };

  const addRow = () => updateCustomerData({ otherCreditCards: [...rows, {}] });
  const removeRow = (idx: number) => updateCustomerData({ otherCreditCards: rows.filter((_, i) => i !== idx) });

  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-primary text-primary-foreground">14. Other Credit Cards</h3>
      <div className="overflow-auto border border-gray-200 rounded-xl bg-gray-50">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 py-2 border text-left w-16">Sr #</th>
              <th className="px-2 py-2 border text-left">Bank Name</th>
              <th className="px-2 py-2 border text-left">Card Number</th>
              <th className="px-2 py-2 border text-left">Credit Limit</th>
              <th className="px-2 py-2 border w-16"></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td className="px-2 py-2 border text-gray-500" colSpan={5}>No rows added yet.</td>
              </tr>
            )}
            {rows.map((row, idx) => (
              <tr key={idx}>
                <td className="px-2 py-1 border">{idx + 1}</td>
                <td className="px-2 py-1 border"><input className={inputClass} value={row.bank_name || ""} onChange={e => updateRow(idx, 'bank_name', e.target.value)} placeholder="Bank Name" /></td>
                <td className="px-2 py-1 border"><input className={inputClass} value={row.card_number || ""} onChange={e => updateRow(idx, 'card_number', e.target.value)} placeholder="Card Number" /></td>
                <td className="px-2 py-1 border"><input className={inputClass} value={row.credit_limit || ""} onChange={e => updateRow(idx, 'credit_limit', e.target.value)} placeholder="Credit Limit" /></td>
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


