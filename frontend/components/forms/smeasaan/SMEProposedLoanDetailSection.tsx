// components/forms/ProposedLoanDetailSection.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useCustomer } from "@/contexts/CustomerContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Define interface for proposed loan details data
interface ProposedLoanData {
  vehicleName: string;
  desiredLoanAmount: string;
  tenureYears: string;
  pricing: string;
  downPaymentPercent: string;
  downPaymentAmount: string;
  insuranceCompany: string;
  trackerCompany: string;
}

export function SMEProposedLoanDetailSection({
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
  const [formData, setFormData] = useState<ProposedLoanData>({
    vehicleName: "",
    desiredLoanAmount: "",
    tenureYears: "",
    pricing: "",
    downPaymentPercent: "",
    downPaymentAmount: "",
    insuranceCompany: "",
    trackerCompany: ""
  });
  
  // Initialize form with data from context (runs once)
  useEffect(() => {
    if (isInitialized.current) return;
    
    // Get existing data from context if available
    const smeApp = customerData?.smeApplication || {};
    
    // Update form data with existing values
    setFormData({
      vehicleName: smeApp.vehicle_name || values.vehicleName || "",
      desiredLoanAmount: smeApp.desired_loan_amount ? String(smeApp.desired_loan_amount) : values.desiredLoanAmount || "",
      tenureYears: smeApp.tenure_years ? String(smeApp.tenure_years) : values.tenureYears || "",
      pricing: smeApp.pricing || values.pricing || "",
      downPaymentPercent: smeApp.down_payment_percent ? String(smeApp.down_payment_percent) : values.downPaymentPercent || "",
      downPaymentAmount: smeApp.down_payment_amount ? String(smeApp.down_payment_amount) : values.downPaymentAmount || "",
      insuranceCompany: smeApp.insurance_company_name || values.insuranceCompany || "",
      trackerCompany: smeApp.tracker_company_name || values.trackerCompany || ""
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
        vehicle_name: formData.vehicleName,
        desired_loan_amount: formData.desiredLoanAmount ? Number(formData.desiredLoanAmount) : null,
        tenure_years: formData.tenureYears ? Number(formData.tenureYears) : null,
        pricing: formData.pricing,
        down_payment_percent: formData.downPaymentPercent ? Number(formData.downPaymentPercent) : null,
        down_payment_amount: formData.downPaymentAmount ? Number(formData.downPaymentAmount) : null,
        insurance_company_name: formData.insuranceCompany,
        tracker_company_name: formData.trackerCompany
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
  const handleChange = (field: keyof ProposedLoanData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Also call the parent onChange for backward compatibility
    onChange(field, value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-primary text-primary-foreground">Proposed Loan Details</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Vehicle Name</Label>
          <Input
            value={formData.vehicleName}
            onChange={e => handleChange("vehicleName", e.target.value)}
            placeholder="Vehicle Name"
          />
        </div>
        <div>
          <Label>Desired Loan Amount</Label>
          <Input
            type="number"
            value={formData.desiredLoanAmount}
            onChange={e => handleChange("desiredLoanAmount", e.target.value)}
            placeholder="e.g. 2,000,000"
          />
        </div>
        <div>
          <Label>Tenure in Years</Label>
          <Input
            type="number"
            value={formData.tenureYears}
            onChange={e => handleChange("tenureYears", e.target.value)}
            placeholder="e.g. 5"
          />
        </div>
        <div>
          <Label>Pricing</Label>
          <Input
            value={formData.pricing}
            onChange={e => handleChange("pricing", e.target.value)}
            placeholder="Pricing"
          />
        </div>
        <div>
          <Label>Down Payment %</Label>
          <Input
            type="number"
            value={formData.downPaymentPercent}
            onChange={e => handleChange("downPaymentPercent", e.target.value)}
            placeholder="e.g. 20"
          />
        </div>
        <div>
          <Label>Down Payment Amount</Label>
          <Input
            type="number"
            value={formData.downPaymentAmount}
            onChange={e => handleChange("downPaymentAmount", e.target.value)}
            placeholder="e.g. 400,000"
          />
        </div>
        <div>
          <Label>Insurance Company Name</Label>
          <Input
            value={formData.insuranceCompany}
            onChange={e => handleChange("insuranceCompany", e.target.value)}
            placeholder="Insurance Company"
          />
        </div>
        <div>
          <Label>Tracker Company Name</Label>
          <Input
            value={formData.trackerCompany}
            onChange={e => handleChange("trackerCompany", e.target.value)}
            placeholder="Tracker Company"
          />
        </div>
      </CardContent>
    </Card>
  );
}
