"use client";
import { useCustomer } from "@/contexts/CustomerContext";
import { useEffect, useRef, useState } from "react";

// Define interface for vehicle detail data
interface VehicleDetailData {
  vehicle_manufacturer: string;
  vehicle_model: string;
  vehicle_year: string;
  vehicle_local_assembled: boolean;
  vehicle_new_used: string;
  engine_no: string;
  engine_size_cc: string;
  chassis_no: string;
  purchase_type: string;
  vehicle_price: string;
}

export const VehicleDetailForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  
  // Use refs to prevent infinite update loops
  const isInitialized = useRef(false);
  const skipNextUpdate = useRef(false);
  const isFirstRender = useRef(true);
  
  // Controlled state
  const [formData, setFormData] = useState<VehicleDetailData>({
    vehicle_manufacturer: "",
    vehicle_model: "",
    vehicle_year: "",
    vehicle_local_assembled: false,
    vehicle_new_used: "",
    engine_no: "",
    engine_size_cc: "",
    chassis_no: "",
    purchase_type: "",
    vehicle_price: ""
  });
  
  // Initialize form with data from context (runs once)
  useEffect(() => {
    if (isInitialized.current) return;
    
    // Get existing data from context if available
    const commercialVehicle = customerData?.commercialVehicle || {};
    
    // Update form data with existing values
    setFormData({
      vehicle_manufacturer: commercialVehicle.vehicle_manufacturer || "",
      vehicle_model: commercialVehicle.vehicle_model || "",
      vehicle_year: commercialVehicle.vehicle_year ? String(commercialVehicle.vehicle_year) : "",
      vehicle_local_assembled: Boolean(commercialVehicle.vehicle_local_assembled),
      vehicle_new_used: commercialVehicle.vehicle_new_used || "",
      engine_no: commercialVehicle.engine_no || "",
      engine_size_cc: commercialVehicle.engine_size_cc ? String(commercialVehicle.engine_size_cc) : "",
      chassis_no: commercialVehicle.chassis_no || "",
      purchase_type: commercialVehicle.purchase_type || "",
      vehicle_price: commercialVehicle.vehicle_price ? String(commercialVehicle.vehicle_price) : ""
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
        vehicle_manufacturer: formData.vehicle_manufacturer,
        vehicle_model: formData.vehicle_model,
        vehicle_year: formData.vehicle_year ? parseInt(formData.vehicle_year, 10) : null,
        vehicle_local_assembled: formData.vehicle_local_assembled,
        vehicle_new_used: formData.vehicle_new_used,
        engine_no: formData.engine_no,
        engine_size_cc: formData.engine_size_cc ? parseInt(formData.engine_size_cc, 10) : null,
        chassis_no: formData.chassis_no,
        purchase_type: formData.purchase_type,
        vehicle_price: formData.vehicle_price ? parseFloat(formData.vehicle_price) : null
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
  const handleChange = (field: keyof VehicleDetailData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-primary text-primary-foreground">Vehicle Detail</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
        <div>
          <label className="block text-sm font-medium mb-1">Vehicle Manufacturer</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm" 
            placeholder="Manufacturer" 
            value={formData.vehicle_manufacturer}
            onChange={(e) => handleChange("vehicle_manufacturer", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Vehicle Model</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm" 
            placeholder="Model" 
            value={formData.vehicle_model}
            onChange={(e) => handleChange("vehicle_model", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Year of Manufacture</label>
          <input 
            type="number" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm" 
            placeholder="Year" 
            value={formData.vehicle_year}
            onChange={(e) => handleChange("vehicle_year", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Local/Assembled</label>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={formData.vehicle_local_assembled}
                onChange={(e) => handleChange("vehicle_local_assembled", e.target.checked)}
              /> Yes
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">New/Used</label>
          <select 
            className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm"
            value={formData.vehicle_new_used}
            onChange={(e) => handleChange("vehicle_new_used", e.target.value)}
          >
            <option value="">Select</option>
            <option value="New">New</option>
            <option value="Used">Used</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Engine No.</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm" 
            placeholder="Engine No." 
            value={formData.engine_no}
            onChange={(e) => handleChange("engine_no", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Engine Size (cc)</label>
          <input 
            type="number" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm" 
            placeholder="Engine Capacity" 
            value={formData.engine_size_cc}
            onChange={(e) => handleChange("engine_size_cc", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Chassis No.</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm" 
            placeholder="Chassis No." 
            value={formData.chassis_no}
            onChange={(e) => handleChange("chassis_no", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Purchase Type</label>
          <select 
            className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm"
            value={formData.purchase_type}
            onChange={(e) => handleChange("purchase_type", e.target.value)}
          >
            <option value="">Select</option>
            <option value="Cash">Cash</option>
            <option value="Finance">Finance</option>
            <option value="Lease">Lease</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Vehicle Price (Rs.)</label>
          <input 
            type="number" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm" 
            placeholder="Vehicle Price" 
            value={formData.vehicle_price}
            onChange={(e) => handleChange("vehicle_price", e.target.value)}
          />
        </div>
      </div>
    </section>
  );
};
