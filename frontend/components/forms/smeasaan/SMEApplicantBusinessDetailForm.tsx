"use client";
import React, { useEffect, useRef, useState } from "react";
import { useCustomer } from "@/contexts/CustomerContext";

// Define interface for the business form data
interface SMEBusinessFormData {
  companyName: string;
  legalStatus: string;
  groupName: string;
  experienceYears: string;
  landlineNo: string;
  cellNo: string;
  sectorSE: boolean;
  sectorME: boolean;
  sectorManufacturing: boolean;
  sectorTraders: boolean;
  sectorRetail: boolean;
  sectorServices: boolean;
  sectorIndividuals: boolean;
  ntn: string;
  taxPayer: string;
  email: string;
  nearestLandmark: string;
  numEmployees: string;
  annualSales: string;
  address: string;
  politicalAffiliation: string;
  ublAccountNo: string;
  ublAccountTitle: string;
  faxNo: string;
  establishmentDate: string;
  premisesType: string;
  registrationNo: string;
  mainBank: string;
  mainAccountNo: string;
  mainAccountOpenDate: string;
}

// Define interface for SME application data
interface SMEApplication {
  company_name?: string;
  company_legal_status?: string;
  group_name?: string;
  experience_years?: number | null;
  business_landline_no?: string;
  business_cell_no?: string;
  sector_se?: boolean;
  sector_me?: boolean;
  sector_manufacturing?: boolean;
  sector_traders_distributors?: boolean;
  sector_wholesaler_retailer?: boolean;
  sector_services?: boolean;
  sector_individuals?: boolean;
  national_tax_no?: string;
  tax_payer?: boolean;
  email?: string;
  nearest_landmark?: string;
  num_employees?: number | null;
  annual_sales_pkr?: number | null;
  business_address?: string;
  political_affiliation?: boolean;
  ubl_bank_account_no?: string;
  ubl_bank_title?: string;
  fax_no?: string;
  business_est_date?: string | null;
  business_premises?: string;
  registration_no?: string;
  main_business_account_bank?: string;
  main_business_account_no?: string;
  main_business_account_open_date?: string | null;
  [key: string]: any; // Allow other properties
}

// Define a more flexible customer data type for our component
interface FlexibleCustomerData {
  smeApplication?: SMEApplication;
  [key: string]: any; // Allow other properties
}

// Define interface for business details
interface BusinessDetails {
  companyName?: string;
  legalStatus?: string;
  // Add other fields as needed
}

export const SMEApplicantBusinessDetailForm = () => {
  const { customerData, updateCustomerData } = useCustomer();

  // Use refs to prevent infinite update loops
  const isInitialized = useRef(false);
  const skipNextUpdate = useRef(false);
  const isFirstRender = useRef(true);

  // Controlled state
  const [formData, setFormData] = useState<SMEBusinessFormData>({
    companyName: "",
    legalStatus: "",
    groupName: "",
    experienceYears: "",
    landlineNo: "",
    cellNo: "",
    sectorSE: false,
    sectorME: false,
    sectorManufacturing: false,
    sectorTraders: false,
    sectorRetail: false,
    sectorServices: false,
    sectorIndividuals: false,
    ntn: "",
    taxPayer: "",
    email: "",
    nearestLandmark: "",
    numEmployees: "",
    annualSales: "",
    address: "",
    politicalAffiliation: "",
    ublAccountNo: "",
    ublAccountTitle: "",
    faxNo: "",
    establishmentDate: "",
    premisesType: "",
    registrationNo: "",
    mainBank: "",
    mainAccountNo: "",
    mainAccountOpenDate: ""
  });

  // Initialize form with data from context (runs once)
  useEffect(() => {
    if (isInitialized.current) return;

    // Get existing data from context if available - with proper typing
    const data = customerData as FlexibleCustomerData || {};
    const smeApp = data.smeApplication || {} as SMEApplication;
    
    const newFormData = { ...formData };

    // Load data from specific SME application fields if they exist
    if (smeApp.company_name) newFormData.companyName = smeApp.company_name;
    if (smeApp.company_legal_status) newFormData.legalStatus = smeApp.company_legal_status;
    if (smeApp.group_name) newFormData.groupName = smeApp.group_name;
    if (smeApp.experience_years) newFormData.experienceYears = String(smeApp.experience_years);
    if (smeApp.business_landline_no) newFormData.landlineNo = smeApp.business_landline_no;
    if (smeApp.business_cell_no) newFormData.cellNo = smeApp.business_cell_no;
    if (smeApp.sector_se !== undefined) newFormData.sectorSE = Boolean(smeApp.sector_se);
    if (smeApp.sector_me !== undefined) newFormData.sectorME = Boolean(smeApp.sector_me);
    if (smeApp.sector_manufacturing !== undefined) newFormData.sectorManufacturing = Boolean(smeApp.sector_manufacturing);
    if (smeApp.sector_traders_distributors !== undefined) newFormData.sectorTraders = Boolean(smeApp.sector_traders_distributors);
    if (smeApp.sector_wholesaler_retailer !== undefined) newFormData.sectorRetail = Boolean(smeApp.sector_wholesaler_retailer);
    if (smeApp.sector_services !== undefined) newFormData.sectorServices = Boolean(smeApp.sector_services);
    if (smeApp.sector_individuals !== undefined) newFormData.sectorIndividuals = Boolean(smeApp.sector_individuals);
    if (smeApp.national_tax_no) newFormData.ntn = smeApp.national_tax_no;
    if (smeApp.tax_payer !== undefined) newFormData.taxPayer = smeApp.tax_payer ? "Yes" : "No";
    if (smeApp.email) newFormData.email = smeApp.email;
    if (smeApp.nearest_landmark) newFormData.nearestLandmark = smeApp.nearest_landmark;
    if (smeApp.num_employees) newFormData.numEmployees = String(smeApp.num_employees);
    if (smeApp.annual_sales_pkr) newFormData.annualSales = String(smeApp.annual_sales_pkr);
    if (smeApp.business_address) newFormData.address = smeApp.business_address;
    if (smeApp.political_affiliation !== undefined) newFormData.politicalAffiliation = String(smeApp.political_affiliation);
    if (smeApp.ubl_bank_account_no) newFormData.ublAccountNo = smeApp.ubl_bank_account_no;
    if (smeApp.ubl_bank_title) newFormData.ublAccountTitle = smeApp.ubl_bank_title;
    if (smeApp.fax_no) newFormData.faxNo = smeApp.fax_no;
    if (smeApp.business_est_date) newFormData.establishmentDate = new Date(smeApp.business_est_date).toISOString().slice(0, 10);
    if (smeApp.business_premises) newFormData.premisesType = smeApp.business_premises;
    if (smeApp.registration_no) newFormData.registrationNo = smeApp.registration_no;
    if (smeApp.main_business_account_bank) newFormData.mainBank = smeApp.main_business_account_bank;
    if (smeApp.main_business_account_no) newFormData.mainAccountNo = smeApp.main_business_account_no;
    if (smeApp.main_business_account_open_date) newFormData.mainAccountOpenDate = new Date(smeApp.main_business_account_open_date).toISOString().slice(0, 10);

    setFormData(newFormData);
    isInitialized.current = true;
  }, [customerData]);

  // Save to context when form data changes
  const saveToContext = () => {
    if (skipNextUpdate.current || !isInitialized.current) return;
    
    skipNextUpdate.current = true;
    
    // Cast to our flexible interface for type safety
    const data = customerData as FlexibleCustomerData || {};
    
    // Map our state to the format expected by the API
    updateCustomerData({
      // Map to database schema field names for SME application
      smeApplication: {
        ...(data.smeApplication || {}),
        company_name: formData.companyName,
        company_legal_status: formData.legalStatus,
        group_name: formData.groupName,
        experience_years: formData.experienceYears ? parseInt(formData.experienceYears, 10) : null,
        business_landline_no: formData.landlineNo,
        business_cell_no: formData.cellNo,
        sector_se: formData.sectorSE,
        sector_me: formData.sectorME,
        sector_manufacturing: formData.sectorManufacturing,
        sector_traders_distributors: formData.sectorTraders,
        sector_wholesaler_retailer: formData.sectorRetail,
        sector_services: formData.sectorServices,
        sector_individuals: formData.sectorIndividuals,
        national_tax_no: formData.ntn,
        tax_payer: formData.taxPayer === "Yes",
        email: formData.email,
        nearest_landmark: formData.nearestLandmark,
        num_employees: formData.numEmployees ? parseInt(formData.numEmployees, 10) : null,
        annual_sales_pkr: formData.annualSales ? parseInt(formData.annualSales, 10) : null,
        business_address: formData.address,
        political_affiliation: Boolean(formData.politicalAffiliation),
        ubl_bank_account_no: formData.ublAccountNo,
        ubl_bank_title: formData.ublAccountTitle,
        fax_no: formData.faxNo,
        business_est_date: formData.establishmentDate || null,
        business_premises: formData.premisesType,
        registration_no: formData.registrationNo,
        main_business_account_bank: formData.mainBank,
        main_business_account_no: formData.mainAccountNo,
        main_business_account_open_date: formData.mainAccountOpenDate || null
      }
    } as any);
    
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

  // Handle input change
  const handleInputChange = (field: keyof SMEBusinessFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-primary text-primary-foreground">Applicant Business Detail</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
        {/* Company Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Company Name</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2" 
            placeholder="Company Name" 
            value={formData.companyName}
            onChange={e => handleInputChange("companyName", e.target.value)}
          />
        </div>
        {/* Company Legal Status */}
        <div>
          <label className="block text-sm font-medium mb-1">Company Legal Status</label>
          <select 
            className="w-full rounded-xl border border-gray-300 px-4 py-2"
            value={formData.legalStatus}
            onChange={e => handleInputChange("legalStatus", e.target.value)}
          >
            <option value="">--Select--</option>
            <option value="Proprietorship">Proprietorship</option>
            <option value="Partnership">Partnership</option>
            <option value="Private Ltd">Private Ltd</option>
            <option value="Public Ltd">Public Ltd</option>
          </select>
        </div>
        {/* Group Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Group Name (if any)</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2" 
            placeholder="Group Name" 
            value={formData.groupName}
            onChange={e => handleInputChange("groupName", e.target.value)}
          />
        </div>
        {/* Experience */}
        <div>
          <label className="block text-sm font-medium mb-1">Experience (No. of years)</label>
          <input 
            type="number" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2" 
            placeholder="Years" 
            value={formData.experienceYears}
            onChange={e => handleInputChange("experienceYears", e.target.value)}
          />
        </div>
        {/* Landline No. */}
        <div>
          <label className="block text-sm font-medium mb-1">Landline No.</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2" 
            placeholder="Landline No." 
            value={formData.landlineNo}
            onChange={e => handleInputChange("landlineNo", e.target.value)}
          />
        </div>
        {/* Cell No. */}
        <div>
          <label className="block text-sm font-medium mb-1">Cell No.</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2" 
            placeholder="Cell No." 
            value={formData.cellNo}
            onChange={e => handleInputChange("cellNo", e.target.value)}
          />
        </div>
        {/* Sector (Checkboxes) */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Sector</label>
          <div className="flex flex-wrap gap-6 mt-2">
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={formData.sectorSE}
                onChange={e => handleInputChange("sectorSE", e.target.checked)}
              /> 
              SE
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={formData.sectorME}
                onChange={e => handleInputChange("sectorME", e.target.checked)}
              /> 
              ME
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={formData.sectorManufacturing}
                onChange={e => handleInputChange("sectorManufacturing", e.target.checked)}
              /> 
              Manufacturing
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={formData.sectorTraders}
                onChange={e => handleInputChange("sectorTraders", e.target.checked)}
              /> 
              Traders - Distributors
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={formData.sectorRetail}
                onChange={e => handleInputChange("sectorRetail", e.target.checked)}
              /> 
              Wholesaler / Retailer
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={formData.sectorServices}
                onChange={e => handleInputChange("sectorServices", e.target.checked)}
              /> 
              Services
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={formData.sectorIndividuals}
                onChange={e => handleInputChange("sectorIndividuals", e.target.checked)}
              /> 
              Individuals
            </label>
          </div>
        </div>
        {/* National Tax No. */}
        <div>
          <label className="block text-sm font-medium mb-1">National Tax No.</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2" 
            placeholder="NTN" 
            value={formData.ntn}
            onChange={e => handleInputChange("ntn", e.target.value)}
          />
        </div>
        {/* Tax Payer */}
        <div>
          <label className="block text-sm font-medium mb-1">Tax Payer</label>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="taxPayer" 
                checked={formData.taxPayer === "Yes"}
                onChange={() => handleInputChange("taxPayer", "Yes")}
              /> 
              Yes
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="taxPayer" 
                checked={formData.taxPayer === "No"}
                onChange={() => handleInputChange("taxPayer", "No")}
              /> 
              No
            </label>
          </div>
        </div>
        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input 
            type="email" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2" 
            placeholder="Email" 
            value={formData.email}
            onChange={e => handleInputChange("email", e.target.value)}
          />
        </div>
        {/* Nearest Landmark */}
        <div>
          <label className="block text-sm font-medium mb-1">Nearest Landmark</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2" 
            placeholder="Nearest Landmark" 
            value={formData.nearestLandmark}
            onChange={e => handleInputChange("nearestLandmark", e.target.value)}
          />
        </div>
        {/* No. of Employees */}
        <div>
          <label className="block text-sm font-medium mb-1">No. of Employees (incl. contractual)</label>
          <input 
            type="number" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2" 
            placeholder="No. of Employees" 
            value={formData.numEmployees}
            onChange={e => handleInputChange("numEmployees", e.target.value)}
          />
        </div>
        {/* Annual Sales */}
        <div>
          <label className="block text-sm font-medium mb-1">Annual Sales in PKR</label>
          <input 
            type="number" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2" 
            placeholder="Annual Sales" 
            value={formData.annualSales}
            onChange={e => handleInputChange("annualSales", e.target.value)}
          />
        </div>
        {/* Business Address */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Business Address</label>
          <textarea 
            className="w-full rounded-xl border border-gray-300 px-4 py-2" 
            rows={2} 
            placeholder="Business Address" 
            value={formData.address}
            onChange={e => handleInputChange("address", e.target.value)}
          />
        </div>
        {/* Political Affiliation */}
        <div>
          <label className="block text-sm font-medium mb-1">Political Affiliation (if any)</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2" 
            placeholder="Political Affiliation" 
            value={formData.politicalAffiliation}
            onChange={e => handleInputChange("politicalAffiliation", e.target.value)}
          />
        </div>
        {/* UBL Bank A/C No. */}
        <div>
          <label className="block text-sm font-medium mb-1">UBL Bank A/C No. (if any)</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2" 
            placeholder="UBL Bank A/C No." 
            value={formData.ublAccountNo}
            onChange={e => handleInputChange("ublAccountNo", e.target.value)}
          />
        </div>
        {/* UBL Bank Title of A/C */}
        <div>
          <label className="block text-sm font-medium mb-1">UBL Bank Title of A/C (if any)</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2" 
            placeholder="UBL Bank Title of A/C" 
            value={formData.ublAccountTitle}
            onChange={e => handleInputChange("ublAccountTitle", e.target.value)}
          />
        </div>
        {/* Fax No. */}
        <div>
          <label className="block text-sm font-medium mb-1">Fax No.</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2" 
            placeholder="Fax No." 
            value={formData.faxNo}
            onChange={e => handleInputChange("faxNo", e.target.value)}
          />
        </div>
        {/* Date of company / business est. */}
        <div>
          <label className="block text-sm font-medium mb-1">Date of company/business est.</label>
          <input 
            type="date" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2" 
            value={formData.establishmentDate}
            onChange={e => handleInputChange("establishmentDate", e.target.value)}
          />
        </div>
        {/* Business premises */}
        <div>
          <label className="block text-sm font-medium mb-1">Business Premises</label>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="premisesType"
                checked={formData.premisesType === "Owned"}
                onChange={() => handleInputChange("premisesType", "Owned")}
              /> 
              Owned
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="premisesType"
                checked={formData.premisesType === "Rented"}
                onChange={() => handleInputChange("premisesType", "Rented")}
              /> 
              Rented
            </label>
          </div>
        </div>
        {/* Registration No. */}
        <div>
          <label className="block text-sm font-medium mb-1">Registration No. (if applicable)</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2" 
            placeholder="Registration No." 
            value={formData.registrationNo}
            onChange={e => handleInputChange("registrationNo", e.target.value)}
          />
        </div>
        {/* Main Business Account - Bank Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Main Business Account - Bank Name</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2" 
            placeholder="Bank Name" 
            value={formData.mainBank}
            onChange={e => handleInputChange("mainBank", e.target.value)}
          />
        </div>
        {/* A/C No. */}
        <div>
          <label className="block text-sm font-medium mb-1">A/C No.</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2" 
            placeholder="Account No." 
            value={formData.mainAccountNo}
            onChange={e => handleInputChange("mainAccountNo", e.target.value)}
          />
        </div>
        {/* A/C Opening Date */}
        <div>
          <label className="block text-sm font-medium mb-1">A/C Opening Date</label>
          <input 
            type="date" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2" 
            value={formData.mainAccountOpenDate}
            onChange={e => handleInputChange("mainAccountOpenDate", e.target.value)}
          />
        </div>
      </div>
    </section>
  )
}
