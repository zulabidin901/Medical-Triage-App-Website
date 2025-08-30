'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Label } from '@medical/ui'
import { User, ArrowRight } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.age || !formData.gender) {
      alert('Please fill in all fields')
      return
    }

    setIsLoading(true)
    
    try {
      // Create patient
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          age: parseInt(formData.age),
          gender: formData.gender,
        }),
      })

      if (response.ok) {
        const patient = await response.json()
        // Store patient ID in session storage for the flow
        sessionStorage.setItem('currentPatientId', patient.id)
        router.push('/vitals')
      } else {
        alert('Error creating patient record')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error creating patient record')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <User className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Welcome to Medical Triage
          </h1>
          <p className="text-lg text-slate-600">
            Let&apos;s start by getting your basic information
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Patient Check-In</CardTitle>
            <CardDescription>
              Please provide your basic information to begin the triage process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Enter your age"
                  min="1"
                  max="150"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <select
                  id="gender"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  required
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  'Creating Patient Record...'
                ) : (
                  <>
                    Continue to Vitals
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-slate-500">
          <p>Your information is secure and will only be used for medical purposes</p>
        </div>
      </div>
    </div>
  )
}