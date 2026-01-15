/**
 * Azure Vision Analysis
 * Dedicated integration for image-based complaint analysis using Azure OpenAI Vision
 */

import { analyzeImage } from "./openai"
import { VisionAnalysisResult } from "@/types/complaint.types"

/**
 * Analyze complaint image using Azure OpenAI Vision API
 * Returns structured JSON with complaint details
 * OPTIMIZED for speed: concise prompt + low detail mode
 */
export async function analyzeComplaintImage(
  base64Image: string
): Promise<VisionAnalysisResult> {
  // OPTIMIZED: Shorter, more direct prompt = faster processing
  const analysisPrompt = `Analyze this civic issue image. Return ONLY valid JSON (no markdown):

{
  "type_of_complaint": "Road Damage|Water Issue|Garbage|Electricity|Other",
  "brief_description": "What you see and the problem",
  "govt_dept_of_concern": "Municipal Corporation|Public Works Department|Water Resources|Electricity Department|Police Department|Health Department|Transport Department|Urban Development|Forest Department|District Administration",
  "severity": "Low|Medium|High|Critical",
  "confidence_score": 0-1,
  "suggested_priority": "Immediate|Urgent|Standard|Low",
  "estimated_resolution_time": "1-2 days|3-5 days|1-2 weeks|2-4 weeks",
  "keywords": ["key1", "key2", "key3"],
  "detected_objects": ["obj1", "obj2"]
}`

  try {
    // Use low detail mode = 3-5x faster
    const rawResponse = await analyzeImage(base64Image, analysisPrompt, false)

    // Parse JSON from the response
    let jsonText = rawResponse.trim()

    // Remove markdown code blocks if present
    if (jsonText.startsWith("```")) {
      const lines = jsonText.split("\n")
      jsonText = lines.slice(1, -1).join("\n")
      if (jsonText.startsWith("json")) {
        jsonText = jsonText.slice(4)
      }
    }

    const analysis: VisionAnalysisResult = JSON.parse(jsonText)

    // Validate required fields
    if (
      !analysis.type_of_complaint ||
      !analysis.brief_description ||
      !analysis.govt_dept_of_concern
    ) {
      throw new Error("Invalid analysis response: missing required fields")
    }

    // Ensure severity is valid
    const validSeverities = ["Low", "Medium", "High", "Critical"]
    if (!validSeverities.includes(analysis.severity)) {
      analysis.severity = "Medium" // Default fallback
    }

    return analysis
  } catch (error) {
    console.error("Vision analysis error:", error)

    // Return fallback/minimal analysis
    return {
      type_of_complaint: "General Civic Issue",
      brief_description:
        "Unable to analyze image automatically. Please provide details manually.",
      govt_dept_of_concern: "Municipal Corporation",
      severity: "Medium",
      confidence_score: 0,
      suggested_priority: "Standard",
      estimated_resolution_time: "5-7 days",
      keywords: [],
      detected_objects: [],
    }
  }
}

/**
 * Batch analyze multiple complaint images
 */
export async function analyzeMultipleComplaintImages(
  base64Images: string[]
): Promise<VisionAnalysisResult[]> {
  const analysisPromises = base64Images.map((img) =>
    analyzeComplaintImage(img)
  )
  return Promise.all(analysisPromises)
}

/**
 * Validate if an image is likely a civic issue (edge validation)
 * OPTIMIZED: Simple fast check before full analysis
 */
export async function validateCivicIssueImage(
  base64Image: string
): Promise<{ isValid: boolean; message: string }> {
  // OPTIMIZED: Very short prompt = faster response
  const validationPrompt = `Is this a public civic issue (road damage, garbage, water leak, streetlight, etc.)? 
Respond ONLY with JSON (no markdown):
{"isValid": true/false, "message": "brief reason"}`

  try {
    // Use low detail mode for validation = much faster
    const rawResponse = await analyzeImage(base64Image, validationPrompt, false)

    // Extract JSON
    let jsonText = rawResponse.trim()
    if (jsonText.startsWith("```")) {
      const lines = jsonText.split("\n")
      jsonText = lines.slice(1, -1).join("\n")
      if (jsonText.startsWith("json")) {
        jsonText = jsonText.slice(4)
      }
    }

    const result = JSON.parse(jsonText)
    return {
      isValid: result.isValid !== false, // Default to true if unclear
      message: result.message || "Image validated",
    }
  } catch (error) {
    console.error("Validation error:", error)
    // Default to valid to be citizen-friendly
    return {
      isValid: true,
      message: "Unable to validate automatically. Proceeding with submission.",
    }
  }
}
