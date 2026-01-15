'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(data: {
    fullName: string
    phone: string
    department: string
    avatarUrl?: string
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Not authenticated' }

    const { error } = await supabase
        .from('profiles')
        .update({
            full_name: data.fullName,
            phone: data.phone,
            department: data.department,
            avatar_url: data.avatarUrl,
            updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/')
    revalidatePath('/profile')
    return { success: true }
}
