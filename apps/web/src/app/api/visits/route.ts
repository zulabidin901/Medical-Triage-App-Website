import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const patientId = searchParams.get('patientId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const whereClause: any = {}
    
    if (status) {
      whereClause.status = status
    }
    
    if (patientId) {
      whereClause.patientId = patientId
    }

    const visits = await prisma.visit.findMany({
      where: whereClause,
      take: limit,
      skip: offset,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      include: {
        patient: {
          select: { id: true, name: true, age: true, gender: true },
        },
      },
    })

    // Parse JSON strings for SQLite compatibility
    const visitsWithParsedData = visits.map((visit: any) => ({
      ...visit,
      aiSuggestion: visit.aiSuggestion ? JSON.parse(visit.aiSuggestion) : null,
      doctorApproval: visit.doctorApproval ? JSON.parse(visit.doctorApproval) : null,
    }))

    return NextResponse.json(visitsWithParsedData)
  } catch (error) {
    console.error('Error fetching visits:', error)
    return NextResponse.json(
      { error: 'Failed to fetch visits' },
      { status: 500 }
    )
  }
}