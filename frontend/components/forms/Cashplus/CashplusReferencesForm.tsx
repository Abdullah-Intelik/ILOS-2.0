"use client";
import React from "react";
import { useCustomer } from "@/contexts/CustomerContext";

export const CashplusReferencesForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  
  // Defensive defaults (ensure references is always an array)
  const references = customerData?.references || [];
  
  // Initialize with two references if none exist
  React.useEffect(() => {
    if (references.length === 0) {
      updateCustomerData({
        references: [
          { id: 1 },
          { id: 2 },
        ]
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Helper to update a specific reference
  const handleReferenceChange = (index: number, field: string, value: any) => {
    const updatedReferences = [...references];
    updatedReferences[index] = {
      ...updatedReferences[index],
      [field]: value,
    };
    
    updateCustomerData({
      references: updatedReferences
    });
  };

  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-primary text-primary-foreground">7. References</h3>
      {[0, 1].map(refIndex => (
        <div key={refIndex} className="reference-section border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
          <h4 className="text-lg font-semibold mb-4">
            Reference {refIndex + 1} (Relative or Friend not living with you)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block mb-2 font-medium">Name (Reference)</label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-xl bg-white px-4 py-2" 
                placeholder="Name" 
                value={references[refIndex]?.name || ""}
                onChange={(e) => handleReferenceChange(refIndex, "name", e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">CNIC</label>
              <input 
                type="text" 
                maxLength={13} 
                className="w-full border border-gray-300 rounded-xl bg-white px-4 py-2" 
                placeholder="CNIC (13-digit)" 
                value={references[refIndex]?.cnic || ""}
                onChange={(e) => handleReferenceChange(refIndex, "cnic", e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">Relationship</label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-xl bg-white px-4 py-2" 
                placeholder="Relationship" 
                value={references[refIndex]?.relationship || ""}
                onChange={(e) => handleReferenceChange(refIndex, "relationship", e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">House No.</label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-xl bg-white px-4 py-2" 
                placeholder="House No." 
                value={references[refIndex]?.houseNo || ""}
                onChange={(e) => handleReferenceChange(refIndex, "houseNo", e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">Street</label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-xl bg-white px-4 py-2" 
                placeholder="Street" 
                value={references[refIndex]?.street || ""}
                onChange={(e) => handleReferenceChange(refIndex, "street", e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">Tehsil / District</label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-xl bg-white px-4 py-2" 
                placeholder="Tehsil / District" 
                value={references[refIndex]?.area || ""}
                onChange={(e) => handleReferenceChange(refIndex, "area", e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">City</label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-xl bg-white px-4 py-2" 
                placeholder="City" 
                value={references[refIndex]?.city || ""}
                onChange={(e) => handleReferenceChange(refIndex, "city", e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">Postal Code</label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-xl bg-white px-4 py-2" 
                placeholder="Postal Code" 
                value={references[refIndex]?.postalCode || ""}
                onChange={(e) => handleReferenceChange(refIndex, "postalCode", e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">Telephone (Residence)</label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-xl bg-white px-4 py-2" 
                placeholder="Telephone (Residence)" 
                value={references[refIndex]?.telephoneResidence || ""}
                onChange={(e) => handleReferenceChange(refIndex, "telephoneResidence", e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">Telephone (Office)</label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-xl bg-white px-4 py-2" 
                placeholder="Telephone (Office)" 
                value={references[refIndex]?.telephoneOffice || ""}
                onChange={(e) => handleReferenceChange(refIndex, "telephoneOffice", e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">Mobile</label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-xl bg-white px-4 py-2" 
                placeholder="Mobile" 
                value={references[refIndex]?.mobile || ""}
                onChange={(e) => handleReferenceChange(refIndex, "mobile", e.target.value)}
              />
            </div>
            {/* Only for Reference 2 */}
            {refIndex === 1 && (
              <>
                <div>
                  <label className="block mb-2 font-medium">Fax</label>
                  <input 
                    type="text" 
                    className="w-full border border-gray-300 rounded-xl bg-white px-4 py-2" 
                    placeholder="Fax" 
                    value={references[refIndex]?.fax || ""}
                    onChange={(e) => handleReferenceChange(refIndex, "fax", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block mb-2 font-medium">Email</label>
                  <input 
                    type="email" 
                    className="w-full border border-gray-300 rounded-xl bg-white px-4 py-2" 
                    placeholder="Email" 
                    value={references[refIndex]?.email || ""}
                    onChange={(e) => handleReferenceChange(refIndex, "email", e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      ))}
    </section>
  );
};
