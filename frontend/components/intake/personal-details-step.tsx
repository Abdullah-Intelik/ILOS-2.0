"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { User, Users, HelpCircle } from "lucide-react"
import type { ApplicantData } from "@/app/dashboard/applicant/auto/personalautoloans/page"

interface PersonalDetailsStepProps {
  data: ApplicantData
  onChange: (data: ApplicantData) => void
}

export function PersonalDetailsStep({ data, onChange }: PersonalDetailsStepProps) {
  const handleInputChange = (field: keyof ApplicantData, value: string | boolean) => {
    onChange({ ...data, [field]: value })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold">Personal Details</h3>
        <p className="text-muted-foreground">Comprehensive personal and identification information</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>Personal identification and basic details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Select value={data.title || ""} onValueChange={(value) => handleInputChange("title", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select title" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mr">Mr.</SelectItem>
                  <SelectItem value="mrs">Mrs.</SelectItem>
                  <SelectItem value="ms">Ms.</SelectItem>
                  <SelectItem value="dr">Dr.</SelectItem>
                  <SelectItem value="prof">Prof.</SelectItem>
                  <SelectItem value="eng">Eng.</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="first-name">First Name *</Label>
              <Input
                id="first-name"
                placeholder="Enter first name"
                value={data.firstName || ""}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="last-name">Last Name *</Label>
              <Input
                id="last-name"
                placeholder="Enter last name"
                value={data.lastName || ""}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="new-nic">New NIC *</Label>
              <Input
                id="new-nic"
                placeholder="12345-1234567-1"
                value={data.newNic || ""}
                onChange={(e) => handleInputChange("newNic", e.target.value)}
                maxLength={15}
                className="font-mono"
                required
              />
            </div>

            <div>
              <Label htmlFor="old-nic">Old NIC</Label>
              <Input
                id="old-nic"
                placeholder="Enter old NIC if applicable"
                value={data.oldNic || ""}
                onChange={(e) => handleInputChange("oldNic", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="issue-date">Issue Date *</Label>
                <Input
                  id="issue-date"
                  type="date"
                  value={data.issueDate || ""}
                  onChange={(e) => handleInputChange("issueDate", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="expiry-date">Expiry Date *</Label>
                <Input
                  id="expiry-date"
                  type="date"
                  value={data.expiryDate || ""}
                  onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="date-of-birth">Date of Birth *</Label>
              <Input
                id="date-of-birth"
                type="date"
                value={data.dateOfBirth || ""}
                onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="gender">Gender *</Label>
              <Select value={data.gender || ""} onValueChange={(value) => handleInputChange("gender", value)}>
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
              <Label htmlFor="marital-status">Marital Status *</Label>
              <Select
                value={data.maritalStatus || ""}
                onValueChange={(value) => handleInputChange("maritalStatus", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select marital status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="married">Married</SelectItem>
                  <SelectItem value="divorced">Divorced</SelectItem>
                  <SelectItem value="widowed">Widowed</SelectItem>
                  <SelectItem value="separated">Separated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="no-of-children">No. of Children *</Label>
                <Input
                  id="no-of-children"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={data.noOfChildren || ""}
                  onChange={(e) => handleInputChange("noOfChildren", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="no-of-dependents">No. of Dependents *</Label>
                <Input
                  id="no-of-dependents"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={data.noOfDependents || ""}
                  onChange={(e) => handleInputChange("noOfDependents", e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Family and Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Family & Additional Information
            </CardTitle>
            <CardDescription>Family details and additional personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="father-husband-name">Father/Husband Name *</Label>
              <Input
                id="father-husband-name"
                placeholder="Enter father/husband name"
                value={data.fatherHusbandName || ""}
                onChange={(e) => handleInputChange("fatherHusbandName", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="father-husband-cnic">Father/Husband CNIC</Label>
              <Input
                id="father-husband-cnic"
                placeholder="12345-1234567-1"
                value={data.fatherHusbandCnic || ""}
                onChange={(e) => handleInputChange("fatherHusbandCnic", e.target.value)}
                maxLength={15}
                className="font-mono"
              />
            </div>

            <div>
              <Label htmlFor="mother-maiden-name">Mother Maiden Name *</Label>
              <Input
                id="mother-maiden-name"
                placeholder="Enter mother's maiden name"
                value={data.motherMaidenName || ""}
                onChange={(e) => handleInputChange("motherMaidenName", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="passport-no">Passport No.</Label>
              <Input
                id="passport-no"
                placeholder="Enter passport number"
                value={data.passportNo || ""}
                onChange={(e) => handleInputChange("passportNo", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="education">Education *</Label>
              <Select value={data.education || ""} onValueChange={(value) => handleInputChange("education", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select education level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">Primary</SelectItem>
                  <SelectItem value="secondary">Secondary</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                  <SelectItem value="masters">Master's Degree</SelectItem>
                  <SelectItem value="phd">PhD</SelectItem>
                  <SelectItem value="professional">Professional Degree</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="nationality">Nationality</Label>
              <Select value={data.nationality || ""} onValueChange={(value) => handleInputChange("nationality", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select nationality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pakistani">Pakistani</SelectItem>
                  <SelectItem value="american">American</SelectItem>
                  <SelectItem value="british">British</SelectItem>
                  <SelectItem value="canadian">Canadian</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="ntn">NTN</Label>
              <Input
                id="ntn"
                placeholder="Enter National Tax Number"
                value={data.ntn || ""}
                onChange={(e) => handleInputChange("ntn", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="perinfo-pep">PERINFO_PEP</Label>
              <Select value={data.perinfoP || ""} onValueChange={(value) => handleInputChange("perinfoP", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select PEP status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="related">Related to PEP</SelectItem>
                </SelectContent>
              </Select>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground mt-1" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Politically Exposed Person - Required for compliance</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="public-figure"
                checked={data.publicFigure || false}
                onCheckedChange={(checked) => handleInputChange("publicFigure", checked as boolean)}
              />
              <Label htmlFor="public-figure">Public Figure</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Check if applicant is a public figure or celebrity</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
