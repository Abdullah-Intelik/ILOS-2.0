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
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Search, FileText, Eye, ArrowRight, Download, Upload, CheckCircle, AlertTriangle, Clipboard } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Mock data for investigation reports
const investigationReports = [
  {
    id: "UBL-2024-001275",
    name: "Nasir Mahmood",
    cnic: "42101-1234567-8",
    status: "pending_report",
    priority: "High",
    submittedDate: "2024-01-15",
    loanType: "Personal Loan",
    amount: "PKR 3,800,000",
    verificationStatus: "completed",
    reportProgress: 0,
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
    verificationStatus: "completed",
    reportProgress: 60,
  },
  {
    id: "UBL-2024-001278",
    name: "Samina Khan",
    cnic: "42101-4567890-1",
    status: "completed",
    priority: "Medium",
    submittedDate: "2024-01-14",
    loanType: "Personal Loan",
    amount: "PKR 2,100,000",
    verificationStatus: "completed",
    reportProgress: 100,
    completedDate: "2024-01-16",
    recommendation: "approve",
  },
  {
    id: "UBL-2024-001282",
    name: "Tariq Mehmood",
    cnic: "42101-5678901-2",
    status: "completed",
    priority: "High",
    submittedDate: "2024-01-13",
    loanType: "Business Loan",
    amount: "PKR 4,800,000",
    verificationStatus: "completed",
    reportProgress: 100,
    completedDate: "2024-01-15",
    recommendation: "approve",
  },
  {
    id: "UBL-2024-001295",
    name: "Nadia Qureshi",
    cnic: "42101-0123456-7",
    status: "completed",
    priority: "Critical",
    submittedDate: "2024-01-10",
    loanType: "Home Loan",
    amount: "PKR 3,500,000",
    verificationStatus: "completed",
    reportProgress: 100,
    completedDate: "2024-01-14",
    recommendation: "reject",
  },
]

// Mock report sections
const reportSections = [
  { 
    id: "applicant_info", 
    title: "Applicant Information", 
    status: "completed",
    content: "Applicant Name: Khalid Mehmood\nCNIC: 42101-3456789-0\nDate of Birth: 15-05-1985\nGender: Male\nAddress: House #456, Street 7, Model Town, Lahore\nContact: +92 300 1234567\nEmail: khalid.mehmood@example.com"
  },
  { 
    id: "verification_summary", 
    title: "Verification Summary", 
    status: "completed",
    content: "Identity verification completed successfully through NADRA.\nAddress physically verified by field officer on January 14, 2024.\nEmployment verification completed with ABC Technologies Ltd.\nIncome verification completed based on salary slips and bank statements."
  },
  { 
    id: "field_visit", 
    title: "Field Visit Report", 
    status: "completed",
    content: "Field visit conducted on January 14, 2024.\nResidence verified as per application details.\nNeighborhood is well-established residential area.\nNo adverse observations noted during the visit."
  },
  { 
    id: "document_verification", 
    title: "Document Verification", 
    status: "completed",
    content: "All required documents have been submitted and verified.\nCNIC verification completed through NADRA.\nEmployment letter verified with employer.\nSalary slips for last 3 months verified.\nBank statements for last 6 months verified."
  },
  { 
    id: "risk_assessment", 
    title: "Risk Assessment", 
    status: "in_progress",
    content: "Credit score: 750 (Good)\nDebt-to-Income Ratio: 35%\nNo adverse credit history found.\nNo matches found in blacklist databases."
  },
  { 
    id: "conclusion", 
    title: "Conclusion & Recommendation", 
    status: "pending",
    content: ""
  },
]

// Mock applicant details
const applicationDetails = {
  id: "UBL-2024-001277",
  name: "Khalid Mehmood",
  cnic: "42101-3456789-0",
  dateOfBirth: "15-05-1985",
  gender: "Male",
  address: "House #456, Street 7, Model Town, Lahore",
  contactNumber: "+92 300 1234567",
  email: "khalid.mehmood@example.com",
  employer: "ABC Technologies Ltd.",
  employmentDuration: "5 years",
  monthlyIncome: "PKR 350,000",
  loanType: "Home Loan",
  loanAmount: "PKR 5,200,000",
  loanTenure: "120 months",
  monthlyInstallment: "PKR 65,000",
  interestRate: "12.5%",
  branchCode: "UBL-ISL-002",
  submittedDate: "2024-01-14",
  reportProgress: 60,
}

function getStatusBadge(status: string) {
  switch (status) {
    case "pending_report":
      return <Badge className="bg-yellow-100 text-yellow-800">Pending Report</Badge>
    case "in_progress":
      return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
    case "completed":
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

function getRecommendationBadge(recommendation: string) {
  switch (recommendation) {
    case "approve":
      return <Badge className="bg-green-100 text-green-800">Recommend Approval</Badge>
    case "reject":
      return <Badge variant="destructive">Recommend Rejection</Badge>
    default:
      return <Badge variant="outline">Pending</Badge>
  }
}

function getSectionStatusBadge(status: string) {
  switch (status) {
    case "completed":
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>
    case "in_progress":
      return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export default function CIUInvestigationReportPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("pending")
  const [activeSectionId, setActiveSectionId] = useState("applicant_info")
  const [sectionContent, setSectionContent] = useState(reportSections.find(s => s.id === "applicant_info")?.content || "")
  const [recommendation, setRecommendation] = useState("")
  const { toast } = useToast()

  const filteredReports = investigationReports.filter((report) => {
    const matchesSearch = 
      report.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.cnic.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (activeTab === "pending") {
      return matchesSearch && (report.status === "pending_report" || report.status === "in_progress")
    } else if (activeTab === "completed") {
      return matchesSearch && report.status === "completed"
    }
    
    return matchesSearch
  })

  const handleSaveSection = () => {
    toast({
      title: "Section Saved",
      description: "Report section has been saved successfully.",
    })
  }

  const handleGenerateReport = () => {
    toast({
      title: "Report Generated",
      description: "Investigation report has been generated successfully.",
    })
  }

  const handleCompleteReport = () => {
    if (!recommendation) {
      toast({
        title: "Error",
        description: "Please select a recommendation before completing the report.",
        variant: "destructive",
      })
      return
    }
    
    toast({
      title: "Report Completed",
      description: "Investigation report has been completed and sent for final approval.",
    })
    setActiveTab("pending")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Investigation Reports</h2>
          <p className="text-muted-foreground">Create and manage investigation reports</p>
        </div>
        <Button>
          <ArrowRight className="mr-2 h-4 w-4" />
          Process Next
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending">Pending Reports</TabsTrigger>
          <TabsTrigger value="completed">Completed Reports</TabsTrigger>
        </TabsList>
        
        {/* Pending Reports Tab */}
        <TabsContent value="pending" className="space-y-4 mt-4">
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
              <CardTitle>Pending Investigation Reports</CardTitle>
              <CardDescription>Reports pending creation or completion</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>LOS ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Loan Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{report.name}</div>
                          <div className="text-sm text-muted-foreground">{report.cnic}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{report.id}</TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                      <TableCell>{report.loanType}</TableCell>
                      <TableCell>{report.amount}</TableCell>
                      <TableCell>
                        <div className="w-full">
                          <div className="flex justify-between text-xs mb-1">
                            <span>{report.reportProgress}%</span>
                          </div>
                          <Progress value={report.reportProgress} className="h-2 w-[100px]" />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="h-8 px-3"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          {report.reportProgress > 0 ? "Continue" : "Create"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          {/* Report Creation Interface */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-1">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Report Sections</CardTitle>
                  <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
                </div>
                <CardDescription>
                  Complete all sections to generate report
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {reportSections.map((section) => (
                  <div 
                    key={section.id}
                    className={`p-3 rounded-md cursor-pointer flex justify-between items-center ${
                      activeSectionId === section.id ? 'bg-muted' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => {
                      setActiveSectionId(section.id)
                      setSectionContent(section.content)
                    }}
                  >
                    <div>
                      <p className="font-medium">{section.title}</p>
                    </div>
                    <div>
                      {getSectionStatusBadge(section.status)}
                    </div>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-between">
                <div className="text-sm text-muted-foreground">
                  4 of 6 sections completed
                </div>
                <Button variant="outline" size="sm">
                  <Clipboard className="h-4 w-4 mr-1" />
                  Template
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">
                  {reportSections.find(s => s.id === activeSectionId)?.title || "Section Content"}
                </CardTitle>
                <CardDescription>
                  Edit the content for this section of the report
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea 
                  value={sectionContent}
                  onChange={(e) => setSectionContent(e.target.value)}
                  placeholder="Enter section content..."
                  rows={12}
                  className="font-mono text-sm"
                />
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="mark-complete" />
                  <label
                    htmlFor="mark-complete"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Mark section as complete
                  </label>
                </div>
                <Button onClick={handleSaveSection}>Save Section</Button>
              </CardFooter>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recommendation & Finalization</CardTitle>
              <CardDescription>
                Provide your final recommendation and complete the report
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="recommendation">Recommendation</Label>
                <Select
                  value={recommendation}
                  onValueChange={setRecommendation}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your recommendation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approve">Recommend Approval</SelectItem>
                    <SelectItem value="reject">Recommend Rejection</SelectItem>
                    <SelectItem value="additional_info">Request Additional Information</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="recommendation-notes">Recommendation Notes</Label>
                <Textarea
                  id="recommendation-notes"
                  placeholder="Provide detailed justification for your recommendation..."
                  rows={4}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox id="confirm-complete" />
                <label
                  htmlFor="confirm-complete"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I confirm that all information in this report is accurate and complete
                </label>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-between">
              <Button variant="outline" onClick={handleGenerateReport}>
                <Download className="h-4 w-4 mr-1" />
                Generate Preview
              </Button>
              <Button onClick={handleCompleteReport}>
                <CheckCircle className="h-4 w-4 mr-1" />
                Complete Report
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Completed Reports Tab */}
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
              <CardTitle>Completed Investigation Reports</CardTitle>
              <CardDescription>Finalized investigation reports</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>LOS ID</TableHead>
                    <TableHead>Loan Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Recommendation</TableHead>
                    <TableHead>Completion Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{report.name}</div>
                          <div className="text-sm text-muted-foreground">{report.cnic}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{report.id}</TableCell>
                      <TableCell>{report.loanType}</TableCell>
                      <TableCell>{report.amount}</TableCell>
                      <TableCell>
                        {getRecommendationBadge(report.recommendation || "")}
                      </TableCell>
                      <TableCell>{report.completedDate}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 px-3"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 px-3"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            PDF
                          </Button>
                        </div>
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