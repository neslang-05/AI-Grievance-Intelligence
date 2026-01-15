import { generateStructuredCompletion } from '@/lib/azure/openai'
import { AIUnderstandingResult, NormalizedInput } from '@/types/complaint.types'

const UNDERSTANDING_SYSTEM_PROMPT = `You are an AI that understands citizen complaints in Manipur, India.
Extract the core issue, context, and intent from the citizen's input.
Handle mixed language (English/Hindi) and local references.
Be empathetic and extract meaning even from informal descriptions.`

export async function understandComplaint(input: NormalizedInput): Promise<AIUnderstandingResult> {
  const context = `
Text: ${input.textContent || 'None'}
Image Descriptions: ${input.imageDescriptions.join(', ') || 'None'}
Voice Transcript: ${input.voiceTranscript || 'None'}
Location: ${
    input.manualLocation || input.location
      ? `${input.location?.lat}, ${input.location?.lng}`
      : 'Not provided'
  }
Ward: ${input.ward || 'Not provided'}
`.trim()

  const schema = `{
  "extractedIssue": string,
  "context": string,
  "intent": string,
  "language": "english" | "hindi" | "mixed"
}`

  const result = await generateStructuredCompletion<AIUnderstandingResult>(
    UNDERSTANDING_SYSTEM_PROMPT,
    `Extract the issue from this complaint:\n\n${context}\n\nProvide a clear extracted issue, context, citizen's intent, and detected language.`,
    schema
  )

  return result
}
