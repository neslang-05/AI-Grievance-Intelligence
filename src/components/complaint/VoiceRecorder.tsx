'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import * as sdk from 'microsoft-cognitiveservices-speech-sdk'
import { Mic, Square, Loader2, Volume2, VolumeX, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

interface VoiceRecorderProps {
  onTranscriptionComplete: (text: string) => void
  onRecordingStateChange?: (isRecording: boolean) => void
}

export default function VoiceRecorder({
  onTranscriptionComplete,
  onRecordingStateChange,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [finalTranscript, setFinalTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [finalTranslation, setFinalTranslation] = useState('')
  const [interimTranslation, setInterimTranslation] = useState('')
  const [displayLang, setDisplayLang] = useState('')
  const [isSynthesizing, setIsSynthesizing] = useState(false)
  const [volumeLevel, setVolumeLevel] = useState(0)

  const recognizerRef = useRef<any>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  const fullTranscript = `${finalTranscript}${finalTranscript && interimTranscript ? ' ' : ''}${interimTranscript}`

  // Start Voice Recognition
  const startRecording = async () => {
    try {
      // Get token from our API
      const tokenRes = await fetch('/api/speech/token')
      const { token, region } = await tokenRes.json()

      if (!token) throw new Error('Could not get speech token')

      // Use translation recognizer to provide live translated text
      const speechConfig = sdk.SpeechTranslationConfig.fromAuthorizationToken(token, region)
      // Prefer user's browser language as target translation language
      const userLang = (navigator.language || 'en').split('-')[0]
      setDisplayLang(userLang)
      // Source speech language (adjust as needed)
      speechConfig.speechRecognitionLanguage = 'en-IN'
      // Add target language (user's UI locale)
      try {
        // addTargetLanguage may not exist on older typings, but SDK exposes it at runtime
        // @ts-ignore
        speechConfig.addTargetLanguage(userLang)
      } catch (err) {
        // fallback: nothing
      }

      const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput()
      const recognizer: any = new sdk.TranslationRecognizer(speechConfig, audioConfig)

      const getTranslationText = (translations: any, lang: string) => {
        if (!translations) return ''
        if (typeof translations.get === 'function') return translations.get(lang) || ''
        return translations[lang] || ''
      }

      recognizer.recognizing = (_s: any, e: any) => {
        setInterimTranscript(e.result.text)
        const t = getTranslationText(e.result.translations, userLang)
        setInterimTranslation(t)
      }

      recognizer.recognized = (_s: any, e: any) => {
        // Update final transcript
        if (e.result && e.result.text) {
          setFinalTranscript(prev => {
            const newText = prev ? `${prev}. ${e.result.text}` : e.result.text
            return newText
          })
        }
        // Update final translation if available
        const t = getTranslationText(e.result?.translations, userLang)
        if (t) {
          setFinalTranslation(prev => {
            const newT = prev ? `${prev}. ${t}` : t
            return newT
          })
        }
        setInterimTranscript('')
        setInterimTranslation('')
      }

      recognizerRef.current = recognizer

      recognizer.startContinuousRecognitionAsync(
        () => {
          setIsRecording(true)
          onRecordingStateChange?.(true)
          startVolumeAnalysis()
        },
        (err: unknown) => {
          console.error(err)
          toast.error('Failed to start microphone')
        }
      )
    } catch (error) {
      console.error(error)
      toast.error('Could not access microphone or speech services')
    }
  }

  // Stop Voice Recognition
  const stopRecording = useCallback(() => {
    if (recognizerRef.current) {
      recognizerRef.current.stopContinuousRecognitionAsync(
        () => {
          setIsRecording(false)
          onRecordingStateChange?.(false)
          onTranscriptionComplete(fullTranscript)
          stopVolumeAnalysis()
          recognizerRef.current?.close()
          recognizerRef.current = null
        },
        (err: unknown) => {
          console.error(err)
          setIsRecording(false)
        }
      )
    }
  }, [fullTranscript, onRecordingStateChange, onTranscriptionComplete])

  // Volume analysis for visual feedback
  const startVolumeAnalysis = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const audioContext = new AudioContext()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)

      audioContextRef.current = audioContext
      analyserRef.current = analyser

      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      const updateVolume = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray)
          const average = dataArray.reduce((a, b) => a + b) / bufferLength
          setVolumeLevel(average)
          animationFrameRef.current = requestAnimationFrame(updateVolume)
        }
      }
      updateVolume()
    } catch (err) {
      console.error('Visualizer error:', err)
    }
  }

  const stopVolumeAnalysis = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    if (audioContextRef.current) audioContextRef.current.close()
    setVolumeLevel(0)
  }

  // Text to Speech (feedback)
  const speakText = async (text: string) => {
    if (!text) return
    setIsSynthesizing(true)
    try {
      const tokenRes = await fetch('/api/speech/token')
      const { token, region } = await tokenRes.json()

      const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(token, region)
      speechConfig.speechSynthesisVoiceName = 'en-IN-NeerjaNeural'

      const audioConfig = sdk.AudioConfig.fromDefaultSpeakerOutput()
      const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig)

      synthesizer.speakTextAsync(
        text,
        (result) => {
          setIsSynthesizing(false)
          synthesizer.close()
        },
        (err: unknown) => {
          console.error(err)
          setIsSynthesizing(false)
          synthesizer.close()
        }
      )
    } catch (error) {
      console.error(error)
      setIsSynthesizing(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 md:gap-8 p-5 md:p-8 bg-white/50 backdrop-blur-xl rounded-3xl md:rounded-[2.5rem] border border-white shadow-2xl">
      <div className="relative">
        {/* Animated Rings for Volume */}
        <AnimatePresence>
          {isRecording && (
            <>
              <motion.div
                className="absolute inset-0 rounded-full bg-blue-400/20"
                initial={{ scale: 1 }}
                animate={{ scale: 1 + (volumeLevel / 50) }}
                transition={{ duration: 0.1 }}
              />
              <motion.div
                className="absolute inset-0 rounded-full bg-blue-400/10"
                initial={{ scale: 1 }}
                animate={{ scale: 1.5 + (volumeLevel / 30) }}
                transition={{ duration: 0.2 }}
              />
            </>
          )}
        </AnimatePresence>

        <Button
          size="lg"
          className={`relative z-10 w-24 h-24 rounded-full transition-all duration-500 shadow-xl ${isRecording
            ? 'bg-red-500 hover:bg-red-600'
            : 'bg-[#0B3C5D] hover:bg-[#0F4C81]'
            }`}
          onClick={isRecording ? stopRecording : startRecording}
        >
          {isRecording ? (
            <Square className="w-8 h-8 text-white fill-white" />
          ) : (
            <Mic className="w-10 h-10 text-white" />
          )}
        </Button>
      </div>

      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-[#0B3C5D]">
          {isRecording ? 'Listening...' : 'Tap Mic to Speak'}
        </h3>
        <p className="text-gray-500 font-medium">
          {isRecording
            ? 'Tell us about the civic issue in detail'
            : 'Record your complaint naturally'}
        </p>
      </div>

      {/* Real-time Transcript Bubble */}
      <AnimatePresence>
        {(fullTranscript || isRecording) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="w-full max-w-md p-6 bg-blue-50/50 rounded-3xl border border-blue-100 italic text-gray-700 min-h-[100px] relative"
          >
            <MessageSquare className="absolute -top-3 -left-3 text-blue-400 w-8 h-8" />
            <p className="leading-relaxed">
              {fullTranscript}
              {isRecording && !interimTranscript && !finalTranscript && "Speak now..."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Translation Bubble */}
      <AnimatePresence>
        {(finalTranslation || interimTranslation || isRecording) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="w-full max-w-md p-4 bg-green-50/50 rounded-3xl border border-green-100 text-gray-700 min-h-[60px] relative"
          >
            <div className="text-sm text-green-600 font-medium -mb-1">
              {displayLang ? `Live translation (${displayLang})` : 'Live translation'}
            </div>
            <p className="leading-relaxed mt-1">
              {finalTranslation}{finalTranslation && interimTranslation ? ' ' : ''}{interimTranslation}
              {isRecording && !interimTranslation && !finalTranslation && ' Translating...'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-4">
        {fullTranscript && !isRecording && (
          <>
            <Button
              variant="outline"
              onClick={() => speakText(fullTranscript)}
              disabled={isSynthesizing}
              className="rounded-xl"
            >
              {isSynthesizing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Volume2 className="w-4 h-4 mr-2" />
              )}
              Playback
            </Button>
            <Button
              onClick={() => onTranscriptionComplete(fullTranscript)}
              className="bg-[#0B3C5D] rounded-xl px-8"
            >
              Submit Transcript
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
