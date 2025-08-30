import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const approveVisitSchema = z.object({
  visitId: z.string().min(1, 'Visit ID is required'),
  approved: z.boolean(),
  approvedTests: z.array(z.string()).optional(),
  doctorNotes: z.string().optional(),
  doctorApproval: z.object({
    approved: z.boolean(),
    approvedTests: z.array(z.string()).optional(),
    notes: z.string().optional(),
    approvedBy: z.string(),
    approvedAt: z.string(),
  }),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = approveVisitSchema.parse(body)

    // Verify visit exists
    const existingVisit = await prisma.visit.findUnique({
      where: { id: validatedData.visitId },
      include: {
        patient: {
          select: { id: true, name: true, age: true, gender: true },
        },
      },
    })

    if (!existingVisit) {
      return NextResponse.json(
        { error: 'Visit not found' },
        { status: 404 }
      )
    }

    // Update visit with doctor approval
    const updatedVisit = await prisma.visit.update({
      where: { id: validatedData.visitId },
      data: {
        status: validatedData.approved ? 'approved' : 'rejected',
        doctorApproval: JSON.stringify(validatedData.doctorApproval), // Store as JSON string
      },
      include: {
        patient: {
          select: { id: true, name: true, age: true, gender: true },
        },
      },
    })

    // Parse JSON strings for response
    const visitWithParsedData = {
      ...updatedVisit,
      aiSuggestion: updatedVisit.aiSuggestion ? JSON.parse(updatedVisit.aiSuggestion) : null,
      doctorApproval: updatedVisit.doctorApproval ? JSON.parse(updatedVisit.doctorApproval) : null,
    }

    return NextResponse.json(visitWithParsedData)
  } catch (error) {
    console.error('Error approving visit:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to approve visit' },
      { status: 500 }
    )
  }
}