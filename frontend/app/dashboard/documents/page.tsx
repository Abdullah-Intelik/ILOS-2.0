"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Eye, Check, X, Download, AlertCircle, Server, ExternalLink, Grid, List, Search, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import DocumentExplorer from '@/components/document-explorer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

interface Application {
  id: string;
  los_id: string;
  applicant_name: string;
  loan_type: string;
  loan_amount: string;
  status: string;
  created_at: string;
  lastUpdate: string;
  application_type?: string; // Added for auto-selection logic
}

interface UploadFile {
  file: File;
  documentType: string;
  customName?: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  ocrStatus?: 'idle' | 'processing' | 'success' | 'error';
  ocrData?: any;
  ocrError?: string;
  ocrSaved?: boolean;
  validation?: {
    status: 'pending' | 'pass' | 'fail';
    checks: Array<{ field: string; expected: any; actual: any; match: boolean; note?: string }>;
  };
  showOcr?: boolean;
  skipValidation?: boolean;
}

const DocumentManagement: React.FC = () => {
  const router = useRouter();
  const [selectedFiles, setSelectedFiles] = useState<UploadFile[]>([]);
  const [loan_type, setloan_type] = useState<string>('');
  const [losId, setLosId] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [activeTab, setActiveTab] = useState<string>('upload');
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [showCustomerSelector, setShowCustomerSelector] = useState(false);
  const [searchCustomer, setSearchCustomer] = useState('');
  const [selectedApplicationForDocs, setSelectedApplicationForDocs] = useState<Application | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [documentType, setDocumentType] = useState('');
  const [enableValidation, setEnableValidation] = useState(true);
  // Inline preview state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState<{
    url: string;
    kind: 'image' | 'pdf' | 'text' | 'html' | 'unsupported';
    name: string;
    text?: string;
  } | null>(null);
  // Right-panel OCR selection
  const [selectedOcrIndex, setSelectedOcrIndex] = useState<number | null>(null);
  
  // OCR integration
  const ocrBase = process.env.NEXT_PUBLIC_OCR_BASE_URL || ''
  const OCR_ENDPOINTS: Record<string, string> = {
    'CNIC': ocrBase ? `${ocrBase.replace(/\/$/, '')}8001/upload-cnic/` : '',
    'Salary Slip': ocrBase ? `${ocrBase.replace(/\/$/, '')}8003/process-payslip` : ''
  };
  
  const isOcrDocument = (doc: string) => doc === 'CNIC' || doc === 'Salary Slip';

  // Robust loan type label → slug mapper to avoid blanks when labels vary
  const mapLoanTypeLabelToSlug = (label: string): string => {
    if (!label) return 'cashplus'
    const lower = label.toLowerCase()
    
    // Backend V2.0 product types
    if (lower === 'personal_loan') return 'cashplus' // Backend V2.0 uses 'personal_loan' for CashPlus
    if (lower === 'auto_loan') return 'autoloan'
    if (lower === 'islamic_finance') return 'ameendrive'
    if (lower === 'sme_loan') return 'smeasaan'
    if (lower === 'credit_card') return 'creditcard'
    if (lower === 'instant_loan') return 'cashplus' // Instant Loan uses cashplus folder
    
    // Legacy V1 labels (for backward compatibility)
    if (lower.includes('cash') && lower.includes('plus')) return 'cashplus'
    if (lower.includes('auto')) return 'autoloan'
    if (lower.includes('ameendrive') || (lower.includes('ameen') && lower.includes('drive'))) return 'ameendrive'
    if (lower.includes('sme') && (lower.includes('asaan') || lower.includes('loan'))) return 'smeasaan'
    if (lower.includes('commercial') && (lower.includes('vehicle') || lower.includes('sme'))) return 'commercialVehicle'
    if (lower.includes('credit') && lower.includes('card')) return 'creditcard'
    
    return 'cashplus' // Default fallback
  }
  
  const runOcr = async (file: File, doc: string) => {
    const url = OCR_ENDPOINTS[doc];
    if (!url) return null;
    const form = new FormData();
    form.append('file', file);
    const resp = await fetch(url, { method: 'POST', body: form });
    if (!resp.ok) throw new Error(`OCR failed with status ${resp.status}`);
    return await resp.json();
  };
  
  const saveOcrResult = async (data: any, doc: string) => {
    try {
      const numericLosId = losId.replace(/^LOS-/, '');
      if (!loan_type || !numericLosId) return false;
      const resp = await fetch('http://localhost:8086/save-ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ loan_type, los_id: numericLosId, document_type: doc, ocr_data: data })
      });
      if (!resp.ok) return false;
      const json = await resp.json();
      return !!json.success;
    } catch (_) {
      return false;
    }
  };

  // Validate OCR data against application data pulled from backend
  const fetchApplicationByLos = async (los: string) => {
    try {
      const id = parseInt(los.replace(/^LOS-/, ''));
      const apiRoot = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const resp = await fetch(`${apiRoot}/api/applications/${id}`);
      if (!resp.ok) throw new Error('Failed');
      return await resp.json();
    } catch (_) {
      return null;
    }
  };

  const validateOcr = async (file: UploadFile) => {
    if (!file.ocrData) return file;
    const app = await fetchApplicationByLos(losId);
    if (!app) {
      const emptyChecks: Array<{ field: string; expected: any; actual: any; match: boolean; note?: string }> = [];
      return { ...file, validation: { status: 'pending', checks: emptyChecks } };
    }

    const checks: Array<{ field: string; expected: any; actual: any; match: boolean; note?: string }> = [];
    if (file.documentType === 'CNIC') {
      const expectedName = (app.full_name || `${app.first_name || ''} ${app.last_name || ''}`).trim();
      const actualName = `${file.ocrData.name || ''}`.trim();
      checks.push({ field: 'Name', expected: expectedName, actual: actualName, match: expectedName && actualName ? expectedName.toLowerCase() === actualName.toLowerCase() : false });

      const expectedCnic = (app.applicant_cnic || app.cnic || '').replace(/\D/g, '');
      const actualCnic = (file.ocrData.identity_number || file.ocrData.cnic || '').replace(/\D/g, '');
      checks.push({ field: 'CNIC', expected: expectedCnic, actual: actualCnic, match: !!expectedCnic && expectedCnic === actualCnic });
    }
    if (file.documentType === 'Salary Slip') {
      const expectedCnic = (app.applicant_cnic || app.cnic || '').replace(/\D/g, '');
      const actualCnic = (file.ocrData.cnic || '').replace(/\D/g, '');
      checks.push({ field: 'CNIC', expected: expectedCnic, actual: actualCnic, match: !!expectedCnic && expectedCnic === actualCnic });

      const expectedSalary = app.net_monthly_income || app.net_take_home || app.gross_monthly_income || null;
      // Be conservative: strip all non-digits and parse as integer to avoid locale/decimal issues like 0.37
      const salaryDigits = `${file.ocrData.salary ?? ''}`.replace(/\D/g, '');
      const actualSalary = salaryDigits ? parseInt(salaryDigits, 10) : null;
      const match = expectedSalary && actualSalary ? Math.abs(Number(expectedSalary) - Number(actualSalary)) <= 5 : false;
      checks.push({ field: 'Salary', expected: expectedSalary, actual: actualSalary, match, note: 'Match within 5 PKR tolerated' });
    }

    const status: 'pass' | 'fail' = checks.every(c => c.match) ? 'pass' : 'fail';
    return { ...file, validation: { status, checks } } as UploadFile;
  };
  // Check server status on component mount and load last application submission
  useEffect(() => {
    checkServerStatus();
    
    // Check for last application submission
    const lastSubmission = localStorage.getItem('lastApplicationSubmission');
    if (lastSubmission) {
      try {
        const submissionInfo = JSON.parse(lastSubmission);
        // Fetch applications from backend to find the matching one
        fetchApplicationsAndAutoSelect(submissionInfo);
        
        // Clear the localStorage after using it
        localStorage.removeItem('lastApplicationSubmission');
      } catch (error) {
        console.error('Error parsing last application submission:', error);
      }
    }
  }, []);

  // Function to fetch applications and auto-select the last submitted one
  const fetchApplicationsAndAutoSelect = async (submissionInfo: {applicationId: number, applicationType: string}) => {
    setLoadingApplications(true);
    try {
      // Fetch the specific application by LOS ID instead of searching through PB list
      // (Application might have been auto-assigned to EAVMU_OFFICER and won't be in PB list)
      const losIdToFetch = typeof submissionInfo.applicationId === 'number' 
        ? submissionInfo.applicationId 
        : submissionInfo.applicationId.toString().replace('LOS-', '');
      
      const directResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/applications/form/${losIdToFetch}`);
      
      if (directResponse.ok) {
        const directResult = await directResponse.json();
        
        if (directResult.success && directResult.data) {
          const appData = directResult.data;
          
          // Build application object from direct fetch
          // Log raw data to debug
          console.log('📋 Raw appData from backend:', {
            customer_name: appData.customer_name,
            first_name: appData.first_name,
            last_name: appData.last_name,
            name: appData.name,
            cnic: appData.cnic,
            ALL_KEYS: Object.keys(appData)
          });
          
          // Try multiple name sources with detailed logging
          let applicantName = 'Unknown';
          
          if (appData.customer_name && appData.customer_name.trim()) {
            applicantName = appData.customer_name.trim();
            console.log('✅ Name from customer_name:', applicantName);
          } else if (appData.name && appData.name.trim()) {
            applicantName = appData.name.trim();
            console.log('✅ Name from name:', applicantName);
          } else if (appData.first_name || appData.last_name) {
            applicantName = `${appData.first_name || ''} ${appData.last_name || ''}`.trim();
            if (applicantName) {
              console.log('✅ Name from first_name + last_name:', applicantName);
            } else {
              console.warn('⚠️ first_name and last_name exist but are empty');
            }
          } else {
            console.error('❌ NO NAME FIELDS FOUND IN BACKEND RESPONSE!');
          }
          
          const matchingApp = {
            id: `LOS-${appData.los_id || losIdToFetch}`,
            los_id: appData.los_id || parseInt(losIdToFetch, 10),
            applicant_name: applicantName,
            cnic: appData.cnic,
            product_type: appData.product_type,
            requested_amount: appData.requested_amount || appData.amount,
            current_stage: appData.current_stage,
            status: appData.status,
            created_at: appData.created_at || appData.submitted_at
          };
          
          console.log('✅ Built matchingApp:', matchingApp);
          
          console.log('✅ Direct fetch successful:', matchingApp);
          
          // Auto-select the application
          handleCustomerSelect(matchingApp);
          setDocumentType('Application Form Physical Copy');
          
          toast({
            title: "Customer Auto-Selected",
            description: `Selected ${matchingApp.applicant_name} (LOS-${matchingApp.los_id}). Please upload the Application Form Physical Copy first.`,
          });
          
          // Also fetch full PB list for the dropdown
          const listResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/applications/department/PB/paginated?page=1&limit=100`);
          if (listResponse.ok) {
            const listResult = await listResponse.json();
            const listData = listResult.data || listResult.applications || listResult;
            setApplications(Array.isArray(listData) ? listData : []);
          }
        } else {
          throw new Error('Application not found in database');
        }
      } else {
        throw new Error(`Failed to fetch application: ${directResponse.status}`);
      }
    } catch (error) {
      console.error('Error fetching applications for auto-select:', error);
      toast({
        title: "Error loading applications",
        description: "Could not load customer applications. Please select manually.",
        variant: "destructive",
      });
    } finally {
      setLoadingApplications(false);
    }
  };

  const checkServerStatus = async () => {
    try {
      const response = await fetch('http://localhost:8086/', { 
        method: 'GET',
        mode: 'no-cors' // This will help us detect if server is running
      });
      setServerStatus('online');
    } catch (error) {
      setServerStatus('offline');
      console.warn('FileZilla server appears to be offline:', error);
    }
  };

  const fetchApplications = async () => {
    setLoadingApplications(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/applications/department/PB/paginated?page=1&limit=100`);
      if (response.ok) {
        const result = await response.json();
        // Backend V2.0 returns: { success: true, data: [...], total, page, pageSize }
        const data = result.data || result.applications || result;
        setApplications(Array.isArray(data) ? data : []);
      } else {
        throw new Error('Failed to fetch applications');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: "Error loading applications",
        description: "Could not load customer applications. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingApplications(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newUploadFiles: UploadFile[] = [];

    files.forEach(file => {
      // Validate file type
      const allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!allowedTypes.includes(fileExtension)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported file type. Please select PDF, DOC, DOCX, JPG, or PNG files.`,
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is too large. Please select files smaller than 10MB.`,
          variant: "destructive",
        });
        return;
      }

      // Generate automatic filename based on LOS ID and document type
      const numericLosId = losId.replace(/^LOS-/, '');
      const autoFileName = `${numericLosId}-${documentType || 'DOCUMENT'}.${fileExtension}`;

      const newItem: UploadFile = {
        file,
        documentType: documentType || 'Other',
        customName: autoFileName,
        status: 'pending',
        progress: 0,
        ocrStatus: isOcrDocument(documentType) ? 'processing' : 'idle',
        showOcr: true
      };
      newUploadFiles.push(newItem);
    });

    if (newUploadFiles.length > 0) {
      setSelectedFiles(prev => {
        const merged = [...prev, ...newUploadFiles];
        // Kick off OCR for new OCR-eligible files
        newUploadFiles.forEach(async (f) => {
          if (isOcrDocument(f.documentType)) {
            try {
              const ocrJson = await runOcr(f.file, f.documentType);
              const ocrData = ocrJson?.data ?? ocrJson;
              // Update OCR result first
              setSelectedFiles(curr => curr.map(sf => (sf.customName === f.customName ? { ...sf, ocrStatus: 'success', ocrData } : sf)));
              // Then compute validation against form data (if enabled)
              if (enableValidation) {
                const validated = await validateOcr({ ...f, ocrData });
                setSelectedFiles(curr => curr.map(sf => (sf.customName === f.customName ? { ...sf, validation: validated.validation as UploadFile['validation'] } : sf)));
              }
              const saved = await saveOcrResult(ocrData, f.documentType);
              if (saved) {
                setSelectedFiles(curr => curr.map(sf => (sf.customName === f.customName ? { ...sf, ocrSaved: true } : sf)));
              }
              toast({ title: 'OCR completed', description: `${f.documentType} data extracted.` });
            } catch (err: any) {
              setSelectedFiles(curr => curr.map(sf => (sf.customName === f.customName ? { ...sf, ocrStatus: 'error', ocrError: err?.message || 'OCR failed' } : sf)));
              toast({ title: 'OCR failed', description: `Could not process ${f.documentType}.`, variant: 'destructive' });
            }
          }
        });
        return merged;
      });
      toast({
        title: "Files selected",
        description: `${newUploadFiles.length} file(s) added for upload`,
      });
    }
  };

  const handleUpload = async () => {
    // If no files selected, prompt to upload first
    if (selectedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please add at least one document before uploading.",
        variant: "destructive",
      });
      return;
    }
    if (!loan_type || !losId) {
      toast({
        title: "Missing information",
        description: "Please select files, loan type, and LOS ID.",
        variant: "destructive",
      });
      return;
    }

    if (serverStatus === 'offline') {
      toast({
        title: "Server offline",
        description: "The FileZilla server is not running. Please start the server first.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      // Extract numeric ID from LOS ID format (e.g., "LOS-19" -> 19)
      const numericLosId = losId.replace(/^LOS-/, '');

      // Validate OCR vs form before uploading any file
      const needsValidation = selectedFiles.filter(f => (f.documentType === 'CNIC' || f.documentType === 'Salary Slip'));
      if (enableValidation && needsValidation.length > 0) {
        const app = await fetchApplicationByLos(losId);
        for (const f of needsValidation) {
          const withVal = await validateOcr({ ...f });
          if (withVal.validation?.status === 'fail') {
            toast({
              title: 'Validation failed',
              description: `${f.documentType} does not match submitted form. Please review highlighted differences.`,
              variant: 'destructive',
            });
            // update UI and abort upload
            setSelectedFiles(prev => prev.map(sf => sf.customName === f.customName ? { ...sf, validation: withVal.validation as UploadFile['validation'] } : sf));
            setIsUploading(false);
            return;
          }
        }
      }
      
      // Upload files sequentially
      for (let i = 0; i < selectedFiles.length; i++) {
        const uploadFile = selectedFiles[i];
        
        // Update status to uploading
        setSelectedFiles(prev => prev.map((file, index) => 
          index === i ? { ...file, status: 'uploading' } : file
        ));

        try {
          const formData = new FormData();
          formData.append('file', uploadFile.file);
          formData.append('loan_type', loan_type);
          formData.append('document_type', uploadFile.documentType);
          formData.append('los_id', numericLosId);
          formData.append('custom_name', uploadFile.customName || uploadFile.file.name);

          console.log('🔄 Frontend: Starting upload...', {
            fileName: uploadFile.customName || uploadFile.file.name,
            fileSize: uploadFile.file.size,
            loan_type,
            losId: numericLosId
          });

          // Simulate upload progress for this file
          const progressInterval = setInterval(() => {
            setSelectedFiles(prev => prev.map((file, index) => 
              index === i ? { ...file, progress: Math.min(file.progress + Math.random() * 10, 90) } : file
            ));
          }, 200);

          // Use the dedicated upload server on port 8081
          const response = await fetch('http://localhost:8086/upload', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
            },
            body: formData,
          });

          clearInterval(progressInterval);

          if (response.ok) {
            const result = await response.json();
            console.log('✅ Frontend: Upload successful:', result);
            
            // Update status to success
            setSelectedFiles(prev => prev.map((file, index) => 
              index === i ? { ...file, status: 'success', progress: 100 } : file
            ));

            // If OCR data exists and not saved yet, save now
            const fileSnapshot = selectedFiles[i];
            if (isOcrDocument(fileSnapshot.documentType) && fileSnapshot.ocrData && !fileSnapshot.ocrSaved) {
              const saved = await saveOcrResult(fileSnapshot.ocrData, fileSnapshot.documentType);
              if (saved) {
                setSelectedFiles(prev => prev.map((f, idx) => idx === i ? { ...f, ocrSaved: true } : f));
              }
            }

            toast({
              title: "Upload successful!",
              description: `File ${uploadFile.customName || uploadFile.file.name} uploaded to ${loan_type}/los-${numericLosId}/`,
            });
          } else {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ Frontend: Upload failed:', errorData);
            
            // Update status to error
            setSelectedFiles(prev => prev.map((file, index) => 
              index === i ? { 
                ...file, 
                status: 'error', 
                error: errorData.error || `Upload failed with status: ${response.status}` 
              } : file
            ));

            throw new Error(errorData.error || `Upload failed with status: ${response.status}`);
          }
        } catch (error) {
          console.error('❌ Frontend: Upload error:', error);
          
          // Update status to error
          setSelectedFiles(prev => prev.map((file, index) => 
            index === i ? { 
              ...file, 
              status: 'error', 
              error: error instanceof Error ? error.message : "Failed to upload file" 
            } : file
          ));

          toast({
            title: "Upload failed",
            description: `Failed to upload ${uploadFile.customName || uploadFile.file.name}: ${error instanceof Error ? error.message : "Unknown error"}`,
            variant: "destructive",
          });
        }
      }

      // After successful uploads, redirect to PB Applications dashboard
      router.push('/dashboard/pb/applications');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      // Create a synthetic event for file selection
      const syntheticEvent = {
        target: { files }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileSelect(syntheticEvent);
    }
  };

  const openUploadForm = () => {
    window.open('http://localhost:8086/pb-upload', '_blank');
  };

  const handleFileSelectFromExplorer = (file: any) => {
    toast({
      title: "File selected",
      description: `Selected: ${file.name}`,
    });
  };

  const [existingDocuments, setExistingDocuments] = useState<any>(null);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [physicalFiles, setPhysicalFiles] = useState<string[]>([]);

  const fetchExistingDocuments = async (losId: string, loanTypeForFetch: string) => {
    setLoadingDocuments(true);
    let ocrCount = 0;
    let filesCount = 0;
    
    try {
      const numericId = losId.replace(/^LOS-/, '');
      console.log(`🔍 Fetching documents for LOS-${numericId}, Loan Type: ${loanTypeForFetch}`);
      
      // Fetch OCR data from Backend V2.0
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/applications/form/${numericId}`);
      if (response.ok) {
        const data = await response.json();
        console.log('📄 Fetched application data from V2.0:', data);
        
        // Backend V2.0 stores documents in different field
        const documents = data.documents || data.mobile_documents || null;
        
        if (documents && typeof documents === 'object') {
          console.log('📄 Found documents:', documents);
          setExistingDocuments(documents);
          ocrCount = Object.keys(documents).filter(k => documents[k] && documents[k].data).length;
        } else {
          console.log('⚠️ No documents found in application');
          setExistingDocuments(null);
        }
      } else {
        console.warn(`⚠️ Failed to fetch application data: ${response.status}`);
      }
      
      // ✅ Fetch physical files from FileZilla
      try {
        const fileApiUrl = `http://localhost:8086/list-files?loan_type=${loanTypeForFetch}&los_id=${numericId}`;
        console.log(`📁 Fetching files from: ${fileApiUrl}`);
        
        const filesResponse = await fetch(fileApiUrl);
        console.log(`📁 Files response status: ${filesResponse.status}`);
        
        if (filesResponse.ok) {
          const filesData = await filesResponse.json();
          console.log('📁 Physical files in FileZilla:', filesData);
          setPhysicalFiles(filesData.files || []);
          filesCount = (filesData.files || []).length;
        } else {
          console.error('❌ Failed to fetch files:', filesResponse.statusText);
        }
      } catch (error) {
        console.error('❌ Error fetching physical files:', error);
      }
      
      if (ocrCount > 0 || filesCount > 0) {
        toast({
          title: "Documents loaded",
          description: `Found ${ocrCount} OCR document(s) and ${filesCount} physical file(s)`,
        });
      } else {
        toast({
          title: "No documents found",
          description: "No documents found from form submission. Please upload documents.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleCustomerSelect = (application: Application) => {
    console.log('📋 Selecting application:', application);
    
    // Backend V2.0 compatibility: Handle both formats
    const losIdValue = application.id || `LOS-${application.los_id}`;
    const productType = application.productType || application.product_type || application.loan_type || 'cashplus';
    const applicantName = application.applicantName || application.applicant_name || 'Customer';
    
    // Map various display labels to a canonical folder slug
    const mappedloan_type = mapLoanTypeLabelToSlug(productType);
    
    console.log('📋 Mapped values:', {
      losIdValue,
      productType,
      mappedloan_type,
      applicantName
    });
    
    setLosId(losIdValue); // Keep the full LOS ID format for display
    setloan_type(mappedloan_type);
    setSelectedApplicationForDocs(application); // Set the selected application for document viewing
    setShowCustomerSelector(false);
    
    // Fetch existing OCR documents and physical files
    fetchExistingDocuments(losIdValue, mappedloan_type);
    
    toast({
      title: "Application selected",
      description: `${applicantName} (${losIdValue})`,
    });
  };

  const handleViewFile = async (file: File) => {
    try {
      const fileName = file.name.toLowerCase();
      const isHtmlFile = fileName.endsWith('.html') || fileName.endsWith('.htm');
      const isImageFile = fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png') || fileName.endsWith('.gif') || fileName.endsWith('.bmp') || fileName.endsWith('.webp');
      const isPdfFile = fileName.endsWith('.pdf');
      const isTextFile = fileName.endsWith('.txt') || fileName.endsWith('.md') || fileName.endsWith('.json') || fileName.endsWith('.xml');

      if (!isHtmlFile && !isImageFile && !isPdfFile && !isTextFile) {
        toast({
          title: 'Preview not available',
          description: `This file type (${file.name.split('.').pop()}) cannot be previewed. Please download it instead.`,
          variant: 'destructive',
        });
        return;
      }

      const blobUrl = URL.createObjectURL(file);

      if (isTextFile) {
        const text = await file.text();
        setPreviewContent({ url: blobUrl, kind: 'text', name: file.name, text });
      } else if (isPdfFile) {
        setPreviewContent({ url: blobUrl, kind: 'pdf', name: file.name });
      } else if (isHtmlFile) {
        setPreviewContent({ url: blobUrl, kind: 'html', name: file.name });
      } else {
        setPreviewContent({ url: blobUrl, kind: 'image', name: file.name });
      }
      setPreviewOpen(true);
    } catch (error) {
      console.error('Error opening file preview:', error);
      toast({
        title: 'Error opening preview',
        description: 'Could not open the file preview. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadFile = (file: File) => {
    try {
      // Create a blob URL for the file
      const blobUrl = URL.createObjectURL(file);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = file.name;
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL after a delay
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 1000);
      
      toast({
        title: "Download started",
        description: `Downloading ${file.name}...`,
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Error downloading file",
        description: "Could not download the file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredApplications = applications.filter(app => {
    // Backend V2.0 uses camelCase: applicantName, not applicant_name
    const applicantName = app.applicantName || app.applicant_name || '';
    const losId = app.id || `LOS-${app.los_id}` || ''; // los_id is number, id is "LOS-XX" string
    
    return (
      applicantName.toLowerCase().includes(searchCustomer.toLowerCase()) ||
      losId.toLowerCase().includes(searchCustomer.toLowerCase())
    );
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Document Management</h2>
        <p className="text-gray-600">Upload, verify, and manage loan application documents</p>
      </div>

      {/* Server Status Alert */}
      <div className="mb-6">
        <Alert className={serverStatus === 'online' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <Server className={`h-4 w-4 ${serverStatus === 'online' ? 'text-green-600' : 'text-red-600'}`} />
          <AlertDescription className="flex items-center gap-2">
            <span>FileZilla Server Status:</span>
            <Badge variant={serverStatus === 'online' ? 'default' : 'destructive'}>
              {serverStatus === 'checking' ? 'Checking...' : serverStatus === 'online' ? 'Online' : 'Offline'}
            </Badge>
            {serverStatus === 'offline' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={checkServerStatus}
                className="ml-2"
              >
                Retry
              </Button>
            )}
          </AlertDescription>
        </Alert>
      </div>

      {/* Main Content with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload Documents
          </TabsTrigger>
          <TabsTrigger value="explorer" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Document Explorer
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Upload Area */}
            <div className="xl:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Documents</h3>
              
              {/* Customer Selection */}
              <div className="mb-4">
                <Label htmlFor="customer">Customer Selection</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="customer"
                    placeholder="Selected customer..."
                    value={losId ? `${losId} - ${(() => {
                      // Extract numeric ID from losId (e.g., "LOS-43" -> 43)
                      const numericId = parseInt(losId.replace(/^LOS-/, ''));
                      const app = applications.find(a => a.los_id === numericId);
                      // Backend V2.0 uses customer_name
                      return app?.customer_name || app?.applicantName || app?.applicant_name || 'Unknown';
                    })()}` : ''}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      fetchApplications();
                      setShowCustomerSelector(true);
                    }}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Select Customer
                  </Button>
                </div>
              </div>

              {/* Loan Type Selection */}
              <div className="mb-4">
                <Label htmlFor="loan_type">Loan Type</Label>
                <Select value={loan_type} onValueChange={setloan_type}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select loan type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cashplus">Cashplus</SelectItem>
                    <SelectItem value="creditcard">Credit Card</SelectItem>
                    <SelectItem value="autoloan">Auto Loan</SelectItem>
                    <SelectItem value="ameendrive">AmeenDrive</SelectItem>
                    <SelectItem value="commercialVehicle">Commercial Vehicle</SelectItem>
                    <SelectItem value="smeasaan">SME Asaan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* LOS ID Input */}
              <div className="mb-4">
                <Label htmlFor="losId">LOS ID</Label>
                <Input
                  id="losId"
                  placeholder="e.g. LOS-12345"
                  value={losId}
                  onChange={(e) => setLosId(e.target.value)}
                />
              </div>
              <div className="mb-4">
  <label htmlFor="documentType" className="block text-sm font-medium text-gray-700">
    Document Type
  </label>
  <select
    id="documentType"
    name="documentType"
    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
    value={documentType}
    onChange={e => setDocumentType(e.target.value)}
    required
  >
    <option value="">Select document type...</option>
    <option value="Application Form Physical Copy">Application Form Physical Copy (Required)</option>
    <option value="CNIC">CNIC</option>
    <option value="Salary Slip">Salary Slip</option>
    <option value="NTN">NTN</option>
    <option value="Other">Other</option>
  </select>
</div>

              {/* Physical Files from FileZilla */}
              {physicalFiles.length > 0 && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Physical Documents (FileZilla)
                  </h4>
                  <div className="space-y-2">
                    {physicalFiles.map((file: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-white rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <p className="text-sm font-medium">{file.name}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              try {
                                // Fetch the file and show in preview modal
                                const response = await fetch(file.url);
                                const blob = await response.blob();
                                const blobUrl = URL.createObjectURL(blob);
                                
                                const fileName = file.name.toLowerCase();
                                const isPdf = fileName.endsWith('.pdf');
                                const isImage = fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png') || fileName.endsWith('.gif');
                                
                                if (isPdf) {
                                  setPreviewContent({ url: blobUrl, kind: 'pdf', name: file.name });
                                } else if (isImage) {
                                  setPreviewContent({ url: blobUrl, kind: 'image', name: file.name });
                                } else {
                                  setPreviewContent({ url: blobUrl, kind: 'unsupported', name: file.name });
                                }
                                setPreviewOpen(true);
                              } catch (error) {
                                console.error('Error loading file:', error);
                                toast({
                                  title: "Error",
                                  description: "Failed to load file preview",
                                  variant: "destructive"
                                });
                              }
                            }}
                          >
                            <Eye className="h-3 w-3 mr-1" /> View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const a = document.createElement('a');
                              a.href = file.url;
                              a.download = file.name;
                              a.click();
                            }}
                          >
                            <Download className="h-3 w-3 mr-1" /> Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-blue-700 mt-2">
                    📁 {physicalFiles.length} file(s) stored in FileZilla server
                  </p>
                </div>
              )}
              
              {/* Existing Documents from Form */}
              {existingDocuments && (
                <div className="mb-4 p-4 bg-teal-50 border border-teal-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-teal-900 mb-2 flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    OCR Data (Database)
                  </h4>
                  <div className="space-y-2">
                    {existingDocuments.cnic && (
                      <div className="flex items-center justify-between p-2 bg-white rounded">
                        <div>
                          <p className="text-sm font-medium">CNIC OCR Data</p>
                          <p className="text-xs text-gray-600">Verified • {new Date(existingDocuments.cnic.uploadedAt).toLocaleString()}</p>
                        </div>
                        <Badge variant="default" className="bg-teal-600">✓ Extracted</Badge>
                      </div>
                    )}
                    {existingDocuments.salarySlip && (
                      <div className="flex items-center justify-between p-2 bg-white rounded">
                        <div>
                          <p className="text-sm font-medium">Salary Slip OCR Data</p>
                          <p className="text-xs text-gray-600">Verified • {new Date(existingDocuments.salarySlip.uploadedAt).toLocaleString()}</p>
                        </div>
                        <Badge variant="default" className="bg-teal-600">✓ Extracted</Badge>
                      </div>
                    )}
                    {existingDocuments.ecib && (
                      <div className="flex items-center justify-between p-2 bg-white rounded">
                        <div>
                          <p className="text-sm font-medium">eCIB Report Data</p>
                          <p className="text-xs text-gray-600">Uploaded • {new Date(existingDocuments.ecib.uploadedAt).toLocaleString()}</p>
                        </div>
                        <Badge variant="default" className="bg-teal-600">✓ Extracted</Badge>
                      </div>
                    )}
                    {existingDocuments.reference1Cnic && (
                      <div className="flex items-center justify-between p-2 bg-white rounded">
                        <div>
                          <p className="text-sm font-medium">Reference 1 CNIC OCR Data</p>
                          <p className="text-xs text-gray-600">Verified • {new Date(existingDocuments.reference1Cnic.uploadedAt).toLocaleString()}</p>
                        </div>
                        <Badge variant="default" className="bg-teal-600">✓ Extracted</Badge>
                      </div>
                    )}
                    {existingDocuments.reference2Cnic && (
                      <div className="flex items-center justify-between p-2 bg-white rounded">
                        <div>
                          <p className="text-sm font-medium">Reference 2 CNIC OCR Data</p>
                          <p className="text-xs text-gray-600">Verified • {new Date(existingDocuments.reference2Cnic.uploadedAt).toLocaleString()}</p>
                        </div>
                        <Badge variant="default" className="bg-teal-600">✓ Extracted</Badge>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-teal-700 mt-2">
                    ℹ️ OCR data extracted and stored in database.
                  </p>
                </div>
              )}

              {/* File Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  selectedFiles.length > 0 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Upload documents</p>
                <p className="text-sm text-gray-500 mb-4">Drag and drop or click to browse</p>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="hidden"
                />
                
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="mb-4"
                  disabled={isUploading}
                >
                  Choose Files
                </Button>

                {/* Selected Files List */}
                {selectedFiles.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <h4 className="text-sm font-medium text-gray-900">Selected Files:</h4>
                    {selectedFiles.map((uploadFile, index) => (
                      <div key={index} className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-blue-900">
                              {uploadFile.customName || uploadFile.file.name}
                            </p>
                            <p className="text-xs text-blue-700">
                              {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB • {uploadFile.documentType}
                            </p>
                            {/* Hide inline OCR details; use right panel instead */}
                            {uploadFile.status === 'uploading' && (
                              <div className="mt-2">
                                <div className="w-full bg-gray-200 rounded-full h-1">
                                  <div 
                                    className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadFile.progress}%` }}
                                  ></div>
                                </div>
                                <p className="text-xs text-gray-600 mt-1">
                                  Uploading... {Math.round(uploadFile.progress)}%
                                </p>
                              </div>
                            )}
                            {uploadFile.status === 'success' && (
                              <p className="text-xs text-green-600 mt-1">✓ Uploaded successfully</p>
                            )}
                            {uploadFile.status === 'error' && (
                              <p className="text-xs text-red-600 mt-1">✗ {uploadFile.error}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewFile(uploadFile.file)}
                              className="h-8 px-2"
                              disabled={uploadFile.status === 'uploading'}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadFile(uploadFile.file)}
                              className="h-8 px-2"
                              disabled={uploadFile.status === 'uploading'}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedFiles(prev => prev.filter((_, i) => i !== index));
                              }}
                              className="h-8 px-2 text-red-600 hover:text-red-700"
                              disabled={uploadFile.status === 'uploading'}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                            {uploadFile.status === 'success' && (
                              <Check className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <Button
                onClick={handleUpload}
                disabled={selectedFiles.length === 0 || !loan_type || !losId || isUploading || serverStatus === 'offline'}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Upload className="mr-2 h-4 w-4 animate-spin" />
                    Uploading {selectedFiles.filter(f => f.status === 'uploading').length} files...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload {selectedFiles.length} Document{selectedFiles.length !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
              
              {/* Skip Upload / Continue Button (when documents already exist) */}
              {(existingDocuments || physicalFiles.length > 0) && selectedFiles.length === 0 && (
                <Button
                  variant="default"
                  onClick={() => {
                    toast({
                      title: "✅ Documents Confirmed",
                      description: `Redirecting to dashboard...`,
                    });
                    // Redirect back to the PB Applications dashboard
                    router.push('/dashboard/pb/applications');
                  }}
                  className="w-full mt-2 bg-teal-600 hover:bg-teal-700"
                >
                  <Check className="mr-2 h-4 w-4" />
                  ✅ Confirm & Continue - Documents Complete
                </Button>
              )}

                              {/* Quick Actions */}
                <div className="mt-4 space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openUploadForm}
                    className="w-full"
                    disabled={serverStatus === 'offline'}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Open Upload Form
                  </Button>
                  {selectedFiles.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedFiles([])}
                      className="w-full text-red-600 hover:text-red-700"
                      disabled={isUploading}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Clear All Files
                    </Button>
                  )}
                </div>
            </div>

            {/* OCR Right Panel */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">OCR Result</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-700">Validation {enableValidation ? 'On' : 'Off'}</span>
                  <Switch checked={enableValidation} onCheckedChange={setEnableValidation} />
                </div>
              </div>
              {!selectedFiles.some(f => f.ocrStatus === 'success') ? (
                <p className="text-sm text-gray-600">Upload a CNIC or Salary Slip to see OCR output here.</p>
              ) : (
                <div className="space-y-3">
                  {/* selector */}
                  <select
                    className="w-full rounded border border-gray-300 p-2 text-sm"
                    value={selectedOcrIndex ?? ''}
                    onChange={e => setSelectedOcrIndex(e.target.value === '' ? null : Number(e.target.value))}
                  >
                    <option value="">Select a file...</option>
                    {selectedFiles.map((f, i) => (
                      f.ocrStatus === 'success' ? (
                        <option key={i} value={i}>{(f.customName || f.file.name)} — {f.documentType}</option>
                      ) : null
                    ))}
                  </select>
                  {/* details */}
                  {selectedOcrIndex !== null && selectedFiles[selectedOcrIndex] && (
                    <div className="rounded-lg border border-blue-200 bg-gradient-to-br from-white to-blue-50 p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-[12px] font-semibold text-blue-900">Extracted Data</p>
                        <div className="flex items-center gap-2">
                          {selectedFiles[selectedOcrIndex].validation?.status === 'pass' && (
                            <span className="inline-flex items-center rounded-full border border-green-200 bg-green-100 px-2.5 py-0.5 text-[10px] font-semibold leading-none text-green-700">Matches form</span>
                          )}
                          {selectedFiles[selectedOcrIndex].validation?.status === 'fail' && (
                            <span className="inline-flex items-center rounded-full border border-red-200 bg-red-100 px-2.5 py-0.5 text-[10px] font-semibold leading-none text-red-700">Mismatch</span>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-700">
                        {Object.entries(selectedFiles[selectedOcrIndex].ocrData || {}).map(([k, v]) => (
                          <div key={k} className="rounded border border-blue-100 bg-white px-2 py-1">
                            <div className="text-[10px] font-semibold uppercase tracking-wide text-blue-800">{k.replaceAll('_',' ')}</div>
                            <div className="text-[11px] text-gray-800">{String(v)}</div>
                          </div>
                        ))}
                      </div>
                      {selectedFiles[selectedOcrIndex].validation && selectedFiles[selectedOcrIndex].validation!.checks.length > 0 && (
                        <div className="mt-2 rounded border border-gray-200 bg-gray-50 p-2">
                          <p className="mb-1 text-[11px] font-medium text-gray-800">Form comparison</p>
                          <ul className="grid grid-cols-2 gap-1">
                            {selectedFiles[selectedOcrIndex].validation!.checks.map((c, idx) => (
                              <li key={idx} className={`text-[11px] ${c.match ? 'text-green-700' : 'text-red-700'}`}>
                                <span className="font-semibold">{c.field}:</span> {String(c.actual || '')}
                                {!c.match && (
                                  <span className="ml-1 text-gray-600">(expected: {String(c.expected || '')})</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="explorer" className="mt-6">
          <div className="space-y-4">
            {/* Application Selector for Document Explorer */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Select Application for Document Viewing</CardTitle>
                <CardDescription>
                  Choose an application to view its specific documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder="Search by customer name or LOS ID..."
                      value={searchCustomer}
                      onChange={(e) => setSearchCustomer(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      fetchApplications();
                      setShowCustomerSelector(true);
                    }}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Select Application
                  </Button>
                </div>
                
                {selectedApplicationForDocs && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{selectedApplicationForDocs.applicant_name}</p>
                        <p className="text-sm text-blue-700">{selectedApplicationForDocs.los_id} - {selectedApplicationForDocs.loan_type}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedApplicationForDocs(null)}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Document Explorer */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Document Explorer</CardTitle>
                <CardDescription>
                  {selectedApplicationForDocs 
                    ? `Viewing documents for ${selectedApplicationForDocs.applicant_name} (${selectedApplicationForDocs.los_id})`
                    : 'Select an application above to view its documents'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedApplicationForDocs ? (
                  <DocumentExplorer 
                    losId={selectedApplicationForDocs.los_id}
                    applicationType={selectedApplicationForDocs.application_type}
                    onFileSelect={handleFileSelectFromExplorer} 
                  />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Please select an application to view its documents</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Customer Selector Dialog */}
      <Dialog open={showCustomerSelector} onOpenChange={setShowCustomerSelector}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Select Customer</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Search */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by customer name or LOS ID..."
                  value={searchCustomer}
                  onChange={(e) => setSearchCustomer(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={fetchApplications}
                disabled={loadingApplications}
              >
                {loadingApplications ? 'Loading...' : 'Refresh'}
              </Button>
            </div>

            {/* Applications Table */}
            <div className="border rounded-lg max-h-[60vh] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer Name</TableHead>
                    <TableHead>LOS ID</TableHead>
                    <TableHead>Loan Type</TableHead>
                    <TableHead>loan_amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingApplications ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Loading applications...
                      </TableCell>
                    </TableRow>
                  ) : filteredApplications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        {searchCustomer ? 'No applications match your search' : 'No applications found'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredApplications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-medium">{app.applicant_name}</TableCell>
                        <TableCell className="font-mono text-sm">{app.los_id}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{app.loan_type}</Badge>
                        </TableCell>
                        <TableCell>{app.loan_amount}</TableCell>
                        <TableCell>
                          <Badge variant={app.status === 'submitted_to_spu' ? 'default' : 'secondary'}>
                            {app.status === 'submitted_to_spu' ? 'Submitted' : 'Draft'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => handleCustomerSelect(app)}
                          >
                            Select
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Inline Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={(o)=>{ if(!o && previewContent){ URL.revokeObjectURL(previewContent.url); } setPreviewOpen(o); }}>
        <DialogContent className="max-w-5xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Preview: {previewContent?.name}</DialogTitle>
          </DialogHeader>
          <div className="h-[70vh] overflow-auto">
            {previewContent?.kind === 'image' && (
              <img src={previewContent.url} alt={previewContent.name} className="max-h-full w-auto" />
            )}
            {previewContent?.kind === 'pdf' && (
              <iframe src={previewContent.url} className="h-full w-full" />
            )}
            {previewContent?.kind === 'html' && (
              <iframe src={previewContent.url} className="h-full w-full" />
            )}
            {previewContent?.kind === 'text' && (
              <pre className="h-full w-full whitespace-pre-wrap rounded bg-gray-50 p-4 text-xs">{previewContent.text}</pre>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentManagement;
