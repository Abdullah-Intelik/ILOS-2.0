// /dashboard/spu/new/page.tsx
"use client"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Search,
  Filter,
  Eye,
  User,
  Users,
  Calendar,
  Download,
  Upload,
  RefreshCw,
  Settings,
  AlertCircle,
  Flag,
  Paperclip,
  Star,
  ArrowRight,
  Plus
} from "lucide-react"

// Mock data for new applications
const newApplicationsData = [
  {
    id: "UBL-2024-001239",
    applicantName: "Sara Khan",
    loanType: "Personal Loan",
    amount: "PKR 2,000,000",
    status: "submitted_to_spu",
    lastUpdate: "2024-01-17 14:30:25",
    submittedDate: "2024-01-15 09:15:30",
    assignedTo: "Unassigned",
    priority: "medium",
    branch: "Karachi Main",
    loanOfficer: "Ahmed Ali",
    creditScore: 720,
    riskLevel: "medium",
    completionPercentage: 85,
    estimatedProcessingTime: "2-3 days",
    documents: [
      { id: "doc1", name: "CNIC Copy", status: "submitted", verified: false, required: true },
      { id: "doc2", name: "Salary Slip", status: "submitted", verified: false, required: true },
      { id: "doc3", name: "Bank Statement", status: "submitted", verified: false, required: true },
      { id: "doc4", name: "Employment Letter", status: "missing", verified: false, required: true },
    ],
    flags: ["High amount loan", "First time customer"],
    applicantType: "salaried",
    age: 32,
    monthlyIncome: "PKR 150,000",
  },
  {
    id: "UBL-2024-001240",
    applicantName: "Ali Ahmed",
    loanType: "Auto Loan",
    amount: "PKR 1,500,000",
    status: "submitted_to_spu",
    lastUpdate: "2024-01-18 10:45:15",
    submittedDate: "2024-01-16 16:20:10",
    assignedTo: "Unassigned",
    priority: "high",
    branch: "Lahore Main",
    loanOfficer: "Sara Ahmed",
    creditScore: 680,
    riskLevel: "medium",
    completionPercentage: 95,
    estimatedProcessingTime: "1-2 days",
    documents: [
      { id: "doc5", name: "CNIC Copy", status: "submitted", verified: false, required: true },
      { id: "doc6", name: "Salary Slip", status: "submitted", verified: false, required: true },
      { id: "doc7", name: "Bank Statement", status: "submitted", verified: false, required: true },
      { id: "doc8", name: "Vehicle Registration", status: "submitted", verified: false, required: true },
    ],
    flags: ["Existing customer"],
    applicantType: "salaried",
    age: 28,
    monthlyIncome: "PKR 120,000",
  },
  {
    id: "UBL-2024-001241",
    applicantName: "Fatima Sheikh",
    loanType: "Business Loan",
    amount: "PKR 5,000,000",
    status: "submitted_to_spu",
    lastUpdate: "2024-01-19 08:30:45",
    submittedDate: "2024-01-17 11:45:20",
    assignedTo: "Unassigned",
    priority: "urgent",
    branch: "Islamabad",
    loanOfficer: "Bilal Khan",
    creditScore: 750,
    riskLevel: "high",
    completionPercentage: 70,
    estimatedProcessingTime: "3-5 days",
    documents: [
      { id: "doc9", name: "CNIC Copy", status: "submitted", verified: false, required: true },
      { id: "doc10", name: "Business Registration", status: "submitted", verified: false, required: true },
      { id: "doc11", name: "Tax Returns", status: "submitted", verified: false, required: true },
      { id: "doc12", name: "Financial Statements", status: "missing", verified: false, required: true },
      { id: "doc13", name: "Bank Statement", status: "missing", verified: false, required: true },
    ],
    flags: ["High amount loan", "Business loan", "Multiple missing documents"],
    applicantType: "business",
    age: 45,
    monthlyIncome: "PKR 400,000",
  },
  {
    id: "UBL-2024-001242",
    applicantName: "Hassan Malik",
    loanType: "Home Loan",
    amount: "PKR 8,000,000",
    status: "submitted_to_spu",
    lastUpdate: "2024-01-19 15:20:30",
    submittedDate: "2024-01-18 13:10:15",
    assignedTo: "Unassigned",
    priority: "high",
    branch: "Karachi North",
    loanOfficer: "Zainab Ali",
    creditScore: 800,
    riskLevel: "low",
    completionPercentage: 90,
    estimatedProcessingTime: "2-4 days",
    documents: [
      { id: "doc14", name: "CNIC Copy", status: "submitted", verified: false, required: true },
      { id: "doc15", name: "Salary Slip", status: "submitted", verified: false, required: true },
      { id: "doc16", name: "Property Documents", status: "submitted", verified: false, required: true },
      { id: "doc17", name: "Property Valuation", status: "submitted", verified: false, required: true },
      { id: "doc18", name: "Bank Statement", status: "submitted", verified: false, required: true },
    ],
    flags: ["High amount loan", "Premium customer"],
    applicantType: "salaried",
    age: 38,
    monthlyIncome: "PKR 300,000",
  },
]

// SPU Officers for assignment
const spuOfficers = [
  { id: "spu1", name: "Muhammad Tariq", workload: 12, specialization: "Personal Loans" },
  { id: "spu2", name: "Ayesha Khan", workload: 8, specialization: "Auto Loans" },
  { id: "spu3", name: "Omar Farooq", workload: 15, specialization: "Business Loans" },
  { id: "spu4", name: "Sana Ahmed", workload: 10, specialization: "Home Loans" },
]

// Statistics
const spuStats = {
  totalNewApplications: 24,
  pendingAssignment: 18,
  assignedToday: 6,
  avgProcessingTime: "2.5 days",
  documentCompletionRate: 82.5,
  priorityBreakdown: {
    urgent: 3,
    high: 8,
    medium: 10,
    low: 3,
  },
}

function getStatusBadge(status: string) {
  switch (status) {
    case "submitted_to_spu":
      return <Badge className="bg-blue-100 text-blue-800">New Application</Badge>
    case "assigned":
      return <Badge className="bg-yellow-100 text-yellow-800">Assigned</Badge>
    case "in_review":
      return <Badge className="bg-orange-100 text-orange-800">In Review</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

function getPriorityBadge(priority: string) {
  switch (priority) {
    case "urgent":
      return <Badge className="bg-red-100 text-red-800">Urgent</Badge>
    case "high":
      return <Badge className="bg-orange-100 text-orange-800">High</Badge>
    case "medium":
      return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
    case "low":
      return <Badge className="bg-green-100 text-green-800">Low</Badge>
    default:
      return <Badge variant="secondary">{priority}</Badge>
  }
}

function getRiskLevelBadge(risk: string) {
  switch (risk) {
    case "low":
      return <Badge className="bg-green-100 text-green-800">Low Risk</Badge>
    case "medium":
      return <Badge className="bg-yellow-100 text-yellow-800">Medium Risk</Badge>
    case "high":
      return <Badge className="bg-red-100 text-red-800">High Risk</Badge>
    default:
      return <Badge variant="secondary">{risk}</Badge>
  }
}

function getDocumentStatusBadge(status: string) {
  switch (status) {
    case "submitted":
      return <Badge className="bg-blue-100 text-blue-800">Submitted</Badge>
    case "missing":
      return <Badge className="bg-red-100 text-red-800">Missing</Badge>
    case "verified":
      return <Badge className="bg-green-100 text-green-800">Verified</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export default function SPUNewApplicationsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [loanTypeFilter, setLoanTypeFilter] = useState("all")
  const [selectedApplications, setSelectedApplications] = useState<string[]>([])
  const [selectedApplication, setSelectedApplication] = useState<any>(null)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [selectedOfficer, setSelectedOfficer] = useState("")
  const { toast } = useToast()

  const filteredApplications = newApplicationsData.filter((app) => {
    const matchesSearch = 
      app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.loanOfficer.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesPriority = priorityFilter === "all" || app.priority === priorityFilter
    const matchesLoanType = loanTypeFilter === "all" || app.loanType === loanTypeFilter
    
    return matchesSearch && matchesPriority && matchesLoanType
  })

  const handleAssignApplication = (appId: string, officerId: string) => {
    const officer = spuOfficers.find(o => o.id === officerId)
    toast({
      title: "Application Assigned",
      description: `Application ${appId} assigned to ${officer?.name}`,
    })
    setIsAssignDialogOpen(false)
    setSelectedOfficer("")
  }

  const handleBatchAssign = () => {
    if (selectedApplications.length === 0) {
      toast({
        title: "No Applications Selected",
        description: "Please select applications to assign",
        variant: "destructive",
      })
      return
    }
    
    toast({
      title: "Batch Assignment",
      description: `${selectedApplications.length} applications assigned automatically`,
    })
    setSelectedApplications([])
  }

  const handlePriorityChange = (appId: string, newPriority: string) => {
    toast({
      title: "Priority Updated",
      description: `Application ${appId} priority changed to ${newPriority}`,
    })
  }

  const toggleApplicationSelection = (appId: string) => {
    setSelectedApplications(prev => 
      prev.includes(appId) 
        ? prev.filter(id => id !== appId)
        : [...prev, appId]
    )
  }

  const selectAllApplications = () => {
    if (selectedApplications.length === filteredApplications.length) {
      setSelectedApplications([])
    } else {
      setSelectedApplications(filteredApplications.map(app => app.id))
    }
  }

  const getMissingDocumentsCount = (documents: any[]) => {
    return documents.filter(doc => doc.status === "missing" && doc.required).length
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">New Applications</h2>
          <p className="text-muted-foreground">Applications awaiting SPU assignment and review</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={handleBatchAssign} disabled={selectedApplications.length === 0}>
            <Users className="mr-2 h-4 w-4" />
            Auto Assign ({selectedApplications.length})
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total New Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{spuStats.totalNewApplications}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Assignment</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{spuStats.pendingAssignment}</div>
            <p className="text-xs text-muted-foreground">Need assignment</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{spuStats.assignedToday}</div>
            <p className="text-xs text-muted-foreground">Today's assignments</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{spuStats.avgProcessingTime}</div>
            <p className="text-xs text-muted-foreground">Average duration</p>
          </CardContent>
        </Card>
      </div>

      {/* Priority Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Priority Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{spuStats.priorityBreakdown.urgent}</div>
              <div className="text-sm text-muted-foreground">Urgent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{spuStats.priorityBreakdown.high}</div>
              <div className="text-sm text-muted-foreground">High</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{spuStats.priorityBreakdown.medium}</div>
              <div className="text-sm text-muted-foreground">Medium</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{spuStats.priorityBreakdown.low}</div>
              <div className="text-sm text-muted-foreground">Low</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by applicant name, LOS ID, or loan officer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={loanTypeFilter} onValueChange={setLoanTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Loan Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Personal Loan">Personal Loan</SelectItem>
                  <SelectItem value="Auto Loan">Auto Loan</SelectItem>
                  <SelectItem value="Business Loan">Business Loan</SelectItem>
                  <SelectItem value="Home Loan">Home Loan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>New Applications Queue</CardTitle>
          <CardDescription>Applications submitted and awaiting SPU processing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedApplications.length === filteredApplications.length}
                      onChange={selectAllApplications}
                      className="rounded border-gray-300"
                    />
                  </TableHead>
                  <TableHead>LOS ID</TableHead>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Loan Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedApplications.includes(app.id)}
                        onChange={() => toggleApplicationSelection(app.id)}
                        className="rounded border-gray-300"
                      />
                    </TableCell>
                    <TableCell className="font-mono text-sm">{app.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{app.applicantName}</div>
                        <div className="text-sm text-muted-foreground">{app.loanOfficer}</div>
                      </div>
                    </TableCell>
                    <TableCell>{app.loanType}</TableCell>
                    <TableCell className="font-medium">{app.amount}</TableCell>
                    <TableCell>{getPriorityBadge(app.priority)}</TableCell>
                    <TableCell>{getRiskLevelBadge(app.riskLevel)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{app.documents.length}</span>
                        {getMissingDocumentsCount(app.documents) > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {getMissingDocumentsCount(app.documents)} missing
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(app.submittedDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedApplication(app)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>Application Details - {selectedApplication?.id}</DialogTitle>
                              <DialogDescription>
                                Comprehensive application information for SPU review
                              </DialogDescription>
                            </DialogHeader>
                            {selectedApplication && (
                              <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium">Applicant Information</Label>
                                    <div className="space-y-2 mt-2">
                                      <p><strong>Name:</strong> {selectedApplication.applicantName}</p>
                                      <p><strong>Age:</strong> {selectedApplication.age} years</p>
                                      <p><strong>Type:</strong> {selectedApplication.applicantType}</p>
                                      <p><strong>Monthly Income:</strong> {selectedApplication.monthlyIncome}</p>
                                      <p><strong>Credit Score:</strong> {selectedApplication.creditScore}</p>
                                    </div>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Loan Details</Label>
                                    <div className="space-y-2 mt-2">
                                      <p><strong>Type:</strong> {selectedApplication.loanType}</p>
                                      <p><strong>Amount:</strong> {selectedApplication.amount}</p>
                                      <p><strong>Risk Level:</strong> {getRiskLevelBadge(selectedApplication.riskLevel)}</p>
                                      <p><strong>Priority:</strong> {getPriorityBadge(selectedApplication.priority)}</p>
                                      <p><strong>Processing Time:</strong> {selectedApplication.estimatedProcessingTime}</p>
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <Label className="text-sm font-medium">Documents Status</Label>
                                  <div className="mt-2 space-y-2">
                                    {selectedApplication.documents.map((doc: any) => (
                                      <div key={doc.id} className="flex items-center justify-between p-2 border rounded">
                                        <div className="flex items-center gap-2">
                                          <Paperclip className="h-4 w-4 text-muted-foreground" />
                                          <span className="text-sm">{doc.name}</span>
                                          {doc.required && <span className="text-red-500">*</span>}
                                        </div>
                                        {getDocumentStatusBadge(doc.status)}
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {selectedApplication.flags.length > 0 && (
                                  <div>
                                    <Label className="text-sm font-medium">Application Flags</Label>
                                    <div className="flex gap-2 mt-2">
                                      {selectedApplication.flags.map((flag: string, index: number) => (
                                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                                          <Flag className="h-3 w-3" />
                                          {flag}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <div className="flex gap-2">
                                  <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
                                    <DialogTrigger asChild>
                                      <Button>
                                        <User className="mr-2 h-4 w-4" />
                                        Assign to Officer
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Assign Application</DialogTitle>
                                        <DialogDescription>
                                          Select an SPU officer to assign this application
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <Select value={selectedOfficer} onValueChange={setSelectedOfficer}>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select SPU Officer" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {spuOfficers.map((officer) => (
                                              <SelectItem key={officer.id} value={officer.id}>
                                                {officer.name} - {officer.specialization} (Workload: {officer.workload})
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                        <div className="flex gap-2">
                                          <Button 
                                            onClick={() => handleAssignApplication(selectedApplication.id, selectedOfficer)}
                                            disabled={!selectedOfficer}
                                          >
                                            Assign Application
                                          </Button>
                                          <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                                            Cancel
                                          </Button>
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                  <Button variant="outline">
                                    <Flag className="mr-2 h-4 w-4" />
                                    Flag for Review
                                  </Button>
                                  <Select value={selectedApplication.priority} onValueChange={(value) => handlePriorityChange(selectedApplication.id, value)}>
                                    <SelectTrigger className="w-32">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="urgent">Urgent</SelectItem>
                                      <SelectItem value="high">High</SelectItem>
                                      <SelectItem value="medium">Medium</SelectItem>
                                      <SelectItem value="low">Low</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm">
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Quick Assign</DialogTitle>
                              <DialogDescription>
                                Assign {app.id} to an SPU officer
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Select value={selectedOfficer} onValueChange={setSelectedOfficer}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select SPU Officer" />
                                </SelectTrigger>
                                <SelectContent>
                                  {spuOfficers.map((officer) => (
                                    <SelectItem key={officer.id} value={officer.id}>
                                      {officer.name} - {officer.specialization} (Workload: {officer.workload})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button 
                                onClick={() => handleAssignApplication(app.id, selectedOfficer)}
                                disabled={!selectedOfficer}
                                className="w-full"
                              >
                                Assign Application
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
