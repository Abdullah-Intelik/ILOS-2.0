"use client";
import React from "react";

interface Props {
  formData: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const InsuranceDetailsForm: React.FC<Props> = ({ formData, handleInputChange }) => {
  return (
    <section className="bg-white rounded-2xl shadow p-8 mb-10">
      <h2 className="text-2xl text-white font-semibold mb-4 rounded-lg p-4 bg-primary text-primary-foreground">
        3. Insurance Details
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">Insurance Company Name</label>
          <input
            type="text"
            name="insurance_company_name"
            value={formData.insurance_company_name || ""}
            onChange={handleInputChange}
            placeholder="Insurance Company Name"
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Insurance Rate (%)</label>
          <input
            type="number"
            name="insurance_rate"
            value={formData.insurance_rate || ""}
            onChange={handleInputChange}
            placeholder="Insurance Rate (%)"
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2"
          />
        </div>
      </div>
    </section>
  );
};
