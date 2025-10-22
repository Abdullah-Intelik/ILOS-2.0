"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Users, MapPin, Phone } from "lucide-react";

// Mock data for EAMVU applications
const applicationsData = [
  {
    id: "UBL-2024-001234",
    applicantName: "Muhammad Ali Khan",
    segment: "Preferred",
    loanType: "Personal Loan",
    amount: "PKR 2,500,000",
    status: "eamvu_new",
    lastUpdate: "2024-01-15",
    assignedTo: "Unassigned",
    priority: "High",
    address: "House 123, Block A, Gulshan-e-Iqbal, Karachi",
    phone: "+92-300-1234567",
  },
  {
    id: "UBL-2024-001235",
    applicantName: "Fatima Ahmed",
    segment: "Mass",
    loanType: "Auto Loan",
    amount: "PKR 800,000",
    status: "eamvu_new",
    lastUpdate: "2024-01-14",
    assignedTo: "Unassigned",
    priority: "Medium",
    address: "Flat 456, DHA Phase 2, Karachi",
    phone: "+92-321-9876543",
  },
  {
    id: "UBL-2024-001236",
    applicantName: "Hassan Raza",
    segment: "SME",
    loanType: "Business Loan",
    amount: "PKR 5,000,000",
    status: "eamvu_new",
    lastUpdate: "2024-01-13",
    assignedTo: "Unassigned",
    priority: "High",
    address: "Office 789, Clifton Commercial Area, Karachi",
    phone: "+92-333-5555555",
  },
];

// Field agents data
const fieldAgentsData = [
  {
    id: "agent1",
    name: "Bilal Khan",
    phone: "+92-300-1111111",
    area: "Karachi Central",
    activeAssignments: 2,
    completedVisits: 15,
    status: "active",
  },
  {
    id: "agent2",
    name: "Sara Ahmed",
    phone: "+92-321-2222222",
    area: "Karachi South",
    activeAssignments: 1,
    completedVisits: 23,
    status: "active",
  },
  {
    id: "agent3",
    name: "Usman Ali",
    phone: "+92-333-3333333",
    area: "Karachi East",
    activeAssignments: 0,
    completedVisits: 18,
    status: "active",
  },
];

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

function getAgentStatusBadge(status: string) {
  const statusConfig: Record<string, { variant: "default" | "destructive" | "outline" | "secondary", label: string }> = {
    "active": { variant: "default", label: "Active" },
    "inactive": { variant: "outline", label: "Inactive" },
    "on_leave": { variant: "secondary", label: "On Leave" },
  }

  const config = statusConfig[status] || { variant: "outline", label: status }

  return <Badge variant={config.variant}>{config.label}</Badge>
}

const NewApplications = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
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
      
      // Transform data for new applications view - show only new/recent applications
      const newApps = data.filter((app: any) => 
        app.status === 'SUBMITTED_BY_SPU' || 
        app.status === 'PB_SUBMITTED'
      ).map((app: any) => ({
        ...app,
        id: app.los_id || `APP-${app.id}`,
        applicantName: app.applicant_name,
        loanType: app.loan_type,
        amount: `PKR ${app.loan_amount ? app.loan_amount.toLocaleString() : '0'}`,
        priority: app.priority || "Medium",
        submittedDate: new Date(app.created_at).toISOString().split('T')[0],
        lastUpdate: new Date(app.created_at).toISOString().split('T')[0]
      }))
      
      setApplicationsData(newApps)
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
    app.id.toLowerCase().includes(searchTerm.toLowerCase())) &&
    app.status === "eamvu_new"
  );

  const handleAssignAgent = () => {
    if (selectedApplication && selectedAgent) {
      // Update application status logic would go here
      toast({
        title: "Agent Assigned",
        description: `${selectedAgent.name} has been assigned to ${selectedApplication.applicantName}`,
      });
      setSelectedApplication(null);
      setSelectedAgent(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">New Applications</h2>
          <p className="text-muted-foreground">Applications awaiting field agent assignment</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Applications ({filteredApplications.length})</CardTitle>
          <CardDescription>Applications requiring field agent assignment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or LOS ID..."
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
                <TableHead>Priority</TableHead>
                <TableHead>Address</TableHead>
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
                  <TableCell>{getPriorityBadge(app.priority)}</TableCell>
                  <TableCell>
                    <div className="max-w-[200px] truncate flex items-center gap-1" title={app.address}>
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      {app.address}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button onClick={() => setSelectedApplication(app)}>
                          Assign Agent
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>Assign Field Agent - {selectedApplication?.id}</DialogTitle>
                          <DialogDescription>
                            Assign a field agent to verify the applicant's details
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
                                    <p className="text-sm">{selectedApplication.address}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Loan Type</Label>
                                    <p className="text-sm">{selectedApplication.loanType}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Amount</Label>
                                    <p className="text-sm">{selectedApplication.amount}</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Available Field Agents</CardTitle>
                                <CardDescription>
                                  Select an agent to assign for this verification
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Name</TableHead>
                                      <TableHead>Area</TableHead>
                                      <TableHead>Active Assignments</TableHead>
                                      <TableHead>Status</TableHead>
                                      <TableHead className="text-right">Select</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {fieldAgentsData
                                      .filter(agent => agent.status === "active")
                                      .map((agent) => (
                                        <TableRow 
                                          key={agent.id} 
                                          className={selectedAgent?.id === agent.id ? "bg-muted" : ""}
                                        >
                                          <TableCell>
                                            <div>
                                              <div className="font-medium">{agent.name}</div>
                                              <div className="text-sm text-muted-foreground">{agent.phone}</div>
                                            </div>
                                          </TableCell>
                                          <TableCell>{agent.area}</TableCell>
                                          <TableCell>{agent.activeAssignments}</TableCell>
                                          <TableCell>{getAgentStatusBadge(agent.status)}</TableCell>
                                          <TableCell className="text-right">
                                            <Button 
                                              variant={selectedAgent?.id === agent.id ? "default" : "outline"}
                                              size="sm"
                                              onClick={() => setSelectedAgent(agent)}
                                            >
                                              {selectedAgent?.id === agent.id ? "Selected" : "Select"}
                                            </Button>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                  </TableBody>
                                </Table>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Assignment Notes</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <Textarea 
                                  placeholder="Add any notes or instructions for the field agent..."
                                />
                              </CardContent>
                            </Card>

                            <DialogFooter>
                              <Button variant="outline" onClick={() => {
                                setSelectedApplication(null)
                                setSelectedAgent(null)
                              }}>
                                Cancel
                              </Button>
                              <Button 
                                onClick={handleAssignAgent}
                                disabled={!selectedAgent}
                              >
                                Assign Agent
                              </Button>
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

export default NewApplications;
