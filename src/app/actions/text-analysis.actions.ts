'use server'

/**
 * Text Analysis Actions
 * Server-side actions for analyzing text-based or transcribed complaints
 */

import { generateStructuredCompletion } from '@/lib/azure/openai'
import { VisionAnalysisResult } from '@/types/complaint.types'

/**
 * Analyze text complaint to extract structured details
 * Reuses the same structure as vision analysis for workflow compatibility
 */
export async function analyzeTextComplaint(text: string): Promise<{ success: boolean; analysis?: VisionAnalysisResult; message?: string }> {
  if (!text || text.trim().length < 10) {
    return {
      success: false,
      message: 'Description is too short for meaningful analysis. Please provide more details.',
    }
  }

  const systemPrompt = `You are an expert civic grievance analyst. 
Analyze the provided text complaint about a civic issue and extract structured information.`

  const userPrompt = `Analyze this complaint text: "${text}"`

  const schema = `{
  "type_of_complaint": "Road Damage|Water Issue|Garbage|Electricity|Other",
  "brief_description": "A concise summary of the issue based on the text",
  "govt_dept_of_concern": "Municipal Corporation|Public Works Department|Water Resources|Electricity Department|Police Department|Health Department|Transport Department|Urban Development|Forest Department|District Administration",
  "severity": "Low|Medium|High|Critical",
  "confidence_score": 0-1,
  "suggested_priority": "Immediate|Urgent|Standard|Low",
  "estimated_resolution_time": "1-2 days|3-5 days|1-2 weeks|2-4 weeks",
  "keywords": ["key1", "key2", "key3"],
  "detected_objects": ["items mentioned in text"]
}`

  try {
    const analysis = await generateStructuredCompletion<VisionAnalysisResult>(
      systemPrompt,
      userPrompt,
      schema
    )

    return {
      success: true,
      analysis,
    }
  } catch (error) {
    console.error('Text analysis error:', error)
    return {
      success: false,
      message: 'Failed to analyze text complaint automatically.',
    }
  }
}
