'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/shared/Sidebar'
import UserAvatar from '@/components/shared/UserAvatar'
import MobileMenu from '@/components/shared/MobileMenu'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface AppShellProps {
    user: any
    profile: any
    children: React.ReactNode
}

export default function AppShell({ user, profile, children }: AppShellProps) {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const pathname = usePathname()

    // Sidebar should only be visible on officer dashboard and profile pages
    const showSidebar = pathname?.startsWith('/dashboard') || pathname?.startsWith('/profile')

    return (
        <div className="flex min-h-screen">
            {showSidebar && (
                <Sidebar 
                    user={user} 
                    profile={profile} 
                    isCollapsed={isCollapsed} 
                    onToggle={() => setIsCollapsed(!isCollapsed)} 
                />
            )}
            
            <div className={cn(
                "flex-1 flex flex-col min-w-0 transition-[padding] duration-300 ease-in-out",
                showSidebar ? (isCollapsed ? "lg:pl-20" : "lg:pl-64") : "pl-0"
            )}>
                <header className={cn(
                    "h-16 flex items-center px-4 md:px-8 bg-white/70 backdrop-blur-xl sticky top-0 z-40 border-b border-gray-100/50 shadow-sm transition-all",
                    showSidebar ? "lg:justify-end justify-between" : "justify-between"
                )}>
                    {(!showSidebar || true) && (
                        <div className={cn(
                            "flex items-center gap-8",
                            showSidebar && "lg:hidden"
                        )}>
                            <Link href="/" className="flex items-center gap-3 group">
                                <img src="/favicon.svg" alt="UnityDesk" className="w-10 h-10 object-contain transition-transform group-hover:scale-105" />
                                <span className="font-bold text-xl text-[#0B3C5D] tracking-tight">UnityDesk</span>
                            </Link>
                            
                            {!showSidebar && (
                                <nav className="hidden md:flex items-center gap-6">
                                    <Link href="/about" className="text-sm font-semibold text-gray-500 hover:text-[#0B3C5D] transition-colors">
                                        About
                                    </Link>
                                    <Link href="/status" className="text-sm font-semibold text-gray-500 hover:text-[#0B3C5D] transition-colors">
                                        Track Status
                                    </Link>
                                </nav>
                            )}
                        </div>
                    )}
                    <div className="flex items-center gap-4">
                        {!showSidebar && (
                            <Link href="/new-submit" className="hidden sm:flex">
                                <Button size="sm" className="bg-[#0B3C5D] hover:bg-[#0F4C81] text-white rounded-none px-5 font-semibold">
                                    Report Issue
                                </Button>
                            </Link>
                        )}
                        <UserAvatar user={user} profile={profile} />
                        <MobileMenu user={user} profile={profile} />
                    </div>
                </header>
                <main className="flex-1 overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    )
}

