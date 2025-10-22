"use client";
import { useCustomer } from "@/contexts/CustomerContext";
import { useState } from "react";

export const CreditCardDeclarationForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  const declaration = customerData?.declaration || {};
  const [signatureFile, setSignatureFile] = useState<File | null>(null);

  const handleDeclarationChange = (field: string, value: string | boolean) => {
    updateCustomerData({
      declaration: {
        ...declaration,
        [field]: value
      }
    });
  };

  // Handle file upload for signature
  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSignatureFile(file);
      
      // For demo purposes we're just storing the file name
      // In production, you would handle proper file upload to server
      handleDeclarationChange('signature', file.name);
    }
  };

  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-primary text-primary-foreground">13. Declaration & Signature</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
        <label className="block text-sm font-medium mb-2">
          I hereby declare that the information provided is true and complete to the best of my knowledge and I agree to the terms and conditions of the UBL Credit Card.
        </label>
        <div className="flex gap-6 mt-4">
          <label className="flex items-center gap-2">
            <input 
              type="checkbox" 
              checked={declaration.termsAgreed === true}
              onChange={e => handleDeclarationChange('termsAgreed', e.target.checked)}
            /> I Agree
          </label>
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Applicant Signature</label>
            <input
              type="file"
              className="w-full rounded-xl border border-gray-300 px-4 py-2"
              accept="image/*"
              onChange={handleSignatureUpload}
            />
            {declaration.signature && (
              <p className="text-xs text-green-600 mt-1">
                Signature file: {declaration.signature}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              className="w-full rounded-xl border border-gray-300 px-4 py-2"
              value={declaration.date || ''}
              onChange={e => handleDeclarationChange('date', e.target.value)}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
