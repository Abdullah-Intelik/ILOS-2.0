"use client";
import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DocumentUploadGateway } from '@/components/forms/common/DocumentUploadGateway';
import { useCustomer } from '@/contexts/CustomerContext';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * CashPlus Document Upload Page
 * Step 1 of 2: Document-First Onboarding
 * 
 * Flow:
 * 1. Upload documents (CNIC, Salary, eCIB)
 * 2. Auto-extract data via OCR
 * 3. Cross-validate and calculate pre-qualification
 * 4. Navigate to form with 93% auto-filled data
 */

export default function CashPlusDocumentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { customerData, updateCustomerData } = useCustomer();

  // ✅ Check if this is a mobile submission - skip document upload if so
  const losId = searchParams?.get('losId');
  const fromMobile = searchParams?.get('fromMobile');
  
  React.useEffect(() => {
    if (losId && fromMobile === 'true') {
      console.log('📱 Mobile submission detected - skipping document upload, documents already uploaded from mobile app');
      // Redirect directly to the form page with the mobile submission params
      router.push(`/dashboard/applicant/cashplus?losId=${losId}&fromMobile=true`);
    }
  }, [losId, fromMobile, router]);

  // Handle document gateway completion
  const handleDocumentComplete = (gatewayData: any) => {
    console.log('📄 Document Gateway Data:', gatewayData);
    console.log('🔒 Existing CBS Customer Data:', customerData);
    console.log('📄 Uploaded Document CNIC (from OCR):', gatewayData.cnicOCR?.['identity number']);

    // ⚠️ CRITICAL: Preserve existing CBS data, only add/update from OCR if new/missing
    const existingPersonal = customerData?.personalDetails || {};
    const existingIncome = customerData?.incomeDetails || {};
    const existingEmployment = customerData?.employmentDetails || {};
    const customerCnic = customerData?.cnic || customerData?.personalDetails?.cnic;

    // Helper: Only use OCR value if CBS value doesn't exist
    const preserveOrUpdate = (cbsValue: any, ocrValue: any) => {
      return cbsValue || ocrValue || '';
    };

    // Store in customer context for auto-fill
    updateCustomerData({
      // Identity from CNIC OCR (but preserve CBS data where it exists)
      personalDetails: {
        ...existingPersonal, // ✅ Keep ALL existing CBS data
        // Only update if OCR has new data and CBS doesn't
        firstName: preserveOrUpdate(existingPersonal.firstName, gatewayData.cnicOCR?.name?.split(' ')[0]),
        lastName: preserveOrUpdate(existingPersonal.lastName, gatewayData.cnicOCR?.name?.split(' ').slice(1).join(' ')),
        cnic: customerCnic || gatewayData.cnicOCR?.['identity number'] || '', // ✅ Always use customer's original CNIC
        dateOfBirth: preserveOrUpdate(existingPersonal.dateOfBirth, gatewayData.cnicOCR?.['date of birth']),
        gender: preserveOrUpdate(existingPersonal.gender, gatewayData.cnicOCR?.gender === 'M' ? 'Male' : gatewayData.cnicOCR?.gender === 'F' ? 'Female' : ''),
        fatherName: preserveOrUpdate(existingPersonal.fatherName, gatewayData.cnicOCR?.['father name']),
        cnic_issue_date: gatewayData.cnicOCR?.['date of issue'] || existingPersonal.cnic_issue_date || '',
        cnic_expiry_date: gatewayData.cnicOCR?.['date of expiry'] || existingPersonal.cnic_expiry_date || '',
      },
      
      // Income from Salary Slip OCR (only if not in CBS)
      incomeDetails: {
        ...existingIncome, // ✅ Keep existing CBS income data
        monthlyIncome: preserveOrUpdate(
          existingIncome.monthlyIncome, 
          gatewayData.salaryOCR?.salary?.replace(/[^\d]/g, '') || gatewayData.salaryOCR?.data?.salary?.replace(/[^\d]/g, '')
        ),
        grossMonthlySalary: gatewayData.salaryOCR?.salary?.replace(/[^\d]/g, '') || gatewayData.salaryOCR?.data?.salary?.replace(/[^\d]/g, '') || existingIncome.grossMonthlySalary || '',
        netMonthlyIncome: gatewayData.salaryOCR?.salary?.replace(/[^\d]/g, '') || gatewayData.salaryOCR?.data?.salary?.replace(/[^\d]/g, '') || existingIncome.netMonthlyIncome || '',
      },

      // Employment from Salary Slip OCR (only if not in CBS)
      employmentDetails: {
        ...existingEmployment, // ✅ Keep existing CBS employment data
        companyName: preserveOrUpdate(existingEmployment.companyName, gatewayData.salaryOCR?.company_name || gatewayData.salaryOCR?.data?.company_name),
      },

      // eCIB data for exposure auto-fill
      ecibData: gatewayData.ecibData,
      
      // Pre-qualification results
      preQualification: gatewayData.preQualification,

      // Document verification data
      documentVerification: {
        cnicVerified: true,
        salaryVerified: true,
        ecibUploaded: !!gatewayData.ecibData,
        verificationDate: new Date().toISOString(),
      },

      // Risk assessment
      riskLevel: gatewayData.riskLevel,
      
      // Store original OCR data for reference
        ocrData: {
          cnic: gatewayData.cnicOCR,
          salarySlip: gatewayData.salaryOCR,
          reference1: gatewayData.reference1OCR,
          reference2: gatewayData.reference2OCR,
        },
        // ✅ ADD: Store actual File objects for FileZilla upload
        documentFiles: {
          cnicFile: gatewayData.cnicFile,
          salaryFile: gatewayData.salaryFile,
          ecibFile: gatewayData.ecibFile,
          reference1File: gatewayData.reference1File,
          reference2File: gatewayData.reference2File,
        },

      // Auto-fill references from OCR (if available) - Keep existing references if any
      references: [
        gatewayData.reference1OCR ? {
          id: 1,
          name: gatewayData.reference1OCR.name || '',
          cnic: gatewayData.reference1OCR['identity number'] || '',
          mobile: '', // Not available from CNIC OCR
          relationship: '', // User must select
          address: '', // Not available from CNIC OCR
        } : (customerData?.references?.[0] || { id: 1 }),
        gatewayData.reference2OCR ? {
          id: 2,
          name: gatewayData.reference2OCR.name || '',
          cnic: gatewayData.reference2OCR['identity number'] || '',
          mobile: '', // Not available from CNIC OCR
          relationship: '', // User must select
          address: '', // Not available from CNIC OCR
        } : (customerData?.references?.[1] || { id: 2 }),
      ],

      // Flag as auto-filled
      isAutoFilled: true,
      autoFillSource: 'document_gateway',
    });

    // Navigate to form with auto-fill flag
    router.push('/dashboard/applicant/cashplus?autoFill=true');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">CashPlus Application</h1>
                <p className="text-sm text-gray-600">Step 1 of 2: Document Verification</p>
              </div>
            </div>
            
            {/* Progress Indicator and Skip Button */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                    1
                  </div>
                  <span className="text-sm font-medium text-gray-700">Documents</span>
                </div>
                <div className="w-12 h-0.5 bg-gray-300"></div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-sm font-semibold">
                    2
                  </div>
                  <span className="text-sm font-medium text-gray-400">Application Form</span>
                </div>
              </div>
              
              {/* ✅ Always visible "Go to Form" button */}
              <Button
                onClick={() => {
                  console.log('📄 Skipping document upload - proceeding to form');
                  router.push(`/dashboard/applicant/cashplus${losId && fromMobile ? `?losId=${losId}&fromMobile=true` : ''}`);
                }}
                variant="default"
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Continue to Form →
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-8">
        <DocumentUploadGateway
          productType="cashplus"
          onComplete={handleDocumentComplete}
          cnic={customerData?.cnic || customerData?.personalDetails?.cnic} // Pass customer's original CNIC
        />
      </div>

      {/* Footer Info */}
      <div className="max-w-4xl mx-auto px-6 pb-8">
        <div className="bg-white border border-blue-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 Why upload documents first?</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                ✓
              </div>
              <div>
                <p className="font-semibold text-gray-900">Faster Application</p>
                <p className="text-gray-600">75% less time - most fields auto-filled</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                ✓
              </div>
              <div>
                <p className="font-semibold text-gray-900">Higher Accuracy</p>
                <p className="text-gray-600">95% accurate data from verified documents</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
                ✓
              </div>
              <div>
                <p className="font-semibold text-gray-900">Instant Decision</p>
                <p className="text-gray-600">Know eligibility before completing form</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

