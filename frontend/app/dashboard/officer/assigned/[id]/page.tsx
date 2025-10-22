'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  MessageCircle, 
  Flag,
  Eye,
  Download,
  Save,
  Send,
  User,
  Calendar,
  Clock,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

interface Document {
  id: string;
  name: string;
  type: string;
  status: 'present' | 'missing' | 'invalid' | 'verified';
  flagged: boolean;
  comment?: string;
  uploadedAt?: string;
  verifiedAt?: string;
  fileUrl?: string;
}

interface Comment {
  id: string;
  text: string;
  section: string;
  createdAt: string;
  createdBy: string;
  type: 'comment' | 'flag';
}

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState('documents');

  // Mock data - replace with actual API calls
  const application = {
    id: id as string,
    type: "Auto Loan",
    applicant: "John Doe",
    cnic: "12345-6789012-3",
    status: "Assigned",
    priority: "High",
    assignedAt: "2024-01-15T10:30:00Z",
    dueDate: "2024-01-17T17:00:00Z",
    assignedBy: "SPU Head - Sarah Khan",
    amount: "PKR 2,500,000",
    phoneNumber: "+92 300 1234567",
    email: "john.doe@email.com"
  };

  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "doc1",
      name: "CNIC Copy",
      type: "Identity",
      status: "present",
      flagged: false,
      uploadedAt: "2024-01-15T10:00:00Z",
      fileUrl: "/documents/cnic.pdf"
    },
    {
      id: "doc2",
      name: "Salary Certificate",
      type: "Income",
      status: "present",
      flagged: true,
      comment: "Certificate date is older than 3 months",
      uploadedAt: "2024-01-15T10:05:00Z",
      fileUrl: "/documents/salary.pdf"
    },
    {
      id: "doc3",
      name: "Bank Statement (3 months)",
      type: "Financial",
      status: "missing",
      flagged: true,
      comment: "Missing bank statements for last 3 months"
    },
    {
      id: "doc4",
      name: "Vehicle Registration",
      type: "Collateral",
      status: "present",
      flagged: false,
      uploadedAt: "2024-01-15T10:10:00Z",
      fileUrl: "/documents/vehicle.pdf"
    },
    {
      id: "doc5",
      name: "Insurance Policy",
      type: "Insurance",
      status: "invalid",
      flagged: true,
      comment: "Insurance policy expired",
      uploadedAt: "2024-01-15T10:15:00Z",
      fileUrl: "/documents/insurance.pdf"
    }
  ]);

  const [comments, setComments] = useState<Comment[]>([
    {
      id: "comment1",
      text: "Application assigned for review - priority case",
      section: "General",
      createdAt: "2024-01-15T10:30:00Z",
      createdBy: "SPU Head - Sarah Khan",
      type: "comment"
    },
    {
      id: "comment2",
      text: "Salary certificate needs to be updated",
      section: "Documents",
      createdAt: "2024-01-15T11:00:00Z",
      createdBy: "SPU Officer - You",
      type: "flag"
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present": return "bg-green-100 text-green-800";
      case "missing": return "bg-red-100 text-red-800";
      case "invalid": return "bg-yellow-100 text-yellow-800";
      case "verified": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "missing": return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "invalid": return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "verified": return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default: return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleDocumentStatusChange = (docId: string, newStatus: Document['status']) => {
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

  const handleAddComment = (docId: string, comment: string) => {
    setDocuments(docs => 
      docs.map(doc => 
        doc.id === docId ? { ...doc, comment } : doc
      )
    );
  };

  const addGeneralComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: `comment_${Date.now()}`,
        text: newComment.trim(),
        section: "General",
        createdAt: new Date().toISOString(),
        createdBy: "SPU Officer - You",
        type: "comment"
      };
      setComments([...comments, comment]);
      setNewComment('');
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

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/officer/assigned">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Assigned
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Application Review</h2>
            <p className="text-muted-foreground">
              Review and verify application documents
            </p>
          </div>
        </div>
      </div>

      {/* Application Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Application Details</span>
            <Badge variant="outline" className="bg-red-100 text-red-800">
              {application.priority} Priority
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">ID:</span>
              <span className="font-medium">{application.id}</span>
            </div>
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Applicant:</span>
              <span className="font-medium">{application.applicant}</span>
            </div>
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Type:</span>
              <span className="font-medium">{application.type}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">CNIC:</span>
              <span className="font-medium">{application.cnic}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Amount:</span>
              <span className="font-medium">{application.amount}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Due:</span>
              <span className="font-medium">{formatDate(application.dueDate)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="documents">Document Checklist</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SPU Document Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="border rounded-lg p-4 hover:bg-muted/50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="mt-1">
                          {getStatusIcon(doc.status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium">{doc.name}</h4>
                            <Badge variant="outline" className={getStatusColor(doc.status)}>
                              {doc.status}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {doc.type}
                            </Badge>
                            {doc.flagged && (
                              <Flag className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                          {doc.uploadedAt && (
                            <p className="text-sm text-muted-foreground">
                              Uploaded: {formatDate(doc.uploadedAt)}
                            </p>
                          )}
                          {doc.comment && (
                            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                              <p className="text-sm text-yellow-800">{doc.comment}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {doc.fileUrl && (
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        )}
                        <Button
                          variant={doc.flagged ? "destructive" : "outline"}
                          size="sm"
                          onClick={() => handleFlagToggle(doc.id)}
                        >
                          <Flag className="h-4 w-4 mr-1" />
                          {doc.flagged ? "Unflag" : "Flag"}
                        </Button>
                      </div>
                    </div>
                    
                    {/* Document Actions */}
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">Status:</span>
                          <select 
                            value={doc.status}
                            onChange={(e) => handleDocumentStatusChange(doc.id, e.target.value as Document['status'])}
                            className="text-sm border rounded px-2 py-1"
                          >
                            <option value="present">Present</option>
                            <option value="missing">Missing</option>
                            <option value="invalid">Invalid</option>
                            <option value="verified">Verified</option>
                          </select>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              placeholder="Add comment..."
                              className="flex-1 text-sm border rounded px-2 py-1"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleAddComment(doc.id, e.currentTarget.value);
                                  e.currentTarget.value = '';
                                }
                              }}
                            />
                            <Button size="sm" variant="outline">
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Comments & Flags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          {comment.type === 'flag' ? (
                            <Flag className="h-4 w-4 text-red-500" />
                          ) : (
                            <MessageCircle className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium">{comment.createdBy}</span>
                            <Badge variant="outline" className="text-xs">
                              {comment.section}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm">{comment.text}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Add Comment */}
              <div className="mt-6 pt-4 border-t">
                <div className="space-y-3">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setNewComment('')}>
                      Cancel
                    </Button>
                    <Button onClick={addGeneralComment}>
                      <Send className="h-4 w-4 mr-2" />
                      Add Comment
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline">
          <Save className="h-4 w-4 mr-2" />
          Save Progress
        </Button>
        <Button>
          <Send className="h-4 w-4 mr-2" />
          Submit Review
        </Button>
      </div>
    </div>
  );
} 