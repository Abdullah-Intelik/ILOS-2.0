"use client";
import React from "react";
import { useCustomer } from "@/contexts/CustomerContext";

type CashplusExposureTableProps = {
  title: string;
  columns: string[];
  rows?: number;
  exposureType: string; // e.g., 'bankingFacilities', 'creditCards'
};

export const CashplusExposureTable = ({
  title,
  columns,
  rows = 2,
  exposureType,
}: CashplusExposureTableProps) => {
  const { customerData, updateCustomerData } = useCustomer();

  // Get existing exposure data or initialize empty array
  const exposureData = customerData?.exposures?.[exposureType] || [];

  // Create empty rows if needed
  const ensureRowCount = () => {
    const currentRows = exposureData.length;
    if (currentRows < rows) {
      const newRows = Array(rows - currentRows).fill({});
      updateCustomerData({
        exposures: {
          ...(customerData?.exposures || {}),
          [exposureType]: [...exposureData, ...newRows]
        }
      });
    }
  };

  // Call on initial render to ensure we have the right number of rows
  React.useEffect(() => {
    ensureRowCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper to update a specific field in a specific row
  const handleFieldChange = (rowIdx: number, fieldName: string, value: string) => {
    const updatedExposures = [...exposureData];
    updatedExposures[rowIdx] = {
      ...updatedExposures[rowIdx],
      [fieldName]: value,
    };

    updateCustomerData({
      exposures: {
        ...(customerData?.exposures || {}),
        [exposureType]: updatedExposures
      }
    });
  };

  // Generate a field name based on column title
  const getFieldName = (col: string) => {
    if (col.toLowerCase().includes("sr") || col.toLowerCase().includes("#")) {
      return "sr_no";
    } else if (col.toLowerCase().includes("bank")) {
      return "bank_name";
    } else if (col.toLowerCase().includes("approved") && col.toLowerCase().includes("limit")) {
      return "approved_limit";
    } else if (col.toLowerCase().includes("outstanding") && col.toLowerCase().includes("amount")) {
      return "outstanding_amount";
    } else if (col.toLowerCase().includes("as of")) {
      return "as_of";
    } else if (col.toLowerCase().includes("nature")) {
      return "nature";
    } else if (col.toLowerCase().includes("current") && col.toLowerCase().includes("outstanding")) {
      return "current_outstanding";
    } else if (col.toLowerCase().includes("facility") && col.toLowerCase().includes("process")) {
      return "facility_under_process";
    } else if (col.toLowerCase().includes("nature") && col.toLowerCase().includes("facility")) {
      return "nature_of_facility";
    } else {
      // Default to sanitized column name
      return col.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '_');
    }
  };

  // Determine appropriate input type based on column name
  const getInputType = (col: string) => {
    if (col.toLowerCase().includes("date")) {
      return "date";
    } else if (
      col.toLowerCase().includes("number") ||
      col.toLowerCase().includes("limit") ||
      col.toLowerCase().includes("outstanding")
    ) {
      return "number";
    } 
    return "text";
  };

  return (
    <section className="mb-10">
      <h4 className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-primary text-primary-foreground">{title}</h4>
      <table className="min-w-full border mb-4 exposure-table">
        <thead className="bg-gray-100">
          <tr>
            {columns.map((col, i) => (
              <th key={i} className="px-2 py-1 border">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(rows)].map((_, idx) => (
            <tr key={idx}>
              {columns.map((col, i) => {
                const fieldName = getFieldName(col);
                const inputType = getInputType(col);
                
                return (
                  <td key={i}>
                    <input
                      className="w-full border border-gray-300 bg-white px-2 py-1"
                      placeholder={col}
                      type={inputType}
                      value={(exposureData[idx]?.[fieldName] || "")}
                      onChange={(e) => handleFieldChange(idx, fieldName, e.target.value)}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};
