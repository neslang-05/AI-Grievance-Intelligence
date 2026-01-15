import { NextRequest, NextResponse } from 'next/server'
import { validateCivicIssueImage } from '@/lib/azure/vision-analysis'

/**
 * POST /api/validate-image
 * Edge validation endpoint for checking if image is civic-related
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { image } = body

    if (!image || typeof image !== 'string') {
      return NextResponse.json(
        { error: 'Invalid image data' },
        { status: 400 }
      )
    }

    // Extract base64 data if it includes data URL prefix
    const base64Image = image.includes('base64,') 
      ? image.split('base64,')[1] 
      : image

    // Validate with AI
    const result = await validateCivicIssueImage(base64Image)

    return NextResponse.json({
      success: true,
      isValid: result.isValid,
      message: result.message,
    })
  } catch (error) {
    console.error('Image validation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to validate image',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Rate limiting helper (simple in-memory)
const requestCounts = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string, maxRequests = 10, windowMs = 60000): boolean {
  const now = Date.now()
  const record = requestCounts.get(ip)

  if (!record || now > record.resetAt) {
    requestCounts.set(ip, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (record.count >= maxRequests) {
    return false
  }

  record.count++
  return true
}

// Middleware to check rate limit
export async function middleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
             request.headers.get('x-real-ip') ||
             'unknown'
  
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { status: 429 }
    )
  }

  return NextResponse.next()
}
