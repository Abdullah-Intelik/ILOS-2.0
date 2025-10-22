"use client";
import React, { useEffect, useState } from "react";
import { useCustomer } from "@/contexts/CustomerContext";

interface ReferenceProps {
  formData: any;
  handleReferenceChange: (index: number, field: string, value: string) => void;
}

export const ReferencesForm: React.FC<ReferenceProps> = ({ formData, handleReferenceChange }) => {
  const { customerData } = useCustomer();
  const [prefilledFields, setPrefilledFields] = useState<Set<string>>(new Set());

  useEffect(() => {
    const refs = customerData?.referenceContacts?.length
      ? customerData.referenceContacts
      : customerData?.cifData?.referenceContacts?.length
      ? customerData.cifData.referenceContacts
      : [];

    const updatedRefs = [...formData.references];
    const prefilled = new Set<string>();

    refs.forEach((ref: any, index: number) => {
      if (index >= 2) return;

      const update = (field: string, value: any) => {
        if (value) {
          updatedRefs[index] = {
            ...updatedRefs[index],
            [field]: value,
          };
          prefilled.add(`references[${index}].${field}`);
        }
      };

      update("name", ref.name);
      update("cnic", ref.cnic);
      update("relationship", ref.relationship);
      update("relationship_other", ref.relationshipOther);
      update("house_no", ref.address?.houseNo);
      update("street", ref.address?.street);
      update("area", ref.address?.tehsil);
      update("city", ref.address?.city);
      update("country", ref.address?.country);
      update("postal_code", ref.address?.postalCode);
      update("tel_residence", ref.telephoneRes);
      update("tel_office", ref.telephoneOffice);
      update("mobile_no", ref.mobile);
      update("email", ref.email);
    });

    setPrefilledFields(prefilled);
  }, [customerData]);

  const getFieldClasses = (index: number, field: string) => {
    const key = `references[${index}].${field}`;
    const base = "w-full rounded-xl border border-gray-300 px-4 py-2 shadow-sm transition";
    const yellow = "bg-yellow-50 border-yellow-300";
    const gray = "bg-gray-50";
    return `${base} ${prefilledFields.has(key) ? yellow : gray}`;
  };

  return (
    <section className="bg-white rounded-2xl shadow p-8 mb-10">
      <h2 className="text-2xl text-white font-semibold mb-4 rounded-lg p-4 bg-primary text-primary-foreground">10. References</h2>

      {prefilledFields.size > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          <strong>Note:</strong> Fields highlighted in yellow are pre-filled from existing data.
        </div>
      )}

      {[0, 1].map((index) => {
        const ref = formData.references[index] || {};
        return (
          <div key={index} className="border-b pb-8 mb-6">
            <h3 className="text-lg font-semibold mb-4">Reference {index + 1}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  className={getFieldClasses(index, "name")}
                  value={ref.name || ""}
                  onChange={(e) => handleReferenceChange(index, "name", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">CNIC</label>
                <input
                  type="text"
                  className={getFieldClasses(index, "cnic")}
                  value={ref.cnic || ""}
                  onChange={(e) => handleReferenceChange(index, "cnic", e.target.value)}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Relationship</label>
              <div className="flex flex-wrap gap-4">
                {["Friend", "Spouse", "Neighbour", "Colleague", "Relative", "Other"].map((opt) => (
                  <label key={opt} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`relationship-${index}`}
                      value={opt}
                      checked={ref.relationship === opt}
                      onChange={(e) => handleReferenceChange(index, "relationship", e.target.value)}
                      className="mr-1"
                    />
                    {opt}
                  </label>
                ))}
                <input
                  type="text"
                  placeholder="Other (Specify)"
                  value={ref.relationship_other || ""}
                  onChange={(e) => handleReferenceChange(index, "relationship_other", e.target.value)}
                  className="w-48 border rounded-xl px-3 py-2 bg-gray-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              {[
                ["house_no", "House / Flat No."],
                ["street", "Street"],
                ["area", "Tehsil / District / Area"],
                ["city", "City"],
                ["country", "Country"],
                ["postal_code", "Postal Code"],
                ["tel_residence", "Telephone Res."],
                ["tel_office", "Telephone Office"],
                ["mobile_no", "Mobile No."],
                ["email", "Email"],
              ].map(([field, label]) => (
                <div key={field}>
                  <label className="block text-sm font-medium mb-1">{label}</label>
                  <input
                    type="text"
                    className={getFieldClasses(index, field)}
                    value={ref[field] || ""}
                    onChange={(e) => handleReferenceChange(index, field, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
};
