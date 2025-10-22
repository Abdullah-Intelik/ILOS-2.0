"use client";
import React from "react";
import { useCustomer } from "@/contexts/CustomerContext";

export const CashplusApplicationTypeForm = () => {
  const { customerData, updateCustomerData } = useCustomer();

  // Defensive defaults (ensure applicationDetails is always an object)
  const applicationDetails = customerData?.applicationDetails || {};
  const clientBanks = customerData?.cifData?.clientBanks || {};

  // Helper to update application details in global context
  const handleChange = (field: string, value: any) => {
    updateCustomerData({
      applicationDetails: {
        ...applicationDetails,
        [field]: value,
        ...(field === "loanPurpose" && value !== "Other" ? { loanPurposeOther: "" } : {}),
      },
    });
  };

  // Helper for prefilled highlighting
  const prefilledFields = new Set(
    Object.entries(applicationDetails)
      .filter(([k, v]) => !!v)
      .map(([k]) => k)
      .concat(
        clientBanks.bank_name === "UBL" ? ["ublExistingCustomer"] : [],
        clientBanks.branch ? ["branch"] : [],
        clientBanks.actt_no ? ["account"] : []
      )
  );

  const getFieldClasses = (fieldName: string) => {
    const base = "w-full border rounded-xl px-4 py-2";
    const prefilled = "bg-yellow-50 border-yellow-300";
    const normal = "bg-white";
    return `${base} ${prefilledFields.has(fieldName) ? prefilled : normal}`;
  };

  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-primary text-primary-foreground">2. Application Type</h3>
      {prefilledFields.size > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          <b>Note:</b> Fields highlighted in yellow are pre-filled from your existing data. You can edit them if needed.
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
        {/* UBL Existing Customer */}
        <div>
          <label className="block mb-2">UBL Existing Customer</label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="ublExistingCustomer"
              value="Yes"
              checked={applicationDetails.ublExistingCustomer === "Yes" || clientBanks.bank_name === "UBL"}
              onChange={() => handleChange("ublExistingCustomer", "Yes")}
            />
            Yes
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="ublExistingCustomer"
              value="No"
              checked={applicationDetails.ublExistingCustomer === "No" || (clientBanks.bank_name && clientBanks.bank_name !== "UBL")}
              onChange={() => handleChange("ublExistingCustomer", "No")}
            />
            No
          </label>
        </div>
        {/* Branch */}
        <div>
          <label className="block mb-2">Branch</label>
          <input
            type="text"
            className={getFieldClasses("branch")}
            placeholder="Branch"
            value={applicationDetails.branch || clientBanks.branch || ""}
            onChange={(e) => handleChange("branch", e.target.value)}
          />
        </div>
        {/* Account */}
        <div>
          <label className="block mb-2">Account</label>
          <input
            type="text"
            className={getFieldClasses("account")}
            placeholder="Account"
            value={applicationDetails.account || clientBanks.actt_no || ""}
            onChange={(e) => handleChange("account", e.target.value)}
          />
        </div>
        {/* Purpose of Loan */}
        <div className="md:col-span-3">
          <label className="block mb-2">Purpose of Loan *</label>
          <div className="flex flex-wrap gap-3 mb-2">
            {["Education", "Travel", "Wedding", "Other"].map((purpose) => (
              <label key={purpose} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="loanPurpose"
                  value={purpose}
                  checked={applicationDetails.loanPurpose === purpose}
                  onChange={(e) => handleChange("loanPurpose", e.target.value)}
                />
                {purpose}
              </label>
            ))}
            {applicationDetails.loanPurpose === "Other" && (
              <input
                type="text"
                className="rounded-xl border bg-white px-4 py-2"
                placeholder="If Other, please specify"
                value={applicationDetails.loanPurposeOther || ""}
                onChange={(e) => handleChange("loanPurposeOther", e.target.value)}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
