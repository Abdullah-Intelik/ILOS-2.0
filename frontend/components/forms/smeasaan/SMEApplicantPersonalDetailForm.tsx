"use client";
import React, { useEffect, useRef, useState } from "react";
import { useCustomer } from "@/contexts/CustomerContext";

// Helper for date fields
const toInputDate = (date?: string) =>
  date ? new Date(date).toISOString().slice(0, 10) : "";

// Define the interface for SME application data
interface SMEApplication {
  applicant_name?: string;
  applicant_cnic?: string;
  cnic_issuance_date?: string;
  cnic_expiry_date?: string;
  applicant_dob?: string;
  father_husband_name?: string;
  mother_maiden_name?: string;
  gender?: string;
  marital_status?: string;
  cell_no?: string;
  residence_landline_no?: string;
  residence_tenure_months?: number | null;
  residence_type?: string;
  num_dependents?: number | null;
  education_level?: string;
  curr_residence_address?: string;
  perm_residence_address?: string;
  // Add other SME fields as needed
}

// Define the interface for form data
interface SMEPersonalFormData {
  name: string;
  cnic: string;
  cnicIssue: string;
  cnicExpiry: string;
  dob: string;
  fatherOrHusband: string;
  motherMaiden: string;
  gender: string;
  marital: string;
  cell: string;
  landline: string;
  tenure: string;
  residenceType: string;
  dependents: string;
  education: string;
  currentAddress: string;
  permanentAddress: string;
}

export const SMEApplicantPersonalDetailForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  const ind = customerData?.cifData?.individualInfo || {};
  const cnicData = customerData?.cifData?.customerIdType || {};
  const dir = customerData?.cifData?.dirDetails || {};
  const phone = customerData?.cifData?.phone?.phone_no || "";
  const email = customerData?.cifData?.email?.address || "";
  const postal = customerData?.cifData?.postal || {};

  // Use refs to prevent infinite update loops
  const isInitialized = useRef(false);
  const skipNextUpdate = useRef(false);
  const isFirstRender = useRef(true);

  // Controlled state
  const [formData, setFormData] = useState<SMEPersonalFormData>({
    name: "",
    cnic: "",
    cnicIssue: "",
    cnicExpiry: "",
    dob: "",
    fatherOrHusband: "",
    motherMaiden: "",
    gender: "",
    marital: "",
    cell: "",
    landline: "",
    tenure: "",
    residenceType: "",
    dependents: "",
    education: "",
    currentAddress: "",
    permanentAddress: "",
  });
  const [prefilledFields, setPrefilledFields] = useState<Set<string>>(new Set());

  // Initialize form with data from context (runs once)
  useEffect(() => {
    if (isInitialized.current) return;

    // Check for existing SME application data first
    const smeApplication = customerData?.smeApplication as SMEApplication || {};
    
    const newFormData = { ...formData };
    const prefilled = new Set<string>();

    // Try loading from existing SME application data first
    if (smeApplication?.applicant_name) { newFormData.name = smeApplication.applicant_name; }
    if (smeApplication?.applicant_cnic) { newFormData.cnic = smeApplication.applicant_cnic; }
    if (smeApplication?.cnic_issuance_date) { newFormData.cnicIssue = toInputDate(smeApplication.cnic_issuance_date); }
    if (smeApplication?.cnic_expiry_date) { newFormData.cnicExpiry = toInputDate(smeApplication.cnic_expiry_date); }
    if (smeApplication?.applicant_dob) { newFormData.dob = toInputDate(smeApplication.applicant_dob); }
    if (smeApplication?.father_husband_name) { newFormData.fatherOrHusband = smeApplication.father_husband_name; }
    if (smeApplication?.mother_maiden_name) { newFormData.motherMaiden = smeApplication.mother_maiden_name; }
    if (smeApplication?.gender) { newFormData.gender = smeApplication.gender; }
    if (smeApplication?.marital_status) { newFormData.marital = smeApplication.marital_status; }
    if (smeApplication?.cell_no) { newFormData.cell = smeApplication.cell_no; }
    if (smeApplication?.residence_landline_no) { newFormData.landline = smeApplication.residence_landline_no; }
    if (smeApplication?.residence_tenure_months) { newFormData.tenure = String(smeApplication.residence_tenure_months); }
    if (smeApplication?.residence_type) { newFormData.residenceType = smeApplication.residence_type; }
    if (smeApplication?.num_dependents) { newFormData.dependents = String(smeApplication.num_dependents); }
    if (smeApplication?.education_level) { newFormData.education = smeApplication.education_level; }
    if (smeApplication?.curr_residence_address) { newFormData.currentAddress = smeApplication.curr_residence_address; }
    if (smeApplication?.perm_residence_address) { newFormData.permanentAddress = smeApplication.perm_residence_address; }

    // Then try to load from personalDetails (with type checking)
    const personalDetails = customerData?.personalDetails || {};
    
    // Handle properties that exist in personalDetails
    if (personalDetails.fullName) { newFormData.name = personalDetails.fullName; }
    if (personalDetails.cnic) { newFormData.cnic = personalDetails.cnic; }
    if (personalDetails.dateOfBirth) { newFormData.dob = toInputDate(personalDetails.dateOfBirth); }
    if (personalDetails.fatherName) { newFormData.fatherOrHusband = personalDetails.fatherName; }
    if (personalDetails.motherName) { newFormData.motherMaiden = personalDetails.motherName; }
    if (personalDetails.gender) { newFormData.gender = personalDetails.gender; }
    if (personalDetails.maritalStatus) { newFormData.marital = personalDetails.maritalStatus; }
    if (personalDetails.mobileNumber) { newFormData.cell = personalDetails.mobileNumber; }

    // Then try to load from CIF data (with yellow highlighting)
    if (customerData?.cifData?.fullname && !newFormData.name) { 
      newFormData.name = customerData.cifData.fullname; 
      prefilled.add("name"); 
    }
    if (customerData?.cnic && !newFormData.cnic) { 
      newFormData.cnic = customerData.cnic; 
      prefilled.add("cnic"); 
    }
    if (cnicData?.expiry_date && !newFormData.cnicExpiry) { 
      newFormData.cnicExpiry = toInputDate(cnicData.expiry_date); 
      prefilled.add("cnicExpiry"); 
    }
    if (ind?.date_of_birth && !newFormData.dob) { 
      newFormData.dob = toInputDate(ind.date_of_birth); 
      prefilled.add("dob"); 
    }
    if (dir?.father_name && !newFormData.fatherOrHusband) { 
      newFormData.fatherOrHusband = dir.father_name; 
      prefilled.add("fatherOrHusband"); 
    }
    if (ind?.maiden_name && !newFormData.motherMaiden) { 
      newFormData.motherMaiden = ind.maiden_name; 
      prefilled.add("motherMaiden"); 
    }
    if (ind?.sex && !newFormData.gender) { 
      newFormData.gender = ind.sex === "M" ? "Male" : ind.sex === "F" ? "Female" : ""; 
      prefilled.add("gender"); 
    }
    if (ind?.maritial_status && !newFormData.marital) { 
      newFormData.marital = ind.maritial_status === "M" ? "Married" : "Single"; 
      prefilled.add("marital"); 
    }
    if (phone && !newFormData.cell) { 
      newFormData.cell = phone; 
      prefilled.add("cell"); 
    }
    if (postal?.address && !newFormData.currentAddress) { 
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
    
    // Prepare the data to update the context
    const updateData: Record<string, any> = {
      // Map to database schema field names for SME application
      smeApplication: {
        ...(customerData?.smeApplication || {}),
        applicant_name: formData.name,
        applicant_cnic: formData.cnic,
        cnic_issuance_date: formData.cnicIssue,
        cnic_expiry_date: formData.cnicExpiry,
        applicant_dob: formData.dob,
        father_husband_name: formData.fatherOrHusband,
        mother_maiden_name: formData.motherMaiden,
        gender: formData.gender,
        marital_status: formData.marital,
        cell_no: formData.cell,
        residence_landline_no: formData.landline,
        residence_tenure_months: formData.tenure ? parseInt(formData.tenure, 10) : null,
        residence_type: formData.residenceType,
        num_dependents: formData.dependents ? parseInt(formData.dependents, 10) : null,
        education_level: formData.education,
        curr_residence_address: formData.currentAddress,
        perm_residence_address: formData.permanentAddress
      }
    };

    // Update the customer data context
    updateCustomerData(updateData as any);
    
    // Reset the flag after a short delay to prevent loops
    setTimeout(() => {
      skipNextUpdate.current = false;
    }, 50);
  };

  // Save to context when form changes (after first render)
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
    const base = "w-full rounded-xl border border-gray-300 px-4 py-2";
    const prefilled = "bg-yellow-50 border-yellow-300";
    const normal = "bg-white";
    return `${base} ${prefilledFields.has(fieldName) ? prefilled : normal}`;
  };

  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-primary text-primary-foreground">Applicant Personal Detail</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
        {/* Form Fields */}
        {/* First Column Group */}
        <div>
          <label className="block text-sm font-medium mb-1">Applicant Name</label>
          <input
            type="text"
            className={getFieldClasses("name")}
            placeholder="Applicant Name"
            value={formData.name}
            onChange={e => handleInputChange("name", e.target.value)}
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
            className={getFieldClasses("fatherOrHusband")}
            placeholder="Father / Husband Name"
            value={formData.fatherOrHusband}
            onChange={e => handleInputChange("fatherOrHusband", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mother Maiden Name</label>
          <input
            type="text"
            className={getFieldClasses("motherMaiden")}
            placeholder="Mother Maiden Name"
            value={formData.motherMaiden}
            onChange={e => handleInputChange("motherMaiden", e.target.value)}
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
                checked={formData.marital === "Single"}
                onChange={() => handleInputChange("marital", "Single")}
                className={prefilledFields.has("marital") ? "bg-yellow-50 border-yellow-300" : ""}
              /> Single
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="maritalStatus"
                checked={formData.marital === "Married"}
                onChange={() => handleInputChange("marital", "Married")}
                className={prefilledFields.has("marital") ? "bg-yellow-50 border-yellow-300" : ""}
              /> Married
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Cell No.</label>
          <input
            type="text"
            className={getFieldClasses("cell")}
            placeholder="Cell No."
            value={formData.cell}
            onChange={e => handleInputChange("cell", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Residence Landline No.</label>
          <input
            type="text"
            className={getFieldClasses("landline")}
            placeholder="Landline No."
            value={formData.landline}
            onChange={e => handleInputChange("landline", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Residence Tenure (Months)</label>
          <input
            type="number"
            className={getFieldClasses("tenure")}
            placeholder="Months"
            value={formData.tenure}
            onChange={e => handleInputChange("tenure", e.target.value)}
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
            className={getFieldClasses("dependents")}
            placeholder="No. of Dependents"
            value={formData.dependents}
            onChange={e => handleInputChange("dependents", e.target.value)}
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
