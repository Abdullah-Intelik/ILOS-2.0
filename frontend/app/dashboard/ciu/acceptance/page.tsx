"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Search, Filter, Clock, CheckCircle, AlertTriangle, FileText, Eye, MoreHorizontal, Stamp, ThumbsUp, ThumbsDown, AlertOctagon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Mock data for CIU-Acceptance dashboard
const applicationsData = [
  {
    id: "UBL-2024-001234",
    applicantName: "Muhammad Ali Khan",
    segment: "Preferred",
    loanType: "Personal Loan",
    amount: "PKR 2,500,000",
    status: "acceptance_pending",
    lastUpdate: "2024-01-15",
    assignedTo: "Zainab Ali",
    priority: "High",
    cnic: "42101-1234567-8",
    history: [
      { step: "PB", status: "completed", date: "2024-01-10" },
      { step: "SPU", status: "completed", date: "2024-01-12" },
      { step: "COPS", status: "completed", date: "2024-01-14" },
      { step: "EAMVU", status: "completed", date: "2024-01-15" },
      { step: "CIU-RRU", status: "completed", date: "2024-01-16" },
      { step: "CIU-AFD", status: "completed", date: "2024-01-17" },
      { step: "CIU-Acceptance", status: "in_progress", date: "2024-01-17" },
    ],
    riskScore: 72,
  },
  {
    id: "UBL-2024-001235",
    applicantName: "Fatima Ahmed",
    segment: "Mass",
    loanType: "Auto Loan",
    amount: "PKR 800,000",
    status: "acceptance_pending",
    lastUpdate: "2024-01-14",
    assignedTo: "Omar Khan",
    priority: "Medium",
    cnic: "42101-7654321-0",
    history: [
      { step: "PB", status: "completed", date: "2024-01-08" },
      { step: "SPU", status: "completed", date: "2024-01-10" },
      { step: "COPS", status: "completed", date: "2024-01-12" },
      { step: "EAMVU", status: "completed", date: "2024-01-14" },
      { step: "CIU-RRU", status: "completed", date: "2024-01-15" },
      { step: "CIU-AFD", status: "completed", date: "2024-01-16" },
      { step: "CIU-Acceptance", status: "in_progress", date: "2024-01-16" },
    ],
    riskScore: 45,
  },
  {
    id: "UBL-2024-001236",
    applicantName: "Hassan Raza",
    segment: "SME",
    loanType: "Business Loan",
    amount: "PKR 5,000,000",
    status: "acceptance_pending",
    lastUpdate: "2024-01-13",
    assignedTo: "Unassigned",
    priority: "High",
    cnic: "42101-9876543-2",
    history: [
      { step: "PB", status: "completed", date: "2024-01-05" },
      { step: "SPU", status: "completed", date: "2024-01-08" },
      { step: "COPS", status: "completed", date: "2024-01-10" },
      { step: "EAMVU", status: "completed", date: "2024-01-13" },
      { step: "CIU-RRU", status: "completed", date: "2024-01-14" },
      { step: "CIU-AFD", status: "completed", date: "2024-01-15" },
      { step: "CIU-Acceptance", status: "in_progress", date: "2024-01-15" },
    ],
    riskScore: 88,
  },
]

// Stats for dashboard
const statsData = [
  {
    title: "Pending Decisions",
    value: "8",
    change: "Awaiting approval",
    icon: Clock,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    title: "Approved Today",
    value: "5",
    change: "Ready for disbursement",
    icon: ThumbsUp,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    title: "Conditionally Approved",
    value: "3",
    change: "With conditions",
    icon: AlertTriangle,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
  },
  {
    title: "Rejected",
    value: "2",
    change: "Not approved",
    icon: ThumbsDown,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
]

function getStatusBadge(status: string) {
  const statusConfig: Record<string, { variant: "default" | "destructive" | "outline" | "secondary", label: string }> = {
    "acceptance_pending": { variant: "outline", label: "Pending Decision" },
    "acceptance_approved": { variant: "default", label: "Approved" },
    "acceptance_conditional": { variant: "secondary", label: "Conditionally Approved" },
    "acceptance_rejected": { variant: "destructive", label: "Rejected" },
  }

  const config = statusConfig[status] || { variant: "outline", label: status }

  return <Badge variant={config.variant}>{config.label}</Badge>
}

function getRiskBadge(score: number) {
  if (score >= 80) {
    return <Badge className="bg-red-100 text-red-800">High Risk ({score})</Badge>
  } else if (score >= 60) {
    return <Badge className="bg-amber-100 text-amber-800">Medium Risk ({score})</Badge>
  } else {
    return <Badge className="bg-green-100 text-green-800">Low Risk ({score})</Badge>
  }
}

export default function CIUAcceptanceDashboardPage() {
  const [activeTab, setActiveTab] = useState("pending")
  const [selectedApplication, setSelectedApplication] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [decisionType, setDecisionType] = useState("")
  const { toast } = useToast()

  const filteredApplications = applicationsData.filter((app) => {
    const matchesSearch = app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.cnic.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || app.status === statusFilter
    
    if (activeTab === "pending") {
      return matchesSearch && app.status === "acceptance_pending"
    } else if (activeTab === "approved") {
      return matchesSearch && (app.status === "acceptance_approved" || app.status === "acceptance_conditional")
    } else if (activeTab === "rejected") {
      return matchesSearch && app.status === "acceptance_rejected"
    }
    
    return matchesSearch && matchesStatus
  })

  const handleApprove = () => {
    // Update application status logic would go here
    toast({
      title: "Application Approved",
      description: "Application has been approved and sent to PB for disbursement",
    })
    setSelectedApplication(null)
    setDecisionType("")
  }

  const handleConditionalApprove = () => {
    // Update application status logic would go here
    toast({
      title: "Application Conditionally Approved",
      description: "Application has been conditionally approved with specific requirements",
    })
    setSelectedApplication(null)
    setDecisionType("")
  }

  const handleReject = () => {
    // Update application status logic would go here
    toast({
      title: "Application Rejected",
      description: "Application has been rejected",
    })
    setSelectedApplication(null)
    setDecisionType("")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">CIU - Acceptance</h2>
          <p className="text-muted-foreground">Final decision-making for loan applications</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">Pending Decision</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 items-end">
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

                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  More Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Applications Table */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Applications ({filteredApplications.length})</CardTitle>
              <CardDescription>Applications requiring final decision</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>LOS ID</TableHead>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Loan Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Risk Score</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-mono text-sm">{app.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{app.applicantName}</div>
                          <div className="text-sm text-muted-foreground">
                            {app.assignedTo !== "Unassigned" ? `Assigned to: ${app.assignedTo}` : "Unassigned"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{app.loanType}</TableCell>
                      <TableCell className="font-medium">{app.amount}</TableCell>
                      <TableCell>{getRiskBadge(app.riskScore)}</TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button onClick={() => setSelectedApplication(app)}>
                              Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>Final Decision - {selectedApplication?.id}</DialogTitle>
                              <DialogDescription>
                                Make the final decision for this loan application
                              </DialogDescription>
                            </DialogHeader>

                            {selectedApplication && (
                              <div className="space-y-6">
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">Application Information</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="text-sm font-medium">Applicant Name</Label>
                                        <p className="text-sm">{selectedApplication.applicantName}</p>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium">CNIC</Label>
                                        <p className="text-sm">{selectedApplication.cnic}</p>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium">Loan Type</Label>
                                        <p className="text-sm">{selectedApplication.loanType}</p>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium">Amount</Label>
                                        <p className="text-sm">{selectedApplication.amount}</p>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium">Risk Score</Label>
                                        <p className="text-sm">{selectedApplication.riskScore}/100</p>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium">Segment</Label>
                                        <p className="text-sm">{selectedApplication.segment}</p>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>

                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">Application History</CardTitle>
                                    <CardDescription>
                                      Workflow history of this application
                                    </CardDescription>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="space-y-4">
                                      {selectedApplication.history.map((item: any, index: number) => (
                                        <div key={index} className="flex items-start">
                                          <div className={`mt-0.5 h-2 w-2 rounded-full ${
                                            item.status === 'completed' 
                                              ? 'bg-green-500' 
                                              : item.status === 'in_progress'
                                              ? 'bg-blue-500'
                                              : 'bg-gray-300'
                                          }`} />
                                          <div className="ml-3">
                                            <p className="text-sm font-medium">{item.step}</p>
                                            <p className="text-xs text-muted-foreground">
                                              {item.status === 'completed' ? 'Completed' : 'In Progress'} on {item.date}
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </CardContent>
                                </Card>

                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">Final Decision</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="space-y-4">
                                      <RadioGroup value={decisionType} onValueChange={setDecisionType}>
                                        <div className="flex items-center space-x-2 rounded-md border p-3">
                                          <RadioGroupItem value="approve" id="approve" />
                                          <Label htmlFor="approve" className="flex-1">
                                            <div className="font-medium">Approve</div>
                                            <div className="text-sm text-muted-foreground">
                                              Approve the application without conditions
                                            </div>
                                          </Label>
                                        </div>
                                        <div className="flex items-center space-x-2 rounded-md border p-3">
                                          <RadioGroupItem value="conditional" id="conditional" />
                                          <Label htmlFor="conditional" className="flex-1">
                                            <div className="font-medium">Conditionally Approve</div>
                                            <div className="text-sm text-muted-foreground">
                                              Approve with specific conditions
                                            </div>
                                          </Label>
                                        </div>
                                        <div className="flex items-center space-x-2 rounded-md border p-3">
                                          <RadioGroupItem value="reject" id="reject" />
                                          <Label htmlFor="reject" className="flex-1">
                                            <div className="font-medium">Reject</div>
                                            <div className="text-sm text-muted-foreground">
                                              Reject the application
                                            </div>
                                          </Label>
                                        </div>
                                      </RadioGroup>

                                      {decisionType === "conditional" && (
                                        <div className="space-y-2">
                                          <Label htmlFor="conditions">Conditions</Label>
                                          <Textarea 
                                            id="conditions" 
                                            placeholder="Specify the conditions for approval..."
                                          />
                                        </div>
                                      )}

                                      {decisionType === "reject" && (
                                        <div className="space-y-2">
                                          <Label htmlFor="rejection-reason">Rejection Reason</Label>
                                          <Textarea 
                                            id="rejection-reason" 
                                            placeholder="Provide reason for rejection..."
                                          />
                                        </div>
                                      )}

                                      <div className="space-y-2">
                                        <Label htmlFor="comments">Comments</Label>
                                        <Textarea 
                                          id="comments" 
                                          placeholder="Add any additional comments..."
                                        />
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>

                                <DialogFooter>
                                  <Button variant="outline" onClick={() => {
                                    setSelectedApplication(null)
                                    setDecisionType("")
                                  }}>
                                    Cancel
                                  </Button>
                                  
                                  {decisionType === "approve" && (
                                    <Button onClick={handleApprove}>
                                      <Stamp className="mr-2 h-4 w-4" />
                                      Approve Application
                                    </Button>
                                  )}
                                  
                                  {decisionType === "conditional" && (
                                    <Button variant="secondary" onClick={handleConditionalApprove}>
                                      <AlertTriangle className="mr-2 h-4 w-4" />
                                      Conditionally Approve
                                    </Button>
                                  )}
                                  
                                  {decisionType === "reject" && (
                                    <Button variant="destructive" onClick={handleReject}>
                                      <AlertOctagon className="mr-2 h-4 w-4" />
                                      Reject Application
                                    </Button>
                                  )}
                                </DialogFooter>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Approved Applications</CardTitle>
              <CardDescription>Applications that have been approved or conditionally approved</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Approved applications will appear here...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rejected Applications</CardTitle>
              <CardDescription>Applications that have been rejected</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Rejected applications will appear here...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 