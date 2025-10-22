"use client";
import { useCustomer } from "@/contexts/CustomerContext";

export const CreditCardIncomeDetailsForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  const incomeDetails = customerData?.incomeDetails || {};
  const creditCardData = customerData?.creditCard || {};
  const contactDetails = customerData?.contactDetails || {};
  
  // Handler for income details changes
  const handleIncomeChange = (field: string, value: string | boolean) => {
    updateCustomerData({
      incomeDetails: {
        ...incomeDetails,
        [field]: value
      }
    });
  };

  // Handler for credit card specific fields
  const handleCreditCardChange = (field: string, value: string | boolean) => {
    updateCustomerData({
      creditCard: {
        ...creditCardData,
        [field]: value
      }
    });
  };

  // Function to check if spouse is employed
  const isSpouseEmployed = (status: string) => {
    return incomeDetails.spouseEmployed === status;
  };

  // Function to check delivery preferences
  const isDeliveryOption = (option: string) => {
    return creditCardData.cardDestination === option;
  };

  // Function to check statement delivery preference
  const isStatementOption = (option: string) => {
    return creditCardData.statementDelivery === option;
  };

  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-primary text-primary-foreground">9. Your Income Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
        <div>
          <label className="block text-sm font-medium mb-1">Gross Monthly Income</label>
          <input 
            type="number" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2" 
            placeholder="Gross Monthly Income" 
            value={incomeDetails.grossMonthlySalary || ''}
            onChange={e => handleIncomeChange('grossMonthlySalary', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Other Income Source</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2" 
            placeholder="Other Income Source" 
            value={incomeDetails.otherIncomeSource || ''}
            onChange={e => handleIncomeChange('otherIncomeSource', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Total Income</label>
          <input 
            type="number" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2" 
            placeholder="Total Income" 
            value={incomeDetails.netMonthlyIncome || ''}
            onChange={e => handleIncomeChange('netMonthlyIncome', e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Spouse Employed</label>
          <div className="flex flex-wrap gap-4 mt-2">
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={isSpouseEmployed('Yes')}
                onChange={() => handleIncomeChange('spouseEmployed', 'Yes')}
              /> Yes
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={isSpouseEmployed('No')}
                onChange={() => handleIncomeChange('spouseEmployed', 'No')}
              /> No
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={isSpouseEmployed('N/A')}
                onChange={() => handleIncomeChange('spouseEmployed', 'N/A')}
              /> N/A
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Spouse Income</label>
          <input 
            type="number" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2" 
            placeholder="Spouse Income" 
            value={incomeDetails.spouseIncome || ''}
            onChange={e => handleIncomeChange('spouseIncome', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Spouse Income Source</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2" 
            placeholder="Spouse Income Source" 
            value={incomeDetails.spouseIncomeSource || ''}
            onChange={e => handleIncomeChange('spouseIncomeSource', e.target.value)}
          />
        </div>
        {/* Card Destination */}
        <div>
          <label className="block text-sm font-medium mb-1">Card Destination</label>
          <div className="flex flex-col gap-1">
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={isDeliveryOption('Home')}
                onChange={() => handleCreditCardChange('cardDestination', 'Home')}
              /> Home
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={isDeliveryOption('Office')}
                onChange={() => handleCreditCardChange('cardDestination', 'Office')}
              /> Office
            </label>
          </div>
        </div>
        {/* Statement Delivery */}
        <div>
          <label className="block text-sm font-medium mb-1">Statement Delivery</label>
          <div className="flex flex-col gap-1">
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={isStatementOption('Email')}
                onChange={() => handleCreditCardChange('statementDelivery', 'Email')}
              /> Email Statement
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={isStatementOption('Physical')}
                onChange={() => handleCreditCardChange('statementDelivery', 'Physical')}
              /> Physical
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email (for Statement)</label>
          <input 
            type="email" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2" 
            placeholder="Email (for Statement)" 
            value={contactDetails.emailAddress || ''}
            onChange={e => {
              updateCustomerData({
                contactDetails: {
                  ...contactDetails,
                  emailAddress: e.target.value
                }
              });
            }}
          />
        </div>
      </div>
    </section>
  );
};
