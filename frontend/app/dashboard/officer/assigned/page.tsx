'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  FileText, 
  Calendar, 
  User, 
  Clock,
  AlertTriangle,
  ChevronRight,
  Eye
} from "lucide-react";
import Link from "next/link";

interface Application {
  id: string;
  type: string;
  applicant: string;
  cnic: string;
  status: 'Assigned' | 'In Review' | 'Completed' | 'Overdue';
  priority: 'High' | 'Medium' | 'Low';
  assignedAt: string;
  dueDate: string;
  assignedBy: string;
  documentsCount: number;
  documentsVerified: number;
  lastComment?: string;
}

export default function AssignedApplicationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Mock data - replace with actual API calls
  const applications: Application[] = [
    {
      id: "APP001",
      type: "Auto Loan",
      applicant: "John Doe",
      cnic: "12345-6789012-3",
      status: "Assigned",
      priority: "High",
      assignedAt: "2024-01-15T10:30:00Z",
      dueDate: "2024-01-17T17:00:00Z",
      assignedBy: "SPU Head - Sarah Khan",
      documentsCount: 8,
      documentsVerified: 0,
      lastComment: "New application - priority review required"
    },
    {
      id: "APP002",
      type: "Credit Card",
      applicant: "Jane Smith",
      cnic: "98765-4321098-7",
      status: "In Review",
      priority: "Medium",
      assignedAt: "2024-01-14T14:15:00Z",
      dueDate: "2024-01-16T17:00:00Z",
      assignedBy: "SPU Head - Sarah Khan",
      documentsCount: 6,
      documentsVerified: 3,
      lastComment: "Salary certificate needs clarification"
    },
    {
      id: "APP003",
      type: "Cash Plus",
      applicant: "Mike Johnson",
      cnic: "11111-2222233-4",
      status: "Overdue",
      priority: "High",
      assignedAt: "2024-01-13T09:00:00Z",
      dueDate: "2024-01-15T17:00:00Z",
      assignedBy: "SPU Head - Sarah Khan",
      documentsCount: 5,
      documentsVerified: 2,
      lastComment: "Missing bank statements"
    },
    {
      id: "APP004",
      type: "SME Loan",
      applicant: "Alice Brown",
      cnic: "55555-6666677-8",
      status: "Assigned",
      priority: "Low",
      assignedAt: "2024-01-15T16:45:00Z",
      dueDate: "2024-01-18T17:00:00Z",
      assignedBy: "SPU Head - Sarah Khan",
      documentsCount: 12,
      documentsVerified: 0
    }
  ];

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.applicant.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.cnic.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || app.status.toLowerCase() === statusFilter;
    const matchesPriority = priorityFilter === 'all' || app.priority.toLowerCase() === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Assigned": return "bg-blue-100 text-blue-800";
      case "In Review": return "bg-yellow-100 text-yellow-800";
      case "Completed": return "bg-green-100 text-green-800";
      case "Overdue": return "bg-red-100 text-red-800";
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysUntilDue = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Assigned Applications</h2>
          <p className="text-muted-foreground">
            Applications assigned to you for review and verification
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {filteredApplications.length} Applications
        </Badge>
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
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="in review">In Review</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
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
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
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
                      {app.status === 'Overdue' && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
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
                        <span>Assigned: {formatDate(app.assignedAt)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span className={getDaysUntilDue(app.dueDate) < 0 ? 'text-red-500' : ''}>
                          Due: {formatDate(app.dueDate)}
                          {getDaysUntilDue(app.dueDate) < 0 && ' (Overdue)'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-muted-foreground">CNIC: {app.cnic}</span>
                        <span className="text-muted-foreground">
                          Documents: {app.documentsVerified}/{app.documentsCount}
                        </span>
                        <span className="text-muted-foreground">
                          Assigned by: {app.assignedBy}
                        </span>
                      </div>
                    </div>
                    {app.lastComment && (
                      <div className="mt-2 p-2 bg-muted/50 rounded-md">
                        <p className="text-sm text-muted-foreground">
                          <strong>Last comment:</strong> {app.lastComment}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <Link href={`/dashboard/officer/assigned/${app.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      Review
                    </Button>
                  </Link>
                  <Link href={`/dashboard/officer/document-checklist?app=${app.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      <FileText className="h-4 w-4 mr-2" />
                      Documents
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredApplications.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No applications found</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' 
                ? "Try adjusting your filters to see more applications."
                : "No applications have been assigned to you yet."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 