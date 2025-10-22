"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CheckCircle, AlertCircle, Clock, FileText, Eye, MessageSquare, AlertTriangle, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { ChecklistItem, DocumentData } from "@/app/dashboard/applicant/auto/personalautoloans/page"

interface InteractiveChecklistStepProps {
  items: ChecklistItem[]
  documentData: DocumentData
  onItemUpdate: (itemId: string, updates: Partial<ChecklistItem>) => void
}

export function InteractiveChecklistStep({ items, documentData, onItemUpdate }: InteractiveChecklistStepProps) {
  const [commentDialog, setCommentDialog] = useState<{ open: boolean; itemId: string }>({
    open: false,
    itemId: "",
  })
  const [comment, setComment] = useState("")
  const { toast } = useToast()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "skipped":
        return <AlertCircle className="h-5 w-5 text-orange-500" />
      case "error":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string, required: boolean) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Complete</Badge>
      case "skipped":
        return (
          <Badge variant="outline" className="text-orange-600">
            Skipped
          </Badge>
        )
      case "error":
        return <Badge variant="destructive">Error</Badge>
      default:
        return required ? <Badge variant="destructive">Required</Badge> : <Badge variant="outline">Optional</Badge>
    }
  }

  const handleAddComment = (itemId: string) => {
    setCommentDialog({ open: true, itemId })
  }

  const saveComment = () => {
    if (!comment.trim()) {
      toast({
        variant: "destructive",
        title: "Comment Required",
        description: "Please enter a comment before saving",
      })
      return
    }

    // Here you would typically save the comment to your backend
    toast({
      title: "Comment Added",
      description: "Your comment has been saved for this checklist item",
    })

    setCommentDialog({ open: false, itemId: "" })
    setComment("")
  }

  const completedItems = items.filter((item) => item.status === "completed").length
  const totalItems = items.length
  const requiredItems = items.filter((item) => item.required).length
  const completedRequiredItems = items.filter(
    (item) => item.required && (item.status === "completed" || item.status === "skipped"),
  ).length

  const progressPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold">Verification Checklist</h3>
        <p className="text-muted-foreground">
          Review all requirements and verify document completeness before proceeding
        </p>
      </div>

      {/* Progress Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedItems}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Required</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{requiredItems}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(progressPercentage)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Completion Status Alert */}
      {completedRequiredItems < requiredItems && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Incomplete Requirements</AlertTitle>
          <AlertDescription>
            {requiredItems - completedRequiredItems} required items are still pending. Please complete or skip them with
            valid reasons to proceed.
          </AlertDescription>
        </Alert>
      )}

      {completedRequiredItems === requiredItems && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>All Requirements Met</AlertTitle>
          <AlertDescription>
            All required checklist items have been completed or properly documented. You can now proceed to the final
            review.
          </AlertDescription>
        </Alert>
      )}

      {/* Interactive Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Verification Checklist
            <Badge variant="outline">
              {completedItems}/{totalItems} Complete
            </Badge>
          </CardTitle>
          <CardDescription>Review each item and verify document completeness</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {items.map((item) => {
              const documentInfo = item.documentType ? documentData[item.documentType] : null

              return (
                <AccordionItem key={item.id} value={item.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 flex-1">
                      {getStatusIcon(item.status)}
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.title}</span>
                          {getStatusBadge(item.status, item.required)}
                        </div>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-4">
                      {/* Document Status */}
                      {item.documentType && documentInfo && (
                        <div className="p-4 border rounded-lg bg-gray-50">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">Document Status</h4>
                            <Badge variant="outline" className="capitalize">
                              {documentInfo.status}
                            </Badge>
                          </div>

                          {documentInfo.status === "completed" && (
                            <div className="space-y-2">
                              <p className="text-sm text-green-600">✓ Document uploaded and processed successfully</p>
                              {documentInfo.confidence && (
                                <p className="text-sm">Parsing confidence: {documentInfo.confidence}%</p>
                              )}
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Document
                                </Button>
                                <Button variant="outline" size="sm">
                                  View Extracted Data
                                </Button>
                              </div>
                            </div>
                          )}

                          {documentInfo.status === "skipped" && (
                            <div className="space-y-2">
                              <p className="text-sm text-orange-600">⚠ Document was skipped</p>
                              <p className="text-sm">Reason: {documentInfo.skipReason}</p>
                            </div>
                          )}

                          {documentInfo.status === "error" && (
                            <div className="space-y-2">
                              <p className="text-sm text-red-600">✗ Document processing failed</p>
                              <Button variant="outline" size="sm">
                                Retry Upload
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Manual Verification Options */}
                      {!item.documentType && (
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">Manual Verification</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            This item requires manual verification by the Personal Banker
                          </p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => onItemUpdate(item.id, { status: "completed" })}
                              disabled={item.status === "completed"}
                            >
                              Mark as Complete
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onItemUpdate(item.id, { status: "skipped" })}
                              disabled={item.status === "skipped"}
                            >
                              Mark as Skipped
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Additional Actions */}
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleAddComment(item.id)}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Add Comment
                        </Button>

                        {item.status === "error" && (
                          <Button variant="outline" size="sm">
                            Report Issue
                          </Button>
                        )}
                      </div>

                      {/* Conditional Requirements Info */}
                      {item.conditional && (
                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertTitle>Conditional Requirement</AlertTitle>
                          <AlertDescription>
                            This item is required based on: {item.conditional.field} ={" "}
                            {Array.isArray(item.conditional.value)
                              ? item.conditional.value.join(", ")
                              : item.conditional.value}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </CardContent>
      </Card>

      {/* Comment Dialog */}
      <Dialog open={commentDialog.open} onOpenChange={(open) => setCommentDialog({ ...commentDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Comment</DialogTitle>
            <DialogDescription>Add a comment or note for this checklist item</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="comment">Comment *</Label>
              <Textarea
                id="comment"
                placeholder="Enter your comment or observations..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCommentDialog({ open: false, itemId: "" })}>
              Cancel
            </Button>
            <Button onClick={saveComment} disabled={!comment.trim()}>
              Save Comment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
