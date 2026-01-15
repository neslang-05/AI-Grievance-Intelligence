import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { signOut } from '@/lib/supabase/auth-helpers'
import MobileMenu from './MobileMenu'

export default async function TopNav() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let profile = null
    if (user) {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
        profile = data
    }

    return (
        <nav className="border-b bg-white">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo only - no text */}
                <Link href="/" className="flex items-center">
                    <img src="/favicon.svg" alt="UnityDesk" className="w-10 h-10" />
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-4">
                    <Link href="/submit" className="text-sm font-medium hover:text-[#0F4C81] transition-colors">
                        Submit
                    </Link>
                    <Link href="/status" className="text-sm font-medium hover:text-[#0F4C81] transition-colors">
                        Status
                    </Link>
                    {user ? (
                        <>
                            <Link href="/my-complaints" className="text-sm font-medium hover:text-[#0F4C81] transition-colors">
                                My Complaints
                            </Link>
                            {(profile?.role === 'OFFICER' || profile?.role === 'ADMIN') && (
                                <Link href="/dashboard" className="text-sm font-medium hover:text-[#0F4C81] transition-colors">
                                    Dashboard
                                </Link>
                            )}
                            <div className="flex items-center gap-3 ml-4">
                                <span className="text-xs text-gray-500 hidden lg:block">
                                    {profile?.full_name || user.email}
                                </span>
                                <form action="/api/auth/signout" method="POST">
                                    <Button variant="ghost" size="icon" type="submit">
                                        <LogOut className="h-4 w-4" />
                                    </Button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <Button asChild variant="outline" size="sm">
                            <Link href="/login">Officer Login</Link>
                        </Button>
                    )}
                </div>

                {/* Mobile Menu */}
                <MobileMenu user={user} profile={profile} />
            </div>
        </nav>
    )
}
