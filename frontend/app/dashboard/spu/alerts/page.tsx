// /dashboard/spu/alerts/page.tsx
"use client"

import { AlertTriangle, CheckCircle, Info } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"

const alerts = [
  {
    id: 1,
    type: "warning",
    title: "Missing Document",
    description: "Application UBL-2024-001236 is missing Tax Return documents.",
    icon: AlertTriangle,
    color: "text-yellow-600",
    bg: "bg-yellow-100",
  },
  {
    id: 2,
    type: "success",
    title: "Successfully Verified",
    description: "Application UBL-2024-001234 has been sent to COPS.",
    icon: CheckCircle,
    color: "text-green-600",
    bg: "bg-green-100",
  },
  {
    id: 3,
    type: "info",
    title: "New Submission",
    description: "New application UBL-2024-001240 has arrived for verification.",
    icon: Info,
    color: "text-blue-600",
    bg: "bg-blue-100",
  }
]

export default function SPUAlertsPage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">SPU Alerts</h1>
      <p className="text-muted-foreground">Stay updated on application issues and activity.</p>

      {alerts.map((alert) => (
        <Card key={alert.id} className={`border-l-4 ${alert.color}`}>
          <CardHeader className="flex flex-row items-start gap-4">
            <div className={`p-2 rounded-full ${alert.bg}`}>
              <alert.icon className={`w-5 h-5 ${alert.color}`} />
            </div>
            <div>
              <CardTitle className="text-lg">{alert.title}</CardTitle>
              <CardDescription>{alert.description}</CardDescription>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}
