// components/forms/Platinum/PlatinumLienMarkedForm.tsx
"use client";
import { useCustomer } from "@/contexts/CustomerContext";
import { PlatinumCustomerData } from "@/types/platinum-types";
import { useEffect, useRef, useState } from "react";

export const PlatinumLienMarkedForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  const typedCustomerData = customerData as unknown as PlatinumCustomerData;
  const [formData, setFormData] = useState({
    collateralType: "",
    bank: "",
    branch: "",
    accountNo: "",
    accountType: "",
    lienAmount: "",
    currency: "PKR",
    accountTitle: "",
    maturityDate: ""
  });

  // Use refs to prevent infinite update loops
  const isInitialized = useRef(false);
  const skipNextUpdate = useRef(false);
  const isFirstRender = useRef(true);

  // Initialize form with data from context (runs once)
  useEffect(() => {
    if (isInitialized.current) return;
    
    const lienMarked = typedCustomerData?.lienMarked || {};
    
    setFormData(prev => ({
      ...prev,
      collateralType: lienMarked.collateralType || prev.collateralType,
      bank: lienMarked.bank || prev.bank,
      branch: lienMarked.branch || prev.branch,
      accountNo: lienMarked.accountNo || prev.accountNo,
      accountType: lienMarked.accountType || prev.accountType,
      lienAmount: lienMarked.lienAmount?.toString() || prev.lienAmount,
      currency: lienMarked.currency || prev.currency,
      accountTitle: lienMarked.accountTitle || prev.accountTitle,
      maturityDate: lienMarked.maturityDate || prev.maturityDate
    }));
    
    isInitialized.current = true;
  }, []);

  // Save form data to context when user makes changes
  const saveToContext = () => {
    if (skipNextUpdate.current || !isInitialized.current) return;
    
    skipNextUpdate.current = true;
    
    updateCustomerData({
      lienMarked: {
        ...(typedCustomerData?.lienMarked || {}),
        marked: true, // Always mark it as true when data is entered
        collateralType: formData.collateralType,
        bank: formData.bank,
        branch: formData.branch,
        accountNo: formData.accountNo,
        accountType: formData.accountType,
        lienAmount: formData.lienAmount,
        currency: formData.currency,
        accountTitle: formData.accountTitle,
        maturityDate: formData.maturityDate
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

  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-primary text-primary-foreground">11. For Lien Marked Credit Cards</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
        <div>
          <label className="block text-sm font-medium mb-1">Collateral Type</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2" 
            placeholder="Collateral Type" 
            value={formData.collateralType}
            onChange={(e) => handleInputChange("collateralType", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Bank (if deposit)</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2" 
            placeholder="Bank" 
            value={formData.bank}
            onChange={(e) => handleInputChange("bank", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Branch</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2" 
            placeholder="Branch" 
            value={formData.branch}
            onChange={(e) => handleInputChange("branch", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Account No</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2" 
            placeholder="Account No." 
            value={formData.accountNo}
            onChange={(e) => handleInputChange("accountNo", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Account Type</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2" 
            placeholder="Account Type" 
            value={formData.accountType}
            onChange={(e) => handleInputChange("accountType", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Lien Amount</label>
          <input 
            type="number" 
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2" 
            placeholder="Lien Amount" 
            value={formData.lienAmount}
            onChange={(e) => handleInputChange("lienAmount", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Currency</label>
          <select
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2"
            value={formData.currency}
            onChange={(e) => handleInputChange("currency", e.target.value)}
          >
            <option value="PKR">PKR</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="AED">AED</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Account Title</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2" 
            placeholder="Account Title" 
            value={formData.accountTitle}
            onChange={(e) => handleInputChange("accountTitle", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Maturity Date</label>
          <input 
            type="date" 
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2" 
            value={formData.maturityDate}
            onChange={(e) => handleInputChange("maturityDate", e.target.value)}
          />
        </div>
      </div>
    </section>
  );
};
