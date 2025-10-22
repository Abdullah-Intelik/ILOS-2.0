"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useCustomer } from "@/contexts/CustomerContext";

const toInputDate = (date?: string) =>
  date ? new Date(date).toISOString().slice(0, 10) : "";

export const CreditCardApplicantInfoForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  const ind = customerData?.cifData?.individualInfo || {};
  const cnicData = customerData?.cifData?.customerIdType || {};
  const dir = customerData?.cifData?.dirDetails || {};
  const personalDetails = customerData?.personalDetails || {};
  const creditCard = customerData?.creditCard || {};

  const [formData, setFormData] = useState({
    title: creditCard?.title || "",
    fullName: personalDetails.fullName || "",
    nameOnCard: creditCard?.nameOnCard || "",
    cnic: personalDetails.cnic || customerData?.cnic || "",
    cnicIssue: creditCard?.cnicIssuanceDate || "",
    cnicExpiry: creditCard?.cnicExpiryDate || "",
    oldNic: creditCard?.oldNic || "",
    fatherHusband: personalDetails.fatherName || "",
    dob: personalDetails.dateOfBirth || "",
    gender: personalDetails.gender || "",
    motherMaiden: personalDetails.motherName || "",
    marital: personalDetails.maritalStatus || "",
    dependents: personalDetails.numberOfDependents || "",
    education: personalDetails.education || "",
  });

  const [prefilledFields, setPrefilledFields] = useState<Set<string>>(new Set());

  // Memoize CIF-derived data to avoid re-running on unrelated customerData changes
  const cifDeps = useMemo(() => ({ ind, cnicData, dir, cif: customerData?.cifData, cnic: customerData?.cnic }), [ind, cnicData, dir, customerData?.cifData, customerData?.cnic]);

  useEffect(() => {
    const prefilled = new Set<string>();
    const newFormData = { ...formData };
    // Only prefill empty fields so user edits are never overwritten
    if (!newFormData.title && ind?.title) { newFormData.title = ind.title; prefilled.add("title"); }
    if (!newFormData.fullName && customerData?.cifData?.fullname) { newFormData.fullName = customerData.cifData.fullname; prefilled.add("fullName"); }
    if (!newFormData.nameOnCard && customerData?.cifData?.shortName) { newFormData.nameOnCard = customerData.cifData.shortName; prefilled.add("nameOnCard"); }
    if (!newFormData.cnic && customerData?.cnic) { newFormData.cnic = customerData.cnic; prefilled.add("cnic"); }
    if (!newFormData.cnicExpiry && cnicData?.expiry_date) { newFormData.cnicExpiry = toInputDate(cnicData.expiry_date); prefilled.add("cnicExpiry"); }
    if (!newFormData.dob && ind?.date_of_birth) { newFormData.dob = toInputDate(ind.date_of_birth); prefilled.add("dob"); }
    if (!newFormData.fatherHusband && dir?.father_name) { newFormData.fatherHusband = dir.father_name; prefilled.add("fatherHusband"); }
    if (!newFormData.motherMaiden && ind?.maiden_name) { newFormData.motherMaiden = ind.maiden_name; prefilled.add("motherMaiden"); }
    if (!newFormData.gender && ind?.sex) { newFormData.gender = ind.sex === "M" ? "Male" : ind.sex === "F" ? "Female" : ""; prefilled.add("gender"); }
    if (!newFormData.marital && ind?.maritial_status) {
      const m = ind.maritial_status;
      newFormData.marital = m === "M" ? "Married" : m === "S" ? "Single" : m === "D" ? "Divorced" : m === "W" ? "Widowed" : "";
      if (newFormData.marital) prefilled.add("marital");
    }
    setFormData(newFormData);
    setPrefilledFields(prev => new Set([...prev, ...prefilled]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cifDeps]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Update CustomerContext based on field
    switch (field) {
      case 'title':
        updateCustomerData({
          creditCard: { 
            ...creditCard,
            title: value 
          },
          personalDetails: { ...personalDetails, title: value }
        });
        break;
      case 'fullName':
        updateCustomerData({
          personalDetails: { ...personalDetails, fullName: value }
        });
        break;
      case 'nameOnCard':
        updateCustomerData({
          creditCard: { ...creditCard, nameOnCard: value }
        });
        break;
      case 'cnic':
        updateCustomerData({
          personalDetails: { ...personalDetails, cnic: value }
        });
        break;
      case 'cnicIssue':
        updateCustomerData({
          creditCard: { ...creditCard, cnicIssuanceDate: value }
        });
        break;
      case 'cnicExpiry':
        updateCustomerData({
          creditCard: { ...creditCard, cnicExpiryDate: value }
        });
        break;
      case 'oldNic':
        updateCustomerData({
          creditCard: { ...creditCard, oldNic: value }
        });
        break;
      case 'fatherHusband':
        updateCustomerData({
          personalDetails: { ...personalDetails, fatherName: value }
        });
        break;
      case 'dob':
        updateCustomerData({
          personalDetails: { ...personalDetails, dateOfBirth: value }
        });
        break;
      case 'gender':
        updateCustomerData({
          personalDetails: { ...personalDetails, gender: value }
        });
        break;
      case 'motherMaiden':
        updateCustomerData({
          personalDetails: { ...personalDetails, motherName: value }
        });
        break;
      case 'marital':
        updateCustomerData({
          personalDetails: { ...personalDetails, maritalStatus: value }
        });
        break;
      case 'dependents':
        updateCustomerData({
          personalDetails: { ...personalDetails, numberOfDependents: value }
        });
        break;
      case 'education':
        updateCustomerData({
          personalDetails: { ...personalDetails, education: value }
        });
        break;
    }
  };

  const getFieldClasses = (field: string) => {
    const base = "w-full rounded-xl border border-gray-300 px-4 py-2";
    const prefilled = "bg-yellow-50 border-yellow-300";
    const normal = "bg-white";
    return `${base} ${prefilledFields.has(field) ? prefilled : normal}`;
  };

  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-primary text-primary-foreground">3. Personal Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <div className="flex gap-4 mt-2">
            {["Mr", "Mrs", "Ms"].map(opt => (
              <label key={opt} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="title"
                  checked={formData.title === opt}
                  onChange={() => handleInputChange("title", opt)}
                  className={prefilledFields.has("title") ? "bg-yellow-50 border-yellow-300" : ""}
                />{opt}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            className={getFieldClasses("fullName")}
            placeholder="Full Name"
            value={formData.fullName}
            onChange={e => handleInputChange("fullName", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Name on Card</label>
          <input
            type="text"
            className={getFieldClasses("nameOnCard")}
            placeholder="Name on Card"
            value={formData.nameOnCard}
            onChange={e => handleInputChange("nameOnCard", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Computerized NIC / Passport No.</label>
          <input
            type="text"
            className={getFieldClasses("cnic")}
            placeholder="CNIC or Passport"
            value={formData.cnic}
            onChange={e => handleInputChange("cnic", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">CNIC Issuance Date</label>
          <input
            type="date"
            className={getFieldClasses("cnicIssue")}
            value={formData.cnicIssue}
            onChange={e => handleInputChange("cnicIssue", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">CNIC Expiry Date</label>
          <input
            type="date"
            className={getFieldClasses("cnicExpiry")}
            value={formData.cnicExpiry}
            onChange={e => handleInputChange("cnicExpiry", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Old NIC Number</label>
          <input
            type="text"
            className={getFieldClasses("oldNic")}
            placeholder="Old NIC Number"
            value={formData.oldNic}
            onChange={e => handleInputChange("oldNic", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Father's / Husband's Name</label>
          <input
            type="text"
            className={getFieldClasses("fatherHusband")}
            placeholder="Father's / Husband's Name"
            value={formData.fatherHusband}
            onChange={e => handleInputChange("fatherHusband", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Date of Birth</label>
          <input
            type="date"
            className={getFieldClasses("dob")}
            value={formData.dob}
            onChange={e => handleInputChange("dob", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Gender</label>
          <div className="flex gap-4 mt-2">
            {["Male", "Female"].map(opt => (
              <label key={opt} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="gender"
                  checked={formData.gender === opt}
                  onChange={() => handleInputChange("gender", opt)}
                  className={prefilledFields.has("gender") ? "bg-yellow-50 border-yellow-300" : ""}
                />{opt}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mother's Maiden Name</label>
          <input
            type="text"
            className={getFieldClasses("motherMaiden")}
            placeholder="Mother's Maiden Name"
            value={formData.motherMaiden}
            onChange={e => handleInputChange("motherMaiden", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Marital Status</label>
          <div className="flex flex-wrap gap-2">
            {["Single", "Married", "Divorced", "Widowed"].map(opt => (
              <label key={opt} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="maritalStatus"
                  checked={formData.marital === opt}
                  onChange={() => handleInputChange("marital", opt)}
                  className={prefilledFields.has("marital") ? "bg-yellow-50 border-yellow-300" : ""}
                />{opt}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">No. of Dependents</label>
          <input
            type="number"
            className={getFieldClasses("dependents")}
            placeholder="No. of Dependents"
            value={formData.dependents}
            onChange={e => handleInputChange("dependents", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Educational Qualification</label>
          <div className="flex flex-wrap gap-2">
            {["Matric/O Levels", "Inter/A Levels", "Bachelors", "Masters"].map(opt => (
              <label key={opt} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="education"
                  checked={formData.education === opt}
                  onChange={() => handleInputChange("education", opt)}
                  className={prefilledFields.has("education") ? "bg-yellow-50 border-yellow-300" : ""}
                />{opt}
              </label>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
