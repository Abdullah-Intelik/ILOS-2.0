"use client";
import { useCustomer } from "@/contexts/CustomerContext";
import { useEffect, useRef, useState } from "react";

// Define interface for loan facility data that matches CustomerContext
interface LoanFacilityData {
  loanType: string;
  amountRequested: number | null;
  tenure: number | null;
  maxAffordableInstallment: number | null;
  minAmountAcceptable: number | null;
  repayment_frequency: string; // Custom field not in CustomerContext
  purpose: string; // Will map to applicationDetails.loanPurpose
}

export const SMELoanFacilityDetailsForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  
  // Use refs to prevent infinite update loops
  const isInitialized = useRef(false);
  const skipNextUpdate = useRef(false);
  const isFirstRender = useRef(true);
  
  // Controlled state
  const [formData, setFormData] = useState<LoanFacilityData>({
    loanType: "",
    purpose: "",
    amountRequested: null,
    tenure: null,
    repayment_frequency: "",
    maxAffordableInstallment: null,
    minAmountAcceptable: null
  });
  
  // Initialize form with data from context when customerData becomes available
  useEffect(() => {
    if (!customerData || isInitialized.current) return;
    
    // Get existing data from context if available
    const loanPreference = customerData?.loanPreference || {};
    const applicationDetails = customerData?.applicationDetails || {};
    const smeApplication = customerData?.smeApplication || {};
    
    // Update form data with existing values, mapping from CustomerContext structure
    setFormData({
      loanType: loanPreference.loanType || "",
      purpose: applicationDetails.loanPurpose || "",
      amountRequested: typeof loanPreference.amountRequested === 'number' ? loanPreference.amountRequested : 
                      typeof loanPreference.amountRequested === 'string' ? Number(loanPreference.amountRequested) : null,
      tenure: typeof loanPreference.tenure === 'number' ? loanPreference.tenure : 
              typeof loanPreference.tenure === 'string' ? Number(loanPreference.tenure) : null,
      repayment_frequency: smeApplication.repayment_frequency || "",
      maxAffordableInstallment: typeof loanPreference.maxAffordableInstallment === 'number' ? loanPreference.maxAffordableInstallment :
                                typeof loanPreference.maxAffordableInstallment === 'string' ? Number(loanPreference.maxAffordableInstallment) : null,
      minAmountAcceptable: typeof loanPreference.minAmountAcceptable === 'number' ? loanPreference.minAmountAcceptable :
                          typeof loanPreference.minAmountAcceptable === 'string' ? Number(loanPreference.minAmountAcceptable) : null
    });
    
    isInitialized.current = true;
  }, [customerData]);
  
  // Save to context when form data changes
  const saveToContext = () => {
    if (skipNextUpdate.current || !isInitialized.current) return;
    
    skipNextUpdate.current = true;
    
    // Map form data to the CustomerContext format
    updateCustomerData({
      loanPreference: {
        loanType: formData.loanType,
        amountRequested: formData.amountRequested,
        tenure: formData.tenure,
        maxAffordableInstallment: formData.maxAffordableInstallment,
        minAmountAcceptable: formData.minAmountAcceptable
      },
      applicationDetails: {
        ...(customerData?.applicationDetails || {}),
        loanPurpose: formData.purpose
      },
      smeApplication: {
        ...(customerData?.smeApplication || {}),
        repayment_frequency: formData.repayment_frequency,
        desired_loan_amount: formData.amountRequested,
        tenure_months: formData.tenure
      }
    } as any);
    
    // Reset the flag after a short delay
    setTimeout(() => {
      skipNextUpdate.current = false;
    }, 50);
  };
  
  // Update context when form data changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    saveToContext();
  }, [formData]);
  
  // Handle input changes
  const handleChange = (field: keyof LoanFacilityData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-primary text-primary-foreground">Loan/Facility Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
        <div>
          <label className="block text-sm font-medium mb-1">Type of Facility</label>
          <select 
            className="w-full rounded-xl border border-gray-300 px-4 py-2"
            value={formData.loanType}
            onChange={(e) => handleChange("loanType", e.target.value)}
          >
            <option value="">--Select--</option>
            <option value="Running Finance">Running Finance</option>
            <option value="Term Finance">Term Finance</option>
            <option value="Letter of Credit">Letter of Credit</option>
            <option value="SME Loan">SME Loan</option>
            <option value="Working Capital">Working Capital</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Purpose of Loan/Facility</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2" 
            placeholder="Purpose" 
            value={formData.purpose}
            onChange={(e) => handleChange("purpose", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Requested Amount (Rs.)</label>
          <input 
            type="number" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2" 
            placeholder="Requested Amount" 
            value={formData.amountRequested === null ? "" : formData.amountRequested}
            onChange={(e) => handleChange("amountRequested", e.target.value ? Number(e.target.value) : null)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tenure (Months)</label>
          <input 
            type="number" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2" 
            placeholder="Tenure (Months)" 
            value={formData.tenure === null ? "" : formData.tenure}
            onChange={(e) => handleChange("tenure", e.target.value ? Number(e.target.value) : null)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Repayment Frequency</label>
          <select 
            className="w-full rounded-xl border border-gray-300 px-4 py-2"
            value={formData.repayment_frequency}
            onChange={(e) => handleChange("repayment_frequency", e.target.value)}
          >
            <option value="">--Select--</option>
            <option value="Monthly">Monthly</option>
            <option value="Quarterly">Quarterly</option>
            <option value="Half-Yearly">Half-Yearly</option>
            <option value="Annually">Annually</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Maximum Affordable Installment (Rs.)</label>
          <input 
            type="number" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2" 
            placeholder="Maximum Affordable Installment" 
            value={formData.maxAffordableInstallment === null ? "" : formData.maxAffordableInstallment}
            onChange={(e) => handleChange("maxAffordableInstallment", e.target.value ? Number(e.target.value) : null)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Minimum Acceptable Amount (Rs.)</label>
          <input 
            type="number" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2" 
            placeholder="Minimum Acceptable Amount" 
            value={formData.minAmountAcceptable === null ? "" : formData.minAmountAcceptable}
            onChange={(e) => handleChange("minAmountAcceptable", e.target.value ? Number(e.target.value) : null)}
          />
        </div>
      </div>
    </section>
  );
};