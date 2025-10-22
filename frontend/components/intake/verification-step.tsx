"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, AlertTriangle, RefreshCw, Shield, Database, FileCheck } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { ApplicantData } from "@/app/dashboard/applicant/auto/personalautoloans/page"

interface VerificationStepProps {
  applicantData: ApplicantData
}

interface VerificationCheck {
  id: string
  title: string
  description: string
  status: "pending" | "running" | "passed" | "failed" | "warning"
  details?: string
  score?: number
}

export function VerificationStep({ applicantData }: VerificationStepProps) {
  const [verificationChecks, setVerificationChecks] = useState<VerificationCheck[]>([
    {
      id: "cnic-validation",
      title: "CNIC Validation",
      description: "Verify CNIC number against NADRA database",
      status: "pending",
    },
    {
      id: "income-verification",
      title: "Income Verification",
      description: "Cross-check declared income with supporting documents",
      status: "pending",
    },
    {
      id: "employment-verification",
      title: "Employment Verification",
      description: "Verify employment details with company records",
      status: "pending",
    },
    {
      id: "address-verification",
      title: "Address Verification",
      description: "Validate current and permanent address details",
      status: "pending",
    },
    {
      id: "reference-verification",
      title: "Reference Verification",
      description: "Verify reference contact details and relationships",
      status: "pending",
    },
    {
      id: "credit-bureau-check",
      title: "Credit Bureau Check",
      description: "Check credit history and existing obligations",
      status: "pending",
    },
    {
      id: "blacklist-screening",
      title: "Blacklist Screening",
      description: "Screen against internal and external blacklists",
      status: "pending",
    },
    {
      id: "aml-screening",
      title: "AML/CFT Screening",
      description: "Anti-Money Laundering and Counter Financing of Terrorism checks",
      status: "pending",
    },
  ])

  const [isRunning, setIsRunning] = useState(false)
  const [currentCheck, setCurrentCheck] = useState(0)
  const { toast } = useToast()

  const runVerification = async () => {
    setIsRunning(true)
    setCurrentCheck(0)

    for (let i = 0; i < verificationChecks.length; i++) {
      setCurrentCheck(i)

      // Update status to running
      setVerificationChecks((prev) =>
        prev.map((check, index) => (index === i ? { ...check, status: "running" } : check)),
      )

      // Simulate verification delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulate verification results
      const results = [
        { status: "passed" as const, details: "CNIC verified successfully", score: 95 },
        { status: "passed" as const, details: "Income matches supporting documents", score: 88 },
        { status: "warning" as const, details: "Employment verification pending from HR", score: 75 },
        { status: "passed" as const, details: "Address verified through utility bills", score: 92 },
        { status: "passed" as const, details: "References contacted and verified", score: 85 },
        { status: "warning" as const, details: "Minor credit history found", score: 78 },
        { status: "passed" as const, details: "No blacklist matches found", score: 100 },
        { status: "passed" as const, details: "AML screening completed successfully", score: 96 },
      ]

      // Update with results
      setVerificationChecks((prev) => prev.map((check, index) => (index === i ? { ...check, ...results[i] } : check)))
    }

    setIsRunning(false)
    toast({
      title: "Verification Complete",
      description: "All verification checks have been completed successfully",
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
      case "passed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "failed":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-orange-500" />
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "running":
        return <Badge className="bg-blue-100 text-blue-800">Running</Badge>
      case "passed":
        return <Badge className="bg-green-100 text-green-800">Passed</Badge>
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      case "warning":
        return <Badge className="bg-orange-100 text-orange-800">Warning</Badge>
      default:
        return <Badge variant="outline">Pending</Badge>
    }
  }

  const completedChecks = verificationChecks.filter(
    (check) => check.status === "passed" || check.status === "failed" || check.status === "warning",
  ).length

  const passedChecks = verificationChecks.filter((check) => check.status === "passed").length
  const warningChecks = verificationChecks.filter((check) => check.status === "warning").length
  const failedChecks = verificationChecks.filter((check) => check.status === "failed").length

  const overallProgress = (completedChecks / verificationChecks.length) * 100
  const averageScore =
    verificationChecks.filter((check) => check.score).reduce((sum, check) => sum + (check.score || 0), 0) /
      verificationChecks.filter((check) => check.score).length || 0

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold">System Verification</h3>
        <p className="text-muted-foreground">Automated verification and validation of application data</p>
      </div>

      {/* Verification Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Checks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{verificationChecks.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Passed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{passedChecks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{warningChecks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(averageScore) || 0}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      {isRunning && (
        <Card>
          <CardHeader>
            <CardTitle>Verification in Progress</CardTitle>
            <CardDescription>
              Running check {currentCheck + 1} of {verificationChecks.length}: {verificationChecks[currentCheck]?.title}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={overallProgress} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2">{Math.round(overallProgress)}% complete</p>
          </CardContent>
        </Card>
      )}

      {/* Start Verification */}
      {!isRunning && completedChecks === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Ready for Verification
            </CardTitle>
            <CardDescription>Click the button below to start the automated verification process</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={runVerification} size="lg">
              <Database className="mr-2 h-4 w-4" />
              Start Verification
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Verification Results */}
      {(completedChecks > 0 || isRunning) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              Verification Results
            </CardTitle>
            <CardDescription>Detailed results of each verification check</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {verificationChecks.map((check, index) => (
                <div key={check.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(check.status)}
                    <div>
                      <div className="font-medium">{check.title}</div>
                      <div className="text-sm text-muted-foreground">{check.description}</div>
                      {check.details && <div className="text-sm text-gray-600 mt-1">{check.details}</div>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {check.score && (
                      <Badge variant="outline" className="font-mono">
                        {check.score}%
                      </Badge>
                    )}
                    {getStatusBadge(check.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Verification Summary */}
      {completedChecks === verificationChecks.length && !isRunning && (
        <Alert
          className={
            failedChecks > 0
              ? "border-red-200 bg-red-50"
              : warningChecks > 0
                ? "border-orange-200 bg-orange-50"
                : "border-green-200 bg-green-50"
          }
        >
          {failedChecks > 0 ? (
            <AlertTriangle className="h-4 w-4" />
          ) : warningChecks > 0 ? (
            <AlertTriangle className="h-4 w-4" />
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
          <AlertTitle>
            {failedChecks > 0
              ? "Verification Failed"
              : warningChecks > 0
                ? "Verification Completed with Warnings"
                : "Verification Completed Successfully"}
          </AlertTitle>
          <AlertDescription>
            <div className="mt-2">
              <p>
                {failedChecks > 0 && `${failedChecks} check(s) failed. `}
                {warningChecks > 0 && `${warningChecks} check(s) have warnings. `}
                {passedChecks} check(s) passed successfully.
              </p>
              <p className="mt-1">
                Overall verification score: <strong>{Math.round(averageScore)}%</strong>
              </p>
              {failedChecks === 0 && (
                <p className="mt-2 text-sm">The application is ready to proceed to final review and submission.</p>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
