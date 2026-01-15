'use client'

import { useState, useRef } from 'react'
import { Camera, Mic, MapPin, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { submitComplaint } from '@/app/actions/complaint.actions'
import { motion } from 'framer-motion'

export default function ComplaintForm() {
  const [text, setText] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [manualLocation, setManualLocation] = useState('')
  const [ward, setWard] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<any>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Get GPS location
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.error('Error getting location:', error)
          alert('Unable to get location. Please enter manually.')
        }
      )
    }
  }

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files)
      setImages([...images, ...newImages])
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  // Voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setVoiceBlob(audioBlob)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Unable to access microphone')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  // Submit complaint
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setResult(null)

    try {
      const formData = new FormData()

      if (text) formData.append('text', text)
      if (voiceBlob) formData.append('voice', voiceBlob, 'recording.webm')
      images.forEach((image) => formData.append('images', image))
      if (location) {
        formData.append('locationLat', location.lat.toString())
        formData.append('locationLng', location.lng.toString())
      }
      if (manualLocation) formData.append('manualLocation', manualLocation)
      if (ward) formData.append('ward', ward)

      const response = await submitComplaint(formData)
      setResult(response)

      if (response.success) {
        // Reset form
        setText('')
        setImages([])
        setVoiceBlob(null)
        setManualLocation('')
        setWard('')
      }
    } catch (error) {
      console.error('Submit error:', error)
      setResult({ success: false, message: 'Failed to submit complaint' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Submit Your Complaint</CardTitle>
          <CardDescription>
            Tell us about the civic issue. You can use text, voice, or images - or all three!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Input Tabs */}
            <Tabs defaultValue="text" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="text">Text</TabsTrigger>
                <TabsTrigger value="voice">Voice</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="space-y-4">
                <div>
                  <Label htmlFor="text">Describe the issue</Label>
                  <Textarea
                    id="text"
                    placeholder="Describe the civic issue you're facing..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={5}
                    className="mt-2"
                  />
                </div>
              </TabsContent>

              <TabsContent value="voice" className="space-y-4">
                <div className="flex flex-col items-center gap-4 p-6 border rounded-lg">
                  {!voiceBlob ? (
                    <>
                      <Button
                        type="button"
                        variant={isRecording ? 'destructive' : 'default'}
                        size="lg"
                        onClick={isRecording ? stopRecording : startRecording}
                      >
                        <Mic className="mr-2 h-5 w-5" />
                        {isRecording ? 'Stop Recording' : 'Start Recording'}
                      </Button>
                      {isRecording && (
                        <motion.div
                          className="text-red-500 font-medium"
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                          Recording...
                        </motion.div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="text-green-600">✓ Voice recorded</div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setVoiceBlob(null)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="images" className="space-y-4">
                <div>
                  <Label>Upload Images</Label>
                  <div className="mt-2 flex flex-col gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Choose Images
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />

                    {images.length > 0 && (
                      <div className="grid grid-cols-3 gap-4">
                        {images.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6"
                              onClick={() => removeImage(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Location */}
            <div className="space-y-4 border-t pt-6">
              <Label>Location (Optional but recommended)</Label>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleGetLocation}>
                  <MapPin className="mr-2 h-4 w-4" />
                  Use GPS
                </Button>
                {location && (
                  <div className="text-sm text-green-600 flex items-center">
                    ✓ Location captured
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="manualLocation">Location/Landmark</Label>
                  <Input
                    id="manualLocation"
                    placeholder="e.g., Near City Hospital"
                    value={manualLocation}
                    onChange={(e) => setManualLocation(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="ward">Ward (if known)</Label>
                  <Input
                    id="ward"
                    placeholder="e.g., Ward 12"
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isSubmitting || (!text && !voiceBlob && images.length === 0)}
            >
              {isSubmitting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                >
                  Processing...
                </motion.div>
              ) : (
                'Submit Complaint'
              )}
            </Button>
          </form>

          {/* Result */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-6 p-4 rounded-lg ${result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}
            >
              {result.success ? (
                <div className="space-y-2">
                  <h3 className="font-semibold">Complaint Submitted Successfully!</h3>
                  <p className="text-sm">ID: {result.complaintId}</p>
                  <p className="text-sm">Department: {result.department}</p>
                  <p className="text-sm">Priority: {result.priority}</p>
                  <p className="mt-2">{result.summary}</p>
                </div>
              ) : (
                <div>
                  <h3 className="font-semibold">Submission Failed</h3>
                  <p className="text-sm mt-1">{result.message}</p>
                </div>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
