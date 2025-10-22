"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDateTime } from "@/lib/utils"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Search, Filter, CheckCircle, AlertTriangle, FileText, Eye, Shield, X, CheckSquare, FolderOpen } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import DocumentExplorer from "@/components/document-explorer"

// Real data interface for RRU applications
interface RRUApplication {
  id: string
  los_id: string
  applicant_name: string
  loan_type: string
  loan_amount: string
  status: string
  priority: string
  created_at: string
  application_type: string
  assigned_officer?: string
  branch?: string
  documents?: Array<{
    id: string
    name: string
    status: string
    required: boolean
  }>
}

// Stats for dashboard
const statsData = [
  {
    title: "Pending Review",
    value: "8",
    change: "+2 from yesterday",
    icon: AlertTriangle,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  {
    title: "Approved Today",
    value: "5",
    change: "This week",
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    title: "Rejected Today",
    value: "2",
    change: "Risk assessment",
    icon: X,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  {
    title: "Total Processed",
    value: "156",
    change: "This month",
    icon: FileText,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
]

function getStatusBadge(status: string) {
  switch (status) {
    case "rejected_by_spu":
      return <Badge variant="destructive">Rejected by SPU</Badge>
    case "rejected_by_cops":
      return <Badge variant="destructive">Rejected by COPS</Badge>
    case "rejected_by_eavmu":
      return <Badge variant="destructive">Rejected by EAMVU</Badge>
    case "rejected_by_ciu":
      return <Badge variant="destructive">Rejected by CIU</Badge>
    case "rejected_by_rru":
      return <Badge variant="destructive">Rejected by RRU</Badge>
    case "resolved_by_rru":
      return <Badge className="bg-green-100 text-green-800">Resolved by RRU</Badge>
    case "application_completed":
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>
    case "returned_by_eavmu_officer":
      return <Badge className="bg-yellow-100 text-yellow-800">Returned by Officer</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

function getPriorityBadge(priority: string) {
  switch (priority) {
    case "high":
      return <Badge variant="destructive">High Risk</Badge>
    case "medium":
      return <Badge className="bg-yellow-100 text-yellow-800">Medium Risk</Badge>
    case "low":
      return <Badge className="bg-green-100 text-green-800">Low Risk</Badge>
    default:
      return <Badge variant="secondary">{priority}</Badge>
  }
}

export default function RRUDashboardPage() {
  const [activeTab, setActiveTab] = useState("pending")
  const [selectedApplication, setSelectedApplication] = useState<RRUApplication | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [applicationsData, setApplicationsData] = useState<RRUApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [reviewNotes, setReviewNotes] = useState("")
  const [showDocumentExplorer, setShowDocumentExplorer] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [existingComments, setExistingComments] = useState<{ [key: string]: string }>({})
  const [allDepartmentComments, setAllDepartmentComments] = useState<{ [key: string]: any[] }>({})
  const { toast } = useToast()

  // Fetch RRU applications from API
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/applications/department/RRU/paginated?page=${page}&pageSize=${pageSize}`, { cache: 'no-store' })
        const result = await response.json()
        
        if (response.ok) {
          const data = result?.data || []
          setApplicationsData(data)
          setTotal(result?.total || 0)
          console.log('✅ RRU: Fetched', data.length, 'applications (paginated)')
          console.log('📋 RRU Applications:', data)
        } else {
          console.error('❌ RRU: Failed to fetch applications:', result)
          toast({
            title: "Error",
            description: "Failed to fetch applications",
            variant: "destructive"
          })
        }
      } catch (error) {
        console.error('❌ RRU: Error fetching applications:', error)
        toast({
          title: "Error",
          description: "Failed to connect to server",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [toast, page, pageSize])

  const filteredApplications = applicationsData.filter((app: RRUApplication) => {
    const matchesSearch = app.applicant_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          app.los_id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || app.status === statusFilter
    
    // RRU can see applications with rejected statuses from all departments and resolved applications
    const rruAllowedStatuses = ['rejected_by_spu', 'rejected_by_cops', 'rejected_by_eavmu', 'rejected_by_ciu', 'rejected_by_rru', 'resolved_by_rru',  'SUBMITTED_TO_RRU']
    const isRruAllowed = rruAllowedStatuses.includes(app.status)
    
    if (activeTab === "pending") {
      return matchesSearch && matchesStatus && rruAllowedStatuses.includes(app.status)
    } else if (activeTab === "resolved") {
      return matchesSearch && matchesStatus && app.status === "resolved_by_rru"
    } else if (activeTab === "rejected") {
      return matchesSearch && matchesStatus && app.status.startsWith("rejected_by_")
    } else if (activeTab === "returned") {
      return matchesSearch && matchesStatus && app.status === "returned_by_eavmu_officer"
    }
    
    return matchesSearch && matchesStatus && isRruAllowed
  })

  const handleResolveApplication = async () => {
    if (!selectedApplication) return

    try {
      const response = await fetch('/api/applications/update-status-workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          losId: selectedApplication.los_id.replace('LOS-', ''),
          status: selectedApplication.status,
          applicationType: selectedApplication.application_type,
          department: 'RRU',
          action: 'resolve'
        })
      })

      if (response.ok) {
        toast({
          title: "Application Resolved",
          description: "Application has been resolved successfully",
        })
        setSelectedApplication(null)
        setReviewNotes("")
        // Refresh applications
        window.location.reload()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: "Failed to resolve application",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error resolving application:', error)
      toast({
        title: "Error",
        description: "Failed to resolve application",
        variant: "destructive"
      })
    }
  }

  const handleRejectApplication = async () => {
    if (!selectedApplication) return

    try {
      const response = await fetch('/api/applications/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          losId: selectedApplication.los_id.replace('LOS-', ''),
          status: 'Application_Rejected',
          applicationType: selectedApplication.application_type
        })
      })

      if (response.ok) {
        toast({
          title: "Application Rejected",
          description: "Application has been rejected",
        })
        setSelectedApplication(null)
        setReviewNotes("")
        // Refresh applications
        window.location.reload()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: "Failed to reject application",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error rejecting application:', error)
      toast({
        title: "Error",
        description: "Failed to reject application",
        variant: "destructive"
      })
    }
  }

  const handleReturnApplication = async () => {
    if (!selectedApplication) return

    try {
      const response = await fetch('/api/applications/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          losId: selectedApplication.los_id.replace('LOS-', ''),
          status: 'Application_Returned',
          applicationType: selectedApplication.application_type
        })
      })

      if (response.ok) {
        toast({
          title: "Application Returned",
          description: "Application has been returned for additional information",
        })
        setSelectedApplication(null)
        setReviewNotes("")
        // Refresh applications
        window.location.reload()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: "Failed to return application",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error returning application:', error)
      toast({
        title: "Error",
        description: "Failed to return application",
        variant: "destructive"
      })
    }
  }

  // Handle comment updates
  const handleUpdateComment = async () => {
    if (!selectedApplication || !commentText.trim()) {
      toast({
        title: "Error",
        description: "Please enter a comment before saving",
        variant: "destructive"
      })
      return
    }

    try {
      const losId = selectedApplication.los_id.replace('LOS-', '')
      const fieldName = 'rru_comments' // Department-specific comment field
      
      console.log(`🔄 RRU: Updating comment for LOS ID: ${losId}, Field: ${fieldName}`)

      const response = await fetch('/api/applications/update-comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          losId,
          fieldName,
          commentText: commentText.trim()
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ RRU: Failed to update comment:', errorData)
        toast({
          title: "Error",
          description: "Failed to save comment. Please try again.",
          variant: "destructive"
        })
        return
      }

      const data = await response.json()
      console.log(`✅ RRU: Comment updated successfully for LOS ID: ${losId}`)

      // Update local state to show the comment
      setExistingComments(prev => ({
        ...prev,
        [losId]: commentText.trim()
      }))

      toast({
        title: "Comment Saved",
        description: "Your comment has been saved successfully",
      })

      // Clear the input field
      setCommentText("")

    } catch (error) {
      console.error('❌ RRU: Error updating comment:', error)
      toast({
        title: "Error",
        description: "Failed to save comment. Please try again.",
        variant: "destructive"
      })
    }
  }

  const fetchAllDepartmentComments = async (losId: string) => {
    try {
      const response = await fetch(`/api/applications/comments/${losId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ Error fetching comments:', errorData)
        return
      }

      const data = await response.json()
      console.log('✅ All department comments fetched successfully:', data)

      if (data.success && data.comments) {
        setAllDepartmentComments(prev => ({
          ...prev,
          [losId]: data.comments
        }))
      }

    } catch (error) {
      console.error('❌ Error fetching all department comments:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading RRU applications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Risk Review Unit Dashboard</h1>
        <Button>Generate Reports</Button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
                 <TabsList>
           <TabsTrigger value="pending">Pending Review</TabsTrigger>
           <TabsTrigger value="resolved">Resolved</TabsTrigger>
           <TabsTrigger value="rejected">Rejected</TabsTrigger>
           <TabsTrigger value="returned">Returned</TabsTrigger>
         </TabsList>
        <TabsContent value="pending" className="space-y-4">
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

                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  More Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Applications Table */}
          <Card>
            <CardHeader>
              <CardTitle>Applications ({filteredApplications.length})</CardTitle>
              <CardDescription>Applications pending final risk review</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>LOS ID</TableHead>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Loan Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Application Started</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-mono text-sm">{app.los_id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{app.applicant_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {app.assigned_officer ? `Assigned to: ${app.assigned_officer}` : "Unassigned"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{app.loan_type}</TableCell>
                      <TableCell className="font-medium">PKR {Number(app.loan_amount).toLocaleString()}</TableCell>
                      <TableCell>{getPriorityBadge(app.priority)}</TableCell>
                      <TableCell>{getStatusBadge(app.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDateTime(app.created_at)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDateTime((app as any).updated_at)}</TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button onClick={() => setSelectedApplication(app)}>
                              Review
                            </Button>
                          </DialogTrigger>
                                                     <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
                             <DialogHeader className="sticky top-0 bg-white z-10 pb-4 border-b">
                               <DialogTitle>Risk Review - {selectedApplication?.los_id}</DialogTitle>
                               <DialogDescription>
                                 Perform final risk assessment and make decision
                               </DialogDescription>
                             </DialogHeader>

                             {selectedApplication && (
                               <div className="overflow-y-auto max-h-[calc(90vh-120px)] space-y-6 pr-2">
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">Applicant Information</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="text-sm font-medium">Applicant Name</Label>
                                        <p className="text-sm">{selectedApplication.applicant_name}</p>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium">Loan Type</Label>
                                        <p className="text-sm">{selectedApplication.loan_type}</p>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium">Amount</Label>
                                        <p className="text-sm">PKR {Number(selectedApplication.loan_amount).toLocaleString()}</p>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium">Risk Level</Label>
                                        <p className="text-sm">{getPriorityBadge(selectedApplication.priority)}</p>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>

                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">Risk Assessment Checklist</CardTitle>
                                    <CardDescription>
                                      Complete all required risk assessment checks
                                    </CardDescription>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="space-y-4">
                                      <div className="flex items-center space-x-2">
                                        <CheckSquare className="h-4 w-4 text-green-600" />
                                        <Label>Credit Score Verification</Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <CheckSquare className="h-4 w-4 text-green-600" />
                                        <Label>Income Verification</Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <CheckSquare className="h-4 w-4 text-green-600" />
                                        <Label>Employment Verification</Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <CheckSquare className="h-4 w-4 text-green-600" />
                                        <Label>Document Verification</Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <CheckSquare className="h-4 w-4 text-green-600" />
                                        <Label>Collateral Assessment</Label>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>

                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">Review Notes</CardTitle>
                                    <CardDescription>
                                      Add comments and notes about this application
                                    </CardDescription>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="space-y-4">
                                      {/* All Department Comments Display */}
                                      {selectedApplication && allDepartmentComments[selectedApplication.los_id.replace('LOS-', '')] && 
                                       allDepartmentComments[selectedApplication.los_id.replace('LOS-', '')].length > 0 && (
                                        <div className="space-y-3">
                                          <h4 className="font-medium text-gray-800 mb-2">All Department Comments:</h4>
                                          {allDepartmentComments[selectedApplication.los_id.replace('LOS-', '')].map((comment: any, index: number) => (
                                            <div key={index} className={`border rounded-lg p-3 ${
                                              comment.department === 'PB' ? 'bg-blue-50 border-blue-200' :
                                              comment.department === 'SPU' ? 'bg-green-50 border-green-200' :
                                              comment.department === 'COPS' ? 'bg-purple-50 border-purple-200' :
                                              comment.department === 'EAMVU' ? 'bg-orange-50 border-orange-200' :
                                              comment.department === 'CIU' ? 'bg-red-50 border-red-200' :
                                              comment.department === 'RRU' ? 'bg-indigo-50 border-indigo-200' :
                                              'bg-gray-50 border-gray-200'
                                            }`}>
                                              <div className="flex justify-between items-start mb-2">
                                                <span className={`text-xs font-medium px-2 py-1 rounded ${
                                                  comment.department === 'PB' ? 'bg-blue-100 text-blue-800' :
                                                  comment.department === 'SPU' ? 'bg-green-100 text-green-800' :
                                                  comment.department === 'COPS' ? 'bg-purple-100 text-purple-800' :
                                                  comment.department === 'EAMVU' ? 'bg-orange-100 text-orange-800' :
                                                  comment.department === 'CIU' ? 'bg-red-100 text-red-800' :
                                                  comment.department === 'RRU' ? 'bg-indigo-100 text-indigo-800' :
                                                  'bg-gray-100 text-gray-800'
                                                }`}>
                                                  {comment.department}
                                                </span>
                                              </div>
                                              <p className="text-sm text-gray-700">
                                                {comment.comment_text}
                                              </p>
                                            </div>
                                          ))}
                                        </div>
                                      )}

                                      {/* Existing Comments Display */}
                                      {selectedApplication && existingComments[selectedApplication.los_id.replace('LOS-', '')] && (
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                          <h4 className="font-medium text-blue-800 mb-2">Previous Comments:</h4>
                                          <p className="text-sm text-blue-700">
                                            {existingComments[selectedApplication.los_id.replace('LOS-', '')]}
                                          </p>
                                        </div>
                                      )}
                                      
                                      {/* Comment Input */}
                                      <div className="space-y-2">
                                        <Label htmlFor="comment">Add Comment</Label>
                                        <Textarea 
                                          id="comment"
                                          placeholder="Add your risk assessment notes and findings..."
                                          value={commentText}
                                          onChange={(e) => setCommentText(e.target.value)}
                                          rows={4}
                                        />
                                      </div>
                                      
                                      {/* Save Comment Button */}
                                      <Button 
                                        onClick={handleUpdateComment}
                                        disabled={!commentText.trim()}
                                        className="w-full"
                                      >
                                        Save Comment
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>

                                {/* View Documents Button */}
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                      <FolderOpen className="h-5 w-5" />
                                      Documents
                                    </CardTitle>
                                    <CardDescription>
                                      View uploaded documents for this application
                                    </CardDescription>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="space-y-4">
                                      <Button 
                                        variant="outline" 
                                        onClick={() => setShowDocumentExplorer(true)}
                                        className="w-full"
                                      >
                                        <FolderOpen className="mr-2 h-4 w-4" />
                                        View Documents
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>

                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setSelectedApplication(null)}>
                                    Save Progress
                                  </Button>
                                  <Button 
                                    variant="destructive" 
                                    onClick={handleRejectApplication}
                                  >
                                    Reject Application
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    onClick={handleReturnApplication}
                                  >
                                    Return for Info
                                  </Button>
                                                                     <Button 
                                     onClick={handleResolveApplication}
                                     className="bg-green-600 hover:bg-green-700"
                                   >
                                     Resolve Application
                                   </Button>
                                </DialogFooter>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        {/* Document Explorer Dialog */}
                        <Dialog open={showDocumentExplorer} onOpenChange={setShowDocumentExplorer}>
                          <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
                            <DialogHeader className="sticky top-0 bg-white z-10 pb-4 border-b">
                              <DialogTitle>Document Explorer - {selectedApplication?.los_id}</DialogTitle>
                              <DialogDescription>
                                View uploaded documents for this application
                              </DialogDescription>
                            </DialogHeader>
                            {selectedApplication && (
                              <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
                                <DocumentExplorer 
                                  losId={selectedApplication.los_id}
                                  applicationType={selectedApplication.loan_type}
                                  onFileSelect={(file) => {
                                    toast({
                                      title: "File selected",
                                      description: `Selected: ${file.name}`,
                                    });
                                  }} 
                                />
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Page {page} of {Math.max(1, Math.ceil(total / pageSize))} • {total} total
                </div>
                <div className="flex items-center gap-2">
                  <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(parseInt(v, 10)); setPage(1) }}>
                    <SelectTrigger className="w-[120px]"><SelectValue placeholder="Page size" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 / page</SelectItem>
                      <SelectItem value="20">20 / page</SelectItem>
                      <SelectItem value="50">50 / page</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</Button>
                    <Button variant="outline" size="sm" disabled={page >= Math.ceil(total / pageSize)} onClick={() => setPage(p => p + 1)}>Next</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

                 <TabsContent value="resolved" className="space-y-4">
           <Card>
             <CardHeader>
               <CardTitle>Resolved Applications</CardTitle>
               <CardDescription>Applications that have been resolved by RRU</CardDescription>
             </CardHeader>
             <CardContent>
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>LOS ID</TableHead>
                     <TableHead>Applicant</TableHead>
                     <TableHead>Loan Type</TableHead>
                     <TableHead>Amount</TableHead>
                     <TableHead>Resolution Date</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {applicationsData
                     .filter(app => app.status === "resolved_by_rru")
                     .map((app) => (
                       <TableRow key={app.id}>
                         <TableCell className="font-mono text-sm">{app.los_id}</TableCell>
                         <TableCell>{app.applicant_name}</TableCell>
                         <TableCell>{app.loan_type}</TableCell>
                         <TableCell className="font-medium">PKR {Number(app.loan_amount).toLocaleString()}</TableCell>
                         <TableCell>{new Date(app.created_at).toLocaleDateString()}</TableCell>
                       </TableRow>
                     ))}
                 </TableBody>
               </Table>
             </CardContent>
           </Card>
         </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rejected Applications</CardTitle>
              <CardDescription>Applications that have been rejected by RRU</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>LOS ID</TableHead>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Loan Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Rejection Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applicationsData
                    .filter(app => app.status === "Application_Rejected")
                    .map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-mono text-sm">{app.los_id}</TableCell>
                        <TableCell>{app.applicant_name}</TableCell>
                        <TableCell>{app.loan_type}</TableCell>
                        <TableCell className="font-medium">PKR {Number(app.loan_amount).toLocaleString()}</TableCell>
                        <TableCell>{new Date(app.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="returned" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Returned Applications</CardTitle>
              <CardDescription>Applications returned for additional information</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>LOS ID</TableHead>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Loan Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Return Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applicationsData
                    .filter(app => app.status === "Application_Returned")
                    .map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-mono text-sm">{app.los_id}</TableCell>
                        <TableCell>{app.applicant_name}</TableCell>
                        <TableCell>{app.loan_type}</TableCell>
                        <TableCell className="font-medium">PKR {Number(app.loan_amount).toLocaleString()}</TableCell>
                        <TableCell>{new Date(app.created_at).toLocaleDateString()}</TableCell>
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