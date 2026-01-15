import { NextRequest, NextResponse } from 'next/server'
import { analyzeMultipleComplaintImages } from '@/lib/azure/vision-analysis'

/**
 * POST /api/analyze-complaint
 * Azure OpenAI Vision analysis endpoint
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { images } = body

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: 'Invalid images data' },
        { status: 400 }
      )
    }

    if (images.length > 5) {
      return NextResponse.json(
        { error: 'Maximum 5 images allowed' },
        { status: 400 }
      )
    }

    // Extract base64 data from data URLs
    const base64Images = images.map(img => 
      img.includes('base64,') ? img.split('base64,')[1] : img
    )

    // Analyze with Azure OpenAI Vision
    const analyses = await analyzeMultipleComplaintImages(base64Images)

    // Merge results if multiple images
    const mergedAnalysis = analyses.length === 1 
      ? analyses[0] 
      : mergeAnalyses(analyses)

    return NextResponse.json({
      success: true,
      analysis: mergedAnalysis,
      individualAnalyses: analyses,
      imageCount: images.length,
    })
  } catch (error) {
    console.error('Complaint analysis error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to analyze complaint',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * Merge multiple analysis results into one comprehensive result
 */
function mergeAnalyses(analyses: any[]) {
  if (analyses.length === 0) return null
  if (analyses.length === 1) return analyses[0]

  const severityOrder = { Low: 1, Medium: 2, High: 3, Critical: 4 }
  
  // Get highest severity
  const highestSeverity = analyses.reduce((max, analysis) => {
    const currentValue = severityOrder[analysis.severity as keyof typeof severityOrder] || 0
    const maxValue = severityOrder[max.severity as keyof typeof severityOrder] || 0
    return currentValue > maxValue ? analysis : max
  }, analyses[0])

  return {
    type_of_complaint: analyses[0].type_of_complaint,
    brief_description: analyses.map(a => a.brief_description).join(' | '),
    govt_dept_of_concern: analyses[0].govt_dept_of_concern,
    severity: highestSeverity.severity,
    confidence_score: Math.max(...analyses.map(a => a.confidence_score)),
    suggested_priority: analyses[0].suggested_priority,
    estimated_resolution_time: analyses[0].estimated_resolution_time,
    keywords: [...new Set(analyses.flatMap(a => a.keywords))],
    detected_objects: [...new Set(analyses.flatMap(a => a.detected_objects))],
  }
}

// Set runtime to edge for faster cold starts
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
