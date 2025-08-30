'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Label, Textarea } from '@medical/ui'
import { MessageSquare, ArrowRight, ArrowLeft, Loader2, AlertTriangle, Info } from 'lucide-react'

interface TriageResponse {
  tests: string[]
  summary: string
  severity: string
  priority: string
  recommendations: string[]
}

export default function SymptomsPage() {
  const router = useRouter()
  const [patientId, setPatientId] = useState<string | null>(null)
  const [symptoms, setSymptoms] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [triageResult, setTriageResult] = useState<TriageResponse | null>(null)
  const [visitId, setVisitId] = useState<string | null>(null)

  useEffect(() => {
    const id = sessionStorage.getItem('currentPatientId')
    if (!id) {
      router.push('/')
      return
    }
    setPatientId(id)
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!patientId || !symptoms.trim()) {
      alert('Please describe your symptoms')
      return
    }

    setIsLoading(true)
    
    try {
      // Get AI triage recommendation
      const triageResponse = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptoms: symptoms.trim(),
          patientId,
        }),
      })

      if (triageResponse.ok) {
        const triage = await triageResponse.json()
        setTriageResult(triage.aiSuggestion)
        setVisitId(triage.visitId)
        sessionStorage.setItem('currentVisitId', triage.visitId)
      } else {
        alert('Error getting AI recommendation')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error processing symptoms')
    } finally {
      setIsLoading(false)
    }
  }

  const handleContinue = () => {
    router.push('/doctor')
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'emergency': return 'text-red-800 bg-red-100 border-red-300'
      default: return 'text-slate-600 bg-slate-50 border-slate-200'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
      case 'emergency':
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  if (!patientId) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <MessageSquare className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Describe Your Symptoms
          </h1>
          <p className="text-lg text-slate-600">
            Tell us what you&apos;re experiencing so we can provide the best care
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Current Symptoms</CardTitle>
              <CardDescription>
                Please describe your symptoms in detail. Include when they started, severity, and any other relevant information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="symptoms">Symptoms Description *</Label>
                  <Textarea
                    id="symptoms"
                    placeholder="Describe your symptoms, when they started, severity, and any other relevant details..."
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    required
                    rows={8}
                    className="min-h-[200px]"
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/vitals')}
                    className="flex-1"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isLoading || !symptoms.trim()}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        AI Analysis...
                      </>
                    ) : (
                      <>
                        Get AI Recommendation
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {triageResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getSeverityIcon(triageResult.severity)}
                  AI Triage Recommendation
                </CardTitle>
                <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(triageResult.severity)}`}>
                  Priority: {triageResult.priority} | Severity: {triageResult.severity}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Summary</h4>
                  <p className="text-slate-600">{triageResult.summary}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Recommended Tests</h4>
                  <ul className="space-y-1">
                    {triageResult.tests.map((test, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2"></div>
                        <span className="text-slate-600">{test}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {triageResult.recommendations && triageResult.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Immediate Recommendations</h4>
                    <ul className="space-y-1">
                      {triageResult.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2"></div>
                          <span className="text-slate-600">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="border-t pt-4">
                  <Button onClick={handleContinue} className="w-full">
                    Continue to Doctor Review
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mt-8 text-center text-sm text-slate-500">
          <p>This is an AI-powered preliminary assessment. A medical professional will review and approve the final recommendations.</p>
        </div>
      </div>
    </div>
  )
}