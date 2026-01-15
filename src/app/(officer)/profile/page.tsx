import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileForm from '@/components/profile/ProfileForm'

export default async function ProfilePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // Optionally check for officer role
    if (profile?.role !== 'OFFICER' && profile?.role !== 'ADMIN') {
        // redirect('/') 
        // Allowing citizen to edit profile too for now as it's a generic profile
    }

    return <ProfileForm user={user} profile={profile} />
}
