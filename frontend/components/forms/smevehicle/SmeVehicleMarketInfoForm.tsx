"use client";
import { useCustomer } from "@/contexts/CustomerContext";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

// Define interface for market info data
interface MarketInfo {
  type: string;
  name: string;
  terms_of_trade: string;
  cash_percent: string;
  credit_percent: string;
  tenor: string;
  relationship_since_years: string;
}

export const MarketInfoForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  
  // Use refs to prevent infinite update loops
  const isInitialized = useRef(false);
  const skipNextUpdate = useRef(false);
  const isFirstRender = useRef(true);
  
  // Controlled state for list of market info entries
  const [marketInfoList, setMarketInfoList] = useState<MarketInfo[]>([]);
  
  // Initialize form with data from context (runs once)
  useEffect(() => {
    if (isInitialized.current) return;
    
    // Get existing data from context if available
    const commercialVehicle = customerData?.commercialVehicle || {};
    
    // Update form data with existing values
    if (Array.isArray(commercialVehicle.market_info)) {
      setMarketInfoList(commercialVehicle.market_info.map((info: any) => ({
        type: info.type || "",
        name: info.name || "",
        terms_of_trade: info.terms_of_trade || "",
        cash_percent: info.cash_percent ? String(info.cash_percent) : "",
        credit_percent: info.credit_percent ? String(info.credit_percent) : "",
        tenor: info.tenor ? String(info.tenor) : "",
        relationship_since_years: info.relationship_since_years ? String(info.relationship_since_years) : ""
      })));
    }
    
    isInitialized.current = true;
  }, [customerData]);
  
  // Save to context when form data changes
  const saveToContext = () => {
    if (skipNextUpdate.current || !isInitialized.current) return;
    
    skipNextUpdate.current = true;
    
    // Filter out empty entries and map to backend format
    const validMarketInfo = marketInfoList
      .filter(info => info.type || info.name)
      .map(info => ({
        type: info.type,
        name: info.name,
        terms_of_trade: info.terms_of_trade,
        cash_percent: info.cash_percent ? parseFloat(info.cash_percent) : null,
        credit_percent: info.credit_percent ? parseFloat(info.credit_percent) : null,
        tenor: info.tenor ? parseInt(info.tenor, 10) : null,
        relationship_since_years: info.relationship_since_years ? parseInt(info.relationship_since_years, 10) : null
      }));
    
    // Map form data to the expected API format
    updateCustomerData({
      commercialVehicle: {
        ...(customerData?.commercialVehicle || {}),
        market_info: validMarketInfo
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
  }, [marketInfoList]);
  
  // Handle input changes for a specific market info entry
  const handleMarketInfoChange = (index: number, field: keyof MarketInfo, value: string) => {
    const updatedList = [...marketInfoList];
    updatedList[index] = {
      ...updatedList[index],
      [field]: value
    };
    setMarketInfoList(updatedList);
  };
  
  // Add new market info entry
  const addMarketInfo = () => {
    setMarketInfoList([...marketInfoList, {
      type: "",
      name: "",
      terms_of_trade: "",
      cash_percent: "",
      credit_percent: "",
      tenor: "",
      relationship_since_years: ""
    }]);
  };
  
  // Remove market info entry
  const removeMarketInfo = (index: number) => {
    const updatedList = marketInfoList.filter((_, i) => i !== index);
    setMarketInfoList(updatedList);
  };

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl rounded-lg text-white font-semibold p-4 bg-primary text-primary-foreground">Market Information</h3>
        <Button 
          type="button" 
          onClick={addMarketInfo}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Market Info
        </Button>
      </div>
      
      {marketInfoList.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No market information added yet. Click "Add Market Info" to add one.
        </div>
      ) : (
        marketInfoList.map((info, index) => (
          <div key={index} className="border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-700">Market Info #{index + 1}</h4>
              <Button 
                type="button" 
                onClick={() => removeMarketInfo(index)}
                variant="destructive"
                size="sm"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select 
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm"
                  value={info.type}
                  onChange={(e) => handleMarketInfoChange(index, "type", e.target.value)}
                >
                  <option value="">Select Type</option>
                  <option value="Supplier">Supplier</option>
                  <option value="Customer">Customer</option>
                  <option value="Distributor">Distributor</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input 
                  type="text" 
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm" 
                  placeholder="Name" 
                  value={info.name}
                  onChange={(e) => handleMarketInfoChange(index, "name", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Terms of Trade</label>
                <input 
                  type="text" 
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm" 
                  placeholder="Terms of Trade" 
                  value={info.terms_of_trade}
                  onChange={(e) => handleMarketInfoChange(index, "terms_of_trade", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cash Percent (%)</label>
                <input 
                  type="number" 
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm" 
                  placeholder="Cash Percent" 
                  value={info.cash_percent}
                  onChange={(e) => handleMarketInfoChange(index, "cash_percent", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Credit Percent (%)</label>
                <input 
                  type="number" 
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm" 
                  placeholder="Credit Percent" 
                  value={info.credit_percent}
                  onChange={(e) => handleMarketInfoChange(index, "credit_percent", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tenor (Days)</label>
                <input 
                  type="number" 
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm" 
                  placeholder="Tenor in Days" 
                  value={info.tenor}
                  onChange={(e) => handleMarketInfoChange(index, "tenor", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Relationship Since (Years)</label>
                <input 
                  type="number" 
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base shadow-sm" 
                  placeholder="Years of Relationship" 
                  value={info.relationship_since_years}
                  onChange={(e) => handleMarketInfoChange(index, "relationship_since_years", e.target.value)}
                />
              </div>
            </div>
          </div>
        ))
      )}
    </section>
  );
};
