"use client";
import React from 'react';
import { useCustomer } from '@/contexts/CustomerContext';

export const AmeenDriveSignatureSectionForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  
  // Defensive defaults
  const ameenDrive = customerData?.ameenDrive || {};
  const signatureSection = ameenDrive.signatureSection || {};
  
  // Helper to update signature details
  const handleChange = (field: string, value: any) => {
    updateCustomerData({
      ameenDrive: {
        ...ameenDrive,
        signatureSection: {
          ...signatureSection,
          [field]: value,
        },
      },
    });
  };

  // Helper for file inputs
  const handleFileChange = (field: string, event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        // Store as base64 string
        const base64String = reader.result as string;
        handleChange(field, base64String);
      };
      
      reader.readAsDataURL(file);
    }
  };

  // Helper for prefilled highlighting
  const prefilledFields = new Set(
    Object.entries(signatureSection).filter(([k, v]) => !!v).map(([k]) => k)
  );

  const getFieldClasses = (fieldName: string) => {
    const base = 'w-full border border-gray-300 rounded-xl px-4 py-2';
    const prefilled = 'bg-yellow-50 border-yellow-300';
    const normal = 'bg-white';
    return `${base} ${prefilledFields.has(fieldName) ? prefilled : normal}`;
  };

  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg font-semibold mb-4 p-4 bg-primary text-primary-foreground">10. Signature Section</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50" >
        <div>
          <label className="block mb-2 font-medium">Signature of the Applicant (Current)</label>
          <input 
            type="file" 
            className={getFieldClasses('signature')} 
            onChange={(e) => handleFileChange('signature', e)} 
          />
          {signatureSection.signature && (
            <div className="mt-2">
              <p className="text-sm text-green-600">Signature uploaded ✓</p>
            </div>
          )}
        </div>
        <div>
          <label className="block mb-2 font-medium">Signature of the Co-Applicant (Current)</label>
          <input 
            type="file" 
            className={getFieldClasses('coApplicantSignature')} 
            onChange={(e) => handleFileChange('coApplicantSignature', e)} 
          />
          {signatureSection.coApplicantSignature && (
            <div className="mt-2">
              <p className="text-sm text-green-600">Co-Applicant signature uploaded ✓</p>
            </div>
          )}
        </div>
        <div>
          <label className="block mb-2 font-medium">Signature of the Applicant (as per CNIC)</label>
          <input 
            type="file" 
            className={getFieldClasses('signatureCNIC')} 
            onChange={(e) => handleFileChange('signatureCNIC', e)} 
          />
          {signatureSection.signatureCNIC && (
            <div className="mt-2">
              <p className="text-sm text-green-600">CNIC signature uploaded ✓</p>
            </div>
          )}
        </div>
        <div>
          <label className="block mb-2 font-medium">Signature of the Co-Applicant (as per CNIC)</label>
          <input 
            type="file" 
            className={getFieldClasses('coApplicantCNIC')} 
            onChange={(e) => handleFileChange('coApplicantCNIC', e)} 
          />
          {signatureSection.coApplicantCNIC && (
            <div className="mt-2">
              <p className="text-sm text-green-600">Co-Applicant CNIC signature uploaded ✓</p>
            </div>
          )}
        </div>
        <div className="md:col-span-2">
          <label className="flex items-center gap-2">
            <input 
              type="checkbox" 
              checked={signatureSection.declarationAgreed === true}
              onChange={(e) => handleChange('declarationAgreed', e.target.checked)}
            />
            <span className="font-medium">I/We declare that the information provided is true and correct</span>
          </label>
        </div>
      </div>
    </section>
  );
};
