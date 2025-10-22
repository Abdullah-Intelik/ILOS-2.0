"use client";
import { useCustomer } from "@/contexts/CustomerContext";

export const CreditCardEmploymentIncomeForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  const employmentDetails = customerData?.employmentDetails || {};
  const empIncome = customerData?.employmentIncome || {};
  const incomeDetails = customerData?.incomeDetails || {};
  const personalDetails = customerData?.personalDetails || {};

  const handleEmploymentChange = (field: string, value: string) => {
    updateCustomerData({
      employmentDetails: {
        ...employmentDetails,
        [field]: value
      }
    });
  };

  const handleIncomeChange = (field: string, value: string) => {
    // Update both income interfaces for better data consistency
    updateCustomerData({
      employmentIncome: {
        ...empIncome,
        [field]: value
      },
      incomeDetails: {
        ...incomeDetails,
        [field === 'monthlySalary' ? 'grossMonthlySalary' : 
          field === 'otherIncome' ? 'otherMonthlyIncome' : 
          field === 'totalIncome' ? 'netMonthlyIncome' : field]: value
      }
    });
  };

  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-primary text-primary-foreground">5. Employment & Income Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
        <div>
          <label className="block text-sm font-medium mb-1">Employment Status</label>
          <select 
            className="w-full rounded-xl border border-gray-300 px-4 py-2"
            value={employmentDetails.employmentStatus || ''}
            onChange={e => handleEmploymentChange('employmentStatus', e.target.value)}
          >
            <option value="">--Select--</option>
            <option value="Salaried">Salaried</option>
            <option value="Self-Employed">Self-Employed</option>
            <option value="Retired">Retired</option>
            <option value="Student">Student</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Profession/Designation</label>
          <input
            type="text"
            className="w-full rounded-xl border border-gray-300 px-4 py-2"
            placeholder="Profession/Designation"
            value={employmentDetails.designation || ''}
            onChange={e => handleEmploymentChange('designation', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Company/Business Name</label>
          <input
            type="text"
            className="w-full rounded-xl border border-gray-300 px-4 py-2"
            placeholder="Company/Business Name"
            value={employmentDetails.companyName || ''}
            onChange={e => handleEmploymentChange('companyName', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Office Address</label>
          <textarea
            className="w-full rounded-xl border border-gray-300 px-4 py-2"
            rows={2}
            placeholder="Office Address"
            value={employmentDetails.officeAddress?.houseNo || ''}
            onChange={e => {
              updateCustomerData({
                employmentDetails: {
                  ...employmentDetails,
                  officeAddress: {
                    ...employmentDetails.officeAddress,
                    houseNo: e.target.value
                  }
                }
              });
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Office City</label>
          <input
            type="text"
            className="w-full rounded-xl border border-gray-300 px-4 py-2"
            placeholder="Office City"
            value={employmentDetails.officeAddress?.city || ''}
            onChange={e => {
              updateCustomerData({
                employmentDetails: {
                  ...employmentDetails,
                  officeAddress: {
                    ...employmentDetails.officeAddress,
                    city: e.target.value
                  }
                }
              });
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Office Landline Number</label>
          <input
            type="text"
            className="w-full rounded-xl border border-gray-300 px-4 py-2"
            placeholder="Office Landline Number"
            value={employmentDetails.officeAddress?.telephone1 || employmentDetails.companyPhone || ''}
            onChange={e => {
              updateCustomerData({
                employmentDetails: {
                  ...employmentDetails,
                  officeAddress: {
                    ...employmentDetails.officeAddress,
                    telephone1: e.target.value
                  },
                  companyPhone: e.target.value
                }
              });
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Nature of Business</label>
          <input
            type="text"
            className="w-full rounded-xl border border-gray-300 px-4 py-2"
            placeholder="Nature of Business"
            value={employmentDetails.business || ''}
            onChange={e => handleEmploymentChange('business', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">NTN</label>
          <input
            type="text"
            className="w-full rounded-xl border border-gray-300 px-4 py-2"
            placeholder="NTN"
            value={personalDetails.ntn || ''}
            onChange={e => {
              updateCustomerData({
                personalDetails: {
                  ...personalDetails,
                  ntn: e.target.value
                }
              });
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Monthly Gross Income (PKR)</label>
          <input
            type="number"
            className="w-full rounded-xl border border-gray-300 px-4 py-2"
            placeholder="Gross Income"
            value={empIncome.monthlySalary || incomeDetails.grossMonthlySalary || ''}
            onChange={e => handleIncomeChange('monthlySalary', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Monthly Net Income (PKR)</label>
          <input
            type="number"
            className="w-full rounded-xl border border-gray-300 px-4 py-2"
            placeholder="Net Income"
            value={empIncome.totalIncome || incomeDetails.netMonthlyIncome || ''}
            onChange={e => handleIncomeChange('totalIncome', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Other Monthly Income (PKR)</label>
          <input
            type="number"
            className="w-full rounded-xl border border-gray-300 px-4 py-2"
            placeholder="Other Monthly Income"
            value={empIncome.otherIncome || incomeDetails.otherMonthlyIncome || ''}
            onChange={e => handleIncomeChange('otherIncome', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Source of Other Income</label>
          <input
            type="text"
            className="w-full rounded-xl border border-gray-300 px-4 py-2"
            placeholder="Source of Other Income"
            value={incomeDetails.otherIncomeSource || ''}
            onChange={e => {
              updateCustomerData({
                incomeDetails: {
                  ...incomeDetails,
                  otherIncomeSource: e.target.value
                }
              });
            }}
          />
        </div>
      </div>
    </section>
  );
};
