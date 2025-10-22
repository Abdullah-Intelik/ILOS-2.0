"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ApplicationStatus, Department, WorkflowStep } from "@/app/types"
import { CheckCircle, Clock, AlertTriangle, ArrowRight } from "lucide-react"

interface WorkflowDiagramProps {
  currentDepartment: Department
  workflowSteps: WorkflowStep[]
  applicationStatus: ApplicationStatus
}

const departmentLabels: Record<Department, string> = {
  pb: "Personal Banking",
  spu: "Scrutiny Processing Unit",
  cops: "Centralized Operations",
  eamvu: "External Asset Verification",
  ciu_rru: "CIU - Resume Review",
  ciu_afd: "CIU - Anti-Fraud",
  ciu_acceptance: "CIU - Acceptance"
}

const departmentOrder: Department[] = [
  'pb',
  'spu',
  'cops',
  'eamvu',
  'ciu_rru',
  'ciu_afd',
  'ciu_acceptance',
  'pb' // Final view post-CIU
]

export function WorkflowDiagram({ 
  currentDepartment, 
  workflowSteps, 
  applicationStatus 
}: WorkflowDiagramProps) {
  
  // Determine the status of each department in the workflow
  const departmentStatus = departmentOrder.reduce((acc, dept, index) => {
    // Handle the final PB step differently (disbursement)
    if (dept === 'pb' && index === departmentOrder.length - 1) {
      const isCompleted = applicationStatus === 'disbursed'
      const isCurrent = applicationStatus === 'acceptance_approved' || applicationStatus === 'acceptance_conditional'
      
      acc[`${dept}_final`] = {
        status: isCompleted ? 'completed' : isCurrent ? 'current' : 'pending',
        label: "PB (Disbursement)"
      }
      return acc
    }
    
    // For normal departments
    const step = workflowSteps.find(step => step.department === dept)
    
    if (step) {
      acc[dept] = {
        status: step.status === 'completed' ? 'completed' : 
                step.status === 'in_progress' ? 'current' : 
                step.status === 'skipped' ? 'skipped' : 'pending',
        label: departmentLabels[dept]
      }
    } else {
      acc[dept] = {
        status: currentDepartment === dept ? 'current' : 'pending',
        label: departmentLabels[dept]
      }
    }
    
    return acc
  }, {} as Record<string, { status: string, label: string }>)
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Loan Application Workflow</CardTitle>
        <CardDescription>Current status and workflow progression</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-7 gap-2 mb-4">
            {departmentOrder.slice(0, 7).map((dept, index) => (
              <div key={dept} className="flex flex-col items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    departmentStatus[dept].status === 'completed' 
                      ? 'bg-green-100 text-green-600' 
                      : departmentStatus[dept].status === 'current'
                      ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-600'
                      : departmentStatus[dept].status === 'skipped'
                      ? 'bg-gray-100 text-gray-400'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {departmentStatus[dept].status === 'completed' ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : departmentStatus[dept].status === 'current' ? (
                    <Clock className="h-5 w-5" />
                  ) : departmentStatus[dept].status === 'skipped' ? (
                    <AlertTriangle className="h-5 w-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <div className="text-xs text-center mt-2 font-medium">{departmentStatus[dept].label}</div>
                
                {/* Connect with arrow if not the last item */}
                {index < departmentOrder.length - 2 && (
                  <div className="hidden md:flex absolute transform translate-x-12">
                    <ArrowRight className="h-4 w-4 text-gray-400 mt-3" />
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Final PB step (disbursement) */}
          <div className="flex justify-center mt-4">
            <div className="flex flex-col items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  departmentStatus['pb_final'].status === 'completed' 
                    ? 'bg-green-100 text-green-600' 
                    : departmentStatus['pb_final'].status === 'current'
                    ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-600'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {departmentStatus['pb_final'].status === 'completed' ? (
                  <CheckCircle className="h-5 w-5" />
                ) : departmentStatus['pb_final'].status === 'current' ? (
                  <Clock className="h-5 w-5" />
                ) : (
                  <span>8</span>
                )}
              </div>
              <div className="text-xs text-center mt-2 font-medium">{departmentStatus['pb_final'].label}</div>
            </div>
          </div>
          
          {/* Current status */}
          <div className="mt-6 text-center">
            <div className="text-sm text-muted-foreground">Current Department</div>
            <div className="text-lg font-semibold">
              {currentDepartment === 'pb' && applicationStatus === 'disbursed' 
                ? 'PB (Disbursement)' 
                : departmentLabels[currentDepartment]}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 