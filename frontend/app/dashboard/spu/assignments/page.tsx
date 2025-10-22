// /dashboard/spu/assignments/page.tsx
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
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Filter, RefreshCw, UserPlus, Users, BarChart, ArrowUpDown, Calendar, Clock, AlertTriangle } from "lucide-react"

// Mock data for officers
const officers = [
  {
    id: "officer-1",
    name: "Fatima Ali",
    avatar: "/placeholder-user.jpg",
    role: "Senior Verification Officer",
    assignedCases: 12,
    completedToday: 5,
    pendingUrgent: 2,
    efficiency: 92,
    status: "active",
  },
  {
    id: "officer-2",
    name: "Imran Shah",
    avatar: "/placeholder-user.jpg",
    role: "Verification Officer",
    assignedCases: 8,
    completedToday: 3,
    pendingUrgent: 1,
    efficiency: 85,
    status: "active",
  },
  {
    id: "officer-3",
    name: "Sana Khan",
    avatar: "/placeholder-user.jpg",
    role: "Senior Verification Officer",
    assignedCases: 15,
    completedToday: 7,
    pendingUrgent: 3,
    efficiency: 88,
    status: "active",
  },
  {
    id: "officer-4",
    name: "Ahmed Hassan",
    avatar: "/placeholder-user.jpg",
    role: "Verification Officer",
    assignedCases: 10,
    completedToday: 4,
    pendingUrgent: 0,
    efficiency: 90,
    status: "away",
  },
  {
    id: "officer-5",
    name: "Zainab Malik",
    avatar: "/placeholder-user.jpg",
    role: "Junior Verification Officer",
    assignedCases: 6,
    completedToday: 2,
    pendingUrgent: 0,
    efficiency: 78,
    status: "active",
  },
]

// Mock data for pending assignments
const pendingAssignments = [
  {
    id: "UBL-2024-001250",
    applicant: "Tariq Ahmed",
    loanType: "Auto Loan",
    amount: "PKR 1,200,000",
    submissionDate: "2024-06-19",
    priority: "high",
    status: "unassigned",
    documents: 6,
    verifiedDocuments: 0,
  },
  {
    id: "UBL-2024-001251",
    applicant: "Ayesha Khan",
    loanType: "Personal Loan",
    amount: "PKR 500,000",
    submissionDate: "2024-06-18",
    priority: "medium",
    status: "unassigned",
    documents: 5,
    verifiedDocuments: 0,
  },
  {
    id: "UBL-2024-001252",
    applicant: "Faisal Malik",
    loanType: "Home Loan",
    amount: "PKR 3,500,000",
    submissionDate: "2024-06-17",
    priority: "urgent",
    status: "unassigned",
    documents: 8,
    verifiedDocuments: 0,
  },
  {
    id: "UBL-2024-001253",
    applicant: "Saima Ali",
    loanType: "Business Loan",
    amount: "PKR 2,000,000",
    submissionDate: "2024-06-16",
    priority: "low",
    status: "unassigned",
    documents: 7,
    verifiedDocuments: 0,
  },
]

// Priority badge component
const PriorityBadge = ({ priority }: { priority: string }) => {
  switch (priority) {
    case "urgent":
      return <Badge className="bg-red-100 text-red-800 border-red-200">Urgent</Badge>
    case "high":
      return <Badge className="bg-orange-100 text-orange-800 border-orange-200">High</Badge>
    case "medium":
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Medium</Badge>
    case "low":
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Low</Badge>
    default:
      return <Badge variant="outline">{priority}</Badge>
  }
}

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case "active":
      return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
    case "away":
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Away</Badge>
    case "unassigned":
      return <Badge variant="outline">Unassigned</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function SPUAssignmentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [sortBy, setSortBy] = useState("efficiency")
  const [sortOrder, setSortOrder] = useState("desc")
  const [selectedOfficer, setSelectedOfficer] = useState<any>(null)
  const [selectedAssignments, setSelectedAssignments] = useState<string[]>([])
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  
  // Filter and sort officers
  const filteredOfficers = officers.filter(officer => {
    const matchesSearch = 
      officer.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = filterRole === "all" || officer.role.toLowerCase().includes(filterRole)
    const matchesStatus = filterStatus === "all" || officer.status === filterStatus
    
    return matchesSearch && matchesRole && matchesStatus
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
  
  const handleAssignToOfficer = (officer: any) => {
    setSelectedOfficer(officer)
    setIsAssignDialogOpen(true)
  }
  
  const toggleAssignmentSelection = (id: string) => {
    setSelectedAssignments(prev => 
      prev.includes(id) 
        ? prev.filter(a => a !== id) 
        : [...prev, id]
    )
  }
  
  const handleAssignConfirm = () => {
    // In a real application, this would assign the cases to the officer
    // For now, we'll just close the dialog
    setIsAssignDialogOpen(false)
    
    // Update the UI to show assignment was successful
    // This would be replaced with actual API call in production
    alert(`${selectedAssignments.length} cases assigned to ${selectedOfficer.name}`)
  }
  
  // Calculate total assignments and workload
  const totalAssignedCases = officers.reduce((total, officer) => total + officer.assignedCases, 0)
  const totalPendingAssignments = pendingAssignments.length
  const totalUrgentCases = officers.reduce((total, officer) => total + officer.pendingUrgent, 0) + 
    pendingAssignments.filter(a => a.priority === "urgent").length

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">SPU Assignments</h1>
          <p className="text-muted-foreground">Manage verification officer workloads and assignments</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Auto Assign
          </Button>
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Officer Workload</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssignedCases}</div>
            <p className="text-xs text-muted-foreground">Cases assigned to {officers.length} officers</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPendingAssignments}</div>
            <p className="text-xs text-muted-foreground">Cases awaiting assignment</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Urgent Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalUrgentCases}</div>
            <p className="text-xs text-muted-foreground">Requiring immediate attention</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="officers">
        <TabsList>
          <TabsTrigger value="officers">
            Verification Officers
            <Badge className="ml-2 bg-gray-100 text-gray-900">{officers.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending Assignments
            <Badge className="ml-2 bg-yellow-100 text-yellow-800">{pendingAssignments.length}</Badge>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="officers" className="space-y-4 mt-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by officer name"
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-full md:w-[200px]">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <SelectValue placeholder="Filter by role" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="senior">Senior Officers</SelectItem>
                <SelectItem value="junior">Junior Officers</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[180px]">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="away">Away</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Officers Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Officer</TableHead>
                    <TableHead>
                      <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort("assignedCases")}>
                        Assigned Cases
                        {sortBy === "assignedCases" && (
                          <ArrowUpDown className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort("completedToday")}>
                        Completed Today
                        {sortBy === "completedToday" && (
                          <ArrowUpDown className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Urgent Cases</TableHead>
                    <TableHead>
                      <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort("efficiency")}>
                        Efficiency
                        {sortBy === "efficiency" && (
                          <ArrowUpDown className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOfficers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No officers found matching your criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOfficers.map((officer) => (
                      <TableRow key={officer.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={officer.avatar} alt={officer.name} />
                              <AvatarFallback>{officer.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{officer.name}</p>
                              <p className="text-xs text-muted-foreground">{officer.role}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{officer.assignedCases}</TableCell>
                        <TableCell>{officer.completedToday}</TableCell>
                        <TableCell>
                          {officer.pendingUrgent > 0 ? (
                            <div className="flex items-center gap-1">
                              <span>{officer.pendingUrgent}</span>
                              {officer.pendingUrgent >= 3 && (
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                          ) : (
                            "0"
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={officer.efficiency} className="h-2 w-20" />
                            <span>{officer.efficiency}%</span>
                          </div>
                        </TableCell>
                        <TableCell><StatusBadge status={officer.status} /></TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleAssignToOfficer(officer)}>
                              Assign Cases
                            </Button>
                            <Button variant="outline" size="sm">
                              <BarChart className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pending" className="space-y-4 mt-4">
          {/* Pending Assignments Table */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Assignments</CardTitle>
              <CardDescription>Applications awaiting officer assignment</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30px]"></TableHead>
                    <TableHead>LOS ID</TableHead>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Loan Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Submission Date</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingAssignments.map((assignment) => (
                    <TableRow key={assignment.id} className={assignment.priority === "urgent" ? "bg-red-50" : ""}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedAssignments.includes(assignment.id)}
                          onChange={() => toggleAssignmentSelection(assignment.id)}
                          className="rounded border-gray-300"
                        />
                      </TableCell>
                      <TableCell className="font-mono">{assignment.id}</TableCell>
                      <TableCell>{assignment.applicant}</TableCell>
                      <TableCell>{assignment.loanType}</TableCell>
                      <TableCell>{assignment.amount}</TableCell>
                      <TableCell className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {assignment.submissionDate}
                      </TableCell>
                      <TableCell><PriorityBadge priority={assignment.priority} /></TableCell>
                      <TableCell>{assignment.documents}</TableCell>
                      <TableCell className="text-right">
                        <Select>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Assign to..." />
                          </SelectTrigger>
                          <SelectContent>
                            {officers.map((officer) => (
                              <SelectItem key={officer.id} value={officer.id}>
                                {officer.name} ({officer.assignedCases})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                {selectedAssignments.length} of {pendingAssignments.length} cases selected
              </div>
              <div className="flex gap-2">
                <Button variant="outline" disabled={selectedAssignments.length === 0}>
                  Assign to Officer
                </Button>
                <Button disabled={selectedAssignments.length === 0}>
                  Auto-Assign Selected
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Assignment Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assign Cases to Officer</DialogTitle>
            <DialogDescription>
              {selectedOfficer && (
                <>Assign pending cases to {selectedOfficer.name} ({selectedOfficer.role})</>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOfficer && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={selectedOfficer.avatar} alt={selectedOfficer.name} />
                    <AvatarFallback>{selectedOfficer.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedOfficer.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedOfficer.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">Current Workload</p>
                  <p className="text-sm">{selectedOfficer.assignedCases} assigned cases</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Select Cases to Assign</h3>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[30px]"></TableHead>
                        <TableHead>LOS ID</TableHead>
                        <TableHead>Applicant</TableHead>
                        <TableHead>Loan Type</TableHead>
                        <TableHead>Priority</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingAssignments.map((assignment) => (
                        <TableRow key={assignment.id} className={assignment.priority === "urgent" ? "bg-red-50" : ""}>
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedAssignments.includes(assignment.id)}
                              onChange={() => toggleAssignmentSelection(assignment.id)}
                              className="rounded border-gray-300"
                            />
                          </TableCell>
                          <TableCell className="font-mono">{assignment.id}</TableCell>
                          <TableCell>{assignment.applicant}</TableCell>
                          <TableCell>{assignment.loanType}</TableCell>
                          <TableCell><PriorityBadge priority={assignment.priority} /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-4">
                <div className="text-sm text-muted-foreground">
                  {selectedAssignments.length} cases selected
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAssignConfirm}
                    disabled={selectedAssignments.length === 0}
                  >
                    Confirm Assignment
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
