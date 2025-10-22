"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AlertTriangle, CheckCircle, Info, AlertCircle, Bell, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const initialAlerts = [
  {
    id: "alert-1",
    type: "warning",
    message: "Application UBL-2024-001238 was returned from SPU for missing documents.",
    time: "2 hours ago",
    read: false,
  },
  {
    id: "alert-2",
    type: "info",
    message: "New feature enabled: Auto-checklist validation is now live.",
    time: "Today",
    read: false,
  },
  {
    id: "alert-3",
    type: "success",
    message: "Loan UBL-2024-001237 was disbursed successfully.",
    time: "Yesterday",
    read: false,
  },
  {
    id: "alert-4",
    type: "error",
    message: "Application UBL-2024-001236 flagged for manual review.",
    time: "2 days ago",
    read: false,
  },
  {
    id: "alert-5",
    type: "info",
    message: "Your document has been verified by SPU.",
    time: "3 days ago",
    read: true,
  },
  {
    id: "alert-6",
    type: "success",
    message: "Your profile information has been updated successfully.",
    time: "1 week ago",
    read: true,
  },
]

const getIcon = (type: string) => {
  switch (type) {
    case "warning": return <AlertTriangle className="text-yellow-500" />
    case "info": return <Info className="text-blue-500" />
    case "success": return <CheckCircle className="text-green-500" />
    case "error": return <AlertCircle className="text-red-500" />
    default: return <Info />
  }
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(initialAlerts)
  const [activeTab, setActiveTab] = useState("all")
  
  const unreadCount = alerts.filter(alert => !alert.read).length
  
  const filteredAlerts = activeTab === "all" 
    ? alerts 
    : activeTab === "unread" 
      ? alerts.filter(alert => !alert.read)
      : alerts.filter(alert => alert.read)
  
  const markAsRead = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, read: true } : alert
    ))
  }
  
  const markAllAsRead = () => {
    setAlerts(alerts.map(alert => ({ ...alert, read: true })))
  }
  
  const deleteAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Alerts & Notifications</h1>
          <p className="text-muted-foreground">Stay updated with important information about your applications</p>
        </div>
        <Button onClick={markAllAsRead} variant="outline" disabled={unreadCount === 0}>
          Mark all as read
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="all">
              All
              <Badge className="ml-2 bg-gray-100 text-gray-900">{alerts.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread
              <Badge className="ml-2 bg-blue-100 text-blue-900">{unreadCount}</Badge>
            </TabsTrigger>
            <TabsTrigger value="read">Read</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="all" className="space-y-4 mt-0">
          {filteredAlerts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Bell className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-muted-foreground">No alerts to display</p>
              </CardContent>
            </Card>
          ) : (
            filteredAlerts.map((alert) => (
              <Card key={alert.id} className={!alert.read ? "border-l-4 border-l-blue-500" : ""}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="flex items-center gap-2 text-base font-medium">
                    {getIcon(alert.type)}
                    <span className={!alert.read ? "font-medium" : ""}>{alert.message}</span>
                    {!alert.read && <Badge className="ml-2 bg-blue-100 text-blue-900">New</Badge>}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <CardDescription className="text-xs text-muted-foreground">{alert.time}</CardDescription>
                    <div className="flex gap-1">
                      {!alert.read && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6" 
                          onClick={() => markAsRead(alert.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-red-500 hover:text-red-600" 
                        onClick={() => deleteAlert(alert.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="unread" className="space-y-4 mt-0">
          {filteredAlerts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <CheckCircle className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-muted-foreground">No unread alerts</p>
              </CardContent>
            </Card>
          ) : (
            filteredAlerts.map((alert) => (
              <Card key={alert.id} className="border-l-4 border-l-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="flex items-center gap-2 text-base font-medium">
                    {getIcon(alert.type)}
                    <span className="font-medium">{alert.message}</span>
                    <Badge className="ml-2 bg-blue-100 text-blue-900">New</Badge>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <CardDescription className="text-xs text-muted-foreground">{alert.time}</CardDescription>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6" 
                        onClick={() => markAsRead(alert.id)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-red-500 hover:text-red-600" 
                        onClick={() => deleteAlert(alert.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="read" className="space-y-4 mt-0">
          {filteredAlerts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Bell className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-muted-foreground">No read alerts</p>
              </CardContent>
            </Card>
          ) : (
            filteredAlerts.map((alert) => (
              <Card key={alert.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="flex items-center gap-2 text-base font-medium">
                    {getIcon(alert.type)}
                    {alert.message}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <CardDescription className="text-xs text-muted-foreground">{alert.time}</CardDescription>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-red-500 hover:text-red-600" 
                      onClick={() => deleteAlert(alert.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
