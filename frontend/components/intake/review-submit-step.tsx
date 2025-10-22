"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, AlertTriangle, FileText, User, CreditCard, Send, Eye } from "lucide-react"
import type { ApplicantData, DocumentData, ChecklistItem } from "@/app/dashboard/applicant/auto/personalautoloans/page"

interface ReviewSubmitStepProps {
  applicantData: ApplicantData
  documentData: DocumentData
  checklistItems: ChecklistItem[]
  onSubmit: () => void
  isLoading: boolean
}

export function ReviewSubmitStep({
  applicantData,
  documentData,
  checklistItems,
  onSubmit,
  isLoading,
}: ReviewSubmitStepProps) {
  const completedItems = checklistItems.filter((item) => item.status === "completed").length
  const skippedItems = checklistItems.filter((item) => item.status === "skipped").length
  const totalItems = checklistItems.length

  const uploadedDocuments = Object.entries(documentData).filter(([_, doc]) => doc.status === "completed").length

  const skippedDocuments = Object.entries(documentData).filter(([_, doc]) => doc.status === "skipped").length

  const hasWarnings = skippedItems > 0 || skippedDocuments > 0

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold">Review & Submit Application</h3>
        <p className="text-muted-foreground">Please review all information before submitting the loan application</p>
      </div>

      {/* Application Summary */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Applicant Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Full Name</p>
                <p className="text-muted-foreground">{applicantData.name}</p>
              </div>
              <div>
                <p className="font-medium">CNIC</p>
                <p className="text-muted-foreground">{applicantData.cnic}</p>
              </div>
              <div>
                <p className="font-medium">Segment</p>
                <Badge variant="outline">{applicantData.segment}</Badge>
              </div>
              <div>
                <p className="font-medium">Employment Type</p>
                <p className="text-muted-foreground">{applicantData.employmentType}</p>
              </div>
              <div>
                <p className="font-medium">Monthly Income</p>
                <p className="text-muted-foreground">PKR {applicantData.monthlyIncome}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Loan Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Loan Type</p>
                <p className="text-muted-foreground">{applicantData.loanType}</p>
              </div>
              <div>
                <p className="font-medium">Amount</p>
                <p className="text-muted-foreground">PKR {applicantData.loanAmount}</p>
              </div>
              <div>
                <p className="font-medium">Tenure</p>
                <p className="text-muted-foreground">{applicantData.tenure} months</p>
              </div>
              <div>
                <p className="font-medium">Channel</p>
                <p className="text-muted-foreground">{applicantData.channel}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Document Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{uploadedDocuments}</div>
              <p className="text-sm text-muted-foreground">Documents Uploaded</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{skippedDocuments}</div>
              <p className="text-sm text-muted-foreground">Documents Skipped</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{Object.keys(documentData).length}</div>
              <p className="text-sm text-muted-foreground">Total Required</p>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-2">
            {Object.entries(documentData).map(([type, doc]) => (
              <div key={type} className="flex items-center justify-between p-2 rounded border">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="capitalize">{type.replace("-", " ")}</span>
                </div>
                <div className="flex items-center gap-2">
                  {doc.status === "completed" && (
                    <>
                      <Badge className="bg-green-100 text-green-800">Uploaded</Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  {doc.status === "skipped" && (
                    <Badge variant="outline" className="text-orange-600">
                      Skipped
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Checklist Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Checklist Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{completedItems}</div>
              <p className="text-sm text-muted-foreground">Items Completed</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{skippedItems}</div>
              <p className="text-sm text-muted-foreground">Items Skipped</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{totalItems}</div>
              <p className="text-sm text-muted-foreground">Total Items</p>
            </div>
          </div>

          <div className="space-y-2">
            {checklistItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-2 rounded border">
                <div className="flex items-center gap-2">
                  {item.status === "completed" ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : item.status === "skipped" ? (
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                  )}
                  <span>{item.title}</span>
                  {item.required && (
                    <Badge variant="destructive" className="text-xs">
                      Required
                    </Badge>
                  )}
                </div>
                <Badge
                  variant={item.status === "completed" ? "default" : "outline"}
                  className={
                    item.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : item.status === "skipped"
                        ? "text-orange-600"
                        : ""
                  }
                >
                  {item.status === "completed" ? "Complete" : item.status === "skipped" ? "Skipped" : "Pending"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Warnings and Alerts */}
      {hasWarnings && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Review Required</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-1">
              {skippedDocuments > 0 && <p>• {skippedDocuments} document(s) have been skipped</p>}
              {skippedItems > 0 && <p>• {skippedItems} checklist item(s) have been skipped</p>}
              <p className="mt-2 text-sm">
                Please ensure all skipped items have valid business justifications before submitting.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Additional Notes */}
      {applicantData.additionalNotes && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{applicantData.additionalNotes}</p>
          </CardContent>
        </Card>
      )}

      {/* Submit Section */}
      <Card>
        <CardHeader>
          <CardTitle>Final Submission</CardTitle>
          <CardDescription>
            By submitting this application, you confirm that all information is accurate and complete
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Ready for Submission</AlertTitle>
              <AlertDescription>
                This application will be assigned a LOS ID and submitted to the processing queue. You will be able to
                track its progress in the Case Tracker.
              </AlertDescription>
            </Alert>

            <div className="flex justify-center">
              <Button onClick={onSubmit} disabled={isLoading} size="lg" className="min-w-[200px]">
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Application
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
