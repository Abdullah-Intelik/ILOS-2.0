export interface LoanApplication {
  id: string;
  losId: string; // Changed from loanNumber to losId
  loanNumber?: string; // Keep as optional for backward compatibility
  applicantName: string;
  cnic: string;
  customerId: string; // Changed from applicantId to customerId
  loanAmount: number;
  loanType: string;
  status: ApplicationStatus;
  priority: 'high' | 'medium' | 'low';
  applicationDate: string;
  lastUpdated: string;
  currentStep: number;
  rejectionReason?: string;
  documents: Document[];
  currentDepartment: Department;
  workflow: WorkflowStep[];
  history: WorkflowHistory[];
  
  // Applicant details
  applicantDetails?: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: 'male' | 'female' | 'other';
    maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
    education: string;
    occupation: string;
    segment: 'Preferred' | 'Mass' | 'SME';
  };
  
  // Contact details
  contactDetails?: {
    email: string;
    phone: string;
    mobilePhone: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
  };
  
  // Employment details
  employmentDetails?: {
    employerName: string;
    employerAddress: string;
    designation: string;
    employmentDuration: string;
    monthlyIncome: number;
    employmentType: 'salaried' | 'self-employed' | 'business' | 'other';
  };
  
  // Loan details
  loanDetails?: {
    purpose: string;
    tenor: number; // in months
    requestedAmount: number;
    approvedAmount?: number;
    interestRate?: number;
    emi?: number;
    disbursementDate?: string;
    firstInstallmentDate?: string;
  };
  
  // Vehicle details (for auto loans)
  vehicleDetails?: {
    make: string;
    model: string;
    year: number;
    price: number;
    engineNumber?: string;
    chassisNumber?: string;
    registrationNumber?: string;
  };
  
  // Business details (for business loans)
  businessDetails?: {
    businessName: string;
    businessType: string;
    businessAddress: string;
    registrationNumber: string;
    yearEstablished: string;
    annualTurnover: number;
    numberOfEmployees: number;
  };
  
  // SPU verification
  spuVerification?: {
    verifiedBy: string;
    verificationDate: string;
    comments: string;
    missingDocuments: string[];
  };
  
  // COPS verification
  copsVerification?: {
    dataEntryBy: string;
    dataEntryDate: string;
    complianceCheckBy: string;
    complianceCheckDate: string;
    systemEntries: {
      system: string;
      status: 'pending' | 'completed';
      completedBy?: string;
      completedDate?: string;
    }[];
    complianceChecks: {
      check: string;
      status: 'pending' | 'completed' | 'failed';
      completedBy?: string;
      completedDate?: string;
      comments?: string;
    }[];
  };
  
  // EAMVU verification
  eamvuVerification?: {
    assignedAgent: string;
    assignmentDate: string;
    visitDate?: string;
    visitTime?: string;
    locationVerified: boolean;
    businessVerified?: boolean;
    comments: string;
    photos: string[];
    verifiedBy: string;
    verificationDate: string;
  };
  
  // CIU-RRU review
  ciuRruReview?: {
    reviewedBy: string;
    reviewDate: string;
    decision: 'resume' | 'return' | 'reject';
    comments: string;
    pauseReason?: string;
  };
  
  // CIU-AFD verification
  ciuAfdVerification?: {
    verifiedBy: string;
    verificationDate: string;
    fraudChecks: {
      check: string;
      status: 'pending' | 'completed' | 'flagged';
      completedBy?: string;
      completedDate?: string;
      flagReason?: string;
    }[];
    flagged: boolean;
    flagReason?: string;
    comments: string;
  };
  
  // CIU-Acceptance decision
  ciuAcceptanceDecision?: {
    decidedBy: string;
    decisionDate: string;
    decision: 'approved' | 'conditional' | 'rejected';
    conditions?: string[];
    rejectionReason?: string;
    comments: string;
    riskScore: number;
  };
  
  // Disbursement details
  disbursementDetails?: {
    disbursedBy: string;
    disbursementDate: string;
    disbursementAmount: number;
    disbursementAccount: string;
    disbursementMethod: string;
    transactionReference: string;
  };
}

export interface Document {
  id: string;
  name: string;
  type: string;
  required: boolean;
  status: 'pending' | 'verified' | 'rejected' | 'missing';
  uploadDate?: string;
  verifiedBy?: string;
  verifiedDate?: string;
  rejectionReason?: string;
  fileUrl?: string;
  fileSize?: string;
}

export interface WorkflowStep {
  id: number;
  name: string;
  department: Department;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  assignedTo?: string;
  startDate?: string;
  completionDate?: string;
  comments?: string;
}

export interface WorkflowHistory {
  timestamp: string;
  department: Department;
  action: string;
  user: string;
  comments?: string;
}

export type Department = 'pb' | 'spu' | 'cops' | 'eamvu' | 'ciu' | 'rru';

export type ApplicationStatus = 
  // PB statuses
  | 'draft' 
  | 'submitted_to_spu'
  // SPU statuses
  | 'spu_verified'
  | 'spu_returned'
  // COPS statuses
  | 'cops_data_entry'
  | 'cops_compliance_check'
  | 'cops_verified'
  // EAMVU statuses
  | 'eamvu_new'
  | 'eamvu_agent_assigned'
  | 'eamvu_visit_complete'
  | 'eamvu_verified'
  // CIU statuses
  | 'ciu_review'
  | 'ciu_flagged'
  | 'ciu_verified'
  // RRU statuses
  | 'rru_review'
  | 'rru_resumed'
  | 'rru_returned'
  // Final statuses
  | 'approved'
  | 'conditional_approved'
  | 'rejected'
  | 'disbursed';

export type UserRole = 'pb' | 'spu' | 'spu_officer' | 'cops' | 'eamvu' | 'eamvu_officer' | 'ciu' | 'rru' | 'risk' | 'compliance';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  branch?: string;
  department?: string;
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  phone?: string;
  department: 'EAMVU' | 'SPU';
  status: 'active' | 'inactive' | 'on_leave';
  assignedApplications?: number;
  location?: string;
  expertise?: string[];
}

// CIF Data Types
export interface CifData {
  customerId: string;
  cnic?: string;
  status: string;
  category?: string;
  controlBranch?: string;
  creationDate?: string;
  credtingRating?: string;
  customerType?: string;
  domicileCountry?: string;
  domicileState?: string;
  fullname?: string;
  indicator?: string;
  industry?: string;
  internalFlag?: string;
  profitCenter?: string;
  relManager?: string;
  residentFlag?: string;
  riskCountry?: string;
  shortName?: string;
  tableInd?: string;
  typeIndicator?: string;
  class1?: string;
  class2?: string;
  class4?: string;
  business?: string;
  district?: string;
  city?: string;
  clientNoCmc?: string;
  ftRateCategory?: string;
  reclass?: string;
  oenaceCode?: string;
  reporting?: string;
  stopSc?: string;
  clientVersion?: string;
  taxRegCompFlag?: string;
  incorporationCountry?: string;
  location?: string;
  aminusB?: string;
  annualSales?: string;
  createdAt?: string;
  updatedAt?: string;
  // Related CIF data
  customerIdType?: CustomerIdType;
  relationship?: Relationship;
  dirDetails?: DirDetails;
  clientBanks?: ClientBanks;
  postal?: Postal;
  email?: EmailData;
  phone?: PhoneData;
  fax?: FaxData;
  swift?: SwiftData;
  collect?: CollectData;
  individualInfo?: IndividualInfo;
}

export interface CustomerIdType {
  customerId: string;
  position?: string;
  expiryDate?: string;
  idNo?: string;
  idType?: string;
}

export interface Relationship {
  customerId: string;
  position?: string;
  counterRelation?: string;
  customerIdRelated?: string;
  equityPercentage?: string;
  relatedCustomerId?: string;
  relateCustomerName?: string;
  relationshipType?: string;
  relVersion?: string;
}

export interface DirDetails {
  customerId: string;
  position?: string;
  clientNoDir?: string;
  directorName?: string;
  address?: string;
  ntn?: string;
  dateAppointment?: string;
  pgDirector?: string;
  estimatedNetWorth?: string;
  declaredNetWorth?: string;
  assessedNetWorth?: string;
  sharePct?: string;
  nic?: string;
  nomineeInd?: string;
  fatherName?: string;
  husbandName?: string;
  dateExclusion?: string;
  waiveInd?: string;
  nationality?: string;
  version?: string;
}

export interface ClientBanks {
  customerId: string;
  position?: string;
  acttNo?: string;
  bankName?: string;
  branch?: string;
  version?: string;
}

export interface Postal {
  customerId: string;
  position?: string;
  contactSubType?: string;
  address?: string;
  addressCountryCode?: string;
  postalCode?: string;
  holdMailCode?: string;
  clientLang?: string;
  contactRefNo?: string;
  dftlToLoanStmt?: string;
  dftlToRbStmt?: string;
  contactVersion?: string;
}

export interface EmailData {
  customerId: string;
  position?: string;
  contactSubType?: string;
  address?: string;
  clientLang?: string;
  contactRefNo?: string;
  dftlToLoanStmt?: string;
  dftlToRbStmt?: string;
  contactVersion?: string;
}

export interface PhoneData {
  customerId: string;
  position?: string;
  contactSubType?: string;
  phoneNo?: string;
  clientLang?: string;
  contactRefNo?: string;
  dftToLoanStmt?: string;
  dftlToRbStmt?: string;
  contactVersion?: string;
}

export interface FaxData {
  customerId: string;
  position?: string;
  contactSubType?: string;
  faxNo?: string;
  clientLang?: string;
  contactRefNo?: string;
  dftlToLoanStmt?: string;
  dftlToRbStmt?: string;
  contactVersion?: string;
}

export interface SwiftData {
  customerId: string;
  position?: string;
  contactSubType?: string;
  message?: string;
  clientLang?: string;
  contactRefNo?: string;
  dftlToLoanStmt?: string;
  dftlToRbStmt?: string;
  contactVersion?: string;
}

export interface CollectData {
  customerId: string;
  position?: string;
  contactSubType?: string;
  remarks?: string;
  contactVersion?: string;
}

export interface IndividualInfo {
  customerId: string;
  position?: string;
  countryCitizenship?: string;
  countryOfBirth?: string;
  dateOfBirth?: string;
  givenName1?: string;
  givenName2?: string;
  givenName3?: string;
  surname?: string;
  maritialStatus?: string;
  sex?: string;
  residentStatus?: string;
  maidenName?: string;
  title?: string;
  palceOfBirth?: string;
  surnameFirst?: string;
  occupationCode?: string;
  fatherHusbandName?: string;
  indvlVersion?: string;
}