"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { LayoutDashboard, ClipboardList, FileSearch, CheckCircle, Eye, ThumbsUp, ThumbsDown, MapPin, Camera, FileText, User, MessageSquare, CheckSquare, AlertCircle, Clock, DollarSign, Building, Phone, Mail, Calendar, Shield, TrendingUp, Users, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DocumentExplorer from "@/components/document-explorer";
import { DynamicFieldDisplay } from "@/components/dynamic-field-display";

export default function EAMVUOfficerDashboard() {
  const [assignedApplications, setAssignedApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApplication, setSelectedApplication] = useState<any>(null)
  const [investigationNotes, setInvestigationNotes] = useState("")
  const [showDocuments, setShowDocuments] = useState(false)
  const [currentAgent, setCurrentAgent] = useState("")
  const [showAgentSelector, setShowAgentSelector] = useState(false)
  const [showApplicationDetails, setShowApplicationDetails] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const { toast } = useToast()
  const [documentsRefreshKey, setDocumentsRefreshKey] = useState<number>(0)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [uploadingDoc, setUploadingDoc] = useState<boolean>(false)

  const [availableAgents, setAvailableAgents] = useState<any[]>([])

  // Enhanced metrics with comprehensive data
  const officerMetrics = [
    { 
      title: "Assigned Cases", 
      count: assignedApplications.length, 
      icon: ClipboardList,
      description: "Total active assignments"
    },
    { 
      title: "In Investigation", 
      count: assignedApplications.filter(app => app.status === 'assigned_to_eavmu_officer').length, 
      icon: FileSearch,
      description: "Currently being processed"
    },
    { 
      title: "Completed Today", 
      count: assignedApplications.filter(app => app.status === 'returned_by_eavmu_officer').length, 
      icon: CheckCircle,
      description: "Finished investigations"
    },
    { 
      title: "Avg. Processing Time", 
      count: "2.3 days", 
      icon: Clock,
      description: "Time to complete investigation"
    },
  ];

  // Fetch available agents from backend
  const fetchAgents = async () => {
    try {
      // Call backend directly (backend endpoint is available and seeded)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/agents`, { cache: 'no-store' })
      if (response.ok) {
        const agentsData = await response.json()
        console.log('🔄 Agents Data:', agentsData);
        setAvailableAgents(agentsData)
      } else {
        setAvailableAgents([])
      }
    } catch (error) {
      console.error('Error fetching agents:', error)
      setAvailableAgents([])
    }
  }

  useEffect(() => {
    // Fetch agents and check if agent is already selected in localStorage
    fetchAgents()
    const storedAgent = localStorage.getItem('currentEAMVUAgent')
    if (storedAgent) {
      setCurrentAgent(storedAgent)
      fetchAssignedApplications(storedAgent)
    } else {
      setShowAgentSelector(true)
    }
  }, [])

  // Auto-select first agent if available and none selected
  useEffect(() => {
    if (availableAgents.length > 0 && !currentAgent && !showAgentSelector) {
      const firstActiveAgent = availableAgents.find(agent => agent.status === 'active')
      if (firstActiveAgent) {
        handleAgentSelection(firstActiveAgent.agent_id)
      }
    }
  }, [availableAgents, currentAgent, showAgentSelector])

  // Fetch applications when agent changes
  useEffect(() => {
    if (currentAgent) {
      fetchAssignedApplications(currentAgent)
    }
  }, [currentAgent])

  const fetchAssignedApplications = async (agentId?: string) => {
    console.log('🔄 Fetching comprehensive applications for agent:', agentId)
    if (!agentId) {
      console.log('❌ No agent ID provided')
      return;
    }
    
    try {
      setLoading(true)
      
      // First, get all EAMVU applications (this endpoint works)
      const eamvuResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/applications/department/EAMVU`)
      const eamvuData = await eamvuResponse.json()
      
      if (!eamvuResponse.ok) {
        throw new Error('Failed to fetch EAMVU applications')
      }
      
      console.log('✅ Fetched EAMVU applications:', eamvuData.length)
      
      // Get agent assignments to know which applications are assigned to this specific agent
      const assignmentsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/applications/test/assignments`)
      const assignmentsData = await assignmentsResponse.json()
      
      if (!assignmentsResponse.ok) {
        throw new Error('Failed to fetch agent assignments')
      }
      
      console.log('✅ Fetched agent assignments:', assignmentsData.assignments)
      
      // Get assignments for this specific agent
      const agentAssignments = assignmentsData.assignments.filter((assignment: any) => 
        String(assignment.agent_id) === String(agentId) && assignment.assignment_status === 'active'
      )
      
      console.log('✅ Agent assignments for', agentId, ':', agentAssignments)
      
      // Filter EAMVU applications to only show those assigned to this specific agent
      // Merge assignment metadata (assigned_at, assigned_by) into the EAMVU apps
      const assignedApplications = eamvuData
        .map((app: any) => {
          const match = agentAssignments.find((assignment: any) => {
            const assignedLos = Number(assignment.los_id)
            const appLos = Number(String(app.los_id).replace('LOS-', ''))
            return assignedLos === appLos
          })
          if (!match) return null
          return {
            ...app,
            assigned_at: match.assigned_at,
            assigned_by: match.assigned_by || 'EAMVU_HEAD',
            assignment_status: match.assignment_status,
          }
        })
        .filter(Boolean)
      
      console.log('✅ Filtered applications for agent', agentId, ':', assignedApplications.length)
      console.log('📋 Assigned applications:', assignedApplications)
      
      setAssignedApplications(assignedApplications)
      
    } catch (error) {
      console.error('Error fetching assigned applications:', error)
      toast({
        title: "Error", 
        description: "Failed to connect to server",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAgentSelection = (agentId: string) => {
    const normalizedId = String(agentId)
    console.log('🔄 Agent selected:', normalizedId)
    setCurrentAgent(normalizedId)
    localStorage.setItem('currentEAMVUAgent', normalizedId)
    setShowAgentSelector(false)
    
    const selectedAgentInfo = availableAgents.find(agent => String(agent.agent_id) === normalizedId)
    toast({
      title: "Agent Selected",
      description: `Now showing applications for ${selectedAgentInfo?.name}`,
    })
  }

  const handleViewApplicationDetails = async (application: any) => {
    try {
      console.log('🔄 Fetching comprehensive form data for application:', application.los_id);
      const losId = application.los_id.replace('LOS-', ''); // Extract numeric part
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/applications/form/${losId}`, { 
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
      console.log('✅ Form data with age calculated:', data); 
      
      setSelectedApplication({ ...application, formData: data.formData });
      setShowApplicationDetails(true);
      setActiveTab("overview");
      
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
  }

  // Map display loan type label to canonical slug for document server
  const mapLoanTypeToSlug = (loanTypeLabel: string): string => {
    const map: Record<string, string> = {
      'CashPlus Loan': 'cashplus',
      'Auto Loan': 'autoloan',
      'SME Loan': 'smeasaan',
      'SME Asaan': 'smeasaan',
      'Commercial Vehicle Loan': 'commercialVehicle',
      'SME Commercial': 'commercialVehicle',
      'AmeenDrive Loan': 'ameendrive',
      'Platinum Credit Card': 'creditcard',
      'Classic Credit Card': 'creditcard',
    }
    return map[loanTypeLabel] || loanTypeLabel?.toLowerCase?.() || 'temp'
  }

  const handleUploadEamvuDoc = async (file: File) => {
    if (!selectedApplication) return
    try {
      setUploadingDoc(true)
      const formData = new FormData()
      const losIdNumeric = selectedApplication.los_id.replace('LOS-', '')
      const loanTypeSlug = mapLoanTypeToSlug(selectedApplication.loan_type)
      formData.append('file', file)
      formData.append('loanType', loanTypeSlug)
      formData.append('losId', losIdNumeric)
      formData.append('subfolder', 'eavmu_docs')

      const res = await fetch('/api/upload-document', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data?.details || data?.error || 'Upload failed')
      }
      toast({ title: 'Uploaded', description: `File ${file.name} uploaded to EAMVU docs.` })
      // Refresh document explorer list on next render
      setDocumentsRefreshKey((k) => k + 1)
      setShowDocuments(true)
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err?.message || 'Could not upload file', variant: 'destructive' })
    } finally {
      setUploadingDoc(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleCompleteInvestigation = async (losId: string, applicationType: string) => {
    try {
      // Check if currentAgent is set
      if (!currentAgent) {
        toast({
          title: "Error",
          description: "Please select an agent first",
          variant: "destructive"
        })
        return
      }

      // Require notes before completing
      if (!investigationNotes.trim()) {
        toast({ title: "Investigation notes required", description: "Please add investigation notes before completing.", variant: "destructive" })
        return
      }

      console.log('🔄 Completing investigation with data:', {
        losId,
        status: 'assigned_to_eavmu_officer',
        applicationType: getApplicationType(applicationType),
        department: 'EAMVU_OFFICER',
        action: 'complete',
        agentId: currentAgent
      })

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/applications/update-status-workflow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          losId: losId,
          status: 'assigned_to_eavmu_officer', // Current status
          applicationType: getApplicationType(applicationType),
          department: 'EAMVU_OFFICER',
          action: 'complete',
          agentId: currentAgent
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Investigation completed and returned to EAMVU HEAD"
        })
        
        // Refresh applications
        fetchAssignedApplications(currentAgent)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to complete investigation",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error completing investigation:', error)
      toast({
        title: "Error",
        description: "Failed to complete investigation",
        variant: "destructive"
      })
    }
  }

  const handleRejectApplication = async (losId: string, applicationType: string) => {
    try {
      if (!currentAgent) {
        toast({
          title: "Error",
          description: "Please select an agent first",
          variant: "destructive"
        })
        return
      }

      // Require notes before rejecting
      if (!investigationNotes.trim()) {
        toast({ title: "Investigation notes required", description: "Please add investigation notes before rejecting.", variant: "destructive" })
        return
      }

      console.log('🔄 Rejecting application with data:', {
        losId,
        status: 'assigned_to_eavmu_officer',
        applicationType: getApplicationType(applicationType),
        department: 'EAMVU_OFFICER',
        action: 'reject',
        agentId: currentAgent
      })

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/applications/update-status-workflow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          losId: losId,
          status: 'assigned_to_eavmu_officer',
          applicationType: getApplicationType(applicationType),
          department: 'EAMVU_OFFICER',
          action: 'reject',
          agentId: currentAgent
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Application rejected and returned to EAMVU HEAD"
        })
        
        // Refresh applications
        fetchAssignedApplications(currentAgent)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to reject application",
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

  const handleAddInvestigationNotes = async (losId: string, notes: string) => {
    try {
      if (!notes || !notes.trim()) {
        toast({ title: "Notes required", description: "Please enter investigation notes.", variant: "destructive" })
        return
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/applications/update-comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          losId: losId,
          fieldName: 'eavmu_comments',
          commentText: notes
        })
      })
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Investigation notes added successfully"
        })
        
        // Refresh applications to show updated comments
        fetchAssignedApplications(currentAgent)
      } else {
        toast({
          title: "Error",
          description: "Failed to add investigation notes",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error adding investigation notes:', error)
      toast({
        title: "Error",
        description: "Failed to add investigation notes",
        variant: "destructive"
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "assigned_to_eavmu_officer":
        return <Badge className="bg-blue-100 text-blue-800">Under Investigation</Badge>
      case "returned_by_eavmu_officer":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case "rejected_by_eavmu":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const extractLosId = (id: string) => {
    return id.replace('LOS-', '')
  }

  const getApplicationType = (applicationType: string) => {
    const typeMap: { [key: string]: string } = {
      'CashPlus': 'CashPlus',
      'AutoLoan': 'AutoLoan',
      'SMEASAAN': 'SMEASAAN',
      'CommercialVehicle': 'CommercialVehicle',
      'AmeenDrive': 'AmeenDrive',
      'PlatinumCreditCard': 'PlatinumCreditCard',
      'ClassicCreditCard': 'ClassicCreditCard'
    }
    return typeMap[applicationType] || applicationType
  }

  // Calculate completion percentage based on checklist
  const getCompletionPercentage = (application: any) => {
    if (!application.checklist) return 0
    const checklist = application.checklist
    const totalItems = Object.keys(checklist).length
    const completedItems = Object.values(checklist).filter(Boolean).length
    return Math.round((completedItems / totalItems) * 100)
  }

  // Get workflow stage information
  const getWorkflowStage = (application: any) => {
    const stages = ['PB', 'SPU', 'EAMVU_OFFICER', 'EAMVU_HEAD', 'CIU']
    const currentIndex = stages.indexOf(application.workflow?.current_stage || 'EAMVU_OFFICER')
    return {
      current: stages[currentIndex] || 'EAMVU_OFFICER',
      progress: ((currentIndex + 1) / stages.length) * 100,
      next: stages[currentIndex + 1] || 'EAMVU_HEAD'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">EAMVU Officer Dashboard</h1>
          <p className="text-muted-foreground">Field verification and investigation management</p>
        </div>
        
        {/* Agent Selector */}
        {showAgentSelector && (
          <Dialog open={showAgentSelector} onOpenChange={setShowAgentSelector}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Select Your Agent Profile</DialogTitle>
                <DialogDescription>
                  Choose your agent profile to view assigned applications
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {availableAgents.map((agent) => (
                  <div key={agent.agent_id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{agent.name}</p>
                      <p className="text-sm text-muted-foreground">{agent.email}</p>
                    </div>
                    <Button onClick={() => handleAgentSelection(agent.agent_id)}>
                      Select
                    </Button>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        )}
        
        {/* Current Agent Info */}
        {currentAgent && (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="font-medium">
              {availableAgents.find(a => String(a.agent_id) === String(currentAgent))?.name || 'Unknown Agent'}
            </span>
            <Button variant="outline" size="sm" onClick={() => setShowAgentSelector(true)}>
              Change
            </Button>
          </div>
        )}
      </div>

      {/* Enhanced Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {officerMetrics.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.count}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Applications Table with Enhanced Data */}
      <Card>
        <CardHeader>
          <CardTitle>Assigned Applications</CardTitle>
          <CardDescription>
            Applications assigned to you for field verification and investigation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Loading applications...</p>
              </div>
            </div>
          ) : assignedApplications.length === 0 ? (
            <div className="text-center py-8">
              <FileSearch className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Applications Assigned</h3>
              <p className="text-muted-foreground">
                You don't have any applications assigned to you at the moment.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Application</TableHead>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Loan Details</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignedApplications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{app.los_id}</p>
                          <p className="text-sm text-muted-foreground">{app.application_type}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{app.applicant_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {app.formData?.phone || app.formData?.email || 'Contact info not available'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{app.loan_type}</p>
                          <p className="text-sm text-muted-foreground">
                            PKR {app.loan_amount?.toLocaleString() || '0'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Progress value={getCompletionPercentage(app)} className="h-2" />
                          <p className="text-xs text-muted-foreground">
                            {getCompletionPercentage(app)}% Complete
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(app.status)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{new Date(app.assigned_at).toLocaleDateString()}</p>
                          <p className="text-xs text-muted-foreground">
                            by {app.assigned_by || 'EAMVU_HEAD'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewApplicationDetails(app)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {app.status === 'assigned_to_eavmu_officer' && (
                            <>
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => handleCompleteInvestigation(extractLosId(app.los_id), app.application_type)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Complete
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleRejectApplication(extractLosId(app.los_id), app.application_type)}
                              >
                                <ThumbsDown className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Application Details Dialog */}
      {selectedApplication && (
        <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Application Details - {selectedApplication.los_id}</DialogTitle>
              <DialogDescription>
                Comprehensive application information and investigation tools
              </DialogDescription>
            </DialogHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="checklist">Checklist</TabsTrigger>
                <TabsTrigger value="comments">Comments</TabsTrigger>
                <TabsTrigger value="workflow">Workflow</TabsTrigger>
              </TabsList>
              <TabsContent value="overview">
                {selectedApplication.formData ? (
                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>LOS ID</Label>
                        <p className="font-mono text-sm">{selectedApplication.los_id}</p>
                      </div>
                      <div>
                        <Label>Applicant Name</Label>
                        <p>{selectedApplication.applicant_name}</p>
                      </div>
                      <div>
                        <Label>Loan Type</Label>
                        <p>{selectedApplication.loan_type}</p>
                      </div>
                      <div>
                        <Label>Loan Amount</Label>
                        <p>PKR {selectedApplication.loan_amount?.toLocaleString()}</p>
                      </div>
                      <div>
                        <Label>Priority</Label>
                        <p className="capitalize">{selectedApplication.priority}</p>
                      </div>
                      <div>
                        <Label>Status</Label>
                        <p>{getStatusBadge(selectedApplication.status)}</p>
                      </div>
                      <div>
                        <Label>Branch</Label>
                        <p>{selectedApplication.branch}</p>
                      </div>
                      <div>
                        <Label>Assigned Date</Label>
                        <p>{new Date(selectedApplication.created_at).toLocaleDateString()}</p>
                      </div>
                  </div>

                    {/* Dynamic Field Display - Shows ALL database fields automatically */}
                    <DynamicFieldDisplay 
                      data={selectedApplication.formData}
                      title="Complete Application Data"
                      excludeFields={['password', 'password_hash']}
                    />

                    <div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div><span className="font-medium">Employer Name:</span> {selectedApplication.formData.employer_name || 'Not provided'}</div>
                        <div><span className="font-medium">Designation:</span> {selectedApplication.formData.designation || 'Not provided'}</div>
                        <div><span className="font-medium">Grade Level:</span> {selectedApplication.formData.grade_level || 'Not provided'}</div>
                        <div><span className="font-medium">Department:</span> {selectedApplication.formData.department || 'Not provided'}</div>
                        <div><span className="font-medium">Office Phone 1:</span> {selectedApplication.formData.office_tel1 || 'Not provided'}</div>
                        <div><span className="font-medium">Office Phone 2:</span> {selectedApplication.formData.office_tel2 || 'Not provided'}</div>
                        <div><span className="font-medium">Office Fax:</span> {selectedApplication.formData.office_fax || 'Not provided'}</div>
                        <div><span className="font-medium">Office Extension:</span> {selectedApplication.formData.office_ext || 'Not provided'}</div>
                        <div><span className="font-medium">Office Area:</span> {selectedApplication.formData.office_area || 'Not provided'}</div>
                        <div><span className="font-medium">Office City:</span> {selectedApplication.formData.office_city || 'Not provided'}</div>
                        <div><span className="font-medium">Office Street:</span> {selectedApplication.formData.office_street || 'Not provided'}</div>
                        <div><span className="font-medium">Office House No:</span> {selectedApplication.formData.office_house_no || 'Not provided'}</div>
                        <div><span className="font-medium">Office Landmark:</span> {selectedApplication.formData.office_landmark || 'Not provided'}</div>
                        <div><span className="font-medium">Office Postal Code:</span> {selectedApplication.formData.office_postal_code || 'Not provided'}</div>
                        <div><span className="font-medium">SM Employee No:</span> {selectedApplication.formData.sm_employee_no || 'Not provided'}</div>
                        <div><span className="font-medium">SO Employee No:</span> {selectedApplication.formData.so_employee_no || 'Not provided'}</div>
                        <div><span className="font-medium">PB BM Employee No:</span> {selectedApplication.formData.pb_bm_employee_no || 'Not provided'}</div>
                      </div>
                    </div>

                    {/* Loan Information */}
                    <div>
                      <h4 className="font-semibold mb-3 text-red-600">Loan Information</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div><span className="font-medium">Amount Requested:</span> PKR {selectedApplication.formData.amount_requested?.toLocaleString()}</div>
                        <div><span className="font-medium">Purpose of Loan:</span> {selectedApplication.formData.purpose_of_loan || 'Not provided'}</div>
                        <div><span className="font-medium">Tenure:</span> {selectedApplication.formData.tenure || 'Not provided'} years</div>
                        <div><span className="font-medium">Min Amount Acceptable:</span> {selectedApplication.formData.min_amount_acceptable ? `PKR ${selectedApplication.formData.min_amount_acceptable.toLocaleString()}` : 'Not provided'}</div>
                        <div><span className="font-medium">Max Affordable Installment:</span> {selectedApplication.formData.max_affordable_installment ? `PKR ${selectedApplication.formData.max_affordable_installment.toLocaleString()}` : 'Not provided'}</div>
                      </div>
                    </div>

                    {/* Financial Information */}
                    <div>
                      <h4 className="font-semibold mb-3 text-indigo-600">Financial Information</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div><span className="font-medium">Gross Monthly Salary:</span> {selectedApplication.formData.gross_monthly_salary ? `PKR ${selectedApplication.formData.gross_monthly_salary.toLocaleString()}` : 'Not provided'}</div>
                        <div><span className="font-medium">Net Monthly Income:</span> {selectedApplication.formData.net_monthly_income ? `PKR ${selectedApplication.formData.net_monthly_income.toLocaleString()}` : 'Not provided'}</div>
                        <div><span className="font-medium">Other Monthly Income:</span> {selectedApplication.formData.other_monthly_income ? `PKR ${selectedApplication.formData.other_monthly_income.toLocaleString()}` : 'Not provided'}</div>
                        <div><span className="font-medium">Other Income Sources:</span> {selectedApplication.formData.other_income_sources || 'Not provided'}</div>
                        <div><span className="font-medium">Monthly Rent:</span> {selectedApplication.formData.monthly_rent ? `PKR ${selectedApplication.formData.monthly_rent.toLocaleString()}` : 'Not provided'}</div>
                        <div><span className="font-medium">Account Number:</span> {selectedApplication.formData.account_number || 'Not provided'}</div>
                        <div><span className="font-medium">Is Existing Customer:</span> {selectedApplication.formData.is_existing_customer ? 'Yes' : 'No'}</div>
                        <div><span className="font-medium">Customer ID:</span> {selectedApplication.formData.customer_id || 'Not provided'}</div>
                        <div><span className="font-medium">Accommodation Type:</span> {selectedApplication.formData.accommodation_type || 'Not provided'}</div>
                        <div><span className="font-medium">Dependants:</span> {selectedApplication.formData.dependants || 'Not provided'}</div>
                        <div><span className="font-medium">Experience (Current):</span> {selectedApplication.formData.exp_current_years || 'Not provided'} years</div>
                        <div><span className="font-medium">Experience (Previous):</span> {selectedApplication.formData.exp_prev_years || 'Not provided'} years</div>
                        <div><span className="font-medium">Previous Employer:</span> {selectedApplication.formData.prev_employer_name || 'Not provided'}</div>
                      </div>
                    </div>

                    {/* Credit Cards Clean */}
                    {selectedApplication.formData.credit_cards_clean && selectedApplication.formData.credit_cards_clean.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 text-emerald-600">Clean Credit Cards</h4>
                        <div className="space-y-3">
                          {selectedApplication.formData.credit_cards_clean.map((card: any, index: number) => (
                            <div key={card.id} className="border rounded-lg p-3 bg-green-50">
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div><span className="font-medium">Bank Name:</span> {card.bank_name}</div>
                                <div><span className="font-medium">Approved Limit:</span> PKR {card.approved_limit?.toLocaleString()}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Credit Cards Secured */}
                    {selectedApplication.formData.credit_cards_secured && selectedApplication.formData.credit_cards_secured.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 text-amber-600">Secured Credit Cards</h4>
                        <div className="space-y-3">
                          {selectedApplication.formData.credit_cards_secured.map((card: any, index: number) => (
                            <div key={card.id} className="border rounded-lg p-3 bg-yellow-50">
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div><span className="font-medium">Bank Name:</span> {card.bank_name}</div>
                                <div><span className="font-medium">Approved Limit:</span> PKR {card.approved_limit?.toLocaleString()}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Personal Loans Secured */}
                    {selectedApplication.formData.personal_loans_secured && selectedApplication.formData.personal_loans_secured.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 text-red-600">Secured Personal Loans</h4>
                        <div className="space-y-3">
                          {selectedApplication.formData.personal_loans_secured.map((loan: any, index: number) => (
                            <div key={loan.id} className="border rounded-lg p-3 bg-red-50">
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div><span className="font-medium">Bank Name:</span> {loan.bank_name}</div>
                                <div><span className="font-medium">Approved Limit:</span> PKR {loan.approved_limit?.toLocaleString()}</div>
                                <div><span className="font-medium">Outstanding Amount:</span> PKR {loan.outstanding_amount?.toLocaleString()}</div>
                                <div><span className="font-medium">As of Date:</span> {loan.as_of}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Other Facilities */}
                    {selectedApplication.formData.other_facilities && selectedApplication.formData.other_facilities.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 text-blue-600">Other Banking Facilities</h4>
                        <div className="space-y-3">
                          {selectedApplication.formData.other_facilities.map((facility: any, index: number) => (
                            <div key={facility.id} className="border rounded-lg p-3 bg-blue-50">
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div><span className="font-medium">Nature:</span> {facility.nature}</div>
                                <div><span className="font-medium">Bank Name:</span> {facility.bank_name}</div>
                                <div><span className="font-medium">Approved Limit:</span> PKR {facility.approved_limit?.toLocaleString()}</div>
                                <div><span className="font-medium">Current Outstanding:</span> PKR {facility.current_outstanding?.toLocaleString()}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* References */}
                    {selectedApplication.formData.references && selectedApplication.formData.references.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 text-teal-600">References</h4>
                        <div className="space-y-3">
                          {selectedApplication.formData.references.map((ref: any, index: number) => (
                            <div key={ref.id} className="border rounded-lg p-3 bg-gray-50">
                              <div className="font-medium text-sm mb-2">Reference {index + 1}</div>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div><span className="font-medium">Name:</span> {ref.name || 'Not provided'}</div>
                                <div><span className="font-medium">Relationship:</span> {ref.relationship || 'Not provided'}</div>
                                <div><span className="font-medium">Mobile:</span> {ref.mobile || 'Not provided'}</div>
                                <div><span className="font-medium">CNIC:</span> {ref.cnic || 'Not provided'}</div>
                                <div><span className="font-medium">Address:</span> {ref.street}, {ref.city}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Investigation Notes Section */}
                    <div className="space-y-4">
                      <Label>Investigation Notes</Label>
                      <Textarea
                        value={investigationNotes}
                        onChange={(e) => setInvestigationNotes(e.target.value)}
                        placeholder="Enter your investigation findings, verification status, field visit notes, etc..."
                        rows={6}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between">
                      <div className="flex gap-2">
                        <Button 
                          variant="outline"
                          onClick={() => setShowDocuments(true)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          View Documents
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="application/pdf,image/*,.doc,.docx,.xls,.xlsx,.txt"
                          hidden
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleUploadEamvuDoc(file)
                          }}
                        />
                        <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploadingDoc}>
                          {uploadingDoc ? 'Uploading…' : 'Upload to EAMVU Docs'}
                        </Button>
                        <Button variant="outline">
                          <MapPin className="h-4 w-4 mr-2" />
                          Field Visit
                        </Button>
                        <Button variant="outline">
                          <Camera className="h-4 w-4 mr-2" />
                          Add Photos
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="default" 
                          onClick={() => handleCompleteInvestigation(extractLosId(selectedApplication.los_id), selectedApplication.application_type)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Complete Investigation
                        </Button>
                        <Button 
                          variant="destructive"
                          onClick={() => handleRejectApplication(extractLosId(selectedApplication.los_id), selectedApplication.application_type)}
                          disabled={!investigationNotes.trim()}
                        >
                          <ThumbsDown className="h-4 w-4 mr-2" />
                          Reject Application
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Loading comprehensive application data...</p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="checklist">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Application Checklist</h3>
                                     <div className="grid grid-cols-2 gap-2">
                     {Object.entries(selectedApplication.checklist || {}).map(([key, value]) => (
                       <div key={key} className="flex items-center space-x-2">
                         <Checkbox id={key} checked={Boolean(value)} disabled />
                         <Label htmlFor={key}>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Label>
                       </div>
                     ))}
                   </div>
                  <Progress value={getCompletionPercentage(selectedApplication)} className="mt-4" />
                  <p className="text-sm text-muted-foreground">
                    {getCompletionPercentage(selectedApplication)}% of checklist completed
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="comments">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Investigation Comments</h3>
                  {selectedApplication.comments && selectedApplication.comments.length > 0 ? (
                    <ul className="space-y-2">
                      {selectedApplication.comments.map((comment: any, index: number) => (
                        <li key={index} className="bg-gray-50 p-2 rounded-md">
                          <p className="font-medium">{comment.comment_by}:</p>
                          <p>{comment.comment_text}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No comments yet for this application.</p>
                  )}
                  <div className="mt-4">
                    <Label>Add New Comment</Label>
                    <Textarea
                      value={investigationNotes}
                      onChange={(e) => setInvestigationNotes(e.target.value)}
                      placeholder="Enter your comment..."
                      rows={3}
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => handleAddInvestigationNotes(extractLosId(selectedApplication.los_id), investigationNotes)}
                      className="mt-2"
                      disabled={!investigationNotes.trim()}
                    >
                      Add Comment
                    </Button>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="workflow">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Application Workflow</h3>
                  <div className="bg-gray-100 p-4 rounded-md">
                    <p className="font-medium">Current Stage: {getWorkflowStage(selectedApplication).current}</p>
                    <Progress value={getWorkflowStage(selectedApplication).progress} className="mt-2" />
                    <p className="text-sm text-muted-foreground">
                      Progress: {getWorkflowStage(selectedApplication).progress.toFixed(0)}%
                    </p>
                    <p className="mt-2">Next Stage: {getWorkflowStage(selectedApplication).next}</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedApplication(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Document Explorer Dialog */}
      {showDocuments && selectedApplication && (
        <Dialog open={showDocuments} onOpenChange={setShowDocuments}>
          <DialogContent className="max-w-6xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Documents - {selectedApplication.applicant_name}</DialogTitle>
            </DialogHeader>
            <DocumentExplorer
              key={documentsRefreshKey}
              losId={selectedApplication.los_id}
              applicationType={selectedApplication.loan_type}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Agent Selection Dialog */}
      <Dialog open={showAgentSelector} onOpenChange={setShowAgentSelector}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Agent</DialogTitle>
            <DialogDescription>
              Choose which EAMVU agent you are to view your assigned applications.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Available Agents</Label>
              <Select value={currentAgent} onValueChange={handleAgentSelection}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your agent profile" />
                </SelectTrigger>
                <SelectContent>
                  {availableAgents
                    .filter(agent => agent.status === 'active')
                    .map((agent) => (
                      <SelectItem key={agent.agent_id} value={agent.agent_id}>
                        {agent.name} ({agent.assigned_applications} applications)
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>⚠️ You must select an agent to view and manage assigned applications.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}