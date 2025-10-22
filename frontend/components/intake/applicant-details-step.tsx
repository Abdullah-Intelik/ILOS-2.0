"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Loader2, CheckCircle, User, Building, CreditCard, HelpCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { ApplicantData } from "@/app/dashboard/applicant/auto/personalautoloans/page"

interface ApplicantDetailsStepProps {
  data: ApplicantData
  onChange: (data: ApplicantData) => void
}

export function ApplicantDetailsStep({ data, onChange }: ApplicantDetailsStepProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [cnicFetched, setCnicFetched] = useState(false)
  const { toast } = useToast()

  const handleCNICFetch = async () => {
    if (!data.cnic || data.cnic.length < 13) {
      toast({
        variant: "destructive",
        title: "Invalid CNIC",
        description: "Please enter a valid 13-digit CNIC number",
      })
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      const fetchedData = {
        name: "Muhammad Ahmed Khan",
        fatherName: "Muhammad Hassan Khan",
        dob: "1985-03-15",
        cbsId: "CBS-789456123",
        segment: "Preferred",
        address: "House 123, Block A, Gulshan-e-Iqbal, Karachi",
        phone: "+92-300-1234567",
      }

      onChange({
        ...data,
        ...fetchedData,
      })

      setCnicFetched(true)
      setIsLoading(false)

      toast({
        title: "CNIC Data Retrieved",
        description: "Applicant information has been successfully fetched",
      })
    }, 2000)
  }

  const formatCNIC = (value: string) => {
    const cleaned = value.replace(/\D/g, "")
    const match = cleaned.match(/^(\d{0,5})(\d{0,7})(\d{0,1})$/)
    if (match) {
      return [match[1], match[2], match[3]].filter(Boolean).join("-")
    }
    return cleaned
  }

  const handleInputChange = (field: keyof ApplicantData, value: string) => {
    onChange({ ...data, [field]: value })
  }

  return (
    <div className="space-y-6">
      {/* CNIC Lookup Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Applicant Identification
          </CardTitle>
          <CardDescription>Enter the applicant's CNIC number to fetch their details from the database</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="cnic">CNIC Number *</Label>
              <Input
                id="cnic"
                placeholder="1234512345671"
                value={data.cnic || ""}
                onChange={(e) => handleInputChange("cnic", formatCNIC(e.target.value))}
                maxLength={15}
                className="font-mono"
                required
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleCNICFetch}
                disabled={isLoading || !data.cnic || cnicFetched}
                className="min-w-[120px]"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {cnicFetched ? "Fetched" : "Fetch Details"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Auto-filled Information */}
      {cnicFetched && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>CNIC Data Retrieved Successfully</AlertTitle>
          <AlertDescription>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <Label className="text-sm font-medium">Full Name</Label>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm">{data.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    96% Match
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Father's Name</Label>
                <p className="text-sm mt-1">{data.fatherName}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Date of Birth</Label>
                <p className="text-sm mt-1">{data.dob}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">CBS ID</Label>
                <p className="text-sm mt-1 font-mono">{data.cbsId}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Segment</Label>
                <div className="mt-1">
                  <Badge variant="outline">{data.segment}</Badge>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Phone Number</Label>
                <p className="text-sm mt-1">{data.phone}</p>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Application Details Form */}
      {cnicFetched && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Employment Information
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Employment details affect document requirements</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="employment-type">Employment Type *</Label>
                <Select
                  value={data.employmentType || ""}
                  onValueChange={(value) => handleInputChange("employmentType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="salaried">Salaried</SelectItem>
                    <SelectItem value="self-employed">Self Employed</SelectItem>
                    <SelectItem value="business">Business Owner</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="company">Company/Organization</Label>
                <Input
                  id="company"
                  placeholder="Enter company name"
                  value={data.company || ""}
                  onChange={(e) => handleInputChange("company", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="designation">Designation</Label>
                <Input
                  id="designation"
                  placeholder="Enter job title"
                  value={data.designation || ""}
                  onChange={(e) => handleInputChange("designation", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="monthly-income">Monthly Income (PKR) *</Label>
                <Input
                  id="monthly-income"
                  type="number"
                  placeholder="0"
                  value={data.monthlyIncome || ""}
                  onChange={(e) => handleInputChange("monthlyIncome", e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Loan Application Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="loan-type">Loan Type *</Label>
                <Select value={data.loanType || ""} onValueChange={(value) => handleInputChange("loanType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select loan type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal Loan</SelectItem>
                    <SelectItem value="auto">Auto Loan</SelectItem>
                    <SelectItem value="home">Home Loan</SelectItem>
                    <SelectItem value="business">Business Loan</SelectItem>
                    <SelectItem value="property">Property Loan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="loan-amount">Requested Amount (PKR) *</Label>
                <Input
                  id="loan-amount"
                  type="number"
                  placeholder="0"
                  value={data.loanAmount || ""}
                  onChange={(e) => handleInputChange("loanAmount", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="tenure">Tenure (Months) *</Label>
                <Select value={data.tenure || ""} onValueChange={(value) => handleInputChange("tenure", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tenure" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12 Months</SelectItem>
                    <SelectItem value="24">24 Months</SelectItem>
                    <SelectItem value="36">36 Months</SelectItem>
                    <SelectItem value="48">48 Months</SelectItem>
                    <SelectItem value="60">60 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="channel">Application Channel</Label>
                <Select value={data.channel || ""} onValueChange={(value) => handleInputChange("channel", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="branch">Branch</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="mobile">Mobile App</SelectItem>
                    <SelectItem value="call-center">Call Center</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Additional Information */}
      {cnicFetched && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>Any additional notes or special considerations for this application</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter any additional notes, special instructions, or observations about the applicant..."
              className="min-h-[100px]"
              value={data.additionalNotes || ""}
              onChange={(e) => handleInputChange("additionalNotes", e.target.value)}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
