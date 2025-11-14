"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { parseEcibData, formatForDecisionEngine, extractLegacyMetrics } from "@/utils/ecibDataParser"
import { 
  Calculator, 
  Upload, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  FileText,
  Loader2,
  Save,
  Eye,
  BarChart3,
  User,
  Banknote,
  Building,
  Calendar,
  Shield,
  Award
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getApiUrl } from "@/lib/losIdHelper"

interface DecisionEngineCalculatorProps {
  losId: string
  applicationData?: any
  onDecisionComplete?: (decision: any) => void
}

interface ModuleScore {
  score: number
  raw?: any
  notes: string[]
  flags?: string[]
}

interface DecisionResult {
  modules: {
    dbr: ModuleScore
    age: ModuleScore
    city: ModuleScore
    income: ModuleScore
    spu: ModuleScore
    eamvu: ModuleScore
    application_score?: ModuleScore
    behavioral_score?: ModuleScore
  }
  weighted: {
    dbr: number
    age: number
    city: number
    income: number
    spu: number
    eamvu: number
    application_score?: number
    behavioral_score?: number
  }
  final_score: number
  decision: string
  risk_level: string
  recommendation: string
  critical_checks?: any
  critical_checks_passed?: boolean
}

export default function DecisionEngineCalculator({ 
  losId, 
  applicationData: initialAppData,
  onDecisionComplete 
}: DecisionEngineCalculatorProps) {
  const { toast } = useToast()
  
  // State
  const [loading, setLoading] = useState(false)
  const [calculating, setCalculating] = useState(false)
  const [applicationData, setApplicationData] = useState<any>(null) // Always start null to force API load
  const [ecibData, setEcibData] = useState<any>(null)
  const [ecibFileName, setEcibFileName] = useState<string>("")
  const [uploadingEcib, setUploadingEcib] = useState(false)
  const [decisionResult, setDecisionResult] = useState<DecisionResult | null>(null)
  const [savedDecision, setSavedDecision] = useState<any>(null)
  const [savingDecision, setSavingDecision] = useState(false)
  const [notes, setNotes] = useState("")

  // Auto-load application data on mount
  useEffect(() => {
    if (losId) {
      loadApplicationData()
    }
  }, [losId])

  // Load application data
  const loadApplicationData = async () => {
    try {
      setLoading(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      
      // Backend V2.0: Get form data with documents
      const formResponse = await fetch(`${apiUrl}/api/v1/applications/form/${losId}`)
      if (!formResponse.ok) {
        throw new Error('Failed to load application data')
      }

      const formData = await formResponse.json()
      setApplicationData(formData.data)
      
      // Log loaded data for debugging
      console.log('═'.repeat(80))
      console.log('📥 APPLICATION DATA LOADED:')
      console.log('═'.repeat(80))
      console.log('LOS ID:', losId)
      console.log('Full Data Structure:', formData.data)
      console.log('CNIC:', formData.data?.cnic)
      console.log('Income:', formData.data?.gross_monthly_income)
      console.log('DOB:', formData.data?.date_of_birth)
      console.log('City:', formData.data?.curr_city || formData.data?.city)
      console.log('Documents:', formData.data?.documents)
      console.log('═'.repeat(80))

      toast({
        title: "✅ Application Data Loaded",
        description: "Checking for eCIB document in FileZilla...",
      })

      // ALWAYS try to fetch eCIB from FileZilla directory (ignore database metadata)
      // This is the most reliable way since documents are physically stored there
      if (formData.success) {
        // Map product_type to FileZilla folder structure
        const productTypeMap: Record<string, string> = {
          'personal_loan': 'cashplus',
          'cashplus': 'cashplus',
          'auto_loan': 'autoloan',
          'autoloan': 'autoloan',
          'commercial_vehicle': 'commercialvehicle',
          'smeasaan': 'smeasaan',
          'ameendrive': 'ameendrive'
        }
        
        const rawProductType = formData.data.product_type || 'cashplus'
        const productType = productTypeMap[rawProductType.toLowerCase()] || rawProductType.toLowerCase()
        
        console.log('🔍 Checking for eCIB in FileZilla')
        console.log('   Raw product type:', rawProductType, '→ Mapped to:', productType)
        
        try {
          setUploadingEcib(true)
          toast({
            title: "🔄 Checking for eCIB...",
            description: "Looking for existing eCIB document",
          })

          // First, check if eCIB file exists via list-files API
          const listFilesUrl = `http://localhost:8086/list-files?loan_type=${productType}&los_id=${losId}`
          console.log('   Checking files at:', listFilesUrl)
          
          const listResponse = await fetch(listFilesUrl)
          if (!listResponse.ok) {
            throw new Error('FileZilla server not available')
          }

          const filesData = await listResponse.json()
          const ecibFile = filesData.files?.find((f: any) => 
            f.name.toLowerCase().includes('ecib') && f.name.toLowerCase().endsWith('.pdf')
          )

          if (!ecibFile) {
            throw new Error('No eCIB file found')
          }

          console.log('✅ Found eCIB file:', ecibFile.name)
          
          toast({
            title: "🔄 Auto-Processing eCIB",
            description: "OCR analysis in progress... This may take a few seconds",
          })

          // Fetch the actual file content via Document Server's /files/ endpoint
          const fileReadUrl = `http://localhost:8086/files/${productType}/los-${losId}/${encodeURIComponent(ecibFile.name)}`
          console.log('   Fetching file from:', fileReadUrl)
          
          const fileResponse = await fetch(fileReadUrl)
          
          if (!fileResponse.ok) {
            throw new Error(`Could not read eCIB file: ${fileResponse.statusText}`)
          }

          const pdfBlob = await fileResponse.blob()
          const pdfFile = new File([pdfBlob], ecibFile.name, { type: 'application/pdf' })

          // Upload to OCR service
          const formDataUpload = new FormData()
          formDataUpload.append('ecib_pdf', pdfFile)
          formDataUpload.append('losId', losId)

          const ocrResponse = await fetch(`${apiUrl}/api/decision/upload-ecib`, {
            method: 'POST',
            body: formDataUpload
          })

          if (!ocrResponse.ok) {
            throw new Error('eCIB OCR processing failed')
          }

          const ocrResult = await ocrResponse.json()
          
          // Parse new eCIB format (array of sections) or fallback to old format
          let processedEcibData = ocrResult.ecib_data;
          if (Array.isArray(ocrResult.ecib_data)) {
            console.log('📊 Parsing new eCIB format...');
            const parsed = parseEcibData(ocrResult.ecib_data);
            processedEcibData = formatForDecisionEngine(parsed);
            console.log('✅ Parsed eCIB:', processedEcibData);
          }
          
          setEcibData(processedEcibData)
          setEcibFileName(ocrResult.file_name)

          console.log('✅ eCIB Auto-Uploaded and Processed:', ocrResult)

          toast({
            title: "✅ eCIB Auto-Uploaded",
            description: `Processed in ${ocrResult.processing_time} • Auto-calculating decision...`,
          })

          setUploadingEcib(false)

          // Auto-calculate decision after 1 second
          setTimeout(() => {
            calculateDecision()
          }, 1000)

        } catch (ecibError: any) {
          console.log('ℹ️ No eCIB found in FileZilla for LOS-', losId)
          setUploadingEcib(false)
          // Silently fail - user can manually upload if needed
        }
      }

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle ECIB PDF upload
  const handleEcibUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid File",
        description: "Please upload a PDF file",
        variant: "destructive"
      })
      return
    }

    try {
      setUploadingEcib(true)
      
      // Show processing toast
      toast({
        title: "Processing ECIB PDF",
        description: "OCR analysis in progress... This may take 5-10 seconds",
      })
      
      const formData = new FormData()
      formData.append('ecib_pdf', file)
      formData.append('losId', losId)

      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/decision/upload-ecib`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to upload ECIB')
      }

      const result = await response.json()
      
      // Parse new eCIB format (array of sections) or fallback to old format
      let processedEcibData = result.ecib_data;
      if (Array.isArray(result.ecib_data)) {
        console.log('📊 Parsing new eCIB format from manual upload...');
        const parsed = parseEcibData(result.ecib_data);
        processedEcibData = formatForDecisionEngine(parsed);
        console.log('✅ Parsed eCIB:', processedEcibData);
      }
      
      setEcibData(processedEcibData)
      setEcibFileName(result.file_name)

      // Log ECIB data to console for debugging
      console.log('═'.repeat(80))
      console.log('📊 ECIB DATA RECEIVED FROM OCR:')
      console.log('═'.repeat(80))
      console.log(JSON.stringify(result.ecib_data, null, 2))
      console.log('═'.repeat(80))
      console.log('⏱️  Processing Time:', result.processing_time)
      console.log('📄 File Name:', result.file_name)
      console.log('═'.repeat(80))

      toast({
        title: "ECIB Uploaded Successfully",
        description: `Processed in ${result.processing_time} • Check console for details`,
      })
    } catch (error: any) {
      console.error('❌ ECIB Upload Error:', error)
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setUploadingEcib(false)
    }
  }

  // Calculate decision
  const calculateDecision = async () => {
    if (!applicationData) {
      toast({
        title: "No Data",
        description: "Please load application data first",
        variant: "destructive"
      })
      return
    }

    try {
      setCalculating(true)

      const payload = {
        losId,
        applicationData: applicationData, // Send complete application data directly
        ecibData,
        ecibFileName,
        calculatedBy: 'CIU_OFFICER',
        notes
      }

      // Use Backend V2.0 for decision calculation
      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/decision/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Calculation failed')
      }

      const data = await response.json()
      setDecisionResult(data.result)

      toast({
        title: "Decision Calculated",
        description: `Decision: ${data.result.decision} | Score: ${data.result.final_score}`,
      })

      if (onDecisionComplete) {
        onDecisionComplete(data.result)
      }
    } catch (error: any) {
      toast({
        title: "Calculation Failed",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setCalculating(false)
    }
  }

  // Save decision to database
  const saveDecision = async () => {
    if (!decisionResult) return

    try {
      setSavingDecision(true)

      // Prepare database record
      const dbRecord = {
        los_id: parseInt(losId),
        application_type: applicationData?.application_type || 'Unknown',
        
        // Module scores
        dbr_score: decisionResult.modules.dbr.score,
        dbr_raw: decisionResult.modules.dbr.raw,
        dbr_notes: JSON.stringify(decisionResult.modules.dbr.notes),
        
        age_score: decisionResult.modules.age.score,
        age_raw: decisionResult.modules.age.raw,
        age_notes: JSON.stringify(decisionResult.modules.age.notes),
        
        city_score: decisionResult.modules.city.score,
        city_name: applicationData?.application_data?.city || '',
        city_notes: JSON.stringify(decisionResult.modules.city.notes),
        
        income_score: decisionResult.modules.income.score,
        income_raw: applicationData?.application_data?.net_monthly_income || 0,
        income_notes: JSON.stringify(decisionResult.modules.income.notes),
        
        spu_score: decisionResult.modules.spu.score,
        spu_notes: JSON.stringify(decisionResult.modules.spu.notes),
        spu_flags: JSON.stringify(decisionResult.modules.spu.flags),
        
        eamvu_score: decisionResult.modules.eamvu.score,
        eamvu_notes: JSON.stringify(decisionResult.modules.eamvu.notes),
        
        application_score: decisionResult.modules.application_score?.score || null,
        application_score_notes: decisionResult.modules.application_score ? 
          JSON.stringify(decisionResult.modules.application_score.notes) : null,
        
        behavioral_score: decisionResult.modules.behavioral_score?.score || null,
        behavioral_score_notes: decisionResult.modules.behavioral_score ? 
          JSON.stringify(decisionResult.modules.behavioral_score.notes) : null,
        
        // Weighted scores
        weighted_dbr: decisionResult.weighted.dbr,
        weighted_age: decisionResult.weighted.age,
        weighted_city: decisionResult.weighted.city,
        weighted_income: decisionResult.weighted.income,
        weighted_spu: decisionResult.weighted.spu,
        weighted_eamvu: decisionResult.weighted.eamvu,
        weighted_application: decisionResult.weighted.application_score || 0,
        weighted_behavioral: decisionResult.weighted.behavioral_score || 0,
        
        // Final results
        final_score: decisionResult.final_score,
        decision: decisionResult.decision,
        risk_level: decisionResult.risk_level,
        recommendation: decisionResult.recommendation,
        
        // ECIB data
        ecib_data: ecibData ? JSON.stringify(ecibData) : null,
        ecib_file_name: ecibFileName || null,
        ecib_uploaded_at: ecibData ? new Date().toISOString() : null,
        ecib_cnic: ecibData?.individual_profile?.['Individual Profile']?.['CNIC #'] || null,
        
        // Application snapshot
        application_data: JSON.stringify(applicationData),
        
        // Critical checks
        critical_checks: JSON.stringify(decisionResult.critical_checks || {}),
        critical_checks_passed: decisionResult.critical_checks_passed !== false,
        
        // Audit
        calculated_by: 'CIU_OFFICER',
        notes
      }

      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/decision/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbRecord)
      })

      if (!response.ok) {
        throw new Error('Failed to save decision')
      }

      const result = await response.json()
      setSavedDecision(result.result)

      toast({
        title: "Decision Saved",
        description: "Decision has been saved to database",
      })
    } catch (error: any) {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setSavingDecision(false)
    }
  }

  // Get decision badge
  const getDecisionBadge = (decision: string) => {
    switch (decision.toUpperCase()) {
      case 'APPROVED':
        return <Badge className="bg-emerald-100 text-emerald-800 text-lg px-4 py-1">
          <CheckCircle className="w-4 h-4 mr-2" />
          APPROVED
        </Badge>
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800 text-lg px-4 py-1">
          <XCircle className="w-4 h-4 mr-2" />
          REJECTED
        </Badge>
      case 'REVIEW_REQUIRED':
      case 'REVIEW':
        return <Badge className="bg-amber-100 text-amber-800 text-lg px-4 py-1">
          <AlertTriangle className="w-4 h-4 mr-2" />
          REVIEW REQUIRED
        </Badge>
      default:
        return <Badge variant="secondary">{decision}</Badge>
    }
  }

  // Get risk badge
  const getRiskBadge = (risk: string) => {
    switch (risk?.toUpperCase()) {
      case 'LOW':
        return <Badge className="bg-green-100 text-green-800">LOW RISK</Badge>
      case 'MEDIUM':
        return <Badge className="bg-yellow-100 text-yellow-800">MEDIUM RISK</Badge>
      case 'HIGH':
        return <Badge className="bg-orange-100 text-orange-800">HIGH RISK</Badge>
      case 'CRITICAL':
        return <Badge className="bg-red-100 text-red-800">CRITICAL RISK</Badge>
      default:
        return <Badge variant="secondary">{risk}</Badge>
    }
  }

  // Get score badge classes with proper contrast
  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-emerald-100 text-emerald-800 border-emerald-200"
    if (score >= 60) return "bg-green-100 text-green-800 border-green-200"
    if (score >= 40) return "bg-amber-100 text-amber-800 border-amber-200"
    if (score >= 20) return "bg-orange-100 text-orange-800 border-orange-200"
    return "bg-red-100 text-red-800 border-red-200"
  }

  // Get text color for large score display (not badges)
  const getScoreTextColor = (score: number) => {
    if (score >= 80) return "text-emerald-600"
    if (score >= 60) return "text-green-600"
    if (score >= 40) return "text-amber-600"
    if (score >= 20) return "text-orange-600"
    return "text-red-600"
  }

  // Load data on mount - Use provided applicationData if available
  useEffect(() => {
    if (applicationData && Object.keys(applicationData).length > 0) {
      console.log('✅ Using provided application data for LOS-' + losId)
      setApplicationData(applicationData)
      
      // Check if eCIB was already uploaded in PB stage
      if (applicationData.documents?.ecib) {
        console.log('✅ eCIB already uploaded in PB stage - auto-loading')
        setEcibFileName(applicationData.documents.ecib.fileName || 'ecib.pdf')
        setEcibData(applicationData.documents.ecib.ocrData || applicationData.documents.ecib)
        toast({
          title: "eCIB Found",
          description: "eCIB report was already uploaded in PB stage",
        })
      }
    } else {
      console.log('⚠️ No application data provided - decision engine will use manual inputs')
    }
  }, [losId, applicationData]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-teal-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-teal-50 to-emerald-50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-teal-800 flex items-center gap-2">
                <Calculator className="w-6 h-6" />
                Decision Engine Calculator
              </CardTitle>
              <CardDescription className="text-teal-600">
                LOS-{losId} • Automated Credit Decision Analysis
              </CardDescription>
            </div>
            {savedDecision && (
              <Badge className="bg-teal-100 text-teal-800">
                <Save className="w-3 h-3 mr-1" />
                Decision Saved
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Application Data Card */}
      {applicationData && (
        <Card className="border-teal-100">
          <CardHeader className="bg-teal-50/50">
            <CardTitle className="text-lg text-teal-800 flex items-center gap-2">
              <User className="w-5 h-5" />
              Application Data
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-xs text-gray-500">Applicant Name</Label>
                <p className="font-medium text-gray-900">
                  {(() => {
                    const fullName = applicationData.applicant_name || applicationData.full_name || applicationData.application_data?.full_name
                    const firstName = applicationData.first_name || applicationData.application_data?.first_name
                    const lastName = applicationData.last_name || applicationData.application_data?.last_name
                    
                    if (fullName) {
                      return fullName
                    } else if (firstName || lastName) {
                      return `${firstName || ''} ${lastName || ''}`.trim()
                    } else {
                      return <span className="text-gray-400 italic">Not provided</span>
                    }
                  })()}
                </p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">CNIC</Label>
                <p className="font-medium text-gray-900">{applicationData.cnic || applicationData.applicant_cnic || applicationData.application_data?.cnic || <span className="text-gray-400 italic">Not provided</span>}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Application Type</Label>
                <p className="font-medium text-gray-900">{applicationData.product_type || applicationData.application_type || <span className="text-gray-400 italic">Unknown</span>}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Monthly Income</Label>
                <p className="font-medium text-gray-900">
                  {(() => {
                    const income = applicationData.gross_monthly_income || 
                                   applicationData.total_income || 
                                   applicationData.net_monthly_income || 
                                   applicationData.monthly_income ||
                                   applicationData.application_data?.total_income
                    return income ? `PKR ${parseFloat(income).toLocaleString()}` : <span className="text-gray-400 italic">Not provided</span>
                  })()}
                </p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Loan/Card Limit</Label>
                <p className="font-medium text-gray-900">
                  {(() => {
                    const amount = applicationData.requested_amount || 
                                   applicationData.proposed_loan_amount || 
                                   applicationData.amount_requested || 
                                   applicationData.loan_amount ||
                                   applicationData.application_data?.amount_requested
                    return amount ? `PKR ${parseFloat(amount).toLocaleString()}` : <span className="text-gray-400 italic">Not specified</span>
                  })()}
                </p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">City</Label>
                <p className="font-medium text-gray-900">{applicationData.curr_city || applicationData.permanent_city || applicationData.city || applicationData.application_data?.city || <span className="text-gray-400 italic">Not provided</span>}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Employment</Label>
                <p className="font-medium text-gray-900">{applicationData.employment_type || applicationData.employment_status || applicationData.occupation || applicationData.application_data?.employment_status || <span className="text-gray-400 italic">Not provided</span>}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">EAMVU Status</Label>
                {applicationData.eavmu_submitted || applicationData.ilos_flags?.eavmu_submitted ? (
                  <Badge className="bg-green-100 text-green-800 font-medium">Approved</Badge>
                ) : (
                  <Badge className="bg-amber-100 text-amber-800 font-medium">Pending</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ECIB Upload Card - Only show if not already uploaded */}
      {!ecibData ? (
        <Card className="border-teal-100">
          <CardHeader className="bg-teal-50/50">
            <CardTitle className="text-lg text-teal-800 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              ECIB Report Upload
            </CardTitle>
            <CardDescription>
              Upload ECIB PDF for enhanced credit analysis (Optional)
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="ecib-upload" className="cursor-pointer">
                  <div className="border-2 border-dashed border-teal-200 rounded-lg p-6 hover:border-teal-400 transition-colors">
                    <div className="flex flex-col items-center gap-2">
                      {uploadingEcib ? (
                        <>
                          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
                          <p className="text-sm text-teal-600 font-medium">Processing OCR...</p>
                          <p className="text-xs text-gray-500">This may take 5-10 seconds</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-teal-600" />
                          <p className="text-sm text-gray-600">
                            {ecibFileName || "Click to upload ECIB PDF"}
                          </p>
                          {ecibFileName && (
                            <p className="text-xs text-teal-600">✓ Ready for calculation</p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <Input
                    id="ecib-upload"
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={handleEcibUpload}
                    disabled={uploadingEcib}
                  />
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-green-100 bg-green-50/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">eCIB Already Uploaded</p>
                <p className="text-xs text-green-600">Loaded from PB documents - {ecibFileName || 'eCIB.pdf'}</p>
              </div>
              <Badge className="bg-green-100 text-green-800">
                ✓ Auto-Loaded
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calculate Button */}
      <div className="flex gap-4">
        <Button
          onClick={calculateDecision}
          disabled={!applicationData || calculating}
          className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white h-12 text-lg"
        >
          {calculating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Calculating Decision...
            </>
          ) : (
            <>
              <Calculator className="w-5 h-5 mr-2" />
              Calculate Decision
            </>
          )}
        </Button>
        
        {!applicationData && (
          <Button
            onClick={loadApplicationData}
            disabled={loading}
            variant="outline"
            className="border-teal-600 text-teal-600 hover:bg-teal-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Load Data"
            )}
          </Button>
        )}
      </div>

      {/* Decision Result */}
      {decisionResult && (
        <>
          {/* Final Score Card */}
          <Card className="border-teal-200 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white">
              <CardTitle className="text-2xl flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Award className="w-6 h-6" />
                  Final Decision
                </span>
                {getDecisionBadge(decisionResult.decision)}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Score Display */}
                <div className="text-center">
                  <div className={`text-6xl font-bold ${getScoreTextColor(decisionResult.final_score)}`}>
                    {decisionResult.final_score.toFixed(2)}
                  </div>
                  <p className="text-gray-500 mt-2">Final Score (out of 100)</p>
                  <Progress 
                    value={decisionResult.final_score} 
                    className="mt-4 h-3"
                  />
                </div>

                {/* Risk & Recommendation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <Label className="text-sm text-gray-500">Risk Level</Label>
                    <div className="mt-1">
                      {getRiskBadge(decisionResult.risk_level)}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Recommendation</Label>
                    <p className="text-sm mt-1">{decisionResult.recommendation}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Module Scores */}
          <Card className="border-teal-100">
            <CardHeader className="bg-teal-50/50">
              <CardTitle className="text-lg text-teal-800 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Module Scores Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* DBR Module */}
                <div className="space-y-2 p-4 rounded-lg bg-gray-50/50 border border-gray-100">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-semibold text-gray-900">Debt Burden Ratio (DBR)</Label>
                        <span className="text-xs text-gray-500 font-normal">• Weight: 55%</span>
                      </div>
                    </div>
                    <Badge className={`${getScoreColor(decisionResult.modules.dbr.score)} text-sm px-3 py-1`}>
                      {decisionResult.modules.dbr.score}/100
                    </Badge>
                  </div>
                  <Progress value={decisionResult.modules.dbr.score} className="h-2.5" />
                  <details className="text-xs text-gray-600 mt-2">
                    <summary className="cursor-pointer hover:text-gray-900 font-medium">View Details</summary>
                    <ul className="mt-2 space-y-1 pl-4 list-disc">
                      {decisionResult.modules.dbr.notes.map((note: string, idx: number) => (
                        <li key={idx}>{note}</li>
                      ))}
                    </ul>
                  </details>
                </div>

                {/* Age Module */}
                <div className="space-y-2 p-4 rounded-lg bg-gray-50/50 border border-gray-100">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-semibold text-gray-900">Age</Label>
                        <span className="text-xs text-gray-500 font-normal">• Weight: 5%</span>
                      </div>
                    </div>
                    <Badge className={`${getScoreColor(decisionResult.modules.age.score)} text-sm px-3 py-1`}>
                      {decisionResult.modules.age.score}/100
                    </Badge>
                  </div>
                  <Progress value={decisionResult.modules.age.score} className="h-2.5" />
                  {decisionResult.modules.age.notes && decisionResult.modules.age.notes.length > 0 && (
                    <p className="text-xs text-gray-600 mt-2">{decisionResult.modules.age.notes.join(', ')}</p>
                  )}
                </div>

                {/* City Module */}
                <div className="space-y-2 p-4 rounded-lg bg-gray-50/50 border border-gray-100">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-semibold text-gray-900">City</Label>
                        <span className="text-xs text-gray-500 font-normal">• Weight: 5%</span>
                      </div>
                    </div>
                    <Badge className={`${getScoreColor(decisionResult.modules.city.score)} text-sm px-3 py-1`}>
                      {decisionResult.modules.city.score}/100
                    </Badge>
                  </div>
                  <Progress value={decisionResult.modules.city.score} className="h-2.5" />
                  {decisionResult.modules.city.notes && decisionResult.modules.city.notes.length > 0 && (
                    <p className="text-xs text-gray-600 mt-2">{decisionResult.modules.city.notes.join(', ')}</p>
                  )}
                </div>

                {/* Income Module */}
                <div className="space-y-2 p-4 rounded-lg bg-gray-50/50 border border-gray-100">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-semibold text-gray-900">Income</Label>
                        <span className="text-xs text-gray-500 font-normal">• Weight: 10%</span>
                      </div>
                    </div>
                    <Badge className={`${getScoreColor(decisionResult.modules.income.score)} text-sm px-3 py-1`}>
                      {decisionResult.modules.income.score}/100
                    </Badge>
                  </div>
                  <Progress value={decisionResult.modules.income.score} className="h-2.5" />
                  {decisionResult.modules.income.notes && decisionResult.modules.income.notes.length > 0 && (
                    <p className="text-xs text-gray-600 mt-2">{decisionResult.modules.income.notes.join(', ')}</p>
                  )}
                </div>

                {/* SPU Module */}
                <div className="space-y-2 p-4 rounded-lg bg-gray-50/50 border border-gray-100">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-semibold text-gray-900">SPU Checks</Label>
                        <span className="text-xs text-gray-500 font-normal">• Weight: 5%</span>
                      </div>
                    </div>
                    <Badge className={`${getScoreColor(decisionResult.modules.spu.score)} text-sm px-3 py-1`}>
                      {decisionResult.modules.spu.score}/100
                    </Badge>
                  </div>
                  <Progress value={decisionResult.modules.spu.score} className="h-2.5" />
                  {decisionResult.modules.spu.flags && decisionResult.modules.spu.flags.length > 0 && (
                    <div className="flex gap-2 flex-wrap mt-2">
                      {decisionResult.modules.spu.flags.map((flag: string, idx: number) => (
                        <Badge key={idx} variant="destructive" className="text-xs">
                          {flag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* EAMVU Module */}
                <div className="space-y-2 p-4 rounded-lg bg-gray-50/50 border border-gray-100">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-semibold text-gray-900">EAMVU Verification</Label>
                        <span className="text-xs text-gray-500 font-normal">• Weight: 5%</span>
                      </div>
                    </div>
                    <Badge className={`${getScoreColor(decisionResult.modules.eamvu.score)} text-sm px-3 py-1`}>
                      {decisionResult.modules.eamvu.score}/100
                    </Badge>
                  </div>
                  <Progress value={decisionResult.modules.eamvu.score} className="h-2.5" />
                  {decisionResult.modules.eamvu.notes && decisionResult.modules.eamvu.notes.length > 0 && (
                    <p className="text-xs text-gray-600 mt-2">{decisionResult.modules.eamvu.notes.join(', ')}</p>
                  )}
                </div>

                {/* Application Score (if available) */}
                {decisionResult.modules.application_score && (
                  <div className="space-y-2 p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-100">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm font-semibold text-gray-900">Application Scorecard</Label>
                          <span className="text-xs text-blue-600 font-normal">• Weight: 15%</span>
                        </div>
                      </div>
                      <Badge className={`${getScoreColor(decisionResult.modules.application_score.score)} text-sm px-3 py-1`}>
                        {decisionResult.modules.application_score.score}/100
                      </Badge>
                    </div>
                    <Progress value={decisionResult.modules.application_score.score} className="h-2.5" />
                    {decisionResult.modules.application_score.notes && decisionResult.modules.application_score.notes.length > 0 && (
                      <details className="text-xs text-gray-600 mt-2">
                        <summary className="cursor-pointer hover:text-gray-900 font-medium">View Details</summary>
                        <ul className="mt-2 space-y-1 pl-4 list-disc">
                          {decisionResult.modules.application_score.notes.map((note: string, idx: number) => (
                            <li key={idx}>{note}</li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </div>
                )}

                {/* Behavioral Score (if available) */}
                {decisionResult.modules.behavioral_score && (
                  <div className="space-y-2 p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50/50 border border-purple-100">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm font-semibold text-gray-900">Behavioral Scorecard</Label>
                          <span className="text-xs text-purple-600 font-normal">• Weight: {decisionResult.modules.behavioral_score.score === 0 ? '0% (NTB)' : '5%'}</span>
                        </div>
                      </div>
                      <Badge className={`${getScoreColor(decisionResult.modules.behavioral_score.score)} text-sm px-3 py-1`}>
                        {decisionResult.modules.behavioral_score.score}/100
                      </Badge>
                    </div>
                    <Progress value={decisionResult.modules.behavioral_score.score} className="h-2.5" />
                    {decisionResult.modules.behavioral_score.notes && decisionResult.modules.behavioral_score.notes.length > 0 && (
                      <details className="text-xs text-gray-600 mt-2">
                        <summary className="cursor-pointer hover:text-gray-900 font-medium">View Details</summary>
                        <ul className="mt-2 space-y-1 pl-4 list-disc">
                          {decisionResult.modules.behavioral_score.notes.map((note: string, idx: number) => (
                            <li key={idx}>{note}</li>
                          ))}
                        </ul>
                        {decisionResult.modules.behavioral_score.score === 0 && (
                          <p className="mt-2 text-blue-600 font-medium">
                            ℹ️ Note: Behavioral scoring only applies to ETB (Existing To Bank) customers with existing banking history.
                          </p>
                        )}
                      </details>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes & Actions */}
          <Card className="border-teal-100">
            <CardHeader className="bg-teal-50/50">
              <CardTitle className="text-lg text-teal-800">Notes & Actions</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any additional comments or observations..."
                    className="mt-2"
                    rows={4}
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={saveDecision}
                    disabled={savingDecision || !!savedDecision}
                    className="flex-1 bg-teal-600 hover:bg-teal-700"
                  >
                    {savingDecision ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {savedDecision ? "Decision Saved" : "Save Decision"}
                  </Button>
                  
                  {savedDecision && (
                    <Button
                      variant="outline"
                      className="border-teal-600 text-teal-600 hover:bg-teal-50"
                      onClick={() => {
                        toast({
                          title: "Decision Details",
                          description: `Saved on ${new Date(savedDecision.calculated_at).toLocaleString()}`,
                        })
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Saved
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-teal-600" />
              <p className="text-gray-600">Loading application data...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Alert */}
      {!loading && !applicationData && (
        <Alert className="border-teal-200 bg-teal-50">
          <AlertTriangle className="h-4 w-4 text-teal-600" />
          <AlertDescription className="text-teal-800">
            Click "Load Data" to fetch application information and begin decision calculation.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

