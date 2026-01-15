import { generateStructuredCompletion } from '@/lib/azure/openai'
import { AIClassificationResult, NormalizedInput } from '@/types/complaint.types'

const CLASSIFICATION_SYSTEM_PROMPT = `You are an AI classifier for civic issues in Manipur, India.
Map complaints to the appropriate department and issue type.

Departments in Manipur:
- Municipal Corporation (cleanliness, garbage, streetlights, parks)
- Public Works Department (roads, bridges, infrastructure)
- Water Resources (water supply, drainage, sewerage)
- Electricity Department (power supply, outages, meters)
- Police Department (law & order, traffic, safety)
- Health Department (sanitation, hospitals, epidemics)
- Transport Department (public transport, vehicle issues)
- Urban Development (illegal construction, land issues)
- Forest Department (trees, wildlife, environmental issues)
- District Administration (general grievances)

Be specific and accurate. Confidence should be 0-1.`

export async function classifyComplaint(
  input: NormalizedInput,
  extractedIssue: string
): Promise<AIClassificationResult> {
  const context = `
Extracted Issue: ${extractedIssue}
Text: ${input.textContent || 'None'}
Image Descriptions: ${input.imageDescriptions.join(', ') || 'None'}
Location: ${input.manualLocation || 'GPS coordinates'}
`.trim()

  const schema = `{
  "department": string,
  "issueType": string,
  "subCategory": string | undefined,
  "confidence": number
}`

  const result = await generateStructuredCompletion<AIClassificationResult>(
    CLASSIFICATION_SYSTEM_PROMPT,
    `Classify this complaint to the correct department:\n\n${context}\n\nProvide department, issue type, optional sub-category, and confidence (0-1).`,
    schema
  )

  return result
}
