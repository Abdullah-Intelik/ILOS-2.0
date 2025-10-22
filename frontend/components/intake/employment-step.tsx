"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Briefcase, Building, HelpCircle } from "lucide-react"
import type { ApplicantData } from "@/app/dashboard/applicant/auto/personalautoloans/page"

interface EmploymentStepProps {
  data: ApplicantData
  onChange: (data: ApplicantData) => void
}

export function EmploymentStep({ data, onChange }: EmploymentStepProps) {
  const handleCurrentEmploymentChange = (field: string, value: string | boolean) => {
    onChange({
      ...data,
      currentEmployment: {
        ...data.currentEmployment,
        [field]: value,
      },
    })
  }

  const handlePreviousEmploymentChange = (field: string, value: string) => {
    onChange({
      ...data,
      previousEmployment: {
        ...data.previousEmployment,
        [field]: value,
      },
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold">Employment Information</h3>
        <p className="text-muted-foreground">Current and previous employment details</p>
      </div>

      <div className="space-y-6">
        {/* Current Employment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Current Employment
            </CardTitle>
            <CardDescription>Your current employment and occupation details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="occupation-category">Occupation Category *</Label>
                <Select
                  value={data.currentEmployment?.occupationCategory || ""}
                  onValueChange={(value) => handleCurrentEmploymentChange("occupationCategory", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select occupation category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="managerial">Managerial</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="clerical">Clerical</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="skilled-worker">Skilled Worker</SelectItem>
                    <SelectItem value="unskilled-worker">Unskilled Worker</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="employment-status">Employment Status *</Label>
                <Select
                  value={data.currentEmployment?.employmentStatus || ""}
                  onValueChange={(value) => handleCurrentEmploymentChange("employmentStatus", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employment status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="permanent">Permanent</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="temporary">Temporary</SelectItem>
                    <SelectItem value="part-time">Part Time</SelectItem>
                    <SelectItem value="consultant">Consultant</SelectItem>
                    <SelectItem value="self-employed">Self Employed</SelectItem>
                    <SelectItem value="business-owner">Business Owner</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                    <SelectItem value="unemployed">Unemployed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="industry">Industry</Label>
                <Select
                  value={data.currentEmployment?.industry || ""}
                  onValueChange={(value) => handleCurrentEmploymentChange("industry", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="banking">Banking & Finance</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="construction">Construction</SelectItem>
                    <SelectItem value="government">Government</SelectItem>
                    <SelectItem value="telecommunications">Telecommunications</SelectItem>
                    <SelectItem value="agriculture">Agriculture</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="department">Department</Label>
                <Select
                  value={data.currentEmployment?.department || ""}
                  onValueChange={(value) => handleCurrentEmploymentChange("department", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="administration">Administration</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="hr">Human Resources</SelectItem>
                    <SelectItem value="it">Information Technology</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="customer-service">Customer Service</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="type-of-business">Type of Business</Label>
                <Select
                  value={data.currentEmployment?.typeOfBusiness || ""}
                  onValueChange={(value) => handleCurrentEmploymentChange("typeOfBusiness", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private-limited">Private Limited</SelectItem>
                    <SelectItem value="public-limited">Public Limited</SelectItem>
                    <SelectItem value="partnership">Partnership</SelectItem>
                    <SelectItem value="sole-proprietorship">Sole Proprietorship</SelectItem>
                    <SelectItem value="government">Government</SelectItem>
                    <SelectItem value="ngo">NGO</SelectItem>
                    <SelectItem value="multinational">Multinational</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={data.currentEmployment?.status || ""}
                  onValueChange={(value) => handleCurrentEmploymentChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on-leave">On Leave</SelectItem>
                    <SelectItem value="notice-period">Notice Period</SelectItem>
                    <SelectItem value="probation">Probation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="occupation-profession">Occupation Profession</Label>
                <Select
                  value={data.currentEmployment?.occupationProfession || ""}
                  onValueChange={(value) => handleCurrentEmploymentChange("occupationProfession", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select profession" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="engineer">Engineer</SelectItem>
                    <SelectItem value="lawyer">Lawyer</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="accountant">Accountant</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="consultant">Consultant</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="employment-segment">Employment Segment</Label>
                <Select
                  value={data.currentEmployment?.employmentSegment || ""}
                  onValueChange={(value) => handleCurrentEmploymentChange("employmentSegment", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select segment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="corporate">Corporate</SelectItem>
                    <SelectItem value="sme">SME</SelectItem>
                    <SelectItem value="government">Government</SelectItem>
                    <SelectItem value="startup">Startup</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="nature-of-business">Nature of Business</Label>
                <Input
                  id="nature-of-business"
                  placeholder="Describe nature of business"
                  value={data.currentEmployment?.natureOfBusiness || ""}
                  onChange={(e) => handleCurrentEmploymentChange("natureOfBusiness", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="grade-level">Grade Level</Label>
                <Select
                  value={data.currentEmployment?.gradeLevel || ""}
                  onValueChange={(value) => handleCurrentEmploymentChange("gradeLevel", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry-level">Entry Level</SelectItem>
                    <SelectItem value="junior">Junior</SelectItem>
                    <SelectItem value="mid-level">Mid Level</SelectItem>
                    <SelectItem value="senior">Senior</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                    <SelectItem value="c-level">C-Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="shares-hold-in-business">Shares Hold in Business</Label>
                <Select
                  value={data.currentEmployment?.sharesHoldInBusiness || ""}
                  onValueChange={(value) => handleCurrentEmploymentChange("sharesHoldInBusiness", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select share percentage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="less-than-25">Less than 25%</SelectItem>
                    <SelectItem value="25-50">25% - 50%</SelectItem>
                    <SelectItem value="51-75">51% - 75%</SelectItem>
                    <SelectItem value="more-than-75">More than 75%</SelectItem>
                    <SelectItem value="100">100%</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="company-name">Company Name *</Label>
                <Select
                  value={data.currentEmployment?.companyName || ""}
                  onValueChange={(value) => handleCurrentEmploymentChange("companyName", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select or enter company" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ubl">United Bank Limited</SelectItem>
                    <SelectItem value="hbl">Habib Bank Limited</SelectItem>
                    <SelectItem value="mcb">MCB Bank</SelectItem>
                    <SelectItem value="abbl">Allied Bank</SelectItem>
                    <SelectItem value="nbl">National Bank</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="other-company-name">Other Company Name</Label>
                <Input
                  id="other-company-name"
                  placeholder="Enter company name if not listed"
                  value={data.currentEmployment?.otherCompanyName || ""}
                  onChange={(e) => handleCurrentEmploymentChange("otherCompanyName", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="designation">Designation *</Label>
                <Input
                  id="designation"
                  placeholder="Enter your designation"
                  value={data.currentEmployment?.designation || ""}
                  onChange={(e) => handleCurrentEmploymentChange("designation", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="date-of-joining">Date of Joining</Label>
                <Input
                  id="date-of-joining"
                  type="date"
                  value={data.currentEmployment?.dateOfJoining || ""}
                  onChange={(e) => handleCurrentEmploymentChange("dateOfJoining", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="source-of-business">Source of Business</Label>
                <Select
                  value={data.currentEmployment?.sourceOfBusiness || ""}
                  onValueChange={(value) => handleCurrentEmploymentChange("sourceOfBusiness", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="salary">Salary</SelectItem>
                    <SelectItem value="business-income">Business Income</SelectItem>
                    <SelectItem value="investment">Investment</SelectItem>
                    <SelectItem value="rental">Rental Income</SelectItem>
                    <SelectItem value="commission">Commission</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="emp-no">Emp No.</Label>
                <Input
                  id="emp-no"
                  placeholder="Enter employee number"
                  value={data.currentEmployment?.empNo || ""}
                  onChange={(e) => handleCurrentEmploymentChange("empNo", e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="family-business"
                  checked={data.currentEmployment?.familyBusiness || false}
                  onCheckedChange={(checked) => handleCurrentEmploymentChange("familyBusiness", checked as boolean)}
                />
                <Label htmlFor="family-business">Family Business</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Check if this is a family-owned business</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div>
                <Label htmlFor="experience">Experience (Years & Months)</Label>
                <Input
                  id="experience"
                  placeholder="e.g., 5 years 6 months"
                  value={data.currentEmployment?.experience || ""}
                  onChange={(e) => handleCurrentEmploymentChange("experience", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="no-of-employees">No. of Employees</Label>
                <Input
                  id="no-of-employees"
                  type="number"
                  placeholder="Enter number of employees"
                  value={data.currentEmployment?.noOfEmployees || ""}
                  onChange={(e) => handleCurrentEmploymentChange("noOfEmployees", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Enter name"
                  value={data.currentEmployment?.name || ""}
                  onChange={(e) => handleCurrentEmploymentChange("name", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Previous Employment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Previous Employment
            </CardTitle>
            <CardDescription>Your previous employment history (if applicable)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="prev-employment-status">Employment Status</Label>
                <Select
                  value={data.previousEmployment?.employmentStatus || ""}
                  onValueChange={(value) => handlePreviousEmploymentChange("employmentStatus", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employment status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="permanent">Permanent</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="temporary">Temporary</SelectItem>
                    <SelectItem value="part-time">Part Time</SelectItem>
                    <SelectItem value="consultant">Consultant</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="prev-others">Others</Label>
                <Input
                  id="prev-others"
                  placeholder="Specify if other"
                  value={data.previousEmployment?.others || ""}
                  onChange={(e) => handlePreviousEmploymentChange("others", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="prev-occupation-category">Occupation Category</Label>
                <Select
                  value={data.previousEmployment?.occupationCategory || ""}
                  onValueChange={(value) => handlePreviousEmploymentChange("occupationCategory", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select occupation category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="managerial">Managerial</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="clerical">Clerical</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="prev-years-experience">Years Experience</Label>
                <Input
                  id="prev-years-experience"
                  type="number"
                  placeholder="Enter years of experience"
                  value={data.previousEmployment?.yearsExperience || ""}
                  onChange={(e) => handlePreviousEmploymentChange("yearsExperience", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="prev-professional">Professional</Label>
                <Select
                  value={data.previousEmployment?.professional || ""}
                  onValueChange={(value) => handlePreviousEmploymentChange("professional", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select profession" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="engineer">Engineer</SelectItem>
                    <SelectItem value="lawyer">Lawyer</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="accountant">Accountant</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="prev-employment-segment">Employment Segment</Label>
                <Select
                  value={data.previousEmployment?.employmentSegment || ""}
                  onValueChange={(value) => handlePreviousEmploymentChange("employmentSegment", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select segment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="corporate">Corporate</SelectItem>
                    <SelectItem value="sme">SME</SelectItem>
                    <SelectItem value="government">Government</SelectItem>
                    <SelectItem value="startup">Startup</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="prev-months-experience">Months Experience</Label>
                <Input
                  id="prev-months-experience"
                  type="number"
                  placeholder="Enter months of experience"
                  value={data.previousEmployment?.monthsExperience || ""}
                  onChange={(e) => handlePreviousEmploymentChange("monthsExperience", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="prev-company-name">Company Name</Label>
                <Select
                  value={data.previousEmployment?.companyName || ""}
                  onValueChange={(value) => handlePreviousEmploymentChange("companyName", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ubl">United Bank Limited</SelectItem>
                    <SelectItem value="hbl">Habib Bank Limited</SelectItem>
                    <SelectItem value="mcb">MCB Bank</SelectItem>
                    <SelectItem value="abbl">Allied Bank</SelectItem>
                    <SelectItem value="nbl">National Bank</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="prev-start-date">Start Date</Label>
                <Input
                  id="prev-start-date"
                  type="date"
                  value={data.previousEmployment?.startDate || ""}
                  onChange={(e) => handlePreviousEmploymentChange("startDate", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="prev-phone">Phone</Label>
                <Input
                  id="prev-phone"
                  placeholder="Enter phone number"
                  value={data.previousEmployment?.phone || ""}
                  onChange={(e) => handlePreviousEmploymentChange("phone", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="prev-other-company-name">Other Company Name</Label>
                <Input
                  id="prev-other-company-name"
                  placeholder="Enter company name if not listed"
                  value={data.previousEmployment?.otherCompanyName || ""}
                  onChange={(e) => handlePreviousEmploymentChange("otherCompanyName", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="prev-end-date">Previous End Date</Label>
                <Input
                  id="prev-end-date"
                  type="date"
                  value={data.previousEmployment?.previousEndDate || ""}
                  onChange={(e) => handlePreviousEmploymentChange("previousEndDate", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
