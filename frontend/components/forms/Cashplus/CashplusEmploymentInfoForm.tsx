"use client";
import React from "react";
import { useCustomer } from "@/contexts/CustomerContext";

export const CashplusEmploymentInfoForm = () => {
  const { customerData, updateCustomerData } = useCustomer();

  // Defensive defaults (ensure employmentDetails is always an object)
  const employment = customerData?.employmentDetails || {};

  // Helper to update employment details in global context
  const handleChange = (field: string, value: any) => {
    updateCustomerData({
      employmentDetails: {
        ...employment,
        [field]: value,
      },
    });
  };

  // Office address fields (nested)
  const officeAddress = employment.officeAddress || {};
  const handleOfficeAddressChange = (field: string, value: any) => {
    updateCustomerData({
      employmentDetails: {
        ...employment,
        officeAddress: {
          ...officeAddress,
          [field]: value,
        },
      },
    });
  };

  // Helper for prefilled highlighting (optional)
  const prefilledFields = new Set(
    Object.entries(employment)
      .filter(([k, v]) => !!v)
      .map(([k]) => k)
  );
  const getFieldClasses = (fieldName: string) => {
    const baseClasses = "w-full border border-gray-300 rounded-xl px-4 py-2";
    const prefilledClasses = "bg-blue-50 border-blue-300";
    const normalClasses = "bg-white";
    return `${baseClasses} ${prefilledFields.has(fieldName) ? prefilledClasses : normalClasses}`;
  };

  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-primary text-primary-foreground">
        4. Employment / Occupational Details
      </h3>
      {customerData?.isETB && prefilledFields.size > 0 && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm text-blue-800">
            <strong>✨ Auto-Filled:</strong> Fields highlighted in blue are pre-filled from your previous loan application. You can edit them if needed.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
        {/* Company's Name */}
        <div>
          <label className="block mb-2 font-medium">Company's Name *</label>
          <input
            type="text"
            className={getFieldClasses("companyName")}
            placeholder="Company's Name"
            value={employment.companyName || ""}
            onChange={(e) => handleChange("companyName", e.target.value)}
          />
        </div>

        {/* Company Type */}
        <div>
          <label className="block mb-2 font-medium">Company Type *</label>
          <div className="flex flex-wrap gap-3 mb-2">
            {["Private Limited", "Public Limited", "Government", "Other"].map((type) => (
              <label key={type} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="companyType"
                  value={type}
                  checked={employment.companyType === type}
                  onChange={(e) => handleChange("companyType", e.target.value)}
                />
                {type}
              </label>
            ))}
          </div>
          {employment.companyType === "Other" && (
            <input
              type="text"
              className="rounded-xl border border-gray-300 bg-white px-4 py-2"
              placeholder="If Other, specify"
              value={employment.companyTypeOther || ""}
              onChange={(e) => handleChange("companyTypeOther", e.target.value)}
            />
          )}
        </div>

        {/* Department */}
        <div>
          <label className="block mb-2 font-medium">Department *</label>
          <input
            type="text"
            className={getFieldClasses("department")}
            placeholder="Department"
            value={employment.department || ""}
            onChange={(e) => handleChange("department", e.target.value)}
          />
        </div>

        {/* Designation */}
        <div>
          <label className="block mb-2 font-medium">Designation *</label>
          <input
            type="text"
            className={getFieldClasses("designation")}
            placeholder="Designation"
            value={employment.designation || ""}
            onChange={(e) => handleChange("designation", e.target.value)}
          />
        </div>

        {/* Grade / Level */}
        <div>
          <label className="block mb-2 font-medium">Grade / Level *</label>
          <input
            type="text"
            className={getFieldClasses("grade")}
            placeholder="Grade / Level"
            value={employment.grade || ""}
            onChange={(e) => handleChange("grade", e.target.value)}
          />
        </div>

        {/* Experience (Current) */}
        <div>
          <label className="block mb-2 font-medium">Experience (Current) (Years) *</label>
          <input
            type="number"
            className={getFieldClasses("currentExperience")}
            placeholder="Current Experience (Years)"
            value={employment.currentExperience || ""}
            onChange={(e) => handleChange("currentExperience", e.target.value)}
          />
        </div>

        {/* Previous Employer Name */}
        <div>
          <label className="block mb-2 font-medium">Previous Employer Name</label>
          <input
            type="text"
            className={getFieldClasses("previousEmployer")}
            placeholder="Previous Employer Name"
            value={employment.previousEmployer || ""}
            onChange={(e) => handleChange("previousEmployer", e.target.value)}
          />
        </div>

        {/* Experience (Previous) */}
        <div>
          <label className="block mb-2 font-medium">Experience (Previous) (Years)</label>
          <input
            type="number"
            className={getFieldClasses("previousExperience")}
            placeholder="Previous Experience (Years)"
            value={employment.previousExperience || ""}
            onChange={(e) => handleChange("previousExperience", e.target.value)}
          />
        </div>

        {/* Office Address fields */}
        <div>
          <label className="block mb-2 font-medium">Office Address: House / Apt. No. *</label>
          <input
            type="text"
            className={getFieldClasses("officeHouseNo")}
            placeholder="House / Apt. No."
            value={officeAddress.houseNo || ""}
            onChange={(e) => handleOfficeAddressChange("houseNo", e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Office Address: Street *</label>
          <input
            type="text"
            className={getFieldClasses("officeStreet")}
            placeholder="Street"
            value={officeAddress.street || ""}
            onChange={(e) => handleOfficeAddressChange("street", e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Tehsil / District / Area</label>
          <input
            type="text"
            className={getFieldClasses("tehsil")}
            placeholder="Tehsil / District / Area"
            value={officeAddress.tehsil || ""}
            onChange={(e) => handleOfficeAddressChange("tehsil", e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Nearest Landmark *</label>
          <input
            type="text"
            className={getFieldClasses("nearestLandmark")}
            placeholder="Nearest Landmark"
            value={officeAddress.nearestLandmark || ""}
            onChange={(e) => handleOfficeAddressChange("nearestLandmark", e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">City *</label>
          <input
            type="text"
            className={getFieldClasses("city")}
            placeholder="City"
            value={officeAddress.city || ""}
            onChange={(e) => handleOfficeAddressChange("city", e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Postal Code *</label>
          <input
            type="text"
            className={getFieldClasses("postalCode")}
            placeholder="Postal Code"
            value={officeAddress.postalCode || ""}
            onChange={(e) => handleOfficeAddressChange("postalCode", e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Fax</label>
          <input
            type="text"
            className={getFieldClasses("fax")}
            placeholder="Fax"
            value={officeAddress.fax || ""}
            onChange={(e) => handleOfficeAddressChange("fax", e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Telephone 1 *</label>
          <input
            type="text"
            className={getFieldClasses("telephone1")}
            placeholder="Telephone 1"
            value={officeAddress.telephone1 || ""}
            onChange={(e) => handleOfficeAddressChange("telephone1", e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Telephone 2</label>
          <input
            type="text"
            className={getFieldClasses("telephone2")}
            placeholder="Telephone 2"
            value={officeAddress.telephone2 || ""}
            onChange={(e) => handleOfficeAddressChange("telephone2", e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Extension</label>
          <input
            type="text"
            className={getFieldClasses("extension")}
            placeholder="Extension"
            value={officeAddress.extension || ""}
            onChange={(e) => handleOfficeAddressChange("extension", e.target.value)}
          />
        </div>
      </div>
    </section>
  );
};
