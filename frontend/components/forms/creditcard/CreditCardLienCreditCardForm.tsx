"use client";
import { useCustomer } from "@/contexts/CustomerContext";

export const CreditCardLienCreditCardForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  const creditCardData = customerData?.creditCard || {};

  const handleChange = (field: string, value: string) => {
    updateCustomerData({
      creditCard: {
        ...creditCardData,
        [field]: value
      }
    });
  };

  return (
    <section className="mb-10">
      <h3 className="text-xl font-semibold mb-4 bg-primary text-primary-foreground text-white p-4 rounded-lg">For Lien Marked Credit Cards</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 bg-gray-50">
        <div>
          <label className="block mb-2">Collateral Type</label>
          <input
            className="w-full border rounded-xl px-4 py-2"
            placeholder="Enter Collateral Type"
            value={creditCardData.collateralType || ""}
            onChange={e => handleChange("collateralType", e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2">In case of liquid security</label>
          <input
            className="w-full border rounded-xl px-4 py-2"
            placeholder="Enter details"
            value={creditCardData.liquidSecurity || ""}
            onChange={e => handleChange("liquidSecurity", e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block mb-2">In case of deposit</label>
          <input
            className="w-full border rounded-xl px-4 py-2"
            placeholder="Enter details"
            value={creditCardData.deposit || ""}
            onChange={e => handleChange("deposit", e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2">Bank</label>
          <input
            className="w-full border rounded-xl px-4 py-2"
            placeholder="Bank"
            value={creditCardData.collateralBank || ""}
            onChange={e => handleChange("collateralBank", e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2">Branch</label>
          <input
            className="w-full border rounded-xl px-4 py-2"
            placeholder="Branch"
            value={creditCardData.collateralBranch || ""}
            onChange={e => handleChange("collateralBranch", e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2">A/C No.</label>
          <input
            className="w-full border rounded-xl px-4 py-2"
            placeholder="A/C No."
            value={creditCardData.collateralAccountNo || ""}
            onChange={e => handleChange("collateralAccountNo", e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2">Type of A/C</label>
          <input
            className="w-full border rounded-xl px-4 py-2"
            placeholder="Type of A/C"
            value={creditCardData.collateralAccountType || ""}
            onChange={e => handleChange("collateralAccountType", e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2">Currency</label>
          <input
            className="w-full border rounded-xl px-4 py-2"
            placeholder="Currency"
            value={creditCardData.collateralCurrency || ""}
            onChange={e => handleChange("collateralCurrency", e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2">Lien Amount</label>
          <input
            className="w-full border rounded-xl px-4 py-2"
            placeholder="Lien Amount"
            value={creditCardData.collateralLienAmount || ""}
            onChange={e => handleChange("collateralLienAmount", e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block mb-2">Title of A/C</label>
          <input
            className="w-full border rounded-xl px-4 py-2"
            placeholder="Title of A/C"
            value={creditCardData.collateralTitle || ""}
            onChange={e => handleChange("collateralTitle", e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block mb-2">Maturity date (if applicable)</label>
          <input
            className="w-full border rounded-xl px-4 py-2"
            type="date"
            value={creditCardData.collateralMaturityDate || ""}
            onChange={e => handleChange("collateralMaturityDate", e.target.value)}
          />
        </div>
      </div>
    </section>
  );
};
