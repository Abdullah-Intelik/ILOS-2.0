"use client";
import { useCustomer } from "@/contexts/CustomerContext";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

// Define interface for reference data
interface Reference {
  reference_no: number;
  name: string;
  cnic: string;
  relationship: string;
  address: string;
  contact_no: string;
}

export const ReferencesDetailForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  
  // Use refs to prevent infinite update loops
  const isInitialized = useRef(false);
  const skipNextUpdate = useRef(false);
  const isFirstRender = useRef(true);
  
  // Controlled state for list of references
  const [references, setReferences] = useState<Reference[]>([]);
  
  // Initialize form with data from context (runs once)
  useEffect(() => {
    if (isInitialized.current) return;
    
    // Get existing data from context if available
    const commercialVehicle = customerData?.commercialVehicle || {};
    
    // Update form data with existing values
    if (Array.isArray(commercialVehicle.references)) {
      setReferences(commercialVehicle.references.map((ref: any) => ({
        reference_no: ref.reference_no || 0,
        name: ref.name || "",
        cnic: ref.cnic || "",
        relationship: ref.relationship || "",
        address: ref.address || "",
        contact_no: ref.contact_no || ""
      })));
    }
    
    isInitialized.current = true;
  }, [customerData]);
  
  // Save to context when form data changes
  const saveToContext = () => {
    if (skipNextUpdate.current || !isInitialized.current) return;
    
    skipNextUpdate.current = true;
    
    // Filter out empty references and map to backend format
    const validReferences = references
      .filter(ref => ref.name || ref.cnic || ref.contact_no)
      .map((ref, index) => ({
        reference_no: index + 1,
        name: ref.name,
        cnic: ref.cnic,
        relationship: ref.relationship,
        address: ref.address,
        contact_no: ref.contact_no
      }));
    
    // Map form data to the expected API format
    updateCustomerData({
      commercialVehicle: {
        ...(customerData?.commercialVehicle || {}),
        references: validReferences
      }
    } as any);
    
    // Reset the flag after a short delay
    setTimeout(() => {
      skipNextUpdate.current = false;
    }, 50);
  };
  
  // Update context when form data changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    saveToContext();
  }, [references]);
  
  // Handle input changes for a specific reference
  const handleReferenceChange = (index: number, field: keyof Reference, value: string) => {
    const updatedReferences = [...references];
    updatedReferences[index] = {
      ...updatedReferences[index],
      [field]: value
    };
    setReferences(updatedReferences);
  };
  
  // Add new reference
  const addReference = () => {
    setReferences([...references, {
      reference_no: references.length + 1,
      name: "",
      cnic: "",
      relationship: "",
      address: "",
      contact_no: ""
    }]);
  };
  
  // Remove reference
  const removeReference = (index: number) => {
    const updatedReferences = references.filter((_, i) => i !== index);
    setReferences(updatedReferences);
  };

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl rounded-lg text-white font-semibold p-4 bg-primary text-primary-foreground">References Detail</h3>
        <Button 
          type="button" 
          onClick={addReference}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Reference
        </Button>
      </div>
      
      {references.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No references added yet. Click "Add Reference" to add one.
        </div>
      ) : (
        <div className="space-y-8">
          {references.map((ref, index) => (
            <div key={index} className="border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-700">Reference #{index + 1}</h4>
                <Button 
                  type="button" 
                  onClick={() => removeReference(index)}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm"
                    placeholder="Reference Name"
                    value={ref.name}
                    onChange={(e) => handleReferenceChange(index, "name", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">CNIC No.</label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm"
                    placeholder="CNIC No."
                    value={ref.cnic}
                    onChange={(e) => handleReferenceChange(index, "cnic", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Relationship</label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm"
                    placeholder="Relationship"
                    value={ref.relationship}
                    onChange={(e) => handleReferenceChange(index, "relationship", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Contact No.</label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm"
                    placeholder="Contact No."
                    value={ref.contact_no}
                    onChange={(e) => handleReferenceChange(index, "contact_no", e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm"
                    placeholder="Address"
                    value={ref.address}
                    onChange={(e) => handleReferenceChange(index, "address", e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
