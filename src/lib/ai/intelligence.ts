import { generateStructuredCompletion } from '@/lib/azure/openai'

export interface PolicyRecommendation {
  id: string
  title: string
  insight: string
  recommendation: string
  impact: 'high' | 'medium'
  department: string
}

export interface SocialSignal {
  platform: 'twitter' | 'facebook' | 'reddit' | 'instagram'
  handle: string
  name: string
  content: string
  sentiment: 'positive' | 'neutral' | 'negative'
  sentimentScore: number
  metadata: any
}

/**
 * Generate policy recommendations based on recent complaint data
 */
export async function generatePolicyRecommendations(recentComplaints: any[]): Promise<PolicyRecommendation[]> {
  const systemPrompt = `You are a Senior Policy Analyst for a Smart City Management system.
  Your task is to analyze a list of recent citizen grievances and propose 1-2 high-impact policy recommendations.
  Each recommendation should include:
  - id: A short unique identifier
  - title: A concise, impactful title
  - insight: The data-driven reasoning based on the complaints provided
  - recommendation: The proposed policy or operational change
  - impact: 'high' or 'medium'
  - department: The primary department responsible`

  const userPrompt = `Analysis Data (Recent Complaints):
  ${JSON.stringify(recentComplaints.slice(0, 20), null, 2)}`

  const schema = `{
    "recommendations": [
      {
        "id": "string",
        "title": "string",
        "insight": "string",
        "recommendation": "string",
        "impact": "high | medium",
        "department": "string"
      }
    ]
  }`

  try {
    const result = await generateStructuredCompletion<{ recommendations: PolicyRecommendation[] }>(
      systemPrompt, 
      userPrompt, 
      schema
    )
    return result.recommendations || []
  } catch (error) {
    console.error('Failed to generate policy recommendations:', error)
    return []
  }
}

/**
 * Simulate social media signals to show real-time "working" feature
 */
export async function simulateSocialSignals(complaints: any[]): Promise<SocialSignal[]> {
  const systemPrompt = `You are an AI Social Listening Agent.
  Your task is to generate 3-5 simulated social media posts (Twitter-style or Facebook-style) that would appear in a city's feed based on recent civic issues.
  The posts should feel realistic, reflecting common citizen frustrations or observations.
  Vary the sentiment and the platform.`

  const userPrompt = `Reference Civic Issues (to guide post content):
  ${JSON.stringify(complaints, null, 2)}`

  const schema = `{
    "posts": [
      {
        "platform": "twitter | facebook | reddit",
        "handle": "string (e.g. @citizen123)",
        "name": "string (e.g. John Doe)",
        "content": "string",
        "sentiment": "positive | neutral | negative",
        "sentimentScore": "number (0-1)",
        "metadata": "object"
      }
    ]
  }`

  try {
    const result = await generateStructuredCompletion<{ posts: SocialSignal[] }>(
      systemPrompt, 
      userPrompt, 
      schema
    )
    return result.posts || []
  } catch (error) {
    console.error('Failed to simulate social signals:', error)
    return []
  }
}
