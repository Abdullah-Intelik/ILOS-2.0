"use client";
import { useCustomer } from "@/contexts/CustomerContext";

export const CreditCardReferencesForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  const references = customerData?.references || [];
  
  // Ensure we have at least 2 reference objects
  const ensureReferences = () => {
    const updatedRefs = [...references];
    while (updatedRefs.length < 2) {
      updatedRefs.push({ id: updatedRefs.length + 1 });
    }
    return updatedRefs;
  };
  
  const referenceData = ensureReferences();

  // Handler for reference changes
  const handleReferenceChange = (index: number, field: string, value: string) => {
    const updatedReferences = [...referenceData];
    updatedReferences[index] = {
      ...updatedReferences[index],
      [field]: value
    };
    
    updateCustomerData({ references: updatedReferences });
  };

  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-primary text-primary-foreground">12. References</h3>
      <div className="space-y-8">
        {[0, 1].map((index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
            <div>
              <label className="block text-sm font-medium mb-1">Reference {index + 1} Name</label>
              <input
                type="text"
                className="w-full rounded-xl border border-gray-300 px-4 py-2"
                placeholder={`Reference ${index + 1} Name`}
                value={referenceData[index].name || ''}
                onChange={e => handleReferenceChange(index, 'name', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CNIC No.</label>
              <input
                type="text"
                className="w-full rounded-xl border border-gray-300 px-4 py-2"
                placeholder="CNIC No."
                value={referenceData[index].cnic || ''}
                onChange={e => handleReferenceChange(index, 'cnic', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Relationship</label>
              <input
                type="text"
                className="w-full rounded-xl border border-gray-300 px-4 py-2"
                placeholder="Relationship"
                value={referenceData[index].relationship || ''}
                onChange={e => handleReferenceChange(index, 'relationship', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Contact No.</label>
              <input
                type="text"
                className="w-full rounded-xl border border-gray-300 px-4 py-2"
                placeholder="Contact No."
                value={referenceData[index].mobile || referenceData[index].telephoneResidence || ''}
                onChange={e => {
                  handleReferenceChange(index, 'mobile', e.target.value);
                  handleReferenceChange(index, 'telephoneResidence', e.target.value);
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <input
                type="text"
                className="w-full rounded-xl border border-gray-300 px-4 py-2"
                placeholder="Address"
                value={`${referenceData[index].houseNo || ''} ${referenceData[index].street || ''} ${referenceData[index].city || ''}`}
                onChange={e => {
                  // For simplicity, we'll just store the full address in the houseNo field
                  handleReferenceChange(index, 'houseNo', e.target.value);
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Profession/Business</label>
              <input
                type="text"
                className="w-full rounded-xl border border-gray-300 px-4 py-2"
                placeholder="Profession/Business"
                // Store profession/business in the email field as it's not critical for backend submission
                value={referenceData[index].email || ''}
                onChange={e => handleReferenceChange(index, 'email', e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
