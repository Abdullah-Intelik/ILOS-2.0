"use client";
import React from "react";

interface ExposureUndertakingFormProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

type Section =
  | "credit_cards_clean"
  | "credit_cards_secured"
  | "personal_loans_clean"
  | "personal_loans_secured"
  | "other_facilities"
  | "applied_limits";

// Column configs per section to mimic the paper form
const sectionColumns: Record<Section, Array<{ header: string; field: string; type?: 'text' | 'number' }>> = {
  credit_cards_clean: [
    { header: 'Name of the Bank / DFI', field: 'name', type: 'text' },
    { header: 'Approved Limit', field: 'limit', type: 'number' }
  ],
  credit_cards_secured: [
    { header: 'Name of the Bank / DFI', field: 'name', type: 'text' },
    { header: 'Approved Limit', field: 'limit', type: 'number' }
  ],
  personal_loans_clean: [
    { header: 'Name of the Bank', field: 'name', type: 'text' },
    { header: 'Approved Limit', field: 'limit', type: 'number' },
    { header: 'Amount Outstanding On Application Date', field: 'outstanding', type: 'number' }
  ],
  personal_loans_secured: [
    { header: 'Name of the Bank', field: 'name', type: 'text' },
    { header: 'Approved Limit', field: 'limit', type: 'number' },
    { header: 'Amount Outstanding On Application Date', field: 'outstanding', type: 'number' }
  ],
  other_facilities: [
    { header: 'Name of the Bank / DFI', field: 'name', type: 'text' },
    { header: 'Approved Limit', field: 'limit', type: 'number' },
    { header: 'Nature (Clean / Secured)', field: 'nature', type: 'text' },
    { header: 'Current Outstanding', field: 'outstanding', type: 'number' }
  ],
  applied_limits: [
    { header: 'Name of the Bank / DFI', field: 'name', type: 'text' },
    { header: 'Facility under Process', field: 'facility', type: 'text' },
    { header: 'Nature of Facility (Clean / Secured)', field: 'nature', type: 'text' }
  ]
};

// Tailwind input class
const inputClass = "w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2 text-base shadow-sm transition placeholder:text-gray-400";

const SectionBlock: React.FC<{ 
  title: string; 
  section: Section; 
  formData: any;
  updateCell: (section: Section, index: number, field: string, value: string) => void;
  addRow: (section: Section) => void;
  removeRow: (section: Section, index: number) => void;
}> = ({ title, section, formData, updateCell, addRow, removeRow }) => {
  const getRows = (section: Section) => (Array.isArray(formData?.[section]) ? formData[section] : []);
  const rows = getRows(section);
  const columns = sectionColumns[section];

  return (
    <div>
      <h3 className="text-lg text-primary font-semibold mb-4">{title}</h3>
      <div className="overflow-auto">
        <table className="min-w-full border border-gray-300 bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 py-2 border text-left w-16">Sr #</th>
              {columns.map((c, i) => (
                <th key={i} className="px-2 py-2 border text-left">{c.header}</th>
              ))}
              <th className="px-2 py-2 border w-16"></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td className="px-2 py-2 border text-gray-500" colSpan={columns.length + 2}>No rows added yet.</td>
              </tr>
            )}
            {rows.map((row: any, idx: number) => (
              <tr key={idx}>
                <td className="px-2 py-1 border align-top">{idx + 1}</td>
                {columns.map((c, i) => (
                  <td key={i} className="px-2 py-1 border">
                    <input
                      type={c.type || 'text'}
                      className={inputClass}
                      value={row[c.field] || ''}
                      onChange={(e) => updateCell(section, idx, c.field, e.target.value)}
                      placeholder={c.header}
                    />
                  </td>
                ))}
                <td className="px-2 py-1 border text-center">
                  <button type="button" className="text-red-600 text-sm" onClick={() => removeRow(section, idx)}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3">
        <button
          type="button"
          className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-sm"
          onClick={() => addRow(section)}
        >
          Add row
        </button>
      </div>
    </div>
  );
};

export const ExposureUndertakingForm = ({ formData, setFormData }: ExposureUndertakingFormProps) => {
  const getRows = (section: Section) => (Array.isArray(formData?.[section]) ? formData[section] : []);

  const updateCell = (section: Section, index: number, field: string, value: string) => {
    setFormData((prev: any) => {
      const rows = Array.isArray(prev?.[section]) ? [...prev[section]] : [];
      const current = { ...(rows[index] || {}) };
      current[field] = value;
      rows[index] = current;
      return { ...prev, [section]: rows };
    });
  };

  const addRow = (section: Section) => {
    setFormData((prev: any) => {
      const rows = Array.isArray(prev?.[section]) ? [...prev[section]] : [];
      rows.push({});
      return { ...prev, [section]: rows };
    });
  };

  const removeRow = (section: Section, index: number) => {
    setFormData((prev: any) => {
      const rows = Array.isArray(prev?.[section]) ? [...prev[section]] : [];
      rows.splice(index, 1);
      return { ...prev, [section]: rows };
    });
  };

  return (
    <section className="bg-white rounded-2xl shadow p-8 mb-10">
      <h2 className="text-2xl text-white font-semibold mb-4 rounded-lg p-4 bg-primary text-primary-foreground">
        9. Undertaking – Existing Exposure from Entire Banking Sector
      </h2>

      <div className="space-y-10">
        <SectionBlock title="A. Credit Cards (Clean)" section="credit_cards_clean" formData={formData} updateCell={updateCell} addRow={addRow} removeRow={removeRow} />
        <SectionBlock title="B. Credit Cards (Secured)" section="credit_cards_secured" formData={formData} updateCell={updateCell} addRow={addRow} removeRow={removeRow} />
        <SectionBlock title="C. Personal Loan (Clean)" section="personal_loans_clean" formData={formData} updateCell={updateCell} addRow={addRow} removeRow={removeRow} />
        <SectionBlock title="D. Personal Loan (Secured)" section="personal_loans_secured" formData={formData} updateCell={updateCell} addRow={addRow} removeRow={removeRow} />
        <SectionBlock title="E. Other Facilities (Clean & Secured)" section="other_facilities" formData={formData} updateCell={updateCell} addRow={addRow} removeRow={removeRow} />
        <SectionBlock title="F. Applied Limits (Including Current Application)" section="applied_limits" formData={formData} updateCell={updateCell} addRow={addRow} removeRow={removeRow} />
      </div>
    </section>
  );
};