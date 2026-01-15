'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'

// Mock badge component since it might be missing
const StatusBadge = ({ status }: { status: string }) => {
    const colors = {
        pending: 'bg-yellow-100 text-yellow-800',
        in_progress: 'bg-blue-100 text-blue-800',
        resolved: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800',
    }
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status as keyof typeof colors] || 'bg-gray-100'}`}>
            {status.replace('_', ' ').toUpperCase()}
        </span>
    )
}

export default function MyComplaintsPage() {
    const [complaints, setComplaints] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function fetchComplaints() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                setLoading(false)
                return
            }

            const { data, error } = await supabase
                .from('complaints')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Error fetching complaints:', error)
            } else {
                setComplaints(data || [])
            }
            setLoading(false)
        }

        fetchComplaints()
    }, [])

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#0F4C81]" />
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold text-[#0B3C5D]">My Complaints</h1>
            </div>

            {complaints.length === 0 ? (
                <Card className="text-center p-12">
                    <CardContent className="space-y-4">
                        <p className="text-gray-500">You haven't submitted any complaints yet.</p>
                        <Button asChild className="bg-[#0F4C81] hover:bg-[#0B3C5D]">
                            <Link href="/submit">Submit a Complaint</Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {complaints.map((complaint) => (
                        <Card key={complaint.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg text-[#0F4C81]">
                                            {complaint.ai_issue_type || 'Civic Issue'}
                                        </CardTitle>
                                        <CardDescription>
                                            Submitted on {format(new Date(complaint.created_at), 'PPP')}
                                        </CardDescription>
                                    </div>
                                    <StatusBadge status={complaint.status} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-700 line-clamp-2">
                                    {complaint.ai_summary || complaint.citizen_text || 'No description provided.'}
                                </p>
                                <div className="mt-4 flex gap-4">
                                    <div className="text-xs text-gray-500">
                                        <span className="font-semibold">Department:</span> {complaint.ai_department}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        <span className="font-semibold">Priority:</span> {complaint.ai_priority}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
