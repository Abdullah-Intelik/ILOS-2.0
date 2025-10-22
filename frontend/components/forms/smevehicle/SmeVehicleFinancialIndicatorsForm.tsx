"use client";
import { useCustomer } from "@/contexts/CustomerContext";
import { useEffect, useRef, useState } from "react";

// Define interface for financial indicators data
interface FinancialIndicatorsData {
  assets: string;
  liabilities: string;
  borrowings: string;
  revenue: string;
  expenses: string;
}

export const FinancialIndicatorsForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  
  // Use refs to prevent infinite update loops
  const isInitialized = useRef(false);
  const skipNextUpdate = useRef(false);
  const isFirstRender = useRef(true);
  
  // Controlled state
  const [formData, setFormData] = useState<FinancialIndicatorsData>({
    assets: "",
    liabilities: "",
    borrowings: "",
    revenue: "",
    expenses: ""
  });
  
  // Initialize form with data from context (runs once)
  useEffect(() => {
    if (isInitialized.current) return;
    
    // Get existing data from context if available
    const commercialVehicle = customerData?.commercialVehicle || {};
    const financialIndicators = commercialVehicle.financial_indicators_small || {};
    
    // Update form data with existing values
    setFormData({
      assets: financialIndicators.assets ? String(financialIndicators.assets) : "",
      liabilities: financialIndicators.liabilities ? String(financialIndicators.liabilities) : "",
      borrowings: financialIndicators.borrowings ? String(financialIndicators.borrowings) : "",
      revenue: financialIndicators.revenue ? String(financialIndicators.revenue) : "",
      expenses: financialIndicators.expenses ? String(financialIndicators.expenses) : ""
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
        financial_indicators_small: {
          assets: formData.assets ? parseFloat(formData.assets) : null,
          liabilities: formData.liabilities ? parseFloat(formData.liabilities) : null,
          borrowings: formData.borrowings ? parseFloat(formData.borrowings) : null,
          revenue: formData.revenue ? parseFloat(formData.revenue) : null,
          expenses: formData.expenses ? parseFloat(formData.expenses) : null
        }
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
  const handleChange = (field: keyof FinancialIndicatorsData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-primary text-primary-foreground">Financial Indicators</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50" >
        <div>
          <label className="block text-sm font-medium mb-1">Assets (Rs.)</label>
          <input
            type="number"
            className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm"
            placeholder="Total Assets"
            value={formData.assets}
            onChange={(e) => handleChange("assets", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Liabilities (Rs.)</label>
          <input
            type="number"
            className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm"
            placeholder="Total Liabilities"
            value={formData.liabilities}
            onChange={(e) => handleChange("liabilities", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Borrowings (Rs.)</label>
          <input
            type="number"
            className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm"
            placeholder="Total Borrowings"
            value={formData.borrowings}
            onChange={(e) => handleChange("borrowings", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Revenue (Rs.)</label>
          <input
            type="number"
            className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm"
            placeholder="Annual Revenue"
            value={formData.revenue}
            onChange={(e) => handleChange("revenue", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Expenses (Rs.)</label>
          <input
            type="number"
            className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm"
            placeholder="Total Expenses"
            value={formData.expenses}
            onChange={(e) => handleChange("expenses", e.target.value)}
          />
        </div>
      </div>
    </section>
  );
};
