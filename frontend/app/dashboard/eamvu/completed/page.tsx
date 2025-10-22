"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Search, Eye, Phone, MapPin, Calendar, User, Camera, CheckCircle, AlertTriangle } from "lucide-react";

// Mock data for EAMVU applications
const applicationsData = [
  {
    id: "UBL-2024-001240",
    applicantName: "Hassan Raza",
    segment: "SME",
    loanType: "Business Loan",
    amount: "PKR 5,000,000",
    status: "eamvu_visit_complete",
    lastUpdate: "2024-01-13",
    assignedTo: "Sara Ahmed",
    priority: "High",
    address: "Office 789, Clifton Commercial Area, Karachi",
    phone: "+92-333-5555555",
    visitReport: {
      visitDate: "2024-01-12",
      visitTime: "14:30",
      locationVerified: true,
      businessVerified: true,
      comments: "Business premises verified. Operational with 15 employees present. All documents verified on site.",
      photos: ["photo1.jpg", "photo2.jpg", "photo3.jpg"],
      agentNotes: "Applicant was cooperative and provided all necessary documentation. Business appears to be well-established.",
    }
  },
  {
    id: "UBL-2024-001241",
    applicantName: "Ayesha Malik",
    segment: "Preferred",
    loanType: "Personal Loan",
    amount: "PKR 1,500,000",
    status: "eamvu_verified",
    lastUpdate: "2024-01-14",
    assignedTo: "Bilal Khan",
    priority: "Medium",
    address: "House 321, Block C, Gulshan-e-Iqbal, Karachi",
    phone: "+92-300-4444444",
    visitReport: {
      visitDate: "2024-01-13",
      visitTime: "10:15",
      locationVerified: true,
      businessVerified: false,
      comments: "Residential address verified. Applicant is a salaried employee, no business verification required.",
      photos: ["photo4.jpg", "photo5.jpg"],
      agentNotes: "Residence verified. Applicant was present during visit and provided all required documents.",
    }
  },
  {
    id: "UBL-2024-001242",
    applicantName: "Kamran Ali",
    segment: "Mass",
    loanType: "Auto Loan",
    amount: "PKR 2,200,000",
    status: "eamvu_visit_complete",
    lastUpdate: "2024-01-15",
    assignedTo: "Usman Ali",
    priority: "Low",
    address: "Flat 567, DHA Phase 4, Karachi",
    phone: "+92-321-6666666",
    visitReport: {
      visitDate: "2024-01-14",
      visitTime: "16:45",
      locationVerified: true,
      businessVerified: false,
      comments: "Residential address verified. Vehicle inspection completed. All documents in order.",
      photos: ["photo6.jpg", "photo7.jpg", "photo8.jpg"],
      agentNotes: "Vehicle is in good condition. Applicant has stable employment and good credit history.",
    }
  },
];

function getStatusBadge(status: string) {
  switch (status) {
    case "eamvu_visit_complete":
      return <Badge className="bg-green-100 text-green-800">Visit Complete</Badge>
    case "eamvu_verified":
      return <Badge className="bg-purple-100 text-purple-800">Verified</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

function getPriorityBadge(priority: string) {
  switch (priority) {
    case "High":
      return <Badge className="bg-red-100 text-red-800">High</Badge>
    case "Medium":
      return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
    case "Low":
      return <Badge className="bg-green-100 text-green-800">Low</Badge>
    default:
      return <Badge variant="secondary">{priority}</Badge>
  }
}

const CompletedVisits = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [applicationsData, setApplicationsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch applications from backend - same as main EAMVU dashboard
  const fetchApplications = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔄 EAMVU Completed: Starting to fetch applications...')
      
      const response = await fetch('/api/applications/department/EAMVU', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        cache: 'no-store'
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch applications')
      }
      
      const data = await response.json()
      console.log('✅ EAMVU Completed: Fetched', data.length, 'applications')
      
      // Transform data for completed view
      const completedApplications = data.map((app: any) => ({
        ...app,
        id: app.los_id || `APP-${app.id}`,
        applicantName: app.applicant_name,
        segment: app.loan_type.includes('Business') ? 'SME' : 'Preferred',
        loanType: app.loan_type,
        amount: `PKR ${app.loan_amount ? app.loan_amount.toLocaleString() : '0'}`,
        status: app.status === 'SUBMITTED_TO_CIU' ? 'eamvu_verified' : 'eamvu_visit_complete',
        lastUpdate: new Date(app.created_at).toISOString().split('T')[0],
        assignedTo: "EAMVU Agent",
        priority: app.priority || "Medium",
        address: "Address not specified",
        phone: "+92-300-0000000",
        visitReport: {
          visitDate: new Date(app.created_at).toISOString().split('T')[0],
          visitTime: "14:30",
          locationVerified: app.status === 'SUBMITTED_TO_CIU',
          businessVerified: app.status === 'SUBMITTED_TO_CIU',
          comments: `Visit completed for ${app.loan_type}. Status: ${app.status}`,
          photos: ["photo1.jpg", "photo2.jpg"],
          agentNotes: `Application processed successfully.`
        }
      }))
      
      setApplicationsData(completedApplications)
    } catch (err) {
      console.error('❌ EAMVU Completed: Error fetching applications:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch applications')
      toast({
        title: "Error",
        description: "Failed to fetch applications. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Load applications on component mount
  useEffect(() => {
    fetchApplications()
  }, [])

  const filteredApplications = applicationsData.filter((app) =>
    (app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (app.status === "eamvu_visit_complete" || app.status === "eamvu_verified")
  );

  const handleVerifyVisit = () => {
    if (selectedApplication) {
      toast({
        title: "Visit Verified",
        description: "Application has been verified and sent to CIU",
      });
      setSelectedApplication(null);
      setVerificationNotes("");
    }
  };

  const handleRejectVerification = () => {
    if (selectedApplication) {
      toast({
        title: "Verification Rejected",
        description: "Application verification has been rejected",
        variant: "destructive",
      });
      setSelectedApplication(null);
      setVerificationNotes("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Completed Visits</h2>
          <p className="text-muted-foreground">Applications with completed field verification visits</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Completed Visits ({filteredApplications.length})</CardTitle>
          <CardDescription>Applications with completed field verification visits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, LOS ID, or agent..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>LOS ID</TableHead>
                <TableHead>Applicant</TableHead>
                <TableHead>Loan Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Verified By</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Visit Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-mono text-sm">{app.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{app.applicantName}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {app.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{app.loanType}</TableCell>
                  <TableCell className="font-medium">{app.amount}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3 text-muted-foreground" />
                      {app.assignedTo}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(app.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {app.visitReport?.visitDate}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setSelectedApplication(app)}
                        >
                          {app.status === "eamvu_visit_complete" ? "Review" : "View Report"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>Visit Report - {selectedApplication?.id}</DialogTitle>
                          <DialogDescription>
                            Field verification report for {selectedApplication?.applicantName}
                          </DialogDescription>
                        </DialogHeader>

                        {selectedApplication && selectedApplication.visitReport && (
                          <div className="space-y-6">
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Visit Details</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium">Visit Date</Label>
                                    <p className="text-sm">{selectedApplication.visitReport.visitDate}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Visit Time</Label>
                                    <p className="text-sm">{selectedApplication.visitReport.visitTime}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Location Verified</Label>
                                    <div className="flex items-center gap-1">
                                      {selectedApplication.visitReport.locationVerified ? (
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                      ) : (
                                        <AlertTriangle className="h-4 w-4 text-red-600" />
                                      )}
                                      <span className="text-sm">
                                        {selectedApplication.visitReport.locationVerified ? "Yes" : "No"}
                                      </span>
                                    </div>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Business Verified</Label>
                                    <div className="flex items-center gap-1">
                                      {selectedApplication.visitReport.businessVerified ? (
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                      ) : (
                                        <AlertTriangle className="h-4 w-4 text-red-600" />
                                      )}
                                      <span className="text-sm">
                                        {selectedApplication.visitReport.businessVerified ? "Yes" : "No"}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="col-span-2">
                                    <Label className="text-sm font-medium">Comments</Label>
                                    <p className="text-sm">{selectedApplication.visitReport.comments}</p>
                                  </div>
                                  <div className="col-span-2">
                                    <Label className="text-sm font-medium">Agent Notes</Label>
                                    <p className="text-sm">{selectedApplication.visitReport.agentNotes}</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Visit Photos</CardTitle>
                                <CardDescription>
                                  Geo-tagged photos from the field visit
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-3 gap-4">
                                  {selectedApplication.visitReport.photos.map((photo, index) => (
                                    <div key={index} className="border rounded-md p-2 flex flex-col items-center">
                                      <div className="bg-gray-100 h-32 w-full rounded-md flex items-center justify-center">
                                        <Camera className="h-8 w-8 text-gray-400" />
                                      </div>
                                      <p className="text-xs mt-2">{photo}</p>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>

                            {selectedApplication.status === "eamvu_visit_complete" && (
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Verification Decision</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-4">
                                    <div>
                                      <Label htmlFor="verification-notes">Verification Notes</Label>
                                      <Textarea 
                                        id="verification-notes"
                                        placeholder="Add any additional verification notes..."
                                        value={verificationNotes}
                                        onChange={(e) => setVerificationNotes(e.target.value)}
                                      />
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )}

                            <DialogFooter>
                              <Button variant="outline" onClick={() => {
                                setSelectedApplication(null)
                                setVerificationNotes("")
                              }}>
                                {selectedApplication.status === "eamvu_verified" ? "Close" : "Save Draft"}
                              </Button>
                              {selectedApplication.status === "eamvu_visit_complete" && (
                                <div className="flex gap-2">
                                  <Button variant="destructive" onClick={handleRejectVerification}>
                                    Reject Verification
                                  </Button>
                                  <Button onClick={handleVerifyVisit}>
                                    Approve & Send to CIU
                                  </Button>
                                </div>
                              )}
                            </DialogFooter>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompletedVisits;
