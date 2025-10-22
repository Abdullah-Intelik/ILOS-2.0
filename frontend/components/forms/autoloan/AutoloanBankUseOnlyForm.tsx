"use client";
import React from "react";

interface Props {
  formData: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

export const BankUseOnlyForm: React.FC<Props> = ({ formData, handleInputChange, setFormData }) => {
  // Ensure application_source is always an array to prevent controlled/uncontrolled input issues
  const applicationSource = Array.isArray(formData.application_source) ? formData.application_source : [];
  
  const toggleApplicationSource = (source: string) => {
    const updated = [...applicationSource];
    if (updated.includes(source)) {
      setFormData((prev: any) => ({
        ...prev,
        application_source: updated.filter((s) => s !== source)
      }));
    } else {
      updated.push(source);
      setFormData((prev: any) => ({
        ...prev,
        application_source: updated
      }));
    }
  };

  return (
    <section className="bg-white rounded-2xl shadow p-8 mb-10">
      <h2 className="text-2xl text-white font-semibold mb-4 rounded-lg p-4 bg-primary text-primary-foreground">
        13. For Banks Use Only
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col col-span-2">
          <label className="font-semibold mb-2">Application Source</label>
          <div className="flex gap-4">
            {["Branch", "Dealer", "TSF", "DSF"].map((src) => (
              <label key={src} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={applicationSource.includes(src)}
                  onChange={() => toggleApplicationSource(src)}
                />
                {src}
              </label>
            ))}
          </div>
        </div>

        {[
          { name: "channel_code", label: "Channel Code", type: "number" },
          { name: "program_code", label: "Program Code", type: "number" },
          { name: "branch_code", label: "Branch Code", type: "number" },
          { name: "so_employee_no", label: "SO Employee No.", type: "number" },
          { name: "so_employee_name", label: "SO Employee Name", type: "text" },
          { name: "pb_bm_employee_no", label: "PB/BM Employee No.", type: "number" },
          { name: "pb_bm_employee_name", label: "PB/BM Employee Name", type: "text" },
          { name: "sm_employee_no", label: "SM Employee No.", type: "number" },
          { name: "sm_employee_name", label: "SM Employee Name", type: "text" },
          { name: "dealership_name", label: "Dealership Name", type: "text" },
          { name: "branch_name_code", label: "Branch Name & Code", type: "text" }
        ].map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium mb-1">{field.label}</label>
            <input
              type={field.type}
              name={field.name}
              placeholder={field.label}
              value={formData[field.name] || ""}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-gray-50 px-4 py-2 text-base shadow-sm transition placeholder:text-gray-400"
            />
          </div>
        ))}

        <div className="col-span-2">
          <label className="block mb-1">Branch Sign & Stamp</label>
          <input type="file" className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2 text-base shadow-sm transition" />
        </div>
      </div>
    </section>
  );
};
