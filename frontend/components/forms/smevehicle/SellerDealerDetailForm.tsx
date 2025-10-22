"use client";
import { useCustomer } from "@/contexts/CustomerContext";
import { useEffect, useRef, useState } from "react";

// Define interface using backend field names directly
interface SellerDealerDetailData {
  seller_name: string;
  seller_address: string;
  seller_contact_no: string;
  seller_cnic: string;
  dealer_name: string;
  dealer_address: string;
  dealer_contact_no: string;
  dealer_email: string;
}

export const SellerDealerDetailForm = () => {
  const { customerData, updateCustomerData } = useCustomer();

  const isInitialized = useRef(false);
  const skipNextUpdate = useRef(false);
  const isFirstRender = useRef(true);

  const [formData, setFormData] = useState<SellerDealerDetailData>({
    seller_name: "",
    seller_address: "",
    seller_contact_no: "",
    seller_cnic: "",
    dealer_name: "",
    dealer_address: "",
    dealer_contact_no: "",
    dealer_email: "",
  });

  // Load existing values into form
  useEffect(() => {
    if (isInitialized.current) return;

    const commercialVehicle = customerData?.commercialVehicle || {};

    setFormData({
      seller_name: commercialVehicle.seller_name || "",
      seller_address: commercialVehicle.seller_address || "",
      seller_contact_no: commercialVehicle.seller_contact_no || "",
      seller_cnic: commercialVehicle.seller_cnic || "",
      dealer_name: commercialVehicle.dealer_name || "",
      dealer_address: commercialVehicle.dealer_address || "",
      dealer_contact_no: commercialVehicle.dealer_contact_no || "",
      dealer_email: commercialVehicle.dealer_email || "",
    });

    isInitialized.current = true;
  }, [customerData]);

  // Sync to context
  const saveToContext = () => {
    if (skipNextUpdate.current || !isInitialized.current) return;

    skipNextUpdate.current = true;

    updateCustomerData({
      commercialVehicle: {
        ...(customerData?.commercialVehicle || {}),
        ...formData,
      },
    } as any);

    setTimeout(() => {
      skipNextUpdate.current = false;
    }, 50);
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    saveToContext();
  }, [formData]);

  const handleChange = (field: keyof SellerDealerDetailData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-primary text-primary-foreground">Seller & Dealer Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
        <div>
          <label className="block text-sm font-medium mb-1">Seller Name</label>
          <input
            type="text"
            className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm"
            placeholder="Seller Name"
            value={formData.seller_name}
            onChange={(e) => handleChange("seller_name", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Seller Contact No.</label>
          <input
            type="text"
            className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm"
            placeholder="Seller Contact No."
            value={formData.seller_contact_no}
            onChange={(e) => handleChange("seller_contact_no", e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Seller Address</label>
          <input
            type="text"
            className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm"
            placeholder="Seller Address"
            value={formData.seller_address}
            onChange={(e) => handleChange("seller_address", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Seller CNIC</label>
          <input
            type="text"
            className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm"
            placeholder="Seller CNIC"
            value={formData.seller_cnic}
            onChange={(e) => handleChange("seller_cnic", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Dealer Name</label>
          <input
            type="text"
            className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm"
            placeholder="Dealer Name"
            value={formData.dealer_name}
            onChange={(e) => handleChange("dealer_name", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Dealer Contact No.</label>
          <input
            type="text"
            className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm"
            placeholder="Dealer Contact No."
            value={formData.dealer_contact_no}
            onChange={(e) => handleChange("dealer_contact_no", e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Dealer Address</label>
          <input
            type="text"
            className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm"
            placeholder="Dealer Address"
            value={formData.dealer_address}
            onChange={(e) => handleChange("dealer_address", e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Dealer Email</label>
          <input
            type="email"
            className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm"
            placeholder="Dealer Email"
            value={formData.dealer_email}
            onChange={(e) => handleChange("dealer_email", e.target.value)}
          />
        </div>
      </div>
    </section>
  );
};
