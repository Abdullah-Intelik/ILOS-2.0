"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { 
  Search, 
  Database, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Eye,
  Download,
  Upload,
  RefreshCw,
  Settings,
  FileText,
  Users,
  Activity,
  TrendingUp,
  AlertCircle,
  Edit,
  Save,
  X,
  Plus,
  Filter
} from "lucide-react"

// Mock data for Data Entry Queue
const dataEntryQueueData = [
  {
    id: "UBL-2024-001234",
    applicantName: "Ahmed Ali",
    loanType: "Home Loan",
    amount: "PKR 4,000,000",
    dataEntryStatus: "in-progress",
    lastUpdate: "2024-01-15 14:30:25",
    assignedTo: "Zainab Ali",
    priority: "high",
    completionPercentage: 75,
    validationErrors: ["Missing property valuation", "Income verification pending"],
    fieldsCompleted: 18,
    totalFields: 24,
    estimatedTime: "2 hours",
    submittedDate: "2024-01-10",
    dueDate: "2024-01-20",
    branch: "Karachi Main",
    loanOfficer: "Sara Ahmed",
    dataQuality: "good",
    systemIntegration: "pending",
  },
  {
    id: "UBL-2024-001235",
    applicantName: "Fatima Ahmed",
    loanType: "Auto Loan",
    amount: "PKR 1,500,000",
    dataEntryStatus: "pending",
    lastUpdate: "2024-01-16 10:15:30",
    assignedTo: "Omar Khan",
    priority: "medium",
    completionPercentage: 0,
    validationErrors: [],
    fieldsCompleted: 0,
    totalFields: 18,
    estimatedTime: "1.5 hours",
    submittedDate: "2024-01-12",
    dueDate: "2024-01-22",
    branch: "Karachi North",
    loanOfficer: "Bilal Khan",
    dataQuality: "unknown",
    systemIntegration: "not-started",
  },
  {
    id: "UBL-2024-001236",
    applicantName: "Hassan Raza",
    loanType: "Business Loan",
    amount: "PKR 3,000,000",
    dataEntryStatus: "completed",
    lastUpdate: "2024-01-17 09:20:45",
    assignedTo: "Sara Ahmed",
    priority: "high",
    completionPercentage: 100,
    validationErrors: [],
    fieldsCompleted: 22,
    totalFields: 22,
    estimatedTime: "0 hours",
    submittedDate: "2024-01-08",
    dueDate: "2024-01-18",
    branch: "Lahore Main",
    loanOfficer: "Usman Ali",
    dataQuality: "excellent",
    systemIntegration: "completed",
  },
  {
    id: "UBL-2024-001237",
    applicantName: "Ayesha Malik",
    loanType: "Personal Loan",
    amount: "PKR 800,000",
    dataEntryStatus: "validation-failed",
    lastUpdate: "2024-01-18 11:30:20",
    assignedTo: "Bilal Khan",
    priority: "urgent",
    completionPercentage: 85,
    validationErrors: ["Invalid CNIC format", "Salary amount mismatch", "Missing guarantor information"],
    fieldsCompleted: 13,
    totalFields: 15,
    estimatedTime: "30 minutes",
    submittedDate: "2024-01-14",
    dueDate: "2024-01-24",
    branch: "Islamabad",
    loanOfficer: "Zainab Ali",
    dataQuality: "poor",
    systemIntegration: "failed",
  },
]

// Data entry statistics
const dataEntryStats = {
  totalApplications: 156,
  completedEntries: 112,
  pendingEntries: 28,
  failedValidation: 16,
  avgCompletionTime: "2.8 hours",
  dataQualityScore: 87.5,
  systemIntegrationRate: 92.3,
  dailyThroughput: 45,
}

function getDataEntryStatusBadge(status: string) {
  switch (status) {
    case "completed":
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>
    case "in-progress":
      return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
    case "validation-failed":
      return <Badge className="bg-red-100 text-red-800">Validation Failed</Badge>
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

function getDataQualityBadge(quality: string) {
  switch (quality) {
    case "excellent":
      return <Badge className="bg-green-100 text-green-800">Excellent</Badge>
    case "good":
      return <Badge className="bg-blue-100 text-blue-800">Good</Badge>
    case "fair":
      return <Badge className="bg-yellow-100 text-yellow-800">Fair</Badge>
    case "poor":
      return <Badge className="bg-red-100 text-red-800">Poor</Badge>
    default:
      return <Badge variant="secondary">Unknown</Badge>
  }
}

function getIntegrationStatusBadge(status: string) {
  switch (status) {
    case "completed":
      return <Badge className="bg-green-100 text-green-800">✓ Integrated</Badge>
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800">⏳ Pending</Badge>
    case "failed":
      return <Badge className="bg-red-100 text-red-800">✗ Failed</Badge>
    case "not-started":
      return <Badge className="bg-gray-100 text-gray-800">Not Started</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export default function DataEntryQueuePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [selectedApplications, setSelectedApplications] = useState<string[]>([])
  const [selectedApplication, setSelectedApplication] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("queue")
  const { toast } = useToast()

  const filteredApplications = dataEntryQueueData.filter((app) => {
    const matchesSearch = 
      app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || app.dataEntryStatus === statusFilter
    const matchesPriority = priorityFilter === "all" || app.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  const handleCompleteDataEntry = (appId: string) => {
    toast({
      title: "Data Entry Completed",
      description: `Data entry marked as completed for application ${appId}`,
    })
  }

  const handleStartDataEntry = (appId: string) => {
    toast({
      title: "Data Entry Started",
      description: `Data entry process initiated for application ${appId}`,
    })
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
      description: `Assigned ${selectedApplications.length} applications to data entry operators`,
    })
    setSelectedApplications([])
  }

  const handleValidateData = (appId: string) => {
    toast({
      title: "Data Validation",
      description: `Running validation checks for application ${appId}`,
    })
  }

  const handleSystemIntegration = (appId: string) => {
    toast({
      title: "System Integration",
      description: `Initiating system integration for application ${appId}`,
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Data Entry Management</h2>
          <p className="text-muted-foreground">Core banking system data entry and validation</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Entry
          </Button>
        </div>
      </div>

      {/* Data Entry Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dataEntryStats.totalApplications}</div>
            <p className="text-xs text-muted-foreground">In data entry queue</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{dataEntryStats.completedEntries}</div>
            <p className="text-xs text-muted-foreground">Successfully processed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{dataEntryStats.pendingEntries}</div>
            <p className="text-xs text-muted-foreground">Awaiting entry</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Validation</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{dataEntryStats.failedValidation}</div>
            <p className="text-xs text-muted-foreground">Require correction</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Average Completion Time</Label>
                <span className="font-medium">{dataEntryStats.avgCompletionTime}</span>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Data Quality Score</Label>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-green-600">{dataEntryStats.dataQualityScore}%</span>
                  <Badge className="bg-green-100 text-green-800">Good</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">System Integration Rate</Label>
                <span className="font-medium text-blue-600">{dataEntryStats.systemIntegrationRate}%</span>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Daily Throughput</Label>
                <span className="font-medium">{dataEntryStats.dailyThroughput} applications</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Data Entry Queue</Label>
                  <span className="text-sm text-green-600">Healthy</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Validation Engine</Label>
                  <span className="text-sm text-green-600">Operational</span>
                </div>
                <Progress value={92} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">System Integration</Label>
                  <span className="text-sm text-blue-600">Good</span>
                </div>
                <Progress value={78} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="queue">Data Entry Queue</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
          <TabsTrigger value="integration">System Integration</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-4">
          {/* Filters and Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Queue Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search by applicant name, LOS ID, or operator..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="validation-failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
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
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleBatchAssign} disabled={selectedApplications.length === 0}>
                    <Users className="mr-2 h-4 w-4" />
                    Batch Assign ({selectedApplications.length})
                  </Button>
                  <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Bulk Upload
                  </Button>
                  <Button variant="outline">
                    <Settings className="mr-2 h-4 w-4" />
                    Queue Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Applications Table */}
          <Card>
            <CardHeader>
              <CardTitle>Data Entry Applications</CardTitle>
              <CardDescription>Applications requiring data entry processing</CardDescription>
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
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Data Quality</TableHead>
                      <TableHead>Due Date</TableHead>
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
                            <div className="text-sm text-muted-foreground">{app.assignedTo}</div>
                          </div>
                        </TableCell>
                        <TableCell>{app.loanType}</TableCell>
                        <TableCell className="font-medium">{app.amount}</TableCell>
                        <TableCell>{getPriorityBadge(app.priority)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getDataEntryStatusBadge(app.dataEntryStatus)}
                            {app.validationErrors.length > 0 && (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Progress value={app.completionPercentage} className="h-2 w-16" />
                              <span className="text-sm text-muted-foreground">{app.completionPercentage}%</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {app.fieldsCompleted}/{app.totalFields} fields
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getDataQualityBadge(app.dataQuality)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(app.dueDate).toLocaleDateString()}
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
                                  <DialogTitle>Data Entry Details - {selectedApplication?.id}</DialogTitle>
                                  <DialogDescription>
                                    Comprehensive data entry information and validation status
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedApplication && (
                                  <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="text-sm font-medium">Application Information</Label>
                                        <div className="space-y-2 mt-2">
                                          <p><strong>Applicant:</strong> {selectedApplication.applicantName}</p>
                                          <p><strong>Loan Type:</strong> {selectedApplication.loanType}</p>
                                          <p><strong>Amount:</strong> {selectedApplication.amount}</p>
                                          <p><strong>Branch:</strong> {selectedApplication.branch}</p>
                                          <p><strong>Loan Officer:</strong> {selectedApplication.loanOfficer}</p>
                                        </div>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium">Data Entry Status</Label>
                                        <div className="space-y-2 mt-2">
                                          <p><strong>Status:</strong> {getDataEntryStatusBadge(selectedApplication.dataEntryStatus)}</p>
                                          <p><strong>Assigned To:</strong> {selectedApplication.assignedTo}</p>
                                          <p><strong>Priority:</strong> {getPriorityBadge(selectedApplication.priority)}</p>
                                          <p><strong>Data Quality:</strong> {getDataQualityBadge(selectedApplication.dataQuality)}</p>
                                          <p><strong>Integration:</strong> {getIntegrationStatusBadge(selectedApplication.systemIntegration)}</p>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                      <div>
                                        <Label className="text-sm font-medium">Progress Overview</Label>
                                        <div className="mt-2 space-y-2">
                                          <div className="flex items-center gap-4">
                                            <Progress value={selectedApplication.completionPercentage} className="flex-1" />
                                            <span className="text-sm font-medium">{selectedApplication.completionPercentage}%</span>
                                          </div>
                                          <div className="flex justify-between text-sm text-muted-foreground">
                                            <span>Fields Completed: {selectedApplication.fieldsCompleted}/{selectedApplication.totalFields}</span>
                                            <span>Estimated Time: {selectedApplication.estimatedTime}</span>
                                          </div>
                                        </div>
                                      </div>

                                      {selectedApplication.validationErrors.length > 0 && (
                                        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                                          <Label className="text-sm font-medium text-red-800">Validation Errors</Label>
                                          <ul className="mt-2 space-y-1">
                                            {selectedApplication.validationErrors.map((error: string, index: number) => (
                                              <li key={index} className="text-sm text-red-700 flex items-center gap-2">
                                                <AlertTriangle className="h-3 w-3" />
                                                {error}
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                    </div>

                                    <div className="flex gap-2">
                                      <Button onClick={() => handleStartDataEntry(selectedApplication.id)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Start Entry
                                      </Button>
                                      <Button variant="outline" onClick={() => handleValidateData(selectedApplication.id)}>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Validate
                                      </Button>
                                      <Button variant="outline" onClick={() => handleSystemIntegration(selectedApplication.id)}>
                                        <Database className="mr-2 h-4 w-4" />
                                        Integrate
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            <Button
                              size="sm"
                              onClick={() => handleCompleteDataEntry(app.id)}
                              disabled={app.dataEntryStatus === "completed"}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Validation</CardTitle>
              <CardDescription>Validation rules and error management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Validation Rules Active</Label>
                    <div className="text-2xl font-bold text-green-600">24</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Validation Errors Today</Label>
                    <div className="text-2xl font-bold text-red-600">8</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Common Validation Issues</Label>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Invalid CNIC format</span>
                      <Badge variant="outline">35%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Missing income verification</span>
                      <Badge variant="outline">28%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Incomplete address information</span>
                      <Badge variant="outline">22%</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Integration</CardTitle>
              <CardDescription>Core banking system integration status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Integration Success Rate</Label>
                    <div className="text-2xl font-bold text-green-600">92.3%</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Failed Integrations</Label>
                    <div className="text-2xl font-bold text-red-600">12</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Average Integration Time</Label>
                    <div className="text-2xl font-bold">3.2 sec</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">System Status</Label>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Core Banking System</span>
                      <Badge className="bg-green-100 text-green-800">Online</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Credit Scoring API</span>
                      <Badge className="bg-green-100 text-green-800">Online</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Document Management</span>
                      <Badge className="bg-yellow-100 text-yellow-800">Degraded</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
