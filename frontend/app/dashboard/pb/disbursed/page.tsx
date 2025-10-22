"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Download, FileText, Search, Filter, Calendar, ChevronDown, Printer, RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

const disbursedLoans = [
  {
    id: "UBL-2024-001230",
    name: "Imran Shah",
    amount: "PKR 1,000,000",
    disbursedAmount: "PKR 1,000,000",
    date: "2024-06-28",
    type: "Auto Loan",
    status: "active",
    tenor: "36 months",
    nextPayment: "2024-07-28",
    disbursementMode: "Direct Bank Transfer",
    accountNumber: "PK36UBLS1234567890123",
    documentUrl: "#",
  },
  {
    id: "UBL-2024-001231",
    name: "Sana Fatima",
    amount: "PKR 3,200,000",
    disbursedAmount: "PKR 3,200,000",
    date: "2024-07-01",
    type: "Home Loan",
    status: "active",
    tenor: "120 months",
    nextPayment: "2024-08-01",
    disbursementMode: "Cheque",
    accountNumber: "PK36UBLS9876543210987",
    documentUrl: "#",
  },
  {
    id: "UBL-2024-001232",
    name: "Ahmed Khan",
    amount: "PKR 500,000",
    disbursedAmount: "PKR 500,000",
    date: "2024-06-15",
    type: "Personal Loan",
    status: "active",
    tenor: "24 months",
    nextPayment: "2024-07-15",
    disbursementMode: "Direct Bank Transfer",
    accountNumber: "PK36UBLS5678901234567",
    documentUrl: "#",
  },
  {
    id: "UBL-2024-001233",
    name: "Fatima Ali",
    amount: "PKR 2,500,000",
    disbursedAmount: "PKR 2,500,000",
    date: "2024-05-20",
    type: "Business Loan",
    status: "active",
    tenor: "48 months",
    nextPayment: "2024-07-20",
    disbursementMode: "Direct Bank Transfer",
    accountNumber: "PK36UBLS3456789012345",
    documentUrl: "#",
  },
]

export default function DisbursedLoansPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLoan, setSelectedLoan] = useState<any>(null)
  const [filterType, setFilterType] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  // Filter loans based on search term and loan type filter
  const filteredLoans = disbursedLoans.filter(loan => {
    const matchesSearch = 
      loan.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      loan.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filterType === "all" || loan.type === filterType
    
    return matchesSearch && matchesType
  })
  
  const handleViewDetails = (loan: any) => {
    setSelectedLoan(loan)
    setIsDialogOpen(true)
  }
  
  const uniqueLoanTypes = Array.from(new Set(disbursedLoans.map(loan => loan.type)))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Disbursed Loans</h1>
        <p className="text-muted-foreground">View and manage loans that have been successfully disbursed</p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by ID or applicant name"
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full md:w-[180px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Filter by type" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Loan Types</SelectItem>
              {uniqueLoanTypes.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          <Button variant="outline" size="icon">
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">
            Active Loans
            <Badge className="ml-2 bg-green-100 text-green-800">{disbursedLoans.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="closed">Closed Loans</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Disbursed Applications</CardTitle>
              <CardDescription>These applications have completed CIU and been disbursed to customers.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>LOS ID</TableHead>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Loan Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Disbursed On</TableHead>
                    <TableHead>Next Payment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLoans.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No disbursed loans found matching your criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLoans.map((loan) => (
                      <TableRow key={loan.id}>
                        <TableCell className="font-mono">{loan.id}</TableCell>
                        <TableCell>{loan.name}</TableCell>
                        <TableCell>{loan.type}</TableCell>
                        <TableCell>{loan.amount}</TableCell>
                        <TableCell>{loan.date}</TableCell>
                        <TableCell>{loan.nextPayment}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleViewDetails(loan)}>
                              Details
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="mr-2 h-4 w-4" />
                              Documents
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {filteredLoans.length} of {disbursedLoans.length} disbursed loans
              </div>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
                  1
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Next
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="closed" className="mt-4">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mb-4" />
              <p className="text-xl font-medium mb-2">No closed loans found</p>
              <p className="text-muted-foreground">All your disbursed loans are currently active</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Loan Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Loan Details</DialogTitle>
            <DialogDescription>
              Comprehensive information about the disbursed loan
            </DialogDescription>
          </DialogHeader>
          
          {selectedLoan && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">LOS ID</h3>
                  <p className="font-mono">{selectedLoan.id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Applicant Name</h3>
                  <p>{selectedLoan.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Loan Type</h3>
                  <p>{selectedLoan.type}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Active
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Approved Amount</h3>
                  <p className="font-medium">{selectedLoan.amount}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Disbursed Amount</h3>
                  <p className="font-medium">{selectedLoan.disbursedAmount}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Disbursement Date</h3>
                  <p>{selectedLoan.date}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Tenor</h3>
                  <p>{selectedLoan.tenor}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Next Payment Date</h3>
                  <p>{selectedLoan.nextPayment}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Disbursement Mode</h3>
                  <p>{selectedLoan.disbursementMode}</p>
                </div>
                <div className="col-span-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Account Number</h3>
                  <p className="font-mono">{selectedLoan.accountNumber}</p>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline">
                  <Printer className="mr-2 h-4 w-4" />
                  Print Details
                </Button>
                <Button>
                  <Download className="mr-2 h-4 w-4" />
                  Download Documents
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
