"use client"
import React, { useEffect, useRef, useState } from 'react';
import { CreditCardTypeForm } from "@/components/forms/creditcard/CreditCardTypeForm";
import { CreditCardRewardProgramForm } from "@/components/forms/creditcard/CreditCardRewardProgramForm";
import { CreditCardApplicantInfoForm } from "@/components/forms/creditcard/CreditCardApplicantInfoForm";
import { CreditCardAddressForm } from "@/components/forms/creditcard/CreditCardAddressForm";
import { CreditCardEmploymentIncomeForm } from "@/components/forms/creditcard/CreditCardEmploymentIncomeForm";
import { CreditCardBankingDetailsForm } from "@/components/forms/creditcard/CreditCardBankingDetailsForm";
import { CreditCardReferencesForm } from "@/components/forms/creditcard/CreditCardReferencesForm";
import { CreditCardDeclarationForm } from "@/components/forms/creditcard/CreditCardDeclarationForm";
import { CreditCardIncomeDetailsForm } from "@/components/forms/creditcard/CreditCardIncomeDetailsForm";
import { CreditCardPreviousEmploymentForm } from "@/components/forms/creditcard/CreditCardPreviousEmploymentForm";
import { CreditCardNextOfKinForm } from "@/components/forms/creditcard/CreditCardNextOfKinForm";
import { CreditCardEmploymentDetailsForm } from "@/components/forms/creditcard/CreditCardEmploymentDetailsForm";
import { CreditCardSupplementaryCardForm } from "@/components/forms/creditcard/CreditCardSupplementaryCardForm";
import { CreditCardOtherBanksForm } from "@/components/forms/creditcard/CreditCardOtherBanksForm";
import { CreditCardOtherCreditCardsForm } from "@/components/forms/creditcard/CreditCardOtherCreditCardsForm";
import { CreditCardLoansForm } from "@/components/forms/creditcard/CreditCardLoansForm";
import { CreditCardLienCreditCardForm } from "@/components/forms/creditcard/CreditCardLienCreditCardForm";
import { useCustomer } from '@/contexts/CustomerContext';
import { Card, CardContent } from '@/components/ui/card';
import { User, CreditCard, ArrowLeft, CheckCircle2, ChevronUp, Loader2, Settings, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

type SectionKey =
  | "type"
  | "reward"
  | "applicant"
  | "address"
  | "employment"
  | "prevEmployment"
  | "employmentIncome"
  | "income"
  | "banking"
  | "references"
  | "kin"
  | "supplementary"
  | "lien"
  | "declaration";

const FORM_SECTIONS: { key: SectionKey; label: string }[] = [
  { key: "type", label: "Card Type" },
  { key: "reward", label: "Reward Program" },
  { key: "applicant", label: "Applicant Info" },
  { key: "address", label: "Address" },
  { key: "employment", label: "Employment Details" },
  { key: "prevEmployment", label: "Previous Employment" },
  { key: "employmentIncome", label: "Employment Income" },
  { key: "income", label: "Income Details" },
  { key: "banking", label: "Banking" },
  { key: "references", label: "References" },
  { key: "kin", label: "Next of Kin" },
  { key: "supplementary", label: "Supplementary Card" },
  { key: "lien", label: "Lien Marked Card" },
  { key: "declaration", label: "Declaration" },
];

const useSectionFilled = (customerData: any): Record<SectionKey, boolean> => ({
  type: !!customerData?.cardType, // Replace with real check if needed
  reward: !!customerData?.rewardProgram, // Same
  applicant: !!customerData?.personalDetails
    && !!customerData.personalDetails.fullName
    && !!customerData.personalDetails.cnic
    && !!customerData.personalDetails.dateOfBirth,
  address: !!customerData?.addressDetails
    && !!customerData.addressDetails.currentAddress
    && !!customerData.addressDetails.permanentAddress,
  employment: !!customerData?.employmentDetails
    && !!customerData.employmentDetails.organization
    && !!customerData.employmentDetails.designation
    && !!customerData.employmentDetails.dateOfJoining,
  prevEmployment: !!customerData?.previousEmployment
    && !!customerData.previousEmployment.organization,
  employmentIncome: !!customerData?.employmentIncome
    && !!customerData.employmentIncome.monthlySalary,
  income: !!customerData?.incomeDetails
    && !!customerData.incomeDetails.otherIncome,
  banking: !!customerData?.bankingDetails
    && !!customerData.bankingDetails.accountNumber,
  references: !!customerData?.references
    && customerData.references.length > 0,
  kin: !!customerData?.nextOfKin
    && !!customerData.nextOfKin.fullName,
  supplementary: !!customerData?.creditCard
    && !!customerData.creditCard.supplementaryCardholderFirstName,
  lien: !!customerData?.creditCard
    && !!customerData.creditCard.collateralType,
  declaration: !!customerData?.declaration
    && !!customerData.declaration.agreeToTerms,
});




export default function CreditCardApplicationPage() {
  const { customerData, updateCustomerData } = useCustomer();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationEnabled, setValidationEnabled] = useState(true);
  const [showTestOptions, setShowTestOptions] = useState(false);
  const [validationStatus, setValidationStatus] = useState<{isValid: boolean; missingFields: string[]}>({isValid: true, missingFields: []});

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
    
    // Card Type validation
    if (!customerData?.creditCard?.cardType) {
      errors.push("Card Type is required");
    }
    if (!customerData?.creditCard?.cardCategory) {
      errors.push("Card Category is required");
    }
    if (!customerData?.creditCard?.nameOnCard) {
      errors.push("Name on Card is required");
    }

    // Applicant Info validation
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
    if (!customerData?.declaration?.signature) {
      errors.push("Applicant Signature is required");
    }
    if (!customerData?.declaration?.date) {
      errors.push("Signature Date is required");
    }

    return errors;
  };



const refs: Record<string, React.RefObject<HTMLDivElement | null>> = {
  type: useRef<HTMLDivElement>(null),
  reward: useRef<HTMLDivElement>(null),
  applicant: useRef<HTMLDivElement>(null),
  address: useRef<HTMLDivElement>(null),
  employment: useRef<HTMLDivElement>(null),
  prevEmployment: useRef<HTMLDivElement>(null),
  employmentIncome: useRef<HTMLDivElement>(null),
  income: useRef<HTMLDivElement>(null),
  banking: useRef<HTMLDivElement>(null),
  references: useRef<HTMLDivElement>(null),
  kin: useRef<HTMLDivElement>(null),
  supplementary: useRef<HTMLDivElement>(null),
  lien: useRef<HTMLDivElement>(null),
  declaration: useRef<HTMLDivElement>(null),
};

  const [currentSection, setCurrentSection] = useState("");
  const sectionFilled = useSectionFilled(customerData);

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
  const scrollToSection = (key: string) => {
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

  // Helper function to convert Yes/No values to boolean
  function toBoolean(value: any): boolean | null {
    if (value === 'Yes' || value === true) return true;
    if (value === 'No' || value === false) return false;
    return null;
  }

  // Helper function to convert string numbers to actual numbers
  function toNumber(value: any): number | null {
    if (value === '' || value === undefined || value === null) return null;
    const num = Number(value);
    return isNaN(num) ? null : num;
  }

  // Helper function to format dates
  function toValidDate(value: any): string | null {
    if (!value) return null;
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
  }

  // Helper function to get base URL
  const getBaseUrl = () => {
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      return process.env.NEXT_PUBLIC_API_URL || 'https://ilos-backend.vercel.app';
    }
    return 'http://localhost:5000';
  };

  // Function to check if data exists and log warnings for missing critical data
  const validateFormData = (data: any) => {
    const criticalFields = [
      { key: 'cardType', section: 'Credit Card Type' },
      { key: 'cardCategory', section: 'Credit Card Category' },
      { key: 'rewardProgram', section: 'Reward Program' },
      { key: 'title', section: 'Personal Details' },
      { key: 'nameOnCard', section: 'Personal Details' },
    ];

    // Check critical fields in creditCard section
    criticalFields.forEach(field => {
      if (!data.creditCard?.[field.key]) {
        console.warn(`Missing critical data: ${field.key} in ${field.section}`);
      }
    });
  };

  // Handle form submission
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

      if (!customerData) {
        toast({
          title: "Error",
          description: "No customer data found. Please fill the form first.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      if (!customerData.customerId) {
        toast({
          title: "Error",
          description: "Customer ID is required. Please try again.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      // Validate and log warnings for missing data
      validateFormData(customerData);

      // Get all data from the context
      const personalDetails = customerData?.personalDetails || {};
      const addressDetails = customerData?.addressDetails || {};
      const currentAddress = addressDetails.currentAddress || {};
      const permanentAddress = addressDetails.permanentAddress || {};
      const employment = customerData?.employmentDetails || {};
      const prevEmployment = customerData?.previousEmployment || {};
      const empIncome = customerData?.employmentIncome || {};
      const incomeDetails = customerData?.incomeDetails || {};
      const banking = customerData?.bankingDetails || {};
      const references = customerData?.references || [];
      const nextOfKin = customerData?.nextOfKin || {};
      const declaration = customerData?.declaration || {};
      const creditCard = customerData?.creditCard || {};

      // Debug console logging for all sections
      console.log("========== DEBUG - CREDIT CARD SUBMISSION DATA ==========");
      console.log("CreditCard Form Data:", creditCard);
      console.log("Personal Details:", personalDetails);
      console.log("Address Details - Current:", currentAddress);
      console.log("Address Details - Permanent:", permanentAddress);
      console.log("Employment Details:", employment);
      console.log("Previous Employment:", prevEmployment);
      console.log("Employment Income:", empIncome);
      console.log("Income Details:", incomeDetails);
      console.log("Banking Details:", banking);
      console.log("References:", references);
      console.log("Next of Kin:", nextOfKin);
      console.log("Declaration:", declaration);
      console.log("========== END DEBUG ==========");

      // Set default values for required fields even if not filled by the user
      // This ensures we don't submit null values to the backend
      const defaultTitle = "Mr";
      const defaultGender = "Male";
      const defaultMaritalStatus = "Single";
      const defaultEducation = "Bachelors";
      const defaultEmploymentStatus = "Employed";
      const defaultCardType = "Classic";
      const defaultCardCategory = "Standard Credit Card";

      // Structure the data according to the exact backend schema
      // Derive a supplementary_cards row from the supplementary card section if present
      const basicCardMemberName = (personalDetails?.fullName || `${personalDetails?.firstName || ''} ${personalDetails?.lastName || ''}`.trim()) || '';
      const basicCardCnic = personalDetails?.cnic || customerData.cnic || '';
      const basicCardOldNic = creditCard?.oldNic || '';
      const supplementaryCardMemberName = (
        creditCard?.supplementaryCardholderNameOnCard ||
        `${creditCard?.supplementaryCardholderFirstName || ''} ${creditCard?.supplementaryCardholderMiddleName || ''} ${creditCard?.supplementaryCardholderLastName || ''}`.trim()
      ) || '';
      const supplementaryCnicPassport = creditCard?.supplementaryNicOrPassport || '';
      const supplementaryOldNic = '';
      const supplementaryCardsDerived = (supplementaryCardMemberName || supplementaryCnicPassport)
        ? [{
            basic_card_member_name: basicCardMemberName,
            basic_card_cnic_passport: basicCardCnic,
            basic_card_old_nic: basicCardOldNic,
            supplementary_card_member_name: supplementaryCardMemberName,
            supplementary_cnic_passport: supplementaryCnicPassport,
            supplementary_old_nic: supplementaryOldNic
          }]
        : [];

      const formData = {
        // Customer identification - REQUIRED
        customer_id: customerData.customerId,

        // Card Type and Rewards - Provide defaults if not filled
        card_type: creditCard?.cardType || defaultCardType,
        card_category: creditCard?.cardCategory || defaultCardCategory,
        special_card_option: creditCard?.specialCardOption || '',
        photo_submission_method: creditCard?.photoSubmissionMethod || 'None',
        reward_program: creditCard?.rewardProgram || 'Classic Rewards',

        // Applicant info - Set default values for required fields
        title: personalDetails?.title || defaultTitle,
        full_name: personalDetails?.fullName || 
          `${personalDetails?.firstName || ''} ${personalDetails?.middleName || ''} ${personalDetails?.lastName || ''}`.trim() || customerData.cnic || 'Unknown',
        name_on_card: creditCard?.nameOnCard || personalDetails?.fullName || personalDetails?.firstName || customerData.cnic || 'Unknown',
        nic_or_passport: personalDetails?.cnic || customerData.cnic || '',
        cnic_issuance_date: toValidDate(creditCard?.cnicIssuanceDate) || toValidDate(new Date().toISOString()),
        cnic_expiry_date: toValidDate(creditCard?.cnicExpiryDate) || toValidDate(new Date(new Date().setFullYear(new Date().getFullYear() + 5)).toISOString()),
        old_nic: creditCard?.oldNic || '',
        father_husband_name: personalDetails?.fatherName || '',
        date_of_birth: toValidDate(personalDetails?.dateOfBirth) || toValidDate('1980-01-01'),
        gender: personalDetails?.gender || defaultGender,
        mother_maiden_name: personalDetails?.motherName || '',
        marital_status: personalDetails?.maritalStatus || defaultMaritalStatus,
        num_dependents: toNumber(personalDetails?.numberOfDependents) || 0,
        education_qualification: personalDetails?.education || defaultEducation,

        // Current address - Use CNIC data if available
        curr_house_apt: currentAddress?.houseNo || '',
        curr_street: currentAddress?.street || '',
        curr_tehsil_district: currentAddress?.area || currentAddress?.tehsil || '',
        curr_landmark: currentAddress?.nearestLandmark || '',
        curr_city: currentAddress?.city || 'Unknown',
        curr_postal_code: currentAddress?.postalCode || 'Unknown',
        curr_tel_residence: currentAddress?.telephone || personalDetails?.mobileNumber || '',
        curr_mobile: currentAddress?.mobile || personalDetails?.mobileNumber || '',
        ntn: personalDetails?.ntn || '',
        type_of_residence: creditCard?.typeOfResidence || 'House',
        nature_of_residence: currentAddress?.residentialStatus || 'Owned',
        residing_since: currentAddress?.yearsAtAddress || '3',
        curr_email: currentAddress?.email || personalDetails?.email || '',

        // Permanent address - Copy from current if empty
        perm_street: permanentAddress?.street || currentAddress?.street || '',
        perm_tehsil_district: permanentAddress?.area || permanentAddress?.tehsil || currentAddress?.area || currentAddress?.tehsil || '',
        perm_landmark: permanentAddress?.nearestLandmark || currentAddress?.nearestLandmark || '',
        perm_city: permanentAddress?.city || currentAddress?.city || 'Unknown',
        perm_postal_code: permanentAddress?.postalCode || currentAddress?.postalCode || 'Unknown',

        // Car details
        car_year: toNumber(creditCard?.carYear) || null,
        car_model: creditCard?.carModel || '',
        car_registration_no: creditCard?.carRegistrationNo || '',
        car_ownership: creditCard?.carOwnership || 'N/A',

        // Next of kin
        next_of_kin_name: nextOfKin?.name || nextOfKin?.fullName || '',
        next_of_kin_relationship: nextOfKin?.relationship || '',
        next_of_kin_tel1: nextOfKin?.contactNumber || nextOfKin?.telephone || nextOfKin?.mobile || '',
        next_of_kin_tel2: nextOfKin?.alternateNumber || nextOfKin?.alternateTelephone || '',

        // Employment details
        occupation: employment?.occupation || '',
        sector: employment?.sector || '',
        grade_or_rank: employment?.grade || '',
        designation: employment?.designation || '',
        department: employment?.department || '',
        company_employer_name: employment?.companyName || employment?.employerName || '',
        employment_status: employment?.employmentStatus || defaultEmploymentStatus,
        length_of_employment: employment?.currentExperience || '',
        employee_number: employment?.employeeNumber || '',
        business_type: employment?.businessType || employment?.companyType || '',
        business_nature: employment?.business || employment?.industry || '',

        // Office address
        office_address: employment?.officeAddress?.houseNo || '',
        office_street: employment?.officeAddress?.street || '',
        office_district: employment?.officeAddress?.tehsil || '',
        office_landmark: employment?.officeAddress?.nearestLandmark || '',
        office_city: employment?.officeAddress?.city || '',
        office_postal_code: employment?.officeAddress?.postalCode || '',
        office_phone1: employment?.officeAddress?.telephone1 || employment?.companyPhone || '',
        office_phone2: employment?.officeAddress?.telephone2 || '',
        office_fax: employment?.officeAddress?.fax || '',

        // Previous employment
        prev_employer: prevEmployment?.companyName || prevEmployment?.employerName || '',
        prev_designation: prevEmployment?.designation || '',
        prev_experience_years: toNumber(prevEmployment?.experienceYears) || null,
        prev_employer_tel: prevEmployment?.telephone || '',

        // Income details
        gross_monthly_income: toNumber(empIncome?.monthlySalary || incomeDetails?.grossMonthlySalary || incomeDetails?.monthlyIncome) || 50000,
        other_income_source: incomeDetails?.otherIncomeSource || '',
        total_income: toNumber(incomeDetails?.netMonthlyIncome || incomeDetails?.totalIncome) || 50000,
        spouse_employed: toBoolean(incomeDetails?.spouseEmployed) || null,
        spouse_income: toNumber(incomeDetails?.spouseIncome) || null,
        spouse_income_source: incomeDetails?.spouseIncomeSource || '',

        // Banking details
        card_destination: creditCard?.cardDestination || 'Home',
        statement_delivery: creditCard?.statementDelivery || 'Email',
        email_for_statement: creditCard?.emailForStatement || personalDetails?.email || currentAddress?.email || '',
        is_existing_customer: toBoolean(banking?.isExistingCustomer) || true,
        account_number: banking?.accountNumber || '',
        branch: banking?.branchName || '',
        payment_option: banking?.paymentOption || creditCard?.paymentOption || 'Full',

        // Reference details - Use first reference or empty
        reference_name: references?.[0]?.name || '',
        reference_relationship: references?.[0]?.relationship || '',
        reference_nic_or_passport: references?.[0]?.cnic || '',
        reference_address_street: references?.[0]?.street || '',
        reference_address_tehsil: references?.[0]?.area || '',
        reference_address_landmark: references?.[0]?.nearestLandmark || '',
        reference_address_city: references?.[0]?.city || '',
        reference_address_postal_code: references?.[0]?.postalCode || '',
        reference_tel_res: references?.[0]?.telephoneResidence || '',
        reference_tel_office: references?.[0]?.telephoneOffice || '',
        reference_mobile: references?.[0]?.mobile || '',
        reference_ntn: references?.[0]?.ntn || '',

        // Bank use only
        application_id_form: creditCard?.applicationIdForm || '',
        application_reference_number: creditCard?.applicationReferenceNumber || '',
        channel_code: creditCard?.channelCode || '',
        program_code: creditCard?.programCode || '',
        branch_code: creditCard?.branchCode || '',
        sales_officer_name: creditCard?.salesOfficerName || '',
        branch_name: creditCard?.branchName || banking?.branchName || '',
        region_name: creditCard?.regionName || '',

        // Declaration and signatures
        customer_contact_confirmation: toBoolean(declaration?.contactConfirmation) || true,
        branch_manager_remarks: creditCard?.branchManagerRemarks || '',
        application_status: creditCard?.applicationStatus || 'Pending',
        reason_code: creditCard?.reasonCode || '',
        analyst_name: creditCard?.analystName || '',

        // SMS and Credit Guardian
        avail_sms_alert: toBoolean(creditCard?.availSmsAlert) || true,
        avail_credit_guardian: toBoolean(creditCard?.availCreditGuardian) || false,

        // Supplementary card details (if any)
        supplementary_cardholder_title: creditCard?.supplementaryCardholderTitle || '',
        supplementary_cardholder_first_name: creditCard?.supplementaryCardholderFirstName || '',
        supplementary_cardholder_middle_name: creditCard?.supplementaryCardholderMiddleName || '',
        supplementary_cardholder_last_name: creditCard?.supplementaryCardholderLastName || '',
        supplementary_cardholder_name_on_card: creditCard?.supplementaryCardholderNameOnCard || '',
        supplementary_cardholder_father_husband_name: creditCard?.supplementaryCardholderFatherHusbandName || '',
        supplementary_card_type: creditCard?.supplementaryCardType || '',
        supplementary_card_limit_type: creditCard?.supplementaryCardLimitType || '',
        supplementary_usage_frequency: creditCard?.supplementaryUsageFrequency || '',
        supplementary_relationship_to_principal: creditCard?.supplementaryRelationshipToPrincipal || '',
        supplementary_dob: toValidDate(creditCard?.supplementaryDob) || null,
        supplementary_gender: creditCard?.supplementaryGender || '',
        supplementary_nic_or_passport: creditCard?.supplementaryNicOrPassport || '',
        supplementary_mother_maiden_name: creditCard?.supplementaryMotherMaidenName || '',
        supplementary_date: toValidDate(creditCard?.supplementaryDate) || null,

        // Collateral details (if any)
        collateral_type: creditCard?.collateralType || '',
        collateral_bank: creditCard?.collateralBank || '',
        collateral_branch: creditCard?.collateralBranch || '',
        collateral_account_no: creditCard?.collateralAccountNo || '',
        collateral_account_type: creditCard?.collateralAccountType || '',
        collateral_lien_amount: toNumber(creditCard?.collateralLienAmount) || null,
        collateral_currency: creditCard?.collateralCurrency || '',
        collateral_title: creditCard?.collateralTitle || '',
        collateral_maturity_date: toValidDate(creditCard?.collateralMaturityDate) || null,

        // Child collections - use derived arrays where available
        other_banks: customerData.otherBanks || [],
        other_credit_cards: customerData.otherCreditCards || [],
        loans: customerData.creditCardLoans || [],
        supplementary_cards: (supplementaryCardsDerived.length > 0)
          ? supplementaryCardsDerived
          : (customerData.supplementaryCards || [])
      };

      // Log the submission data for debugging
      console.log("Submitting credit card application data:", formData);

      // Send data to backend
      const response = await fetch(`${getBaseUrl()}/api/classic_creditcard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      console.log("✅ Credit Card submission response status:", response.status);

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Your credit card application has been submitted successfully. Redirecting to document upload...",
        });
        
        // Store minimal info for documents page to fetch proper customer data
        const submissionInfo = {
          applicationId: data.application_id,
          applicationType: 'ClassicCreditCard'
        };
        
        // Store in localStorage for documents page to pick up
        localStorage.setItem('lastApplicationSubmission', JSON.stringify(submissionInfo));
        
        // Redirect to documents page
        router.push('/dashboard/documents');
      } else {
        throw new Error(data.error || 'Failed to submit credit card application');
      }
    } catch (error: any) {
      console.error("Application submission error:", error);
      toast({
        title: "Error",
        description: error.message || 'Failed to submit application',
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Autofill function with DBR scenarios for Credit Card
  const handleAutofill = (scenario: 'excellent' | 'good' | 'bad') => {
    let incomeData, scenarioDescription;

    if (scenario === 'excellent') {
      // Excellent DBR (<35%): High income, lower obligations
      // Net Income: 200,000, Monthly Obligations: ~30,000, DBR: ~27.5%
      incomeData = {
        grossMonthlySalary: '250000',
        netMonthlyIncome: '200000',
        otherIncome: '',
        totalMonthlyIncome: '200000',
        monthlyExpenses: '30000'
      };
      scenarioDescription = 'Excellent DBR (<35%) - High income, low obligations';
    } else if (scenario === 'good') {
      // Good DBR (35-40%): Medium income, moderate obligations
      // Net Income: 150,000, Monthly Obligations: ~57,000, DBR: ~38%
      incomeData = {
        grossMonthlySalary: '180000',
        netMonthlyIncome: '150000',
        otherIncome: '',
        totalMonthlyIncome: '150000',
        monthlyExpenses: '57000'
      };
      scenarioDescription = 'Good DBR (35-40%) - Moderate income and obligations';
    } else {
      // Bad DBR (>40%): Lower income, higher obligations
      // Net Income: 120,000, Monthly Obligations: ~75,000, DBR: ~62.5%
      incomeData = {
        grossMonthlySalary: '150000',
        netMonthlyIncome: '120000',
        otherIncome: '',
        totalMonthlyIncome: '120000',
        monthlyExpenses: '75000'
      };
      scenarioDescription = 'Bad DBR (>40%) - Lower income, high obligations';
    }

    const testData = {
      // Personal Details
      personalDetails: {
        title: 'Mr.',
        firstName: 'Hassan',
        lastName: 'Ali',
        middleName: '',
        fullName: 'Hassan Ali',
        cnic: '4220112345671',
        dateOfBirth: '1990-03-20',
        gender: 'Male',
        maritalStatus: 'Single',
        fatherName: 'Ali Ahmad',
        mothersMaidenName: 'Ayesha',
        mobileNumber: '0321-1234567',
        email: 'hassan.ali@example.com',
        education: 'Masters',
        numberOfDependents: '0'
      },
      
      // Address Details
      addressDetails: {
        currentAddress: {
          address: 'Apartment 5B, Tower 2, DHA Phase 8',
          city: 'Karachi',
          province: 'Sindh',
          postalCode: '75600',
          residentialStatus: 'Rented',
          yearsAtAddress: '3',
          phoneNumber: '021-1234567'
        },
        permanentAddress: {
          address: 'House 45, Street 10, Gulshan-e-Iqbal',
          city: 'Karachi',
          province: 'Sindh',
          postalCode: '75300',
          phoneNumber: '021-9876543'
        }
      },
      
      // Employment Details
      employmentDetails: {
        employmentStatus: 'Salaried',
        organization: 'ABC Corporation',
        designation: 'Manager Finance',
        department: 'Finance',
        dateOfJoining: '2019-01-15',
        yearsWithCurrentEmployer: '5',
        officeAddress: {
          houseNo: 'Plot 45',
          street: 'Business Tower, Commercial Area',
          city: 'Karachi',
          postalCode: '75000',
          telephone1: '021-1112222'
        }
      },
      
      // Previous Employment
      previousEmployment: {
        organization: 'XYZ Industries',
        designation: 'Assistant Manager',
        yearsOfExperience: '3'
      },
      
      // Employment Income
      employmentIncome: {
        ...incomeData
      },
      
      // Income Details
      incomeDetails: {
        ...incomeData
      },
      
      // Banking Details
      bankingDetails: {
        bankName: 'Partner Bank',
        accountNumber: '1234567890',
        branchCode: 'KHI001',
        accountType: 'Savings',
        isExistingCustomer: 'No'
      },
      
      // Credit Card Details
      creditCard: {
        cardType: 'Classic',
        cardCategory: 'Standard Credit Card',
        requestedLimit: '200000',
        rewardProgram: 'Cashback'
      },
      
      // References
      references: [
        {
          name: 'Kamran Malik',
          relationship: 'Friend',
          phone: '0300-2223344',
          address: 'Karachi'
        },
        {
          name: 'Sana Tariq',
          relationship: 'Colleague',
          phone: '0321-5556677',
          address: 'Karachi'
        }
      ],
      
      // Next of Kin
      nextOfKin: {
        name: 'Fatima Ali',
        relationship: 'Sister',
        cnic: '4220298765432',
        phone: '0300-9998877',
        address: 'Karachi'
      },
      
      // Declaration
      declaration: {
        signature: 'Hassan Ali',
        date: new Date().toISOString().split('T')[0],
        agreed: true
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
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
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
                  Credit Card Application
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
                  <div className="text-gray-900">{customerData.personalDetails.firstName} {customerData.personalDetails.lastName}</div>
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

      {/* Tabs/Chips Navigation */}
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
              ${currentSection === section.key ? "bg-purple-600 text-white border-purple-600" : "bg-gray-50 text-gray-800 border-gray-200"}
              ${sectionFilled[section.key] ? "ring-2 ring-green-400" : ""}
            `}
          >
            {section.label}
            {sectionFilled[section.key] && <CheckCircle2 className="w-4 h-4 text-green-600" />}
          </button>
        ))}
      </div>
      </div>

      {/* Form Sections Wrapped with refs for scroll */}
      <div className="space-y-10">
        <div ref={refs.type}><CreditCardTypeForm /></div>
        <div ref={refs.reward}><CreditCardRewardProgramForm /></div>
        <div ref={refs.applicant}><CreditCardApplicantInfoForm /></div>
        <div ref={refs.address}><CreditCardAddressForm /></div>
        <div ref={refs.employmentIncome}><CreditCardEmploymentIncomeForm /></div>
        <div ref={refs.kin}><CreditCardNextOfKinForm /></div>
        <div ref={refs.employment}><CreditCardEmploymentDetailsForm /></div>
        <div ref={refs.prevEmployment}><CreditCardPreviousEmploymentForm /></div>
        <div ref={refs.income}><CreditCardIncomeDetailsForm /></div>
        <div ref={refs.banking}><CreditCardBankingDetailsForm /></div>
        <div ref={refs.references}><CreditCardReferencesForm /></div>
        <CreditCardOtherBanksForm />
        <CreditCardOtherCreditCardsForm />
        <CreditCardLoansForm />
        <div ref={refs.supplementary}><CreditCardSupplementaryCardForm /></div>
        <div ref={refs.lien}><CreditCardLienCreditCardForm /></div>
        <div ref={refs.declaration}><CreditCardDeclarationForm /></div>
        
        <div className="flex justify-end gap-2">

          <Button
            type="submit"
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
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving & Redirecting...
              </>
            ) : validationEnabled && !validationStatus.isValid ? (
              `Upload Documents (${validationStatus.missingFields.length} fields missing)`
            ) : (
              "Upload Documents"
            )}
          </Button>
        </div>
      </div>

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
