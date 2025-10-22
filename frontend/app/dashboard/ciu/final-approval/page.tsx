"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Search, CheckCircle, XCircle, Eye, ArrowRight, AlertTriangle, ThumbsUp, ThumbsDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Mock data for applications pending final approval
const pendingApprovalApplications = [
  {
    id: "UBL-2024-001278",
    name: "Samina Khan",
    cnic: "42101-4567890-1",
    status: "pending_approval",
    priority: "Medium",
    submittedDate: "2024-01-14",
    loanType: "Personal Loan",
    amount: "PKR 2,100,000",
    verificationStatus: "completed",
    blacklistStatus: "no_match",
    nadraStatus: "verified",
  },
  {
    id: "UBL-2024-001282",
    name: "Tariq Mehmood",
    cnic: "42101-5678901-2",
    status: "pending_approval",
    priority: "High",
    submittedDate: "2024-01-13",
    loanType: "Business Loan",
    amount: "PKR 4,800,000",
    verificationStatus: "completed",
    blacklistStatus: "no_match",
    nadraStatus: "verified",
  },
  {
    id: "UBL-2024-001285",
    name: "Farhan Ahmed",
    cnic: "42101-7890123-4",
    status: "pending_approval",
    priority: "Medium",
    submittedDate: "2024-01-12",
    loanType: "Auto Loan",
    amount: "PKR 2,100,000",
    verificationStatus: "completed",
    blacklistStatus: "no_match",
    nadraStatus: "verified",
  },
  {
    id: "UBL-2024-001290",
    name: "Saima Nawaz",
    cnic: "42101-8901234-5",
    status: "approved",
    priority: "Medium",
    submittedDate: "2024-01-11",
    loanType: "Personal Loan",
    amount: "PKR 1,500,000",
    verificationStatus: "completed",
    blacklistStatus: "no_match",
    nadraStatus: "verified",
    approvalDate: "2024-01-15",
    approvedBy: "Omar Khan",
  },
  {
    id: "UBL-2024-001295",
    name: "Nadia Qureshi",
    cnic: "42101-0123456-7",
    status: "rejected",
    priority: "Critical",
    submittedDate: "2024-01-10",
    loanType: "Home Loan",
    amount: "PKR 3,500,000",
    verificationStatus: "completed",
    blacklistStatus: "match_found",
    nadraStatus: "verified",
    rejectionDate: "2024-01-14",
    rejectedBy: "Ayesha Malik",
    rejectionReason: "Blacklist match found in Credit Bureau records",
  },
]

// Mock verification checklist
const verificationChecklist = [
  { id: "identity", label: "Identity Verification", status: "completed" },
  { id: "address", label: "Address Verification", status: "completed" },
  { id: "employment", label: "Employment Verification", status: "completed" },
  { id: "income", label: "Income Verification", status: "completed" },
  { id: "documents", label: "Document Verification", status: "completed" },
  { id: "credit_history", label: "Credit History Check", status: "completed" },
  { id: "blacklist", label: "Blacklist Check", status: "completed" },
  { id: "field_visit", label: "Field Visit Report", status: "completed" },
]

// Mock applicant details
const applicationDetails = {
  id: "UBL-2024-001278",
  name: "Samina Khan",
  cnic: "42101-4567890-1",
  dateOfBirth: "10-03-1988",
  gender: "Female",
  address: "House #123, Street 5, DHA Phase 2, Karachi",
  contactNumber: "+92 333 1234567",
  email: "samina.khan@example.com",
  employer: "ABC Corporation",
  employmentDuration: "4 years",
  monthlyIncome: "PKR 150,000",
  loanType: "Personal Loan",
  loanAmount: "PKR 2,100,000",
  loanTenure: "36 months",
  monthlyInstallment: "PKR 70,000",
  interestRate: "16%",
  branchCode: "UBL-KHI-005",
  submittedDate: "2024-01-14",
  verificationProgress: 100,
}

function getStatusBadge(status: string) {
  switch (status) {
    case "pending_approval":
      return <Badge className="bg-yellow-100 text-yellow-800">Pending Approval</Badge>
    case "approved":
      return <Badge className="bg-green-100 text-green-800">Approved</Badge>
    case "rejected":
      return <Badge variant="destructive">Rejected</Badge>
    case "completed":
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>
    case "verified":
      return <Badge className="bg-green-100 text-green-800">Verified</Badge>
    case "no_match":
      return <Badge className="bg-green-100 text-green-800">No Match</Badge>
    case "match_found":
      return <Badge variant="destructive">Match Found</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export default function CIUFinalApprovalPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("pending")
  const [approvalDecision, setApprovalDecision] = useState("")
  const [approvalNotes, setApprovalNotes] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const { toast } = useToast()

  const filteredApplications = pendingApprovalApplications.filter((app) => {
    const matchesSearch = 
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.cnic.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (activeTab === "pending") {
      return matchesSearch && app.status === "pending_approval"
    } else if (activeTab === "approved") {
      return matchesSearch && app.status === "approved"
    } else if (activeTab === "rejected") {
      return matchesSearch && app.status === "rejected"
    }
    
    return matchesSearch
  })

  const handleApprove = () => {
    if (approvalNotes.trim()) {
      toast({
        title: "Application Approved",
        description: "The application has been approved and sent for disbursement.",
      })
      setApprovalNotes("")
      setActiveTab("pending")
    } else {
      toast({
        title: "Error",
        description: "Please provide approval notes.",
        variant: "destructive",
      })
    }
  }

  const handleReject = () => {
    if (rejectionReason.trim()) {
      toast({
        title: "Application Rejected",
        description: "The application has been rejected.",
      })
      setRejectionReason("")
      setActiveTab("pending")
    } else {
      toast({
        title: "Error",
        description: "Please provide a rejection reason.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Final Approval</h2>
          <p className="text-muted-foreground">Review and provide final approval for loan applications</p>
        </div>
        <Button>
          <ArrowRight className="mr-2 h-4 w-4" />
          Process Next
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Pending Approval</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
        
        {/* Pending Approval Tab */}
        <TabsContent value="pending" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Search</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, LOS ID, or CNIC..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Applications Pending Final Approval</CardTitle>
              <CardDescription>Review and approve or reject applications</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>LOS ID</TableHead>
                    <TableHead>CNIC</TableHead>
                    <TableHead>Loan Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Verification</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell className="font-medium">{application.name}</TableCell>
                      <TableCell className="font-mono text-sm">{application.id}</TableCell>
                      <TableCell>{application.cnic}</TableCell>
                      <TableCell>{application.loanType}</TableCell>
                      <TableCell>{application.amount}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">All Verified</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 px-3"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          {/* Application Review and Approval Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Application Review</CardTitle>
                <CardDescription>Review application details and verification status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Applicant</p>
                      <p className="font-medium">{applicationDetails.name}</p>
                      <p className="text-sm text-muted-foreground">{applicationDetails.cnic}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Contact Information</p>
                      <p className="font-medium">{applicationDetails.contactNumber}</p>
                      <p className="text-sm text-muted-foreground">{applicationDetails.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Employment</p>
                      <p className="font-medium">{applicationDetails.employer}</p>
                      <p className="text-sm text-muted-foreground">{applicationDetails.employmentDuration}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Loan Details</p>
                      <p className="font-medium">{applicationDetails.loanType} - {applicationDetails.loanAmount}</p>
                      <p className="text-sm text-muted-foreground">Tenure: {applicationDetails.loanTenure}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Monthly Payment</p>
                      <p className="font-medium">{applicationDetails.monthlyInstallment}</p>
                      <p className="text-sm text-muted-foreground">Interest Rate: {applicationDetails.interestRate}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Income</p>
                      <p className="font-medium">{applicationDetails.monthlyIncome}</p>
                      <p className="text-sm text-muted-foreground">Debt-to-Income Ratio: 35%</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Verification Checklist</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {verificationChecklist.map((item) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Risk Assessment</h4>
                  <div className="flex items-center gap-4">
                    <Badge className="bg-green-100 text-green-800">Low Risk</Badge>
                    <span className="text-sm">Credit Score: 750 (Good)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Final Decision</CardTitle>
                <CardDescription>Approve or reject this application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={approvalDecision} onValueChange={setApprovalDecision}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="approve" id="approve" />
                    <Label htmlFor="approve" className="font-medium">Approve</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="reject" id="reject" />
                    <Label htmlFor="reject" className="font-medium">Reject</Label>
                  </div>
                </RadioGroup>
                
                {approvalDecision === "approve" && (
                  <div className="space-y-4 pt-2">
                    <div>
                      <Label htmlFor="approval-notes">Approval Notes</Label>
                      <Textarea
                        id="approval-notes"
                        placeholder="Add any notes or conditions for approval..."
                        value={approvalNotes}
                        onChange={(e) => setApprovalNotes(e.target.value)}
                        rows={4}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="notify-applicant" />
                      <label
                        htmlFor="notify-applicant"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Notify applicant via SMS
                      </label>
                    </div>
                    <Button className="w-full" onClick={handleApprove}>
                      <ThumbsUp className="mr-2 h-4 w-4" />
                      Approve Application
                    </Button>
                  </div>
                )}
                
                {approvalDecision === "reject" && (
                  <div className="space-y-4 pt-2">
                    <div>
                      <Label htmlFor="rejection-reason">Rejection Reason</Label>
                      <Select
                        value={rejectionReason}
                        onValueChange={setRejectionReason}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select rejection reason" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="insufficient_income">Insufficient Income</SelectItem>
                          <SelectItem value="high_debt_ratio">High Debt-to-Income Ratio</SelectItem>
                          <SelectItem value="document_discrepancy">Document Discrepancy</SelectItem>
                          <SelectItem value="credit_history">Poor Credit History</SelectItem>
                          <SelectItem value="verification_failed">Verification Failed</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="rejection-notes">Additional Notes</Label>
                      <Textarea
                        id="rejection-notes"
                        placeholder="Add detailed notes about the rejection reason..."
                        rows={4}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="notify-rejection" />
                      <label
                        htmlFor="notify-rejection"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Notify applicant via SMS
                      </label>
                    </div>
                    <Button variant="destructive" className="w-full" onClick={handleReject}>
                      <ThumbsDown className="mr-2 h-4 w-4" />
                      Reject Application
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Approved Tab */}
        <TabsContent value="approved" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Search</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, LOS ID, or CNIC..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Approved Applications</CardTitle>
              <CardDescription>Applications approved for disbursement</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>LOS ID</TableHead>
                    <TableHead>Loan Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Approved By</TableHead>
                    <TableHead>Approval Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell className="font-medium">{application.name}</TableCell>
                      <TableCell className="font-mono text-sm">{application.id}</TableCell>
                      <TableCell>{application.loanType}</TableCell>
                      <TableCell>{application.amount}</TableCell>
                      <TableCell>{application.approvedBy}</TableCell>
                      <TableCell>{application.approvalDate}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 px-3"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Rejected Tab */}
        <TabsContent value="rejected" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Search</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, LOS ID, or CNIC..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Rejected Applications</CardTitle>
              <CardDescription>Applications that did not meet approval criteria</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>LOS ID</TableHead>
                    <TableHead>Loan Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Rejected By</TableHead>
                    <TableHead>Rejection Reason</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell className="font-medium">{application.name}</TableCell>
                      <TableCell className="font-mono text-sm">{application.id}</TableCell>
                      <TableCell>{application.loanType}</TableCell>
                      <TableCell>{application.amount}</TableCell>
                      <TableCell>{application.rejectedBy}</TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate" title={application.rejectionReason}>
                          {application.rejectionReason}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 px-3"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 