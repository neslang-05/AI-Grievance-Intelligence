'use client'

import { SocialMediaSimulator } from '@/components/dashboard/analytics/SocialMediaSimulator'
import { Zap, MessageSquare, ShieldCheck } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function SocialIntelligencePage() {
    return (
        <div className="max-w-[1700px] mx-auto px-6 py-8 pb-20 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-600 rounded-none text-white shadow-lg shadow-indigo-200">
                            <MessageSquare size={20} />
                        </div>
                        <span className="text-[10px] uppercase tracking-[0.2em] font-black text-indigo-600/60">Social Listening</span>
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                        Intel <span className="text-indigo-600">Channels</span>
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">Multi-channel signal ingestion and processing</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-none border border-emerald-100">
                    <div className="w-2 h-2 rounded-none bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Active Surveillance</span>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                <div className="xl:col-span-8">
                    <SocialMediaSimulator />
                </div>
                <div className="xl:col-span-4 space-y-6">
                    <Card className="bg-indigo-600 text-white border-none shadow-xl relative overflow-hidden rounded-none">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <ShieldCheck size={80} />
                        </div>
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">Secure Guard AI</CardTitle>
                            <CardDescription className="text-indigo-100">Automated signal verification active</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between bg-white/10 p-4 rounded-none backdrop-blur-md">
                                <div className="flex flex-col">
                                    <span className="text-2xl font-black">12.5k</span>
                                    <span className="text-[10px] uppercase font-bold text-indigo-200">Signals Scanned / Hr</span>
                                </div>
                            </div>
                            <Button variant="outline" className="w-full mt-6 bg-white text-indigo-600 border-none hover:bg-indigo-50 font-black uppercase text-[10px] tracking-widest rounded-none">
                                View Intelligence Log
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200/60 bg-white shadow-sm p-6 rounded-none">
                        <h4 className="text-sm font-bold text-slate-800 mb-4">Sentiment Map</h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-medium text-slate-500">Positive Feedback</span>
                                <span className="text-xs font-black text-emerald-500">22%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-none overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: '22%' }} />
                            </div>
                            
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-medium text-slate-500">Grievance/Negative</span>
                                <span className="text-xs font-black text-rose-500">68%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-none overflow-hidden">
                                <div className="h-full bg-rose-500" style={{ width: '68%' }} />
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
