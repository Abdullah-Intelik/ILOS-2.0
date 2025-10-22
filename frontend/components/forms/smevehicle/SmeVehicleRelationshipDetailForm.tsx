"use client";
import { useCustomer } from "@/contexts/CustomerContext";
import { useEffect, useRef, useState } from "react";

// Define interface for relationship detail data
interface RelationshipDetailData {
  branch_code: string;
  city: string;
  sales_officer_emp_no: string;
  sales_manager_emp_no: string;
  pb_bm_employee_no: string;
  channel: string;
}

export const RelationshipDetailForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  
  // Use refs to prevent infinite update loops
  const isInitialized = useRef(false);
  const skipNextUpdate = useRef(false);
  const isFirstRender = useRef(true);
  
  // Controlled state
  const [formData, setFormData] = useState<RelationshipDetailData>({
    branch_code: "",
    city: "",
    sales_officer_emp_no: "",
    sales_manager_emp_no: "",
    pb_bm_employee_no: "",
    channel: ""
  });
  
  // Initialize form with data from context (runs once)
  useEffect(() => {
    if (isInitialized.current) return;
    
    // Get existing data from context if available
    const commercialVehicle = customerData?.commercialVehicle || {};
    
    // Update form data with existing values
    setFormData({
      branch_code: commercialVehicle.branch_code || "",
      city: commercialVehicle.city || "",
      sales_officer_emp_no: commercialVehicle.sales_officer_emp_no || "",
      sales_manager_emp_no: commercialVehicle.sales_manager_emp_no || "",
      pb_bm_employee_no: commercialVehicle.pb_bm_employee_no || "",
      channel: commercialVehicle.channel || ""
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
        branch_code: formData.branch_code,
        city: formData.city,
        sales_officer_emp_no: formData.sales_officer_emp_no,
        sales_manager_emp_no: formData.sales_manager_emp_no,
        pb_bm_employee_no: formData.pb_bm_employee_no,
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
  const handleChange = (field: keyof RelationshipDetailData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg font-semibold mb-4 p-4 bg-primary text-primary-foreground">Relationship Detail</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
        <div>
          <label className="block text-sm font-medium mb-1">Branch Code</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm" 
            placeholder="Branch Code" 
            value={formData.branch_code}
            onChange={(e) => handleChange("branch_code", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">City</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm" 
            placeholder="City" 
            value={formData.city}
            onChange={(e) => handleChange("city", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Sales Officer Emp. No.</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm" 
            placeholder="Emp. No." 
            value={formData.sales_officer_emp_no}
            onChange={(e) => handleChange("sales_officer_emp_no", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Sales Manager Emp. No.</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm" 
            placeholder="Manager Emp. No." 
            value={formData.sales_manager_emp_no}
            onChange={(e) => handleChange("sales_manager_emp_no", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">PB/BM Employee No.</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm" 
            placeholder="Employee No." 
            value={formData.pb_bm_employee_no}
            onChange={(e) => handleChange("pb_bm_employee_no", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Channel</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm" 
            placeholder="Channel" 
            value={formData.channel}
            onChange={(e) => handleChange("channel", e.target.value)}
          />
        </div>
      </div>
    </section>
  );
};
