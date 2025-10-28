"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Clock, CheckCircle, AlertTriangle, FileText, Eye, MoreHorizontal, Search, Shield, User, Banknote, Activity, FolderOpen, Calculator } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDateTime } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import DocumentExplorer from "@/components/document-explorer"
import DecisionEngineCalculator from "@/components/decision-engine-calculator"
import { DynamicFieldDisplay } from "@/components/dynamic-field-display"

// Real data interface for CIU applications
interface CIUApplication {
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
  formData?: any
}

const statsData = [
  {
    title: "Pending Investigations",
    value: "16",
    change: "+5 from yesterday",
    icon: Search,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  {
    title: "Flagged Applications",
    value: "4",
    change: "Needs attention",
    icon: AlertTriangle,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  {
    title: "Verified Today",
    value: "8",
    change: "+2 from yesterday",
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    title: "Total Processed",
    value: "132",
    change: "This month",
    icon: Shield,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
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
    case "APPLICATION_ACCEPTED":
    case "application_accepted":
    case "Accepted by CIU":
      return <Badge className="bg-green-100 text-green-800">Accepted by CIU</Badge>
    case "APPLICATION_REJECTED":
    case "application_rejected":
    case "Rejected by CIU":
      return <Badge variant="destructive">Rejected by CIU</Badge>
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

export default function CIUDashboardPage() {
  const [applicationsData, setApplicationsData] = useState<CIUApplication[]>([])
  const [selectedApplication, setSelectedApplication] = useState<CIUApplication | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loanTypeFilter, setLoanTypeFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [showDocumentExplorer, setShowDocumentExplorer] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [existingComments, setExistingComments] = useState<{ [key: string]: string }>({})
  const [allDepartmentComments, setAllDepartmentComments] = useState<{ [key: string]: any[] }>({})
  const [spuChecklist, setSpuChecklist] = useState<any[] | null>(null)
  const [spuChecklistLoading, setSpuChecklistLoading] = useState<boolean>(false)
  const { toast } = useToast()

  // Function to handle viewing application form data
  const handleViewApplication = async (application: any) => {
    try {
      console.log('🔄 Fetching form data for application:', application.los_id);
      const losId = application.los_id.replace('LOS-', ''); // Extract numeric part
      const response = await fetch(`/api/applications/form/${losId}`, { 
        method: 'GET', 
        headers: { 'Content-Type': 'application/json' } 
      });
      if (!response.ok) { 
        throw new Error('Failed to fetch form data'); 
      }
      const data = await response.json();
      console.log('✅ Form data fetched successfully:', data);
      
      // Improved age calculation
      let age = 0; 
      if (data.formData.date_of_birth) { 
        console.log('Raw date_of_birth:', data.formData.date_of_birth);
        
        const dob = new Date(data.formData.date_of_birth); 
        const today = new Date(); 
        
        console.log('Parsed DOB:', dob);
        console.log('Today:', today);
        
        // Check if the date is valid
        if (isNaN(dob.getTime())) {
          console.error('Invalid date of birth:', data.formData.date_of_birth);
          age = 0;
        } else {
          age = today.getFullYear() - dob.getFullYear(); 
          
          // Check if birthday hasn't occurred this year yet
          const monthDiff = today.getMonth() - dob.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) { 
            age--; 
          }
          
          console.log('Calculated age:', age);
        }
      } else {
        console.log('No date_of_birth found in formData');
      }

      // Add age to the data 
      data.formData.age = age; 
      console.log('✅ Form data fetched successfully:', data); 
      
      setSelectedApplication({ ...application, formData: data.formData });
      
      // Fetch all department comments for this application
      await fetchAllDepartmentComments(losId);
      // Fetch SPU checklist for CIU visibility
      await fetchSpuChecklist(losId)
      
      toast({ 
        title: "Form Data Loaded", 
        description: `Application form data has been loaded successfully.` 
      });
    } catch (error) {
      console.error('❌ Error fetching form data:', error);
      toast({ 
        title: "Error", 
        description: "Failed to fetch application form data.", 
        variant: "destructive" 
      });
    }
  };

  const fetchSpuChecklist = async (losId: string) => {
    try {
      setSpuChecklistLoading(true)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/applications/spu-checklist/${losId}`)
      const data = await res.json()
      if (res.ok && data?.success) {
        setSpuChecklist(Array.isArray(data.checklist) ? data.checklist : [])
      } else {
        setSpuChecklist([])
      }
    } catch (err) {
      setSpuChecklist([])
    } finally {
      setSpuChecklistLoading(false)
    }
  }

  const tryExtractEcibMetrics = (comment?: string): { principal?: number; markup?: number; others?: number; total?: number } | null => {
    if (!comment) return null
    const num = (s?: string) => (s ? Number(String(s).replace(/[,\s]/g, '')) : undefined)
    const p = comment.match(/Principal\s*:\s*([0-9,]+)/i)?.[1]
    const m = comment.match(/Mark-?up\s*:\s*([0-9,]+)/i)?.[1]
    const o = comment.match(/Others?\s*:\s*([0-9,]+)/i)?.[1]
    const t = comment.match(/Total\s*:\s*([0-9,]+)/i)?.[1]
    if (p || m || o || t) return { principal: num(p), markup: num(m), others: num(o), total: num(t) }
    return null
  }

  // Fetch CIU applications from API
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/applications/department/CIU/paginated?page=${page}&pageSize=${pageSize}`, { cache: 'no-store' })
        const result = await response.json()
        
        if (response.ok) {
          const data = result?.data || []
          setApplicationsData(data)
          setTotal(result?.total || 0)
          console.log('✅ CIU: Fetched', data.length, 'applications (paginated)')
        } else {
          console.error('❌ CIU: Failed to fetch applications:', result)
          toast({
            title: "Error",
            description: "Failed to fetch applications",
            variant: "destructive"
          })
        }
      } catch (error) {
        console.error('❌ CIU: Error fetching applications:', error)
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
      const fieldName = 'ciu_comments' // Department-specific comment field
      
      console.log(`🔄 CIU: Updating comment for LOS ID: ${losId}, Field: ${fieldName}`)

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
        console.error('❌ CIU: Failed to update comment:', errorData)
        toast({
          title: "Error",
          description: "Failed to save comment. Please try again.",
          variant: "destructive"
        })
        return
      }

      const data = await response.json()
      console.log(`✅ CIU: Comment updated successfully for LOS ID: ${losId}`)

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
      console.error('❌ CIU: Error updating comment:', error)
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

  // Handle accepting application
  const handleAcceptApplication = async () => {
    if (!selectedApplication) return
    
    try {
      // Update status in backend using workflow
      const losId = selectedApplication.los_id?.replace('LOS-', '') || selectedApplication.id?.split('-')[1]
      console.log('CIU Frontend accepting losId:', losId, 'applicationType:', selectedApplication.application_type)
      const response = await fetch('/api/applications/update-status-workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          losId: losId,
          status: selectedApplication.status, // Send current status, not target status
          applicationType: selectedApplication.application_type,
          department: 'CIU',
          action: 'approve'
        })
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('Backend error response:', errorData)
        throw new Error(`Failed to update status: ${errorData}`)
      }
      
      // Update application status in frontend
      const updatedApplications = applicationsData.map(app => 
        app.id === selectedApplication.id 
          ? { ...app, status: "Accepted by CIU" }
          : app
      )
      setApplicationsData(updatedApplications)
      
      toast({
        title: "Application Accepted",
        description: "Application has been accepted by CIU and status updated in database",
      })
      setSelectedApplication(null)
    } catch (error) {
      console.error('Error updating status:', error)
      toast({
        title: "Error",
        description: "Failed to accept application",
        variant: "destructive"
      })
    }
  }

  // Handle rejecting application
  const handleRejectApplication = async () => {
    if (!selectedApplication) return
    
    try {
      // Update status in backend using workflow
      const losId = selectedApplication.los_id?.replace('LOS-', '') || selectedApplication.id?.split('-')[1]
      console.log('CIU Frontend rejecting losId:', losId, 'applicationType:', selectedApplication.application_type)
      const response = await fetch('/api/applications/update-status-workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          losId: losId,
          status: selectedApplication.status, // Send current status, not target status
          applicationType: selectedApplication.application_type,
          department: 'CIU',
          action: 'reject'
        })
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('Backend error response:', errorData)
        throw new Error(`Failed to update status: ${errorData}`)
      }
      
      // Update application status in frontend
      const updatedApplications = applicationsData.map(app => 
        app.id === selectedApplication.id 
          ? { ...app, status: "Rejected by CIU" }
          : app
      )
      setApplicationsData(updatedApplications)
      
      toast({
        title: "Application Rejected",
        description: "Application has been rejected by CIU and status updated in database",
        variant: "destructive"
      })
      setSelectedApplication(null)
    } catch (error) {
      console.error('Error updating status:', error)
      toast({
        title: "Error",
        description: "Failed to reject application",
        variant: "destructive"
      })
    }
  }

  const normalizedIncludes = (value: string, q: string) => value?.toString().toLowerCase().includes(q)
  const filteredApplications = applicationsData.filter((app: CIUApplication) => {
    const q = searchTerm.trim().toLowerCase()
    const matchesSearch = !q || (
      normalizedIncludes(app.applicant_name, q) ||
      normalizedIncludes(app.los_id, q) ||
      normalizedIncludes(app.loan_type, q) ||
      normalizedIncludes(String(app.loan_amount ?? ''), q) ||
      normalizedIncludes(app.status, q) ||
      normalizedIncludes(app.priority, q) ||
      normalizedIncludes(app.branch ?? '', q)
    )
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter
    const matchesLoanType = loanTypeFilter === 'all' || app.loan_type === loanTypeFilter
    return matchesSearch && matchesStatus && matchesLoanType
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Central Investigation Unit Dashboard</h1>
        <Button>Process Next</Button>
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

      {/* Search and Filters */}
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
                  placeholder="Search by anything (name, LOS, loan type, status, amount, branch)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="block border rounded-md h-10 px-3">
                <option value="all">All</option>
                <option value="submitted_to_ciu">Submitted to CIU</option>
                <option value="application_completed">Application Completed</option>
                <option value="loan_disbursed">Loan Disbursed</option>
                <option value="card_issued">Card Issued</option>
                <option value="offer_letter_issued">Offer Letter Issued</option>
                <option value="Rejected by CIU">Rejected by CIU</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Loan Type</label>
              <select value={loanTypeFilter} onChange={(e) => setLoanTypeFilter(e.target.value)} className="block border rounded-md h-10 px-3">
                <option value="all">All</option>
                <option value="CashPlus Loan">CashPlus Loan</option>
                <option value="Auto Loan">Auto Loan</option>
                <option value="AmeenDrive Loan">AmeenDrive Loan</option>
                <option value="SME Loan">SME Loan</option>
                <option value="Commercial Vehicle Loan">Commercial Vehicle Loan</option>
                <option value="Platinum Credit Card">Platinum Credit Card</option>
                <option value="Classic Credit Card">Classic Credit Card</option>
              </select>
            </div>
            <div className="ml-auto">
              <Button variant="outline" onClick={() => { setSearchTerm(''); setStatusFilter('all'); setLoanTypeFilter('all'); }}>Clear</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table with CSV export */}
      <Card>
        <CardHeader>
          <CardTitle>Investigation Queue ({filteredApplications.length})</CardTitle>
          <CardDescription>Applications requiring verification and investigation</CardDescription>
          <div className="mt-2">
            <Button variant="outline" onClick={() => {
              const headers = ['LOS ID','Applicant','Loan Type','Amount','Status','Priority','Application Started','Last Updated']
              const rows = filteredApplications.map(a => [
                a.los_id,
                a.applicant_name,
                a.loan_type,
                a.loan_amount ?? '',
                a.status,
                a.priority ?? '',
                formatDateTime(a.created_at),
                formatDateTime((a as any).updated_at || a.created_at)
              ])
              const all = [headers, ...rows]
              const csv = all.map(r => r.map(c => {
                const s = String(c ?? '')
                return (s.includes(',') || s.includes('"') || s.includes('\n')) ? `"${s.replace(/"/g,'""')}"` : s
              }).join(',')).join('\n')
              const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' })
              const url = URL.createObjectURL(blob)
              const link = document.createElement('a')
              link.href = url
              link.download = `CIU_Applications_${new Date().toISOString().slice(0,10)}.csv`
              link.click()
              URL.revokeObjectURL(url)
            }}>Export CSV</Button>
          </div>
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
                <TableHead>Priority</TableHead>
                <TableHead>Application Started</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    Loading applications...
                  </TableCell>
                </TableRow>
              ) : filteredApplications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    No applications found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredApplications.map((app) => (
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
                    <TableCell>{getStatusBadge(app.status)}</TableCell>
                    <TableCell>{getPriorityBadge(app.priority)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDateTime(app.created_at)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDateTime((app as any).updated_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewApplication(app)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
                            <DialogHeader className="sticky top-0 bg-white z-10 pb-4 border-b">
                              <DialogTitle>Application Details - {selectedApplication?.los_id}</DialogTitle>
                              <DialogDescription>
                                Complete application information for CIU investigation
                              </DialogDescription>
                            </DialogHeader>
                            {selectedApplication && (
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
                                        Application Progress
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                      <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm font-medium">Completion</span>
                                          <span className="text-sm font-bold">85%</span>
                                        </div>
                                        <Progress value={85} className="w-full" />
                                        <div className="text-xs text-muted-foreground">
                                          15% remaining
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
                                        Complete form data retrieved from database
                                      </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                      {/* Dynamic Field Display - Shows ALL database fields automatically */}
                                      <DynamicFieldDisplay 
                                        data={selectedApplication.formData}
                                        title="Complete Application Data"
                                        excludeFields={['password', 'password_hash']}
                                      />

                                      {/* Comments Section and other important sections below */}
                                      <div className="mt-8 space-y-6">
                                        {/* Comments Section */}
                                        <div>
                                          <h4 className="font-semibold mb-3 text-purple-600">All Department Comments</h4>
                                          {/* SPU Checklist remarks visible to CIU */}
                                          <div className="mb-3">
                                            <div className="text-xs text-gray-600 mb-1">SPU Checklist</div>
                                            {spuChecklistLoading ? (
                                              <div className="text-xs text-gray-500">Loading SPU checklist…</div>
                                            ) : spuChecklist && spuChecklist.length > 0 ? (
                                              <div className="space-y-2">
                                                {spuChecklist.map((item: any, idx: number) => (
                                                  <div key={idx} className="border rounded-lg p-2 bg-green-50 border-green-200">
                                                    <div className="flex items-center justify-between text-xs">
                                                      <span className="font-medium text-green-800">{item.check_type?.toUpperCase?.() || item.check_type}</span>
                                                      <span className={`px-2 py-0.5 rounded ${item.is_checked ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>{item.is_checked ? 'Checked' : 'Unchecked'}</span>
                                                    </div>
                                                    {item.comment_text && (
                                                      <div className="mt-1 text-sm text-gray-700">{item.comment_text}</div>
                                                    )}
                                                    {item.check_type === 'ecib' && item.comment_text && (() => {
                                                      const m = tryExtractEcibMetrics(item.comment_text)
                                                      return m ? (
                                                        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                                                          <div className="bg-blue-50 border border-blue-200 rounded p-2 text-center">
                                                            <div className="text-[10px] text-blue-700 uppercase tracking-wide">Principal</div>
                                                            <div className="text-sm font-semibold text-blue-900">{m.principal?.toLocaleString() ?? '—'}</div>
                                                          </div>
                                                          <div className="bg-indigo-50 border border-indigo-200 rounded p-2 text-center">
                                                            <div className="text-[10px] text-indigo-700 uppercase tracking-wide">Mark-up</div>
                                                            <div className="text-sm font-semibold text-indigo-900">{m.markup?.toLocaleString() ?? '—'}</div>
                                                          </div>
                                                          <div className="bg-teal-50 border border-teal-200 rounded p-2 text-center">
                                                            <div className="text-[10px] text-teal-700 uppercase tracking-wide">Others</div>
                                                            <div className="text-sm font-semibold text-teal-900">{m.others?.toLocaleString() ?? '—'}</div>
                                                          </div>
                                                          <div className="bg-rose-50 border border-rose-200 rounded p-2 text-center">
                                                            <div className="text-[10px] text-rose-700 uppercase tracking-wide">Total</div>
                                                            <div className="text-sm font-semibold text-rose-900">{m.total?.toLocaleString() ?? '—'}</div>
                                                          </div>
                                                        </div>
                                                      ) : null
                                                    })()}
                                                  </div>
                                                ))}
                                              </div>
                                            ) : (
                                              <div className="text-xs text-gray-500">No SPU checklist remarks</div>
                                            )}
                                          </div>
                                          {allDepartmentComments[selectedApplication.los_id.replace('LOS-', '')] && 
                                           allDepartmentComments[selectedApplication.los_id.replace('LOS-', '')].length > 0 ? (
                                            <div className="space-y-3">
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
                                          ) : (
                                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                              <p className="text-sm text-gray-500 italic">
                                                No comments from any department yet
                                              </p>
                                            </div>
                                          )}
                                        </div>

                                        {/* Raw Data (for debugging) */}
                                        <details className="mt-4">
                                          <summary className="cursor-pointer text-sm font-medium text-gray-600">View Raw Data</summary>
                                          <div className="mt-2 bg-gray-50 p-4 rounded-lg">
                                            <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                                              {JSON.stringify(selectedApplication.formData, null, 2)}
                                            </pre>
                                          </div>
                                        </details>
                                      </div>
                                    </CardContent>
                                  </Card>
                                )}

                                {/* Decision Engine Calculator with ECIB Integration */}
                                {selectedApplication && (
                                  <DecisionEngineCalculator 
                                    losId={selectedApplication.los_id.replace('LOS-', '')} 
                                    applicationData={selectedApplication.formData}
                                    onDecisionComplete={(decision) => {
                                      console.log('Decision completed:', decision)
                                      toast({
                                        title: "Decision Complete",
                                        description: `Decision: ${decision.decision} | Score: ${decision.final_score}`,
                                      })
                                    }}
                                  />
                                )}

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

                                {/* Notes Section */}
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">Notes</CardTitle>
                                    <CardDescription>
                                      Add comments and notes about this application
                                    </CardDescription>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="space-y-4">
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
                                          placeholder="Add any notes or comments about the investigation process..."
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

                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => setSelectedApplication(null)}
                                  >
                                    Close
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={handleRejectApplication}
                                  >
                                    <AlertTriangle className="mr-2 h-4 w-4" />
                                    Reject
                                  </Button>
                                  <Button
                                    variant="default"
                                    onClick={handleAcceptApplication}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Accept
                                  </Button>
                                </div>
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
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Page {page} of {Math.max(1, Math.ceil(total / pageSize))} • {total} total
            </div>
            <div className="flex items-center gap-2">
              <Select value={String(pageSize)} onValueChange={(v: string) => { setPageSize(parseInt(v, 10)); setPage(1) }}>
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
    </div>
  )
} 