'use server'

/**
 * Complaint Submission Actions (New Workflow)
 * Dedicated server actions for the image upload workflow
 */

import { createClient } from '@/lib/supabase/server'
import { VisionAnalysisResult, ComplaintData, LocationData } from '@/types/complaint.types'
import { generateReferenceId } from '@/lib/utils/reference-id-generator'

/**
 * Normalize priority to match database constraint
 */
function normalizePriority(priority: string): 'high' | 'medium' | 'low' {
  const normalized = priority.toLowerCase().trim()
  
  // Map various priority strings to database values
  if (normalized === 'high' || normalized === 'critical' || normalized === 'immediate' || normalized === 'urgent') {
    return 'high'
  } else if (normalized === 'low') {
    return 'low'
  } else {
    // Default to medium for 'standard', 'medium', or any other value
    return 'medium'
  }
}

/**
 * Submit complaint from new workflow
 */
export async function submitComplaintFromWorkflow(data: {
  images: string[] // base64 images
  complaintData: ComplaintData
  location: LocationData | null
  aiAnalysis: VisionAnalysisResult
  isAnonymous?: boolean
}) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Upload images to storage
    const imageUrls: string[] = []
    
    for (let i = 0; i < data.images.length; i++) {
      const base64Image = data.images[i]
      
      // Convert base64 to Buffer
      const base64Data = base64Image.split(',')[1]
      const buffer = Buffer.from(base64Data, 'base64')
      
      // Upload to Supabase storage
      const fileName = `${Date.now()}_${i}.jpg`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('image-complaints')
        .upload(fileName, buffer, {
          contentType: 'image/jpeg',
        })

      if (uploadError) {
        console.error('Image upload error:', uploadError)
        continue
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('image-complaints')
        .getPublicUrl(uploadData.path)
      
      imageUrls.push(urlData.publicUrl)
    }

    // Generate reference ID
    const referenceId = generateReferenceId(data.complaintData.department)

    // Prepare complaint data for database
    // Only using fields that exist in the actual schema
    const complaintRecord = {
      reference_id: referenceId, // Save the generated reference ID
      citizen_text: data.complaintData.description,
      citizen_image_urls: imageUrls,
      location_lat: data.location?.latitude || null,
      location_lng: data.location?.longitude || null,
      location_address: data.location?.address || null,
      ai_summary: data.complaintData.description,
      ai_department: data.complaintData.department,
      ai_issue_type: data.complaintData.type,
      ai_priority: normalizePriority(data.complaintData.priority),
      ai_priority_explanation: `Priority set to ${data.complaintData.priority} based on AI analysis of the complaint severity and urgency.`,
      // Note: ai_severity not in schema
      ai_confidence: data.aiAnalysis.confidence_score,
      // Note: ai_keywords not in schema
      // Note: estimated_resolution_time not in schema
      status: 'pending',
      is_valid: true,
      user_id: user?.id || null,
      is_anonymous: data.isAnonymous !== false,
    }

    // Insert into database
    const { data: insertedData, error: insertError } = await supabase
      .from('complaints')
      .insert([complaintRecord] as any)
      .select()
      .single()

    if (insertError) {
      console.error('Database insert error:', insertError)
      throw new Error(`Failed to save complaint: ${insertError.message}`)
    }

    return {
      success: true,
      complaintId: (insertedData as any).id,
      referenceId: referenceId, // Using generated ID
      department: data.complaintData.department,
      priority: data.complaintData.priority,
      severity: data.complaintData.severity || 'Medium', // Fallback
      summary: data.complaintData.description,
      estimatedResolution: data.aiAnalysis.estimated_resolution_time || '5-7 days', // Fallback
    }
  } catch (error) {
    console.error('Submit complaint error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to submit complaint',
    }
  }
}

/**
 * Get complaint by reference ID
 */
export async function getComplaintByReferenceId(referenceId: string) {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('reference_id', referenceId)
      .single()

    if (error) {
      throw new Error(`Complaint not found: ${error.message}`)
    }

    return {
      success: true,
      complaint: data,
    }
  } catch (error) {
    console.error('Get complaint error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch complaint',
    }
  }
}

/**
 * Track complaint status
 */
export async function trackComplaintStatus(referenceId: string) {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('complaints')
      .select('id, reference_id, status, ai_department, ai_priority, created_at, updated_at')
      .eq('reference_id', referenceId)
      .single()

    if (error) {
      throw new Error(`Complaint not found: ${error.message}`)
    }

    return {
      success: true,
      status: (data as any).status,
      department: (data as any).ai_department,
      priority: (data as any).ai_priority,
      createdAt: (data as any).created_at,
      updatedAt: (data as any).updated_at,
    }
  } catch (error) {
    console.error('Track status error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to track complaint',
    }
  }
}
