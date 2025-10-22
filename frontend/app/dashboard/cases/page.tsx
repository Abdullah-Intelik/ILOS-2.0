"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Filter, Download, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"

const casesData = [
  {
    id: "UBL-2024-001234",
    applicantName: "Muhammad Ali Khan",
    segment: "Preferred",
    loanType: "Personal Loan",
    amount: "PKR 2,500,000",
    status: "Submitted",
    lastUpdate: "2024-01-15",
    assignedTo: "Ahmed Khan",
    priority: "High",
  },
  {
    id: "UBL-2024-001235",
    applicantName: "Fatima Ahmed",
    segment: "Mass",
    loanType: "Auto Loan",
    amount: "PKR 800,000",
    status: "Draft",
    lastUpdate: "2024-01-14",
    assignedTo: "Ahmed Khan",
    priority: "Medium",
  },
  {
    id: "UBL-2024-001236",
    applicantName: "Hassan Raza",
    segment: "SME",
    loanType: "Business Loan",
    amount: "PKR 5,000,000",
    status: "Flagged",
    lastUpdate: "2024-01-13",
    assignedTo: "Ahmed Khan",
    priority: "High",
  },
  {
    id: "UBL-2024-001237",
    applicantName: "Ayesha Malik",
    segment: "Preferred",
    loanType: "Home Loan",
    amount: "PKR 1,200,000",
    status: "Approved",
    lastUpdate: "2024-01-12",
    assignedTo: "Ahmed Khan",
    priority: "Low",
  },
  {
    id: "UBL-2024-001238",
    applicantName: "Omar Sheikh",
    segment: "Mass",
    loanType: "Personal Loan",
    amount: "PKR 600,000",
    status: "Returned",
    lastUpdate: "2024-01-11",
    assignedTo: "Ahmed Khan",
    priority: "Medium",
  },
  {
    id: "UBL-2024-001239",
    applicantName: "Zara Khan",
    segment: "Preferred",
    loanType: "Auto Loan",
    amount: "PKR 1,800,000",
    status: "Under Review",
    lastUpdate: "2024-01-10",
    assignedTo: "Ahmed Khan",
    priority: "Medium",
  },
]

function getStatusBadge(status: string) {
  const statusConfig = {
    Draft: { variant: "outline" as const, color: "text-gray-600" },
    Submitted: { variant: "default" as const, color: "text-blue-600" },
    "Under Review": { variant: "secondary" as const, color: "text-yellow-600" },
    Flagged: { variant: "destructive" as const, color: "text-red-600" },
    Approved: { variant: "default" as const, color: "text-green-600" },
    Rejected: { variant: "destructive" as const, color: "text-red-600" },
    Returned: { variant: "outline" as const, color: "text-orange-600" },
  }

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig["Draft"]

  return (
    <Badge variant={config.variant} className={config.color}>
      {status}
    </Badge>
  )
}

function getPriorityBadge(priority: string) {
  const priorityConfig = {
    High: "bg-red-100 text-red-800",
    Medium: "bg-yellow-100 text-yellow-800",
    Low: "bg-green-100 text-green-800",
  }

  return <Badge className={priorityConfig[priority as keyof typeof priorityConfig]}>{priority}</Badge>
}

export default function CasesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [segmentFilter, setSegmentFilter] = useState("all")

  const filteredCases = casesData.filter((case_) => {
    const matchesSearch =
      case_.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || case_.status === statusFilter
    const matchesSegment = segmentFilter === "all" || case_.segment === segmentFilter

    return matchesSearch && matchesStatus && matchesSegment
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Case Tracker</h2>
          <p className="text-muted-foreground">Monitor and manage all loan applications</p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export Cases
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or LOS ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Submitted">Submitted</SelectItem>
                  <SelectItem value="Under Review">Under Review</SelectItem>
                  <SelectItem value="Flagged">Flagged</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Returned">Returned</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Segment</label>
              <Select value={segmentFilter} onValueChange={setSegmentFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Segments</SelectItem>
                  <SelectItem value="Preferred">Preferred</SelectItem>
                  <SelectItem value="Mass">Mass</SelectItem>
                  <SelectItem value="SME">SME</SelectItem>
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

      {/* Cases Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Cases ({filteredCases.length})</CardTitle>
          <CardDescription>Complete list of loan applications with current status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>LOS ID</TableHead>
                <TableHead>Applicant</TableHead>
                <TableHead>Loan Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Segment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Last Update</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCases.map((case_) => (
                <TableRow key={case_.id}>
                  <TableCell className="font-mono text-sm">{case_.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{case_.applicantName}</div>
                      <div className="text-sm text-muted-foreground">Assigned to: {case_.assignedTo}</div>
                    </div>
                  </TableCell>
                  <TableCell>{case_.loanType}</TableCell>
                  <TableCell className="font-medium">{case_.amount}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{case_.segment}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(case_.status)}</TableCell>
                  <TableCell>{getPriorityBadge(case_.priority)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(case_.lastUpdate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Application
                        </DropdownMenuItem>
                        <DropdownMenuItem>Download Documents</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Cancel Application
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{casesData.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {casesData.filter((c) => c.status === "Submitted" || c.status === "Under Review").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Flagged Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {casesData.filter((c) => c.status === "Flagged").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {casesData.filter((c) => c.status === "Approved").length}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
