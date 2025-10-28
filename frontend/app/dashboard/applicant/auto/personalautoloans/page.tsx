"use client";
import React, { useEffect, useRef, useState } from 'react';
import { ProductProgramForm } from '@/components/forms/autoloan/AotuloanProductProgramForm';
import { VehicleDetailsForm } from '@/components/forms/autoloan/AutoloanVehicleDetailsForm';
import { InsuranceDetailsForm } from '@/components/forms/autoloan/AutoloanInsuranceDetailsForm';
import { DealerDetailsForm } from '@/components/forms/autoloan/AutoloanDealerDetailsForm';
import { PersonalDetailsForm } from '@/components/forms/autoloan/AutoloanPersonalDetailsForm';
import { OccupationForm } from '@/components/forms/autoloan/AutoloanOccupationForm';
import { IncomeDetailsForm } from '@/components/forms/autoloan/IncomeDetailsForm';
import { BankingDetailsForm } from '@/components/forms/autoloan/AutoloanBankingDetailsForm';
import { ExposureUndertakingForm } from '@/components/forms/autoloan/AutoloanExposureUndertakingForm';
import { ReferencesForm } from '@/components/forms/autoloan/AutoloanReferencesForm';
import { FinancingOptionForm } from '@/components/forms/autoloan/AutoloanFinancingOptionForm';
import { SignaturesForm } from '@/components/forms/autoloan/AutoloanSignaturesForm';
import { BankUseOnlyForm } from '@/components/forms/autoloan/AutoloanBankUseOnlyForm';
import { useCustomer } from '@/contexts/CustomerContext';
import { Card, CardContent } from '@/components/ui/card';
import { User, CreditCard, ArrowLeft, CheckCircle2, ChevronUp, Settings, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
// 1. Section Keys
type SectionKey =
  | "product"
  | "vehicle"
  | "insurance"
  | "dealer"
  | "personal"
  | "occupation"
  | "income"
  | "banking"
  | "exposure"
  | "references"
  | "financing"
  | "signatures"
  | "bankUse";

const FORM_SECTIONS: { key: SectionKey; label: string }[] = [
  { key: "product", label: "Product Program" },
  { key: "vehicle", label: "Vehicle Details" },
  { key: "insurance", label: "Insurance Details" },
  { key: "dealer", label: "Dealer Details" },
  { key: "personal", label: "Personal Details" },
  { key: "occupation", label: "Occupation" },
  { key: "income", label: "Income Details" },
  { key: "banking", label: "Banking Details" },
  { key: "exposure", label: "Exposure/Undertaking" },
  { key: "references", label: "References" },
  { key: "financing", label: "Financing Option" },
  { key: "signatures", label: "Signatures" },
  { key: "bankUse", label: "Bank Use Only" },
];

// 2. API base URL
const getBaseUrl = () => {
  if (typeof window !== "undefined" && window.location.hostname !== "localhost") {
    return process.env.NEXT_PUBLIC_API_URL || "https://ilos-backend.vercel.app";
  }
  return "http://localhost:5000";
};

const AutoLoanPage = () => {
  const { customerData, updateCustomerData } = useCustomer();
  const router = useRouter();
  const { toast } = useToast();
  const [showUpArrow, setShowUpArrow] = useState(false);
  const [currentSection, setCurrentSection] = useState("product");
  const [validationEnabled, setValidationEnabled] = useState(true);
  const [showTestOptions, setShowTestOptions] = useState(false);
  const [validationStatus, setValidationStatus] = useState<{isValid: boolean; missingFields: string[]}>({isValid: true, missingFields: []});

  const refs = {
    product: useRef<HTMLDivElement>(null),
    vehicle: useRef<HTMLDivElement>(null),
    insurance: useRef<HTMLDivElement>(null),
    dealer: useRef<HTMLDivElement>(null),
    personal: useRef<HTMLDivElement>(null),
    occupation: useRef<HTMLDivElement>(null),
    income: useRef<HTMLDivElement>(null),
    banking: useRef<HTMLDivElement>(null),
    exposure: useRef<HTMLDivElement>(null),
    references: useRef<HTMLDivElement>(null),
    financing: useRef<HTMLDivElement>(null),
    signatures: useRef<HTMLDivElement>(null),
    bankUse: useRef<HTMLDivElement>(null),
  };

  // Function to check current validation status
  const checkValidationStatus = () => {
    if (!validationEnabled) {
      setValidationStatus({isValid: true, missingFields: []});
      return;
    }
    
    const errors = validateMandatoryFields();
    setValidationStatus({
      isValid: errors.length === 0,
      missingFields: errors
    });
  };

  // Validation function to check mandatory fields
  const validateMandatoryFields = () => {
    const errors: string[] = [];
    
    // Product Program validation
    if (!formData.product_type) {
      errors.push("Product Type is required");
    }
    if (!formData.program_type) {
      errors.push("Program Type is required");
    }
    if (!formData.payment_mode) {
      errors.push("Payment Mode is required");
    }
    if (!formData.facility_amount) {
      errors.push("Facility Amount is required");
    }
    if (!formData.tenure) {
      errors.push("Tenure is required");
    }

    // Vehicle Details validation
    if (!formData.vehicle_manufacturer) {
      errors.push("Vehicle Manufacturer is required");
    }
    if (!formData.vehicle_model) {
      errors.push("Vehicle Model is required");
    }
    if (!formData.year_of_manufacture) {
      errors.push("Year of Manufacture is required");
    }
    if (!formData.price_value) {
      errors.push("Vehicle Price is required");
    }

    // Personal Details validation
    if (!formData.applicant_full_name) {
      errors.push("Applicant Full Name is required");
    }
    if (!formData.applicant_cnic) {
      errors.push("Applicant CNIC is required");
    }
    if (!formData.date_of_birth) {
      errors.push("Date of Birth is required");
    }
    if (!formData.mobile_number) {
      errors.push("Mobile Number is required");
    }

    // Occupation validation
    if (!formData.occupation_type) {
      errors.push("Occupation Type is required");
    }
    if (!formData.employment_status) {
      errors.push("Employment Status is required");
    }
    if (!formData.employer_name) {
      errors.push("Employer Name is required");
    }
    if (!formData.designation) {
      errors.push("Designation is required");
    }

    // Income validation
    if (!formData.gross_monthly_salary) {
      errors.push("Gross Monthly Salary is required");
    }
    if (!formData.total_gross_monthly_income) {
      errors.push("Total Gross Monthly Income is required");
    }

    // Banking validation
    if (!formData.bank_name) {
      errors.push("Bank Name is required");
    }
    if (!formData.account_number) {
      errors.push("Account Number is required");
    }

    // Signature validation
    if (!formData.applicant_signature) {
      errors.push("Applicant Signature is required");
    }
    if (!formData.signature_date) {
      errors.push("Signature Date is required");
    }

    // Bank Use Only validation
    if (!formData.branch_code) {
      errors.push("Branch Code is required");
    }
    if (!formData.account_officer) {
      errors.push("Account Officer is required");
    }
    if (!formData.application_date) {
      errors.push("Application Date is required");
    }

    return errors;
  };



  const [formData, setFormData] = useState<any>({
    customer_id: customerData?.customerId || "",
    applicant_cnic: customerData?.personalDetails?.cnic || "",
    auto_application_id: `AUTO-${Math.floor(100 + Math.random() * 900)}`,
    application_source: [], // Initialize as empty array to prevent controlled/uncontrolled input issues
    references: [{}, {}],
    credit_cards_clean: [{}],
    credit_cards_secured: [{}],
    personal_loans_clean: [{}],
    personal_loans_secured: [{}],
    other_facilities: [{}],
    applied_limits: [{}],


    //income details
  gross_monthly_salary: '',
  other_monthly_income: '',
  total_gross_monthly_income: '',
  net_monthly_income: '',
  other_income_type: '', // comma-separated: Rent,Business,etc.
  other_income_specify: '',
  spouse_employed: '',
  spousal_income: '',
  spouse_income_source: '',
  statement_to_be_sent: '', // comma-separated: Home,Office,etc.


    repayment_bank_name: customerData?.clientBanks?.bank_name || customerData?.cifData?.clientBanks?.bank_name || "",
    repayment_branch: customerData?.clientBanks?.branch || customerData?.cifData?.clientBanks?.branch || "",
    repayment_account_no: customerData?.clientBanks?.actt_no || customerData?.cifData?.clientBanks?.actt_no || "",
  });

  useEffect(() => {
    const scrollHandler = () => setShowUpArrow(window.scrollY > 300);
    window.addEventListener("scroll", scrollHandler);
    return () => window.removeEventListener("scroll", scrollHandler);
  }, []);

  // Check validation status when formData changes
  useEffect(() => {
    checkValidationStatus();
  }, [formData, validationEnabled]);

  const handleInputChange = (e: React.ChangeEvent<any> | { target: { name: string; value: any } }) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleReferenceChange = (index: number, field: string, value: string) => {
    const updated = [...formData.references];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev: any) => ({ ...prev, references: updated }));
  };

  const handleExposureChange = (section: string, field: string, value: string | number) => {
    const updated = [...(formData[section] || [{}])];
    updated[0] = { ...updated[0], [field]: value };
    setFormData((prev: any) => ({ ...prev, [section]: updated }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate mandatory fields first (only if validation is enabled)
    if (validationEnabled) {
      const validationErrors = validateMandatoryFields();
      if (validationErrors.length > 0) {
        // Create a more user-friendly error message
        const errorCount = validationErrors.length;
        const errorMessage = errorCount === 1 
          ? `1 field is missing: ${validationErrors[0]}`
          : `${errorCount} fields are missing. Please fill in all required fields marked with (*).`;
        
        // Show detailed errors in console for debugging
        console.log('Validation Errors:', validationErrors);
        
        toast({ 
          title: "Validation Error", 
          description: errorMessage, 
          variant: "destructive",
          duration: 5000 // Show for 5 seconds
        });
        
        // Also show a more detailed alert for better visibility
        if (errorCount > 1) {
          const detailedMessage = `Missing ${errorCount} required fields:\n\n${validationErrors.slice(0, 10).join('\n')}${validationErrors.length > 10 ? `\n... and ${validationErrors.length - 10} more fields` : ''}`;
          alert(`Form Validation Failed!\n\n${detailedMessage}\n\nPlease fill in all required fields marked with (*) before submitting.`);
        }
        
        return;
      }
    }

    const payload = {
      ...formData,

      // Map frontend fields to backend expected fields
      // Personal Details
      title: formData.title || null,
      first_name: formData.firstName || null,
      middle_name: formData.middleName || null,
      last_name: formData.lastName || null,
      applicant_cnic: formData.applicant_cnic || formData.cnic || null,
      gender: formData.gender || null,
      marital_status: formData.maritalStatus || null,
      date_of_birth: formData.dateOfBirth || null,
      passport_no: formData.passportNo || null,
      ntn: formData.ntn || null,
      educational_qualification: formData.educationalQualification || null,
      mothers_maiden_name: formData.mothersMaidenName || null,
      father_or_husband_name: formData.fatherHusbandName || null,
      num_children: formData.numChildren || null,
      num_other_dependents: formData.numOtherDependents || null,
      dependents_specify: formData.dependentsSpecify || null,
      next_of_kin: formData.nextOfKin || null,
      next_of_kin_relation: formData.nextOfKinRelation || null,
      next_of_kin_cnic: formData.nextOfKinCnic || null,
      next_of_kin_contact: formData.nextOfKinContact || null,

      // Current Address
      curr_house_no: formData.currentHouseNo || null,
      curr_street: formData.currentStreet || null,
      curr_area: formData.currentArea || null,
      curr_landmark: formData.currentLandmark || null,
      curr_city: formData.currentCity || null,
      curr_country: formData.currentCountry || null,
      curr_postal_code: formData.currentPostalCode || null,
      curr_tel_residence: formData.currentTelephone || null,
      curr_mobile: formData.currentMobile || null,
      curr_email: formData.currentEmail || null,
      curr_years_address: formData.yearsAtAddress || null,
      curr_years_city: formData.yearsInCity || null,
      residential_status: formData.residentialStatus || null,
      monthly_rent: formData.monthlyRent || null,

      // Permanent Address
      perm_house_no: formData.permanentHouseNo || null,
      perm_street: formData.permanentStreet || null,
      perm_area: formData.permanentArea || null,
      perm_city: formData.permanentCity || null,
      perm_country: formData.permanentCountry || null,
      perm_postal_code: formData.permanentPostalCode || null,
      perm_tel_residence: formData.permanentTelephone || null,

      // Employment Details
      employment_type: formData.employmentType || null,
      employment_status: formData.employmentStatus || null,
      profession: formData.profession || null,
      business_type: formData.businessType || null,
      business_type_other: formData.businessTypeOther || null,
      years_in_business: formData.yearsInBusiness || null,
      shareholding_percent: (formData.sharePct !== undefined && formData.sharePct !== null) ? Number(formData.sharePct) : 0,
      business_address: formData.employerAddress || null,
      business_street: formData.businessStreet || formData.street || null,
      business_area: formData.businessArea || null,
      business_city: formData.employerCity || null,
      business_country: formData.employerCountry || null,
      business_postal_code: formData.businessPostalCode || formData.postalCode || null,
      business_tel: formData.employerPhone || null,
      business_landmark: formData.nearestLandmark || null,
      department: formData.department || null,
      grade_level: formData.gradeLevel || null,
      prev_employer_name: formData.prevEmployerName || null,
      prev_designation: formData.prevDesignation || null,
      prev_experience_years: formData.prevExperience || null,
      prev_employer_tel: formData.prevPhone || null,

      // Co-borrower Details
      co_borrower_case: formData.coBorrowerCase || null,
      co_borrower_name: formData.coBorrowerName || null,
      co_borrower_relationship: formData.coBorrowerRelationship || null,
      co_borrower_cnic: formData.coBorrowerCnic || null,

      // Signature Dates
      applicant_signature_date: formData.applicantSignatureDate || null,
      co_borrower_signature_date: formData.coBorrowerSignatureDate || null,

      // Convert application_source array to JSON string
      application_source: JSON.stringify(formData.application_source || []),

      // Add missing required fields with defaults
      city: formData.city || 'Test City',
      product_type: formData.productType || 'Auto Loan',
      payment_mode: formData.paymentMode || 'Monthly',
      pricing_plan: formData.pricingPlan || 'Standard',
      fixed_rate: formData.fixedRate || 0,
      kibor_rate: formData.kiborRate || 0,
      margin: formData.margin || 0,
      vehicle_manufacturer: formData.vehicleManufacturer || 'Test Manufacturer',
      vehicle_model: formData.vehicleModel || 'Test Model',
      year_of_manufacture: formData.yearOfManufacture || 2025,
      vehicle_class_engine_size: formData.vehicleClassEngineSize || '1000cc',
      price_value: formData.priceValue || 1000000,
      down_payment_percent: formData.downPaymentPercent || 20,
      down_payment_amount: formData.downPaymentAmount || 200000,
      desired_loan_amount: formData.desiredLoanAmount || 800000,
      installment_period: formData.installmentPeriod || 60,
      insurance_company_name: formData.insuranceCompanyName || 'Test Insurance',
      insurance_rate: formData.insuranceRate || 0,
      dealer_name: formData.dealerName || 'Test Dealer',
      gross_monthly_salary: formData.grossMonthlySalary || 0,
      other_monthly_income: formData.otherMonthlyIncome || 0,
      total_gross_monthly_income: formData.totalGrossMonthlyIncome || 0,
      net_monthly_income: formData.netMonthlyIncome || 0,
      other_income_type: formData.otherIncomeType || '',
      other_income_specify: formData.otherIncomeSpecify || '',
      spouse_employed: formData.spouseEmployed || 'No',
      spousal_income: formData.spousalIncome || 0,
      spouse_income_source: formData.spouseIncomeSource || '',
      statement_to_be_sent: formData.statementToBeSent || 'Home',
      repayment_account_type: formData.repaymentAccountType || 'Current',
      repayment_currency_type: formData.repaymentCurrencyType || 'PKR',
      channel_code: formData.channelCode || 'BRANCH',
      program_code: formData.programCode || 'AUTO',
      branch_code: formData.branchCode || '001',
      so_employee_no: formData.soEmployeeNo || 'EMP001',
      so_employee_name: formData.soEmployeeName || 'Test Employee',
      pb_bm_employee_no: formData.pbBmEmployeeNo || 'BM001',
      pb_bm_employee_name: formData.pbBmEmployeeName || 'Test BM',
      sm_employee_no: formData.smEmployeeNo || 'SM001',
      sm_employee_name: formData.smEmployeeName || 'Test SM',
      dealership_name: formData.dealershipName || 'Test Dealership',
      branch_name_code: formData.branchNameCode || '001',
      financing_option: formData.financingOption || 'Auto Financing',

      // References - ensure proper structure
      references: formData.references?.map((ref: any, index: number) => ({
        reference_no: index + 1,
        name: ref.name || '',
        cnic: ref.cnic || '',
        relationship: ref.relationship || '',
        relationship_other: ref.relationshipOther || '',
        house_no: ref.houseNo || '',
        street: ref.street || '',
        area: ref.area || '',
        city: ref.city || '',
        country: ref.country || 'Pakistan',
        postal_code: ref.postalCode || '',
        tel_residence: ref.telResidence || '',
        tel_office: ref.telOffice || '',
        mobile_no: ref.mobileNo || '',
        email: ref.email || ''
      })) || [],

      // Exposure/References mappings
      credit_cards_clean: formData.credit_cards_clean?.map((item: any) => ({
        bank_name: item.name || '',
        approved_limit: item.limit || 0,
      })) || [],
      credit_cards_secured: formData.credit_cards_secured?.map((item: any) => ({
        bank_name: item.name || '',
        approved_limit: item.limit || 0,
      })) || [],
      personal_loans_clean: formData.personal_loans_clean?.map((item: any) => ({
        bank_name: item.name || '',
        approved_limit: item.limit || 0,
        outstanding_amount: item.outstanding || 0,
      })) || [],
      personal_loans_secured: formData.personal_loans_secured?.map((item: any) => ({
        bank_name: item.name || '',
        approved_limit: item.limit || 0,
        outstanding_amount: item.outstanding || 0,
      })) || [],
      other_facilities: formData.other_facilities?.map((item: any) => ({
        bank_name: item.name || '',
        approved_limit: item.limit || 0,
        nature: item.nature || '',
        current_outstanding: item.outstanding || 0,
      })) || [],
      applied_limits: formData.applied_limits?.map((item: any) => ({
        bank_name: item.name || '',
        facility_under_process: item.facility || '',
        nature_of_facility: item.nature || '',
      })) || [],
    };

  console.log("✅ Final Payload:", payload);

  try {
    const res = await fetch(`${getBaseUrl()}/api/autoloan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    console.log("✅ Submission Result:", result);
    
    if (!res.ok) {
      console.error("❌ Backend Error:", result);
      const errorMessage = result.error || result.errorDetails || 'Unknown error';
      alert(`Submission failed: ${errorMessage}`);
    } else {
      alert("Application submitted successfully! Redirecting to document upload...");
      
      // Store minimal info for documents page to fetch proper customer data
      const submissionInfo = {
        applicationId: result.application_id,
        applicationType: 'AutoLoan'
      };
      
      // Store in localStorage for documents page to pick up
      localStorage.setItem('lastApplicationSubmission', JSON.stringify(submissionInfo));
      
      // Redirect to documents page
      router.push('/dashboard/documents');
    }
  } catch (err) {
    console.error("❌ Submission Error:", err);
    alert("Submission failed. Please try again.");
  }
};

  // Autofill function with DBR scenarios for Auto Loan
  const handleAutofill = (scenario: 'excellent' | 'good' | 'bad') => {
    let incomeData, financingData, scenarioDescription;

    if (scenario === 'excellent') {
      // Excellent DBR (<35%): High income, lower loan amount
      // Net Income: 200,000, Monthly Installment: ~35,000, DBR: ~27.5%
      incomeData = {
        grossMonthlySalary: '250000',
        netMonthlyIncome: '200000',
        otherIncome: '',
        totalMonthlyIncome: '200000'
      };
      financingData = {
        vehiclePrice: '3000000',
        downPayment: '1000000',
        financingAmount: '2000000',
        tenure: '60', // 5 years
        monthlyInstallment: '35000'
      };
      scenarioDescription = 'Excellent DBR (<35%) - High income, affordable loan';
    } else if (scenario === 'good') {
      // Good DBR (35-40%): Medium income, moderate loan
      // Net Income: 150,000, Monthly Installment: ~27,000, DBR: ~38%
      incomeData = {
        grossMonthlySalary: '180000',
        netMonthlyIncome: '150000',
        otherIncome: '',
        totalMonthlyIncome: '150000'
      };
      financingData = {
        vehiclePrice: '2500000',
        downPayment: '750000',
        financingAmount: '1750000',
        tenure: '60',
        monthlyInstallment: '27000'
      };
      scenarioDescription = 'Good DBR (35-40%) - Moderate income and loan';
    } else {
      // Bad DBR (>40%): Lower income, higher loan
      // Net Income: 120,000, Monthly Installment: ~25,000, DBR: ~62.5%
      incomeData = {
        grossMonthlySalary: '150000',
        netMonthlyIncome: '120000',
        otherIncome: '',
        totalMonthlyIncome: '120000'
      };
      financingData = {
        vehiclePrice: '2000000',
        downPayment: '500000',
        financingAmount: '1500000',
        tenure: '60',
        monthlyInstallment: '25000'
      };
      scenarioDescription = 'Bad DBR (>40%) - Lower income, high loan amount';
    }

    const testData = {
      // Product Program
      productType: 'New Car',
      scheme: 'Standard Auto Loan',
      
      // Vehicle Details
      vehicleMake: 'Honda',
      vehicleModel: 'Civic',
      vehicleYear: '2024',
      engineCapacity: '1800',
      registrationCity: 'Karachi',
      
      // Insurance Details
      insuranceCompany: 'Insurance Company A',
      insurancePremium: '50000',
      insuranceType: 'Comprehensive',
      
      // Dealer Details
      dealerName: 'Auto Dealer XYZ',
      dealerCity: 'Karachi',
      dealerContact: '021-1234567',
      
      // Personal Details
      title: 'Mr.',
      firstName: 'Ahmed',
      lastName: 'Khan',
      middleName: '',
      cnic: '4210112345671',
      applicant_cnic: '4210112345671',
      dateOfBirth: '1988-05-15',
      gender: 'Male',
      maritalStatus: 'Married',
      fatherName: 'Khan Sahib',
      mothersMaidenName: 'Fatima',
      mobileNumber: '0300-1234567',
      email: 'ahmed.khan@example.com',
      
      // Current Address
      currentAddress: 'House 123, Street 5, DHA Phase 6',
      currentCity: 'Karachi',
      currentProvince: 'Sindh',
      currentPostalCode: '75500',
      residentialStatus: 'Owned',
      yearsAtAddress: '5',
      
      // Permanent Address
      permanentAddress: 'House 123, Street 5, DHA Phase 6',
      permanentCity: 'Karachi',
      permanentProvince: 'Sindh',
      permanentPostalCode: '75500',
      
      // Occupation
      employmentStatus: 'Salaried',
      companyName: 'Tech Corporation Ltd',
      designation: 'Senior Manager',
      department: 'IT',
      yearsWithCurrentEmployer: '5',
      officeAddress: 'Corporate Tower, Business District',
      officeCity: 'Lahore',
      officePhone: '042-1234567',
      
      // Income Details
      ...incomeData,
      
      // Banking Details
      bankName: 'Partner Bank',
      accountNumber: '1234567890',
      branchCode: 'KHI001',
      
      // Financing
      ...financingData,
      
      // Signatures
      applicantSignature: 'Ahmed Khan',
      signatureDate: new Date().toISOString().split('T')[0],
      
      // Bank Use Only
      applicationSource: 'Branch',
      receivedBy: 'PB Officer',
      branchCodeOffice: 'KHI001',
      
      // References
    references: [
      {
        name: 'Bilal Ahmed',
        relationship: 'Friend',
        phone: '0300-9876543',
        address: 'Karachi'
      },
      {
        name: 'Sara Ali',
        relationship: 'Colleague',
        phone: '0321-1234567',
        address: 'Karachi'
      }
    ],
    
    // Existing Obligations (DBR calculation fields)
    credit_cards_clean: scenario === 'excellent' 
      ? [{ name: 'Bank A', limit: '100000', outstanding: '10000' }]
      : scenario === 'good'
      ? [
          { name: 'Bank A', limit: '150000', outstanding: '50000' },
          { name: 'Bank B', limit: '100000', outstanding: '30000' }
        ]
      : [
          { name: 'Bank A', limit: '200000', outstanding: '180000' },
          { name: 'Bank B', limit: '150000', outstanding: '140000' },
          { name: 'Bank C', limit: '100000', outstanding: '95000' }
        ],
    
    credit_cards_secured: [],
    
    personal_loans_clean: scenario === 'excellent'
      ? []
      : scenario === 'good'
      ? [{ name: 'Bank D', limit: '200000', outstanding: '180000' }]
      : [
          { name: 'Bank D', limit: '300000', outstanding: '280000' },
          { name: 'Bank E', limit: '150000', outstanding: '140000' }
        ],
    
    personal_loans_secured: [],
    
    other_facilities: scenario === 'bad'
      ? [{ name: 'Bank F', limit: '100000', outstanding: '90000', nature: 'Personal Loan' }]
      : [],
    
    applied_limits: []
  };

    setFormData((prev: any) => ({
      ...prev,
      ...testData
    }));
    
    toast({
      title: "Form Autofilled",
      description: scenarioDescription,
      variant: "default"
    });
  };

  const handleScrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const scrollToSection = (key: keyof typeof refs) =>
    refs[key]?.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  if (!customerData) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Card className="p-6 text-center">
          <div className="text-gray-600 mb-4">No customer data found. Please enter CNIC.</div>
          <Button onClick={() => router.push("/dashboard/applicant")}>Back</Button>
        </Card>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <h2 className="text-3xl text-center font-bold text-primary">Auto Loan Application</h2>

      {/* Mandatory Fields Note */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="text-sm text-blue-800">
          <strong>Note:</strong> Fields marked with an asterisk (*) are mandatory and must be filled before submission.
        </div>
      </div>

      {/* Test Options Panel */}
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">Testing Options</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTestOptions(!showTestOptions)}
            className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
          >
            {showTestOptions ? 'Hide' : 'Show'} Options
          </Button>
        </div>
        
        {showTestOptions && (
          <div className="mt-4 space-y-4">
            {/* Validation Toggle */}
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-yellow-200">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Field Validation</div>
                  <div className="text-xs text-gray-600">
                    {validationEnabled ? 'Validation is enabled' : 'Validation is disabled'}
                  </div>
                </div>
              </div>
              <Switch
                checked={validationEnabled}
                onCheckedChange={setValidationEnabled}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>

            {/* Autofill Options */}
            <div className="p-3 bg-white rounded-lg border border-yellow-200">
              <div className="flex items-center gap-3 mb-3">
                <Zap className="w-4 h-4 text-green-600" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Autofill Form with DBR Scenarios</div>
                  <div className="text-xs text-gray-600">Select a scenario to populate form with test data</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAutofill('excellent')}
                  className="flex-1 text-green-700 border-green-300 hover:bg-green-50"
                >
                  Excellent DBR
                  <span className="ml-1 text-xs">(&lt;35%)</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAutofill('good')}
                  className="flex-1 text-blue-700 border-blue-300 hover:bg-blue-50"
                >
                  Good DBR
                  <span className="ml-1 text-xs">(35-40%)</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAutofill('bad')}
                  className="flex-1 text-red-700 border-red-300 hover:bg-red-50"
                >
                  Bad DBR
                  <span className="ml-1 text-xs">(&gt;40%)</span>
                </Button>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="text-xs text-gray-600 bg-white p-2 rounded border border-yellow-200">
              <strong>Current Status:</strong> 
              {validationEnabled ? (
                validationStatus.isValid ? (
                  <span className="text-green-600"> ✅ All required fields are filled - Form is ready to submit.</span>
                ) : (
                  <span className="text-red-600"> ❌ {validationStatus.missingFields.length} required field(s) missing - Cannot submit form.</span>
                )
              ) : (
                <span className="text-yellow-600"> ⚠️ Validation disabled - Form will submit without checking mandatory fields.</span>
              )}
            </div>

            {/* Missing Fields List (only show when validation is enabled and there are errors) */}
            {validationEnabled && !validationStatus.isValid && validationStatus.missingFields.length > 0 && (
              <div className="text-xs bg-red-50 border border-red-200 p-3 rounded">
                <div className="font-medium text-red-800 mb-2">
                  Missing Required Fields ({validationStatus.missingFields.length}):
                </div>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {validationStatus.missingFields.slice(0, 8).map((field, index) => (
                    <div key={index} className="text-red-700">• {field}</div>
                  ))}
                  {validationStatus.missingFields.length > 8 && (
                    <div className="text-red-600 italic">
                      ... and {validationStatus.missingFields.length - 8} more fields
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Card className="bg-gradient-to-r from-green-50 to-green-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {customerData.isETB ? (
                <User className="w-8 h-8 text-green-600" />
              ) : (
                <CreditCard className="w-8 h-8 text-blue-600" />
              )}
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Auto Loan Application</h2>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-lg font-semibold text-gray-700">
                    Customer ID: {customerData.customerId}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    customerData.isETB ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                  }`}>
                    {customerData.isETB ? "Existing Customer (ETB)" : "New Customer (NTB)"}
                  </span>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/applicant")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="border mt-8 rounded-lg px-8 border-gray-200 mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mt-10 mb-2">Form Sections</h3>
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(refs).map(([key, _]) => (
            <button
              key={key}
              type="button"
              onClick={() => scrollToSection(key as keyof typeof refs)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl shadow text-sm font-semibold border transition-all ${
                currentSection === key
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-gray-50 text-gray-800 border-gray-200"
              }`}
            >
              {key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            </button>
          ))}
        </div>
        

      </div>

      <div className="space-y-10">
        <div ref={refs.product}>
          <ProductProgramForm 
            formData={formData} 
            handleInputChange={handleInputChange} 
          />
        </div>
        <div ref={refs.vehicle}>
          <VehicleDetailsForm 
            formData={formData} 
            handleInputChange={handleInputChange} 
          />
        </div>
        <div ref={refs.insurance}>
          <InsuranceDetailsForm 
            formData={formData} 
            handleInputChange={handleInputChange} 
          />
        </div>
        <div ref={refs.dealer}>
          <DealerDetailsForm 
            formData={formData} 
            handleInputChange={handleInputChange} 
          />
        </div>
        <div ref={refs.personal}>
          <PersonalDetailsForm formData={formData} handleInputChange={handleInputChange} />
        </div>
        <div ref={refs.occupation}>
          <OccupationForm 
            formData={formData} 
            handleInputChange={handleInputChange} 
          />
        </div>
        <div ref={refs.income}>
          <IncomeDetailsForm 
            formData={formData} 
            handleInputChange={handleInputChange as any} 
          />
        </div>
        <div ref={refs.banking}>
          <BankingDetailsForm 
            formData={formData} 
            handleInputChange={handleInputChange} 
            setFormData={setFormData}
          />
        </div>
        <div ref={refs.exposure}>
          <ExposureUndertakingForm 
            formData={formData} 
            setFormData={setFormData}
          />
        </div>
        <div ref={refs.references}>
          <ReferencesForm 
            formData={formData} 
            handleReferenceChange={handleReferenceChange} 
          />
        </div>
        <div ref={refs.financing}>
          <FinancingOptionForm 
            formData={formData} 
            handleInputChange={handleInputChange} 
          />
        </div>
        <div ref={refs.signatures}>
          <SignaturesForm 
            formData={formData} 
            handleInputChange={handleInputChange} 
          />
        </div>
        <div ref={refs.bankUse}>
          <BankUseOnlyForm 
            formData={formData} 
            handleInputChange={handleInputChange} 
            setFormData={setFormData} 
          />
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button
          type="submit"
          disabled={validationEnabled && !validationStatus.isValid}
          className={`rounded-xl font-semibold px-8 py-3 shadow transition ${
            validationEnabled && !validationStatus.isValid
              ? 'bg-red-500 hover:bg-red-600 text-white cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {validationEnabled && !validationStatus.isValid 
            ? `Upload Documents (${validationStatus.missingFields.length} fields missing)` 
            : 'Upload Documents'}
        </button>
      </div>

      {showUpArrow && (
        <button
          onClick={handleScrollTop}
          aria-label="Scroll to top"
          className="fixed bottom-8 right-4 z-50 bg-blue-600 hover:bg-blue-800 text-white rounded-full p-3 shadow-xl transition-all"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}
    </form>
  );
};

export default AutoLoanPage;

