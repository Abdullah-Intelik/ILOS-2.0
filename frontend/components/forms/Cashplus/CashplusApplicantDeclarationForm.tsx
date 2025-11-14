"use client";
import React from "react";
import { useCustomer } from "@/contexts/CustomerContext";
import { FormSection } from "@/components/forms/common/FormSection";
import { FileSignature } from "lucide-react";

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
    <FormSection
      sectionNumber={6}
      title="Declaration & Signature"
      subtitle="Confirm and sign the application"
      icon={<FileSignature className="h-5 w-5" />}
      required
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block mb-2 text-sm font-medium text-slate-700">Applicant's Signature (must match CNIC) *</label>
          <input 
            type="file" 
            className="w-full border border-slate-300 px-4 py-2.5 text-sm text-slate-700 bg-white focus:outline-none focus:border-slate-700 focus:ring-1 focus:ring-slate-700"
            onChange={(e) => handleFileUpload("signature", e.target.files ? e.target.files[0] : null)} 
          />
          {declaration.signature && (
            <p className="text-xs text-slate-600 mt-1">
              File selected: {declaration.signature}
            </p>
          )}
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-slate-700">Date *</label>
          <input 
            type="date" 
            className="w-full border border-slate-300 px-4 py-2.5 text-sm text-slate-700 bg-white focus:outline-none focus:border-slate-700 focus:ring-1 focus:ring-slate-700"
            value={declaration.date || ""}
            onChange={(e) => handleChange("date", e.target.value)}
          />
        </div>
        <div className="md:col-span-2 px-4 py-2.5 bg-slate-50 border-l-2 border-slate-400">
          <span className="text-xs text-slate-600"><strong>Note:</strong> Must attach photocopy of CNIC.</span>
        </div>
        <div className="md:col-span-2">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input 
              type="checkbox"
              className="w-4 h-4"
              checked={declaration.termsAgreed || false}
              onChange={(e) => handleChange("termsAgreed", e.target.checked)}
            />
            I agree to the terms and conditions of the loan application
          </label>
        </div>
      </div>
    </FormSection>
  );
};
