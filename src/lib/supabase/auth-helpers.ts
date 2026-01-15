import { createClient } from './server'
import { UserProfile, AuthUser } from '@/types'

export async function getCurrentUser(): Promise<AuthUser | null> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return {
        id: user.id,
        email: user.email!,
        role: profile?.role || 'CITIZEN',
        profile: profile as UserProfile
    }
}

export async function requireOfficer() {
    const user = await getCurrentUser()

    if (!user || (user.role !== 'OFFICER' && user.role !== 'ADMIN')) {
        throw new Error('Unauthorized: Officer access required')
    }

    return user
}

export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
}
