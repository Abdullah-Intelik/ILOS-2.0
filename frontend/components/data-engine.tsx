"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Calculator, Search, TrendingUp, AlertCircle, CheckCircle, Clock, User } from "lucide-react"

interface LoanApplication {
  gross_monthly_income: number
  net_monthly_income: number
  taxes_and_deductions: number
  existing_emis: number
  credit_card_limit: number
  overdraft_interest_year: number
  proposed_loan_amount: number
  proposed_tenure_months: number
  annual_rate_percent: number
  age: number
}

interface DBRResult {
  status: string
  dbr: number
  net_income: number
  total_obligations: number
}

interface CalculationResponse {
  success: boolean
  loanType: string
  loanId: string
  result: DBRResult
  formData: LoanApplication
  error?: string
}

// Stats data to match CIU dashboard style
const statsData = [
  {
    title: "Applications Analyzed",
    value: "24",
    change: "+3 today",
    icon: Calculator,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    title: "DBR Pass Rate",
    value: "78%",
    change: "+5% this week",
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    title: "Failed Applications",
    value: "6",
    change: "Requires review",
    icon: AlertCircle,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  {
    title: "Pending Analysis",
    value: "12",
    change: "In queue",
    icon: Clock,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
]

export default function DataEngine() {
  const [loanType, setLoanType] = useState("")
  const [loanId, setLoanId] = useState("")
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<LoanApplication | null>(null)
  const [result, setResult] = useState<DBRResult | null>(null)
  const [manualInputs, setManualInputs] = useState({
    taxes_and_deductions: "",
    existing_emis: "",
    credit_card_limit: "",
    annual_rate_percent: "",
    age: ""
  })
  
  const { toast } = useToast()

  const API_BASE = process.env.NEXT_PUBLIC_DATA_ENGINE_URL || 'http://localhost:3002'

  const loanTypes = [
    { value: "cashplus", label: "Cash Plus" },
    { value: "commercialvehicle", label: "Commercial Vehicle" },
    { value: "platinum_creditcard", label: "Platinum Credit Card" },
    { value: "classic_creditcard", label: "Classic Credit Card" },
    { value: "smeasaan", label: "SME Asaan" },
    { value: "autoloan", label: "Auto Loan" },
    { value: "commercialvehicle_detailed", label: "Commercial Vehicle (Detailed)" }
  ]

  const fetchFormData = async () => {
    if (!loanType || !loanId) {
      toast({
        title: "Error",
        description: "Please select loan type and enter loan ID",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch(`${API_BASE}/ilos/calc-dbr/${loanType}/${loanId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taxes_and_deductions: 0,
          existing_emis: 0,
          credit_card_limit: 0,
          annual_rate_percent: 0,
          age: 0
        })
      })

      const data: CalculationResponse = await response.json()
      
      if (!data.success) {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch application data",
          variant: "destructive"
        })
        return
      }

      setFormData(data.formData)
      setManualInputs({
        taxes_and_deductions: "",
        existing_emis: "",
        credit_card_limit: "",
        annual_rate_percent: "",
        age: ""
      })

      toast({
        title: "Success",
        description: "Application data fetched successfully!",
      })
    } catch (error) {
      console.error('Error fetching form data:', error)
      toast({
        title: "Error",
        description: "Network or server error",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateDBR = async () => {
    if (!loanType || !loanId) {
      toast({
        title: "Error",
        description: "Please select loan type and enter loan ID first",
        variant: "destructive"
      })
      return
    }

    setLoading(true)

    try {
      const body = {
        taxes_and_deductions: parseFloat(manualInputs.taxes_and_deductions) || 0,
        existing_emis: parseFloat(manualInputs.existing_emis) || 0,
        credit_card_limit: parseFloat(manualInputs.credit_card_limit) || 0,
        annual_rate_percent: parseFloat(manualInputs.annual_rate_percent) || 0,
        age: parseInt(manualInputs.age) || 0,
      }

      const response = await fetch(`${API_BASE}/ilos/calc-dbr/${loanType}/${loanId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data: CalculationResponse = await response.json()
      
      if (!data.success) {
        toast({
          title: "Error",
          description: data.error || "Failed to calculate DBR",
          variant: "destructive"
        })
        return
      }

      setResult(data.result)
      toast({
        title: "Success",
        description: "DBR calculation completed successfully!",
      })
    } catch (error) {
      console.error('Error calculating DBR:', error)
      toast({
        title: "Error",
        description: "Network or server error",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    if (status.includes('pass')) {
      return <Badge className="bg-green-100 text-green-800"><CheckCircle className="mr-1 h-3 w-3" />{status}</Badge>
    } else if (status.includes('fail') && status.includes('conditionally')) {
      return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="mr-1 h-3 w-3" />{status}</Badge>
    } else if (status.includes('fail')) {
      return <Badge variant="destructive"><AlertCircle className="mr-1 h-3 w-3" />{status}</Badge>
    }
    return <Badge variant="secondary">{status}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calculator className="h-6 w-6 text-blue-600" />
            Data Engine - DBR Calculator
          </h1>
          <p className="text-muted-foreground">SBP Debt Burden Ratio Calculator for ILOS Applications</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <TrendingUp className="mr-2 h-4 w-4" />
          Analytics
        </Button>
      </div>

      {/* Stats Cards - Matching CIU Dashboard Style */}
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

      {/* Loan Application Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="h-5 w-5" />
            Loan Application Selection
          </CardTitle>
          <CardDescription>
            Select loan type and enter loan ID to fetch application data for DBR analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="loanType">Loan Type</Label>
              <Select value={loanType} onValueChange={setLoanType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Loan Type" />
                </SelectTrigger>
                <SelectContent>
                  {loanTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="loanId">Loan ID</Label>
              <Input
                id="loanId"
                placeholder="e.g., 101"
                value={loanId}
                onChange={(e) => setLoanId(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button 
              onClick={fetchFormData} 
              disabled={loading || !loanType || !loanId}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? <Clock className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              Fetch Application Data
            </Button>
            {formData && (
              <Button variant="outline" onClick={() => {
                setFormData(null)
                setResult(null)
                setManualInputs({
                  taxes_and_deductions: "",
                  existing_emis: "",
                  credit_card_limit: "",
                  annual_rate_percent: "",
                  age: ""
                })
              }}>
                Clear Data
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Auto-filled Data Display */}
      {formData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Auto-filled Application Data
            </CardTitle>
            <CardDescription>
              Data automatically retrieved from ILOS API and ECIB reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Gross Monthly Income</Label>
                <Input value={formData.gross_monthly_income.toFixed(2)} readOnly className="bg-gray-50" />
                <p className="text-xs text-gray-500">Auto-filled from API</p>
              </div>
              <div className="space-y-2">
                <Label>Net Monthly Income</Label>
                <Input value={formData.net_monthly_income.toFixed(2)} readOnly className="bg-gray-50" />
                <p className="text-xs text-gray-500">Auto-filled from API</p>
              </div>
              <div className="space-y-2">
                <Label>Proposed Loan Amount</Label>
                <Input value={formData.proposed_loan_amount.toFixed(2)} readOnly className="bg-gray-50" />
                <p className="text-xs text-gray-500">Auto-filled from API</p>
              </div>
              <div className="space-y-2">
                <Label>Proposed Tenure (Months)</Label>
                <Input value={formData.proposed_tenure_months.toString()} readOnly className="bg-gray-50" />
                <p className="text-xs text-gray-500">Auto-filled from API</p>
              </div>
              <div className="space-y-2">
                <Label>Overdraft Interest (Yearly)</Label>
                <Input value={formData.overdraft_interest_year.toFixed(2)} readOnly className="bg-gray-50" />
                <p className="text-xs text-gray-500">Auto-filled from ECIB</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manual Input Fields */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-purple-600" />
            Manual Input Fields
          </CardTitle>
          <CardDescription>
            Enter additional information required for accurate DBR calculation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="taxesAndDeductions">Taxes & Deductions</Label>
              <Input
                id="taxesAndDeductions"
                type="number"
                placeholder="Enter taxes and deductions"
                value={manualInputs.taxes_and_deductions}
                onChange={(e) => setManualInputs(prev => ({ ...prev, taxes_and_deductions: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="existingEmis">Existing EMIs</Label>
              <Input
                id="existingEmis"
                type="number"
                placeholder="Enter existing EMIs"
                value={manualInputs.existing_emis}
                onChange={(e) => setManualInputs(prev => ({ ...prev, existing_emis: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="creditCardLimit">Credit Card Limit</Label>
              <Input
                id="creditCardLimit"
                type="number"
                placeholder="Enter credit card limit"
                value={manualInputs.credit_card_limit}
                onChange={(e) => setManualInputs(prev => ({ ...prev, credit_card_limit: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="annualRatePercent">Annual Rate (%)</Label>
              <Input
                id="annualRatePercent"
                type="number"
                placeholder="Enter annual rate"
                value={manualInputs.annual_rate_percent}
                onChange={(e) => setManualInputs(prev => ({ ...prev, annual_rate_percent: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                placeholder="Enter age"
                value={manualInputs.age}
                onChange={(e) => setManualInputs(prev => ({ ...prev, age: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calculate DBR */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calculator className="h-5 w-5 text-orange-600" />
            DBR Calculation
          </CardTitle>
          <CardDescription>
            Calculate the debt burden ratio based on SBP guidelines and provided information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button 
              onClick={calculateDBR} 
              disabled={loading || !formData}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? <Clock className="mr-2 h-4 w-4 animate-spin" /> : <Calculator className="mr-2 h-4 w-4" />}
              Calculate DBR
            </Button>
            {result && (
              <Button variant="outline" onClick={() => setResult(null)}>
                Clear Results
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card className="border-2 border-green-200 bg-green-50/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              DBR Analysis Results
            </CardTitle>
            <CardDescription>
              Debt Burden Ratio calculation results based on State Bank of Pakistan guidelines
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Status Card */}
              <Card className="p-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Application Status</Label>
                  <div className="flex flex-col space-y-2">
                    {getStatusBadge(result.status)}
                    <p className="text-xs text-gray-500">
                      {result.status.includes('pass') 
                        ? 'Application meets DBR requirements' 
                        : result.status.includes('conditionally') 
                        ? 'Requires additional review' 
                        : 'Application does not meet DBR requirements'}
                    </p>
                  </div>
                </div>
              </Card>

              {/* DBR Percentage Card */}
              <Card className="p-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">DBR Percentage</Label>
                  <div className="text-3xl font-bold text-blue-600">{result.dbr}%</div>
                  <p className="text-xs text-gray-500">
                    Threshold: ≤35% (Pass), ≤40% (Conditional)
                  </p>
                </div>
              </Card>

              {/* Net Income Card */}
              <Card className="p-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Net Monthly Income</Label>
                  <div className="text-lg font-semibold text-green-600">
                    PKR {result.net_income.toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-500">Available for obligations</p>
                </div>
              </Card>

              {/* Total Obligations Card */}
              <Card className="p-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Total Monthly Obligations</Label>
                  <div className="text-lg font-semibold text-red-600">
                    PKR {result.total_obligations.toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-500">Including proposed loan EMI</p>
                </div>
              </Card>
            </div>

            {/* Additional Analysis */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2 text-gray-800">Analysis Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">DBR Ratio:</span> {result.dbr}% of net income
                </div>
                <div>
                  <span className="font-medium">Available Income:</span> PKR {(result.net_income - result.total_obligations).toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Risk Level:</span> 
                  <Badge className={`ml-2 ${
                    result.dbr <= 35 ? 'bg-green-100 text-green-800' :
                    result.dbr <= 40 ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {result.dbr <= 35 ? 'Low Risk' : result.dbr <= 40 ? 'Medium Risk' : 'High Risk'}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Recommendation:</span> 
                  {result.status.includes('pass') 
                    ? 'Approve for processing' 
                    : result.status.includes('conditionally') 
                    ? 'Forward to RRU for review' 
                    : 'Consider rejection or restructuring'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}