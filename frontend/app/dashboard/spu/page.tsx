"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDateTime } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Search, Filter, Clock, CheckCircle, AlertTriangle, FileText, Eye, MoreHorizontal, ArrowRight, ArrowLeft, X, Download, ExternalLink, Check, Ban, User, DollarSign, Activity, CheckSquare, FolderOpen, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import DocumentExplorer from "@/components/document-explorer"
import { DynamicFieldDisplay } from "@/components/dynamic-field-display"



// Stats for dashboard
const statsData = [
  {
    title: "New Applications",
    value: "15",
    change: "+5 from yesterday",
    icon: Clock,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
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
    title: "Returned Applications",
    value: "3",
    change: "Documentation issues",
    icon: AlertTriangle,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  {
    title: "Total Processed",
    value: "142",
    change: "This month",
    icon: FileText,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
]

function getStatusBadge(status: string) {
  switch (status) {
    case "submitted_to_spu":
      return <Badge className="bg-blue-100 text-blue-800">New</Badge>
    case "under_review":
      return <Badge className="bg-yellow-100 text-yellow-800">Under Review</Badge>
    case "verified":
      return <Badge className="bg-green-100 text-green-800">Verified</Badge>
    case "returned":
      return <Badge variant="destructive">Returned</Badge>
    case "New":
      return <Badge className="bg-blue-100 text-blue-800">New</Badge>
    case "Document Check":
      return <Badge className="bg-yellow-100 text-yellow-800">Document Check</Badge>
    case "Final Review":
      return <Badge className="bg-purple-100 text-purple-800">Final Review</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

function getDocumentStatusBadge(status: string) {
  const statusConfig: Record<string, { variant: "default" | "destructive" | "outline" | "secondary", label: string }> = {
    "verified": { variant: "default", label: "Verified" },
    "pending": { variant: "outline", label: "Pending" },
    "rejected": { variant: "destructive", label: "Rejected" },
    "missing": { variant: "destructive", label: "Missing" },
  }

  const config = statusConfig[status] || { variant: "outline", label: status }

  return <Badge variant={config.variant}>{config.label}</Badge>
}

export default function SPUDashboardPage() {
  const [activeTab, setActiveTab] = useState("new")
  const [selectedApplication, setSelectedApplication] = useState<any>(null)
  const [verificationStep, setVerificationStep] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [statusFilter, setStatusFilter] = useState("all")
  const [spuApplications, setSpuApplications] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState(statsData)
  const [selectedDocument, setSelectedDocument] = useState<any>(null)
  const [showDocumentViewer, setShowDocumentViewer] = useState(false)
  const [verificationComments, setVerificationComments] = useState("")
  const [fieldVerification, setFieldVerification] = useState({
    nameVerified: false,
    cnicVerified: false,
    incomeVerified: false,
    addressVerified: false,
    employmentVerified: false
  })
  const [showDocumentsModal, setShowDocumentsModal] = useState(false)
  const [showDocumentExplorer, setShowDocumentExplorer] = useState(false)
  const [applicationDocuments, setApplicationDocuments] = useState<any[]>([])
  const [documentVerificationStatus, setDocumentVerificationStatus] = useState<{ [key: string]: { [losId: string]: boolean } }>({})
  const [commentText, setCommentText] = useState("")
  const [existingComments, setExistingComments] = useState<{ [key: string]: string }>({})
  const [allDepartmentComments, setAllDepartmentComments] = useState<{ [key: string]: any[] }>({})
  const [showRejectionOptions, setShowRejectionOptions] = useState(false)
  const [spuChecklist, setSpuChecklist] = useState({
    ecib: { checked: false, comment: "" },
    frmu: { checked: false, comment: "" },
    negative_list: { checked: false, comment: "" },
    pep_list: { checked: false, comment: "" },
    credit_card_30k: { checked: false, comment: "" },
    black_list: { checked: false, comment: "" },
    ctl: { checked: false, comment: "" }
  })
  const [autoCheckLoading, setAutoCheckLoading] = useState(false)
  const { toast } = useToast()



  // Helper function to get application type path for file system
  const getApplicationTypePath = (appType: string) => {
    switch (appType) {
      case 'CashPlus':
        return 'cashplus'
      case 'AutoLoan':
        return 'AutoLoan'
      case 'SMEASAAN':
        return 'smeasaan'
      case 'CommercialVehicle':
        return 'commercialVehicle'
      case 'AmeenDrive':
        return 'ameendrive'
      case 'PlatinumCreditCard':
      case 'ClassicCreditCard':
        return 'creditcard'
      default:
        return 'temp'
    }
  }

  // Function to handle opening a document in a new tab
  const handleOpenDocumentInNewTab = async (doc: any) => {
    if (!selectedApplication) {
      toast({
        title: "Error",
        description: "No application selected",
        variant: "destructive"
      })
      return
    }

    try {
      const losId = selectedApplication.los_id?.replace('LOS-', '') || selectedApplication.id?.split('-')[1]
      const appTypePath = getApplicationTypePath(selectedApplication.application_type)
      
      console.log(`🔍 Looking for document: ${doc.name} for LOS-${losId} in ${appTypePath}`)
      
      // First, try to get the actual document list from the API
      const apiUrl = `/api/documents/${losId}?applicationType=${selectedApplication.application_type}`
      console.log(`🔍 Fetching documents from: ${apiUrl}`)
      
      const response = await fetch(apiUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch documents: ${response.status}`)
      }
      
      const data = await response.json()
      console.log(`📋 Available documents:`, data.documents)
      
      if (!data.exists || !data.documents || data.documents.length === 0) {
        toast({
          title: "No Documents Found",
          description: `No documents found for ${selectedApplication.los_id}`,
          variant: "destructive"
        })
        return
      }
      
      // Improved document matching logic
      const docName = doc.name.toLowerCase()
      let foundDoc = null
      
      // 1. Try exact match first
      foundDoc = data.documents.find((file: any) => 
        file.name.toLowerCase() === docName
      )
      if (foundDoc) {
        console.log(`✅ Exact match found: ${foundDoc.name} for ${doc.name}`)
      }
      
      // 2. Try partial match (document name contains the search term)
      if (!foundDoc) {
        foundDoc = data.documents.find((file: any) => 
          file.name.toLowerCase().includes(docName) || docName.includes(file.name.toLowerCase())
        )
        if (foundDoc) {
          console.log(`✅ Partial match found: ${foundDoc.name} for ${doc.name}`)
        }
      }
      
      // 3. Try smart mappings for common document types
      if (!foundDoc) {
        const docNameMappings: { [key: string]: string[] } = {
          'cnic': ['cnic', 'id', 'identity', 'national', 'copy'],
          'photo 1': ['photo', 'picture', 'image', '1'],
          'photo 2': ['photo', 'picture', 'image', '2'],
          'salary slip 1': ['salary', 'payslip', 'income', 'employment', 'slip', '1'],
          'salary slip 2': ['salary', 'payslip', 'income', 'employment', 'slip', '2'],
          'salary slip 3': ['salary', 'payslip', 'income', 'employment', 'slip', '3'],
          'bank statement': ['bank', 'statement', 'account'],
          'business bank statement': ['business', 'bank', 'statement', 'account'],
          'employment letter': ['employment', 'job', 'work', 'letter'],
          'verification office/residence document': ['verification', 'office', 'residence', 'address', 'document'],
          'verification office/residence': ['verification', 'office', 'residence', 'address'],
          'reference 1 cnic': ['reference', 'ref', '1', 'cnic', 'id'],
          'reference 2 cnic': ['reference', 'ref', '2', 'cnic', 'id'],
          'reference 1 contact': ['reference', 'ref', '1', 'contact'],
          'reference 2 contact': ['reference', 'ref', '2', 'contact'],
          'calculation sheet': ['calculation', 'sheet', 'formula'],
          'key fact statement': ['key', 'fact', 'statement', 'kfs'],
          'loan declaration form': ['loan', 'declaration', 'form'],
          'business ntn': ['business', 'ntn'],
          'business letterhead request': ['business', 'letterhead', 'request'],
          'retrieval letter': ['retrieval', 'letter'],
          'filer undertaking': ['filer', 'undertaking'],
          'poa undertaking': ['poa', 'undertaking'],
          'personal use undertaking': ['personal', 'use', 'undertaking'],
          'private registration undertaking': ['private', 'registration', 'undertaking'],
          'financial checklist': ['financial', 'checklist'],
          'pr checklist': ['pr', 'checklist']
        }
        
        // Find the best matching document type
        for (const [docType, keywords] of Object.entries(docNameMappings)) {
          if (docName.includes(docType) || docType.includes(docName)) {
            console.log(`🔍 Trying smart mapping for: ${docType} with keywords: ${keywords.join(', ')}`)
            // Look for files that contain any of the keywords
            foundDoc = data.documents.find((file: any) => 
              keywords.some(keyword => file.name.toLowerCase().includes(keyword))
            )
            if (foundDoc) {
              console.log(`✅ Smart mapping found: ${foundDoc.name} for ${doc.name} using ${docType}`)
              break
            }
          }
        }
      }
      
      // 4. If still not found, try to find the most relevant document
      if (!foundDoc) {
        // Look for files that contain any word from the document name
        const docWords = docName.split(' ').filter((word: string) => word.length > 2)
        console.log(`🔍 Trying word-based matching with words: ${docWords.join(', ')}`)
        foundDoc = data.documents.find((file: any) => 
          docWords.some((word: string) => file.name.toLowerCase().includes(word))
        )
        if (foundDoc) {
          console.log(`✅ Word-based match found: ${foundDoc.name} for ${doc.name}`)
        }
      }
      
      if (foundDoc) {
        console.log(`✅ Found document: ${foundDoc.name} for ${doc.name}`)
        
        // Check file type for preview capability
        const fileName = foundDoc.name.toLowerCase()
        const isHtmlFile = fileName.endsWith('.html') || fileName.endsWith('.htm')
        const isImageFile = fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || 
                           fileName.endsWith('.png') || fileName.endsWith('.gif') || 
                           fileName.endsWith('.bmp') || fileName.endsWith('.webp')
        const isPdfFile = fileName.endsWith('.pdf')
        const isTextFile = fileName.endsWith('.txt') || fileName.endsWith('.md') || 
                          fileName.endsWith('.json') || fileName.endsWith('.xml')
        
        if (!isHtmlFile && !isImageFile && !isPdfFile && !isTextFile) {
          toast({
            title: "Preview not available",
            description: `This file type (${foundDoc.name.split('.').pop()}) cannot be previewed. Please download it instead.`,
            variant: "destructive",
          })
          return
        }
        
        // Use the blob-based approach like DocumentExplorer component
        const fileUrl = `http://localhost:8081${foundDoc.path}`
        console.log(`🔍 Opening file using blob approach: ${fileUrl}`)
        console.log(`🔍 Found document path: ${foundDoc.path}`)
        console.log(`🔍 Document name: ${foundDoc.name}`)
        
        // Fetch the file content as a blob
        const response = await fetch(fileUrl, {
          method: 'GET',
          headers: {
            'Accept': '*/*',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Get the file content as a blob
        const fileContent = await response.blob();
        
        // Create a blob URL for the file
        const blobUrl = URL.createObjectURL(fileContent);
        
        // Open the blob URL in a new tab
        const newWindow = window.open(blobUrl, '_blank');
        
        if (!newWindow) {
          toast({
            title: "Popup blocked",
            description: "Please allow popups for this site to view files.",
            variant: "destructive",
          })
          return
        }
        
        // Clean up the blob URL after a delay
        setTimeout(() => {
          URL.revokeObjectURL(blobUrl);
        }, 1000);
        
        toast({
          title: "Document Opened",
          description: `${foundDoc.name} opened in new tab`,
        })
        return
      }
      
      // If still not found, show available documents with better formatting
      const availableDocs = data.documents.map((d: any) => d.name)
      console.log(`❌ Document not found: ${doc.name}`)
      console.log(`📋 Available documents:`, availableDocs)
      
      toast({
        title: "Document Not Found",
        description: `"${doc.name}" not found. Available documents: ${availableDocs.slice(0, 5).join(', ')}${availableDocs.length > 5 ? '...' : ''}`,
        variant: "destructive"
      })
    } catch (error) {
      console.error('Error viewing document:', error)
      
      // Fallback: try opening directly
      try {
        console.log('🔄 Trying fallback direct opening...')
        const fallbackUrl = `http://localhost:8081/explorer/${selectedApplication.application_type}/${selectedApplication.los_id}/${encodeURIComponent(doc.name)}`
        window.open(fallbackUrl, '_blank')
        
        toast({
          title: "Opening file",
          description: `Opening ${doc.name} in a new tab...`,
        })
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError)
        toast({
          title: "Error",
          description: "Failed to open document. Please try again.",
          variant: "destructive"
        })
      }
    }
  }

  // Function to get dynamic document checklist based on loan type
  const getDocumentChecklist = (application: any) => {
    // If we have form data with documents_checklist, use that
    if (application.formData && application.formData.documents_checklist && application.formData.documents_checklist.length > 0) {
      const checklist = application.formData.documents_checklist[0] // Get the first checklist entry
      
      // Convert the checklist object to an array of document items
      const checklistItems: any[] = []
      
      // Define the field mappings with their display names and required status
      const fieldMappings: { [key: string]: { name: string; required: boolean } } = {
        'cnic': { name: 'CNIC', required: true },
        'photo_1': { name: 'Photo 1', required: true },
        'photo_2': { name: 'Photo 2', required: true },
        'business_ntn': { name: 'Business NTN', required: false },
        'salary_slip_1': { name: 'Salary Slip 1', required: true },
        'salary_slip_2': { name: 'Salary Slip 2', required: true },
        'salary_slip_3': { name: 'Salary Slip 3', required: true },
        'poa_undertaking': { name: 'POA Undertaking', required: false },
        'reference1_cnic': { name: 'Reference 1 CNIC', required: true },
        'reference2_cnic': { name: 'Reference 2 CNIC', required: true },
        'retrieval_letter': { name: 'Retrieval Letter', required: false },
        'calculation_sheet': { name: 'Calculation Sheet', required: true },
        'filer_undertaking': { name: 'Filer Undertaking', required: false },
        'bank_statement_1yr': { name: 'Bank Statement (1 Year)', required: true },
        'reference1_contact': { name: 'Reference 1 Contact', required: true },
        'reference2_contact': { name: 'Reference 2 Contact', required: true },
        'loan_declaration_form': { name: 'Loan Declaration Form', required: true },
        'business_bank_statement': { name: 'Business Bank Statement', required: false },
        'personal_use_undertaking': { name: 'Personal Use Undertaking', required: false },
        'business_letterhead_request': { name: 'Business Letterhead Request', required: false },
        'verification_office_residence': { name: 'Verification Office/Residence', required: true },
        'private_registration_undertaking': { name: 'Private Registration Undertaking', required: false },
        'kfs': { name: 'Key Fact Statement (KFS)', required: true }
      }
      
      // Process each field in the checklist
      Object.keys(checklist).forEach(fieldName => {
        if (fieldName !== 'id' && fieldName !== 'application_id' && fieldName !== 'uploaded_at') {
          const mapping = fieldMappings[fieldName]
          if (mapping) {
            checklistItems.push({
              id: fieldName, // Use the actual field name as ID for API calls
              name: mapping.name,
              required: mapping.required,
              verified: checklist[fieldName] === true,
              rejected: checklist[fieldName] === false,
              uploaded_at: checklist.uploaded_at
            })
          }
        }
      })
      
      return checklistItems
    }
    
    // Fallback to hardcoded list if no checklist data is available
    const baseDocuments = [
      { name: "Verification office/residence document", required: true },
      { name: "CNIC", required: true },
      { name: "Photo 1", required: true },
      { name: "Photo 2", required: true },
      { name: "Reference 1 CNIC", required: true },
      { name: "Reference 1 Contact", required: true },
      { name: "Reference 2 CNIC", required: true },
      { name: "Reference 2 Contact", required: true },
      { name: "Calculation Sheet", required: true },
      { name: "Key Fact Statement (KFS)", required: true },
      { name: "Loan Declaration Form", required: true },
      { name: "Salary Slip 1", required: true },
      { name: "Salary Slip 2", required: true },
      { name: "Salary Slip 3", required: true },
      { name: "Bank Statement (1 Year)", required: true },
      { name: "Business Bank Statement", required: true },
      { name: "Business NTN", required: true },
      { name: "Business Letterhead Request", required: true }
    ]

    // Additional documents specific to loan types
    let additionalDocuments: any[] = []
    
    switch (application.loan_type) {
      case 'CashPlus Loan':
        additionalDocuments = [
          { name: "Retrieval Letter", required: true },
          { name: "Filer Undertaking", required: true },
          { name: "POA Undertaking", required: true },
          { name: "Personal Use Undertaking", required: true },
          { name: "Private Registration Undertaking", required: true }
        ]
        break
      case 'Auto Loan':
        additionalDocuments = [
          { name: "Retrieval Letter", required: true },
          { name: "Filer Undertaking", required: true },
          { name: "POA Undertaking", required: true },
          { name: "Personal Use Undertaking", required: true },
          { name: "Private Registration Undertaking", required: true }
        ]
        break
      case 'Ameen Drive':
        additionalDocuments = [
          { name: "Financial Checklist", required: true },
          { name: "PR Checklist", required: true }
        ]
        break
      case 'SME Asaan':
        // No additional documents for SME Asaan
        break
      case 'Commercial':
        // No additional documents for Commercial
        break
    }

    const allDocuments = [...baseDocuments, ...additionalDocuments]
    
    return allDocuments.map((doc, index) => {
      // Create a mapping from display name to field name for the fallback
      const nameToFieldMap: { [key: string]: string } = {
        'Verification office/residence document': 'verification_office_residence',
        'CNIC': 'cnic',
        'Photo 1': 'photo_1',
        'Photo 2': 'photo_2',
        'Reference 1 CNIC': 'reference1_cnic',
        'Reference 1 Contact': 'reference1_contact',
        'Reference 2 CNIC': 'reference2_cnic',
        'Reference 2 Contact': 'reference2_contact',
        'Calculation Sheet': 'calculation_sheet',
        'Key Fact Statement (KFS)': 'kfs',
        'Loan Declaration Form': 'loan_declaration_form',
        'Salary Slip 1': 'salary_slip_1',
        'Salary Slip 2': 'salary_slip_2',
        'Salary Slip 3': 'salary_slip_3',
        'Bank Statement (1 Year)': 'bank_statement_1yr',
        'Business Bank Statement': 'business_bank_statement',
        'Business NTN': 'business_ntn',
        'Business Letterhead Request': 'business_letterhead_request',
        'Retrieval Letter': 'retrieval_letter',
        'Filer Undertaking': 'filer_undertaking',
        'POA Undertaking': 'poa_undertaking',
        'Personal Use Undertaking': 'personal_use_undertaking',
        'Private Registration Undertaking': 'private_registration_undertaking',
        'Financial Checklist': 'financial_checklist',
        'PR Checklist': 'pr_checklist'
      }
      
      const fieldName = nameToFieldMap[doc.name] || `unknown_${index}`
      const docId = fieldName
      
      const currentLosId = application.los_id?.replace('LOS-', '') || application.id?.split('-')[1]
      return {
        id: docId,
        name: doc.name,
        required: doc.required,
        verified: documentVerificationStatus[docId]?.[currentLosId] || false,
        rejected: documentVerificationStatus[`${docId}-rejected`]?.[currentLosId] || false
      }
    })
  }

  // Function to get all documents for an application (for document explorer)
  const getApplicationDocuments = (application: any) => {
    const appTypePath = getApplicationTypePath(application.application_type)
    const losId = application.los_id?.replace('LOS-', '') || application.id?.split('-')[1]
    
    // Common documents that are typically uploaded
    const commonDocuments = [
      { name: "CNIC Copy.pdf", type: "pdf", category: "Identity" },
      { name: "Salary Slip.pdf", type: "pdf", category: "Income" },
      { name: "Bank Statement.pdf", type: "pdf", category: "Financial" },
      { name: "Employment Letter.pdf", type: "pdf", category: "Employment" },
      { name: "Utility Bill.pdf", type: "pdf", category: "Address" },
      { name: "Property Documents.pdf", type: "pdf", category: "Property" },
      { name: "Vehicle Registration.pdf", type: "pdf", category: "Vehicle" },
      { name: "Business Registration.pdf", type: "pdf", category: "Business" },
      { name: "Tax Returns.pdf", type: "pdf", category: "Tax" },
      { name: "Financial Statements.pdf", type: "pdf", category: "Financial" }
    ]

    // Add application-specific documents based on loan type
    let additionalDocuments: any[] = []
    
    switch (application.loan_type) {
      case 'Auto Loan':
        additionalDocuments = [
          { name: "Vehicle Invoice.pdf", type: "pdf", category: "Vehicle" },
          { name: "Insurance Certificate.pdf", type: "pdf", category: "Insurance" }
        ]
        break
      case 'SME Loan':
        additionalDocuments = [
          { name: "Business Plan.pdf", type: "pdf", category: "Business" },
          { name: "Cash Flow Statement.pdf", type: "pdf", category: "Financial" }
        ]
        break
      case 'CashPlus Loan':
        additionalDocuments = [
          { name: "Income Declaration.pdf", type: "pdf", category: "Income" },
          { name: "Asset Statement.pdf", type: "pdf", category: "Financial" }
        ]
        break
    }

    const allDocuments = [...commonDocuments, ...additionalDocuments]
    
    return allDocuments.map((doc, index) => ({
      id: `doc-${application.id}-${index}`,
      name: doc.name,
      type: doc.type,
      category: doc.category,
      url: `http://localhost:8081/explorer/ilos_loan_application_documents/${appTypePath}/los-${losId}/${doc.name}`,
      status: "uploaded", // Assume uploaded for now
      required: ["CNIC Copy.pdf", "Salary Slip.pdf", "Bank Statement.pdf"].includes(doc.name)
    }))
  }

  // Function to handle viewing all documents
  const handleViewAllDocuments = (application: any) => {
    const documents = getApplicationDocuments(application)
    setApplicationDocuments(documents)
    setShowDocumentsModal(true)
  }

  // Function to handle opening document explorer for an application
  const handleOpenDocumentExplorer = (application: any) => {
    setSelectedApplication(application)
    setShowDocumentExplorer(true)
  }

  // Fetch SPU applications from backend
  useEffect(() => {
    fetchSpuApplications()
  }, [page, pageSize])

  const fetchSpuApplications = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔄 Starting to fetch SPU applications...')
      
      const response = await fetch(`/api/applications/department/SPU/paginated?page=${page}&pageSize=${pageSize}`, { cache: 'no-store' })
      
      if (!response.ok) {
        throw new Error('Failed to fetch SPU applications')
      }
      
      const result = await response.json()
      const data = result?.data || []
      setTotal(result?.total || 0)
      console.log('📊 Raw SPU data from API (paginated):', result)
      console.log('📊 Number of SPU applications received:', data.length)
      
      // Log each application
      data.forEach((app: any, index: number) => {
        console.log(`📋 SPU Application ${index + 1}:`, {
          id: app.id,
          los_id: app.los_id,
          applicant_name: app.applicant_name,
          loan_type: app.loan_type,
          loan_amount: app.loan_amount,
          status: app.status
        })
      })
      
      setSpuApplications(data)
      
      // Update stats based on real data
      setStats(prev => [
        { ...prev[0], value: data.filter((app: any) => app.status === 'submitted_to_spu').length.toString() },
        { ...prev[1], value: data.filter((app: any) => app.status === 'verified').length.toString() },
        { ...prev[2], value: data.filter((app: any) => app.status === 'returned').length.toString() },
        { ...prev[3], value: data.length.toString() }
      ])
    } catch (err) {
      console.error('❌ Error fetching SPU applications:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch SPU applications')
      
      toast({
        title: "Error",
        description: "Failed to fetch SPU applications",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  } 

  // Use real data from API instead of mock data
  const filteredApplications = spuApplications.filter((app) => {
    const matchesSearch = app.applicant_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          app.los_id?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || app.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Filter for new applications (excluding resolved ones)
  const newApplications = filteredApplications.filter((app) => {
    return !app.status?.includes('resolved_by_')
  })

  // Filter for resolved applications
  const resolvedApplications = spuApplications.filter((app) => {
    const matchesSearch = app.applicant_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          app.los_id?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch && app.status?.includes('resolved_by_')
  })

  const handleVerifyDocument = async (docId: string) => {
    if (!selectedApplication) return
    
    try {
      console.log('🔍 Debug: selectedApplication:', selectedApplication)
      console.log('🔍 Debug: selectedApplication.los_id:', selectedApplication.los_id)
      console.log('🔍 Debug: selectedApplication.id:', selectedApplication.id)
      
      const losId = selectedApplication.los_id?.replace('LOS-', '') || selectedApplication.id?.split('-')[1]
      
      console.log('🔍 Debug: extracted losId:', losId)
      
      // Validate losId
      if (!losId || isNaN(parseInt(losId))) {
        throw new Error(`Invalid LOS ID: ${losId}`)
      }
      
      console.log('🔄 Frontend: Verifying document:', { losId, fieldName: docId, isVerified: true })
      
      const requestBody = {
        losId: losId,
        fieldName: docId,
        isVerified: true
      }
      
      console.log('🔍 Debug: Request body:', requestBody)
      console.log('🔍 Debug: docId (fieldName):', docId)
      
      const response = await fetch('/api/applications/update-checklist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        console.log('🔍 Debug: Response status:', response.status)
        console.log('🔍 Debug: Response statusText:', response.statusText)
        const errorData = await response.json()
        console.log('🔍 Debug: Error data:', errorData)
        throw new Error(errorData.error || 'Failed to verify document')
      }

      // Update document verification status in frontend
      const currentLosId = selectedApplication.los_id?.replace('LOS-', '') || selectedApplication.id?.split('-')[1]
      setDocumentVerificationStatus(prev => ({
        ...prev,
        [docId]: {
          ...prev[docId],
          [currentLosId]: true
        },
        [`${docId}-rejected`]: {
          ...prev[`${docId}-rejected`],
          [currentLosId]: false // Clear rejection if it was previously rejected
        }
      }))
      
      toast({
        title: "Document Verified",
        description: "Document has been marked as verified in database",
      })
    } catch (error) {
      console.error('❌ Error verifying document:', error)
      toast({
        title: "Error",
        description: "Failed to verify document. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleRejectDocument = async (docId: string) => {
    if (!selectedApplication) return
    
    try {
      console.log('🔍 Debug: selectedApplication:', selectedApplication)
      console.log('🔍 Debug: selectedApplication.los_id:', selectedApplication.los_id)
      console.log('🔍 Debug: selectedApplication.id:', selectedApplication.id)
      
      const losId = selectedApplication.los_id?.replace('LOS-', '') || selectedApplication.id?.split('-')[1]
      
      console.log('🔍 Debug: extracted losId:', losId)
      
      // Validate losId
      if (!losId || isNaN(parseInt(losId))) {
        throw new Error(`Invalid LOS ID: ${losId}`)
      }
      
      console.log('🔄 Frontend: Rejecting document:', { losId, fieldName: docId, isVerified: false })
      
      const requestBody = {
        losId: losId,
        fieldName: docId,
        isVerified: false
      }
      
      console.log('🔍 Debug: Request body:', requestBody)
      console.log('🔍 Debug: docId (fieldName):', docId)
      
      const response = await fetch('/api/applications/update-checklist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        console.log('🔍 Debug: Response status:', response.status)
        console.log('🔍 Debug: Response statusText:', response.statusText)
        const errorData = await response.json()
        console.log('🔍 Debug: Error data:', errorData)
        throw new Error(errorData.error || 'Failed to reject document')
      }

      // Update document verification status in frontend
      const currentLosId = selectedApplication.los_id?.replace('LOS-', '') || selectedApplication.id?.split('-')[1]
      setDocumentVerificationStatus(prev => ({
        ...prev,
        [docId]: {
          ...prev[docId],
          [currentLosId]: false
        },
        [`${docId}-rejected`]: {
          ...prev[`${docId}-rejected`],
          [currentLosId]: true
        }
      }))
      
      toast({
        title: "Document Rejected",
        description: "Document has been marked as rejected in database",
      })
    } catch (error) {
      console.error('❌ Error rejecting document:', error)
      toast({
        title: "Error",
        description: "Failed to reject document. Please try again.",
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
      const fieldName = 'spu_comments' // Department-specific comment field
      
      console.log(`🔄 SPU: Updating comment for LOS ID: ${losId}, Field: ${fieldName}`)

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
        console.error('❌ SPU: Failed to update comment:', errorData)
        toast({
          title: "Error",
          description: "Failed to save comment. Please try again.",
          variant: "destructive"
        })
        return
      }

      const data = await response.json()
      console.log(`✅ SPU: Comment updated successfully for LOS ID: ${losId}`)

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
      console.error('❌ SPU: Error updating comment:', error)
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

  const handleViewDocument = (document: any) => {
    setSelectedDocument(document)
    setShowDocumentViewer(true)
  }

  const handleDownloadDocument = (document: any) => {
    // Simulate document download
    const link = document.createElement('a')
    link.href = `http://localhost:8081/explorer/ilos_loan_application_documents/${selectedApplication?.application_type}/${selectedApplication?.los_id}/${document.name}`
    link.download = document.name
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast({
      title: "Download Started",
      description: `Downloading ${document.name}...`,
    })
  }

  const handleOpenDocumentInModal = async (document: any) => {
    if (!selectedApplication) {
      toast({
        title: "Error",
        description: "No application selected",
        variant: "destructive"
      })
      return
    }

    try {
      const losId = selectedApplication.los_id?.replace('LOS-', '') || selectedApplication.id?.split('-')[1]
      
      // Check file type for preview capability
      const fileName = document.name.toLowerCase()
      const isHtmlFile = fileName.endsWith('.html') || fileName.endsWith('.htm')
      const isImageFile = fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || 
                         fileName.endsWith('.png') || fileName.endsWith('.gif') || 
                         fileName.endsWith('.bmp') || fileName.endsWith('.webp')
      const isPdfFile = fileName.endsWith('.pdf')
      const isTextFile = fileName.endsWith('.txt') || fileName.endsWith('.md') || 
                        fileName.endsWith('.json') || fileName.endsWith('.xml')
      
      if (!isHtmlFile && !isImageFile && !isPdfFile && !isTextFile) {
        toast({
          title: "Preview not available",
          description: `This file type (${document.name.split('.').pop()}) cannot be previewed. Please download it instead.`,
          variant: "destructive",
        })
        return
      }
      
      // Use the blob-based approach like DocumentExplorer component
      const fileUrl = `http://localhost:8081/explorer/${selectedApplication.application_type}/${selectedApplication.los_id}/${encodeURIComponent(document.name)}`
      console.log(`🔍 Opening file using blob approach: ${fileUrl}`)
      
      // Fetch the file content as a blob
      const response = await fetch(fileUrl, {
        method: 'GET',
        headers: {
          'Accept': '*/*',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Get the file content as a blob
      const fileContent = await response.blob();
      
      // Create a blob URL for the file
      const blobUrl = URL.createObjectURL(fileContent);
      
      // Open the blob URL in a new tab
      const newWindow = window.open(blobUrl, '_blank');
      
      if (!newWindow) {
        toast({
          title: "Popup blocked",
          description: "Please allow popups for this site to view files.",
          variant: "destructive",
        })
        return
      }
      
      // Clean up the blob URL after a delay
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 1000);
      
      toast({
        title: "Document Opened",
        description: `${document.name} opened in new tab`,
      })
    } catch (error) {
      console.error('Error viewing document:', error)
      
      // Fallback: try opening directly
      try {
        console.log('🔄 Trying fallback direct opening...')
        const fallbackUrl = `http://localhost:8081/explorer/${selectedApplication.application_type}/${selectedApplication.los_id}/${encodeURIComponent(document.name)}`
        window.open(fallbackUrl, '_blank')
        
        toast({
          title: "Opening file",
          description: `Opening ${document.name} in a new tab...`,
        })
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError)
        toast({
          title: "Error",
          description: "Failed to open document. Please try again.",
          variant: "destructive"
        })
      }
    }
  }

  const handleVerifyApplication = async () => {
    if (!selectedApplication) return
    
    // Check if all required documents are verified using the dynamic checklist
    const documentChecklist = getDocumentChecklist(selectedApplication)
    const requiredDocuments = documentChecklist.filter((doc: any) => doc.required)
    const unverifiedRequired = requiredDocuments.filter((doc: any) => !doc.verified)
    
    if (unverifiedRequired.length > 0) {
      toast({
        title: "Verification Incomplete",
        description: "All required documents must be verified before proceeding",
        variant: "destructive"
      })
      return
    }
    
    try {
      // Update status in backend using workflow
      const losId = selectedApplication.los_id?.replace('LOS-', '') || selectedApplication.id?.split('-')[1]
      console.log('Frontend sending losId:', losId, 'applicationType:', selectedApplication.application_type)
      const response = await fetch('/api/applications/update-status-workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          losId: losId,
          status: selectedApplication.status, // Send current status, not target status
          applicationType: selectedApplication.application_type,
          department: 'SPU',
          action: 'verify'
        })
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('Backend error response:', errorData)
        throw new Error(`Failed to update status: ${errorData}`)
      }
      
      const responseData = await response.json()
      
      // Update application status in frontend with the actual status from backend
      const updatedApplications = spuApplications.map(app => 
        app.id === selectedApplication.id 
          ? { ...app, status: responseData.status }
          : app
      )
      setSpuApplications(updatedApplications)
      
      toast({
        title: "Application Verified",
        description: responseData.message || "Application has been verified and sent to COPS",
      })
      setSelectedApplication(null)
      setVerificationStep(1)
      setVerificationComments("")
      // State is now scoped per application, no need to clear
      setFieldVerification({
        nameVerified: false,
        cnicVerified: false,
        incomeVerified: false,
        addressVerified: false,
        employmentVerified: false
      })
    } catch (error) {
      console.error('Error updating status:', error)
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive"
      })
    }
  }

  // Enhanced rejection handlers for 4 different options
  const handleRejectApplication = async (destination: 'rru' | 'risk' | 'compliance' | 'risk_compliance') => {
    if (!selectedApplication) return
    
    try {
      const losId = selectedApplication.los_id?.replace('LOS-', '') || selectedApplication.id?.split('-')[1]
      let action = ''
      let statusMessage = ''
      
      switch (destination) {
        case 'rru':
          action = 'reject'
          statusMessage = 'Application sent to Risk Review Unit'
          break
        case 'risk':
          action = 'forward_to_risk'
          statusMessage = 'Application forwarded to Risk Management'
          break
        case 'compliance':
          action = 'forward_to_compliance'
          statusMessage = 'Application forwarded to Compliance Department'
          break
        case 'risk_compliance':
          action = 'forward_to_risk_compliance'
          statusMessage = 'Application forwarded to Risk Management and Compliance Department'
          break
      }

      console.log('Frontend sending:', { losId, action, applicationType: selectedApplication.application_type })
      
      const response = await fetch('/api/applications/update-status-workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          losId: losId,
          status: selectedApplication.status,
          applicationType: selectedApplication.application_type,
          department: 'SPU',
          action: action
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Backend error response:', errorData)
        throw new Error(errorData.error || 'Failed to update status')
      }
      
      // Update application status in frontend
      const updatedApplications = spuApplications.map(app => 
        app.id === selectedApplication.id 
          ? { ...app, status: `forwarded_to_${destination}` }
          : app
      )
      setSpuApplications(updatedApplications)
      
      toast({
        title: "Application Forwarded",
        description: statusMessage,
      })
      
      setSelectedApplication(null)
      setVerificationStep(1)
      setVerificationComments("")
      setShowRejectionOptions(false)
      setFieldVerification({
        nameVerified: false,
        cnicVerified: false,
        incomeVerified: false,
        addressVerified: false,
        employmentVerified: false
      })
    } catch (error) {
      console.error('Error updating status:', error)
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive"
      })
    }
  }

  // Load SPU checklist for selected application
  const loadSpuChecklist = async (losId: string) => {
    try {
      const numericLosId = losId.replace('LOS-', '')
      const response = await fetch(`/api/applications/spu-checklist/${numericLosId}`)
      
      if (response.ok) {
        const data = await response.json()
        const checklistData: any = {
          ecib: { checked: false, comment: "" },
          frmu: { checked: false, comment: "" },
          negative_list: { checked: false, comment: "" },
          pep_list: { checked: false, comment: "" },
          credit_card_30k: { checked: false, comment: "" },
          black_list: { checked: false, comment: "" },
          ctl: { checked: false, comment: "" }
        }
        
        data.checklist.forEach((item: any) => {
          if (checklistData[item.check_type]) {
            checklistData[item.check_type] = {
              checked: item.is_checked || false,
              comment: item.comment_text || ""
            }
          }
        })
        
        setSpuChecklist(checklistData)
      }
    } catch (error) {
      console.error('Error loading SPU checklist:', error)
    }
  }

  // Update SPU checklist item
  const updateSpuChecklistItem = async (checkType: string, isChecked: boolean, comment: string) => {
    if (!selectedApplication) return
    
    try {
      const losId = selectedApplication.los_id?.replace('LOS-', '') || selectedApplication.id?.split('-')[1]
      
      const response = await fetch('/api/applications/update-spu-checklist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          losId: losId,
          checkType: checkType,
          isChecked: isChecked,
          comment: comment
        })
      })

      if (response.ok) {
        setSpuChecklist(prev => ({
          ...prev,
          [checkType]: { checked: isChecked, comment: comment }
        }))
        
        toast({
          title: "Checklist Updated",
          description: `${checkType.toUpperCase()} check updated successfully`,
        })
      } else {
        throw new Error('Failed to update checklist')
      }
    } catch (error) {
      console.error('Error updating checklist:', error)
      toast({
        title: "Error",
        description: "Failed to update checklist",
        variant: "destructive"
      })
    }
  }

  // Handle auto check all compliance checks
  const handleAutoCheckAll = async () => {
    if (!selectedApplication) {
      toast({
        title: "Error",
        description: "No application selected",
        variant: "destructive"
      })
      return
    }

    setAutoCheckLoading(true)
    
    try {
      // Extract the application ID from the LOS ID
      const losId = selectedApplication.los_id?.replace('LOS-', '') || selectedApplication.id?.split('-')[1]
      
      console.log('🔍 Fetching form data for application:', {
        selectedApplication: selectedApplication.los_id || selectedApplication.id,
        losId: losId,
        applicationType: selectedApplication.application_type
      })
      
      // Fetch form data using the applications/form endpoint
      const formResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/applications/form/${losId}`)
      
      if (!formResponse.ok) {
        throw new Error(`Failed to fetch form data: ${formResponse.status}`)
      }
      
      const formData = await formResponse.json()
      console.log('📋 Fetched form data:', formData)
      
      // Extract CNIC from form data with multiple possible field names
      const cnic = formData.cnic ||
                   formData.applicant_cnic ||
                   formData.id_no ||
                   formData.personal_details?.cnic ||
                   formData.personalInformation?.cnic ||
                   formData.formData?.cnic
      
      console.log('🔍 Final CNIC extraction result:', {
        selectedApplication: selectedApplication.los_id || selectedApplication.id,
        applicationType: selectedApplication.application_type,
        extractedCnic: cnic,
        formDataFields: Object.keys(formData)
      })
      
      if (!cnic) {
        setAutoCheckLoading(false)
        toast({
          title: "Error",
          description: `CNIC not found in form data for ${selectedApplication.application_type} application.`,
          variant: "destructive"
        })
        return
      }

      // Show which CNIC is being used for checking
      toast({
        title: "Starting Auto Check",
        description: `Running compliance checks for CNIC: ${cnic}`,
      })
      
      // Call the combined check API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/check-all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cnic: cnic })
      })

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`)
      }

      const data = await response.json()

      // Support both legacy { results: [...] } and new { services: [...] } shapes
      const resultsArray = Array.isArray(data.results)
        ? data.results
        : (Array.isArray(data.services) ? data.services : null)
      
      if (data.success && resultsArray) {
        // Process each check result and update the checklist
        const updatedChecklist = { ...spuChecklist }
        let checkResults: { [key: string]: { status: string, comment: string } } = {}

        // Process each API result
        resultsArray.forEach((result: any) => {
          if (!result || !result.url) {
            console.warn('⚠️ Invalid result structure:', result)
            return
          }

          // Handle network errors or missing endpoints
          if (result.error) {
            console.warn(`⚠️ Error for ${result.url}:`, result.error)
            return
          }

          const url = result.url
          const checkData = result.data
          const existsFlag =
            (typeof result.exists === 'number' ? result.exists === 1 : false) ||
            (checkData?.exists === true) ||
            (typeof checkData?.count === 'number' && checkData.count > 0) ||
            (Array.isArray(checkData?.rows) && checkData.rows.length > 0)

          console.log(`🔍 Processing check result for ${url}:`, checkData)

          if (url.includes('/pep/check')) {
            const row = Array.isArray(checkData?.rows) && checkData.rows.length > 0 ? checkData.rows[0] : undefined
            const status = existsFlag ? 'FLAGGED' : 'CLEAR'
            const comment = existsFlag
              ? `PEP Match Found: ${row?.["name_of_individual/entity"] || row?.name || 'Record found'}`
              : 'No PEP match found'
            checkResults.pep_list = { status, comment }
          }
          
          else if (url.includes('/frms/check')) {
            const status = (checkData?.fraud || existsFlag) ? 'FLAGGED' : 'CLEAR'
            const comment = (checkData?.fraud || existsFlag)
              ? `Fraud Risk Detected: ${checkData.status || 'High Risk'} (Risk Score: ${checkData.risk_score || 'N/A'}) - ${checkData.remarks || 'No details'}`
              : 'No fraud indicators found'
            checkResults.frmu = { status, comment }
          }
          
          else if (url.includes('/sbp-blacklist/check')) {
            const row = Array.isArray(checkData?.rows) && checkData.rows.length > 0 ? checkData.rows[0] : undefined
            const status = existsFlag ? 'FLAGGED' : 'CLEAR'
            const comment = existsFlag
              ? `Blacklist Match: ${row?.customer_name || row?.customer || 'Record found'}`
              : 'Not found in SBP blacklist'
            checkResults.black_list = { status, comment }
          }
          
          else if (url.includes('/ecib-reports/check')) {
            const status = existsFlag ? 'FLAGGED' : 'CLEAR'
            const comment = existsFlag
              ? `eCIB Record Found: ${checkData.customer_name || 'Unknown'} - Outstanding: PKR ${checkData.total_balance_outstanding || '0'}`
              : 'No eCIB record found'
            checkResults.ecib = { status, comment }
          }
          
          else if (url.includes('/internal-watchlist/check')) {
            const row = Array.isArray(checkData?.rows) && checkData.rows.length > 0 ? checkData.rows[0] : undefined
            const name = checkData?.name || row?.name
            const status = (existsFlag || (typeof name === 'string' && name.trim().length > 0)) ? 'FLAGGED' : 'CLEAR'
            const comment = status === 'FLAGGED'
              ? `Watchlist Match: ${name || 'Record found'} - ${checkData?.action_required || row?.action_required || 'Review Required'}`
              : 'No internal watchlist match found'
            checkResults.negative_list = { status, comment }
          }
          
          else if (url.includes('/nadra-verisys/check')) {
            const status = existsFlag ? 'FLAGGED' : 'CLEAR'
            const comment = existsFlag
              ? `NADRA Verisys Record Found: ${checkData.details || 'Record exists'}`
              : 'NADRA Verisys verification passed'
            // Map to CTL check as it's the closest equivalent
            checkResults.ctl = { status, comment }
          }
          
          else if (url.includes('/ccl/check')) {
            const row = Array.isArray(checkData?.rows) && checkData.rows.length > 0 ? checkData.rows[0] : undefined
            const status = existsFlag ? 'FLAGGED' : 'CLEAR'
            const comment = existsFlag
              ? `CCL Record Found: ${row?.cust_name || checkData.cust_name || 'Customer'} - ${row?.remarks || checkData.remarks || 'No details'}`
              : 'No CCL record found'
            // Map to credit_card_30k check as it's related to credit card limits
            checkResults.credit_card_30k = { status, comment }
          }
        })

        // Log the results for debugging
        console.log('🎯 Processed check results:', checkResults)
        
        // Update each checklist item based on results
        const losId = selectedApplication.los_id?.replace('LOS-', '') || selectedApplication.id?.split('-')[1]
        let successfulUpdates = 0
        let failedUpdates = 0
        
        for (const [checkKey, result] of Object.entries(checkResults)) {
          try {
            const isCleared = result.status === 'CLEAR'
            const timestamp = new Date().toLocaleString()
            const finalComment = `🤖 Auto-checked (${timestamp}): ${result.comment}`
            
            // Update the checklist item
            await updateSpuChecklistItem(checkKey, isCleared, finalComment)
            successfulUpdates++
            console.log(`✅ Successfully updated ${checkKey}: ${result.status}`)
          } catch (error) {
            console.error(`❌ Failed to update ${checkKey}:`, error)
            failedUpdates++
          }
        }

        const flaggedCount = Object.values(checkResults).filter(r => r.status === 'FLAGGED').length
        
        toast({
          title: "Auto Check Completed",
          description: `${successfulUpdates} checks completed successfully. Found ${flaggedCount} flagged items${failedUpdates > 0 ? `. ${failedUpdates} updates failed.` : '.'}`,
        })
      } else {
        throw new Error('Invalid response format from check API')
      }
    } catch (error) {
      console.error('Error in auto check:', error)
      toast({
        title: "Auto Check Failed",
        description: error instanceof Error ? error.message : "Failed to perform automated compliance checks. Please check manually.",
        variant: "destructive"
      })
    } finally {
      setAutoCheckLoading(false)
    }
  }

  // Try to extract ECIB metrics from stored comment text so the dashboard can render boxes too
  const tryExtractEcibMetrics = (comment?: string): { principal?: number; markup?: number; others?: number; total?: number } | null => {
    if (!comment) return null
    const num = (s?: string) => (s ? Number(String(s).replace(/[,\s]/g, '')) : undefined)
    const p = comment.match(/Principal\s*:\s*([0-9,]+)/i)?.[1]
    const m = comment.match(/Mark-?up\s*:\s*([0-9,]+)/i)?.[1]
    const o = comment.match(/Others?\s*:\s*([0-9,]+)/i)?.[1]
    const t = comment.match(/Total\s*:\s*([0-9,]+)/i)?.[1]
    if (p || m || o || t) {
      return { principal: num(p), markup: num(m), others: num(o), total: num(t) }
    }
    return null
  }

  // Upload eCIB PDF and parse outstanding balance via OCR API
  
  const ecibFileInputRef = React.useRef<HTMLInputElement | null>(null)
  const [ecibUploading, setEcibUploading] = React.useState<boolean>(false)
  const [ecibOcrResult, setEcibOcrResult] = React.useState<{
    principal?: number
    markup?: number
    others?: number
    total?: number
    fileName?: string
  } | null>(null)

  // Clear OCR result when switching to another application
  useEffect(() => {
    setEcibOcrResult(null)
  }, [selectedApplication?.los_id])
  const handleUploadEcibPdf = async (file: File) => {
    try {
      setEcibUploading(true)
      const form = new FormData()
      form.append('file', file)

      // Endpoint strategy: environment override → known tunnel fallback → local dev
      const envEndpoint = process.env.NEXT_PUBLIC_OCR_PDF_URL
      const ocrBase = (process.env.NEXT_PUBLIC_OCR_BASE_URL || '').replace(/\/$/, '')
      const fallbacks = [
        envEndpoint,
        ocrBase ? `${ocrBase}/statebank/ocr/pdf` : undefined,
        'http://localhost:8020/ocr/pdf'
      ].filter(Boolean) as string[]

      // Small helper with timeout + retry to avoid hanging network calls
      const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs = 15000) => {
        const controller = new AbortController()
        const id = setTimeout(() => controller.abort(), timeoutMs)
        try {
          const res = await fetch(url, { ...options, signal: controller.signal })
          return res
        } finally {
          clearTimeout(id)
        }
      }

      let resp: Response | null = null
      let lastErr: any = null
      for (const url of fallbacks) {
        try {
          console.log('Posting ECIB PDF to OCR endpoint:', url)
          resp = await fetchWithTimeout(url, { method: 'POST', body: form }, 20000)
          if (resp && resp.ok) break
          lastErr = new Error(`OCR API failed: ${resp ? resp.status : 'no response'}`)
        } catch (e) {
          lastErr = e
        }
      }

      if (!resp || !resp.ok) {
        throw lastErr || new Error('OCR API request failed')
      }

      const data = await resp.json().catch(() => ({}))

      // Extract summary for eCIB comment
      // Expect shape: { file_name, extracted: { 'outstanding balance': [ { Total: 1400, ... } ] } }
      const rows = data?.extracted?.["outstanding balance"] || []
      const first = Array.isArray(rows) && rows.length > 0 ? rows[0] : null
      const principal = first?.Principal ?? first?.principal ?? null
      const markup = first?.['Mark-up'] ?? first?.markup ?? null
      const others = first?.Others ?? first?.others ?? null
      const total = first?.Total ?? first?.total ?? null

      const pieces = [] as string[]
      if (principal != null) pieces.push(`Principal: ${principal}`)
      if (markup != null) pieces.push(`Mark-up: ${markup}`)
      if (others != null) pieces.push(`Others: ${others}`)
      if (total != null) pieces.push(`Total: ${total}`)
      const summary = pieces.length > 0 ? pieces.join(' | ') : JSON.stringify(first || data?.extracted)

      // Update ECIB checklist comment and mark as flagged/clear depending on total
      const isClear = total != null ? Number(total) === 0 : false
      // Mark checked as done regardless; comment contains summary
      await updateSpuChecklistItem('ecib', true, `OCR eCIB parsed → ${summary}`)

      setEcibOcrResult({
        principal: principal != null ? Number(principal) : undefined,
        markup: markup != null ? Number(markup) : undefined,
        others: others != null ? Number(others) : undefined,
        total: total != null ? Number(total) : undefined,
        fileName: data?.file_name || file.name
      })

      toast({
        title: 'eCIB PDF processed',
        description: 'OCR completed and checklist updated.',
      })
    } catch (err: any) {
      console.error('eCIB OCR upload failed:', err)
      const hint = 'Set NEXT_PUBLIC_OCR_PDF_URL to your active OCR server (e.g. tunnel URL) or start the local OCR service.'
      toast({ title: 'eCIB upload failed', description: `${err?.message || 'Could not process PDF'}\n${hint}`, variant: 'destructive' })
    } finally {
      setEcibUploading(false)
      if (ecibFileInputRef.current) ecibFileInputRef.current.value = ''
    }
  }
  
  // Handle forwarding resolved applications to normal workflow
  const handleForwardResolved = async (application: any, action: string) => {
    try {
      const losId = application.los_id?.replace('LOS-', '') || application.id?.split('-')[1]
      
      console.log('Frontend sending:', { 
        losId, 
        action, 
        applicationType: application.application_type,
        status: 'submitted_by_spu',
        department: 'SPU'
      })

      const response = await fetch('/api/applications/update-status-workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          losId: losId,
          status: 'submitted_by_spu',
          applicationType: application.application_type,
          department: 'SPU',
          action: action
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Application Forwarded",
          description: "Resolved application has been verified and forwarded to EAMVU and COPS",
        })
        
        // Update local state to remove the application from resolved tab
        const updatedApplications = spuApplications.map(app =>
          app.id === application.id ? { ...app, status: 'submitted_by_spu' } : app
        )
        setSpuApplications(updatedApplications)
        
        // Refresh applications
        fetchSpuApplications()
      } else {
        throw new Error(result.error || 'Failed to forward application')
      }
    } catch (error) {
      console.error('Error forwarding resolved application:', error)
      toast({
        title: "Error",
        description: "Failed to forward resolved application",
        variant: "destructive"
      })
    }
  }

  const handleViewApplication = async (application: any) => {
    try {
      console.log('🔄 Fetching form data for application:', application.los_id);
      
      // Load SPU checklist for the selected application
      await loadSpuChecklist(application.los_id);
      
      // Extract the numeric part from los_id (e.g., "LOS-18" -> "18")
      console.log(application);
      const losIdstr = application.los_id.replace('LOS-', '');
      const losId = parseInt(losIdstr);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/applications/form/${losId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch form data');
      }
      
      const data = await response.json();
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
      // Update the selected application with the fetched form data
      setSelectedApplication({
        ...application,
        formData: data.formData
      });
      
      // Fetch all department comments for this application
      await fetchAllDepartmentComments(losIdstr);
      
      toast({
        title: "Form Data Loaded",
        description: `Application form data has been loaded successfully.`,
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


  return (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">Sales Processing Unit Dashboard</h1>
      <Button>Process Next</Button>
    </div>

    {/* Stats Cards - Modern Design */}
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat) => (
        <Card key={stat.title} className="modern-card hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
            <div className="space-y-1">
              <p className="stat-label">{stat.title}</p>
              <p className="stat-value">{stat.value}</p>
              <p className="stat-change">{stat.change}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    <Tabs defaultValue="new" value={activeTab} onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value="new">New Applications ({newApplications.length})</TabsTrigger>
        <TabsTrigger value="resolved">Resolved ({resolvedApplications.length})</TabsTrigger>
        {/* <TabsTrigger value="verified">Verified</TabsTrigger>
        <TabsTrigger value="returned">Returned</TabsTrigger> */}
      </TabsList>

      {/* New Applications Tab */}
      <TabsContent value="new" className="space-y-4">
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
                    <SelectItem value="submitted_to_spu">New</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="returned">Returned</SelectItem>
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

        {/* Applications Table */}
        <Card>
          <CardHeader>
            <CardTitle>New Applications ({filteredApplications.length})</CardTitle>
            <CardDescription>Applications pending SPU verification</CardDescription>
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
                  <TableHead>Application Started</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      Loading applications...
                    </TableCell>
                  </TableRow>
                ) : newApplications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      No new applications found.
                    </TableCell>
                  </TableRow>
                ) : (
                  newApplications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-mono text-sm">{app.los_id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{app.applicant_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {app.assigned_officer
                              ? `Assigned to: ${app.assigned_officer}`
                              : "Unassigned"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{app.loan_type}</TableCell>
                      <TableCell className="font-medium">
                        PKR {app.loan_amount?.toLocaleString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(app.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDateTime(app.created_at)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDateTime((app as any).updated_at)}</TableCell>
                                             <TableCell className="text-right">
                         <div className="flex gap-2 justify-end">
                           <Button
                             variant="outline"
                             size="sm"
                             onClick={async () => {
                               await handleViewApplication(app)
                               setShowViewDialog(true)
                             }}
                           >
                             <Eye className="mr-2 h-4 w-4" />
                             View
                           </Button>
                           
                           <Button
                             variant="outline"
                             size="sm"
                             onClick={() => {
                               setSelectedApplication(app)
                               setShowDocumentExplorer(true)
                             }}
                           >
                             <FolderOpen className="mr-2 h-4 w-4" />
                             Documents
                           </Button>

                           
                           <Dialog>
                             <DialogTrigger asChild>
                               <Button
                                 onClick={() => {
                                   setSelectedApplication(app);
                                   setVerificationStep(1);
                                 }}
                               >
                                 Verify
                               </Button>
                             </DialogTrigger>
                             <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Application Verification</DialogTitle>
                              <DialogDescription>
                                {selectedApplication
                                  ? `Verify application for ${selectedApplication.applicant_name}`
                                  : "Loading..."}
                              </DialogDescription>
                            </DialogHeader>

                            {/* Verification Steps */}
                            <div className="py-4 px-2">
                                                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center">
                                  <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                      "bg-blue-100 text-blue-600"
                                    }`}
                                  >
                                    1
                                  </div>
                                  <div className="ml-3">
                                    <p className="font-medium">Document Verification</p>
                                    <p className="text-sm text-muted-foreground">
                                      Check all required documents
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Step 1 */}
                              {verificationStep === 1 && selectedApplication && (
                                <div className="space-y-6">
                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="text-lg">Required Documents</CardTitle>
                                      <CardDescription>
                                        Verify all required documents are present and valid
                                      </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                      {/* Bulk Action Buttons */}
                                      <div className="flex gap-2 mb-4">
                                        <Button
                                          variant="default"
                                          size="sm"
                                          onClick={() => {
                                            const documentChecklist = getDocumentChecklist(selectedApplication);
                                            documentChecklist.forEach((doc: any) => {
                                              handleVerifyDocument(doc.id);
                                            });
                                          }}
                                          className="bg-green-600 hover:bg-green-700"
                                        >
                                          <Check className="h-4 w-4 mr-1" />
                                          Verify All
                                        </Button>
                                        <Button
                                          variant="destructive"
                                          size="sm"
                                          onClick={() => {
                                            const documentChecklist = getDocumentChecklist(selectedApplication);
                                            documentChecklist.forEach((doc: any) => {
                                              handleRejectDocument(doc.id);
                                            });
                                          }}
                                        >
                                          <Ban className="h-4 w-4 mr-1" />
                                          Reject All
                                        </Button>
                                      </div>
                                      
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>Document</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Required</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {getDocumentChecklist(selectedApplication).map((doc: any) => (
                                            <TableRow key={doc.id}>
                                              <TableCell>{doc.name}</TableCell>
                                              <TableCell>
                                                <Badge variant={doc.verified ? "default" : doc.rejected ? "destructive" : "secondary"}>
                                                  {doc.verified ? "Verified" : doc.rejected ? "Rejected" : "Pending"}
                                                </Badge>
                                              </TableCell>
                                              <TableCell>{doc.required ? "Yes" : "No"}</TableCell>
                                              <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleOpenDocumentInNewTab(doc)}
                                                    title="View Document"
                                                    className="text-blue-600 hover:text-blue-800"
                                                  >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    View
                                                  </Button>
                                                  <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleVerifyDocument(doc.id)}
                                                    disabled={doc.verified}
                                                    title="Verify Document"
                                                  >
                                                    <Check className="h-4 w-4 mr-1" />
                                                    Verify
                                                  </Button>
                                                  <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleRejectDocument(doc.id)}
                                                    disabled={doc.rejected}
                                                    title="Reject Document"
                                                  >
                                                    <Ban className="h-4 w-4 mr-1" />
                                                    Reject
                                                  </Button>
                                                 </div>
                                               </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
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
                                            placeholder="Add any notes or comments about the verification process..."
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

                                  {/* SPU Compliance Checklist */}
                                  <Card className="mb-4">
                                    <CardHeader>
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <CardTitle className="text-lg flex items-center gap-2">
                                            <CheckSquare className="h-5 w-5 text-blue-600" />
                                            SPU Compliance Checklist
                                          </CardTitle>
                                          <CardDescription>
                                            Complete all required compliance checks before processing
                                          </CardDescription>
                                        </div>
                                        <Button
                                          onClick={handleAutoCheckAll}
                                          disabled={!selectedApplication || autoCheckLoading}
                                          className="bg-blue-600 hover:bg-blue-700 text-white"
                                          size="sm"
                                        >
                                          {autoCheckLoading ? (
                                            <>
                                              <Activity className="h-4 w-4 mr-2 animate-spin" />
                                              Checking...
                                            </>
                                          ) : (
                                            <>
                                              <CheckCircle className="h-4 w-4 mr-2" />
                                              Auto Check All
                                            </>
                                          )}
                                        </Button>
                                      </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                      {[
                                        { key: 'ecib', label: 'eCIB – Source SBP', description: 'If Defaulter (unpaid credit history) then application sent to Risk Policy unit for approval.' },
                                        { key: 'frmu', label: 'FRMU – Source Internal', description: 'Check for API. If output is No Record then pass. If output shows Name & NIC then red flag for fraud and application forwarded to Risk Policy unit & Compliance unit for approvals.' },
                                        { key: 'negative_list', label: 'Negative (Watch) List – Source Internal', description: 'If Name/CNIC appears on Excel report then send to Compliance unit for approval.' },
                                        { key: 'pep_list', label: 'PEP List – Source international databases Excel', description: 'If Name appears on Excel report then send to Compliance unit for approval.' },
                                        { key: 'credit_card_30k', label: 'High Value Credit Card List – Source SBP', description: 'If Name/CNIC appears on Excel report then send to Risk Policy for approval.' },
                                        { key: 'black_list', label: 'Black List – Source Internal', description: 'If Name/CNIC appears on Excel report then send to Risk Policy for approval.' },
                                        { key: 'ctl', label: 'CTL – Source Internal', description: 'Check for API. Shows history of past credit cards. If output is No Record then pass. If output shows Name/CNIC then send application to Risk Policy for approval.' }
                                      ].map((item) => (
                                        <div key={item.key} className="border rounded-lg p-4">
                                          <div className="flex items-start gap-3">
                                            <Checkbox
                                              checked={(spuChecklist as any)[item.key]?.checked || false}
                                              onCheckedChange={(checked) => {
                                                const newComment = (spuChecklist as any)[item.key]?.comment || ""
                                                updateSpuChecklistItem(item.key, checked as boolean, newComment)
                                              }}
                                              className="mt-1"
                                            />
                                            <div className="flex-1">
                                              <div className="flex items-center justify-between">
                                                <Label className="font-medium text-sm">{item.label}</Label>
                                                {item.key === 'ecib' && (
                                                  <div className="flex items-center gap-2 ml-2">
                                                    <input
                                                      ref={ecibFileInputRef}
                                                      type="file"
                                                      accept="application/pdf"
                                                      hidden
                                                      onChange={(e) => {
                                                        const f = e.target.files?.[0]
                                                        if (f) handleUploadEcibPdf(f)
                                                      }}
                                                    />
                                                    <Button
                                                      size="sm"
                                                      variant="outline"
                                                      disabled={ecibUploading}
                                                      onClick={() => ecibFileInputRef.current?.click()}
                                                    >
                                                      <Upload className="h-3 w-3 mr-1" />
                                                      {ecibUploading ? 'Checking…' : 'Upload eCIB PDF'}
                                                    </Button>
                                                  </div>
                                                )}
                                              </div>
                                              <p className="text-xs text-muted-foreground mt-1">{item.description}</p>

                                              {/* Inline display for parsed OCR result (ECIB only) */}
                                              {item.key === 'ecib' && (ecibOcrResult || tryExtractEcibMetrics((spuChecklist as any)[item.key]?.comment)) && (
                                                (() => {
                                                  const m = ecibOcrResult || tryExtractEcibMetrics((spuChecklist as any)[item.key]?.comment)!
                                                  return (
                                                    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
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
                                                  )
                                                })()
                                              )}
                                              <Textarea
                                                placeholder="Add comments for this check..."
                                                value={(spuChecklist as any)[item.key]?.comment || ""}
                                                onChange={(e) => {
                                                  const newComment = e.target.value
                                                  const isChecked = (spuChecklist as any)[item.key]?.checked || false
                                                  setSpuChecklist(prev => ({
                                                    ...prev,
                                                    [item.key]: { checked: isChecked, comment: newComment }
                                                  }))
                                                }}
                                                onBlur={(e) => {
                                                  const newComment = e.target.value
                                                  const isChecked = (spuChecklist as any)[item.key]?.checked || false
                                                  updateSpuChecklistItem(item.key, isChecked, newComment)
                                                }}
                                                className="mt-2 text-xs"
                                                rows={2}
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </CardContent>
                                  </Card>

                                  <div className="flex justify-between pb-4">
                                    <Button
                                      variant="outline"
                                      onClick={() => setSelectedApplication(null)}
                                    >
                                      Cancel
                                    </Button>
                                    <div className="space-x-2">
                                      {!showRejectionOptions ? (
                                        <>
                                          <Button 
                                            variant="destructive" 
                                            onClick={() => setShowRejectionOptions(true)}
                                          >
                                            Reject Application
                                          </Button>
                                          <Button onClick={handleVerifyApplication}>
                                            Verify & Send to COPS
                                          </Button>
                                        </>
                                      ) : (
                                        <div className="flex flex-col gap-2">
                                          <p className="text-sm font-medium">Forward application to:</p>
                                          <div className="flex gap-2 flex-wrap">
                                            <Button 
                                              variant="outline"
                                              size="sm"
                                              onClick={() => handleRejectApplication('rru')}
                                            >
                                              Risk Review Unit (RRU)
                                            </Button>
                                            <Button 
                                              variant="outline"
                                              size="sm"
                                              onClick={() => handleRejectApplication('risk')}
                                            >
                                              Risk Management
                                            </Button>
                                            <Button 
                                              variant="outline"
                                              size="sm"
                                              onClick={() => handleRejectApplication('compliance')}
                                            >
                                              Compliance Department
                                            </Button>
                                            <Button 
                                              variant="outline"
                                              size="sm"
                                              onClick={() => handleRejectApplication('risk_compliance')}
                                            >
                                              Risk & Compliance
                                            </Button>
                                          </div>
                                          <Button 
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowRejectionOptions(false)}
                                          >
                                            Cancel Rejection
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}


                            </div>
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

      {/* Resolved Applications Tab */}
      <TabsContent value="resolved" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Resolved Applications</CardTitle>
            <CardDescription>Applications resolved by Risk Management and Compliance Department</CardDescription>
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
                  <TableHead>Resolved By</TableHead>
                  <TableHead>Comments</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      Loading resolved applications...
                    </TableCell>
                  </TableRow>
                ) : resolvedApplications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      No resolved applications found.
                    </TableCell>
                  </TableRow>
                ) : (
                  resolvedApplications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-mono text-sm">{app.los_id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{app.applicant_name}</div>
                        </div>
                      </TableCell>
                      <TableCell>{app.loan_type}</TableCell>
                      <TableCell className="font-medium">
                        PKR {parseInt(app.loan_amount || '0').toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {app.status === 'resolved_by_risk&compliance' ? (
                          <Badge className="bg-purple-100 text-purple-800">Resolved by Risk & Compliance</Badge>
                        ) : app.status === 'resolved_by_risk' ? (
                          <Badge className="bg-blue-100 text-blue-800">Resolved by Risk</Badge>
                        ) : app.status === 'resolved_by_rru' ? (
                          <Badge className="bg-green-100 text-green-800">Resolved by RRU</Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800">Resolved by Compliance</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {app.status === 'resolved_by_risk&compliance'
                          ? 'Risk & Compliance'
                          : app.status === 'resolved_by_risk'
                          ? 'Risk Management'
                          : app.status === 'resolved_by_rru'
                          ? 'RRU Department'
                          : 'Compliance Department'}
                      </TableCell>
                      <TableCell className="max-w-48">
                        <div className="text-sm text-muted-foreground">
                          {app.risk_resolve_comment || app.compliance_resolve_comment ? (
                            <div className="bg-blue-50 p-2 rounded text-xs">
                              <span className="font-medium text-blue-600">
                                {app.status === 'resolved_by_risk' ? 'Risk Comment: ' : 'Compliance Comment: '}
                              </span>
                              <div className="mt-1 text-gray-700">
                                {app.risk_resolve_comment || app.compliance_resolve_comment}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">No resolve comment provided</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              await handleViewApplication(app)
                              setShowViewDialog(true)
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedApplication(app)
                              setShowDocumentExplorer(true)
                            }}
                          >
                            <FolderOpen className="h-4 w-4 mr-1" />
                            Documents
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="default">
                                Forward
                                <ArrowRight className="h-4 w-4 ml-1" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleForwardResolved(app, 'verify')}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Verify & Forward to EAMVU/COPS
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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

      <TabsContent value="verified" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Verified Applications</CardTitle>
            <CardDescription>
              Applications that have been verified and sent to COPS
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Verified applications will appear here...</p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="returned" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Returned Applications</CardTitle>
            <CardDescription>
              Applications that have been returned to PB for corrections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Returned applications will appear here...</p>
          </CardContent>
        </Card>
             </TabsContent>
     </Tabs>

     {/* Document Viewer Modal */}
     <Dialog open={showDocumentViewer} onOpenChange={setShowDocumentViewer}>
       <DialogContent className="max-w-4xl max-h-[80vh]">
         <DialogHeader>
           <DialogTitle>Document Viewer</DialogTitle>
           <DialogDescription>
             {selectedDocument ? `Viewing: ${selectedDocument.name}` : "Loading document..."}
           </DialogDescription>
         </DialogHeader>
         
         {selectedDocument && (
           <div className="space-y-4">
             <div className="flex items-center justify-between">
               <div>
                 <h3 className="font-medium">{selectedDocument.name}</h3>
                 <p className="text-sm text-muted-foreground">
                   Status: {getDocumentStatusBadge(selectedDocument.status)}
                 </p>
               </div>
               <div className="flex gap-2">
                 <Button
                   variant="outline"
                   size="sm"
                   onClick={() => handleDownloadDocument(selectedDocument)}
                 >
                   <Download className="h-4 w-4 mr-2" />
                   Download
                 </Button>
                                   <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDocumentInModal(selectedDocument)}
                  >
                   <ExternalLink className="h-4 w-4 mr-2" />
                   Open in New Tab
                 </Button>
               </div>
             </div>
             
             <div className="border rounded-lg p-4 bg-gray-50 min-h-[400px] flex items-center justify-center">
               <div className="text-center">
                 <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                 <p className="text-gray-600 mb-2">Document Preview</p>
                 <p className="text-sm text-gray-500">
                   Click "Open in New Tab" to view the full document
                 </p>
               </div>
             </div>
             
             <div className="flex justify-end gap-2">
               <Button
                 variant="outline"
                 onClick={() => setShowDocumentViewer(false)} >
                 Close
               </Button>
               <Button
                 variant="default"
                 onClick={() => {
                   handleVerifyDocument(selectedDocument.id)
                   setShowDocumentViewer(false)
                 }}
                 disabled={selectedDocument.status === "verified"}
               >
                 <Check className="h-4 w-4 mr-2" />
                 Verify Document
               </Button>
             </div>
           </div>
         )}
               </DialogContent>
      </Dialog>

             {/* Document Explorer Modal */}
       <Dialog open={showDocumentExplorer} onOpenChange={setShowDocumentExplorer}>
         <DialogContent className="max-w-6xl max-h-[90vh]">
           <DialogHeader>
             <DialogTitle>Document Explorer - {selectedApplication?.los_id}</DialogTitle>
             <DialogDescription>
               Browse and view all documents uploaded by Personal Banking for this application
             </DialogDescription>
           </DialogHeader>
           
           {selectedApplication && (
             <div className="space-y-4">
               <div className="flex items-center justify-between mb-4">
                 <div>
                   <h3 className="font-medium">Application: {selectedApplication.applicant_name}</h3>
                   <p className="text-sm text-muted-foreground">
                     LOS ID: {selectedApplication.los_id} | Type: {selectedApplication.application_type}
                   </p>
                 </div>
                 <Button
                   variant="outline"
                   onClick={() => setShowDocumentExplorer(false)}
                 >
                   Close
                 </Button>
               </div>
               
                             <DocumentExplorer 
                losId={selectedApplication?.los_id}
                applicationType={selectedApplication?.application_type}
                onFileSelect={(file) => {
                  // Handle file selection if needed
                  console.log('Selected file:', file)
                }}
              />
             </div>
           )}
         </DialogContent>
       </Dialog>

       {/* View Application Dialog - Controlled */}
       <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
         <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
           <DialogHeader className="sticky top-0 bg-white z-10 pb-4 border-b">
             <DialogTitle>Application Details - {selectedApplication?.los_id}</DialogTitle>
             <DialogDescription>
               Complete application information for SPU verification
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
                       <DollarSign className="h-5 w-5" />
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
                   </CardContent>
                 </Card>
               )}

               {/* Risk/Compliance Resolve Comments Section */}
               {(selectedApplication.risk_resolve_comment || selectedApplication.compliance_resolve_comment) && (
                 <Card>
                   <CardHeader>
                     <CardTitle className="text-lg flex items-center gap-2">
                       <FileText className="h-5 w-5" />
                       Risk/Compliance Resolution Comments
                     </CardTitle>
                     <CardDescription>
                       Comments provided by Risk Management and Compliance Department
                     </CardDescription>
                   </CardHeader>
                   <CardContent>
                     <div className="space-y-4">
                       {selectedApplication.risk_resolve_comment && (
                         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                           <div className="flex items-center gap-2 mb-2">
                             <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                             <Label className="font-medium text-blue-800">Risk Management Resolution</Label>
                           </div>
                           <p className="text-sm text-blue-700">{selectedApplication.risk_resolve_comment}</p>
                         </div>
                       )}
                       {selectedApplication.compliance_resolve_comment && (
                         <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                           <div className="flex items-center gap-2 mb-2">
                             <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                             <Label className="font-medium text-green-800">Compliance Department Resolution</Label>
                           </div>
                           <p className="text-sm text-green-700">{selectedApplication.compliance_resolve_comment}</p>
                         </div>
                       )}
                     </div>
                   </CardContent>
                 </Card>
               )}

               {/* SPU Checklist Section */}
               {spuChecklist && Object.keys(spuChecklist).length > 0 && (
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
                         const checklistItem = (spuChecklist as any)[item.key]
                         return (
                           <div key={item.key} className="border rounded-lg p-4">
                             <div className="flex items-start gap-3">
                               <div className="flex items-center space-x-2">
                                 <Checkbox 
                                   checked={checklistItem?.checked || false}
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

               {/* Document Explorer Section */}
               <Card>
                 <CardHeader>
                   <div className="flex items-center justify-between">
                     <div>
                       <CardTitle className="text-lg flex items-center gap-2">
                         <FolderOpen className="h-5 w-5" />
                         Application Documents
                       </CardTitle>
                       <CardDescription>
                         Browse and view all documents uploaded for this application
                       </CardDescription>
                     </div>
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => setShowDocumentExplorer(true)}
                     >
                       <FolderOpen className="h-4 w-4 mr-2" />
                       Open in Full View
                     </Button>
                   </div>
                 </CardHeader>
                 <CardContent>
                   <div className="max-h-96 overflow-y-auto">
                     <DocumentExplorer 
                       losId={selectedApplication?.los_id?.replace('LOS-', '') || selectedApplication?.id?.split('-')[1]}
                       applicationType={selectedApplication?.application_type}
                       onFileSelect={(file) => {
                         // Handle file selection if needed
                         console.log('Selected file:', file)
                       }}
                     />
                   </div>
                 </CardContent>
               </Card>
             </div>
           )}

           <DialogFooter className="sticky bottom-0 bg-white border-t pt-4">
             <Button variant="outline" onClick={() => {
               setShowViewDialog(false)
               setSelectedApplication(null)
             }}>
               Close
             </Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
    </div>
  );
  }
