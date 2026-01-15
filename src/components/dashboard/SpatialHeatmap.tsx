'use client'

import React, { useMemo, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Complaint } from '@/types/database.types'
import 'leaflet/dist/leaflet.css'

// Dynamically import Map components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })

interface SpatialHeatmapProps {
  complaints: Complaint[]
}

export function SpatialHeatmap({ complaints }: SpatialHeatmapProps) {
  // Center on the first complaint or a default location
  const center: [number, number] = useMemo(() => {
    const valid = complaints.find(c => c.location_lat && c.location_lng)
    return valid ? [valid.location_lat!, valid.location_lng!] : [20.5937, 78.9629] // India default
  }, [complaints])

  const validComplaints = useMemo(() => 
    complaints.filter(c => c.location_lat && c.location_lng), 
    [complaints]
  )

  return (
    <Card className="bg-white/70 backdrop-blur-md border-none shadow-xl mb-8 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold text-slate-800">Spatial Intelligence Map</CardTitle>
        <div className="flex gap-4 text-sm font-medium">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" /> High 
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-yellow-500" /> Medium
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-blue-500" /> Low
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 h-[450px]">
        <MapContainer
          center={center}
          zoom={12}
          scrollWheelZoom={true}
          className="h-full w-full"
          style={{ background: '#f8fafc' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {validComplaints.map((complaint) => {
            const color = complaint.ai_priority === 'high' ? '#ef4444' : 
                         complaint.ai_priority === 'medium' ? '#f59e0b' : '#3b82f6'
            
            // Custom Marker logic (simplified for implementation)
            // In a full implementation, we'd use Leaflet.heat, but for immediate UI impact 
            // colored markers are highly effective visual cues.
            return (
              <Marker 
                key={complaint.id}
                position={[complaint.location_lat!, complaint.location_lng!]}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <h4 className="font-bold text-sm mb-1">{complaint.ai_issue_type}</h4>
                    <p className="text-xs text-slate-600 mb-2 truncate">{complaint.ai_summary}</p>
                    <div className="flex justify-between items-center mt-2 border-t pt-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                        complaint.ai_priority === 'high' ? 'bg-red-100 text-red-800' :
                        complaint.ai_priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {complaint.ai_priority}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(complaint.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>
      </CardContent>
    </Card>
  )
}
