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
  Search, 
  CheckCircle, 
  AlertTriangle, 
  Shield, 
  FileText, 
  Clock, 
  XCircle,
  Eye,
  Download,
  Filter,
  AlertCircle,
  User,
  Building,
  CreditCard,
  Scale,
  Activity,
  TrendingUp,
  Users,
  Flag
} from "lucide-react"

// Mock data for Compliance Check Queue
const complianceQueueData = [
  {
    id: "UBL-2024-001234",
    applicantName: "Ahmed Ali",
    loanType: "Home Loan",
    amount: "PKR 4,000,000",
    complianceStatus: "in-progress",
    lastUpdate: "2024-01-15 14:30:25",
    assignedTo: "Zainab Ali",
    priority: "high",
    kycStatus: "completed",
    amlStatus: "in-progress",
    creditScoreStatus: "completed",
    riskLevel: "medium",
    complianceScore: 85,
    flaggedItems: ["High transaction amount"],
    documents: ["CNIC", "Salary Certificate", "Bank Statement"],
    branch: "Karachi Main",
    submittedDate: "2024-01-10",
    dueDate: "2024-01-20",
  },
  {
    id: "UBL-2024-001235",
    applicantName: "Fatima Ahmed",
    loanType: "Auto Loan",
    amount: "PKR 1,500,000",
    complianceStatus: "pending",
    lastUpdate: "2024-01-16 10:15:30",
    assignedTo: "Omar Khan",
    priority: "medium",
    kycStatus: "pending",
    amlStatus: "pending",
    creditScoreStatus: "completed",
    riskLevel: "low",
    complianceScore: 92,
    flaggedItems: [],
    documents: ["CNIC", "Employment Letter"],
    branch: "Karachi North",
    submittedDate: "2024-01-12",
    dueDate: "2024-01-22",
  },
  {
    id: "UBL-2024-001236",
    applicantName: "Hassan Raza",
    loanType: "Business Loan",
    amount: "PKR 3,000,000",
    complianceStatus: "completed",
    lastUpdate: "2024-01-17 09:20:45",
    assignedTo: "Sara Ahmed",
    priority: "high",
    kycStatus: "completed",
    amlStatus: "completed",
    creditScoreStatus: "completed",
    riskLevel: "high",
    complianceScore: 75,
    flaggedItems: ["Business location verification required", "Previous loan history"],
    documents: ["CNIC", "Business Registration", "Tax Returns"],
    branch: "Lahore Main",
    submittedDate: "2024-01-08",
    dueDate: "2024-01-18",
  },
  {
    id: "UBL-2024-001237",
    applicantName: "Ayesha Malik",
    loanType: "Personal Loan",
    amount: "PKR 800,000",
    complianceStatus: "flagged",
    lastUpdate: "2024-01-18 11:30:20",
    assignedTo: "Bilal Khan",
    priority: "urgent",
    kycStatus: "failed",
    amlStatus: "flagged",
    creditScoreStatus: "completed",
    riskLevel: "high",
    complianceScore: 45,
    flaggedItems: ["AML watch list match", "Incomplete KYC documents", "Credit score below threshold"],
    documents: ["CNIC (Expired)", "Salary Slip"],
    branch: "Islamabad",
    submittedDate: "2024-01-14",
    dueDate: "2024-01-24",
  },
]

// Compliance statistics
const complianceStats = {
  totalApplications: 89,
  completedCompliance: 67,
  pendingCompliance: 15,
  flaggedCompliance: 7,
  complianceRate: 75.3,
  avgProcessingTime: "3.2 days",
  criticalFlags: 12,
  amlMatches: 3,
}

function getComplianceStatusBadge(status: string) {
  switch (status) {
    case "completed":
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>
    case "in-progress":
      return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
    case "flagged":
      return <Badge className="bg-red-100 text-red-800">Flagged</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

function getCheckStatusBadge(status: string) {
  switch (status) {
    case "completed":
      return <Badge className="bg-green-100 text-green-800">✓ Completed</Badge>
    case "in-progress":
      return <Badge className="bg-blue-100 text-blue-800">⏳ In Progress</Badge>
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800">⏸ Pending</Badge>
    case "failed":
      return <Badge className="bg-red-100 text-red-800">✗ Failed</Badge>
    case "flagged":
      return <Badge className="bg-red-100 text-red-800">⚠ Flagged</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
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

export default function ComplianceCheckQueuePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [riskFilter, setRiskFilter] = useState("all")
  const [selectedApplication, setSelectedApplication] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("queue")
  const { toast } = useToast()

  const filteredApplications = complianceQueueData.filter((app) => {
    const matchesSearch = 
      app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || app.complianceStatus === statusFilter
    const matchesPriority = priorityFilter === "all" || app.priority === priorityFilter
    const matchesRisk = riskFilter === "all" || app.riskLevel === riskFilter
    
    return matchesSearch && matchesStatus && matchesPriority && matchesRisk
  })

  const handleCompleteComplianceCheck = (appId: string) => {
    toast({
      title: "Compliance Check Completed",
      description: `Compliance check marked as completed for application ${appId}`,
    })
  }

  const handleFlagApplication = (appId: string) => {
    toast({
      title: "Application Flagged",
      description: `Application ${appId} has been flagged for manual review`,
    })
  }

  const handleAssignApplication = (appId: string) => {
    toast({
      title: "Application Assigned",
      description: `Application ${appId} has been assigned to a compliance officer.`,
    });
  };

  // Export functionality for COPS compliance
  const handleExport = () => {
    try {
      console.log('🔄 Starting COPS compliance export process...');
      
      // Create comprehensive report data
      const reportData = {
        summary: {
          totalApplications: complianceStats.totalApplications,
          completedCompliance: complianceStats.completedCompliance,
          flaggedCompliance: complianceStats.flaggedCompliance,
          complianceRate: complianceStats.complianceRate,
          exportDate: new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }),
          department: 'Compliance Operations (COPS)'
        },
        applications: complianceQueueData.map(app => ({
          applicationId: app.id,
          applicantName: app.applicantName || 'N/A',
          loanType: app.loanType || 'N/A',
          amount: app.amount || 'N/A',
          status: app.complianceStatus || 'Unknown',
          priority: app.priority || 'Medium',
          riskLevel: app.riskLevel || 'Medium',
          assignedTo: app.assignedTo || 'N/A',
          submissionDate: app.submittedDate || 'N/A',
          kycStatus: app.kycStatus || 'N/A',
          amlStatus: app.amlStatus || 'N/A',
          regulatoryStatus: app.creditScoreStatus || 'N/A',
          complianceNotes: app.flaggedItems.join(', ') || 'N/A'
        }))
      };

      console.log('📊 COPS report data prepared:', reportData);

      // Create CSV content
      const csvHeaders = [
        'Application ID',
        'Applicant Name',
        'Loan Type',
        'Amount',
        'Status',
        'Priority',
        'Risk Level',
        'Assigned To',
        'Submission Date',
        'KYC Status',
        'AML Status',
        'Regulatory Status',
        'Compliance Notes'
      ];

      const csvRows = reportData.applications.map(app => [
        app.applicationId,
        app.applicantName,
        app.loanType,
        app.amount,
        app.status,
        app.priority,
        app.riskLevel,
        app.assignedTo,
        app.submissionDate,
        app.kycStatus,
        app.amlStatus,
        app.regulatoryStatus,
        app.complianceNotes
      ]);

      // Add summary section
      const summaryRows = [
        [''],
        ['SUMMARY REPORT'],
        ['Department', reportData.summary.department],
        ['Export Date', reportData.summary.exportDate],
        ['Total Applications', reportData.summary.totalApplications],
        ['Completed Compliance', reportData.summary.completedCompliance],
        ['Flagged Compliance', reportData.summary.flaggedCompliance],
        ['Compliance Rate', `${reportData.summary.complianceRate}%`],
        [''],
        ['DETAILED COMPLIANCE APPLICATIONS'],
        csvHeaders
      ];

      // Combine summary and data
      const allRows = [...summaryRows, ...csvRows];

      // Convert to CSV format with better escaping
      const csvContent = allRows.map(row => 
        row.map(cell => {
          const cellStr = String(cell || '');
          // Escape quotes and wrap in quotes if contains comma, quote, or newline
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        }).join(',')
      ).join('\n');

      console.log('📄 COPS CSV content generated, length:', csvContent.length);

      // Add BOM for better Excel compatibility
      const BOM = '\uFEFF';
      const csvWithBOM = BOM + csvContent;

      // Create and download file
      const blob = new Blob([csvWithBOM], { 
        type: 'text/csv;charset=utf-8;' 
      });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `COPS_Compliance_Report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log('✅ COPS file download triggered');

      toast({
        title: "Export Successful",
        description: `COPS compliance report exported with ${complianceQueueData.length} applications and summary statistics.`,
      });

    } catch (error) {
      console.error('❌ COPS export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export COPS compliance report. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Compliance Management</h2>
          <p className="text-muted-foreground">KYC, AML, and regulatory compliance monitoring</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Compliance Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceStats.totalApplications}</div>
            <p className="text-xs text-muted-foreground">Under compliance review</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{complianceStats.completedCompliance}</div>
            <p className="text-xs text-muted-foreground">Compliance cleared</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged</CardTitle>
            <Flag className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{complianceStats.flaggedCompliance}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{complianceStats.complianceRate}%</div>
            <p className="text-xs text-muted-foreground">Success rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="queue">Compliance Queue</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filter Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by applicant name, LOS ID, or officer..."
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
                      <SelectItem value="flagged">Flagged</SelectItem>
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
                  <Select value={riskFilter} onValueChange={setRiskFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Risk" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Risk</SelectItem>
                      <SelectItem value="low">Low Risk</SelectItem>
                      <SelectItem value="medium">Medium Risk</SelectItem>
                      <SelectItem value="high">High Risk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Applications Table */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance Applications</CardTitle>
              <CardDescription>Applications requiring compliance review and approval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>LOS ID</TableHead>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Loan Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Risk Level</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.map((app) => (
                      <TableRow key={app.id}>
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
                            {getComplianceStatusBadge(app.complianceStatus)}
                            {app.flaggedItems.length > 0 && (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getRiskLevelBadge(app.riskLevel)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`text-sm font-medium ${
                              app.complianceScore >= 80 ? 'text-green-600' : 
                              app.complianceScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {app.complianceScore}%
                            </div>
                          </div>
                        </TableCell>
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
                                  <DialogTitle>Compliance Details - {selectedApplication?.id}</DialogTitle>
                                  <DialogDescription>
                                    Detailed compliance review information
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedApplication && (
                                  <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="text-sm font-medium">Applicant Information</Label>
                                        <div className="space-y-2 mt-2">
                                          <p><strong>Name:</strong> {selectedApplication.applicantName}</p>
                                          <p><strong>Loan Type:</strong> {selectedApplication.loanType}</p>
                                          <p><strong>Amount:</strong> {selectedApplication.amount}</p>
                                          <p><strong>Branch:</strong> {selectedApplication.branch}</p>
                                        </div>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium">Compliance Status</Label>
                                        <div className="space-y-2 mt-2">
                                          <p><strong>Overall Status:</strong> {getComplianceStatusBadge(selectedApplication.complianceStatus)}</p>
                                          <p><strong>Risk Level:</strong> {getRiskLevelBadge(selectedApplication.riskLevel)}</p>
                                          <p><strong>Compliance Score:</strong> {selectedApplication.complianceScore}%</p>
                                          <p><strong>Assigned To:</strong> {selectedApplication.assignedTo}</p>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-3 gap-4">
                                      <div>
                                        <Label className="text-sm font-medium">KYC Status</Label>
                                        <div className="mt-2">{getCheckStatusBadge(selectedApplication.kycStatus)}</div>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium">AML Status</Label>
                                        <div className="mt-2">{getCheckStatusBadge(selectedApplication.amlStatus)}</div>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium">Credit Score Status</Label>
                                        <div className="mt-2">{getCheckStatusBadge(selectedApplication.creditScoreStatus)}</div>
                                      </div>
                                    </div>

                                    <div>
                                      <Label className="text-sm font-medium">Documents Submitted</Label>
                                      <div className="flex gap-2 mt-2">
                                        {selectedApplication.documents.map((doc: string, index: number) => (
                                          <Badge key={index} variant="outline">{doc}</Badge>
                                        ))}
                                      </div>
                                    </div>

                                    {selectedApplication.flaggedItems.length > 0 && (
                                      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                                        <Label className="text-sm font-medium text-red-800">Flagged Items</Label>
                                        <ul className="mt-2 space-y-1">
                                          {selectedApplication.flaggedItems.map((item: string, index: number) => (
                                            <li key={index} className="text-sm text-red-700 flex items-center gap-2">
                                              <AlertTriangle className="h-3 w-3" />
                                              {item}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}

                                    <div className="flex gap-2">
                                      <Button onClick={() => handleCompleteComplianceCheck(selectedApplication.id)}>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Mark Complete
                                      </Button>
                                      <Button variant="outline" onClick={() => handleFlagApplication(selectedApplication.id)}>
                                        <Flag className="mr-2 h-4 w-4" />
                                        Flag for Review
                                      </Button>
                                      <Button variant="outline" onClick={() => handleAssignApplication(selectedApplication.id)}>
                                        <Users className="mr-2 h-4 w-4" />
                                        Reassign
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            <Button
                              size="sm"
                              onClick={() => handleCompleteComplianceCheck(app.id)}
                              disabled={app.complianceStatus === "completed"}
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

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Average Processing Time</Label>
                    <span className="font-medium">{complianceStats.avgProcessingTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Critical Flags</Label>
                    <span className="font-medium text-red-600">{complianceStats.criticalFlags}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>AML Matches</Label>
                    <span className="font-medium text-orange-600">{complianceStats.amlMatches}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      Low Risk
                    </Label>
                    <span className="font-medium">45%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      Medium Risk
                    </Label>
                    <span className="font-medium">35%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      High Risk
                    </Label>
                    <span className="font-medium">20%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Reports</CardTitle>
              <CardDescription>Generate and download compliance reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">KYC Compliance Report</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">AML Screening Report</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Risk Assessment Report</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
