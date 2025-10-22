// components/forms/Platinum/PlatinumSupplementaryCardForm.tsx
"use client";
import { useCustomer } from "@/contexts/CustomerContext";
import { PlatinumCustomerData } from "@/types/platinum-types";
import { useEffect, useRef, useState } from "react";

export const PlatinumSupplementaryCardForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  const typedCustomerData = customerData as unknown as PlatinumCustomerData;
  const [formData, setFormData] = useState({
    title: "",
    firstName: "",
    middleName: "",
    lastName: "",
    nameOnCard: "",
    fatherHusbandName: "",
    creditLimitPercent: "",
    availability: "Full",
    relationshipToPrincipal: "",
    dob: "",
    gender: "Male",
    nicPassport: "",
    oldNicNumber: "",
    motherMaidenName: "",
    supplementarySignature: "",
    basicCardholderSignature: "",
    dateSigned: ""
  });

  // Use refs to prevent infinite update loops
  const isInitialized = useRef(false);
  const skipNextUpdate = useRef(false);
  const isFirstRender = useRef(true);

  // Initialize form with data from context (runs once)
  useEffect(() => {
    if (isInitialized.current) return;
    
    const supplementaryCard = typedCustomerData?.supplementaryCard || {};
    
    setFormData(prev => ({
      ...prev,
      title: supplementaryCard.title || prev.title,
      firstName: supplementaryCard.firstName || prev.firstName,
      middleName: supplementaryCard.middleName || prev.middleName,
      lastName: supplementaryCard.lastName || prev.lastName,
      nameOnCard: supplementaryCard.nameOnCard || prev.nameOnCard,
      fatherHusbandName: supplementaryCard.fatherHusbandName || prev.fatherHusbandName,
      creditLimitPercent: supplementaryCard.creditLimitPercent?.toString() || prev.creditLimitPercent,
      availability: supplementaryCard.availability || prev.availability,
      relationshipToPrincipal: supplementaryCard.relationshipToPrincipal || prev.relationshipToPrincipal,
      dob: supplementaryCard.dob || prev.dob,
      gender: supplementaryCard.gender || prev.gender,
      nicPassport: supplementaryCard.nicPassport || prev.nicPassport,
      oldNicNumber: supplementaryCard.oldNicNumber || prev.oldNicNumber,
      motherMaidenName: supplementaryCard.motherMaidenName || prev.motherMaidenName,
      supplementarySignature: supplementaryCard.supplementarySignature || prev.supplementarySignature,
      basicCardholderSignature: supplementaryCard.basicCardholderSignature || prev.basicCardholderSignature,
      dateSigned: supplementaryCard.dateSigned || prev.dateSigned
    }));
    
    isInitialized.current = true;
  }, []);

  // Save form data to context when user makes changes
  const saveToContext = () => {
    if (skipNextUpdate.current || !isInitialized.current) return;
    
    skipNextUpdate.current = true;
    
    // Calculate fullName
    const fullName = `${formData.firstName} ${formData.middleName} ${formData.lastName}`.replace(/\s+/g, ' ').trim();
    
    // Format data for backend schema compatibility
    const supplementaryCardData = {
      title: formData.title,
      first_name: formData.firstName,
      middle_name: formData.middleName,
      last_name: formData.lastName,
      fullName: fullName,
      name_on_card: formData.nameOnCard || fullName,
      father_husband_name: formData.fatherHusbandName,
      credit_limit_percent: formData.creditLimitPercent,
      availability: formData.availability,
      relationship_to_principal: formData.relationshipToPrincipal,
      dob: formData.dob,
      gender: formData.gender,
      nic_passport: formData.nicPassport,
      old_nic_number: formData.oldNicNumber,
      mother_maiden_name: formData.motherMaidenName,
      supplementary_signature: formData.supplementarySignature,
      basic_cardholder_signature: formData.basicCardholderSignature,
      date_signed: formData.dateSigned
    };
    
    // Store both the formatted backend data and our internal frontend data
    updateCustomerData({
      // Store values in correct format for the backend
      supplementaryCards: [supplementaryCardData],
      // Also store in our frontend format for the form
      supplementaryCard: {
        ...(typedCustomerData?.supplementaryCard || {}),
        title: formData.title,
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        fullName: fullName,
        nameOnCard: formData.nameOnCard || fullName,
        fatherHusbandName: formData.fatherHusbandName,
        creditLimitPercent: formData.creditLimitPercent,
        availability: formData.availability,
        relationshipToPrincipal: formData.relationshipToPrincipal,
        dob: formData.dob,
        gender: formData.gender,
        nicPassport: formData.nicPassport,
        oldNicNumber: formData.oldNicNumber,
        motherMaidenName: formData.motherMaidenName,
        supplementarySignature: formData.supplementarySignature,
        basicCardholderSignature: formData.basicCardholderSignature,
        dateSigned: formData.dateSigned
      }
    } as unknown as Partial<any>);
    
    // Reset the flag after a short delay
    setTimeout(() => {
      skipNextUpdate.current = false;
    }, 50);
  };

  // Handle initial render - don't update context on first render
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    saveToContext();
  }, [formData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const fileName = e.target.files[0].name;
      handleInputChange(field, fileName);
    }
  };

  const handleFullNameUpdate = () => {
    const fullName = `${formData.firstName} ${formData.middleName} ${formData.lastName}`.replace(/\s+/g, ' ').trim();
    if (!formData.nameOnCard) {
      handleInputChange("nameOnCard", fullName);
    }
  };

  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-primary text-primary-foreground">8. Supplementary Card</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <select
            className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
          >
            <option value="">Select Title</option>
            <option value="Mr">Mr</option>
            <option value="Mrs">Mrs</option>
            <option value="Ms">Ms</option>
            <option value="Dr">Dr</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">First Name</label>
          <input
            type="text"
            className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white"
            placeholder="First Name"
            value={formData.firstName}
            onChange={(e) => {
              handleInputChange("firstName", e.target.value);
              setTimeout(handleFullNameUpdate, 100);
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Middle Name</label>
          <input
            type="text"
            className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white"
            placeholder="Middle Name"
            value={formData.middleName}
            onChange={(e) => {
              handleInputChange("middleName", e.target.value);
              setTimeout(handleFullNameUpdate, 100);
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Last Name</label>
          <input
            type="text"
            className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={(e) => {
              handleInputChange("lastName", e.target.value);
              setTimeout(handleFullNameUpdate, 100);
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Name on Card (max 19 chars)</label>
          <input
            type="text"
            maxLength={19}
            className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white"
            placeholder="Name to appear on card"
            value={formData.nameOnCard}
            onChange={(e) => handleInputChange("nameOnCard", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Father's/Husband's Name</label>
          <input
            type="text"
            className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white"
            placeholder="Father's or Husband's Name"
            value={formData.fatherHusbandName}
            onChange={(e) => handleInputChange("fatherHusbandName", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Credit Limit (% of Primary Card)</label>
          <select
            className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white"
            value={formData.creditLimitPercent}
            onChange={(e) => handleInputChange("creditLimitPercent", e.target.value)}
          >
            <option value="">Select Credit Limit %</option>
            <option value="10">10%</option>
            <option value="25">25%</option>
            <option value="50">50%</option>
            <option value="75">75%</option>
            <option value="100">100%</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Availability</label>
          <select
            className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white"
            value={formData.availability}
            onChange={(e) => handleInputChange("availability", e.target.value)}
          >
            <option value="Full">Full</option>
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Relationship to Primary Cardholder</label>
          <select
            className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white"
            value={formData.relationshipToPrincipal}
            onChange={(e) => handleInputChange("relationshipToPrincipal", e.target.value)}
          >
            <option value="">Select Relationship</option>
            <option value="Spouse">Spouse</option>
            <option value="Child">Child</option>
            <option value="Parent">Parent</option>
            <option value="Sibling">Sibling</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Date of Birth</label>
          <input
            type="date"
            className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white"
            value={formData.dob}
            onChange={(e) => handleInputChange("dob", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Gender</label>
          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="supplementaryGender"
                checked={formData.gender === "Male"}
                onChange={() => handleInputChange("gender", "Male")}
              /> Male
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="supplementaryGender"
                checked={formData.gender === "Female"}
                onChange={() => handleInputChange("gender", "Female")}
              /> Female
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">CNIC/Passport</label>
          <input
            type="text"
            className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white"
            placeholder="CNIC or Passport Number"
            value={formData.nicPassport}
            onChange={(e) => handleInputChange("nicPassport", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Old NIC (if applicable)</label>
          <input
            type="text"
            className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white"
            placeholder="Old NIC Number"
            value={formData.oldNicNumber}
            onChange={(e) => handleInputChange("oldNicNumber", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mother's Maiden Name</label>
          <input
            type="text"
            className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white"
            placeholder="Mother's Maiden Name"
            value={formData.motherMaidenName}
            onChange={(e) => handleInputChange("motherMaidenName", e.target.value)}
          />
        </div>
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Supplementary Card Applicant's Signature</label>
            <input
              type="file"
              className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white"
              onChange={(e) => handleFileChange("supplementarySignature", e)}
            />
            {formData.supplementarySignature && (
              <p className="text-xs text-gray-500 mt-1">File: {formData.supplementarySignature}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Basic Cardholder's Signature</label>
            <input
              type="file"
              className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white"
              onChange={(e) => handleFileChange("basicCardholderSignature", e)}
            />
            {formData.basicCardholderSignature && (
              <p className="text-xs text-gray-500 mt-1">File: {formData.basicCardholderSignature}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white"
              value={formData.dateSigned}
              onChange={(e) => handleInputChange("dateSigned", e.target.value)}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
