"use client";
import React, { useState, useRef, useEffect } from "react";
import { useCustomer } from "@/contexts/CustomerContext";

interface ExistingLoan {
  type: string;
  amount: string;
  tenor: string;
  purpose: string;
  collateral: string;
  collateralValue: string;
  repayment: string;
}

interface SmallMarketInfo {
  name: string;
  terms: string;
  cash: string;
  credit: string;
  tenor: string;
  years: string;
}

interface SmallFinancials {
  assets: string;
  liabilities: string;
  borrowings: string;
  revenue: string;
  expenses: string;
}

interface FormState {
  enterpriseType: "small" | "medium";
  existingLoan: ExistingLoan[];
  smallProducts: string;
  smallMarket: SmallMarketInfo[];
  smallFinancial: SmallFinancials;
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  options?: { label: string; value: string }[];
  textarea?: boolean;
  placeholder?: string;
}

const Field: React.FC<FieldProps> = ({
  label,
  value,
  onChange,
  type = "text",
  options,
  textarea,
  placeholder,
}) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    {options ? (
      <select
        className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select...</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    ) : textarea ? (
      <textarea
        className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        placeholder={placeholder}
      />
    ) : (
      <input
        className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    )}
  </div>
);

export default function SmeAsaanDetailsSection() {
  const { customerData, updateCustomerData } = useCustomer();
  const isInitialized = useRef(false);
  const skipNextUpdate = useRef(false);
  const isFirstRender = useRef(true);

  const [form, setForm] = useState<FormState>({
    enterpriseType: "small",
    existingLoan: [
      {
        type: "",
        amount: "",
        tenor: "",
        purpose: "",
        collateral: "",
        collateralValue: "",
        repayment: "",
      },
    ],
    smallProducts: "",
    smallMarket: [
      {
        name: "",
        terms: "",
        cash: "",
        credit: "",
        tenor: "",
        years: "",
      },
    ],
    smallFinancial: {
      assets: "",
      liabilities: "",
      borrowings: "",
      revenue: "",
      expenses: "",
    },
  });

  // Initialize form with data from context (runs once)
  useEffect(() => {
    if (isInitialized.current) return;
    
    // Check if SME Asaan details exist in context
    const smeAsaanDetails = customerData?.smeApplication?.smeAsaanDetails || {};
    
    // Update form data with existing values
    setForm({
      enterpriseType: smeAsaanDetails.enterpriseType || "small",
      existingLoan: Array.isArray(smeAsaanDetails.existingLoan) ? smeAsaanDetails.existingLoan : [
        {
          type: "",
          amount: "",
          tenor: "",
          purpose: "",
          collateral: "",
          collateralValue: "",
          repayment: "",
        },
      ],
      smallProducts: smeAsaanDetails.smallProducts || "",
      smallMarket: Array.isArray(smeAsaanDetails.smallMarket) ? smeAsaanDetails.smallMarket : [
        {
          name: "",
          terms: "",
          cash: "",
          credit: "",
          tenor: "",
          years: "",
        },
      ],
      smallFinancial: smeAsaanDetails.smallFinancial || {
        assets: "",
        liabilities: "",
        borrowings: "",
        revenue: "",
        expenses: "",
      },
    });
    
    isInitialized.current = true;
  }, [customerData]);

  // Save to context when form data changes
  const saveToContext = () => {
    if (skipNextUpdate.current || !isInitialized.current) return;
    
    skipNextUpdate.current = true;
    
    // Map form data to the expected API format
    updateCustomerData({
      smeApplication: {
        ...(customerData?.smeApplication || {}),
        smeAsaanDetails: form,
        // Map existing loans to backend format
        existing_loans: (form.existingLoan || []).map((loan) => ({
          facility_type: loan.type,
          amount: Number(loan.amount) || null,
          tenor: loan.tenor,
          purpose: loan.purpose,
          security_nature_particular: loan.collateral,
          security_value: Number(loan.collateralValue) || null,
          repayment_frequency: loan.repayment
        })),
        // Map business descriptions to backend format
        business_descriptions: [{
          business_type: form.enterpriseType,
          products_services_offered: form.smallProducts
        }],
        // Map market info to backend format
        market_info: (form.smallMarket || []).map((m) => ({
          type: "supplier_customer",
          name: m.name,
          terms_of_trade: m.terms,
          cash_percent: Number(m.cash) || null,
          credit_percent: Number(m.credit) || null,
          tenor: m.tenor,
          relationship_since_years: Number(m.years) || null
        })),
        // Map financial indicators to backend format
        financial_indicators: [{
          assets: Number(form.smallFinancial.assets) || null,
          liabilities: Number(form.smallFinancial.liabilities) || null,
          borrowings: Number(form.smallFinancial.borrowings) || null,
          revenue: Number(form.smallFinancial.revenue) || null,
          expenses: Number(form.smallFinancial.expenses) || null
        }]
      }
    } as any);
    
    // Reset the flag after a short delay
    setTimeout(() => {
      skipNextUpdate.current = false;
    }, 50);
  };

  // Update context when form changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    saveToContext();
  }, [form]);

  const updateField = (path: (string | number)[], value: string) => {
    setForm((prev) => {
      const updated: any = { ...prev };
      let curr = updated;
      for (let i = 0; i < path.length - 1; i++) {
        curr[path[i]] = Array.isArray(curr[path[i]])
          ? [...curr[path[i]]]
          : { ...curr[path[i]] };
        curr = curr[path[i]];
      }
      curr[path[path.length - 1]] = value;
      return updated;
    });
  };

  const addRow = (key: keyof FormState) => {
    setForm((prev) => {
      const existingArray = prev[key] as any[];
      const template = existingArray[0];
      const newRow = Object.keys(template).reduce((acc, field) => {
        acc[field] = "";
        return acc;
      }, {} as any);
      return {
        ...prev,
        [key]: [...existingArray, newRow],
      };
    });
  };

  const removeRow = (key: keyof FormState, idx: number) => {
    setForm((prev) => ({
      ...prev,
      [key]: (prev[key] as any[]).filter((_, i) => i !== idx),
    }));
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-xl max-w-6xl mx-auto">
      <section className="mb-10">
        <h3 className="text-xl font-semibold mb-4 text-primary border-b border-primary pb-2">
          Existing Business & Personal Loan Details
        </h3>
        {form.existingLoan.map((loan, i) => (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg"
            key={i}
          >
            <Field label="Type of Facility" value={loan.type} onChange={(v) => updateField(["existingLoan", i, "type"], v)} />
            <Field label="Amount (Rs.)" value={loan.amount} onChange={(v) => updateField(["existingLoan", i, "amount"], v)} type="number" />
            <Field label="Tenor (Months)" value={loan.tenor} onChange={(v) => updateField(["existingLoan", i, "tenor"], v)} type="number" />
            <Field label="Purpose" value={loan.purpose} onChange={(v) => updateField(["existingLoan", i, "purpose"], v)} />
            <Field label="Security/Collateral – Nature/Particular" value={loan.collateral} onChange={(v) => updateField(["existingLoan", i, "collateral"], v)} />
            <Field label="Security/Collateral – Value (Rs.)" value={loan.collateralValue} onChange={(v) => updateField(["existingLoan", i, "collateralValue"], v)} type="number" />
            <Field label="Repayment Frequency" value={loan.repayment} onChange={(v) => updateField(["existingLoan", i, "repayment"], v)} />
            <div className="flex items-end">
              {form.existingLoan.length > 1 && (
                <button
                  className="px-4 py-2 text-red-600 hover:text-red-800 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                  onClick={() => removeRow("existingLoan", i)}
                >
                  Remove Facility
                </button>
              )}
            </div>
          </div>
        ))}
        <button
          className="px-4 py-2 text-blue-600 hover:text-blue-800 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
          onClick={() => addRow("existingLoan")}
        >
          + Add Facility
        </button>
      </section>

      <section className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-primary border-b border-primary pb-2">
          Brief Description of Business
        </h3>
        <Field
          label="Products or Services Offered"
          value={form.smallProducts}
          onChange={(v) => updateField(["smallProducts"], v)}
          textarea
          placeholder="Describe your products or services in detail..."
        />
      </section>

      <section className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-primary border-b border-primary pb-2">
          Market Information – Suppliers & Customers
        </h3>
        {form.smallMarket.map((row, i) => (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg" key={i}>
            <Field label="Name" value={row.name} onChange={(v) => updateField(["smallMarket", i, "name"], v)} placeholder="Supplier/Customer name" />
            <Field label="Terms of Trade" value={row.terms} onChange={(v) => updateField(["smallMarket", i, "terms"], v)} placeholder="Trade terms" />
            <Field label="Cash (%)" value={row.cash} onChange={(v) => updateField(["smallMarket", i, "cash"], v)} type="number" placeholder="Cash percentage" />
            <Field label="Credit (%)" value={row.credit} onChange={(v) => updateField(["smallMarket", i, "credit"], v)} type="number" placeholder="Credit percentage" />
            <Field label="Tenor (Days)" value={row.tenor} onChange={(v) => updateField(["smallMarket", i, "tenor"], v)} type="number" placeholder="Credit tenor in days" />
            <Field label="Relationship Since (Years)" value={row.years} onChange={(v) => updateField(["smallMarket", i, "years"], v)} type="number" placeholder="Years of relationship" />
            <div className="flex items-end">
              {form.smallMarket.length > 1 && (
                <button
                  className="px-4 py-2 text-red-600 hover:text-red-800 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                  onClick={() => removeRow("smallMarket", i)}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
        <button
          className="px-4 py-2 text-blue-600 hover:text-blue-800 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
          onClick={() => addRow("smallMarket")}
        >
          + Add Supplier/Customer
        </button>
      </section>

      <section className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-primary border-b border-primary pb-2">
          Financial Indicators (Amount in Rs.)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Total Assets" value={form.smallFinancial.assets} onChange={(v) => updateField(["smallFinancial", "assets"], v)} type="number" placeholder="Total assets value" />
          <Field label="Total Liabilities" value={form.smallFinancial.liabilities} onChange={(v) => updateField(["smallFinancial", "liabilities"], v)} type="number" placeholder="Total liabilities" />
          <Field label="Total Borrowings" value={form.smallFinancial.borrowings} onChange={(v) => updateField(["smallFinancial", "borrowings"], v)} type="number" placeholder="Total borrowings" />
          <Field label="Annual Revenue" value={form.smallFinancial.revenue} onChange={(v) => updateField(["smallFinancial", "revenue"], v)} type="number" placeholder="Annual revenue" />
          <Field label="Annual Expenses" value={form.smallFinancial.expenses} onChange={(v) => updateField(["smallFinancial", "expenses"], v)} type="number" placeholder="Annual expenses" />
        </div>
      </section>
    </div>
  );
}
