"use client";
import { useCustomer } from "@/contexts/CustomerContext";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

// Define interface for existing loan data
interface ExistingLoan {
  facility_type: string;
  amount: string;
  tenor: string;
  purpose: string;
  security_collateral_nature: string;
  security_collateral_value: string;
  repayment_frequency: string;
}

export const ExistingLoanDetailsForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  
  // Use refs to prevent infinite update loops
  const isInitialized = useRef(false);
  const skipNextUpdate = useRef(false);
  const isFirstRender = useRef(true);
  
  // Controlled state for list of existing loans
  const [existingLoans, setExistingLoans] = useState<ExistingLoan[]>([]);
  
  // Initialize form with data from context (runs once)
  useEffect(() => {
    if (isInitialized.current) return;
    
    // Get existing data from context if available
    const commercialVehicle = customerData?.commercialVehicle || {};
    
    // Update form data with existing values
    if (Array.isArray(commercialVehicle.existing_loans)) {
      setExistingLoans(commercialVehicle.existing_loans.map((loan: any) => ({
        facility_type: loan.facility_type || "",
        amount: loan.amount ? String(loan.amount) : "",
        tenor: loan.tenor ? String(loan.tenor) : "",
        purpose: loan.purpose || "",
        security_collateral_nature: loan.security_collateral_nature || "",
        security_collateral_value: loan.security_collateral_value ? String(loan.security_collateral_value) : "",
        repayment_frequency: loan.repayment_frequency || ""
      })));
    }
    
    isInitialized.current = true;
  }, [customerData]);
  
  // Save to context when form data changes
  const saveToContext = () => {
    if (skipNextUpdate.current || !isInitialized.current) return;
    
    skipNextUpdate.current = true;
    
    // Filter out empty loans and map to backend format
    const validLoans = existingLoans
      .filter(loan => loan.facility_type || loan.amount || loan.purpose)
      .map(loan => ({
        facility_type: loan.facility_type,
        amount: loan.amount ? parseFloat(loan.amount) : null,
        tenor: loan.tenor ? parseInt(loan.tenor, 10) : null,
        purpose: loan.purpose,
        security_collateral_nature: loan.security_collateral_nature,
        security_collateral_value: loan.security_collateral_value ? parseFloat(loan.security_collateral_value) : null,
        repayment_frequency: loan.repayment_frequency
      }));
    
    // Map form data to the expected API format
    updateCustomerData({
      commercialVehicle: {
        ...(customerData?.commercialVehicle || {}),
        existing_loans: validLoans
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
  }, [existingLoans]);
  
  // Handle input changes for a specific loan
  const handleLoanChange = (index: number, field: keyof ExistingLoan, value: string) => {
    const updatedLoans = [...existingLoans];
    updatedLoans[index] = {
      ...updatedLoans[index],
      [field]: value
    };
    setExistingLoans(updatedLoans);
  };
  
  // Add new loan
  const addLoan = () => {
    setExistingLoans([...existingLoans, {
      facility_type: "",
      amount: "",
      tenor: "",
      purpose: "",
      security_collateral_nature: "",
      security_collateral_value: "",
      repayment_frequency: ""
    }]);
  };
  
  // Remove loan
  const removeLoan = (index: number) => {
    const updatedLoans = existingLoans.filter((_, i) => i !== index);
    setExistingLoans(updatedLoans);
  };

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl rounded-lg text-white font-semibold p-4 bg-primary text-primary-foreground">Existing Loan Details</h3>
        <Button 
          type="button" 
          onClick={addLoan}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Loan
        </Button>
      </div>
      
      {existingLoans.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No existing loans added yet. Click "Add Loan" to add one.
        </div>
      ) : (
        existingLoans.map((loan, index) => (
          <div key={index} className="border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-700">Loan #{index + 1}</h4>
              <Button 
                type="button" 
                onClick={() => removeLoan(index)}
                variant="destructive"
                size="sm"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Type of Facility</label>
                <input 
                  type="text" 
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm" 
                  placeholder="Type of Facility" 
                  value={loan.facility_type}
                  onChange={(e) => handleLoanChange(index, "facility_type", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amount (Rs.)</label>
                <input 
                  type="number" 
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm" 
                  placeholder="Amount" 
                  value={loan.amount}
                  onChange={(e) => handleLoanChange(index, "amount", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tenor (Months)</label>
                <input 
                  type="number" 
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm" 
                  placeholder="Tenor in Months" 
                  value={loan.tenor}
                  onChange={(e) => handleLoanChange(index, "tenor", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Purpose of Loan</label>
                <input 
                  type="text" 
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm" 
                  placeholder="Purpose of Loan" 
                  value={loan.purpose}
                  onChange={(e) => handleLoanChange(index, "purpose", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Security/Collateral Nature</label>
                <input 
                  type="text" 
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm" 
                  placeholder="Security/Collateral Nature" 
                  value={loan.security_collateral_nature}
                  onChange={(e) => handleLoanChange(index, "security_collateral_nature", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Security/Collateral Value (Rs.)</label>
                <input 
                  type="number" 
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm" 
                  placeholder="Security/Collateral Value" 
                  value={loan.security_collateral_value}
                  onChange={(e) => handleLoanChange(index, "security_collateral_value", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Repayment Frequency</label>
                <select 
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm"
                  value={loan.repayment_frequency}
                  onChange={(e) => handleLoanChange(index, "repayment_frequency", e.target.value)}
                >
                  <option value="">Select Frequency</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Semi-Annually">Semi-Annually</option>
                  <option value="Annually">Annually</option>
                </select>
              </div>
            </div>
          </div>
        ))
      )}
    </section>
  );
};
