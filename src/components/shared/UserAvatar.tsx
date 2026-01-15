'use client'

import { User } from '@supabase/supabase-js'

interface UserAvatarProps {
    user: User | null
    profile: any
}

export default function UserAvatar({ user, profile }: UserAvatarProps) {
    if (!user) return null

    const initial = profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'
    const avatarUrl = profile?.avatar_url

    return (
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 p-1.5 pr-4 rounded-none transition-all hover:bg-white/20">
            <div className="w-10 h-10 rounded-none overflow-hidden border-2 border-white/30 flex items-center justify-center bg-white shadow-sm">
                {avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt={profile?.full_name || 'User'}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <img
                        src="/favicon.svg"
                        alt="Default Avatar"
                        className="w-6 h-6"
                    />
                )}
            </div>
            <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-800 leading-tight">
                    {profile?.full_name || 'Guest User'}
                </span>
                <span className="text-[10px] text-gray-500 font-medium">
                    {profile?.role || 'CITIZEN'}
                </span>
            </div>
        </div>
    )
}

