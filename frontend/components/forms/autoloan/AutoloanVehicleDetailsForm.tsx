"use client";
import React from "react";

interface Props {
  formData: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export const VehicleDetailsForm: React.FC<Props> = ({ formData, handleInputChange }) => {
  return (
    <section className="bg-white rounded-2xl shadow p-8 mb-10">
      <h2 className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-primary text-primary-foreground">
        2. Vehicle Details
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Main Vehicle Info */}
        <div>
          <label className="block text-sm font-medium mb-1">Manufacturer</label>
          <input
            type="text"
            name="vehicle_manufacturer"
            value={formData.vehicle_manufacturer || ""}
            onChange={handleInputChange}
            placeholder="Manufacturer"
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Model</label>
          <input
            type="text"
            name="vehicle_model"
            value={formData.vehicle_model || ""}
            onChange={handleInputChange}
            placeholder="Model"
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Year of Manufacture</label>
          <input
            type="number"
            name="year_of_manufacture"
            value={formData.year_of_manufacture || ""}
            onChange={handleInputChange}
            placeholder="Year of Manufacture"
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Vehicle Class / Engine Size</label>
          <input
            type="text"
            name="vehicle_class_engine_size"
            value={formData.vehicle_class_engine_size || ""}
            onChange={handleInputChange}
            placeholder="Vehicle Class / Engine Size"
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Price / Value (Rs.)</label>
          <input
            type="number"
            name="price_value"
            value={formData.price_value || ""}
            onChange={handleInputChange}
            placeholder="Price / Value (Rs.)"
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Down Payment %</label>
          <input
            type="number"
            name="down_payment_percent"
            value={formData.down_payment_percent || ""}
            onChange={handleInputChange}
            placeholder="Down Payment %"
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Down Payment Amount (Rs.)</label>
          <input
            type="number"
            name="down_payment_amount"
            value={formData.down_payment_amount || ""}
            onChange={handleInputChange}
            placeholder="Down Payment Amount"
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Desired Loan Amount (Rs.)</label>
          <input
            type="number"
            name="desired_loan_amount"
            value={formData.desired_loan_amount || ""}
            onChange={handleInputChange}
            placeholder="Loan Amount"
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2"
          />
        </div>

        {/* Installment Period */}
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Installment Period</label>
          <div className="flex gap-4 flex-wrap">
            {[1, 2, 3, 4, 5, 6, 7].map((year) => (
              <label key={year} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="installment_period"
                  value={year}
                  checked={formData.installment_period === year}
                  onChange={(e) =>
                    handleInputChange({
                      target: {
                        name: "installment_period",
                        value: parseInt(e.target.value),
                      },
                    } as any)
                  }
                />
                {year} year(s)
              </label>
            ))}
          </div>
        </div>

        {/* Used Car Info */}
        <div className="col-span-2 pt-8 border-t mt-6">
          <h3 className="text-lg font-semibold mb-4">Used Car Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              ["used_seller_name", "Seller Name"],
              ["used_seller_cnic", "Seller CNIC No."],
              ["used_house_no", "House / Flat No."],
              ["used_street", "Street"],
              ["used_area", "Tehsil / District / Area"],
              ["used_landmark", "Nearest Landmark"],
              ["used_city", "City"],
              ["used_country", "Country"],
              ["used_postal_code", "Postal Code"],
              ["used_contact_no", "Contact No."],
              ["used_bank", "Bank"],
              ["used_branch", "Branch"],
              ["used_account_no", "Account No."],
            ].map(([field, label]) => (
              <div key={field}>
                <label className="block text-sm font-medium mb-1">{label}</label>
                <input
                  type="text"
                  name={field}
                  value={formData[field] || ""}
                  onChange={handleInputChange}
                  placeholder={label}
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
