"use client";
import React from "react";

interface Props {
  formData: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const DealerDetailsForm: React.FC<Props> = ({ formData, handleInputChange }) => {
  return (
    <section className="bg-white rounded-2xl shadow p-8 mb-10">
      <h2 className="text-2xl text-white font-semibold mb-4 rounded-lg p-4 bg-primary text-primary-foreground">
        4. Dealer Details
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">Dealer Name</label>
          <input
            type="text"
            name="dealer_name"
            value={formData.dealer_name || ""}
            onChange={handleInputChange}
            placeholder="Dealer Name"
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2"
          />
        </div>

        {/* Placeholder: file input not handled in formData — would require FormData / file upload handling separately */}
        <div className="col-span-1 md:col-span-2 flex flex-col">
          <label className="mb-2 text-sm font-medium">Dealer Stamp</label>
          <input
            type="file"
            disabled
            className="cursor-not-allowed w-full rounded-xl border border-gray-300 bg-gray-100 px-4 py-2"
          />
          <small className="text-xs text-gray-500">*Stamp upload not yet connected to backend.</small>
        </div>
      </div>
    </section>
  );
};
