// /dashboard/spu/document-verification/page.tsx
"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, X, Eye } from "lucide-react"
import { useState } from "react"

const applications = [
  {
    id: "UBL-2024-001234",
    applicantName: "Muhammad Ali Khan",
    documents: [
      { id: "doc1", name: "CNIC Copy", status: "pending", required: true },
      { id: "doc2", name: "Salary Slip", status: "verified", required: true },
      { id: "doc3", name: "Bank Statement", status: "rejected", required: true },
    ],
  },
  {
    id: "UBL-2024-001235",
    applicantName: "Fatima Ahmed",
    documents: [
      { id: "doc4", name: "CNIC Copy", status: "verified", required: true },
      { id: "doc5", name: "Salary Slip", status: "pending", required: true },
      { id: "doc6", name: "Bank Statement", status: "verified", required: true },
    ],
  },
]

export default function SPUDocumentVerificationPage() {
  const [documents, setDocuments] = useState(applications)

  const handleViewDocument = async (appId: string, docName: string) => {
    try {
      // Extract LOS ID from app ID (assuming format like "UBL-2024-001234")
      const losId = appId.split('-').pop() || appId
      
      console.log(`🔍 Looking for document: ${docName} for LOS-${losId}`)
      
      // Try to get the actual document list from the API
      // TODO: Replace hardcoded type with actual application type when wiring real data
      const apiUrl = `/api/documents/${losId}?applicationType=smeasaan`
      console.log(`🔍 Fetching documents from: ${apiUrl}`)
      
      const response = await fetch(apiUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch documents: ${response.status}`)
      }
      
      const data = await response.json()
      console.log(`📋 Available documents:`, data.documents)
      
      if (!data.exists || !data.documents || data.documents.length === 0) {
        alert(`No documents found for ${appId}`)
        return
      }
      
      // Try to find the document by name (case-insensitive)
      const foundDoc = data.documents.find((file: any) => 
        file.name.toLowerCase().includes(docName.toLowerCase()) ||
        docName.toLowerCase().includes(file.name.toLowerCase())
      )
      
      if (!foundDoc) {
        // If exact match not found, try common document name mappings
        const docNameMappings: { [key: string]: string[] } = {
          'CNIC': ['cnic', 'id', 'identity', 'national'],
          'Salary Slip': ['salary', 'payslip', 'income', 'employment'],
          'Bank Statement': ['bank', 'statement', 'account'],
          'Employment Letter': ['employment', 'job', 'work', 'letter'],
          'Verification office/residence document': ['verification', 'office', 'residence', 'address'],
          'Photo': ['photo', 'picture', 'image'],
          'Reference': ['reference', 'ref'],
          'Calculation Sheet': ['calculation', 'sheet', 'formula']
        }
        
        const docKey = Object.keys(docNameMappings).find(key => 
          docName.toLowerCase().includes(key.toLowerCase())
        )
        
        if (docKey) {
          const possibleNames = docNameMappings[docKey]
          const matchedDoc = data.documents.find((file: any) => 
            possibleNames.some(name => file.name.toLowerCase().includes(name))
          )
          
                     if (matchedDoc) {
             console.log(`✅ Found document by mapping: ${matchedDoc.name} for ${docName}`)
             
             // Check file type for preview capability
             const fileName = matchedDoc.name.toLowerCase()
             const isHtmlFile = fileName.endsWith('.html') || fileName.endsWith('.htm')
             const isImageFile = fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || 
                                fileName.endsWith('.png') || fileName.endsWith('.gif') || 
                                fileName.endsWith('.bmp') || fileName.endsWith('.webp')
             const isPdfFile = fileName.endsWith('.pdf')
             const isTextFile = fileName.endsWith('.txt') || fileName.endsWith('.md') || 
                               fileName.endsWith('.json') || fileName.endsWith('.xml')
             
             if (!isHtmlFile && !isImageFile && !isPdfFile && !isTextFile) {
               alert(`This file type (${matchedDoc.name.split('.').pop()}) cannot be previewed. Please download it instead.`)
               return
             }
             
             // Use the direct file URL from the backend explorer
             const fileUrl = `http://localhost:8086/explorer/smeasaan/los-${losId}/${encodeURIComponent(matchedDoc.name)}`
             
             // Open the file URL in a new tab
             const newWindow = window.open(fileUrl, '_blank')
             
             if (!newWindow) {
               alert('Popup blocked. Please allow popups for this site to view files.')
               return
             }
             
             return
           }
        }
        
        // If still not found, show available documents
        const availableDocs = data.documents.map((d: any) => d.name).join(', ')
        alert(`Document "${docName}" not found. Available: ${availableDocs}`)
        return
      }
      
             // Found the document, open it using blob-based approach
       console.log(`✅ Found document: ${foundDoc.name} for ${docName}`)
       
       // Check file type for preview capability
       const fileName = foundDoc.name.toLowerCase()
       const isHtmlFile = fileName.endsWith('.html') || fileName.endsWith('.htm')
       const isImageFile = fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || 
                          fileName.endsWith('.png') || fileName.endsWith('.gif') || 
                          fileName.endsWith('.bmp') || fileName.endsWith('.webp')
       const isPdfFile = fileName.endsWith('.pdf')
       const isTextFile = fileName.endsWith('.txt') || fileName.endsWith('.md') || 
                         fileName.endsWith('.json') || fileName.endsWith('.xml')
       
       if (!isHtmlFile && !isImageFile && !isPdfFile && !isTextFile) {
         alert(`This file type (${foundDoc.name.split('.').pop()}) cannot be previewed. Please download it instead.`)
         return
       }
       
       // Use the direct file URL from the backend explorer
       const fileUrl = `http://localhost:8086/explorer/smeasaan/los-${losId}/${encodeURIComponent(foundDoc.name)}`
       
       // Open the file URL in a new tab
       const newWindow = window.open(fileUrl, '_blank')
       
       if (!newWindow) {
         alert('Popup blocked. Please allow popups for this site to view files.')
         return
       }
    } catch (error) {
      console.error('Error viewing document:', error)
      alert('Failed to open document. Please try again.')
    }
  }

  const handleDocumentVerify = (appId: string, docId: string) => {
    setDocuments((prevDocs) => {
      return prevDocs.map((app) => {
        if (app.id === appId) {
          const updatedDocuments = app.documents.map((doc) => {
            if (doc.id === docId) {
              return { ...doc, status: "verified" }
            }
            return doc
          })
          return { ...app, documents: updatedDocuments }
        }
        return app
      })
    })
  }

  const handleDocumentReject = (appId: string, docId: string) => {
    setDocuments((prevDocs) => {
      return prevDocs.map((app) => {
        if (app.id === appId) {
          const updatedDocuments = app.documents.map((doc) => {
            if (doc.id === docId) {
              return { ...doc, status: "rejected" }
            }
            return doc
          })
          return { ...app, documents: updatedDocuments }
        }
        return app
      })
    })
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Document Verification</h1>
      <p className="text-muted-foreground">Verify and manage documents for each application.</p>

      <Card>
        <CardHeader>
          <CardTitle>Applications Pending Document Verification</CardTitle>
          <CardDescription>Mark documents as verified or rejected based on the application status.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>LOS ID</TableHead>
                <TableHead>Applicant</TableHead>
                <TableHead>Document</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((app) => (
                <React.Fragment key={app.id}>
                  {app.documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-mono text-sm">{app.id}</TableCell>
                      <TableCell>{app.applicantName}</TableCell>
                      <TableCell>{doc.name}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            doc.status === "verified"
                              ? "default"
                              : doc.status === "pending"
                              ? "outline"
                              : "destructive"
                          }
                        >
                          {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2">
                          <button
                            className="text-blue-600 hover:text-blue-800"
                            onClick={() => handleViewDocument(app.id, doc.name)}
                            title="View Document"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          {doc.status === "pending" && (
                            <>
                              <button
                                className="text-green-600 hover:text-green-800"
                                onClick={() => handleDocumentVerify(app.id, doc.id)}
                              >
                                <CheckCircle className="h-5 w-5" />
                              </button>
                              <button
                                className="text-red-600 hover:text-red-800"
                                onClick={() => handleDocumentReject(app.id, doc.id)}
                              >
                                <X className="h-5 w-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
