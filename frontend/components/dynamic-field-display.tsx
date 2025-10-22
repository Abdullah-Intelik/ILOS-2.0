'use client'

import React from 'react'

interface DynamicFieldDisplayProps {
  data: Record<string, any>
  title?: string
  excludeFields?: string[]
  categoryColors?: Record<string, string>
}

export function DynamicFieldDisplay({ 
  data, 
  title = "Application Data",
  excludeFields = ['id', 'created_at', 'updated_at', 'password', 'password_hash'],
  categoryColors = {}
}: DynamicFieldDisplayProps) {
  
  // Helper function to format field names
  const formatFieldName = (fieldName: string): string => {
    return fieldName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  // Helper function to format field values
  const formatFieldValue = (value: any): string => {
    if (value === null || value === undefined || value === '') {
      return 'Not provided'
    }
    
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No'
    }
    
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        return value.length > 0 ? JSON.stringify(value, null, 2) : 'Empty'
      }
      return JSON.stringify(value, null, 2)
    }
    
    // Check if it's a date
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
      try {
        const date = new Date(value)
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString()
        }
      } catch {
        // Not a valid date, return as is
      }
    }
    
    // Check if it's a number that could be currency
    if (typeof value === 'number' && value > 1000) {
      return value.toLocaleString()
    }
    
    return String(value)
  }

  // Categorize fields
  const categorizeFields = (data: Record<string, any>) => {
    const categories: Record<string, string[]> = {
      'Personal Information': [],
      'Contact Information': [],
      'Address Information': [],
      'Employment Information': [],
      'Financial Information': [],
      'Loan Information': [],
      'Card Information': [],
      'Vehicle Information': [],
      'Business Information': [],
      'Document Information': [],
      'System Information': [],
      'Other Information': []
    }

    const personalKeywords = ['name', 'cnic', 'nic', 'passport', 'dob', 'birth', 'gender', 'marital', 'father', 'mother', 'education', 'title', 'ntn', 'dependent']
    const contactKeywords = ['mobile', 'phone', 'tel', 'email', 'contact', 'fax']
    const addressKeywords = ['address', 'street', 'city', 'area', 'landmark', 'postal', 'country', 'residence', 'house']
    const employmentKeywords = ['employment', 'company', 'employer', 'designation', 'occupation', 'profession', 'salary', 'office', 'business', 'sector', 'department', 'grade']
    const financialKeywords = ['income', 'salary', 'wage', 'earning', 'rent', 'saving', 'account', 'bank', 'branch']
    const loanKeywords = ['loan', 'amount', 'tenure', 'installment', 'financing', 'payment', 'rental', 'down', 'principal']
    const cardKeywords = ['card', 'limit', 'supplementary', 'reward']
    const vehicleKeywords = ['vehicle', 'manufacturer', 'model', 'year', 'engine', 'price']
    const businessKeywords = ['shareholding', 'years_in_business', 'nature_of_business']
    const documentKeywords = ['document', 'file', 'photo', 'image', 'upload']
    const systemKeywords = ['id', 'status', 'created', 'updated', 'submitted', 'customer_id', 'los_id', 'application']

    Object.keys(data).forEach(key => {
      if (excludeFields.includes(key)) return
      
      const lowerKey = key.toLowerCase()
      
      if (systemKeywords.some(keyword => lowerKey.includes(keyword))) {
        categories['System Information'].push(key)
      } else if (personalKeywords.some(keyword => lowerKey.includes(keyword))) {
        categories['Personal Information'].push(key)
      } else if (contactKeywords.some(keyword => lowerKey.includes(keyword))) {
        categories['Contact Information'].push(key)
      } else if (addressKeywords.some(keyword => lowerKey.includes(keyword))) {
        categories['Address Information'].push(key)
      } else if (vehicleKeywords.some(keyword => lowerKey.includes(keyword))) {
        categories['Vehicle Information'].push(key)
      } else if (loanKeywords.some(keyword => lowerKey.includes(keyword))) {
        categories['Loan Information'].push(key)
      } else if (cardKeywords.some(keyword => lowerKey.includes(keyword))) {
        categories['Card Information'].push(key)
      } else if (employmentKeywords.some(keyword => lowerKey.includes(keyword))) {
        categories['Employment Information'].push(key)
      } else if (financialKeywords.some(keyword => lowerKey.includes(keyword))) {
        categories['Financial Information'].push(key)
      } else if (businessKeywords.some(keyword => lowerKey.includes(keyword))) {
        categories['Business Information'].push(key)
      } else if (documentKeywords.some(keyword => lowerKey.includes(keyword))) {
        categories['Document Information'].push(key)
      } else {
        categories['Other Information'].push(key)
      }
    })

    // Remove empty categories
    Object.keys(categories).forEach(category => {
      if (categories[category].length === 0) {
        delete categories[category]
      }
    })

    return categories
  }

  const categories = categorizeFields(data)

  const getCategoryColor = (category: string): string => {
    if (categoryColors[category]) return categoryColors[category]
    
    const colorMap: Record<string, string> = {
      'Personal Information': 'text-blue-600',
      'Contact Information': 'text-green-600',
      'Address Information': 'text-purple-600',
      'Employment Information': 'text-orange-600',
      'Financial Information': 'text-indigo-600',
      'Loan Information': 'text-red-600',
      'Card Information': 'text-pink-600',
      'Vehicle Information': 'text-teal-600',
      'Business Information': 'text-amber-600',
      'Document Information': 'text-cyan-600',
      'System Information': 'text-gray-600',
      'Other Information': 'text-slate-600'
    }
    return colorMap[category] || 'text-gray-600'
  }

  return (
    <div className="space-y-6">
      {Object.entries(categories).map(([category, fields]) => (
        <div key={category} className="border rounded-lg p-4 bg-white shadow-sm">
          <h4 className={`font-semibold mb-3 ${getCategoryColor(category)}`}>
            {category} ({fields.length} fields)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
            {fields.map(field => {
              const value = data[field]
              const formattedValue = formatFieldValue(value)
              const hasValue = value !== null && value !== undefined && value !== '' && formattedValue !== 'Not provided'
              
              return (
                <div 
                  key={field} 
                  className={`${hasValue ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'} border rounded p-2`}
                >
                  <span className="font-medium text-gray-700">{formatFieldName(field)}:</span>
                  <div className={`mt-1 ${hasValue ? 'text-gray-900' : 'text-gray-400'} break-words`}>
                    {formattedValue}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// Simplified version for inline display
export function InlineFieldDisplay({ data, excludeFields = [] }: { data: Record<string, any>, excludeFields?: string[] }) {
  const formatFieldName = (fieldName: string): string => {
    return fieldName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const formatFieldValue = (value: any): string => {
    if (value === null || value === undefined || value === '') return 'Not provided'
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    if (typeof value === 'object') return JSON.stringify(value)
    if (typeof value === 'number' && value > 1000) return value.toLocaleString()
    return String(value)
  }

  return (
    <div className="grid grid-cols-2 gap-3 text-sm">
      {Object.entries(data)
        .filter(([key]) => !excludeFields.includes(key))
        .map(([key, value]) => {
          const formattedValue = formatFieldValue(value)
          const hasValue = value !== null && value !== undefined && value !== ''
          
          return (
            <div key={key} className={hasValue ? '' : 'opacity-50'}>
              <span className="font-medium">{formatFieldName(key)}:</span>{' '}
              {formattedValue}
            </div>
          )
        })}
    </div>
  )
}
