"use client";
import { useCustomer } from "@/contexts/CustomerContext";
import { useEffect, useRef, useState } from "react";

export const SMEReferencesForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  
  // Use refs to prevent infinite update loops
  const isInitialized = useRef(false);
  const skipNextUpdate = useRef(false);
  const isFirstRender = useRef(true);
  
  const [references, setReferences] = useState([
    {
      referenceNo: 1,
      name: "",
      cnic: "",
      relationship: "",
      contactNo: "",
      address: "",
      profession: ""
    },
    {
      referenceNo: 2,
      name: "",
      cnic: "",
      relationship: "",
      contactNo: "",
      address: "",
      profession: ""
    }
  ]);
  
  // Initialize form with data from context (runs once)
  useEffect(() => {
    if (isInitialized.current) return;
    
    // Check if references already exist in context
    const existingReferences = Array.isArray(customerData?.references) ? 
      customerData.references : [];
      
    // Map existing references to our local state format
    if (existingReferences.length > 0) {
      const updatedReferences = [...references];
      
      // Update as many references as we have data for
      existingReferences.forEach((ref: any, index) => {
        if (index < updatedReferences.length) {
          updatedReferences[index] = {
            referenceNo: index + 1,
            name: ref.name || "",
            cnic: ref.cnic || "",
            relationship: ref.relationship || "",
            contactNo: ref.contact_no || ref.contactNo || "",
            address: ref.address || "",
            profession: ref.profession || ref.business || ""
          };
        }
      });
      
      setReferences(updatedReferences);
    }
    
    isInitialized.current = true;
  }, [customerData]);
  
  // Save to context when form data changes
  const saveToContext = () => {
    if (skipNextUpdate.current || !isInitialized.current) return;
    
    skipNextUpdate.current = true;
    
    // Map our local state to the format expected by the backend
    const formattedReferences = references.map(ref => ({
      reference_no: ref.referenceNo,
      name: ref.name,
      cnic: ref.cnic,
      relationship: ref.relationship,
      contact_no: ref.contactNo,
      address: ref.address,
      business: ref.profession // Note: Backend schema uses 'business' but UI calls it 'profession'
    }));
    
    // Update the context with backend-formatted references
    updateCustomerData({
      // Include only references with at least a name
      references: formattedReferences.filter(ref => ref.name.trim() !== ""),
      // For consistency and backward compatibility
      smeReferences: formattedReferences.filter(ref => ref.name.trim() !== "")
    } as unknown as Partial<any>);
    
    // Reset the flag after a short delay
    setTimeout(() => {
      skipNextUpdate.current = false;
    }, 50);
  };
  
  // Update context when references change
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    saveToContext();
  }, [references]);
  
  // Handle input changes for a specific reference and field
  const handleInputChange = (refIndex: number, field: string, value: string) => {
    const updatedReferences = [...references];
    updatedReferences[refIndex] = {
      ...updatedReferences[refIndex],
      [field]: value
    };
    setReferences(updatedReferences);
  };
  
  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-primary text-primary-foreground">References</h3>
      <div className="space-y-8">
        {references.map((ref, index) => (
          <div key={ref.referenceNo} className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
            <div>
              <label className="block text-sm font-medium mb-1">Reference {ref.referenceNo} Name</label>
              <input
                type="text"
                className="w-full rounded-xl border border-gray-300 px-4 py-2"
                placeholder={`Reference ${ref.referenceNo} Name`}
                value={ref.name}
                onChange={(e) => handleInputChange(index, "name", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CNIC No.</label>
              <input
                type="text"
                className="w-full rounded-xl border border-gray-300 px-4 py-2"
                placeholder="CNIC No."
                value={ref.cnic}
                onChange={(e) => handleInputChange(index, "cnic", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Relationship</label>
              <input
                type="text"
                className="w-full rounded-xl border border-gray-300 px-4 py-2"
                placeholder="Relationship"
                value={ref.relationship}
                onChange={(e) => handleInputChange(index, "relationship", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Contact No.</label>
              <input
                type="text"
                className="w-full rounded-xl border border-gray-300 px-4 py-2"
                placeholder="Contact No."
                value={ref.contactNo}
                onChange={(e) => handleInputChange(index, "contactNo", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <input
                type="text"
                className="w-full rounded-xl border border-gray-300 px-4 py-2"
                placeholder="Address"
                value={ref.address}
                onChange={(e) => handleInputChange(index, "address", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Profession/Business</label>
              <input
                type="text"
                className="w-full rounded-xl border border-gray-300 px-4 py-2"
                placeholder="Profession/Business"
                value={ref.profession}
                onChange={(e) => handleInputChange(index, "profession", e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
