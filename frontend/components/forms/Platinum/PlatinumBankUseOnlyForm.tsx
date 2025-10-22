// components/forms/Platinum/PlatinumBankUseOnlyForm.tsx
"use client";
import { useCustomer } from "@/contexts/CustomerContext";
import { PlatinumCustomerData } from "@/types/platinum-types";
import { useEffect, useRef, useState } from "react";

export const PlatinumBankUseOnlyForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  const typedCustomerData = customerData as unknown as PlatinumCustomerData;
  const [formData, setFormData] = useState({
    applicationReferenceNumber: "",
    channelCode: "",
    programCode: "",
    branchCode: "",
    soEmployeeNo: "",
    pbBmEmployeeNo: "",
    smEmployeeNo: "",
    salesOfficerName: "",
    branchName: "",
    regionName: "",
    customerContactConfirmation: false,
    branchManagerRecommendation: "",
    branchManagerSignature: "",
    applicationStatus: "",
    reasonCode: "",
    analystName: "",
    analystSignature: ""
  });

  // Use refs to prevent infinite update loops
  const isInitialized = useRef(false);
  const skipNextUpdate = useRef(false);
  const isFirstRender = useRef(true);

  // Initialize form with data from context (runs once)
  useEffect(() => {
    if (isInitialized.current) return;
    
    const bankUseOnly = typedCustomerData?.bankUseOnly || {};
    
    setFormData(prev => ({
      ...prev,
      applicationReferenceNumber: bankUseOnly.applicationReferenceNumber || "",
      channelCode: bankUseOnly.channelCode || "",
      programCode: bankUseOnly.programCode || "",
      branchCode: bankUseOnly.branchCode || "",
      soEmployeeNo: bankUseOnly.soEmployeeNo || "",
      pbEmployeeNo: bankUseOnly.pbEmployeeNo || "",
      smEmployeeNo: bankUseOnly.smEmployeeNo || "",
      salesOfficerName: bankUseOnly.salesOfficerName || "",
      branchName: bankUseOnly.branchName || "",
      regionName: bankUseOnly.regionName || "",
      customerContactConfirmation: !!bankUseOnly.contactConfirmation || false,
      branchManagerRecommendation: bankUseOnly.bmRecommendation || "",
      branchManagerSignature: bankUseOnly.bmSignature || "",
      applicationStatus: bankUseOnly.applicationStatus || "",
      reasonCode: bankUseOnly.reasonCode || "",
      analystName: bankUseOnly.analystName || "",
      analystSignature: bankUseOnly.analystSignature || ""
    }));
    
    isInitialized.current = true;
  }, [typedCustomerData]);

  // Save form data to context when user makes changes
  const saveToContext = () => {
    if (skipNextUpdate.current || !isInitialized.current) return;
    
    skipNextUpdate.current = true;
    
    updateCustomerData({
      bankUseOnly: {
        ...(typedCustomerData?.bankUseOnly || {}),
        applicationReferenceNumber: formData.applicationReferenceNumber,
        channelCode: formData.channelCode,
        programCode: formData.programCode,
        branchCode: formData.branchCode,
        soEmployeeNo: formData.soEmployeeNo,
        pbEmployeeNo: formData.pbBmEmployeeNo,
        smEmployeeNo: formData.smEmployeeNo,
        salesOfficerName: formData.salesOfficerName,
        branchName: formData.branchName,
        regionName: formData.regionName,
        contactConfirmation: formData.customerContactConfirmation,
        bmRecommendation: formData.branchManagerRecommendation,
        bmSignature: formData.branchManagerSignature,
        applicationStatus: formData.applicationStatus,
        reasonCode: formData.reasonCode,
        analystName: formData.analystName,
        analystSignature: formData.analystSignature
      }
    } as unknown as Partial<any>);
    
    // Reset the flag after a short delay
    setTimeout(() => {
      skipNextUpdate.current = false;
    }, 50);
  };

  // Handle initial render - don't update context on first render
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    saveToContext();
  }, [formData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const fileName = e.target.files[0].name;
      handleInputChange(field, fileName);
    }
  };

  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-primary text-primary-foreground">Bank's Use Only (Back Office Fields)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
        <div>
          <label className="block text-sm font-medium mb-1">Application Reference Number</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2" 
            placeholder="Application Reference Number" 
            value={formData.applicationReferenceNumber}
            onChange={(e) => handleInputChange("applicationReferenceNumber", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Channel Code</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2" 
            placeholder="Channel Code" 
            value={formData.channelCode}
            onChange={(e) => handleInputChange("channelCode", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Program Code</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2" 
            placeholder="Program Code" 
            value={formData.programCode}
            onChange={(e) => handleInputChange("programCode", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Branch Code</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2" 
            placeholder="Branch Code" 
            value={formData.branchCode}
            onChange={(e) => handleInputChange("branchCode", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">SO Employee # (Contractual)</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2" 
            placeholder="SO Employee #" 
            value={formData.soEmployeeNo}
            onChange={(e) => handleInputChange("soEmployeeNo", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">PB/BM Employee # (Permanent)</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2" 
            placeholder="PB/BM Employee #" 
            value={formData.pbBmEmployeeNo}
            onChange={(e) => handleInputChange("pbBmEmployeeNo", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">SM Employee # (Permanent)</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2" 
            placeholder="SM Employee #" 
            value={formData.smEmployeeNo}
            onChange={(e) => handleInputChange("smEmployeeNo", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Sales Officer Name</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2" 
            placeholder="Sales Officer Name" 
            value={formData.salesOfficerName}
            onChange={(e) => handleInputChange("salesOfficerName", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Branch Name</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2" 
            placeholder="Branch Name" 
            value={formData.branchName}
            onChange={(e) => handleInputChange("branchName", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Region Name</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2" 
            placeholder="Region Name" 
            value={formData.regionName}
            onChange={(e) => handleInputChange("regionName", e.target.value)}
          />
        </div>
        {/* Customer Contact Confirmation (Radio) */}
        <div>
          <label className="block text-sm font-medium mb-1">Customer Contact Confirmation</label>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="customerContacted" 
                checked={formData.customerContactConfirmation === true}
                onChange={() => handleInputChange("customerContactConfirmation", true)}
              /> Contacted
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="customerContacted" 
                checked={formData.customerContactConfirmation === false}
                onChange={() => handleInputChange("customerContactConfirmation", false)}
              /> Not Contacted
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Branch Manager Recommendation</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2" 
            placeholder="Recommendation" 
            value={formData.branchManagerRecommendation}
            onChange={(e) => handleInputChange("branchManagerRecommendation", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Branch Manager Signature / Stamp</label>
          <input 
            type="file" 
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2" 
            onChange={(e) => handleFileChange("branchManagerSignature", e)}
          />
          {formData.branchManagerSignature && (
            <p className="text-xs text-gray-500 mt-1">File: {formData.branchManagerSignature}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Application Status</label>
          <div className="flex flex-wrap gap-3">
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="appStatus" 
                checked={formData.applicationStatus === "Approved"}
                onChange={() => handleInputChange("applicationStatus", "Approved")}
              /> Approved
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="appStatus" 
                checked={formData.applicationStatus === "Pending"}
                onChange={() => handleInputChange("applicationStatus", "Pending")}
              /> Pending
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="appStatus" 
                checked={formData.applicationStatus === "Rejected"}
                onChange={() => handleInputChange("applicationStatus", "Rejected")}
              /> Rejected
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Reason Code</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2" 
            placeholder="Reason Code" 
            value={formData.reasonCode}
            onChange={(e) => handleInputChange("reasonCode", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Analyst Name</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2" 
            placeholder="Analyst Name" 
            value={formData.analystName}
            onChange={(e) => handleInputChange("analystName", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Analyst Signature</label>
          <input 
            type="file" 
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2" 
            onChange={(e) => handleFileChange("analystSignature", e)}
          />
          {formData.analystSignature && (
            <p className="text-xs text-gray-500 mt-1">File: {formData.analystSignature}</p>
          )}
        </div>
      </div>
    </section>
  );
};
