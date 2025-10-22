"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { FileText, Building, HelpCircle } from "lucide-react"
import type { ApplicantData } from "@/app/dashboard/applicant/auto/personalautoloans/page"

interface OdemOriginationStepProps {
  data: ApplicantData
  onChange: (data: ApplicantData) => void
}

export function OdemOriginationStep({ data, onChange }: OdemOriginationStepProps) {
  const handleInputChange = (field: keyof ApplicantData, value: string) => {
    onChange({ ...data, [field]: value })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold">ODEM & Origination Details</h3>
        <p className="text-muted-foreground">Application identification and origination information</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* ODEM Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              ODEM Information
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Online Data Entry Module - Application identification details</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
            <CardDescription>Application identification and reference details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="id-type">ID Type *</Label>
              <Select value={data.idType || ""} onValueChange={(value) => handleInputChange("idType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select ID type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cnic">CNIC</SelectItem>
                  <SelectItem value="passport">Passport</SelectItem>
                  <SelectItem value="driving-license">Driving License</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="quick-de-app-id">Quick DE Application ID</Label>
              <Input
                id="quick-de-app-id"
                placeholder="Enter Quick DE Application ID"
                value={data.quickDeApplicationId || ""}
                onChange={(e) => handleInputChange("quickDeApplicationId", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="reference-number">Reference Number</Label>
              <Input
                id="reference-number"
                placeholder="Enter reference number"
                value={data.referenceNumber || ""}
                onChange={(e) => handleInputChange("referenceNumber", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="product-sub-class">Product Sub Class</Label>
              <Select
                value={data.productSubClass || ""}
                onValueChange={(value) => handleInputChange("productSubClass", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select product sub class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal-loan">Personal Loan</SelectItem>
                  <SelectItem value="auto-loan">Auto Loan</SelectItem>
                  <SelectItem value="home-loan">Home Loan</SelectItem>
                  <SelectItem value="business-loan">Business Loan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="product-type">Product Type *</Label>
              <Select value={data.productType || ""} onValueChange={(value) => handleInputChange("productType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select product type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conventional">Conventional</SelectItem>
                  <SelectItem value="islamic">Islamic</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="program-type">Program Type</Label>
              <Select value={data.programType || ""} onValueChange={(value) => handleInputChange("programType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select program type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="id-no">ID No. *</Label>
              <Input
                id="id-no"
                placeholder="Enter ID number"
                value={data.idNo || ""}
                onChange={(e) => handleInputChange("idNo", e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Origination Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Origination Details
            </CardTitle>
            <CardDescription>Channel and source information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="channel">Channel</Label>
              <Select value={data.channel || ""} onValueChange={(value) => handleInputChange("channel", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="branch">Branch</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="mobile">Mobile App</SelectItem>
                  <SelectItem value="call-center">Call Center</SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="campaign-code">Campaign Code</Label>
              <Input
                id="campaign-code"
                placeholder="Enter campaign code"
                value={data.campaignCode || ""}
                onChange={(e) => handleInputChange("campaignCode", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="origin-city">Origin City</Label>
              <Select value={data.originCity || ""} onValueChange={(value) => handleInputChange("originCity", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select origin city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="karachi">Karachi</SelectItem>
                  <SelectItem value="lahore">Lahore</SelectItem>
                  <SelectItem value="islamabad">Islamabad</SelectItem>
                  <SelectItem value="faisalabad">Faisalabad</SelectItem>
                  <SelectItem value="rawalpindi">Rawalpindi</SelectItem>
                  <SelectItem value="multan">Multan</SelectItem>
                  <SelectItem value="peshawar">Peshawar</SelectItem>
                  <SelectItem value="quetta">Quetta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="referral-branch">Referral Branch</Label>
              <Select
                value={data.referralBranch || ""}
                onValueChange={(value) => handleInputChange("referralBranch", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select referral branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main-branch">Main Branch</SelectItem>
                  <SelectItem value="gulshan-branch">Gulshan Branch</SelectItem>
                  <SelectItem value="dha-branch">DHA Branch</SelectItem>
                  <SelectItem value="clifton-branch">Clifton Branch</SelectItem>
                  <SelectItem value="saddar-branch">Saddar Branch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tracking-reference-no">Tracking Reference No</Label>
              <Input
                id="tracking-reference-no"
                placeholder="Enter tracking reference number"
                value={data.trackingReferenceNo || ""}
                onChange={(e) => handleInputChange("trackingReferenceNo", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="source-of-information">Source of Information</Label>
              <Select
                value={data.sourceOfInformation || ""}
                onValueChange={(value) => handleInputChange("sourceOfInformation", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="advertisement">Advertisement</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="social-media">Social Media</SelectItem>
                  <SelectItem value="branch-visit">Branch Visit</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="application-date">Application Date *</Label>
              <Input
                id="application-date"
                type="date"
                value={data.applicationDate || ""}
                onChange={(e) => handleInputChange("applicationDate", e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
