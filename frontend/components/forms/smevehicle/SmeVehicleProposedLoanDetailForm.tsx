"use client";
import { useCustomer } from "@/contexts/CustomerContext";
import { useEffect, useRef, useState } from "react";

// Define interface for proposed loan detail data
interface ProposedLoanDetailData {
  desired_loan_amount: string;
  tenure_years: string;
  pricing: string;
  down_payment_percent: string;
  down_payment_amount: string;
  insurance_company_name: string;
  tracker_company_name: string;
}

export const ProposedLoanDetailForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  
  // Use refs to prevent infinite update loops
  const isInitialized = useRef(false);
  const skipNextUpdate = useRef(false);
  const isFirstRender = useRef(true);
  
  // Controlled state
  const [formData, setFormData] = useState<ProposedLoanDetailData>({
    desired_loan_amount: "",
    tenure_years: "",
    pricing: "",
    down_payment_percent: "",
    down_payment_amount: "",
    insurance_company_name: "",
    tracker_company_name: ""
  });
  
  // Initialize form with data from context (runs once)
  useEffect(() => {
    if (isInitialized.current) return;
    
    // Get existing data from context if available
    const commercialVehicle = customerData?.commercialVehicle || {};
    
    // Update form data with existing values
    setFormData({
      desired_loan_amount: commercialVehicle.desired_loan_amount ? String(commercialVehicle.desired_loan_amount) : "",
      tenure_years: commercialVehicle.tenure_years ? String(commercialVehicle.tenure_years) : "",
      pricing: commercialVehicle.pricing || "",
      down_payment_percent: commercialVehicle.down_payment_percent ? String(commercialVehicle.down_payment_percent) : "",
      down_payment_amount: commercialVehicle.down_payment_amount ? String(commercialVehicle.down_payment_amount) : "",
      insurance_company_name: commercialVehicle.insurance_company_name || "",
      tracker_company_name: commercialVehicle.tracker_company_name || ""
    });
    
    isInitialized.current = true;
  }, [customerData]);
  
  // Save to context when form data changes
  const saveToContext = () => {
    if (skipNextUpdate.current || !isInitialized.current) return;
    
    skipNextUpdate.current = true;
    
    // Map form data to the expected API format
    updateCustomerData({
      commercialVehicle: {
        ...(customerData?.commercialVehicle || {}),
        desired_loan_amount: formData.desired_loan_amount ? parseFloat(formData.desired_loan_amount) : null,
        tenure_years: formData.tenure_years ? parseInt(formData.tenure_years, 10) : null,
        pricing: formData.pricing,
        down_payment_percent: formData.down_payment_percent ? parseFloat(formData.down_payment_percent) : null,
        down_payment_amount: formData.down_payment_amount ? parseFloat(formData.down_payment_amount) : null,
        insurance_company_name: formData.insurance_company_name,
        tracker_company_name: formData.tracker_company_name
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
  const handleChange = (field: keyof ProposedLoanDetailData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-primary text-primary-foreground">Proposed Loan Detail</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
        <div>
          <label className="block text-sm font-medium mb-1">Desired Loan Amount (Rs.)</label>
          <input
            type="number"
            className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm"
            placeholder="Desired Loan Amount"
            value={formData.desired_loan_amount}
            onChange={(e) => handleChange("desired_loan_amount", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tenure (Years)</label>
          <input
            type="number"
            className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm"
            placeholder="Tenure in Years"
            value={formData.tenure_years}
            onChange={(e) => handleChange("tenure_years", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Pricing</label>
          <input
            type="text"
            className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm"
            placeholder="Pricing"
            value={formData.pricing}
            onChange={(e) => handleChange("pricing", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Down Payment (%)</label>
          <input
            type="number"
            className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm"
            placeholder="Down Payment (%)"
            value={formData.down_payment_percent}
            onChange={(e) => handleChange("down_payment_percent", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Down Payment Amount (Rs.)</label>
          <input
            type="number"
            className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm"
            placeholder="Down Payment Amount"
            value={formData.down_payment_amount}
            onChange={(e) => handleChange("down_payment_amount", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Insurance Company Name</label>
          <input
            type="text"
            className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm"
            placeholder="Insurance Company Name"
            value={formData.insurance_company_name}
            onChange={(e) => handleChange("insurance_company_name", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tracker Company Name</label>
          <input
            type="text"
            className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm"
            placeholder="Tracker Company Name"
            value={formData.tracker_company_name}
            onChange={(e) => handleChange("tracker_company_name", e.target.value)}
          />
        </div>
      </div>
    </section>
  );
};
