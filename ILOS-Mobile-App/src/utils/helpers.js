export const getStatusColor = (status) => {
  switch (status) {
    case 'Pending':
      return '#f59e0b';
    case 'In Progress':
      return '#3b82f6';
    case 'Completed':
      return '#10b981';
    case 'Rejected':
      return '#ef4444';
    case 'Collected':
      return '#8b5cf6';
    case 'Verified':
      return '#059669';
    default:
      return '#6b7280';
  }
};

export const getPriorityColor = (priority) => {
  switch (priority) {
    case 'High':
      return '#ef4444';
    case 'Medium':
      return '#f59e0b';
    case 'Low':
      return '#10b981';
    default:
      return '#6b7280';
  }
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const filterApplicationsByStatus = (applications, status) => {
  return applications.filter(app => app.status === status);
};

export const sortApplicationsByPriority = (applications) => {
  const priorityOrder = { High: 1, Medium: 2, Low: 3 };
  return applications.sort((a, b) => {
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
};