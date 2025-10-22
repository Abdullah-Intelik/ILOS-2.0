"use client";
import React, { useEffect } from "react";

interface Props {
  formData: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ProductProgramForm: React.FC<Props> = ({ formData, handleInputChange }) => {
     // Auto-generate Application ID if not set
  useEffect(() => {
    if (!formData.auto_application_id) {
      const randomId = `AUTO-${Math.floor(100 + Math.random() * 900)}`; // e.g. AUTO-357
      const event = {
        target: { name: "auto_application_id", value: randomId }
      } as React.ChangeEvent<HTMLInputElement>;
      handleInputChange(event);
    }
  }, []);

  return(
    <section className="bg-white rounded-2xl shadow p-8 mb-10">
      <h2 className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-primary text-primary-foreground">1. Product Program</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* City */}
        <div>
          <label className="block text-sm font-medium mb-1">City</label>
          <input
            type="text"
            name="city"
            value={formData.city || ""}
            onChange={handleInputChange}
            placeholder="City"
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2 text-base shadow-sm"
          />
        </div>

        {/* Auto Application ID */}
        <div>
          <label className="block text-sm font-medium mb-1">Auto Application ID</label>
          <input
            type="text"
            name="auto_application_id"
            value={formData.auto_application_id || ""}
            onChange={handleInputChange}
            placeholder="Auto Application ID"
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2 text-base shadow-sm"
          />
        </div>

        {/* Product Type */}
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Product Type</label>
          <div className="flex gap-6">
            {["New Car", "Used Car"].map((type) => (
              <label key={type} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="product_type"
                  value={type}
                  checked={formData.product_type === type}
                  onChange={handleInputChange}
                />
                {type}
              </label>
            ))}
          </div>
        </div>

        {/* Payment Mode */}
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Payment Mode</label>
          <div className="flex gap-6">
            {["PO Manufacturer", "PO Dealer", "PO Seller"].map((mode) => (
              <label key={mode} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="payment_mode"
                  value={mode}
                  checked={formData.payment_mode === mode}
                  onChange={handleInputChange}
                />
                {mode}
              </label>
            ))}
          </div>
        </div>

        {/* Pricing Plan */}
        <div className="col-span-2 flex flex-col gap-3">
          <label className="block text-sm font-medium mb-1">Pricing Plan</label>

          {/* Fixed Rate */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="pricing_plan"
                value="Fixed Rate"
                checked={formData.pricing_plan === "Fixed Rate"}
                onChange={handleInputChange}
              />
              Fixed Rate
            </label>
            <input
              type="number"
              name="fixed_rate"
              value={formData.fixed_rate || ""}
              onChange={handleInputChange}
              placeholder="Fixed Rate (%)"
              className="w-32 rounded-xl border border-gray-300 bg-gray-50 px-3 py-2"
            />
          </div>

          {/* Floating KIBOR + Margin */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="pricing_plan"
                value="Floating Rate"
                checked={formData.pricing_plan === "Floating Rate"}
                onChange={handleInputChange}
              />
              Floating KIBOR + Margin
            </label>
            <input
              type="number"
              name="kibor_rate"
              value={formData.kibor_rate || ""}
              onChange={handleInputChange}
              placeholder="KIBOR (%)"
              className="w-32 rounded-xl border border-gray-300 bg-gray-50 px-3 py-2"
            />
            <input
              type="number"
              name="margin"
              value={formData.margin || ""}
              onChange={handleInputChange}
              placeholder="Margin (%)"
              className="w-32 rounded-xl border border-gray-300 bg-gray-50 px-3 py-2"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
