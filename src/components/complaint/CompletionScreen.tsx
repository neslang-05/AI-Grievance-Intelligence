'use client'

/**
 * Completion Screen Component
 * Step 7: Success confirmation with actions
 */

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  CheckCircle,
  Download,
  ExternalLink,
  Copy,
  Share2,
  FileText,
} from 'lucide-react'
import Lottie from 'lottie-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import {
  downloadComplaintReport,
  ComplaintReportData,
} from '@/lib/utils/pdf-generator'
import { formatReferenceId } from '@/lib/utils/reference-id-generator'

interface CompletionScreenProps {
  referenceId: string
  department: string
  priority: string
  severity?: string
  summary: string
  estimatedResolution?: string
}

// Simple confetti animation data
const confettiAnimation = {
  v: '5.7.4',
  fr: 60,
  ip: 0,
  op: 120,
  w: 500,
  h: 500,
  nm: 'Confetti',
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'Confetti',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: {
          a: 1,
          k: [
            { t: 0, s: [0], e: [360] },
            { t: 120, s: [360] },
          ],
        },
        p: { a: 0, k: [250, 250] },
        a: { a: 0, k: [0, 0] },
        s: { a: 0, k: [100, 100] },
      },
      shapes: [],
    },
  ],
}

export default function CompletionScreen({
  referenceId,
  department,
  priority,
  severity,
  summary,
  estimatedResolution = '5-7 business days',
}: CompletionScreenProps) {
  const router = useRouter()
  const [showConfetti, setShowConfetti] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Hide confetti after 3 seconds
    const timer = setTimeout(() => setShowConfetti(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  const copyReferenceId = () => {
    navigator.clipboard.writeText(referenceId)
    setCopied(true)
    toast.success('Reference ID copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadReport = async () => {
    try {
      const reportData: ComplaintReportData = {
        referenceId,
        summary,
        department,
        priority,
        severity,
        submittedAt: new Date(),
        estimatedResolution,
        isAnonymous: true,
      }
      await downloadComplaintReport(reportData)
      toast.success('Report downloaded successfully')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download report')
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: 'Complaint Submitted',
          text: `My complaint has been registered. Reference ID: ${referenceId}`,
          url: `${window.location.origin}/status?ref=${referenceId}`,
        })
        .then(() => toast.success('Shared successfully'))
        .catch((error) => console.error('Share error:', error))
    } else {
      copyReferenceId()
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
      case 'immediate':
        return 'text-red-600'
      case 'medium':
      case 'urgent':
        return 'text-orange-600'
      default:
        return 'text-blue-600'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto min-h-[80vh] flex flex-col items-center justify-center p-6"
    >
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full max-w-lg"
          >
            {/* Simple particle effect */}
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  background: ['#0F4C81', '#10B981', '#F59E0B', '#EF4444'][i % 4],
                  left: `${Math.random() * 100}%`,
                  top: '50%',
                }}
                animate={{
                  y: [0, -200 - Math.random() * 200],
                  x: [(Math.random() - 0.5) * 200],
                  opacity: [1, 0],
                  scale: [0, 1, 0.5],
                }}
                transition={{
                  duration: 2 + Math.random(),
                  ease: 'easeOut',
                  delay: Math.random() * 0.5,
                }}
              />
            ))}
          </motion.div>
        </div>
      )}

      <Card className="w-full border-green-200 bg-white shadow-2xl">
        <CardContent className="p-8 md:p-12">
          {/* Animated Checkmark */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15,
              delay: 0.1,
            }}
            className="mx-auto mb-6 relative w-24 h-24"
          >
            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 bg-green-400 rounded-full blur-2xl"
              animate={{
                opacity: [0.3, 0.5, 0.3],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Circle background */}
            <div className="relative w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-16 w-16 text-green-600" strokeWidth={2.5} />
            </div>
          </motion.div>

          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-6"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Complaint Submitted Successfully!
            </h1>
            <p className="text-gray-600 text-lg">
              Your complaint has been registered and will be reviewed by the relevant
              department.
            </p>
          </motion.div>

          {/* Reference ID */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border-2 border-blue-200"
          >
            <p className="text-sm text-gray-600 mb-2 text-center">
              Your Reference ID
            </p>
            <div className="flex items-center justify-center gap-3 mb-3">
              <p className="text-3xl font-mono font-bold text-[#0F4C81]">
                {formatReferenceId(referenceId)}
              </p>
              <button
                onClick={copyReferenceId}
                className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                title="Copy Reference ID"
              >
                {copied ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <Copy className="h-5 w-5 text-[#0F4C81]" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 text-center">
              Save this ID to track your complaint status
            </p>
          </motion.div>

          {/* Details Grid */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 gap-4 mb-6"
          >
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <p className="text-xs text-gray-500 mb-1">Department</p>
              <p className="font-semibold text-gray-900 text-sm">{department}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
              <p className="text-xs text-gray-500 mb-1">Priority</p>
              <p className={`font-semibold capitalize text-sm ${getPriorityColor(priority)}`}>
                {priority}
              </p>
            </div>
          </motion.div>

          {/* Estimated Resolution */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-center"
          >
            <p className="text-sm text-gray-600 mb-1">Estimated Resolution Time</p>
            <p className="text-lg font-semibold text-green-700">
              {estimatedResolution}
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="space-y-3"
          >
            <Button
              onClick={handleDownloadReport}
              className="w-full bg-[#0F4C81] hover:bg-[#0B3C5D] text-base py-6"
              size="lg"
            >
              <Download className="h-5 w-5 mr-2" />
              Download Complaint Report (PDF)
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => router.push(`/status?ref=${referenceId}`)}
                variant="outline"
                className="text-base py-6"
              >
                <FileText className="h-4 w-4 mr-2" />
                Track Status
              </Button>
              <Button onClick={handleShare} variant="outline" className="text-base py-6">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>

            <Button
              onClick={() => {
                sessionStorage.clear()
                router.push('/new-submit')
              }}
              variant="ghost"
              className="w-full text-gray-600 hover:text-[#0F4C81]"
            >
              Submit Another Complaint
            </Button>
          </motion.div>

          {/* Footer Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-6 pt-6 border-t text-center text-sm text-gray-500"
          >
            <p>
              You will be notified about status updates via the platform.
            </p>
            <p className="mt-1">
              For inquiries, visit{' '}
              <a href="/" className="text-[#0F4C81] hover:underline">
                our homepage
              </a>
            </p>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
