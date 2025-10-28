"use client"
import React, { useEffect, useRef, useState } from 'react';
import { CashplusApplicationTypeForm } from '@/components/forms/Cashplus/CashplusApplicationTypeForm';
import { CashplusPersonalInfoForm } from '@/components/forms/Cashplus/CashplusPersonalInfoForm';
import { CashplusEmploymentInfoForm } from '@/components/forms/Cashplus/CashplusEmploymentInfoForm';
import { CashplusIncomeDetailsForm } from '@/components/forms/Cashplus/CashplusIncomeDetailsForm';
import { CashplusBankingDetailsForm } from '@/components/forms/Cashplus/CashplusBankingDetailsForm';
import { CashplusLoanPreferenceForm } from '@/components/forms/Cashplus/CashplusLoanPreferenceForm';
import { CashplusExposureTable } from '@/components/forms/Cashplus/CashplusExposureTable';
import { CashplusReferencesForm } from '@/components/forms/Cashplus/CashplusReferencesForm';
import { CashplusApplicantDeclarationForm } from '@/components/forms/Cashplus/CashplusApplicantDeclarationForm';
import { CashplusBankUseOnlyForm } from '@/components/forms/Cashplus/CashplusBankUseOnlyForm';
import { useCustomer } from '@/contexts/CustomerContext';
import { Card, CardContent } from '@/components/ui/card';
import { User, CreditCard, ArrowLeft, CheckCircle2, ChevronUp, Settings, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

// 1. Define your section key type
type SectionKey =
  | "type"
  | "personal"
  | "employment"
  | "income"
  | "banking"
  | "loan"
  | "exposure"
  | "references"
  | "declaration"
  | "bankUse";

const FORM_SECTIONS: { key: SectionKey; label: string }[] = [
  { key: "type", label: "Application Type" },
  { key: "personal", label: "Personal Info" },
  { key: "employment", label: "Employment Info" },
  { key: "income", label: "Income Details" },
  { key: "banking", label: "Banking" },
  { key: "loan", label: "Loan Pref." },
  { key: "exposure", label: "Exposure" },
  { key: "references", label: "References" },
  { key: "declaration", label: "Declaration" },
  { key: "bankUse", label: "Bank Use Only" },
];

// Dummy filled-check logic: replace with real check per your state/form validation!
const useSectionFilled = (customerData: any): Record<SectionKey, boolean> => ({
  type: !!customerData?.applicationType,
  personal: !!customerData?.personalDetails?.fullName,
  employment: !!customerData?.employmentDetails?.designation,
  income: !!customerData?.incomeDetails,
  banking: !!customerData?.clientBanks,
  loan: !!customerData?.loanPreference,
  exposure: !!customerData?.exposure, // update as needed
  references: !!customerData?.referenceContacts,
  declaration: !!customerData?.declaration,
  bankUse: !!customerData?.bankUse,
});

export default function CashplusPage() {
  const { customerData, updateCustomerData } = useCustomer();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationEnabled, setValidationEnabled] = useState(true);
  const [showTestOptions, setShowTestOptions] = useState(false);
  const [validationStatus, setValidationStatus] = useState<{isValid: boolean; missingFields: string[]}>({isValid: true, missingFields: []});

  // Function to get base URL for API calls
  const getBaseUrl = () => {
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      return process.env.NEXT_PUBLIC_API_URL || 'https://ilos-backend.vercel.app';
    }
    return 'http://localhost:5000';
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
    
    // Application Type validation
    if (!customerData?.applicationDetails?.loanPurpose) {
      errors.push("Loan Purpose is required");
    }
    if (customerData?.applicationDetails?.loanPurpose === 'Other' && !customerData?.applicationDetails?.loanPurposeOther) {
      errors.push("Please specify the loan purpose");
    }
    if (customerData?.applicationDetails?.existingCustomer === 'Yes' && !customerData?.applicationDetails?.branch) {
      errors.push("Branch is required for existing customers");
    }
    if (customerData?.applicationDetails?.existingCustomer === 'Yes' && !customerData?.applicationDetails?.account) {
      errors.push("Account number is required for existing customers");
    }

    // Personal Information validation
    if (!customerData?.personalDetails?.title) {
      errors.push("Title is required");
    }
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
    if (!customerData?.personalDetails?.gender) {
      errors.push("Gender is required");
    }
    if (!customerData?.personalDetails?.maritalStatus) {
      errors.push("Marital Status is required");
    }
    if (!customerData?.personalDetails?.numberOfDependents) {
      errors.push("Number of Dependants is required");
    }
    if (!customerData?.personalDetails?.education) {
      errors.push("Educational Qualification is required");
    }
    if (customerData?.personalDetails?.education === 'Other' && !customerData?.personalDetails?.educationOther) {
      errors.push("Please specify your education qualification");
    }
    if (!customerData?.personalDetails?.fatherName) {
      errors.push("Father's/Husband's Name is required");
    }
    if (!customerData?.personalDetails?.motherName) {
      errors.push("Mother's Maiden Name is required");
    }
    if (!customerData?.personalDetails?.mobileNumber) {
      errors.push("Mobile Number is required");
    }

    // Address validation
    if (!customerData?.addressDetails?.currentAddress?.fullAddress) {
      errors.push("Current Address is required");
    }
    if (!customerData?.addressDetails?.currentAddress?.city) {
      errors.push("City is required");
    }
    if (!customerData?.addressDetails?.currentAddress?.postalCode) {
      errors.push("Postal Code is required");
    }
    if (!customerData?.addressDetails?.currentAddress?.yearsAtAddress) {
      errors.push("Residing Since is required");
    }
    if (!customerData?.addressDetails?.currentAddress?.residentialStatus) {
      errors.push("Type of Accommodation is required");
    }
    if (customerData?.addressDetails?.currentAddress?.residentialStatus === 'Other' && !customerData?.addressDetails?.currentAddress?.residentialStatusOther) {
      errors.push("Please specify accommodation type");
    }
    if (!customerData?.addressDetails?.currentAddress?.telephone) {
      errors.push("Telephone (Current) is required");
    }

    // Contact details validation
    if (!customerData?.contactDetails?.preferredMailingAddress) {
      errors.push("Preferred Mailing Address is required");
    }
    if (!customerData?.contactDetails?.mobileType) {
      errors.push("Mobile Type is required");
    }

    // Employment validation
    if (!customerData?.employmentDetails?.employmentStatus) {
      errors.push("Employment Status is required");
    }
    if (!customerData?.employmentDetails?.companyName) {
      errors.push("Company Name is required");
    }
    if (!customerData?.employmentDetails?.companyType) {
      errors.push("Company Type is required");
    }
    if (customerData?.employmentDetails?.companyType === 'Other' && !customerData?.employmentDetails?.companyTypeOther) {
      errors.push("Please specify company type");
    }
    if (!customerData?.employmentDetails?.department) {
      errors.push("Department is required");
    }
    if (!customerData?.employmentDetails?.designation) {
      errors.push("Designation is required");
    }
    if (!customerData?.employmentDetails?.grade) {
      errors.push("Grade Level is required");
    }
    if (!customerData?.employmentDetails?.currentExperience) {
      errors.push("Current Experience (Years) is required");
    }

    // Office address validation (excluding non-mandatory fields)
    if (!customerData?.employmentDetails?.officeAddress?.houseNo) {
      errors.push("Office House No. is required");
    }
    if (!customerData?.employmentDetails?.officeAddress?.street) {
      errors.push("Office Street is required");
    }
    if (!customerData?.employmentDetails?.officeAddress?.nearestLandmark) {
      errors.push("Office Nearest Landmark is required");
    }
    if (!customerData?.employmentDetails?.officeAddress?.city) {
      errors.push("Office City is required");
    }
    if (!customerData?.employmentDetails?.officeAddress?.postalCode) {
      errors.push("Office Postal Code is required");
    }
    if (!customerData?.employmentDetails?.officeAddress?.telephone1) {
      errors.push("Office Telephone 1 is required");
    }

    // Income validation (excluding OtherMonthlyIncome as it's non-mandatory)
    if (!customerData?.incomeDetails?.grossMonthlySalary) {
      errors.push("Gross Monthly Salary is required");
    }
    if (!customerData?.incomeDetails?.netMonthlyIncome) {
      errors.push("Net Monthly Income is required");
    }
    if (!customerData?.incomeDetails?.otherIncomeSource) {
      errors.push("Other Income Sources is required");
    }
    if (customerData?.incomeDetails?.otherIncomeSource === 'Other' && !customerData?.incomeDetails?.otherIncomeSourceSpecify) {
      errors.push("Please specify other income source");
    }

    // Banking validation
    if (!customerData?.bankingDetails?.isExistingCustomer) {
      errors.push("Existing customer status is required");
    }
    if (customerData?.bankingDetails?.isExistingCustomer === 'Yes' && !customerData?.bankingDetails?.accountNumber) {
      errors.push("Account Number is required for existing customers");
    }

    // Loan preference validation
    if (!customerData?.loanPreference?.loanType) {
      errors.push("Loan Type is required");
    }
    if (!customerData?.loanPreference?.amountRequested) {
      errors.push("Amount Requested is required");
    }
    if (!customerData?.loanPreference?.minAmountAcceptable) {
      errors.push("Minimum Amount Acceptable is required");
    }
    if (!customerData?.loanPreference?.maxAffordableInstallment) {
      errors.push("Maximum Affordable Installment is required");
    }
    if (!customerData?.loanPreference?.tenure) {
      errors.push("Tenure is required");
    }

    // Declaration validation
    if (!customerData?.declaration?.signature) {
      errors.push("Applicant Signature is required");
    }
    if (!customerData?.declaration?.date) {
      errors.push("Signature Date is required");
    }

    // Bank use only validation
    if (!customerData?.bankUseOnly?.applicationSource) {
      errors.push("Application Source is required");
    }
    if (!customerData?.bankUseOnly?.channelCode) {
      errors.push("Channel Code is required");
    }
    if (!customerData?.bankUseOnly?.soEmployeeNo) {
      errors.push("SO Employee No. is required");
    }
    if (!customerData?.bankUseOnly?.programCode) {
      errors.push("Program Code is required");
    }
    if (!customerData?.bankUseOnly?.pbEmployeeNo) {
      errors.push("PB BM Employee No. is required");
    }
    if (!customerData?.bankUseOnly?.branchCode) {
      errors.push("Branch Code is required");
    }
    if (!customerData?.bankUseOnly?.smEmployeeNo) {
      errors.push("SM Employee No. is required");
    }
    if (!customerData?.bankUseOnly?.bmSignature) {
      errors.push("BM Signature/Stamp is required");
    }

    return errors;
  };

  // 2. Section refs for scroll with correct typing
  const refs: Record<SectionKey, React.RefObject<HTMLDivElement | null>> = {
    type: useRef<HTMLDivElement>(null),
    personal: useRef<HTMLDivElement>(null),
    employment: useRef<HTMLDivElement>(null),
    income: useRef<HTMLDivElement>(null),
    banking: useRef<HTMLDivElement>(null),
    loan: useRef<HTMLDivElement>(null),
    exposure: useRef<HTMLDivElement>(null),
    references: useRef<HTMLDivElement>(null),
    declaration: useRef<HTMLDivElement>(null),
    bankUse: useRef<HTMLDivElement>(null),
  };

  // Which section is currently viewed/highlighted (optional)
  const [currentSection, setCurrentSection] = useState<SectionKey>("type");

  // Section filled check (replace with your real logic for each section)
  const sectionFilled = useSectionFilled(customerData);

  // Function to collect form data from all components
  const collectFormData = () => {
    // Get all form elements within the page
    const formElements = document.querySelectorAll('input, select, textarea');
    const formData: Record<string, any> = {};
    
    // Add customer ID and basic info
    formData.customer_id = customerData?.customerId || '';
    formData.cnic = customerData?.personalDetails?.cnic || customerData?.cnic || '';
    
    // Collect form field values
    formElements.forEach(element => {
      const input = element as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
      
      if (input.name) {
        if (input.type === 'radio' || input.type === 'checkbox') {
          const radioInput = input as HTMLInputElement;
          if (radioInput.checked) {
            formData[input.name] = radioInput.value || 'on';
          }
        } else {
          formData[input.name] = input.value;
        }
      }
    });
    
    // Collect exposure tables data
    const exposureTables = document.querySelectorAll('.exposure-table');
    const creditCardsClean: any[] = [];
    const creditCardsSecured: any[] = [];
    const personalLoansExisting: any[] = [];
    const otherFacilities: any[] = [];
    const personalLoansUnderProcess: any[] = [];
    const references: any[] = [];
    
    // Process each exposure table
    exposureTables.forEach((table, tableIndex) => {
      const rows = table.querySelectorAll('tr');
      rows.forEach((row, rowIndex) => {
        if (rowIndex === 0) return; // Skip header row
        
        const inputs = row.querySelectorAll('input, select');
        if (inputs.length === 0) return;
        
        const rowData: Record<string, any> = {};
        inputs.forEach(input => {
          const element = input as HTMLInputElement | HTMLSelectElement;
          if (element.name) {
            rowData[element.name.split('-')[0]] = element.value;
          }
        });
        
        // Skip empty rows
        const isEmpty = Object.values(rowData).every(value => !value);
        if (isEmpty) return;
        
        // Add to appropriate array based on table index
        switch(tableIndex) {
          case 0: creditCardsClean.push(rowData); break;
          case 1: creditCardsSecured.push(rowData); break;
          case 2: personalLoansExisting.push(rowData); break;
          case 3: otherFacilities.push(rowData); break;
          case 4: personalLoansUnderProcess.push(rowData); break;
        }
      });
    });
    
    // Add reference data
    const referenceElements = document.querySelectorAll('.reference-section');
    referenceElements.forEach((refSection, refIndex) => {
      const inputs = refSection.querySelectorAll('input, select');
      const refData: Record<string, any> = { reference_no: refIndex + 1 };
      
      inputs.forEach(input => {
        const element = input as HTMLInputElement | HTMLSelectElement;
        if (element.name && element.name.startsWith('ref')) {
          refData[element.name.replace('ref', '')] = element.value;
        }
      });
      
      // Skip empty references
      const isEmpty = Object.values(refData).every((value, index) => index === 0 || !value);
      if (!isEmpty) {
        references.push(refData);
      }
    });
    
    // Add child tables to main form data
    formData.credit_cards_clean = creditCardsClean;
    formData.credit_cards_secured = creditCardsSecured;
    formData.personal_loans_existing = personalLoansExisting;
    formData.other_facilities = otherFacilities;
    formData.personal_loans_under_process = personalLoansUnderProcess;
    formData.references = references;
    
    return formData;
  };

  // Autofill function with DBR scenarios
  const handleAutofill = (scenario: 'excellent' | 'good' | 'bad') => {
    // Base data common to all scenarios
    const baseData = {
      applicationDetails: {
        loanPurpose: 'Personal Loan',
        existingCustomer: 'No',
        branch: '',
        account: ''
      },
      personalDetails: {
        title: 'Mr.',
        firstName: 'Ahmed',
        lastName: 'Khan',
        middleName: '',
        cnic: '1234512345671',
        dateOfBirth: '1990-01-01',
        gender: 'Male',
        maritalStatus: 'Single',
        numberOfDependents: '0',
        education: 'Bachelor',
        educationOther: '',
        fatherName: 'Khan Sahib',
        motherName: 'Ayesha Khan',
        mobileNumber: '0300-1234567',
        ntn: ''
      },
      addressDetails: {
        currentAddress: {
          fullAddress: '123 Test Street',
          nearestLandmark: 'Test Landmark',
          city: 'Karachi',
          postalCode: '75000',
          yearsAtAddress: '2',
          residentialStatus: 'Rented',
          residentialStatusOther: '',
          monthlyRent: '',  // Will be set per scenario
          telephone: '021-1234567'
        },
        permanentAddress: {
          houseNo: '123',
          street: 'Test Street',
          city: 'Karachi',
          postalCode: '75000',
          telephone: '021-1234567'
        }
      },
      contactDetails: {
        preferredMailingAddress: 'Current',
        mobileType: 'Personal',
        otherContact: ''
      },
      employmentDetails: {
        employmentStatus: 'Permanent',
        companyName: 'Test Company Ltd',
        companyType: 'Private Limited',
        companyTypeOther: '',
        department: 'IT',
        designation: 'Software Engineer',
        grade: 'Grade 5',
        currentExperience: '5',
        officeAddress: {
          houseNo: '456',
          street: 'Office Street',
          nearestLandmark: 'Office Landmark',
          city: 'Karachi',
          postalCode: '75000',
          telephone1: '021-9876543',
          telephone2: '',
          ext: ''
        }
      },
      incomeDetails: {
        grossMonthlySalary: '',  // Will be set per scenario
        netMonthlyIncome: '',    // Will be set per scenario
        otherIncomeSource: 'None',
        otherIncomeSourceSpecify: '',
        otherMonthlyIncome: ''
      },
      bankingDetails: {
        isExistingCustomer: 'No',
        accountNumber: ''
      },
      loanPreference: {
        loanType: 'Personal Loan',
        amountRequested: '',      // Will be set per scenario
        minAmountAcceptable: '',  // Will be set per scenario
        maxAffordableInstallment: '',  // Will be set per scenario
        tenure: '24'
      },
      declaration: {
        signature: 'Ahmed Khan',
        date: new Date().toISOString().split('T')[0]
      },
      bankUseOnly: {
        applicationSource: 'Branch',
        channelCode: 'BR001',
        soEmployeeNo: 'SO123',
        programCode: 'CP001',
        pbEmployeeNo: 'PB123',
        branchCode: 'BR001',
        smEmployeeNo: 'SM123',
        bmSignature: 'BM Signature'
      }
    };

    // Scenario-specific values
    let testData = { ...baseData };
    let scenarioDescription = '';

    if (scenario === 'excellent') {
      // Excellent DBR (<35%): High income, low obligations
      // Net Income: 200,000, Monthly Rent: 20,000, Max Installment: 35,000
      // Existing CC: 100K limit (5% = 5K), Total Obligations: ~60,000, DBR: ~30%
      testData.incomeDetails.grossMonthlySalary = '250000';
      testData.incomeDetails.netMonthlyIncome = '200000';
      testData.addressDetails.currentAddress.monthlyRent = '20000';
      testData.loanPreference.amountRequested = '800000';
      testData.loanPreference.minAmountAcceptable = '600000';
      testData.loanPreference.maxAffordableInstallment = '35000';
      scenarioDescription = 'Excellent DBR (<35%) - High income, minimal obligations';
    } else if (scenario === 'good') {
      // Good DBR (35-40%): Medium income, moderate obligations
      // Net Income: 150,000, Monthly Rent: 30,000, Existing loans, DBR: ~38%
      testData.incomeDetails.grossMonthlySalary = '180000';
      testData.incomeDetails.netMonthlyIncome = '150000';
      testData.addressDetails.currentAddress.monthlyRent = '30000';
      testData.loanPreference.amountRequested = '600000';
      testData.loanPreference.minAmountAcceptable = '450000';
      testData.loanPreference.maxAffordableInstallment = '27000';
      scenarioDescription = 'Good DBR (35-40%) - Moderate income and obligations';
    } else {
      // Bad DBR (>40%): Lower income, high obligations
      // Net Income: 120,000, Monthly Rent: 50,000, Multiple loans, DBR: ~62%
      testData.incomeDetails.grossMonthlySalary = '150000';
      testData.incomeDetails.netMonthlyIncome = '120000';
      testData.addressDetails.currentAddress.monthlyRent = '50000';
      testData.loanPreference.amountRequested = '500000';
      testData.loanPreference.minAmountAcceptable = '400000';
      testData.loanPreference.maxAffordableInstallment = '25000';
      scenarioDescription = 'Bad DBR (>40%) - Lower income, high obligations';
    }

    updateCustomerData(testData);
    toast({
      title: "Form Autofilled",
      description: scenarioDescription,
      variant: "default"
    });
  };

  // Submit form data to the API
  const handleSubmit = async () => {
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

      // Format data from our context properly
      if (!customerData) throw new Error("No customer data found");
      if (!customerData.customerId) throw new Error("No customer ID found - please try again");

      // Transform our context data into the expected backend structure
      const formData = {
        // Customer identification
        customer_id: customerData.customerId,
        cnic: customerData.personalDetails?.cnic || customerData.cnic || '',
        
        // Loan preference fields
        loan_type: customerData.loanPreference?.loanType || '',
        amount_requested: customerData.loanPreference?.amountRequested || '',
        min_amount_acceptable: customerData.loanPreference?.minAmountAcceptable || '',
        max_affordable_installment: customerData.loanPreference?.maxAffordableInstallment || '',
        tenure: customerData.loanPreference?.tenure || '',
        
        // Application type fields - Convert string to boolean
        is_existing_customer: applicationTypeToBoolean(customerData.applicationDetails?.existingCustomer),
        branch: customerData.applicationDetails?.branch || '',
        account: customerData.applicationDetails?.account || '',
        purpose_of_loan: customerData.applicationDetails?.loanPurpose || '',
        purpose_of_loan_other: customerData.applicationDetails?.loanPurposeOther || '',
        
        // Personal details fields
        title: customerData.personalDetails?.title || '',
        first_name: customerData.personalDetails?.firstName || '',
        middle_name: customerData.personalDetails?.middleName || '',
        last_name: customerData.personalDetails?.lastName || '',
        date_of_birth: customerData.personalDetails?.dateOfBirth || '',
        gender: customerData.personalDetails?.gender || '',
        marital_status: customerData.personalDetails?.maritalStatus || '',
        dependants: customerData.personalDetails?.numberOfDependents || '',
        education_qualification: customerData.personalDetails?.education || '',
        education_qualification_other: customerData.personalDetails?.educationOther || '',
        father_or_husband_name: customerData.personalDetails?.fatherName || '',
        mother_maiden_name: customerData.personalDetails?.motherName || '',
        mobile: customerData.personalDetails?.mobileNumber || '',
        ntn: customerData.personalDetails?.ntn || '',
        
        // Employment status
        employment_status: customerData.employmentDetails?.employmentStatus || '',
        
        // Address fields
        address: customerData.addressDetails?.currentAddress?.fullAddress || '',
        nearest_landmark: customerData.addressDetails?.currentAddress?.nearestLandmark || '',
        city: customerData.addressDetails?.currentAddress?.city || '',
        postal_code: customerData.addressDetails?.currentAddress?.postalCode || '',
        residing_since: customerData.addressDetails?.currentAddress?.yearsAtAddress || '',
        accommodation_type: customerData.addressDetails?.currentAddress?.residentialStatus || '',
        accommodation_type_other: customerData.addressDetails?.currentAddress?.residentialStatusOther || '',
        monthly_rent: customerData.addressDetails?.currentAddress?.monthlyRent || '',
        tel_current: customerData.addressDetails?.currentAddress?.telephone || '',
        
        // Permanent address
        permanent_house_no: customerData.addressDetails?.permanentAddress?.houseNo || '',
        permanent_street: customerData.addressDetails?.permanentAddress?.street || '',
        permanent_city: customerData.addressDetails?.permanentAddress?.city || '',
        permanent_postal_code: customerData.addressDetails?.permanentAddress?.postalCode || '',
        tel_permanent: customerData.addressDetails?.permanentAddress?.telephone || '',
        
        // Contact details
        preferred_mailing_address: customerData.contactDetails?.preferredMailingAddress || '',
        mobile_type: customerData.contactDetails?.mobileType || '',
        other_contact: customerData.contactDetails?.otherContact || '',
        
        // Employment details
        company_name: customerData.employmentDetails?.companyName || '',
        company_type: customerData.employmentDetails?.companyType || '',
        company_type_other: customerData.employmentDetails?.companyTypeOther || '',
        department: customerData.employmentDetails?.department || '',
        designation: customerData.employmentDetails?.designation || '',
        grade_level: customerData.employmentDetails?.grade || '',
        exp_current_years: customerData.employmentDetails?.currentExperience || '',
        prev_employer_name: '',
        exp_prev_years: '',
        
        // Office address
        office_house_no: customerData.employmentDetails?.officeAddress?.houseNo || '',
        office_street: customerData.employmentDetails?.officeAddress?.street || '',
        office_area: customerData.employmentDetails?.officeAddress?.tehsil || '',
        office_landmark: customerData.employmentDetails?.officeAddress?.nearestLandmark || '',
        office_city: customerData.employmentDetails?.officeAddress?.city || '',
        office_postal_code: customerData.employmentDetails?.officeAddress?.postalCode || '',
        office_fax: customerData.employmentDetails?.officeAddress?.fax || '',
        office_tel1: customerData.employmentDetails?.officeAddress?.telephone1 || '',
        office_tel2: customerData.employmentDetails?.officeAddress?.telephone2 || '',
        office_ext: customerData.employmentDetails?.officeAddress?.extension || '',
        
        // Income details
        gross_monthly_salary: customerData.incomeDetails?.grossMonthlySalary || '',
        other_monthly_income: customerData.incomeDetails?.otherMonthlyIncome || '',
        net_monthly_income: customerData.incomeDetails?.netMonthlyIncome || '',
        other_income_sources: customerData.incomeDetails?.otherIncomeSource || '',
        
        // Banking details - Convert string to boolean
        is_existing_customer: applicationTypeToBoolean(customerData.bankingDetails?.isExistingCustomer),
        account_number: customerData.bankingDetails?.accountNumber || '',
        
        // Declaration
        applicant_signature: customerData.declaration?.signature || '',
        applicant_signature_date: customerData.declaration?.date || '',
        
        // Bank use only
        application_source: customerData.bankUseOnly?.applicationSource || '',
        channel_code: customerData.bankUseOnly?.channelCode || '',
        so_employee_no: customerData.bankUseOnly?.soEmployeeNo || '',
        program_code: customerData.bankUseOnly?.programCode || '',
        pb_bm_employee_no: customerData.bankUseOnly?.pbEmployeeNo || '',
        branch_code: customerData.bankUseOnly?.branchCode || '',
        sm_employee_no: customerData.bankUseOnly?.smEmployeeNo || '',
        bm_signature_stamp: customerData.bankUseOnly?.bmSignature || '',
        
        // Prepare array data (if available)
        references: Array.isArray(customerData.references) ? 
          customerData.references.map((ref, index) => ({
            reference_no: index + 1,
            name: ref.name || '',
            cnic: ref.cnic || '',
            relationship: ref.relationship || '',
            house_no: ref.houseNo || '',
            street: ref.street || '',
            area: ref.area || '',
            city: ref.city || '',
            postal_code: ref.postalCode || '',
            tel_residence: ref.telephoneResidence || '',
            tel_office: ref.telephoneOffice || '',
            mobile: ref.mobile || '',
            fax: ref.fax || '',
            email: ref.email || ''
          })) : [],
          
        // Exposure tables
        credit_cards_clean: customerData.exposures?.creditCardsClean || [],
        credit_cards_secured: customerData.exposures?.creditCardsSecured || [],
        personal_loans_existing: customerData.exposures?.personalLoansExisting || [],
        other_facilities: customerData.exposures?.otherFacilities || [],
        personal_loans_under_process: customerData.exposures?.personalLoansUnderProcess || []
      };
      
      // Helper function for converting Yes/No to true/false
      function applicationTypeToBoolean(value: string | undefined): boolean | null {
        if (value === 'Yes') return true;
        if (value === 'No') return false;
        return null; // Return null for empty or undefined values
      }
      
      // Convert string numeric values to actual numbers or null
      function toNumber(value: any): number | null {
        if (value === undefined || value === null || value === '') {
          return null;
        }
        const num = Number(value);
        return isNaN(num) ? null : num;
      }
      
      // Validate and format date or return null
      function toValidDate(value: any): string | null {
        if (value === undefined || value === null || value === '') {
          return null;
        }
        
        // Try to create a valid date object
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          return null; // Not a valid date
        }
        
        // Format as YYYY-MM-DD for PostgreSQL
        return date.toISOString().split('T')[0];
      }
      
      // Transform specific fields to ensure they are numbers
      const formDataWithTypes = {
        ...formData,
        // Number fields
        tenure: toNumber(formData.tenure),
        dependants: toNumber(formData.dependants),
        exp_current_years: toNumber(formData.exp_current_years),
        exp_prev_years: toNumber(formData.exp_prev_years),
        monthly_rent: toNumber(formData.monthly_rent),
        amount_requested: toNumber(formData.amount_requested),
        min_amount_acceptable: toNumber(formData.min_amount_acceptable),
        max_affordable_installment: toNumber(formData.max_affordable_installment),
        gross_monthly_salary: toNumber(formData.gross_monthly_salary),
        other_monthly_income: toNumber(formData.other_monthly_income),
        net_monthly_income: toNumber(formData.net_monthly_income),
        
        // Date fields
        date_of_birth: toValidDate(formData.date_of_birth),
        applicant_signature_date: toValidDate(formData.applicant_signature_date),
      };
      
      // Also handle date fields in arrays
      if (Array.isArray(formDataWithTypes.personal_loans_existing)) {
        formDataWithTypes.personal_loans_existing = formDataWithTypes.personal_loans_existing.map(loan => {
          const updatedLoan = { ...loan };
          // Handle as_of date - use undefined instead of null for TypeScript compatibility
          const asOfDate = toValidDate(loan.as_of);
          updatedLoan.as_of = asOfDate === null ? undefined : asOfDate;
          return updatedLoan;
        });
      }
  
      // Log the submission data for debugging
      console.log("Submitting application data:", formDataWithTypes);
  
      const response = await fetch(`${getBaseUrl()}/api/cashplus`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formDataWithTypes),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        toast({ title: "Success!", description: "Your Cashplus application has been submitted successfully. Redirecting to document upload..." });
        
        // Store minimal info for documents page to fetch proper customer data
        const submissionInfo = {
          applicationId: data.application_id,
          applicationType: 'CashPlus'
        };
        
        // Store in localStorage for documents page to pick up
        localStorage.setItem('lastApplicationSubmission', JSON.stringify(submissionInfo));
        
        // Redirect to documents page
        router.push('/dashboard/documents');
      } else {
        throw new Error(data.error || 'Failed to submit application');
      }
    } catch (error: any) { // Type annotation for error
      console.error("Application submission error:", error);
      toast({ title: "Error", description: error.message || 'Failed to submit application', variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  

  if (!customerData) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Card className="p-6 text-center">
          <div className="text-gray-600 mb-4">No customer data found. Please go back and enter CNIC first.</div>
          <Button onClick={() => router.push('/dashboard/applicant')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  // Helper for scroll
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

  // Check validation status when customerData changes
  useEffect(() => {
    checkValidationStatus();
  }, [customerData, validationEnabled]);

  // Scroll to top handler
  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-5xl rounded-lg mx-auto px-4 py-8 space-y-6">
      <h2 className="text-3xl text-center text-primary font-bold ">Cashplus Application</h2>

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
                  variant="outline"
                  size="sm"
                  onClick={() => handleAutofill('excellent')}
                  className="flex-1 text-green-700 border-green-300 hover:bg-green-50"
                >
                  Excellent DBR
                  <span className="ml-1 text-xs">(&lt;35%)</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAutofill('good')}
                  className="flex-1 text-blue-700 border-blue-300 hover:bg-blue-50"
                >
                  Good DBR
                  <span className="ml-1 text-xs">(35-40%)</span>
                </Button>
                <Button
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

      {/* Customer Info Header */}
    <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
  <CardContent className="p-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        {customerData.isETB ? (
          <User className="w-8 h-8 text-green-600" />
        ) : (
          <CreditCard className="w-8 h-8 text-blue-600" />
        )}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
                          Cashplus Application
          </h2>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-lg font-semibold text-gray-700">
              Consumer ID: {customerData?.cifData?.customerId || 'N/A'}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              customerData.isETB 
                ? 'bg-green-100 text-green-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {customerData.isETB ? 'Existing Customer (ETB)' : 'New Customer (NTB)'}
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
    
    {customerData.personalDetails && (
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        {customerData.personalDetails.firstName && (
          <div>
            <span className="font-medium text-gray-600">Name:</span>
            <div className="text-gray-900">
              {customerData.personalDetails.firstName} {customerData.personalDetails.lastName}
            </div>
          </div>
        )}
        {customerData.personalDetails.cnic && (
          <div>
            <span className="font-medium text-gray-600">CNIC:</span>
            <div className="text-gray-900">{customerData.personalDetails.cnic}</div>
          </div>
        )}
        {customerData.personalDetails.mobileNumber && (
          <div>
            <span className="font-medium text-gray-600">Mobile:</span>
            <div className="text-gray-900">{customerData.personalDetails.mobileNumber}</div>
          </div>
        )}
      </div>
    )}
  </CardContent>
</Card>

 {/* Chips for Navigation */}
 <div className="border mt-8 rounded-lg px-8 border-gray-200 mb-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-2">Form Sections</h3>
      <div className="flex flex-wrap gap-2 mb-6">
        {FORM_SECTIONS.map(section => (
          <button
            key={section.key}
            type="button"
            onClick={() => scrollToSection(section.key)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-2xl shadow 
              text-sm font-semibold border 
              transition-all
              ${currentSection === section.key ? "bg-blue-600 text-white border-blue-600" : "bg-gray-50 text-gray-800 border-gray-200"}
              ${sectionFilled[section.key] ? "ring-2 ring-green-400 bg-primary text-primary-foreground" : ""}
            `}
          >
            {section.label}
            {sectionFilled[section.key] && <CheckCircle2 className="w-4 h-4" />}
          </button>
        ))}
      </div>
 </div>


      {/* Sections - Wrapped in refs for scroll */}
      <form id="cashplusForm" className="space-y-10">
        <div ref={refs.loan}><CashplusLoanPreferenceForm /></div>
        <div ref={refs.type}><CashplusApplicationTypeForm /></div>
        <div ref={refs.personal}><CashplusPersonalInfoForm /></div>
        <div ref={refs.employment}><CashplusEmploymentInfoForm /></div>
        <div ref={refs.income}><CashplusIncomeDetailsForm /></div>
        <div ref={refs.banking}><CashplusBankingDetailsForm /></div>
        <div ref={refs.exposure}>
          {/* Exposure Tables */}
          <div className="space-y-6">
            <CashplusExposureTable
              title="A. Credit Cards (Clean)"
              columns={["Sr #", "Bank Name", "Approved Limit"]}
              rows={3}
              exposureType="creditCardsClean"
            />
            <CashplusExposureTable
              title="B. Credit Cards (Secured)"
              columns={["Sr #", "Bank Name", "Approved Limit"]}
              rows={3}
              exposureType="creditCardsSecured"
            />
            <CashplusExposureTable
              title="C. Personal Loans (Clean) – Existing"
              columns={["Sr #", "Bank Name", "Approved Limit", "Outstanding Amount", "As of (Application Date)"]}
              rows={3}
              exposureType="personalLoansExisting"
            />
            <CashplusExposureTable
              title="D. Other Facilities (Clean & Secured)"
              columns={["Sr #", "Bank Name", "Approved Limit", "Nature", "Current Outstanding"]}
              rows={3}
              exposureType="otherFacilities"
            />
            <CashplusExposureTable
              title="E. Personal Loans Under Process"
              columns={["Sr #", "Bank Name", "Facility Under Process", "Nature of Facility"]}
              rows={3}
              exposureType="personalLoansUnderProcess"
            />
          </div>
        </div>
        <div ref={refs.references}><CashplusReferencesForm /></div>
        <div ref={refs.declaration}><CashplusApplicantDeclarationForm /></div>
        <div ref={refs.bankUse}><CashplusBankUseOnlyForm /></div>
         <div className="flex justify-end">
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || (validationEnabled && !validationStatus.isValid)}
            className={`rounded-xl font-semibold px-8 py-3 shadow transition ${
              isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : validationEnabled && !validationStatus.isValid
                ? 'bg-red-500 hover:bg-red-600 text-white cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isSubmitting ? 'Saving & Redirecting...' : 
             validationEnabled && !validationStatus.isValid 
             ? `Upload Documents (${validationStatus.missingFields.length} fields missing)` 
             : 'Upload Documents'}
          </Button>
        </div>
      </form>

      {/* Up Arrow Button */}
      {showUpArrow && (
        <button
          onClick={handleScrollTop}
          aria-label="Scroll to top"
          className="fixed bottom-8 right-4 z-50 bg-primary text-white rounded-full p-3 shadow-xl transition-all"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}
    </div>
  );
  };

