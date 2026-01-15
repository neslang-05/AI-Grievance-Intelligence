'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Edit3, User, Image as ImageIcon, Navigation, Search, Loader2, Download, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { submitComplaint, updateComplaintSummary, analyzeComplaintPreSubmit } from '@/app/actions/complaint.actions'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import jsPDF from 'jspdf'
import 'leaflet/dist/leaflet.css'
import dynamic from 'next/dynamic'

// Dynamically import Leaflet map to avoid server-side issues
const MapPreview = dynamic(() => import('@/components/shared/MapPreview'), {
  ssr: false,
  loading: () => <div className="h-48 w-full bg-slate-100 animate-pulse rounded-lg flex items-center justify-center text-slate-400">Loading Map...</div>
})

interface ComplaintFormProps {
  preloadedImages?: string[]
}

const DEPARTMENTS = [
  "Municipal Corporation",
  "Public Works Department",
  "Water Resources",
  "Electricity Department",
  "Police Department",
  "Health Department",
  "Transport Department",
  "Urban Development",
  "Forest Department",
  "District Administration"
]

export default function ComplaintForm({ preloadedImages = [] }: ComplaintFormProps) {
  const router = useRouter()
  // Voice recording state removed
  const [images] = useState<string[]>(preloadedImages)
  const [text, setText] = useState('')
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [address, setAddress] = useState('')
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [isSearchingAddress, setIsSearchingAddress] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [locationAccepted, setLocationAccepted] = useState(false)

  const [aiAnalysis, setAiAnalysis] = useState<{
    summary: string;
    department: string;
    priority: string;
    keywords: string[];
    imageDescriptions?: string[];
  } | null>(null)
  
  const [selectedDepartment, setSelectedDepartment] = useState('')

  // Preview Mode
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  const [result, setResult] = useState<any>(null)

  const [user, setUser] = useState<any>(null)
  const [isAnonymous, setIsAnonymous] = useState(true)

  // Added missing state for edited summary and editing mode
  const [editedSummary, setEditedSummary] = useState('');
  const [isEditingSummary, setIsEditingSummary] = useState(false);

  // mediaRecorderRef removed
  const supabase = createClient()

  // Reverse geocode function to get address from coordinates
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      )
      const data = await response.json()
      if (data.display_name) {
        setAddress(data.display_name)
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error)
    }
  }, [])

  // Search address and get coordinates
  const searchAddress = async () => {
    if (!address.trim()) return
    
    setIsSearchingAddress(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      )
      const data = await response.json()
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat)
        const lng = parseFloat(data[0].lon)
        setLocation({ lat, lng })
        setAddress(data[0].display_name)
        setLocationAccepted(false)
        toast.success('Location found! Review and accept below.')
      } else {
        toast.error('Address not found. Please try a different search.')
      }
    } catch (error) {
      console.error('Address search error:', error)
      toast.error('Failed to search address')
    } finally {
      setIsSearchingAddress(false)
    }
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) setIsAnonymous(false)
    })

    // Auto-analyze images if present
    if (preloadedImages.length > 0) {
      handleAnalyzeImages()
    }

    // Auto-get GPS location on page load
    handleGetLocation(true)
  }, [])

  const handleAnalyzeImages = async () => {
    if (images.length === 0) {
      console.log('No images to analyze')
      return
    }

    console.log('Starting AI analysis for', images.length, 'images...')
    setIsAnalyzing(true)
    try {
      const formData = new FormData()
      // Use both 'images' and indexed keys for maximum compatibility
      images.forEach((img, i) => {
        const blob = base64ToBlob(img)
        formData.append(`images`, blob, `image-${i}.jpg`)
        formData.append(`image-${i}`, blob, `image-${i}.jpg`)
      })
      
      // Clear description temporarily if currently empty to show loading placeholder
      if (!text) setText('') 

      const res = await analyzeComplaintPreSubmit(formData)
      if (res.success && res.analysis) {
        setAiAnalysis({
          summary: res.analysis.summary,
          department: res.analysis.department,
          priority: res.analysis.priority,
          keywords: res.analysis.keywords || [],
          imageDescriptions: res.analysis.imageDescriptions
        })
        
        // Only pre-fill if user hasn't typed anything yet
        if (!text || text.trim().length < 10) {
          setText(res.analysis.summary)
        }
        
        if (!selectedDepartment) {
          setSelectedDepartment(res.analysis.department)
        }
        
        toast.success("AI Analysis Complete: Suggestions updated")
      } else {
        toast.error(res.message || "AI Analysis failed. Please enter details manually.")
      }
    } catch (err) {
      console.error(err)
      toast.error("AI analysis failed to connect. Please enter details manually.")
    } finally {
      setIsAnalyzing(false)
    }
  }

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

  const handleGetLocation = (silent: boolean = false) => {
    if (navigator.geolocation) {
      setIsGettingLocation(true)
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude
          const lng = pos.coords.longitude
          setLocation({ lat, lng })
          setLocationAccepted(false)
          await reverseGeocode(lat, lng)
          if (!silent) {
            toast.success('Location detected! Review and accept below.')
          }
          setIsGettingLocation(false)
        },
        (err) => {
          console.error('Geolocation error:', err)
          if (!silent) {
            toast.error('Could not get location. Please enter address manually.')
          }
          setIsGettingLocation(false)
        },
        { enableHighAccuracy: true }
      )
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    // If we're not in preview mode, go to preview mode first
    if (!isPreviewMode) {
      if (!aiAnalysis) {
        // If no AI analysis yet, do it now
        if (images.length > 0) {
          await handleAnalyzeImages()
        }
      }
      setIsPreviewMode(true)
      window.scrollTo(0, 0)
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('text', text) // This is the potentially edited text

      // Pass edited data
      if (selectedDepartment) {
        formData.append('editedDepartment', selectedDepartment)
      }
      formData.append('editedSummary', text)

      // 🎯 Pass existing image descriptions to avoid re-analysis
      if (aiAnalysis?.imageDescriptions) {
        aiAnalysis.imageDescriptions.forEach(desc => {
          formData.append('imageDescriptions', desc)
        })
      }

      // 🎯 Convert base64 images to blobs and append to form
      images.forEach((img, i) => {
        const blob = base64ToBlob(img)
        formData.append(`image-${i}`, blob, `image-${i}.jpg`)
      })

      if (location) {
        formData.append('location', JSON.stringify(location))
      }
      formData.append('address', address)
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

  const generatePDF = () => {
    if (!result) return
    const doc = new jsPDF()

    doc.setFontSize(20)
    doc.text("Grievance Report", 20, 20)

    doc.setFontSize(12)
    doc.text(`Reference ID: ${result.complaintId}`, 20, 40)
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 50)
    doc.text(`Department: ${result.department}`, 20, 60)
    doc.text(`Priority: ${result.priority.toUpperCase()}`, 20, 70)

    doc.text("Summary:", 20, 90)
    // Wrap text
    const splitTitle = doc.splitTextToSize(result.summary, 170)
    doc.text(splitTitle, 20, 100)

    doc.save(`grievance-${result.complaintId.slice(0, 8)}.pdf`)
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

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <Button
                    onClick={generatePDF}
                    className="w-full mb-3 bg-green-600 hover:bg-green-700"
                  >
                    Download Report (PDF)
                  </Button>

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
        ) : isPreviewMode ? (
          // Preview Mode UI
          <motion.div
            key="preview"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Review Your Complaint</CardTitle>
                <CardDescription>Please review the details below before final submission.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Image Preview */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, i) => (
                    <img key={i} src={img} className="h-24 w-24 object-cover rounded-md border" />
                  ))}
                </div>

                {/* Description */}
                <div>
                  <Label className="text-sm text-gray-500">Description</Label>
                  <div className="p-3 bg-gray-50 rounded-md mt-1 border">
                    {text}
                  </div>
                </div>

                {/* Department */}
                <div>
                  <Label className="text-sm text-gray-500">Department</Label>
                  <div className="font-semibold text-[#0F4C81] mt-1">
                    {selectedDepartment || "Not selected"}
                  </div>
                </div>

                {/* Location */}
                <div>
                  <Label className="text-sm text-gray-500">Location</Label>
                  {location ? (
                    <div className="space-y-2 mt-2">
                      <div className="h-48 rounded-md overflow-hidden border">
                        <MapPreview
                          lat={location.lat}
                          lng={location.lng}
                          zoom={15}
                          interactive={false}
                        />
                      </div>
                      <div className="bg-gray-50 p-3 rounded-md border text-sm">
                        <p className="text-gray-700">{address || 'No address provided'}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Coordinates: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-600 mt-1 italic">No location provided</div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsPreviewMode(false)} className="flex-1">
                    Back to Edit
                  </Button>
                  <Button onClick={() => handleSubmit()} className="flex-1 bg-[#0F4C81]" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Confirm & Submit'}
                  </Button>
                </div>
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
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Add Details to Your Report</CardTitle>
                    <CardDescription>
                      Provide additional context to help us process your complaint faster.
                    </CardDescription>
                  </div>
                </div>
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
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="h-5 w-5 text-[#0F4C81]" />
                          <Label className="text-[#0B3C5D] font-bold">Uploaded Images ({images.length})</Label>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={handleAnalyzeImages}
                          disabled={isAnalyzing}
                        >
                          {isAnalyzing ? "Analyzing..." : "Re-Analyze w/ AI"}
                        </Button>
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
                    </div>
                  )}

                  {/* Text Description */}
                  <div className="space-y-2">
                    <Label htmlFor="text" className="text-[#0B3C5D] font-medium">
                      Description (Auto-generated by AI - You can edit)
                    </Label>
                    <div className="relative">
                      <Textarea
                        id="text"
                        placeholder={isAnalyzing ? "Analyzing images, please wait..." : "Provide details about the civic issue you're reporting..."}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows={4}
                        className={`resize-none pr-10 ${isAnalyzing ? 'bg-blue-50/50' : ''}`}
                        disabled={isAnalyzing}
                      />
                      <Edit3 className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                    </div>
                    {isAnalyzing && (
                      <p className="text-xs text-blue-600 animate-pulse">AI is analyzing the image to generate description...</p>
                    )}
                  </div>

                  {/* Department Selection (Auto + Edit) */}
                  <div className="space-y-2">
                    <Label className="text-[#0B3C5D] font-medium">
                      Department (Auto-selected by AI - You can change)
                    </Label>
                    <Select
                      value={selectedDepartment}
                      onValueChange={setSelectedDepartment}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Department" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEPARTMENTS.map(dept => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Voice Recording Removed */}

                  {/* Location Details */}
                  <div className="space-y-4 border-t pt-6">
                    <Label className="text-[#0B3C5D] font-bold flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Location Details
                    </Label>

                    {/* Address Search */}
                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-sm text-gray-600">
                        Search Address or Enter Location
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="address"
                          placeholder="Enter address, landmark, or area..."
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), searchAddress())}
                          className="bg-white flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={searchAddress}
                          disabled={isSearchingAddress || !address.trim()}
                        >
                          {isSearchingAddress ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Search className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* GPS Button */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant={location ? "secondary" : "outline"}
                        onClick={() => handleGetLocation(false)}
                        disabled={isGettingLocation}
                      >
                        {isGettingLocation ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Detecting...
                          </>
                        ) : (
                          <>
                            <Navigation className={`mr-2 h-4 w-4 ${location ? 'text-green-600' : ''}`} />
                            {location ? 'Refresh GPS Location' : 'Use My GPS Location'}
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Map Preview with Selection */}
                    {location && (
                      <div className="space-y-3">
                        <div className="h-56 rounded-lg overflow-hidden border-2 border-gray-200 shadow-sm">
                          <MapPreview
                            lat={location.lat}
                            lng={location.lng}
                            zoom={16}
                            onLocationSelect={async (lat, lng) => {
                              setLocation({ lat, lng })
                              setLocationAccepted(false)
                              await reverseGeocode(lat, lng)
                            }}
                            interactive={true}
                          />
                        </div>
                        <p className="text-xs text-gray-500 text-center">
                          Click on the map to adjust the location pin
                        </p>
                        
                        {/* Location Accept/Reject */}
                        <div className="bg-gray-50 border rounded-lg p-4 space-y-3">
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">Selected Location:</span>
                            <p className="text-gray-600 mt-1">{address || 'Address not available'}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              Coordinates: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                            </p>
                          </div>
                          
                          {!locationAccepted ? (
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => {
                                  setLocationAccepted(true)
                                  toast.success('Location accepted!')
                                }}
                              >
                                <Check className="mr-1 h-4 w-4" />
                                Accept Location
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setLocation(null)
                                  setAddress('')
                                  setLocationAccepted(false)
                                }}
                              >
                                Clear & Re-enter
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-green-600">
                              <Check className="h-5 w-5" />
                              <span className="font-medium">Location Confirmed</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {!location && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                        <p>📍 Please provide a location by using GPS, searching an address, or clicking on the map.</p>
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-14 text-lg bg-[#0F4C81] hover:bg-[#0B3C5D]"
                    disabled={isSubmitting || (images.length === 0 && !text)}
                  >
                    Next: Preview Report
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

