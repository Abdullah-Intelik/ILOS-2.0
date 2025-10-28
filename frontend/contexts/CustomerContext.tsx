"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react';

// AmeenDrive specific interfaces
interface AmeenDriveVehicleDetails {
  manufacturer?: string;
  model?: string;
  year?: number | string;
  engineSize?: string;
  price?: number | string;
  existingCar?: string;
  carManufacturer?: string;
  carModel?: string;
  carYear?: number | string;
  carStatus?: string;
  usedSellerName?: string;
  usedSellerCnic?: string;
  usedHouseNo?: string;
  usedStreet?: string;
  usedArea?: string;
  usedLandmark?: string;
  usedCity?: string;
  usedCountry?: string;
  usedPostalCode?: string;
  usedContactNo?: string;
  usedBank?: string;
  usedBranch?: string;
  usedAccountNo?: string;
}

interface AmeenDriveProductProgram {
  productType?: string;
  programType?: string;
  paymentMode?: string;
  currentRateKibor?: number | string;
  currentRateSpread?: number | string;
  coApplicantCase?: string;
  coApplicantName?: string;
  coApplicantRelationship?: string;
  facilityAmount?: number | string;
  profitRate?: number | string;
  tenure?: number | string;
  downPayment?: number | string;
  installmentAmount?: number | string;
}

interface AmeenDriveTakafulDetails {
  company?: string;
  type?: string;
  rate?: number | string;
  premium?: number | string;
  period?: number | string;
  trackerCompanyArranged?: string | boolean;
}

interface AmeenDriveVehicleFacilityDetails {
  dealerName?: string;
  dealerAddress?: string;
  dealerPhone?: string;
  vehiclePrice?: number | string;
  accessoriesPrice?: number | string;
  registrationCost?: number | string;
  insuranceCost?: number | string;
  totalCost?: number | string;
  facilityType?: string;
  musharakahSharePercent?: number | string;
  musharakahShareAmount?: number | string;
  autoFinancingPercent?: number | string;
  autoFinancingAmount?: number | string;
  monthlyRental?: number | string;
  monthlyRentalInWords?: string;
  loanPeriod?: number | string;
  deliveryOption?: string;
  agreementUnderstanding?: string | boolean;
}

interface AmeenDriveOccupation {
  type?: string;
  status?: string;
  employerName?: string;
  designation?: string;
  department?: string;
  serviceYears?: number | string;
  grade?: string;
  employerAddress?: string;
  employerPhone?: string;
  previousEmployer?: string;
  previousDesignation?: string;
  previousYears?: number | string;
  previousEmployerPhone?: string;
  businessType?: string;
  businessTypeOther?: string;
}

interface AmeenDriveProfessionDetails {
  type?: string;
  businessName?: string;
  businessType?: string;
  businessYears?: number | string;
  businessAddress?: string;
  businessStreet?: string;
  businessArea?: string;
  businessCity?: string;
  businessCountry?: string;
  businessPostalCode?: string;
  businessPhone?: string;
  businessFax?: string;
  businessLandmark?: string;
  ntnNumber?: string;
  natureOfBusiness?: string;
  percentShareholding?: number | string;
  companyName?: string;
  address?: string;
  profession?: string;
}

interface AmeenDriveIncomeBank {
  monthlyIncome?: number | string;
  otherIncome?: number | string;
  totalIncome?: number | string;
  bankName?: string;
  branchName?: string;
  accountNumber?: string;
  accountType?: string;
  accountSince?: number | string;
  regularMonthly?: number | string;
  grossIncome?: number | string;
  netTakeHome?: number | string;
  otherIncomeSource?: string;
  monthlyAvgSavings?: number | string;
  spouseEmployed?: string | boolean;
  spouseIncomeSource?: string;
}

interface AmeenDriveNonTaxPayer {
  isTaxPayer?: string | boolean;
  wealthSource?: string;
  wealthJustification?: string;
  fullName?: string;
  residentOf?: string;
  appliedFinancing?: string | boolean;
  noNTN?: string | boolean;
  signature?: string;
}

interface AmeenDriveReferenceDetail {
  id?: string | number;
  name?: string;
  relation?: string;
  address?: string;
  phone?: string;
  cnic?: string;
}

interface AmeenDriveSignatureSection {
  signature?: string;
  coApplicantSignature?: string;
  signatureCNIC?: string;
  coApplicantCNIC?: string;
  date?: string;
  declarationAgreed?: boolean | string;
}

interface AmeenDriveStamps {
  stampDuty?: number | string;
  professionalTax?: number | string;
  eStamp?: string;
  dealerStamp?: string;
  branchStamp?: string;
}

interface AmeenDriveBankUseOnly {
  branchCode?: string;
  branchAddress?: string;
  accountOfficer?: string;
  officerCode?: string;
  applicationDate?: string;
  remarks?: string;
  channelCode?: string;
  pbEmployeeNo?: string;
  programCode?: string;
  referralId?: string;
  smEmployeeNo?: string;
  applicationSource?: string;
  branchNameCode?: string;
  dealershipName?: string;
}

interface AmeenDriveData {
  autoApplicationId?: string;
  productProgram?: AmeenDriveProductProgram;
  vehicleDetails?: AmeenDriveVehicleDetails;
  takafulDetails?: AmeenDriveTakafulDetails;
  vehicleFacilityDetails?: AmeenDriveVehicleFacilityDetails;
  occupation?: AmeenDriveOccupation;
  professionDetails?: AmeenDriveProfessionDetails;
  incomeBank?: AmeenDriveIncomeBank;
  nonTaxPayer?: AmeenDriveNonTaxPayer;
  referenceDetails?: AmeenDriveReferenceDetail[];
  signatureSection?: AmeenDriveSignatureSection;
  stamps?: AmeenDriveStamps;
  bankUseOnly?: AmeenDriveBankUseOnly;
}

// CreditCard interface definitions
interface CreditCardInterface {
  title?: string;
  cardType?: string;
  cardCategory?: string;
  specialCardOption?: string;
  photoSubmissionMethod?: string;
  rewardProgram?: string;
  nameOnCard?: string;
  cnicIssuanceDate?: string;
  cnicExpiryDate?: string;
  oldNic?: string;
  typeOfResidence?: string;
  carYear?: string | number;
  carModel?: string;
  carRegistrationNo?: string;
  carOwnership?: string;
  cardDestination?: string;
  statementDelivery?: string;
  emailForStatement?: string;
  paymentOption?: string;
  applicationIdForm?: string;
  applicationReferenceNumber?: string;
  channelCode?: string;
  programCode?: string;
  branchCode?: string;
  salesOfficerName?: string;
  branchName?: string;
  regionName?: string;
  branchManagerRemarks?: string;
  applicationStatus?: string;
  reasonCode?: string;
  analystName?: string;
  availSmsAlert?: boolean | string;
  availCreditGuardian?: boolean | string;
  supplementaryCardholderTitle?: string;
  supplementaryCardholderFirstName?: string;
  supplementaryCardholderMiddleName?: string;
  supplementaryCardholderLastName?: string;
  supplementaryCardholderNameOnCard?: string;
  supplementaryCardholderFatherHusbandName?: string;
  supplementaryCardType?: string;
  supplementaryCardLimitType?: string;
  supplementaryUsageFrequency?: string;
  supplementaryRelationshipToPrincipal?: string;
  supplementaryDob?: string;
  supplementaryGender?: string;
  supplementaryNicOrPassport?: string;
  supplementaryMotherMaidenName?: string;
  supplementaryDate?: string;
  collateralType?: string;
  collateralBank?: string;
  collateralBranch?: string;
  collateralAccountNo?: string;
  collateralAccountType?: string;
  collateralLienAmount?: number | string;
  collateralCurrency?: string;
  collateralTitle?: string;
  collateralMaturityDate?: string;
}

interface OtherBankInterface {
  bank_name?: string;
  branch?: string;
  account_no?: string;
}

interface OtherCreditCardInterface {
  bank_name?: string;
  card_number?: string;
  credit_limit?: string | number;
}

interface CreditCardLoanInterface {
  issuing_bank?: string;
  loan_type?: string;
  loan_amount?: string | number;
  monthly_installment?: string | number;
}

interface SupplementaryCardInterface {
  basic_card_member_name?: string;
  basic_card_cnic_passport?: string;
  basic_card_old_nic?: string;
  supplementary_card_member_name?: string;
  supplementary_cnic_passport?: string;
  supplementary_old_nic?: string;
}

interface PreviousEmploymentInterface {
  companyName?: string;
  designation?: string;
  experienceYears?: string | number;
  telephone?: string;
  employerName?: string;
}

interface EmploymentIncomeInterface {
  monthlySalary?: string | number;
  otherIncome?: string | number;
  totalIncome?: string | number;
}

interface CustomerData {
  customerId: string | null;
  isETB: boolean;
  customerType: 'ETB' | 'NTB';
  cnic?: string;
  status?: string;
  losId?: string;
  cifData?: any;
  // Add AmeenDrive property
  ameenDrive?: AmeenDriveData;
  // Add CreditCard properties
  creditCard?: CreditCardInterface;
  otherBanks?: OtherBankInterface[];
  otherCreditCards?: OtherCreditCardInterface[];
  creditCardLoans?: CreditCardLoanInterface[];
  supplementaryCards?: SupplementaryCardInterface[];
  previousEmployment?: PreviousEmploymentInterface;
  employmentIncome?: EmploymentIncomeInterface;
  // Add SME Application property
  smeApplication?: any;
  // Add Commercial Vehicle property
  commercialVehicle?: any;
  personalDetails?: {
    title?: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    fullName?: string;
    cnic?: string;
    fatherName?: string;
    motherName?: string;
    dateOfBirth?: string;
    gender?: string;
    maritalStatus?: string;
    education?: string;
    educationOther?: string;
    mobileNumber?: string;
    email?: string;
    ntn?: string;
    passportNumber?: string;
    numberOfChildren?: number;
    numberOfDependents?: number | string;
    nationality?: string;
    placeOfBirth?: string;
    occupationCode?: string;
  };
  addressDetails?: {
    currentAddress?: {
      fullAddress?: string;
      houseNo?: string;
      street?: string;
      city?: string;
      area?: string;
      tehsil?: string;
      postalCode?: string;
      nearestLandmark?: string;
      yearsAtAddress?: string | number;
      yearsInCity?: string | number;
      residentialStatus?: string;
      residentialStatusOther?: string;
      monthlyRent?: string | number;
      telephone?: string;
      email?: string;
      // Add missing fields
      country?: string;
      accommodationType?: string;
      residenceNo?: string;
      rentedYears?: string | number;
      mobile?: string;
      fax?: string;
    };
    permanentAddress?: {
      fullAddress?: string;
      houseNo?: string;
      street?: string;
      city?: string;
      area?: string;
      tehsil?: string;
      postalCode?: string;
      nearestLandmark?: string;
      telephone?: string;
      email?: string;
      // Add missing field
      country?: string;
    };
  };
  contactDetails?: {
    mobileType?: string;
    preferredMailingAddress?: string;
    otherContact?: string;
    emailAddress?: string;
  };
  clientBanks?: {
    customer_id?: string;
    position?: string;
    actt_no?: string;
    bank_name?: string;
    branch?: string;
    version?: string;
    created_at?: string;
  };
  employmentDetails?: {
    employmentStatus?: string;
    companyName?: string;
    companyType?: string;
    companyTypeOther?: string;
    department?: string;
    designation?: string;
    grade?: string;
    currentExperience?: string | number;
    previousExperience?: string | number;
    officeAddress?: {
      houseNo?: string;
      street?: string;
      city?: string;
      tehsil?: string;
      postalCode?: string;
      nearestLandmark?: string;
      fax?: string;
      telephone1?: string;
      telephone2?: string;
      extension?: string;
    };
    industry?: string;
    business?: string;
    // Additional fields needed for CreditCard
    occupation?: string;
    sector?: string;
    employerName?: string;
    employeeNumber?: string;
    businessType?: string;
    companyPhone?: string;
  };
  bankingDetails?: {
    isUblCustomer?: string;
    ublAccountNumber?: string;
    bankName?: string;
    branchName?: string;
    accountNumber?: string;
    accountType?: string;
    accountOpeningDate?: string;
    iban?: string;
    paymentOption?: string;
  };
  incomeDetails?: {
    grossMonthlySalary?: string | number;
    otherMonthlyIncome?: string | number;
    netMonthlyIncome?: string | number;
    otherIncomeSource?: string;
    otherIncomeSourceSpecify?: string;
    monthlyIncome?: string | number;
    estimatedNetWorth?: string | number;
    declaredNetWorth?: string | number;
    assessedNetWorth?: string | number;
    annualSales?: string | number;
    // Additional fields needed for CreditCard
    totalIncome?: string | number;
    spouseEmployed?: boolean | string;
    spouseIncome?: string | number;
    spouseIncomeSource?: string;
  };
  loanPreference?: {
    loanType?: string;
    amountRequested?: string | number;
    minAmountAcceptable?: string | number;
    maxAffordableInstallment?: string | number;
    tenure?: string | number;
  };
  applicationDetails?: {
    ublExistingCustomer?: string;
    branch?: string;
    account?: string;
    loanPurpose?: string;
    loanPurposeOther?: string;
  };
  exposures?: {
    creditCardsClean?: Array<{
      sr_no?: string;
      bank_name?: string;
      approved_limit?: string | number;
    }>;
    creditCardsSecured?: Array<{
      sr_no?: string;
      bank_name?: string;
      approved_limit?: string | number;
    }>;
    personalLoansExisting?: Array<{
      sr_no?: string;
      bank_name?: string;
      approved_limit?: string | number;
      outstanding_amount?: string | number;
      as_of?: string;
    }>;
    otherFacilities?: Array<{
      sr_no?: string;
      bank_name?: string;
      approved_limit?: string | number;
      nature?: string;
      current_outstanding?: string | number;
    }>;
    personalLoansUnderProcess?: Array<{
      sr_no?: string;
      bank_name?: string;
      facility_under_process?: string;
      nature_of_facility?: string;
    }>;
  };
  references?: Array<{
    id?: string | number;
    name?: string;
    cnic?: string;
    relationship?: string;
    houseNo?: string;
    street?: string;
    area?: string;
    city?: string;
    postalCode?: string;
    telephoneResidence?: string;
    telephoneOffice?: string;
    mobile?: string;
    fax?: string;
    email?: string;
    nearestLandmark?: string;
    ntn?: string;
  }>;
  declaration?: {
    signature?: string;
    date?: string;
    termsAgreed?: boolean;
    contactConfirmation?: boolean | string;
  };
  bankUseOnly?: {
    applicationSource?: string;
    channelCode?: string;
    soEmployeeNo?: string;
    programCode?: string;
    pbEmployeeNo?: string;
    branchCode?: string;
    smEmployeeNo?: string;
    bmSignature?: string;
  };
  referenceContacts?: Array<any>;
  nextOfKin?: {
    name?: string;
    fullName?: string;
    relationship?: string;
    contactNumber?: string;
    telephone?: string;
    mobile?: string;
    alternateNumber?: string;
    alternateTelephone?: string;
    cnic?: string;
  };

}

interface CustomerContextType {
  customerData: CustomerData | null;
  loading: boolean;
  error: string | null;
  fetchCustomerData: (cnic: string) => Promise<void>;
  updateCustomerData: (data: Partial<CustomerData>) => void;
  clearCustomerData: () => void;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const useCustomer = () => {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
};

interface CustomerProviderProps {
  children: ReactNode;
}

export const CustomerProvider: React.FC<CustomerProviderProps> = ({ children }) => {
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getBaseUrl = () => {
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      return process.env.NEXT_PUBLIC_API_URL || 'https://ilos-backend.vercel.app' || 'http://localhost:5000';
    }
    return 'http://localhost:5000';
  };

  const fetchCustomerData = async (cnic: string) => {
    setLoading(true);
    setError(null);
    setCustomerData(null);

    try {
      const cleanCnic = cnic.replace(/\D/g, '');
      let response, customerResponse;

      // 1. Try customer-status endpoint first
      try {
        response = await fetch(`${getBaseUrl()}/customer-status/${cleanCnic}`);
        if (response.ok) {
          customerResponse = await response.json();
        } else {
          throw new Error(`Customer status API error: ${response.status}`);
        }
      } catch (customerStatusError) {
        // 2. Fallback to getNTB_ETB endpoint
        try {
          response = await fetch(`${getBaseUrl()}/api/getNTB_ETB/${cleanCnic}`);
          if (response.ok) {
            customerResponse = await response.json();
          } else {
            throw new Error(`getNTB_ETB API error: ${response.status}`);
          }
        } catch (getNTBError) {
          // 3. Final fallback for deployed backend
          if (getBaseUrl().includes('vercel.app')) {
            setError('Customer lookup service is being updated. Please try again later or contact support.');
            setLoading(false);
            return;
          }
          throw new Error('Both customer-status and getNTB_ETB endpoints are unavailable');
        }
      }

      // --------- Unified Response Handling ---------
      console.log("DEBUG: Backend response shape:", customerResponse);

      if (!customerResponse) {
        throw new Error('No customer data received');
      }

      // 1. New API style: { isETB: boolean, customer: { ... } }
      if (typeof customerResponse.isETB === 'boolean' && customerResponse.customer) {
        setCustomerData({
          isETB: customerResponse.isETB,
          customerType: customerResponse.isETB ? 'ETB' : 'NTB',
          customerId: customerResponse.customer.customerId || customerResponse.customer.id || null,
          cnic: customerResponse.customer.cnic || cleanCnic,
          status: customerResponse.customer.status || '',
          personalDetails: {
            fullName: customerResponse.customer.fullname || '',
            firstName: customerResponse.customer.firstName || '',
            lastName: customerResponse.customer.lastName || '',
            // Map more fields if needed
          },
          cifData: customerResponse.customer // Store all original fields for future mapping
        });
      }
      // ------------------- NTB (NEW CUSTOMER) HANDLING -------------------
      // These are all possible NTB shapes:
      else if (
        (typeof customerResponse.isETB === 'boolean' && customerResponse.isETB === false) ||
        (typeof customerResponse.status === 'string' && customerResponse.status === 'NTB') ||
        (typeof customerResponse.isExisting === 'boolean' && customerResponse.isExisting === false) ||
        (customerResponse.customer === null && customerResponse.isETB === false)
      ) {
        // Generate NTB customerId
        setCustomerData({
          isETB: false,
          customerType: 'NTB',
          customerId: `NTB-${cleanCnic}`,
          cnic: cleanCnic,
          status: 'NTB',
          personalDetails: {},
        });
      }
      // 2. Customer status API: { cnic, status, customerId, isExisting }
      else if (customerResponse.cnic && customerResponse.customerId && typeof customerResponse.isExisting === 'boolean') {
        // If customer exists, fetch detailed data
        if (customerResponse.isExisting) {
          try {
            const detailResponse = await fetch(`${getBaseUrl()}/cif/${customerResponse.customerId}`);
            const detailData = detailResponse.ok ? await detailResponse.json() : null;
            
            setCustomerData({
              isETB: customerResponse.isExisting,
              customerType: customerResponse.isExisting ? 'ETB' : 'NTB',
              customerId: customerResponse.customerId,
              cnic: customerResponse.cnic,
              status: customerResponse.status || '',
              personalDetails: detailData ? {
                fullName: detailData.fullname || '',
                firstName: detailData.individualInfo?.given_name1 || detailData.fullname?.split(' ')[0] || '',
                middleName: detailData.individualInfo?.given_name2 !== 'N' ? detailData.individualInfo?.given_name2 || '' : '',
                lastName: detailData.individualInfo?.surname || detailData.fullname?.split(' ').slice(1).join(' ') || '',
                fatherName: detailData.individualInfo?.father_husband_name || detailData.dirDetails?.father_name || '',
                motherName: detailData.individualInfo?.maiden_name || '',
                dateOfBirth: detailData.individualInfo?.date_of_birth || '',
                gender: detailData.individualInfo?.sex === 'M' ? 'Male' : detailData.individualInfo?.sex === 'F' ? 'Female' : '',
                maritalStatus: detailData.individualInfo?.maritial_status === 'M' ? 'Married' : detailData.individualInfo?.maritial_status === 'S' ? 'Single' : '',
                mobileNumber: detailData.phone?.phone_no || '',
                email: detailData.email?.address || '',
                ntn: detailData.dirDetails?.ntn || '',
                passportNumber: detailData.customerIdType?.id_type === 'PASSPORT' ? detailData.customerIdType?.id_no : '',
                nationality: detailData.individualInfo?.country_citizenship === 'PK' ? 'Pakistani' : detailData.individualInfo?.country_citizenship || '',
                placeOfBirth: detailData.individualInfo?.palce_of_birth || '',
                occupationCode: detailData.individualInfo?.occupation_code || '',
                cnic: customerResponse.cnic,
                title: detailData.individualInfo?.title || '',
                education: '', // Not available in CIF response
                numberOfChildren: 0, // Not available in CIF response
                numberOfDependents: 0, // Not available in CIF response
              } : {},
              addressDetails: detailData ? {
                currentAddress: {
                  fullAddress: detailData.postal?.address || '',
                  city: detailData.city || '',
                  area: detailData.district || '',
                  postalCode: detailData.postal?.postal_code || '',
                  country: detailData.postal?.address_country_code || detailData.domicileCountry || 'PK',
                  houseNo: '', // Will be parsed from full address if possible
                  street: detailData.postal?.address || '',
                  nearestLandmark: '',
                  yearsAtAddress: 0,
                  yearsInCity: 0,
                  residentialStatus: '',
                  monthlyRent: 0,
                  telephone: detailData.phone?.phone_no || '',
                  email: detailData.email?.address || ''
                },
                permanentAddress: {
                  fullAddress: detailData.postal?.address || '',
                  city: detailData.city || '',
                  area: detailData.district || '',
                  postalCode: detailData.postal?.postal_code || '',
                  country: detailData.postal?.address_country_code || detailData.domicileCountry || 'PK',
                  houseNo: '',
                  street: detailData.postal?.address || '',
                }
              } : {},
              employmentDetails: detailData ? {
                employmentStatus: 'Employed', // Default assumption for existing customers
                industry: detailData.industry || '',
                business: detailData.business || '',
                // Remove occupationCode from here as it's defined in personalDetails
              } : {},
              bankingDetails: detailData ? {
                accountNumber: detailData.clientBanks?.actt_no || '',
                bankName: detailData.clientBanks?.bank_name || '',
                branchName: detailData.clientBanks?.branch || '',
                accountType: 'Current', // Default assumption
                isExistingCustomer: detailData.clientBanks?.bank_name ? 'Yes' : 'No', // Check if customer has bank account
                accountNumber: detailData.clientBanks?.actt_no || '',
              } : {},
              nextOfKin: detailData?.relationship ? {
                name: detailData.relationship.relate_customer_name || '',
                relationship: detailData.relationship.relationship_type || '',
                contactNumber: '', // Not available in CIF response
                cnic: '', // Not available in CIF response
              } : {},
              cifData: detailData // Store all original fields
            });
          } catch (detailError) {
            // If detailed fetch fails, just use basic info
            setCustomerData({
              isETB: customerResponse.isExisting,
              customerType: customerResponse.isExisting ? 'ETB' : 'NTB',
              customerId: customerResponse.customerId,
              cnic: customerResponse.cnic,
              status: customerResponse.status || '',
            });
          }
        } else {
          setCustomerData({
            isETB: customerResponse.isExisting,
            customerType: customerResponse.isExisting ? 'ETB' : 'NTB',
            customerId: customerResponse.customerId,
            cnic: customerResponse.cnic,
            status: customerResponse.status || '',
          });
        }
      }
      // 3. Legacy or local mock API: { status, consumerId, ... }
      else if (
        (typeof customerResponse.status === "string" && customerResponse.consumerId) ||
        (typeof customerResponse.status === "string" && customerResponse.customerId)
      ) {
        setCustomerData({
          isETB: customerResponse.status === 'ETB',
          customerType: customerResponse.status === 'ETB' ? 'ETB' : 'NTB',
          customerId: customerResponse.consumerId || customerResponse.customerId,
          cnic: cleanCnic,
          status: customerResponse.status,
        });
      }
      // 4. Fully expanded backend with all nested data (very rare but possible)
      else if (customerResponse.cnic && customerResponse.customerId) {
        setCustomerData({
          isETB: true,
          customerType: 'ETB',
          customerId: customerResponse.customerId,
          cnic: customerResponse.cnic,
          status: customerResponse.status || '',
          cifData: customerResponse, // keep all nested details
        });
      }
      // 5. Fallback, nothing matched
      else {
        console.error("DEBUG: Unexpected backend response shape!", customerResponse);
        throw new Error('Unexpected response format from server. Check backend or mapping logic.');
      }

    } catch (error) {
      console.error('Error checking customer status:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch customer data');
    } finally {
      setLoading(false);
    }
  };

  const updateCustomerData = (data: Partial<CustomerData>) => {
    setCustomerData(prev => prev ? { ...prev, ...data } : null);
  };

  const clearCustomerData = () => {
    setCustomerData(null);
    setError(null);
  };

  return (
    <CustomerContext.Provider
      value={{
        customerData,
        loading,
        error,
        fetchCustomerData,
        updateCustomerData,
        clearCustomerData
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};
