'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import CameraCapture from '@/components/citizen/CameraCapture'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export default function Home() {
    const router = useRouter()
    const [images, setImages] = useState<string[]>([])

    const handleImagesChange = (newImages: string[]) => {
        setImages(newImages)
    }

    const handleProceed = () => {
        if (images.length === 0) {
            alert('Please capture at least one image to proceed.')
            return
        }

        // 🎯 Store images in sessionStorage for the submit page
        sessionStorage.setItem('complaint-images-data', JSON.stringify(images))

        // Navigate to submit page
        router.push('/submit')
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0B3C5D] via-[#1A5F7A] to-[#0F4C81] flex flex-col">
            <main className="flex-1 flex items-center justify-center px-4 py-8">
                <div className="w-full max-w-md">
                    {/* Title */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                            Report Your Complaint
                        </h1>
                        <p className="text-white/80 text-sm md:text-base">
                            AI-powered analysis to detect and classify civic issues
                        </p>
                    </div>

                    {/* Camera Capture Component */}
                    <CameraCapture
                        onImagesChange={handleImagesChange}
                        maxImages={5}
                    />

                    {/* Proceed Button */}
                    <div className="mt-8">
                        <Button
                            onClick={handleProceed}
                            disabled={images.length === 0}
                            className={`w-full py-4 rounded-xl font-semibold text-base transition-all flex items-center justify-center gap-2 ${images.length > 0
                                    ? 'bg-white hover:bg-gray-100 text-[#0F4C81] shadow-lg'
                                    : 'bg-white/20 text-white/50 cursor-not-allowed'
                                }`}
                        >
                            Proceed to Submit
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    )
}
