'use client'

import { useEffect, useState, useCallback } from 'react'
import { getComplaints } from '@/app/actions/complaint.actions'
import { Complaint } from '@/types/database.types'
import { MapTilerHeatmap } from '@/components/dashboard/spatial/MapTilerHeatmap'
import { MapPin, Layers, Crosshair, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SpatialPage() {
    const [complaints, setComplaints] = useState<Complaint[]>([])
    const [loading, setLoading] = useState(true)

    const loadData = useCallback(async (silent = false) => {
        if (!silent) setLoading(true)
        const res = await getComplaints()
        if (res.success && res.complaints) {
            setComplaints(res.complaints)
        }
        setLoading(false)
    }, [])

    useEffect(() => {
        loadData()
        
        // Refresh spatial data every 60 seconds
        const interval = setInterval(() => {
            loadData(true)
        }, 60000)

        return () => clearInterval(interval)
    }, [loadData])

    return (
        <div className="max-w-[1700px] mx-auto px-6 py-8 pb-20 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-600 rounded-none text-white shadow-lg shadow-emerald-200">
                            <MapPin size={20} />
                        </div>
                        <span className="text-[10px] uppercase tracking-[0.2em] font-black text-emerald-600/60">Geospatial Intelligence</span>
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                        Spatial <span className="text-emerald-600">Surveillance</span>
                    </h1>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="w-1.5 h-1.5 rounded-none bg-emerald-500 animate-pulse" />
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Live Sync Active</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button 
                        variant="outline" 
                        className="rounded-none border-slate-200 bg-white/50"
                        onClick={() => loadData()}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Sync Map
                    </Button>
                    <Button variant="outline" className="rounded-none border-slate-200 bg-white/50">
                        <Layers className="h-4 w-4 mr-2" />
                        Layers
                    </Button>
                    <Button variant="outline" className="rounded-none border-slate-200 bg-white/50">
                        <Crosshair className="h-4 w-4 mr-2" />
                        Re-center
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                <div className="xl:col-span-9">
                    <MapTilerHeatmap complaints={complaints} />
                </div>
                <div className="xl:col-span-3 space-y-6">
                    <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm shadow-sm rounded-none">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold">Spatial Density</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-emerald-50 rounded-none border border-emerald-100 transition-all hover:bg-emerald-100/50">
                                <span className="text-2xl font-black text-emerald-700">Sector A-1</span>
                                <p className="text-[10px] font-bold text-emerald-600 uppercase mt-1">Highest Activity Cluster</p>
                            </div>
                            <div className="p-4 bg-amber-50 rounded-none border border-amber-100 transition-all hover:bg-amber-100/50">
                                <span className="text-2xl font-black text-amber-700">Sector B-4</span>
                                <p className="text-[10px] font-bold text-amber-600 uppercase mt-1">Rapid Growth Area</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 text-white border-none shadow-xl rounded-none relative overflow-hidden group">
                        <div className="absolute -bottom-4 -right-4 p-8 opacity-10 group-hover:scale-110 transition-transform">
                            <MapPin size={100} />
                        </div>
                        <CardHeader>
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400">Map Analytics</CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs space-y-3 font-medium opacity-80 relative z-10">
                            <p>• Heatmap represents complaint density weighed by AI confidence scores.</p>
                            <p>• Precision indicators appear at Zoom 14+ for micro-location analysis.</p>
                            <p>• Visual spectrum indicates AI-assigned priority level (Red=High).</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
