"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, Flag, Search, Filter, CheckCircle, X, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Mock data for flagged applications
const flaggedApplications = [
  {
    id: "UBL-2024-001279",
    name: "Adeel Ahmed",
    cnic: "42101-5678901-2",
    flagReason: "Suspicious documentation",
    flaggedBy: "Zainab Malik",
    flaggedDate: "2024-01-15",
    status: "Pending Review",
    priority: "Critical",
    amount: "PKR 4,500,000",
    loanType: "Business Loan",
  },
  {
    id: "UBL-2024-001283",
    name: "Saima Nawaz",
    cnic: "42101-8901234-5",
    flagReason: "NADRA verification failed",
    flaggedBy: "Omar Khan",
    flaggedDate: "2024-01-14",
    status: "Under Investigation",
    priority: "High",
    amount: "PKR 2,800,000",
    loanType: "Personal Loan",
  },
  {
    id: "UBL-2024-001290",
    name: "Bilal Hassan",
    cnic: "42101-9012345-6",
    flagReason: "Address verification issues",
    flaggedBy: "Ayesha Imran",
    flaggedDate: "2024-01-14",
    status: "Pending Review",
    priority: "Medium",
    amount: "PKR 1,200,000",
    loanType: "Auto Loan",
  },
  {
    id: "UBL-2024-001295",
    name: "Nadia Qureshi",
    cnic: "42101-0123456-7",
    flagReason: "Blacklist match found",
    flaggedBy: "Tariq Ahmed",
    flaggedDate: "2024-01-13",
    status: "Under Investigation",
    priority: "Critical",
    amount: "PKR 3,500,000",
    loanType: "Home Loan",
  },
]

// Mock data for application to flag
const applicationToFlag = {
  id: "UBL-2024-001301",
  name: "Kamran Akmal",
  cnic: "42101-1234567-8",
  status: "NADRA Verification",
  amount: "PKR 2,500,000",
  loanType: "Personal Loan",
  submittedDate: "2024-01-15",
  branchCode: "UBL-KHI-003",
}

function getStatusBadge(status: string) {
  switch (status) {
    case "Pending Review":
      return <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>
    case "Under Investigation":
      return <Badge className="bg-orange-100 text-orange-800">Under Investigation</Badge>
    case "Resolved":
      return <Badge className="bg-green-100 text-green-800">Resolved</Badge>
    case "Rejected":
      return <Badge variant="destructive">Rejected</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

function getPriorityBadge(priority: string) {
  switch (priority) {
    case "Low":
      return <Badge className="bg-gray-100 text-gray-800">Low</Badge>
    case "Medium":
      return <Badge className="bg-blue-100 text-blue-800">Medium</Badge>
    case "High":
      return <Badge className="bg-orange-100 text-orange-800">High</Badge>
    case "Critical":
      return <Badge variant="destructive">Critical</Badge>
    default:
      return <Badge variant="secondary">{priority}</Badge>
  }
}

export default function CIUFlagApplicationPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showFlagDialog, setShowFlagDialog] = useState(false)
  const [flagReason, setFlagReason] = useState("")
  const [flagPriority, setFlagPriority] = useState("Medium")
  const [flagDetails, setFlagDetails] = useState("")
  const { toast } = useToast()

  const filteredApplications = flaggedApplications.filter((app) => {
    const matchesSearch = 
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.cnic.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || app.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleFlagApplication = () => {
    toast({
      title: "Application Flagged",
      description: `Application ${applicationToFlag.id} has been flagged for review.`,
    })
    setShowFlagDialog(false)
    setFlagReason("")
    setFlagPriority("Medium")
    setFlagDetails("")
  }

  const handleResolveFlagged = (id: string) => {
    toast({
      title: "Flag Resolved",
      description: `Flag for application ${id} has been resolved.`,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Flag Application</h2>
          <p className="text-muted-foreground">Flag suspicious applications for further investigation</p>
        </div>
        <Dialog open={showFlagDialog} onOpenChange={setShowFlagDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Flag className="h-4 w-4" />
              Flag New Application
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Flag Application for Investigation</DialogTitle>
              <DialogDescription>
                Flag this application for further investigation due to suspicious activity or documentation issues.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="app-id" className="text-right">
                  LOS ID
                </Label>
                <Input
                  id="app-id"
                  value={applicationToFlag.id}
                  className="col-span-3"
                  readOnly
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="app-name" className="text-right">
                  Applicant
                </Label>
                <Input
                  id="app-name"
                  value={applicationToFlag.name}
                  className="col-span-3"
                  readOnly
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="flag-reason" className="text-right">
                  Flag Reason
                </Label>
                <Select
                  value={flagReason}
                  onValueChange={setFlagReason}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select reason for flagging" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="suspicious_documentation">Suspicious Documentation</SelectItem>
                    <SelectItem value="identity_verification">Identity Verification Issues</SelectItem>
                    <SelectItem value="blacklist_match">Blacklist Match</SelectItem>
                    <SelectItem value="address_verification">Address Verification Issues</SelectItem>
                    <SelectItem value="income_verification">Income Verification Issues</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="flag-priority" className="text-right">
                  Priority
                </Label>
                <RadioGroup
                  value={flagPriority}
                  onValueChange={setFlagPriority}
                  className="flex col-span-3 space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Low" id="low" />
                    <Label htmlFor="low">Low</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Medium" id="medium" />
                    <Label htmlFor="medium">Medium</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="High" id="high" />
                    <Label htmlFor="high">High</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Critical" id="critical" />
                    <Label htmlFor="critical">Critical</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="flag-details" className="text-right">
                  Details
                </Label>
                <Textarea
                  id="flag-details"
                  placeholder="Provide detailed information about the flag reason"
                  value={flagDetails}
                  onChange={(e) => setFlagDetails(e.target.value)}
                  className="col-span-3"
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowFlagDialog(false)}>Cancel</Button>
              <Button onClick={handleFlagApplication}>Flag Application</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alert Card */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <CardTitle className="text-lg text-yellow-800">Important Notice</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-yellow-800">
            Flagged applications require thorough investigation. Please ensure all flags are reviewed promptly and appropriate action is taken.
          </p>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
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
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Pending Review">Pending Review</SelectItem>
                  <SelectItem value="Under Investigation">Under Investigation</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" className="flex gap-2">
              <Filter className="h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Flagged Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Flagged Applications</CardTitle>
          <CardDescription>Applications flagged for investigation</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Flags ({flaggedApplications.length})</TabsTrigger>
              <TabsTrigger value="critical">Critical (2)</TabsTrigger>
              <TabsTrigger value="pending">Pending Review (2)</TabsTrigger>
            </TabsList>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>LOS ID</TableHead>
                  <TableHead>Flag Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Flagged By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{application.name}</div>
                        <div className="text-sm text-muted-foreground">{application.cnic}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{application.id}</TableCell>
                    <TableCell>{application.flagReason}</TableCell>
                    <TableCell>{getStatusBadge(application.status)}</TableCell>
                    <TableCell>{getPriorityBadge(application.priority)}</TableCell>
                    <TableCell>{application.flaggedBy}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 px-2 lg:px-3"
                          onClick={() => handleResolveFlagged(application.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Resolve
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="h-8 px-2 lg:px-3"
                        >
                          <Info className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
} 