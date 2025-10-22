// components/forms/CreditCardBankingDetailsForm.tsx
import { useCustomer } from "@/contexts/CustomerContext";

export const CreditCardBankingDetailsForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  const bankingDetails = customerData?.bankingDetails || {};
  const creditCard = customerData?.creditCard || {};

  // Helper for setting values with null/undefined checks
  const getValue = (value: any) => value || "";

  const handleChange = (field: string, value: string) => {
    updateCustomerData({
      bankingDetails: {
        ...bankingDetails,
        [field]: value
      }
    });

    // Special case for card-specific fields
    if (field === 'cardDestination' || field === 'statementDelivery' || field === 'emailForStatement' || field === 'paymentOption') {
      updateCustomerData({
        creditCard: {
          ...creditCard,
          [field]: value
        }
      });
    }
  };

  // Function to determine if a field is pre-filled
  const isPreFilled = (field: string) => {
    return !!bankingDetails[field as keyof typeof bankingDetails];
  };

  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-primary text-primary-foreground">11. Banking Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
        <div>
          <label className="block text-sm font-medium mb-1">Bank Name</label>
          <input
            type="text"
            className={`w-full rounded-xl border border-gray-300 px-4 py-2 ${isPreFilled('bankName') ? 'bg-green-50' : ''}`}
            placeholder="Bank Name"
            value={getValue(bankingDetails.bankName)}
            onChange={(e) => handleChange('bankName', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Branch</label>
          <input
            type="text"
            className={`w-full rounded-xl border border-gray-300 px-4 py-2 ${isPreFilled('branchName') ? 'bg-green-50' : ''}`}
            placeholder="Branch"
            value={getValue(bankingDetails.branchName)}
            onChange={(e) => handleChange('branchName', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Account Number</label>
          <input
            type="text"
            className={`w-full rounded-xl border border-gray-300 px-4 py-2 ${isPreFilled('accountNumber') ? 'bg-green-50' : ''}`}
            placeholder="Account Number"
            value={getValue(bankingDetails.accountNumber)}
            onChange={(e) => handleChange('accountNumber', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">IBAN</label>
          <input
            type="text"
            className={`w-full rounded-xl border border-gray-300 px-4 py-2 ${isPreFilled('iban') ? 'bg-green-50' : ''}`}
            placeholder="IBAN"
            value={getValue(bankingDetails.iban)}
            onChange={(e) => handleChange('iban', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Account Type</label>
          <select 
            className={`w-full rounded-xl border border-gray-300 px-4 py-2 ${isPreFilled('accountType') ? 'bg-green-50' : ''}`}
            value={getValue(bankingDetails.accountType)}
            onChange={(e) => handleChange('accountType', e.target.value)}
          >
            <option value="">--Select--</option>
            <option value="Current">Current</option>
            <option value="Savings">Savings</option>
            <option value="PLS">PLS</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Account Opening Date</label>
          <input
            type="date"
            className={`w-full rounded-xl border border-gray-300 px-4 py-2 ${isPreFilled('accountOpeningDate') ? 'bg-green-50' : ''}`}
            value={getValue(bankingDetails.accountOpeningDate)}
            onChange={(e) => handleChange('accountOpeningDate', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Card Delivery Method</label>
          <select 
            className={`w-full rounded-xl border border-gray-300 px-4 py-2 ${creditCard.cardDestination ? 'bg-green-50' : ''}`}
            value={getValue(creditCard.cardDestination)}
            onChange={(e) => handleChange('cardDestination', e.target.value)}
          >
            <option value="">--Select--</option>
            <option value="Office">Office</option>
            <option value="Home">Home</option>
            <option value="Branch">Branch Pickup</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Statement Delivery</label>
          <select 
            className={`w-full rounded-xl border border-gray-300 px-4 py-2 ${creditCard.statementDelivery ? 'bg-green-50' : ''}`}
            value={getValue(creditCard.statementDelivery)}
            onChange={(e) => handleChange('statementDelivery', e.target.value)}
          >
            <option value="">--Select--</option>
            <option value="Email">Email</option>
            <option value="Mail">Mail</option>
            <option value="Both">Both</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email for Statement</label>
          <input
            type="email"
            className={`w-full rounded-xl border border-gray-300 px-4 py-2 ${creditCard.emailForStatement ? 'bg-green-50' : ''}`}
            placeholder="Email for Statement"
            value={getValue(creditCard.emailForStatement)}
            onChange={(e) => handleChange('emailForStatement', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Payment Option</label>
          <select 
            className={`w-full rounded-xl border border-gray-300 px-4 py-2 ${creditCard.paymentOption ? 'bg-green-50' : ''}`}
            value={getValue(creditCard.paymentOption)}
            onChange={(e) => handleChange('paymentOption', e.target.value)}
          >
            <option value="">--Select--</option>
            <option value="Minimum">Minimum Due</option>
            <option value="Full">Full Payment</option>
          </select>
        </div>
      </div>
    </section>
  );
};
