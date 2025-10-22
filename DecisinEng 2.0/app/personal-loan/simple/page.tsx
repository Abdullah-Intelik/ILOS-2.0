'use client';

import React from 'react';

export default function SimplePersonalLoan() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Personal Loan Decision Engine</h1>
          <p className="text-gray-600 mb-6">Simplified version to test routing</p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">🎯 Personal Loan Features</h2>
            <ul className="text-blue-700 space-y-1">
              <li>• EMI Calculation with tenure-based logic</li>
              <li>• Tenure validation (age and employment based)</li>
              <li>• Loan affordability assessment</li>
              <li>• Stricter DBR thresholds (35% vs 40%)</li>
              <li>• Enhanced income requirements</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">✅ Route Working</h3>
              <p className="text-green-700 text-sm">Personal Loan page is accessible</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Next Steps</h3>
              <p className="text-yellow-700 text-sm">Restart Next.js dev server if needed</p>
            </div>
          </div>

          <div className="mt-6">
            <a 
              href="/" 
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors mr-4"
            >
              ← Back to Credit Card Engine
            </a>
            <a 
              href="/personal-loan/test" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Test Route
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

