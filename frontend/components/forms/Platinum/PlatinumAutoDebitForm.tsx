// components/forms/PlatinumAutoDebitForm.tsx
"use client";
import { useCustomer } from "@/contexts/CustomerContext";
import { PlatinumCustomerData } from "@/types/platinum-types";

export const PlatinumAutoDebitForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  // Use type assertion to work with the extended type
  const typedCustomerData = customerData as unknown as PlatinumCustomerData;
  const autoDebit = typedCustomerData?.autoDebit || {};

  const handleInputChange = (field: string, value: any) => {
    updateCustomerData({
      autoDebit: {
        ...autoDebit,
        [field]: value
      }
    } as unknown as Partial<any>);
  };

  const handleFileChange = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const fileName = e.target.files[0].name;
      handleInputChange(field, fileName);
    }
  };

  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-primary text-primary-foreground">6. Auto Debit Instruction</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
        <label className="block text-sm font-medium mb-1">Payment Option</label>
        <div className="flex gap-6">
          <label className="flex items-center gap-2">
            <input 
              type="radio" 
              name="paymentOption"
              checked={autoDebit.paymentOption === "Minimum"} 
              onChange={() => handleInputChange("paymentOption", "Minimum")}
            /> Minimum
          </label>
          <label className="flex items-center gap-2">
            <input 
              type="radio" 
              name="paymentOption" 
              checked={autoDebit.paymentOption === "Full"} 
              onChange={() => handleInputChange("paymentOption", "Full")}
            /> Full
          </label>
        </div>
        <div className="mt-6">
          <label className="block text-sm font-medium mb-1">Signature of Applicant</label>
          <input 
            type="file" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white"
            onChange={(e) => handleFileChange("signature", e)}
          />
          {autoDebit.signature && (
            <p className="text-xs text-gray-500 mt-1">File: {autoDebit.signature}</p>
          )}
        </div>
      </div>
    </section>
  );
};
