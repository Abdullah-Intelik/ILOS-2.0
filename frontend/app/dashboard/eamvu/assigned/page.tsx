"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Search, Eye, Phone, MapPin, Calendar, User } from "lucide-react";

// Mock data for EAMVU applications
const applicationsData = [
  {
    id: "UBL-2024-001237",
    applicantName: "Aisha Khan",
    segment: "Preferred",
    loanType: "Personal Loan",
    amount: "PKR 1,800,000",
    status: "eamvu_agent_assigned",
    lastUpdate: "2024-01-16",
    assignedTo: "Bilal Khan",
    priority: "Medium",
    address: "House 456, Block B, Gulshan-e-Iqbal, Karachi",
    phone: "+92-300-1111111",
    assignmentDate: "2024-01-15",
    expectedVisitDate: "2024-01-18",
  },
  {
    id: "UBL-2024-001238",
    applicantName: "Omar Malik",
    segment: "SME",
    loanType: "Business Loan",
    amount: "PKR 3,500,000",
    status: "eamvu_agent_assigned",
    lastUpdate: "2024-01-17",
    assignedTo: "Sara Ahmed",
    priority: "High",
    address: "Office 123, Clifton Commercial Area, Karachi",
    phone: "+92-321-2222222",
    assignmentDate: "2024-01-16",
    expectedVisitDate: "2024-01-19",
  },
  {
    id: "UBL-2024-001239",
    applicantName: "Zara Ahmed",
    segment: "Mass",
    loanType: "Auto Loan",
    amount: "PKR 1,200,000",
    status: "eamvu_agent_assigned",
    lastUpdate: "2024-01-18",
    assignedTo: "Usman Ali",
    priority: "Low",
    address: "Flat 789, DHA Phase 3, Karachi",
    phone: "+92-333-3333333",
    assignmentDate: "2024-01-17",
    expectedVisitDate: "2024-01-20",
  },
];

function getStatusBadge(status: string) {
  switch (status) {
    case "eamvu_agent_assigned":
      return <Badge className="bg-yellow-100 text-yellow-800">Agent Assigned</Badge>
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

const AssignedApplications = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [applicationsData, setApplicationsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch applications from backend
  const fetchApplications = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/applications/department/EAMVU')
      if (!response.ok) throw new Error('Failed to fetch applications')
      const data = await response.json()
      
      // Transform data for assigned view - show only assigned applications
      const assignedApps = data.filter((app: any) => 
        app.status === 'ASSIGNED_TO_EAMVU_OFFICER' || 
        app.status === 'SUBMITTED_BY_SPU' ||
        app.status === 'SUBMITTED_BY_COPS'
      ).map((app: any) => ({
        ...app,
        id: app.los_id || `APP-${app.id}`,
        applicantName: app.applicant_name,
        loanType: app.loan_type,
        amount: `PKR ${app.loan_amount ? app.loan_amount.toLocaleString() : '0'}`,
        status: app.status === 'ASSIGNED_TO_EAMVU_OFFICER' ? 'eamvu_agent_assigned' : 'eamvu_new',
        assignedTo: app.status === 'ASSIGNED_TO_EAMVU_OFFICER' ? "EAMVU Officer" : "Unassigned",
        priority: app.priority || "Medium",
        lastUpdate: new Date(app.created_at).toISOString().split('T')[0],
        address: "Address not specified",
        phone: "+92-300-0000000",
        segment: app.loan_type.includes('Business') ? 'SME' : 'Preferred'
      }))
      
      setApplicationsData(assignedApps)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch applications')
      toast({ title: "Error", description: "Failed to fetch applications", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [])

  const filteredApplications = applicationsData.filter((app) =>
    (app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())) &&
    app.status === "eamvu_agent_assigned"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Assigned Applications</h2>
          <p className="text-muted-foreground">Applications with assigned field agents for verification</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchApplications} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assigned Applications ({filteredApplications.length})</CardTitle>
          <CardDescription>Applications with assigned field agents for verification</CardDescription>
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
                <TableHead>Assigned To</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Expected Visit</TableHead>
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
                  <TableCell>{getPriorityBadge(app.priority)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {app.expectedVisitDate}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedApplication(app)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>Application Details - {selectedApplication?.id}</DialogTitle>
                          <DialogDescription>
                            Detailed information about the assigned application
                          </DialogDescription>
                        </DialogHeader>

                        {selectedApplication && (
                          <div className="space-y-6">
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Applicant Information</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium">Applicant Name</Label>
                                    <p className="text-sm">{selectedApplication.applicantName}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Phone</Label>
                                    <p className="text-sm">{selectedApplication.phone}</p>
                                  </div>
                                  <div className="col-span-2">
                                    <Label className="text-sm font-medium">Address</Label>
                                    <p className="text-sm flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      {selectedApplication.address}
                                    </p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Loan Type</Label>
                                    <p className="text-sm">{selectedApplication.loanType}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Amount</Label>
                                    <p className="text-sm">{selectedApplication.amount}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Priority</Label>
                                    <div className="mt-1">{getPriorityBadge(selectedApplication.priority)}</div>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Status</Label>
                                    <div className="mt-1">{getStatusBadge(selectedApplication.status)}</div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Assignment Details</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium">Assigned To</Label>
                                    <p className="text-sm flex items-center gap-1">
                                      <User className="h-3 w-3" />
                                      {selectedApplication.assignedTo}
                                    </p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Assignment Date</Label>
                                    <p className="text-sm flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {selectedApplication.assignmentDate}
                                    </p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Expected Visit Date</Label>
                                    <p className="text-sm flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {selectedApplication.expectedVisitDate}
                                    </p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Last Updated</Label>
                                    <p className="text-sm flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {selectedApplication.lastUpdate}
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Field Agent Contact</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium">Agent Name</Label>
                                    <p className="text-sm">{selectedApplication.assignedTo}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Contact</Label>
                                    <p className="text-sm">+92-300-1234567</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Area</Label>
                                    <p className="text-sm">Karachi Central</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Status</Label>
                                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
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

export default AssignedApplications;
