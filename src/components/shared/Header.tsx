'use client'

import Link from 'next/link'
import { Camera, Info } from 'lucide-react'

export default function Header() {
    return (
        <header className="bg-white shadow-sm sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-3 py-3 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3">
                    <img src="/favicon.svg" alt="UnityDesk" className="w-10 h-10 object-contain shadow-sm rounded-lg" />
                    <div>
                        <h1 className="text-xl font-bold text-[#0B3C5D] tracking-tight">UnityDesk</h1>
                        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">Unified Grievance System</p>
                    </div>
                </Link>
                <Link
                    href="/about"
                    className="flex items-center gap-1.5 text-[#0F4C81] hover:text-[#0B3C5D] transition-colors"
                >
                    <Info className="w-4 h-4" />
                    <span className="font-medium text-sm">About Us</span>
                </Link>
            </div>
        </header>
    )
}
