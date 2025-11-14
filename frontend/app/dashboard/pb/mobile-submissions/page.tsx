"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Smartphone, Eye, CheckCircle, FileText, RefreshCw, X } from "lucide-react"
import axios from 'axios'

interface MobileSubmission {
  losId: number
  loanType: string
  cnic: string
  customerName: string
  amount: number
  purpose: string
  submittedAt: string
  hasDocuments: boolean
  productType: string
}

export default function MobileSubmissionsComponent() {
  const [loading, setLoading] = useState(false)
  const [submissions, setSubmissions] = useState<MobileSubmission[]>([])
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [loadingDetails, setLoadingDetails] = useState(false)

  const fetchSubmissions = async () => {
    setLoading(true)
    try {
      const response = await axios.get('http://localhost:5000/api/v1/applications/mobile-submissions')
      if (response.data.success) {
        setSubmissions(response.data.applications)
      }
    } catch (error) {
      console.error('Error fetching mobile submissions:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubmissions()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchSubmissions, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleViewSubmission = async (losId: number) => {
    setLoadingDetails(true)
    setViewModalOpen(true)
    try {
      const response = await axios.get(`http://localhost:5000/api/v1/applications/${losId}`)
      if (response.data.success) {
        setSelectedSubmission(response.data.data || response.data.application)
      }
    } catch (error) {
      console.error('Error fetching submission details:', error)
      setViewModalOpen(false)
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleCompleteApplication = (losId: number, productType: string) => {
    // Map product types to their form routes
    const productRoutes: Record<string, string> = {
      'CASHPLUS': '/dashboard/applicant/cashplus',
      'cashplus_applications': '/dashboard/applicant/cashplus',
      'cashplus': '/dashboard/applicant/cashplus',
      'AUTOLOAN': '/dashboard/applicant/auto/personalautoloans',
      'autoloan_applications': '/dashboard/applicant/auto/personalautoloans',
      'autoloan': '/dashboard/applicant/auto/personalautoloans',
      'SMEASAAN': '/dashboard/applicant/auto/sme-asaan',
      'smeasaan_applications': '/dashboard/applicant/auto/sme-asaan',
      'smeasaan': '/dashboard/applicant/auto/sme-asaan',
      'AMEENDRIVE': '/dashboard/applicant/ameendrive',
      'ameendrive_applications': '/dashboard/applicant/ameendrive',
      'ameendrive': '/dashboard/applicant/ameendrive',
      'COMMERCIALVEHICLE': '/dashboard/applicant/auto/sme-vehicles',
      'commercial_vehicle_applications': '/dashboard/applicant/auto/sme-vehicles',
      'commercialvehicle': '/dashboard/applicant/auto/sme-vehicles',
      'PLATINUMCREDITCARD': '/dashboard/applicant/creditcard/platinum-credit-card',
      'platinum_card_applications': '/dashboard/applicant/creditcard/platinum-credit-card',
      'platinumcreditcard': '/dashboard/applicant/creditcard/platinum-credit-card',
      'CLASSICCREDITCARD': '/dashboard/applicant/creditcard/credit-card',
      'classic_card_applications': '/dashboard/applicant/creditcard/credit-card',
      'classiccreditcard': '/dashboard/applicant/creditcard/credit-card',
      'INSTANTLOAN': '/dashboard/applicant/cashplus', // InstantLoan uses same form as CashPlus
      'instantloan_applications': '/dashboard/applicant/cashplus',
      'instantloan': '/dashboard/applicant/cashplus',
      'instant_loan': '/dashboard/applicant/cashplus',
    }

    // Normalize product type (remove spaces, lowercase)
    const normalizedProductType = productType?.replace(/\s+/g, '').toLowerCase() || ''
    
    // Get the route for this product type (case-insensitive)
    const productKey = Object.keys(productRoutes).find(
      key => key.toLowerCase() === normalizedProductType
    )
    
    const route = productKey ? productRoutes[productKey] : null
    
    if (route) {
      // Navigate to product-specific form with mobile submission data (same tab)
      window.location.href = `${route}?losId=${losId}&fromMobile=true`
    } else {
      console.error('Unknown product type:', productType, '(normalized:', normalizedProductType, ')')
      alert(`Unknown product type: ${productType}. Please contact support.`)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-blue-600" />
            <div>
              <CardTitle>📱 Mobile App Submissions</CardTitle>
              <CardDescription>
                Applications submitted from mobile app awaiting completion
              </CardDescription>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchSubmissions}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading && submissions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading mobile submissions...
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-8">
            <Smartphone className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-muted-foreground">No mobile submissions pending</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>LOS ID</TableHead>
                <TableHead>Product Type</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>CNIC</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Documents</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((submission) => (
                <TableRow key={submission.losId}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono">
                        LOS-{submission.losId}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-blue-100 text-blue-800">
                      {submission.productType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{submission.customerName}</div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {submission.cnic}
                  </TableCell>
                  <TableCell className="font-medium">
                    {submission.amount ? formatCurrency(submission.amount) : 'N/A'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(submission.submittedAt)}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={submission.hasDocuments ? "default" : "destructive"}
                      className={submission.hasDocuments ? "bg-green-100 text-green-800" : ""}
                    >
                      {submission.hasDocuments ? (
                        <>
                          <FileText className="h-3 w-3 mr-1" />
                          Available
                        </>
                      ) : (
                        'Missing'
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewSubmission(submission.losId)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleCompleteApplication(submission.losId, submission.productType)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Complete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        
        {submissions.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground">
            Total: {submissions.length} mobile submission{submissions.length !== 1 ? 's' : ''} pending completion
          </div>
        )}
      </CardContent>
    </Card>

    {/* View Details Modal */}
    <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>📱 Mobile Submission Details</DialogTitle>
          <DialogDescription>
            LOS-{selectedSubmission?.losId} | {selectedSubmission?.loanType}
          </DialogDescription>
        </DialogHeader>

        {loadingDetails ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : selectedSubmission ? (
          <div className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Application ID</p>
                <p className="font-semibold">LOS-{selectedSubmission.losId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">CNIC</p>
                <p className="font-mono">{selectedSubmission.cnic}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge>{selectedSubmission.status}</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Submitted At</p>
                <p className="text-sm">{new Date(selectedSubmission.submittedAt).toLocaleString()}</p>
              </div>
            </div>

            {/* Mobile Submission Data */}
            {selectedSubmission.mobileData && (
              <div>
                <h3 className="font-semibold mb-2">Application Data</h3>
                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="text-xs whitespace-pre-wrap">
                    {JSON.stringify(selectedSubmission.mobileData, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Documents */}
            {selectedSubmission.mobileDocuments && (
              <div>
                <h3 className="font-semibold mb-2">📎 Documents</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {selectedSubmission.mobileDocuments.cnic && (
                    <div className="mb-2">
                      <Badge variant="outline" className="bg-green-50">
                        <FileText className="h-3 w-3 mr-1" />
                        CNIC
                      </Badge>
                      {selectedSubmission.mobileDocuments.cnic.serverUrl && (
                        <a 
                          href={`http://localhost:8086${selectedSubmission.mobileDocuments.cnic.serverUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-sm text-blue-600 hover:underline"
                        >
                          View Document
                        </a>
                      )}
                    </div>
                  )}
                  {selectedSubmission.mobileDocuments.salarySlip && (
                    <div>
                      <Badge variant="outline" className="bg-green-50">
                        <FileText className="h-3 w-3 mr-1" />
                        Salary Slip
                      </Badge>
                      {selectedSubmission.mobileDocuments.salarySlip.serverUrl && (
                        <a 
                          href={`http://localhost:8086${selectedSubmission.mobileDocuments.salarySlip.serverUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-sm text-blue-600 hover:underline"
                        >
                          View Document
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setViewModalOpen(false)}>
                Close
              </Button>
              <Button onClick={() => {
                setViewModalOpen(false)
                handleCompleteApplication(selectedSubmission.losId, selectedSubmission.loanType)
              }}>
                <CheckCircle className="h-4 w-4 mr-1" />
                Complete Application
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            No data available
          </div>
        )}
      </DialogContent>
    </Dialog>
  </>
  )
}

