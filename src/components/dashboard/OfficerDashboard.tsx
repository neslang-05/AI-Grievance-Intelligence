'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getComplaints, updateComplaintStatus } from '@/app/actions/complaint.actions'
import { Complaint } from '@/types/database.types'
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  XCircle, 
  MapPin, 
  Calendar, 
  Search, 
  Filter, 
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingUp
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { StatsRibbon } from './StatsRibbon'
import { SpatialHeatmap } from './SpatialHeatmap'
import { AnalyticsCharts } from './AnalyticsCharts'
import { SocialMediaSimulator } from './analytics/SocialMediaSimulator'
import { PolicyAdvisor } from './analytics/PolicyAdvisor'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export default function OfficerDashboard() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'resolved'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('operational')

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
    <div className="max-w-[1700px] mx-auto px-6 py-8 pb-20">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-2"
          >
            <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-200">
              <ShieldCheck size={20} />
            </div>
            <span className="text-[10px] uppercase tracking-[0.2em] font-black text-indigo-600/60">Government of Manipur</span>
          </motion.div>
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
            Unified dashboard for civic surveillance and AI-driven governance
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
            Advanced
          </Button>
        </div>
      </div>

      <Tabs defaultValue="operational" className="space-y-8" onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList className="bg-slate-100/80 p-1 rounded-xl">
            <TabsTrigger value="operational" className="rounded-lg px-6 font-bold flex items-center gap-2">
              <Zap size={14} /> Operational Queue
            </TabsTrigger>
            <TabsTrigger value="intelligence" className="rounded-lg px-6 font-bold flex items-center gap-2">
              <TrendingUp size={14} /> Strategic Insights
            </TabsTrigger>
          </TabsList>
          
          <div className="hidden md:flex items-center gap-6">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Live System Feed</span>
             </div>
             <div className="h-4 w-px bg-slate-200" />
             <span className="text-[11px] font-medium text-slate-400">Last Synchronized: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        <TabsContent value="operational" className="mt-0 space-y-8">
           <StatsRibbon stats={{
            total: complaints.length,
            pending: complaints.filter(c => c.status === 'pending').length,
            inProgress: complaints.filter(c => c.status === 'in_progress').length,
            resolved: complaints.filter(c => c.status === 'resolved').length
          }} />

          {/* Operational Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* Left Main - Queue */}
            <div className="xl:col-span-8">
              <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/50 shadow-xl overflow-hidden flex flex-col h-full min-h-[700px]">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/80 z-10 backdrop-blur-md">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Direct Citizen Ingest</h2>
                    <p className="text-xs text-slate-400 font-medium">Monitoring {filteredComplaints.length} active threads</p>
                  </div>
                  <Tabs defaultValue="all" onValueChange={(v) => setFilter(v as any)}>
                    <TabsList className="bg-slate-100/50">
                      <TabsTrigger value="all" className="text-xs font-bold">All Ingests</TabsTrigger>
                      <TabsTrigger value="pending" className="text-xs font-bold">Awaiting Action</TabsTrigger>
                      <TabsTrigger value="resolved" className="text-xs font-bold">Closed</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-40">
                      <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
                      <p className="text-sm font-bold text-slate-400 animate-pulse">Synchronizing with Secure Cloud...</p>
                    </div>
                  ) : filteredComplaints.length === 0 ? (
                    <div className="text-center py-40 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
                      <Clock size={40} className="mx-auto text-slate-300 mb-4" />
                      <p className="text-slate-400 font-bold">No grievances found in current filter</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <AnimatePresence mode="popLayout">
                        {filteredComplaints.map((complaint) => (
                          <motion.div
                            key={complaint.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                          >
                            <Card className="border-slate-200/60 hover:border-indigo-300 transition-all duration-300 hover:shadow-xl group relative overflow-hidden h-full flex flex-col">
                              {/* Selection overlay indicator */}
                              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                              
                              <CardHeader className="p-5 pb-3">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      {getStatusIcon(complaint.status)}
                                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${getPriorityColor(complaint.ai_priority)}`}>
                                        {complaint.ai_priority}
                                      </span>
                                    </div>
                                    <CardTitle className="text-base font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                      {complaint.ai_issue_type}
                                    </CardTitle>
                                  </div>
                                  <Badge variant="secondary" className="bg-slate-50 text-slate-400 border-none text-[9px]">
                                    {new Date(complaint.created_at).toLocaleDateString()}
                                  </Badge>
                                </div>
                              </CardHeader>
                              
                              <CardContent className="p-5 pt-0 flex-1 flex flex-col">
                                <p className="text-xs text-slate-500 line-clamp-3 mb-6 leading-relaxed flex-1">
                                  {complaint.ai_summary}
                                </p>
                                
                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                                  <div className="flex flex-col">
                                     <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">Assigned Dept</span>
                                     <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-600">
                                      {complaint.ai_department}
                                    </div>
                                  </div>
                                  
                                  <div className="flex gap-2">
                                    {complaint.status === 'pending' && (
                                      <Button 
                                        size="sm" 
                                        className="h-8 px-4 text-[11px] font-bold bg-indigo-600 hover:bg-slate-900 rounded-lg shadow-md shadow-indigo-100 hover:shadow-none transition-all"
                                        onClick={() => handleStatusChange(complaint.id, 'in_progress')}
                                      >
                                        Initiate Response
                                      </Button>
                                    )}
                                    {complaint.status === 'in_progress' && (
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        className="h-8 px-4 text-[11px] font-bold border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-lg"
                                        onClick={() => handleStatusChange(complaint.id, 'resolved')}
                                      >
                                        Mark Resolved
                                      </Button>
                                    )}
                                    {complaint.status === 'resolved' && (
                                      <Badge className="bg-emerald-100 text-emerald-700 border-none font-bold py-1 px-3">
                                        <CheckCircle size={10} className="mr-1" /> CLOSED
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side - Social Monitor (Live Channels) */}
            <div className="xl:col-span-4 space-y-6">
               <SocialMediaSimulator />
               
               <Card className="bg-indigo-600 text-white border-none shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <ShieldCheck size={80} />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg font-bold">Secure Guard AI</CardTitle>
                    <CardDescription className="text-indigo-100">Automatic fraud & duplicate detection active</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between bg-white/10 p-4 rounded-xl backdrop-blur-md">
                       <div className="flex flex-col">
                          <span className="text-2xl font-black">99.8%</span>
                          <span className="text-[10px] uppercase font-bold text-indigo-200">Confidence Score</span>
                       </div>
                       <Button variant="outline" size="sm" className="bg-white text-indigo-600 border-none hover:bg-indigo-50 font-bold">
                          View Log
                       </Button>
                    </div>
                  </CardContent>
               </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="intelligence" className="mt-0 space-y-8 pb-10">
           <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              <div className="xl:col-span-8 space-y-8">
                 <SpatialHeatmap complaints={complaints} />
                 <AnalyticsCharts complaints={complaints} />
              </div>
              <div className="xl:col-span-4 space-y-8">
                 <PolicyAdvisor />
                 
                 <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 mb-4">Strategic Trend Analysis</h3>
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
                       Generate Detailed PDF Report
                    </Button>
                 </Card>
              </div>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
