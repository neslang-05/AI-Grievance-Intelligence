import { createClient } from './server'

export async function getComplaintsQuery(filters?: {
    status?: string
    department?: string
    priority?: string
    userId?: string
}) {
    const supabase = await createClient()
    let query = supabase.from('complaints').select('*').order('created_at', { ascending: false })

    if (filters?.userId) {
        query = query.eq('user_id', filters.userId)
    }
    if (filters?.status) {
        query = query.eq('status', filters.status)
    }
    if (filters?.department) {
        query = query.eq('ai_department', filters.department)
    }
    if (filters?.priority) {
        query = query.eq('ai_priority', filters.priority)
    }

    return query
}

export async function getComplaintByIdQuery(id: string) {
    const supabase = await createClient()
    return supabase.from('complaints').select('*').eq('id', id).single()
}

export async function getProfileQuery(id: string) {
    const supabase = await createClient()
    return supabase.from('profiles').select('*').eq('id', id).single()
}
