import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const visitId = params.id

    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      include: {
        patient: {
          select: { id: true, name: true, age: true, gender: true },
        },
      },
    })

    if (!visit) {
      return NextResponse.json(
        { error: 'Visit not found' },
        { status: 404 }
      )
    }

    // Parse JSON strings for SQLite compatibility
    const visitWithParsedData = {
      ...visit,
      aiSuggestion: visit.aiSuggestion ? JSON.parse(visit.aiSuggestion) : null,
      doctorApproval: visit.doctorApproval ? JSON.parse(visit.doctorApproval) : null,
    }

    return NextResponse.json(visitWithParsedData)
  } catch (error) {
    console.error('Error fetching visit:', error)
    return NextResponse.json(
      { error: 'Failed to fetch visit' },
      { status: 500 }
    )
  }
}