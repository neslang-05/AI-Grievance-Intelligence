'use client'

/**
 * New Workflow Submit Page
 * Unified entry point for Image, Voice, and Manual reporting
 */

import ImageUploadWorkflow from '@/components/complaint/ImageUploadWorkflow'
import ReportWorkflow from '@/components/complaint/ReportWorkflow'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function SubmitContent() {
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode')

  // Use ReportWorkflow for voice and manual modes, ImageUploadWorkflow for camera and default
  const isTextBased = mode === 'voice' || mode === 'manual'

  return (
    <div className="py-8 md:py-12">
      <div className="container px-4 mx-auto">
        {/* Header */}
        <div className="text-center mb-6 md:mb-10">
          <h1 className="text-3xl md:text-5xl font-extrabold text-[#0B3C5D] mb-3 md:mb-4">
            {mode === 'voice' ? 'Voice Report' : mode === 'manual' ? 'Manual Report' : 'Submit a Civic Complaint'}
          </h1>
          <p className="text-gray-600 text-sm md:text-lg max-w-2xl mx-auto font-medium px-4">
            {isTextBased 
              ? 'Our AI will analyze your description to automatically categorize and route your complaint.' 
              : 'Our AI-powered system uses advanced image analysis to instantly identify and route civic issues.'}
          </p>
        </div>

        {/* Workflow Component */}
        {isTextBased ? <ReportWorkflow /> : <ImageUploadWorkflow />}
      </div>
    </div>
  )
}

export default function NewSubmitPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white">
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B3C5D]"></div>
        </div>
      }>
        <SubmitContent />
      </Suspense>
    </div>
  )
}
