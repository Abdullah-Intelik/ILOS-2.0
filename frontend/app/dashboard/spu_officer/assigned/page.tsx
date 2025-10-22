"use client";

import { CheckCircle, FileText, Info, Search } from "lucide-react";
import { useState } from "react";

const mockApplications = [
  {
    id: "APP-00123",
    applicant: "John Doe",
    formType: "CashPlus",
    assignedDate: "2025-07-08",
    status: "Pending",
  },
  {
    id: "APP-00124",
    applicant: "Sarah Ali",
    formType: "Credit Card",
    assignedDate: "2025-07-07",
    status: "In Review",
  },
  {
    id: "APP-00125",
    applicant: "Ali Khan",
    formType: "AutoLoan",
    assignedDate: "2025-07-05",
    status: "Pending",
  },
];

export default function OfficerAssignedApplicationsPage() {
  const [search, setSearch] = useState("");

  const filteredApps = mockApplications.filter(app =>
    app.applicant.toLowerCase().includes(search.toLowerCase()) ||
    app.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">Assigned Applications</h1>

      <div className="mb-4 flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by Applicant or ID"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr className="text-sm font-medium text-gray-700 text-left">
              <th className="px-4 py-3">Application ID</th>
              <th className="px-4 py-3">Applicant Name</th>
              <th className="px-4 py-3">Form Type</th>
              <th className="px-4 py-3">Assigned Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filteredApps.length > 0 ? (
              filteredApps.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-blue-700">{app.id}</td>
                  <td className="px-4 py-3">{app.applicant}</td>
                  <td className="px-4 py-3">{app.formType}</td>
                  <td className="px-4 py-3">{app.assignedDate}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold ${
                      app.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                      app.status === "In Review" ? "bg-blue-100 text-blue-800" :
                      "bg-green-100 text-green-800"
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button className="text-sm px-3 py-1 rounded-lg bg-primary text-white hover:bg-primary/90 transition">
                      View
                    </button>
                    <button className="text-sm px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700">
                      Checklist
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-500 text-sm">
                  No assigned applications found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
