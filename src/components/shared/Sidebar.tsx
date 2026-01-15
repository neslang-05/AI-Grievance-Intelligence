'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
    LayoutDashboard, 
    PlusCircle, 
    Search, 
    UserCircle, 
    LogOut, 
    ChevronLeft, 
    ChevronRight,
    Headset,
    Home
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
    user: any
    profile: any
    isCollapsed: boolean
    onToggle: () => void
}

export default function Sidebar({ user, profile, isCollapsed, onToggle }: SidebarProps) {
    const pathname = usePathname()

    const navItems = [
        {
            label: 'Home',
            icon: Home,
            href: '/',
            roles: ['CITIZEN', 'OFFICER', 'ADMIN']
        },
        {
            label: 'Submit Complaint',
            icon: PlusCircle,
            href: '/new-submit',
            roles: ['CITIZEN', 'OFFICER', 'ADMIN']
        },
        {
            label: 'Check Status',
            icon: Search,
            href: '/status',
            roles: ['CITIZEN', 'OFFICER', 'ADMIN']
        },
        {
            label: 'My Complaints',
            icon: Headset,
            href: '/my-complaints',
            roles: ['CITIZEN', 'OFFICER', 'ADMIN']
        },
        {
            label: 'Dashboard',
            icon: LayoutDashboard,
            href: '/dashboard',
            roles: ['OFFICER', 'ADMIN']
        },
        {
            label: 'Profile Settings',
            icon: UserCircle,
            href: '/profile',
            roles: ['OFFICER', 'ADMIN']
        }
    ]

    const filteredItems = navItems.filter(item => {
        if (!user) {
            return item.href === '/' || item.href === '/status' || item.href === '/new-submit'
        }
        return item.roles.includes(profile?.role || 'CITIZEN')
    })

    return (
        <aside 
            className={cn(
                "fixed left-0 top-0 z-50 h-screen transition-all duration-300 ease-in-out border-r bg-white/90 backdrop-blur-xl flex flex-col shadow-2xl",
                isCollapsed ? "w-20" : "w-64"
            )}
        >
            {/* Logo Section */}
            <div className="p-6 flex items-center justify-between">
                {!isCollapsed && (
                    <Link href="/" className="flex items-center gap-3 animate-in fade-in duration-500">
                        <img src="/favicon.svg" alt="UnityDesk" className="w-12 h-12 object-contain transform transition hover:scale-105" />
                        <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#0B3C5D] to-[#0F4C81]">
                            UnityDesk
                        </span>
                    </Link>
                )}
                {isCollapsed && (
                    <div className="mx-auto">
                        <img src="/favicon.svg" alt="UnityDesk" className="w-10 h-10 object-contain" />
                    </div>
                )}
            </div>

            {/* Collapse Toggle */}
            <button 
                onClick={onToggle}
                className="absolute -right-3 top-20 bg-white border rounded-full p-1 shadow-md hover:bg-gray-50 transition-colors z-50 mt-4"
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {/* Navigation Items */}
            <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto mt-8">
                {filteredItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link 
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                                isActive 
                                    ? "bg-[#0F4C81] text-white shadow-lg shadow-[#0F4C81]/20" 
                                    : "text-gray-600 hover:bg-gray-100/80 hover:text-[#0F4C81]"
                            )}
                        >
                            <item.icon size={22} className={cn(
                                "transition-transform group-hover:scale-110",
                                isActive ? "text-white" : "text-gray-400 group-hover:text-[#0F4C81]"
                            )} />
                            {!isCollapsed && (
                                <span className="font-medium text-sm whitespace-nowrap">
                                    {item.label}
                                </span>
                            )}
                            {isActive && !isCollapsed && (
                                <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* Bottom Section */}
            <div className="p-4 border-t border-gray-100">
                {user ? (
                    <form action="/api/auth/signout" method="POST">
                        <button 
                            type="submit"
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-red-500 hover:bg-red-50 group",
                                isCollapsed && "justify-center"
                            )}
                        >
                            <LogOut size={22} className="transition-transform group-hover:-translate-x-1" />
                            {!isCollapsed && (
                                <span className="font-semibold text-sm">Sign Out</span>
                            )}
                        </button>
                    </form>
                ) : (
                    <Link 
                        href="/login"
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-[#0F4C81] hover:bg-[#0F4C81]/5",
                            isCollapsed && "justify-center"
                        )}
                    >
                        <UserCircle size={22} />
                        {!isCollapsed && (
                            <span className="font-semibold text-sm">Officer Login</span>
                        )}
                    </Link>
                )}
            </div>
        </aside>
    )
}

