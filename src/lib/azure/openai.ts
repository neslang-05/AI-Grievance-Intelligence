import { OpenAIClient, AzureKeyCredential } from '@azure/openai'
import fs from 'fs'
import path from 'path'

// Ensure required env vars are present. If some are missing, try to load them
// from a local `.env` file (only sets values that are currently undefined).
function loadMissingEnvFromDotenv() {
  const keys = ['AZURE_OPENAI_ENDPOINT', 'AZURE_OPENAI_API_KEY', 'AZURE_OPENAI_DEPLOYMENT_NAME']
  const missing = keys.filter((k) => !process.env[k])
  if (missing.length === 0) return

  try {
    const envPath = path.resolve(process.cwd(), '.env')
    if (!fs.existsSync(envPath)) return
    const content = fs.readFileSync(envPath, 'utf8')
    content.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) return
      const eq = trimmed.indexOf('=')
      if (eq === -1) return
      const key = trimmed.slice(0, eq).trim()
      let val = trimmed.slice(eq + 1)
      // strip optional quotes
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1)
      }
      if (!process.env[key]) process.env[key] = val
    })
  } catch (err) {
    // don't crash here; we'll surface missing variables below if still absent
  }
}

loadMissingEnvFromDotenv()

const endpoint = process.env.AZURE_OPENAI_ENDPOINT
const apiKey = process.env.AZURE_OPENAI_API_KEY
const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME

// Validate required environment variables
if (!endpoint || !apiKey || !deploymentName) {
  console.error('❌ Missing Azure OpenAI environment variables:')
  if (!endpoint) console.error('  - AZURE_OPENAI_ENDPOINT')
  if (!apiKey) console.error('  - AZURE_OPENAI_API_KEY')
  if (!deploymentName) console.error('  - AZURE_OPENAI_DEPLOYMENT_NAME')
  throw new Error('Azure OpenAI configuration incomplete. Please check your .env file.')
}

export const azureOpenAIClient = new OpenAIClient(endpoint, new AzureKeyCredential(apiKey))

export async function analyzeImage(imageBase64: string, prompt: string, useHighDetail: boolean = false): Promise<string> {
  console.log('Sending image to Azure OpenAI for analysis...')
  try {
    const response = await azureOpenAIClient.getChatCompletions(
      deploymentName!,
      [
        {
          role: 'user',
          // @ts-ignore
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              imageUrl: {
                url: `data:image/jpeg;base64,${imageBase64}`,
                // Use 'low' detail mode for 3-5x faster processing
                // Only use 'high' for images requiring fine details
                detail: useHighDetail ? 'high' : 'low'
              }
            }
          ],
        },
      ],
      {
        maxTokens: 500,
        // Lower temperature for faster, more deterministic responses
        temperature: 0.1
      }
    )

    const content = response.choices[0]?.message?.content || ''
    console.log('Image analysis successful:', content.substring(0, 50) + '...')
    return content
  } catch (error) {
    console.error('Error analyzing image:', error)
    throw new Error('Failed to analyze image')
  }
}

export async function generateCompletion(
  systemPrompt: string,
  userPrompt: string,
  temperature: number = 0.3
): Promise<string> {
  try {
    const response = await azureOpenAIClient.getChatCompletions(
      deploymentName!,
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      { temperature, maxTokens: 1000 }
    )

    return response.choices[0]?.message?.content || ''
  } catch (error) {
    console.error('Error generating completion:', error)
    throw new Error('Failed to generate AI completion')
  }
}

export async function generateStructuredCompletion<T>(
  systemPrompt: string,
  userPrompt: string,
  schema: string
): Promise<T> {
  const fullPrompt = `${userPrompt}\n\nRespond with valid JSON matching this schema:\n${schema}`

  try {
    const response = await azureOpenAIClient.getChatCompletions(
      deploymentName!,
      [
        { role: 'system', content: systemPrompt + '\n\nYou must respond with valid JSON only, without any markdown formatting or code blocks.' },
        { role: 'user', content: fullPrompt },
      ],
      { temperature: 0.2, maxTokens: 1500 }
    )

    let content = response.choices[0]?.message?.content || '{}'

    // 🐛 Strip markdown code blocks if present
    content = content.trim()
    if (content.startsWith('```json')) {
      content = content.replace(/^```json\s*\n?/, '').replace(/\n?```\s*$/, '')
    } else if (content.startsWith('```')) {
      content = content.replace(/^```\s*\n?/, '').replace(/\n?```\s*$/, '')
    }

    // 🐛 Fix common JSON errors from AI (like using undefined instead of null)
    content = content.replace(/:\s*undefined/g, ': null')

    return JSON.parse(content.trim()) as T
  } catch (error) {
    console.error('Error generating structured completion:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Failed to generate structured AI response: ${errorMessage}`)
  }
}
