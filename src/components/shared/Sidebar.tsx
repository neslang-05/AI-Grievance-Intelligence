'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { 
    LayoutDashboard, 
    PlusCircle, 
    Search, 
    UserCircle, 
    LogOut, 
    ChevronLeft, 
    ChevronRight,
    Headset,
    Home,
    ShieldCheck,
    BarChart3,
    MapPin,
    MessageSquare,
    Scale,
    ChevronDown
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
    const [isIntelligenceOpen, setIsIntelligenceOpen] = useState(true)

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
            label: 'Operations',
            icon: LayoutDashboard,
            href: '/dashboard',
            roles: ['OFFICER', 'ADMIN']
        },
        {
            label: 'Intelligence Portal',
            icon: ShieldCheck,
            href: '/dashboard/intelligence',
            roles: ['OFFICER', 'ADMIN'],
            isParent: true,
            children: [
                { label: 'Strategic Analytics', href: '/dashboard/analytics', icon: BarChart3 },
                { label: 'Spatial Surveillance', href: '/dashboard/spatial', icon: MapPin },
                { label: 'Social Listening', href: '/dashboard/social', icon: MessageSquare },
                { label: 'Policy Intelligence', href: '/dashboard/policy', icon: Scale },
            ]
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
                "fixed left-0 top-0 z-50 h-screen transition-all duration-300 ease-in-out border-r bg-white/90 backdrop-blur-xl hidden lg:flex flex-col shadow-2xl",
                isCollapsed ? "w-20" : "w-64"
            )}
        >
            {/* Logo Section */}
            <div className="p-6 flex items-center justify-between border-b border-gray-100">
                {!isCollapsed && (
                    <Link href="/" className="flex items-center gap-3 animate-in fade-in duration-500">
                        <img src="/favicon.svg" alt="UnityDesk" className="w-10 h-10 object-contain transform transition hover:scale-105" />
                        <span className="font-bold text-lg tracking-tight text-[#0B3C5D]">
                            UnityDesk
                        </span>
                    </Link>
                )}
                {isCollapsed && (
                    <div className="mx-auto">
                        <img src="/favicon.svg" alt="UnityDesk" className="w-8 h-8 object-contain" />
                    </div>
                )}
                <button 
                    onClick={onToggle}
                    className="p-1.5 hover:bg-gray-100 rounded-none transition-colors text-gray-400"
                >
                    {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
                {filteredItems.map((item) => {
                    const isActive = pathname === item.href || (item.children?.some(child => pathname === child.href))
                    const isIntelligence = item.label === 'Intelligence Portal'
                    
                    return (
                        <div key={item.label} className="space-y-1">
                            {item.isParent ? (
                                <>
                                    <button
                                        onClick={() => !isCollapsed && setIsIntelligenceOpen(!isIntelligenceOpen)}
                                        className={cn(
                                            "w-full flex items-center justify-between px-3 py-2.5 rounded-none transition-all duration-200 group",
                                            isActive && !isIntelligenceOpen ? "bg-indigo-50 text-indigo-700 font-bold" : "text-gray-500 hover:bg-gray-50"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon size={20} className={cn(isActive ? "text-indigo-600" : "text-gray-400")} />
                                            {!isCollapsed && <span className="text-sm font-semibold">{item.label}</span>}
                                        </div>
                                        {!isCollapsed && (
                                            <ChevronDown 
                                                size={14} 
                                                className={cn("transition-transform duration-200", isIntelligenceOpen ? "rotate-0" : "-rotate-90")} 
                                            />
                                        )}
                                    </button>
                                    
                                    {!isCollapsed && isIntelligenceOpen && (
                                        <div className="ml-4 pl-4 border-l border-gray-100 space-y-1 mt-1">
                                            {item.children?.map(child => {
                                                const isChildActive = pathname === child.href
                                                return (
                                                    <Link
                                                        key={child.href}
                                                        href={child.href}
                                                        className={cn(
                                                            "flex items-center gap-3 px-3 py-2 rounded-none text-xs font-bold transition-all",
                                                            isChildActive ? "text-indigo-600 bg-indigo-50/50" : "text-gray-400 hover:text-indigo-600 hover:bg-gray-50/50"
                                                        )}
                                                    >
                                                        <child.icon size={14} />
                                                        {child.label}
                                                    </Link>
                                                )
                                            })}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <Link 
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-none transition-all duration-200 group relative",
                                        isActive 
                                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" 
                                            : "text-gray-500 hover:bg-gray-50 hover:text-indigo-600"
                                    )}
                                >
                                    <item.icon size={20} className={cn(
                                        "transition-transform group-hover:scale-110",
                                        isActive ? "text-white" : "text-gray-400 group-hover:text-indigo-600"
                                    )} />
                                    {!isCollapsed && (
                                        <span className="font-semibold text-sm whitespace-nowrap">
                                            {item.label}
                                        </span>
                                    )}
                                </Link>
                            )}
                        </div>
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
                                "w-full flex items-center gap-3 px-4 py-3 rounded-none transition-all duration-200 text-red-500 hover:bg-red-50 group",
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
                            "w-full flex items-center gap-3 px-4 py-3 rounded-none transition-all duration-200 text-[#0F4C81] hover:bg-[#0F4C81]/5",
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

