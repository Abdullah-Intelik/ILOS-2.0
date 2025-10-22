"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  Upload,
  FileText,
  CheckCircle,
  Eye,
  Download,
  RefreshCw,
  X,
  AlertCircle,
  SkipBackIcon as Skip,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { ApplicantData, DocumentData, ChecklistItem } from "@/app/dashboard/applicant/auto/personalautoloans/page"

interface DocumentUploadStepProps {
  applicantData: ApplicantData
  documentData: DocumentData
  onDocumentChange: (data: DocumentData) => void
  checklistItems: ChecklistItem[]
}

const mockParsedData = {
  "salary-slip": {
    employeeName: "Muhammad Ahmed Khan",
    employeeId: "EMP-12345",
    basicSalary: "85,000",
    allowances: "25,000",
    grossSalary: "110,000",
    deductions: "15,000",
    netSalary: "95,000",
    month: "November 2024",
    confidence: 94,
  },
  "bank-statement": {
    accountNumber: "****-****-1234",
    accountTitle: "Muhammad Ahmed Khan",
    averageBalance: "125,000",
    creditTurnover: "180,000",
    debitTurnover: "165,000",
    bounceCount: "0",
    period: "Sep 2024 - Nov 2024",
    confidence: 87,
  },
  cnic: {
    name: "Muhammad Ahmed Khan",
    fatherName: "Muhammad Hassan Khan",
    cnicNumber: "1234512345671",
    dateOfBirth: "15-03-1985",
    address: "House 123, Block A, Gulshan-e-Iqbal, Karachi",
    confidence: 98,
  },
}

export function DocumentUploadStep({
  applicantData,
  documentData,
  onDocumentChange,
  checklistItems,
}: DocumentUploadStepProps) {
  const [activeTab, setActiveTab] = useState("cnic")
  const [skipDialog, setSkipDialog] = useState<{ open: boolean; documentType: string }>({
    open: false,
    documentType: "",
  })
  const [skipReason, setSkipReason] = useState("")
  const { toast } = useToast()

  const handleFileUpload = (type: string, file: File) => {
    // Update document data with uploading status
    onDocumentChange({
      ...documentData,
      [type]: {
        ...documentData[type],
        file,
        status: "uploading",
      },
    })

    // Simulate upload progress
    setTimeout(() => {
      onDocumentChange({
        ...documentData,
        [type]: {
          ...documentData[type],
          file,
          status: "parsing",
        },
      })

      // Simulate parsing
      setTimeout(() => {
        onDocumentChange({
          ...documentData,
          [type]: {
            ...documentData[type],
            file,
            parsed: mockParsedData[type as keyof typeof mockParsedData],
            status: "completed",
            confidence: mockParsedData[type as keyof typeof mockParsedData]?.confidence || 90,
          },
        })

        toast({
          title: "Document Processed",
          description: `${type.replace("-", " ")} has been successfully parsed`,
        })
      }, 3000)
    }, 1000)
  }

  const handleSkipDocument = (documentType: string) => {
    setSkipDialog({ open: true, documentType })
  }

  const confirmSkip = () => {
    if (!skipReason.trim()) {
      toast({
        variant: "destructive",
        title: "Reason Required",
        description: "Please provide a reason for skipping this document",
      })
      return
    }

    onDocumentChange({
      ...documentData,
      [skipDialog.documentType]: {
        ...documentData[skipDialog.documentType],
        status: "skipped",
        skipReason,
      },
    })

    toast({
      title: "Document Skipped",
      description: `${skipDialog.documentType.replace("-", " ")} has been marked as skipped`,
    })

    setSkipDialog({ open: false, documentType: "" })
    setSkipReason("")
  }

  const getDocumentTabs = () => {
    return checklistItems
      .filter((item) => item.documentType)
      .map((item) => ({
        id: item.documentType!,
        title: item.title,
        required: item.required,
        status: documentData[item.documentType!]?.status || "pending",
      }))
  }

  const DocumentUploadCard = ({
    type,
    title,
    description,
    acceptedTypes,
    required = false,
  }: {
    type: string
    title: string
    description: string
    acceptedTypes: string
    required?: boolean
  }) => {
    const docData = documentData[type]
    const status = docData?.status || "pending"

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {title}
            {required && (
              <Badge variant="destructive" className="text-xs">
                Required
              </Badge>
            )}
            {status === "completed" && <CheckCircle className="h-4 w-4 text-green-500" />}
            {status === "skipped" && (
              <Badge variant="outline" className="text-xs">
                Skipped
              </Badge>
            )}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "pending" && (
            <>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  Drag and drop your {title.toLowerCase()} here, or click to browse
                </p>
                <p className="text-xs text-gray-500 mt-1">Accepted formats: {acceptedTypes}</p>
                <div className="flex gap-2 mt-4 justify-center">
                  <Button variant="outline" onClick={() => document.getElementById(`file-${type}`)?.click()}>
                    Choose File
                  </Button>
                  {!required && (
                    <Button
                      variant="ghost"
                      onClick={() => handleSkipDocument(type)}
                      className="text-orange-600 hover:text-orange-700"
                    >
                      <Skip className="mr-2 h-4 w-4" />
                      Skip
                    </Button>
                  )}
                </div>
                <Input
                  id={`file-${type}`}
                  type="file"
                  className="hidden"
                  accept={acceptedTypes}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(type, file)
                  }}
                />
              </div>
            </>
          )}

          {(status === "uploading" || status === "parsing") && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="font-medium">{docData?.file?.name}</p>
                    <p className="text-sm text-gray-500">
                      {docData?.file ? (docData.file.size / 1024 / 1024).toFixed(2) + " MB" : ""}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span className="text-sm">
                    {status === "uploading" ? "Uploading document..." : "Processing document..."}
                  </span>
                </div>
                <Progress value={status === "uploading" ? 30 : 75} className="w-full" />
              </div>
            </div>
          )}

          {status === "completed" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="font-medium">{docData?.file?.name}</p>
                    <p className="text-sm text-gray-500">
                      {docData?.file ? (docData.file.size / 1024 / 1024).toFixed(2) + " MB" : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>

              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Document Processed Successfully</AlertTitle>
                <AlertDescription>
                  <div className="mt-2 flex items-center justify-between">
                    <div>
                      <Badge variant="secondary" className="mb-2">
                        Confidence: {docData?.confidence}%
                      </Badge>
                      <p className="text-sm">Information extracted and verified</p>
                    </div>
                    <Button variant="link" className="p-0 h-auto">
                      View Extracted Data
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {status === "skipped" && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Document Skipped</AlertTitle>
              <AlertDescription>
                <p className="text-sm mt-1">Reason: {docData?.skipReason}</p>
                <Button
                  variant="link"
                  className="p-0 h-auto mt-2"
                  onClick={() => {
                    onDocumentChange({
                      ...documentData,
                      [type]: { ...docData, status: "pending" },
                    })
                  }}
                >
                  Upload Document Instead
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {status === "error" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Upload Failed</AlertTitle>
              <AlertDescription>
                <p className="text-sm mt-1">There was an error processing this document.</p>
                <Button
                  variant="link"
                  className="p-0 h-auto mt-2 text-red-600"
                  onClick={() => {
                    onDocumentChange({
                      ...documentData,
                      [type]: { status: "pending" },
                    })
                  }}
                >
                  Try Again
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    )
  }

  const documentTabs = getDocumentTabs()

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold">Document Upload & Processing</h3>
        <p className="text-muted-foreground">
          Upload required documents based on your application details. Documents will be automatically processed and
          verified.
        </p>
      </div>

      {/* Document Upload Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upload Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {documentTabs.map((tab) => {
              const status = tab.status
              return (
                <div key={tab.id} className="text-center">
                  <div
                    className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                      status === "completed"
                        ? "bg-green-100 text-green-600"
                        : status === "skipped"
                          ? "bg-orange-100 text-orange-600"
                          : status === "uploading" || status === "parsing"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {status === "completed" ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : status === "skipped" ? (
                      <X className="h-6 w-6" />
                    ) : status === "uploading" || status === "parsing" ? (
                      <RefreshCw className="h-6 w-6 animate-spin" />
                    ) : (
                      <FileText className="h-6 w-6" />
                    )}
                  </div>
                  <p className="text-sm font-medium">{tab.title}</p>
                  <p className="text-xs text-muted-foreground capitalize">{status}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Document Upload Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-4">
          {documentTabs.slice(0, 4).map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {tab.title}
              {tab.status === "completed" && <CheckCircle className="h-3 w-3 text-green-500" />}
              {tab.status === "skipped" && <X className="h-3 w-3 text-orange-500" />}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="cnic" className="space-y-4">
          <DocumentUploadCard
            type="cnic"
            title="CNIC Copy"
            description="Upload clear front and back copy of valid CNIC"
            acceptedTypes=".pdf,.jpg,.png"
            required={true}
          />
        </TabsContent>

        <TabsContent value="salary-slip" className="space-y-4">
          <DocumentUploadCard
            type="salary-slip"
            title="Salary Slip"
            description="Upload latest 3 months salary slips for income verification"
            acceptedTypes=".pdf,.jpg,.png"
            required={applicantData.employmentType === "salaried"}
          />
        </TabsContent>

        <TabsContent value="bank-statement" className="space-y-4">
          <DocumentUploadCard
            type="bank-statement"
            title="Bank Statement"
            description="Upload 3-month bank statement for financial analysis"
            acceptedTypes=".pdf"
            required={true}
          />
        </TabsContent>

        <TabsContent value="business-registration" className="space-y-4">
          <DocumentUploadCard
            type="business-registration"
            title="Business Registration"
            description="Upload business registration certificate and trade license"
            acceptedTypes=".pdf,.jpg,.png"
            required={["self-employed", "business"].includes(applicantData.employmentType)}
          />
        </TabsContent>
      </Tabs>

      {/* Skip Document Dialog */}
      <Dialog open={skipDialog.open} onOpenChange={(open) => setSkipDialog({ ...skipDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Skip Document Upload</DialogTitle>
            <DialogDescription>
              Please provide a reason for skipping this document. This will be recorded for audit purposes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="skip-reason">Reason for skipping *</Label>
              <Textarea
                id="skip-reason"
                placeholder="e.g., Document not available, Will provide later, Not applicable..."
                value={skipReason}
                onChange={(e) => setSkipReason(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSkipDialog({ open: false, documentType: "" })}>
              Cancel
            </Button>
            <Button onClick={confirmSkip} disabled={!skipReason.trim()}>
              Skip Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
