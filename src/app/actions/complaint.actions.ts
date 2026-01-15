'use server'

import { createClient } from '@/lib/supabase/server'
import { requireOfficer } from '@/lib/supabase/auth-helpers'
import { analyzeImage } from '@/lib/azure/openai'
import { transcribeAudio } from '@/lib/azure/speech'
import { processComplaint } from '@/lib/ai/orchestrator'
import { NormalizedInput } from '@/types/complaint.types'

/**
 * Upload media files to Supabase storage
 */
async function uploadMedia(file: Buffer, fileName: string, bucket: string): Promise<string> {
  const supabase = await createClient()

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(`${Date.now()}_${fileName}`, file, {
      contentType: 'auto',
    })

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`)
  }

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path)
  return urlData.publicUrl
}

/**
 * Normalize inputs - convert all inputs to text format for AI
 */
async function normalizeInputs(formData: FormData): Promise<NormalizedInput> {
  const text = formData.get('text') as string | null
  const voiceFile = formData.get('voice') as File | null
  
  // Robustly get image files - check both 'images' and 'image-i' keys
  let imageFiles = formData.getAll('images') as File[]
  
  // Also check for image-0, image-1, etc.
  for (let i = 0; i < 20; i++) {
    const file = formData.get(`image-${i}`) as File | null
    if (file && file.size > 0 && !imageFiles.includes(file)) {
      imageFiles.push(file)
    }
  }

  const locationLat = formData.get('locationLat') as string | null
  const locationLng = formData.get('locationLng') as string | null
  const address = formData.get('address') as string | null

  const normalized: NormalizedInput = {
    textContent: text || '',
    imageDescriptions: [],
    address: address || undefined,
  }

  // Add location if provided
  if (locationLat && locationLng) {
    normalized.location = {
      lat: parseFloat(locationLat),
      lng: parseFloat(locationLng),
    }
  }

  // Process voice to text
  if (voiceFile && voiceFile.size > 0) {
    try {
      const audioBuffer = Buffer.from(await voiceFile.arrayBuffer())
      const transcript = await transcribeAudio(audioBuffer)
      normalized.voiceTranscript = transcript
      normalized.textContent += (normalized.textContent ? ' ' : '') + transcript
    } catch (error) {
      console.error('Voice transcription error:', error)
    }
  }

  // Process images to descriptions
  const existingDescriptions = formData.getAll('imageDescriptions') as string[]
  if (existingDescriptions.length > 0) {
    normalized.imageDescriptions = existingDescriptions
  } else if (imageFiles && imageFiles.length > 0) {
    for (const imageFile of imageFiles) {
      if (imageFile.size > 0) {
        try {
          const imageBuffer = Buffer.from(await imageFile.arrayBuffer())
          const base64Image = imageBuffer.toString('base64')
          const description = await analyzeImage(
            base64Image,
            'Describe this civic issue image in detail. Focus on what the problem is, its location if visible, and severity.'
          )
          normalized.imageDescriptions.push(description)
        } catch (error) {
          console.error('Image analysis error:', error)
        }
      }
    }
  }

  return normalized
}

/**
 * Main server action to submit a complaint
 */
export async function submitComplaint(formData: FormData) {
  try {
    // Step 1: Normalize all inputs
    const normalizedInput = await normalizeInputs(formData)

    // Step 2: Process through AI
    const aiResult = await processComplaint(normalizedInput)

    // Step 3: Check if valid
    if (!aiResult.validation.isValid) {
      return {
        success: false,
        message: aiResult.validation.validationMessage || 'Complaint validation failed',
        needsClarification: aiResult.validation.needsClarification,
        clarificationQuestions: aiResult.validation.clarificationQuestions,
      }
    }

    // Step 4: Upload media files if present
    const voiceFile = formData.get('voice') as File | null
    
    // Get image files - client sends them as image-0, image-1, etc.
    const imageFiles: File[] = []
    for (let i = 0; i < 20; i++) { // Allow up to 20 images
      const file = formData.get(`image-${i}`) as File | null
      if (file && file.size > 0) {
        imageFiles.push(file)
      }
    }

    let voiceUrl: string | null = null
    const imageUrls: string[] = []

    if (voiceFile && voiceFile.size > 0) {
      const voiceBuffer = Buffer.from(await voiceFile.arrayBuffer())
      voiceUrl = await uploadMedia(voiceBuffer, voiceFile.name, 'voice-complaints')
    }

    if (imageFiles.length > 0) {
      for (const imageFile of imageFiles) {
        const imageBuffer = Buffer.from(await imageFile.arrayBuffer())
        const url = await uploadMedia(imageBuffer, imageFile.name, 'image-complaints')
        imageUrls.push(url)
      }
    }

    // Step 5: Save to database
    // Use edited summary and department if provided, otherwise perform normal processing
    // NOTE: In the new flow, the client might send final data directly. 
    // But for security, we should re-validate or reuse the passed data carefully. 
    // To support the new "Preview" flow where AI ran *before* submit, we need to accept overrides.

    const editedSummary = formData.get('editedSummary') as string | null
    const editedDepartment = formData.get('editedDepartment') as string | null
    const locationJson = formData.get('location') as string | null
    const address = formData.get('address') as string | null

    const complainSummary = editedSummary || aiResult.summarization!.citizenSummary
    const complaintDepartment = editedDepartment || aiResult.classification!.department

    // Parse location from JSON
    let finalLocationLat: number | null = null
    let finalLocationLng: number | null = null

    if (locationJson) {
      try {
        const loc = JSON.parse(locationJson)
        finalLocationLat = loc.lat
        finalLocationLng = loc.lng
      } catch (e) { 
        console.error('Failed to parse location JSON:', e)
      }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const complaintData = {
      citizen_text: formData.get('text') as string | null,
      citizen_voice_url: voiceUrl,
      citizen_image_urls: imageUrls.length > 0 ? imageUrls : null,
      location_lat: finalLocationLat,
      location_lng: finalLocationLng,
      location_address: address || null,
      ai_summary: complainSummary,
      ai_department: complaintDepartment,
      ai_issue_type: aiResult.classification!.issueType,
      ai_priority: aiResult.scoring!.priority,
      ai_priority_explanation: aiResult.scoring!.explanation,
      ai_confidence: aiResult.classification!.confidence,
      status: 'pending',
      is_valid: true,
      user_id: user?.id || null,
      is_anonymous: !user || formData.get('isAnonymous') === 'true',
    }

    const { data, error } = await supabase
      .from('complaints')
      .insert([complaintData] as any)
      .select()
      .single()

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    return {
      success: true,
      complaintId: (data as any).id,
      summary: complainSummary,
      department: complaintDepartment,
      priority: aiResult.scoring!.priority,
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
 * Update AI summary (citizen can edit)
 */
export async function updateComplaintSummary(complaintId: string, newSummary: string) {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('complaints')
      .update({ ai_summary: newSummary } as any)
      .eq('id', complaintId)

    if (error) {
      throw new Error(`Failed to update summary: ${error.message}`)
    }

    return { success: true }
  } catch (error) {
    console.error('Update summary error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update summary',
    }
  }
}

/**
 * Get all complaints for dashboard
 */
export async function getComplaints(filters?: {
  status?: string
  department?: string
  priority?: string
}) {
  try {
    await requireOfficer()
    const supabase = await createClient()

    let query = supabase.from('complaints').select('*').order('created_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.department) {
      query = query.eq('ai_department', filters.department)
    }
    if (filters?.priority) {
      query = query.eq('ai_priority', filters.priority)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch complaints: ${error.message}`)
    }

    return { success: true, complaints: data }
  } catch (error) {
    console.error('Get complaints error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch complaints',
      complaints: [],
    }
  }
}


/**
 * Analyze complaint before submission (for preview)
 */
export async function analyzeComplaintPreSubmit(formData: FormData) {
  try {
    const normalizedInput = await normalizeInputs(formData);
    const aiResult = await processComplaint(normalizedInput);

    // If validation failed, return validation message and needsClarification
    if (!aiResult.validation.isValid) {
      return {
        success: false,
        message: aiResult.validation.validationMessage || 'Complaint validation failed',
        needsClarification: aiResult.validation.needsClarification,
        clarificationQuestions: aiResult.validation.clarificationQuestions,
      };
    }

    // Defensive: check all required AI outputs
    if (!aiResult.summarization || !aiResult.classification || !aiResult.scoring) {
      return {
        success: false,
        message: 'AI processing failed to generate required outputs.',
      };
    }

    return {
      success: true,
      analysis: {
        summary: aiResult.summarization.citizenSummary,
        department: aiResult.classification.department,
        issueType: aiResult.classification.issueType,
        priority: aiResult.scoring.priority,
        keywords: aiResult.summarization.keywords,
        imageDescriptions: normalizedInput.imageDescriptions,
      },
    };
  } catch (error) {
    console.error('Pre-submit analysis error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to analyze complaint',
    };
  }
}



/**
 * Update complaint status (for officers)
 */
export async function updateComplaintStatus(complaintId: string, newStatus: string) {
  try {
    await requireOfficer();
    const supabase = await createClient();
    const { error } = await supabase
      .from('complaints')
      .update({ status: newStatus } as any)
      .eq('id', complaintId);
    if (error) {
      throw new Error(`Failed to update status: ${error.message}`);
    }
    return { success: true };
  } catch (error) {
    console.error('Update status error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update status',
    };
  }
}
