// /dashboard/spu/missing-documents/page.tsx
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
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { FileText, Search, Filter, Mail, Phone, AlertTriangle, Clock, Calendar, RefreshCw, CheckCircle, X, Send } from "lucide-react"

// Mock data for missing documents
const missingDocumentsData = [
  {
    id: "UBL-2024-001245",
    applicant: "Ahmed Khan",
    contactEmail: "ahmed.khan@example.com",
    contactPhone: "+92 300 1234567",
    loanType: "Auto Loan",
    amount: "PKR 1,500,000",
    submissionDate: "2024-06-15",
    assignedTo: "Fatima Ali",
    priority: "high",
    status: "pending",
    lastReminder: "2024-06-18",
    documents: [
      { 
        name: "Income Certificate", 
        status: "missing", 
        required: true, 
        description: "Last 3 months income certificate from employer",
        reminderSent: true,
        dueDate: "2024-06-25"
      },
      { 
        name: "Bank Statement", 
        status: "missing", 
        required: true, 
        description: "Last 6 months bank statement from primary account",
        reminderSent: true,
        dueDate: "2024-06-25"
      },
    ]
  },
  {
    id: "UBL-2024-001246",
    applicant: "Sana Malik",
    contactEmail: "sana.malik@example.com",
    contactPhone: "+92 321 9876543",
    loanType: "Home Loan",
    amount: "PKR 5,000,000",
    submissionDate: "2024-06-12",
    assignedTo: "Imran Shah",
    priority: "medium",
    status: "pending",
    lastReminder: "2024-06-17",
    documents: [
      { 
        name: "Property Documents", 
        status: "missing", 
        required: true, 
        description: "Original property documents with legal verification",
        reminderSent: true,
        dueDate: "2024-06-22"
      },
      { 
        name: "Tax Returns", 
        status: "missing", 
        required: true, 
        description: "Last 2 years tax returns",
        reminderSent: true,
        dueDate: "2024-06-22"
      },
      { 
        name: "Salary Certificate", 
        status: "missing", 
        required: true, 
        description: "Salary certificate from employer",
        reminderSent: false,
        dueDate: "2024-06-22"
      }
    ]
  },
  {
    id: "UBL-2024-001247",
    applicant: "Ali Hassan",
    contactEmail: "ali.hassan@example.com",
    contactPhone: "+92 333 5556666",
    loanType: "Personal Loan",
    amount: "PKR 800,000",
    submissionDate: "2024-06-10",
    assignedTo: "Fatima Ali",
    priority: "urgent",
    status: "escalated",
    lastReminder: "2024-06-19",
    documents: [
      { 
        name: "CNIC Copy", 
        status: "missing", 
        required: true, 
        description: "Valid CNIC copy (front and back)",
        reminderSent: true,
        dueDate: "2024-06-20"
      },
      { 
        name: "Employment Letter", 
        status: "missing", 
        required: true, 
        description: "Employment verification letter from current employer",
        reminderSent: true,
        dueDate: "2024-06-20"
      }
    ]
  },
  {
    id: "UBL-2024-001248",
    applicant: "Fatima Ahmed",
    contactEmail: "fatima.ahmed@example.com",
    contactPhone: "+92 345 1112222",
    loanType: "Business Loan",
    amount: "PKR 3,000,000",
    submissionDate: "2024-06-08",
    assignedTo: "Imran Shah",
    priority: "low",
    status: "pending",
    lastReminder: "2024-06-15",
    documents: [
      { 
        name: "Business Registration", 
        status: "missing", 
        required: true, 
        description: "Business registration certificate",
        reminderSent: true,
        dueDate: "2024-06-22"
      },
      { 
        name: "Financial Statements", 
        status: "missing", 
        required: true, 
        description: "Last 2 years audited financial statements",
        reminderSent: true,
        dueDate: "2024-06-22"
      },
      { 
        name: "Business Plan", 
        status: "missing", 
        required: false, 
        description: "Detailed business plan (optional but recommended)",
        reminderSent: false,
        dueDate: "2024-06-22"
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
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
    case "escalated":
      return <Badge className="bg-red-100 text-red-800 border-red-200">Escalated</Badge>
    case "resolved":
      return <Badge className="bg-green-100 text-green-800 border-green-200">Resolved</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function SPUMissingDocumentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterPriority, setFilterPriority] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedApplication, setSelectedApplication] = useState<any>(null)
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false)
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])
  const [reminderMessage, setReminderMessage] = useState("")
  
  // Filter applications based on search term, priority, and status
  const filteredApplications = missingDocumentsData.filter(app => {
    const matchesSearch = 
      app.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      app.applicant.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesPriority = filterPriority === "all" || app.priority === filterPriority
    const matchesStatus = filterStatus === "all" || app.status === filterStatus
    
    return matchesSearch && matchesPriority && matchesStatus
  })
  
  const handleViewDetails = (app: any) => {
    setSelectedApplication(app)
  }
  
  const handleSendReminder = (app: any) => {
    setSelectedApplication(app)
    setReminderMessage(`Dear ${app.applicant},\n\nThis is a reminder that we still require the following documents for your loan application (${app.id}):\n\n- Document list will be inserted based on your selection\n\nPlease submit these documents by their due dates to avoid delays in processing your application.\n\nThank you,\nUBL Loan Processing Department`)
    setSelectedDocuments([])
    setIsReminderDialogOpen(true)
  }
  
  const toggleDocumentSelection = (docName: string) => {
    setSelectedDocuments(prev => 
      prev.includes(docName) 
        ? prev.filter(d => d !== docName) 
        : [...prev, docName]
    )
  }
  
  const handleSendReminderConfirm = () => {
    // In a real application, this would send the reminder
    // For now, we'll just close the dialog
    setIsReminderDialogOpen(false)
    
    // Update the UI to show reminder was sent
    // This would be replaced with actual API call in production
    alert(`Reminder sent to ${selectedApplication.applicant} for ${selectedDocuments.length} documents`)
  }
  
  // Calculate total missing documents across all applications
  const totalMissingDocuments = missingDocumentsData.reduce(
    (total, app) => total + app.documents.length, 0
  )
  
  // Calculate documents by priority
  const urgentDocuments = missingDocumentsData
    .filter(app => app.priority === "urgent")
    .reduce((total, app) => total + app.documents.length, 0)
  
  const highPriorityDocuments = missingDocumentsData
    .filter(app => app.priority === "high")
    .reduce((total, app) => total + app.documents.length, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Missing Documents</h1>
          <p className="text-muted-foreground">Track and request missing documents from loan applicants</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <Button>
            <Mail className="mr-2 h-4 w-4" />
            Batch Reminders
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
            <CardTitle className="text-sm font-medium">Total Missing Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMissingDocuments}</div>
            <p className="text-xs text-muted-foreground">Across {missingDocumentsData.length} applications</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Urgent Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{urgentDocuments}</div>
            <p className="text-xs text-muted-foreground">Requiring immediate attention</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">High Priority Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{highPriorityDocuments}</div>
            <p className="text-xs text-muted-foreground">Due within the next 48 hours</p>
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
        
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full md:w-[180px]">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <SelectValue placeholder="Filter by status" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="escalated">Escalated</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Missing Document Requests</CardTitle>
          <CardDescription>
            Applications with pending document submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>LOS ID</TableHead>
                <TableHead>Applicant</TableHead>
                <TableHead>Loan Type</TableHead>
                <TableHead>Missing Docs</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Reminder</TableHead>
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
                    <TableCell>{app.documents.length}</TableCell>
                    <TableCell><PriorityBadge priority={app.priority} /></TableCell>
                    <TableCell><StatusBadge status={app.status} /></TableCell>
                    <TableCell className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      {app.lastReminder}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(app)}>
                          Details
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleSendReminder(app)}>
                          <Mail className="mr-2 h-4 w-4" />
                          Remind
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Application Details */}
      {selectedApplication && (
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <CardTitle>Application Details</CardTitle>
                <CardDescription>{selectedApplication.applicant} - {selectedApplication.id}</CardDescription>
              </div>
              <div className="flex items-center gap-2 mt-2 md:mt-0">
                <PriorityBadge priority={selectedApplication.priority} />
                <StatusBadge status={selectedApplication.status} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Contact Information</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{selectedApplication.contactEmail}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{selectedApplication.contactPhone}</span>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Loan Details</h3>
                <p className="mt-1">{selectedApplication.loanType} - {selectedApplication.amount}</p>
                <p className="text-sm text-muted-foreground mt-1">Submitted on {selectedApplication.submissionDate}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Processing</h3>
                <p className="mt-1">Assigned to: {selectedApplication.assignedTo}</p>
                <p className="text-sm text-muted-foreground mt-1">Last reminder: {selectedApplication.lastReminder}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Missing Documents</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Required</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Reminder Sent</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedApplication.documents.map((doc, i) => (
                    <TableRow key={i}>
                      <TableCell className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        {doc.name}
                      </TableCell>
                      <TableCell>{doc.description}</TableCell>
                      <TableCell>{doc.required ? "Yes" : "No"}</TableCell>
                      <TableCell className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {doc.dueDate}
                      </TableCell>
                      <TableCell>
                        {doc.reminderSent ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-gray-400" />
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">
                          <Mail className="mr-2 h-4 w-4" />
                          Send Reminder
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setSelectedApplication(null)}>
              Close Details
            </Button>
            <div className="flex gap-2">
              <Button variant="outline">
                <Phone className="mr-2 h-4 w-4" />
                Call Applicant
              </Button>
              <Button onClick={() => handleSendReminder(selectedApplication)}>
                <Mail className="mr-2 h-4 w-4" />
                Send Batch Reminder
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
      
      {/* Reminder Dialog */}
      <Dialog open={isReminderDialogOpen} onOpenChange={setIsReminderDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Document Reminder</DialogTitle>
            <DialogDescription>
              {selectedApplication && (
                <>Send a reminder to {selectedApplication.applicant} ({selectedApplication.contactEmail})</>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Select Documents to Request</h3>
                <div className="border rounded-md p-4 space-y-2">
                  {selectedApplication.documents.map((doc, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`doc-${i}`} 
                        checked={selectedDocuments.includes(doc.name)}
                        onCheckedChange={() => toggleDocumentSelection(doc.name)}
                      />
                      <label
                        htmlFor={`doc-${i}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {doc.name} {doc.required && <span className="text-red-500">*</span>}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Reminder Message</h3>
                <Textarea 
                  value={reminderMessage} 
                  onChange={(e) => setReminderMessage(e.target.value)}
                  rows={8}
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsReminderDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSendReminderConfirm}
                  disabled={selectedDocuments.length === 0}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Send Reminder
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
