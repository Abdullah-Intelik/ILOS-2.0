"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DollarSign, Users } from "lucide-react"
import type { ApplicantData } from "@/app/dashboard/applicant/auto/personalautoloans/page"

interface IncomeReferenceStepProps {
  data: ApplicantData
  onChange: (data: ApplicantData) => void
}

export function IncomeReferenceStep({ data, onChange }: IncomeReferenceStepProps) {
  const handleIncomeChange = (field: string, value: string) => {
    const updatedIncome = {
      ...data.customerIncome,
      [field]: value,
    }

    // Calculate total income
    if (field === "grossIncome" || field === "otherIncome") {
      const gross = Number.parseFloat(updatedIncome.grossIncome || "0")
      const other = Number.parseFloat(updatedIncome.otherIncome || "0")
      updatedIncome.totalIncome = (gross + other).toString()
    }

    onChange({
      ...data,
      customerIncome: updatedIncome,
    })
  }

  const handleReference1Change = (field: string, value: string) => {
    if (field.startsWith("contact.")) {
      const contactField = field.replace("contact.", "")
      onChange({
        ...data,
        reference1: {
          ...data.reference1,
          contact: {
            ...data.reference1.contact,
            [contactField]: value,
          },
        },
      })
    } else {
      onChange({
        ...data,
        reference1: {
          ...data.reference1,
          [field]: value,
        },
      })
    }
  }

  const handleReference2Change = (field: string, value: string) => {
    if (field.startsWith("contact.")) {
      const contactField = field.replace("contact.", "")
      onChange({
        ...data,
        reference2: {
          ...data.reference2,
          contact: {
            ...data.reference2.contact,
            [contactField]: value,
          },
        },
      })
    } else {
      onChange({
        ...data,
        reference2: {
          ...data.reference2,
          [field]: value,
        },
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold">Income & References</h3>
        <p className="text-muted-foreground">Income details and reference contact information</p>
      </div>

      <div className="space-y-6">
        {/* Customer Income */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Customer Income
            </CardTitle>
            <CardDescription>Monthly income breakdown and total calculation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={data.customerIncome?.currency || "PKR"}
                  onValueChange={(value) => handleIncomeChange("currency", value)}
                >
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

              <div>
                <Label htmlFor="gross-income">Gross Income *</Label>
                <Input
                  id="gross-income"
                  type="number"
                  placeholder="Enter gross monthly income"
                  value={data.customerIncome?.grossIncome || ""}
                  onChange={(e) => handleIncomeChange("grossIncome", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="other-income">Other Income</Label>
                <Input
                  id="other-income"
                  type="number"
                  placeholder="Enter other monthly income"
                  value={data.customerIncome?.otherIncome || ""}
                  onChange={(e) => handleIncomeChange("otherIncome", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="total-income">Total Income (Calculated)</Label>
                <Input
                  id="total-income"
                  type="number"
                  placeholder="Auto-calculated"
                  value={data.customerIncome?.totalIncome || ""}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reference 1 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Reference 1
            </CardTitle>
            <CardDescription>First reference contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ref1-title">Title</Label>
                <Select
                  value={data.reference1?.title || ""}
                  onValueChange={(value) => handleReference1Change("title", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select title" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mr">Mr.</SelectItem>
                    <SelectItem value="mrs">Mrs.</SelectItem>
                    <SelectItem value="ms">Ms.</SelectItem>
                    <SelectItem value="dr">Dr.</SelectItem>
                    <SelectItem value="prof">Prof.</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="ref1-first-name">First Name *</Label>
                <Input
                  id="ref1-first-name"
                  placeholder="Enter first name"
                  value={data.reference1?.firstName || ""}
                  onChange={(e) => handleReference1Change("firstName", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="ref1-middle-name">Middle Name</Label>
                <Input
                  id="ref1-middle-name"
                  placeholder="Enter middle name"
                  value={data.reference1?.middleName || ""}
                  onChange={(e) => handleReference1Change("middleName", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="ref1-last-name">Last Name</Label>
                <Input
                  id="ref1-last-name"
                  placeholder="Enter last name"
                  value={data.reference1?.lastName || ""}
                  onChange={(e) => handleReference1Change("lastName", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="ref1-gender">Gender</Label>
                <Select
                  value={data.reference1?.gender || ""}
                  onValueChange={(value) => handleReference1Change("gender", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="ref1-relationship">Relationship</Label>
                <Select
                  value={data.reference1?.relationship || ""}
                  onValueChange={(value) => handleReference1Change("relationship", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="friend">Friend</SelectItem>
                    <SelectItem value="colleague">Colleague</SelectItem>
                    <SelectItem value="relative">Relative</SelectItem>
                    <SelectItem value="neighbor">Neighbor</SelectItem>
                    <SelectItem value="business-partner">Business Partner</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="ref1-new-nic">New NIC *</Label>
                <Input
                  id="ref1-new-nic"
                  placeholder="12345-1234567-1"
                  value={data.reference1?.newNic || ""}
                  onChange={(e) => handleReference1Change("newNic", e.target.value)}
                  maxLength={15}
                  className="font-mono"
                  required
                />
              </div>
            </div>

            {/* Reference 1 Contact */}
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3">Reference 1 Contact Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ref1-house-no">House/Flat/Shop No.</Label>
                  <Input
                    id="ref1-house-no"
                    placeholder="Enter house/flat/shop number"
                    value={data.reference1?.contact?.houseNo || ""}
                    onChange={(e) => handleReference1Change("contact.houseNo", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="ref1-street">Street</Label>
                  <Input
                    id="ref1-street"
                    placeholder="Enter street name"
                    value={data.reference1?.contact?.street || ""}
                    onChange={(e) => handleReference1Change("contact.street", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="ref1-address">Address</Label>
                  <Input
                    id="ref1-address"
                    placeholder="Enter address"
                    value={data.reference1?.contact?.address || ""}
                    onChange={(e) => handleReference1Change("contact.address", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="ref1-address4">Address 4</Label>
                  <Input
                    id="ref1-address4"
                    placeholder="Additional address line"
                    value={data.reference1?.contact?.address4 || ""}
                    onChange={(e) => handleReference1Change("contact.address4", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="ref1-city">City</Label>
                  <Select
                    value={data.reference1?.contact?.city || ""}
                    onValueChange={(value) => handleReference1Change("contact.city", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="karachi">Karachi</SelectItem>
                      <SelectItem value="lahore">Lahore</SelectItem>
                      <SelectItem value="islamabad">Islamabad</SelectItem>
                      <SelectItem value="faisalabad">Faisalabad</SelectItem>
                      <SelectItem value="rawalpindi">Rawalpindi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="ref1-state">State</Label>
                  <Input
                    id="ref1-state"
                    placeholder="Enter state/province"
                    value={data.reference1?.contact?.state || ""}
                    onChange={(e) => handleReference1Change("contact.state", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="ref1-tehsil">Tehsil/District/Area</Label>
                  <Input
                    id="ref1-tehsil"
                    placeholder="Enter tehsil/district/area"
                    value={data.reference1?.contact?.tehsil || ""}
                    onChange={(e) => handleReference1Change("contact.tehsil", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="ref1-landmark">Nearest Landmark</Label>
                  <Input
                    id="ref1-landmark"
                    placeholder="Enter nearest landmark"
                    value={data.reference1?.contact?.nearestLandmark || ""}
                    onChange={(e) => handleReference1Change("contact.nearestLandmark", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="ref1-country">Country</Label>
                  <Select
                    value={data.reference1?.contact?.country || ""}
                    onValueChange={(value) => handleReference1Change("contact.country", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pakistan">Pakistan</SelectItem>
                      <SelectItem value="uae">United Arab Emirates</SelectItem>
                      <SelectItem value="saudi-arabia">Saudi Arabia</SelectItem>
                      <SelectItem value="usa">United States</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="ref1-phone-residence">Phone (Residence)</Label>
                  <Input
                    id="ref1-phone-residence"
                    placeholder="Enter residence phone"
                    value={data.reference1?.contact?.phoneResidence || ""}
                    onChange={(e) => handleReference1Change("contact.phoneResidence", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="ref1-phone-office">Phone (Office)</Label>
                  <Input
                    id="ref1-phone-office"
                    placeholder="Enter office phone"
                    value={data.reference1?.contact?.phoneOffice || ""}
                    onChange={(e) => handleReference1Change("contact.phoneOffice", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="ref1-mobile">Mobile No.</Label>
                  <Input
                    id="ref1-mobile"
                    placeholder="Enter mobile number"
                    value={data.reference1?.contact?.mobileNo || ""}
                    onChange={(e) => handleReference1Change("contact.mobileNo", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="ref1-email">Email</Label>
                  <Input
                    id="ref1-email"
                    type="email"
                    placeholder="Enter email address"
                    value={data.reference1?.contact?.email || ""}
                    onChange={(e) => handleReference1Change("contact.email", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reference 2 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Reference 2
            </CardTitle>
            <CardDescription>Second reference contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ref2-title">Title</Label>
                <Select
                  value={data.reference2?.title || ""}
                  onValueChange={(value) => handleReference2Change("title", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select title" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mr">Mr.</SelectItem>
                    <SelectItem value="mrs">Mrs.</SelectItem>
                    <SelectItem value="ms">Ms.</SelectItem>
                    <SelectItem value="dr">Dr.</SelectItem>
                    <SelectItem value="prof">Prof.</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="ref2-first-name">First Name</Label>
                <Input
                  id="ref2-first-name"
                  placeholder="Enter first name"
                  value={data.reference2?.firstName || ""}
                  onChange={(e) => handleReference2Change("firstName", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="ref2-middle-name">Middle Name</Label>
                <Input
                  id="ref2-middle-name"
                  placeholder="Enter middle name"
                  value={data.reference2?.middleName || ""}
                  onChange={(e) => handleReference2Change("middleName", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="ref2-last-name">Last Name</Label>
                <Input
                  id="ref2-last-name"
                  placeholder="Enter last name"
                  value={data.reference2?.lastName || ""}
                  onChange={(e) => handleReference2Change("lastName", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="ref2-gender">Gender</Label>
                <Select
                  value={data.reference2?.gender || ""}
                  onValueChange={(value) => handleReference2Change("gender", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="ref2-relationship">Relationship</Label>
                <Select
                  value={data.reference2?.relationship || ""}
                  onValueChange={(value) => handleReference2Change("relationship", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="friend">Friend</SelectItem>
                    <SelectItem value="colleague">Colleague</SelectItem>
                    <SelectItem value="relative">Relative</SelectItem>
                    <SelectItem value="neighbor">Neighbor</SelectItem>
                    <SelectItem value="business-partner">Business Partner</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="ref2-new-nic">New NIC</Label>
                <Input
                  id="ref2-new-nic"
                  placeholder="12345-1234567-1"
                  value={data.reference2?.newNic || ""}
                  onChange={(e) => handleReference2Change("newNic", e.target.value)}
                  maxLength={15}
                  className="font-mono"
                />
              </div>
            </div>

            {/* Reference 2 Contact */}
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3">Reference 2 Contact Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ref2-house-no">House/Flat/Shop No.</Label>
                  <Input
                    id="ref2-house-no"
                    placeholder="Enter house/flat/shop number"
                    value={data.reference2?.contact?.houseNo || ""}
                    onChange={(e) => handleReference2Change("contact.houseNo", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="ref2-street">Street</Label>
                  <Input
                    id="ref2-street"
                    placeholder="Enter street name"
                    value={data.reference2?.contact?.street || ""}
                    onChange={(e) => handleReference2Change("contact.street", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="ref2-mobile">Mobile No.</Label>
                  <Input
                    id="ref2-mobile"
                    placeholder="Enter mobile number"
                    value={data.reference2?.contact?.mobileNo || ""}
                    onChange={(e) => handleReference2Change("contact.mobileNo", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="ref2-email">Email</Label>
                  <Input
                    id="ref2-email"
                    type="email"
                    placeholder="Enter email address"
                    value={data.reference2?.contact?.email || ""}
                    onChange={(e) => handleReference2Change("contact.email", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
