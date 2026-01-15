import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import TopNav from '@/components/shared/TopNav'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'UnityDesk - AI Grievance Portal',
    description: 'Unified platform for intelligent civic grievance management',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <head>
                <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
            </head>
            <body className={`${inter.className} bg-[#F8FAFC]`}>
                <TopNav />
                <main className="min-h-screen">
                    {children}
                </main>

                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                        if ('serviceWorker' in navigator) {
                            window.addEventListener('load', function() {
                                navigator.serviceWorker.register('/sw.js');
                            });
                        }
                        `,
                    }}
                />
            </body>
        </html>
    )
}
