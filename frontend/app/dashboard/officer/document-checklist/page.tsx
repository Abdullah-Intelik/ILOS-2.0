'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// Force dynamic rendering to prevent static generation issues with useSearchParams
export const dynamic = 'force-dynamic';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Flag,
  Eye,
  Search,
  Filter,
  MessageCircle,
  Clock,
  User,
  Download
} from "lucide-react";

interface DocumentItem {
  id: string;
  name: string;
  type: string;
  applicationId: string;
  applicant: string;
  status: 'present' | 'missing' | 'invalid' | 'verified';
  flagged: boolean;
  comment?: string;
  uploadedAt?: string;
  fileUrl?: string;
  priority: 'High' | 'Medium' | 'Low';
}

function DocumentChecklistContent() {
  const searchParams = useSearchParams();
  const appFilter = searchParams.get('app');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [flaggedFilter, setFlaggedFilter] = useState('all');

  const [documents, setDocuments] = useState<DocumentItem[]>([
    {
      id: "doc1",
      name: "CNIC Copy",
      type: "Identity",
      applicationId: "APP001",
      applicant: "John Doe",
      status: "verified",
      flagged: false,
      uploadedAt: "2024-01-15T10:00:00Z",
      fileUrl: "/documents/cnic.pdf",
      priority: "High"
    },
    {
      id: "doc2",
      name: "Salary Certificate",
      type: "Income",
      applicationId: "APP002",
      applicant: "Jane Smith",
      status: "present",
      flagged: true,
      comment: "Certificate date is older than 3 months",
      uploadedAt: "2024-01-15T10:05:00Z",
      fileUrl: "/documents/salary.pdf",
      priority: "Medium"
    },
    {
      id: "doc3",
      name: "Bank Statement",
      type: "Financial",
      applicationId: "APP003",
      applicant: "Mike Johnson",
      status: "missing",
      flagged: true,
      comment: "Missing bank statements for last 3 months",
      priority: "High"
    },
    {
      id: "doc4",
      name: "Vehicle Registration",
      type: "Collateral",
      applicationId: "APP001",
      applicant: "John Doe",
      status: "present",
      flagged: false,
      uploadedAt: "2024-01-15T10:10:00Z",
      fileUrl: "/documents/vehicle.pdf",
      priority: "High"
    }
  ]);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.applicant.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.applicationId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    const matchesType = typeFilter === 'all' || doc.type === typeFilter;
    const matchesFlagged = flaggedFilter === 'all' || 
                          (flaggedFilter === 'flagged' && doc.flagged) ||
                          (flaggedFilter === 'not-flagged' && !doc.flagged);
    const matchesApp = !appFilter || doc.applicationId === appFilter;
    
    return matchesSearch && matchesStatus && matchesType && matchesFlagged && matchesApp;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified": return "bg-green-100 text-green-800";
      case "present": return "bg-blue-100 text-blue-800";
      case "missing": return "bg-red-100 text-red-800";
      case "invalid": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "present": return <FileText className="h-4 w-4 text-blue-600" />;
      case "missing": return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "invalid": return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default: return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "bg-red-100 text-red-800";
      case "Medium": return "bg-orange-100 text-orange-800";
      case "Low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleStatusChange = (docId: string, newStatus: DocumentItem['status']) => {
    setDocuments(docs => 
      docs.map(doc => 
        doc.id === docId ? { ...doc, status: newStatus } : doc
      )
    );
  };

  const handleFlagToggle = (docId: string) => {
    setDocuments(docs => 
      docs.map(doc => 
        doc.id === docId ? { ...doc, flagged: !doc.flagged } : doc
      )
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Statistics
  const totalDocuments = documents.length;
  const verifiedDocuments = documents.filter(doc => doc.status === 'verified').length;
  const flaggedDocuments = documents.filter(doc => doc.flagged).length;
  const missingDocuments = documents.filter(doc => doc.status === 'missing').length;

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Document Checklist</h2>
          <p className="text-muted-foreground">
            {appFilter ? `Documents for application ${appFilter}` : 'Review and verify documents across all applications'}
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {filteredDocuments.length} Documents
        </Badge>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDocuments}</div>
            <p className="text-xs text-muted-foreground">
              Across all applications
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{verifiedDocuments}</div>
            <p className="text-xs text-muted-foreground">
              {totalDocuments > 0 ? Math.round((verifiedDocuments / totalDocuments) * 100) : 0}% completion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged</CardTitle>
            <Flag className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{flaggedDocuments}</div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Missing</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{missingDocuments}</div>
            <p className="text-xs text-muted-foreground">
              Require follow-up
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="missing">Missing</SelectItem>
                <SelectItem value="invalid">Invalid</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Identity">Identity</SelectItem>
                <SelectItem value="Income">Income</SelectItem>
                <SelectItem value="Financial">Financial</SelectItem>
                <SelectItem value="Collateral">Collateral</SelectItem>
                <SelectItem value="Insurance">Insurance</SelectItem>
              </SelectContent>
            </Select>
            <Select value={flaggedFilter} onValueChange={setFlaggedFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Flagged" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Documents</SelectItem>
                <SelectItem value="flagged">Flagged Only</SelectItem>
                <SelectItem value="not-flagged">Not Flagged</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <div className="space-y-4">
        {filteredDocuments.map((doc) => (
          <Card key={doc.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="mt-1">
                    {getStatusIcon(doc.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-lg">{doc.name}</h4>
                      <Badge variant="outline" className={getStatusColor(doc.status)}>
                        {doc.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {doc.type}
                      </Badge>
                      <Badge variant="outline" className={getPriorityColor(doc.priority)}>
                        {doc.priority}
                      </Badge>
                      {doc.flagged && (
                        <Flag className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>{doc.applicant}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span>{doc.applicationId}</span>
                      </div>
                      {doc.uploadedAt && (
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>Uploaded: {formatDate(doc.uploadedAt)}</span>
                        </div>
                      )}
                    </div>
                    {doc.comment && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-sm text-yellow-800">{doc.comment}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {doc.fileUrl && (
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  )}
                  <Button
                    variant={doc.flagged ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => handleFlagToggle(doc.id)}
                  >
                    <Flag className="h-4 w-4 mr-2" />
                    {doc.flagged ? "Unflag" : "Flag"}
                  </Button>
                </div>
              </div>
              
              {/* Actions */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">Status:</span>
                      <Select value={doc.status} onValueChange={(value) => handleStatusChange(doc.id, value as DocumentItem['status'])}>
                        <SelectTrigger className="w-[120px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="present">Present</SelectItem>
                          <SelectItem value="missing">Missing</SelectItem>
                          <SelectItem value="invalid">Invalid</SelectItem>
                          <SelectItem value="verified">Verified</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Comment
                    </Button>
                    {doc.fileUrl && (
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No documents found</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || flaggedFilter !== 'all' 
                ? "Try adjusting your filters to see more documents."
                : "No documents available for review."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function DocumentChecklistPage() {
  return (
    <Suspense fallback={<div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Document Checklist</h2>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    </div>}>
      <DocumentChecklistContent />
    </Suspense>
  );
} 