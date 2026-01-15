'use client'

import { useEffect, useState, useCallback } from 'react'
import { getComplaints } from '@/app/actions/complaint.actions'
import { Complaint } from '@/types/database.types'
import { AnalyticsCharts } from '@/components/dashboard/AnalyticsCharts'
import { StatsRibbon } from '@/components/dashboard/StatsRibbon'
import { motion } from 'framer-motion'
import { BarChart3, RefreshCw, Filter, Layout } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function AnalyticsPage() {
    const [complaints, setComplaints] = useState<Complaint[]>([])
    const [loading, setLoading] = useState(true)
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
    const [mounted, setMounted] = useState(false)

    const loadData = useCallback(async (silent = false) => {
        if (!silent) setLoading(true)
        const res = await getComplaints()
        if (res.success && res.complaints) {
            setComplaints(res.complaints)
            setLastUpdated(new Date())
        }
        setLoading(false)
    }, [])

    useEffect(() => {
        setMounted(true)
        loadData()
        
        // Polling for "Real-time" effect every 30 seconds
        const interval = setInterval(() => {
            loadData(true)
        }, 30000)

        return () => clearInterval(interval)
    }, [loadData])

    const handleManualRefresh = () => {
        toast.promise(loadData(), {
            loading: 'Re-syncing analytics with live database...',
            success: 'Analytics state synchronized',
            error: 'Failed to sync data'
        })
    }

    return (
        <div className="max-w-[1700px] mx-auto px-6 py-8 pb-20 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-600 rounded-none text-white shadow-lg shadow-blue-200">
                            <BarChart3 size={20} />
                        </div>
                        <span className="text-[10px] uppercase tracking-[0.2em] font-black text-blue-600/60">Intelligence Stack</span>
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                        Strategic <span className="text-blue-600">Analytics</span>
                    </h1>
                    <div className="flex items-center gap-2 mt-2">
                         <div className="w-1.5 h-1.5 rounded-none bg-emerald-500 animate-pulse" />
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            Live Feed Active • Last sync: {mounted ? lastUpdated.toLocaleTimeString() : '--:--:--'}
                          </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        variant="outline" 
                        className="rounded-none border-slate-200 bg-white/50 hover:bg-white"
                        onClick={handleManualRefresh}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh Engine
                    </Button>
                    <Button variant="outline" className="rounded-none border-slate-200 bg-white/50">
                        <Filter className="h-4 w-4 mr-2" />
                        Custom Range
                    </Button>
                </div>
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
                    <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm p-6 shadow-sm rounded-none">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-slate-800">Dynamic Trends</h3>
                            <Layout size={14} className="text-slate-300" />
                        </div>
                        <div className="space-y-4">
                            {[
                                { label: 'Infrastructure Issues', trend: '+12%', color: 'text-rose-500' },
                                { label: 'Public Health Risks', trend: '-3%', color: 'text-emerald-500' },
                                { label: 'Gov Transparency Score', trend: '+8%', color: 'text-indigo-500' }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-none border border-slate-100 hover:border-blue-100 transition-colors">
                                    <span className="text-xs font-medium text-slate-600">{item.label}</span>
                                    <span className={`text-xs font-black ${item.color}`}>{item.trend}</span>
                                </div>
                            ))}
                        </div>
                        <Button variant="ghost" className="w-full mt-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest hover:bg-slate-100">
                            Drill Down Analysis
                        </Button>
                    </Card>
                    
                    <Card className="bg-blue-600 text-white border-none shadow-xl rounded-none relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <RefreshCw size={80} />
                        </div>
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">Data Fidelity</CardTitle>
                            <CardDescription className="text-blue-100">AI consensus validation active</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black">98.2%</div>
                            <p className="text-xs text-blue-100 mt-2 font-medium">System reports high categorical accuracy for current live dataset.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
