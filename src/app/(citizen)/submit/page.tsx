'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ComplaintForm from '@/components/complaint/ComplaintForm'

export default function SubmitPage() {
    const router = useRouter()
    const [images, setImages] = useState<string[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // 🎯 Load images from sessionStorage (set by home page)
        const storedImages = sessionStorage.getItem('complaint-images-data')

        if (!storedImages) {
            // Redirect back to home if no images found
            router.push('/')
            return
        }

        try {
            const parsedImages = JSON.parse(storedImages)
            if (!Array.isArray(parsedImages) || parsedImages.length === 0) {
                router.push('/')
                return
            }
            setImages(parsedImages)
        } catch (error) {
            console.error('Error parsing stored images:', error)
            router.push('/')
            return
        }

        setLoading(false)
    }, [router])

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F4C81] mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <div className="py-8 md:py-12">
                <div className="container px-4 mx-auto max-w-3xl">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-[#0B3C5D] mb-3">Complete Your Report</h1>
                        <p className="text-gray-600 max-w-xl mx-auto">
                            Add details to your complaint. Our AI will analyze and route it to the right department.
                        </p>
                    </div>
                    <ComplaintForm preloadedImages={images} />
                </div>
            </div>
        </div>
    )
}
