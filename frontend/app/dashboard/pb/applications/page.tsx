"use client"
import { getBaseUrl } from "@/lib/api";

import { useState, useEffect} from "react";
import { useRouter } from "next/navigation";
import { formatDateTime } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import DocumentExplorer from "@/components/document-explorer"
import { MinimalFieldDisplay } from "@/components/minimal-field-display"
import { 
  Eye, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Edit, 
  Trash2, 
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  User,
  Calendar,
  Banknote,
  Activity,
  TrendingUp,
  BarChart3,
  Send,
  Copy,
  Paperclip,
  Flag,
  FolderOpen,
  Smartphone
} from "lucide-react"
import Link from "next/link";
import { fetchDepartmentPaginated } from "@/lib/api";
import MobileSubmissionsComponent from "../mobile-submissions/page";







export default function MyApplicationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loanTypeFilter, setLoanTypeFilter] = useState("all");
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("applications");
  const [applications, setApplications] = useState<any[]>([]);
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDocumentExplorer, setShowDocumentExplorer] = useState(false);
  
  // Application statistics - will be calculated from real data
  const [applicationStats, setApplicationStats] = useState({
    totalApplications: 0,
    draftApplications: 0,
    submittedApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    avgProcessingTime: "0 days",
    approvalRate: 0,
    totalLoanAmount: "PKR 0",
    totalLoanAmountNumeric: 0,
  });

  // Available statuses and loan types for filters
  const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);
  const [availableLoanTypes, setAvailableLoanTypes] = useState<string[]>([]);
  
  const { toast } = useToast();

  // no-op helper removed: we now format actual timestamps using PC timezone via formatDateTimeLocal

  // Progress calculation based on application status
  const calculateProgressPercentage = (status: string): number => {
    // Define the complete workflow stages and their progress percentages
    const workflowStages = {
      // Initial stages (0-20%)
      'draft': 5,
      'PB_SUBMITTED': 10,
      'submitted_by_pb': 15,
      
      // SPU stages (20-35%)
      'submitted_by_spu': 25,
      // Approvals from Risk/Compliance that should still reflect early-stage completion
      'resolved_by_risk': 25,
      'resolved_by_compliance': 25,
      'resolved_by_risk&compliance': 25,
      // Mixed pending combinations
      'resolved_by_risk_pending_compliance': 25,
      'resolved_by_compliance_pending_risk': 25,
      'spu_verified': 30,
      'spu_returned': 20, // Returned but still in progress
      
      // COPS stages (35-50%)
      'cops_data_entry': 40,
      'cops_compliance_check': 45,
      'cops_verified': 50,
      'submitted_by_cops': 50,
      
      // EAMVU stages (50-70%)
      'eamvu_new': 55,
      'assigned_to_eavmu_officer': 60,
      'eamvu_agent_assigned': 60,
      'eamvu_visit_complete': 65,
      'returned_by_eavmu_officer': 60, // Returned but still in progress
      'submitted_by_eavmu': 70,
      'eamvu_verified': 70,
      
      // CIU stages (70-90%)
      'submitted_to_ciu': 75,
      'ciu_review': 80,
      'ciu_flagged': 75, // Flagged but still in progress
      'ciu_verified': 85,
      
      // RRU stages (85-95%)
      'rru_review': 90,
      'rru_resumed': 95,
      'rru_returned': 85, // Returned but still in progress
      'resolved_by_rru': 95,
      
      // Final stages (95-100%)
      'application_completed': 90,
      'loan_disbursed': 100,
      'card_issued': 100,
      'offer_letter_issued': 100,
      'approved': 100,
      'conditional_approved': 100,
      'disbursed': 100,
      
      // Rejected states (still count as progress)
      'rejected_by_spu': 20,
      'rejected_by_cops': 50,
      'rejected_by_eavmu': 70,
      'rejected_by_ciu': 85,
      'rejected_by_rru': 95,
      'rejected': 100
    };

    const s = (status || '').trim();
    const lower = s.toLowerCase();
    // Normalized (case-insensitive) fallbacks
    const normalizedStages: Record<string, number> = {
      'pb_submitted': 10,
      'submitted_by_pb': 15,
      'submitted_by_spu': 25,
      'resolved_by_risk': 25,
      'resolved_by_compliance': 25,
      'resolved_by_risk&compliance': 25,
      'resolved_by_risk_pending_compliance': 25,
      'resolved_by_compliance_pending_risk': 25,
      'spu_verified': 30,
      'spu_returned': 20,
      'cops_data_entry': 40,
      'cops_compliance_check': 45,
      'cops_verified': 50,
      'submitted_by_cops': 50,
      'eamvu_new': 55,
      'assigned_to_eavmu_officer': 60,
      'eamvu_agent_assigned': 60,
      'eamvu_visit_complete': 65,
      'returned_by_eavmu_officer': 60,
      'submitted_by_eavmu': 70,
      'eamvu_verified': 70,
      'submitted_to_ciu': 75,
      'ciu_review': 80,
      'ciu_flagged': 75,
      'ciu_verified': 85,
      'rru_review': 90,
      'rru_resumed': 95,
      'rru_returned': 85,
      'resolved_by_rru': 95,
      'application_completed': 90,
      'loan_disbursed': 100,
      'card_issued': 100,
      'offer_letter_issued': 100,
      'approved': 100,
      'conditional_approved': 100,
      'disbursed': 100,
      'rejected_by_spu': 20,
      'rejected_by_cops': 50,
      'rejected_by_eavmu': 70,
      'rejected_by_ciu': 85,
      'rejected_by_rru': 95,
      'rejected': 100
    };

    return (
      (workflowStages as Record<string, number>)[s] ??
      (workflowStages as Record<string, number>)[lower] ??
      normalizedStages[lower] ??
      0
    );
  };

  // Get current workflow stage name
  const getCurrentWorkflowStage = (status: string): string => {
    const stageMapping = {
      // Initial stages
      'draft': 'Application Draft',
      'PB_SUBMITTED': 'PB Submitted',
      'submitted_by_pb': 'PB Processing',
      
      // SPU stages
      'submitted_by_spu': 'SPU Review',
      'resolved_by_risk': 'Resolved by Risk',
      'resolved_by_compliance': 'Resolved by Compliance',
      'resolved_by_risk&compliance': 'Resolved by Risk & Compliance',
      'resolved_by_risk_pending_compliance': 'Risk Resolved, Pending Compliance',
      'resolved_by_compliance_pending_risk': 'Compliance Resolved, Pending Risk',
      'spu_verified': 'SPU Verified',
      'spu_returned': 'SPU Returned',
      
      // COPS stages
      'cops_data_entry': 'COPS Data Entry',
      'cops_compliance_check': 'COPS Compliance',
      'cops_verified': 'COPS Verified',
      'submitted_by_cops': 'COPS Processing',
      
      // EAMVU stages
      'eamvu_new': 'EAMVU New',
      'assigned_to_eavmu_officer': 'EAMVU Officer Assigned',
      'eamvu_agent_assigned': 'EAMVU Agent Assigned',
      'eamvu_visit_complete': 'EAMVU Visit Complete',
      'returned_by_eavmu_officer': 'EAMVU Officer Returned',
      'submitted_by_eavmu': 'EAMVU Processing',
      'eamvu_verified': 'EAMVU Verified',
      
      // CIU stages
      'submitted_to_ciu': 'CIU Review',
      'ciu_review': 'CIU Processing',
      'ciu_flagged': 'CIU Flagged',
      'ciu_verified': 'CIU Verified',
      
      // RRU stages
      'rru_review': 'RRU Review',
      'rru_resumed': 'RRU Resumed',
      'rru_returned': 'RRU Returned',
      'resolved_by_rru': 'RRU Resolved',
      
          // Final stages
      'application_completed': 'Application Completed',
          'loan_disbursed': 'Loan Disbursed',
          'card_issued': 'Card Issued',
          'offer_letter_issued': 'Offer Letter Issued',
      'approved': 'Approved',
      'conditional_approved': 'Conditionally Approved',
      'disbursed': 'Disbursed',
      
      // Rejected states
      'rejected_by_spu': 'Rejected by SPU',
      'rejected_by_cops': 'Rejected by COPS',
      'rejected_by_eavmu': 'Rejected by EAMVU',
      'rejected_by_ciu': 'Rejected by CIU',
      'rejected_by_rru': 'Rejected by RRU',
      'rejected': 'Rejected'
    };
    const s = (status || '').trim();
    const lower = s.toLowerCase();
    const stageMappingNormalized: Record<string, string> = {
      'draft': 'Application Draft',
      'pb_submitted': 'PB Submitted',
      'submitted_by_pb': 'PB Processing',
      'submitted_by_spu': 'SPU Review',
      'resolved_by_risk': 'Resolved by Risk',
      'resolved_by_compliance': 'Resolved by Compliance',
      'resolved_by_risk&compliance': 'Resolved by Risk & Compliance',
      'resolved_by_risk_pending_compliance': 'Risk Resolved, Pending Compliance',
      'resolved_by_compliance_pending_risk': 'Compliance Resolved, Pending Risk',
      'spu_verified': 'SPU Verified',
      'spu_returned': 'SPU Returned',
      'cops_data_entry': 'COPS Data Entry',
      'cops_compliance_check': 'COPS Compliance',
      'cops_verified': 'COPS Verified',
      'submitted_by_cops': 'COPS Processing',
      'eamvu_new': 'EAMVU New',
      'assigned_to_eavmu_officer': 'EAMVU Officer Assigned',
      'eamvu_agent_assigned': 'EAMVU Agent Assigned',
      'eamvu_visit_complete': 'EAMVU Visit Complete',
      'returned_by_eavmu_officer': 'EAMVU Officer Returned',
      'submitted_by_eavmu': 'EAMVU Processing',
      'eamvu_verified': 'EAMVU Verified',
      'submitted_to_ciu': 'CIU Review',
      'ciu_review': 'CIU Processing',
      'ciu_flagged': 'CIU Flagged',
      'ciu_verified': 'CIU Verified',
      'rru_review': 'RRU Review',
      'rru_resumed': 'RRU Resumed',
      'rru_returned': 'RRU Returned',
      'resolved_by_rru': 'RRU Resolved',
      'application_completed': 'Application Completed',
      'loan_disbursed': 'Loan Disbursed',
      'card_issued': 'Card Issued',
      'offer_letter_issued': 'Offer Letter Issued',
      'approved': 'Approved',
      'conditional_approved': 'Conditionally Approved',
      'disbursed': 'Disbursed',
      'rejected_by_spu': 'Rejected by SPU',
      'rejected_by_cops': 'Rejected by COPS',
      'rejected_by_eavmu': 'Rejected by EAMVU',
      'rejected_by_ciu': 'Rejected by CIU',
      'rejected_by_rru': 'Rejected by RRU',
      'rejected': 'Rejected'
    };

        return (
          (stageMapping as Record<string, string>)[s] ||
          (stageMapping as Record<string, string>)[lower] ||
          stageMappingNormalized[lower] ||
          'In Progress'
        );
  };

  // Calculate statistics from applications data
  const calculateStatistics = (applications: any[]) => {
    const totalApplications = applications.length;
    
    // Count applications by status
    const statusCounts = applications.reduce((acc, app) => {
      const status = app.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Calculate specific counts
    const draftApplications = statusCounts['draft'] || 0;
    const submittedApplications = Object.keys(statusCounts).filter(status => 
      status.includes('submitted') || status.includes('assigned') || status.includes('review')
    ).reduce((sum, status) => sum + (statusCounts[status] || 0), 0);
    
    const approvedApplications = (statusCounts['application_completed'] || 0) + 
                               (statusCounts['approved'] || 0) + 
                               (statusCounts['disbursed'] || 0);
    
    const rejectedApplications = Object.keys(statusCounts).filter(status => 
      status.includes('rejected')
    ).reduce((sum, status) => sum + (statusCounts[status] || 0), 0);
    
    // Calculate approval rate
    const approvalRate = totalApplications > 0 ? 
      ((approvedApplications / totalApplications) * 100).toFixed(1) : "0";
    
    // Calculate total loan amount
    const totalLoanAmount = applications.reduce((sum, app) => {
      const amount = app.loan_amount || 0;
      return sum + amount;
    }, 0);
    
    // Calculate average processing time (mock calculation for now)
    const avgProcessingTime = totalApplications > 0 ? "3.5 days" : "0 days";
    
    return {
      totalApplications,
      draftApplications,
      submittedApplications,
      approvedApplications,
      rejectedApplications,
      avgProcessingTime,
      approvalRate: parseFloat(approvalRate),
      totalLoanAmount: `PKR ${totalLoanAmount.toLocaleString()}`,
      totalLoanAmountNumeric: totalLoanAmount
    };
  };

  // Extract unique statuses and loan types for filters
  const extractFilterOptions = (applications: any[]) => {
    const statuses = [...new Set(applications.map(app => app.status).filter(Boolean))];
    const loanTypes = [...new Set(applications.map(app => app.loanType).filter(Boolean))];
    
    return { statuses, loanTypes };
  };

  // Helper functions for badges and icons
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      case "submitted_to_spu":
        return <Badge className="bg-blue-100 text-blue-800">Submitted to SPU</Badge>;
      case "returned_from_spu":
        return <Badge variant="destructive">Returned from SPU</Badge>;
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case "disbursed":
        return <Badge className="bg-purple-100 text-purple-800">Disbursed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-100 text-red-800">High</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case "low":
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const getRiskLevelBadge = (risk: string) => {
    switch (risk) {
      case "low":
        return <Badge className="bg-green-100 text-green-800">Low Risk</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium Risk</Badge>;
      case "high":
        return <Badge className="bg-red-100 text-red-800">High Risk</Badge>;
      default:
        return <Badge variant="secondary">{risk}</Badge>;
    }
  };

  const getDocumentStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return <Badge className="bg-blue-100 text-blue-800">Submitted</Badge>;
      case "verified":
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
      case "missing":
        return <Badge className="bg-red-100 text-red-800">Missing</Badge>;
      case "revision_required":
        return <Badge className="bg-orange-100 text-orange-800">Revision Required</Badge>;
      case "not_required":
        return <Badge variant="outline">Not Required</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTimelineStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "current":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-gray-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  // Fetch applications from backend
  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Starting to fetch applications...');
      
      // prefer Next API to avoid CORS/env differences
      const res = await fetch(`${getBaseUrl()}/api/v1/applications/department/PB/paginated?page=${page}&pageSize=${pageSize}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch applications');
      const result = await res.json();
      const data = result?.data || [];
      setTotal(result?.total || 0);
      console.log('📊 Raw data from API (paginated):', result);
      console.log('📊 Number of applications received:', data.length);
      
      // Log each application type
      data.forEach((app: any, index: number) => {
        console.log(`📋 Application ${index + 1}:`, {
          id: app.los_id,
          applicantName: app.applicantName,
          loanType: app.loanType,
          amount: app.loan_amount,
          status: app.status
        });
      });
      
      // Ensure all application types are properly mapped
      const mappedApplications = data.map((app: any, index: number) => ({
        id: app.id || `LOS-${app.los_id}` || `ILOS-${String(index + 1).padStart(6, '0')}`,
        los_id: app.los_id,
        applicantName: app.customer_name || app.applicantName || app.applicant_name || 'Unknown Applicant', // Backend V2.0 uses 'customer_name'
        loanType: app.product_type || app.application_type || app.loanType || app.loan_type || 'Personal Loan', // Backend V2.0 uses 'product_type'
        // Backend V2.0 returns: amount, requested_amount (not loan_amount)
        amount: "PKR " + ((app.amount || app.requested_amount || app.loan_amount) ? 
          (app.amount || app.requested_amount || app.loan_amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '-'),
        status: app.status || 'draft',
        priority: app.priority || 'medium',
        // Backend V2.0 returns proper timestamps
        submittedDate: app.created_at || app.submitted_at || app.submittedAt || app.submittedDate || app.submitted_date,
        lastUpdate: app.updated_at || app.updatedAt || app.lastUpdate || app.last_update || app.created_at,
        completionPercentage: calculateProgressPercentage(app.status || 'draft'),
        branch: app.branch || 'Main Branch',
        // Mock data for fields not in database
        creditScore: app.creditScore || Math.floor(Math.random() * 200) + 600,
        monthlyIncome: app.net_monthly_income || '-',
        age: '-',
        riskLevel: app.riskLevel || ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        estimatedProcessingTime: app.estimatedProcessingTime || `${Math.floor(Math.random() * 5) + 2}-${Math.floor(Math.random() * 3) + 5} days`,
        documents: app.documents || [
          { name: "CNIC Copy", status: "submitted", required: true },
          { name: "Salary Slip", status: "submitted", required: true },
          { name: "Bank Statement", status: "submitted", required: true },
          { name: "Employment Letter", status: "submitted", required: false },
        ],
        timeline: app.timeline || [
          { 
            date: app.submittedDate || app.submitted_date 
              ? new Date(app.submittedDate || app.submitted_date).toISOString().split('T')[0] 
              : new Date().toISOString().split('T')[0], 
            event: "Application Created", 
            status: "completed" 
          },
          { 
            date: app.submittedDate || app.submitted_date 
              ? new Date(app.submittedDate || app.submitted_date).toISOString().split('T')[0] 
              : new Date().toISOString().split('T')[0], 
            event: "Documents Uploaded", 
            status: "completed" 
          },
          { 
            date: app.submittedDate || app.submitted_date 
              ? new Date(app.submittedDate || app.submitted_date).toISOString().split('T')[0] 
              : new Date().toISOString().split('T')[0], 
            event: "Initial Review", 
            status: "completed" 
          },
          { date: "TBD", event: "SPU Verification", status: "pending" },
        ],
      }));
      
      console.log('✅ Mapped applications:', mappedApplications);
      console.log('✅ Setting applications state with', mappedApplications.length, 'applications');
      
      // Log progress calculations for debugging
      mappedApplications.forEach((app: any, index: number) => {
        console.log(`📊 Application ${index + 1} (${app.id}): Status="${app.status}", Progress=${calculateProgressPercentage(app.status)}%, Stage="${getCurrentWorkflowStage(app.status)}"`);
      });
      
      // Calculate and set statistics
      const stats = calculateStatistics(mappedApplications);
      setApplicationStats(stats);
      console.log('📈 Calculated statistics:', stats);
      console.log('📊 Status breakdown:', {
        total: stats.totalApplications,
        draft: stats.draftApplications,
        inProgress: stats.submittedApplications,
        approved: stats.approvedApplications,
        rejected: stats.rejectedApplications,
        approvalRate: `${stats.approvalRate}%`,
        totalAmount: stats.totalLoanAmount
      });
      
      // Extract filter options
      const { statuses, loanTypes } = extractFilterOptions(mappedApplications);
      setAvailableStatuses(statuses);
      setAvailableLoanTypes(loanTypes);
      console.log('🔍 Available statuses for filter:', statuses);
      console.log('🔍 Available loan types for filter:', loanTypes);
      
      setApplications(mappedApplications);
    } catch (err) {
      console.error('❌ Error fetching applications:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch applications');
      
      // Fallback to mock data if API fails
      const mockApplications = [
        {
          id: "LOS-2024-001240",
          applicantName: "Ali Raza",
          loanType: "CashPlus Loan",
          amount: "PKR 1,500,000",
          status: "submitted_to_spu",
          priority: "medium",
          submittedDate: "2024-01-15 14:30:25",
          lastUpdate: "2024-01-18 10:45:15",
          completionPercentage: calculateProgressPercentage("submitted_to_spu"),
          creditScore: 720,
          monthlyIncome: "PKR 120,000",
          age: 32,
          branch: "Karachi Main",
          riskLevel: "medium",
          estimatedProcessingTime: "3-5 days",
          documents: [
            { name: "CNIC Copy", status: "submitted", required: true },
            { name: "Salary Slip", status: "submitted", required: true },
            { name: "Bank Statement", status: "submitted", required: true },
            { name: "Employment Letter", status: "submitted", required: false },
          ],
          timeline: [
            { date: "2024-01-15", event: "Application Created", status: "completed" },
            { date: "2024-01-16", event: "Documents Uploaded", status: "completed" },
            { date: "2024-01-17", event: "Initial Review", status: "completed" },
            { date: "2024-01-18", event: "Submitted to SPU", status: "current" },
            { date: "TBD", event: "SPU Verification", status: "pending" },
          ],
        },
        {
          id: "LOS-2024-001241",
          applicantName: "Zara Khan",
          loanType: "Auto Loan",
          amount: "PKR 850,000",
          status: "draft",
          priority: "low",
          submittedDate: "2024-01-12 09:20:30",
          lastUpdate: "2024-01-19 16:15:45",
          completionPercentage: calculateProgressPercentage("draft"),
          creditScore: 680,
          monthlyIncome: "PKR 85,000",
          age: 28,
          branch: "Karachi Main",
          riskLevel: "low",
          estimatedProcessingTime: "2-3 days",
          documents: [
            { name: "CNIC Copy", status: "submitted", required: true },
            { name: "Salary Slip", status: "missing", required: true },
            { name: "Bank Statement", status: "missing", required: true },
            { name: "Vehicle Registration", status: "not_required", required: false },
          ],
          timeline: [
            { date: "2024-01-12", event: "Application Created", status: "completed" },
            { date: "2024-01-13", event: "Basic Information", status: "completed" },
            { date: "TBD", event: "Document Upload", status: "current" },
            { date: "TBD", event: "Review & Submit", status: "pending" },
          ],
        },
        {
          id: "LOS-2024-001242",
          applicantName: "Ahmed Bilal",
          loanType: "Business Loan",
          amount: "PKR 2,000,000",
          status: "returned_from_spu",
          priority: "high",
          submittedDate: "2024-01-08 11:45:20",
          lastUpdate: "2024-01-19 14:20:10",
          completionPercentage: calculateProgressPercentage("returned_from_spu"),
          creditScore: 750,
          monthlyIncome: "PKR 200,000",
          age: 45,
          branch: "Lahore Main",
          riskLevel: "medium",
          estimatedProcessingTime: "5-7 days",
          returnReason: "Additional income verification required",
          documents: [
            { name: "CNIC Copy", status: "verified", required: true },
            { name: "Business Registration", status: "verified", required: true },
            { name: "Tax Returns", status: "submitted", required: true },
            { name: "Financial Statements", status: "revision_required", required: true },
          ],
          timeline: [
            { date: "2024-01-08", event: "Application Created", status: "completed" },
            { date: "2024-01-10", event: "Documents Uploaded", status: "completed" },
            { date: "2024-01-12", event: "Submitted to SPU", status: "completed" },
            { date: "2024-01-18", event: "Returned from SPU", status: "current" },
            { date: "TBD", event: "Revision Required", status: "pending" },
          ],
        },
        {
          id: "LOS-2024-001243",
          applicantName: "Sara Ahmed",
          loanType: "Home Loan",
          amount: "PKR 5,500,000",
          status: "approved",
          priority: "high",
          submittedDate: "2024-01-05 08:30:15",
          lastUpdate: "2024-01-19 11:30:25",
          completionPercentage: calculateProgressPercentage("approved"),
          creditScore: 800,
          monthlyIncome: "PKR 350,000",
          age: 35,
          branch: "Islamabad",
          riskLevel: "low",
          estimatedProcessingTime: "7-10 days",
          approvalDate: "2024-01-18",
          disbursementDate: "2024-01-22",
          documents: [
            { name: "CNIC Copy", status: "verified", required: true },
            { name: "Salary Slip", status: "verified", required: true },
            { name: "Property Documents", status: "verified", required: true },
            { name: "Property Valuation", status: "verified", required: true },
          ],
          timeline: [
            { date: "2024-01-05", event: "Application Created", status: "completed" },
            { date: "2024-01-07", event: "Documents Uploaded", status: "completed" },
            { date: "2024-01-10", event: "Submitted to SPU", status: "completed" },
            { date: "2024-01-15", event: "SPU Verification", status: "completed" },
            { date: "2024-01-18", event: "Approved", status: "completed" },
            { date: "2024-01-22", event: "Disbursement", status: "current" },
          ],
        },
      ];
      
      // Calculate and set statistics for mock data
      const stats = calculateStatistics(mockApplications);
      setApplicationStats(stats);
      
      // Extract filter options for mock data
      const { statuses, loanTypes } = extractFilterOptions(mockApplications);
      setAvailableStatuses(statuses);
      setAvailableLoanTypes(loanTypes);
      
      setApplications(mockApplications);
    } finally {
      setLoading(false);
    }
  };

  // Load applications on component mount
  useEffect(() => {
    fetchApplications();
  }, [page, pageSize]);

  const filteredApplications = applications.filter((app) => {
    const matchesSearch = 
      app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    const matchesLoanType = loanTypeFilter === "all" || app.loanType === loanTypeFilter;
    
    return matchesSearch && matchesStatus && matchesLoanType;
  });

  // const handleCreateApplication = () => {
  //   toast({
  //     title: "New Application",
  //     description: "Redirecting to application creation wizard...",
  //   });
  // };

  const handleEditApplication = (appId: string) => {
    toast({
      title: "Edit Application",
      description: `Opening application ${appId} for editing...`,
    });
  };

  const handleSubmitApplication = (appId: string) => {
    toast({
      title: "Application Submitted",
      description: `Application ${appId} has been submitted to SPU for review.`,
    });
  };

  const handleDeleteApplication = (appId: string) => {
    toast({
      title: "Application Deleted",
      description: `Application ${appId} has been deleted.`,
      variant: "destructive",
    });
  };

  const handleCopyApplication = (appId: string) => {
    toast({
      title: "Application Copied",
      description: `Created a copy of application ${appId}.`,
    });
  };

  const handleViewApplication = async (application: any) => {
    try {
      console.log('🔄 Fetching form data for application:', application.los_id);
      
      // Extract the numeric part from los_id (e.g., "LOS-18" -> "18")
      console.log(application);
      const losIdstr = application.id.replace('LOS-', '');
      const losId = parseInt(losIdstr);
      const response = await fetch(`${getBaseUrl()}/api/v1/applications/form/${losId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch form data');
      }
      
      const result = await response.json();
      
      // Backend V2.0 returns flat structure: { success: true, data: {...} }
      const appData = result.data;
      
      if (!appData) {
        throw new Error('No application data returned');
      }
      
      console.log('✅ Raw application data from Backend V2.0:', appData);
    
      // Calculate age from date_of_birth
      let age = 0; 
      if (appData.date_of_birth) { 
        console.log('Raw date_of_birth:', appData.date_of_birth);
        
        const dob = new Date(appData.date_of_birth); 
        const today = new Date(); 
        
        console.log('Parsed DOB:', dob);
        console.log('Today:', today);
        
        // Check if the date is valid
        if (isNaN(dob.getTime())) {
          console.error('Invalid date of birth:', appData.date_of_birth);
          age = 0;
        } else {
          age = today.getFullYear() - dob.getFullYear(); 
          
          // Check if birthday hasn't occurred this year yet
          const monthDiff = today.getMonth() - dob.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) { 
            age--; 
          }
          
          console.log('Calculated age:', age);
        }
      } else {
        console.log('⚠️ No date_of_birth found in application data');
      }

      // Add age to the data 
      appData.age = age; 
      
      console.log('✅ Form data processed successfully (V2.0):', {
        los_id: appData.los_id,
        cnic: appData.cnic,
        name: appData.customer_name,
        first_name: appData.first_name,
        last_name: appData.last_name,
        age: age,
        gender: appData.gender,
        product_type: appData.product_type,
        purpose: appData.purpose,
        requested_amount: appData.requested_amount
      });
      
      // Fetch references separately (Backend V2.0 doesn't include them by default)
      try {
        const referencesResponse = await fetch(`${getBaseUrl()}/api/v1/applications/${losId}/references`);
        if (referencesResponse.ok) {
          const refsResult = await referencesResponse.json();
          const references = refsResult.data || refsResult || [];
          appData.references = references;
          console.log('📋 Loaded references:', references);
        }
      } catch (refError) {
        console.warn('⚠️ Failed to load references:', refError);
      }
      
      // Update the selected application with the fetched form data
      // Backend V2.0 uses flat structure, map to formData for compatibility
      setSelectedApplication({
        ...application,
        ...appData,  // Spread all V2.0 fields
        formData: appData,  // Also keep as formData for legacy components
        loanType: appData.product_type || application.loanType // Ensure loanType is set for DocumentExplorer
      });
      
      toast({
        title: "Form Data Loaded",
        description: `Application form data has been loaded successfully.`,
      });
      
    } catch (error) {
      console.error('❌ Error fetching form data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch application form data.",
        variant: "destructive"
      });
    }
  };

  const handleRefresh = () => {
    fetchApplications();
    toast({
      title: "Refreshed",
      description: "Application data and statistics have been refreshed.",
    });
  };

  // Export functionality
  const handleExport = () => {
    try {
      console.log('🔄 Starting export process...');
      
      // Create comprehensive report data with better formatting
      const reportData = {
        summary: {
          totalApplications: applicationStats.totalApplications,
          approvedApplications: applicationStats.approvedApplications,
          inProgressApplications: applicationStats.submittedApplications,
          draftApplications: applicationStats.draftApplications,
          rejectedApplications: applicationStats.rejectedApplications,
          approvalRate: `${applicationStats.approvalRate}%`,
          totalLoanAmount: applicationStats.totalLoanAmount,
          exportDate: new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }),
          department: 'Personal Banking (PB)'
        },
        applications: applications.map(app => ({
          losId: app.id,
          applicantName: app.applicantName || 'N/A',
          loanType: app.loanType || 'N/A',
          amount: app.amount || 'PKR 0',
          status: app.status || 'Unknown',
          workflowStage: getCurrentWorkflowStage(app.status) || 'Unknown Stage',
          progressPercentage: calculateProgressPercentage(app.status) || 0,
          priority: app.priority || 'Medium',
          riskLevel: app.riskLevel || 'Medium',
          submittedDate: app.submittedDate ? new Date(app.submittedDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          }) : 'N/A',
          lastUpdate: app.lastUpdate ? new Date(app.lastUpdate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          }) : 'N/A',
          branch: app.branch || 'N/A',
          creditScore: app.creditScore || 'N/A',
          monthlyIncome: app.monthlyIncome || 'N/A',
          estimatedProcessingTime: app.estimatedProcessingTime || 'N/A',
          missingDocuments: getMissingDocumentsCount(app.documents) || 0
        }))
      };

      console.log('📊 Report data prepared:', reportData);

      // Create better formatted CSV content with proper headers
      const csvHeaders = [
        'LOS ID',
        'Applicant Name',
        'Loan Type',
        'Amount',
        'Status',
        'Workflow Stage',
        'Progress (%)',
        'Priority',
        'Risk Level',
        'Submitted Date',
        'Last Updated',
        'Branch',
        'Credit Score',
        'Monthly Income',
        'Processing Time',
        'Missing Documents'
      ];

      const csvRows = reportData.applications.map(app => [
        app.losId,
        app.applicantName,
        app.loanType,
        app.amount,
        app.status,
        app.workflowStage,
        app.progressPercentage,
        app.priority,
        app.riskLevel,
        app.submittedDate,
        app.lastUpdate,
        app.branch,
        app.creditScore,
        app.monthlyIncome,
        app.estimatedProcessingTime,
        app.missingDocuments
      ]);

      // Create better formatted summary section
      const summaryRows = [
        [''],
        ['SUMMARY REPORT'],
        ['Department', reportData.summary.department],
        ['Export Date', reportData.summary.exportDate],
        ['Total Applications', reportData.summary.totalApplications],
        ['Approved Applications', reportData.summary.approvedApplications],
        ['In Progress Applications', reportData.summary.inProgressApplications],
        ['Draft Applications', reportData.summary.draftApplications],
        ['Rejected Applications', reportData.summary.rejectedApplications],
        ['Approval Rate', reportData.summary.approvalRate],
        ['Total Loan Amount', reportData.summary.totalLoanAmount],
        [''],
        ['DETAILED APPLICATIONS'],
        csvHeaders
      ];

      // Combine summary and data
      const allRows = [...summaryRows, ...csvRows];

      // Convert to CSV format with better escaping
      const csvContent = allRows.map(row => 
        row.map(cell => {
          const cellStr = String(cell || '');
          // Escape quotes and wrap in quotes if contains comma, quote, or newline
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        }).join(',')
      ).join('\n');

      console.log('📄 CSV content generated, length:', csvContent.length);

      // Add BOM for better Excel compatibility
      const BOM = '\uFEFF';
      const csvWithBOM = BOM + csvContent;

      // Create and download file with better MIME type
      const blob = new Blob([csvWithBOM], { 
        type: 'text/csv;charset=utf-8;' 
      });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `PB_Applications_Report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log('✅ File download triggered');

      toast({
        title: "Export Successful",
        description: `Report exported with ${applications.length} applications and summary statistics.`,
      });

    } catch (error) {
      console.error('❌ Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export report. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getMissingDocumentsCount = (documents: any[]) => {
    return documents.filter(doc => doc.status === "missing" && doc.required).length;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">My Applications</h2>
            <p className="text-muted-foreground">Manage and track your loan applications</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading applications...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">My Applications</h2>
            <p className="text-muted-foreground">Manage and track your loan applications</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-red-500" />
            <p className="text-red-600 mb-2">Error loading applications</p>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchApplications} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Applications</h2>
          <p className="text-muted-foreground">Manage and track your loan applications</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => router.push("/dashboard/applicant")}
          className=" flex items-center gap-2 text-white px-4 py-2 rounded-md">
            <Plus className="mr-2 h-4 w-4" />
            New Application
          </Button>
        </div>
      </div>

      {/* Statistics Cards - Modern Design */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="modern-card hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 text-blue-600">
                <FileText className="h-6 w-6" />
              </div>
              {!loading && (
                <Badge variant="outline" className="text-xs">All Time</Badge>
              )}
            </div>
            <div className="space-y-1">
              <p className="stat-label">Total Applications</p>
              <p className="stat-value">
                {loading ? (
                  <span className="flex items-center gap-2 text-2xl">
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span className="text-lg">Loading...</span>
                  </span>
                ) : (
                  applicationStats.totalApplications
                )}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="modern-card hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-100 text-green-600">
                <CheckCircle className="h-6 w-6" />
              </div>
              {!loading && applicationStats.approvedApplications > 0 && (
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">
                  Success
                </Badge>
              )}
            </div>
            <div className="space-y-1">
              <p className="stat-label">Approved</p>
              <p className="stat-value text-green-600">
                {loading ? (
                  <span className="flex items-center gap-2 text-2xl">
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span className="text-lg">Loading...</span>
                  </span>
                ) : (
                  applicationStats.approvedApplications
                )}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="modern-card hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-100 text-amber-600">
                <Clock className="h-6 w-6" />
              </div>
              {!loading && applicationStats.submittedApplications > 0 && (
                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-xs">
                  Active
                </Badge>
              )}
            </div>
            <div className="space-y-1">
              <p className="stat-label">In Progress</p>
              <p className="stat-value text-amber-600">
                {loading ? (
                  <span className="flex items-center gap-2 text-2xl">
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span className="text-lg">Loading...</span>
                  </span>
                ) : (
                  applicationStats.submittedApplications
                )}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="modern-card hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-teal-100 text-teal-600">
                <TrendingUp className="h-6 w-6" />
              </div>
              {!loading && applicationStats.approvalRate >= 70 && (
                <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100 text-xs">
                  High
                </Badge>
              )}
            </div>
            <div className="space-y-1">
              <p className="stat-label">Approval Rate</p>
              <p className="stat-value text-teal-600">
                {loading ? (
                  <span className="flex items-center gap-2 text-2xl">
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span className="text-lg">Loading...</span>
                  </span>
                ) : (
                  `${applicationStats.approvalRate}%`
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger className="w-full" value="applications">
            <FileText className="h-4 w-4 mr-2" />
            Applications
          </TabsTrigger>
          <TabsTrigger className="w-full" value="mobile">
            <Smartphone className="h-4 w-4 mr-2" />
            📱 Mobile App Submissions
          </TabsTrigger>
          {/* <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger> */}
        </TabsList>

        <TabsContent value="applications" className="space-y-6">
          {/* Filters - Modern Design */}
          <Card className="modern-card">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                  <Filter className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Filter Applications</CardTitle>
                  <p className="text-sm text-muted-foreground mt-0.5">Search and filter your applications</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by applicant name or LOS ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 h-11 focus-modern"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-44 h-11">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      {availableStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {getCurrentWorkflowStage(status)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={loanTypeFilter} onValueChange={setLoanTypeFilter}>
                    <SelectTrigger className="w-44 h-11">
                      <SelectValue placeholder="Loan Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {availableLoanTypes.map((loanType) => (
                        <SelectItem key={loanType} value={loanType}>
                          {loanType}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>



          {/* Applications Table - Modern Design */}
          <Card className="modern-card">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Application History</CardTitle>
                  <CardDescription className="mt-1">Complete history of your loan applications</CardDescription>
                </div>
                <Badge variant="outline" className="text-sm font-medium">
                  {filteredApplications.length} Applications
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border shadow-sm overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>LOS ID</TableHead>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Loan Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Progress</TableHead>
                       <TableHead>Application Started</TableHead>
                       <TableHead>Last Updated</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                  {filteredApplications.map((app,index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono text-sm">{app.id}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{app.applicantName}</div>
                            <div className="text-sm text-muted-foreground">{app.branch}</div>
                          </div>
                        </TableCell>
                        <TableCell>{app.loanType}</TableCell>
                        <TableCell className="font-medium">{app.amount}</TableCell>
                        <TableCell>{getStatusBadge(app.status)}</TableCell>
                        <TableCell>{getPriorityBadge(app.priority)}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Progress value={calculateProgressPercentage(app.status)} className="h-2 w-16" />
                              <span className="text-sm text-muted-foreground">{calculateProgressPercentage(app.status)}%</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {getCurrentWorkflowStage(app.status)}
                            </div>
                            {getMissingDocumentsCount(app.documents) > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {getMissingDocumentsCount(app.documents)} docs missing
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{formatDateTime(app.submittedDate)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{formatDateTime(app.lastUpdate)}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewApplication(app)}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
                                <DialogHeader className="sticky top-0 bg-white z-10 pb-4 border-b">
                                  <DialogTitle>Application Details - {selectedApplication?.id}</DialogTitle>
                                  <DialogDescription>
                                    Complete application information and status
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedApplication && (
                                  <div className="overflow-y-auto max-h-[calc(90vh-120px)] space-y-6 pr-2">
                                    {/* Basic Information Section */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                      <Card>
                                        <CardHeader>
                                          <CardTitle className="text-lg flex items-center gap-2">
                                            <User className="h-5 w-5" />
                                            Applicant Information
                                          </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                          <div className="grid grid-cols-2 gap-2 text-sm">
                                            <span className="font-medium">Full Name:</span>
                                            <span>{selectedApplication.formData.first_name} {selectedApplication.formData.middle_name} {selectedApplication.formData.last_name}</span>
                                            <span className="font-medium">Age:</span>
                                            <span>{selectedApplication.formData.age} years</span>
                                            <span className="font-medium">Monthly Income:</span>
                                            <span>{selectedApplication.formData.monthly_income}</span>
                                            {/* <span className="font-medium">Credit Score:</span>
                                            <span>{selectedApplication.formData.credit_score}</span> */}
                                            <span className="font-medium">Branch:</span>
                                            <span>{selectedApplication.formData.branch_code}</span>
                                            <span className="font-medium">Application Date:</span>
                                            <span>{formatDateTime(selectedApplication.formData.submitted_date)}</span>
                                            <span className="font-medium">Last Updated:</span>
                                            <span>{formatDateTime(selectedApplication.formData.last_updated)}</span>
                                          </div>
                                        </CardContent>
                                      </Card>

                                      <Card>
                                        <CardHeader>
                                          <CardTitle className="text-lg flex items-center gap-2">
                                            <Banknote className="h-5 w-5" />
                                            Loan Details
                                          </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                              <span className="font-medium">Loan Type:</span>
                                              <span>{selectedApplication.product_type || selectedApplication.loanType}</span>
                                              <span className="font-medium">Amount:</span>
                                              <span className="font-semibold text-green-600">
                                                PKR {selectedApplication.requested_amount 
                                                  ? Number(selectedApplication.requested_amount).toLocaleString() 
                                                  : '-'}
                                              </span>
                                              <span className="font-medium">Status:</span>
                                              <span>{getStatusBadge(selectedApplication.status)}</span>
                                              <span className="font-medium">Risk Level:</span>
                                              <span>{getRiskLevelBadge(selectedApplication.risk_level)}</span>
                                              <span className="font-medium">Priority:</span>
                                              <span>{getPriorityBadge(selectedApplication.priority)}</span>
                                              <span className="font-medium">Processing Time:</span>
                                              <span>{selectedApplication.estimated_processing_time || selectedApplication.processing_time_hours ? `${selectedApplication.processing_time_hours} hours` : 'N/A'}</span>
                                            </div>
                                        </CardContent>
                                      </Card>

                                      <Card>
                                        <CardHeader>
                                          <CardTitle className="text-lg flex items-center gap-2">
                                            <Activity className="h-5 w-5" />
                                            Application Progress
                                          </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                          <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                              <span className="text-sm font-medium">Completion</span>
                                              <span className="text-sm font-bold">{calculateProgressPercentage(selectedApplication.status)}%</span>
                                            </div>
                                            <Progress value={calculateProgressPercentage(selectedApplication.status)} className="w-full" />
                                            <div className="text-xs text-muted-foreground">
                                              {calculateProgressPercentage(selectedApplication.status) < 100 
                                                ? `${100 - calculateProgressPercentage(selectedApplication.status)}% remaining`
                                                : "Application complete"
                                              }
                                            </div>
                                            <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                                              <div className="text-xs font-medium text-blue-800">Current Stage:</div>
                                              <div className="text-sm text-blue-700">{getCurrentWorkflowStage(selectedApplication.status)}</div>
                                            </div>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    </div>

                                    {/* Documents Section */}
                                    {/* <Card>
                                      <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                          <FileText className="h-5 w-5" />
                                          Documents Status
                                        </CardTitle>
                                        <CardDescription>
                                          Required and optional documents for this application
                                        </CardDescription>
                                      </CardHeader>
                                      <CardContent>
                                        <div className="grid gap-3">
                                          {selectedApplication.documents.map((doc: any, index: number) => (
                                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                                              <div className="flex items-center gap-3">
                                                <Paperclip className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                  <span className="text-sm font-medium">{doc.name}</span>
                                                  {doc.required && <span className="text-red-500 ml-1">*</span>}
                                                </div>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                {getDocumentStatusBadge(doc.status)}
                                                {doc.required && (
                                                  <Badge variant="outline" className="text-xs">Required</Badge>
                                                )}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                          <div className="text-sm text-blue-800">
                                            <strong>Missing Documents:</strong> {getMissingDocumentsCount(selectedApplication.documents)} required documents
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card> */}

                                    {/* Application Timeline */}
                                    {/* <Card>
                                      <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                          <Calendar className="h-5 w-5" />
                                          Application Timeline
                                        </CardTitle>
                                        <CardDescription>
                                          Complete timeline of application milestones
                                        </CardDescription>
                                      </CardHeader>
                                      <CardContent>
                                        <div className="space-y-4">
                                          {selectedApplication.timeline.map((item: any, index: number) => (
                                            <div key={index} className="flex items-start gap-4">
                                              <div className="flex-shrink-0">
                                                {getTimelineStatusIcon(item.status)}
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium">{item.event}</div>
                                                <div className="text-xs text-muted-foreground">{item.date}</div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </CardContent>
                                    </Card> */}

                                                                         {/* Form Data Section */}
                                     {selectedApplication.formData && (
                                       <Card>
                                        <CardHeader>
                                          <CardTitle className="text-lg flex items-center gap-2">
                                            <FileText className="h-5 w-5" />
                                            Application Form Data
                                          </CardTitle>
                                          <CardDescription>
                                            Essential fields from streamlined form (Industry Standard)
                                          </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                          {/* ✅ Minimal Field Display - Shows ONLY essential fields from research */}
                                          <MinimalFieldDisplay 
                                            data={selectedApplication.formData}
                                            title="Application Data"
                                            productType="cashplus"
                                          />

                                           <div className="space-y-6 mt-6">
                                             {/* Raw Data (for debugging) */}
                                             <details className="mt-4">
                                               <summary className="cursor-pointer text-sm font-medium text-gray-600">View Raw Data</summary>
                                               <div className="mt-2 bg-gray-50 p-4 rounded-lg">
                                                 <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                                                   {JSON.stringify(selectedApplication.formData, null, 2)}
                                                 </pre>
                                               </div>
                                             </details>
                                           </div>
                                         </CardContent>
                                       </Card>
                                     )}

                                     {/* Additional Information */}
                                     {selectedApplication.returnReason && (
                                       <Card>
                                         <CardHeader>
                                           <CardTitle className="text-lg flex items-center gap-2 text-yellow-800">
                                             <AlertTriangle className="h-5 w-5" />
                                             Return Information
                                           </CardTitle>
                                         </CardHeader>
                                         <CardContent>
                                           <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                             <div className="text-sm">
                                               <div className="font-medium text-yellow-800 mb-2">Return Reason:</div>
                                               <div className="grid grid-cols-2 gap-3 text-sm">
                                                 <div><span className="font-medium">Mobile:</span> {selectedApplication.formData.mobile}</div>
                                                 <div><span className="font-medium">Mobile Type:</span> {selectedApplication.formData.mobile_type || 'Not provided'}</div>
                                                 <div><span className="font-medium">Current Phone:</span> {selectedApplication.formData.tel_current}</div>
                                                 <div><span className="font-medium">Permanent Phone:</span> {selectedApplication.formData.tel_permanent || 'Not provided'}</div>
                                                 <div><span className="font-medium">Other Contact:</span> {selectedApplication.formData.other_contact || 'Not provided'}</div>
                                               </div>
                                             </div>

                                             {/* Address Information */}
                                             <div>
                                               <h4 className="font-semibold mb-3 text-purple-600">Address Information</h4>
                                               <div className="grid grid-cols-2 gap-3 text-sm">
                                                 <div><span className="font-medium">Current Address:</span> {selectedApplication.formData.address}</div>
                                                 <div><span className="font-medium">Permanent Address:</span> {selectedApplication.formData.permanent_street}, {selectedApplication.formData.permanent_city}</div>
                                                 <div><span className="font-medium">City:</span> {selectedApplication.formData.city}</div>
                                                 <div><span className="font-medium">Permanent City:</span> {selectedApplication.formData.permanent_city}</div>
                                                 <div><span className="font-medium">Postal Code:</span> {selectedApplication.formData.postal_code}</div>
                                                 <div><span className="font-medium">Residing Since:</span> {selectedApplication.formData.residing_since || 'Not provided'}</div>
                                                 <div><span className="font-medium">House No:</span> {selectedApplication.formData.permanent_house_no || 'Not provided'}</div>
                                                 <div><span className="font-medium">Nearest Landmark:</span> {selectedApplication.formData.nearest_landmark || 'Not provided'}</div>
                                               </div>
                                             </div>

                                             {/* Employment Information */}
                                             <div>
                                               <h4 className="font-semibold mb-3 text-orange-600">Employment Information</h4>
                                               <div className="grid grid-cols-2 gap-3 text-sm">
                                                 <div><span className="font-medium">Employment Status:</span> {selectedApplication.formData.employment_status}</div>
                                                 <div><span className="font-medium">Company Name:</span> {selectedApplication.formData.company_name || 'Not provided'}</div>
                                                 <div><span className="font-medium">Company Type:</span> {selectedApplication.formData.company_type || 'Not provided'}</div>
                                                 <div><span className="font-medium">Designation:</span> {selectedApplication.formData.designation || 'Not provided'}</div>
                                                 <div><span className="font-medium">Grade Level:</span> {selectedApplication.formData.grade_level || 'Not provided'}</div>
                                                 <div><span className="font-medium">Department:</span> {selectedApplication.formData.department || 'Not provided'}</div>
                                                 <div><span className="font-medium">Office Phone 1:</span> {selectedApplication.formData.office_tel1 || 'Not provided'}</div>
                                                 <div><span className="font-medium">Office Phone 2:</span> {selectedApplication.formData.office_tel2 || 'Not provided'}</div>
                                                 <div><span className="font-medium">Office Fax:</span> {selectedApplication.formData.office_fax || 'Not provided'}</div>
                                                 <div><span className="font-medium">Office Extension:</span> {selectedApplication.formData.office_ext || 'Not provided'}</div>
                                                 <div><span className="font-medium">Office Area:</span> {selectedApplication.formData.office_area || 'Not provided'}</div>
                                                 <div><span className="font-medium">Office City:</span> {selectedApplication.formData.office_city || 'Not provided'}</div>
                                                 <div><span className="font-medium">Office Street:</span> {selectedApplication.formData.office_street || 'Not provided'}</div>
                                                 <div><span className="font-medium">Office House No:</span> {selectedApplication.formData.office_house_no || 'Not provided'}</div>
                                                 <div><span className="font-medium">Office Landmark:</span> {selectedApplication.formData.office_landmark || 'Not provided'}</div>
                                                 <div><span className="font-medium">Office Postal Code:</span> {selectedApplication.formData.office_postal_code || 'Not provided'}</div>
                                                 <div><span className="font-medium">SM Employee No:</span> {selectedApplication.formData.sm_employee_no || 'Not provided'}</div>
                                                 <div><span className="font-medium">SO Employee No:</span> {selectedApplication.formData.so_employee_no || 'Not provided'}</div>
                                                 <div><span className="font-medium">PB BM Employee No:</span> {selectedApplication.formData.pb_bm_employee_no || 'Not provided'}</div>
                                               </div>
                                             </div>

                                             {/* Loan Information */}
                                             <div>
                                               <h4 className="font-semibold mb-3 text-red-600">Loan Information</h4>
                                               <div className="grid grid-cols-2 gap-3 text-sm">
                                                 <div><span className="font-medium">Amount Requested:</span> PKR {selectedApplication.formData.amount_requested?.toLocaleString()}</div>
                                                 <div><span className="font-medium">Purpose of Loan:</span> {selectedApplication.formData.purpose_of_loan || 'Not provided'}</div>
                                                 <div><span className="font-medium">Tenure:</span> {selectedApplication.formData.tenure || 'Not provided'} years</div>
                                                 <div><span className="font-medium">Min Amount Acceptable:</span> {selectedApplication.formData.min_amount_acceptable ? `PKR ${selectedApplication.formData.min_amount_acceptable.toLocaleString()}` : 'Not provided'}</div>
                                                 <div><span className="font-medium">Max Affordable Installment:</span> {selectedApplication.formData.max_affordable_installment ? `PKR ${selectedApplication.formData.max_affordable_installment.toLocaleString()}` : 'Not provided'}</div>
                                               </div>
                                             </div>

                                             {/* Financial Information */}
                                             <div>
                                               <h4 className="font-semibold mb-3 text-indigo-600">Financial Information</h4>
                                               <div className="grid grid-cols-2 gap-3 text-sm">
                                                 <div><span className="font-medium">Gross Monthly Salary:</span> {selectedApplication.formData.gross_monthly_salary ? `PKR ${selectedApplication.formData.gross_monthly_salary.toLocaleString()}` : 'Not provided'}</div>
                                                 <div><span className="font-medium">Net Monthly Income:</span> {selectedApplication.formData.net_monthly_income ? `PKR ${selectedApplication.formData.net_monthly_income.toLocaleString()}` : 'Not provided'}</div>
                                                 <div><span className="font-medium">Other Monthly Income:</span> {selectedApplication.formData.other_monthly_income ? `PKR ${selectedApplication.formData.other_monthly_income.toLocaleString()}` : 'Not provided'}</div>
                                                 <div><span className="font-medium">Other Income Sources:</span> {selectedApplication.formData.other_income_sources || 'Not provided'}</div>
                                                 <div><span className="font-medium">Monthly Rent:</span> {selectedApplication.formData.monthly_rent ? `PKR ${selectedApplication.formData.monthly_rent.toLocaleString()}` : 'Not provided'}</div>
                                                 <div><span className="font-medium">Account Number:</span> {selectedApplication.formData.account_number || 'Not provided'}</div>
                                                 <div><span className="font-medium">Is Existing Customer:</span> {selectedApplication.formData.is_existing_customer ? 'Yes' : 'No'}</div>
                                                 <div><span className="font-medium">Customer ID:</span> {selectedApplication.formData.customer_id || 'Not provided'}</div>
                                                 <div><span className="font-medium">Accommodation Type:</span> {selectedApplication.formData.accommodation_type || 'Not provided'}</div>
                                                 <div><span className="font-medium">Dependants:</span> {selectedApplication.formData.dependants || 'Not provided'}</div>
                                                 <div><span className="font-medium">Experience (Current):</span> {selectedApplication.formData.exp_current_years || 'Not provided'} years</div>
                                                 <div><span className="font-medium">Experience (Previous):</span> {selectedApplication.formData.exp_prev_years || 'Not provided'} years</div>
                                                 <div><span className="font-medium">Previous Employer:</span> {selectedApplication.formData.prev_employer_name || 'Not provided'}</div>
                                               </div>
                                             </div>

                                             {/* Credit Cards Clean */}
                                             {selectedApplication.formData.credit_cards_clean && selectedApplication.formData.credit_cards_clean.length > 0 && (
                                               <div>
                                                 <h4 className="font-semibold mb-3 text-emerald-600">Clean Credit Cards</h4>
                                                 <div className="space-y-3">
                                                   {selectedApplication.formData.credit_cards_clean.map((card: any, index: number) => (
                                                     <div key={card.id} className="border rounded-lg p-3 bg-green-50">
                                                       <div className="grid grid-cols-2 gap-2 text-sm">
                                                         <div><span className="font-medium">Bank Name:</span> {card.bank_name}</div>
                                                         <div><span className="font-medium">Approved Limit:</span> PKR {card.approved_limit?.toLocaleString()}</div>
                                                       </div>
                                                     </div>
                                                   ))}
                                                 </div>
                                               </div>
                                             )}

                                             {/* Credit Cards Secured */}
                                             {selectedApplication.formData.credit_cards_secured && selectedApplication.formData.credit_cards_secured.length > 0 && (
                                               <div>
                                                 <h4 className="font-semibold mb-3 text-amber-600">Secured Credit Cards</h4>
                                                 <div className="space-y-3">
                                                   {selectedApplication.formData.credit_cards_secured.map((card: any, index: number) => (
                                                     <div key={card.id} className="border rounded-lg p-3 bg-yellow-50">
                                                       <div className="grid grid-cols-2 gap-2 text-sm">
                                                         <div><span className="font-medium">Bank Name:</span> {card.bank_name}</div>
                                                         <div><span className="font-medium">Approved Limit:</span> PKR {card.approved_limit?.toLocaleString()}</div>
                                                       </div>
                                                     </div>
                                                   ))}
                                                 </div>
                                               </div>
                                             )}

                                             {/* Personal Loans Secured */}
                                             {selectedApplication.formData.personal_loans_secured && selectedApplication.formData.personal_loans_secured.length > 0 && (
                                               <div>
                                                 <h4 className="font-semibold mb-3 text-red-600">Secured Personal Loans</h4>
                                                 <div className="space-y-3">
                                                   {selectedApplication.formData.personal_loans_secured.map((loan: any, index: number) => (
                                                     <div key={loan.id} className="border rounded-lg p-3 bg-red-50">
                                                       <div className="grid grid-cols-2 gap-2 text-sm">
                                                         <div><span className="font-medium">Bank Name:</span> {loan.bank_name}</div>
                                                         <div><span className="font-medium">Approved Limit:</span> PKR {loan.approved_limit?.toLocaleString()}</div>
                                                         <div><span className="font-medium">Outstanding Amount:</span> PKR {loan.outstanding_amount?.toLocaleString()}</div>
                                                         <div><span className="font-medium">As of Date:</span> {loan.as_of}</div>
                                                       </div>
                                                     </div>
                                                   ))}
                                                 </div>
                                               </div>
                                             )}

                                             {/* Other Facilities */}
                                             {selectedApplication.formData.other_facilities && selectedApplication.formData.other_facilities.length > 0 && (
                                               <div>
                                                 <h4 className="font-semibold mb-3 text-blue-600">Other Banking Facilities</h4>
                                                 <div className="space-y-3">
                                                   {selectedApplication.formData.other_facilities.map((facility: any, index: number) => (
                                                     <div key={facility.id} className="border rounded-lg p-3 bg-blue-50">
                                                       <div className="grid grid-cols-2 gap-2 text-sm">
                                                         <div><span className="font-medium">Nature:</span> {facility.nature}</div>
                                                         <div><span className="font-medium">Bank Name:</span> {facility.bank_name}</div>
                                                         <div><span className="font-medium">Approved Limit:</span> PKR {facility.approved_limit?.toLocaleString()}</div>
                                                         <div><span className="font-medium">Current Outstanding:</span> PKR {facility.current_outstanding?.toLocaleString()}</div>
                                                       </div>
                                                     </div>
                                                   ))}
                                                 </div>
                                               </div>
                                             )}

                                             {/* References */}
                                             {selectedApplication.formData.references && selectedApplication.formData.references.length > 0 && (
                                               <div>
                                                 <h4 className="font-semibold mb-3 text-teal-600">References</h4>
                                                 <div className="space-y-3">
                                                   {selectedApplication.formData.references.map((ref: any, index: number) => (
                                                     <div key={ref.id} className="border rounded-lg p-3 bg-gray-50">
                                                       <div className="font-medium text-sm mb-2">Reference {index + 1}</div>
                                                       <div className="grid grid-cols-2 gap-2 text-sm">
                                                         <div><span className="font-medium">Name:</span> {ref.name || 'Not provided'}</div>
                                                         <div><span className="font-medium">Relationship:</span> {ref.relationship || 'Not provided'}</div>
                                                         <div><span className="font-medium">Mobile:</span> {ref.mobile || 'Not provided'}</div>
                                                         <div><span className="font-medium">CNIC:</span> {ref.cnic || 'Not provided'}</div>
                                                         <div><span className="font-medium">Address:</span> {ref.street}, {ref.city}</div>
                                                       </div>
                                                     </div>
                                                   ))}
                                                 </div>
                                               </div>
                                             )}

                                             {/* Raw Data (for debugging) */}
                                             <details className="mt-4">
                                               <summary className="cursor-pointer text-sm font-medium text-gray-600">View Raw Data</summary>
                                               <div className="mt-2 bg-gray-50 p-4 rounded-lg">
                                                 <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                                                   {JSON.stringify(selectedApplication.formData, null, 2)}
                                                 </pre>
                                               </div>
                                             </details>
                                           </div>
                                         </CardContent>
                                       </Card>
                                     )}

                                     {/* Additional Information */}
                                     {selectedApplication.returnReason && (
                                       <Card>
                                         <CardHeader>
                                           <CardTitle className="text-lg flex items-center gap-2 text-yellow-800">
                                             <AlertTriangle className="h-5 w-5" />
                                             Return Information
                                           </CardTitle>
                                         </CardHeader>
                                         <CardContent>
                                           <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                             <div className="text-sm">
                                               <div className="font-medium text-yellow-800 mb-2">Return Reason:</div>
                                               <p className="text-yellow-700">{selectedApplication.returnReason}</p>
                                             </div>
                                           </div>
                                         </CardContent>
                                       </Card>
                                     )}

                                    {/* Approval Information */}
                                    {selectedApplication.status === "approved" && (
                                      <Card>
                                        <CardHeader>
                                          <CardTitle className="text-lg flex items-center gap-2 text-green-800">
                                            <CheckCircle className="h-5 w-5" />
                                            Approval Information
                                          </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                          <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                              <span className="font-medium">Approval Date:</span>
                                              <span className="ml-2">{selectedApplication.approvalDate}</span>
                                            </div>
                                            <div>
                                              <span className="font-medium">Disbursement Date:</span>
                                              <span className="ml-2">{selectedApplication.disbursementDate}</span>
                                            </div>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    )}

                                    {/* Action Buttons */}
                                    {/* <Card>
                                      <CardHeader>
                                        <CardTitle className="text-lg">Actions</CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <div className="flex flex-wrap gap-2">
                                          {selectedApplication.status === "draft" && (
                                            <>
                                              <Button onClick={() => handleEditApplication(selectedApplication.id)}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit Application
                                              </Button>
                                              <Button variant="outline" onClick={() => handleSubmitApplication(selectedApplication.id)}>
                                                <Send className="mr-2 h-4 w-4" />
                                                Submit
                                              </Button>
                                            </>
                                          )}
                                          {selectedApplication.status === "returned_from_spu" && (
                                            <Button onClick={() => handleEditApplication(selectedApplication.id)}>
                                              <Edit className="mr-2 h-4 w-4" />
                                              Revise Application
                                            </Button>
                                          )}
                                          <Button variant="outline" onClick={() => handleCopyApplication(selectedApplication.id)}>
                                            <Copy className="mr-2 h-4 w-4" />
                                            Copy Application
                                          </Button>
                                          {selectedApplication.status === "draft" && (
                                            <Button variant="outline" onClick={() => handleDeleteApplication(selectedApplication.id)}>
                                              <Trash2 className="mr-2 h-4 w-4" />
                                              Delete
                                            </Button>
                                          )}
                                        </div>
                                      </CardContent>
                                    </Card> */}

                                    {/* View Documents Button */}
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                          <FolderOpen className="h-5 w-5" />
                                          Documents
                                        </CardTitle>
                                        <CardDescription>
                                          View uploaded documents for this application
                                        </CardDescription>
                                      </CardHeader>
                                      <CardContent>
                                        <div className="space-y-4">
                                          <Button 
                                            variant="outline" 
                                            onClick={() => setShowDocumentExplorer(true)}
                                            className="w-full"
                                          >
                                            <FolderOpen className="mr-2 h-4 w-4" />
                                            View Documents
                                          </Button>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {/* Pagination controls */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Page {page} of {Math.max(1, Math.ceil(total / pageSize))} • {total} total
                </div>
                <div className="flex items-center gap-2">
                  <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(parseInt(v, 10)); setPage(1); }}>
                    <SelectTrigger className="w-[120px]"><SelectValue placeholder="Page size" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 / page</SelectItem>
                      <SelectItem value="20">20 / page</SelectItem>
                      <SelectItem value="50">50 / page</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</Button>
                    <Button variant="outline" size="sm" disabled={page >= Math.ceil(total / pageSize)} onClick={() => setPage(p => p + 1)}>Next</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Document Explorer Dialog */}
        <Dialog open={showDocumentExplorer} onOpenChange={setShowDocumentExplorer}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
            <DialogHeader className="sticky top-0 bg-white z-10 pb-4 border-b">
              <DialogTitle>Document Explorer - {selectedApplication?.id}</DialogTitle>
              <DialogDescription>
                View uploaded documents for this application
              </DialogDescription>
            </DialogHeader>
            {selectedApplication && (
              <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
                <DocumentExplorer 
                  losId={selectedApplication.id}
                  applicationType={selectedApplication.loanType}
                  onFileSelect={(file) => {
                    toast({
                      title: "File selected",
                      description: `Selected: ${file.name}`,
                    });
                  }} 
                />
              </div>
            )}
          </DialogContent>
        </Dialog>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Application Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Average Processing Time</Label>
                    <span className="font-medium">{applicationStats.avgProcessingTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Total Loan Amount</Label>
                    <span className="font-medium text-green-600">{applicationStats.totalLoanAmount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Approval Rate</Label>
                    <span className="font-medium text-blue-600">{applicationStats.approvalRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      Approved
                    </Label>
                    <span className="font-medium">{applicationStats.approvedApplications}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      In Progress
                    </Label>
                    <span className="font-medium">{applicationStats.submittedApplications}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                      Draft
                    </Label>
                    <span className="font-medium">{applicationStats.draftApplications}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      Rejected
                    </Label>
                    <span className="font-medium">{applicationStats.rejectedApplications}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Management</CardTitle>
              <CardDescription>Upload and manage your application documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Required Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">CNIC Copy</span>
                        <Badge className="bg-green-100 text-green-800">Uploaded</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Salary Slip</span>
                        <Badge className="bg-red-100 text-red-800">Missing</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Bank Statement</span>
                        <Badge className="bg-green-100 text-green-800">Uploaded</Badge>
                      </div>
                    </div>
                    <Button className="w-full mt-4">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Documents
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Document Templates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="mr-2 h-4 w-4" />
                        Salary Certificate Template
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="mr-2 h-4 w-4" />
                        Income Declaration Form
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="mr-2 h-4 w-4" />
                        Bank Statement Format
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Document Guidelines</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>• All documents must be clear and legible</p>
                      <p>• Maximum file size: 5MB per document</p>
                      <p>• Accepted formats: PDF, JPG, PNG</p>
                      <p>• Documents must be recent (within 3 months)</p>
                      <p>• Ensure all pages are included</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mobile" className="space-y-4">
          <MobileSubmissionsComponent />
        </TabsContent>
      </Tabs>
    </div>
  );
}
