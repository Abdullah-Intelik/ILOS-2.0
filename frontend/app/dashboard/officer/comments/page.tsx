'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MessageCircle, 
  Flag, 
  Send, 
  User, 
  Calendar, 
  FileText,
  Plus,
  Edit,
  Trash2
} from "lucide-react";

export default function CommentsPage() {
  const [newComment, setNewComment] = useState('');
  const [selectedApp, setSelectedApp] = useState('all');

  const [comments, setComments] = useState([
    {
      id: "1",
      applicationId: "APP001",
      applicant: "John Doe",
      text: "CNIC document verified successfully. All details match the application form.",
      section: "Documents",
      type: "comment" as const,
      createdAt: "2024-01-15T10:30:00Z",
      createdBy: "You",
      isEditable: true
    },
    {
      id: "2",
      applicationId: "APP002",
      applicant: "Jane Smith",
      text: "Salary certificate is dated more than 3 months ago. Please request updated certificate.",
      section: "Documents",
      type: "flag" as const,
      createdAt: "2024-01-15T11:00:00Z",
      createdBy: "You",
      isEditable: true
    },
    {
      id: "3",
      applicationId: "APP003",
      applicant: "Mike Johnson",
      text: "Bank statements are missing for the last 3 months. Application cannot proceed without these documents.",
      section: "Financial",
      type: "flag" as const,
      createdAt: "2024-01-15T09:45:00Z",
      createdBy: "You",
      isEditable: true
    },
    {
      id: "4",
      applicationId: "APP001",
      applicant: "John Doe",
      text: "All required documents are present and verified. Recommending approval.",
      section: "General",
      type: "comment" as const,
      createdAt: "2024-01-15T14:20:00Z",
      createdBy: "You",
      isEditable: true
    }
  ]);

  const applications = [
    { id: "APP001", applicant: "John Doe", type: "Auto Loan" },
    { id: "APP002", applicant: "Jane Smith", type: "Credit Card" },
    { id: "APP003", applicant: "Mike Johnson", type: "Cash Plus" }
  ];

  const filteredComments = selectedApp === 'all' 
    ? comments 
    : comments.filter(comment => comment.applicationId === selectedApp);

  const addComment = () => {
    if (newComment.trim() && selectedApp !== 'all') {
      const selectedAppData = applications.find(app => app.id === selectedApp);
      const comment = {
        id: `comment_${Date.now()}`,
        applicationId: selectedApp,
        applicant: selectedAppData?.applicant || '',
        text: newComment.trim(),
        section: "General",
        type: "comment" as const,
        createdAt: new Date().toISOString(),
        createdBy: "You",
        isEditable: true
      };
      setComments([comment, ...comments]);
      setNewComment('');
    }
  };

  const deleteComment = (commentId: string) => {
    setComments(comments.filter(comment => comment.id !== commentId));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeColor = (type: string) => {
    return type === 'flag' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800';
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Comments</h2>
          <p className="text-muted-foreground">
            Manage comments and flags across all applications
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {filteredComments.length} Comments
        </Badge>
      </div>

      {/* Add Comment Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add New Comment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Select value={selectedApp} onValueChange={setSelectedApp}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select application" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Applications</SelectItem>
                    {applications.map(app => (
                      <SelectItem key={app.id} value={app.id}>
                        {app.id} - {app.applicant} ({app.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Textarea
              placeholder="Write your comment here..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              disabled={selectedApp === 'all'}
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setNewComment('')}>
                Cancel
              </Button>
              <Button onClick={addComment} disabled={!newComment.trim() || selectedApp === 'all'}>
                <Send className="h-4 w-4 mr-2" />
                Add Comment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments List */}
      <div className="space-y-4">
        {filteredComments.map((comment) => (
          <Card key={comment.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    {comment.type === 'flag' ? (
                      <Flag className="h-5 w-5 text-red-500" />
                    ) : (
                      <MessageCircle className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="outline" className={getTypeColor(comment.type)}>
                        {comment.type === 'flag' ? 'Flag' : 'Comment'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {comment.section}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <div className="mb-3">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-1">
                        <FileText className="h-4 w-4" />
                        <span>{comment.applicationId}</span>
                        <User className="h-4 w-4 ml-2" />
                        <span>{comment.applicant}</span>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed">{comment.text}</p>
                  </div>
                </div>
                {comment.isEditable && (
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => deleteComment(comment.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredComments.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No comments found</h3>
            <p className="text-muted-foreground">
              {selectedApp === 'all' 
                ? "You haven't added any comments yet. Start by selecting an application above."
                : "No comments for this application yet."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 