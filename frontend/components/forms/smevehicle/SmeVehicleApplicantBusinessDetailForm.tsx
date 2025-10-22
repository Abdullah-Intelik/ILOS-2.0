"use client";
import { useCustomer } from "@/contexts/CustomerContext";
import { useEffect, useRef, useState } from "react";

// Define interface for business detail data
interface BusinessDetailData {
  company_name: string;
  group_name: string;
  company_legal_status: string;
  type_of_business: string;
  experience_years: string;
  nature_of_business: string;
  business_landline_no: string;
  business_cell_no: string;
  national_tax_no: string;
  tax_payer: boolean;
  email: string;
  nearest_landmark: string;
  num_employees: string;
  annual_sales_pkr: string;
  business_address: string;
  political_affiliation: boolean;
  ubl_bank_account_no: string;
  ubl_bank_title: string;
  fax_no: string;
  company_est_date: string;
  business_premises: string;
  main_business_account_bank: string;
  main_business_account_no: string;
  main_business_account_open_date: string;
  registration_no: string;
}

export const ApplicantBusinessDetailForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  
  // Use refs to prevent infinite update loops
  const isInitialized = useRef(false);
  const skipNextUpdate = useRef(false);
  const isFirstRender = useRef(true);
  
  // Controlled state
  const [formData, setFormData] = useState<BusinessDetailData>({
    company_name: "",
    group_name: "",
    company_legal_status: "",
    type_of_business: "",
    experience_years: "",
    nature_of_business: "",
    business_landline_no: "",
    business_cell_no: "",
    national_tax_no: "",
    tax_payer: false,
    email: "",
    nearest_landmark: "",
    num_employees: "",
    annual_sales_pkr: "",
    business_address: "",
    political_affiliation: false,
    ubl_bank_account_no: "",
    ubl_bank_title: "",
    fax_no: "",
    company_est_date: "",
    business_premises: "",
    main_business_account_bank: "",
    main_business_account_no: "",
    main_business_account_open_date: "",
    registration_no: ""
  });
  
  // Initialize form with data from context (runs once)
  useEffect(() => {
    if (isInitialized.current) return;
    
    // Get existing data from context if available
    const commercialVehicle = customerData?.commercialVehicle || {};
    
    // Update form data with existing values
    setFormData({
      company_name: commercialVehicle.company_name || "",
      group_name: commercialVehicle.group_name || "",
      company_legal_status: commercialVehicle.company_legal_status || "",
      type_of_business: commercialVehicle.type_of_business || "",
      experience_years: commercialVehicle.experience_years ? String(commercialVehicle.experience_years) : "",
      nature_of_business: commercialVehicle.nature_of_business || "",
      business_landline_no: commercialVehicle.business_landline_no || "",
      business_cell_no: commercialVehicle.business_cell_no || "",
      national_tax_no: commercialVehicle.national_tax_no || "",
      tax_payer: Boolean(commercialVehicle.tax_payer),
      email: commercialVehicle.email || "",
      nearest_landmark: commercialVehicle.nearest_landmark || "",
      num_employees: commercialVehicle.num_employees ? String(commercialVehicle.num_employees) : "",
      annual_sales_pkr: commercialVehicle.annual_sales_pkr ? String(commercialVehicle.annual_sales_pkr) : "",
      business_address: commercialVehicle.business_address || "",
      political_affiliation: Boolean(commercialVehicle.political_affiliation),
      ubl_bank_account_no: commercialVehicle.ubl_bank_account_no || "",
      ubl_bank_title: commercialVehicle.ubl_bank_title || "",
      fax_no: commercialVehicle.fax_no || "",
      company_est_date: commercialVehicle.company_est_date ? new Date(commercialVehicle.company_est_date).toISOString().slice(0, 10) : "",
      business_premises: commercialVehicle.business_premises || "",
      main_business_account_bank: commercialVehicle.main_business_account_bank || "",
      main_business_account_no: commercialVehicle.main_business_account_no || "",
      main_business_account_open_date: commercialVehicle.main_business_account_open_date ? new Date(commercialVehicle.main_business_account_open_date).toISOString().slice(0, 10) : "",
      registration_no: commercialVehicle.registration_no || ""
    });
    
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
        company_name: formData.company_name,
        group_name: formData.group_name,
        company_legal_status: formData.company_legal_status,
        type_of_business: formData.type_of_business,
        experience_years: formData.experience_years ? parseInt(formData.experience_years, 10) : null,
        nature_of_business: formData.nature_of_business,
        business_landline_no: formData.business_landline_no,
        business_cell_no: formData.business_cell_no,
        national_tax_no: formData.national_tax_no,
        tax_payer: formData.tax_payer,
        email: formData.email,
        nearest_landmark: formData.nearest_landmark,
        num_employees: formData.num_employees ? parseInt(formData.num_employees, 10) : null,
        annual_sales_pkr: formData.annual_sales_pkr ? parseFloat(formData.annual_sales_pkr) : null,
        business_address: formData.business_address,
        political_affiliation: formData.political_affiliation,
        ubl_bank_account_no: formData.ubl_bank_account_no,
        ubl_bank_title: formData.ubl_bank_title,
        fax_no: formData.fax_no,
        company_est_date: formData.company_est_date,
        business_premises: formData.business_premises,
        main_business_account_bank: formData.main_business_account_bank,
        main_business_account_no: formData.main_business_account_no,
        main_business_account_open_date: formData.main_business_account_open_date,
        registration_no: formData.registration_no
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
  
  // Handle input changes
  const handleChange = (field: keyof BusinessDetailData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <>
      <section className="mb-10">
        <h3 className="text-2xl rounded-lg font-semibold mb-4 p-4 bg-primary text-primary-foreground">Applicant Business Detail</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
          <div>
            <label className="block text-sm font-medium mb-1">Company Name</label>
            <input 
              type="text" 
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm" 
              placeholder="Company Name" 
              value={formData.company_name}
              onChange={(e) => handleChange("company_name", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Group Name (if any)</label>
            <input 
              type="text" 
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm" 
              placeholder="Group Name" 
              value={formData.group_name}
              onChange={(e) => handleChange("group_name", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Company Legal Status</label>
            <div className="flex gap-6 mt-2 flex-wrap">
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="legalStatus" 
                  checked={formData.company_legal_status === "Proprietorship"}
                  onChange={() => handleChange("company_legal_status", "Proprietorship")}
                /> Proprietorship
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="legalStatus" 
                  checked={formData.company_legal_status === "Partnership"}
                  onChange={() => handleChange("company_legal_status", "Partnership")}
                /> Partnership
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="legalStatus" 
                  checked={formData.company_legal_status === "Private Ltd"}
                  onChange={() => handleChange("company_legal_status", "Private Ltd")}
                /> Private Ltd
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="legalStatus" 
                  checked={formData.company_legal_status === "Public Ltd"}
                  onChange={() => handleChange("company_legal_status", "Public Ltd")}
                /> Public Ltd
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type of Business</label>
            <input 
              type="text" 
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm" 
              placeholder="Type of Business" 
              value={formData.type_of_business}
              onChange={(e) => handleChange("type_of_business", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Experience (Years)</label>
            <input 
              type="number" 
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm" 
              placeholder="Years of Experience" 
              value={formData.experience_years}
              onChange={(e) => handleChange("experience_years", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nature of Business</label>
            <textarea 
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm" 
              placeholder="Nature of Business" 
              rows={2} 
              value={formData.nature_of_business}
              onChange={(e) => handleChange("nature_of_business", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Landline No.</label>
            <input 
              type="text" 
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm" 
              placeholder="Landline No." 
              value={formData.business_landline_no}
              onChange={(e) => handleChange("business_landline_no", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cell No.</label>
            <input 
              type="text" 
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm" 
              placeholder="Cell No." 
              value={formData.business_cell_no}
              onChange={(e) => handleChange("business_cell_no", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Business NTN</label>
            <input 
              type="text" 
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm" 
              placeholder="NTN" 
              value={formData.national_tax_no}
              onChange={(e) => handleChange("national_tax_no", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Business Address</label>
            <textarea 
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm" 
              placeholder="Business Address" 
              rows={2} 
              value={formData.business_address}
              onChange={(e) => handleChange("business_address", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date of Establishment</label>
            <input 
              type="date" 
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm" 
              value={formData.company_est_date}
              onChange={(e) => handleChange("company_est_date", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input 
              type="email" 
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm" 
              placeholder="Email" 
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nearest Landmark</label>
            <input 
              type="text" 
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm" 
              placeholder="Nearest Landmark" 
              value={formData.nearest_landmark}
              onChange={(e) => handleChange("nearest_landmark", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Number of Employees</label>
            <input 
              type="number" 
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm" 
              placeholder="Number of Employees" 
              value={formData.num_employees}
              onChange={(e) => handleChange("num_employees", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Annual Sales (PKR)</label>
            <input 
              type="number" 
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm" 
              placeholder="Annual Sales" 
              value={formData.annual_sales_pkr}
              onChange={(e) => handleChange("annual_sales_pkr", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">UBL Bank Account No.</label>
            <input 
              type="text" 
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm" 
              placeholder="UBL Account No." 
              value={formData.ubl_bank_account_no}
              onChange={(e) => handleChange("ubl_bank_account_no", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">UBL Bank Title</label>
            <input 
              type="text" 
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm" 
              placeholder="UBL Bank Title" 
              value={formData.ubl_bank_title}
              onChange={(e) => handleChange("ubl_bank_title", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fax No.</label>
            <input 
              type="text" 
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm" 
              placeholder="Fax No." 
              value={formData.fax_no}
              onChange={(e) => handleChange("fax_no", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Business Premises</label>
            <input 
              type="text" 
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm" 
              placeholder="Business Premises" 
              value={formData.business_premises}
              onChange={(e) => handleChange("business_premises", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Main Business Account Bank</label>
            <input 
              type="text" 
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm" 
              placeholder="Main Business Account Bank" 
              value={formData.main_business_account_bank}
              onChange={(e) => handleChange("main_business_account_bank", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Main Business Account No.</label>
            <input 
              type="text" 
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm" 
              placeholder="Main Business Account No." 
              value={formData.main_business_account_no}
              onChange={(e) => handleChange("main_business_account_no", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Main Business Account Open Date</label>
            <input 
              type="date" 
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm" 
              value={formData.main_business_account_open_date}
              onChange={(e) => handleChange("main_business_account_open_date", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Registration No.</label>
            <input 
              type="text" 
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm" 
              placeholder="Registration No." 
              value={formData.registration_no}
              onChange={(e) => handleChange("registration_no", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tax Payer</label>
            <div className="flex gap-6 mt-2">
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={formData.tax_payer}
                  onChange={(e) => handleChange("tax_payer", e.target.checked)}
                /> Yes
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Political Affiliation</label>
            <div className="flex gap-6 mt-2">
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={formData.political_affiliation}
                  onChange={(e) => handleChange("political_affiliation", e.target.checked)}
                /> Yes
              </label>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
