'use client'

/**
 * Complaint Preview Component
 * Step 6: Final review before submission
 */

import { motion } from 'framer-motion'
import { MapPin, FileText, Building, AlertCircle, ChevronLeft, Send, ZoomIn } from 'lucide-react'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import { ComplaintData, LocationData } from '@/types/complaint.types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const MapPreview = dynamic(() => import('@/components/shared/MapPreview'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-slate-100 animate-pulse rounded-lg" />
  ),
})

interface ComplaintPreviewNewProps {
  images: string[]
  complaintData: ComplaintData
  location: LocationData | null
  onBack: () => void
  onSubmit: () => void
  isSubmitting: boolean
}

export default function ComplaintPreviewNew({
  images,
  complaintData,
  location,
  onBack,
  onSubmit,
  isSubmitting,
}: ComplaintPreviewNewProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-100 text-red-700 border-red-300'
      case 'High':
        return 'bg-orange-100 text-orange-700 border-orange-300'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'Low':
        return 'bg-blue-100 text-blue-700 border-blue-300'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Review Your Complaint</h2>
        <p className="text-gray-600">
          Please review all details before final submission
        </p>
      </div>

      {/* Image Gallery */}
      {images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#0F4C81]" />
              Attached Images ({images.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {images.map((img, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative aspect-square group cursor-pointer"
                  onClick={() => setSelectedImage(img)}
                >
                  <img
                    src={img}
                    alt={`Evidence ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg border-2 border-gray-200 group-hover:border-[#0F4C81] transition-all"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
                    <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-[#0F4C81] text-white text-xs px-2 py-0.5 rounded">
                    #{index + 1}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Complaint Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#0F4C81]" />
            Complaint Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Type */}
          <div>
            <label className="text-sm font-medium text-gray-500">Type</label>
            <p className="text-gray-900 font-medium mt-1">{complaintData.type}</p>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-gray-500">Description</label>
            <p className="text-gray-900 mt-1 whitespace-pre-wrap">
              {complaintData.description}
            </p>
          </div>

          {/* Department & Severity Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Department */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Building className="h-4 w-4 text-blue-600" />
                <label className="text-sm font-medium text-blue-900">Department</label>
              </div>
              <p className="text-blue-700 font-semibold">{complaintData.department}</p>
            </div>

            {/* Severity */}
            <div className={`border-2 rounded-lg p-4 ${getSeverityColor(complaintData.severity)}`}>
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4" />
                <label className="text-sm font-medium">Severity</label>
              </div>
              <p className="font-semibold">{complaintData.severity}</p>
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="text-sm font-medium text-gray-500">Priority</label>
            <p className="text-gray-900 font-medium mt-1 capitalize">
              {complaintData.priority}
            </p>
          </div>

          {/* Additional Notes */}
          {complaintData.additionalNotes && (
            <div>
              <label className="text-sm font-medium text-gray-500">
                Additional Notes
              </label>
              <p className="text-gray-900 mt-1 whitespace-pre-wrap">
                {complaintData.additionalNotes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Location */}
      {location && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[#0F4C81]" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Map */}
            <div className="h-64 rounded-lg overflow-hidden border-2 border-gray-200">
              <MapPreview
                lat={location.latitude}
                lng={location.longitude}
                zoom={15}
                interactive={false}
              />
            </div>

            {/* Address */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
              <div>
                <label className="text-sm font-medium text-gray-500">Address</label>
                <p className="text-gray-900 mt-1">{location.address}</p>
              </div>

              {location.landmark && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Landmark</label>
                  <p className="text-gray-900 mt-1">{location.landmark}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-500">Coordinates</label>
                <p className="text-gray-600 text-sm mt-1 font-mono">
                  {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submission Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Before you submit</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>Verify all information is accurate</li>
                <li>Ensure images clearly show the issue</li>
                <li>Check that the location is correct</li>
                <li>You will receive a reference ID to track your complaint</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex-1"
          disabled={isSubmitting}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Edit
        </Button>
        <Button
          onClick={onSubmit}
          className="flex-1 bg-green-600 hover:bg-green-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Submit Complaint
            </>
          )}
        </Button>
      </div>

      {/* Image Zoom Modal */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <motion.img
            src={selectedImage}
            alt="Zoomed"
            className="max-w-full max-h-full object-contain"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}
