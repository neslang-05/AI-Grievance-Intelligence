'use server'

import { createClient } from '@/lib/supabase/server'
import { requireOfficer } from '@/lib/supabase/auth-helpers'
import { 
  generatePolicyRecommendations, 
  simulateSocialSignals, 
  SocialSignal, 
  PolicyRecommendation 
} from '@/lib/ai/intelligence'

/**
 * Get aggregated analytics data from complaints
 */
export async function getAnalyticsData() {
  try {
    await requireOfficer()
    const supabase = await createClient()

    // 1. Department Distribution count
    const { data: deptData, error: deptError } = await supabase
      .from('complaints')
      .select('ai_department')

    if (deptError) throw deptError

    const departmentCounts = deptData.reduce((acc: any, curr) => {
      const dept = curr.ai_department
      acc[dept] = (acc[dept] || 0) + 1
      return acc
    }, {})

    const departmentRes = Object.entries(departmentCounts).map(([name, value]) => ({
      name,
      value: value as number
    }))

    // 2. Priority breakdown
    const { data: priorityData, error: priError } = await supabase
      .from('complaints')
      .select('ai_priority')

    if (priError) throw priError

    const priorities = ['high', 'medium', 'low']
    const priorityRes = priorities.map(p => ({
      name: p.charAt(0).toUpperCase() + p.slice(1),
      value: priorityData.filter(d => d.ai_priority === p).length
    }))

    // 3. Status breakdown
    const { data: statusData, error: statError } = await supabase
      .from('complaints')
      .select('status')

    if (statError) throw statError

    const statuses = ['pending', 'in_progress', 'resolved', 'rejected']
    const statusRes = statuses.map(s => ({
      name: s.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      value: statusData.filter(d => d.status === s).length
    }))

    return {
      success: true,
      data: {
        byDepartment: departmentRes,
        byPriority: priorityRes,
        byStatus: statusRes
      }
    }
  } catch (error) {
    console.error('Analytics error:', error)
    return { success: false, message: 'Failed to fetch analytics' }
  }
}

/**
 * Get social media posts/signals
 */
export async function getSocialPosts() {
  try {
    await requireOfficer()
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('social_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error

    return { success: true, posts: data }
  } catch (error) {
    console.error('Social posts error:', error)
    return { success: false, message: 'Failed to fetch social posts' }
  }
}

/**
 * Trigger Social Listening Simulation (to show real-time "working" feature)
 */
export async function triggerSocialIngest() {
  try {
    await requireOfficer()
    const supabase = await createClient()

    // Get current complaints to context-set the simulation
    const { data: complaints } = await supabase
      .from('complaints')
      .select('ai_issue_type, ai_department')
      .limit(5)

    const newPosts: SocialSignal[] = await simulateSocialSignals(complaints || [])
    
    if (!newPosts || newPosts.length === 0) {
      return { success: true, posts: [] }
    }

    const { data, error } = await supabase
      .from('social_posts')
      .insert(newPosts.map((post: SocialSignal) => ({
        platform: post.platform,
        author_handle: post.handle,
        author_name: post.name,
        content: post.content,
        sentiment: post.sentiment,
        sentiment_score: post.sentimentScore,
        ai_processed_content: post.metadata
      })))
      .select()

    if (error) throw error

    return { success: true, posts: data }
  } catch (error) {
    console.error('Social ingest error:', error)
    return { success: false, message: 'Failed to ingest social posts' }
  }
}

/**
 * Get AI-generated policy recommendations
 */
export async function getIntelligencePolicy() {
  try {
    await requireOfficer()
    const supabase = await createClient()

    // Aggregate recent data to guide the AI
    const { data: recentComplaints } = await supabase
      .from('complaints')
      .select('ai_issue_type, ai_department, ai_summary, ai_priority, created_at')
      .order('created_at', { ascending: false })
      .limit(20)

    const recommendations: PolicyRecommendation[] = await generatePolicyRecommendations(recentComplaints || [])

    return { success: true, recommendations }
  } catch (error) {
    console.error('Policy intelligence error:', error)
    return { success: false, message: 'Failed to generate policy recommendations' }
  }
}
