// components/forms/PlatinumDeclarationForm.tsx
"use client";
import { useCustomer } from "@/contexts/CustomerContext";
import { PlatinumCustomerData } from "@/types/platinum-types";

export const PlatinumDeclarationForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  // Use type assertion to work with the extended type
  const typedCustomerData = customerData as unknown as PlatinumCustomerData;
  const declaration = typedCustomerData?.declaration || {};

  const handleInputChange = (field: string, value: any) => {
    updateCustomerData({
      declaration: {
        ...declaration,
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
      <h3 className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-primary text-primary-foreground">6. Declaration & Signature</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
        <label className="block text-sm font-medium mb-2">
          I hereby declare that the information provided is true and complete to the best of my knowledge and I agree to the terms and conditions of the Platinum Credit Card.
        </label>
        <div className="flex gap-6 mt-4">
          <label className="flex items-center gap-2">
            <input 
              type="checkbox" 
              checked={declaration.agreed === true}
              onChange={(e) => handleInputChange("agreed", e.target.checked)}
            /> I Agree
          </label>
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Applicant Signature</label>
            <input
              type="file"
              className="w-full rounded-xl border border-gray-300 px-4 py-2"
              onChange={(e) => handleFileChange("signature", e)}
            />
            {declaration.signature && (
              <p className="text-xs text-gray-500 mt-1">File: {declaration.signature}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              className="w-full rounded-xl border border-gray-300 px-4 py-2"
              value={declaration.date || ''}
              onChange={(e) => handleInputChange("date", e.target.value)}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
