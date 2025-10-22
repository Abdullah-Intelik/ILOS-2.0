"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { LoanApplication, UserRole, Document, WorkflowHistory } from "@/app/types"
import { WorkflowDiagram } from "@/components/workflow-diagram"
import { Clock, CheckCircle, AlertTriangle, FileText, Download, Eye, Calendar, User, Briefcase, Home, CreditCard, FileCheck } from "lucide-react"

interface ApplicationDetailProps {
  application: LoanApplication
  userRole: UserRole
}

function getStatusBadge(status: string) {
  const statusConfig: Record<string, { variant: "default" | "destructive" | "outline" | "secondary" | "success", label: string }> = {
    // PB statuses
    "draft": { variant: "outline", label: "Draft" },
    "submitted_to_spu": { variant: "default", label: "Submitted to SPU" },
    
    // SPU statuses
    "spu_verified": { variant: "success", label: "SPU Verified" },
    "spu_returned": { variant: "destructive", label: "Returned from SPU" },
    
    // COPS statuses
    "cops_data_entry": { variant: "outline", label: "COPS Data Entry" },
    "cops_compliance_check": { variant: "secondary", label: "COPS Compliance Check" },
    "cops_verified": { variant: "success", label: "COPS Verified" },
    
    // EAMVU statuses
    "eamvu_new": { variant: "outline", label: "EAMVU New" },
    "eamvu_agent_assigned": { variant: "secondary", label: "Agent Assigned" },
    "eamvu_visit_complete": { variant: "secondary", label: "Visit Complete" },
    "eamvu_verified": { variant: "success", label: "EAMVU Verified" },
    
    // CIU-RRU statuses
    "ciu_rru_review": { variant: "secondary", label: "RRU Review" },
    "ciu_rru_resumed": { variant: "success", label: "RRU Resumed" },
    "ciu_rru_returned": { variant: "destructive", label: "RRU Returned" },
    
    // CIU-AFD statuses
    "afd_pending": { variant: "outline", label: "AFD Pending" },
    "afd_in_progress": { variant: "secondary", label: "AFD In Progress" },
    "afd_flagged": { variant: "destructive", label: "AFD Flagged" },
    "afd_verified": { variant: "success", label: "AFD Verified" },
    
    // CIU-Acceptance statuses
    "acceptance_pending": { variant: "outline", label: "Acceptance Pending" },
    "acceptance_approved": { variant: "success", label: "Approved" },
    "acceptance_conditional": { variant: "secondary", label: "Conditionally Approved" },
    "acceptance_rejected": { variant: "destructive", label: "Rejected" },
    
    // Final status
    "disbursed": { variant: "success", label: "Disbursed" },
  }

  const config = statusConfig[status] || { variant: "outline", label: status }

  return <Badge variant={config.variant as any}>{config.label}</Badge>
}

function getDocumentStatusBadge(status: string) {
  const statusConfig: Record<string, { variant: "default" | "destructive" | "outline" | "secondary", label: string }> = {
    "verified": { variant: "default", label: "Verified" },
    "pending": { variant: "outline", label: "Pending" },
    "rejected": { variant: "destructive", label: "Rejected" },
    "missing": { variant: "destructive", label: "Missing" },
  }

  const config = statusConfig[status] || { variant: "outline", label: status }

  return <Badge variant={config.variant}>{config.label}</Badge>
}

export function ApplicationDetail({ application, userRole }: ApplicationDetailProps) {
  const [activeTab, setActiveTab] = useState("overview")
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Application {application.loanNumber}
          </h1>
          <p className="text-muted-foreground">
            {application.applicantName} • {application.loanType} • {application.loanAmount.toLocaleString('en-PK', { style: 'currency', currency: 'PKR' })}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {getStatusBadge(application.status)}
          
          {/* Role-specific action buttons */}
          {userRole === 'pb' && application.status === 'draft' && (
            <Button>Continue Editing</Button>
          )}
          {userRole === 'pb' && application.status === 'acceptance_approved' && (
            <Button>Proceed to Disbursement</Button>
          )}
          {userRole === 'spu' && application.status === 'submitted_to_spu' && (
            <Button>Start Verification</Button>
          )}
          {/* Add more role-specific buttons as needed */}
        </div>
      </div>
      
      {/* Workflow diagram */}
      <WorkflowDiagram 
        currentDepartment={application.currentDepartment}
        workflowSteps={application.workflow}
        applicationStatus={application.status}
      />
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          {userRole === 'pb' && <TabsTrigger value="applicant">Applicant</TabsTrigger>}
          {userRole === 'cops' && <TabsTrigger value="compliance">Compliance</TabsTrigger>}
          {userRole === 'eamvu' && <TabsTrigger value="verification">Field Verification</TabsTrigger>}
          {userRole === 'ciu_afd' && <TabsTrigger value="fraud">Fraud Checks</TabsTrigger>}
          {userRole === 'ciu_acceptance' && <TabsTrigger value="decision">Decision</TabsTrigger>}
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Loan Details</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  <div className="flex justify-between">
                    <dt className="font-medium">Loan Type</dt>
                    <dd>{application.loanType}</dd>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <dt className="font-medium">Loan Amount</dt>
                    <dd>{application.loanAmount.toLocaleString('en-PK', { style: 'currency', currency: 'PKR' })}</dd>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <dt className="font-medium">Application Date</dt>
                    <dd>{new Date(application.applicationDate).toLocaleDateString()}</dd>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <dt className="font-medium">Last Updated</dt>
                    <dd>{new Date(application.lastUpdated).toLocaleDateString()}</dd>
                  </div>
                  {application.loanDetails && (
                    <>
                      <Separator />
                      <div className="flex justify-between">
                        <dt className="font-medium">Purpose</dt>
                        <dd>{application.loanDetails.purpose}</dd>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <dt className="font-medium">Tenor</dt>
                        <dd>{application.loanDetails.tenor} months</dd>
                      </div>
                      {application.loanDetails.approvedAmount && (
                        <>
                          <Separator />
                          <div className="flex justify-between">
                            <dt className="font-medium">Approved Amount</dt>
                            <dd>{application.loanDetails.approvedAmount.toLocaleString('en-PK', { style: 'currency', currency: 'PKR' })}</dd>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </dl>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Applicant Details</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  <div className="flex justify-between">
                    <dt className="font-medium">Name</dt>
                    <dd>{application.applicantName}</dd>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <dt className="font-medium">CNIC</dt>
                    <dd>{application.cnic}</dd>
                  </div>
                  {application.contactDetails && (
                    <>
                      <Separator />
                      <div className="flex justify-between">
                        <dt className="font-medium">Phone</dt>
                        <dd>{application.contactDetails.phone}</dd>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <dt className="font-medium">Email</dt>
                        <dd>{application.contactDetails.email}</dd>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <dt className="font-medium">Address</dt>
                        <dd className="text-right">{application.contactDetails.address}, {application.contactDetails.city}</dd>
                      </div>
                    </>
                  )}
                  {application.applicantDetails && (
                    <>
                      <Separator />
                      <div className="flex justify-between">
                        <dt className="font-medium">Segment</dt>
                        <dd>{application.applicantDetails.segment}</dd>
                      </div>
                    </>
                  )}
                </dl>
              </CardContent>
            </Card>
          </div>
          
          {/* Status Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Status</CardTitle>
                <div className="p-2 rounded-lg bg-blue-100">
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getStatusBadge(application.status)}</div>
                <p className="text-xs text-muted-foreground">Updated {new Date(application.lastUpdated).toLocaleDateString()}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Documents</CardTitle>
                <div className="p-2 rounded-lg bg-green-100">
                  <FileText className="h-4 w-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {application.documents.filter(doc => doc.status === 'verified').length} / {application.documents.length}
                </div>
                <p className="text-xs text-muted-foreground">Verified documents</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Department</CardTitle>
                <div className="p-2 rounded-lg bg-purple-100">
                  <Briefcase className="h-4 w-4 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {application.currentDepartment.toUpperCase()}
                </div>
                <p className="text-xs text-muted-foreground">Processing department</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Priority</CardTitle>
                <div className="p-2 rounded-lg bg-amber-100">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">
                  {application.priority}
                </div>
                <p className="text-xs text-muted-foreground">Application priority</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Application Documents</CardTitle>
              <CardDescription>Documents submitted with this application</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead>Required</TableHead>
                    {(userRole === 'spu' || userRole === 'cops') && (
                      <TableHead>Verification</TableHead>
                    )}
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {application.documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.name}</TableCell>
                      <TableCell>{getDocumentStatusBadge(doc.status)}</TableCell>
                      <TableCell>{doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString() : "N/A"}</TableCell>
                      <TableCell>{doc.required ? "Yes" : "No"}</TableCell>
                      {(userRole === 'spu' || userRole === 'cops') && (
                        <TableCell>
                          {doc.verifiedBy ? `Verified by ${doc.verifiedBy}` : "Not verified"}
                        </TableCell>
                      )}
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {doc.status !== 'missing' && (
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          )}
                          {doc.status !== 'missing' && (
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          )}
                          {userRole === 'pb' && doc.status === 'missing' && (
                            <Button size="sm">
                              Upload
                            </Button>
                          )}
                          {(userRole === 'spu' || userRole === 'cops') && doc.status === 'pending' && (
                            <Button size="sm">
                              <FileCheck className="h-4 w-4 mr-1" />
                              Verify
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Application History</CardTitle>
              <CardDescription>Timeline of all actions taken on this application</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {application.history.map((item: WorkflowHistory, index) => (
                  <div key={index} className="flex">
                    <div className="mr-4 flex flex-col items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      {index < application.history.length - 1 && (
                        <div className="h-full w-px bg-border" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        {new Date(item.timestamp).toLocaleString()}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-base font-medium leading-none">
                          {item.action}
                        </p>
                        <Badge variant="outline">{item.department.toUpperCase()}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        By: {item.user}
                      </p>
                      {item.comments && (
                        <p className="text-sm mt-2 bg-muted p-2 rounded-md">
                          {item.comments}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Role-specific tabs */}
        {userRole === 'pb' && (
          <TabsContent value="applicant" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Applicant Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium flex items-center">
                        <User className="mr-2 h-5 w-5" />
                        Personal Details
                      </h3>
                      <Separator className="my-2" />
                      <dl className="space-y-2">
                        {application.applicantDetails && (
                          <>
                            <div className="flex justify-between">
                              <dt className="font-medium">Full Name</dt>
                              <dd>{application.applicantDetails.firstName} {application.applicantDetails.lastName}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="font-medium">Date of Birth</dt>
                              <dd>{application.applicantDetails.dateOfBirth}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="font-medium">Gender</dt>
                              <dd className="capitalize">{application.applicantDetails.gender}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="font-medium">Marital Status</dt>
                              <dd className="capitalize">{application.applicantDetails.maritalStatus}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="font-medium">Education</dt>
                              <dd>{application.applicantDetails.education}</dd>
                            </div>
                          </>
                        )}
                      </dl>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium flex items-center">
                        <Home className="mr-2 h-5 w-5" />
                        Contact Details
                      </h3>
                      <Separator className="my-2" />
                      <dl className="space-y-2">
                        {application.contactDetails && (
                          <>
                            <div className="flex justify-between">
                              <dt className="font-medium">Email</dt>
                              <dd>{application.contactDetails.email}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="font-medium">Phone</dt>
                              <dd>{application.contactDetails.phone}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="font-medium">Mobile</dt>
                              <dd>{application.contactDetails.mobilePhone}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="font-medium">Address</dt>
                              <dd>{application.contactDetails.address}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="font-medium">City</dt>
                              <dd>{application.contactDetails.city}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="font-medium">Province</dt>
                              <dd>{application.contactDetails.province}</dd>
                            </div>
                          </>
                        )}
                      </dl>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium flex items-center">
                        <Briefcase className="mr-2 h-5 w-5" />
                        Employment Details
                      </h3>
                      <Separator className="my-2" />
                      <dl className="space-y-2">
                        {application.employmentDetails && (
                          <>
                            <div className="flex justify-between">
                              <dt className="font-medium">Employer</dt>
                              <dd>{application.employmentDetails.employerName}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="font-medium">Designation</dt>
                              <dd>{application.employmentDetails.designation}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="font-medium">Employment Type</dt>
                              <dd className="capitalize">{application.employmentDetails.employmentType}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="font-medium">Duration</dt>
                              <dd>{application.employmentDetails.employmentDuration}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="font-medium">Monthly Income</dt>
                              <dd>{application.employmentDetails.monthlyIncome.toLocaleString('en-PK', { style: 'currency', currency: 'PKR' })}</dd>
                            </div>
                          </>
                        )}
                      </dl>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium flex items-center">
                        <CreditCard className="mr-2 h-5 w-5" />
                        Loan Details
                      </h3>
                      <Separator className="my-2" />
                      <dl className="space-y-2">
                        {application.loanDetails && (
                          <>
                            <div className="flex justify-between">
                              <dt className="font-medium">Purpose</dt>
                              <dd>{application.loanDetails.purpose}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="font-medium">Requested Amount</dt>
                              <dd>{application.loanDetails.requestedAmount.toLocaleString('en-PK', { style: 'currency', currency: 'PKR' })}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="font-medium">Tenor</dt>
                              <dd>{application.loanDetails.tenor} months</dd>
                            </div>
                            {application.loanDetails.approvedAmount && (
                              <>
                                <div className="flex justify-between">
                                  <dt className="font-medium">Approved Amount</dt>
                                  <dd>{application.loanDetails.approvedAmount.toLocaleString('en-PK', { style: 'currency', currency: 'PKR' })}</dd>
                                </div>
                                <div className="flex justify-between">
                                  <dt className="font-medium">Interest Rate</dt>
                                  <dd>{application.loanDetails.interestRate}%</dd>
                                </div>
                                <div className="flex justify-between">
                                  <dt className="font-medium">EMI</dt>
                                  <dd>{application.loanDetails.emi?.toLocaleString('en-PK', { style: 'currency', currency: 'PKR' })}</dd>
                                </div>
                              </>
                            )}
                          </>
                        )}
                      </dl>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
} 