"use client"
import React, { useState, useEffect } from 'react';
import { useCustomer } from '@/contexts/CustomerContext';



export const PersonalDetailsForm = ({
  formData,
  handleInputChange,
}: {
  formData: any;
  handleInputChange: (e: { target: { name: string; value: any } }) => void;
}) => {
  const { customerData } = useCustomer();

  const [prefilledFields, setPrefilledFields] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!customerData) return;

    const prefilled = new Set<string>();
    const newFormData = { ...formData };

    // Personal Details
    if (customerData.personalDetails) {
      if (customerData.personalDetails.title) {
        newFormData.title = customerData.personalDetails.title;
        prefilled.add('title');
      }
      if (customerData.personalDetails.firstName) {
        newFormData.firstName = customerData.personalDetails.firstName;
        prefilled.add('firstName');
      }
      if (customerData.personalDetails.middleName) {
        newFormData.middleName = customerData.personalDetails.middleName;
        prefilled.add('middleName');
      }
      if (customerData.personalDetails.lastName) {
        newFormData.lastName = customerData.personalDetails.lastName;
        prefilled.add('lastName');
      }
      if (customerData.personalDetails.cnic) {
        newFormData.cnic = customerData.personalDetails.cnic;
        prefilled.add('cnic');
      }
      if (customerData.personalDetails.ntn) {
        newFormData.ntn = customerData.personalDetails.ntn;
        prefilled.add('ntn');
      }
      if (customerData.personalDetails.dateOfBirth) {
        const formattedDate = new Date(customerData.personalDetails.dateOfBirth).toISOString().split('T')[0];
        newFormData.dateOfBirth = formattedDate;
        prefilled.add('dateOfBirth');
      }
      if (customerData.personalDetails.gender) {
        newFormData.gender = customerData.personalDetails.gender;
        prefilled.add('gender');
      }
      if (customerData.personalDetails.maritalStatus) {
        newFormData.maritalStatus = customerData.personalDetails.maritalStatus;
        prefilled.add('maritalStatus');
      }
      if (customerData.personalDetails.numberOfChildren) {
        newFormData.numberOfChildren = customerData.personalDetails.numberOfChildren.toString();
        prefilled.add('numberOfChildren');
      }
      if (customerData.personalDetails.numberOfDependents) {
        newFormData.numberOfDependents = customerData.personalDetails.numberOfDependents.toString();
        prefilled.add('numberOfDependents');
      }
      if (customerData.personalDetails.education) {
        newFormData.education = customerData.personalDetails.education;
        prefilled.add('education');
      }
      if (customerData.personalDetails.fatherName) {
        newFormData.fatherName = customerData.personalDetails.fatherName;
        prefilled.add('fatherName');
      }
      if (customerData.personalDetails.motherName) {
        newFormData.motherName = customerData.personalDetails.motherName;
        prefilled.add('motherName');
      }
      if (customerData.personalDetails.passportNumber) {
        newFormData.passportNumber = customerData.personalDetails.passportNumber;
        prefilled.add('passportNumber');
      }
      if (customerData.personalDetails.nationality) {
        newFormData.nationality = customerData.personalDetails.nationality;
        prefilled.add('nationality');
      }
      if (customerData.personalDetails.placeOfBirth) {
        newFormData.placeOfBirth = customerData.personalDetails.placeOfBirth;
        prefilled.add('placeOfBirth');
      }
    }

    // Next of Kin
    if (customerData.nextOfKin) {
      if (customerData.nextOfKin.name) {
        newFormData.nextOfKin = customerData.nextOfKin.name;
        prefilled.add('nextOfKin');
      }
      if (customerData.nextOfKin.relationship) {
        newFormData.nextOfKinRelation = customerData.nextOfKin.relationship;
        prefilled.add('nextOfKinRelation');
      }
      if (customerData.nextOfKin.cnic) {
        newFormData.nextOfKinCnic = customerData.nextOfKin.cnic;
        prefilled.add('nextOfKinCnic');
      }
      if (customerData.nextOfKin.contactNumber) {
        newFormData.nextOfKinContact = customerData.nextOfKin.contactNumber;
        prefilled.add('nextOfKinContact');
      }
    }

    // Current Address
    if (customerData.addressDetails?.currentAddress) {
      const currentAddr = customerData.addressDetails.currentAddress;
      if (currentAddr.houseNo) {
        newFormData.currentHouseNo = currentAddr.houseNo;
        prefilled.add('currentHouseNo');
      }
      if (currentAddr.street) {
        newFormData.currentStreet = currentAddr.street;
        prefilled.add('currentStreet');
      }
      if (currentAddr.area) {
        newFormData.currentArea = currentAddr.area;
        prefilled.add('currentArea');
      }
      if (currentAddr.nearestLandmark) {
        newFormData.currentLandmark = currentAddr.nearestLandmark;
        prefilled.add('currentLandmark');
      }
      if (currentAddr.city) {
        newFormData.currentCity = currentAddr.city;
        prefilled.add('currentCity');
      }
      if (currentAddr.country) {
        newFormData.currentCountry = currentAddr.country;
        prefilled.add('currentCountry');
      }
      if (currentAddr.postalCode) {
        newFormData.currentPostalCode = currentAddr.postalCode;
        prefilled.add('currentPostalCode');
      }
      if (currentAddr.telephone) {
        newFormData.currentTelephone = currentAddr.telephone;
        prefilled.add('currentTelephone');
      }
      if (currentAddr.mobile) {
        newFormData.currentMobile = currentAddr.mobile;
        prefilled.add('currentMobile');
      }
      if (currentAddr.email) {
        newFormData.currentEmail = currentAddr.email;
        prefilled.add('currentEmail');
      }
      if (currentAddr.yearsAtAddress) {
        newFormData.yearsAtAddress = currentAddr.yearsAtAddress.toString();
        prefilled.add('yearsAtAddress');
      }
      if (currentAddr.yearsInCity) {
        newFormData.yearsInCity = currentAddr.yearsInCity.toString();
        prefilled.add('yearsInCity');
      }
      if (currentAddr.residentialStatus) {
        newFormData.residentialStatus = currentAddr.residentialStatus;
        prefilled.add('residentialStatus');
      }
      if (currentAddr.monthlyRent) {
        newFormData.monthlyRent = currentAddr.monthlyRent.toString();
        prefilled.add('monthlyRent');
      }
    }

    // Permanent Address
    if (customerData.addressDetails?.permanentAddress) {
      const permAddr = customerData.addressDetails.permanentAddress;
      if (permAddr.houseNo) {
        newFormData.permanentHouseNo = permAddr.houseNo;
        prefilled.add('permanentHouseNo');
      }
      if (permAddr.street) {
        newFormData.permanentStreet = permAddr.street;
        prefilled.add('permanentStreet');
      }
      if (permAddr.area) {
        newFormData.permanentArea = permAddr.area;
        prefilled.add('permanentArea');
      }
      if (permAddr.city) {
        newFormData.permanentCity = permAddr.city;
        prefilled.add('permanentCity');
      }
      if (permAddr.country) {
        newFormData.permanentCountry = permAddr.country;
        prefilled.add('permanentCountry');
      }
      if (permAddr.postalCode) {
        newFormData.permanentPostalCode = permAddr.postalCode;
        prefilled.add('permanentPostalCode');
      }
    }

    // Push prefilled values into parent form state
    Object.entries(newFormData).forEach(([key, value]) => {
      (handleInputChange as any)({ target: { name: key, value } });
    });
    setPrefilledFields(prefilled);
  }, [customerData]);

  const onLocalChange = (field: string, value: string) => {
    (handleInputChange as any)({ target: { name: field, value } });
  };

  const getFieldClasses = (fieldName: string) => {
    const baseClasses = "w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm";
    const prefilledClasses = "bg-yellow-50 border-yellow-300";
    const normalClasses = "bg-white";
    
    return `${baseClasses} ${prefilledFields.has(fieldName) ? prefilledClasses : normalClasses}`;
  };

  return (
    <section className="bg-white rounded-2xl shadow p-8 mb-10">
      <h2 className="text-2xl rounded-lg text-white font-semibold mb-4 rounded-lg p-4 bg-primary text-primary-foreground">5. Personal Details</h2>
      
      {customerData?.isETB && prefilledFields.size > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-sm text-yellow-800">
            <strong>Note:</strong> Fields highlighted in yellow are pre-filled from your existing customer data. You can edit them if needed.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <div className="flex gap-4">
            {['Mr', 'Mrs', 'Ms'].map((t) => (
              <label key={t} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="title"
                  value={t}
                  checked={formData.title === t}
                  onChange={(e) => onLocalChange('title', e.target.value)}
                  className={prefilledFields.has('title') ? 'accent-yellow-600' : ''}
                />
                {t}
              </label>
            ))}
          </div>
        </div>

        {/* Name Fields */}
        <div>
          <label className="block text-sm font-medium mb-1">First Name</label>
          <input
            type="text"
            className={getFieldClasses('firstName')}
            placeholder="First Name"
            value={formData.firstName || ''}
            onChange={(e) => onLocalChange('firstName', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Middle Name</label>
          <input
            type="text"
            className={getFieldClasses('middleName')}
            placeholder="Middle Name"
            value={formData.middleName || ''}
            onChange={(e) => onLocalChange('middleName', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Last Name</label>
          <input
            type="text"
            className={getFieldClasses('lastName')}
            placeholder="Last Name"
            value={formData.lastName || ''}
            onChange={(e) => onLocalChange('lastName', e.target.value)}
          />
        </div>

        {/* CNIC and NTN */}
        <div>
          <label className="block text-sm font-medium mb-1">CNIC</label>
          <input
            type="text"
            className={getFieldClasses('cnic')}
            placeholder="CNIC"
            value={formData.cnic || ''}
            onChange={(e) => onLocalChange('cnic', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">NTN (if available)</label>
          <input
            type="text"
            className={getFieldClasses('ntn')}
            placeholder="NTN"
            value={formData.ntn || ''}
            onChange={(e) => onLocalChange('ntn', e.target.value)}
          />
        </div>

        {/* Date of Birth and Passport */}
        <div>
          <label className="block text-sm font-medium mb-1">Date of Birth</label>
          <input
            type="date"
            className={getFieldClasses('dateOfBirth')}
            value={formData.dateOfBirth || ''}
            onChange={(e) => onLocalChange('dateOfBirth', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Passport Number (if available)</label>
          <input
            type="text"
            className={getFieldClasses('passportNumber')}
            placeholder="Passport Number"
            value={formData.passportNumber || ''}
            onChange={(e) => onLocalChange('passportNumber', e.target.value)}
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium mb-1">Gender</label>
          <div className="flex gap-4">
            {['Male', 'Female'].map((g) => (
              <label key={g} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="gender"
                  value={g}
                  checked={formData.gender === g}
                  onChange={(e) => onLocalChange('gender', e.target.value)}
                  className={prefilledFields.has('gender') ? 'accent-yellow-600' : ''}
                />
                {g}
              </label>
            ))}
          </div>
        </div>

        {/* Education */}
        <div>
          <label className="block text-sm font-medium mb-1">Education</label>
          <select
            className={getFieldClasses('education')}
            value={formData.education || ''}
            onChange={(e) => onLocalChange('education', e.target.value)}
          >
            <option value="">Select Education</option>
            <option value="Below Matric">Below Matric</option>
            <option value="Matric">Matric</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Graduate">Graduate</option>
            <option value="Post Graduate">Post Graduate</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Parents Names */}
        <div>
          <label className="block text-sm font-medium mb-1">Father's Name</label>
          <input
            type="text"
            className={getFieldClasses('fatherName')}
            placeholder="Father's Name"
            value={formData.fatherName || ''}
            onChange={(e) => onLocalChange('fatherName', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Mother's Name</label>
          <input
            type="text"
            className={getFieldClasses('motherName')}
            placeholder="Mother's Name"
            value={formData.motherName || ''}
            onChange={(e) => onLocalChange('motherName', e.target.value)}
          />
        </div>

        {/* Marital Status and Dependents */}
        <div>
          <label className="block text-sm font-medium mb-1">Marital Status</label>
          <select
            className={getFieldClasses('maritalStatus')}
            value={formData.maritalStatus || ''}
            onChange={(e) => onLocalChange('maritalStatus', e.target.value)}
          >
            <option value="">Select Status</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Divorced">Divorced</option>
            <option value="Widowed">Widowed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Number of Children</label>
          <input
            type="number"
            className={getFieldClasses('numberOfChildren')}
            placeholder="Number of Children"
            value={formData.numberOfChildren || ''}
            onChange={(e) => onLocalChange('numberOfChildren', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Number of Dependents</label>
          <input
            type="number"
            className={getFieldClasses('numberOfDependents')}
            placeholder="Number of Dependents"
            value={formData.numberOfDependents || ''}
            onChange={(e) => onLocalChange('numberOfDependents', e.target.value)}
          />
        </div>

        {formData.numberOfDependents && Number(formData.numberOfDependents) > 0 && (
          <div>
            <label className="block text-sm font-medium mb-1">Specify Dependents</label>
            <input
              type="text"
              className={getFieldClasses('dependentsSpecify')}
              placeholder="e.g., Parents, Siblings"
              value={formData.dependentsSpecify || ''}
              onChange={(e) => onLocalChange('dependentsSpecify', e.target.value)}
            />
          </div>
        )}

        {/* Next of Kin Details */}
        <div className="col-span-full">
          <h3 className="text-lg font-semibold mb-4">Next of Kin Details</h3>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Next of Kin Name</label>
          <input
            type="text"
            className={getFieldClasses('nextOfKin')}
            placeholder="Next of Kin Name"
            value={formData.nextOfKin || ''}
            onChange={(e) => onLocalChange('nextOfKin', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Relationship</label>
          <input
            type="text"
            className={getFieldClasses('nextOfKinRelation')}
            placeholder="e.g., Spouse, Sibling"
            value={formData.nextOfKinRelation || ''}
            onChange={(e) => onLocalChange('nextOfKinRelation', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Next of Kin CNIC</label>
          <input
            type="text"
            className={getFieldClasses('nextOfKinCnic')}
            placeholder="Next of Kin CNIC"
            value={formData.nextOfKinCnic || ''}
            onChange={(e) => onLocalChange('nextOfKinCnic', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Next of Kin Contact</label>
          <input
            type="text"
            className={getFieldClasses('nextOfKinContact')}
            placeholder="Next of Kin Contact"
            value={formData.nextOfKinContact || ''}
            onChange={(e) => onLocalChange('nextOfKinContact', e.target.value)}
          />
        </div>

        {/* Current Address Section */}
        <div className="col-span-full">
          <h3 className="text-lg font-semibold mb-4">Current Address</h3>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">House No.</label>
          <input
            type="text"
            className={getFieldClasses('currentHouseNo')}
            placeholder="House No."
            value={formData.currentHouseNo || ''}
            onChange={(e) => onLocalChange('currentHouseNo', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Street</label>
          <input
            type="text"
            className={getFieldClasses('currentStreet')}
            placeholder="Street"
            value={formData.currentStreet || ''}
            onChange={(e) => onLocalChange('currentStreet', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Area</label>
          <input
            type="text"
            className={getFieldClasses('currentArea')}
            placeholder="Area"
            value={formData.currentArea || ''}
            onChange={(e) => onLocalChange('currentArea', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Landmark</label>
          <input
            type="text"
            className={getFieldClasses('currentLandmark')}
            placeholder="Nearest Landmark"
            value={formData.currentLandmark || ''}
            onChange={(e) => onLocalChange('currentLandmark', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">City</label>
          <input
            type="text"
            className={getFieldClasses('currentCity')}
            placeholder="City"
            value={formData.currentCity || ''}
            onChange={(e) => onLocalChange('currentCity', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Country</label>
          <input
            type="text"
            className={getFieldClasses('currentCountry')}
            placeholder="Country"
            value={formData.currentCountry || ''}
            onChange={(e) => onLocalChange('currentCountry', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Postal Code</label>
          <input
            type="text"
            className={getFieldClasses('currentPostalCode')}
            placeholder="Postal Code"
            value={formData.currentPostalCode || ''}
            onChange={(e) => onLocalChange('currentPostalCode', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Telephone</label>
          <input
            type="text"
            className={getFieldClasses('currentTelephone')}
            placeholder="Telephone"
            value={formData.currentTelephone || ''}
            onChange={(e) => onLocalChange('currentTelephone', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Mobile</label>
          <input
            type="text"
            className={getFieldClasses('currentMobile')}
            placeholder="Mobile"
            value={formData.currentMobile || ''}
            onChange={(e) => onLocalChange('currentMobile', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            className={getFieldClasses('currentEmail')}
            placeholder="Email"
            value={formData.currentEmail || ''}
            onChange={(e) => onLocalChange('currentEmail', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Years at Address</label>
          <input
            type="number"
            className={getFieldClasses('yearsAtAddress')}
            placeholder="Years at Address"
            value={formData.yearsAtAddress || ''}
            onChange={(e) => onLocalChange('yearsAtAddress', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Years in City</label>
          <input
            type="number"
            className={getFieldClasses('yearsInCity')}
            placeholder="Years in City"
            value={formData.yearsInCity || ''}
            onChange={(e) => onLocalChange('yearsInCity', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Residential Status</label>
          <select
            className={getFieldClasses('residentialStatus')}
            value={formData.residentialStatus || ''}
            onChange={(e) => onLocalChange('residentialStatus', e.target.value)}
          >
            <option value="">Select Status</option>
            <option value="Owned">Owned</option>
            <option value="Rented">Rented</option>
            <option value="Parents">Living with Parents</option>
            <option value="Company">Company Provided</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {formData.residentialStatus === 'Rented' && (
          <div>
            <label className="block text-sm font-medium mb-1">Monthly Rent</label>
            <input
              type="number"
              className={getFieldClasses('monthlyRent')}
              placeholder="Monthly Rent"
              value={formData.monthlyRent || ''}
              onChange={(e) => onLocalChange('monthlyRent', e.target.value)}
            />
          </div>
        )}

        {/* Permanent Address Section */}
        <div className="col-span-full">
          <h3 className="text-lg font-semibold mb-4">Permanent Address (If different from current address)</h3>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">House No.</label>
          <input
            type="text"
            className={getFieldClasses('permanentHouseNo')}
            placeholder="House No."
            value={formData.permanentHouseNo || ''}
            onChange={(e) => onLocalChange('permanentHouseNo', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Street</label>
          <input
            type="text"
            className={getFieldClasses('permanentStreet')}
            placeholder="Street"
            value={formData.permanentStreet || ''}
            onChange={(e) => onLocalChange('permanentStreet', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Area</label>
          <input
            type="text"
            className={getFieldClasses('permanentArea')}
            placeholder="Area"
            value={formData.permanentArea || ''}
            onChange={(e) => onLocalChange('permanentArea', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">City</label>
          <input
            type="text"
            className={getFieldClasses('permanentCity')}
            placeholder="City"
            value={formData.permanentCity || ''}
            onChange={(e) => onLocalChange('permanentCity', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Country</label>
          <input
            type="text"
            className={getFieldClasses('permanentCountry')}
            placeholder="Country"
            value={formData.permanentCountry || ''}
            onChange={(e) => onLocalChange('permanentCountry', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Postal Code</label>
          <input
            type="text"
            className={getFieldClasses('permanentPostalCode')}
            placeholder="Postal Code"
            value={formData.permanentPostalCode || ''}
            onChange={(e) => onLocalChange('permanentPostalCode', e.target.value)}
          />
        </div>
      </div>
    </section>
  );
};
