"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CreditCard, DollarSign, HelpCircle } from "lucide-react"
import type { ApplicantData } from "@/app/dashboard/applicant/auto/personalautoloans/page"

interface ApplicationLoanStepProps {
  data: ApplicantData
  onChange: (data: ApplicantData) => void
}

export function ApplicationLoanStep({ data, onChange }: ApplicationLoanStepProps) {
  const handleInputChange = (field: keyof ApplicantData, value: string | boolean) => {
    onChange({ ...data, [field]: value })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold">Application Type & Loan Requirements</h3>
        <p className="text-muted-foreground">Application preferences and loan specification details</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Application Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Application Type
            </CardTitle>
            <CardDescription>Application preferences and settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="reader-printing-option">Reader/Printing Option</Label>
              <Select
                value={data.readerPrintingOption || ""}
                onValueChange={(value) => handleInputChange("readerPrintingOption", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select printing option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="print-enabled">Print Enabled</SelectItem>
                  <SelectItem value="print-disabled">Print Disabled</SelectItem>
                  <SelectItem value="reader-only">Reader Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="preferred-mailing-address">Preferred Mailing Address</Label>
              <Select
                value={data.preferredMailingAddress || ""}
                onValueChange={(value) => handleInputChange("preferredMailingAddress", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select mailing address" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current Address</SelectItem>
                  <SelectItem value="permanent">Permanent Address</SelectItem>
                  <SelectItem value="office">Office Address</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="referral-card-no">Referral Card No.</Label>
              <Input
                id="referral-card-no"
                placeholder="Enter referral card number"
                value={data.referralCardNo || ""}
                onChange={(e) => handleInputChange("referralCardNo", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="pbbim-employee-no">PBBIM Employee No.</Label>
              <Input
                id="pbbim-employee-no"
                placeholder="Auto-filled from system"
                value={data.pbbimEmployeeNo || ""}
                onChange={(e) => handleInputChange("pbbimEmployeeNo", e.target.value)}
                disabled
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="property-finalize"
                checked={data.propertyFinalize || false}
                onCheckedChange={(checked) => handleInputChange("propertyFinalize", checked as boolean)}
              />
              <Label htmlFor="property-finalize">Property Finalize</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Check if property has been finalized for home/property loans</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div>
              <Label htmlFor="card-destination">Card Destination</Label>
              <Select
                value={data.cardDestination || ""}
                onValueChange={(value) => handleInputChange("cardDestination", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select card destination" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">Home Address</SelectItem>
                  <SelectItem value="office">Office Address</SelectItem>
                  <SelectItem value="branch">Branch Collection</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="promo-code">Promo Code</Label>
              <Select value={data.promoCode || ""} onValueChange={(value) => handleInputChange("promoCode", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select promo code" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Promo Code</SelectItem>
                  <SelectItem value="new-customer">New Customer</SelectItem>
                  <SelectItem value="referral">Referral Bonus</SelectItem>
                  <SelectItem value="seasonal">Seasonal Offer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="so-employee-no">SO Employee No.</Label>
              <Input
                id="so-employee-no"
                placeholder="Auto-filled from system"
                value={data.soEmployeeNo || ""}
                onChange={(e) => handleInputChange("soEmployeeNo", e.target.value)}
                disabled
              />
            </div>

            <div>
              <Label htmlFor="payment-mode">Payment Mode</Label>
              <Select value={data.paymentMode || ""} onValueChange={(value) => handleInputChange("paymentMode", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto-debit">Auto Debit</SelectItem>
                  <SelectItem value="standing-instruction">Standing Instruction</SelectItem>
                  <SelectItem value="manual">Manual Payment</SelectItem>
                  <SelectItem value="online">Online Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="referred-by-dealer"
                checked={data.referredByDealer || false}
                onCheckedChange={(checked) => handleInputChange("referredByDealer", checked as boolean)}
              />
              <Label htmlFor="referred-by-dealer">Referred by Dealer</Label>
            </div>

            <div>
              <Label htmlFor="nature-of-telephone">Nature of Telephone</Label>
              <Select
                value={data.natureOfTelephone || ""}
                onValueChange={(value) => handleInputChange("natureOfTelephone", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select telephone nature" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="landline">Landline</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="sm-employee-no">SM Employee No.</Label>
              <Input
                id="sm-employee-no"
                placeholder="Auto-filled from system"
                value={data.smEmployeeNo || ""}
                onChange={(e) => handleInputChange("smEmployeeNo", e.target.value)}
                disabled
              />
            </div>
          </CardContent>
        </Card>

        {/* Loan Requirements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Loan Requirements
            </CardTitle>
            <CardDescription>Loan amount and terms specification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="desired-financing">Desired Financing *</Label>
              <Input
                id="desired-financing"
                type="number"
                placeholder="Enter desired financing amount"
                value={data.desiredFinancing || ""}
                onChange={(e) => handleInputChange("desiredFinancing", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="currency">Currency *</Label>
              <Select value={data.currency || ""} onValueChange={(value) => handleInputChange("currency", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PKR">PKR - Pakistani Rupee</SelectItem>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="tenure">Tenure *</Label>
                <Input
                  id="tenure"
                  type="number"
                  placeholder="Enter tenure"
                  value={data.tenure || ""}
                  onChange={(e) => handleInputChange("tenure", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="tenure-unit">Unit</Label>
                <Select value={data.tenureUnit || ""} onValueChange={(value) => handleInputChange("tenureUnit", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="months">Months</SelectItem>
                    <SelectItem value="years">Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="purpose">Purpose *</Label>
              <Select value={data.purpose || ""} onValueChange={(value) => handleInputChange("purpose", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select loan purpose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal-use">Personal Use</SelectItem>
                  <SelectItem value="home-purchase">Home Purchase</SelectItem>
                  <SelectItem value="vehicle-purchase">Vehicle Purchase</SelectItem>
                  <SelectItem value="business-expansion">Business Expansion</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="medical">Medical</SelectItem>
                  <SelectItem value="wedding">Wedding</SelectItem>
                  <SelectItem value="travel">Travel</SelectItem>
                  <SelectItem value="debt-consolidation">Debt Consolidation</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* ATM/Credit Card Section */}
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3">ATM / Credit Card</h4>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="name-on-card">Name to Appear on Card</Label>
                  <Input
                    id="name-on-card"
                    placeholder="Enter name for card"
                    value={data.firstName || ""}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="secret-word">Key/Secret Word</Label>
                  <Input id="secret-word" type="password" placeholder="Enter secret word" maxLength={8} />
                </div>
              </div>
            </div>

            {/* Auto Cross Sell */}
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3">Auto Cross Sell</h4>
              <div>
                <Label htmlFor="auto-loan-no">Auto Loan No.</Label>
                <Input id="auto-loan-no" placeholder="Enter existing auto loan number" />
              </div>
            </div>

            {/* For Doctors Only */}
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3">For Doctors Only</h4>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="pmdc-no">PMDC No.</Label>
                  <Input id="pmdc-no" placeholder="Enter PMDC number" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="pmdc-issue-date">PMDC Issue Date</Label>
                    <Input id="pmdc-issue-date" type="date" />
                  </div>
                  <div>
                    <Label htmlFor="pmdc-expiry-date">PMDC Expiry Date</Label>
                    <Input id="pmdc-expiry-date" type="date" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
