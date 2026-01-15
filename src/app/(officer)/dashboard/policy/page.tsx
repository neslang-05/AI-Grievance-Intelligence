'use client'

import { PolicyAdvisor } from '@/components/dashboard/analytics/PolicyAdvisor'
import { Scale, FileText, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function PolicyIntelligencePage() {
    return (
        <div className="max-w-[1700px] mx-auto px-6 py-8 pb-20 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-amber-600 rounded-none text-white shadow-lg shadow-amber-200">
                            <Scale size={20} />
                        </div>
                        <span className="text-[10px] uppercase tracking-[0.2em] font-black text-amber-600/60">Governance Advisor</span>
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                        Policy <span className="text-amber-600">Intelligence</span>
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">Data-driven policy recommendations and impact analysis</p>
                </div>
                <Button className="bg-slate-900 text-white hover:bg-black font-bold h-11 px-8 rounded-none shadow-lg shadow-slate-200">
                    <FileText size={16} className="mr-2" />
                    Download Policy Draft
                </Button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                <div className="xl:col-span-8">
                    <PolicyAdvisor />
                </div>
                <div className="xl:col-span-4 space-y-6">
                    <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm p-6 shadow-sm rounded-none">
                        <h3 className="text-sm font-bold text-slate-800 mb-4">Impact Estimates</h3>
                        <div className="space-y-4">
                            <div className="p-4 bg-amber-50 rounded-none border border-amber-100">
                                <span className="text-xl font-black text-amber-700">34.2%</span>
                                <p className="text-[10px] font-bold text-amber-600 uppercase mt-1">Projected Burden Reduction</p>
                            </div>
                            <div className="p-4 bg-indigo-50 rounded-none border border-indigo-100">
                                <span className="text-xl font-black text-indigo-700">₹8.4M</span>
                                <p className="text-[10px] font-bold text-indigo-600 uppercase mt-1">Est. Operational Savings</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-[#0B3C5D] text-white border-none shadow-xl rounded-none">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">Policy Trust Score</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black mb-2">A+</div>
                            <p className="text-xs text-blue-100 font-medium">Derived from 4,500+ verified citizen grievances and 92% AI consensus.</p>
                            <div className="mt-4 flex items-center gap-2 text-emerald-400">
                                <CheckCircle size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Verified by secure AI</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
