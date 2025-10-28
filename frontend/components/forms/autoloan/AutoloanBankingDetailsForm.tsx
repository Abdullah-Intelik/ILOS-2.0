"use client";
import React from "react";
import { useCustomer } from "@/contexts/CustomerContext";

interface Props {
  formData: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

export const BankingDetailsForm: React.FC<Props> = ({
  formData,
  handleInputChange,
  setFormData,
}) => {
  const { customerData } = useCustomer();
  const clientBanks =
    customerData?.clientBanks || customerData?.cifData?.clientBanks || {};

  // ------- Helpers for "Other Bank Account" (child table) -------
  const getOther = () => (formData.other_bank_accounts?.[0] ?? {});
  const updateOther = (field: string, value: string) => {
    const arr = [...(formData.other_bank_accounts ?? [{}])];
    arr[0] = { ...(arr[0] ?? {}), [field]: value };
    setFormData((prev: any) => ({ ...prev, other_bank_accounts: arr }));
  };

  const other = getOther();
  const otherIsForeign = (other.currency_type ?? "").toLowerCase() !== "local" && !!other.currency_type;

  return (
    <section className="bg-white rounded-2xl shadow p-8 mb-10">
      <h2 className="text-2xl text-white font-semibold mb-4 rounded-lg p-4 bg-primary text-primary-foreground">
        8. Banking Details - Direct Debit / Repayment Account
      </h2>

      {/* ========= Repayment (existing) ========= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bank Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Bank Name</label>
          <input
            type="text"
            name="repayment_bank_name"
            value={formData.repayment_bank_name || clientBanks.bank_name || ""}
            onChange={handleInputChange}
            placeholder="Bank Name"
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2"
          />
        </div>

        {/* Branch */}
        <div>
          <label className="block text-sm font-medium mb-1">Branch</label>
          <input
            type="text"
            name="repayment_branch"
            value={formData.repayment_branch || clientBanks.branch || ""}
            onChange={handleInputChange}
            placeholder="Branch"
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2"
          />
        </div>

        {/* Account No */}
        <div>
          <label className="block text-sm font-medium mb-1">Account No.</label>
          <input
            type="text"
            name="repayment_account_no"
            value={formData.repayment_account_no || clientBanks.actt_no || ""}
            onChange={handleInputChange}
            placeholder="Account No."
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2"
          />
        </div>

        {/* Account Type (Radio) */}
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Account Type</label>
          <div className="flex gap-4">
            {["PLS", "Current", "Fixed Deposit"].map((type) => (
              <label key={type} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="repayment_account_type"
                  value={type}
                  checked={formData.repayment_account_type === type}
                  onChange={handleInputChange}
                />
                {type}
              </label>
            ))}
          </div>
        </div>

        {/* Currency Type (Radio) */}
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Currency Type</label>
          <div className="flex flex-col gap-2">
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="repayment_currency_type"
                  value="Local"
                  checked={formData.repayment_currency_type === "Local"}
                  onChange={handleInputChange}
                />
                Local
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="repayment_currency_type"
                  value="Foreign"
                  checked={formData.repayment_currency_type === "Foreign"}
                  onChange={handleInputChange}
                />
                Foreign (please specify)
              </label>
            </div>
            {formData.repayment_currency_type === "Foreign" && (
              <input
                type="text"
                name="repayment_currency_type_detail"
                placeholder="e.g., PKR, USD"
                className="w-full md:w-72 rounded-xl border border-gray-300 bg-gray-50 px-4 py-2"
                onChange={(e) =>
                  // If you want to persist the detail, either:
                  // 1) store in a separate field for review, or
                  // 2) directly override repayment_currency_type with the typed value.
                  // Below we keep the detail in a sibling field; map it in payload if needed.
                  setFormData((prev: any) => ({
                    ...prev,
                    repayment_currency_type_detail: e.target.value,
                  }))
                }
                value={formData.repayment_currency_type_detail || ""}
              />
            )}
          </div>
        </div>
      </div>

      {/* ========= NEW: Other Bank Account (optional) ========= */}
      <h3 className="mt-10 text-lg font-semibold">Other Bank Account (optional)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        {/* Bank Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Bank Name</label>
          <input
            type="text"
            placeholder="Bank Name"
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2"
            value={other.bank_name || ""}
            onChange={(e) => updateOther("bank_name", e.target.value)}
          />
        </div>

        {/* Branch */}
        <div>
          <label className="block text-sm font-medium mb-1">Branch</label>
          <input
            type="text"
            placeholder="Branch"
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2"
            value={other.branch || ""}
            onChange={(e) => updateOther("branch", e.target.value)}
          />
        </div>

        {/* Account No. */}
        <div>
          <label className="block text-sm font-medium mb-1">Account No.</label>
          <input
            type="text"
            placeholder="Account No."
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2"
            value={other.account_no || ""}
            onChange={(e) => updateOther("account_no", e.target.value)}
          />
        </div>

        {/* Account Type (Radio) */}
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Account Type</label>
          <div className="flex gap-4">
            {["PLS", "Current", "Fixed Deposit"].map((type) => (
              <label key={type} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="other_account_type"
                  value={type}
                  checked={other.account_type === type}
                  onChange={(e) => updateOther("account_type", e.target.value)}
                />
                {type}
              </label>
            ))}
          </div>
        </div>

        {/* Currency Type (Radio + specify if Foreign) */}
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Currency Type</label>
          <div className="flex flex-col gap-2">
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="other_currency_type"
                  value="Local"
                  checked={(other.currency_type ?? "") === "Local"}
                  onChange={() => updateOther("currency_type", "Local")}
                />
                Local
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="other_currency_type"
                  value="Foreign"
                  checked={otherIsForeign || (other.currency_type ?? "") === "Foreign"}
                  onChange={() => updateOther("currency_type", "") /* prepare for specify */}
                />
                Foreign (please specify)
              </label>
            </div>

            {/* If foreign is selected, let them specify and store directly in currency_type */}
            {((other.currency_type ?? "") === "" || otherIsForeign) && (
              <input
                type="text"
                placeholder="e.g., PKR, USD"
                className="w-full md:w-72 rounded-xl border border-gray-300 bg-gray-50 px-4 py-2"
                value={other.currency_type && other.currency_type !== "Local" ? other.currency_type : ""}
                onChange={(e) => updateOther("currency_type", e.target.value)}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
