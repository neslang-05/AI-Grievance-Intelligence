'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X, LogOut, Home, FileText, BarChart3, LayoutDashboard, User } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface MobileMenuProps {
    user: SupabaseUser | null
    profile: any
}

export default function MobileMenu({ user, profile }: MobileMenuProps) {
    const [isOpen, setIsOpen] = useState(false)

    const toggleMenu = () => setIsOpen(!isOpen)
    const closeMenu = () => setIsOpen(false)

    return (
        <>
            {/* Hamburger Button - Mobile Only */}
            <button
                onClick={toggleMenu}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Toggle menu"
            >
                {isOpen ? (
                    <X className="w-6 h-6 text-[#0B3C5D]" />
                ) : (
                    <Menu className="w-6 h-6 text-[#0B3C5D]" />
                )}
            </button>

            {/* Mobile Menu Overlay */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 z-40 md:hidden"
                        onClick={closeMenu}
                    />

                    {/* Menu Panel */}
                    <div className="fixed top-16 right-0 bottom-0 w-64 bg-white shadow-xl z-50 md:hidden overflow-y-auto">
                        <div className="flex flex-col p-4 space-y-2">
                            {/* Main Navigation Links */}
                            <Link
                                href="/submit"
                                onClick={closeMenu}
                                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-[#0F4C81] rounded-lg transition-colors"
                            >
                                <FileText className="w-5 h-5" />
                                Submit
                            </Link>

                            <Link
                                href="/status"
                                onClick={closeMenu}
                                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-[#0F4C81] rounded-lg transition-colors"
                            >
                                <BarChart3 className="w-5 h-5" />
                                Status
                            </Link>

                            {/* User-specific links */}
                            {user ? (
                                <>
                                    <div className="border-t pt-2 mt-2">
                                        <Link
                                            href="/my-complaints"
                                            onClick={closeMenu}
                                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-[#0F4C81] rounded-lg transition-colors"
                                        >
                                            <Home className="w-5 h-5" />
                                            My Complaints
                                        </Link>

                                        {(profile?.role === 'OFFICER' || profile?.role === 'ADMIN') && (
                                            <Link
                                                href="/dashboard"
                                                onClick={closeMenu}
                                                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-[#0F4C81] rounded-lg transition-colors"
                                            >
                                                <LayoutDashboard className="w-5 h-5" />
                                                Dashboard
                                            </Link>
                                        )}
                                    </div>

                                    {/* User info */}
                                    <div className="border-t pt-2 mt-2">
                                        <div className="px-4 py-2">
                                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                                                <User className="w-4 h-4" />
                                                <span className="truncate">{profile?.full_name || user.email}</span>
                                            </div>
                                            <form action="/api/auth/signout" method="POST">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    type="submit"
                                                    className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                                >
                                                    <LogOut className="h-4 w-4" />
                                                    Sign Out
                                                </Button>
                                            </form>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="border-t pt-2 mt-2">
                                    <Link
                                        href="/login"
                                        onClick={closeMenu}
                                        className="block"
                                    >
                                        <Button
                                            variant="default"
                                            size="sm"
                                            className="w-full bg-[#0F4C81] hover:bg-[#0B3C5D]"
                                        >
                                            Officer Login
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </>
    )
}
