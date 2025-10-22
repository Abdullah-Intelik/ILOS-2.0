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
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import { Search, Eye, ArrowRight, RotateCcw, CheckCircle, AlertTriangle, FileText, MoreHorizontal, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Mock data for resumed applications
const resumedApplications = [
  {
    id: "UBL-2024-001290",
    name: "Hamza Khan",
    cnic: "42101-5678901-2",
    status: "resumed",
    priority: "High",
    resumedDate: "2024-01-16",
    amount: "PKR 1,800,000",
    loanType: "Personal Loan",
    rejectionReason: "Income verification failed",
    resumedBy: "Ayesha Malik",
    stage: "Document Verification",
    progress: 45,
  },
  {
    id: "UBL-2024-001291",
    name: "Fatima Zaidi",
    cnic: "42101-6789012-3",
    status: "resumed",
    priority: "Medium",
    resumedDate: "2024-01-16",
    amount: "PKR 2,500,000",
    loanType: "Auto Loan",
    rejectionReason: "Document discrepancy",
    resumedBy: "Zainab Ali",
    stage: "Income Verification",
    progress: 60,
  },
  {
    id: "UBL-2024-001292",
    name: "Kamran Ahmed",
    cnic: "42101-7890123-4",
    status: "resumed",
    priority: "High",
    resumedDate: "2024-01-15",
    amount: "PKR 4,200,000",
    loanType: "Home Loan",
    rejectionReason: "Address verification failed",
    resumedBy: "Ayesha Malik",
    stage: "Field Verification",
    progress: 75,
  },
  {
    id: "UBL-2024-001293",
    name: "Nadia Qureshi",
    cnic: "42101-8901234-5",
    status: "completed",
    priority: "Medium",
    resumedDate: "2024-01-14",
    amount: "PKR 1,500,000",
    loanType: "Personal Loan",
    rejectionReason: "Document discrepancy",
    resumedBy: "Zainab Ali",
    stage: "Approved",
    progress: 100,
    completedDate: "2024-01-16",
  },
]

// Mock application details
const applicationDetails = {
  id: "UBL-2024-001290",
  name: "Hamza Khan",
  cnic: "42101-5678901-2",
  dateOfBirth: "15-07-1985",
  gender: "Male",
  address: "House #456, Street 10, Gulberg III, Lahore",
  contactNumber: "+92 321 1234567",
  email: "hamza.khan@example.com",
  employer: "ABC Technologies Ltd.",
  employmentDuration: "4 years",
  monthlyIncome: "PKR 150,000",
  loanType: "Personal Loan",
  loanAmount: "PKR 1,800,000",
  loanTenure: "36 months",
  monthlyInstallment: "PKR 60,000",
  interestRate: "16%",
  branchCode: "UBL-LHR-002",
  submittedDate: "2024-01-10",
  rejectionReason: "Income verification failed - Salary slips do not match with bank statement transactions.",
  rejectedBy: "Tariq Ahmed",
  rejectionDate: "2024-01-14",
  resumedBy: "Ayesha Malik",
  resumedDate: "2024-01-16",
  currentStage: "Document Verification",
  progress: 45,
}

// Mock verification checklist
const verificationChecklist = [
  { id: "identity", label: "Identity Verification", status: "completed" },
  { id: "address", label: "Address Verification", status: "pending" },
  { id: "employment", label: "Employment Verification", status: "in_progress" },
  { id: "income", label: "Income Verification", status: "pending" },
  { id: "documents", label: "Document Verification", status: "in_progress" },
  { id: "credit_history", label: "Credit History Check", status: "completed" },
  { id: "blacklist", label: "Blacklist Check", status: "completed" },
  { id: "field_visit", label: "Field Visit Report", status: "pending" },
]

// Mock application history
const applicationHistory = [
  {
    date: "2024-01-10 11:30",
    action: "Application submitted",
    user: "Hamza Khan",
    notes: "Application submitted through UBL Mobile App."
  },
  {
    date: "2024-01-12 15:45",
    action: "Document verification started",
    user: "Saima Khan",
    notes: "Started verifying submitted documents."
  },
  {
    date: "2024-01-14 10:30",
    action: "Application rejected",
    user: "Tariq Ahmed",
    notes: "Income verification failed. Salary slips do not match with bank statement transactions."
  },
  {
    date: "2024-01-14 11:45",
    action: "Sent to RRU",
    user: "System",
    notes: "Application automatically sent to Rejection Review Unit."
  },
  {
    date: "2024-01-16 09:30",
    action: "Application resumed",
    user: "Ayesha Malik",
    notes: "After review, application has been resumed for processing with additional income verification."
  },
  {
    date: "2024-01-16 14:15",
    action: "Document verification restarted",
    user: "Saima Khan",
    notes: "Verifying additional documents provided by applicant."
  },
]

function getStatusBadge(status: string) {
  switch (status) {
    case "resumed":
      return <Badge className="bg-green-100 text-green-800">Resumed</Badge>
    case "completed":
      return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>
    case "approved":
      return <Badge className="bg-green-100 text-green-800">Approved</Badge>
    case "rejected":
      return <Badge variant="destructive">Rejected</Badge>
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
    case "in_progress":
      return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

function getPriorityBadge(priority: string) {
  switch (priority) {
    case "Low":
      return <Badge className="bg-gray-100 text-gray-800">Low</Badge>
    case "Medium":
      return <Badge className="bg-blue-100 text-blue-800">Medium</Badge>
    case "High":
      return <Badge className="bg-orange-100 text-orange-800">High</Badge>
    case "Critical":
      return <Badge variant="destructive">Critical</Badge>
    default:
      return <Badge variant="secondary">{priority}</Badge>
  }
}

export default function RRUResumeApplicationPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("in_progress")
  const [updateNotes, setUpdateNotes] = useState("")
  const { toast } = useToast()

  const filteredApplications = resumedApplications.filter((app) => {
    const matchesSearch = 
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.cnic.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (activeTab === "in_progress") {
      return matchesSearch && app.status === "resumed"
    } else if (activeTab === "completed") {
      return matchesSearch && app.status === "completed"
    }
    
    return matchesSearch
  })

  const handleAddNote = () => {
    if (updateNotes.trim()) {
      toast({
        title: "Update Added",
        description: "Your update has been added to the application.",
      })
      setUpdateNotes("")
    } else {
      toast({
        title: "Error",
        description: "Please enter an update before submitting.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateStatus = (status: string) => {
    toast({
      title: "Status Updated",
      description: `Application status has been updated to ${status}.`,
    })
  }

  const handleCompleteApplication = () => {
    toast({
      title: "Application Completed",
      description: "The application has been marked as completed and sent for final approval.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Resume Application</h2>
          <p className="text-muted-foreground">Monitor and manage resumed applications</p>
        </div>
        <Button>
          <ArrowRight className="mr-2 h-4 w-4" />
          Process Next
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, LOS ID, or CNIC..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="w-full md:w-[180px]">
              <label className="text-sm font-medium">Loan Type</label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="Filter by loan type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="personal">Personal Loan</SelectItem>
                  <SelectItem value="auto">Auto Loan</SelectItem>
                  <SelectItem value="home">Home Loan</SelectItem>
                  <SelectItem value="business">Business Loan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-[180px]">
              <label className="text-sm font-medium">Processing Stage</label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="Filter by stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  <SelectItem value="document">Document Verification</SelectItem>
                  <SelectItem value="income">Income Verification</SelectItem>
                  <SelectItem value="field">Field Verification</SelectItem>
                  <SelectItem value="approval">Final Approval</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Resumed Applications</CardTitle>
              <CardDescription>Applications that have been resumed after rejection review</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>LOS ID</TableHead>
                    <TableHead>Previous Rejection</TableHead>
                    <TableHead>Current Stage</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Resumed By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{application.name}</div>
                          <div className="text-sm text-muted-foreground">{application.cnic}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{application.id}</TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate" title={application.rejectionReason}>
                          {application.rejectionReason}
                        </div>
                      </TableCell>
                      <TableCell>{application.stage}</TableCell>
                      <TableCell>
                        <div className="w-full">
                          <div className="flex justify-between text-xs mb-1">
                            <span>{application.progress}%</span>
                          </div>
                          <Progress value={application.progress} className="h-2 w-[100px]" />
                        </div>
                      </TableCell>
                      <TableCell>{application.resumedBy}</TableCell>
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
          
          {/* Application Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg">Application Details</CardTitle>
                    <CardDescription>Resumed application information</CardDescription>
                  </div>
                  {getStatusBadge("resumed")}
                </div>
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
                      <p className="text-sm text-muted-foreground">Debt-to-Income Ratio: 40%</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-2">Rejection & Resume Information</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Previous Rejection Reason</p>
                      <p className="font-medium text-red-600">{applicationDetails.rejectionReason}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Rejected By</p>
                        <p className="font-medium">{applicationDetails.rejectedBy}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Rejection Date</p>
                        <p className="font-medium">{applicationDetails.rejectionDate}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Resumed By</p>
                        <p className="font-medium">{applicationDetails.resumedBy}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Resume Date</p>
                        <p className="font-medium">{applicationDetails.resumedDate}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-medium">Verification Checklist</h4>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">Current Stage:</p>
                      <Badge className="bg-blue-100 text-blue-800">{applicationDetails.currentStage}</Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {verificationChecklist.map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <span className="text-sm">{item.label}</span>
                        {getStatusBadge(item.status)}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-medium">Overall Progress</h4>
                    <span className="text-sm font-medium">{applicationDetails.progress}%</span>
                  </div>
                  <Progress value={applicationDetails.progress} className="h-2" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status Update</CardTitle>
                <CardDescription>
                  Update the status of this resumed application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="update-notes">Status Update</Label>
                  <Textarea
                    id="update-notes"
                    placeholder="Add notes about the current status..."
                    value={updateNotes}
                    onChange={(e) => setUpdateNotes(e.target.value)}
                    rows={4}
                  />
                  <Button 
                    className="mt-2" 
                    size="sm"
                    onClick={handleAddNote}
                  >
                    Add Update
                  </Button>
                </div>
                
                <div className="border-t pt-4 space-y-4">
                  <div>
                    <Label className="mb-2 block">Update Verification Status</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select verification step" />
                      </SelectTrigger>
                      <SelectContent>
                        {verificationChecklist.map((item) => (
                          <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleUpdateStatus("in_progress")}
                    >
                      In Progress
                    </Button>
                    <Button 
                      variant="default" 
                      className="flex-1"
                      onClick={() => handleUpdateStatus("completed")}
                    >
                      Completed
                    </Button>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <Button 
                    className="w-full" 
                    onClick={handleCompleteApplication}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Complete Application
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Application History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Application History</CardTitle>
              <CardDescription>Timeline of application activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {applicationHistory.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-[2px] bg-border relative">
                      <div className="absolute top-0 left-0 w-2 h-2 rounded-full bg-primary -translate-x-[3px]"></div>
                    </div>
                    <div className="pb-6 space-y-1">
                      <p className="text-sm text-muted-foreground">{item.date}</p>
                      <h4 className="font-medium">{item.action}</h4>
                      <p className="text-sm">By: {item.user}</p>
                      {item.notes && <p className="text-sm text-muted-foreground">{item.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 