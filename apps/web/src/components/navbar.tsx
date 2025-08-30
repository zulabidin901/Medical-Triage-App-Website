'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@medical/ui'
import { Stethoscope, User, Users } from 'lucide-react'

export function Navbar() {
  const [isDoctorView, setIsDoctorView] = useState(false)

  return (
    <nav className="border-b border-slate-200 bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <Stethoscope className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold text-slate-900">MedTriage</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-slate-600" />
              <span className="text-sm text-slate-600">
                {isDoctorView ? 'Doctor View' : 'Patient View'}
              </span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDoctorView(!isDoctorView)}
              className="flex items-center space-x-2"
            >
              {isDoctorView ? <User className="h-4 w-4" /> : <Users className="h-4 w-4" />}
              <span>Switch to {isDoctorView ? 'Patient' : 'Doctor'} View</span>
            </Button>
            
            {isDoctorView && (
              <Link href="/doctor">
                <Button variant="default" size="sm">
                  Doctor Dashboard
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}