"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, User, CreditCard } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCustomer } from "@/contexts/CustomerContext"

export default function ApplicantPage() {
  const [cnic, setCnic] = useState("35201-1111222-1")
  const [product, setProduct] = useState("")
  const [subOption, setSubOption] = useState("")
  const [cnicEntered, setCnicEntered] = useState(false)
  const [accountType, setAccountType] = useState("")
  const [selectedAccount, setSelectedAccount] = useState("")
  const router = useRouter()
  const { customerData, loading, error, fetchCustomerData, clearCustomerData } = useCustomer()

  // Define if account type is required for the selected product
  const requireAccountType = false // Set to true if you want to require account type for any product

  // Add your account dropdowns
  const conventionalOptions = ["Personal", "Business"]
  const islamicOptions = ["Ameen Personal", "Ameen Business"]

  // Format CNIC input
  const formatCNIC = (value: string) => {
    const cleaned = value.replace(/[^0-9]/g, '')
    if (cleaned.length <= 5) return cleaned
    if (cleaned.length <= 12) return cleaned.slice(0, 5) + '-' + cleaned.slice(5)
    return cleaned.slice(0, 5) + '-' + cleaned.slice(5, 12) + '-' + cleaned.slice(12, 13)
  }

  const handleCnicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCNIC(e.target.value)
    setCnic(formatted)
    setCnicEntered(false)
  }

  const handleCnicSubmit = async () => {
    if (cnic.length === 15) {
      setCnicEntered(true)
      await fetchCustomerData(cnic)
    }
  }

  const handleReset = () => {
    setCnic("")
    setProduct("")
    setSubOption("")
    setAccountType("")
    setSelectedAccount("")
    setCnicEntered(false)
    clearCustomerData()
  }

  // Reset product when account type changes
  const handleAccountTypeChange = (type: string) => {
    setAccountType(type)
    setProduct("")
    setSubOption("")
  }

  // Next button action
  const handleNext = () => {
    if (!cnic || !product || !customerData) return
    let url = `/dashboard/applicant/${product.toLowerCase()}`
    
    // Handle different product routing
    if (product === "auto" && subOption) {
      url += `/${subOption.toLowerCase().replace(/\s/g, "-")}`
    } else if (product === "creditcard" && subOption) {
      url += `/${subOption.toLowerCase().replace(/\s/g, "-")}`
    } else if (product === "smecommercial") {
      url = `/dashboard/applicant/auto/sme-vehicles` // Route to commercial vehicle form
    } else if (product === "smeasaan") {
      url = `/dashboard/applicant/auto/sme-asaan` // Route to SME Asaan form
    }
    
    // Add accountType and selectedAccount to url if needed, or to global state/context
    router.push(url)
  }

  // Auto-fetch when CNIC is complete
  useEffect(() => {
    if (cnic.length === 15 && !cnicEntered) {
      handleCnicSubmit()
    }
  }, [cnic, cnicEntered])

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">New Applicant Intake</h2>
        <p className="text-muted-foreground">Enter your CNIC and choose your preferred product</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Start Application</CardTitle>
          <CardDescription>Begin by entering applicant details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* CNIC Field */}
          <div>
            <label className="block text-sm font-medium mb-1">CNIC No.</label>
            <input
              type="text"
              placeholder="e.g. 1234512345671"
              className="w-full rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-gray-50 px-4 py-2 text-base shadow transition placeholder:text-gray-400"
              value={cnic}
              // value={"15402-8687203-9"}
              onChange={handleCnicChange}
              maxLength={15}
            />
            {loading && (
              <div className="text-sm text-blue-600 mt-1 flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                Fetching customer data...
              </div>
            )}
            {error && (
              <div className="text-sm text-red-600 mt-1">{error}</div>
            )}
          </div>

          {/* Customer Info Display */}
          {customerData && (
            <>
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    {customerData.isETB ? (
                      <User className="w-5 h-5 text-green-600" />
                    ) : (
                      <CreditCard className="w-5 h-5 text-blue-600" />
                    )}
                    <div>
                      <div className="font-semibold text-lg">
                        {customerData.isETB ? 'Existing Customer' : 'New Customer'}
                      </div>
                      <div className="text-sm text-gray-600">Customer ID: {customerData.customerId}</div>
                    </div>
                  </div>
                  {customerData.personalDetails && (
                    <div className="space-y-2 text-sm">
                      {customerData.personalDetails.fullName && (
                        <div><span className="font-medium">Name:</span> {customerData.personalDetails.fullName}</div>
                      )}
                      {customerData.personalDetails.fatherName && (
                        <div><span className="font-medium">Father's Name:</span> {customerData.personalDetails.fatherName}</div>
                      )}
                      {customerData.personalDetails.dateOfBirth && (
                        <div><span className="font-medium">Date of Birth:</span> {new Date(customerData.personalDetails.dateOfBirth).toLocaleDateString()}</div>
                      )}
                      {customerData.personalDetails.mobileNumber && (
                        <div><span className="font-medium">Mobile:</span> {customerData.personalDetails.mobileNumber}</div>
                      )}
                      {customerData.personalDetails.email && (
                        <div><span className="font-medium">Email:</span> {customerData.personalDetails.email}</div>
                      )}
                      {customerData.addressDetails?.currentAddress?.fullAddress && (
                        <div><span className="font-medium">Address:</span> {customerData.addressDetails.currentAddress.fullAddress}</div>
                      )}
                    </div>
                  )}
                  <div className="mt-3 flex justify-between items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      customerData.isETB 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {customerData.isETB ? 'Data will be pre-filled' : 'Manual data entry required'}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleReset}
                      className="text-xs"
                    >
                      Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* --- BEAUTIFUL BUTTONS + DROPDOWN HERE --- */}
              <div className="flex gap-4 mt-6 justify-center">
                <Button
                  type="button"
                  variant={accountType === "conventional" ? "default" : "outline"}
                  className={`w-1/4 px-6 py-2 rounded-lg text-base shadow ${accountType === "conventional" ? " text-white" : ""}`}
                  onClick={() => handleAccountTypeChange("conventional")}
                >
                  Conventional
                </Button>
                <Button
                  type="button"
                  variant={accountType === "islamic" ? "default" : "outline"}
                  className={`w-1/4 px-6 py-2 rounded-lg text-base shadow ${accountType === "islamic" ? " text-white" : ""}`}
                  onClick={() => handleAccountTypeChange("islamic")}
                >
                  Islamic
                </Button>
              </div>
              {/* {accountType && (
                <div className="mt-5">
                  <label className="block text-sm font-medium mb-1">
                    {accountType === "conventional" ? "Conventional Account Type" : "Islamic Account Type"}
                  </label>
                  <select
                    className="w-full rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-gray-50 px-4 py-2 text-base shadow transition"
                    value={selectedAccount}
                    onChange={e => setSelectedAccount(e.target.value)}
                  >
                    <option value="">Select...</option>
                    {(accountType === "conventional" ? conventionalOptions : islamicOptions).map(opt => (
                      <option value={opt} key={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              )} */}
            </>
          )}

          {/* Product Dropdown */}
          <div>
            <label className="block text-sm font-medium mb-1">Choose Product</label>
            <select
              className="w-full rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-gray-50 px-4 py-2 text-base shadow transition"
              value={product}
              onChange={e => {
                setProduct(e.target.value)
                setSubOption("")
              }}
              disabled={!accountType}
            >
              <option value="">{accountType ? "Select..." : "Please select account type first"}</option>
              {accountType === "conventional" && (
                <>
                  <option value="cashplus">Cashplus</option>
                  <option value="auto">Auto Loan</option>
                  <option value="creditcard">Credit Card</option>
                </>
              )}
              {accountType === "islamic" && (
                <>
                  <option value="ameendrive">Ameen Drive</option>
                  <option value="smecommercial">SME Commercial Vehicle</option>
                  <option value="smeasaan">SME Asaan</option>
                </>
              )}
            </select>
          </div>

          {/* Conditional sub-dropdowns */}
          {product === "auto" && accountType === "conventional" && (
            <div>
              <label className="block text-sm font-medium mb-1">Auto Subtype</label>
              <select
                className="w-full rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-gray-50 px-4 py-2 text-base shadow transition"
                value={subOption}
                onChange={e => setSubOption(e.target.value)}
              >
                <option value="">Select...</option>
                <option value="PersonalAutoloans">Personal Auto's</option>
              </select>
            </div>
          )}

          {product === "creditcard" && accountType === "conventional" && (
            <div>
              <label className="block text-sm font-medium mb-2">Credit Card Type</label>
              <select
                className="w-full rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-gray-50 px-4 py-2 text-base shadow transition"
                value={subOption}
                onChange={e => setSubOption(e.target.value)}
              >
                <option value="">Select...</option>
                <option value="Credit Card">Classic Credit Card</option>
                <option value="Platinum Credit Card">Platinum Credit Card</option>
              </select>
            </div>
          )}

          {/* Next Button */}
            <Button
            className="w-full mt-4"
            disabled={
              !cnic ||
              !product ||
              !customerData ||
              loading ||
              !accountType ||
              ((product === "auto" || product === "creditcard") && accountType === "conventional" && !subOption) ||
              (requireAccountType && (!accountType || !selectedAccount))
            }
            onClick={handleNext}
            type="button"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Loading...
              </>
            ) : (
              <>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
              </Button>
              
          {/* Help text for Next button */}
          {!accountType && customerData && (
            <div className="text-sm text-gray-600 mt-2 text-center">
              Please select an account type (Conventional or Islamic) to see available products
            </div>
          )}
          {!customerData && cnic.length === 15 && !loading && (
            <div className="text-sm text-gray-600 mt-2 text-center">
              Please wait for customer data to load before proceeding
            </div>
          )}
          {!customerData && cnic.length < 15 && cnic.length > 0 && (
            <div className="text-sm text-gray-600 mt-2 text-center">
              Please enter a complete CNIC (15 digits with dashes)
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
