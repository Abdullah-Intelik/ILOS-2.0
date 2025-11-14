"use client";
import React from "react";
import { useCustomer } from "@/contexts/CustomerContext";
import { FormSection } from "@/components/forms/common/FormSection";
import { ShieldCheck } from "lucide-react";

export const CashplusBankUseOnlyForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  
  // Defensive defaults (ensure bankUseOnly is always an object)
  const bankUseOnly = customerData?.bankUseOnly || {};
  
  // Helper to update bank use only data
  const handleChange = (field: string, value: any) => {
    updateCustomerData({
      bankUseOnly: {
        ...bankUseOnly,
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
      bankUseOnly: {
        ...bankUseOnly,
        [field]: file.name,
      },
    });
  };
  
  return (
    <FormSection
      sectionNumber={7}
      title="For Bank's Use Only"
      subtitle="Internal processing information (auto-filled by system)"
      icon={<ShieldCheck className="h-5 w-5" />}
      collapsible={true}
      defaultCollapsed={true}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block mb-2 font-medium">Application Source *</label>
          <div className="flex flex-wrap gap-3">
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="applicationSource" 
                value="Branch"
                checked={bankUseOnly.applicationSource === "Branch"}
                onChange={() => handleChange("applicationSource", "Branch")}
              /> 
              Branch
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="applicationSource" 
                value="DSF"
                checked={bankUseOnly.applicationSource === "DSF"}
                onChange={() => handleChange("applicationSource", "DSF")}
              /> 
              DSF
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="applicationSource" 
                value="TSF"
                checked={bankUseOnly.applicationSource === "TSF"}
                onChange={() => handleChange("applicationSource", "TSF")}
              /> 
              TSF
            </label>
          </div>
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-slate-700">Channel Code *</label>
          <input 
            type="text" 
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 font-medium bg-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all placeholder:text-slate-400" 
            placeholder="Channel Code" 
            value={bankUseOnly.channelCode || ""}
            onChange={(e) => handleChange("channelCode", e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-slate-700">SO Employee No. (Contractual) *</label>
          <input 
            type="text" 
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 font-medium bg-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all placeholder:text-slate-400" 
            placeholder="SO Employee No." 
            value={bankUseOnly.soEmployeeNo || ""}
            onChange={(e) => handleChange("soEmployeeNo", e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-slate-700">Program Code *</label>
          <input 
            type="text" 
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 font-medium bg-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all placeholder:text-slate-400" 
            placeholder="Program Code" 
            value={bankUseOnly.programCode || ""}
            onChange={(e) => handleChange("programCode", e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-slate-700">PB/BM Employee No. (Permanent) *</label>
          <input 
            type="text" 
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 font-medium bg-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all placeholder:text-slate-400" 
            placeholder="PB/BM Employee No." 
            value={bankUseOnly.pbEmployeeNo || ""}
            onChange={(e) => handleChange("pbEmployeeNo", e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-slate-700">Branch Code *</label>
          <input 
            type="text" 
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 font-medium bg-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all placeholder:text-slate-400" 
            placeholder="Branch Code" 
            value={bankUseOnly.branchCode || ""}
            onChange={(e) => handleChange("branchCode", e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-slate-700">SM Employee No. (Permanent) *</label>
          <input 
            type="text" 
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 font-medium bg-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all placeholder:text-slate-400" 
            placeholder="SM Employee No." 
            value={bankUseOnly.smEmployeeNo || ""}
            onChange={(e) => handleChange("smEmployeeNo", e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-slate-700">BM Signature & Stamp *</label>
          <input 
            type="file" 
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 font-medium bg-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
            onChange={(e) => handleFileUpload("bmSignature", e.target.files ? e.target.files[0] : null)}
          />
          {bankUseOnly.bmSignature && (
            <p className="text-xs text-slate-600 mt-1">
              File selected: {bankUseOnly.bmSignature}
            </p>
          )}
        </div>
      </div>
      <div className="mt-6 px-5 py-4 bg-gradient-to-r from-teal-50 to-emerald-50 border-l-4 border-teal-500 rounded-lg">
        <p className="text-sm text-slate-700 leading-relaxed">
          <span className="font-bold text-slate-900">📋 Note:</span> These fields are auto-populated by the system and filled by bank staff during processing.
        </p>
      </div>
    </FormSection>
  );
};
