"use client"
import React, { useEffect, useRef, useState } from 'react';
import { AmeenDriveBankUseOnlyForm } from "@/components/forms/ameendrive/AmeenDriveBankUseOnlyForm";
import { AmeenDriveIncomeBankDetailsForm } from "@/components/forms/ameendrive/AmeenDriveIncomeBankDetailsForm";
import { AmeenDriveNonTaxPayersForm } from "@/components/forms/ameendrive/AmeenDriveNonTaxPayersForm";
import { AmeenDriveOccupationForm } from "@/components/forms/ameendrive/AmeenDriveOccupationForm";
import { AmeenDrivePersonalDetailsForm } from "@/components/forms/ameendrive/AmeenDrivePersonalDetailsForm";
import { AmeenDriveProductProgramForm } from "@/components/forms/ameendrive/AmeenDriveProductProgramForm";
import { AmeenDriveProfessionDetailsForm } from "@/components/forms/ameendrive/AmeenDriveProfessionDetailsForm";
import { AmeenDriveReferenceDetailsForm } from "@/components/forms/ameendrive/AmeenDriveReferenceDetailsForm";
import { AmeenDriveSignatureSectionForm } from "@/components/forms/ameendrive/AmeenDriveSignatureSectionForm";
import AmeenDriveStampsForm from "@/components/forms/ameendrive/AmeenDriveStampsForm";
import { AmeenDriveTakafulDetailsForm } from "@/components/forms/ameendrive/AmeenDriveTakafulDetailsForm";
import { AmeenDriveVehicleDetailsForm } from "@/components/forms/ameendrive/AmeenDriveVehicleDetailsForm";
import { AmeenDriveVehicleFacilityDetailsForm } from "@/components/forms/ameendrive/AmeenDriveVehicleFacilityDetailsForm";
import { useCustomer } from '@/contexts/CustomerContext';
import { Card, CardContent } from '@/components/ui/card';
import { User, CreditCard, ArrowLeft, CheckCircle2, ChevronUp, Settings, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';





// 1. Section key type
type SectionKey =
  | "product"
  | "vehicle"
  | "vehicleFacility"
  | "takaful"
  | "personal"
  | "occupation"
  | "profession"
  | "incomeBank"
  | "nonTaxPayer"
  | "reference"
  | "signature"
  | "stamps"
  | "bankUse";

const FORM_SECTIONS: { key: SectionKey; label: string }[] = [
  { key: "product", label: "Product Program" },
  { key: "vehicle", label: "Vehicle Details" },
  { key: "vehicleFacility", label: "Vehicle Facility Details" },
  { key: "takaful", label: "Takaful Details" },
  { key: "personal", label: "Personal Details" },
  { key: "occupation", label: "Occupation" },
  { key: "profession", label: "Profession Details" },
  { key: "incomeBank", label: "Income/Bank Details" },
  { key: "nonTaxPayer", label: "Non-Tax Payer" },
  { key: "reference", label: "Reference" },
  { key: "signature", label: "Signature" },
  { key: "stamps", label: "Stamps" },
  { key: "bankUse", label: "Bank Use Only" },
];

// 2. Dummy filled-check logic, update as per your data shape!
const useSectionFilled = (customerData: any): Record<SectionKey, boolean> => ({
  product: !!customerData?.ameenDrive?.productProgram?.productType,
  vehicle: !!customerData?.ameenDrive?.vehicleDetails?.manufacturer,
  vehicleFacility: !!customerData?.ameenDrive?.vehicleFacilityDetails?.facilityType,
  takaful: !!customerData?.ameenDrive?.takafulDetails?.company,
  personal: !!customerData?.personalDetails?.firstName && !!customerData?.personalDetails?.cnic,
  occupation: !!customerData?.ameenDrive?.occupation?.occupationType,
  profession: !!customerData?.ameenDrive?.professionDetails?.profession,
  incomeBank: !!customerData?.ameenDrive?.incomeBank?.monthlyIncome,
  nonTaxPayer: !!customerData?.ameenDrive?.nonTaxPayer?.isTaxPayer,
  reference: !!(customerData?.ameenDrive?.referenceDetails?.length > 0),
  signature: !!customerData?.ameenDrive?.signatureSection?.applicantSignature,
  stamps: !!customerData?.ameenDrive?.stamps?.bankStamp,
  bankUse: !!customerData?.ameenDrive?.bankUseOnly?.applicationNumber,
});

export default function AmeenDrivePage() {
  const { customerData, updateCustomerData } = useCustomer();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationEnabled, setValidationEnabled] = useState(true);
  const [validationStatus, setValidationStatus] = useState<{isValid: boolean; missingFields: string[]}>({isValid: true, missingFields: []});

  // Check validation status when component mounts and when customerData changes
  useEffect(() => {
    checkValidationStatus();
  }, [customerData, validationEnabled]);

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

  // Autofill function for testing
  const handleAutofill = () => {
    const testData = {
      ameenDrive: {
        productProgram: {
          productType: 'Ameen Drive',
          programType: 'Standard',
          paymentMode: 'Monthly',
          facilityAmount: '2500000',
          tenure: '60',
          branch: 'Main Branch',
          applicationDate: new Date().toISOString().split('T')[0]
        },
        vehicleDetails: {
          manufacturer: 'Toyota',
          model: 'Corolla',
          year: '2023',
          price: '2500000',
          engineSize: '1300cc',
          color: 'White',
          registrationNumber: 'ABC-123',
          chassisNumber: 'ABC12345678901234',
          engineNumber: 'ENG123456789'
        },
        vehicleFacilityDetails: {
          facilityType: 'Auto Finance',
          facilityAmount: '2500000',
          facilityTenure: '60',
          monthlyInstallment: '50000',
          downPayment: '500000',
          processingFee: '25000'
        },
        takafulDetails: {
          company: 'Takaful Pakistan',
          rate: '2.5',
          trackerCompanyArranged: 'Yes'
        },
        occupation: {
          type: 'Salaried',
          status: 'Permanent',
          occupationType: 'Salaried',
          employerName: 'Tech Solutions Ltd',
          employerAddress: '123 Business Street, Karachi',
          employmentDuration: '5',
          monthlySalary: '150000',
          designation: 'Software Engineer'
        },
        professionDetails: {
          profession: 'IT/Software',
          businessName: '',
          businessAddress: '',
          businessType: '',
          monthlyIncome: '150000',
          businessDuration: ''
        },
        incomeBank: {
          monthlyIncome: '150000',
          otherIncome: '0',
          totalMonthlyIncome: '150000',
          bankName: 'Partner Bank',
          accountNumber: '1234567890',
          accountType: 'Current'
        },
        nonTaxPayer: {
          isTaxPayer: 'No',
          ntnNumber: '',
          strnNumber: '',
          taxCertificate: null
        },
        referenceDetails: [
          {
            id: 1,
            name: 'Ahmed Khan',
            cnic: '1234512345671',
            relation: 'Friend',
            relationOther: '',
            address: '456 Reference Street, Karachi',
            residenceNo: '021-1234567',
            mobile: '0300-1234567',
            email: 'ahmed@email.com',
            businessAddress: '789 Business Ave, Karachi',
            officePhone: '021-9876543'
          },
          {
            id: 2,
            name: 'Fatima Ali',
            cnic: '12345-1234567-2',
            relation: 'Colleague',
            relationOther: '',
            address: '321 Colleague Road, Karachi',
            residenceNo: '021-1111111',
            mobile: '0300-2222222',
            email: 'fatima@email.com',
            businessAddress: '654 Office Street, Karachi',
            officePhone: '021-3333333'
          }
        ],
        signatureSection: {
          signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          applicantSignature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          witnessSignature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          date: new Date().toISOString().split('T')[0]
        },
        stamps: {
          bankStamp: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          officerStamp: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
        },
        bankUseOnly: {
          applicationNumber: 'AD-2024-001',
          branchCode: 'BR001',
          accountOfficer: 'John Doe',
          officerCode: 'OF001',
          applicationDate: new Date().toISOString().split('T')[0],
          approvalDate: new Date().toISOString().split('T')[0],
          remarks: 'Test application for development purposes'
        }
      },
      personalDetails: {
        title: 'Mr.',
        firstName: 'Muhammad',
        lastName: 'Ahmed',
        middleName: 'Ali',
        cnic: '1234512345671',
        dateOfBirth: '1990-01-01',
        gender: 'Male',
        maritalStatus: 'Married',
        numberOfDependents: '2',
        education: 'Bachelor',
        educationOther: '',
        fatherName: 'Ali Ahmed',
        motherName: 'Fatima Ahmed',
        mobileNumber: '0300-1234567',
        ntn: ''
      },
      addressDetails: {
        currentAddress: {
          fullAddress: '123 Test Street, Block 5',
          nearestLandmark: 'Test Landmark',
          city: 'Karachi',
          postalCode: '75000',
          yearsAtAddress: '3',
          residentialStatus: 'Owned',
          residentialStatusOther: '',
          monthlyRent: '0',
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
      }
    };

    updateCustomerData(testData);
    toast({
      title: "Form Autofilled",
      description: "Test data has been populated in the Ameen Drive form.",
      variant: "default"
    });
  };

  // Validation function to check mandatory fields
  const validateMandatoryFields = () => {
    const errors: string[] = [];
    
    // Product Program validation
    if (!customerData?.ameenDrive?.productProgram?.productType) {
      errors.push("Product Type is required");
    }
    if (!customerData?.ameenDrive?.productProgram?.programType) {
      errors.push("Program Type is required");
    }
    if (!customerData?.ameenDrive?.productProgram?.paymentMode) {
      errors.push("Payment Mode is required");
    }
    if (!customerData?.ameenDrive?.productProgram?.facilityAmount) {
      errors.push("Facility Amount is required");
    }
    if (!customerData?.ameenDrive?.productProgram?.tenure) {
      errors.push("Tenure is required");
    }

    // Vehicle Details validation
    if (!customerData?.ameenDrive?.vehicleDetails?.manufacturer) {
      errors.push("Vehicle Manufacturer is required");
    }
    if (!customerData?.ameenDrive?.vehicleDetails?.model) {
      errors.push("Vehicle Model is required");
    }
    if (!customerData?.ameenDrive?.vehicleDetails?.year) {
      errors.push("Vehicle Year is required");
    }
    if (!customerData?.ameenDrive?.vehicleDetails?.price) {
      errors.push("Vehicle Price is required");
    }

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

    // Occupation validation
    if (!customerData?.ameenDrive?.occupation?.type) {
      errors.push("Occupation Type is required");
    }
    if (!customerData?.ameenDrive?.occupation?.status) {
      errors.push("Employment Status is required");
    }
    if (!customerData?.ameenDrive?.occupation?.employerName) {
      errors.push("Employer Name is required");
    }
    if (!customerData?.ameenDrive?.occupation?.designation) {
      errors.push("Designation is required");
    }

    // Income Bank validation
    if (!customerData?.ameenDrive?.incomeBank?.monthlyIncome) {
      errors.push("Monthly Income is required");
    }
    if (!customerData?.ameenDrive?.incomeBank?.bankName) {
      errors.push("Bank Name is required");
    }
    if (!customerData?.ameenDrive?.incomeBank?.accountNumber) {
      errors.push("Account Number is required");
    }

    // Signature validation
    if (!customerData?.ameenDrive?.signatureSection?.signature) {
      errors.push("Applicant Signature is required");
    }
    if (!customerData?.ameenDrive?.signatureSection?.date) {
      errors.push("Signature Date is required");
    }

    // Bank Use Only validation
    if (!customerData?.ameenDrive?.bankUseOnly?.branchCode) {
      errors.push("Branch Code is required");
    }
    if (!customerData?.ameenDrive?.bankUseOnly?.accountOfficer) {
      errors.push("Account Officer is required");
    }
    if (!customerData?.ameenDrive?.bankUseOnly?.applicationDate) {
      errors.push("Application Date is required");
    }

    return errors;
  };



  // 3. Section refs for scroll with correct typing
  const refs: Record<SectionKey, React.RefObject<HTMLDivElement | null>> = {
    product: useRef<HTMLDivElement>(null),
    vehicle: useRef<HTMLDivElement>(null),
    vehicleFacility: useRef<HTMLDivElement>(null),
    takaful: useRef<HTMLDivElement>(null),
    personal: useRef<HTMLDivElement>(null),
    occupation: useRef<HTMLDivElement>(null),
    profession: useRef<HTMLDivElement>(null),
    incomeBank: useRef<HTMLDivElement>(null),
    nonTaxPayer: useRef<HTMLDivElement>(null),
    reference: useRef<HTMLDivElement>(null),
    signature: useRef<HTMLDivElement>(null),
    stamps: useRef<HTMLDivElement>(null),
    bankUse: useRef<HTMLDivElement>(null),
  };

  const [currentSection, setCurrentSection] = useState<SectionKey>("product");
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

  // 4. Helper for scroll
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

  // Submit the form data to the backend
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

      // Extract data from context and format for submission
      const ameenDrive = customerData.ameenDrive || {};
      const personalDetails = customerData.personalDetails || {};
      const addressDetails = customerData.addressDetails || {};
      const currentAddress = addressDetails.currentAddress || {};
      const permanentAddress = addressDetails.permanentAddress || {};

      // Ensure city has a value - it's required in the database schema
      const city = currentAddress.city || permanentAddress.city || 'UNKNOWN';

      // Structure the data according to EXACT database schema
      const formData = {
        // Customer identification - MATCHES THE SCHEMA
        customer_id: customerData.customerId,
        city: city, // Ensure this always has a value

        // Auto Loan details
        auto_application_id: ameenDrive.autoApplicationId || '',
        product_type: ameenDrive.productProgram?.productType || '',
        pricing_plan: ameenDrive.productProgram?.programType || '',
        payment_mode: ameenDrive.productProgram?.paymentMode || '',
        current_rate_kibor: toNumber(ameenDrive.productProgram?.currentRateKibor),
        current_rate_spread: toNumber(ameenDrive.productProgram?.currentRateSpread),
        co_applicant_case: toBoolean(ameenDrive.productProgram?.coApplicantCase),
        co_applicant_name: ameenDrive.productProgram?.coApplicantName || '',
        co_applicant_relationship: ameenDrive.productProgram?.coApplicantRelationship || '',
        
        // Vehicle details - MATCH SCHEMA FIELD NAMES
        vehicle_manufacturer: ameenDrive.vehicleDetails?.manufacturer || '',
        vehicle_model: ameenDrive.vehicleDetails?.model || '',
        year_of_manufacture: toNumber(ameenDrive.vehicleDetails?.year),
        vehicle_class_engine_size: ameenDrive.vehicleDetails?.engineSize || '',
        price_value: toNumber(ameenDrive.vehicleDetails?.price),
        
        // Used car seller details
        used_seller_name: ameenDrive.vehicleDetails?.usedSellerName || '',
        used_seller_cnic: ameenDrive.vehicleDetails?.usedSellerCnic || '',
        used_house_no: ameenDrive.vehicleDetails?.usedHouseNo || '',
        used_street: ameenDrive.vehicleDetails?.usedStreet || '',
        used_area: ameenDrive.vehicleDetails?.usedArea || '',
        used_landmark: ameenDrive.vehicleDetails?.usedLandmark || '',
        used_city: ameenDrive.vehicleDetails?.usedCity || '',
        used_country: ameenDrive.vehicleDetails?.usedCountry || '',
        used_postal_code: ameenDrive.vehicleDetails?.usedPostalCode || '',
        used_contact_no: ameenDrive.vehicleDetails?.usedContactNo || '',
        used_bank: ameenDrive.vehicleDetails?.usedBank || '',
        used_branch: ameenDrive.vehicleDetails?.usedBranch || '',
        used_account_no: ameenDrive.vehicleDetails?.usedAccountNo || '',
        
        // Takaful and tracking details
        takaful_company_name: ameenDrive.takafulDetails?.company || '',
        takaful_rate: toNumber(ameenDrive.takafulDetails?.rate),
        tracker_company_arranged: toBoolean(ameenDrive.takafulDetails?.trackerCompanyArranged),
        
        // Facility details
        facility_type: ameenDrive.vehicleFacilityDetails?.facilityType || '',
        musharakah_share_percent: toNumber(ameenDrive.vehicleFacilityDetails?.musharakahSharePercent),
        musharakah_share_amount: toNumber(ameenDrive.vehicleFacilityDetails?.musharakahShareAmount),
        auto_financing_percent: toNumber(ameenDrive.vehicleFacilityDetails?.autoFinancingPercent),
        auto_financing_amount: toNumber(ameenDrive.vehicleFacilityDetails?.autoFinancingAmount),
        monthly_rental: toNumber(ameenDrive.vehicleFacilityDetails?.monthlyRental),
        monthly_rental_in_words: ameenDrive.vehicleFacilityDetails?.monthlyRentalInWords || '',
        loan_period: toNumber(ameenDrive.vehicleFacilityDetails?.loanPeriod || ameenDrive.productProgram?.tenure),
        delivery_option: ameenDrive.vehicleFacilityDetails?.deliveryOption || '',
        agreement_understanding: toBoolean(ameenDrive.vehicleFacilityDetails?.agreementUnderstanding),
        
        // Personal details - MATCHING SCHEMA FIELDS
        applicant_full_name: personalDetails.fullName || 
          `${personalDetails.firstName || ''} ${personalDetails.middleName || ''} ${personalDetails.lastName || ''}`.trim(),
        father_husband_name: personalDetails.fatherName || '',
        mother_maiden_name: personalDetails.motherName || '',
        date_of_birth: toValidDate(personalDetails.dateOfBirth),
        gender: personalDetails.gender || '',
        marital_status: personalDetails.maritalStatus || '',
        applicant_cnic: personalDetails.cnic || customerData.cnic || '',
        national_tax_no: personalDetails.ntn || '',
        passport_no: personalDetails.passportNumber || '',
        dependents_children: toNumber(personalDetails.numberOfChildren),
        other_dependents: toNumber(personalDetails.numberOfDependents),
        educational_qualification: personalDetails.education || '',
        
        // Current address - MATCHING SCHEMA FIELDS
        curr_house_no: currentAddress.houseNo || '',
        curr_street: currentAddress.street || '',
        curr_area: currentAddress.area || '',
        curr_landmark: currentAddress.nearestLandmark || '',
        curr_city: currentAddress.city || '',
        curr_country: currentAddress.country || '',
        curr_postal_code: currentAddress.postalCode || '',
        residence_status: currentAddress.residentialStatus || '',
        curr_monthly_rent: toNumber(currentAddress.monthlyRent),
        curr_accommodation_type: currentAddress.accommodationType || '',
        curr_residence_no: currentAddress.residenceNo || '',
        curr_rented_years: toNumber(currentAddress.rentedYears),
        curr_mobile_no: currentAddress.mobile || personalDetails.mobileNumber || '',
        curr_fax_no: currentAddress.fax || '',
        curr_email: currentAddress.email || personalDetails.email || '',
        
        // Permanent address - MATCHING SCHEMA FIELDS
        perm_house_no: permanentAddress.houseNo || '',
        perm_street: permanentAddress.street || '',
        perm_area: permanentAddress.area || '',
        perm_landmark: permanentAddress.nearestLandmark || '',
        perm_city: permanentAddress.city || '',
        perm_country: permanentAddress.country || '',
        perm_postal_code: permanentAddress.postalCode || '',
        
        // Existing vehicle info - MATCHING SCHEMA FIELDS
        existing_car_info: ameenDrive.vehicleDetails?.existingCar || '',
        perm_car_manufacturer: ameenDrive.vehicleDetails?.carManufacturer || '',
        perm_car_model: ameenDrive.vehicleDetails?.carModel || '',
        perm_car_year: toNumber(ameenDrive.vehicleDetails?.carYear),
        perm_car_status: ameenDrive.vehicleDetails?.carStatus || '',
        
        // Occupation/Employment details - MATCHING SCHEMA FIELDS
        employment_type: ameenDrive.occupation?.type || '',
        company_name: ameenDrive.occupation?.employerName || '',
        business_type: ameenDrive.occupation?.businessType || '',
        business_type_other: ameenDrive.occupation?.businessTypeOther || '',
        profession: ameenDrive.professionDetails?.type || '',
        nature_of_business: ameenDrive.professionDetails?.natureOfBusiness || '',
        years_in_business: toNumber(ameenDrive.professionDetails?.businessYears),
        percent_shareholding: toNumber(ameenDrive.professionDetails?.percentShareholding),
        employment_status: ameenDrive.occupation?.status || '',
        designation: ameenDrive.occupation?.designation || '',
        department: ameenDrive.occupation?.department || '',
        grade: ameenDrive.occupation?.grade || '',
        
        // Business address - MATCHING SCHEMA FIELDS
        business_address: ameenDrive.professionDetails?.businessAddress || '',
        business_street: ameenDrive.professionDetails?.businessStreet || '',
        business_tehsil_district_area: ameenDrive.professionDetails?.businessArea || '',
        business_city: ameenDrive.professionDetails?.businessCity || '',
        business_country: ameenDrive.professionDetails?.businessCountry || '',
        business_postal_code: ameenDrive.professionDetails?.businessPostalCode || '',
        business_telephone_no: ameenDrive.professionDetails?.businessPhone || '',
        business_fax_no: ameenDrive.professionDetails?.businessFax || '',
        business_nearest_landmark: ameenDrive.professionDetails?.businessLandmark || '',
        
        // Previous employment - MATCHING SCHEMA FIELDS
        prev_employer_name: ameenDrive.occupation?.previousEmployer || '',
        prev_designation: ameenDrive.occupation?.previousDesignation || '',
        prev_experience_years: toNumber(ameenDrive.occupation?.previousYears),
        prev_employer_tel: ameenDrive.occupation?.previousEmployerPhone || '',
        
        // Professional company details - MATCHING SCHEMA FIELDS
        prof_company_name: ameenDrive.professionDetails?.companyName || '',
        prof_address: ameenDrive.professionDetails?.address || '',
        prof_profession: ameenDrive.professionDetails?.profession || '',
        
        // Income details - MATCHING SCHEMA FIELDS
        regular_monthly: toNumber(ameenDrive.incomeBank?.regularMonthly),
        gross_income: toNumber(ameenDrive.incomeBank?.grossIncome),
        net_take_home: toNumber(ameenDrive.incomeBank?.netTakeHome),
        other_monthly_income: toNumber(ameenDrive.incomeBank?.otherIncome),
        source_of_other_income: ameenDrive.incomeBank?.otherIncomeSource || '',
        monthly_income: toNumber(ameenDrive.incomeBank?.monthlyIncome),
        avg_monthly_savings: toNumber(ameenDrive.incomeBank?.monthlyAvgSavings),
        spouse_employed: toBoolean(ameenDrive.incomeBank?.spouseEmployed),
        spouse_income_source: ameenDrive.incomeBank?.spouseIncomeSource || '',
        
        // Signatures - MATCHING SCHEMA FIELDS
        applicant_signature: ameenDrive.signatureSection?.signature || null,
        co_applicant_signature: ameenDrive.signatureSection?.coApplicantSignature || null,
        applicant_signature_cnic: ameenDrive.signatureSection?.signatureCNIC || null,
        co_applicant_signature_cnic: ameenDrive.signatureSection?.coApplicantCNIC || null,
        
        // Bank use details - MATCHING SCHEMA FIELDS
        channel_code: ameenDrive.bankUseOnly?.channelCode || '',
        pb_so_employee_no: ameenDrive.bankUseOnly?.pbEmployeeNo || '',
        program_code: ameenDrive.bankUseOnly?.programCode || '',
        referral_id: ameenDrive.bankUseOnly?.referralId || '',
        branch_code: ameenDrive.bankUseOnly?.branchCode || '',
        sm_employee_no: ameenDrive.bankUseOnly?.smEmployeeNo || '',
        application_source: ameenDrive.bankUseOnly?.applicationSource || '',
        branch_name_code: ameenDrive.bankUseOnly?.branchNameCode || '',
        
        // Dealership
        dealership_name: ameenDrive.vehicleFacilityDetails?.dealerName || '',
        
        // Non-tax payer details
        nontax_full_name: ameenDrive.nonTaxPayer?.fullName || '',
        nontax_resident_of: ameenDrive.nonTaxPayer?.residentOf || '',
        nontax_applied_financing: toBoolean(ameenDrive.nonTaxPayer?.appliedFinancing),
        nontax_no_ntn: toBoolean(ameenDrive.nonTaxPayer?.noNTN),
        nontax_applicant_signature: ameenDrive.nonTaxPayer?.signature || null,
        
        // Stamps
        dealer_stamp: ameenDrive.stamps?.dealerStamp || null,
        branch_stamp: ameenDrive.stamps?.branchStamp || null,
      };

      // Prepare child tables
      const bankAccounts = Array.isArray(ameenDrive.bank_accounts)
        ? ameenDrive.bank_accounts.filter((acc: any) => acc && Object.values(acc).some(v => v !== '' && v !== null && v !== undefined))
        : [];
      const bankFacilities = Array.isArray(ameenDrive.bank_facilities)
        ? ameenDrive.bank_facilities.filter((f: any) => f && Object.values(f).some(v => v !== '' && v !== null && v !== undefined))
        : [];
      const references = Array.isArray(ameenDrive.referenceDetails)
        ? ameenDrive.referenceDetails
            .filter((r: any) => r && (r.name || r.cnic || r.mobile))
            .map((r: any, idx: number) => ({
              reference_no: String(idx + 1),
              name: r.name || '',
              cnic: r.cnic || '',
              relationship: r.relation || '',
              relationship_other: r.relationOther || '',
              address: r.address || '',
              residence_no: r.residenceNo || '',
              mobile_no: r.mobile || '',
              email: r.email || '',
              business_address: r.businessAddress || '',
              office_telephone_no: r.officePhone || ''
            }))
        : [];

      const payload = {
        ...formData,
        bank_accounts: bankAccounts,
        bank_facilities: bankFacilities,
        references
      };

      // Log the submission data for debugging
      console.log("Submitting Ameen Drive application data:", payload);

      // Send data to backend
      const response = await fetch(`${getBaseUrl()}/api/ameendrive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Your Ameen Drive application has been submitted successfully. Redirecting to document upload...",
        });
        
        // Store minimal info for documents page to fetch proper customer data
        const submissionInfo = {
          applicationId: data.application_id,
          applicationType: 'AmeenDrive'
        };
        
        // Store in localStorage for documents page to pick up
        localStorage.setItem('lastApplicationSubmission', JSON.stringify(submissionInfo));
        
        // Redirect to documents page
        router.push('/dashboard/documents');
      } else {
        throw new Error(data.error || 'Failed to submit Ameen Drive application');
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


  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <h2 className="text-3xl text-center  font-bold text-primary">Ameen Drive Application</h2>

      {/* Mandatory Fields Note */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="text-sm text-blue-800">
          <strong>Note:</strong> Fields marked with an asterisk (*) are mandatory and must be filled before submission.
        </div>
      </div>

      {/* Simple Autofill and Validation Controls */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAutofill}
              className="text-green-700 border-green-300 hover:bg-green-50"
            >
              <Zap className="w-4 h-4 mr-2" />
              Autofill Form
            </Button>
            <div className="flex items-center gap-2">
              <Switch
                checked={validationEnabled}
                onCheckedChange={setValidationEnabled}
                className="data-[state=checked]:bg-blue-600"
              />
              <span className="text-sm font-medium text-gray-700">Form Validation</span>
            </div>
          </div>
        </div>
        
        {/* Validation Status */}
        <div className="text-sm text-gray-700">
          {validationEnabled ? (
            validationStatus.isValid ? (
              <span className="text-green-600">✅ All required fields are filled - Form is ready to submit.</span>
            ) : (
              <span className="text-red-600">❌ {validationStatus.missingFields.length} required field(s) missing.</span>
            )
          ) : (
            <span className="text-yellow-600">⚠️ Validation disabled - Form will submit without checking mandatory fields.</span>
          )}
        </div>
        
        {/* Missing Fields List */}
        {validationEnabled && !validationStatus.isValid && validationStatus.missingFields.length > 0 && (
          <div className="mt-3 text-xs bg-red-50 border border-red-200 p-3 rounded">
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

      {/* Customer Info Header */}
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
                <h2 className="text-2xl font-bold text-gray-900">
                  Ameen Drive Application
                </h2>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-lg font-semibold text-gray-700">
                    Consumer ID: {customerData.customerId || 'N/A'}
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

       {/* Chips/Tabs Navigation */}

       <div className="border mt-8 rounded-lg px-8 border-gray-200 mb-6">
      <h3 className="text-lg font-semibold text-gray-700 py-4 mb-2">Form Sections</h3>
      <div className="flex flex-wrap gap-2 mb-6">
        {FORM_SECTIONS.map(section => (
          <button
            key={section.key}
            type="button"
            onClick={() => scrollToSection(section.key)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-2xl shadow
              text-sm font-semibold border transition-all
              ${currentSection === section.key
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-gray-50 text-gray-800 border-gray-200"}
              ${sectionFilled[section.key] ? "ring-2 ring-green-400" : ""}
            `}
          >
            {section.label}
            {sectionFilled[section.key] && (
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            )}
          </button>
        ))}
      </div>
       </div>

      {/* Sections - Wrapped in refs for scroll */}
      <div className="space-y-10">
        <div ref={refs.product}><AmeenDriveProductProgramForm /></div>
        <div ref={refs.vehicle}><AmeenDriveVehicleDetailsForm /></div>
        <div ref={refs.takaful}><AmeenDriveTakafulDetailsForm /></div>
        <div ref={refs.vehicleFacility}><AmeenDriveVehicleFacilityDetailsForm /></div>
        <div ref={refs.personal}><AmeenDrivePersonalDetailsForm /></div>
        <div ref={refs.occupation}><AmeenDriveOccupationForm /></div>
        <div ref={refs.profession}><AmeenDriveProfessionDetailsForm /></div>
        <div ref={refs.incomeBank}><AmeenDriveIncomeBankDetailsForm /></div>
        <div ref={refs.reference}><AmeenDriveReferenceDetailsForm /></div>
        <div ref={refs.signature}><AmeenDriveSignatureSectionForm /></div>
        <div ref={refs.bankUse}><AmeenDriveBankUseOnlyForm /></div>
        <div ref={refs.nonTaxPayer}><AmeenDriveNonTaxPayersForm /></div>
        <div ref={refs.stamps}><AmeenDriveStampsForm /></div>
         <div className="flex justify-end">
          <Button
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