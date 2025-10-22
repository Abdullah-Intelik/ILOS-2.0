"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Filter, 
  Download, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  MapPin, 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  Eye,
  FileText,
  Clock,
  User
} from "lucide-react";

// Mock data for field reports
const fieldReportsData = [
  {
    id: "FR-2024-001",
    applicationId: "UBL-2024-001236",
    applicantName: "Hassan Raza",
    agentName: "Sara Ahmed",
    visitDate: "2024-01-12",
    reportDate: "2024-01-13",
    status: "verified",
    locationVerified: true,
    businessVerified: true,
    photosCount: 3,
    comments: "Business premises verified. Operational with 15 employees present.",
    area: "Karachi South",
    loanType: "Business Loan",
    amount: "PKR 5,000,000",
  },
  {
    id: "FR-2024-002",
    applicationId: "UBL-2024-001241",
    applicantName: "Ayesha Malik",
    agentName: "Bilal Khan",
    visitDate: "2024-01-13",
    reportDate: "2024-01-14",
    status: "verified",
    locationVerified: true,
    businessVerified: false,
    photosCount: 2,
    comments: "Residential address verified. Applicant is a salaried employee.",
    area: "Karachi Central",
    loanType: "Personal Loan",
    amount: "PKR 1,500,000",
  },
  {
    id: "FR-2024-003",
    applicationId: "UBL-2024-001242",
    applicantName: "Kamran Ali",
    agentName: "Usman Ali",
    visitDate: "2024-01-14",
    reportDate: "2024-01-15",
    status: "flagged",
    locationVerified: true,
    businessVerified: false,
    photosCount: 3,
    comments: "Vehicle inspection completed. Some discrepancies found in documentation.",
    area: "Karachi East",
    loanType: "Auto Loan",
    amount: "PKR 2,200,000",
  },
  {
    id: "FR-2024-004",
    applicationId: "UBL-2024-001243",
    applicantName: "Fatima Zahra",
    agentName: "Sara Ahmed",
    visitDate: "2024-01-15",
    reportDate: "2024-01-16",
    status: "verified",
    locationVerified: true,
    businessVerified: true,
    photosCount: 4,
    comments: "Business verification successful. All documents verified on site.",
    area: "Karachi South",
    loanType: "Business Loan",
    amount: "PKR 3,800,000",
  },
];

// Performance metrics
const performanceMetrics = {
  totalReports: 156,
  verifiedReports: 142,
  flaggedReports: 14,
  successRate: 91.0,
  avgProcessingTime: 2.3,
  topPerformingAgent: "Sara Ahmed",
  mostActiveArea: "Karachi South",
  monthlyGrowth: 12.5,
};

function getStatusBadge(status: string) {
  switch (status) {
    case "verified":
      return <Badge className="bg-green-100 text-green-800">Verified</Badge>
    case "flagged":
      return <Badge className="bg-red-100 text-red-800">Flagged</Badge>
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

function getVerificationBadge(verified: boolean) {
  return verified ? (
    <CheckCircle className="h-4 w-4 text-green-600" />
  ) : (
    <AlertTriangle className="h-4 w-4 text-red-600" />
  );
}

const FieldReports = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [applicationsData, setApplicationsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch applications from backend - same as main EAMVU dashboard
  const fetchApplications = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔄 EAMVU Reports: Starting to fetch applications...')
      
      const response = await fetch('/api/applications/department/EAMVU', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        cache: 'no-store'
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch applications')
      }
      
      const data = await response.json()
      console.log('✅ EAMVU Reports: Fetched', data.length, 'applications')
      
      setApplicationsData(data)
    } catch (err) {
      console.error('❌ EAMVU Reports: Error fetching applications:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch applications')
      toast({
        title: "Error",
        description: "Failed to fetch applications. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Load applications on component mount
  useEffect(() => {
    fetchApplications()
  }, [])

  // Export functionality for EAMVU reports
  const handleExport = () => {
    try {
      console.log('🔄 Starting EAMVU reports export process...');
      
      // Create comprehensive report data
      const reportData = {
        summary: {
          totalReports: performanceMetrics.totalReports,
          verifiedReports: performanceMetrics.verifiedReports,
          pendingReports: performanceMetrics.pendingReports,
          flaggedReports: performanceMetrics.flaggedReports,
          avgProcessingTime: performanceMetrics.avgProcessingTime,
          exportDate: new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }),
          department: 'External Asset Management (EAMVU)'
        },
        reports: fieldReportsFromApplications.map(report => ({
          reportId: report.id,
          applicationId: report.applicationId,
          applicantName: report.applicantName || 'N/A',
          agentName: report.agentName || 'N/A',
          visitDate: report.visitDate || 'N/A',
          reportDate: report.reportDate || 'N/A',
          status: report.status || 'Unknown',
          locationVerified: report.locationVerified ? 'Yes' : 'No',
          businessVerified: report.businessVerified ? 'Yes' : 'No',
          photosCount: report.photosCount || 0,
          comments: report.comments || 'N/A',
          area: report.area || 'N/A',
          loanType: report.loanType || 'N/A',
          amount: report.amount || 'N/A'
        }))
      };

      console.log('📊 EAMVU report data prepared:', reportData);

      // Create CSV content
      const csvHeaders = [
        'Report ID',
        'Application ID',
        'Applicant Name',
        'Agent Name',
        'Visit Date',
        'Report Date',
        'Status',
        'Location Verified',
        'Business Verified',
        'Photos Count',
        'Comments',
        'Area',
        'Loan Type',
        'Amount'
      ];

      const csvRows = reportData.reports.map(report => [
        report.reportId,
        report.applicationId,
        report.applicantName,
        report.agentName,
        report.visitDate,
        report.reportDate,
        report.status,
        report.locationVerified,
        report.businessVerified,
        report.photosCount,
        report.comments,
        report.area,
        report.loanType,
        report.amount
      ]);

      // Add summary section
      const summaryRows = [
        [''],
        ['SUMMARY REPORT'],
        ['Department', reportData.summary.department],
        ['Export Date', reportData.summary.exportDate],
        ['Total Reports', reportData.summary.totalReports],
        ['Verified Reports', reportData.summary.verifiedReports],
        ['Pending Reports', reportData.summary.pendingReports],
        ['Flagged Reports', reportData.summary.flaggedReports],
        ['Average Processing Time', `${reportData.summary.avgProcessingTime} days`],
        [''],
        ['DETAILED FIELD REPORTS'],
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

      console.log('📄 EAMVU CSV content generated, length:', csvContent.length);

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
      link.setAttribute('download', `EAMVU_Field_Reports_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log('✅ EAMVU file download triggered');

      toast({
        title: "Export Successful",
        description: `EAMVU field reports exported with ${fieldReportsFromApplications.length} reports and summary statistics.`,
      });

    } catch (error) {
      console.error('❌ EAMVU export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export EAMVU reports. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Transform real applications data for reports view
  const fieldReportsFromApplications = applicationsData.map((app, index) => ({
    id: `FR-2024-${String(index + 1).padStart(3, '0')}`,
    applicationId: app.los_id || `APP-${app.id}`,
    applicantName: app.applicant_name,
    agentName: "EAMVU Agent", // Default agent name
    visitDate: new Date(app.created_at).toISOString().split('T')[0],
    reportDate: new Date(app.created_at).toISOString().split('T')[0],
    status: app.status === 'SUBMITTED_TO_CIU' ? 'verified' : app.status === 'ASSIGNED_TO_EAMVU_OFFICER' ? 'pending' : 'in_review',
    locationVerified: app.status === 'SUBMITTED_TO_CIU',
    businessVerified: app.status === 'SUBMITTED_TO_CIU',
    photosCount: 3, // Default photos count
    comments: `Field report for ${app.loan_type} application. Status: ${app.status}`,
    area: app.branch || "Not specified",
    loanType: app.loan_type,
    amount: `PKR ${app.loan_amount ? app.loan_amount.toLocaleString() : '0'}`
  }));

  const filteredReports = fieldReportsFromApplications.filter((report) => {
    const matchesSearch = 
      report.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.applicationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.agentName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate performance metrics from real data
  const performanceMetrics = {
    totalReports: fieldReportsFromApplications.length,
    verifiedReports: fieldReportsFromApplications.filter(report => report.status === 'verified').length,
    pendingReports: fieldReportsFromApplications.filter(report => report.status === 'pending').length,
    avgProcessingTime: 3.2, // Default value, can be calculated from real data
    flaggedReports: fieldReportsFromApplications.filter(report => report.status === 'in_review').length
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Field Reports</h2>
            <p className="text-muted-foreground">Comprehensive field verification reports and analytics</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading field reports...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Field Reports</h2>
            <p className="text-muted-foreground">Comprehensive field verification reports and analytics</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-red-500" />
            <p className="text-red-600 mb-2">Error loading field reports</p>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchApplications} variant="outline">
              <Clock className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Field Reports</h2>
          <p className="text-muted-foreground">Comprehensive field verification reports and analytics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchApplications} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export Reports
          </Button>
          <Button>
            <BarChart3 className="mr-2 h-4 w-4" />
            Generate Analytics
          </Button>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceMetrics.totalReports}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +{performanceMetrics.monthlyGrowth}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceMetrics.successRate}%</div>
            <p className="text-xs text-muted-foreground">
              {performanceMetrics.verifiedReports} verified out of {performanceMetrics.totalReports}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Processing Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceMetrics.avgProcessingTime} days</div>
            <p className="text-xs text-muted-foreground">
              <TrendingDown className="inline h-3 w-3 mr-1" />
              -0.5 days from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Reports</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceMetrics.flaggedReports}</div>
            <p className="text-xs text-muted-foreground">
              {((performanceMetrics.flaggedReports / performanceMetrics.totalReports) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reports">Field Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Label className="text-sm font-medium">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by applicant, LOS ID, or agent..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <div className="w-48">
                  <Label className="text-sm font-medium">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="flagged">Flagged</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
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

          {/* Reports Table */}
          <Card>
            <CardHeader>
              <CardTitle>Field Reports ({filteredReports.length})</CardTitle>
              <CardDescription>Detailed field verification reports</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report ID</TableHead>
                    <TableHead>Application</TableHead>
                    <TableHead>Agent</TableHead>
                    <TableHead>Visit Date</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-mono text-sm">{report.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{report.applicantName}</div>
                          <div className="text-sm text-muted-foreground">{report.applicationId}</div>
                          <div className="text-xs text-muted-foreground">{report.loanType}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {report.agentName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {report.visitDate}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getVerificationBadge(report.locationVerified)}
                      </TableCell>
                      <TableCell>
                        {getVerificationBadge(report.businessVerified)}
                      </TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedReport(report)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>Field Report - {selectedReport?.id}</DialogTitle>
                              <DialogDescription>
                                Detailed field verification report for {selectedReport?.applicantName}
                              </DialogDescription>
                            </DialogHeader>

                            {selectedReport && (
                              <div className="space-y-6">
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">Application Information</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="text-sm font-medium">Applicant Name</Label>
                                        <p className="text-sm">{selectedReport.applicantName}</p>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium">Application ID</Label>
                                        <p className="text-sm font-mono">{selectedReport.applicationId}</p>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium">Loan Type</Label>
                                        <p className="text-sm">{selectedReport.loanType}</p>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium">Amount</Label>
                                        <p className="text-sm">{selectedReport.amount}</p>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium">Area</Label>
                                        <p className="text-sm flex items-center gap-1">
                                          <MapPin className="h-3 w-3" />
                                          {selectedReport.area}
                                        </p>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium">Status</Label>
                                        <div className="mt-1">{getStatusBadge(selectedReport.status)}</div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>

                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">Visit Details</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="text-sm font-medium">Field Agent</Label>
                                        <p className="text-sm flex items-center gap-1">
                                          <User className="h-3 w-3" />
                                          {selectedReport.agentName}
                                        </p>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium">Visit Date</Label>
                                        <p className="text-sm flex items-center gap-1">
                                          <Calendar className="h-3 w-3" />
                                          {selectedReport.visitDate}
                                        </p>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium">Report Date</Label>
                                        <p className="text-sm flex items-center gap-1">
                                          <Calendar className="h-3 w-3" />
                                          {selectedReport.reportDate}
                                        </p>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium">Photos Taken</Label>
                                        <p className="text-sm">{selectedReport.photosCount} photos</p>
                                      </div>
                                      <div className="col-span-2">
                                        <Label className="text-sm font-medium">Comments</Label>
                                        <p className="text-sm">{selectedReport.comments}</p>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>

                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">Verification Results</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="flex items-center gap-2">
                                        <Label className="text-sm font-medium">Location Verified:</Label>
                                        {getVerificationBadge(selectedReport.locationVerified)}
                                        <span className="text-sm">
                                          {selectedReport.locationVerified ? "Yes" : "No"}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Label className="text-sm font-medium">Business Verified:</Label>
                                        {getVerificationBadge(selectedReport.businessVerified)}
                                        <span className="text-sm">
                                          {selectedReport.businessVerified ? "Yes" : "No"}
                                        </span>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
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

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Agent Performance</CardTitle>
                <CardDescription>Top performing field agents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium">Sara Ahmed</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">95%</div>
                      <div className="text-sm text-muted-foreground">Success Rate</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium">Bilal Khan</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">88%</div>
                      <div className="text-sm text-muted-foreground">Success Rate</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium">Usman Ali</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">82%</div>
                      <div className="text-sm text-muted-foreground">Success Rate</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Area Performance</CardTitle>
                <CardDescription>Verification success by area</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span className="font-medium">Karachi South</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">94%</div>
                      <div className="text-sm text-muted-foreground">Success Rate</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span className="font-medium">Karachi Central</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">89%</div>
                      <div className="text-sm text-muted-foreground">Success Rate</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span className="font-medium">Karachi East</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">85%</div>
                      <div className="text-sm text-muted-foreground">Success Rate</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Key performance indicators for field verification</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{performanceMetrics.successRate}%</div>
                  <div className="text-sm text-muted-foreground">Overall Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{performanceMetrics.avgProcessingTime}</div>
                  <div className="text-sm text-muted-foreground">Average Days per Visit</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{performanceMetrics.topPerformingAgent}</div>
                  <div className="text-sm text-muted-foreground">Top Performing Agent</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FieldReports; 