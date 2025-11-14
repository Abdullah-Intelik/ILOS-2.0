"use client";
import React from 'react';
import { useCustomer } from '@/contexts/CustomerContext';
import { formatDateForPakistan } from '@/lib/timezone';

// ✅ Helper: Format CNIC with dashes (12345-1234567-1)
const formatCNIC = (cnic: string) => {
  if (!cnic) return '';
  const cleaned = cnic.replace(/\D/g, ''); // Remove non-digits
  if (cleaned.length === 13) {
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 12)}-${cleaned.slice(12)}`;
  }
  return cnic;
};

// ✅ Helper: Convert number to words (Pakistani format: Lac, Crore)
const numberToWords = (num: number | string) => {
  const amount = typeof num === 'string' ? parseFloat(num.replace(/,/g, '')) : num;
  if (isNaN(amount) || amount === 0) return '';
  
  if (amount >= 10000000) { // 1 Crore = 10 Million
    return `(${(amount / 10000000).toFixed(2)} Crore)`;
  } else if (amount >= 100000) { // 1 Lac = 100 Thousand
    return `(${(amount / 100000).toFixed(2)} Lac)`;
  } else if (amount >= 1000) {
    return `(${(amount / 1000).toFixed(0)} Thousand)`;
  }
  return '';
};

interface MinimalApplicantFormProps {
  sectionTitle?: string;
  sectionNumber?: number;
  isETB?: boolean;
}

/**
 * MinimalApplicantForm - Modern, streamlined form for applicant details
 * Based on industry research - 14 essential fields only
 * Heavily auto-filled for ETB customers
 */

export const MinimalApplicantForm: React.FC<MinimalApplicantFormProps> = ({
  sectionTitle = "Personal Information",
  sectionNumber = 3,
  isETB = false,
}) => {
  const { customerData, updateCustomerData } = useCustomer();

  // Defensive defaults
  const personalDetails = customerData?.personalDetails || {};
  const addressDetails = customerData?.addressDetails || {};
  const currentAddress = addressDetails.currentAddress || {};
  const contactDetails = customerData?.contactDetails || {};
  const employmentDetails = customerData?.employmentDetails || {};
  const incomeDetails = customerData?.incomeDetails || {};
  const bankingDetails = customerData?.bankingDetails || customerData?.clientBanks || {};
  const clientBanks = customerData?.clientBanks || {};

  // ✅ CRITICAL FIX: Map CBS field names to form field names
  // CBS uses 'sex' and 'maritial_status', form uses 'gender' and 'maritalStatus'
  const rawGender = personalDetails.gender || (personalDetails as any).sex || '';
  // Convert "Male" → "M", "Female" → "F" (form dropdown expects single letter)
  const mappedGender = rawGender
    ? (rawGender.toUpperCase().startsWith('M') ? 'M' : rawGender.toUpperCase().startsWith('F') ? 'F' : rawGender)
    : '';
  
  const rawMaritalStatus = personalDetails.maritalStatus || (personalDetails as any).maritial_status || '';
  // Convert "MARRIED" → "Married", "SINGLE" → "Single", etc.
  const mappedMaritalStatus = rawMaritalStatus
    ? rawMaritalStatus.charAt(0).toUpperCase() + rawMaritalStatus.slice(1).toLowerCase()
    : '';

  // Helper function to convert date from various formats to YYYY-MM-DD (Pakistan timezone)
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    
    // If already in YYYY-MM-DD format, return as is
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString;
    }
    
    // For ISO timestamps or any Date-parseable string, use Pakistan timezone
    if (dateString.includes('T') || dateString.includes('Z') || dateString.includes('-')) {
      return formatDateForPakistan(dateString);
    }
    
    // Convert DD.MM.YYYY or DD-MM-YYYY to YYYY-MM-DD
    const parts = dateString.split(/[.-]/);
    if (parts.length === 3) {
      const [day, month, year] = parts;
      // Handle 2-digit year
      const fullYear = year.length === 2 ? `20${year}` : year;
      return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    return '';
  };

  // Store original CBS/OCR data for color coding (don't modify these)
  const cbsData = React.useMemo(() => {
    const data = {
      firstName: customerData?.personalDetails?.firstName || null,
      lastName: customerData?.personalDetails?.lastName || null,
      cnic: customerData?.personalDetails?.cnic || null,
      dateOfBirth: customerData?.personalDetails?.dateOfBirth || null,
      gender: mappedGender || null,
      maritalStatus: mappedMaritalStatus || null,
      mobileNumber: customerData?.personalDetails?.mobileNumber || null,
      email: customerData?.personalDetails?.email || null,
      address: (customerData as any)?.currentAddress?.fullAddress || null,
      bankName: customerData?.clientBanks?.bank_name || null,
      accountNumber: customerData?.clientBanks?.accountNumber || (customerData?.clientBanks as any)?.actt_no || (customerData?.clientBanks as any)?.acc_no || customerData?.bankingDetails?.accountNumber || null,
    };
    return data;
  }, [customerData, mappedGender, mappedMaritalStatus]);

  // Helper function to get field styles based on data source
  const getFieldStyle = (currentValue: any, cbsValue: any, ocrValue: any = null, fieldName: string = '') => {
    if (!currentValue) {
      return {}; // Empty field - use default styles
    }
    
    // Normalize values for comparison (trim whitespace, handle ISO dates)
    let normalizedCurrent = String(currentValue).trim();
    let normalizedCBS = cbsValue ? String(cbsValue).trim() : null;
    const normalizedOCR = ocrValue ? String(ocrValue).trim() : null;
    
    // Special handling for dates: Convert both to YYYY-MM-DD in Pakistan timezone
    if (fieldName === 'dateOfBirth' || normalizedCBS?.includes('T') || normalizedCBS?.includes('Z')) {
      // Convert CBS date to YYYY-MM-DD in Pakistan timezone
      if (normalizedCBS) {
        normalizedCBS = formatDateForPakistan(normalizedCBS);
      }
      // Convert current value to Pakistan timezone if it contains time
      if (normalizedCurrent.includes('T') || normalizedCurrent.includes('Z')) {
        normalizedCurrent = formatDateForPakistan(normalizedCurrent);
      } else {
        normalizedCurrent = normalizedCurrent.split('T')[0]; // Remove time if present
      }
    }
    
    const isMatch = normalizedCBS && normalizedCurrent === normalizedCBS;
    const isOCRMatch = normalizedOCR && normalizedCurrent === normalizedOCR;
    
    // Return inline styles (these ALWAYS work, not affected by Tailwind purging)
    if (isMatch) {
      return { backgroundColor: '#eff6ff', borderColor: '#93c5fd' }; // Blue-50 and blue-300
    }
    if (isOCRMatch) {
      return { backgroundColor: '#f0fdf4', borderColor: '#86efac' }; // Green-50 and green-300
    }
    return {}; // Default white
  };



  // Handlers
  const handlePersonalChange = (field: string, value: any) => {
    updateCustomerData({
      personalDetails: { ...personalDetails, [field]: value }
    });
  };

  const handleAddressChange = (field: string, value: any) => {
    // Ensure fullAddress is always a string
    const newAddress = field === 'fullAddress' && typeof value === 'string' 
      ? value 
      : (typeof (currentAddress as any)[field] === 'object' ? '' : (currentAddress as any)[field]);
    
    updateCustomerData({
      addressDetails: {
        ...addressDetails,
        currentAddress: { 
          ...currentAddress, 
          [field]: field === 'fullAddress' ? value : newAddress 
        }
      }
    });
  };

  const handleEmploymentChange = (field: string, value: any) => {
    updateCustomerData({
      employmentDetails: { ...employmentDetails, [field]: value }
    });
  };

  const handleIncomeChange = (field: string, value: any) => {
    updateCustomerData({
      incomeDetails: { ...incomeDetails, [field]: value }
    });
  };

  const handleBankingChange = (field: string, value: any) => {
    updateCustomerData({
      clientBanks: { ...clientBanks, [field]: value }
    });
  };


  return (
    <section className="mb-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Modern Header with Teal Gradient Accent */}
      <div className="bg-gradient-to-r from-slate-50 via-white to-teal-50/30 border-l-4 border-teal-500 px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 text-white font-bold text-base shadow-sm">
              {sectionNumber}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                {sectionTitle}
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                {isETB ? '~80% auto-filled from your account' : 'Please provide your information'}
              </p>
            </div>
          </div>
          {/* Color Legend */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-50 border-2 border-blue-300"></div>
              <span className="text-slate-700 font-medium">CBS</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-50 border-2 border-green-300"></div>
              <span className="text-slate-700 font-medium">OCR</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-7 bg-white space-y-8">
        
        {/* ==================== IDENTITY & BASIC INFO ==================== */}
        <div className="space-y-5">
          <h4 className="text-base font-bold text-slate-800 pb-2 border-b-2 border-teal-500/20">
            Identity & Basic Information
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Full Name */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-slate-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="First Name"
                  className="w-full rounded-lg border px-4 py-3 text-sm text-slate-900 font-medium focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all placeholder:text-slate-400"
                  style={getFieldStyle(personalDetails.firstName, cbsData.firstName, null, 'firstName')}
                  value={personalDetails.firstName || ''}
                  onChange={(e) => handlePersonalChange('firstName', e.target.value)}
                  readOnly={isETB}
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  className="w-full rounded-lg border px-4 py-3 text-sm text-slate-900 font-medium focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all placeholder:text-slate-400"
                  style={getFieldStyle(personalDetails.lastName, cbsData.lastName, null, 'lastName')}
                  value={personalDetails.lastName || ''}
                  onChange={(e) => handlePersonalChange('lastName', e.target.value)}
                  readOnly={isETB}
                />
              </div>
            </div>

            {/* CNIC Number */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-slate-700">
                CNIC Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="12345-1234567-1"
                maxLength={15}
                className="w-full rounded-lg border px-4 py-3 text-sm text-slate-900 font-medium focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all placeholder:text-slate-400"
                style={getFieldStyle(personalDetails.cnic, cbsData.cnic, null, 'cnic')}
                value={formatCNIC(personalDetails.cnic || '')}
                onChange={(e) => {
                  // Allow only digits and dashes
                  const cleaned = e.target.value.replace(/[^\d-]/g, '');
                  handlePersonalChange('cnic', cleaned.replace(/-/g, '')); // Store without dashes
                }}
                readOnly={isETB}
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-slate-700">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className="w-full rounded-lg border px-4 py-3 text-sm text-slate-900 font-medium focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
                style={getFieldStyle(personalDetails.dateOfBirth, cbsData.dateOfBirth, null, 'dateOfBirth')}
                value={formatDateForInput(personalDetails.dateOfBirth || '')}
                onChange={(e) => handlePersonalChange('dateOfBirth', e.target.value)}
                readOnly={isETB}
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-slate-700">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full rounded-lg border px-4 py-3 text-sm text-slate-900 font-medium focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
                  style={getFieldStyle(mappedGender, cbsData.gender, null, 'gender')}
                value={mappedGender}
                onChange={(e) => handlePersonalChange('gender', e.target.value)}
              >
                <option value="">Select...</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
              </select>
            </div>

            {/* Marital Status */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-slate-700">
                Marital Status <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full rounded-lg border px-4 py-3 text-sm text-slate-900 font-medium focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
                  style={getFieldStyle(mappedMaritalStatus, cbsData.maritalStatus, null, 'maritalStatus')}
                value={mappedMaritalStatus}
                onChange={(e) => handlePersonalChange('maritalStatus', e.target.value)}
              >
                <option value="">Select...</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
            </div>
          </div>
        </div>

        {/* ==================== CONTACT INFORMATION ==================== */}
        <div className="space-y-5">
          <h4 className="text-base font-bold text-slate-800 pb-2 border-b-2 border-teal-500/20">
            Contact Information
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Mobile Number */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-slate-700">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="03XX-XXXXXXX"
                maxLength={12}
                className="w-full rounded-lg border px-4 py-3 text-sm text-slate-900 font-medium focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all placeholder:text-slate-400"
                  style={getFieldStyle(personalDetails.mobileNumber, cbsData.mobileNumber, null, 'mobileNumber')}
                value={personalDetails.mobileNumber || ''}
                onChange={(e) => handlePersonalChange('mobileNumber', e.target.value)}
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-slate-700">
                Email Address <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="email"
                placeholder="example@email.com"
                className="w-full rounded-lg border px-4 py-3 text-sm text-slate-900 font-medium focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all placeholder:text-slate-400"
                  style={getFieldStyle(personalDetails.email, cbsData.email, null, 'email')}
                value={personalDetails.email || ''}
                onChange={(e) => handlePersonalChange('email', e.target.value)}
              />
            </div>

            {/* Residential Address */}
            <div className="md:col-span-2">
              <label className="block mb-2 text-sm font-semibold text-slate-700">
                Residential Address <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="House/Flat No., Street, Area, City"
                className="w-full rounded-lg border px-4 py-3 text-sm text-slate-900 font-medium focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all placeholder:text-slate-400 resize-none"
                  style={getFieldStyle(currentAddress.fullAddress, cbsData.address, null, 'address')}
                value={typeof currentAddress.fullAddress === 'string' ? currentAddress.fullAddress : ''}
                onChange={(e) => handleAddressChange('fullAddress', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ==================== EMPLOYMENT & INCOME ==================== */}
        <div className="space-y-5">
          <h4 className="text-base font-bold text-slate-800 pb-2 border-b-2 border-teal-500/20">
            Employment & Income
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Employment Type */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-slate-700">
                Employment Type <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 font-medium bg-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
                value={employmentDetails.employmentStatus || ''}
                onChange={(e) => handleEmploymentChange('employmentStatus', e.target.value)}
              >
                <option value="">Select...</option>
                <option value="Salaried">Salaried</option>
                <option value="Self-Employed">Self-Employed</option>
                <option value="Business">Business Owner</option>
                <option value="Retired">Retired</option>
              </select>
            </div>

            {/* Employer Name */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-slate-700">
                Employer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Company/Business Name"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 font-medium bg-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all placeholder:text-slate-400"
                value={employmentDetails.companyName || ''}
                onChange={(e) => handleEmploymentChange('companyName', e.target.value)}
              />
            </div>

            {/* Designation / Job Title */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-slate-700">
                Designation / Job Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Manager, Engineer, Owner"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 font-medium bg-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all placeholder:text-slate-400"
                value={employmentDetails.designation || ''}
                onChange={(e) => handleEmploymentChange('designation', e.target.value)}
              />
            </div>

            {/* Employment Tenure */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-slate-700">
                Employment Tenure <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  placeholder="24"
                  className="w-full rounded-lg border border-slate-300 pl-4 pr-20 py-3 text-sm text-slate-900 font-medium bg-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all placeholder:text-slate-400"
                  value={employmentDetails.currentExperience || ''}
                  onChange={(e) => handleEmploymentChange('currentExperience', e.target.value)}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-medium">
                  months
                </span>
              </div>
            </div>

            {/* Office Address */}
            <div className="md:col-span-2">
              <label className="block mb-2 text-sm font-semibold text-slate-700">
                Office Address <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={2}
                placeholder="Office/Business Address"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 font-medium bg-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all placeholder:text-slate-400 resize-none"
                value={typeof employmentDetails.officeAddress === 'string' ? employmentDetails.officeAddress : ''}
                onChange={(e) => handleEmploymentChange('officeAddress', e.target.value)}
              />
            </div>

            {/* Monthly Income */}
            <div className="md:col-span-2">
              <label className="block mb-2 text-sm font-semibold text-slate-700">
                Monthly Income <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-600 font-semibold whitespace-nowrap">
                  PKR
                </span>
                <div className="flex-1">
                  <input
                    type="text"
                    inputMode="numeric"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 font-medium bg-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
                    placeholder="50,000"
                    value={incomeDetails.monthlyIncome || ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^\d]/g, '');
                      handleIncomeChange('monthlyIncome', value);
                    }}
                  />
                  {incomeDetails.monthlyIncome && (
                    <p className="text-xs text-teal-600 font-medium mt-1">
                      {numberToWords(incomeDetails.monthlyIncome)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== BANKING DETAILS ==================== */}
        <div className="space-y-5">
          <h4 className="text-base font-bold text-slate-800 pb-2 border-b-2 border-teal-500/20">
            Banking Details
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Bank Name */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-slate-700">
                Bank Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., XYZ Bank Limited"
                className="w-full rounded-lg border px-4 py-3 text-sm text-slate-900 font-medium focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all placeholder:text-slate-400"
                  style={getFieldStyle(clientBanks?.bank_name, cbsData.bankName, null, 'bankName')}
                value={clientBanks?.bank_name || ''}
                onChange={(e) => handleBankingChange('bank_name', e.target.value)}
              />
            </div>

            {/* Bank Account Number (IBAN) */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-slate-700">
                Bank Account Number (IBAN) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="PKXXUBXXXXXXXXXXXXXXXX"
                className="w-full rounded-lg border px-4 py-3 text-sm text-slate-900 font-medium focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all placeholder:text-slate-400"
                  style={getFieldStyle(clientBanks?.accountNumber || bankingDetails?.accountNumber, cbsData.accountNumber, null, 'accountNumber')}
                value={clientBanks?.accountNumber || bankingDetails?.accountNumber || ''}
                onChange={(e) => handleBankingChange('accountNumber', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mt-6 px-5 py-4 bg-gradient-to-r from-teal-50 to-emerald-50 border-l-4 border-teal-500 rounded-lg">
          <p className="text-sm text-slate-700 leading-relaxed">
            <span className="font-bold text-slate-900">📋 Information:</span> All fields marked with <span className="text-red-500 font-bold">*</span> are mandatory. Your information will be verified through official databases.
          </p>
        </div>
      </div>
    </section>
  );
};
