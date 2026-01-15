'use client'

/**
 * Image Upload Zone Component  
 * Step 1: Camera-first image capture with drag-and-drop fallback
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { compressImage, validateImageFile } from '@/lib/utils/image-compression'
import { Button } from '@/components/ui/button'

interface ImageUploadZoneProps {
  onImagesSelected: (files: File[], base64Images: string[]) => void
  onContinue?: () => void
  maxImages?: number
  existingImages?: File[]
  autoStartCamera?: boolean
}

export default function ImageUploadZone({
  onImagesSelected,
  onContinue,
  maxImages = 5,
  existingImages = [],
  autoStartCamera = false,
}: ImageUploadZoneProps) {
  const [images, setImages] = useState<File[]>(existingImages)
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [isCompressing, setIsCompressing] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [hasAutoStarted, setHasAutoStarted] = useState(false)

  // Auto-start camera if requested
  useEffect(() => {
    if (autoStartCamera && !hasAutoStarted && images.length === 0) {
      startCamera()
      setHasAutoStarted(true)
    }
  }, [autoStartCamera, hasAutoStarted, images.length])


  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  // Start camera stream
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      })

      setStream(mediaStream)
      setShowCamera(true)

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
      }, 100)
    } catch (error: any) {
      if (error.name === 'NotAllowedError') {
        toast.error('Camera access denied. Please enable camera permissions or use upload.')
      } else if (error.name === 'NotFoundError') {
        toast.error('No camera found. Please use file upload.')
      } else {
        toast.error('Could not access camera. Please try file upload.')
      }
      console.error('Camera error:', error)
    }
  }

  // Capture photo from camera
  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(video, 0, 0)

    // Convert to blob
    canvas.toBlob(
      async (blob) => {
        if (!blob) return

        setIsCompressing(true)

        try {
          // Create file from blob
          const file = new File([blob], `camera-${Date.now()}.jpg`, {
            type: 'image/jpeg',
          })

          // Compress the image
          const compressedBlob = await compressImage(file)
          const compressedFile = new File(
            [compressedBlob],
            `camera-${Date.now()}.jpg`,
            { type: 'image/jpeg' }
          )

          // Generate preview
          const preview = await fileToBase64(compressedFile)

          const newImages = [...images, compressedFile].slice(0, maxImages)
          const newPreviews = [...imagePreviews, preview].slice(0, maxImages)

          setImages(newImages)
          setImagePreviews(newPreviews)
          onImagesSelected(newImages, newPreviews)

          toast.success('Photo captured!')
          stopCamera()
        } catch (error) {
          console.error('Capture error:', error)
          toast.error('Failed to process photo')
        } finally {
          setIsCompressing(false)
        }
      },
      'image/jpeg',
      0.8
    )
  }, [images, imagePreviews, maxImages, onImagesSelected])

  // Stop camera stream
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setShowCamera(false)
  }

  // Handle file drop or file input
  const processFiles = useCallback(
    async (files: File[]) => {
      const remainingSlots = maxImages - images.length
      if (remainingSlots <= 0) {
        toast.error(`Maximum ${maxImages} images allowed`)
        return
      }

      const validFiles: File[] = []
      for (const file of files.slice(0, remainingSlots)) {
        const validation = validateImageFile(file)
        if (validation.isValid) {
          validFiles.push(file)
        } else {
          toast.error(`${file.name}: ${validation.error}`)
        }
      }

      if (validFiles.length === 0) return

      setIsCompressing(true)
      toast.info(`Compressing ${validFiles.length} image(s)...`)

      try {
        // Compress all images
        const compressedBlobs = await Promise.all(
          validFiles.map((file) => compressImage(file))
        )

        // Convert to files
        const compressedFiles = compressedBlobs.map(
          (blob, i) =>
            new File([blob], validFiles[i].name, { type: 'image/jpeg' })
        )

        // Generate previews
        const previews = await Promise.all(
          compressedFiles.map((file) => fileToBase64(file))
        )

        const newImages = [...images, ...compressedFiles]
        const newPreviews = [...imagePreviews, ...previews]

        setImages(newImages)
        setImagePreviews(newPreviews)
        onImagesSelected(newImages, newPreviews)

        toast.success(`${compressedFiles.length} image(s) added!`)
      } catch (error) {
        console.error('Image compression error:', error)
        toast.error('Failed to process images')
      } finally {
        setIsCompressing(false)
      }
    },
    [images, imagePreviews, maxImages, onImagesSelected]
  )

  // Dropzone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: processFiles,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: images.length >= maxImages || isCompressing,
    noClick: true, // We'll handle clicks separately
  })

  // Remove image
  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    setImages(newImages)
    setImagePreviews(newPreviews)
    onImagesSelected(newImages, newPreviews)
    toast.info('Image removed')
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [stream])

  return (
    <div className="space-y-6">
      {/* Hidden canvas for capturing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Camera View - Full Screen */}
      {showCamera && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 px-4 py-3 bg-gradient-to-b from-black/80 to-transparent">
            <p className="text-white text-center text-base md:text-lg font-medium">
              Point at the civic issue and tap to capture
            </p>
          </div>

          {/* Video Stream */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="flex-1 w-full h-full object-cover"
          />

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 z-10 pb-8 pt-6 bg-gradient-to-t from-black/90 via-black/70 to-transparent">
            {/* Counter */}
            <div className="text-center mb-6">
              <p className="text-white text-base font-medium">
                {images.length} / {maxImages} images captured
              </p>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-center gap-8 px-6">
              {/* Cancel */}
              <button
                onClick={stopCamera}
                className="w-14 h-14 rounded-full bg-gray-700/80 hover:bg-gray-600 transition-colors flex items-center justify-center"
                aria-label="Cancel camera"
              >
                <X className="w-7 h-7 text-white" />
              </button>

              {/* Capture */}
              <button
                onClick={capturePhoto}
                disabled={isCompressing}
                className="w-20 h-20 rounded-full bg-white hover:bg-gray-200 transition-all shadow-2xl flex items-center justify-center ring-4 ring-white/30 disabled:opacity-50"
                aria-label="Capture photo"
              >
                <div className="w-16 h-16 rounded-full bg-white border-4 border-gray-800" />
              </button>

              {/* Flip Camera Placeholder */}
              <button
                className="w-14 h-14 rounded-full bg-gray-700/80 hover:bg-gray-600 transition-colors flex items-center justify-center"
                aria-label="Flip camera"
              >
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Upload Interface */}
      {!showCamera && (
        <>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">
              Capture Image of the Issue
            </h2>
            <p className="text-gray-600">
              {maxImages === 1 
                ? 'Use your camera for best results or upload from gallery'
                : `Upload up to ${maxImages} images using camera or gallery`
              }
            </p>
          </div>

          {/* Camera Circle - Show when no images */}
          {images.length === 0 && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-48 h-48 md:w-56 md:h-56 mx-auto mb-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center border-4 border-blue-200 shadow-lg"
            >
              <Camera className="w-20 h-20 md:w-24 md:h-24 text-[#0F4C81]" />
            </motion.div>
          )}

          {/* Image Grid Preview */}
          {images.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-2xl mx-auto"
            >
              <AnimatePresence>
                {imagePreviews.map((preview, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative aspect-square group"
                  >
                    <img
                      src={preview}
                      alt={`Captured ${i + 1}`}
                      className="w-full h-full object-cover rounded-xl border-2 border-gray-200 group-hover:border-[#0F4C81] transition-all"
                    />
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition-colors z-10"
                      aria-label={`Remove image ${i + 1}`}
                    >
                      <X className="w-4 w-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                      #{i + 1}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Primary Action: Camera Button */}
          <div className="max-w-md mx-auto space-y-4">
            <Button
              onClick={startCamera}
              disabled={images.length >= maxImages || isCompressing}
              className="w-full bg-[#0F4C81] hover:bg-[#0B3C5D] text-white py-6 px-6 rounded-xl font-semibold text-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              size="lg"
            >
              <Camera className="w-6 h-6 mr-2" />
              {images.length === 0 
                ? 'Open Camera' 
                : maxImages === 1 
                  ? 'Replace Photo' 
                  : 'Add More Photos'
              }
            </Button>

            {/* Drag-and-Drop Zone - Hide when single image is uploaded */}
            {!(maxImages === 1 && images.length >= 1) && (
              <div
                {...getRootProps()}
                className={`
                  relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer
                  ${
                    isDragActive
                      ? 'border-[#0F4C81] bg-blue-50'
                      : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                  }
                  ${images.length >= maxImages || isCompressing ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <input {...getInputProps()} />
                
                <div className="text-center space-y-3">
                  <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md">
                    {isDragActive ? (
                      <ImageIcon className="w-8 h-8 text-[#0F4C81]" />
                    ) : (
                      <Upload className="w-8 h-8 text-gray-600" />
                    )}
                  </div>

                  <div>
                    <p className="text-base font-medium text-gray-700">
                      {isDragActive
                        ? 'Drop images here'
                        : 'Drag & drop images here'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      or{' '}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[#0F4C81] hover:underline font-medium"
                        disabled={images.length >= maxImages || isCompressing}
                      >
                        browse files
                      </button>
                    </p>
                  </div>

                  <p className="text-xs text-gray-400">
                    JPEG, PNG, WebP • Max 10MB per image
                  </p>
                </div>

                {/* Hidden file input for browse */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || [])
                    processFiles(files)
                    e.target.value = ''
                  }}
                  className="hidden"
                  disabled={images.length >= maxImages || isCompressing}
                />
              </div>
            )}
          </div>

          {/* Image Counter & Info */}
          <div className="max-w-md mx-auto space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 font-medium">
                {images.length} / {maxImages} images
              </span>
              {images.length > 0 && (
                <span className="text-green-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Ready to proceed
                </span>
              )}
            </div>

            {isCompressing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2"
              >
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0F4C81]" />
                <span className="text-sm text-blue-700">Compressing images...</span>
              </motion.div>
            )}

            {images.length === 0 && (
              <p className="text-center text-gray-500 text-sm">
                {maxImages === 1 
                  ? 'Upload 1 image of the civic issue for AI analysis'
                  : `Upload 1-${maxImages} images of the civic issue for AI analysis`
                }
              </p>
            )}

            {images.length > 0 && images.length < maxImages && (
              <p className="text-center text-gray-500 text-sm">
                {maxImages === 1 
                  ? 'Click camera or drag-and-drop to replace the image'
                  : `You can add ${maxImages - images.length} more image(s) or continue`
                }
              </p>
            )}

            {/* Continue Button - Shows when at least 1 image is uploaded */}
            {images.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Button
                  onClick={() => {
                    if (onContinue) {
                      onContinue()
                    } else {
                      toast.success(`${images.length} image(s) ready for analysis`)
                    }
                  }}
                  disabled={isCompressing}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-5 px-6 rounded-xl font-semibold text-base shadow-lg transition-all disabled:opacity-50"
                  size="lg"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Continue with {images.length} {images.length === 1 ? 'Image' : 'Images'}
                </Button>
              </motion.div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
