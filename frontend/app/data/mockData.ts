export interface Document {
  id: string
  name: string
  type: string
  status: 'pending' | 'in-verification' | 'approved' | 'rejected' | 'disbursed' | 'verified' | 'missing' | 'error'
  uploadDate: string
  size: string
}

export interface VehicleDetails {
  make: string
  model: string
  year: number
  price: number
}

export interface LoanApplication {
  id: string
  loanNumber: string
  losanNumber?: string
  applicantName: string
  cnic: string
  loanAmount: number
  loanType: string
  status: string
  priority: 'low' | 'medium' | 'high'
  applicationDate: string
  lastUpdated: string
  currentStep: number
  rejectionReason?: string
  documents: Document[]
  vehicleDetails: VehicleDetails
}

export const mockApplications: LoanApplication[] = [
  {
    id: '1',
    loanNumber: 'VL-2024-001',
    losanNumber: 'LOSAN-001-2024',
    applicantName: 'Ahmed Hassan',
    cnic: '42101-1234567-8',
    loanAmount: 2500000,
    loanType: 'Vehicle Loan',
    status: 'approved',
    priority: 'high',
    applicationDate: '2024-01-15',
    lastUpdated: '2024-01-20',
    currentStep: 5,
    documents: [
      { id: '1', name: 'CNIC Copy', type: 'identity', status: 'verified', uploadDate: '2024-01-15', size: '1.2 MB' },
      { id: '2', name: 'Salary Certificate', type: 'income', status: 'verified', uploadDate: '2024-01-15', size: '0.8 MB' },
      { id: '3', name: 'Bank Statement', type: 'financial', status: 'verified', uploadDate: '2024-01-16', size: '2.1 MB' }
    ],
    vehicleDetails: {
      make: 'Toyota',
      model: 'Corolla GLi',
      year: 2024,
      price: 3200000
    }
  },
  {
    id: '2',
    loanNumber: 'VL-2024-002',
    applicantName: 'Fatima Sheikh',
    cnic: '42201-9876543-2',
    loanAmount: 1800000,
    loanType: 'Vehicle Loan',
    status: 'in-verification',
    priority: 'medium',
    applicationDate: '2024-01-18',
    lastUpdated: '2024-01-22',
    currentStep: 3,
    documents: [
      { id: '4', name: 'CNIC Copy', type: 'identity', status: 'verified', uploadDate: '2024-01-18', size: '1.1 MB' },
      { id: '5', name: 'Salary Slip', type: 'income', status: 'pending', uploadDate: '2024-01-18', size: '0.6 MB' },
      { id: '6', name: 'Bank Statement', type: 'financial', status: 'rejected', uploadDate: '2024-01-19', size: '1.8 MB' }
    ],
    vehicleDetails: {
      make: 'Honda',
      model: 'Civic',
      year: 2023,
      price: 2400000
    }
  },
  {
    id: '3',
    loanNumber: 'VL-2024-003',
    applicantName: 'Muhammad Ali',
    cnic: '42301-5555555-5',
    loanAmount: 3200000,
    loanType: 'Vehicle Loan',
    status: 'rejected',
    priority: 'low',
    applicationDate: '2024-01-20',
    lastUpdated: '2024-01-25',
    currentStep: 2,
    rejectionReason: 'Insufficient income documentation',
    documents: [
      { id: '7', name: 'CNIC Copy', type: 'identity', status: 'verified', uploadDate: '2024-01-20', size: '1.3 MB' },
      { id: '8', name: 'Employment Letter', type: 'income', status: 'rejected', uploadDate: '2024-01-20', size: '0.5 MB' }
    ],
    vehicleDetails: {
      make: 'Suzuki',
      model: 'Swift',
      year: 2024,
      price: 2800000
    }
  },
  {
    id: '4',
    loanNumber: 'VL-2024-004',
    applicantName: 'Aisha Khan',
    cnic: '42401-7777777-7',
    loanAmount: 2200000,
    loanType: 'Vehicle Loan',
    status: 'pending',
    priority: 'high',
    applicationDate: '2024-01-25',
    lastUpdated: '2024-01-25',
    currentStep: 1,
    documents: [
      { id: '9', name: 'CNIC Copy', type: 'identity', status: 'pending', uploadDate: '2024-01-25', size: '1.0 MB' }
    ],
    vehicleDetails: {
      make: 'KIA',
      model: 'Picanto',
      year: 2024,
      price: 2500000
    }
  },
  {
    id: '5',
    loanNumber: 'VL-2024-005',
    losanNumber: 'LOSAN-005-2024',
    applicantName: 'Omar Malik',
    cnic: '42501-8888888-8',
    loanAmount: 4500000,
    loanType: 'Vehicle Loan',
    status: 'disbursed',
    priority: 'medium',
    applicationDate: '2024-01-10',
    lastUpdated: '2024-01-28',
    currentStep: 5,
    documents: [
      { id: '10', name: 'CNIC Copy', type: 'identity', status: 'verified', uploadDate: '2024-01-10', size: '1.4 MB' },
      { id: '11', name: 'Salary Certificate', type: 'income', status: 'verified', uploadDate: '2024-01-10', size: '0.9 MB' },
      { id: '12', name: 'Bank Statement', type: 'financial', status: 'verified', uploadDate: '2024-01-11', size: '2.3 MB' }
    ],
    vehicleDetails: {
      make: 'Toyota',
      model: 'Prado',
      year: 2024,
      price: 6000000
    }
  }
]

export const workflowSteps = [
  { id: 1, name: 'Data Entry', status: 'completed' as const },
  { id: 2, name: 'Initial Verification', status: 'completed' as const },
  { id: 3, name: 'CIU Checks', status: 'current' as const },
  { id: 4, name: 'Final Approval', status: 'pending' as const },
  { id: 5, name: 'Disbursement', status: 'pending' as const }
]
