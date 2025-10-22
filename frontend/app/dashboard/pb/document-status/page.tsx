"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { FileText, Upload, AlertTriangle, Search, Filter, RefreshCw, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"

const applications = [
  {
    id: "UBL-2024-001240",
    applicant: "Ali Raza",
    loanType: "Auto Loan",
    amount: "PKR 1,200,000",
    submissionDate: "2024-06-15",
    status: "in-progress",
    progress: 67,
    documents: [
      { name: "CNIC Copy", status: "verified", uploadDate: "2024-06-10", verifiedDate: "2024-06-12", remarks: "Valid document" },
      { name: "Bank Statement", status: "pending", uploadDate: "2024-06-10", verifiedDate: null, remarks: null },
      { name: "Salary Slip", status: "missing", uploadDate: null, verifiedDate: null, remarks: "Required document not uploaded" },
      { name: "Employment Letter", status: "verified", uploadDate: "2024-06-10", verifiedDate: "2024-06-12", remarks: "Valid document" },
      { name: "Utility Bill", status: "rejected", uploadDate: "2024-06-10", verifiedDate: "2024-06-12", remarks: "Document expired" },
      { name: "Loan Application Form", status: "verified", uploadDate: "2024-06-10", verifiedDate: "2024-06-12", remarks: "Valid document" },
    ],
  },
  {
    id: "UBL-2024-001241",
    applicant: "Sana Khan",
    loanType: "Home Loan",
    amount: "PKR 5,000,000",
    submissionDate: "2024-06-18",
    status: "in-progress",
    progress: 50,
    documents: [
      { name: "CNIC Copy", status: "verified", uploadDate: "2024-06-18", verifiedDate: "2024-06-19", remarks: "Valid document" },
      { name: "Income Certificate", status: "rejected", uploadDate: "2024-06-18", verifiedDate: "2024-06-19", remarks: "Income does not match declared amount" },
      { name: "Property Documents", status: "pending", uploadDate: "2024-06-18", verifiedDate: null, remarks: null },
      { name: "Bank Statement", status: "pending", uploadDate: "2024-06-18", verifiedDate: null, remarks: null },
      { name: "Tax Returns", status: "missing", uploadDate: null, verifiedDate: null, remarks: "Required document not uploaded" },
      { name: "Loan Application Form", status: "verified", uploadDate: "2024-06-18", verifiedDate: "2024-06-19", remarks: "Valid document" },
    ],
  },
  {
    id: "UBL-2024-001242",
    applicant: "Muhammad Tariq",
    loanType: "Personal Loan",
    amount: "PKR 800,000",
    submissionDate: "2024-06-20",
    status: "in-progress",
    progress: 83,
    documents: [
      { name: "CNIC Copy", status: "verified", uploadDate: "2024-06-20", verifiedDate: "2024-06-21", remarks: "Valid document" },
      { name: "Salary Slip", status: "verified", uploadDate: "2024-06-20", verifiedDate: "2024-06-21", remarks: "Valid document" },
      { name: "Bank Statement", status: "verified", uploadDate: "2024-06-20", verifiedDate: "2024-06-21", remarks: "Valid document" },
      { name: "Employment Letter", status: "verified", uploadDate: "2024-06-20", verifiedDate: "2024-06-21", remarks: "Valid document" },
      { name: "Utility Bill", status: "pending", uploadDate: "2024-06-20", verifiedDate: null, remarks: null },
      { name: "Loan Application Form", status: "verified", uploadDate: "2024-06-20", verifiedDate: "2024-06-21", remarks: "Valid document" },
    ],
  },
]

const getStatusBadge = (status: string) => {
  switch (status) {
    case "verified":
      return <Badge className="bg-green-100 text-green-700">Verified</Badge>
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
    case "missing":
      return <Badge variant="destructive">Missing</Badge>
    case "rejected":
      return <Badge className="bg-red-100 text-red-700">Rejected</Badge>
    default:
      return <Badge>{status}</Badge>
  }
}

export default function DocumentStatusPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedApplication, setSelectedApplication] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  // Filter applications based on search term
  const filteredApplications = applications.filter(app => 
    app.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    app.applicant.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  const handleViewDetails = (app: any) => {
    setSelectedApplication(app)
    setIsDialogOpen(true)
  }
  
  // Calculate document statistics for an application
  const getDocumentStats = (app: any) => {
    const total = app.documents.length
    const verified = app.documents.filter(doc => doc.status === "verified").length
    const pending = app.documents.filter(doc => doc.status === "pending").length
    const rejected = app.documents.filter(doc => doc.status === "rejected").length
    const missing = app.documents.filter(doc => doc.status === "missing").length
    
    return { total, verified, pending, rejected, missing }
  }
  
  // Filter documents based on status filter
  const filterDocuments = (documents: any[], status: string) => {
    if (status === "all") return documents
    return documents.filter(doc => doc.status === status)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Document Status</h1>
          <p className="text-muted-foreground">Track the verification status of your submitted documents</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by ID or name"
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all" onClick={() => setFilterStatus("all")}>All Documents</TabsTrigger>
          <TabsTrigger value="verified" onClick={() => setFilterStatus("verified")}>Verified</TabsTrigger>
          <TabsTrigger value="pending" onClick={() => setFilterStatus("pending")}>Pending</TabsTrigger>
          <TabsTrigger value="rejected" onClick={() => setFilterStatus("rejected")}>Rejected</TabsTrigger>
          <TabsTrigger value="missing" onClick={() => setFilterStatus("missing")}>Missing</TabsTrigger>
        </TabsList>
      </Tabs>

      {filteredApplications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-xl font-medium mb-2">No applications found</p>
            <p className="text-muted-foreground">Try adjusting your search criteria</p>
          </CardContent>
        </Card>
      ) : (
        filteredApplications.map((app) => {
          const stats = getDocumentStats(app)
          
          return (
            <Card key={app.id} className="overflow-hidden">
              <CardHeader className="bg-muted/20">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <span>{app.applicant}</span>
                      <span className="text-sm font-mono text-muted-foreground">({app.id})</span>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {app.loanType} - {app.amount} - Submitted on {app.submissionDate}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 mt-2 md:mt-0">
                    <div className="text-sm">
                      <span className="font-medium">{stats.verified}</span>
                      <span className="text-muted-foreground">/{stats.total} verified</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleViewDetails(app)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View All
                    </Button>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Document Verification Progress</span>
                    <span>{app.progress}%</span>
                  </div>
                  <Progress value={app.progress} className="h-2" />
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Upload Date</TableHead>
                      <TableHead>Verification Date</TableHead>
                      <TableHead>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filterDocuments(app.documents, filterStatus).slice(0, 3).map((doc, i) => (
                      <TableRow key={i}>
                        <TableCell className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          {doc.name}
                        </TableCell>
                        <TableCell>{getStatusBadge(doc.status)}</TableCell>
                        <TableCell>{doc.uploadDate || "-"}</TableCell>
                        <TableCell>{doc.verifiedDate || "-"}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{doc.remarks || "-"}</TableCell>
                      </TableRow>
                    ))}
                    
                    {filterDocuments(app.documents, filterStatus).length > 3 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-2">
                          <Button variant="ghost" size="sm" onClick={() => handleViewDetails(app)}>
                            View {filterDocuments(app.documents, filterStatus).length - 3} more documents
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}
                    
                    {filterDocuments(app.documents, filterStatus).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                          No {filterStatus} documents found for this application
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
              {stats.missing > 0 && (
                <CardFooter className="bg-amber-50 border-t border-amber-100 px-6 py-3">
                  <div className="flex items-center gap-2 text-amber-700">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm">
                      {stats.missing} required document{stats.missing > 1 ? 's are' : ' is'} missing. Please upload to proceed.
                    </span>
                    <Button variant="outline" size="sm" className="ml-auto border-amber-200 hover:bg-amber-100">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Missing
                    </Button>
                  </div>
                </CardFooter>
              )}
            </Card>
          )
        })
      )}
      
      {/* Document Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Document Verification Details</DialogTitle>
            <DialogDescription>
              {selectedApplication && (
                <>Application {selectedApplication.id} - {selectedApplication.applicant}</>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Loan Type</h3>
                  <p>{selectedApplication.loanType}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Amount</h3>
                  <p>{selectedApplication.amount}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Submission Date</h3>
                  <p>{selectedApplication.submissionDate}</p>
                </div>
              </div>
              
              <Tabs defaultValue="all">
                <TabsList>
                  <TabsTrigger value="all">All Documents</TabsTrigger>
                  <TabsTrigger value="verified">Verified</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected</TabsTrigger>
                  <TabsTrigger value="missing">Missing</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Document</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Upload Date</TableHead>
                        <TableHead>Verification Date</TableHead>
                        <TableHead>Remarks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedApplication.documents.map((doc, i) => (
                        <TableRow key={i}>
                          <TableCell className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-500" />
                            {doc.name}
                          </TableCell>
                          <TableCell>{getStatusBadge(doc.status)}</TableCell>
                          <TableCell>{doc.uploadDate || "-"}</TableCell>
                          <TableCell>{doc.verifiedDate || "-"}</TableCell>
                          <TableCell>{doc.remarks || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
                
                <TabsContent value="verified" className="mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Document</TableHead>
                        <TableHead>Upload Date</TableHead>
                        <TableHead>Verification Date</TableHead>
                        <TableHead>Remarks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedApplication.documents.filter(doc => doc.status === "verified").map((doc, i) => (
                        <TableRow key={i}>
                          <TableCell className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-500" />
                            {doc.name}
                          </TableCell>
                          <TableCell>{doc.uploadDate}</TableCell>
                          <TableCell>{doc.verifiedDate}</TableCell>
                          <TableCell>{doc.remarks}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
                
                <TabsContent value="pending" className="mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Document</TableHead>
                        <TableHead>Upload Date</TableHead>
                        <TableHead>Estimated Completion</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedApplication.documents.filter(doc => doc.status === "pending").map((doc, i) => (
                        <TableRow key={i}>
                          <TableCell className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-500" />
                            {doc.name}
                          </TableCell>
                          <TableCell>{doc.uploadDate}</TableCell>
                          <TableCell>1-2 business days</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
                
                <TabsContent value="rejected" className="mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Document</TableHead>
                        <TableHead>Upload Date</TableHead>
                        <TableHead>Verification Date</TableHead>
                        <TableHead>Rejection Reason</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedApplication.documents.filter(doc => doc.status === "rejected").map((doc, i) => (
                        <TableRow key={i}>
                          <TableCell className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-500" />
                            {doc.name}
                          </TableCell>
                          <TableCell>{doc.uploadDate}</TableCell>
                          <TableCell>{doc.verifiedDate}</TableCell>
                          <TableCell>{doc.remarks}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              <Upload className="mr-2 h-4 w-4" />
                              Re-upload
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
                
                <TabsContent value="missing" className="mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Document</TableHead>
                        <TableHead>Requirement</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedApplication.documents.filter(doc => doc.status === "missing").map((doc, i) => (
                        <TableRow key={i}>
                          <TableCell className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-500" />
                            {doc.name}
                          </TableCell>
                          <TableCell>{doc.remarks}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              <Upload className="mr-2 h-4 w-4" />
                              Upload Now
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline">
                  Contact Support
                </Button>
                <Button>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Documents
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
