"use client";
import React from "react";
import { useCustomer } from "@/contexts/CustomerContext";

export const CashplusApplicantDeclarationForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  
  // Defensive defaults (ensure declaration is always an object)
  const declaration = customerData?.declaration || {};
  
  // Helper to update declaration details
  const handleChange = (field: string, value: any) => {
    updateCustomerData({
      declaration: {
        ...declaration,
        [field]: value,
      },
    });
  };

  // Helper for file uploads
  const handleFileUpload = (field: string, file: File | null) => {
    if (!file) return;
    
    // In a real implementation, you might upload the file to a server
    // and store the URL. For now, we'll just store the file name.
    updateCustomerData({
      declaration: {
        ...declaration,
        [field]: file.name,
      },
    });
  };

  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-primary text-primary-foreground">Applicant's Declaration & Signature</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
        <div>
          <label className="block mb-2 font-medium">Applicant's Signature (must match CNIC) *</label>
          <input 
            type="file" 
            className="w-full border border-gray-300 rounded-xl bg-white px-4 py-2"
            onChange={(e) => handleFileUpload("signature", e.target.files ? e.target.files[0] : null)} 
          />
          {declaration.signature && (
            <p className="text-sm text-green-600 mt-1">
              File selected: {declaration.signature}
            </p>
          )}
        </div>
        <div>
          <label className="block mb-2 font-medium">Date *</label>
          <input 
            type="date" 
            className="w-full border border-gray-300 rounded-xl bg-white px-4 py-2"
            value={declaration.date || ""}
            onChange={(e) => handleChange("date", e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <span className="text-xs text-gray-500">📎 Note: Must attach photocopy of CNIC.</span>
        </div>
        <div className="md:col-span-2">
          <label className="flex items-center gap-2">
            <input 
              type="checkbox"
              checked={declaration.termsAgreed || false}
              onChange={(e) => handleChange("termsAgreed", e.target.checked)}
            />
            I agree to the terms and conditions of the loan application
          </label>
        </div>
      </div>
    </section>
  );
};
