import { generateCompletion } from '@/lib/azure/openai'
import { AISummarizationResult } from '@/types/complaint.types'

const SUMMARIZATION_SYSTEM_PROMPT = `You are an AI that creates citizen-friendly summaries for civic complaints in Manipur, India.

Rules:
- 2-3 sentences maximum
- Clear, simple language (avoid technical jargon)
- Include location if mentioned
- Be respectful and empathetic
- Extract key keywords for searchability`

export async function summarizeComplaint(
  extractedIssue: string,
  context: string,
  location?: string
): Promise<AISummarizationResult> {
  const fullContext = `
Issue: ${extractedIssue}
Context: ${context}
Location: ${location || 'Not specified'}
`.trim()

  const prompt = `Create a citizen-friendly summary (2-3 sentences) for this complaint:\n\n${fullContext}\n\nAlso provide 3-5 keywords for searchability.`

  const response = await generateCompletion(SUMMARIZATION_SYSTEM_PROMPT, prompt, 0.4)

  // Parse response (expected format: summary text, then "Keywords: word1, word2...")
  const parts = response.split('Keywords:')
  const summary = parts[0].trim()
  const keywordString = parts[1]?.trim() || ''
  const keywords = keywordString
    .split(',')
    .map((k) => k.trim())
    .filter((k) => k.length > 0)

  return {
    citizenSummary: summary,
    keywords,
  }
}
