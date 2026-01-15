'use client'

/**
 * Report Workflow Component
 * Orchestrates Voice and Manual Text complaint submissions
 */

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, MessageSquare, PenTool } from 'lucide-react'
import { toast } from 'sonner'
import { useSearchParams } from 'next/navigation'

// Shared Components
import VoiceRecorder from './VoiceRecorder'
import AnalysisLoader from './AnalysisLoader'
import InteractiveMapWidget from './InteractiveMapWidget'
import EditableComplaintForm from './EditableComplaintForm'
import ComplaintPreviewNew from './ComplaintPreviewNew'
import CompletionScreen from './CompletionScreen'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

// Actions and Types
import { analyzeTextComplaint } from '@/app/actions/text-analysis.actions'
import { submitComplaintFromWorkflow } from '@/app/actions/complaint-submission.actions'
import {
  LocationData,
  ComplaintData,
  VisionAnalysisResult,
} from '@/types/complaint.types'

type WorkflowMode = 'voice' | 'manual'

export default function ReportWorkflow() {
  const searchParams = useSearchParams()
  const initialMode = (searchParams.get('mode') as WorkflowMode) || 'manual'

  const [step, setStep] = useState(1)
  const [mode, setMode] = useState<WorkflowMode>(initialMode)
  const [inputText, setInputText] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<VisionAnalysisResult | null>(null)
  const [location, setLocation] = useState<LocationData | null>(null)
  const [editedData, setEditedData] = useState<ComplaintData | null>(null)
  const [referenceId, setReferenceId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Step 1: Handle input completion
  const handleInputComplete = useCallback(async (text: string) => {
    if (!text || text.trim().length < 10) {
      toast.error('Please provide more details about the issue.')
      return
    }

    setInputText(text)
    setStep(2) // Move to analysis
    setIsAnalyzing(true)

    try {
      const result = await analyzeTextComplaint(text)
      if (result.success && result.analysis) {
        setAiAnalysis(result.analysis)
        setStep(3) // Move to location
      } else {
        toast.error(result.message || 'Analysis failed')
        setStep(1)
      }
    } catch (error) {
      toast.error('An error occurred during analysis')
      setStep(1)
    } finally {
      setIsAnalyzing(false)
    }
  }, [])

  // Step 3: Location selected
  const handleLocationSelected = useCallback((loc: LocationData) => {
    setLocation(loc)
  }, [])

  // Step 4: Review & Edit
  const handleDataChanged = useCallback((data: ComplaintData) => {
    setEditedData(data)
  }, [])

  // Step 5: Submission
  const handleSubmit = useCallback(async () => {
    if (!editedData || !aiAnalysis) return
    setIsLoading(true)

    try {
      const result = await submitComplaintFromWorkflow({
        images: [], // No images in this workflow for now
        complaintData: editedData,
        location: location,
        aiAnalysis: aiAnalysis,
        isAnonymous: true,
      })

      if (result.success && result.referenceId) {
        setReferenceId(result.referenceId)
        setStep(6)
        toast.success('Report submitted successfully!')
      } else {
        toast.error(result.message || 'Submission failed')
      }
    } catch (error) {
      toast.error('An error occurred during submission')
    } finally {
      setIsLoading(false)
    }
  }, [editedData, aiAnalysis, location])

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      {/* Progress Header */}
      {step < 6 && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#0B3C5D]">
              Step {step} of 5
            </h2>
            <span className="text-sm font-bold text-blue-500 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full">
              {step === 1 && (mode === 'voice' ? 'Voice Recording' : 'Manual Entry')}
              {step === 2 && 'AI Analysis'}
              {step === 3 && 'Location'}
              {step === 4 && 'Review Details'}
              {step === 5 && 'Final Preview'}
            </span>
          </div>
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-[#0B3C5D]"
              initial={{ width: 0 }}
              animate={{ width: `${(step / 5) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      {/* Workflow Steps */}
      <AnimatePresence mode="wait">
        {/* Step 1: Input */}
        {step === 1 && (
          <motion.div
            key="input-step"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-8"
          >
            {mode === 'voice' ? (
              <div className="space-y-6">
                <VoiceRecorder onTranscriptionComplete={handleInputComplete} />
                <Button 
                  variant="ghost" 
                  className="w-full text-blue-600 font-bold hover:bg-blue-50/50 rounded-xl"
                  onClick={() => setMode('manual')}
                >
                  Switch to Manual Text
                </Button>
              </div>
            ) : (
              <div className="space-y-6 p-5 md:p-8 bg-white/70 backdrop-blur-xl rounded-2xl md:rounded-[2.5rem] border border-white shadow-2xl">
                <div className="space-y-4">
                  <Textarea 
                    placeholder="Describe the issue, location details, and any severity markers..."
                    className="min-h-[180px] md:min-h-[200px] rounded-2xl md:rounded-3xl p-4 md:p-6 text-base md:text-lg border-gray-100 focus:ring-blue-500 shadow-sm"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      variant="outline" 
                      className="w-full sm:flex-1 rounded-xl md:rounded-2xl h-12 md:h-14 font-bold"
                      onClick={() => setMode('voice')}
                    >
                      <Mic className="w-5 h-5 mr-2" />
                      Switch to Voice
                    </Button>
                    <Button 
                      className="w-full sm:flex-[2] bg-[#0B3C5D] rounded-xl md:rounded-2xl h-12 md:h-14 font-bold text-base md:text-lg shadow-lg shadow-blue-900/10"
                      onClick={() => handleInputComplete(inputText)}
                    >
                      Continue to Analysis
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Step 2: Analysis */}
        {step === 2 && (
          <motion.div key="analysis-step">
            <AnalysisLoader 
              imageCount={0} 
              currentImage={0} 
              estimatedTimeSeconds={8} 
            />
          </motion.div>
        )}

        {/* Step 3: Location */}
        {step === 3 && (
          <motion.div key="location-step" className="space-y-8">
            <InteractiveMapWidget onLocationSelected={handleLocationSelected} />
            {location && (
              <Button 
                className="w-full bg-[#0B3C5D] py-6 md:py-8 text-lg md:text-xl font-bold rounded-2xl md:rounded-[2rem] shadow-xl shadow-blue-900/10"
                onClick={() => setStep(4)}
              >
                Confirm Location & Proceed
              </Button>
            )}
          </motion.div>
        )}

        {/* Step 4: Edit */}
        {step === 4 && aiAnalysis && (
          <motion.div key="edit-step">
            <EditableComplaintForm 
              aiAnalysis={aiAnalysis} 
              onDataChanged={handleDataChanged}
              onNext={() => setStep(5)}
            />
          </motion.div>
        )}

        {/* Step 5: Preview */}
        {step === 5 && editedData && (
          <motion.div key="preview-step">
            <ComplaintPreviewNew 
              images={[]} 
              complaintData={editedData}
              location={location}
              onBack={() => setStep(4)}
              onSubmit={handleSubmit}
              isSubmitting={isLoading}
            />
          </motion.div>
        )}

        {/* Step 6: Completion */}
        {step === 6 && referenceId && editedData && (
          <motion.div key="completion-step">
            <CompletionScreen 
              referenceId={referenceId}
              department={editedData.department}
              priority={editedData.priority}
              severity={editedData.severity}
              summary={editedData.description}
              estimatedResolution={aiAnalysis?.estimated_resolution_time}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Footer */}
      {step > 1 && step < 6 && (
        <Button
          variant="ghost"
          onClick={() => setStep(prev => prev - 1)}
          className="mt-8 text-gray-500 font-bold"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Step {step - 1}
        </Button>
      )}
    </div>
  )
}

// Simple Mic icon for the manual switch
function Mic(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  )
}
