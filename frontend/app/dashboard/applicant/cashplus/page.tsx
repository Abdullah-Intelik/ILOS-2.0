"use client"
import React, { useEffect, useRef, useState } from 'react';
import { CashplusApplicationTypeForm } from '@/components/forms/Cashplus/CashplusApplicationTypeForm';
// ✨ NEW: Industry-standard 15 fields per research
import { MinimalApplicantForm } from '@/components/forms/common/MinimalApplicantForm';
// ✨ NEW: Simplified 2 Yes/No questions per research
import { ExposureSection } from '@/components/forms/common/ExposureTable';
// ❌ REMOVED: Not in industry research
// import { CashplusLoanPreferenceForm } from '@/components/forms/Cashplus/CashplusLoanPreferenceForm';
import { CashplusReferencesForm } from '@/components/forms/Cashplus/CashplusReferencesForm';
// ❌ REMOVED: Not in industry research
// import { CashplusApplicantDeclarationForm } from '@/components/forms/Cashplus/CashplusApplicantDeclarationForm';
import { CashplusBankUseOnlyForm } from '@/components/forms/Cashplus/CashplusBankUseOnlyForm';
import { useCustomer } from '@/contexts/CustomerContext';
import { Card, CardContent } from '@/components/ui/card';
import { User, CreditCard, ArrowLeft, CheckCircle2, ChevronUp, Settings, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import axios from 'axios';
import { useFormAutoSave, useFormRestorePrompt } from '@/hooks/useFormAutoSave';

// 1. Define your section key type - Updated for industry research compliance
type SectionKey =
  | "type"
  | "applicant"  // ✨ 15 common fields per research
  | "exposure"   // ✨ 2 Yes/No questions per research
  | "references" // ✨ 8 fields per research
  | "bankUse";   // Internal use only

const FORM_SECTIONS: { key: SectionKey; label: string }[] = [
  { key: "type", label: "Application Type" },
  { key: "applicant", label: "Personal Information" },
  { key: "exposure", label: "Financial Obligations" },
  { key: "references", label: "References" },
  { key: "bankUse", label: "Bank Use Only" },
];

// Section filled-check logic (per industry research requirements)
const useSectionFilled = (customerData: any): Record<SectionKey, boolean> => ({
  type: !!customerData?.applicationType,
  applicant: !!(customerData?.personalDetails?.firstName && customerData?.personalDetails?.cnic),
  exposure: !!customerData?.exposure,
  references: !!customerData?.referenceContacts,
  bankUse: !!customerData?.bankUse,
});

export default function CashplusPage() {
  const { customerData, updateCustomerData } = useCustomer();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationEnabled, setValidationEnabled] = useState(true);
  const [showTestOptions, setShowTestOptions] = useState(false);
  const [validationStatus, setValidationStatus] = useState<{isValid: boolean; missingFields: string[]}>({isValid: true, missingFields: []});
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);
  const [savedFormData, setSavedFormData] = useState<any>(null);
  
  // ✅ Store actual document files to upload to FileZilla after form submission
  const [documentFiles] = useState<any>({
    cnicFile: (customerData as any)?.documentFiles?.cnicFile || null,
    salaryFile: (customerData as any)?.documentFiles?.salaryFile || null,
    ecibFile: (customerData as any)?.documentFiles?.ecibFile || null,
    reference1File: (customerData as any)?.documentFiles?.reference1File || null,
    reference2File: (customerData as any)?.documentFiles?.reference2File || null,
  });
  
  // Initialize loading state based on URL params (mobile submission detection)
  const losIdParam = searchParams?.get('losId');
  const fromMobileParam = searchParams?.get('fromMobile');
  const autoFillParam = searchParams?.get('autoFill');
  const isAutoFilled = autoFillParam === 'true' && (customerData as any)?.isAutoFilled;
  const [loadingMobileData, setLoadingMobileData] = useState(
    !!(losIdParam && fromMobileParam === 'true') // Start as true if mobile submission
  );
  
  // ✅ Auto-save hook
  const { saveToStorage, clearSavedData, getSaveInfo } = useFormAutoSave({
    formId: 'cashplus-application',
    formData: customerData,
    enabled: true,
    saveInterval: 5000 // Save every 5 seconds
  });
  
  // ✅ Check for saved data on mount
  const { checkForSavedData } = useFormRestorePrompt('cashplus-application');
  
  useEffect(() => {
    const saved = checkForSavedData();
    if (saved && saved.ageMinutes < 60) { // Only show if saved < 1 hour ago
      setSavedFormData(saved);
      setShowRestorePrompt(true);
    }
  }, []);
  
  // ✅ Up Arrow visibility state (moved to top for proper hook order)
  const [showUpArrow, setShowUpArrow] = useState(false);
  
  // ✅ Current section state (moved to top for proper hook order)
  const [currentSection, setCurrentSection] = useState<SectionKey>("type");

  // Function to get base URL for API calls
  const getBaseUrl = () => {
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      return process.env.NEXT_PUBLIC_API_URL || 'https://ilos-backend.vercel.app';
    }
    return 'http://localhost:5000';
  };
  
  // ✅ Function to upload actual document files to FileZilla after form submission
  const uploadDocumentsToFileZilla = async (losId: number) => {
    let successCount = 0;
    let failedCount = 0;
    
    const uploadSingleDoc = async (file: File | null, docType: string) => {
      if (!file) return;
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('loan_type', 'cashplus');
        formData.append('los_id', losId.toString());
        formData.append('document_type', docType);
        formData.append('custom_name', `${losId}-${docType}.${file.name.split('.').pop()}`);
        
        const response = await fetch('http://localhost:8086/upload', {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: formData,
        });
        
        if (response.ok) {
          console.log(`✅ Uploaded ${docType} to FileZilla`);
          successCount++;
        } else {
          console.error(`❌ Failed to upload ${docType}`);
          failedCount++;
        }
      } catch (error) {
        console.error(`❌ Error uploading ${docType}:`, error);
        failedCount++;
      }
    };
    
    // ✅ For mobile submissions, CNIC and Salary Slip are already uploaded
    const isMobileSubmission = (customerData as any)?.isMobileSubmission;
    
    if (isMobileSubmission) {
      console.log('📱 Mobile submission detected - CNIC and Salary Slip already uploaded from mobile app');
      // Only upload eCIB and References for mobile submissions
      await Promise.all([
        uploadSingleDoc(documentFiles.ecibFile, 'eCIB'),
        uploadSingleDoc(documentFiles.reference1File, 'Reference 1 CNIC'),
        uploadSingleDoc(documentFiles.reference2File, 'Reference 2 CNIC'),
      ]);
    } else {
      // Upload all documents for web submissions
      await Promise.all([
        uploadSingleDoc(documentFiles.cnicFile, 'CNIC'),
        uploadSingleDoc(documentFiles.salaryFile, 'Salary Slip'),
        uploadSingleDoc(documentFiles.ecibFile, 'eCIB'),
        uploadSingleDoc(documentFiles.reference1File, 'Reference 1 CNIC'),
        uploadSingleDoc(documentFiles.reference2File, 'Reference 2 CNIC'),
      ]);
    }
    
    return { success: successCount, failed: failedCount };
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

  // ✅ Auto-fill Bank Use Only with generic data on mount
  useEffect(() => {
    if (!customerData?.bankUseOnly || Object.keys(customerData.bankUseOnly || {}).length === 0) {
      updateCustomerData({
        bankUseOnly: {
          applicationSource: 'Branch',
          channelCode: 'WEB001',
          soEmployeeNo: 'SO-' + Date.now().toString().slice(-6),
          programCode: 'CASHPLUS',
          pbEmployeeNo: 'PB-' + Date.now().toString().slice(-6),
          branchCode: customerData?.applicationDetails?.branch || 'BR001',
          smEmployeeNo: 'SM-' + Date.now().toString().slice(-6),
          bmSignature: 'auto-generated',
        },
      });
    }
  }, []);
  
  // ✅ Load mobile submission data if losId and fromMobile params are present
  useEffect(() => {
    const losId = searchParams?.get('losId');
    const fromMobile = searchParams?.get('fromMobile');

    if (losId && fromMobile === 'true') {
      loadMobileSubmissionData(losId);
    }
  }, [searchParams]);
  
  // ✅ Listen for scroll to show/hide up arrow
  useEffect(() => {
    const handleScroll = () => {
      setShowUpArrow(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  // ✅ Validate on customer data change
  useEffect(() => {
    checkValidationStatus();
  }, [customerData, validationEnabled]);

  // ✅ Validation function - SIMPLIFIED to match minimal form (only ~20 fields)
  const validateMandatoryFields = () => {
    const errors: string[] = [];
    
    // ===== Section 1: Application Details (3 fields) =====
    if (!customerData?.applicationDetails?.loanPurpose) {
      errors.push("Purpose of Loan is required");
    }
    if (!customerData?.applicationDetails?.requestedAmount) {
      errors.push("Amount Requested is required");
    }
    if (!customerData?.applicationDetails?.tenure) {
      errors.push("Tenure is required");
    }

    // ===== Section 3: Personal Information - 14 Common Fields =====
    if (!customerData?.personalDetails?.firstName || !customerData?.personalDetails?.lastName) {
      errors.push("Full Name is required");
    }
    if (!customerData?.personalDetails?.cnic) {
      errors.push("CNIC Number is required");
    }
    if (!customerData?.personalDetails?.dateOfBirth) {
      errors.push("Date of Birth is required");
    }
    if (!customerData?.personalDetails?.maritalStatus) {
      errors.push("Marital Status is required");
    }
    if (!customerData?.personalDetails?.mobileNumber) {
      errors.push("Mobile Number is required");
    }
    if (!customerData?.addressDetails?.currentAddress?.fullAddress) {
      errors.push("Residential Address is required");
    }
    if (!customerData?.employmentDetails?.employmentStatus) {
      errors.push("Employment Type is required");
    }
    if (!customerData?.employmentDetails?.companyName) {
      errors.push("Employer Name is required");
    }
    if (!customerData?.employmentDetails?.designation) {
      errors.push("Designation / Job Title is required");
    }
    if (!customerData?.employmentDetails?.currentExperience) {
      errors.push("Employment Tenure is required");
    }
    if (!customerData?.incomeDetails?.monthlyIncome) {
      errors.push("Monthly Income is required");
    }
    if (!customerData?.bankingDetails?.bankName) {
      errors.push("Bank Name is required");
    }
    if (!customerData?.bankingDetails?.accountNumber) {
      errors.push("Bank Account Number is required");
    }
    
    // ===== Section 3: Office Address (1 field) =====
    if (!customerData?.employmentDetails?.officeAddress) {
      errors.push("Office Address is required");
    }

    // ===== Section 4: Exposure (2 Yes/No questions) =====
    // Check if value is undefined/null/empty, not just falsy (since "No" is a valid string)
    const hasCards = customerData?.exposures?.hasExistingCards;
    const hasLoans = customerData?.exposures?.hasExistingLoans;
    
    if (!hasCards || (hasCards !== 'Yes' && hasCards !== 'No')) {
      errors.push("Credit Cards status is required");
    }
    if (!hasLoans || (hasLoans !== 'Yes' && hasLoans !== 'No')) {
      errors.push("Existing Loans status is required");
    }

    // ===== Section 5: References (At least Reference 1) =====
    const refs = customerData?.references || [];
    if (!refs[0]?.name || !refs[0]?.mobile || !refs[0]?.relationship) {
      errors.push("Reference 1 details are required (Name, Relationship, Mobile)");
    }
    
    // ===== Section 7: Bank Use Only - Now auto-filled, so skip validation =====
    // (These are auto-generated on page load)

    return errors;
  };

  // 2. Section refs for scroll (per industry research)
  const refs: Record<SectionKey, React.RefObject<HTMLDivElement | null>> = {
    type: useRef<HTMLDivElement>(null),
    applicant: useRef<HTMLDivElement>(null),
    exposure: useRef<HTMLDivElement>(null),
    references: useRef<HTMLDivElement>(null),
    bankUse: useRef<HTMLDivElement>(null),
  };

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
      // Note: customerId is optional - will be created in backend if not present
      if (!customerData) {
        console.warn("⚠️ No customer data in context, will use form data only");
      }

      // Transform our context data into the expected backend structure
      const formData = {
        // Customer identification
        customer_id: customerData.customerId,
        
        // ✅ Loan preference fields - Support both old (loanPreference) and new (applicationDetails) structure
        loan_type: customerData.loanPreference?.loanType || '',
        amount_requested: customerData.applicationDetails?.requestedAmount || customerData.loanPreference?.amountRequested || '',
        min_amount_acceptable: customerData.loanPreference?.minAmountAcceptable || '',
        max_affordable_installment: customerData.loanPreference?.maxAffordableInstallment || '',
        tenure: customerData.applicationDetails?.tenure || customerData.loanPreference?.tenure || '',
        
        // Application type fields
        branch: customerData.applicationDetails?.branch || '',
        account: customerData.applicationDetails?.account || '',
        purpose_of_loan: customerData.applicationDetails?.loanPurpose || '',
        purpose_of_loan_other: customerData.applicationDetails?.loanPurposeOther || '',
        
        // Personal details fields
        title: customerData.personalDetails?.title || '',
        first_name: customerData.personalDetails?.firstName || '',
        middle_name: customerData.personalDetails?.middleName || '',
        last_name: customerData.personalDetails?.lastName || '',
        cnic: (customerData.personalDetails?.cnic || '').replace(/[-\s]/g, ''), // ✅ Remove dashes/spaces
        date_of_birth: customerData.personalDetails?.dateOfBirth || '',
        gender: customerData.personalDetails?.gender || '',
        marital_status: customerData.personalDetails?.maritalStatus || '',
        dependants: customerData.personalDetails?.numberOfDependents || '',
        education_qualification: customerData.personalDetails?.education || '',
        education_qualification_other: customerData.personalDetails?.educationOther || '',
        father_or_husband_name: customerData.personalDetails?.fatherName || '',
        mother_maiden_name: customerData.personalDetails?.motherName || '',
        ntn: customerData.personalDetails?.ntn || '',
        
        // Employment status
        employment_status: customerData.employmentDetails?.employmentStatus || '',
        
        // Address fields - Support simplified fullAddress format
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
        
        // Contact details - Add mobile and email from personalDetails
        preferred_mailing_address: customerData.contactDetails?.preferredMailingAddress || '',
        mobile: customerData.personalDetails?.mobileNumber || '',
        email: customerData.personalDetails?.email || '', // ✅ Added email mapping
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
        
        // Office address - Support both simplified (string) and detailed (object) formats
        office_house_no: typeof customerData.employmentDetails?.officeAddress === 'string' 
          ? customerData.employmentDetails.officeAddress // ✅ Use full string for simplified form
          : customerData.employmentDetails?.officeAddress?.houseNo || '',
        office_street: typeof customerData.employmentDetails?.officeAddress === 'object'
          ? customerData.employmentDetails.officeAddress.street || ''
          : '',
        office_area: typeof customerData.employmentDetails?.officeAddress === 'object'
          ? customerData.employmentDetails.officeAddress.tehsil || ''
          : '',
        office_landmark: typeof customerData.employmentDetails?.officeAddress === 'object'
          ? customerData.employmentDetails.officeAddress.nearestLandmark || ''
          : '',
        office_city: typeof customerData.employmentDetails?.officeAddress === 'object'
          ? customerData.employmentDetails.officeAddress.city || ''
          : '',
        office_postal_code: typeof customerData.employmentDetails?.officeAddress === 'object'
          ? customerData.employmentDetails.officeAddress.postalCode || ''
          : '',
        office_fax: typeof customerData.employmentDetails?.officeAddress === 'object'
          ? customerData.employmentDetails.officeAddress.fax || ''
          : '',
        office_tel1: typeof customerData.employmentDetails?.officeAddress === 'object'
          ? customerData.employmentDetails.officeAddress.telephone1 || ''
          : '',
        office_tel2: typeof customerData.employmentDetails?.officeAddress === 'object'
          ? customerData.employmentDetails.officeAddress.telephone2 || ''
          : '',
        office_ext: typeof customerData.employmentDetails?.officeAddress === 'object'
          ? customerData.employmentDetails.officeAddress.extension || ''
          : '',
        
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
        
        // Documents (from Document Upload Gateway OCR or direct upload)
        documents: {
          cnic: customerData.ocrData?.cnic ? {
            ocrData: customerData.ocrData.cnic,
            verified: true,
            uploadedAt: new Date().toISOString()
          } : null,
          salarySlip: customerData.ocrData?.salarySlip ? {
            ocrData: customerData.ocrData.salarySlip,
            verified: true,
            uploadedAt: new Date().toISOString()
          } : null,
          ecib: customerData.ecibData ? {
            data: customerData.ecibData,
            uploadedAt: new Date().toISOString()
          } : null,
          reference1Cnic: customerData.ocrData?.reference1 ? {
            ocrData: customerData.ocrData.reference1,
            verified: true,
            uploadedAt: new Date().toISOString()
          } : null,
          reference2Cnic: customerData.ocrData?.reference2 ? {
            ocrData: customerData.ocrData.reference2,
            verified: true,
            uploadedAt: new Date().toISOString()
          } : null,
        },
        
        // Document Gateway metadata (if used)
        documentVerification: customerData.documentVerification || null,
        preQualification: customerData.preQualification || null,
        riskLevel: customerData.riskLevel || null,
        
        // Prepare array data (if available)
        references: Array.isArray(customerData?.references) ? 
          customerData.references.map((ref, index) => ({
            reference_no: index + 1,
            name: ref.name || '',
            cnic: (ref.cnic || '').replace(/[-\s]/g, ''), // ✅ Remove dashes/spaces from reference CNICs
            relationship: ref.relationship || '',
            // Support both simplified (address string) and detailed (houseNo, street, etc.) formats
            house_no: ref.address || ref.houseNo || '', // ✅ Use single address field if available
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
  
      // Check if this is a mobile submission completion
      console.log('🔍 Checking for mobile submission completion...');
      console.log('📋 customerData?.mobileSubmissionLosId:', customerData?.mobileSubmissionLosId);
      console.log('📋 customerData?.isMobileSubmission:', customerData?.isMobileSubmission);
      
      const mobileSubmissionLosId = customerData?.mobileSubmissionLosId;
      if (mobileSubmissionLosId) {
        console.log(`📱 This is a mobile submission completion for LOS-${mobileSubmissionLosId}`);
        formDataWithTypes.mobileSubmissionLosId = mobileSubmissionLosId; // Tell backend to update existing app
        console.log('✅ Added mobileSubmissionLosId to form data');
      } else {
        console.log('ℹ️ Not a mobile submission completion (creating new application)');
      }
      
      // ✅ USE BACKEND V2.0 API
      // Transform form data to V2.0 format
      const { transformCashPlusFormToV2, createApplicationV2 } = await import('@/lib/apiV2Helpers');
      
      // 🔍 DEBUG: Log the raw form data before transformation
      console.log("🔍 RAW formDataWithTypes:", {
        amount_requested: formDataWithTypes.amount_requested,
        tenure: formDataWithTypes.tenure,
        employer_name: formDataWithTypes.employer_name,
        employment_type: formDataWithTypes.employment_type,
        loanPurpose: formDataWithTypes.loanPurpose,
        FULL_OBJECT: formDataWithTypes
      });
      
      console.log("🔍 RAW customerData at submission:", {
        hasApplicationDetails: !!customerData?.applicationDetails,
        hasEmploymentDetails: !!customerData?.employmentDetails,
        hasIncomeDetails: !!customerData?.incomeDetails,
        loanPurpose: customerData?.applicationDetails?.loanPurpose,
        employmentType: customerData?.employmentDetails?.employmentType,
        employerName: customerData?.employmentDetails?.employerName,
        monthlyIncome: customerData?.incomeDetails?.monthlyIncome,
        employmentTenure: customerData?.employmentDetails?.employmentTenure
      });
      
      // 🧪 TEMPORARY TEST: Use hardcoded amount to test backend
      const USE_HARDCODED_TEST = false; // ✅ DISABLED - Now uses actual form data
      
      let v2Data;
      if (USE_HARDCODED_TEST) {
        console.warn("🧪 TESTING WITH HARDCODED AMOUNT!");
        v2Data = {
          product_code: 'CASHPLUS',
          product_type: 'personal_loan',
          requested_amount: 500000,  // ← HARDCODED for testing
          tenure_months: 24,
          party_data: {
            cnic: customerData?.cnic || formDataWithTypes.cnic || '38403-9346396-1',
            first_name: customerData?.personalDetails?.firstName || formDataWithTypes.firstName || 'Test',
            last_name: customerData?.personalDetails?.lastName || formDataWithTypes.lastName || 'User',
            date_of_birth: '1990-01-01',
            gender: 'M',
            marital_status: 'Single',
            mobile: '03001234567',
            email: 'test@example.com',
            residential_address: 'Test Address',
            city: 'Karachi',
            country: 'Pakistan',
            customer_type: customerData?.customerType || 'ETB'
          },
          party_details: {
            employment_type: 'Salaried',
            employer_name: 'Test Company',
            designation: 'Manager',
            employment_tenure_months: 24,
            office_address: 'Test Office',
            monthly_income: 50000,
            bank_name: 'Test Bank',
            account_number: '1234567890'
          },
          product_details: {
            loan_type: 'Normal',
            min_acceptable_amount: 400000,
            max_affordable_installment: 20000
          },
          references: [{
            name: 'Test Reference',
            relationship: 'Friend',
            mobile: '03009999999',
            address: 'Test Address'
          }],
          exposure: {
            has_existing_cards: false,
            has_existing_loans: false
          }
        };
      } else {
        v2Data = transformCashPlusFormToV2(formDataWithTypes, customerData);
      }
      
      // ✅ Add mobileSubmissionLosId to v2Data if this is a mobile submission completion
      if (mobileSubmissionLosId) {
        v2Data.mobileSubmissionLosId = mobileSubmissionLosId;
        console.log(`✅ Added mobileSubmissionLosId to v2Data: ${mobileSubmissionLosId}`);
      }
      
      // Log the submission data for debugging
      console.log("📤 Submitting to Backend V2.0:", v2Data);
  
      const data = await createApplicationV2(v2Data);
  
      if (data.success) {
        const losId = data.data.los_id;
        
        // ✅ Clear auto-saved data after successful submission
        clearSavedData();
        
        toast({ title: "Success!", description: "Your Cashplus application has been submitted successfully. Uploading documents..." });
        
        // ✅ Upload actual document files to FileZilla now that we have LOS ID
        const uploadResults = await uploadDocumentsToFileZilla(losId);
        
        if (uploadResults.failed > 0) {
          toast({ 
            title: "Partial Upload Success", 
            description: `Application saved. ${uploadResults.success} documents uploaded, ${uploadResults.failed} failed.`,
            variant: "default"
          });
        } else if (uploadResults.success > 0) {
          toast({ 
            title: "Documents Uploaded!", 
            description: `${uploadResults.success} document(s) successfully uploaded to FileZilla.`,
            variant: "default"
          });
        }
        
        // Store minimal info for documents page to fetch proper customer data
        const submissionInfo = {
          applicationId: losId,
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
  // Check if this is a mobile submission that needs to be loaded
  const losId = searchParams.get('losId');
  const fromMobile = searchParams.get('fromMobile');
  const isMobileSubmission = losId && fromMobile === 'true';

  // Only show "No customer data" error if:
  // 1. We're not loading mobile data
  // 2. This is not a mobile submission OR mobile data has been attempted to load
  // 3. There's still no customer data
  if (!customerData && !loadingMobileData && !isMobileSubmission) {
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

  const loadMobileSubmissionData = async (losId: string) => {
    setLoadingMobileData(true);
    try {
      const baseUrl = getBaseUrl();
      console.log(`📡 Fetching mobile submission for LOS-${losId}...`);
      const response = await axios.get(`${baseUrl}/api/v1/applications/${losId}`);
      
      console.log('📡 Full API response:', response.data);
      
      // Backend V2.0 returns data wrapped in { success: true, data: {...} }
      const applicationData = response.data.data || response.data;
      
      if (response.data.success || applicationData) {
        // Extract party data (already stored in database, fetched via /api/v1/applications/:id)
        // Map database column names to frontend format
        // Normalize loan purpose from mobile app to web form format
        const normalizeLoanPurpose = (purpose: string | null | undefined) => {
          if (!purpose) return '';
          const purposeMap: Record<string, string> = {
            'Personal': 'Other',
            'HomeRenovation': 'Home Improvement',
            'Medical': 'Medical',
            'Education': 'Education',
            'Business': 'Business',
            'Other': 'Other'
          };
          return purposeMap[purpose] || purpose;
        };
        
        const mobileData = {
          cnic: applicationData.applicant_cnic || applicationData.cnic,
          firstName: applicationData.first_name,
          lastName: applicationData.last_name,
          fatherName: applicationData.father_name,
          motherName: applicationData.mother_name,
          dateOfBirth: applicationData.date_of_birth,
          gender: applicationData.gender,
          maritalStatus: applicationData.marital_status,
          mobileNumber: applicationData.customer_mobile || applicationData.mobile_number || applicationData.mobile,
          email: applicationData.email,
          address: applicationData.permanent_address || applicationData.residential_address,
          city: applicationData.permanent_city || applicationData.city,
          employmentType: applicationData.employment_type,
          companyName: applicationData.employer_name,
          designation: applicationData.designation,
          officeAddress: applicationData.employer_address || applicationData.office_address,
          monthlySalary: applicationData.monthly_income,
          employmentTenure: applicationData.employment_tenure_months || applicationData.employment_tenure_years,
          bankName: applicationData.bank_name,
          accountNumber: applicationData.account_number,
          branch: applicationData.branch,
          requestedAmount: applicationData.requested_amount,
          loanTenure: applicationData.tenure_months,
          loanPurpose: normalizeLoanPurpose(applicationData.purpose || applicationData.loan_purpose),
        };
        const documents = null; // Documents are already in the server, handled by backend
        
        console.log('📱 Extracted mobileData:', mobileData);
        console.log('📱 Raw applicationData fields:', {
          applicant_cnic: applicationData.applicant_cnic,
          customer_mobile: applicationData.customer_mobile,
          permanent_address: applicationData.permanent_address,
          permanent_city: applicationData.permanent_city,
          employer_address: applicationData.employer_address,
          residential_address: applicationData.residential_address,
        });
        console.log('📄 Extracted documents:', documents);
        
        // Show notification
        toast({
          title: "📱 Mobile Submission Loaded",
          description: `Application LOS-${losId} data has been pre-filled. Please review and complete the form.`,
          duration: 5000,
        });

        // Pre-fill the form with mobile submission data
        // Map mobile app field names to web form field names
        // Handle both camelCase and snake_case field names from backend
        if (mobileData) {
          console.log('📱 Raw mobile data received:', mobileData);
          
          const updatedData = {
            ...customerData,
            customerId: mobileData.cnic || mobileData.customer_id, // Set customer ID
            cnic: mobileData.cnic,
            personalDetails: {
              ...customerData?.personalDetails,
              fullName: `${mobileData.firstName || mobileData.first_name || ''} ${mobileData.lastName || mobileData.last_name || ''}`.trim(),
              firstName: mobileData.firstName || mobileData.first_name,
              lastName: mobileData.lastName || mobileData.last_name,
              fatherName: mobileData.fatherName || mobileData.father_name,
              cnic: mobileData.cnic,
              dateOfBirth: mobileData.dateOfBirth || mobileData.date_of_birth,
              gender: mobileData.gender,
              maritalStatus: mobileData.maritalStatus || mobileData.marital_status,
              mobileNumber: mobileData.mobileNumber || mobileData.mobile_number,
              email: mobileData.email,
              address: mobileData.address,
              city: mobileData.city,
            },
            employmentDetails: {
              ...customerData?.employmentDetails,
              employmentStatus: mobileData.employmentType || mobileData.employment_type || mobileData.employment_status,
              companyName: mobileData.companyName || mobileData.company_name,
              department: mobileData.department || '',
              designation: mobileData.designation || '',
              grade: mobileData.grade || mobileData.grade_level || '',
              currentExperience: mobileData.experienceYears || mobileData.experience_years || mobileData.exp_current_years || '',
              companyType: mobileData.companyType || mobileData.company_type || '',
              officeAddress: mobileData.officeAddress, // ✅ Add office address here
            },
            incomeDetails: {
              ...customerData?.incomeDetails,
              // For mobile submissions, use the manually entered salary (not OCR)
              monthlyIncome: mobileData.monthlySalary || mobileData.monthly_salary || mobileData.monthly_income || mobileData.monthlyIncome,
              grossMonthlySalary: mobileData.monthlySalary || mobileData.monthly_salary || mobileData.gross_monthly_salary || mobileData.monthlyIncome || mobileData.monthly_income,
              netMonthlyIncome: mobileData.net_monthly_income || mobileData.netMonthlyIncome || mobileData.monthlySalary || mobileData.monthly_salary || mobileData.gross_monthly_salary,
              otherIncomeSource: mobileData.otherIncomeSource || mobileData.other_income_sources || 'None',
              otherMonthlyIncome: mobileData.otherMonthlyIncome || mobileData.other_monthly_income || '',
            },
            loanPreference: {
              ...customerData?.loanPreference,
              requestedAmount: mobileData.requestedAmount || mobileData.requested_amount || mobileData.amount_requested,
              tenure: mobileData.loanTenure || mobileData.tenure || mobileData.tenure_months,
              purpose: mobileData.loanPurpose || mobileData.loan_purpose,
            },
            applicationDetails: {
              ...customerData?.applicationDetails,
              loanPurpose: mobileData.loanPurpose || mobileData.loan_purpose,
              requestedAmount: mobileData.requestedAmount || mobileData.requested_amount || mobileData.amount_requested,
              tenure: mobileData.loanTenure || mobileData.tenure || mobileData.tenure_months,
            },
            // ✅ Banking details in the correct structure
            bankingDetails: {
              ...customerData?.bankingDetails,
              bankName: mobileData.bankName || mobileData.bank_name,
              accountNumber: mobileData.accountNumber || mobileData.account_number || mobileData.account,
              branch: mobileData.branch || '',
              isExistingCustomer: 'Yes', // Mobile submissions are typically existing customers
            },
            clientBanks: (mobileData.bankName || mobileData.bank_name) ? {
              bank_name: mobileData.bankName || mobileData.bank_name,
              branch: mobileData.branch || '',
              actt_no: mobileData.accountNumber || mobileData.account_number || mobileData.account,
            } : customerData?.clientBanks,
            // ✅ Address details in the correct nested structure
            addressDetails: {
              ...customerData?.addressDetails,
              currentAddress: {
                fullAddress: mobileData.address,
                city: mobileData.city,
              }
            },
            // Store mobile documents reference
            mobileDocuments: documents,
            // Mark as mobile submission and autofilled
            isMobileSubmission: true,
            mobileSubmissionLosId: losId,
            isAutoFilled: true, // ✅ Enable blue highlighting for all pre-filled fields
          };
          
          console.log('📱 Updating customer data with:', updatedData);
          console.log('💼 Employment Details:', updatedData.employmentDetails);
          console.log('💰 Income Details:', updatedData.incomeDetails);
          console.log('🆔 Mobile Submission LOS ID:', updatedData.mobileSubmissionLosId);
          console.log('📱 Is Mobile Submission:', updatedData.isMobileSubmission);
          updateCustomerData(updatedData);
          console.log('✅ Customer data updated successfully');
        } else {
          throw new Error('Mobile submission data is empty');
        }
      } else {
        throw new Error(response.data.message || 'Failed to load mobile submission');
      }
    } catch (error: any) {
      console.error('Error loading mobile submission:', error);
      toast({
        title: "Error Loading Data",
        description: error.message || "Failed to load mobile submission data. Please try again.",
        variant: "destructive",
      });
      // Redirect back to mobile submissions page after error
      setTimeout(() => {
        router.push('/dashboard/pb/applications');
      }, 3000);
    } finally {
      setLoadingMobileData(false);
    }
  };

  // Scroll to top handler
  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Show loading indicator while fetching mobile submission data
  if (loadingMobileData) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Card className="p-6 text-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <div className="text-gray-600">📱 Loading mobile submission data...</div>
            <p className="text-sm text-gray-500">Please wait while we pre-fill the form with customer data</p>
          </div>
        </Card>
      </div>
    );
  }

  // ✅ Restore saved form data handlers
  const handleRestoreSavedData = () => {
    if (savedFormData && savedFormData.data) {
      updateCustomerData(savedFormData.data);
      setShowRestorePrompt(false);
      toast({
        title: "Form Restored!",
        description: `Data from ${savedFormData.formattedTime} has been restored.`,
      });
    }
  };

  const handleDiscardSavedData = () => {
    clearSavedData();
    setShowRestorePrompt(false);
    toast({
      title: "Cleared",
      description: "Saved form data has been discarded.",
      variant: "destructive"
    });
  };

  return (
    <div className="max-w-5xl rounded-lg mx-auto px-4 py-8 space-y-6">
      {/* ✅ Restore Prompt Banner - Fixed position at top */}
      {showRestorePrompt && savedFormData && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5" />
              <div>
                <p className="font-semibold">Form Data Found!</p>
                <p className="text-sm text-blue-100">
                  Saved {savedFormData.ageMinutes} minutes ago
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleRestoreSavedData}
                className="bg-white text-blue-700 hover:bg-blue-50"
              >
                Restore Form
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDiscardSavedData}
                className="text-white hover:bg-blue-600"
              >
                Discard
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <h2 className="text-3xl text-center text-primary font-bold ">Cashplus Application</h2>

      {/* Document Upload CTA - Only show if not auto-filled */}
      {!isAutoFilled && (
        <div className="mb-6 p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Zap className="w-6 h-6" />
                Save 75% of Your Time!
              </h3>
              <p className="text-blue-100 mb-3">
                Upload your CNIC and Salary Slip to auto-fill 93% of this form instantly.
              </p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-300" />
                  <span>2-3 minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-300" />
                  <span>95% accurate</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-300" />
                  <span>Instant pre-qualification</span>
                </div>
              </div>
            </div>
            <Button 
              size="lg"
              onClick={() => router.push('/dashboard/applicant/cashplus/documents')}
              className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-6 text-lg shadow-lg"
            >
              📄 Start with Documents
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
          </div>
        </div>
      )}

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
        {customerData?.isETB ? (
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
    
    {customerData?.personalDetails && (
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        {customerData.personalDetails?.firstName && (
          <div>
            <span className="font-medium text-gray-600">Name:</span>
            <div className="text-gray-900">
              {customerData.personalDetails.firstName} {customerData.personalDetails.lastName}
            </div>
          </div>
        )}
        {customerData.personalDetails?.cnic && (
          <div>
            <span className="font-medium text-gray-600">CNIC:</span>
            <div className="text-gray-900">{customerData.personalDetails.cnic}</div>
          </div>
        )}
        {customerData.personalDetails?.mobileNumber && (
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
 <div className="border mt-8 rounded-xl px-8 py-6 border-slate-200 bg-white shadow-sm mb-6">
      <h3 className="text-xl font-bold text-slate-900 mb-4">Form Sections</h3>
      <div className="flex flex-wrap gap-3 mb-2">
        {FORM_SECTIONS.map(section => (
          <button
            key={section.key}
            type="button"
            onClick={() => scrollToSection(section.key)}
            className={`
              flex items-center gap-2 px-5 py-2.5 rounded-xl shadow-sm 
              text-sm font-semibold border-2
              transition-all hover:shadow-md
              ${currentSection === section.key ? "bg-blue-600 text-white border-blue-600 scale-105" : "bg-white text-slate-700 border-slate-300 hover:border-slate-400"}
              ${sectionFilled[section.key] ? "ring-2 ring-green-400 bg-green-50 text-green-700 border-green-400" : ""}
            `}
          >
            {section.label}
            {sectionFilled[section.key] && <CheckCircle2 className="w-4 h-4" />}
          </button>
        ))}
      </div>
 </div>


      {/* Auto-Fill Success Banner */}
      {isAutoFilled && (
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 border-2 border-green-400 rounded-2xl p-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  ✨ Form Auto-Filled Successfully!
                </h3>
                <p className="text-gray-700 mb-4">
                  We've pre-filled this form with data from your uploaded documents. Please review and complete the remaining fields.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="bg-white rounded-lg p-3 shadow-sm border border-green-200">
                    <p className="text-xs text-gray-600 mb-1">Identity Data</p>
                    <p className="text-sm font-semibold text-green-700">✓ From CNIC</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm border border-blue-200">
                    <p className="text-xs text-gray-600 mb-1">Income Data</p>
                    <p className="text-sm font-semibold text-blue-700">✓ From Salary Slip</p>
                  </div>
                  {(customerData as any)?.ecibData && (
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-purple-200">
                      <p className="text-xs text-gray-600 mb-1">Credit History</p>
                      <p className="text-sm font-semibold text-purple-700">✓ From eCIB</p>
                    </div>
                  )}
                  <div className="bg-white rounded-lg p-3 shadow-sm border border-orange-200">
                    <p className="text-xs text-gray-600 mb-1">Auto-Fill Rate</p>
                    <p className="text-sm font-semibold text-orange-700">
                      {(customerData as any)?.ecibData ? '93%' : '70%'} Complete
                    </p>
                  </div>
                </div>
                {(customerData as any)?.preQualification && (
                  <div className="mt-4 bg-white rounded-lg p-4 border border-blue-200">
                    <p className="text-sm font-semibold text-gray-900 mb-2">📊 Pre-Qualification Results:</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600">Max Loan Amount</p>
                        <p className="font-bold text-purple-600">
                          PKR {(customerData as any).preQualification.maxLoanAmount?.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Monthly EMI Capacity</p>
                        <p className="font-bold text-blue-600">
                          PKR {(customerData as any).preQualification.availableEMI?.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">DTI Ratio</p>
                        <p className="font-bold text-green-600">
                          {(customerData as any).preQualification.dtiRatio}%
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Risk Level</p>
                        <p className={`font-bold ${
                          (customerData as any).preQualification.riskLevel === 'LOW' ? 'text-green-600' :
                          (customerData as any).preQualification.riskLevel === 'MEDIUM' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {(customerData as any).preQualification.riskLevel}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sections - Wrapped in refs for scroll */}
      <form id="cashplusForm" className="space-y-10">
        <div ref={refs.type}><CashplusApplicationTypeForm /></div>
        {/* ❌ REMOVED: Loan Preference (not in industry research) */}
        {/* <div ref={refs.loan}><CashplusLoanPreferenceForm /></div> */}
        {/* ✨ NEW: MinimalApplicantForm (streamlined 15 fields per research, 70% auto-filled) */}
        <div ref={refs.applicant}>
          <MinimalApplicantForm 
            sectionNumber={2}
            sectionTitle="Personal Information"
            showEmployment={true}
            showIncome={true}
            defaultMode="minimal"
            isETB={customerData?.isETB || false}
            ocrData={{
              cnic: (customerData as any)?.mobileDocuments?.cnic?.ocrData,
              salarySlip: (customerData as any)?.mobileDocuments?.salarySlip?.ocrData
            }}
          />
        </div>
        {/* ✨ SIMPLIFIED: 2 Yes/No questions (verified via eCIB) */}
        <div ref={refs.exposure}>
          <ExposureSection
            sectionNumber={3}
            showCreditCards={true}
            showPersonalLoans={true}
            showOtherFacilities={true}
            showAppliedLimits={false}
            />
          </div>
        {/* Section 4: References (8 fields per research) */}
        <div ref={refs.references}><CashplusReferencesForm /></div>
        {/* ❌ REMOVED: Declaration (not in industry research) */}
        {/* <div ref={refs.declaration}><CashplusApplicantDeclarationForm /></div> */}
        {/* Section 5: Bank Use Only (Internal) */}
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
             ? (
                (customerData as any)?.isMobileSubmission 
                ? `Continue (${validationStatus.missingFields.length} fields missing)`
                : `Upload Documents (${validationStatus.missingFields.length} fields missing)`
               )
             : (
                (customerData as any)?.isMobileSubmission 
                ? 'Continue to Upload Documents'
                : 'Upload Documents'
               )}
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

