// /dashboard/cops/processed/page.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { FileText, CheckCircle, AlertTriangle } from "lucide-react"

// Mock data for processed applications
const processedApplications = [
  {
    id: "UBL-2024-001233",
    applicantName: "Ahmed Ali",
    loanType: "Home Loan",
    amount: "PKR 4,000,000",
    status: "processed",
    lastUpdate: "2024-01-19",
    assignedTo: "EAMVU",
    documents: [
      { id: "doc1", name: "CNIC Copy", status: "verified" },
      { id: "doc2", name: "Salary Slip", status: "verified" },
      { id: "doc3", name: "Property Documents", status: "verified" },
    ],
  },
  {
    id: "UBL-2024-001234",
    applicantName: "Fatima Ahmed",
    loanType: "Personal Loan",
    amount: "PKR 1,500,000",
    status: "processed",
    lastUpdate: "2024-01-21",
    assignedTo: "EAMVU",
    documents: [
      { id: "doc4", name: "CNIC Copy", status: "verified" },
      { id: "doc5", name: "Salary Slip", status: "verified" },
    ],
  },
  {
    id: "UBL-2024-001235",
    applicantName: "Sana Khan",
    loanType: "Auto Loan",
    amount: "PKR 700,000",
    status: "processed",
    lastUpdate: "2024-01-22",
    assignedTo: "EAMVU",
    documents: [
      { id: "doc6", name: "CNIC Copy", status: "verified" },
      { id: "doc7", name: "Vehicle Registration", status: "verified" },
    ],
  },
]

export default function COPSProcessedApplicationsPage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Processed Applications</h1>
      <p className="text-muted-foreground">Applications that have been processed and sent for further review.</p>

      <Card>
        <CardHeader>
          <CardTitle>Processed Applications</CardTitle>
          <CardDescription>Applications that have been successfully processed and verified.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>LOS ID</TableHead>
                <TableHead>Applicant</TableHead>
                <TableHead>Loan Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Update</TableHead>
                <TableHead className="text-right">Assigned To</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedApplications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-mono text-sm">{app.id}</TableCell>
                  <TableCell>{app.applicantName}</TableCell>
                  <TableCell>{app.loanType}</TableCell>
                  <TableCell className="font-medium">{app.amount}</TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800">Processed</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(app.lastUpdate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline">{app.assignedTo}</Badge>
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
