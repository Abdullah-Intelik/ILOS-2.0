"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Calculator, AlertCircle, CheckCircle, Clock } from "lucide-react"

interface DBRResult {
  success: boolean
  message: string
  losId: string
  loan_type: string
  dbr: number
  status: string
  dbr_details: {
    net_income: number
    total_obligations: number
    dbr_percentage: number
  }
}

interface DBRCalculatorProps {
  losId: string
  loanType: string
}

export default function DBRCalculator({ losId, loanType }: DBRCalculatorProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<DBRResult | null>(null)
  
  const { toast } = useToast()

  const API_BASE = 'http://localhost:3002'

  const calculateDBR = async () => {
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
      const response = await fetch(`${API_BASE}/dbr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          losId: losId,
          loan_type: loanType
        })
      })

      const data: DBRResult = await response.json()
      
      if (!data.success) {
        toast({
          title: "Error",
          description: data.message || "Failed to calculate DBR",
          variant: "destructive"
        })
        return
      }

      setResult(data)
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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calculator className="h-5 w-5 text-blue-600" />
          DBR Calculator
        </CardTitle>
        <CardDescription>
          Calculate Debt Burden Ratio for {loanType} application {losId}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Calculate Button */}
        <div className="flex gap-2">
          <Button 
            onClick={calculateDBR} 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
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

        {/* Results Display */}
        {result && (
          <div className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">Status</Label>
                <div>{getStatusBadge(result.status)}</div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">DBR Percentage</Label>
                <div className="text-2xl font-bold text-blue-600">{result.dbr}%</div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">Net Income</Label>
                <div className="text-lg font-semibold text-green-600">
                  PKR {result.dbr_details.net_income.toLocaleString()}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">Total Obligations</Label>
                <div className="text-lg font-semibold text-red-600">
                  PKR {result.dbr_details.total_obligations.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Analysis Summary */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2 text-gray-800">Analysis Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-medium">DBR Ratio:</span> {result.dbr}% of net income
                </div>
                <div>
                  <span className="font-medium">Available Income:</span> PKR {(result.dbr_details.net_income - result.dbr_details.total_obligations).toLocaleString()}
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
          </div>
        )}
      </CardContent>
    </Card>
  )
}