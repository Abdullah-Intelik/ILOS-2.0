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
import { Search, Eye, ArrowRight, XCircle, AlertTriangle, FileText, MoreHorizontal, Send, Clock } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

// Mock data for returned applications
const returnedApplications = [
  {
    id: "UBL-2024-001295",
    name: "Adeel Khan",
    cnic: "42101-1234567-8",
    reason: "Insufficient income documentation",
    status: "Returned",
    priority: "Medium",
    returnDate: "2024-01-16",
    amount: "PKR 1,500,000",
    loanType: "Personal Loan",
    returnedBy: "Ayesha Malik",
    returnedTo: "Personal Banking",
    requiredAction: "Provide additional income proof",
    dueDate: "2024-01-23",
  },
  {
    id: "UBL-2024-001296",
    name: "Sana Ahmed",
    cnic: "42101-2345678-9",
    reason: "Address verification failed",
    status: "Returned",
    priority: "High",
    returnDate: "2024-01-16",
    amount: "PKR 2,800,000",
    loanType: "Auto Loan",
    returnedBy: "Zainab Ali",
    returnedTo: "Personal Banking",
    requiredAction: "Provide updated address proof",
    dueDate: "2024-01-23",
  },
  {
    id: "UBL-2024-001297",
    name: "Imran Ahmed",
    cnic: "42101-3456789-0",
    reason: "Employment verification incomplete",
    status: "Returned",
    priority: "Medium",
    returnDate: "2024-01-15",
    amount: "PKR 3,200,000",
    loanType: "Home Loan",
    returnedBy: "Ayesha Malik",
    returnedTo: "Personal Banking",
    requiredAction: "Provide employment verification letter",
    dueDate: "2024-01-22",
  },
  {
    id: "UBL-2024-001298",
    name: "Fatima Zaidi",
    cnic: "42101-4567890-1",
    reason: "Missing bank statements",
    status: "Returned",
    priority: "Low",
    returnDate: "2024-01-15",
    amount: "PKR 1,200,000",
    loanType: "Personal Loan",
    returnedBy: "Zainab Ali",
    returnedTo: "Personal Banking",
    requiredAction: "Provide last 6 months bank statements",
    dueDate: "2024-01-22",
  },
]

// Mock application details
const applicationDetails = {
  id: "UBL-2024-001295",
  name: "Adeel Khan",
  cnic: "42101-1234567-8",
  dateOfBirth: "05-09-1982",
  gender: "Male",
  address: "House #789, Street 12, Bahria Town, Karachi",
  contactNumber: "+92 333 1234567",
  email: "adeel.khan@example.com",
  employer: "XYZ Corporation",
  employmentDuration: "2 years",
  monthlyIncome: "PKR 120,000",
  loanType: "Personal Loan",
  loanAmount: "PKR 1,500,000",
  loanTenure: "36 months",
  monthlyInstallment: "PKR 50,000",
  interestRate: "16%",
  branchCode: "UBL-KHI-003",
  submittedDate: "2024-01-10",
  rejectionReason: "Insufficient income documentation - Salary slips for the last 3 months are required but only 1 month provided.",
  rejectedBy: "Tariq Ahmed",
  rejectionDate: "2024-01-14",
  returnedBy: "Ayesha Malik",
  returnDate: "2024-01-16",
  returnedTo: "Personal Banking",
  requiredAction: "Provide additional income proof - Salary slips for all 3 months and updated bank statements.",
  dueDate: "2024-01-23",
  status: "Pending Customer Response",
}

// Mock missing documents
const missingDocuments = [
  { 
    id: "salary_slips", 
    name: "Salary Slips", 
    description: "Last 3 months salary slips", 
    status: "missing", 
    required: true,
    comments: "Only 1 month provided, need all 3 months"
  },
  { 
    id: "bank_statements", 
    name: "Bank Statements", 
    description: "Last 6 months bank statements", 
    status: "incomplete", 
    required: true,
    comments: "Only 3 months provided, need all 6 months"
  },
  { 
    id: "employment_letter", 
    name: "Employment Letter", 
    description: "Employment verification letter", 
    status: "provided", 
    required: true,
    comments: ""
  },
]

// Mock application history
const applicationHistory = [
  {
    date: "2024-01-10 10:15",
    action: "Application submitted",
    user: "Adeel Khan",
    notes: "Application submitted through UBL Branch."
  },
  {
    date: "2024-01-12 14:30",
    action: "Document verification started",
    user: "Saima Khan",
    notes: "Started verifying submitted documents."
  },
  {
    date: "2024-01-14 11:45",
    action: "Application rejected",
    user: "Tariq Ahmed",
    notes: "Insufficient income documentation. Salary slips for the last 3 months are required but only 1 month provided."
  },
  {
    date: "2024-01-14 12:00",
    action: "Sent to RRU",
    user: "System",
    notes: "Application automatically sent to Rejection Review Unit."
  },
  {
    date: "2024-01-16 09:45",
    action: "Application returned",
    user: "Ayesha Malik",
    notes: "After review, application has been returned to Personal Banking for additional documentation from customer."
  },
  {
    date: "2024-01-16 10:30",
    action: "Customer notified",
    user: "System",
    notes: "SMS notification sent to customer regarding required documents."
  },
]

function getStatusBadge(status: string) {
  switch (status) {
    case "Returned":
      return <Badge className="bg-orange-100 text-orange-800">Returned</Badge>
    case "Pending Customer Response":
      return <Badge className="bg-yellow-100 text-yellow-800">Pending Response</Badge>
    case "Documents Received":
      return <Badge className="bg-blue-100 text-blue-800">Docs Received</Badge>
    case "Resumed":
      return <Badge className="bg-green-100 text-green-800">Resumed</Badge>
    case "missing":
      return <Badge variant="destructive">Missing</Badge>
    case "incomplete":
      return <Badge className="bg-yellow-100 text-yellow-800">Incomplete</Badge>
    case "provided":
      return <Badge className="bg-green-100 text-green-800">Provided</Badge>
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

export default function RRUReturnedApplicationPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [followUpNotes, setFollowUpNotes] = useState("")
  const { toast } = useToast()

  const filteredApplications = returnedApplications.filter((app) => {
    const matchesSearch = 
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.cnic.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  const handleAddFollowUp = () => {
    if (followUpNotes.trim()) {
      toast({
        title: "Follow-up Added",
        description: "Your follow-up note has been added to the application.",
      })
      setFollowUpNotes("")
    } else {
      toast({
        title: "Error",
        description: "Please enter a follow-up note before submitting.",
        variant: "destructive",
      })
    }
  }

  const handleSendReminder = (id: string) => {
    toast({
      title: "Reminder Sent",
      description: `Reminder has been sent to the customer for application ${id}.`,
    })
  }

  const handleResumeApplication = (id: string) => {
    toast({
      title: "Application Resumed",
      description: `Application ${id} has been resumed for processing.`,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Returned Applications</h2>
          <p className="text-muted-foreground">Monitor and manage applications returned for additional information</p>
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
              <label className="text-sm font-medium">Priority</label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-[180px]">
              <label className="text-sm font-medium">Returned To</label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="pb">Personal Banking</SelectItem>
                  <SelectItem value="spu">SPU</SelectItem>
                  <SelectItem value="cops">COPS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Returned</TabsTrigger>
          <TabsTrigger value="pending">Pending Response</TabsTrigger>
          <TabsTrigger value="received">Documents Received</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Returned Applications</CardTitle>
              <CardDescription>Applications returned for additional information or documentation</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>LOS ID</TableHead>
                    <TableHead>Required Action</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Returned To</TableHead>
                    <TableHead>Due Date</TableHead>
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
                        <div className="max-w-[200px] truncate" title={application.requiredAction}>
                          {application.requiredAction}
                        </div>
                      </TableCell>
                      <TableCell>{getPriorityBadge(application.priority)}</TableCell>
                      <TableCell>{application.returnedTo}</TableCell>
                      <TableCell>{application.dueDate}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSendReminder(application.id)}>
                              <Send className="mr-2 h-4 w-4" />
                              Send Reminder
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleResumeApplication(application.id)}>
                              <ArrowRight className="mr-2 h-4 w-4" />
                              Resume Application
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
                    <CardDescription>Returned application information</CardDescription>
                  </div>
                  {getStatusBadge(applicationDetails.status)}
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
                      <p className="text-sm text-muted-foreground">Debt-to-Income Ratio: 42%</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-2">Return Information</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Required Action</p>
                      <p className="font-medium text-orange-600">{applicationDetails.requiredAction}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Returned By</p>
                        <p className="font-medium">{applicationDetails.returnedBy}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Return Date</p>
                        <p className="font-medium">{applicationDetails.returnDate}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Returned To</p>
                        <p className="font-medium">{applicationDetails.returnedTo}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Due Date</p>
                        <p className="font-medium">{applicationDetails.dueDate}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-2">Required Documents</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Document</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Comments</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {missingDocuments.map((document) => (
                        <TableRow key={document.id}>
                          <TableCell className="font-medium">{document.name}</TableCell>
                          <TableCell>{document.description}</TableCell>
                          <TableCell>{getStatusBadge(document.status)}</TableCell>
                          <TableCell>{document.comments}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Follow-up Actions</CardTitle>
                <CardDescription>
                  Manage follow-ups for this returned application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="follow-up-notes">Follow-up Notes</Label>
                  <Textarea
                    id="follow-up-notes"
                    placeholder="Add notes about follow-up actions..."
                    value={followUpNotes}
                    onChange={(e) => setFollowUpNotes(e.target.value)}
                    rows={4}
                  />
                  <Button 
                    className="mt-2" 
                    size="sm"
                    onClick={handleAddFollowUp}
                  >
                    Add Follow-up
                  </Button>
                </div>
                
                <div className="border-t pt-4 space-y-4">
                  <Button 
                    className="w-full" 
                    onClick={() => handleSendReminder(applicationDetails.id)}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send Reminder to Customer
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Extend Due Date
                  </Button>
                  
                  <Button 
                    variant="default" 
                    className="w-full"
                    onClick={() => handleResumeApplication(applicationDetails.id)}
                  >
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Resume Application
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