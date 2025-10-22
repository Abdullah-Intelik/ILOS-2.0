// components/forms/SellerDealerDetailsSection.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useCustomer } from "@/contexts/CustomerContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Define interface for seller/dealer details data
interface SellerDealerData {
  sellerName: string;
  sellerCnic: string;
  sellerAddress: string;
  sellerContact: string;
  dealerName: string;
  dealerEmail: string;
  dealerAddress: string;
  dealerContact: string;
}

export function SMESellerDealerDetailsSection({
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
  const [formData, setFormData] = useState<SellerDealerData>({
    sellerName: "",
    sellerCnic: "",
    sellerAddress: "",
    sellerContact: "",
    dealerName: "",
    dealerEmail: "",
    dealerAddress: "",
    dealerContact: ""
  });
  
  // Initialize form with data from context (runs once)
  useEffect(() => {
    if (isInitialized.current) return;
    
    // Get existing data from context if available
    const smeApp = customerData?.smeApplication || {};
    
    // Update form data with existing values
    setFormData({
      sellerName: smeApp.seller_name || values.sellerName || "",
      sellerCnic: smeApp.seller_cnic || values.sellerCnic || "",
      sellerAddress: smeApp.seller_address || values.sellerAddress || "",
      sellerContact: smeApp.seller_contact_no || values.sellerContact || "",
      dealerName: smeApp.dealer_name || values.dealerName || "",
      dealerEmail: smeApp.dealer_email || values.dealerEmail || "",
      dealerAddress: smeApp.dealer_address || values.dealerAddress || "",
      dealerContact: smeApp.dealer_contact_no || values.dealerContact || ""
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
        seller_name: formData.sellerName,
        seller_cnic: formData.sellerCnic,
        seller_address: formData.sellerAddress,
        seller_contact_no: formData.sellerContact,
        dealer_name: formData.dealerName,
        dealer_email: formData.dealerEmail,
        dealer_address: formData.dealerAddress,
        dealer_contact_no: formData.dealerContact
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
  const handleChange = (field: keyof SellerDealerData, value: string) => {
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
        <CardTitle className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-primary text-primary-foreground">Seller / Dealer Detail</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Seller Details */}
          <div>
            <h4 className="font-semibold text-blue-700 mb-2">Seller's Detail</h4>
            <div className="space-y-3">
              <div>
                <Label>Name</Label>
                <Input
                  value={formData.sellerName}
                  onChange={e => handleChange("sellerName", e.target.value)}
                  placeholder="Seller Name"
                />
              </div>
              <div>
                <Label>CNIC</Label>
                <Input
                  value={formData.sellerCnic}
                  onChange={e => handleChange("sellerCnic", e.target.value)}
                  placeholder="Seller CNIC"
                />
              </div>
              <div>
                <Label>Residence Address</Label>
                <Input
                  value={formData.sellerAddress}
                  onChange={e => handleChange("sellerAddress", e.target.value)}
                  placeholder="Seller Residence Address"
                />
              </div>
              <div>
                <Label>Contact No.</Label>
                <Input
                  value={formData.sellerContact}
                  onChange={e => handleChange("sellerContact", e.target.value)}
                  placeholder="Seller Contact Number"
                />
              </div>
            </div>
          </div>
          {/* Dealer Details */}
          <div>
            <h4 className="font-semibold text-blue-700 mb-2">Dealer's Detail</h4>
            <div className="space-y-3">
              <div>
                <Label>Name</Label>
                <Input
                  value={formData.dealerName}
                  onChange={e => handleChange("dealerName", e.target.value)}
                  placeholder="Dealer Name"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  value={formData.dealerEmail}
                  onChange={e => handleChange("dealerEmail", e.target.value)}
                  placeholder="Dealer Email"
                  type="email"
                />
              </div>
              <div>
                <Label>Address</Label>
                <Input
                  value={formData.dealerAddress}
                  onChange={e => handleChange("dealerAddress", e.target.value)}
                  placeholder="Dealer Address"
                />
              </div>
              <div>
                <Label>Contact No.</Label>
                <Input
                  value={formData.dealerContact}
                  onChange={e => handleChange("dealerContact", e.target.value)}
                  placeholder="Dealer Contact Number"
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
