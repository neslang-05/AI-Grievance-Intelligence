'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Edit3, User, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { submitComplaint, updateComplaintSummary } from '@/app/actions/complaint.actions'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface ComplaintFormProps {
  preloadedImages?: string[]
}

export default function ComplaintForm({ preloadedImages = [] }: ComplaintFormProps) {
  const router = useRouter()
  // Voice recording state removed
  const [images] = useState<string[]>(preloadedImages)
  const [text, setText] = useState('')
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [manualLocation, setManualLocation] = useState('')
  const [ward, setWard] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [isEditingSummary, setIsEditingSummary] = useState(false)
  const [editedSummary, setEditedSummary] = useState('')
  const [user, setUser] = useState<any>(null)
  const [isAnonymous, setIsAnonymous] = useState(true)

  // mediaRecorderRef removed
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) setIsAnonymous(false)
    })
  }, [])

  // startRecording and stopRecording functions removed

  // 🎯 Convert base64 to Blob for form submission
  const base64ToBlob = (base64: string): Blob => {
    const parts = base64.split(';base64,')
    const contentType = parts[0].split(':')[1]
    const raw = window.atob(parts[1])
    const rawLength = raw.length
    const uInt8Array = new Uint8Array(rawLength)
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i)
    }
    return new Blob([uInt8Array], { type: contentType })
  }

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
          toast.success('Location captured')
        },
        (err) => {
          console.error('Geolocation error:', err)
          toast.error('Could not get location. Please enter manually.')
        }
      )
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('text', text)
      // Voice blob append removed

      // 🎯 Convert base64 images to blobs and append to form
      images.forEach((img, i) => {
        const blob = base64ToBlob(img)
        formData.append(`image-${i}`, blob, `image-${i}.jpg`)
      })

      if (location) {
        formData.append('location', JSON.stringify(location))
      }
      formData.append('manualLocation', manualLocation)
      formData.append('ward', ward)
      formData.append('isAnonymous', String(isAnonymous))

      console.log('Submitting complaint...')
      const res = await submitComplaint(formData)
      console.log('Submit response:', res)

      if (res.success) {
        console.log('Setting result state with:', res)
        setResult(res)
        setEditedSummary(res.summary || '')
        // 🎯 Clear sessionStorage after successful submission
        sessionStorage.removeItem('complaint-images-data')
        toast.success('Complaint submitted successfully')
      } else {
        console.error('Submit failed:', res.message)
        toast.error(res.message || 'Failed to submit complaint')
      }
    } catch (err) {
      console.error('Submission error:', err)
      toast.error('An error occurred during submission')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateSummary = async () => {
    if (!result?.complaintId) return

    try {
      await updateComplaintSummary(result.complaintId, editedSummary)
      setIsEditingSummary(false)
      toast.success('Summary updated')
    } catch (err) {
      toast.error('Failed to update summary')
    }
  }

  console.log('Current result state:', result)

  return (
    <div className="max-w-4xl mx-auto p-6">
      <AnimatePresence mode="wait">
        {result ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center min-h-[60vh]"
          >
            <Card className="border-green-200 bg-white shadow-2xl max-w-2xl w-full">
              <CardContent className="p-8 md:p-12 text-center">
                {/* Animated Checkmark */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                    delay: 0.1
                  }}
                  className="mx-auto mb-6"
                >
                  <div className="relative w-24 h-24 mx-auto">
                    {/* Circle background */}
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 bg-green-100 rounded-full"
                    />

                    {/* Animated circle border */}
                    <motion.svg
                      className="absolute inset-0 w-24 h-24"
                      viewBox="0 0 100 100"
                    >
                      <motion.circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="4"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                      />
                    </motion.svg>

                    {/* Animated checkmark */}
                    <motion.svg
                      className="absolute inset-0 w-24 h-24"
                      viewBox="0 0 100 100"
                    >
                      <motion.path
                        d="M 25 50 L 40 65 L 75 35"
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
                      />
                    </motion.svg>
                  </div>
                </motion.div>

                {/* Success Message */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                    Report Submitted!
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Your complaint has been successfully submitted and will be reviewed by our team.
                  </p>
                </motion.div>

                {/* Reference ID */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200"
                >
                  <p className="text-sm text-gray-500 mb-1">Reference ID</p>
                  <p className="text-xl font-mono font-bold text-[#0F4C81]">
                    {result.complaintId.slice(0, 16).toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Save this ID to track your complaint
                  </p>
                </motion.div>

                {/* Details Grid */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="grid grid-cols-2 gap-4 mb-8"
                >
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <p className="text-xs text-gray-500 mb-1">Department</p>
                    <p className="font-semibold text-gray-900">{result.department}</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                    <p className="text-xs text-gray-500 mb-1">Priority</p>
                    <p className={`font-semibold capitalize ${result.priority === 'high' ? 'text-red-600' :
                      result.priority === 'medium' ? 'text-orange-600' :
                        'text-blue-600'
                      }`}>
                      {result.priority}
                    </p>
                  </div>
                </motion.div>

                {/* Action Button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <Button
                    onClick={() => {
                      sessionStorage.removeItem('complaint-images-data')
                      router.push('/')
                    }}
                    className="w-full md:w-auto px-8 py-6 text-base font-semibold bg-[#0F4C81] hover:bg-[#0B3C5D] shadow-lg"
                    size="lg"
                  >
                    Submit Another Report
                  </Button>

                  <button
                    onClick={() => router.push('/status')}
                    className="mt-3 text-sm text-gray-600 hover:text-[#0F4C81] underline block mx-auto"
                  >
                    Track this complaint
                  </button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Add Details to Your Report</CardTitle>
                <CardDescription>
                  Provide additional context to help us process your complaint faster.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {user && (
                  <div className="mb-6 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#0B3C5D]">
                      <User className="h-4 w-4" />
                      <span className="text-sm font-medium">Logged in as {user.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="anonymous"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="rounded border-gray-300 text-[#0F4C81] focus:ring-[#0F4C81]"
                      />
                      <Label htmlFor="anonymous" className="text-xs cursor-pointer">
                        Submit anonymously
                      </Label>
                    </div>
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">

                  {/* 🎯 READ-ONLY Image Gallery */}
                  {images.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5 text-[#0F4C81]" />
                        <Label className="text-[#0B3C5D] font-bold">Uploaded Images ({images.length})</Label>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                        {images.map((img, i) => (
                          <div key={i} className="relative aspect-square">
                            <img
                              src={img}
                              alt={`Complaint evidence ${i + 1}`}
                              className="w-full h-full object-cover rounded-lg border-2 border-blue-100"
                            />
                            <div className="absolute bottom-1 right-1 bg-[#0F4C81] text-white text-xs px-1.5 py-0.5 rounded">
                              {i + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">
                        These images will be submitted with your complaint.
                        <button
                          type="button"
                          onClick={() => router.push('/')}
                          className="text-[#0F4C81] hover:underline ml-1"
                        >
                          Change images?
                        </button>
                      </p>
                    </div>
                  )}

                  {/* Text Description */}
                  <div className="space-y-2">
                    <Label htmlFor="text" className="text-[#0B3C5D] font-medium">Describe the Issue</Label>
                    <Textarea
                      id="text"
                      placeholder="Provide details about the civic issue you're reporting..."
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      rows={4}
                      className="resize-none"
                    />
                  </div>

                  {/* Voice Recording Removed */}

                  {/* Location Details */}
                  <div className="space-y-4 border-t pt-6">
                    <Label className="text-[#0B3C5D] font-bold">Location Details</Label>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant={location ? "secondary" : "outline"}
                        onClick={handleGetLocation}
                      >
                        <MapPin className={`mr-2 h-4 w-4 ${location ? 'text-green-600' : ''}`} />
                        {location ? 'Location Captured' : 'Get GPS Location'}
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="manualLocation">Landmark / Area</Label>
                        <Input
                          id="manualLocation"
                          placeholder="e.g., Near City Market"
                          value={manualLocation}
                          onChange={(e) => setManualLocation(e.target.value)}
                          className="bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ward">Ward Number / Name</Label>
                        <Input
                          id="ward"
                          placeholder="e.g., Ward 4"
                          value={ward}
                          onChange={(e) => setWard(e.target.value)}
                          className="bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-14 text-lg bg-[#0F4C81] hover:bg-[#0B3C5D]"
                    disabled={isSubmitting || (images.length === 0 && !text && !voiceBlob)}
                  >
                    {isSubmitting ? 'Processing Grievance...' : 'Submit Official Report'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
