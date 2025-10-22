"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, CheckCircle, AlertTriangle, FileText, Eye, MoreHorizontal } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"


const statsData = [
  {
    title: "Pending Applications",
    value: "18",
    change: "+3 from yesterday",
    icon: Clock,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  {
    title: "Submitted Today",
    value: "7",
    change: "+2 from yesterday",
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    title: "Returned Applications",
    value: "4",
    change: "Needs attention",
    icon: AlertTriangle,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  {
    title: "Total Applications",
    value: "124",
    change: "This month",
    icon: FileText,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
]

const recentApplicants = [
  {
    id: "UBL-2024-001234",
    name: "Mubashir",
    segment: "Preferred",
    status: "Submitted to SPU",
    lastUpdate: "2 hours ago",
    amount: "PKR 2,500,000",
  },
  {
    id: "UBL-2024-001235",
    name: "Abdul wasay ali",
    segment: "Mass",
    status: "Draft",
    lastUpdate: "4 hours ago",
    amount: "PKR 800,000",
  },
  {
    id: "UBL-2024-001236",
    name: "Hassan Raza",
    segment: "SME",
    status: "Returned from SPU",
    lastUpdate: "1 day ago",
    amount: "PKR 5,000,000",
  },
  {
    id: "UBL-2024-001237",
    name: "Ayesha Malik",
    segment: "Preferred",
    status: "Approved",
    lastUpdate: "2 days ago",
    amount: "PKR 1,200,000",
  },
  {
    id: "UBL-2024-001238",
    name: "Zain Ahmed",
    segment: "Mass",
    status: "Disbursed",
    lastUpdate: "3 days ago",
    amount: "PKR 950,000",
  },
]

function getStatusBadge(status: string) {
  switch (status) {
    case "Submitted to SPU":
      return <Badge className="bg-blue-100 text-blue-800">Submitted to SPU</Badge>
    case "Draft":
      return <Badge variant="outline">Draft</Badge>
    case "Returned from SPU":
      return <Badge variant="destructive">Returned from SPU</Badge>
    case "Approved":
      return <Badge className="bg-green-100 text-green-800">Approved</Badge>
    case "Disbursed":
      return <Badge className="bg-purple-100 text-purple-800">Disbursed</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export default function PBDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Personal Banking Dashboard</h1>
        <Link className="bg-blue-500 text-white px-4 py-2 rounded-md"
        href="/dashboard/applicant">New Application</Link>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
          <CardDescription>Manage your recent loan applications</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>LOS ID</TableHead>
                <TableHead>Segment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentApplicants.map((applicant) => (
                <TableRow key={applicant.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{applicant.name}</div>
                      <div className="text-sm text-muted-foreground">{applicant.lastUpdate}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{applicant.id}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{applicant.segment}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(applicant.status)}</TableCell>
                  <TableCell className="font-medium">{applicant.amount}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>Edit Application</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Cancel Application</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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