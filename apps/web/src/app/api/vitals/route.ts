import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const createVitalSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  bloodPressure: z.string().nullable().optional(),
  weight: z.number().nullable().optional(),
  temperature: z.number().nullable().optional(),
  spO2: z.number().min(0).max(100).nullable().optional(),
  heartRate: z.number().min(30).max(200).nullable().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createVitalSchema.parse(body)

    // Verify patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: validatedData.patientId },
    })

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      )
    }

    const vital = await prisma.vital.create({
      data: {
        patientId: validatedData.patientId,
        bloodPressure: validatedData.bloodPressure,
        weight: validatedData.weight,
        temperature: validatedData.temperature,
        spO2: validatedData.spO2,
        heartRate: validatedData.heartRate,
      },
    })

    return NextResponse.json(vital, { status: 201 })
  } catch (error) {
    console.error('Error creating vital:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create vital signs' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')

    if (patientId) {
      const vitals = await prisma.vital.findMany({
        where: { patientId },
        orderBy: { createdAt: 'desc' },
        include: {
          patient: {
            select: { id: true, name: true, age: true, gender: true },
          },
        },
      })
      return NextResponse.json(vitals)
    }

    const vitals = await prisma.vital.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        patient: {
          select: { id: true, name: true, age: true, gender: true },
        },
      },
    })

    return NextResponse.json(vitals)
  } catch (error) {
    console.error('Error fetching vitals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vital signs' },
      { status: 500 }
    )
  }
}