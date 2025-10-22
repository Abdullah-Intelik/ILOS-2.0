"use client";
import React, { useState, useEffect } from 'react';
import { useCustomer } from '@/contexts/CustomerContext';

export const AmeenDriveReferenceDetailsForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  
  // Defensive defaults
  const ameenDrive = customerData?.ameenDrive || {};
  
  // Initialize references array if not exist
  const [references, setReferences] = useState([
    {
      id: 1,
      name: '',
      cnic: '',
      relation: '',
      relationOther: '',
      address: '',
      residenceNo: '',
      mobile: '',
      email: '',
      businessAddress: '',
      officePhone: ''
    },
    {
      id: 2,
      name: '',
      cnic: '',
      relation: '',
      relationOther: '',
      address: '',
      residenceNo: '',
      mobile: '',
      email: '',
      businessAddress: '',
      officePhone: ''
    }
  ]);
  
  // Load existing references if available
  useEffect(() => {
    if (ameenDrive.referenceDetails && ameenDrive.referenceDetails.length > 0) {
      setReferences(ameenDrive.referenceDetails);
    }
  }, [ameenDrive.referenceDetails]);
  
  // Helper to update references
  const handleReferenceChange = (index: number, field: string, value: any) => {
    const updatedReferences = [...references];
    updatedReferences[index] = {
      ...updatedReferences[index],
      [field]: value
    };
    
    setReferences(updatedReferences);
    
    // Update the context with all references
    updateCustomerData({
      ameenDrive: {
        ...ameenDrive,
        referenceDetails: updatedReferences
      }
    });
  };

  // Helper for prefilled highlighting
  const isFieldPrefilled = (refIndex: number, fieldName: string) => {
    if (!ameenDrive.referenceDetails || !ameenDrive.referenceDetails[refIndex]) {
      return false;
    }
    const reference = ameenDrive.referenceDetails[refIndex];
    if (!reference || typeof reference !== 'object') {
      return false;
    }
    return !!(reference as any)[fieldName];
  };

  const getFieldClasses = (refIndex: number, fieldName: string) => {
    const base = 'w-full border border-gray-300 rounded-xl px-4 py-2';
    const prefilled = 'bg-yellow-50 border-yellow-300';
    const normal = 'bg-white';
    return `${base} ${isFieldPrefilled(refIndex, fieldName) ? prefilled : normal}`;
  };

  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg font-semibold mb-4 p-4 bg-primary text-primary-foreground">9. Reference Details</h3>
      {[0, 1].map((index) => (
        <div key={index} className="border rounded-xl p-4 mb-8 border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
          <h4 className="text-lg font-semibold mb-4">Reference {index + 1}</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block mb-2 font-medium">Name</label>
              <input 
                type="text" 
                className={getFieldClasses(index, 'name')}
                placeholder="Name" 
                value={references[index].name || ''}
                onChange={(e) => handleReferenceChange(index, 'name', e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">CNIC</label>
              <input 
                type="text" 
                className={getFieldClasses(index, 'cnic')}
                placeholder="CNIC" 
                value={references[index].cnic || ''}
                onChange={(e) => handleReferenceChange(index, 'cnic', e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">Relationship</label>
              <div className="flex flex-wrap gap-3">
                {['Friend', 'Neighbour', 'Colleague', 'Other'].map(relationOption => (
                  <label key={relationOption} className="flex items-center gap-2">
                    <input 
                      type="radio" 
                      name={`reference${index + 1}Relation`}
                      checked={references[index].relation === relationOption}
                      onChange={() => handleReferenceChange(index, 'relation', relationOption)}
                    /> {relationOption}
                  </label>
                ))}
              </div>
              {references[index].relation === 'Other' && (
                <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 mt-2" 
                  placeholder="If Other, please specify"
                  value={references[index].relationOther || ''}
                  onChange={(e) => handleReferenceChange(index, 'relationOther', e.target.value)}
                />
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block mb-2 font-medium">Address</label>
              <input 
                type="text" 
                className={getFieldClasses(index, 'address')}
                placeholder="Address" 
                value={references[index].address || ''}
                onChange={(e) => handleReferenceChange(index, 'address', e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">Residence No.</label>
              <input 
                type="text" 
                className={getFieldClasses(index, 'residenceNo')}
                placeholder="Residence No." 
                value={references[index].residenceNo || ''}
                onChange={(e) => handleReferenceChange(index, 'residenceNo', e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">Mobile No.</label>
              <input 
                type="text" 
                className={getFieldClasses(index, 'mobile')}
                placeholder="Mobile No." 
                value={references[index].mobile || ''}
                onChange={(e) => handleReferenceChange(index, 'mobile', e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">E-mail</label>
              <input 
                type="email" 
                className={getFieldClasses(index, 'email')}
                placeholder="Email" 
                value={references[index].email || ''}
                onChange={(e) => handleReferenceChange(index, 'email', e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-2 font-medium">Business Address</label>
              <input 
                type="text" 
                className={getFieldClasses(index, 'businessAddress')}
                placeholder="Business Address" 
                value={references[index].businessAddress || ''}
                onChange={(e) => handleReferenceChange(index, 'businessAddress', e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">Office Telephone No.</label>
              <input 
                type="text" 
                className={getFieldClasses(index, 'officePhone')}
                placeholder="Office Telephone No." 
                value={references[index].officePhone || ''}
                onChange={(e) => handleReferenceChange(index, 'officePhone', e.target.value)}
              />
            </div>
          </div>
        </div>
      ))}
    </section>
  );
};
