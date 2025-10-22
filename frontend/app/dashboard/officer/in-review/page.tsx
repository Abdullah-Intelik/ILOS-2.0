'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  FileSearch, 
  Calendar, 
  User, 
  Clock,
  AlertTriangle,
  Play,
  Pause,
  FileText,
  MessageCircle,
  Flag,
  Eye
} from "lucide-react";
import Link from "next/link";

interface InReviewApplication {
  id: string;
  type: string;
  applicant: string;
  cnic: string;
  priority: 'High' | 'Medium' | 'Low';
  startedAt: string;
  lastActivityAt: string;
  documentsTotal: number;
  documentsReviewed: number;
  flagsRaised: number;
  commentsCount: number;
  estimatedTimeRemaining: string;
  status: 'Active' | 'Paused' | 'Pending Action';
}

export default function InReviewPage() {
  const [applications, setApplications] = useState<InReviewApplication[]>([
    {
      id: "APP002",
      type: "Credit Card",
      applicant: "Jane Smith",
      cnic: "98765-4321098-7",
      priority: "Medium",
      startedAt: "2024-01-15T09:00:00Z",
      lastActivityAt: "2024-01-15T11:30:00Z",
      documentsTotal: 6,
      documentsReviewed: 3,
      flagsRaised: 1,
      commentsCount: 2,
      estimatedTimeRemaining: "2 hours",
      status: "Active"
    },
    {
      id: "APP005",
      type: "SME Loan",
      applicant: "Sarah Wilson",
      cnic: "77777-8888899-0",
      priority: "High",
      startedAt: "2024-01-14T14:00:00Z",
      lastActivityAt: "2024-01-15T10:15:00Z",
      documentsTotal: 12,
      documentsReviewed: 8,
      flagsRaised: 3,
      commentsCount: 5,
      estimatedTimeRemaining: "4 hours",
      status: "Paused"
    },
    {
      id: "APP007",
      type: "Auto Loan",
      applicant: "Robert Brown",
      cnic: "44444-5555566-7",
      priority: "Low",
      startedAt: "2024-01-15T08:30:00Z",
      lastActivityAt: "2024-01-15T10:45:00Z",
      documentsTotal: 8,
      documentsReviewed: 2,
      flagsRaised: 0,
      commentsCount: 1,
      estimatedTimeRemaining: "6 hours",
      status: "Pending Action"
    }
  ]);

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
      case "Active": return "bg-green-100 text-green-800";
      case "Paused": return "bg-yellow-100 text-yellow-800";
      case "Pending Action": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active": return <Play className="h-4 w-4 text-green-600" />;
      case "Paused": return <Pause className="h-4 w-4 text-yellow-600" />;
      case "Pending Action": return <AlertTriangle className="h-4 w-4 text-blue-600" />;
      default: return <FileSearch className="h-4 w-4 text-gray-600" />;
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

  const getTimeElapsed = (startTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const diffMs = now.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const handleStatusChange = (appId: string, newStatus: InReviewApplication['status']) => {
    setApplications(apps => 
      apps.map(app => 
        app.id === appId ? { ...app, status: newStatus, lastActivityAt: new Date().toISOString() } : app
      )
    );
  };

  const totalApplications = applications.length;
  const activeApplications = applications.filter(app => app.status === 'Active').length;
  const pausedApplications = applications.filter(app => app.status === 'Paused').length;
  const pendingActionApplications = applications.filter(app => app.status === 'Pending Action').length;

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">In Review</h2>
          <p className="text-muted-foreground">
            Applications currently being processed by you
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {totalApplications} In Progress
        </Badge>
      </div>

      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total In Review</CardTitle>
            <FileSearch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalApplications}</div>
            <p className="text-xs text-muted-foreground">
              Applications being processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Play className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeApplications}</div>
            <p className="text-xs text-muted-foreground">
              Currently working on
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paused</CardTitle>
            <Pause className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pausedApplications}</div>
            <p className="text-xs text-muted-foreground">
              Temporarily paused
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Action</CardTitle>
            <AlertTriangle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{pendingActionApplications}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting decision
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {applications.map((app) => (
          <Card key={app.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    {getStatusIcon(app.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-lg">{app.id}</h3>
                      <Badge variant="outline" className={getPriorityColor(app.priority)}>
                        {app.priority}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(app.status)}>
                        {app.status}
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
                        <span>Started: {formatDate(app.startedAt)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>Last activity: {formatDate(app.lastActivityAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Link href={`/dashboard/officer/assigned/${app.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Continue
                    </Button>
                  </Link>
                  {app.status === 'Active' ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleStatusChange(app.id, 'Paused')}
                    >
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleStatusChange(app.id, 'Active')}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Resume
                    </Button>
                  )}
                </div>
              </div>

              {/* Progress Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Documents:</span>
                      <span className="font-medium ml-1">
                        {app.documentsReviewed}/{app.documentsTotal}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Flags:</span>
                      <span className="font-medium ml-1 text-yellow-600">
                        {app.flagsRaised}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Comments:</span>
                      <span className="font-medium ml-1">
                        {app.commentsCount}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Time elapsed: {getTimeElapsed(app.startedAt)}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Review Progress</span>
                    <span>{Math.round((app.documentsReviewed / app.documentsTotal) * 100)}%</span>
                  </div>
                  <Progress value={(app.documentsReviewed / app.documentsTotal) * 100} />
                </div>

                {/* Status Messages */}
                {app.status === 'Paused' && (
                  <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <Pause className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-yellow-800">
                      Review paused - resume when ready to continue
                    </span>
                  </div>
                )}

                {app.status === 'Pending Action' && (
                  <div className="flex items-center space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-800">
                      Waiting for additional information or decision
                    </span>
                  </div>
                )}

                {app.flagsRaised > 0 && (
                  <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <Flag className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-800">
                      {app.flagsRaised} document(s) flagged - requires attention
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 pt-2">
                  <Link href={`/dashboard/officer/document-checklist?app=${app.id}`}>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Documents
                    </Button>
                  </Link>
                  <Link href={`/dashboard/officer/comments?app=${app.id}`}>
                    <Button variant="outline" size="sm">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Comments ({app.commentsCount})
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {applications.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileSearch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No applications in review</h3>
            <p className="text-muted-foreground">
              Applications you start reviewing will appear here. You can pause and resume your work anytime.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 