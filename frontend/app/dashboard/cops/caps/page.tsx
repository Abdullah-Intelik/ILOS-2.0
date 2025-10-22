// /dashboard/cops/caps/page.tsx
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
import { useToast } from "@/hooks/use-toast"
import { 
  Database, 
  CheckCircle, 
  AlertTriangle, 
  Search, 
  RotateCw, 
  Download, 
  Upload, 
  RefreshCw,
  Clock,
  XCircle,
  Settings,
  Activity,
  AlertCircle,
  Filter,
  Eye,
  BarChart3
} from "lucide-react"

// Mock data for CAPS integration
const capsApplicationsData = [
  {
    id: "UBL-2024-001234",
    applicantName: "Ahmed Ali",
    loanType: "Home Loan",
    amount: "PKR 4,000,000",
    status: "approved",
    lastUpdate: "2024-01-15 14:30:25",
    assignedTo: "EAMVU",
    capsStatus: "synced",
    capsId: "CAPS-HL-2024-001234",
    syncAttempts: 1,
    lastSyncTime: "2024-01-15 14:30:25",
    errorMessage: null,
    priority: "high",
    loanOfficer: "Sara Ahmed",
    branch: "Karachi Main",
    disbursementStatus: "pending",
  },
  {
    id: "UBL-2024-001235",
    applicantName: "Fatima Ahmed",
    loanType: "Auto Loan",
    amount: "PKR 1,500,000",
    status: "approved",
    lastUpdate: "2024-01-16 10:15:30",
    assignedTo: "EAMVU",
    capsStatus: "failed",
    capsId: null,
    syncAttempts: 3,
    lastSyncTime: "2024-01-16 16:45:10",
    errorMessage: "Connection timeout - Core Banking System unavailable",
    priority: "medium",
    loanOfficer: "Bilal Khan",
    branch: "Karachi North",
    disbursementStatus: "on-hold",
  },
  {
    id: "UBL-2024-001236",
    applicantName: "Hassan Raza",
    loanType: "Business Loan",
    amount: "PKR 3,000,000",
    status: "approved",
    lastUpdate: "2024-01-17 09:20:45",
    assignedTo: "EAMVU",
    capsStatus: "synced",
    capsId: "CAPS-BL-2024-001236",
    syncAttempts: 1,
    lastSyncTime: "2024-01-17 09:21:15",
    errorMessage: null,
    priority: "high",
    loanOfficer: "Usman Ali",
    branch: "Lahore Main",
    disbursementStatus: "completed",
  },
  {
    id: "UBL-2024-001237",
    applicantName: "Ayesha Malik",
    loanType: "Personal Loan",
    amount: "PKR 800,000",
    status: "approved",
    lastUpdate: "2024-01-18 11:30:20",
    assignedTo: "EAMVU",
    capsStatus: "pending",
    capsId: null,
    syncAttempts: 0,
    lastSyncTime: null,
    errorMessage: null,
    priority: "low",
    loanOfficer: "Zainab Ali",
    branch: "Islamabad",
    disbursementStatus: "pending",
  },
]

// System statistics
const systemStats = {
  totalApplications: 156,
  syncedApplications: 142,
  pendingSync: 8,
  failedSync: 6,
  syncSuccessRate: 91.0,
  avgSyncTime: "2.3 seconds",
  lastSystemSync: "2024-01-18 12:00:00",
  systemStatus: "operational",
}

function getStatusBadge(status: string) {
  switch (status) {
    case "synced":
      return <Badge className="bg-green-100 text-green-800">Synced</Badge>
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
    case "failed":
      return <Badge className="bg-red-100 text-red-800">Failed</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

function getPriorityBadge(priority: string) {
  switch (priority) {
    case "high":
      return <Badge className="bg-red-100 text-red-800">High</Badge>
    case "medium":
      return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
    case "low":
      return <Badge className="bg-green-100 text-green-800">Low</Badge>
    default:
      return <Badge variant="secondary">{priority}</Badge>
  }
}

function getDisbursementBadge(status: string) {
  switch (status) {
    case "completed":
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
    case "on-hold":
      return <Badge className="bg-red-100 text-red-800">On Hold</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export default function CAPSIntegrationPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [selectedApplications, setSelectedApplications] = useState<string[]>([])
  const [selectedApp, setSelectedApp] = useState<any>(null)
  const [isSystemConfigOpen, setIsSystemConfigOpen] = useState(false)
  const { toast } = useToast()

  const filteredApplications = capsApplicationsData.filter((app) => {
    const matchesSearch = 
      app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.loanOfficer.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || app.capsStatus === statusFilter
    const matchesPriority = priorityFilter === "all" || app.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  const handleSyncStatus = (appId: string) => {
    toast({
      title: "Sync Initiated",
      description: `Synchronization started for application ${appId}`,
    })
  }

  const handleBatchSync = () => {
    if (selectedApplications.length === 0) {
      toast({
        title: "No Applications Selected",
        description: "Please select applications to sync",
        variant: "destructive",
      })
      return
    }
    
    toast({
      title: "Batch Sync Started",
      description: `Synchronizing ${selectedApplications.length} applications`,
    })
    setSelectedApplications([])
  }

  const handleRetryFailed = () => {
    toast({
      title: "Retry Initiated",
      description: "Retrying all failed synchronizations",
    })
  }

  const handleSystemRefresh = () => {
    toast({
      title: "System Refresh",
      description: "Refreshing CAPS connection status",
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
          <h2 className="text-2xl font-bold tracking-tight">CAPS Integration</h2>
          <p className="text-muted-foreground">Core Banking System synchronization and monitoring</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSystemRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => setIsSystemConfigOpen(true)}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* System Status Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.totalApplications}</div>
            <p className="text-xs text-muted-foreground">Ready for sync</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Synced</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{systemStats.syncedApplications}</div>
            <p className="text-xs text-muted-foreground">Successfully synced</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{systemStats.pendingSync}</div>
            <p className="text-xs text-muted-foreground">Awaiting sync</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{systemStats.failedSync}</div>
            <p className="text-xs text-muted-foreground">Sync errors</p>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Success Rate</Label>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold text-green-600">{systemStats.syncSuccessRate}%</div>
                <Badge className="bg-green-100 text-green-800">Excellent</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Average Sync Time</Label>
              <div className="text-2xl font-bold">{systemStats.avgSyncTime}</div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">System Status</Label>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <Badge className="bg-green-100 text-green-800">Operational</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Applications Management</CardTitle>
          <CardDescription>Monitor and manage CAPS synchronization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
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
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="synced">Synced</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleBatchSync} disabled={selectedApplications.length === 0}>
                <RotateCw className="mr-2 h-4 w-4" />
                Batch Sync ({selectedApplications.length})
              </Button>
              <Button variant="outline" onClick={handleRetryFailed}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry Failed
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sync Status</CardTitle>
          <CardDescription>Real-time synchronization status for all applications</CardDescription>
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
                  <TableHead>CAPS Status</TableHead>
                  <TableHead>Disbursement</TableHead>
                  <TableHead>Last Sync</TableHead>
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
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(app.capsStatus)}
                        {app.capsStatus === "failed" && (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getDisbursementBadge(app.disbursementStatus)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {app.lastSyncTime ? new Date(app.lastSyncTime).toLocaleString() : "Never"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSyncStatus(app.id)}
                        >
                                                        <RotateCw className="h-4 w-4" />
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedApp(app)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Application Details - {selectedApp?.id}</DialogTitle>
                              <DialogDescription>
                                Detailed synchronization information
                              </DialogDescription>
                            </DialogHeader>
                            {selectedApp && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium">Applicant Name</Label>
                                    <p className="text-sm">{selectedApp.applicantName}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Loan Officer</Label>
                                    <p className="text-sm">{selectedApp.loanOfficer}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Branch</Label>
                                    <p className="text-sm">{selectedApp.branch}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">CAPS ID</Label>
                                    <p className="text-sm font-mono">{selectedApp.capsId || "Not assigned"}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Sync Attempts</Label>
                                    <p className="text-sm">{selectedApp.syncAttempts}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Last Sync</Label>
                                    <p className="text-sm">{selectedApp.lastSyncTime ? new Date(selectedApp.lastSyncTime).toLocaleString() : "Never"}</p>
                                  </div>
                                </div>
                                {selectedApp.errorMessage && (
                                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                                    <Label className="text-sm font-medium text-red-800">Error Message</Label>
                                    <p className="text-sm text-red-700">{selectedApp.errorMessage}</p>
                                  </div>
                                )}
                              </div>
                            )}
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

      {/* System Configuration Dialog */}
      <Dialog open={isSystemConfigOpen} onOpenChange={setIsSystemConfigOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>CAPS System Configuration</DialogTitle>
            <DialogDescription>
              Configure CAPS integration settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Sync Interval (minutes)</Label>
              <Select defaultValue="5">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 minute</SelectItem>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Retry Attempts</Label>
              <Select defaultValue="3">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 attempt</SelectItem>
                  <SelectItem value="3">3 attempts</SelectItem>
                  <SelectItem value="5">5 attempts</SelectItem>
                  <SelectItem value="10">10 attempts</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setIsSystemConfigOpen(false)}>Save Settings</Button>
              <Button variant="outline" onClick={() => setIsSystemConfigOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
