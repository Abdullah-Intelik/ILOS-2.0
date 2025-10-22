"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Search, Filter, CheckCircle, AlertTriangle, FileText, Eye, MoreHorizontal, Shield, UserCheck } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Mock data for the application being verified
const applicationDetails = {
  id: "UBL-2024-001275",
  name: "Nasir Mahmood",
  cnic: "42101-1234567-8",
  status: "NADRA Verification",
  priority: "High",
  lastUpdate: "1 hour ago",
  amount: "PKR 3,800,000",
  loanType: "Personal Loan",
  branchCode: "UBL-KHI-001",
  submittedDate: "2024-01-15",
  contactNumber: "+92 300 1234567",
  address: "House #123, Block A, DHA Phase 5, Karachi",
  employer: "ABC Technologies Ltd.",
  employmentDuration: "5 years",
  monthlyIncome: "PKR 250,000",
  verificationProgress: 60,
}

// Verification checklist items
const verificationChecklist = [
  { id: "identity", label: "Identity Verification", status: "completed", notes: "NADRA verification completed successfully." },
  { id: "address", label: "Address Verification", status: "completed", notes: "Address physically verified by field officer." },
  { id: "employment", label: "Employment Verification", status: "in_progress", notes: "Waiting for employer confirmation." },
  { id: "income", label: "Income Verification", status: "pending", notes: "" },
  { id: "documents", label: "Document Verification", status: "in_progress", notes: "Some documents need additional verification." },
  { id: "credit_history", label: "Credit History Check", status: "completed", notes: "No adverse credit history found." },
  { id: "blacklist", label: "Blacklist Check", status: "pending", notes: "" },
  { id: "field_visit", label: "Field Visit Report", status: "completed", notes: "Field visit completed on January 14, 2024." },
]

// Verification history
const verificationHistory = [
  { 
    date: "2024-01-15 14:30", 
    action: "Employment verification initiated", 
    user: "Omar Khan",
    notes: "Called employer HR department for verification."
  },
  { 
    date: "2024-01-14 16:45", 
    action: "Field visit completed", 
    user: "Saad Ahmed",
    notes: "Visited applicant's residence. Address verified."
  },
  { 
    date: "2024-01-14 11:20", 
    action: "Document verification in progress", 
    user: "Ayesha Malik",
    notes: "Income documents require additional verification."
  },
  { 
    date: "2024-01-13 09:15", 
    action: "NADRA verification completed", 
    user: "System",
    notes: "NADRA verification successful."
  },
]

function getStatusBadge(status: string) {
  switch (status) {
    case "completed":
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>
    case "in_progress":
      return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
    case "failed":
      return <Badge variant="destructive">Failed</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export default function CIUVerificationApplicationPage() {
  const [activeTab, setActiveTab] = useState("details")
  const [verificationNote, setVerificationNote] = useState("")
  const [verificationStatus, setVerificationStatus] = useState("in_progress")
  const { toast } = useToast()

  const handleUpdateStatus = (id: string, status: string) => {
    toast({
      title: "Verification Status Updated",
      description: `${id} verification status updated to ${status}.`,
    })
  }

  const handleSaveNote = () => {
    if (verificationNote.trim()) {
      toast({
        title: "Note Added",
        description: "Your verification note has been added to the application.",
      })
      setVerificationNote("")
    }
  }

  const handleCompleteVerification = () => {
    toast({
      title: "Verification Completed",
      description: "Application verification has been completed and sent for final approval.",
    })
    setVerificationStatus("completed")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight">Verification Application</h2>
            <Badge variant={verificationStatus === "completed" ? "default" : "outline"}>
              {verificationStatus === "completed" ? "Verified" : "In Progress"}
            </Badge>
          </div>
          <p className="text-muted-foreground">Verify applicant information and documents</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Return to Queue</Button>
          <Button 
            disabled={verificationStatus === "completed"} 
            onClick={handleCompleteVerification}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Complete Verification
          </Button>
        </div>
      </div>

      {/* Application Summary Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Application Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Applicant</p>
              <p className="font-medium">{applicationDetails.name}</p>
              <p className="text-sm text-muted-foreground">{applicationDetails.cnic}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Loan Details</p>
              <p className="font-medium">{applicationDetails.loanType}</p>
              <p className="text-sm text-muted-foreground">{applicationDetails.amount}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Application ID</p>
              <p className="font-medium font-mono">{applicationDetails.id}</p>
              <p className="text-sm text-muted-foreground">Submitted: {applicationDetails.submittedDate}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4">
          <div className="w-full">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Verification Progress</span>
              <span className="text-sm font-medium">{applicationDetails.verificationProgress}%</span>
            </div>
            <Progress value={applicationDetails.verificationProgress} className="h-2" />
          </div>
        </CardFooter>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Applicant Details</TabsTrigger>
          <TabsTrigger value="checklist">Verification Checklist</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="history">Verification History</TabsTrigger>
        </TabsList>
        
        {/* Applicant Details Tab */}
        <TabsContent value="details" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="full-name">Full Name</Label>
                    <Input id="full-name" value={applicationDetails.name} readOnly />
                  </div>
                  <div>
                    <Label htmlFor="cnic">CNIC</Label>
                    <Input id="cnic" value={applicationDetails.cnic} readOnly />
                  </div>
                  <div>
                    <Label htmlFor="contact">Contact Number</Label>
                    <Input id="contact" value={applicationDetails.contactNumber} readOnly />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea id="address" value={applicationDetails.address} readOnly />
                  </div>
                  <div>
                    <Label htmlFor="branch">Branch Code</Label>
                    <Input id="branch" value={applicationDetails.branchCode} readOnly />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Employment & Income</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="employer">Employer</Label>
                    <Input id="employer" value={applicationDetails.employer} readOnly />
                  </div>
                  <div>
                    <Label htmlFor="employment-duration">Employment Duration</Label>
                    <Input id="employment-duration" value={applicationDetails.employmentDuration} readOnly />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="monthly-income">Monthly Income</Label>
                    <Input id="monthly-income" value={applicationDetails.monthlyIncome} readOnly />
                  </div>
                  <div>
                    <Label htmlFor="verification-note">Add Verification Note</Label>
                    <Textarea 
                      id="verification-note" 
                      placeholder="Add notes about employment or income verification"
                      value={verificationNote}
                      onChange={(e) => setVerificationNote(e.target.value)}
                    />
                    <Button 
                      className="mt-2" 
                      size="sm" 
                      onClick={handleSaveNote}
                      disabled={!verificationNote.trim()}
                    >
                      Save Note
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Verification Checklist Tab */}
        <TabsContent value="checklist" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Verification Checklist</CardTitle>
              <CardDescription>Complete all verification items before finalizing</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Verification Item</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {verificationChecklist.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.label}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="max-w-[300px] truncate">{item.notes}</TableCell>
                      <TableCell className="text-right">
                        <Select
                          defaultValue={item.status}
                          onValueChange={(value) => handleUpdateStatus(item.id, value)}
                        >
                          <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Update status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Documents Tab */}
        <TabsContent value="documents" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Document Verification</CardTitle>
              <CardDescription>Verify all submitted documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md">CNIC</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>cnic_front.jpg</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <div className="flex items-center gap-4 w-full">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="cnic-verified" />
                        <label
                          htmlFor="cnic-verified"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Verified
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="cnic-issue" />
                        <label
                          htmlFor="cnic-issue"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Has Issues
                        </label>
                      </div>
                    </div>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md">Income Proof</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>salary_slip.pdf</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <div className="flex items-center gap-4 w-full">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="income-verified" />
                        <label
                          htmlFor="income-verified"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Verified
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="income-issue" />
                        <label
                          htmlFor="income-issue"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Has Issues
                        </label>
                      </div>
                    </div>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md">Bank Statement</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>bank_statement.pdf</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <div className="flex items-center gap-4 w-full">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="bank-verified" />
                        <label
                          htmlFor="bank-verified"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Verified
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="bank-issue" />
                        <label
                          htmlFor="bank-issue"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Has Issues
                        </label>
                      </div>
                    </div>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md">Employment Letter</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>employment_letter.pdf</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <div className="flex items-center gap-4 w-full">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="employment-verified" />
                        <label
                          htmlFor="employment-verified"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Verified
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="employment-issue" />
                        <label
                          htmlFor="employment-issue"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Has Issues
                        </label>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Verification History Tab */}
        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Verification History</CardTitle>
              <CardDescription>Timeline of verification activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {verificationHistory.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-[2px] bg-border relative">
                      <div className="absolute top-0 left-0 w-2 h-2 rounded-full bg-primary -translate-x-[3px]"></div>
                    </div>
                    <div className="pb-6 space-y-1">
                      <p className="text-sm text-muted-foreground">{item.date}</p>
                      <h4 className="font-medium">{item.action}</h4>
                      <p className="text-sm">By: {item.user}</p>
                      {item.notes && <p className="text-sm text-muted-foreground">{item.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 