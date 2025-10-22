"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Calculator, AlertCircle, CheckCircle, Clock, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react"

interface DBRDetails {
  netIncome: number
  totalObligations: number
  dbrPercentage: number
}

interface ModuleScore {
  score: number
  weight: number
  weightedScore: number
  dbrPercentage?: number
  threshold?: number
  status?: string
  notes?: string[]
}

interface ComprehensiveResult {
  success: boolean
  message?: string
  error?: string
  losId: string
  loanType: string
  dbr: number
  status: string
  threshold: number
  dbrDetails: DBRDetails
  decisionBand: string
  riskCategory: string
  score: number
  notes: string[]
  flags: string[]
  details: {
    calculationMethod: string
    incomeSource: string
    obligationsSource: string
    thresholdType: string
    riskCategory: string
    statusReason: string
    decisionBand: string
  }
  moduleScores?: {
    dbr?: ModuleScore
  }
}

interface ComprehensiveDecisionCalculatorProps {
  losId: string
  loanType: string
  applicationData?: any  // Optional: Pass application data directly
}

export default function ComprehensiveDecisionCalculator({ losId, loanType, applicationData }: ComprehensiveDecisionCalculatorProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ComprehensiveResult | null>(null)
  
  const { toast } = useToast()

  // Use environment variable or fallback to localhost
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

  const calculateDecision = async () => {
    if (!losId || !loanType) {
      toast({
        title: "Error",
        description: "LOS ID and loan type are required",
        variant: "destructive"
      })
      return
    }

    setLoading(true)

    try {
      console.log(`🔵 Calling Decision Engine API: ${API_BASE}/api/decision-engine/dbr`)
      console.log(`Request: losId=${losId}, loanType=${loanType}`)

      const response = await fetch(`${API_BASE}/api/decision-engine/dbr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          losId: losId,
          loanType: loanType
        })
      })

      console.log(`Response Status: ${response.status} ${response.statusText}`)

      const data: ComprehensiveResult = await response.json()
      
      console.log('Response Data:', data)

      if (!data.success) {
        toast({
          title: "Error",
          description: data.error || data.message || "Failed to calculate decision",
          variant: "destructive"
        })
        return
      }

      setResult(data)
      toast({
        title: "Success",
        description: "Comprehensive decision calculation completed successfully!",
      })
    } catch (error) {
      console.error('Error calculating decision:', error)
      toast({
        title: "Error",
        description: "Network or server error. Please check if the backend is running.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getDecisionBadge = (decisionBand: string) => {
    if (decisionBand === 'PASS') {
      return <Badge className="bg-green-100 text-green-800 text-lg px-4 py-2"><CheckCircle className="mr-2 h-5 w-5" />{decisionBand}</Badge>
    } else if (decisionBand === 'CONDITIONAL') {
      return <Badge className="bg-yellow-100 text-yellow-800 text-lg px-4 py-2"><AlertCircle className="mr-2 h-5 w-5" />{decisionBand}</Badge>
    } else if (decisionBand === 'FAIL') {
      return <Badge variant="destructive" className="text-lg px-4 py-2"><AlertTriangle className="mr-2 h-5 w-5" />{decisionBand}</Badge>
    }
    return <Badge variant="secondary" className="text-lg px-4 py-2">{decisionBand}</Badge>
  }

  const getRiskBadge = (riskCategory: string) => {
    if (riskCategory === 'LOW') {
      return <Badge className="bg-green-100 text-green-800">Low Risk</Badge>
    } else if (riskCategory === 'MEDIUM') {
      return <Badge className="bg-yellow-100 text-yellow-800">Medium Risk</Badge>
    } else if (riskCategory === 'HIGH') {
      return <Badge className="bg-orange-100 text-orange-800">High Risk</Badge>
    } else if (riskCategory === 'CRITICAL') {
      return <Badge variant="destructive">Critical Risk</Badge>
    }
    return <Badge variant="secondary">{riskCategory}</Badge>
  }

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-600'
    if (score >= 50) return 'text-yellow-600'
    if (score >= 25) return 'text-orange-600'
    return 'text-red-600'
  }

  const getDBRColor = (dbr: number) => {
    if (dbr <= 35) return 'text-green-600'
    if (dbr <= 40) return 'text-yellow-600'
    if (dbr <= 50) return 'text-orange-600'
    return 'text-red-600'
  }

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Calculator className="h-6 w-6 text-blue-600" />
          Comprehensive Credit Decision Analysis
        </CardTitle>
        <CardDescription className="text-base">
          Advanced DBR calculation with risk assessment for {loanType} application {losId}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Calculate Button */}
        <div className="flex gap-2">
          <Button 
            onClick={calculateDecision} 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 text-base"
            size="lg"
          >
            {loading ? (
              <>
                <Clock className="mr-2 h-5 w-5 animate-spin" />
                Calculating...
              </>
            ) : (
              <>
                <Calculator className="mr-2 h-5 w-5" />
                Calculate Comprehensive Decision
              </>
            )}
          </Button>
          {result && (
            <Button variant="outline" onClick={() => setResult(null)} size="lg">
              Clear Results
            </Button>
          )}
        </div>

        {/* Results Display */}
        {result && (
          <div className="space-y-6">
            {/* Overall Decision Card */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Decision Status */}
                  <div className="text-center space-y-2">
                    <Label className="text-sm font-medium text-gray-600">Final Decision</Label>
                    <div className="flex justify-center">
                      {getDecisionBadge(result.decisionBand)}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {result.details.statusReason.replace(/_/g, ' ')}
                    </p>
                  </div>

                  {/* DBR Score */}
                  <div className="text-center space-y-2">
                    <Label className="text-sm font-medium text-gray-600">DBR Score</Label>
                    <div className={`text-4xl font-bold ${getScoreColor(result.score)}`}>
                      {result.score}/100
                    </div>
                    <Progress value={result.score} className="h-3 w-full" />
                  </div>

                  {/* Risk Level */}
                  <div className="text-center space-y-2">
                    <Label className="text-sm font-medium text-gray-600">Risk Category</Label>
                    <div className="flex justify-center mt-2">
                      {getRiskBadge(result.riskCategory)}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Based on {result.details.calculationMethod.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* DBR Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">DBR (Debt-to-Income Ratio) Analysis</CardTitle>
                <CardDescription>Detailed breakdown of debt burden calculation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  {/* DBR Percentage */}
                  <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                    <Label className="text-sm font-medium text-gray-600">DBR Percentage</Label>
                    <div className={`text-3xl font-bold ${getDBRColor(result.dbr)}`}>
                      {result.dbr.toFixed(2)}%
                    </div>
                    <div className="text-xs text-gray-500">
                      Threshold: {result.threshold}%
                    </div>
                  </div>

                  {/* Net Income */}
                  <div className="space-y-2 p-4 bg-green-50 rounded-lg border border-green-200">
                    <Label className="text-sm font-medium text-green-700">Net Income</Label>
                    <div className="text-2xl font-bold text-green-600">
                      PKR {result.dbrDetails.netIncome.toLocaleString()}
                    </div>
                    <div className="text-xs text-green-600">
                      <TrendingUp className="inline h-3 w-3 mr-1" />
                      Monthly
                    </div>
                  </div>

                  {/* Total Obligations */}
                  <div className="space-y-2 p-4 bg-red-50 rounded-lg border border-red-200">
                    <Label className="text-sm font-medium text-red-700">Total Obligations</Label>
                    <div className="text-2xl font-bold text-red-600">
                      PKR {result.dbrDetails.totalObligations.toLocaleString()}
                    </div>
                    <div className="text-xs text-red-600">
                      <TrendingDown className="inline h-3 w-3 mr-1" />
                      Monthly
                    </div>
                  </div>

                  {/* Available Income */}
                  <div className="space-y-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <Label className="text-sm font-medium text-blue-700">Available Income</Label>
                    <div className="text-2xl font-bold text-blue-600">
                      PKR {(result.dbrDetails.netIncome - result.dbrDetails.totalObligations).toLocaleString()}
                    </div>
                    <div className="text-xs text-blue-600">
                      After obligations
                    </div>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className={`p-4 rounded-lg border-2 ${
                  result.decisionBand === 'PASS' ? 'bg-green-50 border-green-300' :
                  result.decisionBand === 'CONDITIONAL' ? 'bg-yellow-50 border-yellow-300' :
                  'bg-red-50 border-red-300'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-lg mb-1">
                        {result.decisionBand === 'PASS' ? '✅ DBR Within Acceptable Limits' :
                         result.decisionBand === 'CONDITIONAL' ? '⚠️ DBR Requires Review' :
                         '❌ DBR Exceeds Acceptable Limits'}
                      </h4>
                      <p className="text-sm text-gray-700">
                        {result.dbr.toFixed(2)}% debt burden is{' '}
                        {result.decisionBand === 'PASS' ? 'below' :
                         result.decisionBand === 'CONDITIONAL' ? 'within conditional range of' :
                         'above'}{' '}
                        the {result.threshold}% threshold
                      </p>
                    </div>
                    <Badge 
                      variant={result.decisionBand === 'PASS' ? 'default' : 'destructive'}
                      className="text-lg px-4 py-2"
                    >
                      {result.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                {/* Calculation Notes */}
                {result.notes && result.notes.length > 0 && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-3 text-gray-800">Calculation Details</h4>
                    <ul className="space-y-2">
                      {result.notes.map((note, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start">
                          <span className="mr-2">•</span>
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Flags (if any) */}
                {result.flags && result.flags.length > 0 && (
                  <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <h4 className="font-semibold mb-3 text-orange-800 flex items-center">
                      <AlertTriangle className="mr-2 h-5 w-5" />
                      Attention Required
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {result.flags.map((flag, index) => (
                        <Badge key={index} variant="destructive">
                          {flag.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendation */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-300">
                  <h4 className="font-semibold mb-2 text-blue-800">Recommendation</h4>
                  <p className="text-sm text-blue-700">
                    {result.decisionBand === 'PASS' 
                      ? '✓ Application is approved for processing with standard conditions.' 
                      : result.decisionBand === 'CONDITIONAL' 
                      ? '⚠️ Application requires additional review. Forward to RRU for further assessment.' 
                      : '✗ Application should be declined or restructured due to excessive debt burden.'}
                  </p>
                </div>

                {/* Technical Details (Collapsible) */}
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800 p-2 bg-gray-100 rounded">
                    View Technical Details
                  </summary>
                  <div className="mt-2 p-4 bg-gray-50 rounded text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div><strong>Calculation Method:</strong> {result.details.calculationMethod}</div>
                      <div><strong>Income Source:</strong> {result.details.incomeSource}</div>
                      <div><strong>Obligations Source:</strong> {result.details.obligationsSource}</div>
                      <div><strong>Threshold Type:</strong> {result.details.thresholdType}</div>
                    </div>
                  </div>
                </details>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

