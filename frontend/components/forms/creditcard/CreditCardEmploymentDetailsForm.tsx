"use client";
import { useCustomer } from "@/contexts/CustomerContext";

export const CreditCardEmploymentDetailsForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  const employmentDetails = customerData?.employmentDetails || {};
  const officeAddress = employmentDetails?.officeAddress || {};
  
  // Handler for field changes
  const handleChange = (field: string, value: string) => {
    updateCustomerData({
      employmentDetails: {
        ...employmentDetails,
        [field]: value
      }
    });
  };
  
  // Handler for office address changes
  const handleOfficeAddressChange = (field: string, value: string) => {
    updateCustomerData({
      employmentDetails: {
        ...employmentDetails,
        officeAddress: {
          ...officeAddress,
          [field]: value
        }
      }
    });
  };

  // Function to determine if a field is selected
  const isSelected = (field: string, value: string) => {
    return employmentDetails[field as keyof typeof employmentDetails] === value;
  };

  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-primary text-primary-foreground">7. Employment Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50" >
        {/* Occupation */}
        <div>
          <label className="block text-sm font-medium mb-1">Occupation</label>
          <div className="flex flex-col gap-1">
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={isSelected('occupation', 'Salaried')} 
                onChange={() => handleChange('occupation', 'Salaried')}
              /> Salaried
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={isSelected('occupation', 'Self Employed')} 
                onChange={() => handleChange('occupation', 'Self Employed')}
              /> Self Employed
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={isSelected('occupation', 'Self Employed Business')} 
                onChange={() => handleChange('occupation', 'Self Employed Business')}
              /> Self Employed Business
            </label>
          </div>
        </div>
        {/* Sector */}
        <div>
          <label className="block text-sm font-medium mb-1">Sector</label>
          <div className="flex flex-col gap-1">
            {['Government', 'Armed Forces', 'Professional', 'Private'].map(sector => (
              <label key={sector} className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={isSelected('sector', sector)} 
                  onChange={() => handleChange('sector', sector)}
                /> {sector}
              </label>
            ))}
          </div>
        </div>
        {/* Employer / Company Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Employer / Company Name</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2" 
            placeholder="Employer / Company Name" 
            value={employmentDetails.companyName || ''}
            onChange={e => handleChange('companyName', e.target.value)}
          />
        </div>
        {/* Department */}
        <div>
          <label className="block text-sm font-medium mb-1">Department</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2" 
            placeholder="Department" 
            value={employmentDetails.department || ''}
            onChange={e => handleChange('department', e.target.value)}
          />
        </div>
        {/* Employment Type */}
        <div>
          <label className="block text-sm font-medium mb-1">Employment Type</label>
          <div className="flex flex-col gap-1">
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={isSelected('employmentStatus', 'Permanent')} 
                onChange={() => handleChange('employmentStatus', 'Permanent')}
              /> Permanent
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={isSelected('employmentStatus', 'Contractual')} 
                onChange={() => handleChange('employmentStatus', 'Contractual')}
              /> Contractual
            </label>
          </div>
        </div>
        {/* Employment Status (if UBL staff) */}
        <div>
          <label className="block text-sm font-medium mb-1">Employment Status (if UBL staff)</label>
          <div className="flex flex-col gap-1">
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={isSelected('employmentStatus', 'Confirmed')} 
                onChange={() => handleChange('employmentStatus', 'Confirmed')}
              /> Confirmed
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={isSelected('employmentStatus', 'Other')} 
                onChange={() => handleChange('employmentStatus', 'Other')}
              /> Other
            </label>
          </div>
        </div>
        {/* Business Nature */}
        <div className="md:col-span-3">
          <label className="block text-sm font-medium mb-1">Business Nature</label>
          <div className="flex flex-wrap gap-4">
            {[
              'Sole Proprietorship', 'Partnership', 'Public Ltd.', 'Private Ltd.',
              'Agricultural', 'Industrial', 'Commercial', 'Other'
            ].map(nature => (
              <label key={nature} className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={isSelected('business', nature)} 
                  onChange={() => handleChange('business', nature)}
                /> {nature}
              </label>
            ))}
          </div>
        </div>
        {/* Office Address (Self Employed) */}
        <div className="md:col-span-3">
          <label className="block text-sm font-medium mb-1">Office Address (Self Employed)</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
            <input 
              type="text" 
              className="w-full rounded-xl border border-gray-300 px-4 py-2" 
              placeholder="Street" 
              value={officeAddress.street || ''}
              onChange={e => handleOfficeAddressChange('street', e.target.value)}
            />
            <input 
              type="text" 
              className="w-full rounded-xl border border-gray-300 px-4 py-2" 
              placeholder="District" 
              value={officeAddress.tehsil || ''}
              onChange={e => handleOfficeAddressChange('tehsil', e.target.value)}
            />
            <input 
              type="text" 
              className="w-full rounded-xl border border-gray-300 px-4 py-2" 
              placeholder="Landmark" 
              value={officeAddress.nearestLandmark || ''}
              onChange={e => handleOfficeAddressChange('nearestLandmark', e.target.value)}
            />
            <input 
              type="text" 
              className="w-full rounded-xl border border-gray-300 px-4 py-2" 
              placeholder="City" 
              value={officeAddress.city || ''}
              onChange={e => handleOfficeAddressChange('city', e.target.value)}
            />
            <input 
              type="text" 
              className="w-full rounded-xl border border-gray-300 px-4 py-2" 
              placeholder="Postal Code" 
              value={officeAddress.postalCode || ''}
              onChange={e => handleOfficeAddressChange('postalCode', e.target.value)}
            />
            <input 
              type="text" 
              className="w-full rounded-xl border border-gray-300 px-4 py-2" 
              placeholder="Phone 1" 
              value={officeAddress.telephone1 || ''}
              onChange={e => handleOfficeAddressChange('telephone1', e.target.value)}
            />
            <input 
              type="text" 
              className="w-full rounded-xl border border-gray-300 px-4 py-2" 
              placeholder="Phone 2" 
              value={officeAddress.telephone2 || ''}
              onChange={e => handleOfficeAddressChange('telephone2', e.target.value)}
            />
            <input 
              type="text" 
              className="w-full rounded-xl border border-gray-300 px-4 py-2" 
              placeholder="Fax" 
              value={officeAddress.fax || ''}
              onChange={e => handleOfficeAddressChange('fax', e.target.value)}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
