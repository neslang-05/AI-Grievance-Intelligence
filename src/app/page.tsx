import ComplaintForm from '@/components/complaint/ComplaintForm'

export default function Home() {
    return (
        <div className="py-8">
            <div className="container mx-auto px-4 mb-8">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl font-bold mb-4 text-primary">
                        Your Voice Matters
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        Report civic issues using text, voice, or images. Our AI will understand,
                        categorize, and route your complaint to the right department automatically.
                    </p>
                </div>
            </div>
            <ComplaintForm />
        </div>
    )
}
