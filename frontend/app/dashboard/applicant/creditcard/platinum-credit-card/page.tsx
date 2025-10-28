"use client";

// app/dashboard/applicant/platinum-creditcard/page.tsx

import { useEffect, useRef, useState } from "react";
import { PlatinumPersonalInfoForm } from "@/components/forms/Platinum/PlatinumPersonalInfoForm";
import { PlatinumNextOfKinForm } from "@/components/forms/Platinum/PlatinumNextOfKinForm";
import { PlatinumEmploymentDetailsForm } from "@/components/forms/Platinum/PlatinumEmploymentDetailsForm";
import { PlatinumIncomeDetailsForm } from "@/components/forms/Platinum/PlatinumIncomeDetailsForm";
import { PlatinumBankingDetailsForm } from "@/components/forms/Platinum/PlatinumBankingDetailsForm";
import { PlatinumAutoDebitForm } from "@/components/forms/Platinum/PlatinumAutoDebitForm";
import { PlatinumReferenceForm } from "@/components/forms/Platinum/PlatinumReferenceForm";
import { PlatinumDeclarationForm } from "@/components/forms/Platinum/PlatinumDeclarationForm";
import { PlatinumDeclarationBankSectionForm } from "@/components/forms/Platinum/PlatinumDeclarationBankSectionForm";
import { PlatinumCreditGuardianSmsAlertForm } from "@/components/forms/Platinum/PlatinumCreditGuardianSmsAlertForm";
import { PlatinumSupplementaryCardForm } from "@/components/forms/Platinum/PlatinumSupplementaryCardForm";
import { PlatinumLienMarkedForm } from "@/components/forms/Platinum/PlatinumLienMarkedForm";
import { PlatinumBankUseOnlyForm } from "@/components/forms/Platinum/PlatinumBankUseOnlyForm";
import { Card, CardContent } from "@/components/ui/card";
import { useCustomer } from "@/contexts/CustomerContext";
import { ArrowLeft, ChevronUp, CreditCard, User, Settings, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
// Add import for the PlatinumCustomerData type
import { PlatinumCustomerData } from "@/types/platinum-types";

type SectionKey =
  | "personal"
  | "kin"
  | "employment"
  | "income"
  | "banking"
  | "autoDebit"
  | "reference"
  | "declaration"
  | "declarationBank"
  | "guardianSms"
  | "supplementary"
  | "lien"
  | "bankUse";

// Expand the CustomerData type definition to include all needed fields
type FullCustomerData = {
  personalDetails?: { 
    fullName?: string; 
    firstName?: string;
    middleName?: string;
    lastName?: string;
    cnic?: string; 
    dateOfBirth?: string;
    title?: string;
    fatherName?: string;
    motherName?: string;
    gender?: string;
    maritalStatus?: string;
    numberOfDependents?: string | number;
    education?: string;
    mobileNumber?: string;
    ntn?: string;
    email?: string;
    passportNumber?: string;
  };
  nextOfKin?: { 
    fullName?: string; 
    name?: string;
    relationship?: string;
    contactNumber?: string;
    telephone?: string;
    alternateNumber?: string;
  };
  employmentDetails?: { 
    organization?: string;
    companyName?: string;
    employmentStatus?: string;
    designation?: string;
    department?: string;
    grade?: string;
    currentExperience?: string;
    employeeNumber?: string;
    businessType?: string;
    business?: string;
    officeAddress?: {
      houseNo?: string;
      telephone1?: string;
      fax?: string;
    };
    officePhone?: string;
    officeFax?: string;
  };
  previousEmployment?: {
    companyName?: string;
    designation?: string;
    experienceYears?: string;
    telephone?: string;
  };
  incomeDetails?: { 
    monthlyIncome?: number;
    grossMonthlySalary?: string | number;
    grossMonthlyIncome?: string | number;
    otherMonthlyIncome?: string | number;
    netMonthlyIncome?: string | number;
    totalIncome?: string | number;
    otherIncomeSource?: string;
    spouseEmployed?: string | boolean;
    spouseIncome?: string | number;
    spouseIncomeSource?: string;
  };
  bankingDetails?: { 
    accountNumber?: string;
    isExistingCustomer?: string | boolean;
    accountNumber?: string;
    bankName?: string;
    branchName?: string;
    accountType?: string;
    accountOpeningDate?: string;
    iban?: string;
    paymentOption?: string;
    cardDeliveryPreference?: string;
    statementDeliveryMethod?: string;
  };
  autoDebit?: { 
    accountNumber?: string;
    paymentOption?: string;
    signature?: string;
    date?: string;
  };
  references?: Array<{
    id?: number;
    name?: string;
    relationship?: string;
    cnic?: string;
    address?: string;
    mobile?: string;
    telephone?: string;
    telephoneResidence?: string;
    ntn?: string;
    houseNo?: string;
    street?: string;
    city?: string;
  }>;
  declaration?: { 
    agreed?: boolean;
    signature?: string;
    date?: string;
    contactConfirmation?: boolean;
  };
  declarationBank?: { 
    verified?: boolean;
    creditGuardian?: boolean;
    staffDeclarationFile?: string;
  };
  creditGuardian?: { 
    enabled?: boolean;
    smsAlert?: boolean;
    creditGuardian?: boolean;
    signature?: string;
    date?: string;
  };
  supplementaryCard?: { 
    fullName?: string;
    title?: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    nameOnCard?: string;
    fatherHusbandName?: string;
    creditLimitPercent?: string | number;
    creditLimitAmount?: string | number;
    availability?: string;
    relationshipToPrincipal?: string;
    dob?: string;
    gender?: string;
    nicPassport?: string;
    oldNicNumber?: string;
    motherMaidenName?: string;
    supplementarySignature?: string;
    basicCardholderSignature?: string;
    dateSigned?: string;
  };
  supplementaryCards?: Array<any>;
  lienMarked?: { 
    marked?: boolean;
    collateralType?: string;
    bank?: string;
    branch?: string;
    accountNo?: string;
    accountType?: string;
    lienAmount?: string | number;
    currency?: string;
    accountTitle?: string;
    maturityDate?: string;
  };
  bankUseOnly?: { 
    verified?: boolean;
    applicationReferenceNumber?: string;
    channelCode?: string;
    programCode?: string;
    branchCode?: string;
    soEmployeeNo?: string;
    pbEmployeeNo?: string;
    smEmployeeNo?: string;
    salesOfficerName?: string;
    branchName?: string;
    regionName?: string;
    contactConfirmation?: string;
    bmRecommendation?: string;
    bmSignature?: string;
    applicationStatus?: string;
    reasonCode?: string;
    analystName?: string;
    analystSignature?: string;
  };
  platinumCard?: {
    nameOnCard?: string;
    cnicIssuanceDate?: string;
    cnicExpiryDate?: string;
    oldNic?: string;
    vehicleMake?: string;
    vehicleModel?: string;
    vehicleYear?: string | number;
    vehicleRegistrationNo?: string;
    ownership?: string;
    leased?: string;
    typeOfAccommodation?: string;
    cardDestination?: string;
    statementDelivery?: string;
    estatementEmail?: string;
  };
  isETB?: boolean;
  cifData?: { customerId?: string };
  customerId?: string;
  cnic?: string;
  otherBanks?: Array<{
    bankName?: string;
    branch?: string;
    accountNumber?: string;
  }>;
  otherCreditCards?: Array<{
    bankName?: string;
    cardType?: string;
    cardNumber?: string;
    creditLimit?: string | number;
  }>;
  loanFacilities?: Array<{
    details?: string;
    loanDetails?: string;
  }>;
  addressDetails?: {
    currentAddress?: {
      houseNo?: string;
      street?: string;
      tehsil?: string;
      nearestLandmark?: string;
      city?: string;
      postalCode?: string;
      telephone?: string;
      residentialStatus?: string;
      yearsAtAddress?: string;
    };
    permanentAddress?: {
      fullAddress?: string;
      street?: string;
      tehsil?: string;
      nearestLandmark?: string;
      city?: string;
      postalCode?: string;
    };
  };
};

const FORM_SECTIONS: { key: SectionKey; label: string }[] = [
  { key: "personal", label: "Personal Info" },
  { key: "kin", label: "Next of Kin" },
  { key: "employment", label: "Employment" },
  { key: "income", label: "Income" },
  { key: "banking", label: "Banking" },
  { key: "autoDebit", label: "Auto Debit" },
  { key: "reference", label: "Reference" },
  { key: "declaration", label: "Declaration" },
  { key: "declarationBank", label: "Bank Declaration" },
  { key: "guardianSms", label: "Guardian/SMS Alert" },
  { key: "supplementary", label: "Supplementary Card" },
  { key: "lien", label: "Lien Marked" },
  { key: "bankUse", label: "Bank Use Only" },
];

// Instead of importing getBaseUrl, remove the import
// import { getBaseUrl } from "@/lib/api";

// Fix the sections at the top of the file - add proper typing for CustomerData that matches the context
// Define a hook that returns whether each section is filled
const useSectionFilled = (data: any): Record<SectionKey, boolean> => ({
  personal: !!(data?.personalDetails?.fullName),
  kin: !!(data?.nextOfKin?.fullName || data?.nextOfKin?.name),
  employment: !!(data?.employmentDetails?.companyName || data?.employmentDetails?.organization),
  income: !!(data?.incomeDetails?.grossMonthlySalary || data?.incomeDetails?.monthlyIncome),
  banking: !!(data?.bankingDetails?.accountNumber),
  autoDebit: !!(data?.autoDebit?.paymentOption),
  reference: Array.isArray(data?.references) && data.references.length > 0,
  declaration: !!(data?.declaration?.agreed),
  declarationBank: !!(data?.declarationBank?.verified),
  guardianSms: !!(data?.creditGuardian?.smsAlert !== undefined),
  supplementary: !!(data?.supplementaryCard?.firstName),
  lien: !!(data?.lienMarked?.collateralType),
  bankUse: !!(data?.bankUseOnly?.applicationReferenceNumber),
});

// Add helper functions for data transformation
const toValidDate = (dateString?: string) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0]; // YYYY-MM-DD
};

const toBoolean = (value?: string | boolean) => {
  if (value === 'Yes' || value === 'true' || value === true) return true;
  if (value === 'No' || value === 'false' || value === false) return false;
  return false;
};

const toNumber = (value?: string | number) => {
  if (value === undefined || value === null || value === '') return null;
  const num = Number(value);
  return isNaN(num) ? null : num;
};

// Add function to verify required fields are present
const verifyRequiredFields = (data: any) => {
  // List of required fields based on the database schema
  const requiredFields = [
    'customer_id',
    'title',
    'first_name',
    'last_name',
    'name_on_card',
    'nic',
    'gender',
    'marital_status'
  ];
  
  const missingFields = requiredFields.filter(field => !data[field]);
  
  if (missingFields.length > 0) {
    console.warn('Missing required fields:', missingFields);
    
    // Add default values for missing fields
    missingFields.forEach(field => {
      switch (field) {
        case 'customer_id':
          data[field] = `PLATINUM-${Date.now()}`;
          break;
        case 'title':
          data[field] = 'Mr';
          break;
        case 'first_name':
          data[field] = 'Unknown';
          break;
        case 'last_name':
          data[field] = 'Unknown';
          break;
        case 'name_on_card':
          data[field] = data.first_name || 'Unknown';
          break;
        case 'nic':
          data[field] = data.customer_id || `ID-${Date.now()}`;
          break;
        case 'gender':
          data[field] = 'Male';
          break;
        case 'marital_status':
          data[field] = 'Single';
          break;
        default:
          data[field] = '';
      }
    });

    console.log('Fixed missing fields with defaults:', 
      missingFields.reduce((obj, field) => ({...obj, [field]: data[field]}), {})
    );
  }
  
  return data;
};

export default function PlatinumCreditCardPage() {
  const { customerData, updateCustomerData } = useCustomer();
  const router = useRouter();
  const { toast } = useToast();
  
  // Create refs for each section
  const personalRef = useRef<HTMLDivElement>(null);
  const kinRef = useRef<HTMLDivElement>(null);
  const employmentRef = useRef<HTMLDivElement>(null);
  const incomeRef = useRef<HTMLDivElement>(null);
  const bankingRef = useRef<HTMLDivElement>(null);
  const autoDebitRef = useRef<HTMLDivElement>(null);
  const referenceRef = useRef<HTMLDivElement>(null);
  const declarationRef = useRef<HTMLDivElement>(null);
  const declarationBankRef = useRef<HTMLDivElement>(null);
  const guardianSmsRef = useRef<HTMLDivElement>(null);
  const supplementaryRef = useRef<HTMLDivElement>(null);
  const lienRef = useRef<HTMLDivElement>(null);
  const bankUseRef = useRef<HTMLDivElement>(null);
  
  // Map section keys to refs
  const refs: Record<SectionKey, React.RefObject<HTMLDivElement | null>> = {
    personal: personalRef,
    kin: kinRef,
    employment: employmentRef,
    income: incomeRef,
    banking: bankingRef,
    autoDebit: autoDebitRef,
    reference: referenceRef,
    declaration: declarationRef,
    declarationBank: declarationBankRef,
    guardianSms: guardianSmsRef,
    supplementary: supplementaryRef,
    lien: lienRef,
    bankUse: bankUseRef,
  };
  
  // Define state variables
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSection, setCurrentSection] = useState<SectionKey | "">("");
  const sectionFilled = useSectionFilled(customerData || {});
  const [validationEnabled, setValidationEnabled] = useState(true);
  const [showTestOptions, setShowTestOptions] = useState(false);
  const [validationStatus, setValidationStatus] = useState<{isValid: boolean; missingFields: string[]}>({isValid: true, missingFields: []});

  // Add getBaseUrl function above if it doesn't exist before
  const getBaseUrl = (): string => {
    // Use environment variable in production
    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL;
    }
    // Default to localhost:5000 in development
    return 'http://localhost:5000';
  };

  // Helper functions for data conversion
  const toNumber = (value: any): number => {
    if (value === undefined || value === null || value === '') return 0;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  const toBoolean = (value: any): boolean => {
    if (typeof value === 'boolean') return value;
    if (value === 'Yes' || value === 'yes' || value === 'true' || value === '1') return true;
    return false;
  };

  const toValidDate = (date: any): string | null => {
    if (!date) return null;
    try {
      return new Date(date).toISOString().split('T')[0];
    } catch (e) {
      return null;
    }
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
    
    // Personal Details validation
    if (!customerData?.personalDetails?.firstName) {
      errors.push("First Name is required");
    }
    if (!customerData?.personalDetails?.lastName) {
      errors.push("Last Name is required");
    }
    if (!customerData?.personalDetails?.cnic) {
      errors.push("CNIC is required");
    }
    if (!customerData?.personalDetails?.dateOfBirth) {
      errors.push("Date of Birth is required");
    }
    if (!customerData?.personalDetails?.mobileNumber) {
      errors.push("Mobile Number is required");
    }

    // Next of Kin validation
    if (!customerData?.nextOfKin?.fullName) {
      errors.push("Next of Kin Name is required");
    }
    if (!customerData?.nextOfKin?.relationship) {
      errors.push("Next of Kin Relationship is required");
    }

    // Employment validation
    if (!customerData?.employmentDetails?.employmentStatus) {
      errors.push("Employment Status is required");
    }
    if (!customerData?.employmentDetails?.companyName) {
      errors.push("Company Name is required");
    }
    if (!customerData?.employmentDetails?.designation) {
      errors.push("Designation is required");
    }

    // Income validation
    if (!customerData?.incomeDetails?.grossMonthlySalary) {
      errors.push("Gross Monthly Salary is required");
    }
    if (!customerData?.incomeDetails?.netMonthlyIncome) {
      errors.push("Net Monthly Income is required");
    }

    // Banking validation
    if (!customerData?.bankingDetails?.isExistingCustomer) {
      errors.push("Existing customer status is required");
    }
    if (customerData?.bankingDetails?.isExistingCustomer === 'Yes' && !customerData?.bankingDetails?.accountNumber) {
      errors.push("Account Number is required for existing customers");
    }

    // Declaration validation
    if (!customerData?.declaration?.termsAgreed) {
      errors.push("Terms Agreement is required");
    }
    if (!customerData?.declaration?.signature) {
      errors.push("Applicant Signature is required");
    }

    return errors;
  };

  // Check validation status when customerData changes
  useEffect(() => {
    checkValidationStatus();
  }, [customerData, validationEnabled]);

  // Update the handleSubmit function to add proper null checks
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
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
          
          setIsSubmitting(false);
          return;
        }
      }

      // Make sure customerData exists
      if (!customerData) {
        toast({
          title: "Error",
          description: "Customer data is missing. Please fill the form first.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      const fullCustomerData = customerData as unknown as PlatinumCustomerData;
      
      // Extract all sections of data with defaults
      const personalDetails = fullCustomerData?.personalDetails || {};
      const addressDetails = fullCustomerData?.addressDetails || {};
      const currentAddress = addressDetails?.currentAddress || {};
      const permanentAddress = addressDetails?.permanentAddress || {};
      const employmentDetails = fullCustomerData?.employmentDetails || {};
      const incomeDetails = fullCustomerData?.incomeDetails || {};
      const bankingDetails = fullCustomerData?.bankingDetails || {};
      const nextOfKin = fullCustomerData?.nextOfKin || {};
      const platinumDetails = fullCustomerData?.platinumCard || {};
      const autoDebit = fullCustomerData?.autoDebit || {};
      const declaration = fullCustomerData?.declaration || {};
      const creditGuardian = fullCustomerData?.creditGuardian || {};
      const lienMarked = fullCustomerData?.lienMarked || {};
      const previousEmployment = fullCustomerData?.previousEmployment || {};
      
      // Arrays
      const otherBanks = fullCustomerData?.otherBanks || [];
      const otherCreditCards = fullCustomerData?.otherCreditCards || [];
      const loanFacilities = fullCustomerData?.loanFacilities || [];
      const supplementaryCards = fullCustomerData?.supplementaryCards || [];
      const references: Array<{
        id?: number;
        name?: string;
        relationship?: string;
        cnic?: string;
        address?: string;
        mobile?: string;
        telephone?: string;
        telephoneResidence?: string;
        ntn?: string;
        houseNo?: string;
        street?: string;
        city?: string;
      }> = []; // Add references if available in your form
      
      // Prepare comprehensive data payload that matches EXACTLY with the database schema
      const formData = {
        // Basic customer info - matches database column names exactly
        customer_id: (fullCustomerData?.customerId || fullCustomerData?.cnic || `PLATINUM-${Date.now()}`),
        
        // Personal details
        title: personalDetails.title || "Mr",
        first_name: personalDetails.firstName || "",
        middle_name: personalDetails.middleName || "",
        last_name: personalDetails.lastName || "",
        name_on_card: platinumDetails.nameOnCard || personalDetails.fullName || `${personalDetails.firstName || ""} ${personalDetails.lastName || ""}`.trim(),
        nic: personalDetails.cnic || fullCustomerData.cnic || "",
        passport_number: personalDetails.passportNumber || "",
        cnic_issuance_date: toValidDate(platinumDetails.cnicIssuanceDate),
        cnic_expiry_date: toValidDate(platinumDetails.cnicExpiryDate),
        old_nic_number: platinumDetails.oldNic || "",
        father_husband_name: personalDetails.fatherName || "",
        date_of_birth: toValidDate(personalDetails.dateOfBirth),
        gender: personalDetails.gender || "Male",
        mother_maiden_name: personalDetails.motherName || "",
        marital_status: personalDetails.maritalStatus || "Single",
        dependents: toNumber(personalDetails.numberOfDependents),
        education: personalDetails.education || "",
        
        // Current Address
        curr_house: currentAddress.houseNo || "",
        curr_street: currentAddress.street || "",
        curr_tehsil: currentAddress.tehsil || "",
        curr_landmark: currentAddress.nearestLandmark || "",
        curr_city: currentAddress.city || "",
        curr_postal_code: currentAddress.postalCode || "",
        residential_phone: currentAddress.telephone || "",
        mobile: personalDetails.mobileNumber || "",
        ntn: personalDetails.ntn || "",
        type_of_accommodation: platinumDetails.typeOfAccommodation || "",
        nature_of_residence: currentAddress.residentialStatus || "",
        residing_since: currentAddress.yearsAtAddress || "",
        email: personalDetails.email || "",
        
        // Permanent Address
        perm_address: permanentAddress.fullAddress || "",
        street: permanentAddress.street || "",
        district: permanentAddress.tehsil || "",
        nearest_landmark: permanentAddress.nearestLandmark || "",
        city: permanentAddress.city || "",
        postal_code: permanentAddress.postalCode || "",
        
        // Vehicle details
        vehicle_make: platinumDetails.vehicleMake || "",
        vehicle_model: platinumDetails.vehicleModel || "",
        vehicle_year: platinumDetails.vehicleYear || "",
        vehicle_registration_no: platinumDetails.vehicleRegistrationNo || "",
        ownership: platinumDetails.ownership || "",
        leased: platinumDetails.leased || "",
        
        // Next of kin
        next_of_kin_name: nextOfKin.fullName || nextOfKin.name || "",
        next_of_kin_relationship: nextOfKin.relationship || "",
        next_of_kin_tel1: nextOfKin.telephone || nextOfKin.contactNumber || "",
        next_of_kin_tel2: nextOfKin.alternateNumber || "",
        
        // Employment
        occupation: employmentDetails.occupation || employmentDetails.companyType || "Other",
        if_salaried: employmentDetails.employmentStatus === "Employed" ? "Yes" : "No",
        grade_rank: employmentDetails.grade || "",
        designation: employmentDetails.designation || "",
        department: employmentDetails.department || "",
        company_name: employmentDetails.companyName || employmentDetails.organization || "",
        employment_status: employmentDetails.employmentStatus || "",
        length_of_service: toNumber(employmentDetails.currentExperience),
        employee_id: employmentDetails.employeeNumber || "",
        business_type: employmentDetails.businessType || employmentDetails.business || "",
        business_nature: employmentDetails.businessNature || "",
        office_address: employmentDetails.officeAddress?.fullAddress || "",
        office_phones: employmentDetails.officePhone || "",
        office_fax: employmentDetails.officeFax || "",
        
        // Previous Employment
        prev_company_name: previousEmployment?.companyName || "",
        prev_designation: previousEmployment?.designation || "",
        prev_experience: previousEmployment?.experienceYears || previousEmployment?.duration || "",
        prev_company_phone: previousEmployment?.telephone || "",
        
        // Income
        gross_monthly_income: toNumber(incomeDetails.grossMonthlyIncome || incomeDetails.grossMonthlySalary || incomeDetails.monthlyIncome || 0),
        other_income: toNumber(incomeDetails.otherMonthlyIncome || 0),
        source_of_other_income: incomeDetails.otherIncomeSource || "",
        total_income: toNumber(incomeDetails.totalIncome || 0),
        spouse_employed: toBoolean(incomeDetails.spouseEmployed),
        spouse_income: toNumber(incomeDetails.spouseIncome || 0),
        spouse_income_source: incomeDetails.spouseIncomeSource || "",
        
        // Card Delivery
        card_destination: bankingDetails.cardDeliveryPreference || platinumDetails.cardDestination || "",
        statement_delivery: bankingDetails.statementDeliveryMethod || platinumDetails.statementDelivery || "",
        estatement_email: platinumDetails.estatementEmail || personalDetails.email || "",
        
        // Banking details
        is_existing_customer: toBoolean(bankingDetails.isExistingCustomer),
        account_number: bankingDetails.accountNumber || "",
        branch: bankingDetails.branchName || "",
        
        // Signature and Date
        applicant_signature: null, // Binary data needs to be handled differently
        applicant_signature_date: toValidDate(declaration.date),
        
        // Auto debit
        payment_option: autoDebit.paymentOption || "",
        
        // Bank use only fields - keep empty or default
        application_reference_number: fullCustomerData?.bankUseOnly?.applicationReferenceNumber || "",
        channel_code: fullCustomerData?.bankUseOnly?.channelCode || "",
        program_code: fullCustomerData?.bankUseOnly?.programCode || "",
        branch_code: fullCustomerData?.bankUseOnly?.branchCode || "",
        so_employee_no: fullCustomerData?.bankUseOnly?.soEmployeeNo || "",
        pb_bm_employee_no: fullCustomerData?.bankUseOnly?.pbEmployeeNo || "",
        sm_employee_no: fullCustomerData?.bankUseOnly?.smEmployeeNo || "",
        sales_officer_name: fullCustomerData?.bankUseOnly?.salesOfficerName || "",
        branch_name: fullCustomerData?.bankUseOnly?.branchName || "",
        region_name: fullCustomerData?.bankUseOnly?.regionName || "",
        
        // Declarations
        customer_contact_confirmation: toBoolean(fullCustomerData?.bankUseOnly?.contactConfirmation),
        branch_manager_recommendation: fullCustomerData?.bankUseOnly?.bmRecommendation || "",
        branch_manager_signature: fullCustomerData?.bankUseOnly?.bmSignature || "",
        application_status: fullCustomerData?.bankUseOnly?.applicationStatus || "",
        reason_code: fullCustomerData?.bankUseOnly?.reasonCode || "",
        analyst_name: fullCustomerData?.bankUseOnly?.analystName || "",
        analyst_signature: fullCustomerData?.bankUseOnly?.analystSignature || "",
        
        // Credit guardian
        avail_sms_alert: toBoolean(fullCustomerData?.creditGuardian?.smsAlert),
        avail_credit_guardian: toBoolean(fullCustomerData?.creditGuardian?.enabled) || toBoolean(fullCustomerData?.creditGuardian?.creditGuardian),
        card_applicant_signature: fullCustomerData?.creditGuardian?.signature || "",
        card_applicant_signature_date: toValidDate(fullCustomerData?.creditGuardian?.date)
      };

      // Arrays - map to backend expected structure
      // These arrays will be handled by the backend separately, as child tables
      const childTables = {
        other_banks: otherBanks.filter(bank => 
          (bank as any).bankName || (bank as any).bank_name
        ).map(bank => ({
          bank_name: (bank as any).bankName || (bank as any).bank_name || "",
          branch: (bank as any).branch || "",
          account_no: (bank as any).accountNumber || (bank as any).account_no || ""
        })),
        
        other_credit_cards: otherCreditCards.filter(card => 
          (card as any).bankName || (card as any).bank_name
        ).map(card => ({
          bank_name: (card as any).bankName || (card as any).bank_name || "",
          card_type: (card as any).cardType || (card as any).card_type || "",
          card_number: (card as any).cardNumber || (card as any).card_number || "",
          credit_limit: toNumber((card as any).creditLimit || (card as any).credit_limit)
        })),
        
        loan_facilities: loanFacilities.filter(loan => 
          (loan as any).bankName
        ).map(loan => ({
          bank_name: (loan as any).bankName || "",
          loan_type: (loan as any).loanType || "",
          outstanding: toNumber((loan as any).outstandingAmount),
          installment: toNumber((loan as any).monthlyInstallment)
        })),
        
        supplementary_cards: Array.isArray(supplementaryCards) && supplementaryCards.length > 0 ? 
          supplementaryCards.filter(card => 
            // Only include cards that have at least a name or card number
            card && (card.first_name || card.name_on_card || card.nic_passport)
          ).map(card => ({
            title: card.title || "",
            first_name: card.first_name || "",
            middle_name: card.middle_name || "",
            last_name: card.last_name || "",
            name_on_card: card.name_on_card || "",
            father_husband_name: card.father_husband_name || "",
            credit_limit_percent: card.credit_limit_percent || "",
            availability: card.availability || "Full",
            relationship_to_principal: card.relationship_to_principal || "",
            dob: toValidDate(card.dob),
            gender: card.gender || "Male",
            nic_passport: card.nic_passport || "",
            old_nic_number: card.old_nic_number || "",
            mother_maiden_name: card.mother_maiden_name || ""
          })) : [],
        
        references: Array.isArray(fullCustomerData?.references) && fullCustomerData.references.length > 0 ? 
          fullCustomerData.references.map(ref => ({
            name: ref.name || "",
            relationship: ref.relationship || "",
            nic: ref.nic || "",
            address: ref.address || "",
            phones: ref.phones || "",
            ntn: ref.ntn || ""
          })) : [],
        
        lien_marked: lienMarked && (lienMarked.collateralType || lienMarked.bank || lienMarked.accountNo) ? [{
          collateral_type: lienMarked.collateralType || "",
          bank: lienMarked.bank || "",
          branch: lienMarked.branch || "",
          account_no: lienMarked.accountNo || "",
          account_type: lienMarked.accountType || "",
          lien_amount: toNumber(lienMarked.lienAmount) || 0,
          currency: lienMarked.currency || "PKR",
          account_title: lienMarked.accountTitle || "",
          maturity_date: toValidDate(lienMarked.maturityDate)
        }] : []
      };

      // Merge the main form data and child tables
      const fullPayload = {
        ...formData,
        other_banks: childTables.other_banks,
        other_credit_cards: childTables.other_credit_cards,
        loan_facilities: childTables.loan_facilities,
        supplementary_cards: childTables.supplementary_cards,
        references: childTables.references,
        lien_marked: childTables.lien_marked
      };

      console.log("Submitting platinum credit card application data with exact schema match:");
      console.log(JSON.stringify(fullPayload, null, 2));

      // Make API call
      const response = await fetch(`${getBaseUrl()}/api/platinum_creditcard`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fullPayload),
      });

      console.log("✅ Platinum Credit Card submission response status:", response.status);

      // Check response
      if (!response.ok) {
        console.log("Backend response status:", response.status);
        const errorText = await response.text();
        console.log("Raw response text:", errorText);
        throw new Error(errorText && errorText.includes("{") ? JSON.parse(errorText).error || "Unknown error" : errorText || "Unknown error");
      }

      const result = await response.json();
      toast({
        title: "Success!",
        description: "Platinum Credit Card application submitted successfully. Redirecting to document upload...",
      });
      
      // Store minimal info for documents page to fetch proper customer data
      const submissionInfo = {
        applicationId: result.application_id,
        applicationType: 'PlatinumCreditCard'
      };
      
      // Store in localStorage for documents page to pick up
      localStorage.setItem('lastApplicationSubmission', JSON.stringify(submissionInfo));
      
      // Redirect to documents page
      router.push('/dashboard/documents');
    } catch (error) {
      console.error("Application submission error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit application. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to scroll to section
  const scrollToSection = (key: SectionKey) => {
    refs[key]?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setCurrentSection(key);
  };

  // Up Arrow visibility state
  const [showUpArrow, setShowUpArrow] = useState(false);

  // Listen for scroll to show/hide up arrow
  useEffect(() => {
    const handleScroll = () => {
      setShowUpArrow(window.scrollY > 300); // Show after 300px scroll
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll to top handler
  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Autofill function with DBR scenarios for Platinum Credit Card
  const handleAutofill = (scenario: 'excellent' | 'good' | 'bad') => {
    let incomeData, scenarioDescription, obligations;

    if (scenario === 'excellent') {
      // Excellent DBR (<35%): High income, minimal obligations
      incomeData = {
        monthlyIncome: 250000,
        grossSalary: 250000,
        netMonthlySalary: 200000,
        totalIncome: 200000,
        otherIncome: '',
        otherIncomeSource: ''
      };
      obligations = {
        otherCreditCards: [{ bankName: 'Bank A', cardType: 'Classic', limit: '100000', outstanding: '10000' }],
        loanFacilities: []
      };
      scenarioDescription = 'Excellent DBR (<35%) - High income, minimal obligations';
    } else if (scenario === 'good') {
      // Good DBR (35-40%): Medium income, moderate obligations
      incomeData = {
        monthlyIncome: 180000,
        grossSalary: 180000,
        netMonthlySalary: 150000,
        totalIncome: 150000,
        otherIncome: '',
        otherIncomeSource: ''
      };
      obligations = {
        otherCreditCards: [
          { bankName: 'Bank A', cardType: 'Classic', limit: '150000', outstanding: '50000' },
          { bankName: 'Bank B', cardType: 'Gold', limit: '100000', outstanding: '30000' }
        ],
        loanFacilities: [{ bankName: 'Bank D', loanType: 'Personal Loan', limit: '200000', outstanding: '180000' }]
      };
      scenarioDescription = 'Good DBR (35-40%) - Moderate income and obligations';
    } else {
      // Bad DBR (>40%): Lower income, high obligations
      incomeData = {
        monthlyIncome: 150000,
        grossSalary: 150000,
        netMonthlySalary: 120000,
        totalIncome: 120000,
        otherIncome: '',
        otherIncomeSource: ''
      };
      obligations = {
        otherCreditCards: [
          { bankName: 'Bank A', cardType: 'Classic', limit: '200000', outstanding: '180000' },
          { bankName: 'Bank B', cardType: 'Gold', limit: '150000', outstanding: '140000' },
          { bankName: 'Bank C', cardType: 'Silver', limit: '100000', outstanding: '95000' }
        ],
        loanFacilities: [
          { bankName: 'Bank D', loanType: 'Personal Loan', limit: '300000', outstanding: '280000' },
          { bankName: 'Bank E', loanType: 'Auto Loan', limit: '150000', outstanding: '140000' },
          { bankName: 'Bank F', loanType: 'Personal Loan', limit: '100000', outstanding: '90000' }
        ]
      };
      scenarioDescription = 'Bad DBR (>40%) - Lower income, high obligations';
    }

    const testData = {
      // Personal Details
      personalDetails: {
        title: 'Mr.',
        firstName: 'Kamran',
        lastName: 'Sheikh',
        middleName: '',
        fullName: 'Kamran Sheikh',
        cnic: '4210198765432',
        dateOfBirth: '1985-08-10',
        gender: 'Male',
        maritalStatus: 'Married',
        fatherName: 'Sheikh Abdullah',
        motherName: 'Amina Sheikh',
        mobileNumber: '0333-1234567',
        email: 'kamran.sheikh@example.com',
        education: 'MBA',
        numberOfDependents: '2',
        ntn: 'NTN-123456',
        passportNumber: 'AB1234567'
      },
      
      // Address Details
      addressDetails: {
        currentAddress: {
          houseNo: '12-A',
          street: 'Main Boulevard',
          tehsil: 'Gulberg',
          nearestLandmark: 'Liberty Market',
          city: 'Lahore',
          postalCode: '54000',
          telephone: '042-1234567',
          yearsAtAddress: '5'
        },
        permanentAddress: {
          houseNo: '12-A',
          street: 'Main Boulevard',
          city: 'Lahore',
          postalCode: '54000',
          telephone: '042-1234567'
        }
      },
      
      // Employment Details
      employmentDetails: {
        employmentStatus: 'Salaried',
        organization: 'Global Manufacturing Ltd',
        designation: 'General Manager',
        department: 'Finance',
        dateOfJoining: '2015-01-10',
        yearsWithCurrentEmployer: '9',
        officeAddress: {
          houseNo: 'Plot 45',
          street: 'Industrial Area',
          city: 'Lahore',
          telephone1: '042-9876543',
          fax: '042-9876544'
        },
        officePhone: '042-9876543',
        officeFax: '042-9876544'
      },
      
      // Previous Employment
      previousEmployment: {
        companyName: 'International Corp',
        designation: 'Senior Manager',
        experienceYears: '5',
        telephone: '042-5554444'
      },
      
      // Income Details
      incomeDetails: {
        ...incomeData
      },
      
      // Banking Details
      bankingDetails: {
        accountNumber: '1234567890123',
        branchCode: 'LHR001',
        accountType: 'Salary Account',
        isExistingCustomer: 'No'
      },
      
      // Platinum Card Details
      platinumCard: {
        cardType: 'Platinum',
        nameOnCard: 'Kamran Sheikh',
        requestedLimit: '500000',
        cnicIssuanceDate: '2015-01-01',
        cnicExpiryDate: '2030-01-01',
        oldNic: ''
      },
      
      // Next of Kin
      nextOfKin: {
        name: 'Ayesha Sheikh',
        fullName: 'Ayesha Sheikh',
        relationship: 'Spouse',
        contactNumber: '0321-9876543',
        telephone: '042-1234567',
        alternateNumber: '0300-1111222'
      },
      
      // References
      references: [
        {
          name: 'Faisal Ahmed',
          relationship: 'Colleague',
          mobile: '0300-1234567',
          address: 'Lahore',
          city: 'Lahore'
        },
        {
          name: 'Usman Ali',
          relationship: 'Friend',
          mobile: '0321-7654321',
          address: 'Lahore',
          city: 'Lahore'
        }
      ],
      
      // Declaration
      declaration: {
        signature: 'Kamran Sheikh',
        date: new Date().toISOString().split('T')[0],
        termsAgreed: true
      },
      
      // Note: Existing obligations data is typically collected through form interaction
      // The backend will fetch actual credit history from ECIB during decision engine processing
    };

    updateCustomerData(testData);
    
    toast({
      title: "Form Autofilled",
      description: scenarioDescription,
      variant: "default"
    });
  };



  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-center mb-10 text-primary">
        Platinum Credit Card Application
      </h1>

      <div>
        <Card className="bg-gradient-to-r from-green-50 to-green-50 border-green-200">
          <CardContent className="p-6">
            {/* Customer info header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {customerData?.isETB ? (
                  <User className="w-8 h-8 text-green-600" />
                ) : (
                  <CreditCard className="w-8 h-8 text-blue-600" />
                )}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Platinum Credit Card Application
                  </h2>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-lg font-semibold text-gray-700">
                      Consumer ID: {customerData?.cifData?.customerId || 'N/A'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      customerData?.isETB 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {customerData?.isETB ? 'Existing Customer (ETB)' : 'New Customer (NTB)'}
                    </span>
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => router.push('/dashboard/applicant')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Selection
              </Button>
            </div>
            {customerData && customerData.personalDetails && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {customerData.personalDetails.fullName && (
                  <div>
                    <span className="font-medium text-gray-600">Name:</span>
                    <div className="text-gray-900">{customerData.personalDetails.fullName}</div>
                  </div>
                )}
                {customerData.personalDetails.cnic && (
                  <div>
                    <span className="font-medium text-gray-600">CNIC:</span>
                    <div className="text-gray-900">{customerData.personalDetails.cnic}</div>
                  </div>
                )}
                {customerData.personalDetails.dateOfBirth && (
                  <div>
                    <span className="font-medium text-gray-600">Date of Birth:</span>
                    <div className="text-gray-900">{customerData.personalDetails.dateOfBirth}</div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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

       {/* Chips Navigation */}
       <div className="border mt-8 rounded-lg px-8 border-gray-200 mb-6">
      <h3 className="text-lg font-semibold text-gray-700 mt-8 mb-2">Form Sections</h3>
      <div className="flex flex-wrap gap-2 mb-6">
        {FORM_SECTIONS.map((section) => (
          <button
            key={section.key}
            type="button"
            onClick={() => scrollToSection(section.key)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-2xl shadow 
              text-sm font-semibold border transition-all
              ${currentSection === section.key 
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-gray-50 text-gray-800 border-gray-200"}
              ${sectionFilled[section.key] ? "ring-2 ring-green-400" : ""}
            `}
          >
            {section.label}
            {sectionFilled[section.key] && (
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            )}
          </button>
        ))}
      </div>
       </div>

      <form className="space-y-10 mt-10" onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(e);
      }}>
        <div ref={personalRef}><PlatinumPersonalInfoForm /></div>
        <div ref={kinRef}><PlatinumNextOfKinForm /></div>
        <div ref={employmentRef}><PlatinumEmploymentDetailsForm /></div>
        <div ref={incomeRef}><PlatinumIncomeDetailsForm /></div>
        <div ref={bankingRef}><PlatinumBankingDetailsForm /></div>
        <div ref={autoDebitRef}><PlatinumAutoDebitForm /></div>
        <div ref={referenceRef}><PlatinumReferenceForm /></div>
        <div ref={declarationRef}><PlatinumDeclarationForm /></div>
        <div ref={declarationBankRef}><PlatinumDeclarationBankSectionForm /></div>
        <div ref={guardianSmsRef}><PlatinumCreditGuardianSmsAlertForm /></div>
        <div ref={supplementaryRef}><PlatinumSupplementaryCardForm /></div>
        <div ref={lienRef}><PlatinumLienMarkedForm /></div>
        <div ref={bankUseRef}><PlatinumBankUseOnlyForm /></div>
        <div className="flex justify-end gap-2">

          <button
            type="submit"
            disabled={isSubmitting || (validationEnabled && !validationStatus.isValid)}
            className={`rounded-xl font-semibold px-8 py-3 shadow transition ${
              isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : validationEnabled && !validationStatus.isValid
                ? 'bg-red-500 hover:bg-red-600 text-white cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin inline-block mr-2">⟳</span>
                Saving & Redirecting...
              </>
            ) : validationEnabled && !validationStatus.isValid ? (
              `Upload Documents (${validationStatus.missingFields.length} fields missing)`
            ) : (
              'Upload Documents'
            )}
          </button>
        </div>
      </form>

          {/* Up Arrow Button */}
      {showUpArrow && (
        <button
          onClick={handleScrollTop}
          aria-label="Scroll to top"
          className="fixed bottom-8 right-4 z-50 bg-blue-600 hover:bg-blue-800 text-white rounded-full p-3 shadow-xl transition-all"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}