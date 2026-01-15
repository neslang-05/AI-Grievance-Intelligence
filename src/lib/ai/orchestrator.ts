import { NormalizedInput, AIProcessingResult } from '@/types/complaint.types'
import { validateComplaint } from './validation'
import { understandComplaint } from './understanding'
import { classifyComplaint } from './classification'
import { scoreComplaint } from './scoring'
import { summarizeComplaint } from './summarization'

/**
 * Main AI orchestrator - processes complaint through all AI stages
 * This is the single entry point for AI processing
 */
export async function processComplaint(input: NormalizedInput): Promise<AIProcessingResult> {
  // Stage 1: Validation
  const validation = await validateComplaint(input)

  if (!validation.isValid) {
    return {
      validation,
    }
  }

  // Stage 2: Understanding
  const understanding = await understandComplaint(input)

  // Stage 3: Classification
  const classification = await classifyComplaint(input, understanding.extractedIssue)

  // Stage 4: Scoring
  const scoring = await scoreComplaint(
    understanding.extractedIssue,
    classification.issueType,
    classification.department
  )

  // Stage 5: Summarization
  const summarization = await summarizeComplaint(
    understanding.extractedIssue,
    understanding.context,
    input.manualLocation ||
      (input.location ? `${input.location.lat}, ${input.location.lng}` : undefined)
  )

  return {
    validation,
    understanding,
    classification,
    scoring,
    summarization,
  }
}
