import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const createPatientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  age: z.number().min(1).max(150),
  gender: z.string().min(1, 'Gender is required'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createPatientSchema.parse(body)

    const patient = await prisma.patient.create({
      data: {
        name: validatedData.name,
        age: validatedData.age,
        gender: validatedData.gender,
      },
    })

    return NextResponse.json(patient, { status: 201 })
  } catch (error) {
    console.error('Error creating patient:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create patient' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    const patients = await prisma.patient.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        vitals: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        visits: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    })

    return NextResponse.json(patients)
  } catch (error) {
    console.error('Error fetching patients:', error)
    return NextResponse.json(
      { error: 'Failed to fetch patients' },
      { status: 500 }
    )
  }
}