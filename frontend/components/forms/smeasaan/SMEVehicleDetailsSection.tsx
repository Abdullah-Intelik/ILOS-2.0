// components/forms/VehicleDetailsSection.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useCustomer } from "@/contexts/CustomerContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

// Define interface for vehicle details data
interface VehicleDetailsData {
  manufacturer: string;
  model: string;
  year: string;
  engineSize: string;
  engineNo: string;
  chassisNo: string;
  price: string;
  assembledType: string;
  newUsed: string;
  purchaseAdvance: boolean;
  purchaseDelivery: boolean;
}

export function SMEVehicleDetailsSection({
  values = {},
  onChange = () => {},
}: {
  values?: Record<string, any>;
  onChange?: (field: string, value: any) => void;
}) {
  const { customerData, updateCustomerData } = useCustomer();
  
  // Use refs to prevent infinite update loops
  const isInitialized = useRef(false);
  const skipNextUpdate = useRef(false);
  const isFirstRender = useRef(true);
  
  // Controlled state
  const [formData, setFormData] = useState<VehicleDetailsData>({
    manufacturer: "",
    model: "",
    year: "",
    engineSize: "",
    engineNo: "",
    chassisNo: "",
    price: "",
    assembledType: "",
    newUsed: "",
    purchaseAdvance: false,
    purchaseDelivery: false
  });
  
  // Initialize form with data from context (runs once)
  useEffect(() => {
    if (isInitialized.current) return;
    
    // Get existing data from context if available
    const smeApp = customerData?.smeApplication || {};
    
    // Update form data with existing values
    setFormData({
      manufacturer: smeApp.vehicle_manufacturer || values.manufacturer || "",
      model: smeApp.vehicle_model || values.model || "",
      year: smeApp.vehicle_year ? String(smeApp.vehicle_year) : values.year || "",
      engineSize: smeApp.engine_size_cc ? String(smeApp.engine_size_cc) : values.engineSize || "",
      engineNo: smeApp.engine_no || values.engineNo || "",
      chassisNo: smeApp.chassis_no || values.chassisNo || "",
      price: smeApp.vehicle_price ? String(smeApp.vehicle_price) : values.price || "",
      assembledType: smeApp.vehicle_local_assembled ? "local" : smeApp.vehicle_imported ? "imported" : values.assembledType || "",
      newUsed: smeApp.vehicle_new ? "new" : smeApp.vehicle_used ? "used" : values.newUsed || "",
      purchaseAdvance: Boolean(smeApp.purchase_poa) || Boolean(values.purchaseAdvance),
      purchaseDelivery: Boolean(smeApp.purchase_pod) || Boolean(values.purchaseDelivery)
    });
    
    isInitialized.current = true;
  }, [customerData, values]);
  
  // Save to context when form data changes
  const saveToContext = () => {
    if (skipNextUpdate.current || !isInitialized.current) return;
    
    skipNextUpdate.current = true;
    
    // Map form data to the expected API format
    updateCustomerData({
      smeApplication: {
        ...(customerData?.smeApplication || {}),
        vehicle_manufacturer: formData.manufacturer,
        vehicle_model: formData.model,
        vehicle_year: formData.year ? Number(formData.year) : null,
        engine_size_cc: formData.engineSize ? Number(formData.engineSize) : null,
        engine_no: formData.engineNo,
        chassis_no: formData.chassisNo,
        vehicle_price: formData.price ? Number(formData.price) : null,
        vehicle_local_assembled: formData.assembledType === "local",
        vehicle_imported: formData.assembledType === "imported",
        vehicle_new: formData.newUsed === "new",
        vehicle_used: formData.newUsed === "used",
        purchase_poa: formData.purchaseAdvance,
        purchase_pod: formData.purchaseDelivery
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
  const handleChange = (field: keyof VehicleDetailsData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Also call the parent onChange for backward compatibility
    onChange(field, value);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-primary text-primary-foreground">Vehicle Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Manufacturer</Label>
            <Input
              value={formData.manufacturer}
              onChange={(e) => handleChange("manufacturer", e.target.value)}
              placeholder="e.g. Honda"
            />
          </div>
          <div>
            <Label>Model</Label>
            <Input
              value={formData.model}
              onChange={(e) => handleChange("model", e.target.value)}
              placeholder="e.g. Civic"
            />
          </div>
          <div>
            <Label>Year of Manufacture</Label>
            <Input
              type="number"
              min={1970}
              max={2100}
              value={formData.year}
              onChange={(e) => handleChange("year", e.target.value)}
              placeholder="e.g. 2024"
            />
          </div>
          <div>
            <Label>Engine Size (CC)</Label>
            <Input
              type="number"
              value={formData.engineSize}
              onChange={(e) => handleChange("engineSize", e.target.value)}
              placeholder="e.g. 1800"
            />
          </div>
          <div>
            <Label>Engine No.</Label>
            <Input
              value={formData.engineNo}
              onChange={(e) => handleChange("engineNo", e.target.value)}
              placeholder="Engine No."
            />
          </div>
          <div>
            <Label>Chassis No.</Label>
            <Input
              value={formData.chassisNo}
              onChange={(e) => handleChange("chassisNo", e.target.value)}
              placeholder="Chassis No."
            />
          </div>
          <div>
            <Label>Vehicle Price</Label>
            <Input
              type="number"
              value={formData.price}
              onChange={(e) => handleChange("price", e.target.value)}
              placeholder="e.g. 5,000,000"
            />
          </div>
        </div>

        {/* Radio groups and checkboxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="mb-1 block">Local Assembled / Imported</Label>
            <RadioGroup
              value={formData.assembledType}
              onValueChange={(val) => handleChange("assembledType", val)}
              className="flex gap-6"
            >
              <RadioGroupItem value="local" id="local">
                <Label htmlFor="local" className="ml-2 cursor-pointer">Local Assembled</Label>
              </RadioGroupItem>
              <RadioGroupItem value="imported" id="imported">
                <Label htmlFor="imported" className="ml-2 cursor-pointer">Imported</Label>
              </RadioGroupItem>
            </RadioGroup>
          </div>
          <div>
            <Label className="mb-1 block">New / Used</Label>
            <RadioGroup
              value={formData.newUsed}
              onValueChange={(val) => handleChange("newUsed", val)}
              className="flex gap-6"
            >
              <RadioGroupItem value="new" id="new">
                <Label htmlFor="new" className="ml-2 cursor-pointer">New</Label>
              </RadioGroupItem>
              <RadioGroupItem value="used" id="used">
                <Label htmlFor="used" className="ml-2 cursor-pointer">Used</Label>
              </RadioGroupItem>
            </RadioGroup>
          </div>
        </div>
        <div className="flex gap-6 mt-2">
          <Checkbox
            checked={formData.purchaseAdvance}
            onCheckedChange={(checked) => handleChange("purchaseAdvance", checked)}
            id="poa"
          />
          <Label htmlFor="poa">Purchase of Advance (POA)</Label>
          <Checkbox
            checked={formData.purchaseDelivery}
            onCheckedChange={(checked) => handleChange("purchaseDelivery", checked)}
            id="pod"
          />
          <Label htmlFor="pod">Purchase of Delivery (POD)</Label>
        </div>
      </CardContent>
    </Card>
  );
}
