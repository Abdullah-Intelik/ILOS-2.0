"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { MapPin, Phone, Mail } from "lucide-react"
import type { ApplicantData } from "@/app/dashboard/applicant/auto/personalautoloans/page"

interface AddressContactStepProps {
  data: ApplicantData
  onChange: (data: ApplicantData) => void
}

export function AddressContactStep({ data, onChange }: AddressContactStepProps) {
  const handleCurrentAddressChange = (field: string, value: string) => {
    onChange({
      ...data,
      currentAddress: {
        ...data.currentAddress,
        [field]: value,
      },
    })
  }

  const handlePermanentAddressChange = (field: string, value: string | boolean) => {
    onChange({
      ...data,
      permanentAddress: {
        ...data.permanentAddress,
        [field]: value,
      },
    })
  }

  const handlePhoneEmailChange = (field: string, value: string) => {
    onChange({
      ...data,
      phoneEmail: {
        ...data.phoneEmail,
        [field]: value,
      },
    })
  }

  const handleSameAsCurrentChange = (checked: boolean) => {
    if (checked) {
      onChange({
        ...data,
        permanentAddress: {
          ...data.permanentAddress,
          sameAsCurrent: true,
          houseNo: data.currentAddress?.houseNo || "",
          street: data.currentAddress?.street || "",
          city: data.currentAddress?.city || "",
          state: data.currentAddress?.state || "",
          postCode: data.currentAddress?.postCode || "",
          country: data.currentAddress?.country || "",
        },
      })
    } else {
      handlePermanentAddressChange("sameAsCurrent", false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold">Address & Contact Information</h3>
        <p className="text-muted-foreground">Current and permanent address details with contact information</p>
      </div>

      <div className="space-y-6">
        {/* Current Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Current Address
            </CardTitle>
            <CardDescription>Your current residential address details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="current-house-no">House/Flat/Shop No. *</Label>
                <Input
                  id="current-house-no"
                  placeholder="Enter house/flat/shop number"
                  value={data.currentAddress?.houseNo || ""}
                  onChange={(e) => handleCurrentAddressChange("houseNo", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="current-street">Street</Label>
                <Input
                  id="current-street"
                  placeholder="Enter street name"
                  value={data.currentAddress?.street || ""}
                  onChange={(e) => handleCurrentAddressChange("street", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="current-area">Area</Label>
                <Select
                  value={data.currentAddress?.area || ""}
                  onValueChange={(value) => handleCurrentAddressChange("area", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select area" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gulshan-e-iqbal">Gulshan-e-Iqbal</SelectItem>
                    <SelectItem value="dha">DHA</SelectItem>
                    <SelectItem value="clifton">Clifton</SelectItem>
                    <SelectItem value="saddar">Saddar</SelectItem>
                    <SelectItem value="nazimabad">Nazimabad</SelectItem>
                    <SelectItem value="north-karachi">North Karachi</SelectItem>
                    <SelectItem value="malir">Malir</SelectItem>
                    <SelectItem value="korangi">Korangi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="current-city">City *</Label>
                <Select
                  value={data.currentAddress?.city || ""}
                  onValueChange={(value) => handleCurrentAddressChange("city", value)}
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
                    <SelectItem value="multan">Multan</SelectItem>
                    <SelectItem value="peshawar">Peshawar</SelectItem>
                    <SelectItem value="quetta">Quetta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="current-district">District</Label>
                <Select
                  value={data.currentAddress?.district || ""}
                  onValueChange={(value) => handleCurrentAddressChange("district", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="karachi-central">Karachi Central</SelectItem>
                    <SelectItem value="karachi-east">Karachi East</SelectItem>
                    <SelectItem value="karachi-south">Karachi South</SelectItem>
                    <SelectItem value="karachi-west">Karachi West</SelectItem>
                    <SelectItem value="lahore">Lahore</SelectItem>
                    <SelectItem value="islamabad">Islamabad</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="current-tehsil">Tehsil/District</Label>
                <Input
                  id="current-tehsil"
                  placeholder="Enter tehsil/district"
                  value={data.currentAddress?.tehsil || ""}
                  onChange={(e) => handleCurrentAddressChange("tehsil", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="current-state">State</Label>
                <Select
                  value={data.currentAddress?.state || ""}
                  onValueChange={(value) => handleCurrentAddressChange("state", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state/province" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sindh">Sindh</SelectItem>
                    <SelectItem value="punjab">Punjab</SelectItem>
                    <SelectItem value="kpk">Khyber Pakhtunkhwa</SelectItem>
                    <SelectItem value="balochistan">Balochistan</SelectItem>
                    <SelectItem value="gilgit-baltistan">Gilgit-Baltistan</SelectItem>
                    <SelectItem value="azad-kashmir">Azad Kashmir</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="current-post-code">Post Code</Label>
                <Input
                  id="current-post-code"
                  placeholder="Enter postal code"
                  value={data.currentAddress?.postCode || ""}
                  onChange={(e) => handleCurrentAddressChange("postCode", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="current-country">Country</Label>
                <Select
                  value={data.currentAddress?.country || ""}
                  onValueChange={(value) => handleCurrentAddressChange("country", value)}
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
                    <SelectItem value="canada">Canada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="residence-type">Residence Type/Nature</Label>
                <Select
                  value={data.currentAddress?.residenceType || ""}
                  onValueChange={(value) => handleCurrentAddressChange("residenceType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select residence type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owned">Owned</SelectItem>
                    <SelectItem value="rented">Rented</SelectItem>
                    <SelectItem value="family-owned">Family Owned</SelectItem>
                    <SelectItem value="company-provided">Company Provided</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="accommodation-type">Type of Accommodation</Label>
                <Select
                  value={data.currentAddress?.accommodationType || ""}
                  onValueChange={(value) => handleCurrentAddressChange("accommodationType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select accommodation type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="flat">Flat</SelectItem>
                    <SelectItem value="bungalow">Bungalow</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="nearest-landmark">Nearest Landmark</Label>
                <Input
                  id="nearest-landmark"
                  placeholder="Enter nearest landmark"
                  value={data.currentAddress?.nearestLandmark || ""}
                  onChange={(e) => handleCurrentAddressChange("nearestLandmark", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="residing-since">Residing Since (Years & Months)</Label>
                <Input
                  id="residing-since"
                  placeholder="e.g., 2 years 6 months"
                  value={data.currentAddress?.residingSince || ""}
                  onChange={(e) => handleCurrentAddressChange("residingSince", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="living-in-city">Living in City (Years & Months)</Label>
                <Input
                  id="living-in-city"
                  placeholder="e.g., 5 years 2 months"
                  value={data.currentAddress?.livingInCity || ""}
                  onChange={(e) => handleCurrentAddressChange("livingInCity", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="monthly-rent">Monthly Rent (if applicable)</Label>
                <Input
                  id="monthly-rent"
                  type="number"
                  placeholder="Enter monthly rent amount"
                  value={data.currentAddress?.monthlyRent || ""}
                  onChange={(e) => handleCurrentAddressChange("monthlyRent", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Permanent Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Permanent Address
            </CardTitle>
            <CardDescription>Your permanent address details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox
                id="same-as-current"
                checked={data.permanentAddress?.sameAsCurrent || false}
                onCheckedChange={handleSameAsCurrentChange}
              />
              <Label htmlFor="same-as-current">Same as Current Address</Label>
            </div>

            {!data.permanentAddress?.sameAsCurrent && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="permanent-house-no">House/Flat/Shop No.</Label>
                  <Input
                    id="permanent-house-no"
                    placeholder="Enter house/flat/shop number"
                    value={data.permanentAddress?.houseNo || ""}
                    onChange={(e) => handlePermanentAddressChange("houseNo", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="permanent-street">Street</Label>
                  <Input
                    id="permanent-street"
                    placeholder="Enter street name"
                    value={data.permanentAddress?.street || ""}
                    onChange={(e) => handlePermanentAddressChange("street", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="permanent-city">City</Label>
                  <Select
                    value={data.permanentAddress?.city || ""}
                    onValueChange={(value) => handlePermanentAddressChange("city", value)}
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
                      <SelectItem value="multan">Multan</SelectItem>
                      <SelectItem value="peshawar">Peshawar</SelectItem>
                      <SelectItem value="quetta">Quetta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="permanent-tehsil">Tehsil/District</Label>
                  <Input
                    id="permanent-tehsil"
                    placeholder="Enter tehsil/district"
                    value={data.permanentAddress?.tehsil || ""}
                    onChange={(e) => handlePermanentAddressChange("tehsil", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="permanent-address4">Address 4</Label>
                  <Input
                    id="permanent-address4"
                    placeholder="Additional address line"
                    value={data.permanentAddress?.address4 || ""}
                    onChange={(e) => handlePermanentAddressChange("address4", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="permanent-state">State</Label>
                  <Select
                    value={data.permanentAddress?.state || ""}
                    onValueChange={(value) => handlePermanentAddressChange("state", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state/province" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sindh">Sindh</SelectItem>
                      <SelectItem value="punjab">Punjab</SelectItem>
                      <SelectItem value="kpk">Khyber Pakhtunkhwa</SelectItem>
                      <SelectItem value="balochistan">Balochistan</SelectItem>
                      <SelectItem value="gilgit-baltistan">Gilgit-Baltistan</SelectItem>
                      <SelectItem value="azad-kashmir">Azad Kashmir</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="permanent-post-code">Post Code</Label>
                  <Input
                    id="permanent-post-code"
                    placeholder="Enter postal code"
                    value={data.permanentAddress?.postCode || ""}
                    onChange={(e) => handlePermanentAddressChange("postCode", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="permanent-country">Country</Label>
                  <Select
                    value={data.permanentAddress?.country || ""}
                    onValueChange={(value) => handlePermanentAddressChange("country", value)}
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
                      <SelectItem value="canada">Canada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Phone / Email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              <Mail className="h-5 w-5" />
              Phone / Email
            </CardTitle>
            <CardDescription>Contact information for communication</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone-current">Phone (Current)</Label>
                <Input
                  id="phone-current"
                  placeholder="Enter current phone number"
                  value={data.phoneEmail?.phoneCurrent || ""}
                  onChange={(e) => handlePhoneEmailChange("phoneCurrent", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="phone-permanent">Phone (Permanent)</Label>
                <Input
                  id="phone-permanent"
                  placeholder="Enter permanent phone number"
                  value={data.phoneEmail?.phonePermanent || ""}
                  onChange={(e) => handlePhoneEmailChange("phonePermanent", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="mobile">Mobile *</Label>
                <Input
                  id="mobile"
                  placeholder="Enter mobile number"
                  value={data.phoneEmail?.mobile || ""}
                  onChange={(e) => handlePhoneEmailChange("mobile", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={data.phoneEmail?.email || ""}
                  onChange={(e) => handlePhoneEmailChange("email", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
