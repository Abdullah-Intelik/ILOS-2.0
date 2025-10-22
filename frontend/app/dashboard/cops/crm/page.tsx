// /dashboard/cops/crm/page.tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Database } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

// Mock data for CRM system
const crmApplicationsData = [
  {
    id: "UBL-2024-001234",
    applicantName: "Ahmed Ali",
    loanType: "Home Loan",
    amount: "PKR 4,000,000",
    crmStatus: "verified",
    lastUpdate: "2024-01-15",
    assignedTo: "Zainab Ali",
    crmSystemStatus: "success",
  },
  {
    id: "UBL-2024-001235",
    applicantName: "Fatima Ahmed",
    loanType: "Auto Loan",
    amount: "PKR 1,500,000",
    crmStatus: "pending",
    lastUpdate: "2024-01-16",
    assignedTo: "Omar Khan",
    crmSystemStatus: "failure",
  },
  {
    id: "UBL-2024-001236",
    applicantName: "Hassan Raza",
    loanType: "Business Loan",
    amount: "PKR 3,000,000",
    crmStatus: "verified",
    lastUpdate: "2024-01-17",
    assignedTo: "Unassigned",
    crmSystemStatus: "success",
  },
]

export default function CRMSystemPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  const filteredApplications = crmApplicationsData.filter((app) =>
    app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSyncCRMStatus = (appId: string) => {
    toast({
      title: `CRM Sync for ${appId}`,
      description: `Status sync for CRM application ${appId} completed.`,
    })
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">CRM System Integration</h1>
      <p className="text-muted-foreground">View and manage customer data from the CRM system.</p>

      <Card>
        <CardHeader>
          <CardTitle>Applications Sync Status</CardTitle>
          <CardDescription>Applications synced with the CRM system</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search Input */}
          <div className="mb-4">
            <Input
              placeholder="Search by name or LOS ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Applications Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>LOS ID</TableHead>
                <TableHead>Applicant</TableHead>
                <TableHead>Loan Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>CRM Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-mono text-sm">{app.id}</TableCell>
                  <TableCell>{app.applicantName}</TableCell>
                  <TableCell>{app.loanType}</TableCell>
                  <TableCell className="font-medium">{app.amount}</TableCell>
                  <TableCell>
                    <Badge className={`bg-${app.crmStatus === "verified" ? "green" : "red"}-100 text-${app.crmStatus === "verified" ? "green" : "red"}-800`}>
                      {app.crmStatus === "verified" ? "Verified" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`bg-${app.crmSystemStatus === "success" ? "green" : "red"}-100 text-${app.crmSystemStatus === "success" ? "green" : "red"}-800`}>
                      {app.crmSystemStatus === "success" ? "Success" : "Failure"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      onClick={() => handleSyncCRMStatus(app.id)}
                      className="text-sm"
                    >
                      Sync Status
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
