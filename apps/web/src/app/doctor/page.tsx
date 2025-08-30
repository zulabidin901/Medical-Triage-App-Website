'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Textarea, Label } from '@medical/ui'
import { User, CheckCircle, XCircle, ArrowRight, Stethoscope, Clock, AlertTriangle } from 'lucide-react'

interface Visit {
  id: string
  symptoms: string
  status: string
  priority: string
  createdAt: string
  aiSuggestion: {
    tests: string[]
    summary: string
    severity: string
    priority: string
    recommendations: string[]
  }
  patient: {
    id: string
    name: string
    age: number
    gender: string
  }
}

export default function DoctorPage() {
  const router = useRouter()
  const [visits, setVisits] = useState<Visit[]>([])
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null)
  const [doctorNotes, setDoctorNotes] = useState('')
  const [approvedTests, setApprovedTests] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchPendingVisits()
  }, [])

  const fetchPendingVisits = async () => {
    try {
      const response = await fetch('/api/visits?status=pending')
      if (response.ok) {
        const data = await response.json()
        setVisits(data)
        
        // Auto-select current visit if coming from symptoms page
        const currentVisitId = sessionStorage.getItem('currentVisitId')
        if (currentVisitId) {
          const currentVisit = data.find((v: Visit) => v.id === currentVisitId)
          if (currentVisit) {
            setSelectedVisit(currentVisit)
            setApprovedTests(currentVisit.aiSuggestion.tests)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching visits:', error)
    }
  }

  const handleApprove = async (approved: boolean) => {
    if (!selectedVisit) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/visits/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitId: selectedVisit.id,
          approved,
          approvedTests: approved ? approvedTests : [],
          doctorNotes: doctorNotes.trim(),
          doctorApproval: {
            approved,
            approvedTests: approved ? approvedTests : [],
            notes: doctorNotes.trim(),
            approvedBy: 'Dr. Smith', // In a real app, this would be the logged-in doctor
            approvedAt: new Date().toISOString(),
          }
        }),
      })

      if (response.ok) {
        // Refresh the visits list
        await fetchPendingVisits()
        // Navigate to final page if this was the current patient's visit
        const currentVisitId = sessionStorage.getItem('currentVisitId')
        if (selectedVisit.id === currentVisitId) {
          router.push('/final')
        } else {
          setSelectedVisit(null)
          setDoctorNotes('')
          setApprovedTests([])
        }
      } else {
        alert('Error updating visit')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error updating visit')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleTestApproval = (test: string) => {
    setApprovedTests(prev => 
      prev.includes(test) 
        ? prev.filter(t => t !== test)
        : [...prev, test]
    )
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'low': return 'text-green-600 bg-green-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'high': return 'text-red-600 bg-red-50'
      case 'emergency': return 'text-red-800 bg-red-100'
      default: return 'text-slate-600 bg-slate-50'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'text-yellow-600 bg-yellow-50'
      case 'approved': return 'text-green-600 bg-green-50'
      case 'rejected': return 'text-red-600 bg-red-50'
      default: return 'text-slate-600 bg-slate-50'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <User className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Doctor Dashboard
          </h1>
          <p className="text-lg text-slate-600">
            Review AI recommendations and approve patient care plans
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Patients List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Pending Reviews ({visits.length})</CardTitle>
              <CardDescription>
                Patients waiting for doctor approval
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {visits.length === 0 ? (
                <div className="p-6 text-center text-slate-500">
                  <Stethoscope className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                  <p>No pending visits</p>
                </div>
              ) : (
                <div className="divide-y">
                  {visits.map((visit) => (
                    <div
                      key={visit.id}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedVisit?.id === visit.id 
                          ? 'bg-blue-50 border-l-4 border-l-blue-500' 
                          : 'hover:bg-slate-50'
                      }`}
                      onClick={() => {
                        setSelectedVisit(visit)
                        setApprovedTests(visit.aiSuggestion.tests)
                        setDoctorNotes('')
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-slate-900">{visit.patient.name}</h4>
                          <p className="text-sm text-slate-600">{visit.patient.age} years, {visit.patient.gender}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(visit.priority)}`}>
                              {visit.priority}
                            </span>
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                              <Clock className="h-3 w-3" />
                              {new Date(visit.createdAt).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                        {visit.aiSuggestion.severity === 'high' || visit.aiSuggestion.severity === 'emergency' ? (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Patient Details and Approval */}
          <div className="lg:col-span-2 space-y-6">
            {!selectedVisit ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <User className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                  <p className="text-slate-500">Select a patient to review their case</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Patient Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{selectedVisit.patient.name}</span>
                      <div className="flex gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(selectedVisit.priority)}`}>
                          {selectedVisit.priority} Priority
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedVisit.status)}`}>
                          {selectedVisit.status}
                        </span>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      {selectedVisit.patient.age} years old, {selectedVisit.patient.gender}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-2">Reported Symptoms</h4>
                        <p className="text-slate-600 bg-slate-50 p-3 rounded">{selectedVisit.symptoms}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-2">AI Assessment</h4>
                        <p className="text-slate-600">{selectedVisit.aiSuggestion.summary}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Test Approval */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recommended Tests</CardTitle>
                    <CardDescription>
                      Review and approve the AI-recommended tests
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedVisit.aiSuggestion.tests.map((test, index) => (
                        <label key={index} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={approvedTests.includes(test)}
                            onChange={() => toggleTestApproval(test)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-slate-700">{test}</span>
                        </label>
                      ))}
                    </div>

                    <div className="mt-6">
                      <Label htmlFor="doctorNotes">Doctor Notes (Optional)</Label>
                      <Textarea
                        id="doctorNotes"
                        placeholder="Add any additional notes or modifications to the care plan..."
                        value={doctorNotes}
                        onChange={(e) => setDoctorNotes(e.target.value)}
                        rows={4}
                      />
                    </div>

                    <div className="flex gap-4 mt-6">
                      <Button
                        onClick={() => handleApprove(false)}
                        variant="outline"
                        className="flex-1 text-red-600 hover:text-red-700"
                        disabled={isLoading}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject Plan
                      </Button>
                      
                      <Button
                        onClick={() => handleApprove(true)}
                        className="flex-1"
                        disabled={isLoading || approvedTests.length === 0}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        {isLoading ? 'Approving...' : 'Approve Plan'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}