'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  ClipboardList, 
  FileSearch, 
  CheckCircle, 
  Clock,
  AlertTriangle,
  TrendingUp,
  Users,
  FileText
} from "lucide-react";
import Link from "next/link";

export default function SPUOfficerDashboard() {
  // Mock data - replace with actual API calls
  const stats = {
    totalAssigned: 15,
    inReview: 4,
    completed: 8,
    overdue: 2,
    todayAssigned: 3,
    weeklyTarget: 20
  };

  const recentApplications = [
    {
      id: "APP001",
      type: "Auto Loan",
      applicant: "John Doe",
      status: "In Review",
      priority: "High",
      assignedAt: "2 hours ago"
    },
    {
      id: "APP002", 
      type: "Credit Card",
      applicant: "Jane Smith",
      status: "Assigned",
      priority: "Medium",
      assignedAt: "4 hours ago"
    },
    {
      id: "APP003",
      type: "Cash Plus",
      applicant: "Mike Johnson",
      status: "Completed",
      priority: "Low",
      assignedAt: "1 day ago"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Assigned": return "bg-blue-100 text-blue-800";
      case "In Review": return "bg-yellow-100 text-yellow-800";
      case "Completed": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
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

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">SPU Officer Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor and manage your assigned application reviews
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            Officer ID: SPU001
          </Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assigned</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssigned}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.todayAssigned} assigned today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Review</CardTitle>
            <FileSearch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inReview}</div>
            <p className="text-xs text-muted-foreground">
              Currently processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              This week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">
              Needs attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Weekly Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Completed: {stats.completed}</span>
                <span>Target: {stats.weeklyTarget}</span>
              </div>
              <Progress value={(stats.completed / stats.weeklyTarget) * 100} />
              <p className="text-xs text-muted-foreground">
                {Math.round((stats.completed / stats.weeklyTarget) * 100)}% of weekly target achieved
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/dashboard/officer/assigned">
                <Button variant="outline" className="w-full h-auto p-3">
                  <div className="flex flex-col items-center space-y-1">
                    <ClipboardList className="h-5 w-5" />
                    <span className="text-xs">Assigned</span>
                  </div>
                </Button>
              </Link>
              <Link href="/dashboard/officer/in-review">
                <Button variant="outline" className="w-full h-auto p-3">
                  <div className="flex flex-col items-center space-y-1">
                    <FileSearch className="h-5 w-5" />
                    <span className="text-xs">In Review</span>
                  </div>
                </Button>
              </Link>
              <Link href="/dashboard/officer/document-checklist">
                <Button variant="outline" className="w-full h-auto p-3">
                  <div className="flex flex-col items-center space-y-1">
                    <FileText className="h-5 w-5" />
                    <span className="text-xs">Documents</span>
                  </div>
                </Button>
              </Link>
              <Link href="/dashboard/officer/comments">
                <Button variant="outline" className="w-full h-auto p-3">
                  <div className="flex flex-col items-center space-y-1">
                    <Users className="h-5 w-5" />
                    <span className="text-xs">Comments</span>
                  </div>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentApplications.map((app) => (
              <div key={app.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{app.id}</div>
                    <div className="text-sm text-muted-foreground">{app.type} - {app.applicant}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className={getPriorityColor(app.priority)}>
                    {app.priority}
                  </Badge>
                  <Badge variant="outline" className={getStatusColor(app.status)}>
                    {app.status}
                  </Badge>
                  <div className="text-xs text-muted-foreground">{app.assignedAt}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t">
            <Link href="/dashboard/officer/assigned">
              <Button variant="outline" className="w-full">
                View All Applications
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 