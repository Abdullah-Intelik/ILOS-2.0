/**
 * Type definitions for Platinum Credit Card forms
 */

// Define the Reference type structure
export interface Reference {
  name?: string;
  relationship?: string;
  nic?: string;
  address?: string;
  phones?: string;
  ntn?: string;
}

// Extend the CustomerData interface to include Platinum-specific fields
export interface PlatinumCustomerData {
  // Basic customer info
  customerId?: string;
  cnic?: string;
  isETB?: boolean;
  cifData?: any;
  
  // Personal details
  personalDetails?: {
    title?: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    fullName?: string;
    cnic?: string;
    dateOfBirth?: string;
    gender?: string;
    maritalStatus?: string;
    fatherName?: string;
    motherName?: string;
    mobileNumber?: string;
    email?: string;
    ntn?: string;
    passportNumber?: string;
    nationality?: string;
    education?: string;
    numberOfDependents?: string | number;
  };
  
  // Address details
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
      fullAddress?: string;
    };
    permanentAddress?: {
      houseNo?: string;
      street?: string;
      tehsil?: string;
      nearestLandmark?: string;
      city?: string;
      postalCode?: string;
      fullAddress?: string;
    };
  };
  
  // Next of Kin
  nextOfKin?: {
    fullName?: string;
    name?: string;
    relationship?: string;
    contactNumber?: string;
    telephone?: string;
    alternateNumber?: string;
    address?: string;
  };
  
  // Employment details
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
    occupation?: string;
    companyType?: string;
    businessNature?: string;
    officeAddress?: {
      houseNo?: string;
      street?: string;
      city?: string;
      telephone1?: string;
      telephone2?: string;
      fax?: string;
      fullAddress?: string;
    };
    officePhone?: string;
    officeFax?: string;
  };
  
  // Previous employment
  previousEmployment?: {
    companyName?: string;
    designation?: string;
    experienceYears?: string;
    telephone?: string;
    duration?: string;
  };
  
  // Income details
  incomeDetails?: {
    monthlyIncome?: number | string;
    grossMonthlySalary?: number | string;
    grossMonthlyIncome?: number | string;
    otherMonthlyIncome?: number | string;
    netMonthlyIncome?: number | string;
    totalIncome?: number | string;
    otherIncomeSource?: string;
    spouseEmployed?: boolean | string;
    spouseIncome?: number | string;
    spouseIncomeSource?: string;
  };
  
  // Banking details
  bankingDetails?: {
    accountNumber?: string;
    isUblCustomer?: boolean | string;
    ublAccountNumber?: string;
    bankName?: string;
    branchName?: string;
    accountType?: string;
    accountOpeningDate?: string;
    iban?: string;
    paymentOption?: string;
    cardDeliveryPreference?: string;
    statementDeliveryMethod?: string;
  };
  
  // Auto Debit (Platinum-specific)
  autoDebit?: {
    accountNumber?: string;
    paymentOption?: string;
    signature?: string;
    date?: string;
  };
  
  // Declaration
  declaration?: {
    agreed?: boolean;
    signature?: string;
    date?: string;
    termsAgreed?: boolean;
    contactConfirmation?: boolean | string;
  };
  
  // Bank section declaration
  declarationBank?: {
    verified?: boolean;
    creditGuardian?: boolean;
    staffDeclarationFile?: string;
  };
  
  // Credit Guardian (Platinum-specific)
  creditGuardian?: {
    enabled?: boolean;
    smsAlert?: boolean;
    creditGuardian?: boolean;
    signature?: string;
    date?: string;
  };
  
  // Supplementary Card
  supplementaryCard?: {
    title?: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    fullName?: string;
    nameOnCard?: string;
    fatherHusbandName?: string;
    creditLimitPercent?: number | string;
    creditLimitAmount?: number | string;
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
  
  // References data
  references?: Reference[];
  
  // Existing cards/accounts
  supplementaryCards?: Array<any>;
  otherBanks?: Array<{
    bankName?: string;
    branch?: string;
    accountNumber?: string;
    bank_name?: string; // Alternative naming for API compatibility
    account_no?: string; // Alternative naming for API compatibility
  }>;
  otherCreditCards?: Array<{
    bankName?: string;
    cardType?: string;
    cardNumber?: string;
    creditLimit?: number | string;
    bank_name?: string; // Alternative naming for API compatibility
    card_type?: string; // Alternative naming for API compatibility
    card_number?: string; // Alternative naming for API compatibility
    credit_limit?: number; // Alternative naming for API compatibility
  }>;
  
  // Loan facilities
  hasLoanFacilities?: boolean | string;
  loanFacilities?: Array<{
    bankName?: string;
    loanType?: string;
    outstandingAmount?: number | string;
    monthlyInstallment?: number | string;
    details?: string;
    loanDetails?: string;
  }>;
  
  // Lien marked (Platinum-specific)
  lienMarked?: {
    marked?: boolean;
    collateralType?: string;
    bank?: string;
    branch?: string;
    accountNo?: string;
    accountType?: string;
    lienAmount?: number | string;
    currency?: string;
    accountTitle?: string;
    maturityDate?: string;
  };
  
  // Bank use only
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
  
  // Platinum card specific details
  platinumCard?: {
    nameOnCard?: string;
    cnicIssuanceDate?: string;
    cnicExpiryDate?: string;
    oldNic?: string;
    vehicleMake?: string;
    vehicleModel?: string;
    vehicleYear?: number | string;
    vehicleRegistrationNo?: string;
    ownership?: string;
    leased?: string;
    typeOfAccommodation?: string;
    cardDestination?: string;
    statementDelivery?: string;
    estatementEmail?: string;
  };
} 