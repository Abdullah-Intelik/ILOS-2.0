import React from 'react'

interface StatusBadgeProps {
  status:
    | 'pending'
    | 'in-verification'
    | 'approved'
    | 'rejected'
    | 'disbursed'
    | 'verified'
    | 'missing'
    | 'error'
  size?: 'sm' | 'md'
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'approved':
        return { color: 'bg-green-100 text-green-800', label: 'Approved' }
      case 'rejected':
        return { color: 'bg-red-100 text-red-800', label: 'Rejected' }
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' }
      case 'in-verification':
        return { color: 'bg-blue-100 text-blue-800', label: 'In Verification' }
      case 'disbursed':
        return { color: 'bg-purple-100 text-purple-800', label: 'Disbursed' }
      case 'verified':
        return { color: 'bg-green-100 text-green-800', label: 'Verified' }
      case 'missing':
        return { color: 'bg-gray-100 text-gray-700', label: 'Missing' }
      case 'error':
        return { color: 'bg-red-200 text-red-800', label: 'Error' }
      default:
        return { color: 'bg-gray-100 text-gray-800', label: status }
    }
  }

  const config = getStatusConfig(status)
  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm'

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${config.color} ${sizeClasses}`}
    >
      {config.label}
    </span>
  )
}

export default StatusBadge
