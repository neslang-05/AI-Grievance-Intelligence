import { generateStructuredCompletion } from '@/lib/azure/openai'
import { AIScoringResult } from '@/types/complaint.types'

const SCORING_SYSTEM_PROMPT = `You are an AI that scores civic complaint urgency for Manipur, India.

Priority Levels:
🚨 HIGH: Safety hazards, water/electricity outages, road collapses, health emergencies
⚠️ MEDIUM: Cleanliness issues, minor repairs, streetlight problems, delays
📝 LOW: Suggestions, feedback, minor inconveniences

Severity (1-10): Impact on citizens
Urgency (1-10): Time sensitivity
Provide clear explanation for citizens.`

export async function scoreComplaint(
  extractedIssue: string,
  issueType: string,
  department: string
): Promise<AIScoringResult> {
  const context = `
Issue: ${extractedIssue}
Type: ${issueType}
Department: ${department}
`.trim()

  const schema = `{
  "priority": "high" | "medium" | "low",
  "severity": number,
  "urgency": number,
  "explanation": string
}`

  const result = await generateStructuredCompletion<AIScoringResult>(
    SCORING_SYSTEM_PROMPT,
    `Score the priority of this complaint:\n\n${context}\n\nProvide priority, severity (1-10), urgency (1-10), and citizen-friendly explanation.`,
    schema
  )

  return result
}
