"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, CheckCircle, Search, FileText, Eye, ArrowRight, AlertTriangle, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Mock data for NADRA verification applications
const nadraApplications = [
  {
    id: "UBL-2024-001275",
    name: "Nasir Mahmood",
    cnic: "42101-1234567-8",
    status: "pending",
    priority: "High",
    submittedDate: "2024-01-15",
    loanType: "Personal Loan",
    amount: "PKR 3,800,000",
  },
  {
    id: "UBL-2024-001277",
    name: "Khalid Mehmood",
    cnic: "42101-3456789-0",
    status: "in_progress",
    priority: "High",
    submittedDate: "2024-01-14",
    loanType: "Home Loan",
    amount: "PKR 5,200,000",
  },
  {
    id: "UBL-2024-001280",
    name: "Zainab Malik",
    cnic: "42101-6789012-3",
    status: "pending",
    priority: "High",
    submittedDate: "2024-01-13",
    loanType: "Personal Loan",
    amount: "PKR 3,200,000",
  },
  {
    id: "UBL-2024-001285",
    name: "Farhan Ahmed",
    cnic: "42101-7890123-4",
    status: "completed",
    priority: "Medium",
    submittedDate: "2024-01-12",
    loanType: "Auto Loan",
    amount: "PKR 2,100,000",
    verificationResult: "verified",
  },
  {
    id: "UBL-2024-001290",
    name: "Saima Khan",
    cnic: "42101-8901234-5",
    status: "completed",
    priority: "Medium",
    submittedDate: "2024-01-11",
    loanType: "Personal Loan",
    amount: "PKR 1,500,000",
    verificationResult: "discrepancy",
  },
]

// NADRA verification checklist
const nadraChecklist = [
  { id: "name_match", label: "Name Matches with CNIC", checked: false },
  { id: "cnic_valid", label: "CNIC is Valid & Active", checked: false },
  { id: "photo_match", label: "Photo Matches with Applicant", checked: false },
  { id: "address_match", label: "Address Matches with Application", checked: false },
  { id: "father_name", label: "Father's Name Matches", checked: false },
  { id: "dob_match", label: "Date of Birth Matches", checked: false },
  { id: "expiry_valid", label: "CNIC Not Expired", checked: false },
  { id: "biometric_verified", label: "Biometric Verification Completed", checked: false },
]

// Mock applicant details for verification
const applicantDetails = {
  id: "UBL-2024-001277",
  name: "Khalid Mehmood",
  fatherName: "Abdul Mehmood",
  cnic: "42101-3456789-0",
  dateOfBirth: "15-05-1985",
  gender: "Male",
  address: "House #456, Street 7, Model Town, Lahore",
  issueDate: "10-01-2020",
  expiryDate: "09-01-2030",
  verificationProgress: 30,
}

function getStatusBadge(status: string) {
  switch (status) {
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
    case "in_progress":
      return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
    case "completed":
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

function getVerificationResultBadge(result: string) {
  switch (result) {
    case "verified":
      return <Badge className="bg-green-100 text-green-800">Verified</Badge>
    case "discrepancy":
      return <Badge variant="destructive">Discrepancy Found</Badge>
    default:
      return <Badge variant="outline">Pending</Badge>
  }
}

export default function CIUNadraChecklistPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("queue")
  const [checklistItems, setChecklistItems] = useState(nadraChecklist)
  const [discrepancyNotes, setDiscrepancyNotes] = useState("")
  const { toast } = useToast()

  const filteredApplications = nadraApplications.filter((app) => {
    const matchesSearch = 
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.cnic.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (activeTab === "queue") {
      return matchesSearch && (app.status === "pending" || app.status === "in_progress")
    } else if (activeTab === "completed") {
      return matchesSearch && app.status === "completed"
    }
    
    return matchesSearch
  })

  const handleToggleChecklist = (id: string) => {
    setChecklistItems(
      checklistItems.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    )
  }

  const handleVerifyNADRA = () => {
    const allChecked = checklistItems.every((item) => item.checked)
    
    if (allChecked) {
      toast({
        title: "Verification Successful",
        description: "NADRA verification completed successfully.",
      })
    } else {
      toast({
        title: "Verification Incomplete",
        description: "Please complete all verification items.",
      })
    }
  }

  const handleReportDiscrepancy = () => {
    if (discrepancyNotes.trim()) {
      toast({
        title: "Discrepancy Reported",
        description: "NADRA verification discrepancy has been reported.",
      })
      setDiscrepancyNotes("")
    } else {
      toast({
        title: "Error",
        description: "Please provide details about the discrepancy.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">NADRA Verification</h2>
          <p className="text-muted-foreground">Verify applicant information against NADRA database</p>
        </div>
        <Button>
          <ArrowRight className="mr-2 h-4 w-4" />
          Process Next
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="queue">Verification Queue</TabsTrigger>
          <TabsTrigger value="verification">Active Verification</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        {/* Verification Queue Tab */}
        <TabsContent value="queue" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Search</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, LOS ID, or CNIC..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>NADRA Verification Queue</CardTitle>
              <CardDescription>Applications requiring NADRA verification</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>LOS ID</TableHead>
                    <TableHead>CNIC</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Loan Type</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell className="font-medium">{application.name}</TableCell>
                      <TableCell className="font-mono text-sm">{application.id}</TableCell>
                      <TableCell>{application.cnic}</TableCell>
                      <TableCell>{getStatusBadge(application.status)}</TableCell>
                      <TableCell>{application.loanType}</TableCell>
                      <TableCell>{application.submittedDate}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="h-8 px-3"
                          onClick={() => setActiveTab("verification")}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Verify
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Active Verification Tab */}
        <TabsContent value="verification" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg">Applicant Details</CardTitle>
                  <CardDescription>Verify against NADRA database</CardDescription>
                </div>
                <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Full Name</Label>
                    <p className="font-medium">{applicantDetails.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Father's Name</Label>
                    <p className="font-medium">{applicantDetails.fatherName}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">CNIC</Label>
                    <p className="font-medium">{applicantDetails.cnic}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Date of Birth</Label>
                    <p className="font-medium">{applicantDetails.dateOfBirth}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Gender</Label>
                    <p className="font-medium">{applicantDetails.gender}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Address</Label>
                    <p className="font-medium">{applicantDetails.address}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">CNIC Issue Date</Label>
                    <p className="font-medium">{applicantDetails.issueDate}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">CNIC Expiry Date</Label>
                    <p className="font-medium">{applicantDetails.expiryDate}</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <div className="w-full">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Verification Progress</span>
                  <span className="text-sm font-medium">{applicantDetails.verificationProgress}%</span>
                </div>
                <Progress value={applicantDetails.verificationProgress} className="h-2" />
              </div>
            </CardFooter>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">NADRA Verification Checklist</CardTitle>
                <CardDescription>Complete all verification items</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {checklistItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={item.id} 
                      checked={item.checked} 
                      onCheckedChange={() => handleToggleChecklist(item.id)} 
                    />
                    <label
                      htmlFor={item.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {item.label}
                    </label>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <Button variant="outline" onClick={() => setActiveTab("queue")}>
                  Return to Queue
                </Button>
                <Button onClick={handleVerifyNADRA}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Verify
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="bg-red-50 border-b border-red-100">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <CardTitle className="text-lg text-red-800">Report Discrepancy</CardTitle>
                </div>
                <CardDescription className="text-red-700">
                  Use this section if you find any mismatch between application and NADRA data
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="discrepancy-notes">Discrepancy Details</Label>
                    <Input
                      id="discrepancy-notes"
                      placeholder="Describe the discrepancy in detail..."
                      value={discrepancyNotes}
                      onChange={(e) => setDiscrepancyNotes(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="flag-application" />
                    <label
                      htmlFor="flag-application"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Flag application for further investigation
                    </label>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={handleReportDiscrepancy}
                >
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Report Discrepancy
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Document Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-md p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">CNIC Front</h4>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                  <div className="bg-gray-100 h-[150px] rounded-md flex items-center justify-center">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                </div>
                
                <div className="border rounded-md p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">CNIC Back</h4>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                  <div className="bg-gray-100 h-[150px] rounded-md flex items-center justify-center">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Completed Tab */}
        <TabsContent value="completed" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Search</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, LOS ID, or CNIC..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Completed Verifications</CardTitle>
              <CardDescription>Applications with completed NADRA verification</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>LOS ID</TableHead>
                    <TableHead>CNIC</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Loan Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell className="font-medium">{application.name}</TableCell>
                      <TableCell className="font-mono text-sm">{application.id}</TableCell>
                      <TableCell>{application.cnic}</TableCell>
                      <TableCell>
                        {getVerificationResultBadge(application.verificationResult || "")}
                      </TableCell>
                      <TableCell>{application.loanType}</TableCell>
                      <TableCell>{application.amount}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 px-3"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 