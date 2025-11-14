"use client";
import React from "react";
import { useCustomer } from "@/contexts/CustomerContext";

// ✅ Helper: Format CNIC with dashes (12345-1234567-1)
const formatCNIC = (cnic: string) => {
  if (!cnic) return '';
  const cleaned = cnic.replace(/\D/g, ''); // Remove non-digits
  if (cleaned.length === 13) {
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 12)}-${cleaned.slice(12)}`;
  }
  return cnic;
};

export const CashplusReferencesForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  
  // Defensive defaults (ensure references is always an array)
  const references = customerData?.references || [];
  
  // Initialize with two references if none exist
  React.useEffect(() => {
    if (references.length === 0) {
      updateCustomerData({
        references: [
          { id: 1 },
          { id: 2 },
        ]
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Helper to update a specific reference
  const handleReferenceChange = (index: number, field: string, value: any) => {
    const updatedReferences = [...references];
    updatedReferences[index] = {
      ...updatedReferences[index],
      [field]: value,
    };
    
    updateCustomerData({
      references: updatedReferences
    });
  };

  return (
    <section className="mb-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Modern Header with Teal Accent */}
      <div className="bg-gradient-to-r from-slate-50 to-white border-l-4 border-teal-500 px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 text-white font-bold text-base shadow-sm">
            4
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              References
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Provide 2 references (relatives or friends)
            </p>
          </div>
        </div>
      </div>

      <div className="p-7 bg-white space-y-5">
        {[0, 1].map(refIndex => (
          <div key={refIndex} className="border border-slate-200 rounded-lg p-6 bg-gradient-to-br from-white to-slate-50/30 hover:border-teal-300 transition-all">
            <h4 className="text-base font-bold mb-4 text-slate-800 pb-2 border-b-2 border-teal-500/20">
              Reference {refIndex + 1} {refIndex === 0 && <span className="text-red-500 ml-1">*</span>}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block mb-2 text-sm font-semibold text-slate-700">
                  Full Name {refIndex === 0 && <span className="text-red-500">*</span>}
                </label>
                <input 
                  type="text" 
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 font-medium bg-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all placeholder:text-slate-400" 
                  placeholder="Full Name" 
                  value={references[refIndex]?.name || ""}
                  onChange={(e) => handleReferenceChange(refIndex, "name", e.target.value)}
                  required={refIndex === 0}
                />
              </div>
              
              <div>
                <label className="block mb-2 text-sm font-semibold text-slate-700">
                  CNIC Number {refIndex === 0 && <span className="text-red-500">*</span>}
                </label>
                <input 
                  type="text" 
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 font-medium bg-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all placeholder:text-slate-400" 
                  placeholder="12345-1234567-1" 
                  maxLength={15}
                  value={formatCNIC(references[refIndex]?.cnic || "")}
                  onChange={(e) => {
                    // Allow only digits and dashes
                    const cleaned = e.target.value.replace(/[^\d-]/g, '');
                    handleReferenceChange(refIndex, "cnic", cleaned.replace(/-/g, '')); // Store without dashes
                  }}
                  required={refIndex === 0}
                />
              </div>
              
              <div>
                <label className="block mb-2 text-sm font-semibold text-slate-700">
                  Relationship {refIndex === 0 && <span className="text-red-500">*</span>}
                </label>
                <select
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 font-medium bg-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
                  value={references[refIndex]?.relationship || ""}
                  onChange={(e) => handleReferenceChange(refIndex, "relationship", e.target.value)}
                  required={refIndex === 0}
                >
                  <option value="">Select...</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Brother">Brother</option>
                  <option value="Sister">Sister</option>
                  <option value="Uncle">Uncle</option>
                  <option value="Aunt">Aunt</option>
                  <option value="Cousin">Cousin</option>
                  <option value="Friend">Friend</option>
                  <option value="Colleague">Colleague</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block mb-2 text-sm font-semibold text-slate-700">
                  Mobile Number {refIndex === 0 && <span className="text-red-500">*</span>}
                </label>
                <input 
                  type="tel" 
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 font-medium bg-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all placeholder:text-slate-400" 
                  placeholder="03XX-XXXXXXX" 
                  value={references[refIndex]?.mobile || ""}
                  onChange={(e) => handleReferenceChange(refIndex, "mobile", e.target.value)}
                  required={refIndex === 0}
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block mb-2 text-sm font-semibold text-slate-700">
                  Address {refIndex === 0 && <span className="text-red-500">*</span>}
                </label>
                <input 
                  type="text" 
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 font-medium bg-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all placeholder:text-slate-400" 
                  placeholder="Full Address" 
                  value={references[refIndex]?.address || ""}
                  onChange={(e) => handleReferenceChange(refIndex, "address", e.target.value)}
                  required={refIndex === 0}
                />
              </div>
            </div>
          </div>
        ))}
        
        <div className="px-5 py-4 bg-gradient-to-r from-teal-50 to-emerald-50 border-l-4 border-teal-500 rounded-lg">
          <p className="text-sm text-slate-700 leading-relaxed">
            <span className="font-bold text-slate-900">📋 Note:</span> First reference is mandatory. Second reference is optional but recommended.
          </p>
        </div>
      </div>
    </section>
  );
};
