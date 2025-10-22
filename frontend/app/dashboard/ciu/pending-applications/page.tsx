"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, Clock, CheckCircle, AlertTriangle, FileText, Eye, MoreHorizontal, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Mock data for pending applications
const pendingApplications = [
  {
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
  },
  {
    id: "UBL-2024-001276",
    name: "Rabia Akhtar",
    cnic: "42101-2345678-9",
    status: "Blacklist Check",
    priority: "Medium",
    lastUpdate: "2 hours ago",
    amount: "PKR 1,500,000",
    loanType: "Auto Loan",
    branchCode: "UBL-LHR-003",
    submittedDate: "2024-01-15",
  },
  {
    id: "UBL-2024-001277",
    name: "Khalid Mehmood",
    cnic: "42101-3456789-0",
    status: "NADRA Verification",
    priority: "High",
    lastUpdate: "3 hours ago",
    amount: "PKR 5,200,000",
    loanType: "Home Loan",
    branchCode: "UBL-ISL-002",
    submittedDate: "2024-01-14",
  },
  {
    id: "UBL-2024-001278",
    name: "Samina Khan",
    cnic: "42101-4567890-1",
    status: "Final Approval",
    priority: "Medium",
    lastUpdate: "4 hours ago",
    amount: "PKR 2,100,000",
    loanType: "Personal Loan",
    branchCode: "UBL-KHI-005",
    submittedDate: "2024-01-14",
  },
  {
    id: "UBL-2024-001279",
    name: "Adeel Ahmed",
    cnic: "42101-5678901-2",
    status: "Flagged",
    priority: "Critical",
    lastUpdate: "5 hours ago",
    amount: "PKR 4,500,000",
    loanType: "Business Loan",
    branchCode: "UBL-LHR-001",
    submittedDate: "2024-01-13",
  },
  {
    id: "UBL-2024-001280",
    name: "Zainab Malik",
    cnic: "42101-6789012-3",
    status: "NADRA Verification",
    priority: "High",
    lastUpdate: "6 hours ago",
    amount: "PKR 3,200,000",
    loanType: "Personal Loan",
    branchCode: "UBL-ISL-004",
    submittedDate: "2024-01-13",
  },
  {
    id: "UBL-2024-001281",
    name: "Usman Ali",
    cnic: "42101-7890123-4",
    status: "Blacklist Check",
    priority: "Medium",
    lastUpdate: "7 hours ago",
    amount: "PKR 1,800,000",
    loanType: "Auto Loan",
    branchCode: "UBL-KHI-002",
    submittedDate: "2024-01-12",
  },
]

function getStatusBadge(status: string) {
  switch (status) {
    case "NADRA Verification":
      return <Badge className="bg-blue-100 text-blue-800">NADRA Verification</Badge>
    case "Blacklist Check":
      return <Badge className="bg-yellow-100 text-yellow-800">Blacklist Check</Badge>
    case "Final Approval":
      return <Badge className="bg-green-100 text-green-800">Final Approval</Badge>
    case "Verified":
      return <Badge className="bg-purple-100 text-purple-800">Verified</Badge>
    case "Flagged":
      return <Badge variant="destructive">Flagged</Badge>
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

export default function CIUPendingApplicationsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const { toast } = useToast()

  const filteredApplications = pendingApplications.filter((app) => {
    const matchesSearch = 
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.cnic.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || app.status === statusFilter
    const matchesPriority = priorityFilter === "all" || app.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  const handleAssign = (id: string) => {
    toast({
      title: "Application Assigned",
      description: `Application ${id} has been assigned for investigation.`,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pending Applications</h2>
          <p className="text-muted-foreground">Applications awaiting investigation and verification</p>
        </div>
        <Button>Assign to Me</Button>
      </div>

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
                  <SelectItem value="NADRA Verification">NADRA Verification</SelectItem>
                  <SelectItem value="Blacklist Check">Blacklist Check</SelectItem>
                  <SelectItem value="Final Approval">Final Approval</SelectItem>
                  <SelectItem value="Flagged">Flagged</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-[180px]">
              <label className="text-sm font-medium">Priority</label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
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

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Investigation Queue</CardTitle>
          <CardDescription>Applications requiring verification and investigation</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All ({pendingApplications.length})</TabsTrigger>
              <TabsTrigger value="high">High Priority (3)</TabsTrigger>
              <TabsTrigger value="flagged">Flagged (1)</TabsTrigger>
            </TabsList>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>LOS ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Loan Type</TableHead>
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
                    <TableCell>{getStatusBadge(application.status)}</TableCell>
                    <TableCell>{getPriorityBadge(application.priority)}</TableCell>
                    <TableCell className="font-medium">{application.amount}</TableCell>
                    <TableCell>{application.loanType}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 px-2 lg:px-3"
                          onClick={() => handleAssign(application.id)}
                        >
                          Assign
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="h-8 px-2 lg:px-3"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
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