export interface ComplaintInput {
  text?: string
  voiceBlob?: Blob
  images?: File[]
  location?: {
    lat: number
    lng: number
  }
  manualLocation?: string
  ward?: string
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
  manualLocation?: string
  ward?: string
}
