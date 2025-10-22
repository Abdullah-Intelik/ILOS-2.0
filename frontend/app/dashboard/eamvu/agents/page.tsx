"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Users, Phone, MapPin, MoreHorizontal, Plus, Edit, Eye, UserCheck, UserX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Field agents data
const fieldAgentsData = [
  {
    id: "agent1",
    name: "Bilal Khan",
    phone: "+92-300-1111111",
    email: "bilal.khan@eamvu.com",
    area: "Karachi Central",
    activeAssignments: 2,
    completedVisits: 15,
    totalVisits: 45,
    status: "active",
    joinDate: "2023-01-15",
    lastActive: "2024-01-20",
    performance: "Excellent",
  },
  {
    id: "agent2",
    name: "Sara Ahmed",
    phone: "+92-321-2222222",
    email: "sara.ahmed@eamvu.com",
    area: "Karachi South",
    activeAssignments: 1,
    completedVisits: 23,
    totalVisits: 67,
    status: "active",
    joinDate: "2022-08-10",
    lastActive: "2024-01-19",
    performance: "Good",
  },
  {
    id: "agent3",
    name: "Usman Ali",
    phone: "+92-333-3333333",
    email: "usman.ali@eamvu.com",
    area: "Karachi East",
    activeAssignments: 0,
    completedVisits: 18,
    totalVisits: 52,
    status: "inactive",
    joinDate: "2023-03-20",
    lastActive: "2024-01-15",
    performance: "Average",
  },
  {
    id: "agent4",
    name: "Fatima Zahra",
    phone: "+92-300-4444444",
    email: "fatima.zahra@eamvu.com",
    area: "Karachi West",
    activeAssignments: 3,
    completedVisits: 31,
    totalVisits: 89,
    status: "active",
    joinDate: "2022-11-05",
    lastActive: "2024-01-20",
    performance: "Excellent",
  },
];

function getAgentStatusBadge(status: string) {
  const statusConfig: Record<string, { variant: "default" | "destructive" | "outline" | "secondary", label: string }> = {
    "active": { variant: "default", label: "Active" },
    "inactive": { variant: "outline", label: "Inactive" },
    "on_leave": { variant: "secondary", label: "On Leave" },
  }

  const config = statusConfig[status] || { variant: "outline", label: status }

  return <Badge variant={config.variant}>{config.label}</Badge>
}

function getPerformanceBadge(performance: string) {
  switch (performance) {
    case "Excellent":
      return <Badge className="bg-green-100 text-green-800">Excellent</Badge>
    case "Good":
      return <Badge className="bg-blue-100 text-blue-800">Good</Badge>
    case "Average":
      return <Badge className="bg-yellow-100 text-yellow-800">Average</Badge>
    case "Poor":
      return <Badge className="bg-red-100 text-red-800">Poor</Badge>
    default:
      return <Badge variant="secondary">{performance}</Badge>
  }
}

const FieldAgents = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [isAddAgentOpen, setIsAddAgentOpen] = useState(false);
  const { toast } = useToast();

  const filteredAgents = fieldAgentsData.filter((agent) =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.phone.includes(searchTerm) ||
    agent.area.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusChange = (agentId: string, newStatus: string) => {
    toast({
      title: "Status Updated",
      description: `Agent status changed to ${newStatus}`,
    });
  };

  const handleAddAgent = () => {
    toast({
      title: "Agent Added",
      description: "New field agent has been added successfully",
    });
    setIsAddAgentOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Field Agents</h2>
          <p className="text-muted-foreground">Manage field agents and their assignments</p>
        </div>
        <Dialog open={isAddAgentOpen} onOpenChange={setIsAddAgentOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Agent
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Field Agent</DialogTitle>
              <DialogDescription>
                Add a new field agent to the EAMVU team
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="Enter full name" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" placeholder="+92-300-1234567" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="agent@eamvu.com" />
                </div>
                <div>
                  <Label htmlFor="area">Assigned Area</Label>
                  <Input id="area" placeholder="Karachi Central" />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" placeholder="Any additional notes..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddAgentOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddAgent}>
                Add Agent
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Field Agents ({filteredAgents.length})</CardTitle>
          <CardDescription>Manage and track field agents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone, or area..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Area</TableHead>
                <TableHead>Active Assignments</TableHead>
                <TableHead>Completed Visits</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAgents.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{agent.name}</div>
                      <div className="text-sm text-muted-foreground">ID: {agent.id}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {agent.phone}
                      </div>
                      <div className="text-sm text-muted-foreground">{agent.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      {agent.area}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{agent.activeAssignments}</div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{agent.completedVisits}</div>
                      <div className="text-sm text-muted-foreground">Total: {agent.totalVisits}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getPerformanceBadge(agent.performance)}</TableCell>
                  <TableCell>{getAgentStatusBadge(agent.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedAgent(agent)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Agent
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Users className="mr-2 h-4 w-4" />
                          View Assignments
                        </DropdownMenuItem>
                        {agent.status === "active" ? (
                          <DropdownMenuItem 
                            className="text-amber-600"
                            onClick={() => handleStatusChange(agent.id, "inactive")}
                          >
                            <UserX className="mr-2 h-4 w-4" />
                            Set as Inactive
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem 
                            className="text-green-600"
                            onClick={() => handleStatusChange(agent.id, "active")}
                          >
                            <UserCheck className="mr-2 h-4 w-4" />
                            Set as Active
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Agent Profile Dialog */}
      <Dialog>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Agent Profile - {selectedAgent?.name}</DialogTitle>
            <DialogDescription>
              Detailed information about the field agent
            </DialogDescription>
          </DialogHeader>

          {selectedAgent && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Personal Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Full Name</Label>
                      <p className="text-sm">{selectedAgent.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Agent ID</Label>
                      <p className="text-sm">{selectedAgent.id}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Phone</Label>
                      <p className="text-sm">{selectedAgent.phone}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Email</Label>
                      <p className="text-sm">{selectedAgent.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Assigned Area</Label>
                      <p className="text-sm">{selectedAgent.area}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Join Date</Label>
                      <p className="text-sm">{selectedAgent.joinDate}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Performance Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{selectedAgent.activeAssignments}</div>
                      <div className="text-sm text-muted-foreground">Active Assignments</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{selectedAgent.completedVisits}</div>
                      <div className="text-sm text-muted-foreground">Completed Visits</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{selectedAgent.totalVisits}</div>
                      <div className="text-sm text-muted-foreground">Total Visits</div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label className="text-sm font-medium">Performance Rating</Label>
                    <div className="mt-1">{getPerformanceBadge(selectedAgent.performance)}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Status Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Current Status</Label>
                      <div className="mt-1">{getAgentStatusBadge(selectedAgent.status)}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Last Active</Label>
                      <p className="text-sm">{selectedAgent.lastActive}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FieldAgents;
