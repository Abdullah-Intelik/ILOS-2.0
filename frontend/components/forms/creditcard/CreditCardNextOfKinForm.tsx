"use client";
import { useCustomer } from "@/contexts/CustomerContext";

export const CreditCardNextOfKinForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  const nextOfKin = customerData?.nextOfKin || {};

  const handleChange = (field: string, value: string) => {
    updateCustomerData({
      nextOfKin: {
        ...nextOfKin,
        [field]: value
      }
    });
  };

  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-primary text-primary-foreground">6. Next of Kin (CBS)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2" 
            placeholder="Name" 
            value={nextOfKin.name || nextOfKin.fullName || ''}
            onChange={e => {
              handleChange('name', e.target.value);
              handleChange('fullName', e.target.value);
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Relationship</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2" 
            placeholder="Relationship" 
            value={nextOfKin.relationship || ''}
            onChange={e => handleChange('relationship', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Telephone 1</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2" 
            placeholder="Telephone 1" 
            value={nextOfKin.contactNumber || nextOfKin.telephone || nextOfKin.mobile || ''}
            onChange={e => {
              handleChange('contactNumber', e.target.value);
              handleChange('telephone', e.target.value);
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Telephone 2</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2" 
            placeholder="Telephone 2" 
            value={nextOfKin.alternateNumber || nextOfKin.alternateTelephone || ''}
            onChange={e => {
              handleChange('alternateNumber', e.target.value);
              handleChange('alternateTelephone', e.target.value);
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">CNIC</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2" 
            placeholder="CNIC" 
            value={nextOfKin.cnic || ''}
            onChange={e => handleChange('cnic', e.target.value)}
          />
        </div>
      </div>
    </section>
  );
};
