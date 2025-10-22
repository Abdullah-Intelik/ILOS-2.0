"use client";
import { useCustomer } from "@/contexts/CustomerContext";

export const CreditCardPreviousEmploymentForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  const prevEmployment = customerData?.previousEmployment || {};

  const handleChange = (field: string, value: string) => {
    updateCustomerData({
      previousEmployment: {
        ...prevEmployment,
        [field]: value
      }
    });
  };

  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-primary text-primary-foreground">8. Previous Employment Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
        <div>
          <label className="block text-sm font-medium mb-1">Previous Employer / Business</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2" 
            placeholder="Previous Employer / Business" 
            value={prevEmployment.companyName || prevEmployment.employerName || ''}
            onChange={e => {
              handleChange('companyName', e.target.value);
              handleChange('employerName', e.target.value);
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Designation at Previous Employer</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2" 
            placeholder="Designation" 
            value={prevEmployment.designation || ''}
            onChange={e => handleChange('designation', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Experience at Previous Employer (Years)</label>
          <input 
            type="number" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2" 
            placeholder="Experience (Years)" 
            value={prevEmployment.experienceYears || ''}
            onChange={e => handleChange('experienceYears', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Telephone (Previous Employer)</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2" 
            placeholder="Telephone" 
            value={prevEmployment.telephone || ''}
            onChange={e => handleChange('telephone', e.target.value)}
          />
        </div>
      </div>
    </section>
  );
};
