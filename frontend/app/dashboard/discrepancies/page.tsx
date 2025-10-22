"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertTriangle, CheckCircle, Clock, User, FileText, DollarSign } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const discrepanciesData = [
  {
    id: "DISC-001",
    losId: "UBL-2024-001234",
    applicantName: "Muhammad Ali Khan",
    type: "Name Mismatch",
    severity: "High",
    description: 'CNIC Name: "Muhammad Ali Khan" vs Document: "M. Ali Khan"',
    cnicValue: "Muhammad Ali Khan",
    documentValue: "M. Ali Khan",
    status: "Unresolved",
    createdAt: "2024-01-15T10:30:00Z",
    category: "Identity",
  },
  {
    id: "DISC-002",
    losId: "UBL-2024-001235",
    applicantName: "Fatima Ahmed",
    type: "Salary Discrepancy",
    severity: "Medium",
    description: "Declared Salary: PKR 85,000 vs Salary Slip: PKR 78,000",
    cnicValue: "PKR 85,000",
    documentValue: "PKR 78,000",
    status: "Under Review",
    createdAt: "2024-01-14T14:20:00Z",
    category: "Financial",
  },
  {
    id: "DISC-003",
    losId: "UBL-2024-001236",
    applicantName: "Hassan Raza",
    type: "Address Mismatch",
    severity: "Low",
    description: "CNIC Address differs from provided address",
    cnicValue: "House 123, Block A, Gulshan-e-Iqbal",
    documentValue: "Flat 456, DHA Phase 2",
    status: "Resolved",
    createdAt: "2024-01-13T09:15:00Z",
    category: "Identity",
  },
]

function getSeverityBadge(severity: string) {
  const config = {
    High: "bg-red-100 text-red-800",
    Medium: "bg-yellow-100 text-yellow-800",
    Low: "bg-green-100 text-green-800",
  }

  return <Badge className={config[severity as keyof typeof config]}>{severity}</Badge>
}

function getStatusBadge(status: string) {
  const config = {
    Unresolved: { variant: "destructive" as const, icon: AlertTriangle },
    "Under Review": { variant: "secondary" as const, icon: Clock },
    Resolved: { variant: "default" as const, icon: CheckCircle },
  }

  const { variant, icon: Icon } = config[status as keyof typeof config]

  return (
    <Badge variant={variant} className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {status}
    </Badge>
  )
}

function getCategoryIcon(category: string) {
  const icons = {
    Identity: User,
    Financial: DollarSign,
    Document: FileText,
  }

  return icons[category as keyof typeof icons] || FileText
}

export default function DiscrepanciesPage() {
  const [selectedDiscrepancy, setSelectedDiscrepancy] = useState<any>(null)
  const [resolution, setResolution] = useState("")
  const [notes, setNotes] = useState("")
  const { toast } = useToast()

  const handleResolve = () => {
    toast({
      title: "Discrepancy Resolved",
      description: `${selectedDiscrepancy?.type} has been resolved successfully`,
    })
    setSelectedDiscrepancy(null)
    setResolution("")
    setNotes("")
  }

  const unresolvedCount = discrepanciesData.filter((d) => d.status === "Unresolved").length
  const underReviewCount = discrepanciesData.filter((d) => d.status === "Under Review").length

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Discrepancy Management</h2>
          <p className="text-muted-foreground">Review and resolve data discrepancies across applications</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unresolved</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{unresolvedCount}</div>
            <p className="text-xs text-muted-foreground">Requires immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{underReviewCount}</div>
            <p className="text-xs text-muted-foreground">Being processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">5</div>
            <p className="text-xs text-muted-foreground">Successfully resolved</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Alerts */}
      {unresolvedCount > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>High Priority Discrepancies</AlertTitle>
          <AlertDescription>
            You have {unresolvedCount} unresolved discrepancies that require immediate attention. Please review and
            resolve them to prevent application delays.
          </AlertDescription>
        </Alert>
      )}

      {/* Discrepancies Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Active Discrepancies
          </CardTitle>
          <CardDescription>Review and resolve data mismatches found in applications</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Applicant</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {discrepanciesData.map((discrepancy) => {
                const CategoryIcon = getCategoryIcon(discrepancy.category)
                return (
                  <TableRow key={discrepancy.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{discrepancy.type}</div>
                          <div className="text-sm text-muted-foreground">{discrepancy.losId}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{discrepancy.applicantName}</div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="text-sm truncate">{discrepancy.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getSeverityBadge(discrepancy.severity)}</TableCell>
                    <TableCell>{getStatusBadge(discrepancy.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(discrepancy.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedDiscrepancy(discrepancy)}
                            disabled={discrepancy.status === "Resolved"}
                          >
                            {discrepancy.status === "Resolved" ? "View" : "Resolve"}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Resolve {discrepancy.type}</DialogTitle>
                            <DialogDescription>
                              Review the conflicting information and choose the correct value
                            </DialogDescription>
                          </DialogHeader>

                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium">LOS ID</Label>
                                <p className="text-sm font-mono">{discrepancy.losId}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Applicant</Label>
                                <p className="text-sm">{discrepancy.applicantName}</p>
                              </div>
                            </div>

                            <div>
                              <Label className="text-sm font-medium">Discrepancy Details</Label>
                              <p className="text-sm text-muted-foreground mt-1">{discrepancy.description}</p>
                            </div>

                            <div className="space-y-4">
                              <Label className="text-sm font-medium">Choose Resolution</Label>
                              <RadioGroup value={resolution} onValueChange={setResolution}>
                                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                                  <RadioGroupItem value="use-cnic" id="use-cnic" />
                                  <Label htmlFor="use-cnic" className="flex-1">
                                    <div className="font-medium">Use CNIC/System Value</div>
                                    <div className="text-sm text-muted-foreground">"{discrepancy.cnicValue}"</div>
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                                  <RadioGroupItem value="use-document" id="use-document" />
                                  <Label htmlFor="use-document" className="flex-1">
                                    <div className="font-medium">Use Document Value</div>
                                    <div className="text-sm text-muted-foreground">"{discrepancy.documentValue}"</div>
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                                  <RadioGroupItem value="escalate" id="escalate" />
                                  <Label htmlFor="escalate" className="flex-1">
                                    <div className="font-medium">Escalate to Supervisor</div>
                                    <div className="text-sm text-muted-foreground">Requires senior approval</div>
                                  </Label>
                                </div>
                              </RadioGroup>
                            </div>

                            <div>
                              <Label htmlFor="notes">Resolution Notes</Label>
                              <Textarea
                                id="notes"
                                placeholder="Add any additional notes or comments about this resolution..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="mt-1"
                              />
                            </div>
                          </div>

                          <DialogFooter>
                            <Button variant="outline">Cancel</Button>
                            <Button onClick={handleResolve} disabled={!resolution}>
                              Resolve Discrepancy
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
