"use client";
import { useCustomer } from "@/contexts/CustomerContext";
import { useEffect, useRef, useState } from "react";

// Interface for existing loan data that maps to CustomerContext exposures
interface ExistingLoan {
  sr_no?: string;
  bank_name: string;
  facility_type: string;
  approved_limit: number | null;
  outstanding_amount: number | null;
  monthly_installment?: number | null;
  tenor: number | null;
  purpose: string;
  security_nature_particular: string;
  security_value: number | null;
  repayment_frequency: string;
  nature?: string;
  current_outstanding?: number | null;
  as_of?: string;
}

export const SMEExistingLoanDetailsForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  
  // Use refs to prevent infinite update loops
  const isInitialized = useRef(false);
  const skipNextUpdate = useRef(false);
  const isFirstRender = useRef(true);
  
  const [existingLoans, setExistingLoans] = useState<ExistingLoan[]>([
    {
      sr_no: "1",
      bank_name: "",
      facility_type: "",
      approved_limit: null,
      outstanding_amount: null,
      monthly_installment: null,
      tenor: null,
      purpose: "",
      security_nature_particular: "",
      security_value: null,
      repayment_frequency: "Monthly",
      nature: "",
      current_outstanding: null,
      as_of: new Date().toISOString().slice(0, 10)
    }
  ]);
  
  // Initialize form with data from context when customerData becomes available
  useEffect(() => {
    if (!customerData || isInitialized.current) return;
    
    // Get existing data from context exposures
    const exposures = customerData?.exposures || {};
    const personalLoans = exposures.personalLoansExisting || [];
    const otherFacilities = exposures.otherFacilities || [];
    const smeLoans = customerData?.smeApplication?.existing_loans || [];
    
    // Combine all existing loans from different sources
    const allExistingLoans = [
      ...personalLoans.map((loan, index) => ({
        sr_no: loan.sr_no || String(index + 1),
        bank_name: loan.bank_name || "",
        facility_type: "Personal Loan",
        approved_limit: typeof loan.approved_limit === 'number' ? loan.approved_limit : 
                       typeof loan.approved_limit === 'string' ? Number(loan.approved_limit) : null,
        outstanding_amount: typeof loan.outstanding_amount === 'number' ? loan.outstanding_amount :
                           typeof loan.outstanding_amount === 'string' ? Number(loan.outstanding_amount) : null,
        monthly_installment: null,
        tenor: null,
        purpose: "Personal Loan",
        security_nature_particular: "",
        security_value: null,
        repayment_frequency: "Monthly",
        nature: "Personal Loan",
        current_outstanding: typeof loan.outstanding_amount === 'number' ? loan.outstanding_amount :
                            typeof loan.outstanding_amount === 'string' ? Number(loan.outstanding_amount) : null,
        as_of: loan.as_of || new Date().toISOString().slice(0, 10)
      })),
      ...otherFacilities.map((loan, index) => ({
        sr_no: loan.sr_no || String(personalLoans.length + index + 1),
        bank_name: loan.bank_name || "",
        facility_type: loan.nature || "Other Facility",
        approved_limit: typeof loan.approved_limit === 'number' ? loan.approved_limit :
                       typeof loan.approved_limit === 'string' ? Number(loan.approved_limit) : null,
        outstanding_amount: typeof loan.current_outstanding === 'number' ? loan.current_outstanding :
                           typeof loan.current_outstanding === 'string' ? Number(loan.current_outstanding) : null,
        monthly_installment: null,
        tenor: null,
        purpose: loan.nature || "",
        security_nature_particular: "",
        security_value: null,
        repayment_frequency: "Monthly",
        nature: loan.nature || "",
        current_outstanding: typeof loan.current_outstanding === 'number' ? loan.current_outstanding :
                            typeof loan.current_outstanding === 'string' ? Number(loan.current_outstanding) : null,
        as_of: new Date().toISOString().slice(0, 10)
      })),
      ...smeLoans.map((loan: any, index: number) => ({
        sr_no: String(personalLoans.length + otherFacilities.length + index + 1),
        bank_name: loan.bank_name || "",
        facility_type: loan.facility_type || "",
        approved_limit: loan.amount || null,
        outstanding_amount: loan.amount || null,
        monthly_installment: loan.monthly_installment || null,
        tenor: loan.tenor || null,
        purpose: loan.purpose || "",
        security_nature_particular: loan.security_nature_particular || "",
        security_value: loan.security_value || null,
        repayment_frequency: loan.repayment_frequency || "Monthly",
        nature: loan.facility_type || "",
        current_outstanding: loan.amount || null,
        as_of: new Date().toISOString().slice(0, 10)
      }))
    ];
    
    // Set the loans or keep the default empty loan
    if (allExistingLoans.length > 0) {
      setExistingLoans(allExistingLoans);
    }
    
    isInitialized.current = true;
  }, [customerData]);
  
  // Save to context when form data changes
  const saveToContext = () => {
    if (skipNextUpdate.current || !isInitialized.current) return;
    
    skipNextUpdate.current = true;
    
    // Filter out empty loans (where bank_name or facility_type is not provided)
    const validLoans = existingLoans.filter(
      loan => loan.bank_name?.trim() !== "" || loan.facility_type?.trim() !== ""
    );
    
    // Map to different exposure categories
    const personalLoansExisting = validLoans
      .filter(loan => loan.facility_type === "Personal Loan")
      .map((loan, index) => ({
        sr_no: String(index + 1),
        bank_name: loan.bank_name,
        approved_limit: loan.approved_limit,
        outstanding_amount: loan.outstanding_amount,
        as_of: loan.as_of || new Date().toISOString().slice(0, 10)
      }));
    
    const otherFacilities = validLoans
      .filter(loan => loan.facility_type !== "Personal Loan")
      .map((loan, index) => ({
        sr_no: String(index + 1),
        bank_name: loan.bank_name,
        approved_limit: loan.approved_limit,
        nature: loan.facility_type,
        current_outstanding: loan.outstanding_amount
      }));
    
    // Update the context with loans data
    updateCustomerData({
      exposures: {
        ...(customerData?.exposures || {}),
        personalLoansExisting: personalLoansExisting,
        otherFacilities: otherFacilities
      },
      smeApplication: {
        ...(customerData?.smeApplication || {}),
        existing_loans: validLoans
      }
    } as any);
    
    // Reset the flag after a short delay
    setTimeout(() => {
      skipNextUpdate.current = false;
    }, 50);
  };
  
  // Update context when loans change
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    saveToContext();
  }, [existingLoans]);
  
  // Handle input changes for a specific loan and field
  const handleInputChange = (loanIndex: number, field: string, value: any) => {
    const updatedLoans = [...existingLoans];
    updatedLoans[loanIndex] = {
      ...updatedLoans[loanIndex],
      [field]: value
    };
    setExistingLoans(updatedLoans);
  };
  
  // Add a new loan entry
  const addLoan = () => {
    setExistingLoans([
      ...existingLoans,
      {
        sr_no: String(existingLoans.length + 1),
        bank_name: "",
        facility_type: "",
        approved_limit: null,
        outstanding_amount: null,
        monthly_installment: null,
        tenor: null,
        purpose: "",
        security_nature_particular: "",
        security_value: null,
        repayment_frequency: "Monthly",
        nature: "",
        current_outstanding: null,
        as_of: new Date().toISOString().slice(0, 10)
      }
    ]);
  };
  
  // Remove a loan entry
  const removeLoan = (index: number) => {
    if (existingLoans.length <= 1) return; // Always keep at least one entry
    const updatedLoans = existingLoans.filter((_, i) => i !== index);
    // Update serial numbers
    const reindexedLoans = updatedLoans.map((loan, idx) => ({
      ...loan,
      sr_no: String(idx + 1)
    }));
    setExistingLoans(reindexedLoans);
  };
  
  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-blue-500">Existing Loan Details</h3>
      
      {existingLoans.map((loan, index) => (
        <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
          <div>
            <label className="block text-sm font-medium mb-1">Bank Name</label>
            <input
              type="text"
              className="w-full rounded-xl border border-gray-300 px-4 py-2"
              placeholder="Bank Name"
              value={loan.bank_name}
              onChange={(e) => handleInputChange(index, "bank_name", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type of Facility</label>
            <select
              className="w-full rounded-xl border border-gray-300 px-4 py-2"
              value={loan.facility_type}
              onChange={(e) => handleInputChange(index, "facility_type", e.target.value)}
            >
              <option value="">--Select--</option>
              <option value="Personal Loan">Personal Loan</option>
              <option value="Running Finance">Running Finance</option>
              <option value="Term Finance">Term Finance</option>
              <option value="Letter of Credit">Letter of Credit</option>
              <option value="Working Capital">Working Capital</option>
              <option value="SME Loan">SME Loan</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Approved Limit (Rs.)</label>
            <input
              type="number"
              className="w-full rounded-xl border border-gray-300 px-4 py-2"
              placeholder="Approved Limit"
              value={loan.approved_limit === null ? "" : loan.approved_limit}
              onChange={(e) => handleInputChange(index, "approved_limit", e.target.value ? Number(e.target.value) : null)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Outstanding Amount (Rs.)</label>
            <input
              type="number"
              className="w-full rounded-xl border border-gray-300 px-4 py-2"
              placeholder="Outstanding Amount"
              value={loan.outstanding_amount === null ? "" : loan.outstanding_amount}
              onChange={(e) => handleInputChange(index, "outstanding_amount", e.target.value ? Number(e.target.value) : null)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Monthly Installment (Rs.)</label>
            <input
              type="number"
              className="w-full rounded-xl border border-gray-300 px-4 py-2"
              placeholder="Monthly Installment"
              value={loan.monthly_installment === null ? "" : loan.monthly_installment}
              onChange={(e) => handleInputChange(index, "monthly_installment", e.target.value ? Number(e.target.value) : null)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tenure Remaining (Months)</label>
            <input
              type="number"
              className="w-full rounded-xl border border-gray-300 px-4 py-2"
              placeholder="Tenure Remaining"
              value={loan.tenor === null ? "" : loan.tenor}
              onChange={(e) => handleInputChange(index, "tenor", e.target.value ? Number(e.target.value) : null)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Purpose of Loan</label>
            <input
              type="text"
              className="w-full rounded-xl border border-gray-300 px-4 py-2"
              placeholder="Purpose of Loan"
              value={loan.purpose}
              onChange={(e) => handleInputChange(index, "purpose", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Security Nature/Particular</label>
            <input
              type="text"
              className="w-full rounded-xl border border-gray-300 px-4 py-2"
              placeholder="Security Nature"
              value={loan.security_nature_particular}
              onChange={(e) => handleInputChange(index, "security_nature_particular", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Security Value (Rs.)</label>
            <input
              type="number"
              className="w-full rounded-xl border border-gray-300 px-4 py-2"
              placeholder="Security Value"
              value={loan.security_value === null ? "" : loan.security_value}
              onChange={(e) => handleInputChange(index, "security_value", e.target.value ? Number(e.target.value) : null)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Repayment Frequency</label>
            <select
              className="w-full rounded-xl border border-gray-300 px-4 py-2"
              value={loan.repayment_frequency}
              onChange={(e) => handleInputChange(index, "repayment_frequency", e.target.value)}
            >
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Half-Yearly">Half-Yearly</option>
              <option value="Annually">Annually</option>
            </select>
          </div>
          
          {/* Remove button - only show if there's more than one loan */}
          {existingLoans.length > 1 && (
            <div className="md:col-span-2 flex justify-end">
              <button 
                type="button"
                className="px-4 py-2 text-red-600 hover:text-red-800 border border-red-300 rounded-lg hover:bg-red-50"
                onClick={() => removeLoan(index)}
              >
                Remove Loan
              </button>
            </div>
          )}
        </div>
      ))}
      
      {/* Add new loan button */}
      <div className="flex justify-center mt-4">
        <button
          type="button"
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          onClick={addLoan}
        >
          Add Another Loan
        </button>
      </div>
    </section>
  );
};