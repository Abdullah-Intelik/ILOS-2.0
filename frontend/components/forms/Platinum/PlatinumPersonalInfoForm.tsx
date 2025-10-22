"use client";
import { useCustomer } from "@/contexts/CustomerContext";
import { useEffect, useRef, useState } from "react";
import { PlatinumCustomerData } from "@/types/platinum-types";

export const PlatinumPersonalInfoForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  const typedCustomerData = customerData as unknown as PlatinumCustomerData;
  const [formData, setFormData] = useState({
    title: "",
    firstName: "",
    middleName: "",
    lastName: "",
    fullName: "",
    dateOfBirth: "",
    gender: "Male",
    maritalStatus: "Single",
    cnic: "",
    oldNic: "",
    passportNumber: "",
    mobileNumber: "",
    email: "",
    nationality: "Pakistani",
    fatherName: "",
    motherName: "",
    education: "",
    numberOfDependents: "",
    ntn: ""
  });

  // Use refs to prevent infinite update loops
  const isInitialized = useRef(false);
  const skipNextUpdate = useRef(false);
  const isFirstRender = useRef(true);

  // Initialize form with data from context (runs once)
  useEffect(() => {
    if (isInitialized.current) return;
    
    const personalDetails = typedCustomerData?.personalDetails || {};
    const platinumCard = typedCustomerData?.platinumCard || {};
    
    setFormData(prev => ({
      ...prev,
      title: personalDetails.title || prev.title,
      firstName: personalDetails.firstName || prev.firstName,
      middleName: personalDetails.middleName || prev.middleName,
      lastName: personalDetails.lastName || prev.lastName,
      fullName: personalDetails.fullName || `${personalDetails.firstName || ""} ${personalDetails.lastName || ""}`.trim(),
      dateOfBirth: personalDetails.dateOfBirth || prev.dateOfBirth,
      gender: personalDetails.gender || prev.gender,
      maritalStatus: personalDetails.maritalStatus || prev.maritalStatus,
      cnic: personalDetails.cnic || typedCustomerData?.cnic || prev.cnic,
      oldNic: platinumCard?.oldNic || prev.oldNic,
      passportNumber: personalDetails.passportNumber || prev.passportNumber,
      mobileNumber: personalDetails.mobileNumber || prev.mobileNumber,
      email: personalDetails.email || prev.email,
      nationality: personalDetails.nationality || prev.nationality,
      fatherName: personalDetails.fatherName || prev.fatherName,
      motherName: personalDetails.motherName || prev.motherName,
      education: personalDetails.education || prev.education,
      numberOfDependents: personalDetails.numberOfDependents?.toString() || prev.numberOfDependents,
      ntn: personalDetails.ntn || prev.ntn
    }));
    
    isInitialized.current = true;
  }, []);

  // Save form data to context when user makes changes (not on every render)
  const saveToContext = () => {
    if (skipNextUpdate.current || !isInitialized.current) return;
    
    skipNextUpdate.current = true;
    
    updateCustomerData({
      customerId: typedCustomerData?.customerId || formData.cnic,
      personalDetails: {
        ...(typedCustomerData?.personalDetails || {}),
        title: formData.title,
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        fullName: formData.fullName || `${formData.firstName} ${formData.lastName}`.trim(),
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        maritalStatus: formData.maritalStatus,
        cnic: formData.cnic,
        passportNumber: formData.passportNumber,
        mobileNumber: formData.mobileNumber,
        email: formData.email,
        nationality: formData.nationality,
        fatherName: formData.fatherName,
        motherName: formData.motherName,
        education: formData.education,
        numberOfDependents: formData.numberOfDependents,
        ntn: formData.ntn
      },
      platinumCard: {
        ...(typedCustomerData?.platinumCard || {}),
        oldNic: formData.oldNic
      }
    } as unknown as Partial<any>);
    
    // Reset the flag after a short delay to allow for future user changes
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

  const handleFullNameUpdate = () => {
    const fullName = `${formData.firstName} ${formData.middleName} ${formData.lastName}`.replace(/\s+/g, ' ').trim();
    setFormData(prev => ({
      ...prev,
      fullName
    }));
  };

  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-primary text-primary-foreground">1. Personal Information</h3>
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
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={(e) => handleInputChange("fullName", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Date of Birth</label>
          <input
            type="date"
            className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white"
            value={formData.dateOfBirth}
            onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Gender</label>
          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="gender"
                checked={formData.gender === "Male"}
                onChange={() => handleInputChange("gender", "Male")}
              /> Male
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="gender"
                checked={formData.gender === "Female"}
                onChange={() => handleInputChange("gender", "Female")}
              /> Female
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Marital Status</label>
          <select
            className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white"
            value={formData.maritalStatus}
            onChange={(e) => handleInputChange("maritalStatus", e.target.value)}
          >
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Divorced">Divorced</option>
            <option value="Widowed">Widowed</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">CNIC</label>
          <input
            type="text"
            className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white"
            placeholder="XXXXX-XXXXXXX-X"
            value={formData.cnic}
            onChange={(e) => handleInputChange("cnic", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Old NIC (if applicable)</label>
          <input
            type="text"
            className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white"
            placeholder="Old NIC"
            value={formData.oldNic}
            onChange={(e) => handleInputChange("oldNic", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Passport Number (if applicable)</label>
          <input
            type="text"
            className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white"
            placeholder="Passport Number"
            value={formData.passportNumber}
            onChange={(e) => handleInputChange("passportNumber", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mobile Number</label>
          <input
            type="text"
            className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white"
            placeholder="03XX-XXXXXXX"
            value={formData.mobileNumber}
            onChange={(e) => handleInputChange("mobileNumber", e.target.value)}
          />
          {formData.mobileNumber && <p className="text-xs text-gray-500">Mobile agyua hai ==&gt;: {formData.mobileNumber}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white"
            placeholder="Email Address"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Nationality</label>
          <input
            type="text"
            className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white"
            placeholder="Nationality"
            value={formData.nationality}
            onChange={(e) => handleInputChange("nationality", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Father's Name</label>
          <input
            type="text"
            className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white"
            placeholder="Father's Name"
            value={formData.fatherName}
            onChange={(e) => handleInputChange("fatherName", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mother's Name</label>
          <input
            type="text"
            className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white"
            placeholder="Mother's Name"
            value={formData.motherName}
            onChange={(e) => handleInputChange("motherName", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Education</label>
          <select
            className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white"
            value={formData.education}
            onChange={(e) => handleInputChange("education", e.target.value)}
          >
            <option value="">Select Education</option>
            <option value="High School">High School</option>
            <option value="Bachelors">Bachelors</option>
            <option value="Masters">Masters</option>
            <option value="Doctorate">Doctorate</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Number of Dependents</label>
          <input
            type="number"
            className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white"
            placeholder="Number of Dependents"
            value={formData.numberOfDependents}
            onChange={(e) => handleInputChange("numberOfDependents", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">NTN (if applicable)</label>
          <input
            type="text"
            className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white"
            placeholder="NTN Number"
            value={formData.ntn}
            onChange={(e) => handleInputChange("ntn", e.target.value)}
          />
        </div>
      </div>
    </section>
  );
};
