// components/forms/Platinum/PlatinumIncomeDetailsForm.tsx
"use client";
import { useCustomer } from "@/contexts/CustomerContext";
import { PlatinumCustomerData } from "@/types/platinum-types";
import { useEffect, useRef, useState } from "react";

export const PlatinumIncomeDetailsForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  const typedCustomerData = customerData as unknown as PlatinumCustomerData;
  const [formData, setFormData] = useState({
    grossMonthlyIncome: "",
    otherIncomeSource: "",
    otherIncome: "",
    totalIncome: "",
    spouseEmployed: "No",
    spouseIncome: "",
    spouseIncomeSource: "",
    cardDestination: "Home",
    statementDelivery: "Email",
    estatementEmail: "",
  });

  // Use refs to prevent infinite update loops
  const isInitialized = useRef(false);
  const skipNextUpdate = useRef(false);
  const isFirstRender = useRef(true);

  // Initialize form with data from context (runs once)
  useEffect(() => {
    if (isInitialized.current) return;
    
    const incomeDetails = typedCustomerData?.incomeDetails || {};
    
    setFormData(prev => ({
      ...prev,
      grossMonthlyIncome: incomeDetails.grossMonthlyIncome?.toString() || prev.grossMonthlyIncome,
      otherIncomeSource: incomeDetails.otherIncomeSource || prev.otherIncomeSource,
      otherIncome: incomeDetails.otherIncome?.toString() || prev.otherIncome,
      totalIncome: incomeDetails.totalIncome?.toString() || prev.totalIncome,
      spouseEmployed: incomeDetails.spouseEmployed || prev.spouseEmployed,
      spouseIncome: incomeDetails.spouseIncome?.toString() || prev.spouseIncome,
      spouseIncomeSource: incomeDetails.spouseIncomeSource || prev.spouseIncomeSource,
      cardDestination: incomeDetails.cardDestination || prev.cardDestination,
      statementDelivery: incomeDetails.statementDelivery || prev.statementDelivery,
      estatementEmail: incomeDetails.estatementEmail || prev.estatementEmail,
    }));
    
    isInitialized.current = true;
  }, [typedCustomerData]);

  // Save form data to context when user makes changes
  const saveToContext = () => {
    if (skipNextUpdate.current || !isInitialized.current) return;
    
    skipNextUpdate.current = true;
    
    // Calculate total income if not explicitly set
    let calculatedTotalIncome = formData.totalIncome;
    if (!calculatedTotalIncome && formData.grossMonthlyIncome) {
      const grossIncome = parseFloat(formData.grossMonthlyIncome) || 0;
      const otherIncome = parseFloat(formData.otherIncome) || 0;
      calculatedTotalIncome = (grossIncome + otherIncome).toString();
    }
    
    updateCustomerData({
      incomeDetails: {
        ...(typedCustomerData?.incomeDetails || {}),
        grossMonthlyIncome: formData.grossMonthlyIncome,
        otherIncomeSource: formData.otherIncomeSource,
        otherIncome: formData.otherIncome,
        totalIncome: calculatedTotalIncome || formData.totalIncome,
        spouseEmployed: formData.spouseEmployed,
        spouseIncome: formData.spouseIncome,
        spouseIncomeSource: formData.spouseIncomeSource,
        cardDestination: formData.cardDestination,
        statementDelivery: formData.statementDelivery,
        estatementEmail: formData.estatementEmail,
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
    
    // Special case - update total income when gross or other income changes
    if (field === "grossMonthlyIncome" || field === "otherIncome") {
      const grossIncome = field === "grossMonthlyIncome" ? parseFloat(value) || 0 : parseFloat(formData.grossMonthlyIncome) || 0;
      const otherIncome = field === "otherIncome" ? parseFloat(value) || 0 : parseFloat(formData.otherIncome) || 0;
      const totalIncome = (grossIncome + otherIncome).toString();
      
      setFormData(prev => ({
        ...prev,
        [field]: value,
        totalIncome: totalIncome
      }));
    }
  };

  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-primary text-primary-foreground">5. Income Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
        <div>
          <label className="block text-sm font-medium mb-1">Gross Monthly Income</label>
          <input 
            type="number" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2" 
            placeholder="Gross Monthly Income" 
            value={formData.grossMonthlyIncome}
            onChange={(e) => handleInputChange("grossMonthlyIncome", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Other Income Source</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2" 
            placeholder="Other Income Source" 
            value={formData.otherIncomeSource}
            onChange={(e) => handleInputChange("otherIncomeSource", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Other Income</label>
          <input 
            type="number" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2" 
            placeholder="Other Income" 
            value={formData.otherIncome}
            onChange={(e) => handleInputChange("otherIncome", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Total Income</label>
          <input 
            type="number" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2" 
            placeholder="Total Income" 
            value={formData.totalIncome}
            onChange={(e) => handleInputChange("totalIncome", e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Spouse Employed</label>
          <div className="flex flex-wrap gap-4 mt-2">
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="spouseEmployed" 
                checked={formData.spouseEmployed === "Yes"} 
                onChange={() => handleInputChange("spouseEmployed", "Yes")}
              /> Yes
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="spouseEmployed" 
                checked={formData.spouseEmployed === "No"} 
                onChange={() => handleInputChange("spouseEmployed", "No")}
              /> No
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="spouseEmployed" 
                checked={formData.spouseEmployed === "N/A"} 
                onChange={() => handleInputChange("spouseEmployed", "N/A")}
              /> N/A
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Spouse Income</label>
          <input 
            type="number" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2" 
            placeholder="Spouse Income" 
            value={formData.spouseIncome}
            onChange={(e) => handleInputChange("spouseIncome", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Spouse Income Source</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2" 
            placeholder="Spouse Income Source" 
            value={formData.spouseIncomeSource}
            onChange={(e) => handleInputChange("spouseIncomeSource", e.target.value)}
          />
        </div>
        {/* Card Destination */}
        <div>
          <label className="block text-sm font-medium mb-1">Card Destination</label>
          <div className="flex flex-col gap-1">
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="cardDestination" 
                checked={formData.cardDestination === "Home"} 
                onChange={() => handleInputChange("cardDestination", "Home")}
              /> Home
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="cardDestination" 
                checked={formData.cardDestination === "Office"} 
                onChange={() => handleInputChange("cardDestination", "Office")}
              /> Office
            </label>
          </div>
        </div>
        {/* Statement Delivery */}
        <div>
          <label className="block text-sm font-medium mb-1">Statement Delivery</label>
          <div className="flex flex-col gap-1">
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="statementDelivery" 
                checked={formData.statementDelivery === "Email"} 
                onChange={() => handleInputChange("statementDelivery", "Email")}
              /> Email Statement
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="statementDelivery" 
                checked={formData.statementDelivery === "Physical"} 
                onChange={() => handleInputChange("statementDelivery", "Physical")}
              /> Physical
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email (for Statement)</label>
          <input 
            type="email" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2" 
            placeholder="Email (for Statement)" 
            value={formData.estatementEmail}
            onChange={(e) => handleInputChange("estatementEmail", e.target.value)}
          />
        </div>
      </div>
    </section>
  );
};
