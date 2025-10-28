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

  // Load application data
  const loadApplicationData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/decision/application-data/${losId}`)
      
      if (!response.ok) {
        throw new Error('Failed to load application data')
      }

      const data = await response.json()
      setApplicationData(data)
      
      // Log loaded data for debugging
      console.log('═'.repeat(80))
      console.log('📥 APPLICATION DATA LOADED:')
      console.log('═'.repeat(80))
      console.log('LOS ID:', data.los_id)
      console.log('Application Type:', data.application_type)
      console.log('Application Data:', data.application_data)
      console.log('ILOS Flags:', data.ilos_flags)
      console.log('═'.repeat(80))
      
      // Check if decision already exists
      if (data.has_existing_decision && data.existing_decision) {
        setSavedDecision(data.existing_decision)
        toast({
          title: "Existing Decision Found",
          description: `Previous decision: ${data.existing_decision.decision} (Score: ${data.existing_decision.final_score})`,
        })
      }

      toast({
        title: "Success",
        description: "Application data loaded successfully",
      })
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
        description: "OCR analysis in progress... This may take 30-60 seconds",
      })
      
      const formData = new FormData()
      formData.append('ecib_pdf', file)
      formData.append('losId', losId)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/decision/upload-ecib`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to upload ECIB')
      }

      const result = await response.json()
      setEcibData(result.ecib_data)
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
        applicationData: {
          ...applicationData.application_data,
          application_type: applicationData.application_type,
          ...applicationData.ilos_flags
        },
        ecibData,
        ecibFileName,
        calculatedBy: 'CIU_OFFICER',
        notes
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/decision/calculate`, {
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/decision/save`, {
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

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600"
    if (score >= 60) return "text-green-600"
    if (score >= 40) return "text-amber-600"
    if (score >= 20) return "text-orange-600"
    return "text-red-600"
  }

  // Load data on mount - ALWAYS load from API to get correct format
  useEffect(() => {
    if (!loading && !applicationData) {
      console.log('🔄 Auto-loading application data for LOS-' + losId)
      loadApplicationData()
    }
  }, [losId]) // eslint-disable-line react-hooks/exhaustive-deps

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
                <p className="font-medium">
                  {(() => {
                    const fullName = applicationData.application_data?.full_name || applicationData.application_data?.applicant_name
                    const firstName = applicationData.application_data?.first_name || applicationData.application_data?.applicant_first_name
                    const lastName = applicationData.application_data?.last_name || applicationData.application_data?.applicant_last_name
                    
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
                <p className="font-medium">{applicationData.application_data?.nic_or_passport || applicationData.application_data?.cnic || applicationData.application_data?.nic || applicationData.application_data?.applicant_cnic || <span className="text-gray-400 italic">Not provided</span>}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Application Type</Label>
                <p className="font-medium">{applicationData.application_type || <span className="text-gray-400 italic">Unknown</span>}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Monthly Income</Label>
                <p className="font-medium">
                  {(() => {
                    const income = applicationData.application_data?.total_income || 
                                   applicationData.application_data?.gross_monthly_income || 
                                   applicationData.application_data?.net_monthly_income || 
                                   applicationData.application_data?.monthly_income
                    return income ? `PKR ${parseFloat(income).toLocaleString()}` : <span className="text-gray-400 italic">Not provided</span>
                  })()}
                </p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Loan/Card Limit</Label>
                <p className="font-medium">
                  {(() => {
                    const amount = applicationData.application_data?.amount_requested || 
                                   applicationData.application_data?.loan_amount || 
                                   applicationData.application_data?.proposed_loan_amount ||
                                   applicationData.application_data?.desired_limit
                    return amount ? `PKR ${parseFloat(amount).toLocaleString()}` : <span className="text-gray-400 italic">Not specified</span>
                  })()}
                </p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">City</Label>
                <p className="font-medium">{applicationData.application_data?.curr_city || applicationData.application_data?.city || applicationData.application_data?.permanent_city || applicationData.application_data?.perm_city || <span className="text-gray-400 italic">Not provided</span>}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Employment</Label>
                <p className="font-medium">{applicationData.application_data?.employment_status || applicationData.application_data?.occupation || applicationData.application_data?.employment_type || <span className="text-gray-400 italic">Not provided</span>}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">EAMVU Status</Label>
                {applicationData.ilos_flags?.eavmu_submitted ? (
                  <Badge className="bg-green-100 text-green-800">Approved</Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-800">Pending</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ECIB Upload Card */}
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
                        <p className="text-xs text-gray-500">This may take 30-60 seconds</p>
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
            {ecibData && (
              <div className="flex-shrink-0">
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  ECIB Uploaded
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
                  <div className={`text-6xl font-bold ${getScoreColor(decisionResult.final_score)}`}>
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
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <Label className="text-sm font-medium">Debt Burden Ratio (DBR)</Label>
                      <p className="text-xs text-gray-500">Weight: 55%</p>
                    </div>
                    <Badge className={getScoreColor(decisionResult.modules.dbr.score)}>
                      {decisionResult.modules.dbr.score}/100
                    </Badge>
                  </div>
                  <Progress value={decisionResult.modules.dbr.score} className="h-2" />
                  <p className="text-xs text-gray-600">{decisionResult.modules.dbr.notes.join(', ')}</p>
                </div>

                {/* Age Module */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <Label className="text-sm font-medium">Age</Label>
                      <p className="text-xs text-gray-500">Weight: 5%</p>
                    </div>
                    <Badge className={getScoreColor(decisionResult.modules.age.score)}>
                      {decisionResult.modules.age.score}/100
                    </Badge>
                  </div>
                  <Progress value={decisionResult.modules.age.score} className="h-2" />
                  {decisionResult.modules.age.notes && decisionResult.modules.age.notes.length > 0 && (
                    <p className="text-xs text-gray-600">{decisionResult.modules.age.notes.join(', ')}</p>
                  )}
                </div>

                {/* City Module */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <Label className="text-sm font-medium">City</Label>
                      <p className="text-xs text-gray-500">Weight: 5%</p>
                    </div>
                    <Badge className={getScoreColor(decisionResult.modules.city.score)}>
                      {decisionResult.modules.city.score}/100
                    </Badge>
                  </div>
                  <Progress value={decisionResult.modules.city.score} className="h-2" />
                  {decisionResult.modules.city.notes && decisionResult.modules.city.notes.length > 0 && (
                    <p className="text-xs text-gray-600">{decisionResult.modules.city.notes.join(', ')}</p>
                  )}
                </div>

                {/* Income Module */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <Label className="text-sm font-medium">Income</Label>
                      <p className="text-xs text-gray-500">Weight: 10%</p>
                    </div>
                    <Badge className={getScoreColor(decisionResult.modules.income.score)}>
                      {decisionResult.modules.income.score}/100
                    </Badge>
                  </div>
                  <Progress value={decisionResult.modules.income.score} className="h-2" />
                  {decisionResult.modules.income.notes && decisionResult.modules.income.notes.length > 0 && (
                    <p className="text-xs text-gray-600">{decisionResult.modules.income.notes.join(', ')}</p>
                  )}
                </div>

                {/* SPU Module */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <Label className="text-sm font-medium">SPU Checks</Label>
                      <p className="text-xs text-gray-500">Weight: 5%</p>
                    </div>
                    <Badge className={getScoreColor(decisionResult.modules.spu.score)}>
                      {decisionResult.modules.spu.score}/100
                    </Badge>
                  </div>
                  <Progress value={decisionResult.modules.spu.score} className="h-2" />
                  {decisionResult.modules.spu.flags && decisionResult.modules.spu.flags.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {decisionResult.modules.spu.flags.map((flag: string, idx: number) => (
                        <Badge key={idx} variant="destructive" className="text-xs">
                          {flag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* EAMVU Module */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <Label className="text-sm font-medium">EAMVU Verification</Label>
                      <p className="text-xs text-gray-500">Weight: 5%</p>
                    </div>
                    <Badge className={getScoreColor(decisionResult.modules.eamvu.score)}>
                      {decisionResult.modules.eamvu.score}/100
                    </Badge>
                  </div>
                  <Progress value={decisionResult.modules.eamvu.score} className="h-2" />
                  {decisionResult.modules.eamvu.notes && decisionResult.modules.eamvu.notes.length > 0 && (
                    <p className="text-xs text-gray-600">{decisionResult.modules.eamvu.notes.join(', ')}</p>
                  )}
                </div>

                {/* Application Score (if available) */}
                {decisionResult.modules.application_score && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <Label className="text-sm font-medium">Application Scorecard</Label>
                        <p className="text-xs text-gray-500">Weight: 15%</p>
                      </div>
                      <Badge className={getScoreColor(decisionResult.modules.application_score.score)}>
                        {decisionResult.modules.application_score.score}/100
                      </Badge>
                    </div>
                    <Progress value={decisionResult.modules.application_score.score} className="h-2" />
                    {decisionResult.modules.application_score.notes && decisionResult.modules.application_score.notes.length > 0 && (
                      <p className="text-xs text-gray-600">{decisionResult.modules.application_score.notes.join(', ')}</p>
                    )}
                  </div>
                )}

                {/* Behavioral Score (if available) */}
                {decisionResult.modules.behavioral_score && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <Label className="text-sm font-medium">Behavioral Scorecard</Label>
                        <p className="text-xs text-gray-500">Weight: {decisionResult.modules.behavioral_score.score === 0 ? '0% (NTB)' : '5%'}</p>
                      </div>
                      <Badge className={getScoreColor(decisionResult.modules.behavioral_score.score)}>
                        {decisionResult.modules.behavioral_score.score}/100
                      </Badge>
                    </div>
                    <Progress value={decisionResult.modules.behavioral_score.score} className="h-2" />
                    {decisionResult.modules.behavioral_score.notes && decisionResult.modules.behavioral_score.notes.length > 0 && (
                      <div className="bg-gray-50 border border-gray-200 rounded-md p-2 mt-2">
                        <p className="text-xs text-gray-600">
                          {decisionResult.modules.behavioral_score.notes.join(', ')}
                          {decisionResult.modules.behavioral_score.score === 0 && (
                            <span className="block mt-1 text-blue-600 font-medium">
                              ℹ️ Note: Behavioral scoring only applies to ETB (Existing To Bank) customers with existing banking history.
                            </span>
                          )}
                        </p>
                      </div>
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

