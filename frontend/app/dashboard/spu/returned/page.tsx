// /dashboard/spu/returned/page.tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Search, Filter, RefreshCw, Calendar, AlertTriangle, ThumbsDown, ArrowLeft, Mail, Eye, FileText, RotateCcw, X } from "lucide-react"

// Mock data for returned applications
const returnedApplications = [
  {
    id: "UBL-2024-001260",
    applicant: "Tariq Ahmed",
    loanType: "Auto Loan",
    amount: "PKR 1,200,000",
    submissionDate: "2024-06-15",
    returnDate: "2024-06-18",
    returnReason: "Incomplete documentation",
    returnedBy: "Fatima Ali",
    status: "returned_to_applicant",
    priority: "medium",
    issues: [
      { 
        type: "missing_document", 
        description: "Income proof not provided", 
        resolution: "Request applicant to submit last 3 months salary slips"
      },
      { 
        type: "expired_document", 
        description: "CNIC expired", 
        resolution: "Request applicant to provide updated CNIC copy"
      }
    ]
  },
  {
    id: "UBL-2024-001261",
    applicant: "Sana Khan",
    loanType: "Home Loan",
    amount: "PKR 5,000,000",
    submissionDate: "2024-06-12",
    returnDate: "2024-06-16",
    returnReason: "Discrepancies in documents",
    returnedBy: "Imran Shah",
    status: "returned_to_applicant",
    priority: "high",
    issues: [
      { 
        type: "discrepancy", 
        description: "Income on bank statement doesn't match declared income", 
        resolution: "Request clarification and additional income proof"
      },
      { 
        type: "missing_document", 
        description: "Property valuation report missing", 
        resolution: "Request property valuation report from approved valuator"
      }
    ]
  },
  {
    id: "UBL-2024-001262",
    applicant: "Ahmed Hassan",
    loanType: "Personal Loan",
    amount: "PKR 800,000",
    submissionDate: "2024-06-10",
    returnDate: "2024-06-15",
    returnReason: "Employment verification failed",
    returnedBy: "Sana Khan",
    status: "returned_to_branch",
    priority: "urgent",
    issues: [
      { 
        type: "verification_failed", 
        description: "Employer couldn't verify employment status", 
        resolution: "Request branch to re-verify employment details"
      }
    ]
  },
  {
    id: "UBL-2024-001263",
    applicant: "Fatima Ahmed",
    loanType: "Business Loan",
    amount: "PKR 3,000,000",
    submissionDate: "2024-06-08",
    returnDate: "2024-06-14",
    returnReason: "Insufficient business documentation",
    returnedBy: "Imran Shah",
    status: "returned_to_applicant",
    priority: "medium",
    issues: [
      { 
        type: "incomplete_document", 
        description: "Incomplete financial statements", 
        resolution: "Request complete audited financial statements for last 2 years"
      },
      { 
        type: "missing_document", 
        description: "Business registration certificate not provided", 
        resolution: "Request business registration certificate"
      },
      { 
        type: "discrepancy", 
        description: "Business address on application doesn't match registration", 
        resolution: "Request clarification on business address"
      }
    ]
  },
  {
    id: "UBL-2024-001264",
    applicant: "Zain Malik",
    loanType: "Auto Loan",
    amount: "PKR 1,500,000",
    submissionDate: "2024-06-05",
    returnDate: "2024-06-12",
    returnReason: "Vehicle inspection issues",
    returnedBy: "Fatima Ali",
    status: "returned_to_branch",
    priority: "low",
    issues: [
      { 
        type: "verification_failed", 
        description: "Vehicle inspection revealed discrepancies in vehicle condition", 
        resolution: "Request branch to arrange re-inspection or change vehicle"
      }
    ]
  }
]

// Priority badge component
const PriorityBadge = ({ priority }: { priority: string }) => {
  switch (priority) {
    case "urgent":
      return <Badge className="bg-red-100 text-red-800 border-red-200">Urgent</Badge>
    case "high":
      return <Badge className="bg-orange-100 text-orange-800 border-orange-200">High</Badge>
    case "medium":
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Medium</Badge>
    case "low":
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Low</Badge>
    default:
      return <Badge variant="outline">{priority}</Badge>
  }
}

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case "returned_to_applicant":
      return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Returned to Applicant</Badge>
    case "returned_to_branch":
      return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Returned to Branch</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

// Issue type badge component
const IssueTypeBadge = ({ type }: { type: string }) => {
  switch (type) {
    case "missing_document":
      return <Badge className="bg-red-100 text-red-800 border-red-200">Missing Document</Badge>
    case "expired_document":
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Expired Document</Badge>
    case "discrepancy":
      return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Discrepancy</Badge>
    case "verification_failed":
      return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Verification Failed</Badge>
    case "incomplete_document":
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Incomplete Document</Badge>
    default:
      return <Badge variant="outline">{type}</Badge>
  }
}

export default function SPUReturnedPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterPriority, setFilterPriority] = useState("all")
  const [selectedApplication, setSelectedApplication] = useState<any>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isFollowUpDialogOpen, setIsFollowUpDialogOpen] = useState(false)
  const [followUpMessage, setFollowUpMessage] = useState("")
  
  // Filter applications
  const filteredApplications = returnedApplications.filter(app => {
    const matchesSearch = 
      app.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      app.applicant.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === "all" || app.status === filterStatus
    const matchesPriority = filterPriority === "all" || app.priority === filterPriority
    
    return matchesSearch && matchesStatus && matchesPriority
  })
  
  const handleViewDetails = (app: any) => {
    setSelectedApplication(app)
    setIsDetailsDialogOpen(true)
  }
  
  const handleFollowUp = (app: any) => {
    setSelectedApplication(app)
    setFollowUpMessage(`Dear ${app.applicant},\n\nThis is a follow-up regarding your loan application (${app.id}) that was returned on ${app.returnDate} due to the following reason:\n\n${app.returnReason}\n\nPlease address the issues and resubmit the required documents at your earliest convenience to continue with the loan process.\n\nThank you,\nUBL Loan Processing Department`)
    setIsFollowUpDialogOpen(true)
  }
  
  const handleSendFollowUp = () => {
    // In a real application, this would send the follow-up message
    // For now, we'll just close the dialog
    setIsFollowUpDialogOpen(false)
    
    // Update the UI to show follow-up was sent
    // This would be replaced with actual API call in production
    alert(`Follow-up sent to ${selectedApplication.applicant}`)
  }
  
  // Calculate statistics
  const totalReturnedToApplicant = returnedApplications.filter(app => app.status === "returned_to_applicant").length
  const totalReturnedToBranch = returnedApplications.filter(app => app.status === "returned_to_branch").length
  const totalIssues = returnedApplications.reduce((total, app) => total + app.issues.length, 0)
  
  // Get unique loan types
  const uniqueLoanTypes = Array.from(new Set(returnedApplications.map(app => app.loanType)))

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Returned Applications</h1>
          <p className="text-muted-foreground">Applications that have been returned due to issues or discrepancies</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <Button>
            <Mail className="mr-2 h-4 w-4" />
            Batch Follow-up
          </Button>
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Returned to Applicant</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{totalReturnedToApplicant}</div>
            <p className="text-xs text-muted-foreground">Awaiting applicant response</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Returned to Branch</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{totalReturnedToBranch}</div>
            <p className="text-xs text-muted-foreground">Awaiting branch action</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalIssues}</div>
            <p className="text-xs text-muted-foreground">Across all returned applications</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by ID or applicant name"
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full md:w-[200px]">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <SelectValue placeholder="Filter by status" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="returned_to_applicant">Returned to Applicant</SelectItem>
            <SelectItem value="returned_to_branch">Returned to Branch</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-full md:w-[180px]">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <SelectValue placeholder="Filter by priority" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Returned Applications</CardTitle>
          <CardDescription>Applications returned due to issues or discrepancies</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>LOS ID</TableHead>
                <TableHead>Applicant</TableHead>
                <TableHead>Loan Type</TableHead>
                <TableHead>Return Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Issues</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No applications found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                filteredApplications.map((app) => (
                  <TableRow key={app.id} className={app.priority === "urgent" ? "bg-red-50" : ""}>
                    <TableCell className="font-mono">{app.id}</TableCell>
                    <TableCell>{app.applicant}</TableCell>
                    <TableCell>{app.loanType}</TableCell>
                    <TableCell className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {app.returnDate}
                    </TableCell>
                    <TableCell><StatusBadge status={app.status} /></TableCell>
                    <TableCell><PriorityBadge priority={app.priority} /></TableCell>
                    <TableCell>{app.issues.length}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(app)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Details
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleFollowUp(app)}>
                          <Mail className="mr-2 h-4 w-4" />
                          Follow-up
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {filteredApplications.length} of {returnedApplications.length} returned applications
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
              1
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      {/* Application Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Returned Application Details</DialogTitle>
            <DialogDescription>
              {selectedApplication && (
                <>Application {selectedApplication.id} - {selectedApplication.applicant}</>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Loan Details</h3>
                  <p className="font-medium mt-1">{selectedApplication.loanType}</p>
                  <p>{selectedApplication.amount}</p>
                  <p className="text-sm text-muted-foreground mt-1">Submitted: {selectedApplication.submissionDate}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Return Information</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={selectedApplication.status} />
                  </div>
                  <p className="text-sm mt-1">
                    Returned on {selectedApplication.returnDate}
                  </p>
                  <p className="text-sm mt-1">
                    By {selectedApplication.returnedBy}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Priority</h3>
                  <div className="mt-1">
                    <PriorityBadge priority={selectedApplication.priority} />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Return Reason</h3>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-2">
                      <ThumbsDown className="h-5 w-5 text-red-500 mt-0.5" />
                      <p>{selectedApplication.returnReason}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Issues and Resolutions</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Issue Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Recommended Resolution</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedApplication.issues.map((issue, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <IssueTypeBadge type={issue.type} />
                        </TableCell>
                        <TableCell>{issue.description}</TableCell>
                        <TableCell>{issue.resolution}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
                  Close
                </Button>
                <Button variant="outline" onClick={() => {
                  setIsDetailsDialogOpen(false)
                  handleFollowUp(selectedApplication)
                }}>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Follow-up
                </Button>
                <Button>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reprocess Application
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Follow-up Dialog */}
      <Dialog open={isFollowUpDialogOpen} onOpenChange={setIsFollowUpDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Follow-up</DialogTitle>
            <DialogDescription>
              {selectedApplication && (
                <>Send a follow-up message regarding application {selectedApplication.id}</>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Recipient</h3>
                <div className="flex items-center gap-2 p-2 border rounded-md">
                  <div>
                    <p className="font-medium">{selectedApplication.applicant}</p>
                    <p className="text-sm text-muted-foreground">applicant@example.com</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Follow-up Message</h3>
                <Textarea 
                  value={followUpMessage} 
                  onChange={(e) => setFollowUpMessage(e.target.value)}
                  rows={10}
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsFollowUpDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSendFollowUp}>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Follow-up
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
