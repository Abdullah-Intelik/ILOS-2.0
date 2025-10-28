// components/forms/PlatinumBankingDetailsForm.tsx
"use client";
import { useCustomer } from "@/contexts/CustomerContext";
import { PlatinumCustomerData } from "@/types/platinum-types";

export const PlatinumBankingDetailsForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  // Use type assertion to work with the extended type
  const typedCustomerData = customerData as unknown as PlatinumCustomerData;
  const bankingDetails = typedCustomerData?.bankingDetails || {};
  const otherBanks = typedCustomerData?.otherBanks || [{}, {}];
  const otherCreditCards = typedCustomerData?.otherCreditCards || [{}, {}];
  const loanFacilities = typedCustomerData?.loanFacilities || [{}, {}];
  console.log( "loanFacilities ==>", loanFacilities);
  
  const handleBankingChange = (field: string, value: any) => {
    updateCustomerData({
      bankingDetails: {
        ...bankingDetails,
        [field]: value
      }
    } as unknown as Partial<any>);
  };

  const handleOtherBanksChange = (index: number, field: string, value: any) => {
    const updatedBanks = [...otherBanks];
    updatedBanks[index] = {
      ...updatedBanks[index],
      [field]: value
    };
    updateCustomerData({
      otherBanks: updatedBanks
    } as unknown as Partial<any>);
  };

  const handleOtherCardsChange = (index: number, field: string, value: any) => {
    const updatedCards = [...otherCreditCards];
    updatedCards[index] = {
      ...updatedCards[index],
      [field]: value
    };
    updateCustomerData({
      otherCreditCards: updatedCards
    } as unknown as Partial<any>);
  };

  const handleLoanFacilitiesChange = (index: number, field: string, value: any) => {
    const updatedLoans = [...loanFacilities];
    updatedLoans[index] = {
      ...updatedLoans[index],
      [field]: value
    };
    updateCustomerData({
      loanFacilities: updatedLoans
    } as unknown as Partial<any>);
  };

  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-primary text-primary-foreground">5. Banking Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50" >
        {/* Existing Customer */}
        <div>
          <label className="block text-sm font-medium mb-1">Existing Customer?</label>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="existingUbl" 
                checked={bankingDetails.isUblCustomer === true || bankingDetails.isUblCustomer === "Yes"} 
                onChange={() => handleBankingChange("isUblCustomer", true)}
              /> Yes
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="existingUbl" 
                checked={bankingDetails.isUblCustomer === false || bankingDetails.isUblCustomer === "No"} 
                onChange={() => handleBankingChange("isUblCustomer", false)}
              /> No
            </label>
          </div>
        </div>
        {/* Account Number */}
        <div>
          <label className="block text-sm font-medium mb-1">Account Number</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white" 
            placeholder="Account Number" 
            value={bankingDetails.ublAccountNumber || ''}
            onChange={(e) => handleBankingChange("ublAccountNumber", e.target.value)}
          />
        </div>
        {/* Branch */}
        <div>
          <label className="block text-sm font-medium mb-1">Branch</label>
          <input 
            type="text" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white" 
            placeholder="Branch" 
            value={bankingDetails.branchName || ''}
            onChange={(e) => handleBankingChange("branchName", e.target.value)}
          />
        </div>
      </div>
      {/* Other Banks Table */}
      <div className="mt-6 overflow-x-auto">
        <label className="block text-sm font-medium mb-1">Other Banks</label>
        <table className="min-w-full border mb-4 bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 py-1 border">Bank Name</th>
              <th className="px-2 py-1 border">Branch</th>
              <th className="px-2 py-1 border">Account Number</th>
            </tr>
          </thead>
          <tbody>
            {otherBanks.map((bank, i) => (
              <tr key={i}>
                <td>
                  <input 
                    className="w-full border px-2 py-1 bg-white" 
                    placeholder="Bank Name" 
                    value={(bank as any).bankName || ''}
                    onChange={(e) => handleOtherBanksChange(i, "bankName", e.target.value)}
                  />
                </td>
                <td>
                  <input 
                    className="w-full border px-2 py-1 bg-white" 
                    placeholder="Branch" 
                    value={(bank as any).branch || ''}
                    onChange={(e) => handleOtherBanksChange(i, "branch", e.target.value)}
                  />
                </td>
                <td>
                  <input 
                    className="w-full border px-2 py-1 bg-white" 
                    placeholder="Account No." 
                    value={(bank as any).accountNumber || ''}
                    onChange={(e) => handleOtherBanksChange(i, "accountNumber", e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Other Credit Cards Table */}
      <div className="mt-6 overflow-x-auto">
        <label className="block text-sm font-medium mb-1">Other Credit Cards</label>
        <table className="min-w-full border mb-4 bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 py-1 border">Bank</th>
              <th className="px-2 py-1 border">Card</th>
              <th className="px-2 py-1 border">Card No</th>
              <th className="px-2 py-1 border">Limit</th>
            </tr>
          </thead>
          <tbody>
            {otherCreditCards.map((card, i) => (
              <tr key={i}>
                <td>
                  <input 
                    className="w-full border px-2 py-1 bg-white" 
                    placeholder="Bank" 
                    value={(card as any).bankName || ''}
                    onChange={(e) => handleOtherCardsChange(i, "bankName", e.target.value)}
                  />
                </td>
                <td>
                  <input 
                    className="w-full border px-2 py-1 bg-white" 
                    placeholder="Card" 
                    value={(card as any).cardType || ''}
                    onChange={(e) => handleOtherCardsChange(i, "cardType", e.target.value)}
                  />
                </td>
                <td>
                  <input 
                    className="w-full border px-2 py-1 bg-white" 
                    placeholder="Card No." 
                    value={(card as any).cardNumber || ''}
                    onChange={(e) => handleOtherCardsChange(i, "cardNumber", e.target.value)}
                  />
                </td>
                <td>
                  <input 
                    className="w-full border px-2 py-1 bg-white" 
                    placeholder="Limit" 
                    value={(card as any).creditLimit || ''}
                    onChange={(e) => handleOtherCardsChange(i, "creditLimit", e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Loan Facilities */}
      <div className="mt-6">
        <label className="block text-sm font-medium mb-1">Loan Facilities?</label>
        <div className="flex gap-6 mt-2">
          <label className="flex items-center gap-2">
            <input 
              type="radio" 
              name="loanFacilities" 
              checked={typedCustomerData?.hasLoanFacilities === true || typedCustomerData?.hasLoanFacilities === "Yes"}
              onChange={() => updateCustomerData({ hasLoanFacilities: true } as unknown as Partial<any>)}
            /> Yes
          </label>
          <label className="flex items-center gap-2">
            <input 
              type="radio" 
              name="loanFacilities" 
              checked={typedCustomerData?.hasLoanFacilities === false || typedCustomerData?.hasLoanFacilities === "No"}
              onChange={() => updateCustomerData({ hasLoanFacilities: false } as unknown as Partial<any>)}
            /> No
          </label>
        </div>
      </div>
      {/* Loan Details Table */}
      <div className="mt-6 overflow-x-auto">
        <label className="block text-sm font-medium mb-1">Loan Details</label>
        <table className="min-w-full border mb-4 bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 py-1 border">Bank</th>
              <th className="px-2 py-1 border">LoanType</th>
              <th className="px-2 py-1 border">Loan Amount</th>
              <th className="px-2 py-1 border">Monthly Installment</th>
            </tr>
          </thead>
          <tbody>
            {loanFacilities.map((loan: any, i: number) => (
              <tr key={i}>
                <td>
                  <input 
                    className="w-full border px-2 py-1 bg-white" 
                    placeholder="Bank" 
                    value={loan.bankName || ''}
                    onChange={(e) => handleLoanFacilitiesChange(i, "bankName", e.target.value)}
                  />
                </td>
                <td>
                  <input 
                    className="w-full border px-2 py-1 bg-white" 
                    placeholder="Type" 
                    value={loan.loanType || ''}
                    onChange={(e) => handleLoanFacilitiesChange(i, "loanType", e.target.value)}
                  />
                </td>
                <td>
                  <input 
                    className="w-full border px-2 py-1 bg-white" 
                    placeholder="Outstanding" 
                    value={loan.outstandingAmount || ''}
                    onChange={(e) => handleLoanFacilitiesChange(i, "outstandingAmount", e.target.value)}
                  />
                </td>
                <td>
                  <input 
                    className="w-full border px-2 py-1 bg-white" 
                    placeholder="Installment" 
                    value={loan.monthlyInstallment || ''}
                    onChange={(e) => handleLoanFacilitiesChange(i, "monthlyInstallment", e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
