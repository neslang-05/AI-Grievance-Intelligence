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
import { MapTilerHeatmap } from './spatial/MapTilerHeatmap'
import dynamic from 'next/dynamic'
const MapPreview = dynamic(() => import('@/components/shared/MapPreview'), { ssr: false, loading: () => <div className="h-48 w-full bg-slate-100 animate-pulse" /> })
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
  const [mounted, setMounted] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [rejectionText, setRejectionText] = useState('')
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
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

  const openComplaintModal = (complaint: Complaint) => {
    setSelectedComplaint(complaint)
    setRejectionText(complaint.rejection_reason || '')
    setIsRejecting(false)
    setIsModalOpen(true)
  }

  const closeComplaintModal = () => {
    setSelectedComplaint(null)
    setIsModalOpen(false)
    setIsRejecting(false)
    setRejectionText('')
  }

  const submitRejection = async () => {
    if (!selectedComplaint) return
    // Prevent rejecting a resolved complaint
    if (selectedComplaint.status === 'resolved') {
      return
    }

    const resp = await updateComplaintStatus(selectedComplaint.id, 'rejected', rejectionText || null)
    if (resp.success) {
      // update local state to show rejection and allow undo
      setSelectedComplaint({ ...selectedComplaint, status: 'rejected', rejection_reason: rejectionText })
      loadComplaints()
    }
  }

  const undoRejection = async () => {
    if (!selectedComplaint) return
    const resp = await updateComplaintStatus(selectedComplaint.id, 'pending', null)
    if (resp.success) {
      setSelectedComplaint({ ...selectedComplaint, status: 'pending', rejection_reason: null })
      loadComplaints()
      setIsRejecting(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 text-red-700 border-red-100'
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-100'
      case 'low':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100'
      default:
        return 'bg-slate-50 text-slate-700 border-slate-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-amber-500" />
      case 'in_progress':
        return <AlertCircle className="h-5 w-5 text-teal-500" />
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
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/80 via-white to-white pb-20">
      <div className="max-w-[1700px] mx-auto px-6 py-8">
        {/* Premium Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-2"
            >
              <div className="p-2 bg-[#064E3B] rounded-none text-white shadow-lg shadow-emerald-200">
                <ShieldCheck size={20} />
              </div>
              <span className="text-[10px] uppercase tracking-[0.2em] font-black text-[#064E3B]/60">Unified Intelligence Framework</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl font-extrabold text-[#064E3B] tracking-tight"
            >
              Intelligence <span className="text-emerald-500">Portal</span>
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
                className="pl-10 w-64 bg-white/50 border-slate-200 focus:bg-white transition-all shadow-sm rounded-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="rounded-none border-slate-200 bg-white/50">
              <Filter className="h-4 w-4 mr-2" />
              Advanced
            </Button>
          </div>
        </div>

        <Tabs defaultValue="operational" className="space-y-8" onValueChange={setActiveTab}>
          <div className="flex items-center justify-between">
            <TabsList className="bg-slate-100/80 p-1 rounded-none">
              <TabsTrigger value="operational" className="rounded-none px-6 font-bold flex items-center gap-2">
                <Zap size={14} /> Operational Queue
              </TabsTrigger>
              <TabsTrigger value="intelligence" className="rounded-none px-6 font-bold flex items-center gap-2">
                <TrendingUp size={14} /> Strategic Insights
              </TabsTrigger>
            </TabsList>

            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Live System Feed</span>
              </div>
              <div className="h-4 w-px bg-slate-200" />
              <span className="text-[11px] font-medium text-slate-400">
                Last Synchronized: {mounted ? new Date().toLocaleTimeString() : '--:--:--'}
              </span>
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
                <div className="bg-white/70 backdrop-blur-md rounded-none border border-slate-200/50 shadow-xl overflow-hidden flex flex-col h-full min-h-[700px]">
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/80 z-10 backdrop-blur-md">
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">Direct Citizen Ingest</h2>
                      <p className="text-xs text-slate-400 font-medium">Monitoring {filteredComplaints.length} active threads</p>
                    </div>
                    <Tabs defaultValue="all" onValueChange={(v) => setFilter(v as any)}>
                      <TabsList className="bg-slate-100/50 rounded-none">
                        <TabsTrigger value="all" className="text-xs font-bold rounded-none">All Ingests</TabsTrigger>
                        <TabsTrigger value="pending" className="text-xs font-bold rounded-none">Awaiting Action</TabsTrigger>
                        <TabsTrigger value="resolved" className="text-xs font-bold rounded-none">Closed</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {loading ? (
                      <div className="flex flex-col items-center justify-center py-40">
                        <div className="w-10 h-10 border-4 border-emerald-100 border-t-[#064E3B] rounded-full animate-spin mb-4" />
                        <p className="text-sm font-bold text-slate-400 animate-pulse">Synchronizing with Secure Cloud...</p>
                      </div>
                    ) : filteredComplaints.length === 0 ? (
                      <div className="text-center py-40 bg-emerald-50/30 rounded-2xl border-2 border-dashed border-emerald-100">
                        <Clock size={40} className="mx-auto text-emerald-200 mb-4" />
                        <p className="text-emerald-600/60 font-bold">No grievances found in current filter</p>
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
                              <Card className="border-slate-200/60 hover:border-emerald-300 transition-all duration-300 hover:shadow-xl group relative overflow-hidden h-full flex flex-col rounded-none">
                                {/* Selection overlay indicator */}
                                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                                <CardHeader className="p-5 pb-3">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        {getStatusIcon(complaint.status)}
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${getPriorityColor(complaint.ai_priority)}`}>
                                          {complaint.ai_priority}
                                        </span>
                                      </div>
                                      <CardTitle className="text-base font-bold text-slate-800 line-clamp-1 group-hover:text-[#064E3B] transition-colors">
                                        {complaint.ai_issue_type}
                                      </CardTitle>
                                    </div>
                                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-600/80 border-none text-[9px]">
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
                                      <div className="flex items-center gap-2 text-[11px] font-bold text-[#064E3B]">
                                        {complaint.ai_department}
                                      </div>
                                    </div>

                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 px-4 text-[11px] font-bold border-slate-200 text-[#064E3B] rounded-none"
                                        onClick={() => openComplaintModal(complaint)}
                                      >
                                        View
                                      </Button>
                                      {complaint.status === 'pending' && (
                                        <Button
                                          size="sm"
                                          className="h-8 px-4 text-[11px] font-bold bg-[#064E3B] hover:bg-emerald-800 rounded-none shadow-md shadow-emerald-100 hover:shadow-none transition-all"
                                          onClick={() => handleStatusChange(complaint.id, 'in_progress')}
                                        >
                                          Initiate Response
                                        </Button>
                                      )}
                                      {complaint.status === 'in_progress' && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="h-8 px-4 text-[11px] font-bold border-emerald-200 text-[#064E3B] hover:bg-emerald-50 rounded-none"
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

                <Card className="bg-[#064E3B] text-white border-none shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <ShieldCheck size={80} />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg font-bold">Secure Guard AI</CardTitle>
                    <CardDescription className="text-emerald-100/80">Automatic fraud & duplicate detection active</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between bg-white/10 p-4 rounded-none backdrop-blur-md">
                      <div className="flex flex-col">
                        <span className="text-2xl font-black">99.8%</span>
                        <span className="text-[10px] uppercase font-bold text-emerald-200">Confidence Score</span>
                      </div>
                      <Button variant="outline" size="sm" className="bg-white text-[#064E3B] border-none hover:bg-emerald-50 font-bold">
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
                <MapTilerHeatmap complaints={complaints} />
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
                      { label: 'Gov Transparency Score', trend: '+8%', color: 'text-[#064E3B]' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-emerald-50/50 rounded-none">
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
        {/* Complaint Review Modal */}
        {isModalOpen && selectedComplaint && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-start justify-center p-6" onClick={closeComplaintModal}>
            <div className="max-w-3xl w-full bg-white rounded-lg shadow-xl overflow-auto max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Review Complaint</h3>
                  <p className="text-sm text-slate-500">{new Date(selectedComplaint.created_at).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" onClick={closeComplaintModal}>Close</Button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-600">Summary</h4>
                  <p className="text-slate-800 mt-1 whitespace-pre-wrap">{selectedComplaint.ai_summary}</p>
                </div>

                {selectedComplaint.citizen_image_urls && selectedComplaint.citizen_image_urls.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-slate-600">Images</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                      {selectedComplaint.citizen_image_urls.map((img, i) => (
                        <img key={i} src={img} alt={`evidence-${i}`} className="w-full h-36 object-cover rounded cursor-pointer" onClick={() => setLightboxImage(img)} />
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-bold text-slate-600">Department</h4>
                  <p className="text-slate-800 mt-1">{selectedComplaint.ai_department}</p>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-600">Detected Issue</h4>
                  <p className="text-slate-800 mt-1">{selectedComplaint.ai_issue_type}</p>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-600">Location</h4>
                  <p className="text-slate-800 mt-1">{selectedComplaint.location_address || 'No address provided'}</p>
                  {selectedComplaint.location_lat && selectedComplaint.location_lng && (
                    <div className="mt-3 h-48 rounded overflow-hidden border">
                      <MapPreview lat={selectedComplaint.location_lat} lng={selectedComplaint.location_lng} zoom={13} interactive={false} />
                    </div>
                  )}
                </div>

                {/* Rejection area */}
                <div className="pt-4 border-t">
                  {selectedComplaint.rejection_reason && (
                    <div className="mb-3">
                      <h5 className="text-sm font-bold text-red-600">Existing Rejection Reason</h5>
                      <p className="text-sm text-red-800 mt-1">{selectedComplaint.rejection_reason}</p>
                    </div>
                  )}

                  {!isRejecting ? (
                    <div className="flex gap-2">
                      <Button className="bg-rose-600 text-white" onClick={() => setIsRejecting(true)} disabled={selectedComplaint.status === 'resolved'}>Reject Complaint</Button>
                      <Button variant="outline" onClick={() => { handleStatusChange(selectedComplaint.id, 'in_progress'); closeComplaintModal(); }}>Take Into Response</Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-red-600">Rejection Note</label>
                      <textarea className="w-full border rounded p-2" rows={4} value={rejectionText} onChange={(e) => setRejectionText(e.target.value)} />
                      <div className="flex gap-2">
                        <Button className="bg-rose-600 text-white" onClick={submitRejection}>Confirm Reject</Button>
                        <Button variant="ghost" onClick={() => setIsRejecting(false)}>Cancel</Button>
                      </div>
                    </div>
                  )}
                  {/* If complaint is rejected, show undo option */}
                  {selectedComplaint.status === 'rejected' && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-sm font-bold text-rose-600">Rejected</h5>
                          <p className="text-sm text-rose-800 mt-1">{selectedComplaint.rejection_reason || 'No reason provided'}</p>
                        </div>
                        <div>
                          <Button variant="ghost" onClick={undoRejection}>Undo Rejection</Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
