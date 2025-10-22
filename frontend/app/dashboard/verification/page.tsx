"use client";

import React, { useState } from 'react';
import { Check, Clock, User, Calendar } from 'lucide-react';
import { mockApplications } from '../../data/mockData';
import StatusBadge from './StatusBadge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const VerificationWorkflow: React.FC = () => {
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);
  const [searchName, setSearchName] = useState("");
  const [searchLoanNumber, setSearchLoanNumber] = useState("");
  const [minLoanAmount, setMinLoanAmount] = useState("");
  const [maxLoanAmount, setMaxLoanAmount] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const workflowSteps = [
    { id: 1, name: 'Data Entry', description: 'Initial application data entry and validation' },
    { id: 2, name: 'Initial Verification', description: 'Verify applicant identity and basic information' },
    { id: 3, name: 'CIU Checks', description: 'Credit Information Unit background checks' },
    { id: 4, name: 'Final Approval', description: 'Senior manager approval and loan terms finalization' },
    { id: 5, name: 'Disbursement', description: 'Loan amount disbursement preparation' }
  ];

  const getStepStatus = (currentStep: number, stepId: number) => {
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'current';
    return 'pending';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const inProgressApplications = mockApplications.filter(app => {
    const statusMatch = ['in-verification', 'pending', 'disbursed', 'approved', 'rejected'].includes(app.status);
    const nameMatch = app.applicantName.toLowerCase().includes(searchName.toLowerCase());
    const loanMatch = app.loanNumber.toLowerCase().includes(searchLoanNumber.toLowerCase());
    const minMatch = minLoanAmount === "" || app.loanAmount >= parseInt(minLoanAmount);
    const maxMatch = maxLoanAmount === "" || app.loanAmount <= parseInt(maxLoanAmount);
    const date = new Date(app.lastUpdated);
    const fromMatch = dateFrom === "" || date >= new Date(dateFrom);
    const toMatch = dateTo === "" || date <= new Date(dateTo);

    return statusMatch && nameMatch && loanMatch && minMatch && maxMatch && fromMatch && toMatch;
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Workflow</h2>
        <p className="text-gray-600">Track loan applications through the verification process</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <Label htmlFor="name">Search by Name</Label>
          <Input
            id="name"
            placeholder="e.g. Ali Raza"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="loanNumber">Loan Number</Label>
          <Input
            id="loanNumber"
            placeholder="e.g. LN-2024-1234"
            value={searchLoanNumber}
            onChange={(e) => setSearchLoanNumber(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="minLoanAmount">Min Loan Amount</Label>
          <Input
            id="minLoanAmount"
            type="number"
            placeholder="e.g. 100000"
            value={minLoanAmount}
            onChange={(e) => setMinLoanAmount(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="maxLoanAmount">Max Loan Amount</Label>
          <Input
            id="maxLoanAmount"
            type="number"
            placeholder="e.g. 500000"
            value={maxLoanAmount}
            onChange={(e) => setMaxLoanAmount(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="dateFrom">Date From</Label>
          <Input
            id="dateFrom"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="dateTo">Date To</Label>
          <Input
            id="dateTo"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
        <div>
          <Button onClick={()=>{setDateFrom(""),setDateTo("")
            setMaxLoanAmount(""),setMinLoanAmount(""),
            setSearchLoanNumber(""),setSearchName("")
          }}>clear </Button>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Applications List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">In Progress Applications</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {inProgressApplications.map((app) => (
                <div
                  key={app.id}
                  onClick={() => setSelectedApplication(app.id)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${
                    selectedApplication === app.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-medium text-gray-900">{app.applicantName}</h4>
                    <StatusBadge status={app.status} size="sm" />
                  </div>
                  <p className="text-sm text-gray-500 mb-1">{app.loanNumber}</p>
                  <p className="text-sm font-medium text-gray-900">{formatCurrency(app.loanAmount)}</p>
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(app.lastUpdated).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Workflow Details */}
        <div className="lg:col-span-2">
          {selectedApplication ? (
            (() => {
              const app = mockApplications.find(a => a.id === selectedApplication);
              return app ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{app.applicantName}</h3>
                        <p className="text-gray-600">{app.loanNumber}</p>
                      </div>
                      <StatusBadge status={app.status} />
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">CNIC:</span>
                        <span className="ml-2 font-medium">{app.cnic}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Loan Amount:</span>
                        <span className="ml-2 font-medium">{formatCurrency(app.loanAmount)}</span>
                      </div>
                      {app.vehicleDetails && (
                        <>
                          <div>
                            <span className="text-gray-500">Vehicle:</span>
                            <span className="ml-2 font-medium">
                              {app.vehicleDetails.year} {app.vehicleDetails.make} {app.vehicleDetails.model}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Vehicle Price:</span>
                            <span className="ml-2 font-medium">{formatCurrency(app.vehicleDetails.price)}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Workflow Progress</h4>
                    <div className="space-y-4">
                      {workflowSteps.map((step, index) => {
                        const status = getStepStatus(app.currentStep, step.id);
                        return (
                          <div key={step.id} className="flex items-start">
                            <div className="flex items-center">
                              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                status === 'completed' 
                                  ? 'bg-green-100 text-green-600' 
                                  : status === 'current'
                                  ? 'bg-blue-100 text-blue-600'
                                  : 'bg-gray-100 text-gray-400'
                              }`}>
                                {status === 'completed' ? (
                                  <Check className="h-4 w-4" />
                                ) : status === 'current' ? (
                                  <Clock className="h-4 w-4" />
                                ) : (
                                  <span className="text-sm font-medium">{step.id}</span>
                                )}
                              </div>
                              {index < workflowSteps.length - 1 && (
                                <div className={`w-px h-8 ml-4 ${
                                  status === 'completed' ? 'bg-green-200' : 'bg-gray-200'
                                }`} />
                              )}
                            </div>
                            <div className="ml-4 pb-8">
                              <h5 className={`text-sm font-medium ${
                                status === 'current' ? 'text-blue-900' : 'text-gray-900'
                              }`}>
                                {step.name}
                              </h5>
                              <p className="text-sm text-gray-500 mt-1">{step.description}</p>
                              {status === 'current' && (
                                <div className="flex items-center mt-2 text-xs text-gray-500">
                                  <User className="h-3 w-3 mr-1" />
                                  Assigned to: Verification Team
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : null;
            })()
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Application</h3>
              <p className="text-gray-500">Choose an application from the list to view its workflow progress</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationWorkflow;