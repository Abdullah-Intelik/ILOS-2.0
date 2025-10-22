// Data transformation utilities for ILOS Mobile App

// Transform EAMVU applications from backend to mobile-friendly format
export const transformEAMVUApplications = (backendData) => {
  if (!Array.isArray(backendData)) {
    console.warn('⚠️ Backend data is not an array:', backendData);
    return [];
  }

  return backendData.map(application => ({
    id: application.id,
    losId: application.los_id,
    applicantName: application.applicant_name,
    applicantPhone: application.applicant_phone || '+92-300-0000000',
    loanType: application.loan_type,
    amount: formatCurrency(application.loan_amount),
    status: application.status,
    priority: application.priority,
    assignedOfficer: application.assigned_officer,
    createdAt: application.created_at,
    branch: application.branch,
    applicationType: application.application_type,
    address: application.address || 'Address not available',
    documents: application.documents || [],
    // Add computed fields
    displayStatus: transformStatus(application.status),
    displayPriority: determinePriority(application.priority, application.status),
    formattedDate: formatDate(application.created_at),
  }));
};

// Transform application details from backend
export const transformApplicationDetails = (backendData) => {
  if (!backendData) {
    console.warn('⚠️ No application details data provided');
    return null;
  }

  return {
    id: backendData.id,
    losId: backendData.los_id,
    applicantName: backendData.applicant_name,
    applicantPhone: backendData.applicant_phone || '+92-300-0000000',
    loanType: backendData.loan_type,
    amount: formatCurrency(backendData.loan_amount),
    status: backendData.status,
    priority: backendData.priority,
    assignedOfficer: backendData.assigned_officer,
    createdAt: backendData.created_at,
    branch: backendData.branch,
    applicationType: backendData.application_type,
    address: backendData.address || 'Address not available',
    documents: backendData.documents || [],
    // Add computed fields
    displayStatus: transformStatus(backendData.status),
    displayPriority: determinePriority(backendData.priority, backendData.status),
    formattedDate: formatDate(backendData.created_at),
  };
};

// Transform comments from backend
export const transformComments = (backendData) => {
  if (!backendData || !Array.isArray(backendData)) {
    console.warn('⚠️ No comments data or invalid format:', backendData);
    return [];
  }

  return backendData.map(comment => ({
    id: comment.id,
    author: comment.author || 'Unknown',
    text: comment.text || comment.comment_text || 'No comment text',
    date: formatDate(comment.created_at || comment.date),
    department: comment.department,
    fieldName: comment.field_name,
  }));
};

// Transform documents from backend
export const transformDocuments = (backendData) => {
  if (!backendData || !Array.isArray(backendData)) {
    console.warn('⚠️ No documents data or invalid format:', backendData);
    return [];
  }

  return backendData.map(document => ({
    id: document.id,
    name: document.name,
    status: document.status,
    required: document.required,
    url: document.url,
    type: document.type || 'Unknown',
    // Add computed fields
    displayStatus: transformDocumentStatus(document.status),
    statusColor: getDocumentStatusColor(document.status),
  }));
};

// Format currency values
const formatCurrency = (amount) => {
  if (!amount || amount === '0') {
    return 'PKR 0';
  }
  
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount)) {
    return 'PKR 0';
  }
  
  return `PKR ${numAmount.toLocaleString('en-PK')}`;
};

// Format date strings
const formatDate = (dateString) => {
  if (!dateString) {
    return 'N/A';
  }
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    return date.toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.warn('⚠️ Error formatting date:', dateString, error);
    return 'Invalid Date';
  }
};

// Transform status values to display format
const transformStatus = (status) => {
  if (!status) return 'Unknown';
  
  const statusMap = {
    'SUBMITTED_BY_SPU': 'Submitted by SPU',
    'submitted_by_spu': 'Submitted by SPU',
    'SUBMITTED_TO_COPS': 'Submitted to COPS',
    'submitted_to_cops': 'Submitted to COPS',
    'SUBMITTED_TO_CIU': 'Submitted to CIU',
    'submitted_to_ciu': 'Submitted to CIU',
    'SUBMITTED_TO_RRU': 'Submitted to RRU',
    'submitted_to_rru': 'Submitted to RRU',
    'APPROVED': 'Approved',
    'approved': 'Approved',
    'REJECTED': 'Rejected',
    'rejected': 'Rejected',
    'RETURNED': 'Returned',
    'returned': 'Returned',
    'assigned_to_eavmu_officer': 'Assigned to EAMVU Officer',
    'returned_by_eavmu_officer': 'Returned by EAMVU Officer',
  };
  
  return statusMap[status] || status;
};

// Transform document status values
const transformDocumentStatus = (status) => {
  if (!status) return 'Unknown';
  
  const statusMap = {
    'pending': 'Pending',
    'collected': 'Collected',
    'verified': 'Verified',
    'rejected': 'Rejected',
  };
  
  return statusMap[status.toLowerCase()] || status;
};

// Determine priority based on status and priority
const determinePriority = (priority, status) => {
  if (!priority) return 'low';
  
  // Normalize priority to lowercase
  const normalizedPriority = priority.toLowerCase();
  
  // If status indicates urgency, boost priority
  if (status === 'SUBMITTED_BY_SPU') {
    return normalizedPriority === 'high' ? 'high' : 'medium';
  }
  
  return normalizedPriority;
};

// Get status color for badges
export const getStatusColor = (status) => {
  if (!status) return '#6b7280';
  
  const statusColors = {
    'SUBMITTED_BY_SPU': '#3B82F6',
    'SUBMITTED_TO_COPS': '#F59E0B',
    'SUBMITTED_TO_CIU': '#EF4444',
    'SUBMITTED_TO_RRU': '#EC4899',
    'APPROVED': '#059669',
    'REJECTED': '#DC2626',
    'RETURNED': '#F97316',
  };
  
  return statusColors[status] || '#6b7280';
};

// Get priority color for badges
export const getPriorityColor = (priority) => {
  if (!priority) return '#6b7280';
  
  const priorityColors = {
    'high': '#DC2626',
    'medium': '#F59E0B',
    'low': '#10B981',
  };
  
  return priorityColors[priority.toLowerCase()] || '#6b7280';
};

// Get document status color
export const getDocumentStatusColor = (status) => {
  if (!status) return '#6b7280';
  
  const statusColors = {
    'pending': '#F59E0B',
    'collected': '#10B981',
    'verified': '#059669',
    'rejected': '#DC2626',
  };
  
  return statusColors[status.toLowerCase()] || '#6b7280';
};

// Sort applications by priority and date
export const sortApplicationsByPriority = (applications) => {
  if (!Array.isArray(applications)) {
    return [];
  }
  
  const priorityOrder = { high: 3, medium: 2, low: 1 };
  
  return applications.sort((a, b) => {
    // First sort by priority
    const priorityA = priorityOrder[a.priority?.toLowerCase()] || 0;
    const priorityB = priorityOrder[b.priority?.toLowerCase()] || 0;
    
    if (priorityA !== priorityB) {
      return priorityB - priorityA; // High priority first
    }
    
    // Then sort by creation date (newest first)
    const dateA = new Date(a.createdAt || a.created_at);
    const dateB = new Date(b.createdAt || b.created_at);
    
    return dateB - dateA;
  });
};

export default {
  transformEAMVUApplications,
  transformApplicationDetails,
  transformComments,
  transformDocuments,
  getStatusColor,
  getPriorityColor,
  getDocumentStatusColor,
  sortApplicationsByPriority,
}; 