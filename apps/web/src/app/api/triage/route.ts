import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { model, MOCK_AI_RESPONSE } from '@/lib/ai'
import { z } from 'zod'

const triageRequestSchema = z.object({
  symptoms: z.string().min(3, 'Please provide symptoms'),
  patientId: z.string().min(1, 'Patient ID is required'),
})

const SYSTEM_PROMPT = `You are a medical AI triage assistant. Your role is to analyze patient symptoms and suggest appropriate diagnostic tests and immediate care recommendations.

IMPORTANT SAFETY GUIDELINES:
- Never provide diagnoses or definitive medical conclusions
- Only suggest diagnostic tests and general care recommendations
- Always recommend consulting with healthcare professionals
- If symptoms suggest emergency conditions, clearly indicate high priority
- Be thorough but conservative in recommendations

Response format should be a JSON object with:
- tests: Array of specific diagnostic tests to recommend
- summary: Brief summary of the assessment (2-3 sentences)
- severity: "low", "moderate", "high", or "emergency" 
- priority: "low", "medium", "high", or "emergency"
- recommendations: Array of immediate care recommendations

Focus on:
1. Diagnostic tests that would help identify the underlying condition
2. Immediate care measures for patient comfort and safety
3. Appropriate priority level based on symptom severity
4. Clear, professional medical language`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = triageRequestSchema.parse(body)

    // Verify patient exists and get their information
    const patient = await prisma.patient.findUnique({
      where: { id: validatedData.patientId },
      include: {
        vitals: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      )
    }

    let aiSuggestion
    
    try {
      // Try to use Google AI (Gemini) if API key is available
      if (process.env.GOOGLE_AI_API_KEY && process.env.GOOGLE_AI_API_KEY.trim() !== '') {
        const patientContext = `
Patient Information:
- Age: ${patient.age}
- Gender: ${patient.gender}
${patient.vitals.length > 0 ? `
Recent Vitals:
- Blood Pressure: ${patient.vitals[0].bloodPressure || 'Not recorded'}
- Temperature: ${patient.vitals[0].temperature ? `${patient.vitals[0].temperature}°C` : 'Not recorded'}
- Heart Rate: ${patient.vitals[0].heartRate ? `${patient.vitals[0].heartRate} bpm` : 'Not recorded'}
- Oxygen Saturation: ${patient.vitals[0].spO2 ? `${patient.vitals[0].spO2}%` : 'Not recorded'}
- Weight: ${patient.vitals[0].weight ? `${patient.vitals[0].weight} kg` : 'Not recorded'}
` : '- No recent vitals recorded'}

Reported Symptoms:
${validatedData.symptoms}

${SYSTEM_PROMPT}

Please provide your triage assessment as a JSON object.`

        const result = await model.generateContent(patientContext)
        const response = await result.response
        const aiResponse = response.text()
        
        console.log('Google AI Response:', aiResponse) // Debug log
        
        if (aiResponse) {
          try {
            // Try to find and parse JSON from the response
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
              aiSuggestion = JSON.parse(jsonMatch[0])
            } else {
              // If no JSON found, create structured response from text
              aiSuggestion = {
                tests: ["Complete Blood Count (CBC)", "Basic Metabolic Panel (BMP)", "Vital signs monitoring"],
                summary: aiResponse.substring(0, 200) + "...",
                severity: "moderate",
                priority: "medium",
                recommendations: ["Consult with healthcare provider", "Monitor symptoms closely"]
              }
            }
          } catch (parseError) {
            console.warn('JSON parsing error:', parseError)
            // Fallback to mock response
            aiSuggestion = MOCK_AI_RESPONSE
          }
        } else {
          throw new Error('No response from AI')
        }
      } else {
        // Use mock response if no API key
        aiSuggestion = MOCK_AI_RESPONSE
      }
    } catch (aiError) {
      console.warn('AI API error, using mock response:', aiError)
      // Fallback to mock response
      aiSuggestion = MOCK_AI_RESPONSE
    }

    // Ensure the AI response has all required fields
    const processedSuggestion = {
      tests: aiSuggestion.tests || [],
      summary: aiSuggestion.summary || 'Unable to generate assessment summary',
      severity: aiSuggestion.severity || 'moderate',
      priority: aiSuggestion.priority || 'medium',
      recommendations: aiSuggestion.recommendations || ['Consult with healthcare provider'],
    }

    // Create visit record with AI suggestion
    const visit = await prisma.visit.create({
      data: {
        patientId: validatedData.patientId,
        symptoms: validatedData.symptoms,
        aiSuggestion: JSON.stringify(processedSuggestion), // Store as JSON string
        priority: processedSuggestion.priority,
        status: 'pending',
      },
      include: {
        patient: {
          select: { id: true, name: true, age: true, gender: true },
        },
      },
    })

    return NextResponse.json({
      visitId: visit.id,
      aiSuggestion: processedSuggestion,
      patient: visit.patient,
    }, { status: 201 })

  } catch (error) {
    console.error('Error processing triage:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to process triage request' },
      { status: 500 }
    )
  }
}