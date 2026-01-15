'use client'

/**
 * Analysis Loader Component
 * Step 3: Azure OpenAI analysis progress indicator
 */

import { motion } from 'framer-motion'
import { Loader2, Sparkles } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface AnalysisLoaderProps {
  imageCount: number
  currentImage?: number
  estimatedTimeSeconds?: number
}

export default function AnalysisLoader({
  imageCount,
  currentImage = 1,
  estimatedTimeSeconds = 10,
}: AnalysisLoaderProps) {
  const isTextAnalysis = imageCount === 0
  const progress = isTextAnalysis ? 50 : (currentImage / imageCount) * 100
  const remainingTime = isTextAnalysis 
    ? estimatedTimeSeconds / 2 
    : Math.max(
        0,
        estimatedTimeSeconds - (currentImage - 1) * (estimatedTimeSeconds / imageCount)
      )

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 space-y-6">
      {/* Animated AI Icon */}
      <motion.div
        className="relative"
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 bg-blue-400 rounded-full blur-2xl"
          animate={{
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* AI Icon */}
        <div className="relative bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full p-6">
          <Sparkles className="h-16 w-16 text-[#0F4C81]" />
        </div>

        {/* Rotating loader */}
        <motion.div
          className="absolute -bottom-2 -right-2"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <Loader2 className="h-8 w-8 text-[#0F4C81]" />
        </motion.div>
      </motion.div>

      {/* Status Text */}
      <motion.div
        className="text-center space-y-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-2xl font-bold text-gray-900">
          Analyzing Your Complaint
        </h3>
        <motion.p
          className="text-gray-600"
          animate={{
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {isTextAnalysis 
            ? 'Our AI is understanding your description...' 
            : `Our AI is examining the image${imageCount > 1 ? 's' : ''}...`}
        </motion.p>
      </motion.div>

      {/* Progress Bar */}
      <div className="w-full max-w-md space-y-3">
        <Progress value={progress} className="h-2" />
        
        <div className="flex justify-between text-sm text-gray-500">
          <span>
            {isTextAnalysis ? 'Analyzing Text' : `Image ${currentImage} of ${imageCount}`}
          </span>
          <span>
            ~{Math.ceil(remainingTime)}s remaining
          </span>
        </div>
      </div>

      {/* Processing Steps */}
      <motion.div
        className="bg-blue-50 rounded-lg p-4 max-w-md w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="space-y-2 text-sm">
          <ProcessingStep
            label="Detecting civic issue type"
            isActive={currentImage >= 1}
          />
          <ProcessingStep
            label="Analyzing severity"
            isActive={currentImage >= 1}
          />
          <ProcessingStep
            label="Identifying department"
            isActive={currentImage >= 1}
          />
          <ProcessingStep
            label="Generating description"
            isActive={currentImage >= 1}
          />
        </div>
      </motion.div>

      {/* Pulse effect on background */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-100 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>
    </div>
  )
}

function ProcessingStep({
  label,
  isActive,
}: {
  label: string
  isActive: boolean
}) {
  return (
    <motion.div
      className="flex items-center gap-2"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: isActive ? 1 : 0.5, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className={`w-2 h-2 rounded-full ${
          isActive ? 'bg-[#0F4C81]' : 'bg-gray-300'
        }`}
        animate={
          isActive
            ? {
                scale: [1, 1.5, 1],
                opacity: [1, 0.5, 1],
              }
            : {}
        }
        transition={{
          duration: 1,
          repeat: isActive ? Infinity : 0,
          ease: 'easeInOut',
        }}
      />
      <span className={isActive ? 'text-gray-900' : 'text-gray-500'}>
        {label}
      </span>
    </motion.div>
  )
}
