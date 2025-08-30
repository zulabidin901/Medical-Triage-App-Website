'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Label } from '@medical/ui'
import { Activity, ArrowRight, ArrowLeft } from 'lucide-react'

export default function VitalsPage() {
  const router = useRouter()
  const [patientId, setPatientId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    bloodPressure: '',
    weight: '',
    temperature: '',
    spO2: '',
    heartRate: '',
  })
  const [isLoading, setIsLoading] = useState(false)

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
    if (!patientId) return

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          bloodPressure: formData.bloodPressure || null,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          temperature: formData.temperature ? parseFloat(formData.temperature) : null,
          spO2: formData.spO2 ? parseFloat(formData.spO2) : null,
          heartRate: formData.heartRate ? parseInt(formData.heartRate) : null,
        }),
      })

      if (response.ok) {
        router.push('/symptoms')
      } else {
        alert('Error saving vitals')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error saving vitals')
    } finally {
      setIsLoading(false)
    }
  }

  if (!patientId) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Activity className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Vital Signs
          </h1>
          <p className="text-lg text-slate-600">
            Please provide your current vital signs (all optional)
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Enter Your Vital Signs</CardTitle>
            <CardDescription>
              These measurements help us better assess your condition. Fill in what you know.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="bloodPressure">Blood Pressure</Label>
                  <Input
                    id="bloodPressure"
                    type="text"
                    placeholder="e.g., 120/80"
                    value={formData.bloodPressure}
                    onChange={(e) => setFormData({ ...formData, bloodPressure: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="heartRate">Heart Rate (bpm)</Label>
                  <Input
                    id="heartRate"
                    type="number"
                    placeholder="e.g., 72"
                    min="30"
                    max="200"
                    value={formData.heartRate}
                    onChange={(e) => setFormData({ ...formData, heartRate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature (°C)</Label>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 37.0"
                    min="35"
                    max="42"
                    value={formData.temperature}
                    onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="spO2">Oxygen Saturation (%)</Label>
                  <Input
                    id="spO2"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 98.5"
                    min="70"
                    max="100"
                    value={formData.spO2}
                    onChange={(e) => setFormData({ ...formData, spO2: e.target.value })}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 70.5"
                    min="1"
                    max="300"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/')}
                  className="flex-1"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    'Saving Vitals...'
                  ) : (
                    <>
                      Continue to Symptoms
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-slate-500">
          <p>Don&apos;t worry if you don&apos;t know all your vitals - our medical team will measure them</p>
        </div>
      </div>
    </div>
  )
}