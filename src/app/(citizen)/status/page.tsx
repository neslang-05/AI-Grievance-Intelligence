'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Search, Loader2, MapPin, Calendar, CheckCircle2, Clock, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'

export default function StatusPage() {
    const [complaintId, setComplaintId] = useState('')
    const [complaint, setComplaint] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!complaintId) return

        setLoading(true)
        setError(null)
        setComplaint(null)

        try {
            const { data, error } = await supabase
                .from('complaints')
                .select('*')
                .eq('reference_id', complaintId.trim().toUpperCase())
                .single()

            if (error) {
                if (error.code === 'PGRST116') {
                    throw new Error('No complaint found with this Reference ID.')
                }
                throw error
            }

            setComplaint(data)
        } catch (err: any) {
            setError(err.message || 'Failed to fetch status')
        } finally {
            setLoading(false)
        }
    }

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'pending':
                return {
                    icon: <Clock className="h-6 w-6 text-yellow-500" />,
                    label: 'Pending Review',
                    description: 'Our team is currently reviewing your grievance.',
                    color: 'bg-yellow-50 border-yellow-200'
                }
            case 'in_progress':
                return {
                    icon: <AlertTriangle className="h-6 w-6 text-blue-500" />,
                    label: 'In Progress',
                    description: 'The relevant department is working on your issue.',
                    color: 'bg-blue-50 border-blue-200'
                }
            case 'resolved':
                return {
                    icon: <CheckCircle2 className="h-6 w-6 text-green-500" />,
                    label: 'Resolved',
                    description: 'The issue has been successfully addressed.',
                    color: 'bg-green-50 border-green-200'
                }
            case 'rejected':
                return {
                    icon: <CheckCircle2 className="h-6 w-6 text-red-500" />,
                    label: 'Rejected',
                    description: 'The grievance could not be processed.',
                    color: 'bg-red-50 border-red-200'
                }
            default:
                return {
                    icon: <Clock className="h-6 w-6 text-gray-500" />,
                    label: 'Unknown',
                    description: 'Status unavailable.',
                    color: 'bg-gray-50 border-gray-200'
                }
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-[#0B3C5D]">Track Grievance Status</h1>
                <p className="text-gray-600 mt-2">Enter your unique Reference ID to check the current progress.</p>
            </div>

            <Card className="shadow-lg border-blue-100">
                <CardContent className="pt-6">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <Label htmlFor="refId" className="sr-only">Reference ID</Label>
                            <Input
                                id="refId"
                                placeholder="Enter Reference ID (e.g., PW7K2M9X)"
                                value={complaintId}
                                onChange={(e) => setComplaintId(e.target.value)}
                                className="h-12 border-gray-300 focus:border-[#0F4C81] focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-[#0F4C81] hover:bg-[#0B3C5D] h-12 px-8"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                            Track Status
                        </Button>
                    </form>
                    {error && <p className="mt-3 text-sm text-red-600 font-medium">{error}</p>}
                </CardContent>
            </Card>

            {complaint && (
                <Card className="shadow-md border-none overflow-hidden">
                    <div className={`p-6 border-b ${getStatusInfo(complaint.status).color} flex items-center justify-between`}>
                        <div className="flex items-center gap-4">
                            {getStatusInfo(complaint.status).icon}
                            <div>
                                <h3 className="font-bold text-lg">{getStatusInfo(complaint.status).label}</h3>
                                <p className="text-sm opacity-90">{getStatusInfo(complaint.status).description}</p>
                            </div>
                        </div>
                    </div>
                    <CardHeader>
                        <CardTitle>{complaint.ai_issue_type}</CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-2">
                            <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {format(new Date(complaint.created_at), 'PPP')}
                            </span>
                            <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {complaint.location_manual || (complaint.location_lat ? 'GPS Location' : 'No location')}
                            </span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">AI Summary</Label>
                            <p className="mt-1 text-gray-800">{complaint.ai_summary}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Department</Label>
                                <p className="mt-1 font-medium">{complaint.ai_department}</p>
                            </div>
                            <div>
                                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Priority</Label>
                                <p className="mt-1">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold capitalize ${complaint.ai_priority === 'high' ? 'bg-red-100 text-red-700' :
                                            complaint.ai_priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-blue-100 text-blue-700'
                                        }`}>
                                        {complaint.ai_priority}
                                    </span>
                                </p>
                            </div>
                        </div>
                        {complaint.rejection_reason && (
                            <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                                <Label className="text-xs font-bold text-red-600 uppercase tracking-wider">Reason for Rejection</Label>
                                <p className="mt-1 text-sm text-red-800">{complaint.rejection_reason}</p>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="bg-gray-50 border-t justify-center py-4">
                        <p className="text-xs text-gray-500 italic">Reference ID: {complaint.reference_id}</p>
                    </CardFooter>
                </Card>
            )}
        </div>
    )
}
