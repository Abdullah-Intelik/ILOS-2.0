// components/forms/Platinum/PlatinumEmploymentDetailsForm.tsx
"use client";
import { useCustomer } from "@/contexts/CustomerContext";
import { PlatinumCustomerData } from "@/types/platinum-types";
import { useEffect, useRef, useState } from "react";

export const PlatinumEmploymentDetailsForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  const typedCustomerData = customerData as unknown as PlatinumCustomerData;
  const [formData, setFormData] = useState({
    // Current employment
    occupation: "",
    sector: "",
    companyName: "",
    department: "",
    employmentType: "", // maps to employmentStatus in the type
    businessNature: "",
    // Office address
    officeStreet: "",
    officeDistrict: "",
    officeLandmark: "",
    officeCity: "",
    officePostalCode: "",
    officePhone1: "",
    officePhone2: "",
    officeFax: "",
    // Previous employment
    prevCompanyName: "",
    prevDesignation: "",
    prevExperience: "",
    prevCompanyPhone: "",
    // Additional fields from schema
    gradeRank: "",
    designation: "",
    lengthOfService: "",
    ublEmployeeId: "",
    businessType: "",
  });

  // Use refs to prevent infinite update loops
  const isInitialized = useRef(false);
  const skipNextUpdate = useRef(false);
  const isFirstRender = useRef(true);

  // Initialize form with data from context (runs once)
  useEffect(() => {
    if (isInitialized.current) return;
    
    const employmentDetails = typedCustomerData?.employmentDetails || {};
    const previousEmployment = typedCustomerData?.previousEmployment || {};
    const officeAddress = employmentDetails?.officeAddress || {};
    
    setFormData(prev => ({
      ...prev,
      occupation: employmentDetails.occupation || prev.occupation,
      sector: (employmentDetails as any).sector || prev.sector,
      companyName: employmentDetails.companyName || prev.companyName,
      department: employmentDetails.department || prev.department,
      employmentType: employmentDetails.employmentStatus || prev.employmentType,
      businessNature: employmentDetails.businessNature || prev.businessNature,
      officeStreet: officeAddress.street || prev.officeStreet,
      officeDistrict: (officeAddress as any).district || prev.officeDistrict,
      officeLandmark: officeAddress.houseNo || prev.officeLandmark,
      officeCity: officeAddress.city || prev.officeCity,
      officePostalCode: (officeAddress as any).postalCode || prev.officePostalCode,
      officePhone1: officeAddress.telephone1 || prev.officePhone1,
      officePhone2: officeAddress.telephone2 || prev.officePhone2,
      officeFax: officeAddress.fax || employmentDetails.officeFax || prev.officeFax,
      prevCompanyName: previousEmployment.companyName || prev.prevCompanyName,
      prevDesignation: previousEmployment.designation || prev.prevDesignation,
      prevExperience: previousEmployment.experienceYears || prev.prevExperience,
      prevCompanyPhone: previousEmployment.telephone || prev.prevCompanyPhone,
      gradeRank: employmentDetails.grade || prev.gradeRank,
      designation: employmentDetails.designation || prev.designation,
      lengthOfService: employmentDetails.currentExperience || prev.lengthOfService,
      ublEmployeeId: employmentDetails.employeeNumber || prev.ublEmployeeId,
      businessType: employmentDetails.businessType || prev.businessType,
    }));
    
    isInitialized.current = true;
  }, [typedCustomerData]);

  // Save form data to context when user makes changes
  const saveToContext = () => {
    if (skipNextUpdate.current || !isInitialized.current) return;
    
    skipNextUpdate.current = true;
    
    // Combine office address fields into a single string for the backend
    const fullOfficeAddress = [
      formData.officeStreet, 
      formData.officeDistrict, 
      formData.officeLandmark,
      formData.officeCity, 
      formData.officePostalCode
    ].filter(Boolean).join(", ");

    // Combine office phone numbers for the backend
    const officePhones = [formData.officePhone1, formData.officePhone2]
      .filter(Boolean)
      .join(", ");
    
    updateCustomerData({
      employmentDetails: {
        ...(typedCustomerData?.employmentDetails || {}),
        occupation: formData.occupation,
        companyName: formData.companyName,
        department: formData.department,
        employmentStatus: formData.employmentType,
        businessNature: formData.businessNature,
        businessType: formData.businessType,
        grade: formData.gradeRank,
        designation: formData.designation,
        currentExperience: formData.lengthOfService,
        employeeNumber: formData.ublEmployeeId,
        // Store the office address details
        officeAddress: {
          ...(typedCustomerData?.employmentDetails?.officeAddress || {}),
          street: formData.officeStreet,
          district: formData.officeDistrict,
          houseNo: formData.officeLandmark,
          city: formData.officeCity,
          postalCode: formData.officePostalCode,
          telephone1: formData.officePhone1,
          telephone2: formData.officePhone2,
          fax: formData.officeFax,
          fullAddress: fullOfficeAddress
        },
        officeFax: formData.officeFax,
        officePhone: officePhones,
      },
      // Store previous employment details separately
      previousEmployment: {
        ...(typedCustomerData?.previousEmployment || {}),
        companyName: formData.prevCompanyName,
        designation: formData.prevDesignation,
        experienceYears: formData.prevExperience,
        telephone: formData.prevCompanyPhone,
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

  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-primary text-primary-foreground">3. Employment Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
        {/* Occupation */}
        <div>
          <label className="block text-sm font-medium mb-1">Occupation</label>
          <div className="flex flex-col gap-1">
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="occupation" 
                checked={formData.occupation === "Salaried"}
                onChange={() => handleInputChange("occupation", "Salaried")}
              /> Salaried
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="occupation" 
                checked={formData.occupation === "Self Employed"}
                onChange={() => handleInputChange("occupation", "Self Employed")}
              /> Self Employed
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="occupation" 
                checked={formData.occupation === "Self Employed Business"}
                onChange={() => handleInputChange("occupation", "Self Employed Business")}
              /> Self Employed Business
            </label>
          </div>
        </div>
        {/* Sector */}
        <div>
          <label className="block text-sm font-medium mb-1">Sector</label>
          <div className="flex flex-col gap-1">
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="sector" 
                checked={formData.sector === "Government"}
                onChange={() => handleInputChange("sector", "Government")}
              /> Government
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="sector" 
                checked={formData.sector === "Armed Forces"}
                onChange={() => handleInputChange("sector", "Armed Forces")}
              /> Armed Forces
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="sector" 
                checked={formData.sector === "Professional"}
                onChange={() => handleInputChange("sector", "Professional")}
              /> Professional
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="sector" 
                checked={formData.sector === "Private"}
                onChange={() => handleInputChange("sector", "Private")}
              /> Private
            </label>
          </div>
        </div>
        {/* Employer / Company Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Employer / Company Name</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2" 
            placeholder="Employer / Company Name" 
            value={formData.companyName}
            onChange={(e) => handleInputChange("companyName", e.target.value)}
          />
        </div>
        {/* Department */}
        <div>
          <label className="block text-sm font-medium mb-1">Department</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2" 
            placeholder="Department" 
            value={formData.department}
            onChange={(e) => handleInputChange("department", e.target.value)}
          />
        </div>
        {/* Employment Type */}
        <div>
          <label className="block text-sm font-medium mb-1">Employment Type</label>
          <div className="flex flex-col gap-1">
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="employmentType" 
                checked={formData.employmentType === "Permanent"}
                onChange={() => handleInputChange("employmentType", "Permanent")}
              /> Permanent
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="employmentType" 
                checked={formData.employmentType === "Contractual"}
                onChange={() => handleInputChange("employmentType", "Contractual")}
              /> Contractual
            </label>
          </div>
        </div>
        {/* Additional Fields */}
        <div>
          <label className="block text-sm font-medium mb-1">Grade/Rank (if applicable)</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2" 
            placeholder="Grade/Rank" 
            value={formData.gradeRank}
            onChange={(e) => handleInputChange("gradeRank", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Designation</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2" 
            placeholder="Designation" 
            value={formData.designation}
            onChange={(e) => handleInputChange("designation", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Length of Service (years)</label>
          <input 
            type="number" 
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2" 
            placeholder="Length of Service" 
            value={formData.lengthOfService}
            onChange={(e) => handleInputChange("lengthOfService", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Employee ID (if applicable)</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2" 
            placeholder="Employee ID" 
            value={formData.ublEmployeeId}
            onChange={(e) => handleInputChange("ublEmployeeId", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Business Type (if self-employed)</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2" 
            placeholder="Business Type" 
            value={formData.businessType}
            onChange={(e) => handleInputChange("businessType", e.target.value)}
          />
        </div>
        {/* Business Nature */}
        <div>
          <label className="block text-sm font-medium mb-1">Business Nature</label>
          <div className="flex flex-col gap-1">
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="businessNature" 
                checked={formData.businessNature === "Sole Proprietorship"}
                onChange={() => handleInputChange("businessNature", "Sole Proprietorship")}
              /> Sole Proprietorship
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="businessNature" 
                checked={formData.businessNature === "Partnership"}
                onChange={() => handleInputChange("businessNature", "Partnership")}
              /> Partnership
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="businessNature" 
                checked={formData.businessNature === "Public Ltd."}
                onChange={() => handleInputChange("businessNature", "Public Ltd.")}
              /> Public Ltd.
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="businessNature" 
                checked={formData.businessNature === "Private Ltd."}
                onChange={() => handleInputChange("businessNature", "Private Ltd.")}
              /> Private Ltd.
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="businessNature" 
                checked={formData.businessNature === "Agricultural"}
                onChange={() => handleInputChange("businessNature", "Agricultural")}
              /> Agricultural
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="businessNature" 
                checked={formData.businessNature === "Industrial"}
                onChange={() => handleInputChange("businessNature", "Industrial")}
              /> Industrial
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="businessNature" 
                checked={formData.businessNature === "Commercial"}
                onChange={() => handleInputChange("businessNature", "Commercial")}
              /> Commercial
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="businessNature" 
                checked={formData.businessNature === "Other"}
                onChange={() => handleInputChange("businessNature", "Other")}
              /> Other
            </label>
          </div>
        </div>
        {/* Office Address */}
        <div className="md:col-span-3">
          <label className="block text-sm font-medium mb-1">Office Address (If Self Employed)</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
            <input 
              type="text" 
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2" 
              placeholder="Street" 
              value={formData.officeStreet}
              onChange={(e) => handleInputChange("officeStreet", e.target.value)}
            />
            <input 
              type="text" 
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2" 
              placeholder="District" 
              value={formData.officeDistrict}
              onChange={(e) => handleInputChange("officeDistrict", e.target.value)}
            />
            <input 
              type="text" 
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2" 
              placeholder="Landmark" 
              value={formData.officeLandmark}
              onChange={(e) => handleInputChange("officeLandmark", e.target.value)}
            />
            <input 
              type="text" 
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2" 
              placeholder="City" 
              value={formData.officeCity}
              onChange={(e) => handleInputChange("officeCity", e.target.value)}
            />
            <input 
              type="text" 
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2" 
              placeholder="Postal Code" 
              value={formData.officePostalCode}
              onChange={(e) => handleInputChange("officePostalCode", e.target.value)}
            />
            <input 
              type="text" 
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2" 
              placeholder="Phone 1" 
              value={formData.officePhone1}
              onChange={(e) => handleInputChange("officePhone1", e.target.value)}
            />
            <input 
              type="text" 
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2" 
              placeholder="Phone 2" 
              value={formData.officePhone2}
              onChange={(e) => handleInputChange("officePhone2", e.target.value)}
            />
            <input 
              type="text" 
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2" 
              placeholder="Fax" 
              value={formData.officeFax}
              onChange={(e) => handleInputChange("officeFax", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Previous Employment Details */}
      <section className="mb-10">
        <h3 className="text-2xl rounded-lg font-semibold mb-4 p-4 bg-primary text-primary-foreground">4. Previous Employment Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
          <div>
            <label className="block text-sm font-medium mb-1">Previous Employer / Business</label>
            <input 
              type="text" 
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2" 
              placeholder="Previous Employer / Business" 
              value={formData.prevCompanyName}
              onChange={(e) => handleInputChange("prevCompanyName", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Designation at Previous Employer</label>
            <input 
              type="text" 
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2" 
              placeholder="Designation" 
              value={formData.prevDesignation}
              onChange={(e) => handleInputChange("prevDesignation", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Experience at Previous Employer (Years)</label>
            <input 
              type="number" 
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2" 
              placeholder="Experience (Years)" 
              value={formData.prevExperience}
              onChange={(e) => handleInputChange("prevExperience", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Telephone (Previous Employer)</label>
            <input 
              type="text" 
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2" 
              placeholder="Telephone" 
              value={formData.prevCompanyPhone}
              onChange={(e) => handleInputChange("prevCompanyPhone", e.target.value)}
            />
          </div>
        </div>
      </section>
    </section>
  );
};
