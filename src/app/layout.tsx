import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import 'leaflet/dist/leaflet.css'
import { createClient } from '@/lib/supabase/server'
import { Toaster } from 'sonner'
import AppShell from '@/components/shared/AppShell'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'UnityDesk - AI Grievance Portal',
    description: 'Unified platform for intelligent civic grievance management',
}

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
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
        <html lang="en">
            <head>
                <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
            </head>
            <body className={`${inter.className} bg-[#F8FAFC]`}>
                <AppShell user={user} profile={profile}>
                    {children}
                </AppShell>
                <Toaster position="top-right" richColors />
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


