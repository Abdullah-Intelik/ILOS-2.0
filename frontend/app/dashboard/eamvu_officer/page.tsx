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
import { LayoutDashboard, ClipboardList, FileSearch, CheckCircle, Eye, ThumbsUp, ThumbsDown, MapPin, Camera, FileText, User, MessageSquare, CheckSquare, AlertCircle, Clock, Banknote, Building, Phone, Mail, Calendar, Shield, TrendingUp, Users, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DocumentExplorer from "@/components/document-explorer";
import { MinimalFieldDisplay } from "@/components/minimal-field-display";

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

  // Hardcode Ahmed Hassan (ID: 101) for now - Backend V2.0 doesn't have agents endpoint yet
  useEffect(() => {
    const defaultAgent = '101'; // Ahmed Hassan
    const agentData = [{ agent_id: 101, name: 'Ahmed Hassan', role: 'eamvu_officer', status: 'active' }];
    
    setCurrentAgent(defaultAgent);
    setAvailableAgents(agentData);
    
    // Set initial agent in localStorage
    localStorage.setItem('currentEAMVUAgent', defaultAgent);
    
    // Fetch applications
    fetchAssignedApplications(defaultAgent);
    
    // Don't show agent selector - auto-select the only agent
    setShowAgentSelector(false);
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
      
      // First, get all EAMVU applications (Backend V2.0)
      const eamvuResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/applications/department/EAMVU/paginated?page=1&pageSize=100`)
      const eamvuData = await eamvuResponse.json()
      
      if (!eamvuResponse.ok) {
        throw new Error('Failed to fetch EAMVU applications')
      }
      
      const applications = eamvuData.data || []
      console.log('✅ Fetched EAMVU applications:', applications.length)
      
      // Filter applications assigned to this agent (Backend V2.0 uses assigned_to field)
      const assignedApplications = applications
        .filter((app: any) => app.assigned_to === parseInt(agentId))
        .map((app: any) => ({
          ...app,
          // Map Backend V2.0 field names to frontend expected names
          applicant_name: app.applicantName || 'N/A',
          loan_type: app.product || app.productType || 'N/A',
          loan_amount: app.amount || 0,
          application_type: app.productType || app.product || 'N/A',
          assigned_at: app.updatedAt || app.submittedAt || new Date().toISOString(),
          assigned_by: 'System'
        }));
      
      console.log(`✅ Found ${assignedApplications.length} applications assigned to agent ${agentId}`)
      console.log('📋 Mapped applications:', assignedApplications);
      
      // Backend V2.0 already has all assignment data in the application object
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
      // Backend V2.0 returns los_id as number, not string "LOS-XX"
      const losId = typeof application.los_id === 'number' 
        ? application.los_id 
        : String(application.los_id).replace('LOS-', ''); // Extract numeric part
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/applications/form/${losId}`, { 
        method: 'GET', 
        headers: { 'Content-Type': 'application/json' } 
      });
      if (!response.ok) { 
        throw new Error('Failed to fetch form data'); 
      }
      const response_data = await response.json();
      console.log('✅ Form data fetched successfully:', response_data);
      
      // Backend V2.0 returns flat structure: { success: true, data: {...} }
      // Convert to old format: { formData: {...} }
      const flatData = response_data.data || response_data;
      
      // Improved age calculation
      let age = 0; 
      if (flatData.date_of_birth) { 
        console.log('Raw date_of_birth:', flatData.date_of_birth);
        
        const dob = new Date(flatData.date_of_birth); 
        const today = new Date(); 
        
        console.log('Parsed DOB:', dob);
        console.log('Today:', today);
        
        // Check if the date is valid
        if (isNaN(dob.getTime())) {
          console.error('Invalid date of birth:', flatData.date_of_birth);
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
        console.log('No date_of_birth found in data');
      }

      // Create formData object with age
      const formData = { ...flatData, age };
      console.log('✅ Form data with age calculated:', formData); 
      
      // Fetch references from Backend V2.0
      try {
        const refsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/applications/${losId}/references`);
        if (refsResponse.ok) {
          const refsData = await refsResponse.json();
          formData.references = refsData.data || [];
          console.log('✅ Fetched references:', formData.references);
        }
      } catch (error) {
        console.error('⚠️ Failed to fetch references:', error);
        formData.references = [];
      }
      
      setSelectedApplication({ ...application, formData });
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
      const losIdNumeric = typeof selectedApplication.los_id === 'number'
        ? selectedApplication.los_id
        : String(selectedApplication.los_id).replace('LOS-', '')
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
        status: 'eavmu_approved',
        comments: investigationNotes
      })

      // Backend V2.0: PATCH /api/v1/applications/:losId/status
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/applications/${losId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'eavmu_approved', // Move to CIU stage
          comments: investigationNotes || 'Investigation completed by EAVMU Officer',
          userId: parseInt(currentAgent), // Add user ID for EAVMU officer
          department: 'EAVMU',
          action: 'verify',
          eavmuVerification: {
            overall_result: 'Approved',
            residence_verified: true,
            workplace_verified: true,
            verification_notes: investigationNotes || 'Investigation completed by EAVMU Officer',
            documents_uploaded: true,
            verification_method: 'field_visit'
          }
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Investigation completed and forwarded to CIU"
        })
        
        // Clear investigation notes
        setInvestigationNotes('')
        setSelectedApplication(null)
        
        // Refresh applications
        fetchAssignedApplications(currentAgent)
      } else {
        toast({
          title: "Error",
          description: data.message || data.error || "Failed to complete investigation",
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
        status: 'eavmu_rejected',
        comments: investigationNotes
      })

      // Backend V2.0: PATCH /api/v1/applications/:losId/status
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/applications/${losId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'eavmu_rejected', // Reject application
          comments: investigationNotes || 'Application rejected by EAVMU Officer',
          userId: parseInt(currentAgent), // Add user ID for EAVMU officer
          department: 'EAVMU',
          action: 'reject',
          eavmuVerification: {
            overall_result: 'Rejected',
            residence_verified: false,
            workplace_verified: false,
            verification_notes: investigationNotes || 'Application rejected by EAVMU Officer',
            documents_uploaded: false,
            verification_method: 'field_visit'
          }
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast({
          title: "Application Rejected",
          description: "Application has been rejected"
        })
        
        // Clear investigation notes
        setInvestigationNotes('')
        setSelectedApplication(null)
        
        // Refresh applications
        fetchAssignedApplications(currentAgent)
      } else {
        toast({
          title: "Error",
          description: data.message || data.error || "Failed to reject application",
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

      {/* Application Details Dialog - Matching PB Design */}
      {selectedApplication && (
        <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
            <DialogHeader className="sticky top-0 bg-white z-10 pb-4 border-b">
              <DialogTitle>Application Details - {selectedApplication.los_id}</DialogTitle>
              <DialogDescription>
                Complete application information and investigation tools
              </DialogDescription>
            </DialogHeader>
            {selectedApplication.formData && (
              <div className="overflow-y-auto max-h-[calc(90vh-120px)] space-y-6 pr-2">
                {/* Basic Information Section - 3 Column Grid */}
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
                        <span>{selectedApplication.formData.first_name} {selectedApplication.formData.middle_name || ''} {selectedApplication.formData.last_name}</span>
                        <span className="font-medium">CNIC:</span>
                        <span className="font-mono">{selectedApplication.formData.cnic}</span>
                        <span className="font-medium">Age:</span>
                        <span>{selectedApplication.formData.age} years</span>
                        <span className="font-medium">Monthly Income:</span>
                        <span>PKR {selectedApplication.formData.monthly_income?.toLocaleString() || 'N/A'}</span>
                        <span className="font-medium">Email:</span>
                        <span className="text-xs">{selectedApplication.formData.email || 'N/A'}</span>
                        <span className="font-medium">Mobile:</span>
                        <span>{selectedApplication.formData.mobile || selectedApplication.formData.customer_mobile || 'N/A'}</span>
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
                        <span className="font-semibold text-green-600">
                          PKR {selectedApplication.loan_amount?.toLocaleString() || selectedApplication.formData.requested_amount?.toLocaleString() || 'N/A'}
                        </span>
                        <span className="font-medium">Tenure:</span>
                        <span>{selectedApplication.formData.tenure_months || selectedApplication.formData.tenure || 'N/A'} months</span>
                        <span className="font-medium">Purpose:</span>
                        <span>{selectedApplication.formData.purpose || 'N/A'}</span>
                        <span className="font-medium">Status:</span>
                        <span>{getStatusBadge(selectedApplication.status)}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Investigation Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className="font-medium">Assigned To:</span>
                            <span>Ahmed Hassan</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Assigned Date:</span>
                            <span>{new Date(selectedApplication.created_at || Date.now()).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">LOS ID:</span>
                            <span className="font-mono">{selectedApplication.los_id}</span>
                          </div>
                        </div>
                        <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                          <div className="text-xs font-medium text-blue-800">Current Stage:</div>
                          <div className="text-sm text-blue-700">{selectedApplication.status}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Form Data Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Application Form Data
                    </CardTitle>
                    <CardDescription>
                      Essential fields from streamlined form
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MinimalFieldDisplay 
                      data={selectedApplication.formData}
                      title="Application Data"
                      productType="cashplus"
                    />
                    
                    {/* Raw Data (for debugging) */}
                    <details className="mt-4">
                      <summary className="cursor-pointer text-sm font-medium text-gray-600">View Raw Data</summary>
                      <div className="mt-2 bg-gray-50 p-4 rounded-lg">
                        <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                          {JSON.stringify(selectedApplication.formData, null, 2)}
                        </pre>
                      </div>
                    </details>
                  </CardContent>
                </Card>

                {/* Investigation Actions Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Investigation Actions
                    </CardTitle>
                    <CardDescription>
                      Complete investigation and document findings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="investigation-notes">Investigation Notes</Label>
                      <Textarea
                        id="investigation-notes"
                        value={investigationNotes}
                        onChange={(e) => setInvestigationNotes(e.target.value)}
                        placeholder="Enter your investigation findings and notes here..."
                        rows={5}
                        className="mt-2"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleCompleteInvestigation(String(selectedApplication.los_id).replace('LOS-', ''), selectedApplication.application_type)}
                        className="flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Complete Investigation
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleRejectApplication(String(selectedApplication.los_id).replace('LOS-', ''), selectedApplication.application_type)}
                        className="flex-1"
                      >
                        <ThumbsDown className="h-4 w-4 mr-2" />
                        Reject Application
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
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