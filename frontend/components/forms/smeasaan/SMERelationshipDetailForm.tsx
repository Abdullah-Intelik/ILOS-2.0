"use client";
import { useCustomer } from "@/contexts/CustomerContext";
import { useEffect, useRef, useState } from "react";

// Define interface for relationship data
interface RelationshipData {
  branch_code: string;
  city: string;
  sales_officer_emp_no: string;
  sales_manager_emp_no: string;
  fr_br_emp_no: string;
  channel: string;
}

export const SMERelationshipDetailForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  
  // Use refs to prevent infinite update loops
  const isInitialized = useRef(false);
  const skipNextUpdate = useRef(false);
  const isFirstRender = useRef(true);
  
  // Controlled state
  const [formData, setFormData] = useState<RelationshipData>({
    branch_code: "",
    city: "",
    sales_officer_emp_no: "",
    sales_manager_emp_no: "",
    fr_br_emp_no: "",
    channel: ""
  });
  
  // Initialize form with data from context (runs once)
  useEffect(() => {
    if (isInitialized.current) return;
    
    // Get existing data from context if available
    const smeApp = customerData?.smeApplication || {};
    
    // Update form data with existing values
    setFormData({
      branch_code: smeApp.branch_code || "",
      city: smeApp.city || "",
      sales_officer_emp_no: smeApp.sales_officer_emp_no || "",
      sales_manager_emp_no: smeApp.sales_manager_emp_no || "",
      fr_br_emp_no: smeApp.fr_br_emp_no || "",
      channel: smeApp.channel || ""
    });
    
    isInitialized.current = true;
  }, [customerData]);
  
  // Save to context when form data changes
  const saveToContext = () => {
    if (skipNextUpdate.current || !isInitialized.current) return;
    
    skipNextUpdate.current = true;
    
    // Map form data to the expected API format
    updateCustomerData({
      smeApplication: {
        ...(customerData?.smeApplication || {}),
        branch_code: formData.branch_code,
        city: formData.city,
        sales_officer_emp_no: formData.sales_officer_emp_no,
        sales_manager_emp_no: formData.sales_manager_emp_no,
        fr_br_emp_no: formData.fr_br_emp_no,
        channel: formData.channel
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
  const handleChange = (field: keyof RelationshipData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-primary text-primary-foreground">Relationship Detail</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
        <div>
          <label className="block text-sm font-medium mb-1">Branch Code</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2" 
            placeholder="Branch Code" 
            value={formData.branch_code}
            onChange={(e) => handleChange("branch_code", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">City</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2" 
            placeholder="City" 
            value={formData.city}
            onChange={(e) => handleChange("city", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Sales Officer Employee No.</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2" 
            placeholder="Emp. No." 
            value={formData.sales_officer_emp_no}
            onChange={(e) => handleChange("sales_officer_emp_no", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Sales Manager Emp No.</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2" 
            placeholder="Manager Emp. No." 
            value={formData.sales_manager_emp_no}
            onChange={(e) => handleChange("sales_manager_emp_no", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">FR/BR Employee No.</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2" 
            placeholder="FR/BR Employee No." 
            value={formData.fr_br_emp_no}
            onChange={(e) => handleChange("fr_br_emp_no", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Channel</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2" 
            placeholder="Channel" 
            value={formData.channel}
            onChange={(e) => handleChange("channel", e.target.value)}
          />
        </div>
      </div>
    </section>
  );
};
