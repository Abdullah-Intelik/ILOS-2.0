"use client";
import React, { useEffect, useState, useRef } from "react";
import { useCustomer } from "@/contexts/CustomerContext";

// Utility to parse YYYY-MM-DD from ISO or fallback
const toInputDate = (date?: string) =>
  date ? new Date(date).toISOString().slice(0, 10) : "";

export const ApplicantPersonalDetailForm = () => {
  const { customerData, updateCustomerData } = useCustomer();

  // Grab all sources for personal details
  const individualInfo = customerData?.cifData.individualInfo || customerData?.cifData?.individualInfo || {};
  const dirDetails = customerData?.cifData.dirDetails || customerData?.cifData?.dirDetails || {};
  const customerIdType = customerData?.cifData.customerIdType || customerData?.cifData?.customerIdType || {};
  const postal = customerData?.cifData.postal || customerData?.cifData?.postal || {};
  const phone = customerData?.cifData.phone || customerData?.cifData?.phone || {};
  const email = customerData?.cifData.email || customerData?.cifData?.email || {};

  // Use refs to prevent infinite update loops
  const isInitialized = useRef(false);
  const skipNextUpdate = useRef(false);
  const isFirstRender = useRef(true);

  const [formData, setFormData] = useState({
    applicantName: "",
    cnic: "",
    cnicIssuanceDate: "",
    cnicExpiryDate: "",
    dob: "",
    fatherHusbandName: "",
    motherMaidenName: "",
    gender: "",
    maritalStatus: "",
    residenceLandline: "",
    cellNo: "",
    residenceTenure: "",
    residenceType: "",
    numDependents: "",
    education: "",
    currentAddress: "",
    permanentAddress: "",
  });

  const [prefilledFields, setPrefilledFields] = useState<Set<string>>(new Set());

  // Initialize form with data from context (runs once)
  useEffect(() => {
    if (isInitialized.current) return;
    
    const prefilled = new Set<string>();
    const newFormData = { ...formData };

    // Check for existing commercial vehicle data first
    const commercialVehicle = customerData?.commercialVehicle || {};
    
    // Load from commercial vehicle data if available
    if (commercialVehicle.applicant_name) { newFormData.applicantName = commercialVehicle.applicant_name; }
    if (commercialVehicle.applicant_cnic) { newFormData.cnic = commercialVehicle.applicant_cnic; }
    if (commercialVehicle.cnic_issuance_date) { newFormData.cnicIssuanceDate = toInputDate(commercialVehicle.cnic_issuance_date); }
    if (commercialVehicle.cnic_expiry_date) { newFormData.cnicExpiryDate = toInputDate(commercialVehicle.cnic_expiry_date); }
    if (commercialVehicle.date_of_birth) { newFormData.dob = toInputDate(commercialVehicle.date_of_birth); }
    if (commercialVehicle.father_husband_name) { newFormData.fatherHusbandName = commercialVehicle.father_husband_name; }
    if (commercialVehicle.mother_maiden_name) { newFormData.motherMaidenName = commercialVehicle.mother_maiden_name; }
    if (commercialVehicle.gender) { newFormData.gender = commercialVehicle.gender; }
    if (commercialVehicle.marital_status) { newFormData.maritalStatus = commercialVehicle.marital_status; }
    if (commercialVehicle.residence_landline_no) { newFormData.residenceLandline = commercialVehicle.residence_landline_no; }
    if (commercialVehicle.cell_no) { newFormData.cellNo = commercialVehicle.cell_no; }
    if (commercialVehicle.residence_tenure_months) { newFormData.residenceTenure = String(commercialVehicle.residence_tenure_months); }
    if (commercialVehicle.residence_type) { newFormData.residenceType = commercialVehicle.residence_type; }
    if (commercialVehicle.num_dependents) { newFormData.numDependents = String(commercialVehicle.num_dependents); }
    if (commercialVehicle.education_level) { newFormData.education = commercialVehicle.education_level; }
    if (commercialVehicle.current_address) { newFormData.currentAddress = commercialVehicle.current_address; }
    if (commercialVehicle.permanent_address) { newFormData.permanentAddress = commercialVehicle.permanent_address; }

    // Mapping logic from CIF data (with yellow highlighting)
    // Name
    if (individualInfo.given_name1 && !newFormData.applicantName) {
      newFormData.applicantName = individualInfo.given_name1;
      prefilled.add("applicantName");
    } else if (customerData?.cifData.fullname && !newFormData.applicantName) {
      newFormData.applicantName = customerData.cifData.fullname;
      prefilled.add("applicantName");
    }

    // CNIC
    if (customerIdType.id_no && !newFormData.cnic) {
      newFormData.cnic = customerIdType.id_no;
      prefilled.add("cnic");
    } else if (customerData?.cnic && !newFormData.cnic) {
      newFormData.cnic = customerData.cnic;
      prefilled.add("cnic");
    }

    // CNIC Dates
    if (customerIdType.issue_date && !newFormData.cnicIssuanceDate) {
      newFormData.cnicIssuanceDate = toInputDate(customerIdType.issue_date);
      prefilled.add("cnicIssuanceDate");
    }
    if (customerIdType.expiry_date && !newFormData.cnicExpiryDate) {
      newFormData.cnicExpiryDate = toInputDate(customerIdType.expiry_date);
      prefilled.add("cnicExpiryDate");
    }

    // DOB
    if (individualInfo.date_of_birth && !newFormData.dob) {
      newFormData.dob = toInputDate(individualInfo.date_of_birth);
      prefilled.add("dob");
    }

    // Father/Husband Name
    if (dirDetails.father_name && !newFormData.fatherHusbandName) {
      newFormData.fatherHusbandName = dirDetails.father_name;
      prefilled.add("fatherHusbandName");
    } else if (individualInfo.father_husband_name && !newFormData.fatherHusbandName) {
      newFormData.fatherHusbandName = individualInfo.father_husband_name;
      prefilled.add("fatherHusbandName");
    }

    // Mother Maiden Name
    if (individualInfo.maiden_name && !newFormData.motherMaidenName) {
      newFormData.motherMaidenName = individualInfo.maiden_name;
      prefilled.add("motherMaidenName");
    }

    // Gender
    if (individualInfo.sex && !newFormData.gender) {
      newFormData.gender =
        individualInfo.sex === "M"
          ? "Male"
          : individualInfo.sex === "F"
          ? "Female"
          : "";
      prefilled.add("gender");
    }

    // Marital Status
    if (individualInfo.maritial_status && !newFormData.maritalStatus) {
      newFormData.maritalStatus =
        individualInfo.maritial_status === "M"
          ? "Married"
          : individualInfo.maritial_status === "S"
          ? "Single"
          : "";
      prefilled.add("maritalStatus");
    }

    // Phone
    if (phone.phone_no && !newFormData.cellNo) {
      newFormData.cellNo = phone.phone_no;
      prefilled.add("cellNo");
    }

    // Address
    if (postal.address && !newFormData.currentAddress) {
      newFormData.currentAddress = postal.address;
      prefilled.add("currentAddress");
    }

    setFormData(newFormData);
    setPrefilledFields(prefilled);
    isInitialized.current = true;
  }, [customerData]);

  // Save to context when form data changes
  const saveToContext = () => {
    if (skipNextUpdate.current || !isInitialized.current) return;
    
    skipNextUpdate.current = true;
    
    // Map form data to the expected API format
    updateCustomerData({
      commercialVehicle: {
        ...(customerData?.commercialVehicle || {}),
        applicant_name: formData.applicantName,
        applicant_cnic: formData.cnic,
        cnic_issuance_date: formData.cnicIssuanceDate,
        cnic_expiry_date: formData.cnicExpiryDate,
        date_of_birth: formData.dob,
        father_husband_name: formData.fatherHusbandName,
        mother_maiden_name: formData.motherMaidenName,
        gender: formData.gender,
        marital_status: formData.maritalStatus,
        residence_landline_no: formData.residenceLandline,
        cell_no: formData.cellNo,
        residence_tenure_months: formData.residenceTenure ? parseInt(formData.residenceTenure, 10) : null,
        residence_type: formData.residenceType,
        num_dependents: formData.numDependents ? parseInt(formData.numDependents, 10) : null,
        education_level: formData.education,
        current_address: formData.currentAddress,
        permanent_address: formData.permanentAddress
      }
    } as any);
    
    // Reset the flag after a short delay
    setTimeout(() => {
      skipNextUpdate.current = false;
    }, 50);
  };

  // Update context when form data changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    saveToContext();
  }, [formData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getFieldClasses = (fieldName: string) => {
    const base = "w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm";
    const prefilled = "bg-yellow-50 border-yellow-300";
    const normal = "bg-white";
    return `${base} ${prefilledFields.has(fieldName) ? prefilled : normal}`;
  };

  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg font-semibold mb-4 p-4 bg-primary text-primary-foreground">
        Applicant Personal Detail
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
        {/* First Column Group */}
        <div>
          <label className="block text-sm font-medium mb-1">Applicant Name</label>
          <input
            type="text"
            className={getFieldClasses("applicantName")}
            placeholder="Applicant Name"
            value={formData.applicantName}
            onChange={e => handleInputChange("applicantName", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">CNIC</label>
          <input
            type="text"
            className={getFieldClasses("cnic")}
            placeholder="CNIC"
            value={formData.cnic}
            onChange={e => handleInputChange("cnic", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">CNIC Issuance Date</label>
          <input
            type="date"
            className={getFieldClasses("cnicIssuanceDate")}
            value={formData.cnicIssuanceDate}
            onChange={e => handleInputChange("cnicIssuanceDate", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">CNIC Expiry Date</label>
          <input
            type="date"
            className={getFieldClasses("cnicExpiryDate")}
            value={formData.cnicExpiryDate}
            onChange={e => handleInputChange("cnicExpiryDate", e.target.value)}
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
          <label className="block text-sm font-medium mb-1">Father / Husband Name</label>
          <input
            type="text"
            className={getFieldClasses("fatherHusbandName")}
            placeholder="Father / Husband Name"
            value={formData.fatherHusbandName}
            onChange={e => handleInputChange("fatherHusbandName", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mother Maiden Name</label>
          <input
            type="text"
            className={getFieldClasses("motherMaidenName")}
            placeholder="Mother Maiden Name"
            value={formData.motherMaidenName}
            onChange={e => handleInputChange("motherMaidenName", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Gender</label>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="gender"
                checked={formData.gender === "Male"}
                onChange={() => handleInputChange("gender", "Male")}
                className={prefilledFields.has("gender") ? "bg-yellow-50 border-yellow-300" : ""}
              /> Male
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="gender"
                checked={formData.gender === "Female"}
                onChange={() => handleInputChange("gender", "Female")}
                className={prefilledFields.has("gender") ? "bg-yellow-50 border-yellow-300" : ""}
              /> Female
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Marital Status</label>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="maritalStatus"
                checked={formData.maritalStatus === "Single"}
                onChange={() => handleInputChange("maritalStatus", "Single")}
                className={prefilledFields.has("maritalStatus") ? "bg-yellow-50 border-yellow-300" : ""}
              /> Single
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="maritalStatus"
                checked={formData.maritalStatus === "Married"}
                onChange={() => handleInputChange("maritalStatus", "Married")}
                className={prefilledFields.has("maritalStatus") ? "bg-yellow-50 border-yellow-300" : ""}
              /> Married
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Cell No.</label>
          <input
            type="text"
            className={getFieldClasses("cellNo")}
            placeholder="Cell No."
            value={formData.cellNo}
            onChange={e => handleInputChange("cellNo", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Residence Landline No.</label>
          <input
            type="text"
            className={getFieldClasses("residenceLandline")}
            placeholder="Landline No."
            value={formData.residenceLandline}
            onChange={e => handleInputChange("residenceLandline", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Residence Tenure (Months)</label>
          <input
            type="number"
            className={getFieldClasses("residenceTenure")}
            placeholder="Months"
            value={formData.residenceTenure}
            onChange={e => handleInputChange("residenceTenure", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Residence Type</label>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="residenceType"
                checked={formData.residenceType === "Own"}
                onChange={() => handleInputChange("residenceType", "Own")}
                className={prefilledFields.has("residenceType") ? "bg-yellow-50 border-yellow-300" : ""}
              /> Own
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="residenceType"
                checked={formData.residenceType === "Rented"}
                onChange={() => handleInputChange("residenceType", "Rented")}
                className={prefilledFields.has("residenceType") ? "bg-yellow-50 border-yellow-300" : ""}
              /> Rented
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">No. of Dependents</label>
          <input
            type="number"
            className={getFieldClasses("numDependents")}
            placeholder="No. of Dependents"
            value={formData.numDependents}
            onChange={e => handleInputChange("numDependents", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Education Level</label>
          <select
            className={getFieldClasses("education")}
            value={formData.education}
            onChange={e => handleInputChange("education", e.target.value)}
          >
            <option value="">--Select--</option>
            <option value="Matric">Matric</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Bachelor">Bachelor</option>
            <option value="Master">Master</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Current Residence Address</label>
          <textarea
            className={getFieldClasses("currentAddress")}
            rows={2}
            placeholder="Current Address"
            value={formData.currentAddress}
            onChange={e => handleInputChange("currentAddress", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Permanent Residence Address</label>
          <textarea
            className={getFieldClasses("permanentAddress")}
            rows={2}
            placeholder="Permanent Address"
            value={formData.permanentAddress}
            onChange={e => handleInputChange("permanentAddress", e.target.value)}
          />
        </div>
      </div>
    </section>
  );
};
