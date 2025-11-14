"use client";
import React, { useState, useEffect } from 'react';
import { useCustomer } from '@/contexts/CustomerContext';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { parseECIBExposure, convertECIBToILOSFormat, hasValidECIBData } from '@/utils/ecibParser';

/**
 * ExposureTable - Universal component for displaying existing loans/credit cards
 * Used by ALL products to show customer's exposure to other banks
 * 
 * Supports:
 * - Credit Cards (Clean/Secured)
 * - Personal Loans (Clean/Secured)
 * - Other Facilities
 * - Applied Limits (Under Process)
 * 
 * Features:
 * - Starts with 1 row
 * - Add more rows dynamically
 * - Remove empty rows
 */

interface ExposureTableProps {
  /** Table title */
  title: string;
  /** Type of exposure */
  type: 'creditCardsClean' | 'creditCardsSecured' | 'personalLoansClean' | 'personalLoansSecured' | 'otherFacilities' | 'appliedLimits';
  /** Number of rows to show initially */
  rows?: number;
  /** Section number for sequential forms */
  sectionNumber?: number;
}

export const ExposureTable: React.FC<ExposureTableProps> = ({
  title,
  type,
  rows = 1, // Start with 1 row by default
  sectionNumber
}) => {
  const { customerData, updateCustomerData } = useCustomer();

  const exposureData = customerData?.exposures || {};
  const tableData = exposureData[type] || [];

  // Ensure we have at least 1 entry (or use existing data)
  const displayData = tableData.length > 0 ? [...tableData] : [{}];

  const handleChange = (index: number, field: string, value: any) => {
    const updatedData = [...displayData];
    updatedData[index] = {
      ...updatedData[index],
      [field]: value,
    };

    updateCustomerData({
      exposures: {
        ...exposureData,
        [type]: updatedData.filter((item) => 
          // Remove empty rows when saving
          Object.values(item).some(v => v !== '' && v !== null && v !== undefined)
        ),
      },
    });
  };

  // Add a new row
  const handleAddRow = () => {
    const updatedData = [...displayData, {}];
    updateCustomerData({
      exposures: {
        ...exposureData,
        [type]: updatedData,
      },
    });
  };

  // Remove a specific row
  const handleRemoveRow = (index: number) => {
    if (displayData.length <= 1) return; // Keep at least 1 row
    const updatedData = displayData.filter((_, i) => i !== index);
    updateCustomerData({
      exposures: {
        ...exposureData,
        [type]: updatedData.filter((item) => 
          Object.values(item).some(v => v !== '' && v !== null && v !== undefined)
        ),
      },
    });
  };

  // Define columns based on type
  const getColumns = () => {
    switch (type) {
      case 'creditCardsClean':
      case 'creditCardsSecured':
        return [
          { key: 'srNo', label: 'Sr #', width: '10%' },
          { key: 'bankName', label: 'Bank Name', width: '45%' },
          { key: 'approvedLimit', label: 'Approved Limit', width: '45%' },
        ];
      case 'personalLoansClean':
      case 'personalLoansSecured':
        return [
          { key: 'srNo', label: 'Sr #', width: '10%' },
          { key: 'bankName', label: 'Bank Name', width: '35%' },
          { key: 'approvedLimit', label: 'Approved Limit', width: '27.5%' },
          { key: 'outstandingAmount', label: 'Outstanding Amount', width: '27.5%' },
        ];
      case 'otherFacilities':
        return [
          { key: 'srNo', label: 'Sr #', width: '8%' },
          { key: 'bankName', label: 'Bank Name', width: '25%' },
          { key: 'approvedLimit', label: 'Approved Limit', width: '22%' },
          { key: 'nature', label: 'Nature of Facility', width: '22%' },
          { key: 'currentOutstanding', label: 'Current Outstanding', width: '23%' },
        ];
      case 'appliedLimits':
        return [
          { key: 'srNo', label: 'Sr #', width: '10%' },
          { key: 'bankName', label: 'Bank Name', width: '35%' },
          { key: 'facilityUnderProcess', label: 'Facility Under Process', width: '27.5%' },
          { key: 'natureOfFacility', label: 'Nature of Facility', width: '27.5%' },
        ];
      default:
        return [];
    }
  };

  const columns = getColumns();

  return (
    <div className="mb-6 border border-slate-300 bg-white">
      {/* Table Header */}
      <div className="bg-slate-50 border-l-4 border-slate-700 px-6 py-3 border-b border-slate-300">
        <h4 className="font-semibold text-slate-800">
          {sectionNumber ? `${sectionNumber}. ` : ''}{title}
        </h4>
      </div>

      {/* Table */}
      <div className="p-6">
        {/* Column Headers */}
        <div className="grid gap-2 px-3 py-2 bg-slate-100 border-b-2 border-slate-300 font-medium text-sm mb-1" style={{
          gridTemplateColumns: `${columns.map(col => col.width).join(' ')} 80px`
        }}>
          {columns.map((col) => (
            <div key={col.key} className="text-center text-slate-700">
              {col.label}
            </div>
          ))}
          <div className="text-center text-slate-700">Actions</div>
        </div>

        {/* Rows */}
        <div className="space-y-1">
          {displayData.map((row, index) => (
            <div 
              key={index}
              className="grid gap-2 p-2 hover:bg-slate-50 transition-colors border-b border-slate-200" 
              style={{
                gridTemplateColumns: `${columns.map(col => col.width).join(' ')} 80px`
              }}
            >
              {columns.map((col) => {
                if (col.key === 'srNo') {
                  // Serial number - just display
                  return (
                    <div key={col.key} className="flex items-center justify-center">
                      <input
                        type="text"
                        className="w-full text-center border border-slate-300 px-3 py-1.5 bg-slate-50 text-slate-600 font-semibold text-sm"
                        placeholder={`${index + 1}`}
                        value={row[col.key] || index + 1}
                        readOnly
                      />
                    </div>
                  );
                }

                // Other fields - editable
                return (
                  <div key={col.key} className="flex items-center">
                    <input
                      type={col.key.includes('Limit') || col.key.includes('Amount') || col.key.includes('Outstanding') ? 'number' : 'text'}
                      className="w-full border border-slate-300 px-3 py-1.5 bg-white text-slate-700 text-sm focus:outline-none focus:border-slate-700 focus:ring-1 focus:ring-slate-700"
                      placeholder={col.label}
                      value={row[col.key] || ''}
                      onChange={(e) => handleChange(index, col.key, e.target.value)}
                    />
                  </div>
                );
              })}
              
              {/* Remove button */}
              <div className="flex items-center justify-center">
                {displayData.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveRow(index)}
                    className="text-red-700 hover:text-red-800 hover:bg-red-50 h-7"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add New Button */}
        <div className="mt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddRow}
            className="w-full border-dashed border-2 border-slate-400 text-slate-700 hover:bg-slate-50 hover:border-slate-600 text-sm py-1.5"
          >
            <Plus className="h-3.5 w-3.5 mr-2" />
            Add New Row
          </Button>
        </div>

        {/* Helper Text */}
        <div className="mt-4 px-4 py-2.5 bg-slate-50 border-l-2 border-slate-400 text-xs text-slate-600">
          <p><strong>Note:</strong> Please list all existing {title.toLowerCase()} from other banks. Leave blank if none.</p>
        </div>
      </div>
    </div>
  );
};

/**
 * ExposureSection - Complete exposure section with all tables
 * Groups all exposure tables together
 */

interface ExposureSectionProps {
  sectionNumber?: number;
  /** Show which tables */
  showCreditCards?: boolean;
  showPersonalLoans?: boolean;
  showOtherFacilities?: boolean;
  showAppliedLimits?: boolean;
}

export const ExposureSection: React.FC<ExposureSectionProps> = ({
  sectionNumber,
  showCreditCards = true,
  showPersonalLoans = true,
  showOtherFacilities = true,
  showAppliedLimits = true,
}) => {
  const { customerData, updateCustomerData } = useCustomer();
  
  // Simplified exposure - just track yes/no
  const exposure = customerData?.exposures || {};
  const hasExistingCards = exposure.hasExistingCards;
  const hasExistingLoans = exposure.hasExistingLoans;
  
  // ✅ AUTO-DETECT from eCIB data on mount
  React.useEffect(() => {
    console.log('🔍 ExposureSection useEffect triggered');
    console.log('   Current exposure:', exposure);
    console.log('   eCIB data available:', !!customerData?.ecibData);
    
    // Auto-detect from eCIB whenever eCIB data becomes available
    const ecibData = customerData?.ecibData;
    if (ecibData) {
      console.log('📊 Parsing eCIB data for auto-detection...');
      console.log('   Raw ecibData structure:', ecibData);
      console.log('   ecibData keys:', Object.keys(ecibData || {}));
      
      let autoDetectedCards = 'No';
      let autoDetectedLoans = 'No';
      
      try {
        // Get credit details array
        const creditDetails = ecibData?.['Credit Details'] || 
                             ecibData?.credit_details?.['Credit Details'] ||
                             [];
        console.log('   Extracted creditDetails:', creditDetails);
        
        // Detect credit cards: Product code '8' = Credit Card (detect even if balance is 0)
        const hasActiveCards = creditDetails.some((item: any) => 
          item.Product === '8' && 
          item['Sr.#'] !== '(a)' // Exclude header row
        );
        
        // Detect loans: Any product NOT '8' (not credit card), with Present Balance > 0
        // T/E can be 'T' (Total) or 'E' (Existing), both indicate loans
        const hasActiveLoans = creditDetails.some((item: any) => 
          item.Product !== '8' && 
          item['Sr.#'] !== '(a)' && // Exclude header row
          parseInt(item['Present Balance']?.toString().replace(/,/g, '') || '0') > 0
        );
        
        console.log('   Credit Details found:', creditDetails.length, 'items');
        console.log('   Has Active Cards:', hasActiveCards, '(detected', creditDetails.filter((item: any) => item.Product === '8' && item['Sr.#'] !== '(a)').length, 'cards)');
        console.log('   Has Active Loans:', hasActiveLoans, '(detected', creditDetails.filter((item: any) => item.Product !== '8' && item['Sr.#'] !== '(a)' && parseInt(item['Present Balance']?.toString().replace(/,/g, '') || '0') > 0).length, 'loans)');
        
        if (hasActiveCards) {
          autoDetectedCards = 'Yes';
          console.log('✅ Auto-detected existing credit cards from eCIB');
        }
        
        if (hasActiveLoans) {
          autoDetectedLoans = 'Yes';
          console.log('✅ Auto-detected existing loans from eCIB');
        }
        
        console.log('   Final auto-detected values: Cards =', autoDetectedCards, ', Loans =', autoDetectedLoans);
        
      } catch (error) {
        console.error('❌ Error parsing eCIB data for auto-detection:', error);
      }
      
      // Update with auto-detected values
      console.log('🎯 Setting exposure values: Cards =', autoDetectedCards, ', Loans =', autoDetectedLoans);
      updateCustomerData({
        exposures: {
          ...exposure,
          hasExistingCards: autoDetectedCards,
          hasExistingLoans: autoDetectedLoans,
        },
      });
    }
  }, [customerData?.ecibData]); // Re-run when eCIB data becomes available

  const handleExposureChange = (field: string, value: string) => {
    updateCustomerData({
      exposures: {
        ...exposure,
        [field]: value
      }
    });
  };
  
  return (
    <section className="mb-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Modern Header with Teal Accent */}
      <div className="bg-gradient-to-r from-slate-50 to-white border-l-4 border-teal-500 px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 text-white font-bold text-base shadow-sm">
            {sectionNumber}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              Existing Financial Obligations
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Declaration of existing credit facilities
            </p>
          </div>
        </div>
      </div>

      <div className="p-7 bg-white">
        {/* Info Banner */}
        <div className="px-5 py-4 bg-gradient-to-r from-teal-50 to-emerald-50 border-l-4 border-teal-500 rounded-lg mb-6">
          <p className="text-sm text-slate-700 leading-relaxed">
            <span className="font-bold text-slate-900">📋 Declaration:</span> Please confirm if you have any existing financial obligations. Details will be verified through credit bureau (eCIB).
          </p>
        </div>

        <div className="space-y-6">
          {/* Existing Credit Cards */}
          <div>
            <label className="block mb-3 text-sm font-semibold text-slate-700">
              Do you have any existing credit cards? <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-3 px-6 py-3 border border-slate-300 rounded-lg cursor-pointer transition-all hover:bg-slate-50 hover:border-slate-400">
                <input
                  type="radio"
                  name="hasExistingCards"
                  value="Yes"
                  checked={hasExistingCards === 'Yes'}
                  onChange={(e) => handleExposureChange('hasExistingCards', e.target.value)}
                  className="w-4 h-4 text-teal-500 focus:ring-teal-500"
                />
                <span className="text-sm font-medium text-slate-900">Yes</span>
              </label>
              <label className="flex items-center gap-3 px-6 py-3 border border-slate-300 rounded-lg cursor-pointer transition-all hover:bg-slate-50 hover:border-slate-400">
                <input
                  type="radio"
                  name="hasExistingCards"
                  value="No"
                  checked={hasExistingCards === 'No'}
                  onChange={(e) => handleExposureChange('hasExistingCards', e.target.value)}
                  className="w-4 h-4 text-teal-500 focus:ring-teal-500"
                />
                <span className="text-sm font-medium text-slate-900">No</span>
              </label>
            </div>
          </div>

          {/* Existing Loans */}
          <div>
            <label className="block mb-3 text-sm font-semibold text-slate-700">
              Do you have any existing loans (personal, auto, home, etc.)? <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-3 px-6 py-3 border border-slate-300 rounded-lg cursor-pointer transition-all hover:bg-slate-50 hover:border-slate-400">
                <input
                  type="radio"
                  name="hasExistingLoans"
                  value="Yes"
                  checked={hasExistingLoans === 'Yes'}
                  onChange={(e) => handleExposureChange('hasExistingLoans', e.target.value)}
                  className="w-4 h-4 text-teal-600 focus:ring-teal-600"
                />
                <span className="text-sm">Yes</span>
              </label>
              <label className="flex items-center gap-3 px-6 py-3 border border-slate-300 rounded-lg cursor-pointer transition-all hover:bg-slate-50 hover:border-slate-400">
                <input
                  type="radio"
                  name="hasExistingLoans"
                  value="No"
                  checked={hasExistingLoans === 'No'}
                  onChange={(e) => handleExposureChange('hasExistingLoans', e.target.value)}
                  className="w-4 h-4 text-teal-500 focus:ring-teal-500"
                />
                <span className="text-sm font-medium text-slate-900">No</span>
              </label>
            </div>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="mt-6 px-5 py-4 bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-lg">
          <p className="text-sm text-slate-700 leading-relaxed">
            <span className="font-bold text-slate-900">⚠️ Important:</span> Non-disclosure of existing liabilities may result in rejection of your application. All information will be verified through credit bureaus (eCIB).
          </p>
        </div>
      </div>
    </section>
  );
};

