export interface ComplaintInput {
  text?: string
  voiceBlob?: Blob
  images?: File[]
  location?: {
    lat: number
    lng: number
  }
  address?: string
}

export interface AIValidationResult {
  isValid: boolean
  isGovernmentIssue: boolean
  isUnderstandable: boolean
  isSpam: boolean
  needsClarification: boolean
  clarificationQuestions?: string[]
  validationMessage?: string
}

export interface AIUnderstandingResult {
  extractedIssue: string
  context: string
  intent: string
  language: 'english' | 'hindi' | 'mixed'
}

export interface AIClassificationResult {
  department: string
  issueType: string
  subCategory?: string
  confidence: number
}

export interface AIScoringResult {
  priority: 'high' | 'medium' | 'low'
  severity: number
  urgency: number
  explanation: string
}

export interface AISummarizationResult {
  citizenSummary: string
  internalNotes?: string
  keywords: string[]
}

export interface AIProcessingResult {
  validation: AIValidationResult
  understanding?: AIUnderstandingResult
  classification?: AIClassificationResult
  scoring?: AIScoringResult
  summarization?: AISummarizationResult
}

export interface NormalizedInput {
  textContent: string
  imageDescriptions: string[]
  voiceTranscript?: string
  location?: {
    lat: number
    lng: number
  }
  address?: string
}

// ===== New Workflow Types =====

export interface VisionAnalysisResult {
  type_of_complaint: string
  brief_description: string
  govt_dept_of_concern: string
  severity: "Low" | "Medium" | "High" | "Critical"
  confidence_score: number
  suggested_priority: string
  estimated_resolution_time: string
  keywords: string[]
  detected_objects: string[]
}

export interface LocationData {
  latitude: number
  longitude: number
  address: string
  landmark?: string
  pinned_manually: boolean
}

export interface ComplaintData {
  type: string
  description: string
  department: string
  severity: "Low" | "Medium" | "High" | "Critical"
  priority: "High" | "Medium" | "Low" | "Critical" | "high" | "medium" | "low" | string
  additionalNotes?: string
}

export interface ComplaintWorkflowState {
  step: 1 | 2 | 3 | 4 | 5 | 6 | 7
  images: File[]
  imageUrls: string[]
  isValid: boolean | null
  aiAnalysis: VisionAnalysisResult | null
  location: LocationData | null
  editedData: ComplaintData | null
  referenceId: string | null
  isLoading: boolean
  error: string | null
  validationMessage?: string
}
