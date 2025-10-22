// "use client";
// import React, { useEffect, useRef, useState } from "react";
// import { useCustomer } from "@/contexts/CustomerContext";

// // Define interface for banking form data
// interface SMEBankingFormData {
//   bankName: string;
//   branch: string;
//   accountNo: string;
//   accountType: string;
//   iban: string;
//   currency: string;
// }

// // Extend the banking details type to include currency
// interface BankingDetails {
//   bankName?: string;
//   branchName?: string;
//   accountNumber?: string;
//   accountType?: string;
//   accountOpeningDate?: string;
//   iban?: string;
//   paymentOption?: string;
//   isUblCustomer?: string;
//   ublAccountNumber?: string;
//   currency?: string;
// }

// export const SMEBankingDetailsForm = () => {
//   const { customerData, updateCustomerData } = useCustomer();

//   // Use refs to prevent infinite update loops
//   const isInitialized = useRef(false);
//   const skipNextUpdate = useRef(false);
//   const isFirstRender = useRef(true);

//   // Controlled state
//   const [formData, setFormData] = useState<SMEBankingFormData>({
//     bankName: "",
//     branch: "",
//     accountNo: "",
//     accountType: "",
//     iban: "",
//     currency: "PKR", // Default to PKR
//   });

//   // Initialize form with data from context (runs once)
//   useEffect(() => {
//     if (isInitialized.current) return;

//     // Get existing data from context if available
//     const bankingDetails = customerData?.bankingDetails as BankingDetails || {};
//     const smeApplication = customerData?.smeApplication || {};
    
//     const newFormData = { ...formData };

//     // Load data from specific SME application fields if they exist
//     // For banking, we have to check multiple sources as it could be in businessDetails or main_business fields
//     if (smeApplication?.main_business_account_bank) newFormData.bankName = smeApplication.main_business_account_bank;
//     if (smeApplication?.branch) newFormData.branch = smeApplication.branch;
//     if (smeApplication?.main_business_account_no) newFormData.accountNo = smeApplication.main_business_account_no;
    
//     // Then try from banking details (if they exist)
//     if (bankingDetails?.bankName && !newFormData.bankName) newFormData.bankName = bankingDetails.bankName;
//     if (bankingDetails?.branchName && !newFormData.branch) newFormData.branch = bankingDetails.branchName;
//     if (bankingDetails?.accountNumber && !newFormData.accountNo) newFormData.accountNo = bankingDetails.accountNumber;
//     if (bankingDetails?.accountType) newFormData.accountType = bankingDetails.accountType;
//     if (bankingDetails?.iban) newFormData.iban = bankingDetails.iban;
//     if (bankingDetails?.currency) newFormData.currency = bankingDetails.currency;

//     setFormData(newFormData);
//     isInitialized.current = true;
//   }, [customerData]);

//   // Save to context when form data changes
//   const saveToContext = () => {
//     if (skipNextUpdate.current || !isInitialized.current) return;
    
//     skipNextUpdate.current = true;
    
//     // Map our state to the format expected by the API
//     updateCustomerData({
//       // Save to bankingDetails for general use
//       bankingDetails: {
//         ...(customerData?.bankingDetails as BankingDetails || {}),
//         bankName: formData.bankName,
//         branchName: formData.branch,
//         accountNumber: formData.accountNo,
//         accountType: formData.accountType,
//         iban: formData.iban,
//         currency: formData.currency
//       } as BankingDetails,
//       // Map to database schema field names for SME application
//       smeApplication: {
//         ...(customerData?.smeApplication || {}),
//         // Add additional banking fields to SME application if needed
//         // These may already be captured in the business form, but add for completeness
//         main_business_account_bank: formData.bankName,
//         main_business_account_no: formData.accountNo,
//       }
//     } as any);
    
//     // Reset the flag after a short delay to prevent loops
//     setTimeout(() => {
//       skipNextUpdate.current = false;
//     }, 50);
//   };

//   // Save to context when form changes (after first render)
//   useEffect(() => {
//     if (isFirstRender.current) {
//       isFirstRender.current = false;
//       return;
//     }
//     saveToContext();
//   }, [formData]);

//   // Handle input change
//   const handleInputChange = (field: keyof SMEBankingFormData, value: string) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//   };

//   return (
//     <section className="mb-10">
//       <h3 className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-blue-500">Banking Details</h3>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
//         <div>
//           <label className="block text-sm font-medium mb-1">Bank Name</label>
//           <input 
//             type="text" 
//             className="w-full rounded-xl border border-gray-300 px-4 py-2" 
//             placeholder="Bank Name" 
//             value={formData.bankName}
//             onChange={e => handleInputChange("bankName", e.target.value)}
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium mb-1">Branch</label>
//           <input 
//             type="text" 
//             className="w-full rounded-xl border border-gray-300 px-4 py-2" 
//             placeholder="Branch" 
//             value={formData.branch}
//             onChange={e => handleInputChange("branch", e.target.value)}
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium mb-1">Account No.</label>
//           <input 
//             type="text" 
//             className="w-full rounded-xl border border-gray-300 px-4 py-2" 
//             placeholder="Account No." 
//             value={formData.accountNo}
//             onChange={e => handleInputChange("accountNo", e.target.value)}
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium mb-1">Account Type</label>
//           <select 
//             className="w-full rounded-xl border border-gray-300 px-4 py-2"
//             value={formData.accountType}
//             onChange={e => handleInputChange("accountType", e.target.value)}
//           >
//             <option value="">--Select--</option>
//             <option value="Current">Current</option>
//             <option value="Saving">Saving</option>
//             <option value="PLS">PLS</option>
//             <option value="Other">Other</option>
//           </select>
//         </div>
//         <div>
//           <label className="block text-sm font-medium mb-1">IBAN</label>
//           <input 
//             type="text" 
//             className="w-full rounded-xl border border-gray-300 px-4 py-2" 
//             placeholder="IBAN" 
//             value={formData.iban}
//             onChange={e => handleInputChange("iban", e.target.value)}
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium mb-1">Currency</label>
//           <select 
//             className="w-full rounded-xl border border-gray-300 px-4 py-2"
//             value={formData.currency}
//             onChange={e => handleInputChange("currency", e.target.value)}
//           >
//             <option value="PKR">PKR</option>
//             <option value="USD">USD</option>
//             <option value="EUR">EUR</option>
//             <option value="Other">Other</option>
//           </select>
//         </div>
//       </div>
//     </section>
//   );
// };
