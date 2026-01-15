'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getComplaints, updateComplaintStatus } from '@/app/actions/complaint.actions'
import { Complaint } from '@/types/database.types'
import { AlertCircle, CheckCircle, Clock, XCircle, MapPin, Calendar, Search, Filter, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { StatsRibbon } from './StatsRibbon'
import { SpatialHeatmap } from './SpatialHeatmap'
import { AnalyticsCharts } from './AnalyticsCharts'
import { Input } from '@/components/ui/input'

export default function OfficerDashboard() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'resolved'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadComplaints()
  }, [filter])

  const loadComplaints = async () => {
    setLoading(true)
    const response = await getComplaints(
      filter !== 'all' ? { status: filter } : undefined
    )
    if (response.success && response.complaints) {
      setComplaints(response.complaints)
    }
    setLoading(false)
  }

  const handleStatusChange = async (complaintId: string, newStatus: any) => {
    const response = await updateComplaintStatus(complaintId, newStatus)
    if (response.success) {
      loadComplaints()
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 text-red-700 border-red-100'
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-100'
      case 'low':
        return 'bg-blue-50 text-blue-700 border-blue-100'
      default:
        return 'bg-slate-50 text-slate-700 border-slate-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-amber-500" />
      case 'in_progress':
        return <AlertCircle className="h-5 w-5 text-blue-500" />
      case 'resolved':
        return <CheckCircle className="h-5 w-5 text-emerald-500" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-rose-500" />
      default:
        return null
    }
  }

  const filteredComplaints = complaints.filter((c) => {
    const matchesStatus = filter === 'all' || c.status === filter
    const matchesSearch = c.ai_issue_type.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         c.ai_summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         c.ai_department.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-8">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-extrabold text-slate-900 tracking-tight"
          >
            Intelligence <span className="text-indigo-600">Portal</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 mt-2 font-medium"
          >
            Centrally monitoring city grievances and AI-driven resolution workflows
          </motion.p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search intelligence..." 
              className="pl-10 w-64 bg-white/50 border-slate-200 focus:bg-white transition-all shadow-sm rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="rounded-xl border-slate-200 bg-white/50">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Intelligence Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Column - Spatial & Analytical (Main Insight) */}
        <div className="xl:col-span-8 space-y-8">
          <StatsRibbon stats={{
            total: complaints.length,
            pending: complaints.filter(c => c.status === 'pending').length,
            inProgress: complaints.filter(c => c.status === 'in_progress').length,
            resolved: complaints.filter(c => c.status === 'resolved').length
          }} />
          
          <SpatialHeatmap complaints={complaints} />
          
          <AnalyticsCharts complaints={complaints} />
        </div>

        {/* Right Column - Management & Feed */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/50 shadow-xl overflow-hidden flex flex-col h-full max-h-[1200px]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/80 z-10">
              <h2 className="text-xl font-bold text-slate-800">Operational Queue</h2>
              <Tabs defaultValue="all" onValueChange={(v) => setFilter(v as any)}>
                <TabsList className="bg-slate-100/50">
                  <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                  <TabsTrigger value="pending" className="text-xs">Pending</TabsTrigger>
                  <TabsTrigger value="resolved" className="text-xs">Done</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  >
                    <Clock className="h-8 w-8 mb-4 opacity-20" />
                  </motion.div>
                  <p className="text-sm font-medium">Analyzing database...</p>
                </div>
              ) : filteredComplaints.length === 0 ? (
                <div className="text-center py-20 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-slate-400 font-medium">No records matching criteria</p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredComplaints.map((complaint) => (
                    <motion.div
                      key={complaint.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <Card className="border-slate-200/60 hover:border-indigo-200 transition-all duration-300 hover:shadow-lg group">
                        <CardHeader className="p-4 pb-2">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {getStatusIcon(complaint.status)}
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getPriorityColor(complaint.ai_priority)}`}>
                                  {complaint.ai_priority}
                                </span>
                              </div>
                              <CardTitle className="text-sm font-bold text-slate-800 line-clamp-1">
                                {complaint.ai_issue_type}
                              </CardTitle>
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                              {new Date(complaint.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                            {complaint.ai_summary}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                              <MapPin size={10} />
                              {complaint.ai_department}
                            </div>
                            
                            <div className="flex gap-2">
                              {complaint.status === 'pending' && (
                                <Button 
                                  size="sm" 
                                  className="h-8 px-3 text-xs bg-indigo-600 hover:bg-indigo-700 rounded-lg group-hover:translate-x-1 transition-transform"
                                  onClick={() => handleStatusChange(complaint.id, 'in_progress')}
                                >
                                  Process <ArrowRight className="h-3 w-3 ml-1" />
                                </Button>
                              )}
                              {complaint.status === 'in_progress' && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="h-8 px-3 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-lg"
                                  onClick={() => handleStatusChange(complaint.id, 'resolved')}
                                >
                                  Complete
                                </Button>
                              )}
                              {complaint.status === 'resolved' && (
                                <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                                  <CheckCircle size={10} /> Resolved
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
