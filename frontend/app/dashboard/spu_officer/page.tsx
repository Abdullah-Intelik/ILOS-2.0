"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { LayoutDashboard, ClipboardList, FileSearch, CheckCircle, Eye, ThumbsUp, ThumbsDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SPUOfficerDashboard() {
  const [pendingApplications, setPendingApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApplication, setSelectedApplication] = useState<any>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const { toast } = useToast()

  const officerMetrics = [
    { title: "Pending Reviews", count: pendingApplications.length, icon: ClipboardList },
    { title: "In Review", count: 0, icon: FileSearch },
    { title: "Completed Today", count: 0, icon: CheckCircle },
  ];

  useEffect(() => {
    fetchPendingApplications()
  }, [])

  const fetchPendingApplications = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/spu-officer/officer/pending-reviews`)
      const data = await response.json()
      
      if (response.ok) {
        setPendingApplications(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch pending applications",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching pending applications:', error)
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApproveApplication = async (id: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/spu-officer/officer/review/${id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Application approved successfully"
        })
        fetchPendingApplications() // Refresh the list
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to approve application",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error approving application:', error)
      toast({
        title: "Error",
        description: "Failed to approve application",
        variant: "destructive"
      })
    }
  }

  const handleRejectApplication = async (id: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/spu-officer/officer/review/${id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rejectionReason })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Application rejected successfully"
        })
        setSelectedApplication(null)
        setRejectionReason("")
        fetchPendingApplications() // Refresh the list
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to reject application",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error rejecting application:', error)
      toast({
        title: "Error",
        description: "Failed to reject application",
        variant: "destructive"
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending_review":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">SPU Officer Dashboard</h1>
        <Button onClick={fetchPendingApplications} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </Button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {officerMetrics.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.count}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Applications for Review</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading applications...</p>
          ) : pendingApplications.length === 0 ? (
            <p>No pending applications found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>LOS ID</TableHead>
                  <TableHead>Applicant Name</TableHead>
                  <TableHead>Loan Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingApplications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-mono text-sm">{app.los_id}</TableCell>
                    <TableCell className="font-medium">{app.applicant_name}</TableCell>
                    <TableCell>{app.loan_type}</TableCell>
                    <TableCell>PKR {app.loan_amount?.toLocaleString()}</TableCell>
                    <TableCell>{getStatusBadge(app.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(app.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedApplication(app)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => handleApproveApplication(app.id)}
                        >
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <ThumbsDown className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Reject Application</DialogTitle>
                              <DialogDescription>
                                Please provide a reason for rejecting this application.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="rejection-reason">Rejection Reason</Label>
                                <Textarea
                                  id="rejection-reason"
                                  value={rejectionReason}
                                  onChange={(e) => setRejectionReason(e.target.value)}
                                  placeholder="Enter the reason for rejection..."
                                  rows={4}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setRejectionReason("")}>
                                Cancel
                              </Button>
                              <Button 
                                variant="destructive" 
                                onClick={() => handleRejectApplication(app.id)}
                                disabled={!rejectionReason.trim()}
                              >
                                Reject Application
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Application Details Dialog */}
      {selectedApplication && (
        <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Application Details</DialogTitle>
              <DialogDescription>
                Review details for {selectedApplication.applicant_name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>LOS ID</Label>
                  <p className="font-mono text-sm">{selectedApplication.los_id}</p>
                </div>
                <div>
                  <Label>Applicant Name</Label>
                  <p>{selectedApplication.applicant_name}</p>
                </div>
                <div>
                  <Label>CNIC</Label>
                  <p>{selectedApplication.cnic}</p>
                </div>
                <div>
                  <Label>Loan Type</Label>
                  <p>{selectedApplication.loan_type}</p>
                </div>
                <div>
                  <Label>Loan Amount</Label>
                  <p>PKR {selectedApplication.loan_amount?.toLocaleString()}</p>
                </div>
                <div>
                  <Label>Priority</Label>
                  <p className="capitalize">{selectedApplication.priority}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <p>{getStatusBadge(selectedApplication.status)}</p>
                </div>
                <div>
                  <Label>Created Date</Label>
                  <p>{new Date(selectedApplication.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              {selectedApplication.review_notes && (
                <div>
                  <Label>Review Notes</Label>
                  <p className="text-sm text-muted-foreground">{selectedApplication.review_notes}</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedApplication(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
