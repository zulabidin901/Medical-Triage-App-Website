'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from '@medical/ui'
import { CheckCircle, FileText, ArrowLeft, Download, Calendar, Clock } from 'lucide-react'

interface Visit {
  id: string
  symptoms: string
  status: string
  priority: string
  createdAt: string
  updatedAt: string
  aiSuggestion: {
    tests: string[]
    summary: string
    severity: string
    priority: string
    recommendations: string[]
  }
  doctorApproval: {
    approved: boolean
    approvedTests: string[]
    notes: string
    approvedBy: string
    approvedAt: string
  }
  patient: {
    id: string
    name: string
    age: number
    gender: string
  }
}

export default function FinalPage() {
  const router = useRouter()
  const [visit, setVisit] = useState<Visit | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchVisitDetails = async () => {
      const visitId = sessionStorage.getItem('currentVisitId')
      if (!visitId) {
        router.push('/')
        return
      }

      try {
        const response = await fetch(`/api/visits/${visitId}`)
        if (response.ok) {
          const data = await response.json()
          setVisit(data)
        } else {
          router.push('/')
        }
      } catch (error) {
        console.error('Error fetching visit:', error)
        router.push('/')
      } finally {
        setIsLoading(false)
      }
    }

    fetchVisitDetails()
  }, [router])

  const handleNewVisit = () => {
    sessionStorage.removeItem('currentPatientId')
    sessionStorage.removeItem('currentVisitId')
    router.push('/')
  }

  const handlePrintSummary = () => {
    window.print()
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading your visit summary...</p>
        </div>
      </div>
    )
  }

  if (!visit) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-slate-600">Visit not found</p>
          <Button onClick={() => router.push('/')} className="mt-4">
            Start New Visit
          </Button>
        </div>
      </div>
    )
  }

  const getStatusMessage = () => {
    if (visit.status === 'approved') {
      return {
        title: 'Care Plan Approved',
        message: 'Your care plan has been reviewed and approved by our medical team.',
        color: 'text-green-600',
        bg: 'bg-green-50',
        icon: CheckCircle
      }
    } else {
      return {
        title: 'Care Plan Under Review',
        message: 'Your care plan is being reviewed by our medical team.',
        color: 'text-yellow-600',
        bg: 'bg-yellow-50',
        icon: Clock
      }
    }
  }

  const status = getStatusMessage()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <status.icon className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Visit Summary
          </h1>
          <p className="text-lg text-slate-600">
            Your complete triage and care plan summary
          </p>
        </div>

        {/* Status Card */}
        <Card className={`mb-8 border-l-4 ${status.color.replace('text-', 'border-l-')}`}>
          <CardContent className={`${status.bg} p-6`}>
            <div className="flex items-center gap-4">
              <status.icon className={`h-8 w-8 ${status.color}`} />
              <div>
                <h3 className={`text-xl font-bold ${status.color}`}>{status.title}</h3>
                <p className="text-slate-700">{status.message}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Patient Information */}
          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600">Name:</span>
                <span className="font-medium">{visit.patient.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Age:</span>
                <span className="font-medium">{visit.patient.age} years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Gender:</span>
                <span className="font-medium">{visit.patient.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Visit Date:</span>
                <span className="font-medium">{new Date(visit.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Priority:</span>
                <span className={`font-medium capitalize px-2 py-1 rounded text-sm ${
                  visit.priority === 'high' ? 'bg-red-100 text-red-800' :
                  visit.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {visit.priority}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Visit Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Visit Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                  <div>
                    <p className="font-medium">Check-in Completed</p>
                    <p className="text-sm text-slate-600">{new Date(visit.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                  <div>
                    <p className="font-medium">AI Triage Completed</p>
                    <p className="text-sm text-slate-600">Symptoms analyzed and recommendations generated</p>
                  </div>
                </div>
                {visit.doctorApproval && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
                    <div>
                      <p className="font-medium">Doctor Review Completed</p>
                      <p className="text-sm text-slate-600">
                        Reviewed by {visit.doctorApproval.approvedBy}
                      </p>
                      <p className="text-sm text-slate-600">
                        {new Date(visit.doctorApproval.approvedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Symptoms and Assessment */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Symptoms & Assessment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Reported Symptoms</h4>
              <p className="text-slate-600 bg-slate-50 p-3 rounded">{visit.symptoms}</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">AI Assessment Summary</h4>
              <p className="text-slate-600">{visit.aiSuggestion.summary}</p>
            </div>
          </CardContent>
        </Card>

        {/* Approved Tests and Care Plan */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>
              {visit.doctorApproval?.approved ? 'Approved Care Plan' : 'Recommended Care Plan'}
            </CardTitle>
            <CardDescription>
              {visit.doctorApproval?.approved 
                ? 'Tests and procedures approved by your doctor'
                : 'Preliminary recommendations pending doctor approval'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">
                  {visit.doctorApproval?.approved ? 'Approved Tests' : 'Recommended Tests'}
                </h4>
                <ul className="space-y-2">
                  {(visit.doctorApproval?.approved ? visit.doctorApproval.approvedTests : visit.aiSuggestion.tests).map((test, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-600">{test}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {visit.aiSuggestion.recommendations && visit.aiSuggestion.recommendations.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Immediate Recommendations</h4>
                  <ul className="space-y-2">
                    {visit.aiSuggestion.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                        <span className="text-slate-600">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {visit.doctorApproval?.notes && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Doctor Notes</h4>
                  <p className="text-slate-600 bg-slate-50 p-3 rounded">{visit.doctorApproval.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-slate-600">
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 mt-0.5 text-blue-500" />
                <span>Schedule appointments for approved tests with the front desk</span>
              </div>
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 mt-0.5 text-blue-500" />
                <span>Keep this summary for your medical records</span>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 mt-0.5 text-blue-500" />
                <span>Follow up with your primary care physician as recommended</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button
            variant="outline"
            onClick={handlePrintSummary}
            className="flex-1"
          >
            <Download className="mr-2 h-4 w-4" />
            Print Summary
          </Button>
          
          <Button
            onClick={handleNewVisit}
            className="flex-1"
          >
            Start New Visit
          </Button>
        </div>

        <div className="mt-8 text-center text-sm text-slate-500">
          <p>This summary contains important medical information. Please keep it for your records.</p>
        </div>
      </div>
    </div>
  )
}