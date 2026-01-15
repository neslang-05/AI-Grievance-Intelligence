'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Camera, Upload, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CameraCaptureProps {
    onImagesChange: (images: string[]) => void
    maxImages?: number
}

export default function CameraCapture({ onImagesChange, maxImages = 5 }: CameraCaptureProps) {
    const [images, setImages] = useState<string[]>([])
    const [showCamera, setShowCamera] = useState(false)
    const [stream, setStream] = useState<MediaStream | null>(null)

    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // 🎯 Convert file to base64
    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = error => reject(error)
        })
    }

    // 🎯 Start camera stream
    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            })

            setStream(mediaStream)
            setShowCamera(true)

            // Wait for video element to be ready
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream
                }
            }, 100)

        } catch (error: any) {
            if (error.name === 'NotAllowedError') {
                alert('Camera access denied. Please enable camera permissions or use gallery upload.')
            } else if (error.name === 'NotFoundError') {
                alert('No camera found on this device. Please use gallery upload.')
            } else {
                alert('Could not access camera. Please try gallery upload.')
            }
            console.error('Camera error:', error)
        }
    }

    // 🎯 Capture photo from camera
    const capturePhoto = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) return

        const video = videoRef.current
        const canvas = canvasRef.current

        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        ctx.drawImage(video, 0, 0)

        const base64Image = canvas.toDataURL('image/jpeg', 0.8)

        const newImages = [...images, base64Image].slice(0, maxImages)
        setImages(newImages)
        onImagesChange(newImages)

        // Close camera after capture
        stopCamera()
    }, [images, maxImages, onImagesChange])

    // 🎯 Stop camera stream
    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop())
            setStream(null)
        }
        setShowCamera(false)
    }

    // 🎯 Handle gallery upload
    const handleGallery = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (files.length === 0) return

        const remainingSlots = maxImages - images.length
        const filesToProcess = files.slice(0, remainingSlots)

        // Validate file sizes (5MB max each)
        const validFiles = filesToProcess.filter(file => {
            if (file.size > 5 * 1024 * 1024) {
                alert(`${file.name} exceeds 5MB limit and was skipped.`)
                return false
            }
            return true
        })

        try {
            const base64Images = await Promise.all(validFiles.map(fileToBase64))
            const newImages = [...images, ...base64Images].slice(0, maxImages)
            setImages(newImages)
            onImagesChange(newImages)
        } catch (error) {
            console.error('Error processing images:', error)
            alert('Error processing images. Please try again.')
        }

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    // 🎯 Remove an image
    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index)
        setImages(newImages)
        onImagesChange(newImages)
    }

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop())
            }
        }
    }, [stream])

    return (
        <div className="space-y-6">
            {/* Hidden canvas for capturing */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Camera View - Full Screen Mobile Camera */}
            {showCamera && (
                <div className="fixed inset-0 z-[100] bg-black flex flex-col">
                    {/* Header with instruction */}
                    <div className="absolute top-0 left-0 right-0 z-10 px-4 py-3 bg-gradient-to-b from-black/80 to-transparent">
                        <p className="text-white text-center text-base md:text-lg font-medium">
                            Point at issue and tap to capture
                        </p>
                    </div>

                    {/* Video Stream */}
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="flex-1 w-full h-full object-cover"
                    />

                    {/* Bottom Controls */}
                    <div className="absolute bottom-0 left-0 right-0 z-10 pb-8 pt-6 bg-gradient-to-t from-black/90 via-black/70 to-transparent">
                        {/* Capture Counter */}
                        <div className="text-center mb-6">
                            <p className="text-white text-base font-medium">
                                {images.length} / {maxImages} images captured
                            </p>
                        </div>

                        {/* Control Buttons */}
                        <div className="flex items-center justify-center gap-8 px-6">
                            {/* Cancel Button */}
                            <button
                                onClick={stopCamera}
                                className="w-14 h-14 rounded-full bg-gray-700/80 hover:bg-gray-600 transition-colors flex items-center justify-center"
                                aria-label="Cancel camera"
                            >
                                <X className="w-7 h-7 text-white" />
                            </button>

                            {/* Capture Button */}
                            <button
                                onClick={capturePhoto}
                                className="w-20 h-20 rounded-full bg-white hover:bg-gray-200 transition-all shadow-2xl flex items-center justify-center ring-4 ring-white/30"
                                aria-label="Capture photo"
                            >
                                <div className="w-16 h-16 rounded-full bg-white border-4 border-gray-800" />
                            </button>

                            {/* Flip Camera Button (placeholder for future enhancement) */}
                            <button
                                className="w-14 h-14 rounded-full bg-gray-700/80 hover:bg-gray-600 transition-colors flex items-center justify-center"
                                aria-label="Flip camera"
                            >
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            {!showCamera && (
                <>
                    {/* Camera Circle - Show when no images */}
                    {images.length === 0 && (
                        <div className="w-48 h-48 md:w-56 md:h-56 mx-auto mb-8 bg-white/10 rounded-full flex items-center justify-center border-4 border-white/20">
                            <Camera className="w-20 h-20 md:w-24 md:h-24 text-white" />
                        </div>
                    )}

                    {/* Image Grid Preview */}
                    {images.length > 0 && (
                        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                            {images.map((preview, i) => (
                                <div key={i} className="relative aspect-square">
                                    <img
                                        src={preview}
                                        alt={`Captured image ${i + 1}`}
                                        className="w-full h-full object-cover rounded-xl border-2 border-white/20"
                                    />
                                    <button
                                        onClick={() => removeImage(i)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                                        aria-label={`Remove image ${i + 1}`}
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                    <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                                        {i + 1}/{maxImages}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-4 max-w-sm mx-auto">
                        <button
                            onClick={startCamera}
                            disabled={images.length >= maxImages}
                            className="w-full bg-white text-[#0F4C81] py-4 px-6 rounded-xl font-semibold text-base hover:bg-gray-100 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Tap to Open Camera
                        </button>

                        <label className="block w-full">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleGallery}
                                className="hidden"
                                disabled={images.length >= maxImages}
                            />
                            <div className={`w-full border-2 border-white/40 text-white/90 py-3.5 px-6 rounded-xl text-center cursor-pointer hover:bg-white/10 transition-all font-medium flex items-center justify-center gap-2 ${images.length >= maxImages ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <Upload className="w-5 h-5" />
                                Choose from Gallery
                            </div>
                        </label>
                    </div>

                    {/* Upload instruction */}
                    {images.length === 0 && (
                        <p className="text-center text-white/60 text-sm mt-6">
                            Upload up to {maxImages} images for accurate results
                        </p>
                    )}

                    {/* Image Counter */}
                    <p className="text-center text-white/60 text-xs md:text-sm font-medium">
                        {images.length} / {maxImages} images
                    </p>
                </>
            )}
        </div>
    )
}
