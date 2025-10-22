'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Clock, 
  User, 
  FileText,
  Mark,
  X,
  Eye,
  Calendar
} from "lucide-react";

interface Notification {
  id: string;
  type: 'assignment' | 'return' | 'comment' | 'deadline' | 'approval' | 'system';
  title: string;
  message: string;
  applicationId?: string;
  applicant?: string;
  timestamp: string;
  isRead: boolean;
  priority: 'high' | 'medium' | 'low';
  actionRequired?: boolean;
}

export default function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "assignment",
      title: "New Application Assigned",
      message: "Auto Loan application APP001 has been assigned to you for review",
      applicationId: "APP001",
      applicant: "John Doe",
      timestamp: "2024-01-15T10:30:00Z",
      isRead: false,
      priority: "high",
      actionRequired: true
    },
    {
      id: "2",
      type: "deadline",
      title: "Review Deadline Approaching",
      message: "Application APP002 review deadline is in 4 hours",
      applicationId: "APP002",
      applicant: "Jane Smith",
      timestamp: "2024-01-15T13:00:00Z",
      isRead: false,
      priority: "high",
      actionRequired: true
    },
    {
      id: "3",
      type: "return",
      title: "Application Returned",
      message: "Your review of APP003 has been returned by SPU Head for additional verification",
      applicationId: "APP003",
      applicant: "Mike Johnson",
      timestamp: "2024-01-15T11:45:00Z",
      isRead: false,
      priority: "medium",
      actionRequired: true
    },
    {
      id: "4",
      type: "comment",
      title: "New Comment Added",
      message: "SPU Head added a comment to your review of APP001",
      applicationId: "APP001",
      applicant: "John Doe",
      timestamp: "2024-01-15T09:15:00Z",
      isRead: true,
      priority: "medium",
      actionRequired: false
    },
    {
      id: "5",
      type: "approval",
      title: "Application Approved",
      message: "Your review of APP004 has been approved by SPU Head",
      applicationId: "APP004",
      applicant: "Sarah Wilson",
      timestamp: "2024-01-14T16:30:00Z",
      isRead: true,
      priority: "low",
      actionRequired: false
    },
    {
      id: "6",
      type: "system",
      title: "System Maintenance",
      message: "Scheduled system maintenance on January 20th from 2:00 AM to 4:00 AM",
      timestamp: "2024-01-14T10:00:00Z",
      isRead: true,
      priority: "low",
      actionRequired: false
    }
  ]);

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'read') return notification.isRead;
    return true;
  });

  const markAsRead = (notificationId: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === notificationId 
        ? { ...notification, isRead: true }
        : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => 
      ({ ...notification, isRead: true })
    ));
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(notifications.filter(notification => 
      notification.id !== notificationId
    ));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'assignment': return <FileText className="h-5 w-5 text-blue-600" />;
      case 'deadline': return <Clock className="h-5 w-5 text-red-600" />;
      case 'return': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'comment': return <User className="h-5 w-5 text-purple-600" />;
      case 'approval': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'system': return <Info className="h-5 w-5 text-gray-600" />;
      default: return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'assignment': return 'bg-blue-100 text-blue-800';
      case 'deadline': return 'bg-red-100 text-red-800';
      case 'return': return 'bg-yellow-100 text-yellow-800';
      case 'comment': return 'bg-purple-100 text-purple-800';
      case 'approval': return 'bg-green-100 text-green-800';
      case 'system': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  // Statistics
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const actionRequiredCount = notifications.filter(n => n.actionRequired && !n.isRead).length;
  const highPriorityCount = notifications.filter(n => n.priority === 'high' && !n.isRead).length;

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
          <p className="text-muted-foreground">
            Stay updated with alerts, assignments, and system notifications
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            {unreadCount} Unread
          </Badge>
          {actionRequiredCount > 0 && (
            <Badge variant="destructive" className="text-sm">
              {actionRequiredCount} Action Required
            </Badge>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.length}</div>
            <p className="text-xs text-muted-foreground">All notifications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <Bell className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{unreadCount}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Action Required</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{actionRequiredCount}</div>
            <p className="text-xs text-muted-foreground">Urgent items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{highPriorityCount}</div>
            <p className="text-xs text-muted-foreground">Important alerts</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Button 
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
            >
              All ({notifications.length})
            </Button>
            <Button 
              variant={filter === 'unread' ? 'default' : 'outline'}
              onClick={() => setFilter('unread')}
            >
              Unread ({unreadCount})
            </Button>
            <Button 
              variant={filter === 'read' ? 'default' : 'outline'}
              onClick={() => setFilter('read')}
            >
              Read ({notifications.length - unreadCount})
            </Button>
            <div className="flex-1" />
            <Button variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <Card 
            key={notification.id} 
            className={`hover:shadow-md transition-shadow ${
              !notification.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50/50' : ''
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="mt-1">
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className={`font-medium ${!notification.isRead ? 'font-semibold' : ''}`}>
                        {notification.title}
                      </h4>
                      <Badge variant="outline" className={getTypeColor(notification.type)}>
                        {notification.type}
                      </Badge>
                      <Badge variant="outline" className={getPriorityColor(notification.priority)}>
                        {notification.priority}
                      </Badge>
                      {notification.actionRequired && (
                        <Badge variant="destructive" className="text-xs">
                          Action Required
                        </Badge>
                      )}
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      {notification.applicationId && (
                        <div className="flex items-center space-x-1">
                          <FileText className="h-3 w-3" />
                          <span>{notification.applicationId}</span>
                          {notification.applicant && (
                            <>
                              <span>•</span>
                              <span>{notification.applicant}</span>
                            </>
                          )}
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(notification.timestamp)}</span>
                        <span>({getTimeAgo(notification.timestamp)})</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {!notification.isRead && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => markAsRead(notification.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Mark Read
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => deleteNotification(notification.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredNotifications.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No notifications found</h3>
            <p className="text-muted-foreground">
              {filter === 'unread' 
                ? "All caught up! No unread notifications."
                : filter === 'read'
                ? "No read notifications to show."
                : "No notifications available."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 