"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Search, Filter, CheckCircle, AlertTriangle, FileText, Eye, Scale, X, CheckSquare, FolderOpen, Shield, User, Banknote, Activity } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import DocumentExplorer from "@/components/document-explorer"
import { MinimalFieldDisplay } from "@/components/minimal-field-display"

// Real data interface for Compliance applications
interface ComplianceApplication {
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
  formData?: any
}

// Stats for dashboard
const statsData = [
  {
    title: "Pending Compliance",
    value: "5",
    change: "+2 from yesterday",
    icon: AlertTriangle,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  {
    title: "Approved Today",
    value: "7",
    change: "This week",
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    title: "Non-Compliant",
    value: "1",
    change: "Requires attention",
    icon: Scale,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  {
    title: "Total Processed",
    value: "124",
    change: "This month",
    icon: FileText,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
]

function getStatusBadge(status: string) {
  switch (status) {
    case "forwarded_to_compliance":
      return <Badge className="bg-orange-100 text-orange-800">Pending Compliance Review</Badge>
    case "forwarded_to_risk&compliance":
      return <Badge className="bg-orange-100 text-orange-800">Pending Compliance (Both Departments)</Badge>
    case "resolved_by_compliance":
      return <Badge className="bg-green-100 text-green-800">Compliance Approved</Badge>
    case "rejected_by_compliance":
      return <Badge variant="destructive">Compliance Rejected</Badge>
    case "non_compliant":
      return <Badge variant="destructive">Non-Compliant</Badge>
    case "returned_by_compliance":
      return <Badge className="bg-yellow-100 text-yellow-800">Returned by Compliance</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

function getPriorityBadge(priority: string) {
  switch (priority) {
    case "high":
      return <Badge variant="destructive">High</Badge>
    case "medium":
      return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
    case "low":
      return <Badge className="bg-green-100 text-green-800">Low</Badge>
    default:
      return <Badge variant="secondary">{priority}</Badge>
  }
}

export default function ComplianceDashboardPage() {
  const [activeTab, setActiveTab] = useState("pending")
  const [selectedApplication, setSelectedApplication] = useState<ComplianceApplication | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [applicationsData, setApplicationsData] = useState<ComplianceApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)

  const [showDocumentExplorer, setShowDocumentExplorer] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [existingComments, setExistingComments] = useState<{ [key: string]: string }>({})
  const [allDepartmentComments, setAllDepartmentComments] = useState<{ [key: string]: any[] }>({})
  const [spuChecklist, setSpuChecklist] = useState<any[]>([])
  const [resolveComment, setResolveComment] = useState("")
  const { toast } = useToast()

  // Fetch Compliance applications from API
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/v1/applications/department/COMPLIANCE/paginated/paginated?page=${page}&pageSize=${pageSize}`, { cache: 'no-store' })
        const result = await response.json()
        
        if (response.ok) {
          const data = result?.data || []
          setApplicationsData(data)
          setTotal(result?.total || 0)
          console.log('✅ COMPLIANCE: Fetched', data?.length || 0, 'applications (paginated)')
          console.log('📋 Compliance Applications:', data)
        } else {
          console.error('❌ COMPLIANCE: Failed to fetch applications:', result)
          toast({
            title: "Error",
            description: "Failed to fetch applications",
            variant: "destructive"
          })
        }
      } catch (error) {
        console.error('❌ COMPLIANCE: Error fetching applications:', error)
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

  const filteredApplications = applicationsData.filter(app => {
    const matchesSearch = app.applicant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.los_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.loan_type.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || app.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const pendingApplications = filteredApplications.filter(app => 
    app.status === "forwarded_to_compliance" || app.status === 'forwarded_to_risk&compliance'
  )

  const processedApplications = filteredApplications.filter(app => 
    ["resolved_by_compliance", "rejected_by_compliance", "non_compliant", "returned_by_compliance"].includes(app.status)
  )

  const nonCompliantApplications = filteredApplications.filter(app => 
    app.status === "non_compliant" || app.status === "compliance_rejected"
  )

  // Fetch SPU checklist for selected application
  const fetchSpuChecklist = async (losId: string) => {
    try {
      const response = await fetch(`/api/applications/spu-checklist/${losId}`)
      const data = await response.json()
      
      if (response.ok) {
        setSpuChecklist(data.checklist || [])
      } else {
        console.error('Failed to fetch SPU checklist:', data)
        setSpuChecklist([])
      }
    } catch (error) {
      console.error('Error fetching SPU checklist:', error)
      setSpuChecklist([])
    }
  }

  // Fetch full application form data
  const fetchApplicationFormData = async (application: ComplianceApplication) => {
    try {
      const losId = application.los_id.replace('LOS-', '')
      const response = await fetch(`/api/applications/form/${losId}`)
      const data = await response.json()
      
      if (response.ok) {
        // Update selectedApplication with form data
        setSelectedApplication({
          ...application,
          formData: data.formData
        })
        
        // Also fetch SPU checklist
        await fetchSpuChecklist(losId)
      } else {
        console.error('Failed to fetch form data:', data)
        fetchApplicationFormData(application)
      }
    } catch (error) {
      console.error('Error fetching form data:', error)
      fetchApplicationFormData(application)
    }
  }

  // Handle compliance action
  const handleComplianceAction = async (application: ComplianceApplication, action: 'approve' | 'reject') => {
    try {
      // Check for mandatory comment on approve action
      if (action === 'approve' && !resolveComment.trim()) {
        toast({
          title: "Comment Required",
          description: "Please provide a resolve comment before resolving the application",
          variant: "destructive"
        })
        return
      }

      let newStatus = ''
      let actionText = ''
      let requestBody: any = {
        losId: application.los_id.replace('LOS-', ''),
        status: newStatus,
        applicationType: application.application_type,
        department: 'COMPLIANCE',
        action: action
      }
      
      switch (action) {
        case 'approve':
          newStatus = 'resolved_by_compliance'
          actionText = 'resolved and sent back to SPU'
          requestBody.resolveComment = resolveComment.trim()
          break
        case 'reject':
          newStatus = 'rejected_by_compliance'
          actionText = 'rejected'
          if (resolveComment.trim()) {
            requestBody.resolveComment = resolveComment.trim()
          }
          break
      }

      requestBody.status = newStatus

      const response = await fetch('/api/applications/update-status-workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: `Application ${actionText} successfully`
        })
        
        // Clear resolve comment and refresh applications list
        setResolveComment("")
        window.location.reload()
      } else {
        throw new Error(result.error || 'Failed to update application')
      }
    } catch (error) {
      console.error('Error updating application:', error)
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-lg text-muted-foreground">Loading Compliance applications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Compliance Department Dashboard</h1>
        <Button>Generate Compliance Reports</Button>
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Pending Review ({pendingApplications.length})</TabsTrigger>
          <TabsTrigger value="processed">Processed ({processedApplications.length})</TabsTrigger>
          <TabsTrigger value="non-compliant">Non-Compliant ({nonCompliantApplications.length})</TabsTrigger>
        </TabsList>

        {/* Search and Filter */}
        <div className="flex gap-4 my-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="forwarded_to_compliance">Pending Review</SelectItem>
              <SelectItem value="forwarded_to_risk&compliance">Pending (Both Depts)</SelectItem>
              <SelectItem value="resolved_by_compliance">Compliance Approved</SelectItem>
              <SelectItem value="rejected_by_compliance">Compliance Rejected</SelectItem>
              <SelectItem value="non_compliant">Non-Compliant</SelectItem>
              <SelectItem value="returned_by_compliance">Returned</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Compliance Reviews</CardTitle>
              <CardDescription>Applications requiring compliance evaluation</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>LOS ID</TableHead>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Loan Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingApplications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell className="font-medium">{application.los_id}</TableCell>
                      <TableCell>{application.applicant_name}</TableCell>
                      <TableCell>{application.loan_type}</TableCell>
                      <TableCell>PKR {parseInt(application.loan_amount).toLocaleString()}</TableCell>
                      <TableCell>{getPriorityBadge(application.priority)}</TableCell>
                      <TableCell>{getStatusBadge(application.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => fetchApplicationFormData(application)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleComplianceAction(application, 'approve')}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleComplianceAction(application, 'reject')}
                          >
                            Reject
                          </Button>

                        </div>
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

        <TabsContent value="processed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Processed Applications</CardTitle>
              <CardDescription>Applications that have been processed by Compliance</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>LOS ID</TableHead>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Loan Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedApplications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell className="font-medium">{application.los_id}</TableCell>
                      <TableCell>{application.applicant_name}</TableCell>
                      <TableCell>{application.loan_type}</TableCell>
                      <TableCell>PKR {parseInt(application.loan_amount).toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(application.status)}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => fetchApplicationFormData(application)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="non-compliant" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Non-Compliant Applications</CardTitle>
              <CardDescription>Applications flagged for compliance issues</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>LOS ID</TableHead>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Loan Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {nonCompliantApplications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell className="font-medium">{application.los_id}</TableCell>
                      <TableCell>{application.applicant_name}</TableCell>
                      <TableCell>{application.loan_type}</TableCell>
                      <TableCell>PKR {parseInt(application.loan_amount).toLocaleString()}</TableCell>
                      <TableCell>{getPriorityBadge(application.priority)}</TableCell>
                      <TableCell>{getStatusBadge(application.status)}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => fetchApplicationFormData(application)}
                        >
                          <Eye className="h-4 w-4" />
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

      {/* Application Detail Dialog */}
      {selectedApplication && (
        <Dialog open={!!selectedApplication} onOpenChange={() => {
          setSelectedApplication(null)
          setResolveComment("")
        }}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
            <DialogHeader className="sticky top-0 bg-white z-10 pb-4 border-b">
              <DialogTitle>Application Details - {selectedApplication.los_id}</DialogTitle>
              <DialogDescription>
                Compliance review for {selectedApplication.applicant_name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="overflow-y-auto max-h-[calc(90vh-120px)] space-y-6 pr-2">
              {/* Basic Information Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Applicant Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="font-medium">Full Name:</span>
                      <span>{selectedApplication.formData?.first_name} {selectedApplication.formData?.middle_name} {selectedApplication.formData?.last_name}</span>
                      <span className="font-medium">Age:</span>
                      <span>{selectedApplication.formData?.age || 0} years</span>
                      <span className="font-medium">Monthly Income:</span>
                      <span>{selectedApplication.formData?.net_monthly_income ? `PKR ${selectedApplication.formData.net_monthly_income.toLocaleString()}` : 'Not provided'}</span>
                      <span className="font-medium">Branch:</span>
                      <span>{selectedApplication.formData?.branch_code || 'Not provided'}</span>
                      <span className="font-medium">Application Date:</span>
                      <span>{selectedApplication.formData?.created_at ? new Date(selectedApplication.formData.created_at).toLocaleDateString() : 'Not provided'}</span>
                      <span className="font-medium">Status:</span>
                      <span>{getStatusBadge(selectedApplication.status)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Banknote className="h-5 w-5" />
                      Loan Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="font-medium">Loan Type:</span>
                      <span>{selectedApplication.loan_type}</span>
                      <span className="font-medium">Amount:</span>
                      <span className="font-semibold text-green-600">PKR {selectedApplication.loan_amount?.toLocaleString()}</span>
                      <span className="font-medium">Status:</span>
                      <span>{getStatusBadge(selectedApplication.status)}</span>
                      <span className="font-medium">Priority:</span>
                      <span>{selectedApplication.priority}</span>
                      <span className="font-medium">LOS ID:</span>
                      <span>{selectedApplication.los_id}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Compliance Review Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Review Progress</span>
                        <span className="text-sm font-bold">Ready</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Application ready for compliance review
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Form Data Section */}
              {selectedApplication.formData && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Application Form Data
                    </CardTitle>
                    <CardDescription>
                      Complete form data for compliance review
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Dynamic Field Display - Shows ALL database fields automatically */}
                    <MinimalFieldDisplay 
                      data={selectedApplication.formData}
                      title="Application Data"
                      productType="cashplus"
                    />
                  </CardContent>
                </Card>
              )}

              {/* SPU Checklist Section */}
              {spuChecklist && spuChecklist.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckSquare className="h-5 w-5" />
                      SPU Risk Checklist
                    </CardTitle>
                    <CardDescription>
                      Risk checks performed by SPU team
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { key: 'ecib', label: 'eCIB – Source SBP', description: 'If Defaulter (unpaid credit history) then application sent to Risk Policy unit for approval.' },
                        { key: 'frmu', label: 'FRMU – Source Internal', description: 'Check for API. If output is No Record then pass. If output shows Name & NIC then red flag for fraud and application forwarded to Risk Policy unit & Compliance unit.' },
                        { key: 'negative_list', label: 'Negative (Watch) List – Source Internal', description: 'If Name/CNIC appears on Excel report then send to Compliance unit for approval.' },
                        { key: 'pep_list', label: 'PEP List – Source international databases Excel', description: 'If Name appears on Excel report then send to Compliance unit for approval.' },
                        { key: 'credit_card_30k', label: 'High Value Credit Card List – Source SBP', description: 'If Name/CNIC appears on Excel report then send to Risk Policy for approval.' },
                        { key: 'black_list', label: 'Black List – Source Internal', description: 'If Name/CNIC appears on Excel report then send to Risk Policy for approval.' },
                        { key: 'ctl', label: 'CTL – Source Internal', description: 'Check for API. Shows history of past credit cards. If output is No Record then pass. If output shows Name/CNIC then send application to Risk Policy for approval.' }
                      ].map((item) => {
                        const checklistItem = spuChecklist.find(c => c.check_type === item.key)
                        return (
                          <div key={item.key} className="border rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <div className="flex items-center space-x-2">
                                <Checkbox 
                                  checked={checklistItem?.is_checked || false}
                                  disabled={true}
                                />
                              </div>
                              <div className="flex-1">
                                <Label className="text-sm font-medium">{item.label}</Label>
                                <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                                {checklistItem?.comment && (
                                  <div className="mt-2">
                                    <Label className="text-xs font-medium text-blue-600">SPU Comment:</Label>
                                    <p className="text-xs text-gray-700 bg-blue-50 p-2 rounded mt-1">{checklistItem.comment}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Resolve Comment Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Compliance Review Comments
                  </CardTitle>
                  <CardDescription>
                    Provide mandatory comments when resolving applications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Label htmlFor="resolve-comment">
                      Resolve Comment <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="resolve-comment"
                      placeholder="Please provide your compliance review resolution comments and reasons for your decision..."
                      value={resolveComment}
                      onChange={(e) => setResolveComment(e.target.value)}
                      className="min-h-[100px]"
                    />
                    {!resolveComment.trim() && (
                      <p className="text-sm text-red-500">
                        Comment is required for resolving applications
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Actions Section */}
              <div className="flex gap-2">
                <Button onClick={() => setShowDocumentExplorer(true)}>
                  <FolderOpen className="h-4 w-4 mr-2" />
                  View Documents
                </Button>
              </div>
            </div>

            <DialogFooter className="sticky bottom-0 bg-white border-t pt-4">
              <Button variant="outline" onClick={() => {
                setSelectedApplication(null)
                setResolveComment("")
              }}>
                Close
              </Button>
              <Button 
                onClick={() => handleComplianceAction(selectedApplication, 'approve')}
                className="bg-green-600 hover:bg-green-700"
              >
                Resolve & Send to SPU
              </Button>
              <Button 
                variant="destructive"
                onClick={() => handleComplianceAction(selectedApplication, 'reject')}
              >
                Reject & Send to RRU
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Document Explorer */}
      {showDocumentExplorer && selectedApplication && (
        <DocumentExplorer
          losId={selectedApplication.los_id}
          applicationType={selectedApplication.application_type}
          onFileSelect={() => {}}
        />
      )}
    </div>
  )
}