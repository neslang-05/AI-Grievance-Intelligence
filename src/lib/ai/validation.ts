import { generateStructuredCompletion } from '@/lib/azure/openai'
import { AIValidationResult, NormalizedInput } from '@/types/complaint.types'

const VALIDATION_SYSTEM_PROMPT = `You are an AI validator for a civic grievance platform in Manipur, India.
Your role is to determine if a citizen's complaint is:
1. A genuine government/municipal issue (not personal disputes)
2. Understandable with enough context
3. Not spam or abusive content
4. Whether it needs clarification

Be compassionate and citizen-friendly. Most genuine complaints should be validated even if imperfect.`

export async function validateComplaint(input: NormalizedInput): Promise<AIValidationResult> {
  const context = `
Text: ${input.textContent || 'None'}
Image Descriptions: ${input.imageDescriptions.join(', ') || 'None'}
Voice Transcript: ${input.voiceTranscript || 'None'}
Location: ${input.manualLocation || input.location
      ? `${input.location?.lat}, ${input.location?.lng}`
      : 'Not provided'
    }
Ward: ${input.ward || 'Not provided'}
`.trim()

  const schema = `{
  "isValid": boolean,
  "isGovernmentIssue": boolean,
  "isUnderstandable": boolean,
  "isSpam": boolean,
  "needsClarification": boolean,
  "clarificationQuestions": string[] | null,
  "validationMessage": string | null
}`

  try {
    const result = await generateStructuredCompletion<AIValidationResult>(
      VALIDATION_SYSTEM_PROMPT,
      `Validate this complaint:\n\n${context}\n\nConsider:\n- Is this a civic/government issue?\n- Is it understandable?\n- Is it spam/abusive?\n- Does it need clarification?`,
      schema
    )

    return result
  } catch (error) {
    console.error('Validation error:', error)
    // Default to valid if AI fails - citizen-friendly approach
    return {
      isValid: true,
      isGovernmentIssue: true,
      isUnderstandable: true,
      isSpam: false,
      needsClarification: false,
      validationMessage: 'Auto-validated (AI service unavailable)',
    }
  }
}
