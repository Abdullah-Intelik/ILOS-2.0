"use client";
import React from "react";
import { useCustomer } from "@/contexts/CustomerContext";

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
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-primary text-primary-foreground">For Bank's Use Only</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
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
          <label className="block mb-2 font-medium">Channel Code *</label>
          <input 
            type="text" 
            className="w-full border border-gray-300 rounded-xl bg-white px-4 py-2" 
            placeholder="Channel Code" 
            value={bankUseOnly.channelCode || ""}
            onChange={(e) => handleChange("channelCode", e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">SO Employee No. (Contractual) *</label>
          <input 
            type="text" 
            className="w-full border border-gray-300 rounded-xl bg-white px-4 py-2" 
            placeholder="SO Employee No." 
            value={bankUseOnly.soEmployeeNo || ""}
            onChange={(e) => handleChange("soEmployeeNo", e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Program Code *</label>
          <input 
            type="text" 
            className="w-full border border-gray-300 rounded-xl bg-white px-4 py-2" 
            placeholder="Program Code" 
            value={bankUseOnly.programCode || ""}
            onChange={(e) => handleChange("programCode", e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">PB/BM Employee No. (Permanent) *</label>
          <input 
            type="text" 
            className="w-full border border-gray-300 rounded-xl bg-white px-4 py-2" 
            placeholder="PB/BM Employee No." 
            value={bankUseOnly.pbEmployeeNo || ""}
            onChange={(e) => handleChange("pbEmployeeNo", e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Branch Code *</label>
          <input 
            type="text" 
            className="w-full border border-gray-300 rounded-xl bg-white px-4 py-2" 
            placeholder="Branch Code" 
            value={bankUseOnly.branchCode || ""}
            onChange={(e) => handleChange("branchCode", e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">SM Employee No. (Permanent) *</label>
          <input 
            type="text" 
            className="w-full border border-gray-300 rounded-xl bg-white px-4 py-2" 
            placeholder="SM Employee No." 
            value={bankUseOnly.smEmployeeNo || ""}
            onChange={(e) => handleChange("smEmployeeNo", e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">BM Signature & Stamp *</label>
          <input 
            type="file" 
            className="w-full border border-gray-300 rounded-xl bg-white px-4 py-2"
            onChange={(e) => handleFileUpload("bmSignature", e.target.files ? e.target.files[0] : null)}
          />
          {bankUseOnly.bmSignature && (
            <p className="text-sm text-green-600 mt-1">
              File selected: {bankUseOnly.bmSignature}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
