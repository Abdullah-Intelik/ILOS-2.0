// components/forms/Platinum/PlatinumDeclarationBankSectionForm.tsx
"use client";
import { useCustomer } from "@/contexts/CustomerContext";
import { PlatinumCustomerData } from "@/types/platinum-types";
import { useEffect, useRef, useState } from "react";

export const PlatinumDeclarationBankSectionForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  const typedCustomerData = customerData as unknown as PlatinumCustomerData;
  const [formData, setFormData] = useState({
    // Credit Guardian
    creditGuardianEnabled: false,
    // Supplementary card summary (just for display here as detailed form is elsewhere)
    supplementaryName: "",
    supplementaryRelationship: "",
    supplementaryLimit: "",
    // Staff declaration
    staffDeclarationFile: "",
  });

  // Use refs to prevent infinite update loops
  const isInitialized = useRef(false);
  const skipNextUpdate = useRef(false);
  const isFirstRender = useRef(true);

  // Initialize form with data from context (runs once)
  useEffect(() => {
    if (isInitialized.current) return;
    
    const creditGuardian = typedCustomerData?.creditGuardian || {};
    const supplementaryCard = typedCustomerData?.supplementaryCard || {};
    const declarationBank = typedCustomerData?.declarationBank || {};
    
    // Check if there's a supplementary card in the context
    const hasSupplementaryCard = !!(supplementaryCard.firstName || supplementaryCard.nameOnCard);
    
    setFormData(prev => ({
      ...prev,
      creditGuardianEnabled: creditGuardian.enabled || creditGuardian.creditGuardian || false,
      supplementaryName: hasSupplementaryCard ? 
        (supplementaryCard.firstName || "") + " " + (supplementaryCard.lastName || "") : 
        prev.supplementaryName,
      supplementaryRelationship: supplementaryCard.relationshipToPrincipal || prev.supplementaryRelationship,
      supplementaryLimit: supplementaryCard.creditLimitPercent?.toString() || prev.supplementaryLimit,
      staffDeclarationFile: declarationBank.staffDeclarationFile || prev.staffDeclarationFile,
    }));
    
    isInitialized.current = true;
  }, [typedCustomerData]);

  // Save form data to context when user makes changes
  const saveToContext = () => {
    if (skipNextUpdate.current || !isInitialized.current) return;
    
    skipNextUpdate.current = true;
    
    updateCustomerData({
      creditGuardian: {
        ...(typedCustomerData?.creditGuardian || {}),
        enabled: formData.creditGuardianEnabled,
        creditGuardian: formData.creditGuardianEnabled, // Set both properties for compatibility
      },
      declarationBank: {
        ...(typedCustomerData?.declarationBank || {}),
        staffDeclarationFile: formData.staffDeclarationFile,
      }
      // Note: We don't update supplementary card here as it's managed by its own component
      // This is just a display of what's already been entered
    } as unknown as Partial<any>);
    
    // Reset the flag after a short delay
    setTimeout(() => {
      skipNextUpdate.current = false;
    }, 50);
  };

  // Handle initial render - don't update context on first render
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    saveToContext();
  }, [formData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const fileName = e.target.files[0].name;
      handleInputChange(field, fileName);
    }
  };

  // Get supplementary card data for display
  const getSupplementaryCardSummary = () => {
    const supplementaryCards = (typedCustomerData as any)?.supplementaryCards || [];
    if (supplementaryCards.length > 0) {
      return {
        name: supplementaryCards[0].first_name || supplementaryCards[0].name || "",
        relationship: supplementaryCards[0].relationship_to_principal || supplementaryCards[0].relationship || "",
        limit: supplementaryCards[0].credit_limit_percent || supplementaryCards[0].creditLimitPercent || ""
      };
    }
    return {
      name: formData.supplementaryName,
      relationship: formData.supplementaryRelationship,
      limit: formData.supplementaryLimit
    };
  };

  const supplementarySummary = getSupplementaryCardSummary();

  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-primary text-primary-foreground">8. Declarations & Bank Section</h3>
      <div className="border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
        {/* Credit Guardian Opt-in */}
        <div>
          <label className="block text-sm font-medium mb-1">Credit Guardian Opt-in</label>
          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="creditGuardian" 
                checked={formData.creditGuardianEnabled === true}
                onChange={() => handleInputChange("creditGuardianEnabled", true)}
              /> Yes
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="creditGuardian" 
                checked={formData.creditGuardianEnabled === false}
                onChange={() => handleInputChange("creditGuardianEnabled", false)}
              /> No
            </label>
          </div>
        </div>
        {/* Supplementary Cardholder - Summary View */}
        <div className="mt-6">
          <label className="block text-sm font-medium mb-1">Supplementary Cardholder (Summary)</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input 
              type="text" 
              className="rounded-xl border border-gray-300 px-4 py-2 bg-gray-100" 
              placeholder="Name" 
              value={supplementarySummary.name}
              readOnly
            />
            <input 
              type="text" 
              className="rounded-xl border border-gray-300 px-4 py-2 bg-gray-100" 
              placeholder="Relationship" 
              value={supplementarySummary.relationship}
              readOnly
            />
            <input 
              type="text" 
              className="rounded-xl border border-gray-300 px-4 py-2 bg-gray-100" 
              placeholder="Limit (%)" 
              value={supplementarySummary.limit}
              readOnly
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Note: To edit supplementary card details, use the Supplementary Card section.
          </p>
        </div>
        {/* UBL Staff Declarations */}
        <div className="mt-6">
          <label className="block text-sm font-medium mb-1">UBL Staff Declarations</label>
          <input 
            type="file" 
            className="w-full rounded-xl border border-gray-300 px-4 py-2"
            onChange={(e) => handleFileChange("staffDeclarationFile", e)}
          />
          {formData.staffDeclarationFile && (
            <p className="text-xs text-gray-500 mt-1">File: {formData.staffDeclarationFile}</p>
          )}
        </div>
      </div>
    </section>
  );
};
