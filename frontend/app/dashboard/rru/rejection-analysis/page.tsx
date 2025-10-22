"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Download, BarChart3, PieChart, ArrowUpDown, Calendar, Filter } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// Mock data for rejection statistics
const rejectionStatistics = {
  totalRejections: 287,
  resumedApplications: 142,
  confirmedRejections: 98,
  pendingReview: 47,
  rejectionRate: "18.4%",
  resumeRate: "49.5%",
}

// Mock data for rejection reasons
const rejectionReasons = [
  { reason: "Income verification failed", count: 87, percentage: "30.3%" },
  { reason: "Document discrepancy", count: 64, percentage: "22.3%" },
  { reason: "Address verification failed", count: 42, percentage: "14.6%" },
  { reason: "Blacklist match found", count: 38, percentage: "13.2%" },
  { reason: "Employment verification failed", count: 31, percentage: "10.8%" },
  { reason: "Credit history issues", count: 25, percentage: "8.7%" },
]

// Mock data for rejection by department
const rejectionByDepartment = [
  { department: "Personal Banking", count: 156, percentage: "54.4%" },
  { department: "SPU", count: 73, percentage: "25.4%" },
  { department: "COPS", count: 41, percentage: "14.3%" },
  { department: "EAMVU", count: 17, percentage: "5.9%" },
]

// Mock data for rejection by loan type
const rejectionByLoanType = [
  { loanType: "Personal Loan", count: 132, percentage: "46.0%" },
  { loanType: "Auto Loan", count: 78, percentage: "27.2%" },
  { loanType: "Home Loan", count: 54, percentage: "18.8%" },
  { loanType: "Business Loan", count: 23, percentage: "8.0%" },
]

// Mock data for recent rejections
const recentRejections = [
  {
    id: "UBL-2024-001295",
    name: "Adeel Khan",
    cnic: "42101-1234567-8",
    reason: "Income verification failed",
    rejectionDate: "2024-01-16",
    amount: "PKR 1,500,000",
    loanType: "Personal Loan",
    status: "Under Review",
  },
  {
    id: "UBL-2024-001296",
    name: "Sana Ahmed",
    cnic: "42101-2345678-9",
    reason: "Address verification failed",
    rejectionDate: "2024-01-16",
    amount: "PKR 2,800,000",
    loanType: "Auto Loan",
    status: "Returned",
  },
  {
    id: "UBL-2024-001297",
    name: "Imran Ahmed",
    cnic: "42101-3456789-0",
    reason: "Employment verification failed",
    rejectionDate: "2024-01-15",
    amount: "PKR 3,200,000",
    loanType: "Home Loan",
    status: "Resumed",
  },
  {
    id: "UBL-2024-001298",
    name: "Fatima Zaidi",
    cnic: "42101-4567890-1",
    reason: "Missing bank statements",
    rejectionDate: "2024-01-15",
    amount: "PKR 1,200,000",
    loanType: "Personal Loan",
    status: "Rejected",
  },
  {
    id: "UBL-2024-001299",
    name: "Hassan Ali",
    cnic: "42101-5678901-2",
    reason: "Blacklist match found",
    rejectionDate: "2024-01-15",
    amount: "PKR 2,500,000",
    loanType: "Auto Loan",
    status: "Rejected",
  },
]

// Mock data for monthly rejection trends
const monthlyRejectionTrends = [
  { month: "Aug 2023", total: 245, resumed: 118, confirmed: 127 },
  { month: "Sep 2023", total: 267, resumed: 131, confirmed: 136 },
  { month: "Oct 2023", total: 254, resumed: 129, confirmed: 125 },
  { month: "Nov 2023", total: 278, resumed: 142, confirmed: 136 },
  { month: "Dec 2023", total: 261, resumed: 135, confirmed: 126 },
  { month: "Jan 2024", total: 287, resumed: 142, confirmed: 98 },
]

function getStatusBadge(status: string) {
  switch (status) {
    case "Under Review":
      return <Badge className="bg-orange-100 text-orange-800">Under Review</Badge>
    case "Returned":
      return <Badge className="bg-yellow-100 text-yellow-800">Returned</Badge>
    case "Resumed":
      return <Badge className="bg-green-100 text-green-800">Resumed</Badge>
    case "Rejected":
      return <Badge variant="destructive">Rejected</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export default function RRURejectionAnalysisPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const [timeRange, setTimeRange] = useState("month")
  const { toast } = useToast()

  // Export functionality for RRU rejection analysis
  const handleExport = () => {
    try {
      console.log('🔄 Starting RRU rejection analysis export process...');
      
      // Create comprehensive report data
      const reportData = {
        summary: {
          totalRejections: rejectionStatistics.totalRejections,
          resumedApplications: rejectionStatistics.resumedApplications,
          confirmedRejections: rejectionStatistics.confirmedRejections,
          rejectionRate: rejectionStatistics.rejectionRate,
          resumeRate: rejectionStatistics.resumeRate,
          pendingReview: rejectionStatistics.pendingReview,
          exportDate: new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }),
          department: 'Risk Review Unit (RRU)'
        },
        rejections: recentRejections.map(app => ({
          applicationId: app.id,
          applicantName: app.name || 'N/A',
          loanType: app.loanType || 'N/A',
          amount: app.amount || 'N/A',
          rejectionReason: app.reason || 'N/A',
          status: app.status || 'Unknown',
          rejectedDate: app.rejectionDate || 'N/A',
          assignedTo: 'N/A', // Placeholder for now
          reviewNotes: 'N/A', // Placeholder for now
          riskLevel: 'N/A' // Placeholder for now
        })),
        reasons: rejectionReasons.map(reason => ({
          reason: reason.reason,
          count: reason.count,
          percentage: reason.percentage
        }))
      };

      console.log('📊 RRU report data prepared:', reportData);

      // Create CSV content
      const csvHeaders = [
        'Application ID',
        'Applicant Name',
        'Loan Type',
        'Amount',
        'Rejection Reason',
        'Status',
        'Rejected Date',
        'Assigned To',
        'Review Notes',
        'Risk Level'
      ];

      const csvRows = reportData.rejections.map(app => [
        app.applicationId,
        app.applicantName,
        app.loanType,
        app.amount,
        app.rejectionReason,
        app.status,
        app.rejectedDate,
        app.assignedTo,
        app.reviewNotes,
        app.riskLevel
      ]);

      // Add summary section
      const summaryRows = [
        [''],
        ['SUMMARY REPORT'],
        ['Department', reportData.summary.department],
        ['Export Date', reportData.summary.exportDate],
        ['Total Rejections', reportData.summary.totalRejections],
        ['Resumed Applications', reportData.summary.resumedApplications],
        ['Confirmed Rejections', reportData.summary.confirmedRejections],
        ['Rejection Rate', reportData.summary.rejectionRate],
        ['Resume Rate', reportData.summary.resumeRate],
        ['Pending Review', reportData.summary.pendingReview],
        [''],
        ['REJECTION REASONS ANALYSIS'],
        ['Reason', 'Count', 'Percentage']
      ];

      // Add rejection reasons data
      const reasonsRows = reportData.reasons.map(reason => [
        reason.reason,
        reason.count,
        reason.percentage
      ]);

      // Add detailed rejections section
      const detailedSection = [
        [''],
        ['DETAILED REJECTED APPLICATIONS'],
        csvHeaders
      ];

      // Combine all sections
      const allRows = [...summaryRows, ...reasonsRows, ...detailedSection, ...csvRows];

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

      console.log('📄 RRU CSV content generated, length:', csvContent.length);

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
      link.setAttribute('download', `RRU_Rejection_Analysis_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log('✅ RRU file download triggered');

      toast({
        title: "Export Successful",
        description: `RRU rejection analysis exported with ${recentRejections.length} applications and summary statistics.`,
      });

    } catch (error) {
      console.error('❌ RRU export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export RRU rejection analysis. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Rejection Analysis</h2>
          <p className="text-muted-foreground">Analyze rejection patterns and trends</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="details">Detailed Analysis</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Rejections</CardTitle>
                <CardDescription>Last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{rejectionStatistics.totalRejections}</div>
                <p className="text-muted-foreground text-sm">Rejection Rate: {rejectionStatistics.rejectionRate}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Resumed Applications</CardTitle>
                <CardDescription>After review</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{rejectionStatistics.resumedApplications}</div>
                <p className="text-muted-foreground text-sm">Resume Rate: {rejectionStatistics.resumeRate}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Confirmed Rejections</CardTitle>
                <CardDescription>After review</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{rejectionStatistics.confirmedRejections}</div>
                <p className="text-muted-foreground text-sm">Pending Review: {rejectionStatistics.pendingReview}</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Rejection Reasons */}
          <Card>
            <CardHeader>
              <CardTitle>Rejection Reasons</CardTitle>
              <CardDescription>Top reasons for application rejection</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reason</TableHead>
                      <TableHead className="text-right">Count</TableHead>
                      <TableHead className="text-right">Percentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rejectionReasons.map((reason, index) => (
                      <TableRow key={index}>
                        <TableCell>{reason.reason}</TableCell>
                        <TableCell className="text-right">{reason.count}</TableCell>
                        <TableCell className="text-right">{reason.percentage}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          
          {/* Recent Rejections */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Rejections</CardTitle>
              <CardDescription>Latest rejected applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>LOS ID</TableHead>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Rejection Reason</TableHead>
                      <TableHead>Loan Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentRejections.map((rejection) => (
                      <TableRow key={rejection.id}>
                        <TableCell className="font-mono text-sm">{rejection.id}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{rejection.name}</div>
                            <div className="text-sm text-muted-foreground">{rejection.cnic}</div>
                          </div>
                        </TableCell>
                        <TableCell>{rejection.reason}</TableCell>
                        <TableCell>{rejection.loanType}</TableCell>
                        <TableCell>{rejection.amount}</TableCell>
                        <TableCell>{getStatusBadge(rejection.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4 mt-4">
          {/* Monthly Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Rejection Trends</CardTitle>
              <CardDescription>Rejection patterns over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center bg-muted/10 rounded-md border">
                <div className="text-center">
                  <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground mt-2">Bar chart visualization of monthly rejection trends</p>
                </div>
              </div>
              <div className="mt-4 rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead className="text-right">Total Rejections</TableHead>
                      <TableHead className="text-right">Resumed</TableHead>
                      <TableHead className="text-right">Confirmed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthlyRejectionTrends.map((trend) => (
                      <TableRow key={trend.month}>
                        <TableCell>{trend.month}</TableCell>
                        <TableCell className="text-right">{trend.total}</TableCell>
                        <TableCell className="text-right">{trend.resumed}</TableCell>
                        <TableCell className="text-right">{trend.confirmed}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          
          {/* Rejection by Department */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Rejection by Department</CardTitle>
                <CardDescription>Distribution across departments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center bg-muted/10 rounded-md border mb-4">
                  <div className="text-center">
                    <PieChart className="h-16 w-16 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground mt-2">Pie chart visualization of rejection by department</p>
                  </div>
                </div>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Department</TableHead>
                        <TableHead className="text-right">Count</TableHead>
                        <TableHead className="text-right">Percentage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rejectionByDepartment.map((dept) => (
                        <TableRow key={dept.department}>
                          <TableCell>{dept.department}</TableCell>
                          <TableCell className="text-right">{dept.count}</TableCell>
                          <TableCell className="text-right">{dept.percentage}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
            
            {/* Rejection by Loan Type */}
            <Card>
              <CardHeader>
                <CardTitle>Rejection by Loan Type</CardTitle>
                <CardDescription>Distribution across loan products</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center bg-muted/10 rounded-md border mb-4">
                  <div className="text-center">
                    <PieChart className="h-16 w-16 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground mt-2">Pie chart visualization of rejection by loan type</p>
                  </div>
                </div>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Loan Type</TableHead>
                        <TableHead className="text-right">Count</TableHead>
                        <TableHead className="text-right">Percentage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rejectionByLoanType.map((loan) => (
                        <TableRow key={loan.loanType}>
                          <TableCell>{loan.loanType}</TableCell>
                          <TableCell className="text-right">{loan.count}</TableCell>
                          <TableCell className="text-right">{loan.percentage}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Detailed Analysis Tab */}
        <TabsContent value="details" className="space-y-4 mt-4">
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
                <div className="w-full md:w-[180px]">
                  <label className="text-sm font-medium">Status</label>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="review">Under Review</SelectItem>
                      <SelectItem value="returned">Returned</SelectItem>
                      <SelectItem value="resumed">Resumed</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="md:self-end">
                  <Filter className="mr-2 h-4 w-4" />
                  Apply Filters
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Detailed Rejection Data */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Rejection Data</CardTitle>
              <CardDescription>Comprehensive view of all rejections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <div className="flex items-center">
                          LOS ID
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead>Applicant</TableHead>
                      <TableHead>
                        <div className="flex items-center">
                          Rejection Date
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead>Rejection Reason</TableHead>
                      <TableHead>Loan Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentRejections.map((rejection) => (
                      <TableRow key={rejection.id}>
                        <TableCell className="font-mono text-sm">{rejection.id}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{rejection.name}</div>
                            <div className="text-sm text-muted-foreground">{rejection.cnic}</div>
                          </div>
                        </TableCell>
                        <TableCell>{rejection.rejectionDate}</TableCell>
                        <TableCell>{rejection.reason}</TableCell>
                        <TableCell>{rejection.loanType}</TableCell>
                        <TableCell>{rejection.amount}</TableCell>
                        <TableCell>{getStatusBadge(rejection.status)}</TableCell>
                      </TableRow>
                    ))}
                    {/* Duplicate rows for demonstration */}
                    {recentRejections.map((rejection) => (
                      <TableRow key={`${rejection.id}-dup`}>
                        <TableCell className="font-mono text-sm">{rejection.id.replace("5", "4")}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{rejection.name}</div>
                            <div className="text-sm text-muted-foreground">{rejection.cnic}</div>
                          </div>
                        </TableCell>
                        <TableCell>{rejection.rejectionDate.replace("15", "14").replace("16", "15")}</TableCell>
                        <TableCell>{rejection.reason}</TableCell>
                        <TableCell>{rejection.loanType}</TableCell>
                        <TableCell>{rejection.amount}</TableCell>
                        <TableCell>{getStatusBadge(rejection.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing <strong>10</strong> of <strong>287</strong> results
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm">
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Export Options</CardTitle>
              <CardDescription>Download rejection data for further analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <Button variant="outline" className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Export as CSV
                </Button>
                <Button variant="outline" className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Export as Excel
                </Button>
                <Button variant="outline" className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Export as PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 