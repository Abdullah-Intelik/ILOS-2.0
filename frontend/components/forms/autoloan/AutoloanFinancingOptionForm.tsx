"use client";
import React from "react";

interface Props {
  formData: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FinancingOptionForm: React.FC<Props> = ({ formData, handleInputChange }) => {
  return (
    <section className="bg-white rounded-2xl shadow p-8 mb-10">
      <h2 className="text-2xl text-white font-semibold mb-4 rounded-lg p-4 bg-primary text-primary-foreground">
        11. Financing / Leasing Option
      </h2>
      <div>
        <label className="block font-semibold text-sm mb-3">Select Option</label>
        <div className="flex flex-col gap-4">
          <label className="flex items-center gap-2 text-base font-medium">
            <input
              type="radio"
              name="financing_option"
              value="Financing"
              checked={formData.financing_option === "Financing"}
              onChange={handleInputChange}
            />
            Financing (Vehicle in customer's name & HPA UBL)
          </label>
          <label className="flex items-center gap-2 text-base font-medium">
            <input
              type="radio"
              name="financing_option"
              value="Leasing"
              checked={formData.financing_option === "Leasing"}
              onChange={handleInputChange}
            />
            Leasing (Vehicle in Bank's name)
          </label>
          <label className="flex items-center gap-2 text-base font-medium">
            <input
              type="radio"
              name="financing_option"
              value="Leasing with RV"
              checked={formData.financing_option === "Leasing with RV"}
              onChange={handleInputChange}
            />
            Leasing with RV Option (Vehicle in Bank's name)
          </label>
        </div>
      </div>
    </section>
  );
};
