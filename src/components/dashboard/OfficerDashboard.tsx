'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getComplaints, updateComplaintStatus } from '@/app/actions/complaint.actions'
import { Complaint } from '@/types/database.types'
import { AlertCircle, CheckCircle, Clock, XCircle, MapPin, Calendar } from 'lucide-react'

export default function OfficerDashboard() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'resolved'>('all')

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
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />
      case 'in_progress':
        return <AlertCircle className="h-5 w-5 text-blue-600" />
      case 'resolved':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return null
    }
  }

  const filteredComplaints = complaints.filter((c) =>
    filter === 'all' || c.status === filter
  )

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary">Officer Dashboard</h1>
        <p className="text-muted-foreground">Manage and track civic complaints</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Complaints</CardDescription>
            <CardTitle className="text-3xl">{complaints.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">
              {complaints.filter((c) => c.status === 'pending').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>In Progress</CardDescription>
            <CardTitle className="text-3xl text-blue-600">
              {complaints.filter((c) => c.status === 'in_progress').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Resolved</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {complaints.filter((c) => c.status === 'resolved').length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Tabs defaultValue="all" className="mb-6" onValueChange={(v) => setFilter(v as any)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Complaints List */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading complaints...</div>
      ) : filteredComplaints.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No complaints found</div>
      ) : (
        <div className="space-y-4">
          {filteredComplaints.map((complaint) => (
            <Card key={complaint.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(complaint.status)}
                      <CardTitle className="text-xl">
                        {complaint.ai_issue_type}
                      </CardTitle>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(
                          complaint.ai_priority
                        )}`}
                      >
                        {complaint.ai_priority.toUpperCase()}
                      </span>
                    </div>
                    <CardDescription className="text-base">
                      {complaint.ai_summary}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-2">
                    <strong>Department:</strong> {complaint.ai_department}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(complaint.created_at).toLocaleDateString()}
                  </div>
                  {complaint.location_address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate max-w-xs">{complaint.location_address}</span>
                    </div>
                  )}
                  <div>
                    <strong>Confidence:</strong> {(complaint.ai_confidence * 100).toFixed(0)}%
                  </div>
                </div>

                {complaint.ai_priority_explanation && (
                  <div className="mb-4 p-3 bg-muted rounded-md text-sm">
                    <strong>Priority Reason:</strong> {complaint.ai_priority_explanation}
                  </div>
                )}

                {complaint.citizen_text && (
                  <div className="mb-4">
                    <strong className="text-sm">Citizen Description:</strong>
                    <p className="text-sm text-muted-foreground mt-1">
                      {complaint.citizen_text}
                    </p>
                  </div>
                )}

                {complaint.citizen_image_urls && complaint.citizen_image_urls.length > 0 && (
                  <div className="mb-4">
                    <strong className="text-sm flex items-center gap-2 mb-2">
                      📸 Evidence Images ({complaint.citizen_image_urls.length})
                    </strong>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {complaint.citizen_image_urls.map((url, idx) => (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative block overflow-hidden rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-all shadow-sm hover:shadow-md"
                        >
                          <img
                            src={url}
                            alt={`Evidence ${idx + 1}`}
                            className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-medium bg-black/60 px-2 py-1 rounded">
                              Click to view
                            </span>
                          </div>
                          <div className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                            {idx + 1}
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  {complaint.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(complaint.id, 'in_progress')}
                      >
                        Start Working
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleStatusChange(complaint.id, 'rejected')}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {complaint.status === 'in_progress' && (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleStatusChange(complaint.id, 'resolved')}
                    >
                      Mark Resolved
                    </Button>
                  )}
                  {complaint.status === 'resolved' && (
                    <span className="text-green-600 font-semibold">✓ Resolved</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
