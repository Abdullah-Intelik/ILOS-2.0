"use client"
/**
 * EXAMPLE: New Standardized CashPlus Application Form
 * 
 * This is a reference implementation showing how to use the new common form components.
 * To implement:
 * 1. Backup current page.tsx
 * 2. Replace with this structure
 * 3. Test thoroughly
 * 4. Adjust as needed
 */

import React, { useEffect, useState } from 'react';
import { useCustomer } from '@/contexts/CustomerContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import axios from 'axios';

// NEW: Import common form components
import { BaseApplicantForm } from '@/components/forms/common/BaseApplicantForm';

// EXISTING: Product-specific components (keep these)
import { CashplusApplicationTypeForm } from '@/components/forms/Cashplus/CashplusApplicationTypeForm';
import { CashplusLoanPreferenceForm } from '@/components/forms/Cashplus/CashplusLoanPreferenceForm';
import { CashplusExposureTable } from '@/components/forms/Cashplus/CashplusExposureTable';
import { CashplusReferencesForm } from '@/components/forms/Cashplus/CashplusReferencesForm';
import { CashplusApplicantDeclarationForm } from '@/components/forms/Cashplus/CashplusApplicantDeclarationForm';
import { CashplusBankUseOnlyForm } from '@/components/forms/Cashplus/CashplusBankUseOnlyForm';

export default function CashplusPageNew() {
  const { customerData, updateCustomerData } = useCustomer();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingMobileData, setLoadingMobileData] = useState(false);

  // Function to get base URL for API calls
  const getBaseUrl = () => {
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      return process.env.NEXT_PUBLIC_API_URL || 'https://ilos-backend.vercel.app';
    }
    return 'http://localhost:5000';
  };

  // Load mobile submission data if applicable
  useEffect(() => {
    const losIdParam = searchParams.get('losId');
    const fromMobileParam = searchParams.get('fromMobile');
    
    if (losIdParam && fromMobileParam === 'true') {
      setLoadingMobileData(true);
      loadMobileSubmissionData(losIdParam);
    }
  }, [searchParams]);

  const loadMobileSubmissionData = async (losId: string) => {
    try {
      const baseUrl = getBaseUrl();
      const response = await axios.get(`${baseUrl}/api/pb/mobile-submission/${losId}`);
      const { mobileData, documents } = response.data;

      if (mobileData) {
        // Map mobile data to customer context
        const updatedData = {
          customerId: mobileData.customer_id,
          cnic: mobileData.cnic,
          applicationType: mobileData.loan_type,
          personalDetails: {
            title: mobileData.title,
            firstName: mobileData.first_name,
            middleName: mobileData.middle_name,
            lastName: mobileData.last_name,
            cnic: mobileData.cnic,
            dateOfBirth: mobileData.date_of_birth,
            gender: mobileData.gender,
            fatherName: mobileData.father_or_husband_name,
            motherName: mobileData.mother_maiden_name,
            maritalStatus: mobileData.marital_status,
            numberOfDependents: mobileData.dependants,
            education: mobileData.education_qualification,
            mobileNumber: mobileData.mobile,
          },
          addressDetails: {
            currentAddress: {
              fullAddress: mobileData.address,
              city: mobileData.city,
              postalCode: mobileData.postal_code,
              residentialStatus: mobileData.accommodation_type,
              yearsAtAddress: mobileData.residing_since,
              telephone: mobileData.tel_current,
            },
            permanentAddress: {
              houseNo: mobileData.permanent_house_no,
              street: mobileData.permanent_street,
              city: mobileData.permanent_city,
              postalCode: mobileData.permanent_postal_code,
            },
          },
          contactDetails: {
            email: mobileData.email || '',
            mobileType: mobileData.mobile_type,
          },
          employmentDetails: {
            employmentStatus: mobileData.employment_status,
            companyName: mobileData.company_name,
            designation: mobileData.designation,
            department: mobileData.department,
            currentExperience: mobileData.exp_current_years,
            grade: mobileData.grade_level,
          },
          incomeDetails: {
            grossMonthlySalary: mobileData.gross_monthly_salary,
            otherMonthlyIncome: mobileData.other_monthly_income,
            netMonthlyIncome: mobileData.net_monthly_income,
          },
          clientBanks: {
            isUblCustomer: mobileData.is_ubl_customer,
            ublAccountNumber: mobileData.ubl_account_number,
          },
          loanPreference: {
            amountRequested: mobileData.amount_requested,
            minAmountAcceptable: mobileData.min_amount_acceptable,
            tenure: mobileData.tenure,
            maxAffordableInstallment: mobileData.max_affordable_installment,
            purposeOfLoan: mobileData.purpose_of_loan,
          },
          mobileDocuments: documents,
          isMobileSubmission: true,
          mobileSubmissionLosId: losId,
        };

        updateCustomerData(updatedData);
        toast({
          title: '✅ Mobile Submission Loaded',
          description: `Application data for LOS-${losId} has been pre-filled. Please review and complete.`,
        });
      }
    } catch (error) {
      console.error('Error loading mobile submission:', error);
      toast({
        title: '⚠️ Error Loading Data',
        description: 'Failed to load mobile submission data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoadingMobileData(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const baseUrl = getBaseUrl();
      
      // Prepare form data
      const formData = {
        // Map customerData to backend expected format
        customer_id: customerData?.customerId,
        loan_type: customerData?.applicationType || 'CASHPLUS',
        
        // Personal details
        title: customerData?.personalDetails?.title,
        first_name: customerData?.personalDetails?.firstName,
        middle_name: customerData?.personalDetails?.middleName,
        last_name: customerData?.personalDetails?.lastName,
        cnic: customerData?.personalDetails?.cnic,
        date_of_birth: customerData?.personalDetails?.dateOfBirth,
        gender: customerData?.personalDetails?.gender,
        father_or_husband_name: customerData?.personalDetails?.fatherName,
        mother_maiden_name: customerData?.personalDetails?.motherName,
        marital_status: customerData?.personalDetails?.maritalStatus,
        dependants: customerData?.personalDetails?.numberOfDependents,
        education_qualification: customerData?.personalDetails?.education,
        
        // Contact
        mobile: customerData?.personalDetails?.mobileNumber,
        email: customerData?.contactDetails?.email,
        mobile_type: customerData?.contactDetails?.mobileType,
        
        // Address
        address: customerData?.addressDetails?.currentAddress?.fullAddress,
        city: customerData?.addressDetails?.currentAddress?.city,
        postal_code: customerData?.addressDetails?.currentAddress?.postalCode,
        residing_since: customerData?.addressDetails?.currentAddress?.yearsAtAddress,
        accommodation_type: customerData?.addressDetails?.currentAddress?.residentialStatus,
        tel_current: customerData?.addressDetails?.currentAddress?.telephone,
        permanent_house_no: customerData?.addressDetails?.permanentAddress?.houseNo,
        permanent_street: customerData?.addressDetails?.permanentAddress?.street,
        permanent_city: customerData?.addressDetails?.permanentAddress?.city,
        permanent_postal_code: customerData?.addressDetails?.permanentAddress?.postalCode,
        
        // Employment
        employment_status: customerData?.employmentDetails?.employmentStatus,
        company_name: customerData?.employmentDetails?.companyName,
        designation: customerData?.employmentDetails?.designation,
        department: customerData?.employmentDetails?.department,
        exp_current_years: customerData?.employmentDetails?.currentExperience,
        grade_level: customerData?.employmentDetails?.grade,
        
        // Income
        gross_monthly_salary: customerData?.incomeDetails?.grossMonthlySalary,
        other_monthly_income: customerData?.incomeDetails?.otherMonthlyIncome,
        net_monthly_income: customerData?.incomeDetails?.netMonthlyIncome,
        
        // Banking
        is_ubl_customer: customerData?.clientBanks?.isUblCustomer,
        ubl_account_number: customerData?.clientBanks?.ublAccountNumber,
        
        // Loan Preference
        amount_requested: customerData?.loanPreference?.amountRequested,
        min_amount_acceptable: customerData?.loanPreference?.minAmountAcceptable,
        tenure: customerData?.loanPreference?.tenure,
        max_affordable_installment: customerData?.loanPreference?.maxAffordableInstallment,
        purpose_of_loan: customerData?.loanPreference?.purposeOfLoan,
        
        // Exposure (keep existing structure)
        credit_cards_clean: customerData?.exposure?.creditCardsClean || [],
        credit_cards_secured: customerData?.exposure?.creditCardsSecured || [],
        personal_loans_clean: customerData?.exposure?.personalLoansClean || [],
        other_facilities: customerData?.exposure?.otherFacilities || [],
        
        // References (keep existing structure)
        references: customerData?.referenceContacts || [],
        
        // Declaration
        applicant_signature: customerData?.declaration?.signature,
        applicant_signature_date: customerData?.declaration?.signatureDate,
        
        // Bank Use Only
        application_source: customerData?.bankUse?.applicationSource,
        channel_code: customerData?.bankUse?.channelCode,
        so_employee_no: customerData?.bankUse?.soEmployeeNo,
        program_code: customerData?.bankUse?.programCode,
        pb_bm_employee_no: customerData?.bankUse?.pbBmEmployeeNo,
        branch_code: customerData?.bankUse?.branchCode,
        sm_employee_no: customerData?.bankUse?.smEmployeeNo,
        
        // If completing mobile submission
        ...(customerData?.mobileSubmissionLosId && {
          mobileSubmissionLosId: customerData.mobileSubmissionLosId
        }),
      };

      const response = await axios.post(`${baseUrl}/api/cashplus`, formData);

      if (response.data.success) {
        toast({
          title: '✅ Application Submitted',
          description: `LOS-${response.data.application_id} created successfully!`,
        });
        
        // Navigate to applications list or confirmation page
        router.push('/dashboard/pb/applications');
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: '❌ Submission Failed',
        description: 'Failed to submit application. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingMobileData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading application data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Card className="max-w-7xl mx-auto">
        <CardContent className="p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">CashPlus Loan Application</h1>
            <p className="text-gray-600 mt-2">Complete all sections to submit your application</p>
          </div>

          {/* Customer Info Header (if loaded) */}
          {customerData?.personalDetails?.firstName && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-sm text-green-800">
                <strong>✓ Customer Identified:</strong> {customerData.personalDetails.title} {customerData.personalDetails.firstName} {customerData.personalDetails.lastName}
                {customerData.isMobileSubmission && ' (Mobile Submission)'}
              </div>
            </div>
          )}

          {/* ============ SECTION 1: APPLICATION TYPE (Product-specific, keep existing) ============ */}
          <CashplusApplicationTypeForm />

          {/* ============ SECTION 2: LOAN PREFERENCE (Product-specific, keep existing) ============ */}
          <CashplusLoanPreferenceForm />

          {/* ============ SECTION 3: PERSONAL INFORMATION (NEW: Use BaseApplicantForm) ============ */}
          <BaseApplicantForm 
            sectionNumber={3}
            sectionTitle="Personal Information"
            showEmployment={true}
            showIncome={true}
          />

          {/* ============ SECTION 4: EXPOSURE (Product-specific, keep existing) ============ */}
          <CashplusExposureTable />

          {/* ============ SECTION 5: REFERENCES (Keep existing, TODO: Make generic) ============ */}
          <CashplusReferencesForm />

          {/* ============ SECTION 6: DECLARATION (Keep existing, TODO: Make generic) ============ */}
          <CashplusApplicantDeclarationForm />

          {/* ============ SECTION 7: BANK USE ONLY (Keep existing) ============ */}
          <CashplusBankUseOnlyForm />

          {/* Submit Button */}
          <div className="mt-8 flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="min-w-[200px]"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Submitting...
                </>
              ) : (
                '✓ Submit Application'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

