'use client'

import React from 'react'

interface MinimalFieldDisplayProps {
  data: Record<string, any>
  title?: string
  productType?: 'cashplus' | 'personal_loan' | 'auto' | 'credit_card' | 'islamic'
}

/**
 * MinimalFieldDisplay - Shows ONLY the essential fields from industry research
 * Based on user's research: 14 common fields + product-specific fields
 */
export function MinimalFieldDisplay({ 
  data, 
  title = "Application Data",
  productType = 'cashplus'
}: MinimalFieldDisplayProps) {
  
  // Debug: Log the data structure to help identify field names
  React.useEffect(() => {
    console.log('📊 MinimalFieldDisplay Data:', {
      allKeys: Object.keys(data),
      hasReferences: Array.isArray(data.references),
      referenceCount: data.references?.length,
      firstReference: data.references?.[0],
      hasCreditCards: data.credit_cards_clean?.length,
      hasLoans: data.personal_loans_existing?.length,
      tenure: data.tenure,
      amount: data.amount_requested,
      purpose: data.purpose_of_loan
    });
  }, [data]);
  
  // Helper to format CNIC with dashes
  const formatCNIC = (cnic: string) => {
    if (!cnic) return 'Not provided';
    const cleaned = cnic.replace(/\D/g, '');
    if (cleaned.length === 13) {
      return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 12)}-${cleaned.slice(12)}`;
    }
    return cnic;
  };

  // Helper to safely get field value (Backend V2.0 compatibility)
  const getField = (field1: string, field2?: string, field3?: string) => {
    return data[field1] || (field2 && data[field2]) || (field3 && data[field3]) || null;
  };

  // Helper to convert number to words (Pakistani format)
  const numberToWords = (num: number | string) => {
    const amount = typeof num === 'string' ? parseFloat(num.replace(/,/g, '')) : num;
    if (isNaN(amount) || amount === 0) return '';
    
    if (amount >= 10000000) return `(${(amount / 10000000).toFixed(2)} Crore)`;
    if (amount >= 100000) return `(${(amount / 100000).toFixed(2)} Lac)`;
    if (amount >= 1000) return `(${(amount / 1000).toFixed(0)} Thousand)`;
    return '';
  };

  // Helper to format field values
  const formatValue = (value: any, fieldType?: 'cnic' | 'amount' | 'date'): string => {
    if (value === null || value === undefined || value === '') {
      return 'Not provided';
    }
    
    if (fieldType === 'cnic') {
      return formatCNIC(String(value));
    }
    
    if (fieldType === 'amount') {
      const numValue = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
      if (!isNaN(numValue)) {
        return `PKR ${numValue.toLocaleString()} ${numberToWords(numValue)}`;
      }
    }
    
    if (fieldType === 'date') {
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('en-GB');
        }
      } catch {}
    }
    
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    
    return String(value);
  };

  // ✅ Define ONLY the essential fields from research (Backend V2.0 field names)
  const essentialFields = {
    // Application Details (3 fields)
    application: [
      { key: 'purpose', label: 'Purpose of Loan', type: undefined }, // Backend V2.0 uses 'purpose'
      { key: 'requested_amount', label: 'Amount Requested', type: 'amount' }, // Backend V2.0 uses 'requested_amount'
      { key: 'tenure_months', label: 'Tenure (Months)', type: undefined }, // Backend V2.0 uses 'tenure_months'
    ],
    
    // Personal Information (14 common fields)
    personal: [
      { key: 'first_name', label: 'First Name', type: undefined },
      { key: 'last_name', label: 'Last Name', type: undefined },
      { key: 'cnic', label: 'CNIC Number', type: 'cnic' },
      { key: 'date_of_birth', label: 'Date of Birth', type: 'date' },
      { key: 'marital_status', label: 'Marital Status', type: undefined },
      { key: 'customer_mobile', label: 'Mobile Number', type: undefined }, // Backend V2.0 uses 'customer_mobile'
      { key: 'customer_email', label: 'Email Address', type: undefined }, // Backend V2.0 uses 'customer_email'
      { key: 'residential_address', label: 'Residential Address', type: undefined }, // Backend V2.0 uses 'residential_address'
      { key: 'employment_type', label: 'Employment Type', type: undefined }, // Backend V2.0 uses 'employment_type'
      { key: 'employer_name', label: 'Employer Name', type: undefined }, // Backend V2.0 uses 'employer_name'
      { key: 'designation', label: 'Designation / Job Title', type: undefined },
      { key: 'employment_tenure_months', label: 'Employment Tenure (Months)', type: undefined }, // Backend V2.0 uses 'employment_tenure_months'
      { key: 'monthly_income', label: 'Monthly Income', type: 'amount' }, // Backend V2.0 uses 'monthly_income'
      { key: 'bank_name', label: 'Bank Name', type: undefined },
      { key: 'account_number', label: 'Bank Account Number', type: undefined }, // Backend V2.0 uses 'account_number'
    ],
    
    // Product-Specific Fields
    productSpecific: [] as any[]
  };

  // Add product-specific fields based on loan type
  // Backend V2.0: office_address is in party_details table
  if (productType === 'cashplus' || productType === 'personal_loan') {
    essentialFields.productSpecific = [
      { key: 'office_address', label: 'Office Address', type: undefined },
    ];
  }

  // Exposure (2 Yes/No questions) - Check multiple formats for backward compatibility
  // Format 1: Boolean flags (Backend V2.0 - from applications table)
  // Format 2: Arrays (Old format - credit_cards_clean, personal_loans_existing)
  const hasCreditCards = 
    data.has_existing_cards === true ? 'Yes' :
    data.has_existing_cards === false ? 'No' :
    (data.credit_cards_clean && Array.isArray(data.credit_cards_clean) && data.credit_cards_clean.length > 0) ? 'Yes' : 
    'No';
    
  const hasLoans = 
    data.has_existing_loans === true ? 'Yes' :
    data.has_existing_loans === false ? 'No' :
    (data.personal_loans_existing && Array.isArray(data.personal_loans_existing) && data.personal_loans_existing.length > 0) ? 'Yes' : 
    'No';
  
  const exposureFields = [
    { key: 'credit_cards_status', label: 'Existing Credit Cards', value: hasCreditCards },
    { key: 'loans_status', label: 'Existing Loans', value: hasLoans },
  ];

  // References (First reference only - mandatory) - Extract from references array
  // Backend V2.0 uses: full_name, relationship, mobile, address
  const firstReference = data.references && Array.isArray(data.references) && data.references.length > 0 
    ? data.references[0] 
    : null;
  
  const referenceFields = [
    { key: 'ref_name', label: 'Reference 1 - Name', value: firstReference?.full_name || firstReference?.name },
    { key: 'ref_relationship', label: 'Reference 1 - Relationship', value: firstReference?.relationship },
    { key: 'ref_mobile', label: 'Reference 1 - Mobile', value: firstReference?.mobile },
    { key: 'ref_address', label: 'Reference 1 - Address', value: firstReference?.address || 
      (firstReference ? 
        [firstReference.house_no, firstReference.street, firstReference.area, firstReference.city]
          .filter(Boolean).join(', ') : null) },
  ];

  const renderField = (field: { key: string; label: string; type: any; value?: any }) => {
    // Use field.value if provided (for computed fields like exposure), otherwise get from data
    const value = field.value !== undefined ? field.value : data[field.key];
    const formattedValue = formatValue(value, field.type);
    const hasValue = value !== null && value !== undefined && value !== '';

    return (
      <div 
        key={field.key} 
        className={`${hasValue ? 'bg-teal-50 border-teal-200' : 'bg-gray-50 border-gray-200'} border rounded-lg p-3`}
      >
        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{field.label}</span>
        <div className={`mt-1 text-sm ${hasValue ? 'text-slate-900 font-medium' : 'text-gray-400'} break-words`}>
          {formattedValue}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Application Details */}
      <div className="border-l-4 border-teal-500 rounded-lg p-4 bg-white shadow-sm">
        <h4 className="font-bold text-teal-700 mb-3 flex items-center gap-2">
          📋 Application Details 
          <span className="text-xs font-normal text-slate-500">({essentialFields.application.length} fields)</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {essentialFields.application.map(renderField)}
        </div>
      </div>

      {/* Personal Information */}
      <div className="border-l-4 border-blue-500 rounded-lg p-4 bg-white shadow-sm">
        <h4 className="font-bold text-blue-700 mb-3 flex items-center gap-2">
          👤 Personal Information 
          <span className="text-xs font-normal text-slate-500">({essentialFields.personal.length} fields)</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {essentialFields.personal.map(renderField)}
        </div>
      </div>

      {/* Product-Specific Fields */}
      {essentialFields.productSpecific.length > 0 && (
        <div className="border-l-4 border-purple-500 rounded-lg p-4 bg-white shadow-sm">
          <h4 className="font-bold text-purple-700 mb-3 flex items-center gap-2">
            🎯 Product-Specific 
            <span className="text-xs font-normal text-slate-500">({essentialFields.productSpecific.length} fields)</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {essentialFields.productSpecific.map(renderField)}
          </div>
        </div>
      )}

      {/* Exposure */}
      <div className="border-l-4 border-orange-500 rounded-lg p-4 bg-white shadow-sm">
        <h4 className="font-bold text-orange-700 mb-3 flex items-center gap-2">
          💳 Financial Obligations 
          <span className="text-xs font-normal text-slate-500">({exposureFields.length} fields)</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {exposureFields.map(renderField)}
        </div>
      </div>

      {/* References */}
      <div className="border-l-4 border-green-500 rounded-lg p-4 bg-white shadow-sm">
        <h4 className="font-bold text-green-700 mb-3 flex items-center gap-2">
          👥 References 
          <span className="text-xs font-normal text-slate-500">({referenceFields.length} fields)</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {referenceFields.map(renderField)}
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border-l-4 border-teal-600 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl">✨</div>
          <div>
            <p className="text-sm font-bold text-teal-900">Minimal Form Structure</p>
            <p className="text-xs text-teal-700">
              Showing only essential fields from industry research 
              ({essentialFields.application.length + essentialFields.personal.length + 
                essentialFields.productSpecific.length + exposureFields.length + referenceFields.length} total fields)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

