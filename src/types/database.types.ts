export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      complaints: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          citizen_text: string | null
          citizen_voice_url: string | null
          citizen_image_urls: string[] | null
          location_lat: number | null
          location_lng: number | null
          location_address: string | null
          ai_summary: string
          ai_department: string
          ai_issue_type: string
          ai_priority: 'high' | 'medium' | 'low'
          ai_priority_explanation: string
          ai_confidence: number
          status: 'pending' | 'in_progress' | 'resolved' | 'rejected'
          rejection_reason: string | null
          is_valid: boolean
          validation_message: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          citizen_text?: string | null
          citizen_voice_url?: string | null
          citizen_image_urls?: string[] | null
          location_lat?: number | null
          location_lng?: number | null
          location_address?: string | null
          ai_summary: string
          ai_department: string
          ai_issue_type: string
          ai_priority: 'high' | 'medium' | 'low'
          ai_priority_explanation: string
          ai_confidence: number
          status?: 'pending' | 'in_progress' | 'resolved' | 'rejected'
          rejection_reason?: string | null
          is_valid?: boolean
          validation_message?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          citizen_text?: string | null
          citizen_voice_url?: string | null
          citizen_image_urls?: string[] | null
          location_lat?: number | null
          location_lng?: number | null
          location_address?: string | null
          ai_summary?: string
          ai_department?: string
          ai_issue_type?: string
          ai_priority?: 'high' | 'medium' | 'low'
          ai_priority_explanation?: string
          ai_confidence?: number
          status?: 'pending' | 'in_progress' | 'resolved' | 'rejected'
          rejection_reason?: string | null
          is_valid?: boolean
          validation_message?: string | null
        }
      }
    }
  }
}

export type Complaint = Database['public']['Tables']['complaints']['Row']
export type ComplaintInsert = Database['public']['Tables']['complaints']['Insert']
export type ComplaintUpdate = Database['public']['Tables']['complaints']['Update']
