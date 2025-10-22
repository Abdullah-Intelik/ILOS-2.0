// /dashboard/spu/verified/page.tsx
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Filter, RefreshCw, CheckCircle, Calendar, Clock, Download, Eye, FileText, ArrowUpDown, ChevronDown, Printer } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

// Mock data for verified applications
const verifiedApplications = [
  {
    id: "UBL-2024-001220",
    applicant: "Muhammad Ali",
    loanType: "Auto Loan",
    amount: "PKR 1,500,000",
    submissionDate: "2024-06-10",
    verificationDate: "2024-06-15",
    verifiedBy: {
      name: "Fatima Ali",
      avatar: "/placeholder-user.jpg",
    },
    status: "verified",
    nextStep: "CIU Review",
    documents: 8,
    verifiedDocuments: 8,
    remarks: "All documents verified. No discrepancies found.",
  },
  {
    id: "UBL-2024-001221",
    applicant: "Ayesha Khan",
    loanType: "Home Loan",
    amount: "PKR 5,000,000",
    submissionDate: "2024-06-08",
    verificationDate: "2024-06-14",
    verifiedBy: {
      name: "Imran Shah",
      avatar: "/placeholder-user.jpg",
    },
    status: "verified_with_conditions",
    nextStep: "Additional Verification",
    documents: 10,
    verifiedDocuments: 9,
    remarks: "Income verification requires additional check. Property documents verified.",
  },
  {
    id: "UBL-2024-001222",
    applicant: "Ahmed Hassan",
    loanType: "Personal Loan",
    amount: "PKR 800,000",
    submissionDate: "2024-06-07",
    verificationDate: "2024-06-13",
    verifiedBy: {
      name: "Sana Khan",
      avatar: "/placeholder-user.jpg",
    },
    status: "verified",
    nextStep: "CIU Review",
    documents: 6,
    verifiedDocuments: 6,
    remarks: "All documents verified. Employment verification completed.",
  },
  {
    id: "UBL-2024-001223",
    applicant: "Fatima Ahmed",
    loanType: "Business Loan",
    amount: "PKR 3,000,000",
    submissionDate: "2024-06-05",
    verificationDate: "2024-06-12",
    verifiedBy: {
      name: "Fatima Ali",
      avatar: "/placeholder-user.jpg",
    },
    status: "verified_with_conditions",
    nextStep: "Risk Assessment",
    documents: 12,
    verifiedDocuments: 10,
    remarks: "Business registration verified. Financial statements require further review by risk department.",
  },
  {
    id: "UBL-2024-001224",
    applicant: "Zain Malik",
    loanType: "Auto Loan",
    amount: "PKR 1,200,000",
    submissionDate: "2024-06-04",
    verificationDate: "2024-06-11",
    verifiedBy: {
      name: "Imran Shah",
      avatar: "/placeholder-user.jpg",
    },
    status: "verified",
    nextStep: "CIU Review",
    documents: 7,
    verifiedDocuments: 7,
    remarks: "All documents verified. Vehicle inspection completed.",
  },
]

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case "verified":
      return <Badge className="bg-green-100 text-green-800 border-green-200">Verified</Badge>
    case "verified_with_conditions":
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Verified with Conditions</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function SPUVerifiedPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterLoanType, setFilterLoanType] = useState("all")
  const [sortBy, setSortBy] = useState("verificationDate")
  const [sortOrder, setSortOrder] = useState("desc")
  const [selectedApplication, setSelectedApplication] = useState<any>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  
  // Filter and sort applications
  const filteredApplications = verifiedApplications.filter(app => {
    const matchesSearch = 
      app.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      app.applicant.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === "all" || app.status === filterStatus
    const matchesLoanType = filterLoanType === "all" || app.loanType === filterLoanType
    
    return matchesSearch && matchesStatus && matchesLoanType
  }).sort((a, b) => {
    if (sortOrder === "asc") {
      return a[sortBy as keyof typeof a] > b[sortBy as keyof typeof b] ? 1 : -1
    } else {
      return a[sortBy as keyof typeof a] < b[sortBy as keyof typeof b] ? 1 : -1
    }
  })
  
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("desc")
    }
  }
  
  const handleViewDetails = (app: any) => {
    setSelectedApplication(app)
    setIsDetailsDialogOpen(true)
  }
  
  // Calculate statistics
  const totalVerified = verifiedApplications.filter(app => app.status === "verified").length
  const totalVerifiedWithConditions = verifiedApplications.filter(app => app.status === "verified_with_conditions").length
  const totalDocumentsVerified = verifiedApplications.reduce((total, app) => total + app.verifiedDocuments, 0)
  
  // Get unique loan types
  const uniqueLoanTypes = Array.from(new Set(verifiedApplications.map(app => app.loanType)))

  // Export functionality for SPU verified applications
  const handleExport = () => {
    try {
      console.log('🔄 Starting SPU verified applications export process...');
      
      // Create comprehensive report data
      const reportData = {
        summary: {
          totalVerified: totalVerified,
          totalVerifiedWithConditions: totalVerifiedWithConditions,
          totalDocumentsVerified: totalDocumentsVerified,
          exportDate: new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }),
          department: 'Strategic Planning Unit (SPU)'
        },
        applications: verifiedApplications.map(app => ({
          applicationId: app.id,
          applicantName: app.applicant || 'N/A',
          loanType: app.loanType || 'N/A',
          amount: app.amount || 'N/A',
          status: app.status || 'Unknown',
          verificationDate: app.verificationDate || 'N/A',
          verifiedDocuments: app.verifiedDocuments || 0,
          totalDocuments: app.totalDocuments || 0,
          verificationNotes: app.verificationNotes || 'N/A',
          assignedTo: app.assignedTo || 'N/A',
          processingTime: app.processingTime || 'N/A'
        }))
      };

      console.log('📊 SPU report data prepared:', reportData);

      // Create CSV content
      const csvHeaders = [
        'Application ID',
        'Applicant Name',
        'Loan Type',
        'Amount',
        'Status',
        'Verification Date',
        'Verified Documents',
        'Total Documents',
        'Verification Notes',
        'Assigned To',
        'Processing Time'
      ];

      const csvRows = reportData.applications.map(app => [
        app.applicationId,
        app.applicantName,
        app.loanType,
        app.amount,
        app.status,
        app.verificationDate,
        app.verifiedDocuments,
        app.totalDocuments,
        app.verificationNotes,
        app.assignedTo,
        app.processingTime
      ]);

      // Add summary section
      const summaryRows = [
        [''],
        ['SUMMARY REPORT'],
        ['Department', reportData.summary.department],
        ['Export Date', reportData.summary.exportDate],
        ['Total Verified', reportData.summary.totalVerified],
        ['Verified with Conditions', reportData.summary.totalVerifiedWithConditions],
        ['Total Documents Verified', reportData.summary.totalDocumentsVerified],
        [''],
        ['DETAILED VERIFIED APPLICATIONS'],
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

      console.log('📄 SPU CSV content generated, length:', csvContent.length);

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
      link.setAttribute('download', `SPU_Verified_Applications_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log('✅ SPU file download triggered');

      toast({
        title: "Export Successful",
        description: `SPU verified applications exported with ${verifiedApplications.length} applications and summary statistics.`,
      });

    } catch (error) {
      console.error('❌ SPU export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export SPU verified applications. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Verified Applications</h1>
          <p className="text-muted-foreground">Applications that have completed the verification process</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Print Report
          </Button>
        </div>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Fully Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalVerified}</div>
            <p className="text-xs text-muted-foreground">Applications ready for next step</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Verified with Conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{totalVerifiedWithConditions}</div>
            <p className="text-xs text-muted-foreground">Requiring additional review</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Documents Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDocumentsVerified}</div>
            <p className="text-xs text-muted-foreground">Across all applications</p>
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
        
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full md:w-[200px]">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <SelectValue placeholder="Filter by status" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="verified_with_conditions">Verified with Conditions</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={filterLoanType} onValueChange={setFilterLoanType}>
          <SelectTrigger className="w-full md:w-[180px]">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <SelectValue placeholder="Filter by loan type" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Loan Types</SelectItem>
            {uniqueLoanTypes.map((type) => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button variant="outline" size="icon">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Verified Applications</CardTitle>
          <CardDescription>Applications that have completed the verification process</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>LOS ID</TableHead>
                <TableHead>Applicant</TableHead>
                <TableHead>Loan Type</TableHead>
                <TableHead>
                  <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort("verificationDate")}>
                    Verification Date
                    {sortBy === "verificationDate" && (
                      <ArrowUpDown className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead>Verified By</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Next Step</TableHead>
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
                  <TableRow key={app.id} className={app.status === "verified_with_conditions" ? "bg-yellow-50" : ""}>
                    <TableCell className="font-mono">{app.id}</TableCell>
                    <TableCell>{app.applicant}</TableCell>
                    <TableCell>{app.loanType}</TableCell>
                    <TableCell className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {app.verificationDate}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={app.verifiedBy.avatar} alt={app.verifiedBy.name} />
                          <AvatarFallback>{app.verifiedBy.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{app.verifiedBy.name}</span>
                      </div>
                    </TableCell>
                    <TableCell><StatusBadge status={app.status} /></TableCell>
                    <TableCell>{app.nextStep}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(app)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Details
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {filteredApplications.length} of {verifiedApplications.length} verified applications
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
              1
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      {/* Application Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Verification Details</DialogTitle>
            <DialogDescription>
              {selectedApplication && (
                <>Application {selectedApplication.id} - {selectedApplication.applicant}</>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Loan Details</h3>
                  <p className="font-medium mt-1">{selectedApplication.loanType}</p>
                  <p>{selectedApplication.amount}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Verification</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={selectedApplication.status} />
                  </div>
                  <p className="text-sm mt-1">
                    Verified on {selectedApplication.verificationDate}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Next Step</h3>
                  <p className="font-medium mt-1">{selectedApplication.nextStep}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Verification Summary</h3>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="font-medium">Verified by</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={selectedApplication.verifiedBy.avatar} alt={selectedApplication.verifiedBy.name} />
                            <AvatarFallback>{selectedApplication.verifiedBy.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>{selectedApplication.verifiedBy.name}</span>
                        </div>
                      </div>
                      <div>
                        <p className="font-medium">Documents</p>
                        <p className="text-right">
                          <span className="font-medium text-green-600">{selectedApplication.verifiedDocuments}</span>
                          <span className="text-muted-foreground">/{selectedApplication.documents} verified</span>
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="font-medium mb-1">Remarks</p>
                      <p className="text-sm bg-muted p-3 rounded-md">{selectedApplication.remarks}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Document Verification Details</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Verified On</TableHead>
                      <TableHead>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Mock document details - in a real app, this would be actual document data */}
                    <TableRow>
                      <TableCell className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        CNIC Copy
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-700">Verified</Badge>
                      </TableCell>
                      <TableCell>{selectedApplication.verificationDate}</TableCell>
                      <TableCell>Valid document</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        Income Proof
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-700">Verified</Badge>
                      </TableCell>
                      <TableCell>{selectedApplication.verificationDate}</TableCell>
                      <TableCell>Salary slip verified with employer</TableCell>
                    </TableRow>
                    {selectedApplication.status === "verified_with_conditions" && (
                      <TableRow className="bg-yellow-50">
                        <TableCell className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          Financial Statements
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-yellow-100 text-yellow-700">Conditional</Badge>
                        </TableCell>
                        <TableCell>{selectedApplication.verificationDate}</TableCell>
                        <TableCell>Requires additional review by risk department</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
                  Close
                </Button>
                <Button variant="outline">
                  <Printer className="mr-2 h-4 w-4" />
                  Print Report
                </Button>
                <Button>
                  <Download className="mr-2 h-4 w-4" />
                  Export Details
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
