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
import { Progress } from "@/components/ui/progress"
import { Search, AlertTriangle, CheckCircle, XCircle, Eye, ArrowRight, Shield, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Mock data for blacklist check applications
const blacklistApplications = [
  {
    id: "UBL-2024-001276",
    name: "Rabia Akhtar",
    cnic: "42101-2345678-9",
    status: "pending",
    priority: "Medium",
    submittedDate: "2024-01-15",
    loanType: "Auto Loan",
    amount: "PKR 1,500,000",
  },
  {
    id: "UBL-2024-001281",
    name: "Usman Ali",
    cnic: "42101-7890123-4",
    status: "in_progress",
    priority: "Medium",
    submittedDate: "2024-01-12",
    loanType: "Auto Loan",
    amount: "PKR 1,800,000",
  },
  {
    id: "UBL-2024-001291",
    name: "Imran Khan",
    cnic: "42101-8901234-5",
    status: "pending",
    priority: "High",
    submittedDate: "2024-01-11",
    loanType: "Business Loan",
    amount: "PKR 4,200,000",
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
    checkResult: "match_found",
    matchDetails: "Defaulter in Credit Bureau records"
  },
  {
    id: "UBL-2024-001298",
    name: "Ahmed Raza",
    cnic: "42101-9876543-2",
    status: "completed",
    priority: "Medium",
    submittedDate: "2024-01-09",
    loanType: "Personal Loan",
    amount: "PKR 2,000,000",
    checkResult: "no_match",
  },
]

// Blacklist databases to check
const blacklistDatabases = [
  { id: "internal", name: "UBL Internal Blacklist", status: "checked", result: "no_match" },
  { id: "ecib", name: "eCIB Credit Bureau", status: "in_progress", result: "pending" },
  { id: "datacheck", name: "DataCheck Pakistan", status: "pending", result: "pending" },
  { id: "nadra", name: "NADRA Security Database", status: "pending", result: "pending" },
  { id: "fiu", name: "FIU Watchlist", status: "pending", result: "pending" },
]

// Mock applicant details
const applicantDetails = {
  id: "UBL-2024-001281",
  name: "Usman Ali",
  cnic: "42101-7890123-4",
  dateOfBirth: "22-07-1982",
  address: "House #789, Block B, Bahria Town, Lahore",
  contactNumber: "+92 321 1234567",
  email: "usman.ali@example.com",
  checkProgress: 20,
}

function getStatusBadge(status: string) {
  switch (status) {
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
    case "in_progress":
      return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
    case "completed":
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>
    case "checked":
      return <Badge className="bg-green-100 text-green-800">Checked</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

function getResultBadge(result: string) {
  switch (result) {
    case "no_match":
      return <Badge className="bg-green-100 text-green-800">No Match</Badge>
    case "match_found":
      return <Badge variant="destructive">Match Found</Badge>
    case "pending":
      return <Badge variant="outline">Pending</Badge>
    default:
      return <Badge variant="secondary">{result}</Badge>
  }
}

export default function CIUBlacklistCheckPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("queue")
  const [databaseList, setDatabaseList] = useState(blacklistDatabases)
  const [matchNotes, setMatchNotes] = useState("")
  const { toast } = useToast()

  const filteredApplications = blacklistApplications.filter((app) => {
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

  const handleCheckDatabase = (id: string) => {
    setDatabaseList(
      databaseList.map((db) => {
        if (db.id === id) {
          return { ...db, status: "checked", result: "no_match" }
        }
        return db
      })
    )
    
    toast({
      title: "Database Checked",
      description: "No match found in the selected database.",
    })
  }

  const handleCompleteCheck = () => {
    const allChecked = databaseList.every((db) => db.status === "checked")
    
    if (allChecked) {
      toast({
        title: "Blacklist Check Completed",
        description: "No matches found in any database.",
      })
      setActiveTab("queue")
    } else {
      toast({
        title: "Check Incomplete",
        description: "Please check all databases before completing.",
      })
    }
  }

  const handleReportMatch = () => {
    if (matchNotes.trim()) {
      toast({
        title: "Match Reported",
        description: "Blacklist match has been reported and application flagged.",
      })
      setMatchNotes("")
    } else {
      toast({
        title: "Error",
        description: "Please provide details about the match.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Blacklist Check</h2>
          <p className="text-muted-foreground">Verify applicant against blacklists and watchlists</p>
        </div>
        <Button>
          <ArrowRight className="mr-2 h-4 w-4" />
          Process Next
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="queue">Check Queue</TabsTrigger>
          <TabsTrigger value="active">Active Check</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        {/* Check Queue Tab */}
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
              <CardTitle>Blacklist Check Queue</CardTitle>
              <CardDescription>Applications requiring blacklist verification</CardDescription>
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
                      <TableCell>{getStatusBadge(application.status)}</TableCell>
                      <TableCell>{application.loanType}</TableCell>
                      <TableCell>{application.amount}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="h-8 px-3"
                          onClick={() => setActiveTab("active")}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Check
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Active Check Tab */}
        <TabsContent value="active" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg">Applicant Details</CardTitle>
                  <CardDescription>Verify against blacklists and watchlists</CardDescription>
                </div>
                <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                    <p className="font-medium">{applicantDetails.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">CNIC</p>
                    <p className="font-medium">{applicantDetails.cnic}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                    <p className="font-medium">{applicantDetails.dateOfBirth}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Address</p>
                    <p className="font-medium">{applicantDetails.address}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Contact</p>
                    <p className="font-medium">{applicantDetails.contactNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="font-medium">{applicantDetails.email}</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <div className="w-full">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Check Progress</span>
                  <span className="text-sm font-medium">{applicantDetails.checkProgress}%</span>
                </div>
                <Progress value={applicantDetails.checkProgress} className="h-2" />
              </div>
            </CardFooter>
          </Card>
          
          <div className="grid grid-cols-1 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Blacklist Database Checks</CardTitle>
                <CardDescription>Check applicant against all required databases</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Database</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {databaseList.map((database) => (
                      <TableRow key={database.id}>
                        <TableCell className="font-medium">{database.name}</TableCell>
                        <TableCell>{getStatusBadge(database.status)}</TableCell>
                        <TableCell>{getResultBadge(database.result)}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant={database.status === "checked" ? "outline" : "default"} 
                            size="sm" 
                            className="h-8 px-3"
                            disabled={database.status === "checked"}
                            onClick={() => handleCheckDatabase(database.id)}
                          >
                            {database.status === "checked" ? (
                              <CheckCircle className="h-4 w-4 mr-1" />
                            ) : (
                              <Search className="h-4 w-4 mr-1" />
                            )}
                            {database.status === "checked" ? "Checked" : "Check"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <Button variant="outline" onClick={() => setActiveTab("queue")}>
                  Return to Queue
                </Button>
                <Button onClick={handleCompleteCheck}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Complete Check
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="border-red-200">
              <CardHeader className="bg-red-50 border-b border-red-100">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <CardTitle className="text-lg text-red-800">Report Match</CardTitle>
                </div>
                <CardDescription className="text-red-700">
                  Use this section if you find a match in any blacklist or watchlist
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Database</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select database with match" />
                      </SelectTrigger>
                      <SelectContent>
                        {databaseList.map((db) => (
                          <SelectItem key={db.id} value={db.id}>{db.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Match Type</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select match type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="defaulter">Loan Defaulter</SelectItem>
                        <SelectItem value="fraud">Fraud History</SelectItem>
                        <SelectItem value="aml">AML Watchlist</SelectItem>
                        <SelectItem value="pep">Politically Exposed Person</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Match Details</label>
                    <Textarea
                      placeholder="Provide detailed information about the match..."
                      value={matchNotes}
                      onChange={(e) => setMatchNotes(e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={handleReportMatch}
                >
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Report Match & Flag Application
                </Button>
              </CardFooter>
            </Card>
          </div>
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
              <CardTitle>Completed Checks</CardTitle>
              <CardDescription>Applications with completed blacklist verification</CardDescription>
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
                        {getResultBadge(application.checkResult || "pending")}
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