'use server'

/**
 * Image Validation Actions
 * Server-side actions for validating and analyzing complaint images
 */

import { validateCivicIssueImage, analyzeComplaintImage, analyzeMultipleComplaintImages } from '@/lib/azure/vision-analysis'
import { VisionAnalysisResult } from '@/types/complaint.types'

/**
 * Validate if uploaded image is related to a civic issue
 * This is the edge validation step (Step 2)
 */
export async function validateImageForCivicIssue(base64Image: string) {
  try {
    // Extract base64 data (remove data URL prefix if present)
    const base64Data = base64Image.includes('base64,') 
      ? base64Image.split('base64,')[1] 
      : base64Image
    
    const result = await validateCivicIssueImage(base64Data)
    
    return {
      success: true,
      isValid: result.isValid,
      message: result.message,
    }
  } catch (error) {
    console.error('Image validation error:', error)
    return {
      success: false,
      isValid: false,
      message: 'Failed to validate image. Please try again.',
    }
  }
}

/**
 * Analyze images with AI to extract complaint details
 * This is the Azure OpenAI analysis step (Step 3)
 */
export async function analyzeImagesWithAI(base64Images: string[]) {
  try {
    if (base64Images.length === 0) {
      return {
        success: false,
        message: 'No images provided for analysis',
      }
    }

    // Extract base64 data (remove data URL prefix if present)
    const cleanedImages = base64Images.map(img => 
      img.includes('base64,') ? img.split('base64,')[1] : img
    )

    // Analyze all images
    const analyses = await analyzeMultipleComplaintImages(cleanedImages)
    
    // Merge results from multiple images (if multiple)
    const mergedAnalysis = mergeAnalysisResults(analyses)
    
    return {
      success: true,
      analysis: mergedAnalysis,
      individualAnalyses: analyses,
    }
  } catch (error) {
    console.error('AI analysis error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to analyze images',
    }
  }
}

/**
 * Merge multiple vision analysis results into a single comprehensive result
 */
function mergeAnalysisResults(analyses: VisionAnalysisResult[]): VisionAnalysisResult {
  if (analyses.length === 0) {
    throw new Error('No analyses to merge')
  }

  if (analyses.length === 1) {
    return analyses[0]
  }

  // Merge logic: combine insights from multiple images
  const merged: VisionAnalysisResult = {
    type_of_complaint: analyses[0].type_of_complaint,
    brief_description: analyses.map(a => a.brief_description).join(' | '),
    govt_dept_of_concern: analyses[0].govt_dept_of_concern,
    severity: getHighestSeverity(analyses.map(a => a.severity)),
    confidence_score: Math.max(...analyses.map(a => a.confidence_score)),
    suggested_priority: analyses[0].suggested_priority,
    estimated_resolution_time: analyses[0].estimated_resolution_time,
    keywords: [...new Set(analyses.flatMap(a => a.keywords))],
    detected_objects: [...new Set(analyses.flatMap(a => a.detected_objects))],
  }

  return merged
}

/**
 * Get the highest severity from a list of severities
 */
function getHighestSeverity(severities: string[]): "Low" | "Medium" | "High" | "Critical" {
  const severityOrder = { Low: 1, Medium: 2, High: 3, Critical: 4 }
  
  let highest: "Low" | "Medium" | "High" | "Critical" = "Low"
  let highestValue = 0

  for (const severity of severities) {
    const value = severityOrder[severity as keyof typeof severityOrder] || 0
    if (value > highestValue) {
      highestValue = value
      highest = severity as "Low" | "Medium" | "High" | "Critical"
    }
  }

  return highest
}
