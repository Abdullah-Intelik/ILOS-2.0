'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  CheckCircle, 
  Calendar, 
  User, 
  Clock,
  FileText,
  MessageCircle,
  Flag,
  Eye,
  Search,
  Filter,
  TrendingUp,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import Link from "next/link";

interface CompletedApplication {
  id: string;
  type: string;
  applicant: string;
  cnic: string;
  priority: 'High' | 'Medium' | 'Low';
  completedAt: string;
  reviewTime: string;
  finalStatus: 'Approved' | 'Rejected' | 'Returned' | 'Pending Approval';
  documentsTotal: number;
  documentsVerified: number;
  flagsRaised: number;
  commentsCount: number;
  processingTime: string;
  nextStep: string;
}

export default function CompletedReviewsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const [applications, setApplications] = useState<CompletedApplication[]>([
    {
      id: "APP001",
      type: "Auto Loan",
      applicant: "John Doe",
      cnic: "12345-6789012-3",
      priority: "High",
      completedAt: "2024-01-15T14:30:00Z",
      reviewTime: "3.5 hours",
      finalStatus: "Approved",
      documentsTotal: 8,
      documentsVerified: 8,
      flagsRaised: 0,
      commentsCount: 3,
      processingTime: "2 days",
      nextStep: "CIU Verification"
    },
    {
      id: "APP003",
      type: "Cash Plus",
      applicant: "Mike Johnson",
      cnic: "11111-2222233-4",
      priority: "High",
      completedAt: "2024-01-14T16:45:00Z",
      reviewTime: "2 hours",
      finalStatus: "Returned",
      documentsTotal: 5,
      documentsVerified: 3,
      flagsRaised: 2,
      commentsCount: 4,
      processingTime: "1 day",
      nextStep: "Applicant Action Required"
    },
    {
      id: "APP006",
      type: "Credit Card",
      applicant: "Lisa Adams",
      cnic: "33333-4444455-6",
      priority: "Medium",
      completedAt: "2024-01-13T11:20:00Z",
      reviewTime: "4 hours",
      finalStatus: "Rejected",
      documentsTotal: 6,
      documentsVerified: 4,
      flagsRaised: 3,
      commentsCount: 6,
      processingTime: "3 days",
      nextStep: "Application Closed"
    },
    {
      id: "APP008",
      type: "SME Loan",
      applicant: "Ahmed Khan",
      cnic: "99999-0000011-2",
      priority: "Low",
      completedAt: "2024-01-12T09:15:00Z",
      reviewTime: "5.5 hours",
      finalStatus: "Pending Approval",
      documentsTotal: 12,
      documentsVerified: 11,
      flagsRaised: 1,
      commentsCount: 8,
      processingTime: "4 days",
      nextStep: "SPU Head Review"
    }
  ]);

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.applicant.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.cnic.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || app.finalStatus.toLowerCase().includes(statusFilter.toLowerCase());
    
    // Date filter logic
    const matchesDate = dateFilter === 'all' || (() => {
      const completedDate = new Date(app.completedAt);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (dateFilter) {
        case 'today': return daysDiff === 0;
        case 'week': return daysDiff <= 7;
        case 'month': return daysDiff <= 30;
        default: return true;
      }
    })();
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "bg-red-100 text-red-800";
      case "Medium": return "bg-orange-100 text-orange-800";
      case "Low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved": return "bg-green-100 text-green-800";
      case "Rejected": return "bg-red-100 text-red-800";
      case "Returned": return "bg-yellow-100 text-yellow-800";
      case "Pending Approval": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "Rejected": return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "Returned": return <RefreshCw className="h-4 w-4 text-yellow-600" />;
      case "Pending Approval": return <Clock className="h-4 w-4 text-blue-600" />;
      default: return <FileText className="h-4 w-4 text-gray-600" />;
    }
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
  const totalCompleted = applications.length;
  const approved = applications.filter(app => app.finalStatus === 'Approved').length;
  const rejected = applications.filter(app => app.finalStatus === 'Rejected').length;
  const returned = applications.filter(app => app.finalStatus === 'Returned').length;
  const pendingApproval = applications.filter(app => app.finalStatus === 'Pending Approval').length;

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Completed Reviews</h2>
          <p className="text-muted-foreground">
            Applications you have successfully reviewed and completed
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {filteredApplications.length} Completed
        </Badge>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCompleted}</div>
            <p className="text-xs text-muted-foreground">
              Applications reviewed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approved}</div>
            <p className="text-xs text-muted-foreground">
              {totalCompleted > 0 ? Math.round((approved / totalCompleted) * 100) : 0}% approval rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Returned</CardTitle>
            <RefreshCw className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{returned}</div>
            <p className="text-xs text-muted-foreground">
              Sent back for revision
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{pendingApproval}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting SPU Head
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
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by applicant name, ID, or CNIC..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="returned">Returned</SelectItem>
                <SelectItem value="pending">Pending Approval</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.map((app) => (
          <Card key={app.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    {getStatusIcon(app.finalStatus)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-lg">{app.id}</h3>
                      <Badge variant="outline" className={getPriorityColor(app.priority)}>
                        {app.priority}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(app.finalStatus)}>
                        {app.finalStatus}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>{app.applicant}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span>{app.type}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>Completed: {formatDate(app.completedAt)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>Review time: {app.reviewTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Link href={`/dashboard/officer/assigned/${app.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Review Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{app.documentsVerified}</div>
                  <div className="text-xs text-muted-foreground">Documents Verified</div>
                  <div className="text-xs text-muted-foreground">out of {app.documentsTotal}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{app.flagsRaised}</div>
                  <div className="text-xs text-muted-foreground">Flags Raised</div>
                  <div className="text-xs text-muted-foreground">Issues identified</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{app.commentsCount}</div>
                  <div className="text-xs text-muted-foreground">Comments Added</div>
                  <div className="text-xs text-muted-foreground">Review notes</div>
                </div>
              </div>

              {/* Status Details */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Processing Time:</span>
                      <span className="font-medium ml-1">{app.processingTime}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Next Step:</span>
                      <span className="font-medium ml-1">{app.nextStep}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link href={`/dashboard/officer/comments?app=${app.id}`}>
                      <Button variant="outline" size="sm">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Comments ({app.commentsCount})
                      </Button>
                    </Link>
                    {app.flagsRaised > 0 && (
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                        <Flag className="h-3 w-3 mr-1" />
                        {app.flagsRaised} Flags
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredApplications.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No completed applications found</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' || dateFilter !== 'all' 
                ? "Try adjusting your filters to see more applications."
                : "Applications you complete will appear here."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 