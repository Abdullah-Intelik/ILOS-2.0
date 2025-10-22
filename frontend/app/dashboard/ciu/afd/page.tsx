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
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Search, Filter, Clock, CheckCircle, AlertTriangle, FileText, Eye, MoreHorizontal, Shield, AlertOctagon, Fingerprint, Database } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Mock data for CIU-AFD dashboard
const applicationsData = [
  {
    id: "UBL-2024-001234",
    applicantName: "Muhammad Ali Khan",
    segment: "Preferred",
    loanType: "Personal Loan",
    amount: "PKR 2,500,000",
    status: "afd_pending",
    lastUpdate: "2024-01-15",
    assignedTo: "Zainab Ali",
    priority: "High",
    cnic: "42101-1234567-8",
    fraudChecks: [
      { id: "check1", name: "NADRA Verification", status: "pending" },
      { id: "check2", name: "Duplicate Application Check", status: "pending" },
      { id: "check3", name: "Blacklist Check", status: "pending" },
      { id: "check4", name: "Document Forgery Check", status: "pending" },
    ],
    checkProgress: 0,
  },
  {
    id: "UBL-2024-001235",
    applicantName: "Fatima Ahmed",
    segment: "Mass",
    loanType: "Auto Loan",
    amount: "PKR 800,000",
    status: "afd_in_progress",
    lastUpdate: "2024-01-14",
    assignedTo: "Omar Khan",
    priority: "Medium",
    cnic: "42101-7654321-0",
    fraudChecks: [
      { id: "check5", name: "NADRA Verification", status: "completed" },
      { id: "check6", name: "Duplicate Application Check", status: "completed" },
      { id: "check7", name: "Blacklist Check", status: "in_progress" },
      { id: "check8", name: "Document Forgery Check", status: "pending" },
    ],
    checkProgress: 50,
  },
  {
    id: "UBL-2024-001236",
    applicantName: "Hassan Raza",
    segment: "SME",
    loanType: "Business Loan",
    amount: "PKR 5,000,000",
    status: "afd_flagged",
    lastUpdate: "2024-01-13",
    assignedTo: "Ali Raza",
    priority: "High",
    cnic: "42101-9876543-2",
    fraudChecks: [
      { id: "check9", name: "NADRA Verification", status: "completed" },
      { id: "check10", name: "Duplicate Application Check", status: "completed" },
      { id: "check11", name: "Blacklist Check", status: "flagged", reason: "Found in FIA blacklist" },
      { id: "check12", name: "Document Forgery Check", status: "completed" },
    ],
    checkProgress: 100,
    flagReason: "Applicant found in FIA blacklist database",
  },
]

// Stats for dashboard
const statsData = [
  {
    title: "Pending Checks",
    value: "15",
    change: "New applications",
    icon: Clock,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    title: "Verified Today",
    value: "8",
    change: "No fraud detected",
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    title: "Flagged Cases",
    value: "3",
    change: "Potential fraud",
    icon: AlertOctagon,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  {
    title: "Database Checks",
    value: "126",
    change: "External systems",
    icon: Database,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
]

function getStatusBadge(status: string) {
  const statusConfig: Record<string, { variant: "default" | "destructive" | "outline" | "secondary", label: string }> = {
    "afd_pending": { variant: "outline", label: "Pending" },
    "afd_in_progress": { variant: "secondary", label: "In Progress" },
    "afd_flagged": { variant: "destructive", label: "Flagged" },
    "afd_verified": { variant: "default", label: "Verified" },
  }

  const config = statusConfig[status] || { variant: "outline", label: status }

  return <Badge variant={config.variant}>{config.label}</Badge>
}

function getCheckStatusBadge(status: string) {
  const statusConfig: Record<string, { variant: "default" | "destructive" | "outline" | "secondary", label: string }> = {
    "completed": { variant: "default", label: "Completed" },
    "pending": { variant: "outline", label: "Pending" },
    "in_progress": { variant: "secondary", label: "In Progress" },
    "flagged": { variant: "destructive", label: "Flagged" },
  }

  const config = statusConfig[status] || { variant: "outline", label: status }

  return <Badge variant={config.variant}>{config.label}</Badge>
}

export default function CIUAFDDashboardPage() {
  const [activeTab, setActiveTab] = useState("pending")
  const [selectedApplication, setSelectedApplication] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const { toast } = useToast()

  const filteredApplications = applicationsData.filter((app) => {
    const matchesSearch = app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.cnic.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || app.status === statusFilter
    
    if (activeTab === "pending") {
      return matchesSearch && (app.status === "afd_pending" || app.status === "afd_in_progress")
    } else if (activeTab === "flagged") {
      return matchesSearch && app.status === "afd_flagged"
    } else if (activeTab === "verified") {
      return matchesSearch && app.status === "afd_verified"
    }
    
    return matchesSearch && matchesStatus
  })

  const handleStartChecks = (appId: string) => {
    // Update application status logic would go here
    toast({
      title: "Checks Started",
      description: "Fraud detection checks have been initiated",
    })
  }

  const handleCompleteChecks = () => {
    // Update application status logic would go here
    toast({
      title: "Checks Completed",
      description: "Application has been verified and sent to Acceptance",
    })
    setSelectedApplication(null)
  }

  const handleFlagApplication = () => {
    // Update application status logic would go here
    toast({
      title: "Application Flagged",
      description: "Application has been flagged for potential fraud",
    })
    setSelectedApplication(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">CIU - Anti-Fraud Division</h2>
          <p className="text-muted-foreground">Fraud detection and prevention</p>
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
          <TabsTrigger value="pending">Pending Checks</TabsTrigger>
          <TabsTrigger value="flagged">Flagged</TabsTrigger>
          <TabsTrigger value="verified">Verified</TabsTrigger>
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

                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="afd_pending">Pending</SelectItem>
                      <SelectItem value="afd_in_progress">In Progress</SelectItem>
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
              <CardTitle>Pending Applications ({filteredApplications.length})</CardTitle>
              <CardDescription>Applications requiring fraud detection checks</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>LOS ID</TableHead>
                    <TableHead>Applicant</TableHead>
                    <TableHead>CNIC</TableHead>
                    <TableHead>Loan Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
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
                      <TableCell>{app.cnic}</TableCell>
                      <TableCell>{app.loanType}</TableCell>
                      <TableCell className="font-medium">{app.amount}</TableCell>
                      <TableCell>{getStatusBadge(app.status)}</TableCell>
                      <TableCell>
                        <div className="w-full">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs">{app.checkProgress}%</span>
                          </div>
                          <Progress value={app.checkProgress} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button onClick={() => setSelectedApplication(app)}>
                              {app.status === "afd_pending" ? "Start Checks" : "Continue"}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>Fraud Detection - {selectedApplication?.id}</DialogTitle>
                              <DialogDescription>
                                Perform fraud detection checks for {selectedApplication?.applicantName}
                              </DialogDescription>
                            </DialogHeader>

                            {selectedApplication && (
                              <div className="space-y-6">
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">Applicant Information</CardTitle>
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
                                    </div>
                                  </CardContent>
                                </Card>

                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">Fraud Detection Checks</CardTitle>
                                    <CardDescription>
                                      Complete all required checks to verify the application
                                    </CardDescription>
                                  </CardHeader>
                                  <CardContent>
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Check</TableHead>
                                          <TableHead>Status</TableHead>
                                          <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {selectedApplication.fraudChecks.map((check: any) => (
                                          <TableRow key={check.id}>
                                            <TableCell>{check.name}</TableCell>
                                            <TableCell>
                                              <div className="flex flex-col">
                                                {getCheckStatusBadge(check.status)}
                                                {check.reason && (
                                                  <span className="text-xs text-red-600 mt-1">{check.reason}</span>
                                                )}
                                              </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                              <div className="flex justify-end gap-2">
                                                <Button 
                                                  variant="outline" 
                                                  size="sm"
                                                  disabled={check.status !== "pending" && check.status !== "in_progress"}
                                                >
                                                  <Fingerprint className="h-4 w-4 mr-1" />
                                                  Run Check
                                                </Button>
                                                <Button 
                                                  variant="destructive" 
                                                  size="sm"
                                                  disabled={check.status === "flagged"}
                                                >
                                                  <AlertOctagon className="h-4 w-4 mr-1" />
                                                  Flag
                                                </Button>
                                              </div>
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </CardContent>
                                </Card>

                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">Notes</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <Textarea 
                                      placeholder="Add any notes or findings from the fraud detection checks..."
                                    />
                                  </CardContent>
                                </Card>

                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setSelectedApplication(null)}>
                                    Save Progress
                                  </Button>
                                  <div className="space-x-2">
                                    <Button variant="destructive" onClick={handleFlagApplication}>
                                      Flag for Review
                                    </Button>
                                    <Button onClick={handleCompleteChecks}>
                                      Verify & Send to Acceptance
                                    </Button>
                                  </div>
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

        <TabsContent value="flagged" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Flagged Applications</CardTitle>
              <CardDescription>Applications flagged for potential fraud</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>LOS ID</TableHead>
                    <TableHead>Applicant</TableHead>
                    <TableHead>CNIC</TableHead>
                    <TableHead>Loan Type</TableHead>
                    <TableHead>Flag Reason</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applicationsData
                    .filter(app => app.status === "afd_flagged")
                    .map((app) => (
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
                        <TableCell>{app.cnic}</TableCell>
                        <TableCell>{app.loanType}</TableCell>
                        <TableCell>
                          <div className="max-w-[200px]">
                            <Badge variant="destructive" className="mb-1">Flagged</Badge>
                            <p className="text-sm text-red-600">{app.flagReason}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verified" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Verified Applications</CardTitle>
              <CardDescription>Applications verified with no fraud detected</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Verified applications will appear here...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 