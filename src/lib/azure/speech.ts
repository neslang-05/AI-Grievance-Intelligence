import * as sdk from 'microsoft-cognitiveservices-speech-sdk'

const speechKey = process.env.AZURE_SPEECH_KEY!
const speechRegion = process.env.AZURE_SPEECH_REGION!

export async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion)

    // Set language to English (India)
    speechConfig.speechRecognitionLanguage = 'en-IN'

    // Create audio config from buffer - convert to ArrayBuffer properly
    const pushStream = sdk.AudioInputStream.createPushStream()
    const arrayBuffer = new Uint8Array(audioBuffer).buffer
    pushStream.write(arrayBuffer)
    pushStream.close()

    const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream)
    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig)

    let transcript = ''

    recognizer.recognized = (_s, e) => {
      if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
        transcript += e.result.text + ' '
      }
    }

    recognizer.canceled = (_s, e) => {
      const errorDetails = e.errorDetails || e.errorCode || 'Unknown error'
      const reason = e.reason ? sdk.CancellationReason[e.reason] : 'Unknown reason'
      console.error(`Speech recognition canceled: ${reason} - ${errorDetails}`)
      recognizer.close()

      // If no speech was detected or it was intentionally stopped, return empty transcript
      if (e.reason === sdk.CancellationReason.EndOfStream || transcript.trim()) {
        resolve(transcript.trim())
      } else {
        reject(new Error(`Speech recognition failed: ${reason} - ${errorDetails}`))
      }
    }

    recognizer.sessionStopped = () => {
      recognizer.close()
      resolve(transcript.trim())
    }

    recognizer.startContinuousRecognitionAsync(
      () => {
        setTimeout(() => {
          recognizer.stopContinuousRecognitionAsync()
        }, 30000) // 30 second timeout
      },
      (err: unknown) => {
        recognizer.close()
        reject(new Error(`Failed to start recognition: ${String(err)}`))
      }
    )
  })
}
