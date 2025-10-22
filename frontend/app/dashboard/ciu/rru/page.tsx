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
import { Search, Filter, Clock, CheckCircle, AlertTriangle, FileText, Eye, MoreHorizontal, ArrowRight, ArrowLeft, Pause, RotateCcw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Mock data for CIU-RRU dashboard
const applicationsData = [
  {
    id: "UBL-2024-001234",
    applicantName: "Muhammad Ali Khan",
    segment: "Preferred",
    loanType: "Personal Loan",
    amount: "PKR 2,500,000",
    status: "ciu_rru_review",
    lastUpdate: "2024-01-15",
    assignedTo: "Zainab Ali",
    priority: "High",
    pauseReason: "Incomplete documentation",
    history: [
      { step: "PB", status: "completed", date: "2024-01-10" },
      { step: "SPU", status: "completed", date: "2024-01-12" },
      { step: "COPS", status: "completed", date: "2024-01-14" },
      { step: "EAMVU", status: "completed", date: "2024-01-15" },
      { step: "CIU-RRU", status: "in_progress", date: "2024-01-15" },
    ]
  },
  {
    id: "UBL-2024-001235",
    applicantName: "Fatima Ahmed",
    segment: "Mass",
    loanType: "Auto Loan",
    amount: "PKR 800,000",
    status: "ciu_rru_review",
    lastUpdate: "2024-01-14",
    assignedTo: "Omar Khan",
    priority: "Medium",
    pauseReason: "Pending additional income proof",
    history: [
      { step: "PB", status: "completed", date: "2024-01-08" },
      { step: "SPU", status: "completed", date: "2024-01-10" },
      { step: "COPS", status: "completed", date: "2024-01-12" },
      { step: "EAMVU", status: "completed", date: "2024-01-14" },
      { step: "CIU-RRU", status: "in_progress", date: "2024-01-14" },
    ]
  },
  {
    id: "UBL-2024-001236",
    applicantName: "Hassan Raza",
    segment: "SME",
    loanType: "Business Loan",
    amount: "PKR 5,000,000",
    status: "ciu_rru_review",
    lastUpdate: "2024-01-13",
    assignedTo: "Unassigned",
    priority: "High",
    pauseReason: "Business verification pending",
    history: [
      { step: "PB", status: "completed", date: "2024-01-05" },
      { step: "SPU", status: "completed", date: "2024-01-08" },
      { step: "COPS", status: "completed", date: "2024-01-10" },
      { step: "EAMVU", status: "completed", date: "2024-01-13" },
      { step: "CIU-RRU", status: "in_progress", date: "2024-01-13" },
    ]
  },
]

// Stats for dashboard
const statsData = [
  {
    title: "Paused Applications",
    value: "12",
    change: "Pending review",
    icon: Pause,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  {
    title: "Resumed Today",
    value: "5",
    change: "Sent to AFD",
    icon: RotateCcw,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    title: "Returned to PB",
    value: "3",
    change: "For corrections",
    icon: ArrowLeft,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  {
    title: "Total Reviewed",
    value: "28",
    change: "This month",
    icon: CheckCircle,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
]

function getStatusBadge(status: string) {
  const statusConfig: Record<string, { variant: "default" | "destructive" | "outline" | "secondary", label: string }> = {
    "ciu_rru_review": { variant: "secondary", label: "Under Review" },
    "ciu_rru_resumed": { variant: "default", label: "Resumed" },
    "ciu_rru_returned": { variant: "destructive", label: "Returned" },
  }

  const config = statusConfig[status] || { variant: "outline", label: status }

  return <Badge variant={config.variant}>{config.label}</Badge>
}

function getPriorityBadge(priority: string) {
  const priorityConfig: Record<string, { color: string }> = {
    "High": { color: "bg-red-100 text-red-800" },
    "Medium": { color: "bg-yellow-100 text-yellow-800" },
    "Low": { color: "bg-green-100 text-green-800" },
  }

  const config = priorityConfig[priority] || { color: "bg-gray-100 text-gray-800" }

  return <Badge className={config.color}>{priority}</Badge>
}

export default function CIURRUDashboardPage() {
  const [activeTab, setActiveTab] = useState("review")
  const [selectedApplication, setSelectedApplication] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [reviewDecision, setReviewDecision] = useState("")
  const { toast } = useToast()

  const filteredApplications = applicationsData.filter((app) => {
    const matchesSearch = app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          app.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || app.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleResumeApplication = () => {
    // Update application status logic would go here
    toast({
      title: "Application Resumed",
      description: "Application has been resumed and sent to AFD",
    })
    setSelectedApplication(null)
    setReviewDecision("")
  }

  const handleReturnApplication = () => {
    // Update application status logic would go here
    toast({
      title: "Application Returned",
      description: "Application has been returned to PB for corrections",
    })
    setSelectedApplication(null)
    setReviewDecision("")
  }

  const handleRejectApplication = () => {
    // Update application status logic would go here
    toast({
      title: "Application Rejected",
      description: "Application has been rejected",
    })
    setSelectedApplication(null)
    setReviewDecision("")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">CIU - Resume Review Unit</h2>
          <p className="text-muted-foreground">Review paused or returned applications</p>
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

      <Tabs defaultValue="review" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="review">Under Review</TabsTrigger>
          <TabsTrigger value="resumed">Resumed</TabsTrigger>
          <TabsTrigger value="returned">Returned</TabsTrigger>
        </TabsList>
        <TabsContent value="review" className="space-y-4">
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
                      placeholder="Search by name or LOS ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
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
              <CardTitle>Paused Applications ({filteredApplications.length})</CardTitle>
              <CardDescription>Applications requiring review and decision</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>LOS ID</TableHead>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Loan Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Pause Reason</TableHead>
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
                      <TableCell>{getPriorityBadge(app.priority)}</TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate" title={app.pauseReason}>
                          {app.pauseReason}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button onClick={() => setSelectedApplication(app)}>
                              Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>Application Review - {selectedApplication?.id}</DialogTitle>
                              <DialogDescription>
                                Review application and decide whether to resume, return, or reject
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
                                        <Label className="text-sm font-medium">Loan Type</Label>
                                        <p className="text-sm">{selectedApplication.loanType}</p>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium">Amount</Label>
                                        <p className="text-sm">{selectedApplication.amount}</p>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium">Priority</Label>
                                        <p className="text-sm">{selectedApplication.priority}</p>
                                      </div>
                                      <div className="col-span-2">
                                        <Label className="text-sm font-medium">Pause Reason</Label>
                                        <p className="text-sm">{selectedApplication.pauseReason}</p>
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
                                    <CardTitle className="text-lg">Review Decision</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="space-y-4">
                                      <RadioGroup value={reviewDecision} onValueChange={setReviewDecision}>
                                        <div className="flex items-center space-x-2 rounded-md border p-3">
                                          <RadioGroupItem value="resume" id="resume" />
                                          <Label htmlFor="resume" className="flex-1">
                                            <div className="font-medium">Resume Application</div>
                                            <div className="text-sm text-muted-foreground">
                                              Send to AFD for fraud detection checks
                                            </div>
                                          </Label>
                                        </div>
                                        <div className="flex items-center space-x-2 rounded-md border p-3">
                                          <RadioGroupItem value="return" id="return" />
                                          <Label htmlFor="return" className="flex-1">
                                            <div className="font-medium">Return to PB</div>
                                            <div className="text-sm text-muted-foreground">
                                              Return to Personal Banking for corrections
                                            </div>
                                          </Label>
                                        </div>
                                        <div className="flex items-center space-x-2 rounded-md border p-3">
                                          <RadioGroupItem value="reject" id="reject" />
                                          <Label htmlFor="reject" className="flex-1">
                                            <div className="font-medium">Reject Application</div>
                                            <div className="text-sm text-muted-foreground">
                                              Permanently reject the application
                                            </div>
                                          </Label>
                                        </div>
                                      </RadioGroup>

                                      <div className="space-y-2">
                                        <Label htmlFor="comments">Comments</Label>
                                        <Textarea 
                                          id="comments" 
                                          placeholder="Add any comments or notes about your decision..."
                                        />
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>

                                <DialogFooter>
                                  <Button variant="outline" onClick={() => {
                                    setSelectedApplication(null)
                                    setReviewDecision("")
                                  }}>
                                    Cancel
                                  </Button>
                                  
                                  {reviewDecision === "resume" && (
                                    <Button onClick={handleResumeApplication}>
                                      Resume & Send to AFD
                                    </Button>
                                  )}
                                  
                                  {reviewDecision === "return" && (
                                    <Button variant="secondary" onClick={handleReturnApplication}>
                                      Return to PB
                                    </Button>
                                  )}
                                  
                                  {reviewDecision === "reject" && (
                                    <Button variant="destructive" onClick={handleRejectApplication}>
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

        <TabsContent value="resumed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resumed Applications</CardTitle>
              <CardDescription>Applications that have been resumed and sent to AFD</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Resumed applications will appear here...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="returned" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Returned Applications</CardTitle>
              <CardDescription>Applications that have been returned to PB for corrections</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Returned applications will appear here...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 