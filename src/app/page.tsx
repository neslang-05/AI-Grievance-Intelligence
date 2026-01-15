'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Camera,
  Upload,
  Mic,
  FileText,
  ShieldCheck,
  Zap,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  TrendingUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-sky-50/60 via-white to-white">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden">
        {/* Background Gradients and Patterns */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-100/30 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute top-[20%] -right-[10%] w-[30%] h-[50%] bg-indigo-100/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-[0%] left-[20%] w-[50%] h-[30%] bg-emerald-50/30 rounded-full blur-[110px]" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay" />
        </div>

        <div className="container px-4 mx-auto relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-blue-100/50 shadow-sm text-blue-700 text-sm font-bold mb-8 transition-transform hover:scale-105 cursor-default">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                AI-Powered Civic Intelligence
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-[#0B3C5D] mb-4 tracking-tight">
                Submit Your Report
              </h1>
              <p className="text-lg text-gray-500 font-medium max-w-xl mx-auto leading-relaxed">
                Choose a reporting method below to instantly identify and route your grievance using AI.
              </p>
            </motion.div>

            {/* Primary Action Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {/* Take Photo */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Link href="/new-submit?mode=camera" className="group block h-full">
                  <div className="h-full p-8 bg-white/70 backdrop-blur-lg rounded-[2.5rem] border border-white shadow-xl shadow-blue-900/5 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 transition-all duration-500 group-hover:bg-white flex flex-col items-center text-center">
                    <div className="w-20 h-20 mb-6 rounded-3xl bg-gradient-to-br from-blue-50 to-blue-100/50 flex items-center justify-center text-[#0B3C5D] group-hover:from-[#0B3C5D] group-hover:to-[#0F4C81] group-hover:text-white transition-all duration-500 shadow-inner">
                      <Camera size={36} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#0B3C5D] transition-colors">Take Photo</h3>
                    <p className="text-sm text-gray-500 leading-relaxed font-medium">Instant AI analysis from your camera</p>
                  </div>
                </Link>
              </motion.div>

              {/* Browse Gallery */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Link href="/new-submit?mode=gallery" className="group block h-full">
                  <div className="h-full p-8 bg-white/70 backdrop-blur-lg rounded-[2.5rem] border border-white shadow-xl shadow-blue-900/5 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 transition-all duration-500 group-hover:bg-white flex flex-col items-center text-center">
                    <div className="w-20 h-20 mb-6 rounded-3xl bg-gradient-to-br from-indigo-50 to-indigo-100/50 flex items-center justify-center text-indigo-600 group-hover:from-indigo-600 group-hover:to-indigo-500 group-hover:text-white transition-all duration-500 shadow-inner">
                      <Upload size={36} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">From Gallery</h3>
                    <p className="text-sm text-gray-500 leading-relaxed font-medium">Upload existing photos for reporting</p>
                  </div>
                </Link>
              </motion.div>

              {/* Voice Complaint */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Link href="/new-submit?mode=voice" className="group block h-full">
                  <div className="h-full p-8 bg-white/70 backdrop-blur-lg rounded-[2.5rem] border border-white shadow-xl shadow-blue-900/5 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-2 transition-all duration-500 group-hover:bg-white flex flex-col items-center text-center">
                    <div className="w-20 h-20 mb-6 rounded-3xl bg-gradient-to-br from-purple-50 to-purple-100/50 flex items-center justify-center text-purple-600 group-hover:from-purple-600 group-hover:to-purple-500 group-hover:text-white transition-all duration-500 shadow-inner">
                      <Mic size={36} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">Voice Report</h3>
                    <p className="text-sm text-gray-500 leading-relaxed font-medium">Record your grievance naturally</p>
                  </div>
                </Link>
              </motion.div>

              {/* Manual Entry */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Link href="/new-submit?mode=manual" className="group block h-full">
                  <div className="h-full p-8 bg-white/70 backdrop-blur-lg rounded-[2.5rem] border border-white shadow-xl shadow-blue-900/5 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-2 transition-all duration-500 group-hover:bg-white flex flex-col items-center text-center">
                    <div className="w-20 h-20 mb-6 rounded-3xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 flex items-center justify-center text-emerald-600 group-hover:from-emerald-600 group-hover:to-emerald-500 group-hover:text-white transition-all duration-500 shadow-inner">
                      <FileText size={36} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">Manual Entry</h3>
                    <p className="text-sm text-gray-500 leading-relaxed font-medium">Detailed text-based submission</p>
                  </div>
                </Link>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-20 flex flex-wrap items-center justify-center gap-6 md:gap-12"
            >
              <div className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-tighter">
                <CheckCircle2 size={16} className="text-blue-500" />
                <span>Smart Routing</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-tighter">
                <CheckCircle2 size={16} className="text-blue-500" />
                <span>GPS Location</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-tighter">
                <CheckCircle2 size={16} className="text-blue-500" />
                <span>24/7 Monitoring</span>
              </div>
            </motion.div>

            {/* Intelligence Showcase */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-32 text-left"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px flex-1 bg-slate-200" />
                <h2 className="text-xs uppercase tracking-[0.3em] font-black text-[#0B3C5D]/40">Intelligence Stack</h2>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="bg-white/40 backdrop-blur-sm border-none shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                    <TrendingUp size={24} />
                  </div>
                  <h4 className="font-bold text-slate-800 mb-2">Strategic Analytics</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">Real-time trend analysis used for data-driven policy improvements and resource allocation.</p>
                </Card>

                <Card className="bg-white/40 backdrop-blur-sm border-none shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                    <Zap size={24} />
                  </div>
                  <h4 className="font-bold text-slate-800 mb-2">Social Awareness</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">Multi-channel monitoring including social media ingestion for higher civic coverage.</p>
                </Card>

                <Card className="bg-white/40 backdrop-blur-sm border-none shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                    <ShieldCheck size={24} />
                  </div>
                  <h4 className="font-bold text-slate-800 mb-2">Spatial Intelligence</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">Advanced hot-spot mapping to identify systemic infrastructure failures across Manipur.</p>
                </Card>
              </div>

              <div className="mt-12 flex justify-center">
                <Link href="/dashboard">
                  <Button variant="ghost" className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:bg-white hover:text-indigo-700 font-bold group">
                    Explore Intelligence Portal
                    <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

    </div>
  )
}

