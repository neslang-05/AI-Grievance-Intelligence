import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'AI Grievance Platform - Manipur',
    description: 'AI-powered civic complaint system for citizens of Manipur',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <header className="bg-primary text-primary-foreground shadow-md">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold">Manipur Grievance Portal</h1>
                            </div>
                            <nav className="flex gap-4">
                                <a href="/" className="hover:underline">
                                    Submit Complaint
                                </a>
                                <a href="/dashboard" className="hover:underline">
                                    Dashboard
                                </a>
                            </nav>
                        </div>
                    </div>
                </header>
                <main className="min-h-screen bg-background">
                    {children}
                </main>
                <footer className="bg-muted border-t mt-12">
                    <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
                        <p>© 2026 Government of Manipur. AI-Powered Grievance Platform.</p>
                    </div>
                </footer>
            </body>
        </html>
    )
}
