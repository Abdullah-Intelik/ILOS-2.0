"use client";
import { useCustomer } from "@/contexts/CustomerContext";

export const CreditCardSupplementaryCardForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  const supplementaryCard = customerData?.creditCard || {};

  const handleChange = (field: string, value: string | boolean) => {
    updateCustomerData({
      creditCard: {
        ...supplementaryCard,
        [field]: value
      }
    });
  };

  return (
    <section className="mb-10">
      <h3 className="text-xl font-semibold mb-4 bg-primary text-primary-foreground text-white p-4 rounded-lg">Supplementary Card</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border border-gray-200 rounded-xl p-6 bg-gray-50">
        {/* Title and Name */}
        <div>
          <label className="block mb-2">Title</label>
          <div className="flex gap-4">
            {["Mr", "Mrs", "Ms"].map((t) => (
              <label key={t} className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="title" 
                  value={t} 
                  checked={supplementaryCard.supplementaryCardholderTitle === t} 
                  onChange={() => handleChange("supplementaryCardholderTitle", t)} 
                />
                {t}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block mb-2">First Name</label>
          <input 
            className="w-full border rounded-xl px-4 py-2" 
            value={supplementaryCard.supplementaryCardholderFirstName || ""} 
            onChange={e => handleChange("supplementaryCardholderFirstName", e.target.value)} 
          />
        </div>
        <div>
          <label className="block mb-2">Middle Name</label>
          <input 
            className="w-full border rounded-xl px-4 py-2" 
            value={supplementaryCard.supplementaryCardholderMiddleName || ""} 
            onChange={e => handleChange("supplementaryCardholderMiddleName", e.target.value)} 
          />
        </div>
        <div>
          <label className="block mb-2">Last Name</label>
          <input 
            className="w-full border rounded-xl px-4 py-2" 
            value={supplementaryCard.supplementaryCardholderLastName || ""} 
            onChange={e => handleChange("supplementaryCardholderLastName", e.target.value)} 
          />
        </div>
        <div className="md:col-span-3">
          <label className="block mb-2">Father's / Husband's Name</label>
          <input 
            className="w-full border rounded-xl px-4 py-2" 
            value={supplementaryCard.supplementaryCardholderFatherHusbandName || ""} 
            onChange={e => handleChange("supplementaryCardholderFatherHusbandName", e.target.value)} 
          />
        </div>
        {/* Card Options */}
        <div className="md:col-span-3">
          <label className="block mb-2">Card Type</label>
          <div className="flex gap-4 flex-wrap">
            {["Non-Photo Card", "Photo Card", "Galleria"].map((type) => (
              <label key={type} className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="cardType"
                  checked={supplementaryCard.supplementaryCardType === type} 
                  onChange={() => handleChange("supplementaryCardType", type)} 
                />
                {type}
              </label>
            ))}
          </div>
        </div>
        <div className="md:col-span-3">
          <label className="block mb-2">Desired Credit Limit (%)</label>
          <div className="flex gap-4 flex-wrap">
            {["25", "50", "75", "100"].map((limit) => (
              <label key={limit} className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="creditLimit" 
                  value={limit} 
                  checked={supplementaryCard.supplementaryCardLimitType === limit} 
                  onChange={() => handleChange("supplementaryCardLimitType", limit)} 
                />
                {limit}%
              </label>
            ))}
            <input
              className="border rounded-xl px-2 py-1"
              placeholder="or Amount"
              value={supplementaryCard.supplementaryUsageFrequency || ""}
              onChange={e => handleChange("supplementaryUsageFrequency", e.target.value)}
            />
          </div>
        </div>
        <div className="md:col-span-3">
          <label className="block mb-2">Relationship to Principal Applicant</label>
          <div className="flex gap-4 flex-wrap">
            {["Spouse", "Parent", "Son/Daughter", "Brother/Sister", "Friend/Cousin"].map((rel) => (
              <label key={rel} className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="relationship" 
                  value={rel} 
                  checked={supplementaryCard.supplementaryRelationshipToPrincipal === rel} 
                  onChange={() => handleChange("supplementaryRelationshipToPrincipal", rel)} 
                />
                {rel}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block mb-2">Date of Birth</label>
          <input 
            type="date" 
            className="w-full border rounded-xl px-4 py-2" 
            value={supplementaryCard.supplementaryDob || ""} 
            onChange={e => handleChange("supplementaryDob", e.target.value)} 
          />
        </div>
        <div>
          <label className="block mb-2">Gender</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="gender" 
                value="M" 
                checked={supplementaryCard.supplementaryGender === "M"} 
                onChange={() => handleChange("supplementaryGender", "M")} 
              />
              M
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="gender" 
                value="F" 
                checked={supplementaryCard.supplementaryGender === "F"} 
                onChange={() => handleChange("supplementaryGender", "F")} 
              />
              F
            </label>
          </div>
        </div>
        <div>
          <label className="block mb-2">CNIC/Passport</label>
          <input 
            className="w-full border rounded-xl px-4 py-2" 
            value={supplementaryCard.supplementaryNicOrPassport || ""} 
            onChange={e => handleChange("supplementaryNicOrPassport", e.target.value)} 
          />
        </div>
        <div>
          <label className="block mb-2">Mother's Maiden Name</label>
          <input 
            className="w-full border rounded-xl px-4 py-2" 
            value={supplementaryCard.supplementaryMotherMaidenName || ""} 
            onChange={e => handleChange("supplementaryMotherMaidenName", e.target.value)} 
          />
        </div>
        <div className="md:col-span-3">
          <label className="block mb-2">Declaration</label>
          <textarea 
            className="w-full border rounded-xl px-4 py-2" 
            rows={3}
            placeholder="Enter declaration, if any"
            value={supplementaryCard.supplementaryDate || ""}
            onChange={e => handleChange("supplementaryDate", e.target.value)}
          />
        </div>
      </div>
    </section>
  );
};
