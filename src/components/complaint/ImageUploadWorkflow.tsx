'use client'

/**
 * Image Upload Workflow Component
 * Main orchestrator for the 7-step complaint submission workflow
 */

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useSearchParams } from 'next/navigation'

// Step Components
import ImageUploadZone from './ImageUploadZone'
import EdgeValidation from './EdgeValidation'
import AnalysisLoader from './AnalysisLoader'
import InteractiveMapWidget from './InteractiveMapWidget'
import EditableComplaintForm from './EditableComplaintForm'
import ComplaintPreviewNew from './ComplaintPreviewNew'
import CompletionScreen from './CompletionScreen'

// Actions and Types
import { analyzeImagesWithAI } from '@/app/actions/image-validation.actions'
import { submitComplaintFromWorkflow } from '@/app/actions/complaint-submission.actions'
import {
  ComplaintWorkflowState,
  VisionAnalysisResult,
  LocationData,
  ComplaintData,
} from '@/types/complaint.types'
import { Button } from '@/components/ui/button'

export default function ImageUploadWorkflow() {
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode')

  const [state, setState] = useState<ComplaintWorkflowState>({
    step: 1,
    images: [],
    imageUrls: [],
    isValid: null,
    aiAnalysis: null,
    location: null,
    editedData: null,
    referenceId: null,
    isLoading: false,
    error: null,
  })


  const [currentAnalysisImage, setCurrentAnalysisImage] = useState(0)

  // Step 1: Images selected (DON'T auto-proceed, wait for Continue button)
  const handleImagesSelected = useCallback((images: File[], base64Images: string[]) => {
    setState((prev) => ({
      ...prev,
      images,
      imageUrls: base64Images,
      // Stay on step 1, user must click Continue
    }))
  }, [])

  // Step 1: User clicks Continue button
  const handleContinueFromUpload = useCallback(() => {
    if (state.imageUrls.length === 0) {
      toast.error('Please upload at least 1 image')
      return
    }
    setState((prev) => ({
      ...prev,
      step: 2, // Now move to validation
    }))
  }, [state.imageUrls])

  // Step 2: Validation complete
  const handleValidationComplete = useCallback(
    async (isValid: boolean, message: string) => {
      if (isValid) {
        // First, update state to move to step 3 and set loading
        setState((prev) => ({
          ...prev,
          isValid: true,
          validationMessage: message,
          step: 3, // Move to AI analysis
          isLoading: true,
        }))

        // THEN trigger analysis (outside of setState)
        try {
          // Get imageUrls from current state
          const imageUrlsToAnalyze = state.imageUrls
          
          const result = await analyzeImagesWithAI(imageUrlsToAnalyze)

          if (result.success && result.analysis) {
            setState((prev) => ({
              ...prev,
              aiAnalysis: result.analysis,
              isLoading: false,
              step: 4, // Move to location
            }))
          } else {
            // Analysis failed - clear and go back
            setState((prev) => ({
              ...prev,
              isLoading: false,
              error: result.message || 'Analysis failed',
              step: 1,
              images: [],
              imageUrls: [],
            }))
            toast.error((result.message || 'Analysis failed') + ' Please try again with a different image.')
          }
        } catch (error) {
          // Analysis error - clear and go back
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: 'Analysis error',
            step: 1,
            images: [],
            imageUrls: [],
          }))
          toast.error('An error occurred during analysis. Please try again.')
        }
      } else {
        // Validation failed - clear images and reset
        setState((prev) => ({
          ...prev,
          isValid: false,
          validationMessage: message,
          step: 1,
          images: [],
          imageUrls: [],
          error: message,
        }))
        toast.error(message + ' Please upload a different image.')
      }
    },
    [state.imageUrls]
  )

  // Step 4: Location selected
  const handleLocationSelected = useCallback((location: LocationData) => {
    setState((prev) => ({
      ...prev,
      location,
    }))
  }, [])

  // Continue to editing after location + analysis complete
  const handleContinueToEditing = useCallback(() => {
    if (!state.aiAnalysis) {
      toast.error('Please wait for AI analysis to complete')
      return
    }
    setState((prev) => ({ ...prev, step: 5 }))
  }, [state.aiAnalysis])

  // Step 5: Data changed in editing
  const handleDataChanged = useCallback((data: ComplaintData) => {
    setState((prev) => ({
      ...prev,
      editedData: data,
    }))
  }, [])

  // Step 5: Continue to preview
  const handleContinueToPreview = useCallback(() => {
    setState((prev) => ({ ...prev, step: 6 }))
  }, [])

  // Step 6: Go back to editing
  const handleBackToEditing = useCallback(() => {
    setState((prev) => ({ ...prev, step: 5 }))
  }, [])

  // Step 6: Submit complaint
  const handleSubmitComplaint = useCallback(async () => {
    if (!state.editedData || !state.aiAnalysis) return

    setState((prev) => ({ ...prev, isLoading: true }))

    try {
      // Submit using new workflow action
      const result = await submitComplaintFromWorkflow({
        images: state.imageUrls,
        complaintData: state.editedData,
        location: state.location,
        aiAnalysis: state.aiAnalysis,
        isAnonymous: true,
      })

      if (result.success && result.referenceId) {
        setState((prev) => ({
          ...prev,
          referenceId: result.referenceId,
          isLoading: false,
          step: 7, // Completion
        }))

        toast.success('Complaint submitted successfully!')
      } else {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: result.message || 'Submission failed',
        }))
        toast.error(result.message || 'Failed to submit complaint')
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Submission error',
      }))
      toast.error('An error occurred during submission')
    }
  }, [state.editedData, state.aiAnalysis, state.imageUrls, state.location])

  // Reset workflow
  const handleReset = useCallback(() => {
    setState({
      step: 1,
      images: [],
      imageUrls: [],
      isValid: null,
      aiAnalysis: null,
      location: null,
      editedData: null,
      referenceId: null,
      isLoading: false,
      error: null,
    })
  }, [])

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Progress Indicator */}
      {state.step < 7 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-700">
              Step {state.step} of 6
            </h2>
            <div className="text-sm text-gray-500">
              {state.step === 1 && 'Upload Images'}
              {state.step === 2 && 'Validating...'}
              {state.step === 3 && 'Analyzing...'}
              {state.step === 4 && 'Add Location'}
              {state.step === 5 && 'Review & Edit'}
              {state.step === 6 && 'Preview'}
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-[#0F4C81] h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(state.step / 6) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}

      {/* Back Button (except on first and last step) */}
      {state.step > 1 && state.step < 7 && state.step !== 2 && state.step !== 3 && (
        <Button
          variant="ghost"
          onClick={() =>
            setState((prev) => ({ ...prev, step: Math.max(1, prev.step - 1) as any }))
          }
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      )}

      {/* Workflow Steps */}
      <AnimatePresence mode="wait">
        {/* Step 1: Image Upload */}
        {state.step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <ImageUploadZone
              onImagesSelected={handleImagesSelected}
              onContinue={handleContinueFromUpload}
              maxImages={1}
              existingImages={state.images}
              autoStartCamera={mode === 'camera'}
            />
          </motion.div>
        )}

        {/* Step 2: Edge Validation */}
        {state.step === 2 && state.imageUrls.length > 0 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <EdgeValidation
              base64Image={state.imageUrls[0]}
              onValidationComplete={handleValidationComplete}
            />
          </motion.div>
        )}

        {/* Step 3: AI Analysis */}
        {state.step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <AnalysisLoader
              imageCount={state.images.length}
              currentImage={currentAnalysisImage}
              estimatedTimeSeconds={10}
            />
          </motion.div>
        )}

        {/* Step 4: Location Selection */}
        {state.step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <InteractiveMapWidget
              onLocationSelected={handleLocationSelected}
              initialLocation={state.location}
            />

            {state.aiAnalysis && (
              <Button
                onClick={handleContinueToEditing}
                className="w-full bg-[#0F4C81] hover:bg-[#0B3C5D] py-6 text-lg"
                size="lg"
              >
                Continue to Edit Details
              </Button>
            )}
          </motion.div>
        )}

        {/* Step 5: Edit AI Results */}
        {state.step === 5 && state.aiAnalysis && (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <EditableComplaintForm
              aiAnalysis={state.aiAnalysis}
              onDataChanged={handleDataChanged}
              onNext={handleContinueToPreview}
            />
          </motion.div>
        )}

        {/* Step 6: Preview */}
        {state.step === 6 && state.editedData && (
          <motion.div
            key="step6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <ComplaintPreviewNew
              images={state.imageUrls}
              complaintData={state.editedData}
              location={state.location}
              onBack={handleBackToEditing}
              onSubmit={handleSubmitComplaint}
              isSubmitting={state.isLoading}
            />
          </motion.div>
        )}

        {/* Step 7: Completion */}
        {state.step === 7 && state.referenceId && state.editedData && (
          <motion.div
            key="step7"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <CompletionScreen
              referenceId={state.referenceId}
              department={state.editedData.department}
              priority={state.editedData.priority}
              severity={state.editedData.severity}
              summary={state.editedData.description}
              estimatedResolution={state.aiAnalysis?.estimated_resolution_time}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
