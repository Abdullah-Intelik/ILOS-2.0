"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Download, Search } from "lucide-react"

// Mock data for Compliance Reports
const complianceReportsData = [
  {
    id: "REPORT-001",
    reportName: "KYC Compliance Report",
    generatedDate: "2024-01-15",
    status: "completed",
    totalApplications: 50,
    completedApplications: 50,
    pendingApplications: 0,
    failedApplications: 0,
  },
  {
    id: "REPORT-002",
    reportName: "AML Screening Report",
    generatedDate: "2024-01-14",
    status: "in-progress",
    totalApplications: 45,
    completedApplications: 30,
    pendingApplications: 10,
    failedApplications: 5,
  },
  {
    id: "REPORT-003",
    reportName: "Credit Score Compliance Report",
    generatedDate: "2024-01-13",
    status: "completed",
    totalApplications: 60,
    completedApplications: 55,
    pendingApplications: 3,
    failedApplications: 2,
  },
]

export default function ComplianceReportsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [reportsPerPage] = useState(10)
  const { toast } = useToast()

  // Calculate pagination
  const indexOfLastReport = currentPage * reportsPerPage
  const indexOfFirstReport = indexOfLastReport - reportsPerPage
  const currentReports = complianceReportsData.slice(indexOfFirstReport, indexOfLastReport)

  const filteredReports = currentReports.filter((report) =>
    report.reportName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDownloadReport = (reportId: string) => {
    toast({
      title: `Downloading Report - ${reportId}`,
      description: `The compliance report ${reportId} is being downloaded.`,
    })
  }

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Compliance Reports</h1>
      <p className="text-muted-foreground">View and manage compliance-related reports</p>

      <Card>
        <CardHeader>
          <CardTitle>Compliance Reports</CardTitle>
          <CardDescription>Manage and track compliance reports status</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search Input */}
          <div className="mb-4">
            <Input
              placeholder="Search by report name or ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Reports Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report ID</TableHead>
                <TableHead>Report Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total Applications</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Pending</TableHead>
                <TableHead>Failed</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-mono text-sm">{report.id}</TableCell>
                  <TableCell>{report.reportName}</TableCell>
                  <TableCell>
                    <Badge className={report.status === "completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                      {report.status === "completed" ? "Completed" : "In Progress"}
                    </Badge>
                  </TableCell>
                  <TableCell>{report.totalApplications}</TableCell>
                  <TableCell>{report.completedApplications}</TableCell>
                  <TableCell>{report.pendingApplications}</TableCell>
                  <TableCell>{report.failedApplications}</TableCell>
                  <TableCell className="text-right">
                    <Button onClick={() => handleDownloadReport(report.id)} variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span>Page {currentPage}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={filteredReports.length < reportsPerPage}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
