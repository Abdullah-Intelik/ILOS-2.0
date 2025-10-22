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
import { Search, Eye, ArrowRight, Clock, RotateCcw, AlertTriangle, FileText, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

// Mock data for applications under review
const underReviewApplications = [
  {
    id: "UBL-2024-001285",
    name: "Shahid Afridi",
    cnic: "42101-1234567-8",
    reason: "Income verification failed",
    status: "Under Review",
    priority: "High",
    lastUpdate: "1 hour ago",
    amount: "PKR 2,300,000",
    loanType: "Personal Loan",
    rejectedBy: "Omar Khan",
    rejectionDate: "2024-01-15",
    assignedTo: "Ayesha Malik",
  },
  {
    id: "UBL-2024-001286",
    name: "Aisha Malik",
    cnic: "42101-2345678-9",
    reason: "Document discrepancy",
    status: "Under Review",
    priority: "Medium",
    lastUpdate: "2 hours ago",
    amount: "PKR 1,700,000",
    loanType: "Auto Loan",
    rejectedBy: "Tariq Ahmed",
    rejectionDate: "2024-01-15",
    assignedTo: "Unassigned",
  },
  {
    id: "UBL-2024-001287",
    name: "Farhan Ahmed",
    cnic: "42101-3456789-0",
    reason: "Address verification failed",
    status: "Under Review",
    priority: "High",
    lastUpdate: "3 hours ago",
    amount: "PKR 3,500,000",
    loanType: "Home Loan",
    rejectedBy: "Saima Khan",
    rejectionDate: "2024-01-14",
    assignedTo: "Zainab Ali",
  },
  {
    id: "UBL-2024-001288",
    name: "Sadia Khan",
    cnic: "42101-4567890-1",
    reason: "Blacklist match found",
    status: "Under Review",
    priority: "Critical",
    lastUpdate: "4 hours ago",
    amount: "PKR 900,000",
    loanType: "Personal Loan",
    rejectedBy: "Usman Ali",
    rejectionDate: "2024-01-14",
    assignedTo: "Zainab Ali",
  },
]

// Mock application details
const applicationDetails = {
  id: "UBL-2024-001285",
  name: "Shahid Afridi",
  cnic: "42101-1234567-8",
  dateOfBirth: "01-03-1980",
  gender: "Male",
  address: "House #123, Street 5, DHA Phase 1, Karachi",
  contactNumber: "+92 300 1234567",
  email: "shahid.afridi@example.com",
  employer: "XYZ Corporation",
  employmentDuration: "3 years",
  monthlyIncome: "PKR 180,000",
  loanType: "Personal Loan",
  loanAmount: "PKR 2,300,000",
  loanTenure: "36 months",
  monthlyInstallment: "PKR 76,000",
  interestRate: "16.5%",
  branchCode: "UBL-KHI-001",
  submittedDate: "2024-01-10",
  rejectionReason: "Income verification failed - Salary slips do not match with bank statement transactions.",
  rejectedBy: "Omar Khan",
  rejectionDate: "2024-01-15",
  assignedTo: "Ayesha Malik",
  assignedDate: "2024-01-16",
}

// Mock rejection history
const rejectionHistory = [
  {
    date: "2024-01-15 14:30",
    action: "Application rejected",
    user: "Omar Khan",
    notes: "Income verification failed. Salary slips do not match with bank statement transactions."
  },
  {
    date: "2024-01-15 14:45",
    action: "Sent to RRU",
    user: "System",
    notes: "Application automatically sent to Rejection Review Unit."
  },
  {
    date: "2024-01-16 09:15",
    action: "Assigned for review",
    user: "Zainab Ali",
    notes: "Assigned to Ayesha Malik for review."
  },
  {
    date: "2024-01-16 10:30",
    action: "Review started",
    user: "Ayesha Malik",
    notes: "Started reviewing application and contacting applicant for clarification."
  },
]

function getStatusBadge(status: string) {
  switch (status) {
    case "Under Review":
      return <Badge className="bg-orange-100 text-orange-800">Under Review</Badge>
    case "Resumed":
      return <Badge className="bg-green-100 text-green-800">Resumed</Badge>
    case "Returned":
      return <Badge variant="destructive">Returned</Badge>
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

export default function RRUUnderReviewPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [reviewNotes, setReviewNotes] = useState("")
  const { toast } = useToast()

  const filteredApplications = underReviewApplications.filter((app) => {
    const matchesSearch = 
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.cnic.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (activeTab === "all") {
      return matchesSearch
    } else if (activeTab === "unassigned") {
      return matchesSearch && app.assignedTo === "Unassigned"
    } else if (activeTab === "assigned") {
      return matchesSearch && app.assignedTo !== "Unassigned"
    }
    
    return matchesSearch
  })

  const handleAssign = (id: string) => {
    toast({
      title: "Application Assigned",
      description: `Application ${id} has been assigned to you for review.`,
    })
  }

  const handleAddNote = () => {
    if (reviewNotes.trim()) {
      toast({
        title: "Note Added",
        description: "Your review note has been added to the application.",
      })
      setReviewNotes("")
    } else {
      toast({
        title: "Error",
        description: "Please enter a note before submitting.",
        variant: "destructive",
      })
    }
  }

  const handleResumeApplication = (id: string) => {
    toast({
      title: "Application Resumed",
      description: `Application ${id} has been resumed for processing.`,
    })
  }

  const handleConfirmRejection = (id: string) => {
    toast({
      title: "Rejection Confirmed",
      description: `Application ${id} rejection has been confirmed.`,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Under Review</h2>
          <p className="text-muted-foreground">Review rejected applications and determine next steps</p>
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
              <label className="text-sm font-medium">Rejection Reason</label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="Filter by reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reasons</SelectItem>
                  <SelectItem value="income">Income Verification</SelectItem>
                  <SelectItem value="document">Document Discrepancy</SelectItem>
                  <SelectItem value="address">Address Verification</SelectItem>
                  <SelectItem value="blacklist">Blacklist Match</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Applications</TabsTrigger>
          <TabsTrigger value="unassigned">Unassigned</TabsTrigger>
          <TabsTrigger value="assigned">Assigned to Me</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Applications Under Review</CardTitle>
              <CardDescription>Review rejected applications and determine next steps</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>LOS ID</TableHead>
                    <TableHead>Rejection Reason</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Assigned To</TableHead>
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
                        <div className="max-w-[200px] truncate" title={application.reason}>
                          {application.reason}
                        </div>
                      </TableCell>
                      <TableCell>{getPriorityBadge(application.priority)}</TableCell>
                      <TableCell>{application.amount}</TableCell>
                      <TableCell>
                        {application.assignedTo === "Unassigned" ? (
                          <Badge variant="outline">Unassigned</Badge>
                        ) : (
                          application.assignedTo
                        )}
                      </TableCell>
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
                            {application.assignedTo === "Unassigned" && (
                              <DropdownMenuItem onClick={() => handleAssign(application.id)}>
                                Assign to Me
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleResumeApplication(application.id)}>
                              <RotateCcw className="mr-2 h-4 w-4" />
                              Resume Application
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleConfirmRejection(application.id)}>
                              <AlertTriangle className="mr-2 h-4 w-4" />
                              Confirm Rejection
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
                    <CardDescription>Review rejected application information</CardDescription>
                  </div>
                  {getStatusBadge("Under Review")}
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
                  <h4 className="text-sm font-medium mb-2">Rejection Information</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Rejection Reason</p>
                      <p className="font-medium text-red-600">{applicationDetails.rejectionReason}</p>
                    </div>
                    <div className="flex gap-8">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Rejected By</p>
                        <p className="font-medium">{applicationDetails.rejectedBy}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Rejection Date</p>
                        <p className="font-medium">{applicationDetails.rejectionDate}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Review Actions</CardTitle>
                <CardDescription>
                  Take action on this rejected application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="review-notes">Review Notes</Label>
                  <Textarea
                    id="review-notes"
                    placeholder="Add notes about your review findings..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={4}
                  />
                  <Button 
                    className="mt-2" 
                    size="sm"
                    onClick={handleAddNote}
                  >
                    Add Note
                  </Button>
                </div>
                
                <div className="border-t pt-4 space-y-4">
                  <Button className="w-full" onClick={() => handleResumeApplication(applicationDetails.id)}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Resume Application
                  </Button>
                  
                  <Button variant="outline" className="w-full">
                    Request Additional Information
                  </Button>
                  
                  <Button variant="destructive" className="w-full" onClick={() => handleConfirmRejection(applicationDetails.id)}>
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Confirm Rejection
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Rejection History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Rejection & Review History</CardTitle>
              <CardDescription>Timeline of rejection and review activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {rejectionHistory.map((item, index) => (
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