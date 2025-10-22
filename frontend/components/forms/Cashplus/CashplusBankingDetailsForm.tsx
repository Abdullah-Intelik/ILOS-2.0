"use client";
import React from "react";
import { useCustomer } from "@/contexts/CustomerContext";

export const CashplusBankingDetailsForm = () => {
  const { customerData, updateCustomerData } = useCustomer();

  // Defensive defaults (ensure bankingDetails is always an object)
  const bankingDetails = customerData?.bankingDetails || {};
  
  // Support both places for bank data for initial values
  const clientBanks = customerData?.clientBanks || customerData?.cifData?.clientBanks || {};

  // Helper to update banking details in global context
  const handleChange = (field: string, value: any) => {
    updateCustomerData({
      bankingDetails: {
        ...bankingDetails,
        [field]: value,
      },
    });
  };

  // Prefilled field highlighting
  const prefilledFields = new Set(
    Object.entries(bankingDetails)
      .filter(([k, v]) => !!v)
      .map(([k]) => k)
      .concat(
        clientBanks.bank_name === "UBL" ? ["isUblCustomer"] : [],
        clientBanks.actt_no ? ["ublAccountNumber"] : []
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
      <h3 className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-primary text-primary-foreground">6. Banking Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
        <div>
          <label className="block mb-2 font-medium">Are you a UBL Customer? *</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="isUblCustomer"
                value="Yes"
                checked={bankingDetails.isUblCustomer === "Yes" || clientBanks.bank_name === "UBL"}
                onChange={() => handleChange("isUblCustomer", "Yes")}
              />
              Yes
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="isUblCustomer"
                value="No"
                checked={bankingDetails.isUblCustomer === "No" || (clientBanks.bank_name && clientBanks.bank_name !== "UBL")}
                onChange={() => handleChange("isUblCustomer", "No")}
              />
              No
            </label>
          </div>
        </div>
        <div>
          <label className="block mb-2 font-medium">UBL Account Number</label>
          <input
            type="text"
            className={getFieldClasses("ublAccountNumber")}
            placeholder="UBL Account Number"
            value={bankingDetails.ublAccountNumber || clientBanks.actt_no || ""}
            onChange={(e) => handleChange("ublAccountNumber", e.target.value)}
          />
          <span className="block text-xs text-gray-500 mt-1">
            Non-disclosure of this information may result in rejection of application.
          </span>
        </div>
      </div>
    </section>
  );
};
