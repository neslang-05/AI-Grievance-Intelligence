'use client'

/**
 * Edge Validation Component
 * Step 2: Client-side AI validation animation
 */

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { validateImageForCivicIssue } from '@/app/actions/image-validation.actions'

interface EdgeValidationProps {
  base64Image: string
  onValidationComplete: (isValid: boolean, message: string) => void
}

export default function EdgeValidation({
  base64Image,
  onValidationComplete,
}: EdgeValidationProps) {
  const [status, setStatus] = useState<'validating' | 'valid' | 'invalid'>('validating')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const validate = async () => {
      setStatus('validating')
      
      try {
        const result = await validateImageForCivicIssue(base64Image)
        
        if (result.success && result.isValid) {
          setStatus('valid')
          setMessage(result.message || 'Valid civic complaint image detected')
          
          // Auto-proceed after 1.5 seconds
          setTimeout(() => {
            onValidationComplete(true, result.message)
          }, 1500)
        } else {
          setStatus('invalid')
          setMessage(
            result.message ||
              'This image does not appear to be related to a civic issue. Please try another image.'
          )
          onValidationComplete(false, result.message)
        }
      } catch (error) {
        setStatus('invalid')
        const errorMsg = 'Validation failed. Please try again.'
        setMessage(errorMsg)
        onValidationComplete(false, errorMsg)
      }
    }

    validate()
  }, [base64Image, onValidationComplete])

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-8">
      <AnimatePresence mode="wait">
        {status === 'validating' && (
          <motion.div
            key="validating"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              <Loader2 className="h-16 w-16 text-[#0F4C81]" />
            </motion.div>
            <motion.p
              className="text-lg font-medium text-gray-700"
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              Validating image...
            </motion.p>
            <p className="text-sm text-gray-500">
              Checking if this is a civic issue
            </p>
          </motion.div>
        )}

        {status === 'valid' && (
          <motion.div
            key="valid"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="flex flex-col items-center gap-4"
          >
            {/* Animated checkmark */}
            <div className="relative">
              {/* Outer glow */}
              <motion.div
                className="absolute inset-0 bg-green-400 rounded-full blur-xl"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.3, scale: 1.5 }}
                transition={{ duration: 0.5 }}
              />
              
              {/* Circle background */}
              <motion.div
                className="relative bg-green-100 rounded-full p-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 15,
                }}
              >
                <CheckCircle className="h-16 w-16 text-green-600" />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <h3 className="text-xl font-bold text-green-700 mb-2">
                Valid Civic Issue Detected!
              </h3>
              <p className="text-gray-600">{message}</p>
              <motion.p
                className="text-sm text-gray-500 mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Proceeding to analysis...
              </motion.p>
            </motion.div>
          </motion.div>
        )}

        {status === 'invalid' && (
          <motion.div
            key="invalid"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="flex flex-col items-center gap-4"
          >
            {/* Animated X mark with pulse */}
            <div className="relative">
              {/* Pulsing effect */}
              <motion.div
                className="absolute inset-0 bg-red-400 rounded-full blur-xl"
                animate={{
                  opacity: [0.3, 0.1, 0.3],
                  scale: [1.5, 1.8, 1.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              
              {/* Circle background */}
              <motion.div
                className="relative bg-red-100 rounded-full p-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 15,
                }}
              >
                <XCircle className="h-16 w-16 text-red-600" />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <h3 className="text-xl font-bold text-red-700 mb-2">
                Invalid Image
              </h3>
              <p className="text-gray-600 max-w-md">{message}</p>
              <p className="text-sm text-gray-500 mt-3">
                Please upload an image showing a public infrastructure or civic issue.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
