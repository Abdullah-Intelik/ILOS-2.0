"use client";
import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

/**
 * FormSection - Professional Banking Form Section
 * Clean, conservative design following banking industry standards
 */

interface FormSectionProps {
  sectionNumber?: number;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  required?: boolean;
  className?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({
  sectionNumber,
  title,
  subtitle,
  icon,
  children,
  collapsible = false,
  defaultCollapsed = false,
  required = false,
  className = ''
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  return (
    <section className={`mb-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${className}`}>
      {/* Modern Section Header with Subtle Teal Accent */}
      <div 
        className={`bg-gradient-to-r from-slate-50 to-white border-l-4 border-teal-500 px-6 py-5 ${collapsible ? 'cursor-pointer hover:bg-slate-50/80 transition-colors' : ''}`}
        onClick={collapsible ? () => setIsCollapsed(!isCollapsed) : undefined}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {sectionNumber && (
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 text-white font-bold text-base shadow-sm">
                {sectionNumber}
              </div>
            )}
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                {title}
                {required && <span className="text-red-500 ml-1">*</span>}
              </h3>
              {subtitle && (
                <p className="text-sm text-slate-600 mt-1">{subtitle}</p>
              )}
            </div>
          </div>
          {collapsible && (
            <button 
              type="button"
              className="text-slate-400 hover:text-teal-600 transition-colors p-2 rounded-lg hover:bg-teal-50"
              aria-label={isCollapsed ? "Expand section" : "Collapse section"}
            >
              {isCollapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
            </button>
          )}
        </div>
      </div>
      
      {/* Section Content */}
      {!isCollapsed && (
        <div className="p-7 bg-white">
          {children}
        </div>
      )}
    </section>
  );
};

