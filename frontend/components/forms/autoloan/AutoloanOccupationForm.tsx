"use client";

import React, { useState, useEffect } from 'react';
import { useCustomer } from "@/contexts/CustomerContext";

interface OccupationFormProps {
  formData: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const OccupationForm = ({ formData, handleInputChange }: OccupationFormProps) => {
  const { customerData } = useCustomer();

  const dirDetails = customerData?.cifData?.dirDetails || {};
  const individualInfo = customerData?.cifData?.individualInfo || {};
  const business = customerData?.cifData?.business || "";
  const industry = customerData?.cifData?.industry || "";
  // Prefer employer/company name, never use a person's name field
  const employerFromCIF = individualInfo?.employer_name || customerData?.cifData?.company_employer_name || "";
  const companyFromDir = (dirDetails as any)?.company_name || "";
  const companyName = employerFromCIF || companyFromDir;
  const sharePct = dirDetails.share_pct || "";
  const occupationCode = individualInfo.occupation_code || "";
  const natureOfBusiness = industry || business;
  const profession = occupationCode;
  const city = customerData?.cifData?.city || "";
  const district = customerData?.cifData?.district || "";
  const country = customerData?.cifData?.domicileCountry || "PK";

  const [prefilledFields, setPrefilledFields] = useState<Set<string>>(new Set());

  useEffect(() => {
    const eventMock = (name: string, value: string) => ({ target: { name, value } }) as React.ChangeEvent<HTMLInputElement>;

    const prefilled = new Set<string>();

    if (companyName) { handleInputChange(eventMock("companyName", companyName)); prefilled.add("companyName"); }
    if (sharePct) { handleInputChange(eventMock("sharePct", sharePct)); prefilled.add("sharePct"); }
    if (profession) { handleInputChange(eventMock("profession", profession)); prefilled.add("profession"); }
    if (natureOfBusiness) { handleInputChange(eventMock("natureOfBusiness", natureOfBusiness)); prefilled.add("natureOfBusiness"); }
    if (city) { handleInputChange(eventMock("employerCity", city)); prefilled.add("employerCity"); }
    if (district) { handleInputChange(eventMock("tehsil", district)); prefilled.add("tehsil"); }
    if (country) { handleInputChange(eventMock("employerCountry", country)); prefilled.add("employerCountry"); }

    setPrefilledFields(prefilled);
  }, [customerData]);

  const getFieldClasses = (fieldName: string) => {
    const base = "w-full rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 px-4 py-2 text-base shadow-sm transition placeholder:text-gray-400";
    const prefilled = "bg-yellow-50 border-yellow-300";
    const normal = "bg-gray-50";
    return `${base} ${prefilledFields.has(fieldName) ? prefilled : normal}`;
  };

  return (
    <section className="bg-white rounded-2xl shadow p-8 mb-10">
      <h2 className="text-2xl text-white font-semibold mb-4 rounded-lg p-4 bg-primary text-primary-foreground">6. Occupation</h2>

      {prefilledFields.size > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          <b>Note:</b> Fields highlighted in yellow are pre-filled from your existing data. You can edit them if needed.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col md:col-span-2">
          <label className="font-semibold text-sm mb-2">Employment Type</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="employmentType" checked={formData.employmentType === "Salaried"} onChange={() => handleInputChange({ target: { name: "employmentType", value: "Salaried" } } as any)} /> Salaried
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="employmentType" checked={formData.employmentType === "Self-Employed"} onChange={() => handleInputChange({ target: { name: "employmentType", value: "Self-Employed" } } as any)} /> Self-Employed
            </label>
          </div>
        </div>

        {[
          "companyName",
          "profession",
          "natureOfBusiness",
          "yearsInBusiness",
          "sharePct",
          "designation",
          "department",
          "gradeLevel",
          "employerAddress",
          "street",
          "tehsil",
          "employerCity",
          "employerCountry",
          "postalCode",
          "employerPhone",
          "nearestLandmark",
          "prevEmployerName",
          "prevDesignation",
          "prevExperience",
          "prevPhone"
        ].map((field, idx) => (
          <div key={field} className={idx === 0 ? "col-span-2" : undefined}>
            <label className="block text-sm font-medium mb-1 capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
            <input
              type={field.toLowerCase().includes("experience") || field.toLowerCase().includes("pct") ? "number" : "text"}
              name={field}
              placeholder={field.replace(/([A-Z])/g, ' $1')}
              className={getFieldClasses(field)}
              value={formData[field] || ""}
              onChange={handleInputChange}
            />
          </div>
        ))}
      </div>
    </section>
  );
};
