import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '')
export const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

export const MOCK_AI_RESPONSE = {
  tests: [
    "Complete Blood Count (CBC)",
    "Basic Metabolic Panel (BMP)", 
    "Electrocardiogram (ECG)",
    "Chest X-ray"
  ],
  summary: "Based on the presented symptoms, the patient may have a cardiovascular or respiratory condition. Recommended tests will help rule out serious conditions and provide diagnostic clarity.",
  severity: "moderate",
  priority: "medium",
  recommendations: [
    "Monitor vital signs closely",
    "Ensure patient remains comfortable",
    "Follow up with primary care physician within 24-48 hours"
  ]
}