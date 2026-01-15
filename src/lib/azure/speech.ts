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
      console.error(`Speech recognition canceled: ${e.errorDetails}`)
      recognizer.close()
      reject(new Error(`Speech recognition failed: ${e.errorDetails}`))
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
      (err) => {
        recognizer.close()
        reject(new Error(`Failed to start recognition: ${err}`))
      }
    )
  })
}
