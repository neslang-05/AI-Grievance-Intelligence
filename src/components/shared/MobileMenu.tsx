'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, LogOut, Home, FileText, BarChart3, LayoutDashboard, User, Info, PlusCircle } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MobileMenuProps {
    user: SupabaseUser | null
    profile: any
}

export default function MobileMenu({ user, profile }: MobileMenuProps) {
    const [isOpen, setIsOpen] = useState(false)

    const toggleMenu = () => setIsOpen(!isOpen)
    const closeMenu = () => setIsOpen(false)

    const menuItems = [
        { href: '/', label: 'Home', icon: Home },
        { href: '/about', label: 'About', icon: Info },
        { href: '/status', label: 'Track Status', icon: BarChart3 },
        { href: '/new-submit', label: 'Report Issue', icon: PlusCircle, highlight: true },
    ]

    return (
        <>
            {/* Hamburger Button - Mobile Only */}
            <Button
                variant="ghost"
                size="icon"
                onClick={toggleMenu}
                className="md:hidden relative z-[60] hover:bg-gray-100/50 rounded-xl"
            >
                {isOpen ? (
                    <X className="w-6 h-6 text-[#0B3C5D]" />
                ) : (
                    <Menu className="w-6 h-6 text-[#0B3C5D]" />
                )}
            </Button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-[#0B3C5D]/30 backdrop-blur-md z-[100] md:hidden"
                            onClick={closeMenu}
                        />

                        {/* Menu Panel */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 bottom-0 w-[280px] bg-white shadow-2xl z-[110] md:hidden overflow-hidden flex flex-col h-screen"
                        >
                            <div className="p-6 pt-20 flex-1 overflow-y-auto">
                                <div className="space-y-2 mb-8">
                                    <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Navigation</p>
                                    {menuItems.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={closeMenu}
                                            className={cn(
                                                "flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300",
                                                item.highlight 
                                                    ? "bg-[#0B3C5D] text-white shadow-lg shadow-blue-900/10 hover:bg-[#0F4C81] scale-105 my-4" 
                                                    : "text-gray-600 hover:bg-gray-50 hover:text-[#0B3C5D]"
                                            )}
                                        >
                                            <item.icon className={cn("w-5 h-5", item.highlight ? "text-white" : "text-gray-400")} />
                                            {item.label}
                                        </Link>
                                    ))}
                                </div>

                                {/* User-specific sections */}
                                <div className="space-y-2 py-4 border-t border-gray-100">
                                    <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Account</p>
                                    {user ? (
                                        <>
                                            <Link
                                                href="/my-complaints"
                                                onClick={closeMenu}
                                                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-[#0B3C5D] transition-all"
                                            >
                                                <FileText className="w-5 h-5 text-gray-400" />
                                                My Complaints
                                            </Link>

                                            {(profile?.role === 'OFFICER' || profile?.role === 'ADMIN') && (
                                                <Link
                                                    href="/dashboard"
                                                    onClick={closeMenu}
                                                    className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-[#0B3C5D] transition-all"
                                                >
                                                    <LayoutDashboard className="w-5 h-5 text-gray-400" />
                                                    Officer Dashboard
                                                </Link>
                                            )}
                                        </>
                                    ) : (
                                        <Link
                                            href="/login"
                                            onClick={closeMenu}
                                            className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-[#0B3C5D] transition-all"
                                        >
                                            <User className="w-5 h-5 text-gray-400" />
                                            Officer Login
                                        </Link>
                                    )}
                                </div>
                            </div>

                            {/* Bottom Section */}
                            {user && (
                                <div className="p-6 bg-gray-50/50 border-t border-gray-100">
                                    <div className="flex items-center gap-3 mb-6 px-2">
                                        <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                                            <img src="/favicon.svg" className="w-6 h-6" alt="Avatar" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-gray-900 truncate">{profile?.full_name || 'Unity User'}</p>
                                            <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                                        </div>
                                    </div>
                                    <form action="/api/auth/signout" method="POST">
                                        <Button
                                            variant="outline"
                                            className="w-full justify-center gap-2 rounded-xl border-gray-200 text-gray-600 font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Sign Out
                                        </Button>
                                    </form>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}
