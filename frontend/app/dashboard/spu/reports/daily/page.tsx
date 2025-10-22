// /dashboard/spu/reports/daily/page.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react"

// Mock data for daily report
const dailyReportData = [
  {
    id: "1",
    applicantName: "Muhammad Ali Khan",
    loanType: "Personal Loan",
    amount: "PKR 2,500,000",
    status: "verified",
    documentStatus: "Verified",
    verificationDate: "2024-01-15",
  },
  {
    id: "2",
    applicantName: "Fatima Ahmed",
    loanType: "Auto Loan",
    amount: "PKR 800,000",
    status: "pending",
    documentStatus: "Pending",
    verificationDate: "2024-01-14",
  },
  {
    id: "3",
    applicantName: "Hassan Raza",
    loanType: "Business Loan",
    amount: "PKR 5,000,000",
    status: "rejected",
    documentStatus: "Rejected",
    verificationDate: "2024-01-13",
  },
]

export default function SPUDailyReportPage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Daily Report</h1>
      <p className="text-muted-foreground">Overview of today's SPU activities.</p>

      <Card>
        <CardHeader>
          <CardTitle>SPU Daily Report</CardTitle>
          <CardDescription>Generated daily report of applications processed and their statuses.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Calendar className="h-6 w-6 text-blue-600" />
            <span className="text-sm text-muted-foreground">Date: {new Date().toLocaleDateString()}</span>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>LOS ID</TableHead>
                <TableHead>Applicant</TableHead>
                <TableHead>Loan Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Document Status</TableHead>
                <TableHead>Verification Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dailyReportData.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-mono text-sm">{report.id}</TableCell>
                  <TableCell>{report.applicantName}</TableCell>
                  <TableCell>{report.loanType}</TableCell>
                  <TableCell className="font-medium">{report.amount}</TableCell>
                  <TableCell>
                    <Badge className={report.status === "verified" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={report.documentStatus === "Verified" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                      {report.documentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(report.verificationDate).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
