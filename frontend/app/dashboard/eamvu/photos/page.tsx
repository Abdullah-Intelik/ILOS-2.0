"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Filter, 
  Download, 
  Camera, 
  MapPin, 
  Calendar, 
  User, 
  Eye, 
  CheckCircle, 
  AlertTriangle,
  Upload,
  Image,
  FileText,
  Clock,
  Navigation
} from "lucide-react";

// Mock data for visit photos
const visitPhotosData = [
  {
    id: "VP-2024-001",
    applicationId: "UBL-2024-001236",
    applicantName: "Hassan Raza",
    agentName: "Sara Ahmed",
    visitDate: "2024-01-12",
    uploadDate: "2024-01-12",
    status: "verified",
    photos: [
      {
        id: "photo1",
        filename: "business_premises_1.jpg",
        url: "/placeholder.jpg",
        type: "business_premises",
        location: "Karachi South",
        coordinates: "24.8607° N, 67.0011° E",
        timestamp: "2024-01-12 14:30:25",
        size: "2.3 MB",
        verified: true,
      },
      {
        id: "photo2",
        filename: "business_premises_2.jpg",
        url: "/placeholder.jpg",
        type: "business_premises",
        location: "Karachi South",
        coordinates: "24.8607° N, 67.0011° E",
        timestamp: "2024-01-12 14:32:10",
        size: "1.8 MB",
        verified: true,
      },
      {
        id: "photo3",
        filename: "documents_verification.jpg",
        url: "/placeholder.jpg",
        type: "documents",
        location: "Karachi South",
        coordinates: "24.8607° N, 67.0011° E",
        timestamp: "2024-01-12 14:35:45",
        size: "3.1 MB",
        verified: true,
      },
    ],
    totalPhotos: 3,
    verifiedPhotos: 3,
    area: "Karachi South",
    loanType: "Business Loan",
  },
  {
    id: "VP-2024-002",
    applicationId: "UBL-2024-001241",
    applicantName: "Ayesha Malik",
    agentName: "Bilal Khan",
    visitDate: "2024-01-13",
    uploadDate: "2024-01-13",
    status: "pending",
    photos: [
      {
        id: "photo4",
        filename: "residence_front.jpg",
        url: "/placeholder.jpg",
        type: "residence",
        location: "Karachi Central",
        coordinates: "24.9275° N, 67.0286° E",
        timestamp: "2024-01-13 10:15:30",
        size: "2.7 MB",
        verified: false,
      },
      {
        id: "photo5",
        filename: "residence_interior.jpg",
        url: "/placeholder.jpg",
        type: "residence",
        location: "Karachi Central",
        coordinates: "24.9275° N, 67.0286° E",
        timestamp: "2024-01-13 10:18:15",
        size: "2.1 MB",
        verified: false,
      },
    ],
    totalPhotos: 2,
    verifiedPhotos: 0,
    area: "Karachi Central",
    loanType: "Personal Loan",
  },
  {
    id: "VP-2024-003",
    applicationId: "UBL-2024-001242",
    applicantName: "Kamran Ali",
    agentName: "Usman Ali",
    visitDate: "2024-01-14",
    uploadDate: "2024-01-14",
    status: "flagged",
    photos: [
      {
        id: "photo6",
        filename: "vehicle_front.jpg",
        url: "/placeholder.jpg",
        type: "vehicle",
        location: "Karachi East",
        coordinates: "24.8934° N, 67.0286° E",
        timestamp: "2024-01-14 16:45:20",
        size: "2.9 MB",
        verified: false,
      },
      {
        id: "photo7",
        filename: "vehicle_engine.jpg",
        url: "/placeholder.jpg",
        type: "vehicle",
        location: "Karachi East",
        coordinates: "24.8934° N, 67.0286° E",
        timestamp: "2024-01-14 16:47:35",
        size: "3.2 MB",
        verified: false,
      },
      {
        id: "photo8",
        filename: "vehicle_documents.jpg",
        url: "/placeholder.jpg",
        type: "documents",
        location: "Karachi East",
        coordinates: "24.8934° N, 67.0286° E",
        timestamp: "2024-01-14 16:50:10",
        size: "1.5 MB",
        verified: false,
      },
    ],
    totalPhotos: 3,
    verifiedPhotos: 0,
    area: "Karachi East",
    loanType: "Auto Loan",
  },
];

// Photo statistics
const photoStats = {
  totalPhotos: 234,
  verifiedPhotos: 189,
  pendingPhotos: 45,
  totalVisits: 78,
  avgPhotosPerVisit: 3.0,
  storageUsed: "2.3 GB",
  monthlyGrowth: 15.2,
};

function getStatusBadge(status: string) {
  switch (status) {
    case "verified":
      return <Badge className="bg-green-100 text-green-800">Verified</Badge>
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
    case "flagged":
      return <Badge className="bg-red-100 text-red-800">Flagged</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

function getPhotoTypeBadge(type: string) {
  switch (type) {
    case "business_premises":
      return <Badge className="bg-blue-100 text-blue-800">Business</Badge>
    case "residence":
      return <Badge className="bg-green-100 text-green-800">Residence</Badge>
    case "vehicle":
      return <Badge className="bg-purple-100 text-purple-800">Vehicle</Badge>
    case "documents":
      return <Badge className="bg-orange-100 text-orange-800">Documents</Badge>
    default:
      return <Badge variant="secondary">{type}</Badge>
  }
}

function getVerificationBadge(verified: boolean) {
  return verified ? (
    <CheckCircle className="h-4 w-4 text-green-600" />
  ) : (
    <AlertTriangle className="h-4 w-4 text-yellow-600" />
  );
}

const VisitPhotos = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedVisit, setSelectedVisit] = useState<any>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [applicationsData, setApplicationsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch applications from backend - same as main EAMVU dashboard
  const fetchApplications = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔄 EAMVU Photos: Starting to fetch applications...')
      
      const response = await fetch('/api/applications/department/EAMVU', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        cache: 'no-store'
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch applications')
      }
      
      const data = await response.json()
      console.log('✅ EAMVU Photos: Fetched', data.length, 'applications')
      
      setApplicationsData(data)
    } catch (err) {
      console.error('❌ EAMVU Photos: Error fetching applications:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch applications')
      toast({
        title: "Error",
        description: "Failed to fetch applications. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Load applications on component mount
  useEffect(() => {
    fetchApplications()
  }, [])

  // Transform real applications data for photos view
  const visitPhotosFromApplications = applicationsData.map((app, index) => ({
    id: `VP-2024-${String(index + 1).padStart(3, '0')}`,
    applicationId: app.los_id || `APP-${app.id}`,
    applicantName: app.applicant_name,
    agentName: "EAMVU Agent", // Default agent name
    visitDate: new Date(app.created_at).toISOString().split('T')[0],
    uploadDate: new Date(app.created_at).toISOString().split('T')[0],
    status: app.status === 'SUBMITTED_TO_CIU' ? 'verified' : app.status === 'ASSIGNED_TO_EAMVU_OFFICER' ? 'pending' : 'in_review',
    photos: [
      {
        id: `photo1-${app.id}`,
        filename: `business_premises_${app.id}.jpg`,
        url: "/placeholder.jpg",
        type: "business_premises",
        location: app.branch || "Not specified",
        coordinates: "24.8607° N, 67.0011° E", // Default coordinates
        timestamp: new Date(app.created_at).toLocaleString(),
        size: "2.3 MB",
        verified: app.status === 'SUBMITTED_TO_CIU',
        notes: `Photo for ${app.loan_type} application`
      },
      {
        id: `photo2-${app.id}`,
        filename: `applicant_${app.id}.jpg`,
        url: "/placeholder.jpg",
        type: "applicant",
        location: app.branch || "Not specified",
        coordinates: "24.8607° N, 67.0011° E",
        timestamp: new Date(app.created_at).toLocaleString(),
        size: "1.8 MB",
        verified: app.status === 'SUBMITTED_TO_CIU',
        notes: `Applicant photo for verification`
      }
    ]
  }));

  const filteredVisits = visitPhotosFromApplications.filter((visit) => {
    const matchesSearch = 
      visit.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.applicationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.agentName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || visit.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate photo statistics from real data
  const photoStats = {
    totalPhotos: visitPhotosFromApplications.reduce((sum, visit) => sum + visit.photos.length, 0),
    verifiedPhotos: visitPhotosFromApplications.reduce((sum, visit) => 
      sum + visit.photos.filter(photo => photo.verified).length, 0),
    pendingPhotos: visitPhotosFromApplications.reduce((sum, visit) => 
      sum + visit.photos.filter(photo => !photo.verified).length, 0),
    todayUploads: visitPhotosFromApplications.filter(visit => 
      visit.uploadDate === new Date().toISOString().split('T')[0]
    ).reduce((sum, visit) => sum + visit.photos.length, 0)
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Visit Photos</h2>
            <p className="text-muted-foreground">Field visit photo management and verification</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading visit photos...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Visit Photos</h2>
            <p className="text-muted-foreground">Field visit photo management and verification</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-red-500" />
            <p className="text-red-600 mb-2">Error loading visit photos</p>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchApplications} variant="outline">
              <Clock className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Visit Photos</h2>
          <p className="text-muted-foreground">Field visit photo management and verification</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchApplications} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download All
          </Button>
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload Photos
          </Button>
        </div>
      </div>

      {/* Photo Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Photos</CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{photoStats.totalPhotos}</div>
            <p className="text-xs text-muted-foreground">
              +{photoStats.monthlyGrowth}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Photos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{photoStats.verifiedPhotos}</div>
            <p className="text-xs text-muted-foreground">
              {((photoStats.verifiedPhotos / photoStats.totalPhotos) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{photoStats.pendingPhotos}</div>
            <p className="text-xs text-muted-foreground">
              {((photoStats.pendingPhotos / photoStats.totalPhotos) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{photoStats.storageUsed}</div>
            <p className="text-xs text-muted-foreground">
              {photoStats.avgPhotosPerVisit} photos per visit
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="visits" className="space-y-4">
        <TabsList>
          <TabsTrigger value="visits">Visit Photos</TabsTrigger>
          <TabsTrigger value="gallery">Photo Gallery</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="visits" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Label className="text-sm font-medium">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by applicant, LOS ID, or agent..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <div className="w-48">
                  <Label className="text-sm font-medium">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="flagged">Flagged</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  More Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Visits Table */}
          <Card>
            <CardHeader>
              <CardTitle>Visit Photos ({filteredVisits.length})</CardTitle>
              <CardDescription>Field visit photo collections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredVisits.map((visit) => (
                  <Card key={visit.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-muted p-3 rounded-lg">
                          <Camera className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="font-medium">{visit.applicantName}</div>
                          <div className="text-sm text-muted-foreground">{visit.applicationId}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <User className="h-3 w-3" />
                            {visit.agentName}
                            <span>•</span>
                            <Calendar className="h-3 w-3" />
                            {visit.visitDate}
                            <span>•</span>
                            <MapPin className="h-3 w-3" />
                            {visit.area}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-medium">{visit.totalPhotos} photos</div>
                          <div className="text-sm text-muted-foreground">
                            {visit.verifiedPhotos} verified
                          </div>
                        </div>
                        <div>{getStatusBadge(visit.status)}</div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedVisit(visit)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Photos
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-6xl">
                            <DialogHeader>
                              <DialogTitle>Visit Photos - {selectedVisit?.applicantName}</DialogTitle>
                              <DialogDescription>
                                Photo collection from field visit on {selectedVisit?.visitDate}
                              </DialogDescription>
                            </DialogHeader>

                            {selectedVisit && (
                              <div className="space-y-6">
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">Visit Information</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="text-sm font-medium">Applicant</Label>
                                        <p className="text-sm">{selectedVisit.applicantName}</p>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium">Application ID</Label>
                                        <p className="text-sm font-mono">{selectedVisit.applicationId}</p>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium">Field Agent</Label>
                                        <p className="text-sm">{selectedVisit.agentName}</p>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium">Visit Date</Label>
                                        <p className="text-sm">{selectedVisit.visitDate}</p>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium">Area</Label>
                                        <p className="text-sm">{selectedVisit.area}</p>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium">Loan Type</Label>
                                        <p className="text-sm">{selectedVisit.loanType}</p>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>

                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">Photo Collection</CardTitle>
                                    <CardDescription>
                                      {selectedVisit.totalPhotos} photos taken during the visit
                                    </CardDescription>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                      {selectedVisit.photos.map((photo) => (
                                        <div key={photo.id} className="border rounded-lg p-3">
                                          <div className="bg-muted h-32 rounded-md flex items-center justify-center mb-2">
                                            <Image className="h-8 w-8 text-muted-foreground" />
                                          </div>
                                          <div className="space-y-1">
                                            <div className="flex items-center justify-between">
                                              <span className="text-sm font-medium truncate">{photo.filename}</span>
                                              {getVerificationBadge(photo.verified)}
                                            </div>
                                            <div className="flex items-center gap-1">
                                              {getPhotoTypeBadge(photo.type)}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                              <div className="flex items-center gap-1">
                                                <Navigation className="h-3 w-3" />
                                                {photo.coordinates}
                                              </div>
                                              <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {photo.timestamp}
                                              </div>
                                              <div>{photo.size}</div>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gallery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Photo Gallery</CardTitle>
              <CardDescription>Browse all field visit photos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {visitPhotosData.flatMap(visit => 
                  visit.photos.map(photo => (
                    <div key={photo.id} className="border rounded-lg p-2 cursor-pointer hover:shadow-md transition-shadow">
                      <div className="bg-muted h-24 rounded-md flex items-center justify-center mb-2">
                        <Image className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="text-xs">
                        <div className="font-medium truncate">{photo.filename}</div>
                        <div className="text-muted-foreground">{photo.type}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Photo Types</CardTitle>
                <CardDescription>Distribution by photo type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-800">Business</Badge>
                      <span className="text-sm">Business Premises</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">45%</div>
                      <div className="text-sm text-muted-foreground">105 photos</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">Residence</Badge>
                      <span className="text-sm">Residential</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">32%</div>
                      <div className="text-sm text-muted-foreground">75 photos</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-purple-100 text-purple-800">Vehicle</Badge>
                      <span className="text-sm">Vehicle Inspection</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">15%</div>
                      <div className="text-sm text-muted-foreground">35 photos</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-orange-100 text-orange-800">Documents</Badge>
                      <span className="text-sm">Document Verification</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">8%</div>
                      <div className="text-sm text-muted-foreground">19 photos</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upload Trends</CardTitle>
                <CardDescription>Photo upload activity over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">This Week</span>
                    <div className="text-right">
                      <div className="font-medium">+23%</div>
                      <div className="text-sm text-muted-foreground">45 photos</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">This Month</span>
                    <div className="text-right">
                      <div className="font-medium">+15%</div>
                      <div className="text-sm text-muted-foreground">234 photos</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average per Visit</span>
                    <div className="text-right">
                      <div className="font-medium">3.0</div>
                      <div className="text-sm text-muted-foreground">photos</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VisitPhotos; 