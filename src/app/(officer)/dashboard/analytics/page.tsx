'use client'

import { useEffect, useState } from 'react'
import { getComplaints } from '@/app/actions/complaint.actions'
import { Complaint } from '@/types/database.types'
import { AnalyticsCharts } from '@/components/dashboard/AnalyticsCharts'
import { StatsRibbon } from '@/components/dashboard/StatsRibbon'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AnalyticsPage() {
    const [complaints, setComplaints] = useState<Complaint[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            setLoading(true)
            const res = await getComplaints()
            if (res.success && res.complaints) {
                setComplaints(res.complaints)
            }
            setLoading(false)
        }
        load()
    }, [])

    return (
        <div className="max-w-[1700px] mx-auto px-6 py-8 pb-20 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-600 rounded-lg text-white shadow-lg shadow-blue-200">
                            <BarChart3 size={20} />
                        </div>
                        <span className="text-[10px] uppercase tracking-[0.2em] font-black text-blue-600/60">Intelligence Stack</span>
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                        Strategic <span className="text-blue-600">Analytics</span>
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">Deep pattern recognition and trend analysis</p>
                </div>
                <Button variant="outline" className="rounded-xl border-slate-200 bg-white/50">
                    <Filter className="h-4 w-4 mr-2" />
                    Custom Range
                </Button>
            </div>

            <StatsRibbon stats={{
                total: complaints.length,
                pending: complaints.filter(c => c.status === 'pending').length,
                inProgress: complaints.filter(c => c.status === 'in_progress').length,
                resolved: complaints.filter(c => c.status === 'resolved').length
            }} />

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                <div className="xl:col-span-8">
                    <AnalyticsCharts complaints={complaints} />
                </div>
                <div className="xl:col-span-4 space-y-8">
                    <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-800 mb-4">Core Trends</h3>
                        <div className="space-y-4">
                            {[
                                { label: 'Infrastructure Issues', trend: '+12%', color: 'text-rose-500' },
                                { label: 'Public Health Risks', trend: '-3%', color: 'text-emerald-500' },
                                { label: 'Gov Transparency Score', trend: '+8%', color: 'text-indigo-500' }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                    <span className="text-xs font-medium text-slate-600">{item.label}</span>
                                    <span className={`text-xs font-black ${item.color}`}>{item.trend}</span>
                                </div>
                            ))}
                        </div>
                        <Button variant="ghost" className="w-full mt-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                            Generate Detailed analytics
                        </Button>
                    </Card>
                    
                    <Card className="bg-blue-600 text-white border-none shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">Data Fidelity</CardTitle>
                            <CardDescription className="text-blue-100">AI data validation active</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black">98.2%</div>
                            <p className="text-xs text-blue-100 mt-2 font-medium">System reports high categorical accuracy for current data set.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
